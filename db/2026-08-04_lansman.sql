-- 2026-08-04 — Lansman / kampanya modülü (kapalı-önce)
-- Üretici lansman/ön-talep/satış-başlangıcı/etkinlik duyurusu oluşturur; emlakçı TAHSİSLİ
-- projelerinde "Lansman Radarı"nda görür. Canlıda Management API/token ile uygulandı.

create table if not exists lansman (
  id         uuid primary key default gen_random_uuid(),
  proje_id   uuid not null references proje(id) on delete cascade,
  baslik     text not null,
  aciklama   text,
  tarih      timestamptz,
  konum      text,
  durum      text default 'lansman',   -- lansman | on_talep | satista | etkinlik
  created_at timestamptz default now()
);
alter table lansman enable row level security;

-- Üretici kendi projesinin lansmanını yönetir (for all)
drop policy if exists lansman_owner on lansman;
create policy lansman_owner on lansman for all using (
  exists (select 1 from proje p join uretici u on u.id = p.uretici_id
          where p.id = lansman.proje_id and (u.sahip_id = auth.uid() or is_admin()))
);
-- Emlakçı TAHSİSLİ projenin lansmanını görür (for select)
drop policy if exists lansman_emlakci_select on lansman;
create policy lansman_emlakci_select on lansman for select using (emlakci_proje_tahsisli(lansman.proje_id));
