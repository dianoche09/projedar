import type { AdayHam, Segment } from "../tipler";

/**
 * Google Places Text Search (v1) — emlak/müteahhit ofisi telefon+adres+website için temiz kaynak.
 * SerpAPI/Serper'a ek çapraz-kaynak; iletişim alanları yapılandırılmış gelir.
 */
type PlacesYer = {
  displayName?: { text?: string };
  formattedAddress?: string;
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
};

export async function araPlaces(sorgu: string, segment: Segment, key: string): Promise<AdayHam[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.nationalPhoneNumber,places.websiteUri",
    },
    body: JSON.stringify({ textQuery: sorgu, languageCode: "tr", regionCode: "TR" }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Places ${res.status}`);
  const data = (await res.json()) as { places?: PlacesYer[] };

  return (data.places ?? []).slice(0, 20).flatMap((p): AdayHam[] => {
    const ad = p.displayName?.text?.trim();
    if (!ad) return [];
    return [
      {
        firma_adi: ad,
        segment,
        website: p.websiteUri?.trim() || undefined,
        telefon: (p.internationalPhoneNumber || p.nationalPhoneNumber)?.trim() || undefined,
        adres: p.formattedAddress?.trim() || undefined,
        kaynak: "places",
        kaynak_url: p.websiteUri?.trim() || undefined,
      },
    ];
  });
}
