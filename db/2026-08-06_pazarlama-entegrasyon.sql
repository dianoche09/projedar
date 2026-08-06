-- KolayMarketing (sosyal içerik motoru) — BYOK entegrasyon anahtarları.
-- Platform işletmecisi (admin) panelden kendi API anahtarlarını girer; motorlar bunları
-- env yerine buradan okur. Tek satır (singleton). YALNIZ service-role erişir — anahtarlar
-- asla client'a gitmez (DEĞİŞMEZ #1: RLS-önce, service-role sunucuda).
--
-- NOT (güvenlik / Faz 2): anahtarlar şu an düz metin saklanıyor; erişim service-role +
-- RLS deny-all ile sınırlı. Prod-sertleştirme: pgsodium/Vault ile şifreleme eklenmeli.

create table if not exists public.pazarlama_entegrasyon (
  id text primary key default 'default' check (id = 'default'),  -- singleton satır
  claude_key text,             -- Anthropic Claude (script/caption/eleştirmen)
  fal_key text,                -- fal.ai (görsel + storyboard)
  elevenlabs_key text,         -- ElevenLabs (reel seslendirme) — reel fazı
  publer_key text,             -- Publer (çok-platform yayın) — yayın fazı
  publer_workspace_id text,    -- Publer workspace (boşsa ilk workspace otomatik)
  render_url text,             -- harici ffmpeg "kutu" derleyici URL'i — reel fazı
  render_token text,           -- harici derleyici token'ı
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table public.pazarlama_entegrasyon enable row level security;
-- Public/authenticated policy YOK → yalnız service-role (server action / cron) okur-yazar.

-- Singleton satırı hazırla (upsert hedefi).
insert into public.pazarlama_entegrasyon (id) values ('default') on conflict (id) do nothing;
