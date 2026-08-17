-- 2026-08-17 — Tahsis de-allocation → aktif opsiyon/lead (B1 / DDR-008 / RISK-TAHSIS-001).
-- KARAR (kullanıcı 2026-08-17): askıya alma = grandfather; kaldırma = müteahhit karar verir
-- (serbest bırak / süresine bırak), seçmezse grandfather. Lead danışmanda kalır + bildirim.
-- Bu migration ENFORCEMENT katmanı: (1) görünürlük çatlağı fix, (2) uzat guard, (3) manuel serbest
-- bırak RPC, (4) kapsam-altı aktif opsiyon sorgusu, (5) lead bildirim helper.
-- Not: tahsis_toplu davranışı DEĞİŞMEZ (grandfather zaten default — opsiyona dokunmuyor).
-- Browser SQL Editor'den uygula.

-- ==== 1) Görünürlük: tahsis-only helper'ı ayır + emlakci_birim_gorebilir = tahsisli OR opsiyon-sahibi ====
-- SORUN: tahsis kaldırılınca emlakci_birim_gorebilir=false → grandfather opsiyon sahibi birimini
-- göremiyor (opsiyonlarim'da birim join RLS'e takılıp null döner = kırık kart). FIX: aktif opsiyon
-- sahibi o birimi görür. DEĞİŞMEZ #3 korunur: opsiyon_al gate ayrıca durum='musait' ister →
-- held birim yeniden opsiyonlanamaz. tahsis-only mantık uzat guard'ında kullanılmak üzere ayrıldı.
create or replace function emlakci_birim_tahsisli(
  p_birim_id uuid, p_proje_id uuid, p_blok_id uuid, p_tip_id uuid, p_kat integer, p_tur text
) returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select demo from proje where id = p_proje_id), false)
    or (
      (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
      and exists(
        select 1 from tahsis t
        where t.proje_id = p_proje_id
          and t.durum = 'aktif'
          and (t.baslangic is null or t.baslangic <= now())
          and (t.bitis is null or t.bitis > now())
          and (
            (t.hedef_tip = 'herkes'
              and (t.hedef_filtre->>'marka'    is null or current_marka()    = t.hedef_filtre->>'marka')
              and (t.hedef_filtre->>'il'       is null or current_il()       = t.hedef_filtre->>'il')
              and (t.hedef_filtre->>'ilce'     is null or current_ilce()     = t.hedef_filtre->>'ilce')
              and (t.hedef_filtre->>'uzmanlik' is null or current_uzmanlik() = t.hedef_filtre->>'uzmanlik'))
            or (t.hedef_tip = 'danisman' and t.hedef_id = auth.uid())
            or (t.hedef_tip = 'ofis' and t.hedef_id = current_ofis())
          )
          and birim_kapsaminda(p_birim_id, p_blok_id, p_tip_id, p_kat, p_tur, t.kapsam)
      )
    )
$$;

create or replace function emlakci_birim_gorebilir(
  p_birim_id uuid, p_proje_id uuid, p_blok_id uuid, p_tip_id uuid, p_kat integer, p_tur text
) returns boolean language sql stable security definer set search_path = public as $$
  select
    emlakci_birim_tahsisli(p_birim_id, p_proje_id, p_blok_id, p_tip_id, p_kat, p_tur)
    -- Aktif opsiyon sahibi grandfather birimini görür (tahsisi kalksa bile).
    or exists(
      select 1 from opsiyon o
      where o.birim_id = p_birim_id
        and o.satici_id = auth.uid()
        and o.durum in ('opsiyonlu','satis_beklemede')
    )
$$;

-- ==== 2) opsiyon_uzat guard: de-alloc danışman süreyi UZATAMAZ (yalnız dolsun) ====
create or replace function opsiyon_uzat(p_birim uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_ops uuid; v_proje uuid; v_blok uuid; v_tip uuid; v_kat int; v_tur text;
        v_ayar jsonb; v_gun int; v_dogr bool; v_uzat bool;
begin
  select o.id, o.dogrulandi, o.uzatildi into v_ops, v_dogr, v_uzat
    from opsiyon o where o.birim_id=p_birim and o.satici_id=auth.uid()
    and o.durum in ('opsiyonlu','satis_beklemede') limit 1;
  if v_ops is null then raise exception 'Aktif opsiyonun yok'; end if;
  if v_dogr=false then raise exception 'Once muteahhit dogrulamasi gerekiyor'; end if;
  if v_uzat=true then raise exception 'Bu opsiyon zaten bir kez uzatildi'; end if;
  select b.proje_id, b.blok_id, b.tip_id, b.kat, b.tur::text
    into v_proje, v_blok, v_tip, v_kat, v_tur from birim b where b.id=p_birim;
  -- B1: tahsis-only görünürlük gerekir; de-alloc danışman uzatamaz (opsiyon-sahibi OR'u kullanma).
  if not emlakci_birim_tahsisli(p_birim, v_proje, v_blok, v_tip, v_kat, v_tur) then
    raise exception 'Tahsisin artik aktif degil — opsiyon uzatilamaz (suresi dolunca serbest kalir)';
  end if;
  select coalesce(opsiyon_ayar,'{}'::jsonb) into v_ayar from proje where id=v_proje;
  if coalesce((v_ayar->>'uzatma_hakki')::bool,true)=false then raise exception 'Bu projede opsiyon uzatma kapali'; end if;
  v_gun := coalesce((v_ayar->>'uzatma_gun')::int,2);
  update opsiyon set kilit_bitis=greatest(kilit_bitis,now())+(v_gun||' days')::interval, uzatildi=true, hatirlatildi=false where id=v_ops;
end $$;

-- ==== 3) Müteahhit seçtiği aktif opsiyonu MANUEL serbest bırakır (kaldırma anı "serbest bırak" seçimi) ====
-- Owner-guard'lı; audit event + danışmana bildirim; DELETE → senkron trigger birim müsait yapar.
create or replace function opsiyon_serbest_birak_manuel(p_ids uuid[])
returns int language plpgsql security definer set search_path=public as $$
declare v_say int; v_actor uuid := auth.uid();
begin
  -- audit (silmeden önce)
  insert into events(tip, profile_id, proje_id, birim_id, payload)
  select 'opsiyon', o.satici_id, b.proje_id, o.birim_id,
    jsonb_build_object('eylem','tahsis_iptali_serbest','opsiyon_id',o.id,'karar_veren',v_actor)
  from opsiyon o
    join birim b on b.id=o.birim_id
    join proje p on p.id=b.proje_id
    join uretici u on u.id=p.uretici_id
  where o.id = any(p_ids) and o.durum in ('opsiyonlu','satis_beklemede')
    and (u.sahip_id = v_actor or is_admin());
  -- danışmana bildirim
  insert into bildirim(profile_id, tip, baslik, govde, link)
  select o.satici_id, 'sistem', 'Opsiyonun serbest bırakıldı',
    coalesce(p.ad,'Proje')||' · Daire '||coalesce(b.daire_no,'?')||' · tahsis sonlandırıldığı için müteahhit opsiyonu serbest bıraktı',
    '/danisman/opsiyonlarim'
  from opsiyon o
    join birim b on b.id=o.birim_id
    join proje p on p.id=b.proje_id
    join uretici u on u.id=p.uretici_id
  where o.id = any(p_ids) and o.durum in ('opsiyonlu','satis_beklemede')
    and (u.sahip_id = v_actor or is_admin());
  -- sil → opsiyon_birim_senkron trigger birimi 'musait' yapar
  with del as (
    delete from opsiyon o
    using birim b, proje p, uretici u
    where o.birim_id=b.id and b.proje_id=p.id and p.uretici_id=u.id
      and o.id = any(p_ids) and o.durum in ('opsiyonlu','satis_beklemede')
      and (u.sahip_id = v_actor or is_admin())
    returning o.id
  ) select count(*) into v_say from del;
  return v_say;
end $$;
grant execute on function opsiyon_serbest_birak_manuel(uuid[]) to authenticated;

-- ==== 4) Kaldırılacak tahsis kapsamındaki AKTİF opsiyonlar (UI prompt: serbest/süresine) ====
create or replace function tahsis_aktif_opsiyonlar(p_proje_id uuid, p_ids uuid[])
returns table(opsiyon_id uuid, birim_id uuid, daire_no text, satici_id uuid, satici_ad text,
              durum birim_durum, kilit_bitis timestamptz)
