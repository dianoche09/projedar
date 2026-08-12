# Tahsis Distribution Control Center — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut granüler tahsis motoruna operasyonel kontrol katmanı ekle: yaşam döngüsü (düzenle/askıya al/soft-kaldır/toplu) + stok-merkezli ters görünüm, `/uretici/tahsis`'i tek yönetim otoritesi yaparak.

**Architecture:** DB'de `tahsis.durum` enum + audit (events tip='tahsis') + tek `birim_kapsaminda()` predikatı (RLS ve iki okuma-RPC'si onu paylaşır). Server actions edit-in-place + atomik toplu-RPC. UI: `/uretici/tahsis` iki mercekli Control Center; `proje/[id]` salt-okunur özet + deep-link.

**Tech Stack:** Next.js App Router (server actions), Supabase Postgres + RLS, Zod, TypeScript strict. Test/deploy = Supabase Management API (bash curl), `npx tsc --noEmit`.

**Spec:** `docs/superpowers/specs/2026-08-12-tahsis-control-center-design.md` (invariantlar §8b).

---

## Ön koşullar (yer gerçeği — koddan doğrulandı 2026-08-12)

- **Migration/SQL uygulama = Management API bash** (browser değil): `REF=svksxtirsbwawvmnojps`; token `printenv SUPABASE_ACCESS_TOKEN` (shell'de export'lu, `.env` OKUMA). Uygulama:
  ```bash
  REF="svksxtirsbwawvmnojps"
  jq -Rs '{query: .}' < db/DOSYA.sql | curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" -d @-
  ```
  DDL başarı = `[]`. SELECT = JSON array. **Token'ı ASLA echo etme.**
- **Proje test/JS harness'ı YOK** (sadece dev/build/lint). Bu yüzden DB/RLS testi = transactional SQL script (Management API'den koşulur); action/UI doğrulama = `npx tsc --noEmit` + canlı QA. Uydurma `vitest`/`pytest` komutu yazma.
- **Audit event NET YENİ:** `OlayTip` union'ında 'tahsis' YOK (mevcut `tip:"tahsis"` bir *bildirim* tipiydi). `events.tip` `text` olduğundan DB enum değişmez; TS union'a eklenir.
- **Canlı görünürlük fonksiyonları** `demo` proje bypass + `belge_durumu='dogrulandi'` gate + segment filtre (`current_marka/il/ilce/uzmanlik`) + `birimler` kapsamı içerir. Migration bunları KORUR, yalnız `durum='aktif'` + `baslangic<=now()` EKLER.
- **Enum değerleri:** `birim_durum` = musait,opsiyonlu,satis_beklemede,satildi,stop,planli,kiralandi · `tahsis_hedef` = herkes,ofis,danisman · eklenti = `birim.ana_birim_id` dolu (ana stoka girmez).

## Dosya haritası

