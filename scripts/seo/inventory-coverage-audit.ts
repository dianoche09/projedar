/**
 * Inventory Coverage Audit — READ-ONLY canlı Supabase. tumHubProjeleri → agregat → lokasyonIndexPolicy.
 * Çalıştır: npx tsx scripts/seo/inventory-coverage-audit.ts
 * .env.local'i yükler; secret DEĞERİ loglanmaz (yalnız present/missing). Sitemap/robots/nav DEĞİŞTİRMEZ.
 */
import fs from "node:fs";

// .env.local manuel yükle (yalnız eksik olanları; değer loglanmaz).
try {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* env dosyası yoksa alttaki kontrol yakalar */ }

const need = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = need.filter((n) => !process.env[n]);
if (missing.length) { console.error("ENV EKSİK:", missing.join(", "), "— audit çalıştırılamaz."); process.exit(3); }
console.error("ENV: present (" + need.join(", ") + ")");

// OpenSEO ölçülebilir talep (annotation, 2026-08-12). key = il ya da il/ilce (slug).
const TALEP: Record<string, number> = { izmir: 720, ankara: 140, istanbul: 70, "ankara/cankaya": 40 };

(async () => {
  const { tumHubProjeleri } = await import("../../src/lib/seo/konut-hub.ts");
  const { lokasyonAgregatlari } = await import("../../src/lib/seo-komuta/inventory-aggregate.ts");
  const { inventoryCoverageAudit } = await import("../../src/lib/seo-komuta/inventory-policy.ts");

  const hub = await tumHubProjeleri();
  const ag = lokasyonAgregatlari(hub, { talep: TALEP });
  const audit = inventoryCoverageAudit(ag);

  console.log(`\nHubProje: ${hub.length} | lokasyon: ${audit.length}`);
  console.log("konum | seviye | toplam | index | geliştirici | güncel | demand | exposure | karar");
  for (const r of audit) {
    console.log([r.konum, r.seviye, r.toplamProje, r.indexProje, r.farkliGelistirici, r.guncelProje, r.queryTalep ?? "-", r.policy.exposure, r.policy.karar].join(" | "));
  }
  const idx = audit.filter((r) => r.policy.karar === "INDEX");
  console.log(`\nINDEX: ${idx.length} | HOLD: ${audit.length - idx.length}`);
  try { fs.mkdirSync("tests/seo-komuta/results", { recursive: true }); fs.writeFileSync("tests/seo-komuta/results/inventory-audit.json", JSON.stringify(audit, null, 2)); } catch { /* dizin yoksa atla */ }
  console.log("(JSON: tests/seo-komuta/results/inventory-audit.json)");
})().catch((e) => { console.error("AUDIT ERROR:", e?.message ?? e); process.exit(1); });
