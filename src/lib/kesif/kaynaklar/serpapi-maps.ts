import type { AdayHam, Segment } from "../tipler";
import { emailCikar, telefonCikar } from "../cikar";

/**
 * SerpAPI Google Maps — yerel işletme keşfi (en temiz kaynak: telefon/adres/website hazır).
 * TR merkez koordinatı + hl=tr. local_results'tan ilk 20 sonucu ham adaya çevirir.
 * Kolayimar searchGoogleMaps deseni.
 */
export async function araMaps(sorgu: string, segment: Segment, key: string): Promise<AdayHam[]> {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_maps");
  url.searchParams.set("type", "search");
  url.searchParams.set("q", sorgu);
  url.searchParams.set("ll", "@39.9334,32.8597,6z"); // Türkiye merkez
  url.searchParams.set("hl", "tr");
  url.searchParams.set("api_key", key);

  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`SerpAPI Maps ${res.status}`);
  const data = (await res.json()) as {
    local_results?: Array<{
      title?: string;
      website?: string;
      phone?: string;
      address?: string;
      description?: string;
    }>;
  };

  return (data.local_results ?? []).slice(0, 20).flatMap((r): AdayHam[] => {
    if (!r.title) return [];
    return [
      {
        firma_adi: r.title,
        segment,
        website: r.website?.trim() || undefined,
        telefon: r.phone?.trim() || telefonCikar(r.description),
        email: emailCikar(r.description),
        adres: r.address?.trim() || undefined,
        ozet: r.description?.trim() || undefined,
        kaynak: "serpapi_maps",
        kaynak_url: r.website?.trim() || undefined,
      },
    ];
  });
}
