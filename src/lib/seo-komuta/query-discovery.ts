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
