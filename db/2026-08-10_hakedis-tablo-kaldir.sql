-- 2026-08-10 — Hakediş ödeme takibini geri al (saf altyapı konumu).
-- Karar (kullanıcı): Projedar satışa aracılık etmez, komisyondan pay almaz, tahsilat
--   yapmaz → ödeme/alacak mutabakat defteri TUTMAYIZ. Emlakçının hakediş takibi taraflar
--   arasıdır, bizim işimiz değil. Bu yüzden hakedis tablosu (ödeme durumu saklama) kaldırılır.
-- KALIR: birim_satici_kazanci(uuid,uuid) RPC — müteahhit "kim sattı + hesaplanan komisyon"
--   SALT BİLGİ görünümü için kullanır (canlı hesap, saklama yok). Bu, zaten tuttuğumuz satış
--   verisinin sunumudur; yeni sorumluluk yüklemez.
-- Browser SQL Editor'den uygula.

drop policy if exists hakedis_uretici_all on hakedis;
drop policy if exists hakedis_emlakci_select on hakedis;
drop policy if exists hakedis_admin_all on hakedis;
drop table if exists hakedis;
