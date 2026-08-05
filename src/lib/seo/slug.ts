/**
 * Türkçe-duyarlı slug üretimi. Programmatic SEO route anahtarları için
 * (proje adı, müteahhit adı, il/ilçe). Kararlı ve idempotent.
 * Örnek: "Çankaya Vadi" -> "cankaya-vadi", "İncek Life" -> "incek-life".
 * Kaynak deseni: kolayseo/templates/slug.ts (ardışık-tire temizliği eklendi).
 */
export function slugify(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Proje slug'ı: ad + ilçe birleşimi (aynı adlı projeler farklı ilçelerde ayrışsın).
 * Örn: projeSlug("Vadi", "Çankaya") -> "vadi-cankaya".
 */
export function projeSlug(ad: string, ilce?: string | null): string {
  const taban = slugify(ad);
  const bolge = ilce ? slugify(ilce) : "";
  return bolge && !taban.endsWith(bolge) ? `${taban}-${bolge}` : taban;
}
