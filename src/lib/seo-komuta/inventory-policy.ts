/**
 * Inventory Quality Gate — lokasyon (il/ilçe) index politikası.
 *
 * İKİ AYRI EŞİK: proje-içerik eşiği (ICERIK_ESIGI=5) tek /proje/[slug] zenginliği;
 * lokasyon eşiği (BURASI) /konut-projeleri/[il]/[ilce] COLLECTION'ının index'e değer mi.
 *
 * DÜZELTMELER (Google dokümanına göre):
 *  - canonical HER ZAMAN self. HOLD ≠ duplicate: zayıf Çankaya koleksiyonu Ankara'nın DUPLICATE'i değil;
 *    canonical duplicate/çok-benzer konsolidasyonu içindir, "zayıf" için değil. noindex ile canonical'ı
 *    yönetme — ayrı sinyaller.
 *  - HOLD'da internalLink otomatik kapatılmaz: Google noindex'i GÖRMEK için URL'yi crawl edebilmeli;
 *    crawlable iç link keşfin temel yolu. → exposure ile ayır:
 *      INDEXED           : sitemap + index,follow + iç link
 *      NAVIGABLE_NOINDEX : gerçek içerik var ama eşik-altı → crawlable, noindex,follow, iç link VAR (Google noindex'i görür)
 *      ABSORB_TO_PARENT  : standalone kullanıcı faydası yok → ayrı SEO URL'si ÜRETME, parent/filter state
 *  - benzersizFayda MANUEL boolean değil, sinyallerden HESAPLANIR (gate subjektifleşmesin).
 */

export interface LokasyonEnvanter {
  konum: string; // "izmir" | "ankara/cankaya"
  seviye: "il" | "ilce";
  toplamProje: number; // lokasyondaki toplam proje (proje + katalog)
  indexProje: number; // per-proje eşiği (ICERIK_ESIGI) geçen, standalone-index'lenebilir proje
  farkliGelistirici: number; // benzersiz müteahhit/geliştirici (tek-kaynak bağımlılık kontrolü)
  guncelProje: number; // son N günde güncellenmiş proje (tazelik)
  queryTalep: number | null; // OpenSEO ölçülebilir talep (annotation/bonus, eleme değil)
}

export type Exposure = "INDEXED" | "NAVIGABLE_NOINDEX" | "ABSORB_TO_PARENT";
export interface IndexPolicy {
  karar: "INDEX" | "HOLD";
  exposure: Exposure;
  sitemap: boolean;
  robots: "index,follow" | "noindex,follow" | null; // ABSORB → sayfa üretilmez (null)
  internalLink: boolean;
  canonical: "self"; // her zaman self (HOLD duplicate değil)
  skor: number;
  neden: string;
}

export const LOKASYON_MIN_INDEX_PROJE = 3;
export const LOKASYON_MIN_GELISTIRICI = 2;
export const LOKASYON_MIN_TAZE_ORAN = 0.3;

/**
 * Koleksiyon zenginliği (makineden hesaplanır). NOT: "unique value" DEĞİL, çeşitlilik proxy'si —
 * ≥2 index'lenebilir proje + ≥2 geliştirici → lokasyona özel aggregate (fiyat/oda/teslim dağılımı)
 * üretilebilir. Gerçek unique-value modeli için: contentSignals {indexableProjects, developerDiversity,
 * roomTypeDiversity, deliveryDiversity, hasLocationSummary} (ileri iş).
 */
export function collectionZenginligiVar(e: LokasyonEnvanter): boolean {
  return e.indexProje >= 2 && e.farkliGelistirici >= 2;
}

export function lokasyonIndexPolicy(e: LokasyonEnvanter): IndexPolicy {
  const yeterli = e.indexProje >= LOKASYON_MIN_INDEX_PROJE;
  const cesitlilik = e.farkliGelistirici >= LOKASYON_MIN_GELISTIRICI;
  const guncel = e.guncelProje >= 1 && e.guncelProje / Math.max(e.toplamProje, 1) >= LOKASYON_MIN_TAZE_ORAN;
  const zengin = collectionZenginligiVar(e);
  const talepBonus = (e.queryTalep ?? 0) >= 40;
  const skor = [yeterli, cesitlilik, guncel, zengin].filter(Boolean).length + (talepBonus ? 0.5 : 0);

  if (yeterli && cesitlilik && guncel && (zengin || talepBonus)) {
    return { karar: "INDEX", exposure: "INDEXED", sitemap: true, robots: "index,follow", internalLink: true, canonical: "self", skor,
      neden: `indexProje=${e.indexProje}≥${LOKASYON_MIN_INDEX_PROJE} · geliştirici=${e.farkliGelistirici}≥${LOKASYON_MIN_GELISTIRICI} · güncel · ${zengin ? "koleksiyon-zengin" : "talep-bonus"}` };
  }

  const eksik = [
    !yeterli ? "index'lenebilir-proje<eşik" : null,
    !cesitlilik ? "tek-geliştirici" : null,
    !guncel ? "veri-güncel-değil" : null,
    !zengin && !talepBonus ? "koleksiyon-zenginliği/talep-yok" : null,
  ].filter(Boolean).join(" · ");

  // HOLD: gerçek içeriği olan (kullanıcıya gezinilebilir) → NAVIGABLE_NOINDEX; boş/faydasız → ABSORB.
  if (e.toplamProje >= 1) {
    return { karar: "HOLD", exposure: "NAVIGABLE_NOINDEX", sitemap: false, robots: "noindex,follow", internalLink: true, canonical: "self", skor,
      neden: `HOLD-navigable (crawlable, noindex,follow — Google noindex'i görsün). eksik: ${eksik}` };
  }
  return { karar: "HOLD", exposure: "ABSORB_TO_PARENT", sitemap: false, robots: null, internalLink: false, canonical: "self", skor,
    neden: `HOLD-absorb (standalone URL üretme; parent/filter). eksik: ${eksik}` };
}

/** Toplu audit: lokasyon envanter listesi → INDEX/HOLD tablosu (canlı tumHubProjeleri'den beslenir). */
export function inventoryCoverageAudit(list: LokasyonEnvanter[]): (LokasyonEnvanter & { policy: IndexPolicy })[] {
  return list
    .map((e) => ({ ...e, policy: lokasyonIndexPolicy(e) }))
    .sort((a, b) => b.policy.skor - a.policy.skor || (b.queryTalep ?? 0) - (a.queryTalep ?? 0));
}
