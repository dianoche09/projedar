-- 2026-08-10 — Per-daire görsel override.
-- Daire tipinin plan görseli (daire_tipi.plan_url) tüm o tipteki daireler için ortaktır.
-- Bu kolon TEK bir daireye özel görsel yüklemeyi sağlar (varsa tip planının önüne geçer).
-- Kod migration olmadan graceful: stok sayfası gorsel_url'i best-effort ayrı sorguyla
--   çeker; kolon yoksa görsel yok gibi davranır, sayfa kırılmaz.
-- Browser SQL Editor'den uygula (MCP/terminal bu projede yetkisiz).

alter table birim add column if not exists gorsel_url text;

-- Not: RLS zaten birim üzerinde açık; güncelleme yalnız proje sahibi üretici (mevcut
--   birim update policy'si) tarafından yapılır. Ek policy gerekmez.
