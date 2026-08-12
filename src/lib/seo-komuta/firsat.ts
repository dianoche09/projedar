/**
 * SEO Komuta Merkezi — Fırsat Skorlama katmanı (deterministik).
 *
 * Kullanıcı formülü:
 *   skor = hacim × organik-kazanılabilirlik × konu-yakınlığı × ticari-değer ÷ tazelik-riski
 *
 * Neden tek metrik (hacim) YETMEZ (field-lesson, 2026-08-12):
 *  - OpenSEO "competition: LOW" = Google Ads REKLAMVEREN rekabeti, organik SEO zorluğu DEĞİL.
 *    Organik için `kd` (keyword difficulty) kullanılır.
 *  - kd bile yetmez: gerçek TOP10'u kim tutuyor? (GİB/gov + sahibinden/hepsiemlak gibi DA-90 portal =
 *    kilitli; hesapkurdu/hangikredi = güçlü ama kırılabilir; zayıf blog = açık). Bu yüzden `serpGucu`
 *    ayrı faktör: gerçek SERP gözleminden (get_serp_results 2026-08-12) türetilir.
 *
 * Bu katman "Score" adımıdır (Collect → Diagnose → SCORE → Act → Verify → Learn).
 * Veri şu an elle-doğrulanmış snapshot; sonraki adım OpenSEO API ile Collect'i otomatikleştirmek.
 */

export type Niyet = "informational" | "commercial" | "transactional" | "navigational";

export interface FirsatGirdi {
  kelime: string;
  hacim: number; // aylık arama (OpenSEO get_keyword_metrics)
  kd: number; // keyword difficulty 0-100 (OpenSEO — organik zorluk)
  serpGucu: number; // 0..1 — gerçek TOP10 ne kadar KIRILGAN (1=zayıf/açık, 0=GİB/DA-90 kilidi)
  fit: number; // 0..1 — Projedar konu/kitle yakınlığı (emlakçı/müteahhit core≈1, tüketici≈0.4)
  ticari: number; // 0..1 — B2B dönüşüm değeri
  tazelik: 1 | 2 | 3; // güncelleme/risk maliyeti (1=evergreen, 3=yıllık vergi oranı/rayiç değişir)
  niyet: Niyet;
  serpNot: string; // gözlemlenen TOP10 özeti (kanıt izi)
}

export interface FirsatSonuc extends FirsatGirdi {
  kazanilabilirlik: number;
  skor: number;
}

/** kd'yi (0..1, düşük kd=yüksek) ve gerçek serpGucu'nu birleştir. İkisi eşit ağırlık. */
export function kazanilabilirlik(kd: number, serpGucu: number): number {
  const kdSkor = (100 - Math.min(Math.max(kd, 0), 100)) / 100;
  return kdSkor * 0.5 + Math.min(Math.max(serpGucu, 0), 1) * 0.5;
}

export function firsatSkoru(f: FirsatGirdi): number {
  const hacimNorm = Math.log10(Math.max(f.hacim, 1) + 1); // uç hacim (27k) tek başına ezmesin
  return (hacimNorm * kazanilabilirlik(f.kd, f.serpGucu) * f.fit * f.ticari) / f.tazelik;
}

/**
 * SERP-doğrulanmış aday evreni (OpenSEO get_keyword_metrics + get_serp_results, 2026-08-12).
 * fit/ticari/tazelik = Projedar iş bağlamı yargısı (gerekçe serpNot'ta). Rakip adı burada
 * yalnız iç-analiz notu; kullanıcı-görünür yüzeye ÇIKMAZ ([[rakip-adi-kullanma]]).
 */
