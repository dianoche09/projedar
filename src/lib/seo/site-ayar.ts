import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Site meta ayarları (arama motoru doğrulama token'ları). Kaynak: `site_ayar` tablosu
 * (admin panelinden düzenlenir). Layout bunları verification meta etiketlerine basar.
 *
 * Okuma cache'lenir (kök layout her istekte çalışır); admin kaydında `site-ayar`
 * tag'i revalidate edilir → anında yansır. DB yoksa/düşükse boş döner (graceful).
 */

/** Admin formundaki düzenlenebilir meta anahtarları (form + layout tek kaynaktan). */
export const META_AYARLAR = [
  {
    anahtar: "google_site_verification",
    etiket: "Google Search Console",
    aciklama: "GSC doğrulama token — meta content değeri (yalnız token, prefix'siz).",
    ornek: "xOtOb…RBfWc",
  },
  {
    anahtar: "bing_site_verification",
    etiket: "Bing Webmaster",
    aciklama: "Bing doğrulama token (msvalidate.01).",
    ornek: "",
  },
  {
    anahtar: "yandex_verification",
    etiket: "Yandex Webmaster",
    aciklama: "Yandex doğrulama token (yandex-verification).",
    ornek: "",
  },
] as const;

export type MetaAnahtar = (typeof META_AYARLAR)[number]["anahtar"];

/** Google token'ın env fallback'i — kullanıcı GOOGLE_SITE_VERIFICATION'a prefix'li koyabilir. */
const GOOGLE_FALLBACK = "xOtObUVrKfggM86d9Ef3Iw-XL02AwWqhCFPdIdRBfWc";

/**
 * Yapıştırma hatalarına dayanıklı token temizleyici:
 * - Tam `<meta … content="X">` etiketi yapıştırıldıysa X'i çeker.
 * - `google-site-verification=…`, `msvalidate.01=…`, `yandex-verification=…`, `content=…`
 *   prefiksini atar. Çıplak token (padding `=` dahil) zarar görmez.
 */
export function tokenTemizle(ham?: string | null): string | undefined {
  if (!ham) return undefined;
  const v = ham.trim();
  const etiket = v.match(/content=["']([^"']+)["']/i);
  if (etiket) return etiket[1].trim() || undefined;
  const temiz = v
    .replace(/^(google-site-verification|msvalidate\.01|yandex-verification|content)\s*=\s*/i, "")
    .trim();
  return temiz || undefined;
}

/** Tüm meta ayarlarını oku (cache'li, service-role). Hata → {} (graceful). */
export const siteAyarGetir = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("site_ayar").select("anahtar, deger");
      const map: Record<string, string> = {};
      for (const r of (data ?? []) as { anahtar: string; deger: string }[]) {
        if (r.deger) map[r.anahtar] = r.deger;
      }
      return map;
    } catch {
      return {};
    }
  },
  ["site-ayar"],
  { revalidate: 300 },
);

/**
 * Layout için hazır `verification` metadata nesnesi.
 * Öncelik: DB değeri → env (GOOGLE_SITE_VERIFICATION) → sabit fallback. Hepsi temizlenir.
 * Boş alanlar atlanır (Next tanımsız verification'ı basmaz).
 */
export async function verificationMeta(): Promise<{
  google?: string;
  yandex?: string;
  other?: Record<string, string>;
}> {
  const ayar = await siteAyarGetir();

  const google =
    tokenTemizle(ayar.google_site_verification) ??
    tokenTemizle(process.env.GOOGLE_SITE_VERIFICATION) ??
    GOOGLE_FALLBACK;
  const yandex = tokenTemizle(ayar.yandex_verification);
  const bing = tokenTemizle(ayar.bing_site_verification);

  const out: { google?: string; yandex?: string; other?: Record<string, string> } = {};
  if (google) out.google = google;
  if (yandex) out.yandex = yandex;
  if (bing) out.other = { "msvalidate.01": bing };
  return out;
}