- `db/2026-08-12_tahsis-yasam-dongusu.sql` — CREATE: enum+kolon+`birim_kapsaminda`+RLS refactor+`tahsis_ozet`+`stok_dagitim`+`tahsis_toplu`.
- `db/2026-08-12_tahsis-rls_TEST.sql` — transactional RLS/durum test script (rollback'li).
- `src/lib/events.ts` — MODIFY: `OlayTip`'e `'tahsis'` ekle.
- `src/lib/tahsis.ts` — MODIFY: `tahsisOzetGetir`, `stokDagitimGetir` RPC fetcher'ları.
- `src/app/uretici/actions.ts` — MODIFY: `tahsisGuncelle`, `tahsisDurumGuncelle`, `tahsisTopluAksiyon`; `tahsisSil` demote (yorum).
- `src/app/uretici/tahsis/page.tsx` — REWRITE: Control Center (iki mercek + `?proje=`).
- `src/app/uretici/tahsis/_components/` — CREATE: `PerspektifToggle.tsx`, `TahsisMercek.tsx`, `StokMercek.tsx`, `TopluBar.tsx`, `TahsisDuzenleModal.tsx`.
- `src/app/uretici/proje/[id]/page.tsx` — MODIFY: TAHSİS section → özet + link (inline form/sil kaldır).

---

## Task 1: Migration — şema + helper + RLS refactor + RPC'ler

**Files:**
- Create: `db/2026-08-12_tahsis-yasam-dongusu.sql`

- [ ] **Step 1: Migration dosyasını yaz**

`db/2026-08-12_tahsis-yasam-dongusu.sql`:

```sql
-- ==== 1) durum enum + lifecycle kolonları (idempotent) ====
do $$ begin
  if not exists (select 1 from pg_type where typname = 'tahsis_durum') then
    create type tahsis_durum as enum ('aktif','askida','kaldirildi');
  end if;
end $$;

alter table tahsis
  add column if not exists durum      tahsis_durum not null default 'aktif',
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

-- ==== 4) Owner guard yardımcısı (RPC'ler security definer; sahibi olmayan p_proje_id sızmasın) ====
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
-- p_aksiyon: 'askiya_al' | 'devam' | 'kaldir' | 'uzat'. p_gun yalnız 'uzat'ta.
-- Audit YALNIZ gerçekten değişen satırdan (UPDATE...RETURNING), eski/yeni değerle. "Update sonrası tekrar oku" YASAK.
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

  -- INVARIANT 1 (kaldirildi terminal: devam onu diriltemez) + INVARIANT 4 (yalnız değişen satır, eski/yeni)
  with hedef as (
    select id, durum as eski_durum
    from tahsis
    where id = any(p_ids) and proje_id = p_proje_id
      and durum <> 'kaldirildi'   -- terminal koruması
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
```

- [ ] **Step 2: Statik denetle (bloklayıcı yok mu), sonra uygula**

Run:
```bash
REF="svksxtirsbwawvmnojps"
jq -Rs '{query: .}' < "db/2026-08-12_tahsis-yasam-dongusu.sql" | curl -s -X POST \
  "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" -d @-
```
Expected: `[]` (DDL başarı). Hata dönerse SQL'i düzelt, tekrar koş.

- [ ] **Step 3: Kolon + fonksiyon varlığını doğrula**

Run:
```bash
REF="svksxtirsbwawvmnojps"
printf "%s" "select count(*) filter (where column_name in ('durum','created_by','updated_at','updated_by')) as yeni_kolon from information_schema.columns where table_name='tahsis';" \
 | jq -Rs '{query:.}' | curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
   -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" -d @-
```
Expected: `[{"yeni_kolon":4}]`

- [ ] **Step 4: Commit**

```bash
git add db/2026-08-12_tahsis-yasam-dongusu.sql
git commit -m "feat(tahsis): durum lifecycle + birim_kapsaminda helper + RLS refactor + RPCs (migration)"
```

---

## Task 2: DB/RLS test script (UI'DAN ÖNCE — güvenlik çekirdeği)

**Files:**
- Create: `db/2026-08-12_tahsis-rls_TEST.sql`

Amaç: `durum` görünürlüğün anahtarı olduğunu ve kapsam mantığının RLS ile tutarlı olduğunu DB seviyesinde kanıtla. Transactional + `rollback` (canlı veriyi bozmaz). RLS simülasyonu: `request.jwt.claims` + `set local role authenticated`.

- [ ] **Step 1: Test script'ini yaz**

`db/2026-08-12_tahsis-rls_TEST.sql`:

İki katman test: **A) predicate** (function çağrısı) + **B) gerçek RLS** (`set local role authenticated` + `SELECT birim`). B, policy'nin doğru overload'ı çağırdığını da kanıtlar. Test birimi MUTLAKA seçilen tahsisin `birim_kapsaminda()` kapsamından seçilir (aksi halde false-alarm).

