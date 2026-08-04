-- 2026-08-05 — Opsiyon yaşam döngüsü: pg_cron gerçek-zaman serbest bırakma + hatırlatma + uzatma + sonuç config
-- Canlıda Management API ile uygulandı. Vercel cron günde 1 (03:00) → saat-bazlı süreler için pg_cron 15 dk.

-- ── Yeni kolonlar ──
alter table opsiyon add column if not exists hatirlatildi boolean default false;  -- bitiş hatırlatması gönderildi mi
alter table opsiyon add column if not exists uzatildi boolean default false;      -- bir kez uzatma hakkı kullanıldı mı

-- opsiyon_ayar jsonb yeni alanlar (şema değişikliği yok): onay_gun, yanit_sla_saat, hatirlatma_saat,
--   uzatma_hakki, uzatma_gun (varsayılanlar: 7 / 48 / 12 / true / 2).

-- ── pg_cron: 15 dakikada bir serbest bırakma (kesin kilit + doğrulama penceresi süre aşımı) ──
create extension if not exists pg_cron;

create or replace function opsiyon_serbest_birak()
returns int language plpgsql security definer set search_path=public as $$
declare v_count int;
begin
  insert into events (tip, profile_id, proje_id, birim_id, payload)
  select 'opsiyon', o.satici_id, b.proje_id, o.birim_id,
    jsonb_build_object('eylem', case when o.dogrulandi = false then 'dogrulama_sure_doldu' else 'sure_doldu' end)
  from opsiyon o join birim b on b.id = o.birim_id
  where o.durum in ('opsiyonlu','satis_beklemede')
    and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) );
  with del as (
    delete from opsiyon o
    where o.durum in ('opsiyonlu','satis_beklemede')
      and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) )
    returning o.id
  ) select count(*) into v_count from del;
  return v_count;
end $$;

-- ── pg_cron: bitişe hatirlatma_saat (varsayılan 12) kala emlakçıya sistem hatırlatması (bir kez) ──
create or replace function opsiyon_hatirlat()
returns int language plpgsql security definer set search_path=public as $$
declare v_count int;
begin
  with tetik as (
    select o.id, o.satici_id, b.daire_no, p.ad as proje_ad, o.kilit_bitis
    from opsiyon o join birim b on b.id=o.birim_id join proje p on p.id=b.proje_id
    where o.durum in ('opsiyonlu','satis_beklemede') and o.dogrulandi=true
      and o.hatirlatildi=false and o.kilit_bitis is not null and o.kilit_bitis > now()
      and o.kilit_bitis <= now() + (coalesce((p.opsiyon_ayar->>'hatirlatma_saat')::int,12) || ' hours')::interval
  ),
  ins as (
    insert into bildirim (profile_id, tip, baslik, govde, link)
    select satici_id, 'sistem', 'Opsiyon süresi yaklaşıyor',
      proje_ad || ' · Daire ' || coalesce(daire_no,'?') || ' · opsiyonun ' ||
        greatest(1, round(extract(epoch from (kilit_bitis-now()))/3600))::int::text || ' saat içinde bitiyor',
      '/havuz/opsiyonlarim'
    from tetik returning 1
  ),
  upd as ( update opsiyon set hatirlatildi=true where id in (select id from tetik) returning 1 )
  select count(*) into v_count from upd;
  return v_count;
end $$;

select cron.schedule('opsiyon-serbest-birak','*/15 * * * *',$$select opsiyon_serbest_birak()$$);
select cron.schedule('opsiyon-hatirlat','*/15 * * * *',$$select opsiyon_hatirlat()$$);

-- ── Emlakçı opsiyonu bir kez uzatır (müteahhit-tanımlı uzatma_hakki + uzatma_gun) ──
create or replace function opsiyon_uzat(p_birim uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_ops uuid; v_proje uuid; v_ayar jsonb; v_gun int; v_dogr bool; v_uzat bool;
begin
  select o.id, o.dogrulandi, o.uzatildi into v_ops, v_dogr, v_uzat
    from opsiyon o where o.birim_id=p_birim and o.satici_id=auth.uid()
    and o.durum in ('opsiyonlu','satis_beklemede') limit 1;
  if v_ops is null then raise exception 'Aktif opsiyonun yok'; end if;
  if v_dogr=false then raise exception 'Once muteahhit dogrulamasi gerekiyor'; end if;
  if v_uzat=true then raise exception 'Bu opsiyon zaten bir kez uzatildi'; end if;
  select b.proje_id into v_proje from birim b where b.id=p_birim;
  select coalesce(opsiyon_ayar,'{}'::jsonb) into v_ayar from proje where id=v_proje;
  if coalesce((v_ayar->>'uzatma_hakki')::bool,true)=false then raise exception 'Bu projede opsiyon uzatma kapali'; end if;
  v_gun := coalesce((v_ayar->>'uzatma_gun')::int,2);
  update opsiyon set kilit_bitis=greatest(kilit_bitis,now())+(v_gun||' days')::interval, uzatildi=true, hatirlatildi=false where id=v_ops;
end $$;
grant execute on function opsiyon_uzat(uuid) to authenticated;

-- ── opsiyon_talep_onayla: onaylı opsiyon süresi proje.opsiyon_ayar.onay_gun'dan (yoksa 7) çözülür ──
create or replace function opsiyon_talep_onayla(p_talep uuid, p_gun integer default null)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_birim uuid; v_emlakci uuid; v_ops uuid; v_sahip uuid; v_gun int;
begin
  select t.birim_id, t.talep_eden_id into v_birim, v_emlakci
    from opsiyon_talep t where t.id = p_talep and t.durum = 'beklemede' for update;
  if v_birim is null then raise exception 'Talep bulunamadı veya beklemede değil'; end if;
  select u.sahip_id into v_sahip
    from birim b join proje p on p.id = b.proje_id join uretici u on u.id = p.uretici_id where b.id = v_birim;
  if not (is_admin() or v_sahip = auth.uid()) then raise exception 'Yetki yok'; end if;
  if exists (select 1 from birim b where b.id = v_birim and b.durum <> 'musait') then
    raise exception 'Birim artık müsait değil'; end if;
  v_gun := coalesce(p_gun,
    (select (p.opsiyon_ayar->>'onay_gun')::int from birim b join proje p on p.id=b.proje_id where b.id=v_birim), 7);
  insert into opsiyon (birim_id, satici_id, yontem, durum, kilit_bitis)
    values (v_birim, v_emlakci, 'talep_kod', 'opsiyonlu', now() + (v_gun || ' days')::interval)
    returning id into v_ops;
  update opsiyon_talep set durum = 'onaylandi', karar_veren_id = auth.uid(), karar_at = now(), opsiyon_id = v_ops where id = p_talep;
  update opsiyon_talep set durum = 'reddedildi', karar_veren_id = auth.uid(), karar_at = now()
    where birim_id = v_birim and durum = 'beklemede' and id <> p_talep;
  return v_ops;
end $$;
