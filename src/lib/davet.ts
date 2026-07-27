import { createHmac } from "crypto";

/**
 * Müteahhit → emlakçı davet linki imzası. (ureticiId + firma adı) HMAC ile imzalanır ki
 * link kurcalanamasın (isim URL'de gösterilir ama imza korur). LEAD_SHARE_SECRET paylaşılır.
 *
 * ÖNEMLİ: Davet KYC'yi ATLAMAZ. Davetle gelen emlakçı da belge_durumu='yok' başlar; canlı stok
 * yalnız admin doğrulaması sonrası açılır (belge_durumu_guard trigger DB-seviyesinde zorlar).
 */
function secret(): string {
  const s = process.env.LEAD_SHARE_SECRET;
  if (!s) throw new Error("LEAD_SHARE_SECRET tanımlı değil (davet linki imzası).");
  return s;
}

export function davetToken(ureticiId: string, ad: string): string {
  return createHmac("sha256", secret()).update(`davet:${ureticiId}:${ad}`).digest("hex").slice(0, 16);
}

/** Graceful: secret yoksa / eksik parametrede false döner (public /kayit sayfası 500 olmasın). */
export function davetGecerli(ureticiId: string | undefined, ad: string | undefined, token: string | undefined): boolean {
  if (!ureticiId || !ad || !token) return false;
  try {
    return davetToken(ureticiId, ad) === token;
  } catch {
    return false;
  }
}
