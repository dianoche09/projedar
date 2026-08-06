import { z } from "zod";

/** Keşif segmentleri. 'proje' davet edilebilir rol değildir → zenginleştirmede müteahhide çözülür. */
export const SEGMENTLER = ["muteahhit", "proje", "ofis", "emlakci"] as const;
export type Segment = (typeof SEGMENTLER)[number];

/** Ham aday — kaynak adaptörlerinin (SerpAPI/Serper/Places) çıktısı. */
export const AdayHamSchema = z.object({
  firma_adi: z.string().trim().min(1),
  segment: z.enum(SEGMENTLER),
  website: z.string().trim().optional(),
  telefon: z.string().trim().optional(),
  email: z.string().trim().optional(),
  adres: z.string().trim().optional(),
  il: z.string().trim().optional(),
  ilce: z.string().trim().optional(),
  ozet: z.string().trim().optional(), // kaynak snippet'i (Claude girdisi)
  kaynak: z.enum(["serpapi_maps", "serper_web", "places"]),
  kaynak_url: z.string().trim().optional(),
});
export type AdayHam = z.infer<typeof AdayHamSchema>;

/** Zengin aday — Claude çıktısı (yapılandırılmış). Halüsinasyon yasak: emin olmadığı alanı boş bırakır. */
export const AdayZenginSchema = z.object({
  firma_adi: z.string(),
  segment: z.enum(SEGMENTLER),
  kisi: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefon: z.string().nullable().optional(),
  proje_sayisi: z.number().int().nullable().optional(),
  uygunluk_skoru: z.number().int().min(0).max(100),
  ozet: z.string(),
});
export type AdayZengin = z.infer<typeof AdayZenginSchema>;

/** segment → kayıt rolü (talep_rol enum). 'proje' davet edilmez (müteahhide çözülür). */
export const SEGMENT_ROL: Record<Segment, "uretici" | "emlakci" | "ofis_yetkili" | null> = {
  muteahhit: "uretici",
  ofis: "ofis_yetkili",
  emlakci: "emlakci",
  proje: null,
};
