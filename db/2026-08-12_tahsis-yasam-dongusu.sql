-- Tahsis Distribution Control Center — yaşam döngüsü + okuma katmanı.
-- Spec: docs/superpowers/specs/2026-08-12-tahsis-control-center-design.md
-- Rollback: db/2026-08-12_tahsis-yasam-dongusu_ROLLBACK.sql
-- GÜVENLİK INVARIANTI: görünürlük fonksiyonları CANLI semantiği korur (demo bypass + belge gate +
-- segment + birimler kapsamı), yalnız durum='aktif' + baslangic<=now() EKLER.

-- ==== 1) durum enum + lifecycle kolonları (idempotent) ====
do $$ begin
  if not exists (select 1 from pg_type where typname = 'tahsis_durum') then
    create type tahsis_durum as enum ('aktif','askida','kaldirildi');
  end if;
end $$;

alter table tahsis
  add column if not exists durum      tahsis_durum not null default 'aktif',  -- mevcut satırlar mantıksal 'aktif' (veri etkisi, doğru)
  add column if not exists created_by uuid references profiles(id),
  add column if not exists updated_at timestamptz,   -- BACKFILL YOK: NULL kalır (badge referansı baslangic'e düşer)
  add column if not exists updated_by uuid references profiles(id);

create index if not exists tahsis_durum_idx on tahsis(proje_id, durum);

-- ==== 2) TEK ORTAK kapsam predikatı (RLS + RPC üçü de bunu çağırır — drift kalkanı) ====
create or replace function birim_kapsaminda(
  p_birim_id uuid, p_blok_id uuid, p_tip_id uuid, p_kat int, p_tur text, p_kapsam jsonb
) returns boolean language sql immutable set search_path = public as $$
  select
        (coalesce(jsonb_array_length(p_kapsam->'bloklar'),0)  = 0 or p_blok_id::text  in (select jsonb_array_elements_text(p_kapsam->'bloklar')))
    and (coalesce(jsonb_array_length(p_kapsam->'tipler'),0)   = 0 or p_tip_id::text   in (select jsonb_array_elements_text(p_kapsam->'tipler')))
    and (coalesce(jsonb_array_length(p_kapsam->'katlar'),0)   = 0 or p_kat::text      in (select jsonb_array_elements_text(p_kapsam->'katlar')))
    and (coalesce(jsonb_array_length(p_kapsam->'turler'),0)   = 0 or p_tur            in (select jsonb_array_elements_text(p_kapsam->'turler')))
    and (coalesce(jsonb_array_length(p_kapsam->'birimler'),0) = 0 or p_birim_id::text in (select jsonb_array_elements_text(p_kapsam->'birimler')))
$$;

-- ==== 3) Görünürlük: CANLI semantiği KORU + durum='aktif' + baslangic<=now() EKLE + helper kullan ====
create or replace function emlakci_birim_gorebilir(
  p_birim_id uuid, p_proje_id uuid, p_blok_id uuid, p_tip_id uuid, p_kat integer, p_tur text
) returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select demo from proje where id = p_proje_id), false)
    or (
      (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
      and exists(
        select 1 from tahsis t
        where t.proje_id = p_proje_id
          and t.durum = 'aktif'
          and (t.baslangic is null or t.baslangic <= now())
          and (t.bitis is null or t.bitis > now())
          and (
            (t.hedef_tip = 'herkes'
              and (t.hedef_filtre->>'marka'    is null or current_marka()    = t.hedef_filtre->>'marka')
              and (t.hedef_filtre->>'il'       is null or current_il()       = t.hedef_filtre->>'il')
              and (t.hedef_filtre->>'ilce'     is null or current_ilce()     = t.hedef_filtre->>'ilce')
              and (t.hedef_filtre->>'uzmanlik' is null or current_uzmanlik() = t.hedef_filtre->>'uzmanlik'))
            or (t.hedef_tip = 'danisman' and t.hedef_id = auth.uid())
            or (t.hedef_tip = 'ofis' and t.hedef_id = current_ofis())
          )
          and birim_kapsaminda(p_birim_id, p_blok_id, p_tip_id, p_kat, p_tur, t.kapsam)
      )
    )
$$;

create or replace function emlakci_proje_tahsisli(p_proje_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select demo from proje where id = p_proje_id), false)
    or (
      (select belge_durumu from profiles where id = auth.uid()) = 'dogrulandi'
      and exists(
        select 1 from tahsis t
        where t.proje_id = p_proje_id
          and t.durum = 'aktif'
          and (t.baslangic is null or t.baslangic <= now())
          and (t.bitis is null or t.bitis > now())
          and (
            (t.hedef_tip = 'herkes'
              and (t.hedef_filtre->>'marka'    is null or current_marka()    = t.hedef_filtre->>'marka')
              and (t.hedef_filtre->>'il'       is null or current_il()       = t.hedef_filtre->>'il')
              and (t.hedef_filtre->>'ilce'     is null or current_ilce()     = t.hedef_filtre->>'ilce')
              and (t.hedef_filtre->>'uzmanlik' is null or current_uzmanlik() = t.hedef_filtre->>'uzmanlik'))
            or (t.hedef_tip = 'danisman' and t.hedef_id = auth.uid())
            or (t.hedef_tip = 'ofis' and t.hedef_id = current_ofis())
          )
      )
    )
$$;

