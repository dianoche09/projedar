-- 2026-08-13 — Demo/test projelerine özellik (kunye.ozellikler) seed'i. Browser SQL Editor'den uygula.
-- Amaç: havuz filtresi test edilebilsin (şu an tüm projelerde ozellikler boş → hiçbir filtre eşleşmiyor).
-- Her projeye TEMASINA uygun + FARKLI set (filtre daraltması anlamlı olsun). Taksonomi: src/lib/ozellikler.ts.
-- Mevcut kunye korunur (|| merge), yalnız 'ozellikler' anahtarı eklenir/güncellenir.

-- Çankaya Vadi Konakları (DEMO) — premium vadi
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Akıllı ev sistemi','Açık mutfak','Ankastre set','Ebeveyn banyosu','Giyinme odası','Yerden ısıtma','Teras'),
  'sosyal',    jsonb_build_array('Yüzme havuzu (Kapalı)','Sauna','Buhar odası','Spor salonu','Sinema','Çalışma alanı','Yürüyüş parkuru'),
  'bina',      jsonb_build_array('Asansör','Resepsiyon','Peyzaj alanı','Jeneratör','Engellilere uygun'),
  'ulasim',    jsonb_build_array('Metro','AVM','Okul','Hastane'),
  'guvenlik',  jsonb_build_array('7/24 güvenlik','Kartlı geçiş','Güvenlik kamerası','Sığınak'),
  'teknik',    jsonb_build_array('Deprem yönetmeliğine uygun','Isı cam','Zemin etüdü yapılmış','Yalıtım yönetmeliğine uygun'),
  'otopark',   jsonb_build_array('Kapalı otopark','Elektrikli araç şarj','Tahsisli otopark','Depo alanı'),
  'manzara',   jsonb_build_array('Orman manzaralı','Şehir manzarası')
)) where id = '77777777-7777-7777-7777-777777777777';

-- Sahil Teras Evleri — deniz/lüks
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Açık mutfak','Akıllı ev sistemi','Ankastre set','Balkon','Ebeveyn banyosu','Yerden ısıtma','Giyinme odası'),
  'sosyal',    jsonb_build_array('Yüzme havuzu (Açık)','Yüzme havuzu (Kapalı)','Spor salonu','Sauna','Çocuk oyun alanı','Kafe'),
  'bina',      jsonb_build_array('Asansör','Peyzaj alanı','Resepsiyon','Jeneratör'),
  'ulasim',    jsonb_build_array('Deniz','AVM','Okul'),
  'guvenlik',  jsonb_build_array('7/24 güvenlik','Kartlı geçiş','Güvenlik kamerası'),
  'teknik',    jsonb_build_array('Deprem yönetmeliğine uygun','Isı cam','Zemin etüdü yapılmış'),
  'otopark',   jsonb_build_array('Kapalı otopark','Elektrikli araç şarj','Depo alanı'),
  'manzara',   jsonb_build_array('Deniz manzaralı')
)) where id = '3976ab4a-2b78-4a97-8c6f-6bb36cc502db';

-- Marina Loft Rezidans — marina/rezidans
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Açık mutfak','Ankastre set','Balkon','Klima','Fiber internet','Çelik kapı'),
  'sosyal',    jsonb_build_array('Yüzme havuzu (Açık)','Buhar odası','Sauna','Restoran','Sinema'),
  'bina',      jsonb_build_array('Asansör','Apartman görevlisi','Su deposu','Hidrofor'),
  'ulasim',    jsonb_build_array('Deniz','Metro','Metrobüs','Anayola cephe'),
  'guvenlik',  jsonb_build_array('7/24 güvenlik','Görüntülü diafon','Güvenlik kamerası'),
  'teknik',    jsonb_build_array('Alüminyum doğrama','Isı cam','Deprem yönetmeliğine uygun'),
  'otopark',   jsonb_build_array('Kapalı otopark','Tahsisli otopark'),
  'manzara',   jsonb_build_array('Deniz manzaralı','Şehir manzarası')
)) where id = '668b2999-2524-4cd0-8295-d20e475e7c20';

