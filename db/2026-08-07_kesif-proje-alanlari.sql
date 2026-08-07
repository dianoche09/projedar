-- Keşif motoru — "yeni projesi olan müteahhit" hedeflemesi için proje alanları.
-- aday = müteahhit (firma_adi/telefon/email/website = müteahhitin kendisi); aşağıdaki alanlar
-- o müteahhitin YENİ/aktif projesini + proje satış ofisi iletişimini taşır (çift iletişim).
alter table public.aday add column if not exists proje_adi text;
alter table public.aday add column if not exists proje_durumu text;   -- lansman | on_satis | insaat | tamamlandi | belirsiz
alter table public.aday add column if not exists proje_website text;
alter table public.aday add column if not exists proje_telefon text;

-- Tazelik/durum filtresi için index (aktif projeleri hızlı süzmek).
create index if not exists aday_proje_durumu_idx on public.aday (proje_durumu);