-- ==== 4) Owner guard (RPC'ler security definer; sahibi olmayan p_proje_id sızmasın) ====
create or replace function _tahsis_proje_sahibi(p_proje_id uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists(select 1 from proje p join uretici u on u.id = p.uretici_id
                where p.id = p_proje_id and (u.sahip_id = auth.uid() or is_admin()))
$$;

-- ==== 5) tahsis_ozet: tahsis-merkezli stok sayacı + değişiklik (referans = updated_at ?? baslangic) ====
create or replace function tahsis_ozet(p_proje_id uuid)
returns table(tahsis_id uuid, musait int, opsiyonlu int, satildi int, toplam int, degisiklik int)
language sql stable security definer set search_path = public as $$
  select t.id,
    count(b.id) filter (where b.durum = 'musait')::int,
    count(b.id) filter (where b.durum in ('opsiyonlu','satis_beklemede'))::int,
    count(b.id) filter (where b.durum = 'satildi')::int,
    count(b.id)::int,
    coalesce((
      select count(*) from events e
      where e.proje_id = t.proje_id
        and e.tip in ('fiyat','opsiyon','satis')
        and e.created_at > coalesce(t.updated_at, t.baslangic)
        and exists (select 1 from birim bb where bb.id = e.birim_id
                    and birim_kapsaminda(bb.id, bb.blok_id, bb.tip_id, bb.kat, bb.tur::text, t.kapsam))
    ), 0)::int
  from tahsis t
  left join birim b on b.proje_id = t.proje_id
    and b.ana_birim_id is null
    and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
  where t.proje_id = p_proje_id and _tahsis_proje_sahibi(p_proje_id)
  group by t.id, t.proje_id, t.kapsam, t.updated_at, t.baslangic
$$;

-- ==== 6) stok_dagitim: stok-merkezli ters indeks (birim → onu satabilen AKTİF tahsisler) ====
create or replace function stok_dagitim(p_proje_id uuid)
returns table(birim_id uuid, daire_no text, blok_id uuid, kat int, birim_durum birim_durum,
              tahsis_id uuid, hedef_tip tahsis_hedef, hedef_id uuid, hedef_filtre jsonb,
              komisyon_tip komisyon_tip, komisyon_deger numeric, munhasir boolean)
language sql stable security definer set search_path = public as $$
  select b.id, b.daire_no, b.blok_id, b.kat, b.durum,
         t.id, t.hedef_tip, t.hedef_id, t.hedef_filtre, t.komisyon_tip, t.komisyon_deger, t.munhasir
  from birim b
  left join tahsis t on t.proje_id = b.proje_id
    and t.durum = 'aktif'
    and (t.baslangic is null or t.baslangic <= now())
    and (t.bitis is null or t.bitis > now())
    and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, t.kapsam)
  where b.proje_id = p_proje_id and b.ana_birim_id is null and _tahsis_proje_sahibi(p_proje_id)
$$;

-- ==== 7) tahsis_toplu: ATOMİK toplu lifecycle (invariant 2) + RETURNING audit (invariant 4) ====
-- p_aksiyon: 'askiya_al' | 'devam' | 'kaldir' | 'uzat'. Audit yalnız gerçekten değişen satırdan, eski/yeni.
create or replace function tahsis_toplu(p_proje_id uuid, p_ids uuid[], p_aksiyon text, p_gun int default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_say int; v_yeni tahsis_durum; v_actor uuid := auth.uid();
begin
  if not _tahsis_proje_sahibi(p_proje_id) then raise exception 'yetki yok'; end if;

  if p_aksiyon = 'uzat' then
    with hedef as (
      select id, bitis as eski_bitis,
             coalesce(bitis, now()) + make_interval(days => greatest(1, coalesce(p_gun,0))) as yeni_bitis
      from tahsis
      where id = any(p_ids) and proje_id = p_proje_id and durum <> 'kaldirildi'
      for update
    ),
    upd as (
      update tahsis t set bitis = h.yeni_bitis, updated_at = now(), updated_by = v_actor
      from hedef h where t.id = h.id
      returning t.id, h.eski_bitis, t.bitis as yeni_bitis
    ),
    ins as (
      insert into events(tip, profile_id, proje_id, payload)
      select 'tahsis', v_actor, p_proje_id,
             jsonb_build_object('aksiyon','uzat','tahsis_id',id,'gun',p_gun,
                                'eski', jsonb_build_object('bitis', eski_bitis),
                                'yeni', jsonb_build_object('bitis', yeni_bitis))
      from upd returning 1
    )
    select count(*) into v_say from ins;
    return v_say;
  end if;

  v_yeni := case p_aksiyon when 'askiya_al' then 'askida'::tahsis_durum
                           when 'devam'     then 'aktif'::tahsis_durum
                           when 'kaldir'    then 'kaldirildi'::tahsis_durum end;
  if v_yeni is null then raise exception 'gecersiz aksiyon: %', p_aksiyon; end if;

  with hedef as (
    select id, durum as eski_durum
    from tahsis
    where id = any(p_ids) and proje_id = p_proje_id
      and durum <> 'kaldirildi'   -- terminal koruması (invariant 1)
      and durum <> v_yeni         -- zaten hedef durumdaysa değişmez → event YOK
    for update
  ),
  upd as (
    update tahsis t set durum = v_yeni, updated_at = now(), updated_by = v_actor
    from hedef h where t.id = h.id
    returning t.id, h.eski_durum, t.durum as yeni_durum
  ),
  ins as (
    insert into events(tip, profile_id, proje_id, payload)
    select 'tahsis', v_actor, p_proje_id,
           jsonb_build_object('aksiyon', p_aksiyon, 'tahsis_id', id,
                              'eski', jsonb_build_object('durum', eski_durum),
                              'yeni', jsonb_build_object('durum', yeni_durum))
    from upd returning 1
  )
  select count(*) into v_say from ins;
  return v_say;
end $$;
