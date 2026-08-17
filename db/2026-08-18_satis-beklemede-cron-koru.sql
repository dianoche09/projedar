-- 2026-08-18 — satis_beklemede birimi cron'dan KORU (B3 / XP-03, çift-satış açığı fix).
-- SORUN: danışman satışı bildirince opsiyon 'satis_beklemede' olur (müteahhit teyit bekliyor,
-- danisman/actions.ts:392). Ama opsiyon_serbest_birak cron'u kilit_bitis geçince 'satis_beklemede'yi
-- de siliyordu → trigger birimi 'musait' yapıyor → sözleşme imzalanırken birim tekrar opsiyonlanabilir
-- (çift-satış). FIX: cron YALNIZ 'opsiyonlu' opsiyonu serbest bırakır. Reported-sale opsiyon-kilit
-- zamanlayıcısıyla auto-cancel EDİLMEZ; müteahhit teyit eder (birimSatisKapat → satildi) veya iptal eder.
-- Vercel cron tarafı da (isler.ts) aynı şekilde 'opsiyonlu'ya daraltıldı.
-- Browser SQL Editor'den uygula.

create or replace function opsiyon_serbest_birak()
returns int language plpgsql security definer set search_path=public as $$
declare v_count int;
begin
  insert into events (tip, profile_id, proje_id, birim_id, payload)
  select 'opsiyon', o.satici_id, b.proje_id, o.birim_id,
    jsonb_build_object('eylem', case when o.dogrulandi = false then 'dogrulama_sure_doldu' else 'sure_doldu' end)
  from opsiyon o join birim b on b.id = o.birim_id
  where o.durum = 'opsiyonlu'
    and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) );
  with del as (
    delete from opsiyon o
    where o.durum = 'opsiyonlu'
      and ( o.kilit_bitis < now() or (o.dogrulandi = false and o.dogrulama_bitis < now()) )
    returning o.id
  ) select count(*) into v_count from del;
  return v_count;
end $$;
