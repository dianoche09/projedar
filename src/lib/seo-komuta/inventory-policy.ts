/**
 * Inventory Quality Gate — lokasyon (il/ilçe) index politikası.
 *
 * İKİ AYRI EŞİK (karıştırma):
 *  - Proje-içerik eşiği (ICERIK_ESIGI=5, icerik-esigi.ts): tek /proje/[slug]'ın yeterince zengin mi.
 *  - Lokasyon inventory eşiği (BURASI): /konut-projeleri/[il]/[ilce] COLLECTION'ının index'e değer mi.
 *
 * Çok-faktör (sadece proje sayısı DEĞİL): index'lenebilir proje + geliştirici çeşitliliği + veri güncelliği
 * + benzersiz-fayda üretilebilirliği + (query talebi = bonus).
 *
 * Çok-sinyal (HOLD sadece sitemap'ten çıkarmak DEĞİL — Google iç linkten keşfeder): sitemap inclusion +
 * robots index/noindex + hub internal link + canonical birlikte kararlaşır.
 */

export interface LokasyonEnvanter {
  konum: string; // "izmir" | "ankara/cankaya"
  seviye: "il" | "ilce";
  toplamProje: number; // lokasyondaki toplam proje (proje + katalog)
  indexProje: number; // per-proje eşiği (ICERIK_ESIGI) geçen, standalone-index'lenebilir proje sayısı
  farkliGelistirici: number; // benzersiz müteahhit/geliştirici sayısı (tek kaynağa bağımlılık kontrolü)
  guncelProje: number; // son N günde güncellenmiş proje sayısı (tazelik)
  benzersizFayda: boolean; // lokasyona özel benzersiz açıklama/fayda üretilebiliyor mu (doorway değil)
  queryTalep: number | null; // OpenSEO ölçülebilir talep (annotation/bonus, eleme kriteri değil)
}

export interface IndexPolicy {
  karar: "INDEX" | "HOLD";
  sitemap: boolean;
  robots: "index,follow" | "noindex,follow";
  internalLink: boolean; // hub'dan iç link verilsin mi
  canonical: "self" | "parent"; // HOLD'da parent il/hub'a canonical
  skor: number;
  neden: string;
}

// Lokasyon eşikleri (proje-içerik eşiğinden AYRI). Hardcode tek-sayı değil; çok-faktörün parçası.
export const LOKASYON_MIN_INDEX_PROJE = 3; // en az bu kadar standalone-index'lenebilir proje
export const LOKASYON_MIN_GELISTIRICI = 2; // tek geliştiriciye bağımlı collection index'lenmez
export const LOKASYON_MIN_TAZE_ORAN = 0.3; // toplamın en az %30'u güncel olmalı

export function lokasyonIndexPolicy(e: LokasyonEnvanter): IndexPolicy {
  const yeterliIndexProje = e.indexProje >= LOKASYON_MIN_INDEX_PROJE;
  const cesitlilik = e.farkliGelistirici >= LOKASYON_MIN_GELISTIRICI;
  const guncel = e.guncelProje >= 1 && e.guncelProje / Math.max(e.toplamProje, 1) >= LOKASYON_MIN_TAZE_ORAN;
  const fayda = e.benzersizFayda;
  const talepBonus = (e.queryTalep ?? 0) >= 40; // ölçülebilir talep = güçlendirici (zorunlu değil)

  const zorunlu = yeterliIndexProje && cesitlilik && guncel;
  const index = zorunlu && (fayda || talepBonus); // 3 zorunlu + (benzersiz fayda VEYA gerçek talep)
  const skor = [yeterliIndexProje, cesitlilik, guncel, fayda].filter(Boolean).length + (talepBonus ? 0.5 : 0);

  if (index) {
    return {
      karar: "INDEX", sitemap: true, robots: "index,follow", internalLink: true, canonical: "self", skor,
      neden: `indexProje=${e.indexProje}≥${LOKASYON_MIN_INDEX_PROJE} · geliştirici=${e.farkliGelistirici}≥${LOKASYON_MIN_GELISTIRICI} · güncel · ${fayda ? "benzersiz-fayda" : "talep-bonus"}`,
    };
  }
  const eksik = [
    !yeterliIndexProje ? "index'lenebilir-proje<eşik" : null,
    !cesitlilik ? "tek-geliştirici" : null,
    !guncel ? "veri-güncel-değil" : null,
    !fayda && !talepBonus ? "benzersiz-fayda/talep-yok" : null,
  ].filter(Boolean).join(" · ");
  return { karar: "HOLD", sitemap: false, robots: "noindex,follow", internalLink: false, canonical: "parent", skor, neden: `eksik: ${eksik}` };
}

/** Toplu audit: lokasyon envanter listesi → INDEX/HOLD tablosu (canlı tumHubProjeleri'den beslenir). */
export function inventoryCoverageAudit(list: LokasyonEnvanter[]): (LokasyonEnvanter & { policy: IndexPolicy })[] {
  return list
    .map((e) => ({ ...e, policy: lokasyonIndexPolicy(e) }))
    .sort((a, b) => b.policy.skor - a.policy.skor || (b.queryTalep ?? 0) - (a.queryTalep ?? 0));
}
