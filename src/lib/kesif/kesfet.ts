import type { AdayHam, Segment } from "./tipler";
import { sorgularUret } from "./sorgular";
import { araMaps } from "./kaynaklar/serpapi-maps";
import { araWeb } from "./kaynaklar/serper-web";
import { araPlaces } from "./kaynaklar/places";
import { benzersizle } from "./dedup";
import type { KesifAnahtarlari } from "./anahtar";

/**
 * Bir kampanyanın keşif adımı — il + segmentler için ham aday listesi üretir (Claude YOK, ucuz).
 * Katmanlı: SerpAPI Maps (birincil) → <3 sonuçta Serper web fallback → Places çapraz-kaynak.
 * Her kaynak hatası izole (bir sorgu patlarsa diğerleri sürer). Sonuç dedup'lanır.
 */
export async function kesfet(
  il: string,
  segmentler: Segment[],
  anahtar: KesifAnahtarlari,
): Promise<{ adaylar: AdayHam[]; hatalar: string[] }> {
  const adaylar: AdayHam[] = [];
  const hatalar: string[] = [];

  for (const segment of segmentler) {
    for (const sorgu of sorgularUret(il, segment)) {
      // 1) SerpAPI Maps (birincil)
      let mapsSayi = 0;
      if (anahtar.serpapi_key) {
        try {
          const r = await araMaps(sorgu, segment, anahtar.serpapi_key);
          mapsSayi = r.length;
          adaylar.push(...r.map((a) => ({ ...a, il })));
        } catch (e) {
          hatalar.push(`maps "${sorgu}": ${(e as Error).message}`);
        }
      }
      // 2) Serper web fallback (Maps zayıfsa)
      if (mapsSayi < 3 && anahtar.serper_key) {
        try {
          const r = await araWeb(sorgu, segment, anahtar.serper_key);
          adaylar.push(...r.map((a) => ({ ...a, il })));
        } catch (e) {
          hatalar.push(`web "${sorgu}": ${(e as Error).message}`);
        }
      }
      // 3) Places çapraz-kaynak (varsa)
      if (anahtar.places_key) {
        try {
          const r = await araPlaces(sorgu, segment, anahtar.places_key);
          adaylar.push(...r.map((a) => ({ ...a, il })));
        } catch (e) {
          hatalar.push(`places "${sorgu}": ${(e as Error).message}`);
        }
      }
    }
  }

  return { adaylar: benzersizle(adaylar), hatalar };
}
