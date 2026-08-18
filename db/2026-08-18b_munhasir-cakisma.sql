-- 2026-08-18b — Münhasır tahsis kapsam çakışması tespiti (B4 / U-01, karar: uyar + açık override).
-- SORUN: münhasır tahsis rozet olarak gösteriliyor ama aynı birimlere paralel tahsis engellenmiyordu
-- → münhasırlık sessizce bozuluyordu. KARAR: çakışma tespit edilir; müteahhit uyarılır, bilinçli
-- override ile geçebilir (audit'e yazılır). Blok değil. Bu RPC tespit kaynağıdır (client pre-check +
-- server enforcement ikisi de çağırır). Çakışma = yeni kapsam ile mevcut AKTİF tahsis kapsamı ≥1 birim
-- paylaşıyor VE taraflardan biri münhasır. Owner-guard'lı. Browser SQL Editor'den uygula.

-- p_haric_id: düzenlemede kendini hariç tut (aksi halde tahsis kendisiyle çakışır sanır).
create or replace function tahsis_munhasir_cakisma(p_proje_id uuid, p_kapsam jsonb, p_munhasir boolean, p_haric_id uuid default null)
returns table(tahsis_id uuid, hedef_tip tahsis_hedef, hedef_id uuid, munhasir boolean, ornek_daire text)
language sql stable security definer set search_path = public as $$
  select t.id, t.hedef_tip, t.hedef_id, t.munhasir,
    ( select b.daire_no from birim b
      where b.proje_id = p_proje_id and b.ana_birim_id is null
        and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, p_kapsam)
        and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
      limit 1 ) as ornek_daire
  from tahsis t
  where t.proje_id = p_proje_id
    and t.durum = 'aktif'
    and (t.bitis is null or t.bitis > now())
    and (p_haric_id is null or t.id <> p_haric_id)   -- düzenlemede kendini hariç tut
    and (p_munhasir or t.munhasir)          -- münhasırlık taraflardan en az birinde
    and _tahsis_proje_sahibi(p_proje_id)     -- yalnız proje sahibi/admin sorgular
    and exists (
      select 1 from birim b
      where b.proje_id = p_proje_id and b.ana_birim_id is null
        and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, p_kapsam)
        and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
    );
$$;
revoke execute on function tahsis_munhasir_cakisma(uuid, jsonb, boolean, uuid) from public;
grant execute on function tahsis_munhasir_cakisma(uuid, jsonb, boolean, uuid) to authenticated;
