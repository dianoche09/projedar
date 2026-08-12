// Query Discovery — deterministik semantic classifier integrity-audit.
// YENİ ARAŞTIRMA YOK. Mevcut research_keywords çıktısını (arg: json path) tek-etiket sınıflandırır.
// Öncelik-sıralı (first-match-wins) → her query TEK ve yalnız TEK primary class alır.
// Sınıflar: MATCHED_MUST | MATCHED_SUPPORT | NEW_TERRITORY | INVENTORY_ENTITY | OFF_TOPIC
// (CONSUMER_LISTING primary DEĞİL → OFF_TOPIC subtype). Assertions + exact counts.
//
// Kullanım: node tests/seo-komuta/classify.mjs <research_keywords.json>

import fs from "node:fs";

const path = process.argv[2];
if (!path) { console.error("usage: node classify.mjs <research_keywords.json>"); process.exit(2); }
const doc = JSON.parse(fs.readFileSync(path, "utf8"));

// rows → {keyword, volume, seed}; dedupe by keyword (regex yalnız dedupe/normalizasyon).
const seen = new Set();
const rows = [];
for (const r of doc.results ?? []) {
  for (const row of r.rows ?? []) {
    const k = (row.keyword ?? "").trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    rows.push({ keyword: k, volume: row.searchVolume ?? null, seed: r.seed });
  }
}

// Öncelik-sıralı kural tablosu. İlk eşleşen kazanır → tek etiket. subtype = OFF alt-neden.
const re = (s) => new RegExp(s, "i");
const RULES = [
  { cls: "OFF_TOPIC", sub: "customer_service", conf: 0.95, t: re("müşteri hizmet|müşteri temsilci|müşteri numara|müşteri hizmeti|müşteri ol\\b|hizmetlerine bağlan|hizmetleri ara|hizmetleri iletişim|hizmetleri 0850|hizmetleri 444|hizmetleri 7 24|hakem heyeti|yeni müşteri kampany|yeni müşteri|müşteri portalı|müşteri sözleşme|rehber müşteri|müşteri hakem|hizmetleri numaras|destek kaydı|garanti kaydı") },
  { cls: "OFF_TOPIC", sub: "gold_finance", conf: 0.95, t: re("altın|gümüş|külçe|kur değerleme|çapraz kur") },
  { cls: "OFF_TOPIC", sub: "accounting_record", conf: 0.9, t: re("muhasebe kaydı|sicil kaydı|tescil kaydı|hasar kaydı|tahakkuk|yevmiye|bağkur|sgk kaydı|vergi kaydı|alacak kaydı|emeklilik kaydı|tevkifat|tazminat|dönem sonu|şüpheli|spf kaydı|iflas masas|konkordato|sermaye|çapraz kur|muhtasar|bağkur|sgk teşvik|işkur kaydı|arşiv sicil|arşivli sicil|hasar kaydı sorgulama|plaka hasar") },
  { cls: "OFF_TOPIC", sub: "gov_tahsis_plaka", conf: 0.9, t: re("plaka tahsis|arazi tahsis|tapu tahsis|sgk tahsis|parsel tahsis|tahsis daire başkan|tahsis işlemleri|tahsis memuru|tahsis no|tahsis sorgulama|tahsis tapu|kos tahsis|kos parsel|kadro.*tahsis|kadro tahsis") },
  { cls: "OFF_TOPIC", sub: "academic_project", conf: 0.85, t: re("proje ödev|proje kapa|proje kapak|mimari proje|fizik proje|kimya proje|statik proje|mekanik proje|proje çizim|proje sunum|proje rapor|tübitak|ardeb|bap proje|proje yarışma|proje fikir|proje kutus|3d proje|dwg|proje mühendis|proje yönetici|ab proje|proje takip|proje pazar|proje değerlendirme|proje hazırla|proje nasıl hazır|proje planı|proje destek|proje sözleşme|proje taahhüt|bitirme proje|güneş sistemi|sürtünme|arduino|as built|avan proje|araç proje|doğalgaz proje|sulama proje|restorasyon proje|teknopark|team proje|delta proje|anka proje|leka proje|lotus proje|turna proje|esc proje|suiş proje|1001 proje|1002 proje|1005 proje|kaçmaz proje|yüksel proje|tezel proje|proplan|optimal proje|proje evler|proje yönetim|proje süsleme|altın oran proje|bir fikir bir proje|proje katlama|proje iho|hareket proje|bbm grup|tet proje|bartın proje|kocaeli proje|istanbul proje\\b|gayrimenkul proje|emlak proje\\b|araç proje") },
  { cls: "OFF_TOPIC", sub: "vehicle_misc_sale", conf: 0.85, t: re("araç sat|araba sat|motor sat|2\\.el|ikinci el|icra araç|hurda araç|engelli araç|gümrük araç|hacizli|takasbank|hesap sat|forma sat|kombine sat|silah sat|jilet|marka sat|script sat|tema sat|wordpress|youtube kanal|metin2|pubg|zula|efootball|pes hesap|noter|vekalet ücret|demirbaş sat|bakır sat|çaykur|tdv|diyanet sat|uyap|dmo|tmsf|kamu araç|tasiş|vergi dairesi araç|senetli|senetle|ana arı|yang satış|karakter satış|hisseli tarla|hisseli tapu|elbirliği mülkiyet|pay temliki|2b arazi|tarla satış") },
  { cls: "OFF_TOPIC", sub: "generic_software", conf: 0.8, t: re("yazılım") },
  { cls: "OFF_TOPIC", sub: "gov_social_housing", conf: 0.8, t: re("sosyal konut|toki|toplu konut başvuru|toplu konut projesi|500\\.?000 konut|500 bin konut|konut kura|konut başvuru|konut belirleme|konut sertifika|konut kampany|hisse|gyo|genel müdürlüğü|müzayede|rayiç|fiyat endeksi|konut satışları|konut istatistik|konut fiyat|tüik|tcmb|halka arz|emlak konut online|emlak konut ödeme|emlak konut toki|emlak konut satış ofis|emlak konut kiralık|emlak konut ev fiyat|emlak konut antalya|emlak konut ıspartakule|emlak konut ispartakule|emlak konut genel|emlak konut gyo|emlak konut hisse|emlak konut kampany|emlak konut müzayede|emlak konut proje fiyat|devlet konut|toki ev|balıkesir 50000|750 / 250000|kura çekimi|belirleme kurası|başvuru şartları|başvuru sonuç|gbb konut") },
  { cls: "OFF_TOPIC", sub: "consumer_listing", conf: 0.8, t: re("satilik daire|satılık daire|kiralik daire|kiralık daire|satilik|kiralik|apart daire|rezidans daire|günluk kiralik|takas daire|icra daire|yatar daire|bodrum kat daire|kelepir daire|sari daire|kare daire|daire 1 bebek|daire makarna|daire boyama|daire tadilat|daire resmi|daire hacim|daire club|manhattan|sapphire|liparis|kayabasi") },
  { cls: "OFF_TOPIC", sub: "consumer_agent", conf: 0.75, t: re("emlakçı") },
  { cls: "INVENTORY_ENTITY", sub: null, conf: 0.7, t: re("konut projeleri|konut projesi|yeni konut proje|arsa proje|apartman proje|otel proje|köy evi proje|tesla ev proje|kartal.*proje|hızray|kanal istanbul proje|asrın konut|dap proje|dap projesi|türkiye konut|mersin konut proje|kent konut|toplu konut\\b|emlak konut projeleri") },
  { cls: "MATCHED_MUST", sub: null, conf: 0.7, t: re("proje satışı nasıl|çift sat|müşteri çakış|daire tahsisi|proje satış komisyon|emlakçı komisyon takip|stok paylaş|tahsisli sat|birim kilit") },
  { cls: "MATCHED_SUPPORT", sub: null, conf: 0.55, t: re("satış danışman|satış temsilci|günlük müşteri liste|emlakçı çalışma sistem|emlakçı olmak|hızlı satış program|satış strateji|satış eğitim|proje yönetim sistem|satış portal|satış giderleri|satış suretiyle") },
];

