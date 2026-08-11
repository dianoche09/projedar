-- 2026-08-11 — Dinamik Fiyat Kural Motoru.
-- Müteahhit proje kurulumunda deterministik kurallar tanımlar; sistem koşul gerçekleşince
-- fiyatı otomatik uygular (mod='otomatik') veya öneri kuyruğuna düşürür (mod='oneri').
-- Kod migration olmadan graceful: tablo/kolon yoksa motor no-op, UI bölümü gizli.
-- Browser SQL Editor'den uygula (MCP read-only).

-- 1) Proje ayarı (mod + guardrail + baz)
alter table proje add column if not exists fiyat_ayar jsonb default '{}'::jsonb;

-- 2) Kural tanımları
create table if not exists fiyat_kurali (
  id                 uuid primary key default gen_random_uuid(),
  proje_id           uuid not null references proje(id) on delete cascade,
  tip_id             uuid references daire_tipi(id) on delete cascade,   -- null = tüm tipler
  ad                 text not null,
  tetik              text not null check (tetik in ('sure_gun','satis_adet','satis_yuzde','tarih')),
  esik               numeric not null default 0,
  tetik_tarih        date,                                               -- yalnız tetik='tarih'
  aksiyon            text not null check (aksiyon in ('yuzde','sabit_ekle','sabit_fiyat')),
  deger              numeric not null,
  tekrar             text not null default 'tek' check (tekrar in ('tek','periyodik')),
  son_uygulanan_esik numeric not null default 0,
  aktif              boolean not null default true,
  created_at         timestamptz default now()
);
create index if not exists fiyat_kurali_proje_idx on fiyat_kurali(proje_id);

-- 3) Öneri kuyruğu (yalnız mod='oneri')
create table if not exists fiyat_kural_oneri (
  id          uuid primary key default gen_random_uuid(),
  kural_id    uuid not null references fiyat_kurali(id) on delete cascade,
  birim_id    uuid not null references birim(id) on delete cascade,
  proje_id    uuid not null references proje(id) on delete cascade,
  eski_fiyat  numeric,
  yeni_fiyat  numeric not null,
  durum       text not null default 'bekliyor' check (durum in ('bekliyor','uygulandi','reddedildi')),
  created_at  timestamptz default now()
);
-- Aynı kural+birim için ikinci bir BEKLEYEN öneri düşmesin
create unique index if not exists fiyat_kural_oneri_tek_bekleyen
  on fiyat_kural_oneri (kural_id, birim_id) where durum = 'bekliyor';
create index if not exists fiyat_kural_oneri_proje_idx on fiyat_kural_oneri(proje_id, durum);

-- 4) RLS — yalnız proje sahibi üretici + admin (emlakçı görmez; motor service-role ile yazar)
alter table fiyat_kurali enable row level security;
alter table fiyat_kural_oneri enable row level security;

drop policy if exists fiyat_kurali_owner on fiyat_kurali;
create policy fiyat_kurali_owner on fiyat_kurali for all
  using (exists (select 1 from proje p join uretici u on u.id = p.uretici_id
                 where p.id = fiyat_kurali.proje_id and u.sahip_id = auth.uid()))
  with check (exists (select 1 from proje p join uretici u on u.id = p.uretici_id
                 where p.id = fiyat_kurali.proje_id and u.sahip_id = auth.uid()));
drop policy if exists fiyat_kurali_admin on fiyat_kurali;
create policy fiyat_kurali_admin on fiyat_kurali for all using (is_admin()) with check (is_admin());

drop policy if exists fiyat_oneri_owner on fiyat_kural_oneri;
create policy fiyat_oneri_owner on fiyat_kural_oneri for all
  using (exists (select 1 from proje p join uretici u on u.id = p.uretici_id
                 where p.id = fiyat_kural_oneri.proje_id and u.sahip_id = auth.uid()))
  with check (exists (select 1 from proje p join uretici u on u.id = p.uretici_id
                 where p.id = fiyat_kural_oneri.proje_id and u.sahip_id = auth.uid()));
drop policy if exists fiyat_oneri_admin on fiyat_kural_oneri;
create policy fiyat_oneri_admin on fiyat_kural_oneri for all using (is_admin()) with check (is_admin());
