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

/**
 * Admin keşif motoru → aday davet linki imzası. (adayId + rol) HMAC ile imzalanır.
 * Kayıt tamamlanınca aday.donusen_user_id yazılıp huni kapanır (aday → kayit_oldu).
 * NOT: bu davet de KYC'yi ATLAMAZ — aday yine belge doğrulama + admin onayı kuyruğuna düşer.
 */
export function adayDavetToken(adayId: string, rol: string): string {
  return createHmac("sha256", secret()).update(`aday:${adayId}:${rol}`).digest("hex").slice(0, 16);
}

/** Graceful doğrulama — secret/parametre eksikse false (public /kayit 500 olmasın). */
export function adayDavetGecerli(adayId: string | undefined, rol: string | undefined, token: string | undefined): boolean {
  if (!adayId || !rol || !token) return false;
  try {
    return adayDavetToken(adayId, rol) === token;
  } catch {
    return false;
  }
}
