-- 2026-08-09 — Emlakçı kazanç özeti (toplu RPC, havuz listesi kartı için).
-- Tek çağrıda emlakçının TÜM tahsisli projelerinde daire başına kazanç min/max aralığı
-- (N+1 rpc'den kaçınmak için). Eşleştirme emlakci_birim_kazanci ile birebir aynı;
-- yalnız müsait birimler, proje bazında gruplanır. GÜVENLİK: ham komisyon çıkmaz.
-- Management API ile uygulanır.

create or replace function emlakci_kazanc_ozet()
returns table(proje_id uuid, kazanc_min numeric, kazanc_max numeric)
language sql stable security definer set search_path = public as $$
  select b.proje_id, min(kz.kazanc) as kazanc_min, max(kz.kazanc) as kazanc_max
  from birim b
  cross join lateral (
    select case
      when t.fiyat_gorunur and t.komisyon_tip = 'yuzde' and t.komisyon_deger is not null and b.liste_fiyati is not null
        then round(b.liste_fiyati * t.komisyon_deger / 100)
      when t.fiyat_gorunur and t.komisyon_tip = 'sabit' and t.komisyon_deger is not null
        then t.komisyon_deger
      else null
    end as kazanc
    from tahsis t
    where t.proje_id = b.proje_id
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
  ) kz
  where b.durum = 'musait'
    and kz.kazanc is not null
    and (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
  group by b.proje_id;
$$;

revoke execute on function emlakci_kazanc_ozet() from public;
grant execute on function emlakci_kazanc_ozet() to authenticated;
