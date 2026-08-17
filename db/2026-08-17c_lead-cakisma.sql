-- 2026-08-17c — Cross-agent lead çakışma tespiti (N2 / RISK-LEAD-001, Option A: kaydet+işaretle).
-- KARAR (kullanıcı 2026-08-17): olası çakışma İŞARETLENIR (blok yok, auto-reassign yok → "arbitraj
-- yapmaz" korunur). Scope = müşteri × PROJE. Kimlik T1: telefon_norm exact = OLASI eşleşme (aile tek
-- telefon paylaşır → "aynı müşteri" değil "olası aynı"). İki lead her zaman iki satır kalır; yalnız bayrak.
-- Görünürlük: müteahhide push + ikinci danışmana bayrak (karşı danışman PII'si maskeli — RLS zaten
-- ilk_temas_lead_id'yi çözemez). Şema B (koruma penceresi) / C (çakışma kuyruğu) için ileri-uyumlu.
-- Browser SQL Editor'den uygula.

alter table lead
  add column if not exists olasi_cakisma     boolean default false,
  add column if not exists ilk_temas_lead_id uuid references lead(id),
  add column if not exists ilk_temas_at       timestamptz;

-- Çakışma lookup'ı: telefon_norm + proje bazında ilk-temas (created_at asc). Hızlandır.
create index if not exists lead_cakisma_idx on lead(telefon_norm, proje_id);
