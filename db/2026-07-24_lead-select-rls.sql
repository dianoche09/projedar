-- 2026-07-24 — lead_select RLS DARALTMA: proje sahibi üretici kolu KALDIRILDI (Sistem Kuralları 6)
-- Üretici lead feed'i / toplu listesini GÖRMEZ; yalnız /uretici/lead-sorgu ile ad-veya-telefon SORGULAR.
-- (lead-sorgu sayfası service-role admin client kullanır → bu policy'den ETKİLENMEZ, kapalı-devre kalır.)
-- Emlakçı kendi lead'ini (atanan / ilk paylaşan) görmeye devam eder; admin erişimi (is_admin) korunur.
-- Browser SQL Editor'den uygula.

drop policy if exists lead_select on lead;

-- lead: yalnız paylaşan/atanan emlakçı + admin görür (üretici SELECT hakkı YOK — sorgu server-side)
create policy lead_select on lead for select using (
  is_admin() or atanan_id = auth.uid() or ilk_paylasan_id = auth.uid()
);
