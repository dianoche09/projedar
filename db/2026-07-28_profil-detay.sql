-- 2026-07-28 — Kapsamlı kayıt profili: role-özel firma / yetki / faaliyet verisi.
-- Browser SQL Editor'den uygula (memory: supabase-apply-browser).
--
-- Tasarım: TEK jsonb kolon (esnek, role göre farklı alanlar). Segmentasyon alanları
-- (il / ilce / uzmanlik / marka) ZATEN profiles'te kolon (2026-07-01 segment migration) →
-- wizard bunları hem kolona hem profil_detay'a yazar; segment tahsis çalışmaya devam eder.
--
-- KVKK: ham belge deposu değil → belge NO + tür + durum saklanır; asıl doğrulama kamu
-- sistemlerinden (YAMBİS / TTBS / MYK). Doğrulama durumu mevcut profiles.belge_durumu +
-- belge_durumu_guard trigger ile ADMIN-kontrollü kalır (aktör kendini doğrulayamaz).

alter table profiles add column if not exists profil_detay jsonb;

-- Not: profiles_self_upd RLS'i kullanıcının kendi satırını güncellemesine zaten izin verir;
-- profil_detay + il/ilce/uzmanlik/marka bu kapsamda yazılır. belge_durumu guard'lı kalır.
