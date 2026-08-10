-- 2026-08-10 — Emlakçı birim FİYAT görünürlüğü (RPC) — fiyat_gorunur sızıntısı FIX (HIGH).
-- SORUN: Havuz sayfaları birim.liste_fiyati'ni doğrudan gösteriyordu; tahsis.fiyat_gorunur=false
--   ("Fiyat gizli") olsa bile emlakçı gerçek fiyatı görüyordu (RLS satır gizler, KOLON gizleyemez).
-- ÇÖZÜM: Yöneten tahsisin fiyat_gorunur'una göre redakte edilmiş fiyatı DB'de hesapla.
--   emlakci_birim_kazanci ile BİREBİR aynı yönetici-tahsis çözümü (öncelik danisman>ofis>herkes,
--   en yeni; segment + kapsam eşleşmesi). Yöneten tahsis fiyatı GİZLİ ise null; hiç yöneten
--   tahsis yoksa (demo/kenar) fiyat gösterilir (coalesce ...,true).
-- Kod migration olmadan graceful: rpc yoksa sayfa ham fiyata düşer (mevcut davranış), kırılmaz.
-- Browser SQL Editor'den uygula.

create or replace function emlakci_birim_fiyat(p_proje_id uuid)
returns table(birim_id uuid, fiyat numeric)
language sql stable security definer set search_path = public as $$
  select b.id,
    case when coalesce((
      select t.fiyat_gorunur
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
    ), true) then b.liste_fiyati else null end as fiyat
  from birim b
  where b.proje_id = p_proje_id
    and (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi';
$$;

revoke execute on function emlakci_birim_fiyat(uuid) from public;
grant execute on function emlakci_birim_fiyat(uuid) to authenticated;

-- Havuz LİSTESİ kartı için toplu redakte-fiyat özeti (proje başına görünür fiyat min/max).
-- emlakci_kazanc_ozet ile aynı desen; gizli fiyatlı (fiyat_gorunur=false) birimler banda GİRMEZ.
create or replace function emlakci_fiyat_ozet()
returns table(proje_id uuid, fiyat_min numeric, fiyat_max numeric)
language sql stable security definer set search_path = public as $$
  select b.proje_id, min(fz.fiyat) as fiyat_min, max(fz.fiyat) as fiyat_max
  from birim b
  cross join lateral (
    select case when coalesce(t.fiyat_gorunur, true) then b.liste_fiyati else null end as fiyat
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
  ) fz
  where b.durum = 'musait'
    and fz.fiyat is not null and fz.fiyat > 0
    and (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
  group by b.proje_id;
$$;

revoke execute on function emlakci_fiyat_ozet() from public;
grant execute on function emlakci_fiyat_ozet() to authenticated;
