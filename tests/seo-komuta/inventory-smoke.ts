/**
 * Inventory data-layer smoke — synthetic HubProje[] → aggregate → policy. Canlı DB gerektirmez.
 * Senaryolar: güçlü→INDEX · içerik-var-eşik-altı→NAVIGABLE_NOINDEX · sıfır→ABSORB · tek-geliştirici ·
 * eski-veri · yeterli-toplam-ama-indexProje-yetersiz. Çalıştır: npx tsx tests/seo-komuta/inventory-smoke.ts
 */
import { lokasyonAgregatlari } from "../../src/lib/seo-komuta/inventory-aggregate.ts";
import { lokasyonIndexPolicy } from "../../src/lib/seo-komuta/inventory-policy.ts";

const now = Date.UTC(2026, 7, 12);
const taze = new Date(now - 5 * 86_400_000); // güncel
const eski = new Date(now - 200 * 86_400_000); // eski

// HubProje minimal shape (yalnız agregasyonun kullandığı alanlar).
const P = (il: string, ilce: string | null, esik: boolean, gelistirici: string | null, d: Date | null) =>
  ({ ad: "x", slug: "x", il, ilce, ilSlug: il, ilceSlug: ilce, asama: null, odaTipleri: [], m2: null, esik, kapak: null, gelistirici, teslim: null, m2min: null, m2max: null, sonGuncelleme: d, kaynak: "proje" as const });

const hub = [
  // GÜÇLÜ il/ilçe: 4 index proje, 3 geliştirici, taze
  ...["A", "B", "C", "D"].map((g, i) => P("ankara", "cankaya", true, ["Ya", "Yb", "Yc", "Ya"][i], taze)),
  // İÇERİK VAR EŞİK-ALTI: 2 proje, 1 index, 1 geliştirici, taze → NAVIGABLE_NOINDEX
  P("izmir", "cesme", true, "Zx", taze), P("izmir", "cesme", false, "Zx", taze),
  // ESKİ VERİ: 3 index, 3 geliştirici ama hepsi eski → HOLD (veri-güncel-değil)
  ...["Ea", "Eb", "Ec"].map((g) => P("bursa", "nilufer", true, g, eski)),
  // YETERLİ TOPLAM AMA indexProje YETERSİZ: 5 proje, 1 index → HOLD
  ...Array.from({ length: 5 }, (_, i) => P("konya", "selcuklu", i === 0, `K${i}`, taze)),
];

const talep = { "ankara/cankaya": 40, "izmir/cesme": 5 };
const ag = lokasyonAgregatlari(hub as any, { now, talep });

console.log("lokasyon              | top idx gel gün | karar/exposure           | robots        | canonical | neden");
for (const e of ag.filter((x) => x.seviye === "ilce")) {
  const p = lokasyonIndexPolicy(e);
  console.log(
    `${e.konum.padEnd(20)} | ${String(e.toplamProje).padStart(3)} ${String(e.indexProje).padStart(3)} ${String(e.farkliGelistirici).padStart(3)} ${String(e.guncelProje).padStart(3)} | ${(p.karar + "/" + p.exposure).padEnd(24)} | ${String(p.robots).padEnd(13)} | ${p.canonical.padEnd(9)} | ${p.neden}`,
  );
}
// Sıfır proje senaryosu (agregasyon üretmez; policy branch'i doğrudan test):
const bos = lokasyonIndexPolicy({ konum: "yok/yok", seviye: "ilce", toplamProje: 0, indexProje: 0, farkliGelistirici: 0, guncelProje: 0, queryTalep: null });
console.log(`${"yok/yok (0 proje)".padEnd(20)} | ${"  0   0   0   0"} | ${(bos.karar + "/" + bos.exposure).padEnd(24)} | ${String(bos.robots).padEnd(13)} | ${bos.canonical.padEnd(9)} | ${bos.neden}`);

// Assertions
const byKonum = Object.fromEntries(ag.map((e) => [e.konum, lokasyonIndexPolicy(e).exposure]));
const bek = { "ankara/cankaya": "INDEXED", "izmir/cesme": "NAVIGABLE_NOINDEX", "bursa/nilufer": "NAVIGABLE_NOINDEX", "konya/selcuklu": "NAVIGABLE_NOINDEX" };
let ok = true;
for (const [k, v] of Object.entries(bek)) { if (byKonum[k] !== v) { console.log(`FAIL: ${k} beklenen ${v}, gelen ${byKonum[k]}`); ok = false; } }
if (bos.exposure !== "ABSORB_TO_PARENT") { console.log("FAIL: sıfır-proje ABSORB_TO_PARENT değil"); ok = false; }
console.log("\nSMOKE:", ok ? "PASS" : "FAIL");
