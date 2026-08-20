-- Rollback'li SENTETIK RLS/durum testi (prod verisinden bağımsız, deterministik).
-- Neden sentetik: prod'da 'herkes' tahsis + doğrulanmış emlakçı yok → doğal fixture ATLA'ya düşerdi.
-- Transaction içinde: mevcut emlakçıyı geçici 'dogrulandi' yap + herkes/tüm-proje AKTİF tahsis ekle,
-- durum=aktif/askida/kaldirildi için A) predicate + B) gerçek RLS SELECT birim doğrula, sonra ROLLBACK.
-- FAIL → yüksek sesle exception. PASS → hatasız (rollback []). Auth.users FK: MEVCUT emlakçı id kullanılır.
-- NOT: profiles_belge_guard trigger'ı belge_durumu='dogrulandi'yi yalnız admin'e izin verir (KYC bütünlüğü).
-- Test-only: transaction içinde guard'ı disable et (rollback re-enable eder) ki sentetik doğrulanmış emlakçı kurulabilsin.
begin;
alter table profiles disable trigger profiles_belge_guard;
do $$
declare
  v_emlakci uuid; v_proje uuid; v_birim uuid;
  v_blok uuid; v_tip uuid; v_kat int; v_tur text;
  v_tahsis uuid; v_claims text; v_g boolean;
begin
  select id into v_emlakci from profiles where rol='emlakci' limit 1;
  select b.proje_id, b.id, b.blok_id, b.tip_id, b.kat, b.tur::text
    into v_proje, v_birim, v_blok, v_tip, v_kat, v_tur
    from birim b join proje p on p.id = b.proje_id
    where b.ana_birim_id is null and coalesce(p.demo,false)=false
    limit 1;
  if v_emlakci is null or v_birim is null then
    raise exception 'FIXTURE_YOK: emlakci=% birim=%', v_emlakci, v_birim;
  end if;

  -- SENTETIK (rollback edilecek): doğrulanmış emlakçı + herkes/tüm-proje AKTİF tahsis
  update profiles set belge_durumu='dogrulandi' where id = v_emlakci;
  insert into tahsis(proje_id, hedef_tip, hedef_id, hedef_filtre, kapsam, durum)
    values (v_proje, 'herkes', null, null, '{}'::jsonb, 'aktif') returning id into v_tahsis;

  v_claims := json_build_object('sub', v_emlakci, 'role','authenticated')::text;
  perform set_config('request.jwt.claims', v_claims, true);

  -- ===== AKTİF: görünür (A predicate + B RLS) =====
  assert emlakci_birim_gorebilir(v_birim, v_proje, v_blok, v_tip, v_kat, v_tur) = true, 'FAIL A: aktif predicate false';
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_g;
  reset role;
  assert v_g = true, 'FAIL B: aktif RLS SELECT birim GÖRÜNMÜYOR';

  -- ===== ASKIDA: gizli (A + B) =====
  update tahsis set durum='askida' where id = v_tahsis;
  assert emlakci_birim_gorebilir(v_birim, v_proje, v_blok, v_tip, v_kat, v_tur) = false, 'FAIL A: askida predicate true';
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_g;
  reset role;
  assert v_g = false, 'FAIL B: askida RLS SELECT birim SIZIYOR';

  -- ===== KALDIRILDI: gizli (B) =====
  update tahsis set durum='kaldirildi' where id = v_tahsis;
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_g;
  reset role;
  assert v_g = false, 'FAIL B: kaldirildi RLS SELECT birim görünüyor';

  raise notice 'PASS sentetik: emlakci=% proje=% birim=% tahsis=%', v_emlakci, v_proje, v_birim, v_tahsis;
end $$;
rollback;
