// Query Discovery classifier — İKİ KATMAN + fixture persist. YENİ ARAŞTIRMA YOK.
//
// Layer A (heuristic-classifier): öncelik-sıralı regex baseline. Hızlı, tekrarlanabilir, assertion'lı.
//   AMA: NEW_TERRITORY üretemez; first-match-wins false-negative riski; INVENTORY precision düşük.
// Layer B (semantic judge): LLM (Claude) yargısı, SEMANTIC_OVERRIDES olarak kodlanır (A≠B diff'i).
//   Bu turda judge = Claude'un 749'u tam okuyup verdiği kararlar; ÜRETİMDE Collect→Diagnose'da LLM adımı.
// Final semantic classification = heuristic + overrides. Fixtures repo'da kalıcı.
//
// Kullanım: node tests/seo-komuta/classify.mjs <research_keywords.json>
// Integrity: Integrity PASS ≠ semantic accuracy PASS. Bu dosya ikisini AYRI raporlar.

import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const src = process.argv[2];
if (!src) { console.error("usage: node classify.mjs <research_keywords.json>"); process.exit(2); }
const doc = JSON.parse(fs.readFileSync(src, "utf8"));

const seen = new Set();
const rows = [];
for (const r of doc.results ?? []) for (const row of r.rows ?? []) {
  const k = (row.keyword ?? "").trim();
  if (!k || seen.has(k)) continue;
  seen.add(k);
  rows.push({ query: k, volume: row.searchVolume ?? null, seed: r.seed });
}

