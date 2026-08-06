-- Keşif & Davet Motoru — admin (BİZ/platform işletmecisi) tarafı büyüme motoru.
-- Müteahhit/proje/emlak ofisi adaylarını web'den keşfeder, Claude ile zenginleştirir,
-- davet-token'lı e-posta ile kayda çağırır, huniyi takip eder.
--
-- DEĞİŞMEZ #1 (RLS-önce): üç tablo da admin-only → RLS açık ama policy YOK → yalnız
-- service-role (server route / cron) erişir. Aday PII (email/telefon) asla client'a gitmez.
-- Referans deseni: pazarlama_entegrasyon (deny-all + service-role).

-- ── kesif_kampanya — şehir başına toplu keşif çalışması ────────────────────────
create table if not exists public.kesif_kampanya (
  id uuid primary key default gen_random_uuid(),
  il text not null,
  segmentler text[] not null default '{}',       -- ['muteahhit','proje','ofis','emlakci']
  durum text not null default 'calisiyor',        -- calisiyor | tamamlandi | hata
  bulunan_aday int not null default 0,
  sonuc jsonb,                                     -- { aday_ids:[], kaynak_dagilimi:{} }
  baslatan uuid,                                   -- admin id
  created_at timestamptz not null default now()
);

-- ── aday (prospect) — keşif hunisinin çekirdeği ───────────────────────────────
create table if not exists public.aday (
  id uuid primary key default gen_random_uuid(),
  firma_adi text not null,
  firma_adi_norm text not null,                   -- dedup için normalize (lower/trim)
  segment text not null default 'muteahhit',      -- muteahhit | ofis | emlakci | proje
  kisi text,
  email text,
  telefon text,
  website text,
  il text,
  ilce text,
  adres text,
  proje_sayisi int,                               -- Claude tahmini (müteahhit)
  uygunluk_skoru int,                             -- 0-100, Claude
  ozet text,                                       -- Claude tek cümle
  kaynak text,                                     -- serpapi_maps | serper_web | places
  kaynak_url text,
  kampanya_id uuid references public.kesif_kampanya(id) on delete set null,
  durum text not null default 'yeni',             -- pipeline (aşağıda)
  ilk_temas timestamptz,
  son_temas timestamptz,
  temas_sayisi int not null default 0,
  sonraki_takip timestamptz,
  donusen_user_id uuid,                           -- kayda dönüşen aday (huni kapanışı)
  opt_out boolean not null default false,         -- ticari ileti reddi (İYS/ETK)
  notlar text,                                     -- admin notu ('not' PG rezerve kelime)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- pipeline durum: yeni → zenginlesti → davet_edildi → acildi → kayit_oldu | reddedildi | soguk

-- Dedup: aynı firma + il tek kayıt (uygulama katmanına güvenme — DEĞİŞMEZ ruhu).
create unique index if not exists aday_firma_il_uniq on public.aday (firma_adi_norm, il);
create index if not exists aday_il_idx on public.aday (il);
create index if not exists aday_durum_idx on public.aday (durum);
create index if not exists aday_segment_idx on public.aday (segment);
-- follow-up cron sorgusu: yalnız davet edilmiş, opt-out olmayan, takip zamanı gelenler.
create index if not exists aday_takip_idx on public.aday (sonraki_takip)
  where durum = 'davet_edildi' and opt_out = false;

-- ── aday_temas (outreach log) — her temas kaydı ───────────────────────────────
create table if not exists public.aday_temas (
  id uuid primary key default gen_random_uuid(),
  aday_id uuid not null references public.aday(id) on delete cascade,
  kanal text not null default 'email',            -- email | whatsapp
  yon text not null default 'giden',              -- giden | gelen
  konu text,
  mesaj text,
  durum text not null default 'gonderildi',       -- gonderildi | acildi | yanit | opt_out | hata
  gonderen uuid,                                   -- admin id (giden) / null
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists aday_temas_aday_idx on public.aday_temas (aday_id);

-- updated_at trigger (aday) ───────────────────────────────────────────────────
create or replace function public.aday_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists aday_updated_at_trg on public.aday;
create trigger aday_updated_at_trg before update on public.aday
  for each row execute function public.aday_updated_at();

-- RLS: açık + policy yok → yalnız service-role. (client/authenticated erişemez.) ─
alter table public.kesif_kampanya enable row level security;
alter table public.aday enable row level security;
alter table public.aday_temas enable row level security;

-- ── BYOK entegrasyon anahtarları — keşif motoru kaynak anahtarları ────────────
-- pazarlama_entegrasyon singleton'ına keşif anahtarlarını ekle (yalnız service-role okur).
alter table public.pazarlama_entegrasyon add column if not exists serpapi_key text;
alter table public.pazarlama_entegrasyon add column if not exists serper_key text;
alter table public.pazarlama_entegrasyon add column if not exists places_key text;
