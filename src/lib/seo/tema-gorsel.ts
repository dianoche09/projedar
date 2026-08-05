import { slugify } from "./slug";

/**
 * İl/ilçe bazlı tematik hero görseli. fal.ai ile üretilmiş il/ilçe/segment
 * havuzundan gelir (proje GERÇEK fotoğrafı DEĞİL; temsili şehir/mimari tema,
 * "Temsili görsel" etiketiyle sunulur). Havuz büyüdükçe map doldurulur.
 * Görsel yoksa null → sayfa koyu gradyan hero'ya düşer.
 */
const TEMA_GORSELLER: Record<string, string> = {
  // örn: "ankara-cankaya": "/gorseller/tema/ankara-cankaya.webp",
};

export function temaGorsel(il?: string | null, ilce?: string | null): string | null {
  if (il && ilce) {
    const k = `${slugify(il)}-${slugify(ilce)}`;
    if (TEMA_GORSELLER[k]) return TEMA_GORSELLER[k];
  }
  if (il) {
    const k = slugify(il);
    if (TEMA_GORSELLER[k]) return TEMA_GORSELLER[k];
  }
  return null;
}