```sql
-- Rollback'li: doğrulanmış emlakçı + AKTİF tüm-ağ (herkes, filtresiz) tahsis + KAPSAM-İÇİ birim.
-- durum=aktif → görünür; askida/kaldirildi → görünmez. Hem predicate hem gerçek RLS SELECT.
begin;
do $$
declare
  v_emlakci uuid; v_proje uuid; v_kapsam jsonb; v_tahsis uuid;
  v_birim uuid; v_blok uuid; v_tip uuid; v_kat int; v_tur text;
  v_claims text; v_gorunur boolean;
begin
  select t.id, t.proje_id, t.kapsam into v_tahsis, v_proje, v_kapsam
    from tahsis t join proje p on p.id = t.proje_id
    where t.durum='aktif' and t.hedef_tip='herkes' and coalesce(t.hedef_filtre,'{}')='{}'
      and coalesce(p.demo,false)=false
    limit 1;
  select id into v_emlakci from profiles where rol='emlakci' and belge_durumu='dogrulandi' and durum='aktif' limit 1;
  -- BİRİM: tahsisin kapsamı içinde OLMALI (aksi halde 'görünmüyor' assert'i yanlış alarm)
  select b.id, b.blok_id, b.tip_id, b.kat, b.tur::text
    into v_birim, v_blok, v_tip, v_kat, v_tur
    from birim b
    where b.proje_id = v_proje and b.ana_birim_id is null
      and birim_kapsaminda(b.id, b.blok_id, b.tip_id, b.kat, b.tur::text, v_kapsam)
    limit 1;
  if v_tahsis is null or v_birim is null or v_emlakci is null then
    raise notice 'ATLA: uygun aktif/tüm-ağ tahsis + kapsam-içi birim + doğrulanmış emlakçı yok'; return;
  end if;
  v_claims := json_build_object('sub', v_emlakci, 'role','authenticated')::text;
  perform set_config('request.jwt.claims', v_claims, true);

  -- ===== A. PREDICATE (function) =====
  assert emlakci_birim_gorebilir(v_birim, v_proje, v_blok, v_tip, v_kat, v_tur) = true,
         'FAIL A: aktif tahsiste predicate false';

  -- ===== B. GERÇEK RLS SELECT (policy + doğru overload) =====
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_gorunur;
  reset role;
  assert v_gorunur = true, 'FAIL B: aktif tahsiste SELECT birim GÖRÜNMÜYOR';

  update tahsis set durum='askida' where id = v_tahsis;   -- service role (RLS bypass)
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_gorunur;
  reset role;
  assert v_gorunur = false, 'FAIL B: askıda tahsiste SELECT birim SIZIYOR (RLS)';

  update tahsis set durum='kaldirildi' where id = v_tahsis;
  set local role authenticated;
  select exists(select 1 from birim where id = v_birim) into v_gorunur;
  reset role;
  assert v_gorunur = false, 'FAIL B: kaldirildi tahsiste SELECT birim görünüyor';

  raise notice 'PASS: predicate + gerçek RLS — aktif görünür; askida/kaldirildi görünmez';
end $$;
rollback;
```

Not (uygulayıcı): `set local role authenticated` + `reset role` DO bloğunda çalışmazsa (privilege), B bölümünü ayrı düz SQL statement'ları olarak koş (her biri kendi `set local role` + `SELECT` + assert). `request.jwt.claims` transaction-local (set_config true).

- [ ] **Step 2: Migration ÖNCE davranışı doğrula (regresyon guard mantığı)**

Not: Bu script `durum` kolonuna bağlı; Task 1 uygulanmadan koşulursa "column durum does not exist" hatası verir = beklenen kırmızı. Task 1 sonrası koşulur.

- [ ] **Step 3: Test'i koş (yeşil)**

Run:
```bash
REF="svksxtirsbwawvmnojps"
jq -Rs '{query: .}' < "db/2026-08-12_tahsis-rls_TEST.sql" | curl -s -X POST \
  "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json" -d @-
```
Expected: hata YOK (assert geçti). `[]` veya notice döner. `FAIL:` içeren exception dönerse RLS refactor'ında hata var → Task 1 fonksiyonlarını düzelt.

- [ ] **Step 4: Commit**

```bash
git add db/2026-08-12_tahsis-rls_TEST.sql
git commit -m "test(tahsis): RLS durum-görünürlük transactional test script'i"
```

---

## Task 3: OlayTip'e 'tahsis' ekle (audit event tipi)

**Files:**
- Modify: `src/lib/events.ts:8-25`

- [ ] **Step 1: Union'a 'tahsis' ekle**

`src/lib/events.ts`, `OlayTip` union'ında `"kurucu";` satırından önce ekle:

