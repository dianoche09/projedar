-- 2026-08-09 — Emlakçı birim kazanç görünürlüğü (RPC).
-- Emlakçının kendi tahsisine göre birim başına kazancını DB'de hesaplar.
-- GÜVENLİK: ham komisyon oranı (tahsis.komisyon_deger) client'a ÇIKMAZ; yalnız
--   hesaplanmış TL kazanç döner. Emlakçı tahsis tablosunu doğrudan göremez (RLS'te
--   emlakçı select policy'si yok) — bu SECURITY DEFINER fonksiyon köprü kurar, auth.uid()
--   ile yalnız çağıran emlakçının kendi kazancını verir.
-- EŞLEŞTİRME: emlakci_birim_gorebilir ile BİREBİR aynı (KYC dogrulandi + hedefleme
--   herkes/danisman/ofis + segment marka/il/ilce/uzmanlik + kapsam bloklar/tipler/
--   katlar/turler/birimler). Çoklu tahsiste öncelik: danisman > ofis > herkes, sonra
--   en yeni tahsis (baslangic desc).
-- fiyat_gorunur=false ya da komisyon_tip='yok' → kazanç NULL (gizli).
-- Browser SQL Editor'den uygula (MCP/terminal çalışmıyor). Kod migration olmadan da
--   graceful: rpc yoksa kazanç gösterilmez, sayfa çalışır.

create or replace function emlakci_birim_kazanci(p_proje_id uuid)
returns table(birim_id uuid, kazanc numeric)
language sql stable security definer set search_path = public as $$
  select b.id,
    (
      select case
        when t.fiyat_gorunur and t.komisyon_tip = 'yuzde' and t.komisyon_deger is not null and b.liste_fiyati is not null
          then round(b.liste_fiyati * t.komisyon_deger / 100)
        when t.fiyat_gorunur and t.komisyon_tip = 'sabit' and t.komisyon_deger is not null
          then t.komisyon_deger
        else null
      end
      from tahsis t
      where t.proje_id = p_proje_id
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
        and (coalesce(jsonb_array_length(t.kapsam->'bloklar'),0) = 0 or b.blok_id::text in (select jsonb_array_elements_text(t.kapsam->'bloklar')))
        and (coalesce(jsonb_array_length(t.kapsam->'tipler'),0)  = 0 or b.tip_id::text  in (select jsonb_array_elements_text(t.kapsam->'tipler')))
        and (coalesce(jsonb_array_length(t.kapsam->'katlar'),0)  = 0 or b.kat::text     in (select jsonb_array_elements_text(t.kapsam->'katlar')))
        and (coalesce(jsonb_array_length(t.kapsam->'turler'),0)  = 0 or b.tur::text     in (select jsonb_array_elements_text(t.kapsam->'turler')))
        and (coalesce(jsonb_array_length(t.kapsam->'birimler'),0) = 0 or b.id::text     in (select jsonb_array_elements_text(t.kapsam->'birimler')))
      order by (case t.hedef_tip when 'danisman' then 0 when 'ofis' then 1 else 2 end), t.baslangic desc
      limit 1
    ) as kazanc
  from birim b
  where b.proje_id = p_proje_id
    and (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi';
$$;

grant execute on function emlakci_birim_kazanci(uuid) to authenticated;
