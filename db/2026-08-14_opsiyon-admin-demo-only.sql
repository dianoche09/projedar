-- 2026-08-14 — Admin opsiyon bypass'ını DEMO projelere kısıtla (audit E1 / INV-ADMIN-002).
-- SORUN: db/2026-08-13_opsiyon-admin-bypass.sql opsiyon RPC gate'ine `is_admin() or` ekledi →
--   admin HERHANGİ müteahhidin HERHANGİ canlı (non-demo) birimine tahsisi baypas edip opsiyon
--   alabiliyor, satici_id=admin oluyor. Bu INV-ADMIN-001'i ihlal eder (admin = platform, satıcı değil):
--   canlı stoğu tek-aktif-opsiyon slotundan kilitler, gerçek danışmanı bloklar, kazanç/hakediş
--   attribution'ı bozar. FIX: admin bypass'ı YALNIZ proje.demo=true'ya kısıtla (concierge/test sandbox).
--   Gerçek emlakçı akışı DEĞİŞMEZ. Not: admin gerçek projede "adına" opsiyon açacaksa o ayrı bir
--   feature'dır (satici_id = o emlakçı, admin değil; gate'i normal geçer) — bu fix kapsamında değil.
-- Browser SQL Editor'den uygula.

create or replace function public.opsiyon_al_dogrudan(p_birim uuid, p_gun integer default 3)
returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_ops uuid; v_proje uuid; v_yontem text;
begin
  select b.proje_id into v_proje from birim b
    where b.id = p_birim and b.durum = 'musait' and b.satilabilir = true
      and ( (is_admin() and coalesce((select demo from proje where id = b.proje_id), false))
            or emlakci_birim_gorebilir(b.id, b.proje_id, b.blok_id, b.tip_id, b.kat, b.tur::text) );
  if v_proje is null then raise exception 'Daire musait/tahsisli degil'; end if;
  select coalesce(opsiyon_ayar->>'yontem', opsiyon_yontemi::text) into v_yontem from proje where id = v_proje;
  if v_yontem is distinct from 'dogrudan' then raise exception 'Bu projede anlik opsiyon kapali'; end if;
  insert into opsiyon (birim_id, satici_id, yontem, durum, kilit_bitis)
    values (p_birim, auth.uid(), 'dogrudan', 'opsiyonlu', now() + (p_gun || ' days')::interval)
    returning id into v_ops;
  return v_ops;
end $function$;

create or replace function public.opsiyon_al_gecici(p_birim uuid, p_ad text, p_tel text, p_gerekce text default null)
returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_proje uuid; v_ayar jsonb; v_yontem text; v_kota int; v_zorunlu bool; v_dgs int; v_aktif int; v_ops uuid;
        v_skor int; v_esik int; v_daralt bool; v_dusuk bool := false;
begin
  select b.proje_id into v_proje from birim b where b.id=p_birim and b.durum='musait' and b.satilabilir=true
    and ( (is_admin() and coalesce((select demo from proje where id = b.proje_id), false))
          or emlakci_birim_gorebilir(b.id,b.proje_id,b.blok_id,b.tip_id,b.kat,b.tur::text) );
  if v_proje is null then raise exception 'Daire musait/tahsisli degil'; end if;
  select coalesce(opsiyon_ayar,'{}'::jsonb) into v_ayar from proje where id=v_proje;
  v_yontem := coalesce(v_ayar->>'yontem','gecici');
  if v_yontem='onay' then raise exception 'Bu projede once-onay yontemi acik'; end if;
  v_zorunlu := coalesce((v_ayar->>'musteri_zorunlu')::bool, true);
  if v_zorunlu and (coalesce(btrim(p_ad),'')='' or coalesce(btrim(p_tel),'')='') then raise exception 'Musteri ad ve telefon zorunlu'; end if;
  v_kota := coalesce((v_ayar->>'kota')::int, 3);
  v_daralt := coalesce((v_ayar->>'dusuk_skor_kota')::bool, true);
  v_esik := coalesce((v_ayar->>'dusuk_skor_esik')::int, 40);
  if v_daralt then
    select (emlakci_skor(auth.uid())->>'skor')::int into v_skor;
    if v_skor is not null and v_skor < v_esik then v_kota := 1; v_dusuk := true; end if;
  end if;
  select count(*) into v_aktif from opsiyon where satici_id=auth.uid() and durum in ('opsiyonlu','satis_beklemede');
  if v_aktif >= v_kota then
    if v_dusuk then raise exception 'Guven skorun dusuk — ayni anda en fazla 1 opsiyon tutabilirsin. Sonuclandirdikca skorun yukselir.';
    else raise exception 'Aktif opsiyon kotan doldu (%)', v_kota; end if;
  end if;
  v_dgs := coalesce((v_ayar->>'dogrulama_saat')::int, 2);
  insert into opsiyon (birim_id,satici_id,yontem,durum,dogrulandi,dogrulama_bitis,musteri_ad,musteri_tel,gerekce)
    values (p_birim,auth.uid(),'dogrudan','opsiyonlu',false,now()+(v_dgs||' hours')::interval,btrim(p_ad),btrim(p_tel),p_gerekce)
    returning id into v_ops;
  return v_ops;
end $function$;
