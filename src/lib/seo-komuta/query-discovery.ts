/**
 * Query Discovery Matrix — 8 MUST territory'nin gerçek arama diline eşlenmesi.
 * (SEO Komuta Merkezi zinciri: Territory → Gate → QUERY DISCOVERY → SERP → içerik.)
 *
 * KAYNAK: OpenSEO get_keyword_metrics (2026-08-12). volume/kd = ANNOTATION (eleme kriteri DEĞİL).
 * BULGU (kritik): B2B problem/mekanizma/kategori sorguları ölçülebilir hacim taşımıyor (null);
 * yalnız ARZ (şehir/ilçe proje) sorgularında gerçek talep var. → B2B = entity/dönüşüm katmanı,
 * ARZ = organik trafik motoru. NOT: null = ölçüm-eşiği-altı, "kimse aramıyor" değil (düşük-hacim/
 * yüksek-değer B2B sayfası yine yapılır, ama trafik beklentisiyle değil).
 *
 * KARAR: her query için tek çıktı — STRENGTHEN (mevcut landing güçlendir) / CREATE (yeni sayfa) /
 * ABSORB (başka territory/pillar altında kapsa) / REJECT.
 * TERRITORY GAP: hiçbir territory'ye oturmayan + yüksek stratejik uygunluklu query = yeni territory adayı.
 */

export type Karar = "STRENGTHEN" | "CREATE" | "ABSORB" | "REJECT";
export type Niyet = "informational" | "commercial" | "transactional" | "navigational" | "unknown";

export interface QueryRow {
  territory: string; // MUST territory başlığı, ya da "GAP"
  query: string;
  volume: number | null; // OpenSEO annotation (null = eşik-altı)
  kd: number | null;
  intent: Niyet;
  serpTipi: string; // gözlem/known: portal / calculator / gov / mixed / none-measured
  mevcutUrl?: string;
  canonicalTarget: string;
  karar: Karar;
  neden: string;
}

// null volume = ölçülemedi (B2B niş). Gerçek hacimliler yalnız ARZ.
const N = null;