-- Kule 42 — şehir kulesi
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Akıllı ev sistemi','Açık mutfak','Ankastre set','Isı yalıtımı','Ses yalıtımı','Merkezi ısıtma'),
  'sosyal',    jsonb_build_array('Spor salonu','Yüzme havuzu (Kapalı)','Çalışma alanı','Kafe','Oyun salonu'),
  'bina',      jsonb_build_array('Asansör','Yük asansörü','Resepsiyon','Jeneratör','Engellilere uygun'),
  'ulasim',    jsonb_build_array('Metro','AVM','Havalimanı','Hastane'),
  'guvenlik',  jsonb_build_array('7/24 güvenlik','Kartlı geçiş','Sığınak','Yangın sistemi'),
  'teknik',    jsonb_build_array('Tünel kalıp','Deprem yönetmeliğine uygun','Yalıtım yönetmeliğine uygun'),
  'otopark',   jsonb_build_array('Kapalı otopark','Elektrikli araç şarj','Tahsisli otopark'),
  'manzara',   jsonb_build_array('Şehir manzarası')
)) where id = 'ca7ccba2-27ea-485d-8658-11b06817e7cf';

-- Vadi Panorama — doğa/vadi
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Balkon','Teras','Yerden ısıtma','Çamaşır odası','Kiler','Giyinme odası'),
  'sosyal',    jsonb_build_array('Yürüyüş parkuru','Tenis kortu','Basketbol sahası','Çocuk parkı','Çocuk oyun alanı'),
  'bina',      jsonb_build_array('Bahçe','Peyzaj alanı','Apartman görevlisi'),
  'ulasim',    jsonb_build_array('Okul','Anayola cephe','Otobüs durağı'),
  'guvenlik',  jsonb_build_array('Güvenlik kamerası','Görüntülü diafon'),
  'teknik',    jsonb_build_array('Zemin etüdü yapılmış','Deprem yönetmeliğine uygun','PVC doğrama'),
  'otopark',   jsonb_build_array('Açık otopark','Kapalı otopark'),
  'manzara',   jsonb_build_array('Orman manzaralı','Göl manzaralı')
)) where id = '24b90cf5-daf4-4d0f-b3b2-46459c236150';

-- Bahçeşehir Yaşam — aile/sosyal
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Açık mutfak','Ankastre set','Balkon','Çamaşır odası','Ebeveyn banyosu'),
  'sosyal',    jsonb_build_array('Çocuk oyun alanı','Çocuk parkı','Yüzme havuzu (Açık)','Spor salonu','Futbol sahası','Yürüyüş parkuru'),
  'bina',      jsonb_build_array('Bahçe','Peyzaj alanı','Apartman görevlisi','Su deposu'),
  'ulasim',    jsonb_build_array('Okul','AVM','Metrobüs','Otobüs durağı'),
  'guvenlik',  jsonb_build_array('7/24 güvenlik','Güvenlik kamerası','Görüntülü diafon'),
  'teknik',    jsonb_build_array('Isı cam','Deprem yönetmeliğine uygun'),
  'otopark',   jsonb_build_array('Açık otopark','Kapalı otopark'),
  'manzara',   jsonb_build_array('Şehir manzarası')
)) where id = '8595a2b9-6fb2-42e9-a5b1-9689364ef450';

-- Test Konakları — karışık/küçük
update proje set kunye = coalesce(kunye,'{}'::jsonb) || jsonb_build_object('ozellikler', jsonb_build_object(
  'daire_ici', jsonb_build_array('Balkon','Klima','Fiber internet','Çelik kapı'),
  'sosyal',    jsonb_build_array('Spor salonu','Kafe','Çocuk oyun alanı'),
  'bina',      jsonb_build_array('Asansör','Apartman görevlisi'),
  'ulasim',    jsonb_build_array('Metro','Okul'),
  'guvenlik',  jsonb_build_array('Güvenlik kamerası'),
  'teknik',    jsonb_build_array('Deprem yönetmeliğine uygun'),
  'otopark',   jsonb_build_array('Açık otopark'),
  'manzara',   jsonb_build_array('Şehir manzarası')
)) where id = 'f2c40175-e1d9-4cca-9fec-555d71b9539e';
