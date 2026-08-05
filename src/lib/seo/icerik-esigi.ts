/**
 * Doorway-safe içerik eşiği. Programmatic proje sayfası ancak yeterli GERÇEK
 * faktüel veri varsa açılır; zayıf verili proje standalone sayfa almaz (thin
 * content cezası tüm siteyi vurur), il/ilçe hub'ında satır olarak listelenir.
 * Skorlama yalnız doğrulanabilir alanlara puan verir; uydurma yok.
 */
import { okuOzellikler, ozellikDuzList } from "@/lib/ozellikler";

export interface ProjeIcerikGirdi {
  il?: string | null;
  ilce?: string | null;
  mahalle?: string | null;
  lat?: number | null;
  lng?: number | null;
  ada?: string | null;
  parsel?: string | null;
  emsal?: number | string | null;
  taks?: number | string | null;
  insaat_asamasi?: string | null;
  teslim_tarihi?: string | null;
  baslama_tarihi?: string | null;
  kunye?: Record<string, unknown> | null;
  daireTipiSayisi?: number;
  dogrulanmis?: boolean;
  belge_dogrulandi?: boolean;
}

/** Standalone sayfa açma eşiği (bunun altı hub'da listelenir). */
export const ICERIK_ESIGI = 5;

export function projeIcerikSkoru(g: ProjeIcerikGirdi): number {
  // il+ilçe zorunlu ön-koşul: konum yoksa anlamlı sayfa kurulamaz.
  if (!g.il || !g.ilce) return 0;
  let skor = 2;
  if (g.mahalle) skor += 1;
  if (g.lat != null && g.lng != null) skor += 1;
  if (g.ada || g.parsel || g.emsal || g.taks) skor += 1;
  if ((g.insaat_asamasi && g.insaat_asamasi !== "planlama") || g.teslim_tarihi || g.baslama_tarihi) skor += 1;
  const ozellikSayisi = ozellikDuzList(okuOzellikler(g.kunye)).length;
  if (ozellikSayisi >= 3) skor += 2;
  const malzeme = Array.isArray(g.kunye?.malzeme) ? (g.kunye.malzeme as unknown[]) : [];
  if (malzeme.length >= 2) skor += 1;
  if ((g.daireTipiSayisi ?? 0) >= 1) skor += 2;
  if (g.dogrulanmis || g.belge_dogrulandi) skor += 1;
  return skor;
}

export function projeSayfaUret(g: ProjeIcerikGirdi): boolean {
  return projeIcerikSkoru(g) >= ICERIK_ESIGI;
}
