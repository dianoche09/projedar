-- 2026-08-04 — Üretici kurumsal profili (şirket sayfası, kapalı-önce)
-- Browser SQL Editor'den uygula (canlıda 2026-08-04'te token/Management API ile uygulandı).
-- profil jsonb: { logo_url, kurulus_yili, hakkinda, web, il, ilce, telefon }

alter table uretici add column if not exists profil jsonb;

-- Emlakçı, TAHSİSLİ projesinin üreticisini görebilsin (profil kartı için). uretici_owner (for all) yanına permissive OR.
drop policy if exists uretici_emlakci_select on uretici;
create policy uretici_emlakci_select on uretici for select using (
  exists (select 1 from proje p where p.uretici_id = uretici.id and emlakci_proje_tahsisli(p.id))
);
