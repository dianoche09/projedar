-- 2026-08-17b — Opsiyon fiyat snapshot (A2 / RISK-PRICE-001, Option A: NON-BINDING + sapma rozeti).
-- KARAR (kullanıcı 2026-08-17): opsiyon anındaki fiyat opsiyona yazılır (işlem-anı OLGU, bağlayıcı değil).
-- DEĞİŞMEZ #2 korunur: birim tek CANLI kaynak; snapshot ayrı bir olgudur ("o an ne teklif edildi").
-- Rozet YALNIZ danışman (opsiyonlarim); /p müşteriye yalnız canlı fiyat gösterir. Satılmış birimde
-- liste fiyatı DB trigger'ıyla korunur (admin düzeltmesi hariç). Snapshot 3 opsiyon-oluşturma RPC'sinde
-- ATOMİK alınır (SECURITY DEFINER → client gameleyemez). Browser SQL Editor'den uygula.

-- ==== 1) Snapshot kolonları (nullable → eski opsiyonlar null = rozet yok, saf canlı) ====
alter table opsiyon
  add column if not exists liste_fiyati_snapshot numeric,
  add column if not exists para_birimi_snapshot  text;

-- ==== 2) opsiyon_al_dogrudan — E1 demo-only gate KORUNUR + snapshot capture ====
create or replace function public.opsiyon_al_dogrudan(p_birim uuid, p_gun integer default 3)
returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_ops uuid; v_proje uuid; v_yontem text; v_fiyat numeric; v_pb text;
begin
  select b.proje_id, b.liste_fiyati, b.para_birimi into v_proje, v_fiyat, v_pb from birim b
    where b.id = p_birim and b.durum = 'musait' and b.satilabilir = true
      and ( (is_admin() and coalesce((select demo from proje where id = b.proje_id), false))
            or emlakci_birim_gorebilir(b.id, b.proje_id, b.blok_id, b.tip_id, b.kat, b.tur::text) );
  if v_proje is null then raise exception 'Daire musait/tahsisli degil'; end if;
  select coalesce(opsiyon_ayar->>'yontem', opsiyon_yontemi::text) into v_yontem from proje where id = v_proje;
  if v_yontem is distinct from 'dogrudan' then raise exception 'Bu projede anlik opsiyon kapali'; end if;
  insert into opsiyon (birim_id, satici_id, yontem, durum, kilit_bitis, liste_fiyati_snapshot, para_birimi_snapshot)
    values (p_birim, auth.uid(), 'dogrudan', 'opsiyonlu', now() + (p_gun || ' days')::interval, v_fiyat, v_pb)
    returning id into v_ops;
  return v_ops;
end $function$;

-- ==== 3) opsiyon_al_gecici — E1 demo-only gate + kota/skor KORUNUR + snapshot capture ====
create or replace function public.opsiyon_al_gecici(p_birim uuid, p_ad text, p_tel text, p_gerekce text default null)
returns uuid language plpgsql security definer set search_path to 'public' as $function$
declare v_proje uuid; v_ayar jsonb; v_yontem text; v_kota int; v_zorunlu bool; v_dgs int; v_aktif int; v_ops uuid;
        v_skor int; v_esik int; v_daralt bool; v_dusuk bool := false; v_fiyat numeric; v_pb text;
begin
  select b.proje_id, b.liste_fiyati, b.para_birimi into v_proje, v_fiyat, v_pb from birim b
    where b.id=p_birim and b.durum='musait' and b.satilabilir=true
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
  insert into opsiyon (birim_id,satici_id,yontem,durum,dogrulandi,dogrulama_bitis,musteri_ad,musteri_tel,gerekce,liste_fiyati_snapshot,para_birimi_snapshot)
    values (p_birim,auth.uid(),'dogrudan','opsiyonlu',false,now()+(v_dgs||' hours')::interval,btrim(p_ad),btrim(p_tel),p_gerekce,v_fiyat,v_pb)
    returning id into v_ops;
  return v_ops;
end $function$;

