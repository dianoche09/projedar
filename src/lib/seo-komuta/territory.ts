/**
 * Projedar Semantic Territory Map v2 — SEO Komuta Merkezi kaynak haritası + CLAIM REGISTRY.
 *
 * SIRA (kullanıcı kuralı): uzmanlık → problem → kullanıcı → territory → keyword-data.
 * Burada KEYWORD VOLUME YOK. Yapı: Territory (konu) → intent → seedQueries (gerçek dil, keyword
 * research bunu 100-300 sorguya genişletir). `sorgu` ≠ `territory` (v1 hatası) düzeltildi.
 *
 * DETERMİNİSTİK GATE (subjektif 0-1 puan YOK — 5 boolean kanıt):
 *  1 urunOzelligineBagli   — doğrudan bir ürün özelliğine bağlı mı?
 *  2 aktifPersonaProblemi   — AKTİF hedef persona problemi mi? (aday/heves değil)
 *  3 savunulabilirCozum     — Projedar ürün/iş-modeli/operasyonundan somut cevap verebiliyor mu?
 *  4 dogalPersonaCta        — CTA doğal olarak /emlakci veya /muteahhit'e gidiyor mu?
 *  5 projedarsizJenerik     — Projedar OLMADAN da aynı cevaplanır mı? (MUST için FALSE olmalı)
 *  İlk4 true + 5 false → MUST · İlk4 true + 5 true → SUPPORT · diğer → OPTIONAL.
 *
 * CLAIM REGISTRY: her territory `kanit[]` taşır (src/db/marka-kurali). Ürün gerçeği değişirse
 * harita yanlış iddia üretmesin. claim-policy: absolutist ifade (imkânsız/garanti/%100 doğru) YOK.
 * KPI = trafik değil → kayıt hunisi (bkz KPI_HUNISI). Rakip adı bu haritada yok.
 */

export type Persona = "danisman" | "ofis" | "muteahhit" | "satis-yoneticisi" | "nitelikli-alici";
export type Sinif = "kategori" | "problem" | "mekanizma" | "arz";
export type Tier = "MUST" | "SUPPORT" | "OPTIONAL";
export type Cta = "/emlakci" | "/muteahhit" | "/nedir" | "/konut-projeleri" | "/guven";

/** 6 ana pillar (topic authority). Destekleyici içerikler bunların altında yaşar. */
export const PILLARLAR = {
  "yeni-konut-proje-satisi": "Yeni Konut Projesi Satışı",
  "canli-stok-fiyat": "Canlı Proje Stoğu ve Fiyat Yönetimi",
  "tahsis-opsiyon": "Daire Tahsisi ve Opsiyon Yönetimi",
  "musteri-kayit-cakisma": "Müşteri Kaydı ve Çakışma Yönetimi",
  "komisyon-hakedis": "Proje Satış Komisyonu ve Hakediş",
  "muteahhit-emlakci-agi": "Müteahhit–Emlakçı Proje Satış Ağı",
} as const;
export type PillarKey = keyof typeof PILLARLAR;

/** KPI hunisi (tek metrik değil): her territory bir conversionEvent'e bağlanır. */
export const KPI_HUNISI = ["visibility", "engagement", "intent", "conversion", "activation"] as const;
export type KpiEvent = (typeof KPI_HUNISI)[number];

export interface GateKanit {
  urunOzelligineBagli: boolean;
  aktifPersonaProblemi: boolean;
  savunulabilirCozum: boolean;
  dogalPersonaCta: boolean;
  projedarsizJenerik: boolean;
}

export interface Territory {
  baslik: string; // KONU (keyword değil)
  pillar: PillarKey;
  sinif: Sinif;
  intent: string;
  seedQueries: string[]; // gerçek dil adayları (keyword research genişletir)
  persona: Persona[];
  pain: string;
  projedarCozum: string; // somut cevap (ürün/iş-modeli/operasyon)
  publicClaim: string; // ship edilecek iddia — claim-policy uyumlu (absolutist değil)
  kanit: string[]; // product-truth ref (src/db/marka-kurali) — DOĞRULA: kod-teyidi bekleyen
  cta: Cta;
  conversionEvent: KpiEvent;
  url: string;
  gate: GateKanit;
}

