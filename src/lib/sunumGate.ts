import { createHmac } from "crypto";

/**
 * /sunum (yatırımcı deck) alanı için parola kapısı.
 * Kural: linke sahip olmak yetmez; ayrıca paylaşımlık bir parola (env SUNUM_SIFRE) gerekir.
 * Doğru parola girildiğinde tarayıcıya, aşağıdaki token'ı taşıyan httpOnly çerez yazılır.
 *
 * SUNUM_SIFRE veya LEAD_SHARE_SECRET tanımlı değilse token = null → kapı DEVRE DIŞI (erişim serbest).
 * Böylece env ayarlanana kadar mevcut davranış bozulmaz; parola koruması SUNUM_SIFRE set edilince aktifleşir.
 */
export function sunumTokenBeklenen(): string | null {
  const sifre = process.env.SUNUM_SIFRE;
  const secret = process.env.LEAD_SHARE_SECRET;
  if (!sifre || !secret) return null;
  return createHmac("sha256", secret).update(`sunum:${sifre}`).digest("hex").slice(0, 32);
}

/** Girilen parola doğru mu? SUNUM_SIFRE tanımsızsa daima false. */
export function sunumSifreDogru(girilen: string): boolean {
  const sifre = process.env.SUNUM_SIFRE;
  return !!sifre && girilen === sifre;
}

/** next parametresini güvene al: yalnız /sunum ile başlayan iç yol; değilse varsayılan. */
export function guvenliSunumYolu(next: string | undefined | null): string {
  const varsayilan = "/sunum/v2/pitch";
  if (!next || typeof next !== "string") return varsayilan;
  return next.startsWith("/sunum") && !next.startsWith("//") ? next : varsayilan;
}