-- ==== 4) opsiyon_talep_onayla — onay anında snapshot (opsiyon o an aktifleşiyor) ====
create or replace function opsiyon_talep_onayla(p_talep uuid, p_gun integer default null)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare v_birim uuid; v_emlakci uuid; v_ops uuid; v_sahip uuid; v_gun int; v_fiyat numeric; v_pb text;
begin
  select t.birim_id, t.talep_eden_id into v_birim, v_emlakci
    from opsiyon_talep t where t.id = p_talep and t.durum = 'beklemede' for update;
  if v_birim is null then raise exception 'Talep bulunamadı veya beklemede değil'; end if;
  select u.sahip_id into v_sahip
    from birim b join proje p on p.id = b.proje_id join uretici u on u.id = p.uretici_id where b.id = v_birim;
  if not (is_admin() or v_sahip = auth.uid()) then raise exception 'Yetki yok'; end if;
  if exists (select 1 from birim b where b.id = v_birim and b.durum <> 'musait') then
    raise exception 'Birim artık müsait değil'; end if;
  v_gun := coalesce(p_gun,
    (select (p.opsiyon_ayar->>'onay_gun')::int from birim b join proje p on p.id=b.proje_id where b.id=v_birim), 7);
  select liste_fiyati, para_birimi into v_fiyat, v_pb from birim where id = v_birim;
  insert into opsiyon (birim_id, satici_id, yontem, durum, kilit_bitis, liste_fiyati_snapshot, para_birimi_snapshot)
    values (v_birim, v_emlakci, 'talep_kod', 'opsiyonlu', now() + (v_gun || ' days')::interval, v_fiyat, v_pb)
    returning id into v_ops;
  update opsiyon_talep set durum = 'onaylandi', karar_veren_id = auth.uid(), karar_at = now(), opsiyon_id = v_ops where id = p_talep;
  update opsiyon_talep set durum = 'reddedildi', karar_veren_id = auth.uid(), karar_at = now()
    where birim_id = v_birim and durum = 'beklemede' and id <> p_talep;
  return v_ops;
end $$;

-- ==== 5) Satılmış birimde liste fiyatı korunur (DB trigger — kapanmış satış/hakediş geriye bozulmasın) ====
-- Üretici satılmış dairenin liste fiyatını değiştiremez; admin (düzeltme/concierge) hariç.
create or replace function birim_satildi_fiyat_koru() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if tg_op='UPDATE' and old.durum='satildi'
     and new.liste_fiyati is distinct from old.liste_fiyati
     and not is_admin() then
    raise exception 'Satilmis dairede liste fiyati degistirilemez (kapanmis satis/hakedis korunur)';
  end if;
  return new;
end $$;
drop trigger if exists birim_satildi_fiyat_koru_trg on birim;
create trigger birim_satildi_fiyat_koru_trg before update on birim
  for each row execute function birim_satildi_fiyat_koru();

-- ==== 6) Opsiyonlu birimde liste fiyatı değişince opsiyon sahibini bildir (sessiz değişim önleme) ====
-- Tüm fiyat-düzenleme yollarında (tekli/toplu) çalışır; danışman "değişti" rozetini görmeden de haber alır.
create or replace function birim_opsiyonlu_fiyat_bildir() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if tg_op='UPDATE' and old.durum in ('opsiyonlu','satis_beklemede')
     and new.liste_fiyati is distinct from old.liste_fiyati then
    insert into bildirim(profile_id, tip, baslik, govde, link)
    select o.satici_id, 'sistem', 'Opsiyonlu dairede fiyat değişti',
      coalesce((select ad from proje where id=new.proje_id),'Proje')||' · Daire '||coalesce(new.daire_no,'?')||
        ' · liste fiyatı güncellendi, müşterine yeniden quote etmen gerekebilir',
      '/danisman/opsiyonlarim'
    from opsiyon o where o.birim_id = new.id and o.durum in ('opsiyonlu','satis_beklemede');
  end if;
  return new;
end $$;
drop trigger if exists birim_opsiyonlu_fiyat_bildir_trg on birim;
create trigger birim_opsiyonlu_fiyat_bildir_trg after update on birim
  for each row execute function birim_opsiyonlu_fiyat_bildir();
