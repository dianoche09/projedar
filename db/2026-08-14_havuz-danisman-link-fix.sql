-- 2026-08-14 — Bildirim deep-link drift fix (audit N1 / XP-04 / D-08).
-- Emlakçı paneli route'u /havuz → /danisman olarak yeniden adlandırıldı (commit 2eba39e),
-- ama iki canlı pg_cron fonksiyonu bildirim linkinde hâlâ /havuz üretiyordu → emlakçı
-- bildirime tıklayınca 404 (başucu engagement döngüsü tıklamada kırık).
-- Bu migration iki fonksiyonu /danisman linkleriyle CREATE OR REPLACE eder. Gövde aynen korunur,
-- yalnız link literali değişir. cron.schedule zaten fonksiyonu ada göre çağırır → yeniden zamanlama gerekmez.
-- Browser SQL Editor'den uygula.

-- 1) Opsiyon süresi hatırlatma (db/2026-08-05) — link /havuz/opsiyonlarim → /danisman/opsiyonlarim
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
      '/danisman/opsiyonlarim'
    from tetik returning 1
  ),
  upd as ( update opsiyon set hatirlatildi=true where id in (select id from tetik) returning 1 )
  select count(*) into v_count from upd;
  return v_count;
end $$;

-- 2) Fiyat düşüşü bildirimi (db/2026-08-10) — link /havuz/proje/ → /danisman/proje/
create or replace function fiyat_dususu_bildir()
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in
    with dususler as (
      select e.id, e.birim_id, e.proje_id
      from events e
      where e.tip='fiyat'
        and coalesce((e.payload->>'bildirildi')::boolean, false) = false
        and (e.payload->>'yeni') is not null and (e.payload->>'eski') is not null
        and (e.payload->>'yeni')::numeric < (e.payload->>'eski')::numeric
        and e.created_at > now() - interval '2 days'
    ),
    genis as (
      select d.proje_id, em as emlakci_id, d.birim_id
      from dususler d
      cross join lateral birim_tahsisli_emlakcilar(d.birim_id) as em
    )
    select proje_id, emlakci_id, count(distinct birim_id) as daire_sayisi
    from genis
    group by proje_id, emlakci_id
  loop
    insert into bildirim (profile_id, tip, baslik, govde, link)
    values (
      r.emlakci_id, 'sistem', 'Fiyat düştü',
      coalesce((select ad from proje where id = r.proje_id), 'Bir proje')
        || ' projesinde ' || r.daire_sayisi || ' dairede fiyat düştü.',
      '/danisman/proje/' || r.proje_id
    );
  end loop;

  update events set payload = payload || '{"bildirildi":true}'::jsonb
  where tip='fiyat'
    and coalesce((payload->>'bildirildi')::boolean, false) = false
    and (payload->>'yeni') is not null and (payload->>'eski') is not null
    and (payload->>'yeni')::numeric < (payload->>'eski')::numeric
    and created_at > now() - interval '2 days';
end;
$$;

revoke execute on function fiyat_dususu_bildir() from public;
