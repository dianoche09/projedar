-- 2026-08-20b — T13 DEBT-011 fix: "opsiyon düşerse haber ver" TÜM release yollarında çalışsın.
-- SORUN: bildirim yalnız opsiyon_serbest_birak (cron) içindeydi → gönüllü bırakma (opsiyonBirakSessiz),
-- vazgeçme (opsiyonSonucKaydet), manuel release bildirmiyordu; satis_beklemede takibi orphan kalıyordu.
-- ÇÖZÜM: bildirim+temizlik'i birim.durum trigger'ına taşı (opsiyon_birim_senkron her yolda birim'i
-- senkronladığı için evrensel yakalar) → durum='musait' olunca bildir+sil, satildi/kiralandi'da sil (orphan yok).
-- opsiyon_serbest_birak N10 haline (pür expiry) geri döner → INV-CRON-001/002 + B3 saf kalır.
-- create or replace + drop/create trigger → idempotent.

-- 1) opsiyon_serbest_birak: N10 pür-expiry (T13 CTE'leri kaldırıldı; bildirim artık birim trigger'da)
create or replace function opsiyon_serbest_birak()
returns int language plpgsql security definer set search_path = public as $$
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
grant execute on function opsiyon_serbest_birak() to service_role;

-- 2) birim.durum trigger: takip (opsiyon_bekleyen) yaşam döngüsü — TÜM yollar buradan geçer.
create or replace function birim_bekleyen_islet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.durum = 'musait' and old.durum is distinct from 'musait'
     and old.durum in ('opsiyonlu','satis_beklemede') then
    -- serbest kaldı (herhangi bir release yolu) → takipçilere bildir + takibi sil (tek seferlik)
    insert into bildirim (profile_id, tip, baslik, govde, link)
    select ob.emlakci_id, 'opsiyon', 'Beklediğin daire müsait oldu',
      'Takip ettiğin bir daire opsiyonu düştü, yeniden müsait. Havuzdan opsiyonlayabilirsin.',
      '/danisman/proje/' || new.proje_id
    from opsiyon_bekleyen ob where ob.birim_id = new.id;
    delete from opsiyon_bekleyen where birim_id = new.id;
  elsif new.durum in ('satildi','kiralandi') and old.durum is distinct from new.durum then
    -- kalıcı gitti → asla müsait olmayacak, bekleyen takipleri temizle (orphan olmasın)
    delete from opsiyon_bekleyen where birim_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists birim_bekleyen_islet_trg on birim;
create trigger birim_bekleyen_islet_trg after update of durum on birim
  for each row execute function birim_bekleyen_islet();