const OUT = [];
const dist = { MATCHED_MUST: 0, MATCHED_SUPPORT: 0, NEW_TERRITORY: 0, INVENTORY_ENTITY: 0, OFF_TOPIC: 0 };
for (const r of rows) {
  let hit = null;
  for (const rule of RULES) { if (rule.t.test(r.keyword)) { hit = rule; break; } }
  if (!hit) hit = { cls: "OFF_TOPIC", sub: "misc_unmatched", conf: 0.5 };
  dist[hit.cls]++;
  OUT.push({ query: r.keyword, volume: r.volume, seed: r.seed, classification: hit.cls, subtype: hit.sub ?? null, confidence: hit.conf });
}

// ── Assertions ────────────────────────────────────────────────────────────────
const total = rows.length;
const sum = Object.values(dist).reduce((a, b) => a + b, 0);
const unclassified = OUT.filter((o) => !o.classification).length;
const dupPrimary = OUT.length - new Set(OUT.map((o) => o.query)).size;
const assertOk = sum === total && unclassified === 0 && dupPrimary === 0;

fs.writeFileSync("/tmp/qd_classified.json", JSON.stringify(OUT, null, 2));

// ── Rapor ─────────────────────────────────────────────────────────────────────
console.log("=== ASSERTIONS ===");
console.log("total_input          =", total);
console.log("total_classified     =", OUT.length);
console.log("sum(class_counts)    =", sum, sum === total ? "OK" : "FAIL");
console.log("unclassified         =", unclassified, unclassified === 0 ? "OK" : "FAIL");
console.log("duplicate_primary    =", dupPrimary, dupPrimary === 0 ? "OK" : "FAIL");
console.log("INTEGRITY            =", assertOk ? "PASS" : "FAIL");
console.log("\n=== CLASS DAĞILIMI (exact) ===");
for (const [k, v] of Object.entries(dist)) console.log(`  ${k.padEnd(18)} ${v}`);
console.log("\n=== MATCHED_MUST territory (query'ler) ===");
OUT.filter((o) => o.classification === "MATCHED_MUST").forEach((o) => console.log(`  [${o.volume}] ${o.query}`));
console.log("\n=== NEW_TERRITORY adayları ===");
const nt = OUT.filter((o) => o.classification === "NEW_TERRITORY");
console.log(nt.length ? nt.map((o) => "  " + o.query).join("\n") : "  (yok)");
console.log("\n=== INVENTORY_ENTITY top-20 (hacme göre) ===");
OUT.filter((o) => o.classification === "INVENTORY_ENTITY").sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 20)
  .forEach((o) => console.log(`  [${o.volume ?? "null"}] ${o.query}`));
console.log("\n=== confidence < 0.70 satır sayısı ===", OUT.filter((o) => o.confidence < 0.7).length);
console.log("(machine-readable: /tmp/qd_classified.json)");
