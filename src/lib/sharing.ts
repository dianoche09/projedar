import { createHmac } from "crypto";

/**
 * İmza anahtarını env'den okur. Fallback YOK — env eksikse link üretimi/doğrulaması
 * bilinen bir anahtarla forge edilebilir hale gelmesin diye açıkça hata fırlatır.
 * (Modül top-level'da throw edilmez; build sırasında patlamaması için çağrı anında kontrol.)
 */
function getSecret(): string {
  const secret = process.env.LEAD_SHARE_SECRET;
  if (!secret) {
    throw new Error(
      "LEAD_SHARE_SECRET env değişkeni tanımlı değil. İmzalı paylaşım linkleri için Vercel/.env'de LEAD_SHARE_SECRET tanımlanmalı."
    );
  }
  return secret;
}

/**
 * Emlakçı ve Birim ID'sini kullanarak imzalı URL için token üretir.
 */
export function generateShareToken(emlakciId: string, birimId: string): string {
  return createHmac("sha256", getSecret())
    .update(`${emlakciId}:${birimId}`)
    .digest("hex")
    .slice(0, 16); // 16 karakter uzunluk URL'de temiz durur ve yeterince güvenlidir.
}

/**
 * Token'ın doğruluğunu kontrol eder.
 */
export function verifyShareToken(emlakciId: string, birimId: string, token: string): boolean {
  const expected = generateShareToken(emlakciId, birimId);
  return expected === token;
}
