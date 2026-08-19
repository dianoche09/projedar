/**
 * DB YAPISAL INVARIANT'LARI — canlı şemada kritik güven iddiaları accidental-removal'a karşı kilitli.
 * Behavioral concurrency değil (o ayrı harness ister); şema/fonksiyon/trigger VARLIK + ŞEKİL assert'i.
 * SUPABASE_ACCESS_TOKEN yoksa SKIP (exit 0) → token'sız ortamda `verify` kırılmaz. Çalıştır:
 *   npx tsx tests/domain/db-invariants.test.ts
 */
import { dogru, ozet } from "./_assert.ts";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const PROJE = "svksxtirsbwawvmnojps";

if (!token) {
  console.log("DB invariants: SKIP (SUPABASE_ACCESS_TOKEN yok)");
  process.exit(0);
}

async function sorgu(sql: string): Promise<Record<string, unknown>[]> {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJE}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!r.ok) throw new Error(`Management API ${r.status}: ${await r.text()}`);
  return (await r.json()) as Record<string, unknown>[];
}

const bool = (v: unknown) => v === true || v === "t" || v === 1;

async function main(): Promise<void> {
  // DEĞİŞMEZ #3 / T-OPT — çift-satış kalkanı: birim başına aktif opsiyon tekil (unique partial index)
  const idx = await sorgu(
    `select count(*) c from pg_indexes where tablename='opsiyon' and indexname='opsiyon_tek_aktif'
       and indexdef ilike '%unique%' and indexdef ilike '%where%durum%'`,
  );
  dogru(Number(idx[0].c) >= 1, "T-OPT-001: opsiyon_tek_aktif unique partial index (çift-satış kalkanı)");

  // T-CRON / B3 — opsiyon_serbest_birak: yalnız 'opsiyonlu' serbest bırakır, idempotent, ayrık label
  const cron = await sorgu(
    `select
       (position('satis_beklemede' in pg_get_functiondef(oid)) = 0) b3,
       (position('returning o.id' in pg_get_functiondef(oid)) > 0) idem,
       (position('dogrulama_sure_doldu' in pg_get_functiondef(oid)) > 0) label
     from pg_proc where proname='opsiyon_serbest_birak'`,
  );
  dogru(bool(cron[0]?.b3), "T-CRON/B3: opsiyon_serbest_birak satis_beklemede'ye dokunmaz (çift-satış açığı fix)");
  dogru(bool(cron[0]?.idem), "T-CRON-001: opsiyon_serbest_birak delete-returning (idempotent, çift-event yok)");
  dogru(bool(cron[0]?.label), "T-CRON-002: expiry label ayrık (dogrulama_sure_doldu vs sure_doldu)");

  // A2 — satılan birimde fiyat düzenleme trigger'la korunur
  const trig = await sorgu(
    `select count(*) c from pg_trigger where tgname='birim_satildi_fiyat_koru_trg' and not tgisinternal`,
  );
  dogru(Number(trig[0].c) >= 1, "A2: birim_satildi_fiyat_koru_trg trigger var (satıldıda fiyat kilidi)");

  // Owner-guard'lı tahsis read-model + komisyon fonksiyonları var (N13/N4/B4 + intersection helper)
  const fns = await sorgu(
    `select proname from pg_proc where proname in
       ('tahsis_kapsam_ozet','birim_satici_kazanci','tahsis_munhasir_cakisma','birim_kapsaminda','_tahsis_proje_sahibi')`,
  );
  const set = new Set(fns.map((f) => String(f.proname)));
  for (const fn of ["tahsis_kapsam_ozet", "birim_satici_kazanci", "tahsis_munhasir_cakisma", "birim_kapsaminda", "_tahsis_proje_sahibi"]) {
    dogru(set.has(fn), `fonksiyon var: ${fn}`);
  }

  // birim_satici_kazanci authz-guard (p_satici=auth.uid() VEYA proje sahibi) — ham komisyon sızmasın
  const kazanc = await sorgu(
    `select (position('p_satici = auth.uid()' in pg_get_functiondef(oid)) > 0) guard
     from pg_proc where proname='birim_satici_kazanci'`,
  );
  dogru(bool(kazanc[0]?.guard), "N4: birim_satici_kazanci authz-guard (yalnız kendi kazancı / proje sahibi)");

  ozet("DB invariants");
}

main().catch((e) => {
  console.error("DB invariants HATA:", e instanceof Error ? e.message : e);
  process.exit(1);
});