language sql stable security definer set search_path=public as $$
  select distinct o.id, b.id, b.daire_no, o.satici_id, pr.ad, b.durum, o.kilit_bitis
  from tahsis t
    join birim b on b.proje_id = t.proje_id and b.ana_birim_id is null
      and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
    join opsiyon o on o.birim_id = b.id and o.durum in ('opsiyonlu','satis_beklemede')
    left join profiles pr on pr.id = o.satici_id
  where t.id = any(p_ids) and t.proje_id = p_proje_id and _tahsis_proje_sahibi(p_proje_id);
$$;
grant execute on function tahsis_aktif_opsiyonlar(uuid, uuid[]) to authenticated;

-- ==== 5) Lead bildirim: kaldırma/askıya sonrası kapsam-altı lead'ler danışmanda kalır → müteahhide özet ====
-- Projedar sahiplik DEĞİŞTİRMEZ (arbitraj yok); yalnız audit + müteahhide bilgi. Kapsamdaki
-- birimlere bağlı, ilgili danışmanlarda kalan aktif (kaybedilmemiş) lead sayısını döndürür (app bildirir).
create or replace function tahsis_kapsami_lead_ozet(p_proje_id uuid, p_ids uuid[])
returns table(lead_sayisi int, danisman_sayisi int)
language sql stable security definer set search_path=public as $$
  select count(distinct l.id)::int, count(distinct l.atanan_id)::int
  from tahsis t
    join birim b on b.proje_id = t.proje_id
      and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
    join lead l on l.birim_id = b.id and l.durum not in ('kaybedildi','kazanildi')
  where t.id = any(p_ids) and t.proje_id = p_proje_id and _tahsis_proje_sahibi(p_proje_id);
$$;
grant execute on function tahsis_kapsami_lead_ozet(uuid, uuid[]) to authenticated;
