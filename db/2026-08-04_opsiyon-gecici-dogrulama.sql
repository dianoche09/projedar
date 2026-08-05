-- 2026-08-04 — Opsiyon 2 FAZLI: geçici kilit → müteahhit doğrulama + guardrail'ler
-- Emlakçı boş-opsiyon almasın, müteahhit doğrulaması ŞART. Canlıda Management API ile uygulandı.
--
-- Faz 1 (geçici kilit): emlakçı alır → daire ANINDA kilitlenir (çift-satış korunur) ama dogrulandi=false,
--   müşteri bilgisi zorunlu + kota kontrolü. Faz 2: müteahhit dogrular (kesin) / reddeder (serbest) /
--   dogrulama penceresi dolarsa cron serbest bırakır (bkz. src/app/api/cron/_lib/isler.ts).

-- ── Şema ──
-- opsiyon kolonları (dogrulandi DEFAULT true → mevcut opsiyonlar kesin kalır; yeni geçici olanlar false)
alter table opsiyon add column if not exists dogrulandi boolean default true;
alter table opsiyon add column if not exists dogrulama_bitis timestamptz;
alter table opsiyon add column if not exists musteri_ad text;
alter table opsiyon add column if not exists musteri_tel text;
alter table opsiyon add column if not exists gerekce text;
alter table opsiyon add column if not exists sonuc text;         -- satildi | vazgecildi | null
alter table opsiyon add column if not exists sonuc_at timestamptz;

-- proje müteahhit-tanımlı ayar: { yontem:'gecici'|'onay'|'dogrudan', dogrulama_saat, kilit_gun, kota, musteri_zorunlu }
alter table proje add column if not exists opsiyon_ayar jsonb;

-- ── RPC opsiyon_al_gecici: geçici kilit + müşteri zorunlu + kota (emlakçı çağırır) ──
create or replace function opsiyon_al_gecici(p_birim uuid, p_ad text, p_tel text, p_gerekce text default null)
  returns uuid language plpgsql security definer set search_path=public as $$
declare v_proje uuid; v_ayar jsonb; v_yontem text; v_kota int; v_zorunlu bool; v_dgs int; v_aktif int; v_ops uuid;
        v_skor int; v_esik int; v_daralt bool; v_dusuk bool := false;
begin
  select b.proje_id into v_proje from birim b where b.id=p_birim and b.durum='musait' and b.satilabilir=true
    and emlakci_birim_gorebilir(b.id,b.proje_id,b.blok_id,b.tip_id,b.kat,b.tur::text);
  if v_proje is null then raise exception 'Daire musait/tahsisli degil'; end if;
  select coalesce(opsiyon_ayar,'{}'::jsonb) into v_ayar from proje where id=v_proje;
  v_yontem := coalesce(v_ayar->>'yontem','gecici');
  if v_yontem='onay' then raise exception 'Bu projede once-onay yontemi acik'; end if;
  v_zorunlu := coalesce((v_ayar->>'musteri_zorunlu')::bool, true);
  if v_zorunlu and (coalesce(btrim(p_ad),'')='' or coalesce(btrim(p_tel),'')='') then raise exception 'Musteri ad ve telefon zorunlu'; end if;
  v_kota := coalesce((v_ayar->>'kota')::int, 3);
  -- Düşük güven skoru → sıkı kota (aynı anda 1). Boş-opsiyon disiplini; müteahhit-ayarlı eşik + toggle.
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
end $$;
grant execute on function opsiyon_al_gecici(uuid,text,text,text) to authenticated;

-- ── RPC opsiyon_dogrula: müteahhit KESİNLEŞTİRİR → dogrulandi=true, kilit_bitis=now+kilit_gun ──
create or replace function opsiyon_dogrula(p_ops uuid)
  returns void language plpgsql security definer set search_path=public as $$
declare v_birim uuid; v_proje uuid; v_sahip uuid; v_gun int;
begin
  select o.birim_id into v_birim from opsiyon o where o.id=p_ops and o.dogrulandi=false;
  if v_birim is null then raise exception 'Opsiyon bulunamadi veya zaten dogrulandi'; end if;
  select b.proje_id into v_proje from birim b where b.id=v_birim;
  select u.sahip_id into v_sahip from proje p join uretici u on u.id=p.uretici_id where p.id=v_proje;
  if not (is_admin() or v_sahip=auth.uid()) then raise exception 'Yetki yok'; end if;
  v_gun := coalesce((select (opsiyon_ayar->>'kilit_gun')::int from proje where id=v_proje), 3);
  update opsiyon set dogrulandi=true, kilit_bitis=now()+(v_gun||' days')::interval, dogrulama_bitis=null where id=p_ops;
end $$;
grant execute on function opsiyon_dogrula(uuid) to authenticated;

-- ── RPC opsiyon_reddet: müteahhit REDDEDER → daire serbest (delete; trigger birimi 'musait' yapar) ──
create or replace function opsiyon_reddet(p_ops uuid)
  returns void language plpgsql security definer set search_path=public as $$
declare v_birim uuid; v_proje uuid; v_sahip uuid;
begin
  select o.birim_id into v_birim from opsiyon o where o.id=p_ops;
  if v_birim is null then raise exception 'Opsiyon bulunamadi'; end if;
  select b.proje_id into v_proje from birim b where b.id=v_birim;
  select u.sahip_id into v_sahip from proje p join uretici u on u.id=p.uretici_id where p.id=v_proje;
  if not (is_admin() or v_sahip=auth.uid()) then raise exception 'Yetki yok'; end if;
  delete from opsiyon where id=p_ops;
end $$;
grant execute on function opsiyon_reddet(uuid) to authenticated;
