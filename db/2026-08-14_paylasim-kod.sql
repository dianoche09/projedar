-- Kısa paylaşım kodu: /p/{kod} → (emlakçı, birim).
-- Uzun /p/{uuid}/{uuid}/{token} linkine kısa + iptal edilebilir + ölçülebilir alternatif.
-- Kod, (emlakci_id, birim_id) çiftine bağlı → "hangi danışman / hangi birim" ölçümü DB'de tam.
-- Not: çözümleme ve kod üretimi YALNIZ server (service-role, createAdminClient) üzerinden.
-- Anon/authenticated için permissive policy TANIMLANMAZ (deny-by-default). RLS-önce (DEĞİŞMEZ #1).

create table if not exists paylasim_kod (
  kod         text primary key,
  emlakci_id  uuid not null references profiles(id) on delete cascade,
  birim_id    uuid not null references birim(id) on delete cascade,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (emlakci_id, birim_id)   -- idempotent: bir (danışman, birim) = tek kod (cache/dedupe)
);

create index if not exists paylasim_kod_birim_idx on paylasim_kod (birim_id);

alter table paylasim_kod enable row level security;
