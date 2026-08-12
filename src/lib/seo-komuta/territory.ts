/**
 * Projedar Semantic Territory Map v2.1 — SEO Komuta Merkezi karar motoru + CLAIM REGISTRY.
 *
 * Zincir: Product truth → Territory → Pillar architecture → Gate → (sonra) Query discovery →
 *         SERP validation → Content/Entity → Conversion → Verify/Learn.
 * Bu dosyada KEYWORD VOLUME / İÇERİK YOK. Önce semantic operating model güvenilir olsun.
 *
 * v2.1 değişiklikleri (kullanıcı kritiği):
 *  1) Gate boolean'ları çıplak değil — her kriter `{value, kanit}` (neden true/false).
 *  2) İki gate PROFİLİ (arz istisnası YOK): B2B_ACQUISITION (/emlakci|/muteahhit → kayıt) ve
 *     INVENTORY_DISCOVERY (/konut-projeleri, /proje, /firma → visibility/entity ownership).
 *  3) Typed claim registry: status VERIFIED_CODE|VERIFIED_DB|VERIFIED_POLICY|PENDING + evidence.
 *     PENDING claim → yayinlanabilir=false.
 *  4) Public claim'ler ürün-gerçeğinden güçlü değil (absolutist yok).
 *  5) 6 pillar = gerçek mimari (url/persona/intent/cta); her territory tek primary pillar.
 *  6) Negatif/borderline fixture set → gate'i stres-test.
 */

export type Persona = "danisman" | "ofis" | "muteahhit" | "satis-yoneticisi" | "nitelikli-alici";
export type Sinif = "kategori" | "problem" | "mekanizma" | "arz";
export type Tier = "MUST" | "SUPPORT" | "OPTIONAL";
export type Cta = "/emlakci" | "/muteahhit" | "/nedir" | "/konut-projeleri" | "/guven" | "/proje" | "/firma";
export type GateProfil = "B2B_ACQUISITION" | "INVENTORY_DISCOVERY";
export type KpiEvent = "visibility" | "engagement" | "intent" | "conversion" | "activation";

// ── Pillar mimarisi (6 gerçek hub) ───────────────────────────────────────────
export interface Pillar {
  key: PillarKey;
  title: string;
  url: string;
  primaryPersona: Persona;
  primaryIntent: string;
  primaryCta: Cta;
}
export type PillarKey =
  | "yeni-konut-proje-satisi"
  | "canli-stok-fiyat"
  | "tahsis-opsiyon"
  | "musteri-kayit-cakisma"
  | "komisyon-hakedis"
  | "muteahhit-emlakci-agi";

export const PILLARLAR: Record<PillarKey, Pillar> = {
  "yeni-konut-proje-satisi": { key: "yeni-konut-proje-satisi", title: "Yeni Konut Projesi Satışı", url: "/konut-projeleri", primaryPersona: "nitelikli-alici", primaryIntent: "Yeni konut projelerini keşfet/sat", primaryCta: "/konut-projeleri" },
  "canli-stok-fiyat": { key: "canli-stok-fiyat", title: "Canlı Proje Stoğu ve Fiyat Yönetimi", url: "/nedir", primaryPersona: "danisman", primaryIntent: "Güncel stok/fiyat güveni", primaryCta: "/emlakci" },
  "tahsis-opsiyon": { key: "tahsis-opsiyon", title: "Daire Tahsisi ve Opsiyon Yönetimi", url: "/muteahhit", primaryPersona: "muteahhit", primaryIntent: "Stok görünürlüğü/kilit kontrolü", primaryCta: "/muteahhit" },
  "musteri-kayit-cakisma": { key: "musteri-kayit-cakisma", title: "Müşteri Kaydı ve Çakışma Yönetimi", url: "/emlakci", primaryPersona: "danisman", primaryIntent: "Müşteri/satış hakkı koruma", primaryCta: "/emlakci" },
  "komisyon-hakedis": { key: "komisyon-hakedis", title: "Proje Satış Komisyonu ve Hakediş", url: "/emlakci", primaryPersona: "danisman", primaryIntent: "Komisyon/hakediş güvencesi", primaryCta: "/emlakci" },
  "muteahhit-emlakci-agi": { key: "muteahhit-emlakci-agi", title: "Müteahhit–Emlakçı Proje Satış Ağı", url: "/nedir", primaryPersona: "muteahhit", primaryIntent: "Kategori/ağ tanımı", primaryCta: "/nedir" },
};

