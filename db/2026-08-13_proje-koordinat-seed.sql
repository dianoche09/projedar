-- 2026-08-13 — Test/demo projelere koordinat (lat/lng) seed'i. Browser SQL Editor'den uygula.
-- Harita "çalışmıyor" görünüyordu çünkü projelerin lat/lng'i null → pin yok. İl/ilçeye göre
-- gerçekçi koordinat. (Üretim: konum üretici formundan girilir; bu yalnız test verisi.)
update proje set lat=36.8760, lng=30.6050 where id='8595a2b9-6fb2-42e9-a5b1-9689364ef450'; -- Antalya/Konyaaltı
update proje set lat=39.9010, lng=32.8590 where id='77777777-7777-7777-7777-777777777777'; -- Ankara/Çankaya
update proje set lat=40.2140, lng=28.9640 where id='ca7ccba2-27ea-485d-8658-11b06817e7cf'; -- Bursa/Nilüfer
update proje set lat=38.4620, lng=27.1180 where id='668b2999-2524-4cd0-8295-d20e475e7c20'; -- İzmir/Karşıyaka
update proje set lat=39.8840, lng=32.8250 where id='3976ab4a-2b78-4a97-8c6f-6bb36cc502db'; -- Ankara/Çankaya
update proje set lat=40.9880, lng=29.0350 where id='24b90cf5-daf4-4d0f-b3b2-46459c236150'; -- İstanbul/Kadıköy