```ts
  | "tahsis" // üretici: tahsis lifecycle audit (olustur/guncelle/askiya_al/devam/kaldir; payload eski/yeni)
  | "kurucu"; // lansman popup: kurucu üyelik e-posta yakalama (anonim; ticari e-ileti onaylı)
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: hata yok (yalnız union genişledi).

- [ ] **Step 3: Commit**

```bash
git add src/lib/events.ts
git commit -m "feat(events): OlayTip'e tahsis lifecycle audit tipi"
```

---

## Task 4: Server actions — güncelle / durum / toplu + tahsisSil demote

**Files:**
- Modify: `src/app/uretici/actions.ts` (tahsisEkle sonrası, tahsisSil civarı ~1093-1233)

Not: Mevcut `hataya(path,msg)`, `basariya(path,formData,msg)`, `UUID_RE`, `zUuid`, `kayitYaz`, `createClient` helper'ları dosyada mevcut (import'lu). `tahsisEkle` desenini birebir izle.

- [ ] **Step 1: `tahsisGuncelle` yaz (edit-in-place, hedef dahil)**

`tahsisSil`'den ÖNCE ekle:

```ts
// ── Tahsis düzenle (edit-in-place; hedef dahil). Tek satır = tek alıcı. ──
export async function tahsisGuncelle(formData: FormData) {
  const tahsis_id = String(formData.get("tahsis_id"));
  const proje_id = String(formData.get("proje_id"));
  if (!UUID_RE.test(tahsis_id) || !UUID_RE.test(proje_id)) hataya("/uretici", "Geçersiz kayıt");
  const geri = `/uretici/tahsis?proje=${proje_id}`;

  const supabase = await createClient();
  const { data: eski } = await supabase.from("tahsis")
    .select("hedef_tip, hedef_id, hedef_filtre, kapsam, komisyon_tip, komisyon_deger, munhasir, kontenjan, fiyat_gorunur, bitis")
    .eq("id", tahsis_id).single();
  if (!eski) hataya(geri, "Tahsis bulunamadı");

  // HEDEF (tek): tum_ag | segment | ofis(tek) | danisman(tek)
  const modu = String(formData.get("hedef_modu") ?? "tum_ag");
  let hedef_tip: "herkes" | "ofis" | "danisman" = "herkes";
  let hedef_id: string | null = null;
  let hedef_filtre: Record<string, string> | null = null;
  if (modu === "segment") {
    const f: Record<string, string> = {};
    for (const k of ["marka", "il", "ilce", "uzmanlik"]) {
      const v = String(formData.get(`f_${k}`) ?? "").trim();
      if (v) f[k] = v;
    }
    if (Object.keys(f).length === 0) hataya(geri, "Segment için en az bir filtre seç");
    hedef_filtre = f;
  } else if (modu === "ofis") {
    const id = String(formData.get("ofis_id") ?? "");
    if (!UUID_RE.test(id)) hataya(geri, "Ofis seç");
    hedef_tip = "ofis"; hedef_id = id;
  } else if (modu === "danisman") {
    const id = String(formData.get("emlakci_id") ?? "");
    if (!UUID_RE.test(id)) hataya(geri, "Danışman seç");
    hedef_tip = "danisman"; hedef_id = id;
  }

  // KAPSAM
  const kapsam: Record<string, string[]> = {};
  if (String(formData.get("kapsam_tip")) === "belirli") {
    const al = (k: string) => formData.getAll(k).map(String).filter(Boolean);
    for (const k of ["bloklar", "katlar", "tipler", "turler", "birimler"]) {
      const v = al(k); if (v.length) kapsam[k] = v;
    }
  }

  // ŞARTLAR
  const kom = String(formData.get("komisyon_deger") ?? "").trim();
  const kot = String(formData.get("kontenjan") ?? "").trim();
  const komisyon_tip = String(formData.get("komisyon_tip") ?? "yuzde") as "yuzde" | "sabit" | "yok";
  const sureRaw = String(formData.get("bitis_gun") ?? "").trim();
  const sureNum = sureRaw ? Number(sureRaw) : NaN;
  const bitis = Number.isFinite(sureNum) && sureNum > 0 && sureNum <= 3650
    ? new Date(Date.now() + sureNum * 86_400_000).toISOString() : null;

  const yeni = {
    hedef_tip, hedef_id, hedef_filtre, kapsam,
    komisyon_tip,
    komisyon_deger: kom === "" ? null : Number(kom),
    munhasir: formData.get("munhasir") === "on",
    kontenjan: kot === "" ? null : Number(kot),
    fiyat_gorunur: formData.get("fiyat_gorunur") === "on",
    bitis,
    updated_at: new Date().toISOString(),
    updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  };

  const { error } = await supabase.from("tahsis").update(yeni).eq("id", tahsis_id);
  if (error) hataya(geri, error.message);

  await kayitYaz({ tip: "tahsis", projeId: proje_id, payload: { aksiyon: "guncelle", tahsis_id, eski, yeni } });
  revalidatePath(geri);
  basariya(geri, formData, "Tahsis güncellendi");
}
```

- [ ] **Step 2: `tahsisDurumGuncelle` yaz (askıya/devam/soft-kaldır; kaldirildi terminal)**

```ts
// ── Tek tahsis durum geçişi. kaldirildi TERMINAL (devam ile dirilmez). ──
export async function tahsisDurumGuncelle(formData: FormData) {
  const tahsis_id = String(formData.get("tahsis_id"));
  const proje_id = String(formData.get("proje_id"));
  const yeni_durum = String(formData.get("yeni_durum")) as "aktif" | "askida" | "kaldirildi";
  if (!UUID_RE.test(tahsis_id) || !["aktif", "askida", "kaldirildi"].includes(yeni_durum)) return;
  const geri = `/uretici/tahsis?proje=${proje_id}`;
  const supabase = await createClient();

  const { data: mevcut } = await supabase.from("tahsis").select("durum").eq("id", tahsis_id).single();
  if (!mevcut) return;
  if (mevcut.durum === "kaldirildi") hataya(geri, "Kaldırılmış tahsis yeniden aktifleştirilemez; yeni tahsis oluştur.");

  const { error } = await supabase.from("tahsis")
    .update({ durum: yeni_durum, updated_at: new Date().toISOString(), updated_by: (await supabase.auth.getUser()).data.user?.id ?? null })
    .eq("id", tahsis_id);
  if (error) hataya(geri, error.message);

  await kayitYaz({ tip: "tahsis", projeId: proje_id, payload: {
    aksiyon: yeni_durum === "askida" ? "askiya_al" : yeni_durum === "aktif" ? "devam" : "kaldir",
    tahsis_id, eski: { durum: mevcut.durum }, yeni: { durum: yeni_durum },
  } });
  revalidatePath(geri);
  basariya(geri, formData, yeni_durum === "askida" ? "Askıya alındı" : yeni_durum === "kaldirildi" ? "Kaldırıldı" : "Yeniden aktif");
}
```

- [ ] **Step 3: `tahsisTopluAksiyon` yaz (ATOMİK — RPC çağırır)**

```ts
// ── Toplu lifecycle — ATOMİK (DB RPC tahsis_toplu; update+audit tek transaction). Invariant 2. ──
export async function tahsisTopluAksiyon(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const aksiyon = String(formData.get("aksiyon")); // askiya_al|devam|kaldir|uzat
  const ids = formData.getAll("tahsis_ids").map(String).filter((s) => UUID_RE.test(s));
  const gunRaw = String(formData.get("gun") ?? "").trim();
  const geri = `/uretici/tahsis?proje=${proje_id}`;
  if (!UUID_RE.test(proje_id) || ids.length === 0) hataya(geri, "Seçim yok");
  if (!["askiya_al", "devam", "kaldir", "uzat"].includes(aksiyon)) hataya(geri, "Geçersiz aksiyon");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tahsis_toplu", {
    p_proje_id: proje_id, p_ids: ids, p_aksiyon: aksiyon, p_gun: gunRaw ? Number(gunRaw) : null,
  });
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  basariya(geri, formData, `${data ?? 0} tahsis güncellendi`);
}
```

- [ ] **Step 4: `tahsisSil`'i demote et (yorum ekle)**

`tahsisSil` fonksiyonunun üstüne yorum ekle (silme, normal UI'dan çağrılmaz; yalnız administrative cleanup):

```ts
// ⚠️ HARD DELETE — normal kullanıcı akışından ÇIKARILDI (kullanıcıya görünen "Kaldır" = tahsisDurumGuncelle('kaldirildi')).
// Yalnız administrative cleanup / veri bütünlüğü istisnası. UI'da buton bağlanmaz.
export async function tahsisSil(formData: FormData) {
```

- [ ] **Step 4b: `tahsisEkle` → yeni kayıtlarda `created_by` doldur (invariant 5)**

Mevcut `tahsisEkle` içindeki `supabase.from("tahsis").insert(...)` ÖNCESİNDE actor id al, insert'lenen her satıra `created_by` ekle:

```ts
  const actorId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const { error } = await supabase.from("tahsis").insert(
    alicilar.map((a) => ({
      proje_id,
      created_by: actorId,   // ← EKLE (yeni kayıtlar dolu; mevcut kayıtlar NULL kalır = doğru)
      hedef_tip: a.hedef_tip,
      hedef_id: a.hedef_id,
      hedef_filtre: a.hedef_filtre,
      kapsam,
      komisyon_tip: terim.komisyon_tip,
      komisyon_deger: terim.komisyon_deger,
      munhasir: terim.munhasir,
      kontenjan: terim.kontenjan,
      fiyat_gorunur: terim.fiyat_gorunur,
      bitis,
    })),
  );
```

- [ ] **Step 5: Type-check + commit**

Run: `npx tsc --noEmit`
Expected: hata yok.
```bash
git add src/app/uretici/actions.ts
git commit -m "feat(tahsis): tahsisGuncelle + durum geçişi + atomik toplu aksiyon; tahsisSil demote"
```

---

## Task 5: RPC fetcher'ları (`src/lib/tahsis.ts`)

**Files:**
- Modify: `src/lib/tahsis.ts`

- [ ] **Step 1: Fetcher tiplerini + fonksiyonları ekle**

`src/lib/tahsis.ts` sonuna:

```ts
import { createClient } from "@/lib/supabase/server";

export type TahsisOzet = { tahsis_id: string; musait: number; opsiyonlu: number; satildi: number; toplam: number; degisiklik: number };
export type StokDagitimSatir = {
  birim_id: string; daire_no: string | null; blok_id: string | null; kat: number | null; birim_durum: string;
  tahsis_id: string | null; hedef_tip: "herkes" | "ofis" | "danisman" | null; hedef_id: string | null;
  hedef_filtre: Record<string, string> | null; komisyon_tip: string | null; komisyon_deger: number | null; munhasir: boolean | null;
};

/** tahsis-merkezli stok sayacı + değişiklik (RPC tahsis_ozet). tahsis_id → özet map. */
export async function tahsisOzetGetir(projeId: string): Promise<Map<string, TahsisOzet>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("tahsis_ozet", { p_proje_id: projeId });
  return new Map(((data ?? []) as TahsisOzet[]).map((r) => [r.tahsis_id, r]));
}

