-- 2026-08-10 — Emlakçı fiyat düşüşü bildirimi (fırsat sinyali, başucu engagement).
-- Üretici bir birimin fiyatını DÜŞÜRÜNCE (birim_fiyat_log trigger events tip='fiyat'
-- yazar; payload {eski,yeni,pct}), o birime tahsisli DOĞRULANMIŞ emlakçılara bildirim.
-- SPAM-ÖNLEME: proje-gruplu ("X projesinde N dairede fiyat düştü") + idempotency
-- (events payload 'bildirildi' flag; bir düşüş bir kez bildirilir).
-- pg_cron */30dk (saat-bazlı süre Vercel günlük cron'una sığmaz — opsiyon_hatirlat deseni).
-- Ham komisyon/fiyat client'a çıkmaz; bildirim yalnız "düştü" der, detay havuzda.
-- (Opsiyon süresi bildirimi ZATEN VAR: opsiyon_hatirlat, db/2026-08-05.)

-- 1) Bir birime tahsisli doğrulanmış emlakçılar. auth.uid() KULLANMAZ (cron context:
--    ters fan-out). Eşleştirme emlakci_birim_gorebilir kapsam mantığıyla birebir.
create or replace function birim_tahsisli_emlakcilar(p_birim_id uuid)
returns setof uuid
language sql stable security definer set search_path = public as $$
  with b as (select id, proje_id, blok_id, tip_id, kat, tur from birim where id = p_birim_id),
  esles as (
    select t.hedef_tip, t.hedef_id, t.hedef_filtre
    from tahsis t, b
    where t.proje_id = b.proje_id
      and (t.bitis is null or t.bitis > now())
      and (coalesce(jsonb_array_length(t.kapsam->'bloklar'),0)=0  or b.blok_id::text in (select jsonb_array_elements_text(t.kapsam->'bloklar')))
      and (coalesce(jsonb_array_length(t.kapsam->'tipler'),0)=0   or b.tip_id::text  in (select jsonb_array_elements_text(t.kapsam->'tipler')))
      and (coalesce(jsonb_array_length(t.kapsam->'katlar'),0)=0   or b.kat::text     in (select jsonb_array_elements_text(t.kapsam->'katlar')))
      and (coalesce(jsonb_array_length(t.kapsam->'turler'),0)=0   or b.tur::text     in (select jsonb_array_elements_text(t.kapsam->'turler')))
      and (coalesce(jsonb_array_length(t.kapsam->'birimler'),0)=0 or b.id::text      in (select jsonb_array_elements_text(t.kapsam->'birimler')))
  )
  -- danışman: doğrudan (üretici bilerek o kişiye tahsis etti)
  select e.hedef_id from esles e where e.hedef_tip='danisman' and e.hedef_id is not null
  union
  -- ofis: o ofisin aktif+doğrulanmış emlakçıları
  select pr.id from esles e join profiles pr on pr.ofis_id = e.hedef_id
    where e.hedef_tip='ofis' and pr.rol='emlakci' and pr.durum='aktif' and pr.belge_durumu='dogrulandi'
  union
  -- herkes: segment filtreli aktif+doğrulanmış emlakçılar
  select pr.id from esles e join profiles pr on pr.rol='emlakci'
    where e.hedef_tip='herkes' and pr.durum='aktif' and pr.belge_durumu='dogrulandi'
      and (e.hedef_filtre->>'marka'    is null or pr.marka    = e.hedef_filtre->>'marka')
      and (e.hedef_filtre->>'il'       is null or pr.il       = e.hedef_filtre->>'il')
      and (e.hedef_filtre->>'ilce'     is null or pr.ilce     = e.hedef_filtre->>'ilce')
      and (e.hedef_filtre->>'uzmanlik' is null or pr.uzmanlik = e.hedef_filtre->>'uzmanlik');
$$;

-- 2) Bildirilmemiş fiyat düşüşlerini proje-emlakçı bazında gruplayıp bildir, sonra işaretle.
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
      '/havuz/proje/' || r.proje_id
    );
  end loop;

  -- İşaretle: 2 gün içindeki bildirilmemiş düşüşler artık bildirildi (idempotent).
  update events set payload = payload || '{"bildirildi":true}'::jsonb
  where tip='fiyat'
    and coalesce((payload->>'bildirildi')::boolean, false) = false
    and (payload->>'yeni') is not null and (payload->>'eski') is not null
    and (payload->>'yeni')::numeric < (payload->>'eski')::numeric
    and created_at > now() - interval '2 days';
end;
$$;

revoke execute on function birim_tahsisli_emlakcilar(uuid) from public;
revoke execute on function fiyat_dususu_bildir() from public;

-- 3) pg_cron: her 30 dakikada. Aynı jobname upsert (idempotent).
select cron.schedule('fiyat-dususu-bildir', '*/30 * * * *', $$select fiyat_dususu_bildir()$$);
