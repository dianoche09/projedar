-- 2026-08-11 — Emlakçı lead derinliği FAZ 0 (bug + güvenlik). Browser SQL Editor'den uygula.
-- Karar: "stok-bağlı genişletme" (ProjePazar-Emlakci-Panel-Gelistirme-Plani.md, CRM sınırı revize).
--
-- L0.1 (P0) niyet veri kaybı: LeadForm niyet topluyor, /api/lead insert'e yazmıyordu → kolon + insert.
-- L0.2 (P1) RLS açığı: lead_insert with check(true) → anon key ile PostgREST'ten doğrudan sahte
--            lead/PII basılabiliyordu. Tek meşru insert yolu /api/lead (admin/service-role, RLS bypass);
--            client insert yolu YOK → politikayı KALDIR (DEĞİŞMEZ #1: uygulama katmanına güvenme).
-- L0.3 (P1) durum değişiminde tazelik: son_temas_at + updated_at (DEĞİŞMEZ #5 tazelik felsefesi lead'e de).

-- 1) niyet enum + kolon (ziyaretçinin satın-alma sinyali: bilgi < randevu < on_rezervasyon)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'lead_niyet') then
    create type lead_niyet as enum ('bilgi','randevu','on_rezervasyon');
  end if;
end $$;

alter table lead add column if not exists niyet        lead_niyet   default 'bilgi';
alter table lead add column if not exists son_temas_at timestamptz;              -- son arama/görüşme (durum ilerletince)
alter table lead add column if not exists updated_at   timestamptz;              -- son dokunuş (tazelik)

-- 2) RLS açığını kapat: anon/authenticated doğrudan lead insert edemez.
--    Meşru yol yalnız /api/lead (admin client, service-role → RLS bypass, imzalı token doğrular).
drop policy if exists lead_insert on lead;

-- Not: lead_select (2026-07-24) korunur (admin/atanan/ilk_paylasan). lead_update/lead_delete
-- politikası YOK → tüm yazma server action + admin client'tan geçer, sahiplik RLS-select ile doğrulanır.