/** stok-merkezli ters indeks (RPC stok_dagitim). Ham satırlar (UI birim'e göre gruplar). */
export async function stokDagitimGetir(projeId: string): Promise<StokDagitimSatir[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("stok_dagitim", { p_proje_id: projeId });
  return (data ?? []) as StokDagitimSatir[];
}
```

- [ ] **Step 2: Type-check + commit**

Run: `npx tsc --noEmit`
```bash
git add src/lib/tahsis.ts
git commit -m "feat(tahsis): tahsis_ozet + stok_dagitim RPC fetcher'ları"
```

---

## Task 6: Control Center — tahsis merceği (`/uretici/tahsis` yeniden yazımı)

**Files:**
- Modify: `src/app/uretici/tahsis/page.tsx`
- Create: `src/app/uretici/tahsis/_components/PerspektifToggle.tsx`, `TopluBar.tsx`, `TahsisDuzenleModal.tsx`

Not: Mevcut `page.tsx` görsel dili (kart/rozet/KPI/`tbl` sınıfları) KORUNUR — yalnızca (a) `durum` rozeti + stok sayaç/değişiklik rozeti + lifecycle aksiyonları + `updated_at/by` satırı eklenir, (b) checkbox + `TopluBar`, (c) `?proje=` filtresi, (d) perspektif toggle. `tahsisOzetGetir` ile sayaçlar basılır. `tahsisSil` form'u KALDIRILIR; yerine Düzenle / Askıya al / Devam / Kaldır (durum'a göre) aksiyonları (`tahsisDurumGuncelle` + `tahsisGuncelle`).

- [ ] **Step 1: `PerspektifToggle.tsx` (client)**

```tsx
"use client";
export function PerspektifToggle({ aktif }: { aktif: "tahsis" | "stok" }) {
  const base = "px-3.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors";
  return (
    <div className="inline-flex gap-1 rounded-xl border border-[var(--cizgi)] bg-card p-1">
      <a href="?" className={`${base} ${aktif === "tahsis" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}>Tahsis-merkezli</a>
      <a href="?m=stok" className={`${base} ${aktif === "stok" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}>Stok-merkezli</a>
    </div>
  );
}
```
Not: `?proje=` mevcutsa toggle onu korumalı — page linkler `?proje=X` + `&m=stok` olarak üretir (page'de `searchParams`'tan kur).

- [ ] **Step 2: page.tsx — searchParams (`proje`, `m`) oku, veri çek, durum/sayaç/aksiyon ekle**

Anahtar mantık (mevcut `UreticiTahsis` server component'ini uyarla):
- `searchParams: { proje?: string; m?: string }` al. `proje` varsa `.eq("proje_id", proje)` filtrele. `m==='stok'` → StokMercek (Task 7), yoksa tahsis merceği.
- `tahsis` select'ine `durum, updated_at, updated_by, created_at` ekle.
- Her proje için `tahsisOzetGetir(projeId)` ile sayaçları çek (proje filtresi yoksa görünen projeler için).
- Satır rozetleri: `durum` (aktif=teal, askida=amber "Askıda", kaldirildi=gri "Kaldırıldı"), süresi-dolacak (aktif + `bitis` < now+7g → amber "N gün kaldı"), stok sayaç (`42 · 3 · 5`), değişiklik (`degisiklik>0` → "↑N değişti · son yönetimden beri").
- Aksiyonlar (durum'a göre): `aktif` → Düzenle · Askıya al · Kaldır; `askida` → Düzenle · Devam · Kaldır; `kaldirildi` → (aksiyon yok, soluk).
- Askıya al/Devam/Kaldır = küçük `form action={tahsisDurumGuncelle}` (hidden tahsis_id/proje_id/yeni_durum). Düzenle → `TahsisDuzenleModal` açar.
- KPI şeridine ekle: `Askıda` (durum='askida' say), `Süresi dolacak` (aktif + bitis<7g say).
- Her satır checkbox `name="tahsis_ids"` → `TopluBar` (Task içi Step 4) sarmalayan `<form action={tahsisTopluAksiyon}>`.

Tam kod: mevcut `page.tsx`'i temel al; yukarıdaki alanları ekle. (Görsel sınıflar birebir mevcut dosyadan.)

- [ ] **Step 3: `TahsisDuzenleModal.tsx` — mevcut TahsisForm alanlarını prefill + `tahsisGuncelle`**

`TahsisForm`'un alan setini (hedef tek-seçim + kapsam + gelişmiş şartlar) prefill değerleriyle `tahsisGuncelle` action'ına bağlar. Hidden `tahsis_id`. Hedef edit tek hedef (segment/ofis-tek/danisman-tek/tum_ag). Detay: `TahsisHedef.tsx` desenini tek-seçim varyantıyla uyarla.

- [ ] **Step 4: `TopluBar.tsx` (client) — seçili sayısı + aksiyon**

```tsx
"use client";
import { useState } from "react";
export function TopluBar({ projeId }: { projeId: string }) {
  const [n, setN] = useState(0);
  // Sayfa yüklendiğinde ve checkbox değişiminde name="tahsis_ids":checked say
  return null; // iskelet — page'de <form action={tahsisTopluAksiyon}> içine gömülür; seçili>0 iken sticky bar
}
```
Not: Basit tutmak için: checkbox'lar `<form action={tahsisTopluAksiyon}>` içinde; sticky alt bar `hidden name="aksiyon"` butonları (Askıya al / Devam / Kaldır / Uzat+gün). Seçili sayısı client state ile gösterilir.

- [ ] **Step 5: Type-check + canlı QA + commit**

Run: `npx tsc --noEmit`
Canlı QA (üretici oturumu): `/uretici/tahsis` → durum rozetleri + sayaçlar görünüyor; bir tahsisi Askıya al → satır "Askıda"; Devam → "aktif"; 2 seç → toplu Askıya al → ikisi askıda.
```bash
git add src/app/uretici/tahsis/
git commit -m "feat(tahsis): Control Center tahsis merceği — durum/sayaç/lifecycle/toplu"
```

---

## Task 7: Control Center — stok merceği (ters görünüm)

**Files:**
- Create: `src/app/uretici/tahsis/_components/StokMercek.tsx`
- Modify: `src/app/uretici/tahsis/page.tsx` (m==='stok' dalı)

- [ ] **Step 1: `StokMercek.tsx` — birim → satabilenler + şart**

`stokDagitimGetir(projeId)` satırlarını `birim_id`'ye göre grupla. Her birim: `daire_no · blok · kat` + durum rozeti (müsait/opsiyonlu/satıldı) + "kim satabiliyor": her covering tahsis için hedef rozeti (hedef_filtre/ofis/danışman metni; `tahsis/page.tsx`'teki `hedefMetin` mantığını yeniden kullan) + komisyon; birimi kapsayan tahsis yoksa "kimse görmüyor" amber. Blok bazında `<details>` grupla (uzun liste). Her covering tahsis satırında "Düzenle →" (o tahsis id'siyle `TahsisDuzenleModal`).

- [ ] **Step 2: page.tsx'te m==='stok' → StokMercek render**

`proje` seçili değilse: "Ters görünüm için önce bir proje seç" + proje listesi (link `?proje=X&m=stok`). Seçiliyse `StokMercek projeId={proje}`.

- [ ] **Step 3: Type-check + canlı QA + commit**

Run: `npx tsc --noEmit`
Canlı QA: `/uretici/tahsis?proje=<id>&m=stok` → daireler + her birinin satabilenleri + şart; askıya alınmış tahsis burada da görünmez (stok_dagitim durum='aktif' filtreli).
```bash
git add src/app/uretici/tahsis/
git commit -m "feat(tahsis): Control Center stok merceği (ters görünüm birim→satabilenler)"
```

---

## Task 8: proje/[id] downgrade (özet + deep-link)

**Files:**
- Modify: `src/app/uretici/proje/[id]/page.tsx:202-267` (TAHSİS section)

- [ ] **Step 1: TAHSİS section'ı özet karta indir**

Mevcut TAHSİS `<section>` (satır listesi + `tahsisSil` form + inline `TahsisForm`) yerine salt-okunur özet. `tahsisOzetGetir(id)` + aktif tahsis sayımından üret:

```tsx
{/* ===== DAĞITIM (özet + Control Center'a deep-link) ===== */}
<section className="mt-12 border-t border-hair pt-8">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h2 className="font-display text-lg font-semibold text-ink">Dağıtım</h2>
      <p className="mt-1 text-sm text-gray">
        {ofisSay} ofis · {danismanSay} danışman · {dagitimda}/{toplamBirim} birim dağıtımda
      </p>
    </div>
    <Link href={`/uretici/tahsis?proje=${id}`} className="btn-action h-9 px-3.5 text-[12px]">
      Tahsisleri Yönet →
    </Link>
  </div>
</section>
```

`ofisSay`/`danismanSay` = aktif tahsislerden distinct (mevcut `tahsisler` select'ine `durum` ekle, `durum='aktif'` filtrele); `dagitimda`/`toplamBirim` = `tahsisOzetGetir` toplamından veya birim sayımından. `TahsisForm`, `tahsisSil` importları ve kullanımları KALDIRILIR.

- [ ] **Step 2: Kullanılmayan import temizle (tahsisSil, TahsisForm, tahsisEmlakcilari, tahsisSecenekleri gerekmiyorsa)**

`npx eslint src/app/uretici/proje/[id]/page.tsx` → unused import uyarısı kalmasın (Zero-Tolerance: no unused imports).

- [ ] **Step 3: Type-check + canlı QA + commit**

Run: `npx tsc --noEmit`
Canlı QA: `/uretici/proje/<id>` → tahsis düzenlemesi YOK, sadece özet + "Tahsisleri Yönet →" → `/uretici/tahsis?proje=<id>` doğru açılıyor.
```bash
git add src/app/uretici/proje/[id]/page.tsx
git commit -m "feat(tahsis): proje detayı tahsis bloğu → salt-okunur özet + Control Center deep-link"
```

---

## Task 9: E2E / kabul + kapanış

- [ ] **Step 1: Kabul kriterleri (canlı, üretici oturumu)**

- Tahsis düzenle (hedef dahil) → kaydet → emlakçı görünürlüğü değişir (ikinci tarayıcıda doğrulanmış emlakçıyla spot-check).
- Askıya al → emlakçıda kaybolur; Devam → geri gelir.
- Kaldır → soft (durum='kaldirildi'); "Devam" seçeneği çıkmaz (terminal).
- Toplu: 3 seç → askıya al → 3 askıda; DB'de 3 audit event (`select count(*) from events where tip='tahsis' and payload->>'aksiyon'='askiya_al'`).
- Stok mercek: bir daire → satabilenler + şart; RLS ile tutarlı.
- proje/[id] tahsis düzenlemez; deep-link doğru.
- Değişiklik rozeti etiketli ("son yönetimden beri"); hardcoded 7-gün yok.

- [ ] **Step 2: Invariant doğrulama (DB)**

Run (Management API): `tahsis_toplu(..., 'devam')` bir `kaldirildi` id'de → o satır değişmez (row_count'a girmez). `updated_at` yalnız lifecycle aksiyonunda değişir (fiyat/opsiyon event'i tahsis.updated_at'ı DEĞİŞTİRMEZ — tahsis tablosunda generic updated_at trigger'ı YOK, doğrula: `select tgname from pg_trigger where tgrelid='tahsis'::regclass`).

- [ ] **Step 3: type-check (tam) + changelog + kapanış commit**

Run: `npx tsc --noEmit`
Changelog memory'sine entry ekle (`projedar_changelog.md`).
```bash
git add -A && git commit -m "chore(tahsis): Control Center kabul testleri geçti + changelog"
```

---

## Self-review notları (plan→spec kapsam)

- Spec §1 şema → Task 1 ✅ · §2 RLS → Task 1+2 ✅ · §3 event ayrımı → Task 3 (audit) + tahsis_ozet fiyat/opsiyon/satis kaynağı ✅ · §4 actions → Task 4 ✅ · §5 RPC/helper → Task 1+5 ✅ · §6 UI iki mercek → Task 6+7 ✅ · §7 downgrade → Task 8 ✅ · §8+§8b kabul/invariant → Task 2 + Task 9 ✅ · §9 kapsam dışı korunuyor (funnel/feed/kampanya yok).
- Açık nokta (uygulayıcı dikkat): `TahsisDuzenleModal` hedef tek-seçim varyantı `TahsisHedef.tsx`'ten türetilir (mevcut çoklu-seçim değil). UI görsel detayları mevcut `tahsis/page.tsx` + `TahsisForm.tsx` desenlerinden alınır (bu plan mantığı verir, 400 satır JSX'i tekrar etmez).
