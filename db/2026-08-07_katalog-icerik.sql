-- Katalog: proje SEO sayfaları için ZENGİN içerik (çok-kaynak derlenmiş olgu + özgün metin).
-- icerik jsonb yapısı:
--   { proje_alani_m2, daire_sayisi, blok_sayisi, oda_tipleri[], m2_min, m2_max,
--     magaza, yesil_alan, sosyal_alan, manzara, otopark, ozellikler[], cevre_noktalar[],
--     ekstra{}, metin{ ozet, konum_cevre, daire_tipleri, ozellikler_metni, yatirim_teslim }, kaynaklar[] }
-- Metinler ÖZGÜN (birebir kopya yok), görsel/fiyat YOK. scripts/katalog-enrich.mjs yazar,
-- /proje/[slug] sayfası ProjeZenginIcerik ile render eder.
alter table katalog_proje add column if not exists icerik jsonb;
