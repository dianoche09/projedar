/**
 * Inventory aggregation — HubProje[] → il/ilçe LokasyonEnvanter[] (PURE, saf veri dönüşümü).
 * İl ve ilçe AYNI fonksiyondan üretilir (duplicate business logic yok). Test edilebilir; canlı
 * Supabase'e yalnız policy SONUÇLARINI görmek için ihtiyaç var, bu fonksiyon için değil.
 */

import type { HubProje } from "@/lib/seo/konut-hub";
import type { LokasyonEnvanter } from "./inventory-policy";

export const TAZE_GUN = 30; // son N gün = güncel

function tazeMi(d: Date | null, now: number): boolean {
  return d != null && now - d.getTime() <= TAZE_GUN * 86_400_000;
}

/**
 * Geliştirici identity normalizasyonu (çeşitlilik şişmesini önler): "YDA Group"/"YDA GROUP"/
 * "YDA İnşaat" → aynı. İdeali ID; HubProje'de yalnız ad (string) olduğundan normalized-slug.
 * (İleri iş: uretici_id'yi HubProje'ye taşıyıp ID-öncelikli dedup.)
 */
export function normGelistirici(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/[.\-_/]/g, " ")
    .replace(/\b(inşaat|insaat|gayrimenkul|group|grup|gyo|holding|yapı|yapi|proje|a ş|aş|ltd|şti|sti|inc|co)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Talep + GSC organik sinyal haritaları. key = "il" ya da "il/ilce" (slug). Eleme değil. */
export type TalepHaritasi = Record<string, number>;

export function lokasyonAgregatlari(
  hepsi: HubProje[],
  opts: { now?: number; talep?: TalepHaritasi; organik?: TalepHaritasi } = {},
): LokasyonEnvanter[] {
  const now = opts.now ?? Date.now();
  const talep = opts.talep ?? {};
  const organik = opts.organik ?? {};
  type Acc = { konum: string; seviye: "il" | "ilce"; toplam: number; index: number; gel: Set<string>; guncel: number };
  const acc = new Map<string, Acc>();

  const ekle = (konum: string, seviye: "il" | "ilce", p: HubProje) => {
    const a = acc.get(konum) ?? { konum, seviye, toplam: 0, index: 0, gel: new Set<string>(), guncel: 0 };
    a.toplam++;
    if (p.esik) a.index++;
    if (p.gelistirici) { const n = normGelistirici(p.gelistirici); if (n) a.gel.add(n); }
    if (tazeMi(p.sonGuncelleme, now)) a.guncel++;
    acc.set(konum, a);
  };

  for (const p of hepsi) {
    ekle(p.ilSlug, "il", p);
    if (p.ilceSlug) ekle(`${p.ilSlug}/${p.ilceSlug}`, "ilce", p);
  }

  return [...acc.values()].map((a) => ({
    konum: a.konum,
    seviye: a.seviye,
    toplamProje: a.toplam,
    indexProje: a.index,
    farkliGelistirici: a.gel.size,
    guncelProje: a.guncel,
    queryTalep: talep[a.konum] ?? null,
    historicalOrganicSignal: organik[a.konum] ?? 0,
  }));
}
