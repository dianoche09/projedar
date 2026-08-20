-- 2026-08-20 — T16: danışman havuz-favorisi (kişisel bookmark). Buyer /p favorisinden AYRI.
-- Danışman havuzdaki tahsisli projeyi favoriler → kartta yıldız + favoriler üstte sıralanır.
-- RLS: yalnız kendi favorisi (emlakci_id=auth.uid()). Stok/fiyat/tahsis ETKİSİ YOK (kişisel).
-- create table if not exists → idempotent. Management API'den uygulanır.

create table if not exists proje_favori (
  emlakci_id uuid not null references profiles(id) on delete cascade,
  proje_id   uuid not null references proje(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (emlakci_id, proje_id)
);

alter table proje_favori enable row level security;

drop policy if exists proje_favori_self on proje_favori;
create policy proje_favori_self on proje_favori for all
  using (emlakci_id = auth.uid())
  with check (emlakci_id = auth.uid());
