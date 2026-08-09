/** İçerik katmanı ortak biçimleyiciler. */

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** "2026-08-09" → "9 Ağustos 2026". Geçersiz girişte ham değeri döndürür. */
export function trTarih(iso: string): string {
  const parca = iso.split("T")[0].split("-").map(Number);
  const [y, m, d] = parca;
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${d} ${AYLAR[m - 1]} ${y}`;
}
