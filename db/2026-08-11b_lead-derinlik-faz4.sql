-- 2026-08-11 — Emlakçı lead derinliği FAZ 4 (stok-bağlı genişletme). Browser SQL Editor'den uygula.
-- Karar (ProjePazar-Emlakci-Panel-Gelistirme-Plani.md, CRM sınırı revize): not/timeline + kayıp
-- nedeni + hatırlatma + hafif enrichment EKLE; hepsi platform-lead'ine bağlı, minimal. Manuel/dış
-- lead ve pipeline/kanban YOK.

-- 1) sıcaklık (manuel skorlama) + not tipi enum'ları
do $$ begin
  if not exists (select 1 from pg_type where typname = 'lead_sicaklik') then
    create type lead_sicaklik as enum ('sicak','ilik','soguk');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_not_tip') then
    create type lead_not_tip as enum ('not','arama','whatsapp','gorusme','sistem');
  end if;
end $$;

-- 2) lead enrichment + kayıp nedeni + takip hatırlatması kolonları (hepsi opsiyonel)
alter table lead add column if not exists email                 text;
alter table lead add column if not exists butce                 text;          -- serbest aralık ("3-4M TL")
alter table lead add column if not exists ihtiyac_notu          text;          -- oda/m²/bölge/teslim serbest
alter table lead add column if not exists etiket                text[];        -- yatırımcı, acil, kredi-bekliyor
alter table lead add column if not exists sicaklik              lead_sicaklik; -- L5: manuel sıcaklık
alter table lead add column if not exists kayip_nedeni          text;          -- L3: kaybedildi durumunda
alter table lead add column if not exists sonraki_aksiyon_at    timestamptz;   -- L4: takip hatırlatması
alter table lead add column if not exists sonraki_aksiyon_notu  text;
alter table lead add column if not exists hatirlatma_gonderildi boolean default false;

-- 3) lead_not: aktivite/not timeline (L2). Yazan = lead sahibi emlakçı.
create table if not exists lead_not (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references lead(id) on delete cascade,
  yazan_id   uuid references profiles(id),
  tip        lead_not_tip not null default 'not',
  govde      text not null,
  created_at timestamptz default now()
);
create index if not exists lead_not_lead_idx on lead_not(lead_id, created_at desc);

alter table lead_not enable row level security;
-- select: yalnız lead'i görebilen emlakçı (lead sahipliğiyle aynı) + admin.
-- insert/update/delete policy YOK → tüm yazma server action + admin client (sahiplik action'da doğrulanır).
drop policy if exists lead_not_select on lead_not;
create policy lead_not_select on lead_not for select using (
  is_admin() or exists (
    select 1 from lead l
    where l.id = lead_not.lead_id
      and (l.atanan_id = auth.uid() or l.ilk_paylasan_id = auth.uid())
  )
);

-- takip cron'u için kısmi index (sonraki_aksiyon_at gelmiş + gönderilmemiş)
create index if not exists lead_takip_idx on lead(sonraki_aksiyon_at)
  where hatirlatma_gonderildi = false and sonraki_aksiyon_at is not null;