// ── Typed claim registry ─────────────────────────────────────────────────────
export type ClaimStatus = "VERIFIED_CODE" | "VERIFIED_DB" | "VERIFIED_POLICY" | "PENDING";
export interface Claim {
  iddia: string;
  status: ClaimStatus;
  path?: string;
  anchor?: string;
  verifiedAt?: string;
}

// ── Gate (kanıtlı boolean) ───────────────────────────────────────────────────
export interface GateKriter {
  value: boolean;
  kanit: string;
}
const gk = (value: boolean, kanit: string): GateKriter => ({ value, kanit });

export interface Gate {
  urunOzelligineBagli: GateKriter;
  aktifPersonaProblemi: GateKriter;
  savunulabilirCozum: GateKriter;
  dogalCta: GateKriter; // profil-farkında: B2B→/emlakci|/muteahhit, INVENTORY→/konut-projeleri|/proje|/firma
  projedarsizJenerik: GateKriter;
}

export interface Territory {
  baslik: string;
  pillar: PillarKey; // tek primary pillar
  profil: GateProfil;
  sinif: Sinif;
  intent: string;
  seedQueries: string[];
  persona: Persona[];
  pain: string;
  claims: Claim[];
  cta: Cta;
  conversionEvent: KpiEvent;
  url: string;
  gate: Gate;
}