const G = (
  a: boolean, b: boolean, c: boolean, d: boolean, e: boolean,
): GateKanit => ({ urunOzelligineBagli: a, aktifPersonaProblemi: b, savunulabilirCozum: c, dogalPersonaCta: d, projedarsizJenerik: e });

export const TERRITORY: Territory[] = [
  // ── KATEGORİ SAHİPLİĞİ ─────────────────────────────────────────────────────
  { baslik: "Yeni konut proje satış ağı (kategori tanımı)", pillar: "muteahhit-emlakci-agi", sinif: "kategori",
    intent: "Bu yeni satış modelinin ne olduğunu anlamak", seedQueries: ["yeni konut proje satış ağı", "konut projesi satış ağı", "müteahhit emlakçı satış ağı"],
    persona: ["muteahhit", "danisman"], pain: "Çok-müteahhitli canlı ortak havuz kavramının adı/otoritesi yok",
    projedarCozum: "Çok-müteahhitli, üretici-kontrollü tek canlı ortak havuz — kategorinin kendisi.",
    publicClaim: "Üretici-kontrollü, çok-müteahhitli canlı konut satış ağı.", kanit: ["ProjePazar-Sistem-Kurallari.md", "master-identity-kanonik"],
    cta: "/nedir", conversionEvent: "engagement", url: "/nedir", gate: G(true, true, true, true, false) },
  { baslik: "Canlı konut stoğu (tazelik/tek-kaynak)", pillar: "canli-stok-fiyat", sinif: "kategori",
    intent: "Stok/fiyat bilgisinin canlı ve tek-kaynak olmasını anlamak", seedQueries: ["canlı konut stoğu", "canlı proje stoğu", "güncel proje stok fiyat"],
    persona: ["danisman", "muteahhit"], pain: "Stok/fiyat eskiyor, farklı kanallarda çelişiyor",
    projedarCozum: "Fiyat/durum yalnız birim tablosunda; her yazışta son_guncelleme=now, tazelik rozeti.",
    publicClaim: "Bir daire değişir, ağ anında güncellenir; fiyat canlı değerden basılır.", kanit: ["supabase-schema.sql:109 (son_guncelleme)", "db/2026-08-05_guven-skoru.sql (tazelik)", "DEĞİŞMEZ #2/#5"],
    cta: "/nedir", conversionEvent: "engagement", url: "/nedir", gate: G(true, true, true, true, false) },

  // ── PROBLEM SAHİPLİĞİ ──────────────────────────────────────────────────────
  { baslik: "Müşteri çakışması / çift-satış (danışman hakkı)", pillar: "musteri-kayit-cakisma", sinif: "problem",
    intent: "Danışmanın müşteri/satış hakkının korunması", seedQueries: ["proje satışında müşteri çakışması", "aynı müşteri iki emlakçı", "müşteri kaydı çakışması", "aynı dairenin iki danışmana satılması"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Aynı daire iki danışmana kilitlenip çakışma/mükerrer satış",
    projedarCozum: "Aktif opsiyon için DB'de partial unique index (opsiyon_tek_aktif) + birim senkron trigger; uygulama katmanına güvenmez.",
    publicClaim: "Çift-satış kalkanı veritabanı seviyesindedir; aynı birim aynı anda iki danışmana kilitlenmez.", kanit: ["db/2026-06-29_opsiyon-talep-onay.sql (opsiyon_tek_aktif + opsiyon_birim_senkron)", "DEĞİŞMEZ #3"],
    cta: "/emlakci", conversionEvent: "intent", url: "/rehber/musteri-cakismasi-cift-satis", gate: G(true, true, true, true, false) },
  { baslik: "Müşteri kaydının proje bazında korunması", pillar: "musteri-kayit-cakisma", sinif: "problem",
    intent: "Danışmanın getirdiği müşterinin kaydının korunması", seedQueries: ["proje müşteri kaydı", "müşteri kaydı nasıl korunur", "emlakçı müşteri kaydı"],
    persona: ["danisman", "ofis"], pain: "Getirdiği müşteri başka danışmana/müteahhide kayabilir",
    projedarCozum: "Claim/opsiyon proje bazında görünür; conflict tespiti danışman hakkını korur.",
    publicClaim: "Müşteri kaydınız proje bazında görünür ve korunur.", kanit: ["DOĞRULA: opsiyon/claim akışı src/app/(emlakci|uretici)", "DEĞİŞMEZ #3 kültürü"],
    cta: "/emlakci", conversionEvent: "intent", url: "/rehber/musteri-kaydi-koruma", gate: G(true, true, true, true, false) },
  { baslik: "Güncel proje stok & fiyat takibi", pillar: "canli-stok-fiyat", sinif: "problem",
    intent: "Danışmanın/satış ekibinin güncel stok-fiyata güvenmesi", seedQueries: ["güncel proje stok listesi", "proje stok takibi", "daire müsaitlik takibi"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Eski stok/fiyatla müşteriye yanlış bilgi",
    projedarCozum: "Tek doğru kaynak (birim tablosu) + 'X önce güncellendi' + N günden eski → stale uyarısı.",
    publicClaim: "Tek doğru kaynaktan canlı stok ve fiyat; güncellik görünür.", kanit: ["DEĞİŞMEZ #2/#5", "src/lib/stok.ts", "supabase-schema.sql (son_guncelleme)"],
    cta: "/emlakci", conversionEvent: "engagement", url: "/rehber/guncel-proje-stok-takibi", gate: G(true, true, true, true, false) },
  { baslik: "Proje satış komisyonu ve danışman hakedişi", pillar: "komisyon-hakedis", sinif: "problem",
    intent: "Danışmanın komisyon/hakediş güvencesi", seedQueries: ["proje satış komisyonu", "emlakçı komisyon hakedişi", "müteahhit projesi emlakçı komisyonu"],
    persona: ["danisman", "ofis"], pain: "Komisyon belirsiz/korumasız; hakediş takip edilemiyor",
    projedarCozum: "Komisyonu müteahhit tanımlar (komisyon_tip/deger); Projedar bu satış komisyonuna ortak olmaz; hakediş satışla tetiklenir.",
    publicClaim: "Komisyonunu müteahhit tanımlar; Projedar satış komisyonuna ortak olmaz — kazancının %100'ü senin.", kanit: ["db/2026-08-09_emlakci-kazanc-ozet.sql (komisyon_tip/deger)", "komisyonsuz-ifadesi-yasak (marka-kuralı)"],
    cta: "/emlakci", conversionEvent: "intent", url: "/rehber/proje-satis-komisyonu", gate: G(true, true, true, true, false) },

  // ── ÜRÜN MEKANİZMASI ───────────────────────────────────────────────────────
  { baslik: "Daire tahsisi (granüler görünürlük kontrolü)", pillar: "tahsis-opsiyon", sinif: "mekanizma",
    intent: "Üreticinin kime hangi stoğu göstereceğini kontrol etmesi", seedQueries: ["daire tahsisi nedir", "emlakçıya proje tahsisi", "daire tahsis sistemi"],
    persona: ["muteahhit", "satis-yoneticisi", "danisman"], pain: "Stoğu çok-emlakçıya açınca kontrol kaybı",
    projedarCozum: "Proje/blok/kat/birim bazında granüler tahsis; emlakçı yalnız tahsisli birimleri görür.",
    publicClaim: "Kime hangi projeyi/birimi göstereceğini tek panelden granüler tahsis edersin.", kanit: ["DEĞİŞMEZ #1 (görünürlük=tahsis, RLS)", "DOĞRULA: tahsis tablosu/RLS"],
    cta: "/muteahhit", conversionEvent: "engagement", url: "/rehber/daire-tahsis-sistemi", gate: G(true, true, true, true, false) },
  { baslik: "Opsiyon / geçici kilit yönetimi", pillar: "tahsis-opsiyon", sinif: "mekanizma",
    intent: "Satış sürecinde birimi geçici kilitleme", seedQueries: ["proje satışında opsiyon nedir", "daire opsiyon", "birim kilitleme satış"],
    persona: ["danisman", "satis-yoneticisi"], pain: "Müzakere sırasında birim başkasına gidebilir",
    projedarCozum: "Geçici opsiyon kilidi (kilit_bitis + oto-süre cron); DB'de tekil-aktif kısıt.",
    publicClaim: "Birimi geçici opsiyonla kilitle; süre dolunca otomatik serbest kalır.", kanit: ["DOĞRULA: opsiyon.kilit_bitis + option-expiry cron (net süre kodda teyit edilecek)", "db/2026-06-29_opsiyon-talep-onay.sql"],
    cta: "/emlakci", conversionEvent: "engagement", url: "/rehber/opsiyon-yonetimi", gate: G(true, true, true, true, false) },
  { baslik: "Güven protokolü (doğrulama + tazelik + kalkan)", pillar: "muteahhit-emlakci-agi", sinif: "mekanizma",
    intent: "Ağın neden güvenilir olduğunu anlamak", seedQueries: ["güven protokolü", "doğrulanmış müteahhit", "güvenli proje satışı"],
    persona: ["danisman", "muteahhit"], pain: "Kime/neye güvenilir bilinmiyor",
    projedarCozum: "Doğrulanmış üretici + tazelik rozeti + DB çift-satış kalkanı.",
    publicClaim: "Doğrulanmış üretici, görünür güncellik ve çift-satış kalkanı.", kanit: ["db/2026-08-05_guven-skoru.sql", "/guven sayfası"],
    cta: "/guven", conversionEvent: "engagement", url: "/guven", gate: G(true, true, true, true, false) },

  // ── MÜTEAHHİT B2B (düşük hacim / yüksek değer — ana kanal SEO olmasa da sayfa yapılır) ──
  { baslik: "Emlakçılarla proje satışını yönetmek", pillar: "muteahhit-emlakci-agi", sinif: "problem",
    intent: "Müteahhidin çok-emlakçı satışını kontrollü yönetmesi", seedQueries: ["emlakçılarla proje satışı", "konut projesi emlakçı ağı", "proje satış kanalları"],
    persona: ["muteahhit", "satis-yoneticisi"], pain: "Çok-emlakçıya açmak = kontrol/çakışma/güncellik kaosu",
    projedarCozum: "Stok+fiyat+tahsis+komisyon+claim tek panelde; çok-emlakçı tek canlı gerçekte.",
    publicClaim: "Stoğunu kontrol kaybetmeden çok-emlakçıya güvenle dağıt.", kanit: ["DEĞİŞMEZ #1/#2/#3", "üretici paneli"],
    cta: "/muteahhit", conversionEvent: "intent", url: "/rehber/emlakci-ile-proje-satisi-yonetimi", gate: G(true, true, true, true, false) },

  // ── ARZ SAHİPLİĞİ (birinci-sınıf territory; programmatic entity SEO) ────────
  { baslik: "Şehir/ilçe bazında yeni konut projeleri (arz)", pillar: "yeni-konut-proje-satisi", sinif: "arz",
    intent: "Bölgedeki yeni/sıfır projeleri keşfetmek", seedQueries: ["{il} yeni konut projeleri", "{ilce} sıfır konut projeleri", "{il} markalı konut projeleri"],
    persona: ["nitelikli-alici", "danisman"], pain: "Bölgedeki güncel proje envanterine tek yerden erişim yok",
    projedarCozum: "Programmatic /konut-projeleri/[il]/[ilce] + /proje/[slug] + /firma/[slug]; gerçek varlık sayfaları.",
    publicClaim: "Bölgedeki yeni konut projelerini güncel bilgiyle keşfet.", kanit: ["src/app/konut-projeleri", "src/app/proje/[slug]", "src/lib/seo/icerik-esigi.ts (thin-guard)"],
    cta: "/konut-projeleri", conversionEvent: "visibility", url: "/konut-projeleri/[il]/[ilce]", gate: G(true, true, true, false, false) },

  // ── GATE'İN SEÇTİĞİNİ KANITLAYAN ÖRNEKLER (MUST DEĞİL) ──────────────────────
  { baslik: "Gayrimenkul danışmanı nasıl olunur", pillar: "muteahhit-emlakci-agi", sinif: "problem",
    intent: "Sektöre GİRMEYİ düşünen kişi (aday, aktif değil)", seedQueries: ["gayrimenkul danışmanı nasıl olunur", "emlakçı nasıl olunur", "emlakçılık"],
    persona: ["danisman"], pain: "Mesleğe başlama bilgisi",
    projedarCozum: "Projedar aktif danışmana stok/güven sağlar; mesleğe giriş rehberi bizim uzmanlığımız değil.",
    publicClaim: "(destek içerik — mesleğe giriş)", kanit: [],
    cta: "/emlakci", conversionEvent: "visibility", url: "/rehber/gayrimenkul-danismani", gate: G(false, false, false, true, true) },
  { baslik: "Kentsel dönüşüm (genel)", pillar: "yeni-konut-proje-satisi", sinif: "problem",
    intent: "Kentsel dönüşüm süreci/hakları (genel bilgi)", seedQueries: ["kentsel dönüşüm", "kentsel dönüşüm süreci", "riskli yapı"],
    persona: ["nitelikli-alici", "muteahhit"], pain: "Süreç/mevzuat bilgisi",
    projedarCozum: "Projedar satış-dağıtım katmanı; kentsel dönüşüm mevzuatı bizim özgün alanımız değil.",
    publicClaim: "(opsiyonel top-funnel — Projedar'sız da cevaplanır)", kanit: [],
    cta: "/nedir", conversionEvent: "visibility", url: "/rehber/kentsel-donusum", gate: G(false, true, false, false, true) },
];

/**
 * Deterministik tier: 5 boolean → MUST/SUPPORT/OPTIONAL.
 * ARZ istisnası: arz (inventory ownership) 3. birinci-sınıf pillar. CTA'sı /konut-projeleri
 * (buyer-facing product) → gate4 (/emlakci|/muteahhit sign-up funnel) beklenmez; gate1-2-3 +
 * jenerik-değil yeter. Aksi halde stratejik pillar yanlışlıkla OPTIONAL'a düşerdi.
 */
export function tier(t: Territory): Tier {
  const g = t.gate;
  const ilkUc = g.urunOzelligineBagli && g.aktifPersonaProblemi && g.savunulabilirCozum;
  const ilkDort = ilkUc && g.dogalPersonaCta;
  if (t.sinif === "arz") return ilkUc && !g.projedarsizJenerik ? "MUST" : "OPTIONAL";
  if (ilkDort && !g.projedarsizJenerik) return "MUST";
  if (ilkDort && g.projedarsizJenerik) return "SUPPORT";
  return "OPTIONAL";
}

export function mustHavelar(harita: Territory[] = TERRITORY): Territory[] {
  return harita.filter((t) => tier(t) === "MUST");
}

/** Claim registry denetimi: kanıtı OLMAYAN ya da DOĞRULA taşıyan MUST territory'ler (riskli iddia). */
export function kanitsizIddialar(harita: Territory[] = TERRITORY): Territory[] {
  return harita.filter(
    (t) => tier(t) === "MUST" && (t.kanit.length === 0 || t.kanit.some((k) => k.startsWith("DOĞRULA"))),
  );
}

export function pillarDagilimi(harita: Territory[] = TERRITORY): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of harita) out[t.pillar] = (out[t.pillar] ?? 0) + 1;
  return out;
}
