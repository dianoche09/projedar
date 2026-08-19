-- 2026-08-19 — N10 / RISK-CRON-001: opsiyon-expiry TEK YETKİLİ fonksiyon (idempotent, çift-yazım yarışını öldürür)
-- SORUN: opsiyon süresi dolunca iki scheduler serbest bırakıyordu — pg_cron opsiyon_serbest_birak (15dk)
--   ve Vercel opsiyonSuresiCalistir (günlük). Vercel kendi SELECT+DELETE+audit'ini yeniden yazıyor + label'ı
--   düz 'sure_doldu' basıyordu; pg_cron ise 'dogrulama_sure_doldu' vs 'sure_doldu' ayırıyor. Güven-skoru
--   (guven_skoru RPC) 'dogrulama_sure_doldu'yu ayrı saydığından, expiry'yi HANGİ cron yakalarsa müteahhit
--   güven oranı değişiyordu (audit/attribution çelişkisi). Ayrıca eski insert-önce-delete-sonra biçimi READ
--   COMMITTED altında iki eşzamanlı çalışmada aynı satır için ÇİFT event yazabiliyordu.
-- FIX: audit'i DELETE ... RETURNING kümesinden yaz (data-modifying CTE). Satır kilidi → her satırı yalnız
--   bir txn siler ve yalnız o txn kendi event'ini yazar → tam idempotent, çift-event imkânsız. Label mantığı
--   (CASE) TEK KAYNAK burada. Vercel tarafı artık bu fonksiyonu rpc() ile çağırır (kendi mantığını yeniden
--   yazmaz) → INV-CRON-001/002. B3 korunur: yalnız durum='opsiyonlu' serbest bırakılır ('satis_beklemede' asla).
-- create or replace → idempotent. cron.schedule değişmez (ada göre çağırır).

create or replace function opsiyon_serbest_birak()
returns int language plpgsql security definer set search_path=public as $$
declare v_count int;
begin
  with del as (
    delete from opsiyon o
    where o.durum = 'opsiyonlu'
      and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) )
    returning o.id, o.satici_id, o.birim_id, o.dogrulandi
  ), ev as (
    insert into events (tip, profile_id, proje_id, birim_id, payload)
    select 'opsiyon', d.satici_id, b.proje_id, d.birim_id,
      jsonb_build_object('eylem', case when d.dogrulandi = false
                                       then 'dogrulama_sure_doldu' else 'sure_doldu' end)
    from del d join birim b on b.id = d.birim_id
  )
  select count(*) into v_count from del;
  return v_count;
end $$;

-- Vercel failsafe (service-role) bu fonksiyonu rpc ile çağırır.
grant execute on function opsiyon_serbest_birak() to service_role;