// ── GERÇEK TERRITORY'LER ──────────────────────────────────────────────────────
const GERCEK: Territory[] = [
  {
    baslik: "Müşteri çakışması / çift-satış (danışman hakkı)", pillar: "musteri-kayit-cakisma", profil: "B2B_ACQUISITION", sinif: "problem",
    intent: "Danışmanın müşteri/satış hakkının korunması", seedQueries: ["proje satışında müşteri çakışması", "aynı müşteri iki emlakçı", "müşteri kaydı çakışması"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Aynı daire iki danışmana kilitlenip çakışma/mükerrer satış",
    claims: [{ iddia: "Çift-satış kalkanı veritabanı seviyesindedir; aynı birim aynı anda iki danışmana kilitlenmez.", status: "VERIFIED_DB", path: "db/2026-06-29_opsiyon-talep-onay.sql", anchor: "opsiyon_tek_aktif unique index + opsiyon_birim_senkron trigger", verifiedAt: "2026-08-12" }],
    cta: "/emlakci", conversionEvent: "intent", url: "/rehber/musteri-cakismasi-cift-satis",
    gate: { urunOzelligineBagli: gk(true, "opsiyon_tek_aktif DB index"), aktifPersonaProblemi: gk(true, "aktif danışman satış-hakkı problemi"), savunulabilirCozum: gk(true, "DB kalkanı koddan doğrulandı"), dogalCta: gk(true, "/emlakci = kayıt funnel"), projedarsizJenerik: gk(false, "çözüm Projedar DB mekanizmasına özgü") },
  },
  {
    baslik: "Güncel proje stok & fiyat takibi", pillar: "canli-stok-fiyat", profil: "B2B_ACQUISITION", sinif: "problem",
    intent: "Danışmanın güncel stok-fiyata güvenmesi", seedQueries: ["güncel proje stok listesi", "proje stok takibi", "daire müsaitlik takibi"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Eski stok/fiyatla müşteriye yanlış bilgi",
    claims: [{ iddia: "Fiyat ve durum tek doğru kaynaktan (birim tablosu) yansır; her yazışta güncellik damgalanır.", status: "VERIFIED_DB", path: "supabase-schema.sql:109", anchor: "son_guncelleme default now(); tazelik db/2026-08-05_guven-skoru.sql", verifiedAt: "2026-08-12" }],
    cta: "/emlakci", conversionEvent: "engagement", url: "/rehber/guncel-proje-stok-takibi",
    gate: { urunOzelligineBagli: gk(true, "birim tablosu tek kaynak"), aktifPersonaProblemi: gk(true, "aktif danışman güncellik problemi"), savunulabilirCozum: gk(true, "son_guncelleme + tazelik koddan doğrulandı"), dogalCta: gk(true, "/emlakci"), projedarsizJenerik: gk(false, "tek-kaynak+tazelik ürün mekanizması") },
  },
  {
    baslik: "Proje satış komisyonu ve danışman hakedişi", pillar: "komisyon-hakedis", profil: "B2B_ACQUISITION", sinif: "problem",
    intent: "Danışmanın komisyon/hakediş güvencesi", seedQueries: ["proje satış komisyonu", "emlakçı komisyon hakedişi", "müteahhit projesi emlakçı komisyonu"],
    persona: ["danisman", "ofis"], pain: "Komisyon belirsiz/korumasız; hakediş takip edilemiyor",
    claims: [{ iddia: "Projedar satış komisyonuna ortak olmaz; komisyonunu müteahhit tanımlar, hakediş satışla tetiklenir.", status: "VERIFIED_POLICY", path: "komisyonsuz-ifadesi-yasak (marka-kuralı) + db/2026-08-09_emlakci-kazanc-ozet.sql", anchor: "komisyon_tip/deger alanları", verifiedAt: "2026-08-12" }],
    cta: "/emlakci", conversionEvent: "intent", url: "/rehber/proje-satis-komisyonu",
    gate: { urunOzelligineBagli: gk(true, "komisyon_tip/deger DB"), aktifPersonaProblemi: gk(true, "aktif danışman hakediş problemi"), savunulabilirCozum: gk(true, "policy + DB alanı"), dogalCta: gk(true, "/emlakci"), projedarsizJenerik: gk(false, "iş modeli: satış komisyonuna ortak olmama") },
  },
  {
    baslik: "Daire tahsisi (granüler görünürlük kontrolü)", pillar: "tahsis-opsiyon", profil: "B2B_ACQUISITION", sinif: "mekanizma",
    intent: "Üreticinin kime hangi stoğu göstereceğini kontrol etmesi", seedQueries: ["daire tahsisi nedir", "emlakçıya proje tahsisi", "daire tahsis sistemi"],
    persona: ["muteahhit", "satis-yoneticisi"], pain: "Stoğu çok-emlakçıya açınca görünürlük kontrolü kaybı",
    claims: [{ iddia: "Proje/blok/kat/birim bazında granüler tahsis; emlakçı yalnız tahsisli birimleri görür.", status: "PENDING", path: "DOĞRULA: tahsis tablosu + RLS (src/ / db/)", anchor: "DEĞİŞMEZ #1 kültürü ama kod-teyidi bekliyor" }],
    cta: "/muteahhit", conversionEvent: "engagement", url: "/rehber/daire-tahsis-sistemi",
    gate: { urunOzelligineBagli: gk(true, "tahsis mekanizması (DEĞİŞMEZ #1)"), aktifPersonaProblemi: gk(true, "aktif müteahhit kontrol problemi"), savunulabilirCozum: gk(true, "tahsis ürün mekanizması"), dogalCta: gk(true, "/muteahhit"), projedarsizJenerik: gk(false, "granüler tahsis+RLS özgün") },
  },
  {
    baslik: "Opsiyon / geçici kilit yönetimi", pillar: "tahsis-opsiyon", profil: "B2B_ACQUISITION", sinif: "mekanizma",
    intent: "Satış sürecinde birimi geçici kilitleme", seedQueries: ["proje satışında opsiyon nedir", "daire opsiyon", "birim kilitleme satış"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Müzakere sırasında birim başkasına gidebilir",
    claims: [{ iddia: "Birimi geçici opsiyonla kilitle; süre dolunca otomatik serbest kalır.", status: "PENDING", path: "DOĞRULA: opsiyon.kilit_bitis + option-expiry cron (net süre)", anchor: "db/2026-06-29_opsiyon-talep-onay.sql var ama süre kod-teyidi bekliyor" }],
    cta: "/emlakci", conversionEvent: "engagement", url: "/rehber/opsiyon-yonetimi",
    gate: { urunOzelligineBagli: gk(true, "opsiyon mekanizması"), aktifPersonaProblemi: gk(true, "aktif danışman kilit ihtiyacı"), savunulabilirCozum: gk(true, "opsiyon tablosu var"), dogalCta: gk(true, "/emlakci"), projedarsizJenerik: gk(false, "opsiyon+oto-süre mekanizması") },
  },
  {
    baslik: "Emlakçılarla proje satışını yönetmek", pillar: "muteahhit-emlakci-agi", profil: "B2B_ACQUISITION", sinif: "problem",
    intent: "Müteahhidin çok-emlakçı satışını kontrollü yönetmesi", seedQueries: ["emlakçılarla proje satışı", "konut projesi emlakçı ağı", "proje satış kanalları"],
    persona: ["muteahhit", "satis-yoneticisi"], pain: "Çok-emlakçıya açmak = kontrol/çakışma/güncellik kaosu",
    claims: [{ iddia: "Stoğunu kontrol kaybetmeden çok-emlakçıya güvenle dağıt (tahsis + çift-satış kalkanı + canlı tazelik).", status: "VERIFIED_DB", path: "db/2026-06-29_opsiyon-talep-onay.sql + supabase-schema.sql", anchor: "kalkan+tazelik doğrulandı; tahsis PENDING alt-iddiaya bağlı", verifiedAt: "2026-08-12" }],
    cta: "/muteahhit", conversionEvent: "intent", url: "/rehber/emlakci-ile-proje-satisi-yonetimi",
    gate: { urunOzelligineBagli: gk(true, "ağ+panel mekanizması"), aktifPersonaProblemi: gk(true, "aktif müteahhit dağıtım problemi"), savunulabilirCozum: gk(true, "kalkan+tazelik+tahsis"), dogalCta: gk(true, "/muteahhit"), projedarsizJenerik: gk(false, "çok-müteahhit kontrollü ağ") },
  },
  {
    baslik: "Yeni konut proje satış ağı (kategori tanımı)", pillar: "muteahhit-emlakci-agi", profil: "B2B_ACQUISITION", sinif: "kategori",
    intent: "Bu yeni satış modelinin ne olduğunu anlamak", seedQueries: ["yeni konut proje satış ağı", "konut projesi satış ağı", "müteahhit emlakçı satış ağı"],
    persona: ["muteahhit", "danisman"], pain: "Kategorinin adı/otoritesi yok",
    claims: [{ iddia: "Üretici-kontrollü, çok-müteahhitli canlı konut satış ağı.", status: "VERIFIED_POLICY", path: "ProjePazar-Sistem-Kurallari.md", anchor: "ürün tanımı", verifiedAt: "2026-08-12" }],
    cta: "/nedir", conversionEvent: "engagement", url: "/nedir",
    gate: { urunOzelligineBagli: gk(true, "ürün kategorisi"), aktifPersonaProblemi: gk(true, "profesyonel model anlama"), savunulabilirCozum: gk(true, "kategori tanımı"), dogalCta: gk(true, "/nedir→kayıt"), projedarsizJenerik: gk(false, "kategoriyi biz tanımlıyoruz") },
  },
  {
    baslik: "Şehir/ilçe bazında yeni konut projeleri (arz)", pillar: "yeni-konut-proje-satisi", profil: "INVENTORY_DISCOVERY", sinif: "arz",
    intent: "Bölgedeki yeni/sıfır projeleri keşfetmek", seedQueries: ["{il} yeni konut projeleri", "{ilce} sıfır konut projeleri", "{il} markalı konut projeleri"],
    persona: ["nitelikli-alici", "danisman"], pain: "Bölge envanterine tek yerden erişim yok",
    claims: [{ iddia: "Bölgedeki yeni konut projelerini güncel bilgiyle keşfet.", status: "VERIFIED_CODE", path: "src/app/konut-projeleri + src/app/proje/[slug]", anchor: "programmatic + icerik-esigi thin-guard", verifiedAt: "2026-08-12" }],
    cta: "/konut-projeleri", conversionEvent: "visibility", url: "/konut-projeleri/[il]/[ilce]",
    gate: { urunOzelligineBagli: gk(true, "arz sayfaları kod'da var"), aktifPersonaProblemi: gk(true, "nitelikli alıcı keşif"), savunulabilirCozum: gk(true, "gerçek envanter varlıkları"), dogalCta: gk(true, "INVENTORY: /konut-projeleri doğal hedef"), projedarsizJenerik: gk(false, "envanter Projedar'a özgü") },
  },
];

// ── NEGATİF / BORDERLINE FIXTURE (gate stres-testi — MUST OLMAMALI) ──────────
const neg = (baslik: string, seedQueries: string[], flags: [boolean, boolean, boolean, boolean, boolean], neden: string): Territory => ({
  baslik, pillar: "yeni-konut-proje-satisi", profil: "B2B_ACQUISITION", sinif: "problem",
  intent: neden, seedQueries, persona: ["nitelikli-alici"], pain: neden, claims: [], cta: "/nedir", conversionEvent: "visibility", url: `/rehber/${baslik.slice(0, 12)}`,
  gate: { urunOzelligineBagli: gk(flags[0], neden), aktifPersonaProblemi: gk(flags[1], neden), savunulabilirCozum: gk(flags[2], neden), dogalCta: gk(flags[3], neden), projedarsizJenerik: gk(flags[4], neden) },
});

const NEGATIF: Territory[] = [
  neg("emlak danışmanı maaşları", ["emlak danışmanı maaşı"], [false, false, false, false, true], "maaş bilgisi; ürünümüz değil"),
  neg("emlak ofisi dekorasyonu", ["emlak ofisi dekorasyon"], [false, false, false, false, true], "dekorasyon; alakasız"),
  neg("konut kredisi hesaplama", ["konut kredisi", "konut kredisi hesaplama"], [false, false, false, false, true], "banka/kredi; jenerik tüketici"),
  neg("tapu masrafı", ["tapu masrafı", "tapu harcı hesaplama"], [false, false, false, false, true], "tüketici vergi/masraf; jenerik"),
  neg("inşaat maliyeti hesaplama", ["inşaat maliyeti", "metrekare inşaat maliyeti"], [false, false, false, false, true], "maliyet; satış-dağıtım değil"),
  neg("gayrimenkul danışmanı nasıl olunur", ["gayrimenkul danışmanı nasıl olunur", "emlakçı nasıl olunur"], [false, false, false, true, true], "sektöre GİRMEMİŞ aday; aktif persona değil"),
  neg("kentsel dönüşüm süreci", ["kentsel dönüşüm", "riskli yapı"], [false, true, false, false, true], "genel mevzuat; Projedar'sız cevaplanır"),
  neg("ev alırken dikkat edilmesi gerekenler", ["ev alırken dikkat"], [false, false, false, false, true], "tüketici rehberi; jenerik"),
  neg("emlak vergisi ne kadar", ["emlak vergisi", "emlak vergisi hesaplama"], [false, false, false, false, true], "tüketici vergi; jenerik"),
  neg("mortgage faiz oranları", ["mortgage faiz", "konut kredisi faiz"], [false, false, false, false, true], "finans; alakasız"),
  neg("emlakçı komisyon oranı 2026", ["emlakçı komisyonu ne kadar"], [false, false, false, false, true], "tüketici komisyon merakı; ürün problemi değil"),
  neg("gayrimenkul yatırımı tavsiyeleri", ["gayrimenkul yatırımı"], [false, false, false, false, true], "genel yatırım içeriği; jenerik"),
  neg("tapu devri nasıl yapılır", ["tapu devri", "tapu işlemleri"], [false, false, false, false, true], "resmi işlem; jenerik"),
  neg("kira sözleşmesi örneği", ["kira sözleşmesi"], [false, false, false, false, true], "kiralama; alakasız"),
  neg("en iyi konut projesi hangisi", ["en iyi konut projesi"], [true, false, false, false, true], "editöryel/subjektif; ürün problemi değil, arz da değil"),
];

export const TERRITORY: Territory[] = [...GERCEK, ...NEGATIF];

// ── Karar fonksiyonları ──────────────────────────────────────────────────────
export function tier(t: Territory): Tier {
  const g = t.gate;
  const ilkDort = g.urunOzelligineBagli.value && g.aktifPersonaProblemi.value && g.savunulabilirCozum.value && g.dogalCta.value;
  if (ilkDort && !g.projedarsizJenerik.value) return "MUST";
  if (ilkDort && g.projedarsizJenerik.value) return "SUPPORT";
  return "OPTIONAL";
}

/** PENDING claim içeren territory yayınlanamaz. */
export function yayinlanabilir(t: Territory): boolean {
  return t.claims.length > 0 && t.claims.every((c) => c.status !== "PENDING");
}

export function pendingClaimTerritoryleri(h: Territory[] = TERRITORY): Territory[] {
  return h.filter((t) => t.claims.some((c) => c.status === "PENDING"));
}

/** Cannibalization: aynı seedQuery'yi farklı URL'lerle hedefleyen MUST territory'ler. */
export function cannibalization(h: Territory[] = TERRITORY): { sorgu: string; urls: string[] }[] {
  const musts = h.filter((t) => tier(t) === "MUST");
  const byQ: Record<string, Set<string>> = {};
  for (const t of musts) for (const q of t.seedQueries) (byQ[q] ??= new Set()).add(t.url);
  return Object.entries(byQ).filter(([, u]) => u.size > 1).map(([sorgu, u]) => ({ sorgu, urls: [...u] }));
}

export function mustHavelar(h: Territory[] = TERRITORY): Territory[] {
  return h.filter((t) => tier(t) === "MUST");
}

export interface Rapor {
  toplam: number;
  tier: Record<Tier, number>;
  profil: Record<GateProfil, number>;
  pendingClaim: number;
  cannibalization: { sorgu: string; urls: string[] }[];
  pillarDagilimi: Record<string, number>;
  yayinlanamaz: number;
}
export function rapor(h: Territory[] = TERRITORY): Rapor {
  const tierD: Record<Tier, number> = { MUST: 0, SUPPORT: 0, OPTIONAL: 0 };
  const profD: Record<GateProfil, number> = { B2B_ACQUISITION: 0, INVENTORY_DISCOVERY: 0 };
  const pillarD: Record<string, number> = {};
  for (const t of h) {
    tierD[tier(t)]++;
    profD[t.profil]++;
    if (tier(t) === "MUST") pillarD[t.pillar] = (pillarD[t.pillar] ?? 0) + 1;
  }
  return {
    toplam: h.length,
    tier: tierD,
    profil: profD,
    pendingClaim: pendingClaimTerritoryleri(h).length,
    cannibalization: cannibalization(h),
    pillarDagilimi: pillarD,
    yayinlanamaz: mustHavelar(h).filter((t) => !yayinlanabilir(t)).length,
  };
}
