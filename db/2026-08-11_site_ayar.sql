-- Site meta ayarları (arama motoru doğrulama token'ları + gelecekte global meta).
-- Değerler HTML meta etiketine basılır (public); yine de tablo yalnız admin'e açık,
-- layout service-role ile okur. RLS-önce: DEĞİŞMEZ #1.
create table if not exists site_ayar (
  anahtar     text primary key,
  deger       text not null default '',
  aciklama    text,
  guncelleme  timestamptz not null default now()
);

alter table site_ayar enable row level security;

-- Yalnız admin okuyup yazar (layout service-role kullanır, RLS'i bypass eder).
drop policy if exists site_ayar_admin_all on site_ayar;
create policy site_ayar_admin_all on site_ayar
  for all
  using (exists (select 1 from profiles where id = auth.uid() and rol = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and rol = 'admin'));

-- Bilinen meta anahtarlarını tohumla (idempotent). Google token kullanıcı tarafından verildi.
insert into site_ayar (anahtar, deger, aciklama) values
  ('google_site_verification', 'xOtObUVrKfggM86d9Ef3Iw-XL02AwWqhCFPdIdRBfWc', 'Google Search Console doğrulama token (meta content değeri)'),
  ('bing_site_verification',   '', 'Bing Webmaster doğrulama token (msvalidate.01)'),
  ('yandex_verification',      '', 'Yandex Webmaster doğrulama token')
on conflict (anahtar) do nothing;