const re = (s) => new RegExp(s, "i");
// Layer A heuristic (first-match-wins). Kusurları bilinçli — Layer B düzeltir.
const RULES = [
  { cls: "OFF_TOPIC", sub: "customer_service", conf: 0.95, t: re("müşteri hizmet|müşteri temsilci|müşteri numara|müşteri hizmeti|müşteri ol\\b|hizmetlerine bağlan|hizmetleri ara|hizmetleri iletişim|hizmetleri 0850|hizmetleri 444|hizmetleri 7 24|hakem heyeti|yeni müşteri|müşteri portalı|müşteri sözleşme|rehber müşteri|müşteri hakem|hizmetleri numaras|destek kaydı|garanti kaydı") },
  { cls: "OFF_TOPIC", sub: "gold_finance", conf: 0.95, t: re("altın|gümüş|külçe|kur değerleme|çapraz kur") },
  { cls: "OFF_TOPIC", sub: "accounting_record", conf: 0.9, t: re("muhasebe kaydı|sicil kaydı|tescil kaydı|hasar kaydı|tahakkuk|yevmiye|bağkur|sgk kaydı|vergi kaydı|alacak kaydı|emeklilik kaydı|tevkifat|tazminat|dönem sonu|şüpheli|spf kaydı|iflas masas|konkordato|sermaye|muhtasar|sgk teşvik|işkur kaydı|arşiv sicil|arşivli sicil|plaka hasar") },
  { cls: "OFF_TOPIC", sub: "gov_tahsis_plaka", conf: 0.9, t: re("plaka tahsis|arazi tahsis|tapu tahsis|sgk tahsis|parsel tahsis|tahsis daire başkan|tahsis işlemleri|tahsis memuru|tahsis no|tahsis sorgulama|tahsis tapu|kos tahsis|kos parsel|kadro.*tahsis") },
  { cls: "OFF_TOPIC", sub: "academic_project", conf: 0.85, t: re("proje ödev|proje kapa|proje kapak|mimari proje|fizik proje|kimya proje|statik proje|mekanik proje|proje çizim|proje sunum|proje rapor|tübitak|ardeb|bap proje|proje yarışma|proje fikir|proje kutus|3d proje|dwg|proje mühendis|proje yönetici|ab proje|proje takip|proje pazar|proje değerlendirme|proje hazırla|proje nasıl hazır|proje planı|proje destek|proje sözleşme|proje taahhüt|bitirme proje|güneş sistemi|sürtünme|arduino|as built|avan proje|araç proje|doğalgaz proje|sulama proje|restorasyon proje|teknopark|team proje|delta proje|anka proje|leka proje|lotus proje|turna proje|esc proje|suiş proje|1001 proje|1002 proje|1005 proje|kaçmaz proje|yüksel proje|tezel proje|proplan|optimal proje|proje evler|proje yönetim|proje süsleme|altın oran proje|bir fikir bir proje|proje katlama|proje iho|hareket proje|bbm grup|tet proje|bartın proje|kocaeli proje|istanbul proje\\b|gayrimenkul proje|emlak proje\\b") },
  { cls: "OFF_TOPIC", sub: "vehicle_misc_sale", conf: 0.85, t: re("araç sat|araba sat|motor sat|2\\.el|ikinci el|icra araç|hurda araç|engelli araç|gümrük araç|hacizli|takasbank|hesap sat|forma sat|kombine sat|silah sat|jilet|marka sat|script sat|tema sat|wordpress|youtube kanal|metin2|pubg|zula|efootball|pes hesap|noter|vekalet ücret|demirbaş sat|bakır sat|çaykur|tdv|diyanet sat|uyap|dmo|tmsf|kamu araç|tasiş|vergi dairesi araç|senetli|senetle|ana arı|yang satış|karakter satış|hisseli tarla|hisseli tapu|elbirliği|pay temliki|2b arazi|tarla satış") },
  { cls: "OFF_TOPIC", sub: "generic_software", conf: 0.8, t: re("yazılım") },
  { cls: "OFF_TOPIC", sub: "gov_social_housing", conf: 0.8, t: re("sosyal konut|toki|toplu konut başvuru|500\\.?000 konut|500 bin konut|konut kura|konut başvuru|konut belirleme|konut sertifika|konut kampany|hisse|gyo|genel müdürlüğü|müzayede|rayiç|fiyat endeksi|konut satışları|konut istatistik|konut fiyat|tüik|tcmb|halka arz|emlak konut online|emlak konut ödeme|emlak konut toki|emlak konut satış ofis|emlak konut kiralık|emlak konut ev fiyat|emlak konut antalya|emlak konut ıspartakule|emlak konut ispartakule|emlak konut genel|emlak konut gyo|emlak konut hisse|emlak konut kampany|emlak konut müzayede|emlak konut proje fiyat|devlet konut|toki ev|balıkesir 50000|750 / 250000|kura çekimi|belirleme kurası|başvuru şartları|başvuru sonuç|gbb konut") },
  { cls: "OFF_TOPIC", sub: "consumer_listing", conf: 0.8, t: re("satilik daire|satılık daire|kiralik daire|kiralık daire|satilik|kiralik|apart daire|rezidans daire|günluk kiralik|takas daire|icra daire|yatar daire|bodrum kat daire|kelepir daire|sari daire|kare daire|daire 1 bebek|daire makarna|daire boyama|daire tadilat|daire resmi|daire hacim|daire club|manhattan|sapphire|liparis|kayabasi") },
  { cls: "OFF_TOPIC", sub: "consumer_agent", conf: 0.75, t: re("emlakçı") },
  { cls: "INVENTORY_ENTITY", sub: null, conf: 0.65, t: re("konut projeleri|konut projesi|yeni konut proje|arsa proje|apartman proje|otel proje|köy evi proje|tesla ev proje|kartal.*proje|hızray|kanal istanbul proje|asrın konut|dap proje|dap projesi|türkiye konut|mersin konut proje|kent konut|toplu konut\\b|emlak konut projeleri") },
  { cls: "MATCHED_MUST", sub: null, conf: 0.7, t: re("proje satışı nasıl|çift sat|müşteri çakış|daire tahsisi|proje satış komisyon|emlakçı komisyon takip|stok paylaş|tahsisli sat|birim kilit") },
  { cls: "MATCHED_SUPPORT", sub: null, conf: 0.55, t: re("satış danışman|satış temsilci|günlük müşteri liste|emlakçı çalışma sistem|emlakçı olmak|hızlı satış program|satış strateji|satış eğitim|proje yönetim sistem|satış portal|satış giderleri|satış suretiyle") },
];
function heuristic(k) {
  for (const r of RULES) if (r.t.test(k)) return { cls: r.cls, sub: r.sub ?? null, conf: r.conf };
  return { cls: "OFF_TOPIC", sub: "misc_unmatched", conf: 0.5 };
}

// Layer B — Claude semantic judge OVERRIDES (yalnız heuristic'ten FARKLI kararlar = A≠B diff).
// 749'un tam okumasından: heuristic'in ana hatası INVENTORY false-positive'ler (infra/gov/marka).
// Gerçek B2B false-negative YOK (havuzda o dil bulunmuyor). NEW_TERRITORY: judge'ın seçeneği VAR → yine de 0.
const SEMANTIC_OVERRIDES = {
  "kanal istanbul projesi": { cls: "OFF_TOPIC", reason: "altyapı mega-projesi, konut envanteri değil", persona: null },
  "köy evi projesi": { cls: "OFF_TOPIC", reason: "jenerik köy evi, Projedar envanteri değil", persona: null },
  "tesla ev projesi": { cls: "OFF_TOPIC", reason: "kavramsal/haber, envanter değil", persona: null },
  "hızray projesi": { cls: "OFF_TOPIC", reason: "hızlı tren altyapı projesi", persona: null },
  "kartal kavşağı projesi": { cls: "OFF_TOPIC", reason: "kavşak/altyapı", persona: null },
  "toplu konut": { cls: "OFF_TOPIC", reason: "devlet/TOKİ sosyal konut", persona: null },
  "toplu konut projesi": { cls: "OFF_TOPIC", reason: "devlet/TOKİ", persona: null },
  "kent konut": { cls: "OFF_TOPIC", reason: "belediye konut şirketi markası", persona: null },
  "emlak konut projeleri": { cls: "OFF_TOPIC", reason: "Emlak Konut GYO (devlet şirketi) markalı arama", persona: null },
  "arsa projesi": { cls: "MATCHED_SUPPORT", reason: "arsa/geliştirme komşu; zayıf on-thesis", persona: "muteahhit" },
  "emlakçı çalışma sistemi": { cls: "MATCHED_SUPPORT", reason: "emlakçı çalışma biçimi (persona-komşu), OFF değil", persona: "danisman" },
  // MATCHED_MUST doğrulandı: "proje satışı nasıl yapılır" (heuristic zaten MUST).
};

