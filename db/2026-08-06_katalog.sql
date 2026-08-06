-- Katalog: dış kaynaktan derlenen proje envanteri (SEO sayfaları için).
-- YALNIZ olgusal alanlar (telif-dışı): ad, konum, geliştirici, oda/m², durum.
-- Görsel YOK, birebir açıklama metni YOK (sayfada varyant motoru + gerçek alanlar).
-- RLS açık, public SELECT policy YOK → SEO sayfaları createAdminClient (server-only) ile okur.

create table if not exists katalog_proje (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  ad text not null,
  il text,
  ilce text,
  mahalle text,
  gelistirici text,                                   -- müteahhit/geliştirici firma adı (olgusal)
  oda_tipleri text[],                                 -- {'2+1','3+1'}
  m2_min integer,
  m2_max integer,
  daire_sayisi integer,
  durum text,                                         -- 'lansman' | 'insaat' | 'teslim'
  teslim text,                                        -- serbest metin: '2027 3Ç'
  proje_web text,                                     -- projenin kendi web sitesi (yönlendirme)
  kaynak_url text,                                    -- iç referans (hangi kaynaktan)
  eslesen_proje_id uuid references proje(id) on delete set null,  -- ağa girerse forward hedefi
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists katalog_proje_il_ilce_idx on katalog_proje (il, ilce);
create index if not exists katalog_proje_aktif_idx on katalog_proje (aktif) where aktif;

alter table katalog_proje enable row level security;
-- Public SELECT policy tanımlanmadı: SEO sayfaları service-role (admin-client) ile okur;
-- yazma yalnız admin/service-role. Böylece DEĞİŞMEZ #1 saldırı yüzeyi artmaz.
