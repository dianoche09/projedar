/**
 * SERP snippet / metinden iletişim çıkarımı — regex (Kolayimar extractEmail/Phone deseni).
 * Halüsinasyon riski yok (ham metinden birebir). Claude zenginleştirme bunu doğrular/tamamlar.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
// TR telefon: +90/0 ardından 10 hane (aralarında boşluk/tire/parantez olabilir).
const TEL_RE = /(?:\+90|0)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;

export function emailCikar(metin: string | undefined | null): string | undefined {
  if (!metin) return undefined;
  const m = metin.match(EMAIL_RE);
  return m ? m[0].toLowerCase() : undefined;
}

export function telefonCikar(metin: string | undefined | null): string | undefined {
  if (!metin) return undefined;
  const m = metin.match(TEL_RE);
  if (!m) return undefined;
  // Rakamları sadeleştir, tek boşlukla normalize et.
  return m[0].replace(/[\s()-]+/g, " ").trim();
}
