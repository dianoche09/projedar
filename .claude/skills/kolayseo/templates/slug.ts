/**
 * Turkish-aware slug helper (adapt the char map for your locale).
 * Examples: Çankaya → cankaya, Eyüpsultan → eyupsultan, İstanbul → istanbul.
 * Stable, idempotent. Use when generating url-safe identifiers from text
 * (city/district/category names, etc.).
 */
export function slugify(s: string): string {
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
