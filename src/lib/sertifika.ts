import { createHmac } from "crypto";

/**
 * Müşteri-talep sertifikası doğrulama token'ı.
 * Çift-satış ispatı: bir opsiyon kaydının zaman-damgalı, forge edilemez teyidi.
 * generateShareToken (sharing.ts) ile aynı gizli anahtarı kullanır ama amaç ayrı
 * (opsiyon kaydı doğrulama) olduğu için farklı bir domain-prefix ile imzalanır —
 * paylaşım token'ı sertifika token'ı olarak yeniden kullanılamaz.
 */
function getSecret(): string {
  const secret = process.env.LEAD_SHARE_SECRET;
  if (!secret) {
    throw new Error(
      "LEAD_SHARE_SECRET env değişkeni tanımlı değil. Sertifika doğrulama token'ı için gerekli.",
    );
  }
  return secret;
}

/** Opsiyon kaydı için imzalı doğrulama kodu (URL-güvenli, 20 hex). */
export function sertifikaToken(opsiyonId: string): string {
  return createHmac("sha256", getSecret())
    .update(`sertifika:${opsiyonId}`)
    .digest("hex")
    .slice(0, 20);
}

/** Token'ın doğruluğunu kontrol eder. */
export function sertifikaDogrula(opsiyonId: string, token: string): boolean {
  return sertifikaToken(opsiyonId) === token;
}

/**
 * Telefon numarasını KVKK-uyumlu maskeler (DEĞİŞMEZ #2).
 * İlk 3 + son 2 hane görünür, arası gizli: "0532••••• 45" → "0532 ••• •• 45".
 * Sertifika/doğrulama belgesinde müşteri PII ham gösterilmez.
 */
export function maskeTel(tel: string | null | undefined): string {
  if (!tel) return "—";
  const rakam = tel.replace(/\D/g, "");
  if (rakam.length < 5) return "•••";
  return `${rakam.slice(0, 3)} ••• •• ${rakam.slice(-2)}`;
}

/**
 * İsmi maskeler: ilk harf + soyadı ilk harfi görünür ("Ahmet Yılmaz" → "A••• Y•••").
 * Sertifikada müşteri adını kısmi gösterir; doğrulama (public) sayfasında hiç gösterilmez.
 */
export function maskeAd(ad: string | null | undefined): string {
  if (!ad) return "—";
  return ad
    .trim()
    .split(/\s+/)
    .map((p) => (p.length ? `${p[0]}${"•".repeat(Math.max(2, p.length - 1))}` : p))
    .join(" ");
}
