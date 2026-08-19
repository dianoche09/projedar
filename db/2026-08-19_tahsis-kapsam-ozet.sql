-- 2026-08-19 — N13: tahsis oluşturma AKIBET ÖNİZLEMESİ (kaç birim + B4 çakışma) tek çağrıda.
-- SORUN: müteahhit tahsis kapsamını seçerken kaç birimin açılacağını göremiyor (destructive-scope
--   onaysız); B4 münhasır çakışma uyarısı yalnız submit anında görünüyor. FIX: özet RPC — owner-guard'lı,
--   birim_kapsaminda (tek kaynak intersection) ile satılabilir ana-birim sayar + tahsis_munhasir_cakisma
--   ile proaktif çakışma. Client (TahsisForm) canlı gösterir; server enforcement (tahsisEkle) değişmez.
-- create or replace → idempotent. Browser SQL Editor gerekmez (Management API'den uygulanır).

create or replace function tahsis_kapsam_ozet(p_proje_id uuid, p_kapsam jsonb, p_munhasir boolean default false)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_sayi int; v_cakisma int; v_ornek text;
begin
  -- Yetki: yalnız projenin sahibi üretici / admin (bilgi sızıntısı kalkanı — başka projenin birimini saymaz)
  if not _tahsis_proje_sahibi(p_proje_id) then
    return jsonb_build_object('yetki', false);
  end if;

  -- Kapsamdaki SATILABİLİR ana birim sayısı (birim_kapsaminda = RLS ile aynı intersection)
  select count(*) into v_sayi
  from birim b
  where b.proje_id = p_proje_id
    and b.ana_birim_id is null
    and b.satilabilir = true
    and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, p_kapsam);

  -- B4 münhasır çakışma (proaktif; tahsisEkle ile aynı kaynak)
  select count(*), max(c.ornek_daire) into v_cakisma, v_ornek
  from tahsis_munhasir_cakisma(p_proje_id, p_kapsam, p_munhasir) c;

  return jsonb_build_object(
    'yetki', true,
    'birim_sayi', coalesce(v_sayi, 0),
    'cakisma', coalesce(v_cakisma, 0) > 0,
    'ornek_daire', v_ornek
  );
end $$;

revoke execute on function tahsis_kapsam_ozet(uuid, jsonb, boolean) from public;
grant execute on function tahsis_kapsam_ozet(uuid, jsonb, boolean) to authenticated;
