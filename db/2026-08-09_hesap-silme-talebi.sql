-- 2026-08-09 — KVKK hesap / veri silme talebi.
-- Kullanıcı kendi verisinin silinmesini talep eder (KVKK md.7/11 — silme/imha hakkı).
-- Talep İZ olarak düşer; geri döndürülemez silmeyi admin panelden yapar (concierge modeli).
-- Kullanıcı yalnız KENDİ talebini oluşturur ve görür. Admin service-role ile hepsini görür.
-- Browser SQL Editor'den uygula (memory: supabase-apply-browser).

create table if not exists hesap_silme_talebi (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles(id) on delete cascade,
  eposta          text,                              -- talep anındaki e-posta (iz)
  sebep           text,                              -- opsiyonel serbest metin
  durum           text not null default 'beklemede', -- beklemede | islendi | reddedildi
  created_at      timestamptz not null default now(),
  islenme_tarihi  timestamptz,
  isleyen_admin   uuid references profiles(id)
);

create index if not exists hesap_silme_durum_idx
  on hesap_silme_talebi (durum, created_at desc);

-- Aynı kullanıcı için aynı anda tek AÇIK talep — mükerrer talebi DB'de engelle
-- (DEĞİŞMEZ #3 kültürü: kalkan uygulama katmanında değil, DB'de partial unique index).
create unique index if not exists hesap_silme_tek_aktif
  on hesap_silme_talebi (profile_id)
  where durum = 'beklemede';

alter table hesap_silme_talebi enable row level security;

-- Kullanıcı yalnız kendi talebini oluşturur
drop policy if exists hesap_silme_self_insert on hesap_silme_talebi;
create policy hesap_silme_self_insert on hesap_silme_talebi
  for insert with check (profile_id = auth.uid());

-- Kullanıcı kendi talebini görür (durum takibi); admin hepsini görür (is_admin helper)
drop policy if exists hesap_silme_self_select on hesap_silme_talebi;
create policy hesap_silme_self_select on hesap_silme_talebi
  for select using (profile_id = auth.uid() or is_admin());

-- Yalnız admin talebi işler (durum: beklemede → islendi | reddedildi)
drop policy if exists hesap_silme_admin_update on hesap_silme_talebi;
create policy hesap_silme_admin_update on hesap_silme_talebi
  for update using (is_admin()) with check (is_admin());
