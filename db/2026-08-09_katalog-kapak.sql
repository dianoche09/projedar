-- Katalog projelerine kaynak sitenin (og:image) gerçek kapak görseli + atıf kaynağı.
-- kapak_url = og:image mutlak URL (imaj.emlakjet.com / satisofisi.com); kapak_kaynak = atıf host'u.
-- Görsel yoksa sayfa temsili havuza düşer. Rehost yok; next/image hotlink + "Görsel: <kaynak>".
alter table katalog_proje add column if not exists kapak_url text;
alter table katalog_proje add column if not exists kapak_kaynak text;
