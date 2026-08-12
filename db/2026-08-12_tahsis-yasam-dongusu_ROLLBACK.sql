-- ROLLBACK: 2026-08-12_tahsis-yasam-dongusu.sql geri alma (canlıdan çekilen ESKİ gövdeler).
-- Sıra önemli: (1) görünürlük fonksiyonlarını migration-ÖNCESİ canlı gövdeye döndür (helper bağımlılığı kalksın),
-- (2) yeni RPC/guard, (3) ortak helper, (4) kolon+index, (5) enum.
-- NOT: durum kolonu düşünce mevcut satırların mantıksal 'aktif' değeri de kalkar (veri etkisi geri alınır).

-- 1) emlakci_birim_gorebilir (6-arg) — MIGRATION ÖNCESİ canlı gövde (durum/baslangic YOK, inline kapsam)
create or replace function emlakci_birim_gorebilir(
  p_birim_id uuid, p_proje_id uuid, p_blok_id uuid, p_tip_id uuid, p_kat integer, p_tur text
) returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select demo from proje where id = p_proje_id), false)
    or (
      (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
      and exists(
        select 1 from tahsis t
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
          and (coalesce(jsonb_array_length(t.kapsam->'bloklar'),0) = 0 or p_blok_id::text in (select jsonb_array_elements_text(t.kapsam->'bloklar')))
          and (coalesce(jsonb_array_length(t.kapsam->'tipler'),0) = 0 or p_tip_id::text in (select jsonb_array_elements_text(t.kapsam->'tipler')))
          and (coalesce(jsonb_array_length(t.kapsam->'katlar'),0) = 0 or p_kat::text in (select jsonb_array_elements_text(t.kapsam->'katlar')))
          and (coalesce(jsonb_array_length(t.kapsam->'turler'),0) = 0 or p_tur in (select jsonb_array_elements_text(t.kapsam->'turler')))
          and (coalesce(jsonb_array_length(t.kapsam->'birimler'),0) = 0 or p_birim_id::text in (select jsonb_array_elements_text(t.kapsam->'birimler')))
      )
    )
$$;

-- 2) emlakci_proje_tahsisli — MIGRATION ÖNCESİ canlı gövde (durum/baslangic YOK)
create or replace function emlakci_proje_tahsisli(p_proje_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select demo from proje where id = p_proje_id), false)
    or (
      (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
      and exists(
        select 1 from tahsis t
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
      )
    )
$$;

-- 3) Yeni RPC + guard'ı düşür
drop function if exists tahsis_toplu(uuid, uuid[], text, int);
drop function if exists tahsis_ozet(uuid);
drop function if exists stok_dagitim(uuid);
drop function if exists _tahsis_proje_sahibi(uuid);

-- 4) Ortak helper (artık referans yok — adım 1-2 inline gövdeye döndü)
drop function if exists birim_kapsaminda(uuid, uuid, uuid, int, text, jsonb);

-- 5) Kolon + index
drop index if exists tahsis_durum_idx;
alter table tahsis
  drop column if exists durum,
  drop column if exists created_by,
  drop column if exists updated_at,
  drop column if exists updated_by;

-- 6) Enum
drop type if exists tahsis_durum;
