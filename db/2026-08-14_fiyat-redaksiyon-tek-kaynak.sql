-- 2026-08-14 — fiyat_gorunur redaksiyonu TEK KAYNAK (audit A1 / RISK-PRICEVIS-001).
-- SORUN: db/2026-08-10 redaksiyonu yalnız proje-detay + havuz listesini düzeltti; mikrosite (/p),
--   katalog PDF ve eşleştir ham liste_fiyati basıyor → müteahhidin fiyat_gorunur=false ile danışmandan
--   gizlediği fiyat müşteriye sızıyor. Mikrosite'yi buyer görür → redaksiyon PAYLAŞAN DANIŞMANIN
--   yöneten tahsisine göre olmalı (session yok, service-role client).
-- ÇÖZÜM: yöneten-tahsis çözümünü tek scalar fonksiyona çıkar (advisor parametreli), mevcut RPC'yi
--   onun üstüne yaz (DRY, proje-detay çağrısı değişmez), eşleştir için toplu varyant ekle.
-- Browser SQL Editor'den uygula.

-- ── ÇEKİRDEK: bir birimin belirli bir emlakçıya göre görünür fiyatı (gizliyse null) ──
create or replace function birim_gorunur_fiyat(p_birim uuid, p_emlakci uuid)
returns numeric language sql stable security definer set search_path = public as $$
  select case when coalesce((
      select t.fiyat_gorunur
      from tahsis t join birim b on b.id = p_birim
      where t.proje_id = b.proje_id
        and (t.bitis is null or t.bitis > now())
        and (
          (t.hedef_tip = 'herkes'
            and (t.hedef_filtre->>'marka'    is null or (select marka    from profiles where id = p_emlakci) = t.hedef_filtre->>'marka')
            and (t.hedef_filtre->>'il'       is null or (select il       from profiles where id = p_emlakci) = t.hedef_filtre->>'il')
            and (t.hedef_filtre->>'ilce'     is null or (select ilce     from profiles where id = p_emlakci) = t.hedef_filtre->>'ilce')
            and (t.hedef_filtre->>'uzmanlik' is null or (select uzmanlik from profiles where id = p_emlakci) = t.hedef_filtre->>'uzmanlik'))
          or (t.hedef_tip = 'danisman' and t.hedef_id = p_emlakci)
          or (t.hedef_tip = 'ofis' and t.hedef_id = (select ofis_id from profiles where id = p_emlakci))
        )
        and (coalesce(jsonb_array_length(t.kapsam->'bloklar'),0) = 0 or b.blok_id::text in (select jsonb_array_elements_text(t.kapsam->'bloklar')))
        and (coalesce(jsonb_array_length(t.kapsam->'tipler'),0)  = 0 or b.tip_id::text  in (select jsonb_array_elements_text(t.kapsam->'tipler')))
        and (coalesce(jsonb_array_length(t.kapsam->'katlar'),0)  = 0 or b.kat::text     in (select jsonb_array_elements_text(t.kapsam->'katlar')))
        and (coalesce(jsonb_array_length(t.kapsam->'turler'),0)  = 0 or b.tur::text     in (select jsonb_array_elements_text(t.kapsam->'turler')))
        and (coalesce(jsonb_array_length(t.kapsam->'birimler'),0) = 0 or b.id::text     in (select jsonb_array_elements_text(t.kapsam->'birimler')))
      order by (case t.hedef_tip when 'danisman' then 0 when 'ofis' then 1 else 2 end), t.baslangic desc
      limit 1
    ), true) then (select liste_fiyati from birim where id = p_birim) else null end;
$$;
-- GÜVENLİK (MODE B P1): birim_gorunur_fiyat authenticated'a AÇILMAZ — aksi halde doğrulanmış
-- danışman p_emlakci'ye başkasının id'sini geçerek redaksiyonu deler ("param ≠ server auth").
-- Wrapper'lar SECURITY DEFINER → çekirdeği owner olarak çağırır, doğrudan grant gerekmez.
revoke execute on function birim_gorunur_fiyat(uuid, uuid) from public;
grant execute on function birim_gorunur_fiyat(uuid, uuid) to service_role;

-- ── Mevcut proje-detay RPC'sini çekirdek üstüne yaz (imza/çağrı değişmez) ──
create or replace function emlakci_birim_fiyat(p_proje_id uuid)
returns table(birim_id uuid, fiyat numeric)
language sql stable security definer set search_path = public as $$
  select b.id, birim_gorunur_fiyat(b.id, auth.uid())
  from birim b
  where b.proje_id = p_proje_id
    and (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi';
$$;
revoke execute on function emlakci_birim_fiyat(uuid) from public;
grant execute on function emlakci_birim_fiyat(uuid) to authenticated;

-- ── Eşleştir (authenticated) + mikrosite (service-role) için toplu varyant ──
-- GÜVENLİK (MODE B P1): authenticated çağrıda advisor = auth.uid() ZORLANIR (client'ın geçtiği
-- p_emlakci yok sayılır → başkası adına redaksiyon delinemez). Yalnız service-role mikrositede
-- auth.uid() null olduğundan p_emlakci (paylaşan danışman) devreye girer → coalesce(auth.uid(), p_emlakci).
create or replace function emlakci_gorunur_fiyat_coklu(p_birim_ids uuid[], p_emlakci uuid default null)
returns table(birim_id uuid, fiyat numeric)
language sql stable security definer set search_path = public as $$
  select b.id, birim_gorunur_fiyat(b.id, coalesce(auth.uid(), p_emlakci))
  from birim b
  where b.id = any(p_birim_ids);
$$;
revoke execute on function emlakci_gorunur_fiyat_coklu(uuid[], uuid) from public;
grant execute on function emlakci_gorunur_fiyat_coklu(uuid[], uuid) to authenticated, service_role;
