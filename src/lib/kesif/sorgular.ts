import type { Segment } from "./tipler";

/**
 * Segment × il → Türkçe arama sorgu seti (SerpAPI Maps / Serper / Places için).
 * Sabit set — keşif tekrarlanabilir olsun. İl adı sorguya gömülür.
 */
const SABLON: Record<Segment, string[]> = {
  muteahhit: ["{il} inşaat firması", "{il} konut projesi", "{il} gayrimenkul geliştirme"],
  proje: ["{il} yeni konut projesi", "{il} satılık daire proje"],
  ofis: ["{il} emlak ofisi", "{il} gayrimenkul ofisi"],
  emlakci: ["{il} gayrimenkul danışmanı", "{il} emlak danışmanı"],
};

export function sorgularUret(il: string, segment: Segment): string[] {
  const temiz = il.trim();
  return SABLON[segment].map((s) => s.replace("{il}", temiz));
}