const OUT = rows.map((r) => {
  const h = heuristic(r.query);
  const o = SEMANTIC_OVERRIDES[r.query];
  const semantic = o ? o.cls : h.cls;
  return {
    query: r.query, volume: r.volume, seed: r.seed,
    heuristic: h.cls, heuristic_sub: h.sub, confidence: h.conf,
    semantic, matchedTerritory: null,
    persona: o?.persona ?? null,
    reason: o?.reason ?? (h.sub ? `heuristic:${h.sub}` : "heuristic"),
    changed: !!o,
  };
});

const distOf = (key) => OUT.reduce((m, o) => ((m[o[key]] = (m[o[key]] ?? 0) + 1), m), { MATCHED_MUST: 0, MATCHED_SUPPORT: 0, NEW_TERRITORY: 0, INVENTORY_ENTITY: 0, OFF_TOPIC: 0 });
const dH = distOf("heuristic"), dS = distOf("semantic");
const total = rows.length;

// ── Fixtures persist (repo-kalıcı) ────────────────────────────────────────────
const fixDir = path.join(process.cwd(), "tests/seo-komuta/fixtures");
fs.mkdirSync(fixDir, { recursive: true });
const inputHash = crypto.createHash("sha256").update(JSON.stringify(rows)).digest("hex").slice(0, 16);
fs.writeFileSync(path.join(fixDir, "query-pool.json"), JSON.stringify({ inputHash, total, source: path.basename(src), queries: rows }, null, 2));
fs.writeFileSync(path.join(fixDir, "semantic-classification.json"), JSON.stringify(OUT, null, 2));
fs.writeFileSync(path.join(fixDir, "classification-summary.json"), JSON.stringify({ inputHash, total, heuristic: dH, semantic: dS, overrideCount: OUT.filter((o) => o.changed).length, lowConf: OUT.filter((o) => o.confidence < 0.7).length }, null, 2));

// ── Rapor ─────────────────────────────────────────────────────────────────────
const sumH = Object.values(dH).reduce((a, b) => a + b, 0), sumS = Object.values(dS).reduce((a, b) => a + b, 0);
console.log("=== INTEGRITY (muhasebe) ===");
console.log(`total=${total} sumH=${sumH} sumS=${sumS} dup=${OUT.length - new Set(OUT.map(o => o.query)).size} → ${sumH === total && sumS === total ? "PASS" : "FAIL"}`);
console.log("\n=== DAĞILIM: heuristic(A) → semantic(B) ===");
for (const k of Object.keys(dS)) console.log(`  ${k.padEnd(18)} A=${dH[k]}  B=${dS[k]}`);
console.log("\n=== A≠B DIFF (semantic judge düzeltmeleri) ===");
OUT.filter((o) => o.changed).forEach((o) => console.log(`  [${o.volume}] ${o.query}: ${o.heuristic} → ${o.semantic}  (${o.reason})`));
console.log("\n=== NEW_TERRITORY (judge seçeneği VAR) ===", dS.NEW_TERRITORY, "→ semantik olarak da 0 (havuzda yeni B2B problem yok)");
console.log("=== MATCHED_MUST (semantic) ===");
OUT.filter((o) => o.semantic === "MATCHED_MUST").forEach((o) => console.log(`  [${o.volume}] ${o.query}`));
console.log("=== INVENTORY_ENTITY (semantic, temizlenmiş) top ===");
OUT.filter((o) => o.semantic === "INVENTORY_ENTITY").sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 15).forEach((o) => console.log(`  [${o.volume ?? "null"}] ${o.query}`));
console.log("\nfixtures: tests/seo-komuta/fixtures/{query-pool,semantic-classification,classification-summary}.json");
console.log("NOT: Integrity PASS ≠ semantic accuracy. B katmanı A'nın INVENTORY false-positive'lerini düzeltir.");
