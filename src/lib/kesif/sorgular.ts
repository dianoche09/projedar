import type { Segment } from "./tipler";

/**
 * Segment × il → Türkçe arama sorgu seti (SerpAPI Maps / Serper / Places için).
 * Sabit set — keşif tekrarlanabilir olsun. İl adı sorguya gömülür.
 *
 * İki katman:
 *  (a) DOĞRUDAN sorgular — işletme adı/kategorisiyle Maps'te bulunur (inşaat firması, emlak ofisi).
 *  (b) DAVRANIŞ/EŞANLAMLI sorgular — rakip/aday bizim sözlüğümüzden kaçar; kendi kelimesiyle aranır.
 *      (tahsis=yetkilendirme · canlı stok=güncel portföy · emlakçı ağı=partner ağı · broker=acente ·
 *       müteahhit=proje sahibi · developer=kurumsal firma · yeni konut=sıfır proje). Bunlar Maps'te
 *      genelde <3 sonuç döner → kesfet() otomatik Serper web fallback'e düşer (doğru kaynak).
 * Maliyet notu: her sorgu = (Maps + gerekirse Serper + Places) çağrısı × il. Sorgu ekledikçe maliyet artar.
 */
const SABLON: Record<Segment, string[]> = {
  muteahhit: [
    // (a) doğrudan
    "{il} inşaat firması",
    "{il} konut projesi",
    "{il} gayrimenkul geliştirme",
    // (b) davranış/eşanlamlı — "proje sahibi / kurumsal portföy / yetkili satış"
    "{il} proje sahibi firma yetkili satış",
    "{il} kurumsal gayrimenkul portföyü partner",
    "{il} konut projesi yetkili satış ağı",
  ],
  proje: [
    "{il} yeni konut projesi",
    "{il} satılık daire proje",
    "{il} sıfır konut projesi",
    "{il} markalı konut projesi satış",
  ],
  ofis: [
    "{il} emlak ofisi",
    "{il} gayrimenkul ofisi",
    // (b) davranış — "yetkili satış ofisi / iş ortağı / partner ağı"
    "{il} yetkili satış ofisi gayrimenkul",
    "{il} gayrimenkul iş ortağı partner ağı",
  ],
  emlakci: [
    "{il} gayrimenkul danışmanı",
    "{il} emlak danışmanı",
    // (b) davranış — "acente / proje satış partneri / portföy ağı"
    "{il} proje satış danışmanı acente",
    "{il} gayrimenkul partner ağı portföy paylaşımı",
  ],
};

export function sorgularUret(il: string, segment: Segment): string[] {
  const temiz = il.trim();
  return SABLON[segment].map((s) => s.replace("{il}", temiz));
}
