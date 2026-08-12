/**
 * Inventory Quality Gate — lokasyon (il/ilçe) index politikası.
 *
 * İKİ AYRI EŞİK: proje-içerik eşiği (ICERIK_ESIGI=5) tek /proje/[slug] zenginliği;
 * lokasyon eşiği (BURASI) /konut-projeleri/[il]/[ilce] COLLECTION'ının index'e değer mi.
 *
 * İKİ AYRI SKOR (kullanıcı düzeltmesi — redundancy giderildi):
 *  - INDEXABILITY = envanter kalitesi + çeşitlilik + tazelik. Query demand indexability'yi BELİRLEMEZ
 *    (düşük-kaliteli URL'yi yüksek hacim KURTARMAZ).
 *  - PRIORITY = indexability + query demand (+ SERP fırsatı). Hangi INDEX-ready sayfayı ÖNCE optimize
 *    edeceğimizi belirler. queryTalep yalnız burada.
 *
 * REVIEW_REQUIRED: HOLD ama mevcut organik sinyal (GSC impression/click) > 0 → OTOMATİK noindex verme,
 * insan review'e düşür (mevcut organik değeri biçme). historicalOrganicSignal GSC'den beslenir.
 *
 * SİNYAL (Google dokümanı): canonical HER ZAMAN self (HOLD ≠ duplicate). exposure:
 *  INDEXED / NAVIGABLE_NOINDEX (crawlable+noindex,follow+iç link → Google noindex'i görsün) / ABSORB_TO_PARENT.
 */

export interface LokasyonEnvanter {
  konum: string; // "izmir" | "ankara/cankaya"
  seviye: "il" | "ilce";
  toplamProje: number;
  indexProje: number; // per-proje eşiği (ICERIK_ESIGI) geçen, standalone-index'lenebilir proje
  farkliGelistirici: number; // NORMALIZE edilmiş benzersiz geliştirici (varyant şişmesi yok)
  guncelProje: number; // KNOWN-fresh (yalnız kaynak=proje, son N gün)
  tazelikBilinenProje: number; // freshness sinyali BİLİNEN proje sayısı (0 → tazelik UNKNOWN)
  queryTalep: number | null; // PRIORITY sinyali (indexability DEĞİL)
  historicalOrganicSignal?: number; // GSC impression+click; >0 ise HOLD→REVIEW_REQUIRED
}

// PRESERVE_INDEXING = REVIEW_REQUIRED sırasında mevcut indexing KORUNUR (index,follow + sitemap).
export type Exposure = "INDEXED" | "NAVIGABLE_NOINDEX" | "ABSORB_TO_PARENT" | "PRESERVE_INDEXING";
export type TazelikDurum = "FRESH" | "STALE" | "UNKNOWN";
export interface IndexPolicy {
  karar: "INDEX" | "HOLD" | "REVIEW_REQUIRED";
  exposure: Exposure;
  sitemap: boolean;
  robots: "index,follow" | "noindex,follow" | null; // ABSORB → sayfa üretilmez (null)
  internalLink: boolean;
  canonical: "self"; // her zaman self
  indexability: number; // 0..3 kalite (yeterli+çeşitlilik+güncel)
  priority: number; // indexability + demand ağırlığı (INDEX'ler arası öncelik)
  neden: string;
}

export const LOKASYON_MIN_INDEX_PROJE = 3;
export const LOKASYON_MIN_GELISTIRICI = 2;
export const LOKASYON_MIN_TAZE_ORAN = 0.3;

/** INDEXABILITY = kalite (demand YOK). yeterli index-proje + geliştirici çeşitliliği + tazelik. */
export function tazelikDurumu(e: LokasyonEnvanter): TazelikDurum {
  if (e.tazelikBilinenProje === 0) return "UNKNOWN"; // hepsi katalog → freshness bilinmiyor
  return e.guncelProje / e.tazelikBilinenProje >= LOKASYON_MIN_TAZE_ORAN ? "FRESH" : "STALE";
}

export function indexability(e: LokasyonEnvanter): { gecer: boolean; skor: number; eksik: string } {
  const yeterli = e.indexProje >= LOKASYON_MIN_INDEX_PROJE;
  const cesitlilik = e.farkliGelistirici >= LOKASYON_MIN_GELISTIRICI;
  // UNKNOWN tazelik lokasyonu OTOMATİK düşürmez; yalnız KNOWN-STALE fail eder (katalog UNKNOWN'ı cezalandırma).
  const taze = tazelikDurumu(e);
  const guncelOk = taze !== "STALE";
  const skor = [yeterli, cesitlilik, guncelOk].filter(Boolean).length;
  const eksik = [
    !yeterli ? "index'lenebilir-proje<eşik" : null,
    !cesitlilik ? "tek-geliştirici" : null,
    !guncelOk ? "veri-eskiyen(STALE)" : null,
  ].filter(Boolean).join(" · ");
  return { gecer: yeterli && cesitlilik && guncelOk, skor, eksik };
}

/** PRIORITY = indexability + demand (INDEX-ready sayfalar arası optimizasyon sırası). */
export function priority(e: LokasyonEnvanter): number {
  const { skor } = indexability(e);
  const demand = Math.min((e.queryTalep ?? 0) / 100, 3); // 0..3
  return skor + demand;
}

export function lokasyonIndexPolicy(e: LokasyonEnvanter): IndexPolicy {
  const { gecer, skor, eksik } = indexability(e);
  const pri = priority(e);

  if (gecer) {
    return { karar: "INDEX", exposure: "INDEXED", sitemap: true, robots: "index,follow", internalLink: true, canonical: "self", indexability: skor, priority: pri,
      neden: `indexProje=${e.indexProje}≥${LOKASYON_MIN_INDEX_PROJE} · geliştirici=${e.farkliGelistirici}≥${LOKASYON_MIN_GELISTIRICI} · güncel` };
  }

  // Mevcut organik değeri biçme: HOLD ama GSC sinyali varsa mevcut indexing KORUNUR (çelişki yok).
  if ((e.historicalOrganicSignal ?? 0) > 0) {
    return { karar: "REVIEW_REQUIRED", exposure: "PRESERVE_INDEXING", sitemap: true, robots: "index,follow", internalLink: true, canonical: "self", indexability: skor, priority: pri,
      neden: `HOLD kalitesi (${eksik}) AMA organik sinyal=${e.historicalOrganicSignal} → indexing KORUNUR, manuel review` };
  }

  if (e.toplamProje >= 1) {
    return { karar: "HOLD", exposure: "NAVIGABLE_NOINDEX", sitemap: false, robots: "noindex,follow", internalLink: true, canonical: "self", indexability: skor, priority: pri,
      neden: `HOLD-navigable (crawlable, noindex,follow — Google noindex'i görsün). eksik: ${eksik}` };
  }
  return { karar: "HOLD", exposure: "ABSORB_TO_PARENT", sitemap: false, robots: null, internalLink: false, canonical: "self", indexability: skor, priority: pri,
    neden: `HOLD-absorb (standalone URL üretme; parent/filter). eksik: ${eksik || "proje-yok"}` };
}

/** Toplu audit → INDEX/HOLD/REVIEW tablosu (priority'ye göre sıralı). */
export function inventoryCoverageAudit(list: LokasyonEnvanter[]): (LokasyonEnvanter & { policy: IndexPolicy })[] {
  return list
    .map((e) => ({ ...e, policy: lokasyonIndexPolicy(e) }))
    .sort((a, b) => b.policy.priority - a.policy.priority);
}
