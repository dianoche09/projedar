import type { AdayHam, Segment } from "../tipler";
import { emailCikar, telefonCikar } from "../cikar";

/**
 * Serper (google.serper.dev) web araması — Maps <3 sonuç verdiğinde fallback.
 * Organik sonuçların title + snippet + link'inden ham aday üretir; iletişim regex ile çıkar.
 * Kolayimar searchWeb (Serper tercihli) deseni.
 */
export async function araWeb(sorgu: string, segment: Segment, key: string): Promise<AdayHam[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: sorgu, gl: "tr", hl: "tr", num: 10 }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}`);
  const data = (await res.json()) as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  };

  return (data.organic ?? []).slice(0, 10).flatMap((r): AdayHam[] => {
    if (!r.title) return [];
    return [
      {
        firma_adi: r.title,
        segment,
        website: r.link?.trim() || undefined,
        telefon: telefonCikar(r.snippet),
        email: emailCikar(r.snippet),
        ozet: r.snippet?.trim() || undefined,
        kaynak: "serper_web",
        kaynak_url: r.link?.trim() || undefined,
      },
    ];
  });
}
