-- 2026-08-04 — Üretici kurumsal profili (şirket sayfası, kapalı-önce)
-- Browser SQL Editor'den uygula (canlıda 2026-08-04'te token/Management API ile uygulandı).
-- profil jsonb: { logo_url, kurulus_yili, hakkinda, web, il, ilce, telefon }

alter table uretici add column if not exists profil jsonb;

-- Emlakçı, TAHSİSLİ projesinin üreticisini görebilsin (profil kartı için).
-- DİKKAT (RLS özyineleme kalkanı): proje'yi RLS ile okumak sonsuz döngü yaratır
--   (proje_owner → uretici → uretici_emlakci_select → proje → ...). Bu yüzden proje/tahsis
--   kontrolü SECURITY DEFINER fonksiyonda yapılır (proje RLS bypass edilir). Görünürlük semantiği aynı.
create or replace function emlakci_uretici_gorebilir(p_uretici uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from proje p
    where p.uretici_id = p_uretici and emlakci_proje_tahsisli(p.id)
  )
$$;
grant execute on function emlakci_uretici_gorebilir(uuid) to authenticated;

drop policy if exists uretici_emlakci_select on uretici;
create policy uretici_emlakci_select on uretici for select using (
  emlakci_uretici_gorebilir(id)
);
