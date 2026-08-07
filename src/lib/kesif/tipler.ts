import { z } from "zod";

/** Keşif segmentleri. 'proje' davet edilebilir rol değildir → zenginleştirmede müteahhide çözülür. */
export const SEGMENTLER = ["muteahhit", "proje", "ofis", "emlakci"] as const;
export type Segment = (typeof SEGMENTLER)[number];

/** Ham aday — kaynak adaptörlerinin (SerpAPI/Serper/Places) çıktısı. Doğrudan DB'ye yazılır (Claude yok). */
export const AdayHamSchema = z.object({
  firma_adi: z.string().trim().min(1),
  segment: z.enum(SEGMENTLER),
  website: z.string().trim().optional(),
  telefon: z.string().trim().optional(),
  email: z.string().trim().optional(),
  adres: z.string().trim().optional(),
  il: z.string().trim().optional(),
  ilce: z.string().trim().optional(),
  ozet: z.string().trim().optional(), // kaynak snippet'i
  kaynak: z.enum(["serpapi_maps", "serper_web", "places"]),
  kaynak_url: z.string().trim().optional(),
});
export type AdayHam = z.infer<typeof AdayHamSchema>;

/** segment → kayıt rolü (talep_rol enum). 'proje' davet edilmez (arkasındaki müteahhide çözülür). */
export const SEGMENT_ROL: Record<Segment, "uretici" | "emlakci" | "ofis_yetkili" | null> = {
  muteahhit: "uretici",
  ofis: "ofis_yetkili",
  emlakci: "emlakci",
  proje: null,
};