export const MATRIX: QueryRow[] = [
  // ── T1 Müşteri çakışması / çift-satış → STRENGTHEN /emlakci pillar (entity, trafik değil) ──
  { territory: "Müşteri çakışması / çift-satış", query: "proje satışında müşteri çakışması", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/musteri-cakismasi-cift-satis", karar: "STRENGTHEN", neden: "Hacim yok ama ürün-gerçeğine en sıkı bağlı problem; pillar entity+dönüşüm için" },
  { territory: "Müşteri çakışması / çift-satış", query: "aynı müşteri iki emlakçı", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/musteri-cakismasi-cift-satis", karar: "ABSORB", neden: "Aynı intent varyantı → pillar altında kapsa" },
  { territory: "Müşteri çakışması / çift-satış", query: "müşteri kaydı çakışması", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/musteri-cakismasi-cift-satis", karar: "ABSORB", neden: "Varyant" },

  // ── T2 Güncel stok-fiyat → STRENGTHEN ──
  { territory: "Güncel proje stok & fiyat takibi", query: "proje stok takibi", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/guncel-proje-stok-takibi", karar: "STRENGTHEN", neden: "Ürün mekanizması (tek-kaynak+tazelik) ile birebir" },
  { territory: "Güncel proje stok & fiyat takibi", query: "konut stok yönetimi", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/muteahhit", karar: "ABSORB", neden: "Müteahhit yönü → /muteahhit landing altında" },

  // ── T3 Komisyon-hakediş → STRENGTHEN ──
  { territory: "Proje satış komisyonu ve hakediş", query: "proje satış komisyonu", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/proje-satis-komisyonu", karar: "STRENGTHEN", neden: "Emlakçı kayıt-funnel'ına doğrudan bağlı" },
  { territory: "Proje satış komisyonu ve hakediş", query: "sıfır konut satış komisyonu", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/proje-satis-komisyonu", karar: "ABSORB", neden: "Varyant" },

  // ── T4 Tahsis → STRENGTHEN /muteahhit ──
  { territory: "Daire tahsisi", query: "daire tahsisi", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/daire-tahsis-sistemi", karar: "STRENGTHEN", neden: "Kategori-tanımlayıcı mekanizma; /sozluk+rehber ile entity" },
  { territory: "Daire tahsisi", query: "acente stok kotası", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/rehber/daire-tahsis-sistemi", karar: "ABSORB", neden: "Varyant" },

  // ── T5 Opsiyon → ABSORB (mekanizma; /sozluk) ──
  { territory: "Opsiyon / geçici kilit", query: "emlakta opsiyon nedir", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/sozluk/opsiyon", karar: "CREATE", neden: "Sözlük-tipi tanım sayfası (küçük, entity); tahsis pillar'ına bağlı" },

  // ── T6 Emlakçı yönetimi → STRENGTHEN /muteahhit ──
  { territory: "Emlakçılarla proje satışını yönetmek", query: "konut projesi satış yönetimi", volume: N, kd: N, intent: "commercial", serpTipi: "none-measured", canonicalTarget: "/muteahhit", karar: "STRENGTHEN", neden: "Yüksek ticari değer; /muteahhit landing güçlendir" },
  { territory: "Emlakçılarla proje satışını yönetmek", query: "çok emlakçı proje satışı", volume: N, kd: N, intent: "commercial", serpTipi: "none-measured", canonicalTarget: "/muteahhit", karar: "ABSORB", neden: "Varyant" },

  // ── T7 Kategori → STRENGTHEN /nedir ──
  { territory: "Yeni konut proje satış ağı (kategori)", query: "konut projesi satış platformu", volume: N, kd: N, intent: "commercial", serpTipi: "none-measured", canonicalTarget: "/nedir", karar: "STRENGTHEN", neden: "Kategori entity; /nedir + marka" },
  { territory: "Yeni konut proje satış ağı (kategori)", query: "proje satış ağı", volume: N, kd: N, intent: "informational", serpTipi: "none-measured", canonicalTarget: "/nedir", karar: "ABSORB", neden: "Varyant" },

  // ── T8 ARZ → CREATE programmatic (TEK gerçek trafik motoru) ──
  { territory: "Şehir/ilçe yeni konut projeleri (arz)", query: "izmir konut projeleri", volume: 720, kd: 3, intent: "navigational", serpTipi: "portal (sahibinden/hepsiemlak/emlakjet/endeksa)", mevcutUrl: "/konut-projeleri", canonicalTarget: "/konut-projeleri/izmir", karar: "CREATE", neden: "GERÇEK hacim; il sayfası. Portal duvarı → ilçe düzeyinde daha kazanılabilir" },
  { territory: "Şehir/ilçe yeni konut projeleri (arz)", query: "ankara yeni konut projeleri", volume: 140, kd: 0, intent: "navigational", serpTipi: "portal", mevcutUrl: "/konut-projeleri", canonicalTarget: "/konut-projeleri/ankara", karar: "CREATE", neden: "KD0 + gerçek hacim; il sayfası" },
  { territory: "Şehir/ilçe yeni konut projeleri (arz)", query: "çankaya konut projeleri", volume: 40, kd: 12, intent: "informational", serpTipi: "portal/mixed", mevcutUrl: "/konut-projeleri", canonicalTarget: "/konut-projeleri/ankara/cankaya", karar: "CREATE", neden: "İlçe düzeyi = uzun-kuyruk, daha kazanılabilir; asıl ölçek burada" },
  { territory: "Şehir/ilçe yeni konut projeleri (arz)", query: "yeni konut projeleri istanbul", volume: 70, kd: N, intent: "navigational", serpTipi: "portal (DA-90)", mevcutUrl: "/konut-projeleri", canonicalTarget: "/konut-projeleri/istanbul", karar: "CREATE", neden: "Hacim var ama portal duvarı sert → il sayfası + ilçe uzun-kuyruk" },
];

export function kararDagilimi(m: QueryRow[] = MATRIX): Record<Karar, number> {
  const out: Record<Karar, number> = { STRENGTHEN: 0, CREATE: 0, ABSORB: 0, REJECT: 0 };
  for (const r of m) out[r.karar]++;
  return out;
}

/** Ölçülebilir hacimli (gerçek talep) query'ler — trafik motoru adayları. */
export function hacimliler(m: QueryRow[] = MATRIX): QueryRow[] {
  return m.filter((r) => r.volume != null && r.volume > 0).sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
}

/**
 * Territory Gap: hiçbir MUST territory'ye oturmayan + yüksek-fit query = yeni territory adayı.
 * Bu taramada tüm query'ler mevcut territory'lere oturdu → GAP yok. İleride Command Center
 * yeni query akışında oturmayanları 'NEW TERRITORY CANDIDATE — review required' olarak işaretler.
 */
export function territoryGaplar(m: QueryRow[] = MATRIX): QueryRow[] {
  return m.filter((r) => r.territory === "GAP");
}

// ── v2 kanıtları (independent discovery + SERP validation, 2026-08-12) ─────────
/**
 * INDEPENDENT DISCOVERY (research_keywords 5 seed → 750 keyword ideas, seed-annotation DEĞİL):
 * Projedar B2B kavramlarına + ölçülebilir hacme sahip yalnız 2 çıktı ("proje satışı nasıl yapılır" 10,
 * "gizli müşteri kaydı" alakasız). Gerisi gürültü. → B2B'nin bağımsız arama sözlüğü ölçülemez.
 * (null≠sıfır: long-tail/AI/entity için sayfa var, trafik için değil.) Territory Gap: bağımsız
 * havuzdan yeni B2B territory ÇIKMADI (kapalı-devre değil bu sefer — gerçekten yok).
 *
 * SERP VALIDATION (get_serp_results, ARZ):
 *  - intent = project-discovery (Projedar /konut-projeleri yapısına uyar).
 *  - il (izmir/ankara) = DA-90 portal duvarı üstte; ilçe (çankaya) = aggregator+local_pack, DAHA KAZANILABİLİR.
 *  - rakip aggregator'lar GERÇEK proje sayısıyla ranking (ankaraproje.net "34/17 aktif proje") → envanter şart.
 * ROUTE EXISTENCE: B2B /rehber slug'ları YOK → CREATE (STRENGTHEN değil). ARZ route + /sozluk VAR.
 */

/** Inventory Quality Gate: il/ilçe ARZ sayfası ancak yeterli gerçek+güncel envanterle index'lenir. */
export interface EnvanterDurum {
  konum: string; // il ya da il/ilçe
  gercekProje: number; // eşik-geçen (icerik-esigi) proje sayısı
  guncel: boolean; // veriler taze mi
}
export const INVENTORY_ESIK = 3; // < eşik → thin; parent altında ABSORB/NOINDEX (mevcut icerik-esigi.ts mantığı)
export function inventoryGateGecer(e: EnvanterDurum): boolean {
  return e.gercekProje >= INVENTORY_ESIK && e.guncel;
}
export function arzKarar(e: EnvanterDurum): Karar {
  return inventoryGateGecer(e) ? "CREATE" : "ABSORB"; // ABSORB = parent il/hub altında, ilçe sayfası açma
}

/** İKİ scorecard (B2B'yi trafik metriğiyle ölçme — kullanıcı kuralı). */
export const SCORECARDS = {
  B2B_AUTHORITY: ["visibility(impression/pos)", "product-landing-geçiş", "lead", "activation(nitelikli/belgeli hesap)"],
  INVENTORY_SEO: ["impressions", "organic-traffic", "project-engagement", "professional/buyer-action"],
} as const;

/**
 * SİSTEMİN kanıta-göre seçtiği ilk 3 aksiyon (biz seçmiyoruz). Sıralama = ölçülebilir talep × kazanılabilirlik.
 */
export const SISTEM_SECIMI = [
  { sira: 1, aksiyon: "ARZ ilçe sayfaları (envanter-eşiği geçen)", scorecard: "INVENTORY_SEO", gerekce: "Tek ölçülebilir talep + ilçe SERP kazanılabilir + intent match; Inventory Gate ile thin-koruma", kanit: "SERP: çankaya aggregator/local_pack; icerik-esigi mevcut" },
  { sira: 2, aksiyon: "ARZ il hub'ları (izmir/ankara) + ilçe besleme", scorecard: "INVENTORY_SEO", gerekce: "Gerçek hacim (720/140) ama üst-3 portal duvarı → hub olarak mid + ilçe'yi besler", kanit: "SERP: il-üst DA-90; ankaraproje.net mid ranking" },
  { sira: 3, aksiyon: "Bir B2B entity pillar (çift-satış → /emlakci) CREATE", scorecard: "B2B_AUTHORITY", gerekce: "Trafik DEĞİL — entity/AI-cevap/dönüşüm; claim VERIFIED_DB; funnel /emlakci", kanit: "independent-discovery: B2B ölçülebilir talep yok → Authority scorecard" },
] as const;