export const ADAY_EVRENI: FirsatGirdi[] = [
  { kelime: "emlak komisyon hesaplama", hacim: 1600, kd: 0, serpGucu: 0.55, fit: 0.9, ticari: 0.6, tazelik: 2, niyet: "informational",
    serpNot: "hesapkurdu+sigortalar+emlak blogları; bir rakip emlak-CRM aracı da TOP20'de. Gov/DA-90 yok → kırılabilir. Emlakçı core kitlesi." },
  { kelime: "kira çarpanı hesaplama", hacim: 590, kd: 0, serpGucu: 0.5, fit: 0.65, ticari: 0.45, tazelik: 1, niyet: "informational",
    serpNot: "endeksa+ekşi+banka+değerleme; AI Overview VAR (GEO fırsatı). Formül evergreen (tazelik yok). Yatırımcı fit." },
  { kelime: "emlak vergisi hesaplama", hacim: 9900, kd: 0, serpGucu: 0.35, fit: 0.7, ticari: 0.5, tazelik: 3, niyet: "informational",
    serpNot: "GİB + hesaplama.net + KolayIMAR(#5, kendi sitemiz) + sigortalar. Gov + güçlü domain; yıllık oran/rayiç → tazelik yüksek." },
  { kelime: "emlak vergisi ne kadar", hacim: 6600, kd: 0, serpGucu: 0.4, fit: 0.6, ticari: 0.4, tazelik: 3, niyet: "informational",
    serpNot: "vergi içerikleri; yıllık değişen oran. Bilgi amaçlı, B2B dönüşümü orta." },
  { kelime: "değer artış vergisi hesaplama", hacim: 2900, kd: 0, serpGucu: 0.35, fit: 0.55, ticari: 0.4, tazelik: 3, niyet: "informational",
    serpNot: "GİB + hesapkurdu; endeksleme/istisna yıllık değişir → tazelik 3." },
  { kelime: "ev satış vergisi hesaplama", hacim: 2400, kd: 3, serpGucu: 0.4, fit: 0.5, ticari: 0.4, tazelik: 3, niyet: "informational",
    serpNot: "değer-artış ailesi; gov + vergi içerik. Tüketici ağırlıklı." },
  { kelime: "tapu harcı hesaplama", hacim: 27100, kd: 0, serpGucu: 0.4, fit: 0.45, ticari: 0.35, tazelik: 3, niyet: "informational",
    serpNot: "hesapkurdu+hangikredi+sigortalar (GÜÇLÜ finans domainleri). Yüksek hacim ama tüketici + döner sermaye yıllık → tazelik/uygunluk düşürür." },
  { kelime: "konut vergisi hesaplama", hacim: 720, kd: 9, serpGucu: 0.4, fit: 0.6, ticari: 0.45, tazelik: 3, niyet: "informational",
    serpNot: "emlak vergisi alt-kümesi; yıllık oran." },
  { kelime: "gayrimenkul değer artış kazancı vergisi hesaplama", hacim: 2900, kd: 4, serpGucu: 0.35, fit: 0.55, ticari: 0.4, tazelik: 3, niyet: "informational",
    serpNot: "GİB güçlü; uzun-kuyruk ama net niyet." },
  { kelime: "damga vergisi hesaplama", hacim: 14800, kd: 0, serpGucu: 0.4, fit: 0.2, ticari: 0.2, tazelik: 2, niyet: "informational",
    serpNot: "YÜKSEK hacim AMA emlak-dışı (genel sözleşme). Konu-yakınlığı düşük → skor cezası. Atla." },
  { kelime: "yeni konut projeleri", hacim: 1600, kd: 20, serpGucu: 0.1, fit: 1.0, ticari: 0.9, tazelik: 1, niyet: "informational",
    serpNot: "sahibinden+hepsiemlak+emlakjet+endeksa (DA-90 portal DUVARI) + Emlak Konut. En yüksek fit ama SERP kilitli → uzun oyun (/konut-projeleri hub sürdür, hızlı sonuç bekleme)." },
];

/** Skora göre azalan sıralı fırsat listesi (Komuta Merkezi'nin 'bugün ne yapmalıyız' girdisi). */
export function siralanmisFirsatlar(evren: FirsatGirdi[] = ADAY_EVRENI): FirsatSonuc[] {
  return evren
    .map((f) => ({ ...f, kazanilabilirlik: kazanilabilirlik(f.kd, f.serpGucu), skor: firsatSkoru(f) }))
    .sort((a, b) => b.skor - a.skor);
}
