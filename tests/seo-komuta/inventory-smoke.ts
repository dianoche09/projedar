/**
 * Inventory data-layer smoke — synthetic HubProje[] → aggregate → policy. Canlı DB gerektirmez.
 * Senaryolar: güçlü→INDEX · içerik-var-eşik-altı→NAVIGABLE_NOINDEX · sıfır→ABSORB · tek-geliştirici ·
 * eski-veri(STALE)→HOLD · toplam≠index · KATALOG-UNKNOWN→freshness bloklamaz · REVIEW_REQUIRED.
 * FAIL'de exit(1) → verify push'u engeller. Çalıştır: npx tsx tests/seo-komuta/inventory-smoke.ts
 */
import { lokasyonAgregatlari } from "../../src/lib/seo-komuta/inventory-aggregate.ts";
import { lokasyonIndexPolicy } from "../../src/lib/seo-komuta/inventory-policy.ts";

const now = Date.UTC(2026, 7, 12);
const taze = new Date(now - 5 * 86_400_000);
const eski = new Date(now - 200 * 86_400_000);

const P = (il: string, ilce: string | null, esik: boolean, gel: string | null, d: Date | null, kaynak: "proje" | "katalog" = "proje") =>
  ({ ad: "x", slug: "x", il, ilce, ilSlug: il, ilceSlug: ilce, asama: null, odaTipleri: [], m2: null, esik, kapak: null, gelistirici: gel, teslim: null, m2min: null, m2max: null, sonGuncelleme: d, kaynak });

const hub = [
  // GÜÇLÜ (proje-kaynak, taze): 4 index, 3 gel → INDEX
  ...["a", "b", "c", "d"].map((_, i) => P("ankara", "cankaya", true, ["Ya", "Yb", "Yc", "Ya"][i], taze)),
  // İÇERİK VAR EŞİK-ALTI: 2 proje, 1 index, 1 gel → NAVIGABLE_NOINDEX
  P("izmir", "cesme", true, "Zx", taze), P("izmir", "cesme", false, "Zx", taze),
  // ESKİ VERİ (proje-kaynak, STALE): 3 index, 3 gel ama hepsi eski → HOLD
  ...["Ea", "Eb", "Ec"].map((g) => P("bursa", "nilufer", true, g, eski)),
  // TOPLAM≥ ama indexProje YETERSİZ: 5 proje, 1 index → HOLD
  ...Array.from({ length: 5 }, (_, i) => P("konya", "selcuklu", i === 0, `K${i}`, taze)),
  // KATALOG-UNKNOWN: 3 katalog index, 3 gel, sonGuncelleme irrelevant → tazelikBilinen=0 → UNKNOWN, freshness BLOKLAMAZ → INDEX
  ...["Ka", "Kb", "Kc"].map((g) => P("antalya", "muratpasa", true, g, null, "katalog")),
];

const ag = lokasyonAgregatlari(hub as any, { now, talep: { "ankara/cankaya": 40 } });

console.log("lokasyon              | top idx gel tazeBil güncel | karar/exposure           | robots        | neden");
for (const e of ag.filter((x) => x.seviye === "ilce")) {
  const p = lokasyonIndexPolicy(e);
  console.log(`${e.konum.padEnd(20)} | ${[e.toplamProje, e.indexProje, e.farkliGelistirici, e.tazelikBilinenProje, e.guncelProje].map((n) => String(n).padStart(3)).join(" ")} | ${(p.karar + "/" + p.exposure).padEnd(24)} | ${String(p.robots).padEnd(13)} | ${p.neden}`);
}
const bos = lokasyonIndexPolicy({ konum: "yok/yok", seviye: "ilce", toplamProje: 0, indexProje: 0, farkliGelistirici: 0, guncelProje: 0, tazelikBilinenProje: 0, queryTalep: null });
console.log(`${"yok/yok (0 proje)".padEnd(20)} | ${"  0   0   0   0   0"} | ${(bos.karar + "/" + bos.exposure).padEnd(24)} | ${String(bos.robots).padEnd(13)} | ${bos.neden}`);
// REVIEW_REQUIRED: HOLD kalitesi + organik sinyal>0 → indexing korunur
const rev = lokasyonIndexPolicy({ konum: "x/y", seviye: "ilce", toplamProje: 2, indexProje: 1, farkliGelistirici: 1, guncelProje: 2, tazelikBilinenProje: 2, queryTalep: null, historicalOrganicSignal: 5 });

const byKonum = Object.fromEntries(ag.map((e) => [e.konum, lokasyonIndexPolicy(e)]));
const bek: Record<string, string> = { "ankara/cankaya": "INDEXED", "izmir/cesme": "NAVIGABLE_NOINDEX", "bursa/nilufer": "NAVIGABLE_NOINDEX", "konya/selcuklu": "NAVIGABLE_NOINDEX", "antalya/muratpasa": "INDEXED" };
let ok = true;
for (const [k, v] of Object.entries(bek)) if (byKonum[k]?.exposure !== v) { console.log(`FAIL: ${k} exposure beklenen ${v}, gelen ${byKonum[k]?.exposure}`); ok = false; }
if (bos.exposure !== "ABSORB_TO_PARENT") { console.log("FAIL: sıfır-proje ABSORB değil"); ok = false; }
if (rev.karar !== "REVIEW_REQUIRED" || rev.exposure !== "PRESERVE_INDEXING" || rev.robots !== "index,follow") { console.log("FAIL: REVIEW_REQUIRED indexing korunmuyor", rev.karar, rev.exposure, rev.robots); ok = false; }
console.log("\nSMOKE:", ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
