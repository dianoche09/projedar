import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

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
 * Token'ın doğruluğunu kontrol eder. Constant-time karşılaştırma (timingSafeEqual) —
 * `===` karakter-karakter erken çıktığından token'ı timing ile sızdırabilirdi. Uzunluk
 * gizli değil (sabit 16 hex) → önce uzunluk eşitliği, sonra sabit-zaman byte kıyası.
 */
export function verifyShareToken(emlakciId: string, birimId: string, token: string): boolean {
  const beklenen = Buffer.from(generateShareToken(emlakciId, birimId));
  const gelen = Buffer.from(token ?? "");
  if (beklenen.length !== gelen.length) return false;
  return timingSafeEqual(beklenen, gelen);
}

/* ────────────────────────────────────────────────────────────────────────
 * KISA PAYLAŞIM KODU — /p/{kod} → (emlakçı, birim)
 * Uzun /p/{uuid}/{uuid}/{token} linkine kısa + iptal edilebilir + ölçülebilir
 * alternatif. YALNIZ server (service-role admin client). Tablo yoksa / hata olursa
 * fonksiyonlar null döner → çağıran uzun (imzalı) linke düşer; hiçbir şey kırılmaz.
 * ──────────────────────────────────────────────────────────────────────── */

// Karışması kolay karakterler (0/O, 1/I/l) çıkarıldı — telefonda okunur/dikte edilebilir.
const KOD_ALFABE = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

/** Kriptografik rastgele kısa kod (varsayılan 10 karakter ≈ 58 bit; tahmin edilemez). */
function yeniKod(uzunluk = 10): string {
  const b = randomBytes(uzunluk);
  let s = "";
  for (let i = 0; i < uzunluk; i++) s += KOD_ALFABE[b[i] % KOD_ALFABE.length];
  return s;
}

/** Bir (emlakçı, birim) için kısa kodu getirir; yoksa üretir (idempotent). Hata → null. */
export async function paylasimKodAl(emlakciId: string, birimId: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data: mevcut } = await admin
      .from("paylasim_kod")
      .select("kod")
      .eq("emlakci_id", emlakciId)
      .eq("birim_id", birimId)
      .maybeSingle();
    if (mevcut?.kod) return mevcut.kod as string;

    const kod = yeniKod();
    const { data: ins, error } = await admin
      .from("paylasim_kod")
      .insert({ kod, emlakci_id: emlakciId, birim_id: birimId })
      .select("kod")
      .single();
    if (!error && ins?.kod) return ins.kod as string;

    // Yarış (aynı çift eşzamanlı) → tekrar oku.
    const { data: tekrar } = await admin
      .from("paylasim_kod")
      .select("kod")
      .eq("emlakci_id", emlakciId)
      .eq("birim_id", birimId)
      .maybeSingle();
    return (tekrar?.kod as string) ?? null;
  } catch {
    return null;
  }
}

/** Toplu: bir danışman + birim listesi için birim_id → kod haritası (katalog/ızgara). Hata → boş map. */
export async function paylasimKodlariAl(
  emlakciId: string,
  birimIds: string[],
): Promise<Map<string, string>> {
  const harita = new Map<string, string>();
  const benzersiz = [...new Set(birimIds.filter(Boolean))];
  if (benzersiz.length === 0) return harita;
  try {
    const admin = createAdminClient();
    const { data: mevcut } = await admin
      .from("paylasim_kod")
      .select("kod, birim_id")
      .eq("emlakci_id", emlakciId)
      .in("birim_id", benzersiz);
    for (const r of mevcut ?? []) harita.set(r.birim_id as string, r.kod as string);

    const eksik = benzersiz.filter((id) => !harita.has(id));
    if (eksik.length > 0) {
      const yeni = eksik.map((birim_id) => ({ kod: yeniKod(), emlakci_id: emlakciId, birim_id }));
      // Çift çakışırsa (yarış) yoksay; sonra hepsini yeniden oku.
      await admin.from("paylasim_kod").insert(yeni);
      const { data: tumu } = await admin
        .from("paylasim_kod")
        .select("kod, birim_id")
        .eq("emlakci_id", emlakciId)
        .in("birim_id", eksik);
      for (const r of tumu ?? []) harita.set(r.birim_id as string, r.kod as string);
    }
  } catch {
    /* tablo yok / hata → boş map; çağıran uzun linke düşer */
  }
  return harita;
}

/**
 * /p route slug'ını (emlakçı, birim) çiftine çözer — iki biçim de desteklenir:
 *  - [emlakçı, birim, token] (3 parça, eski imzalı uzun link) → HMAC doğrula
 *  - [kod]                    (1 parça, yeni kısa link)        → DB'den çöz
 * Geçersiz → null (route notFound / noindex uygular).
 */
export async function slugCoz(
  slug: string[] | undefined,
): Promise<{ emlakciId: string; birimId: string; kod: string | null } | null> {
  if (!slug) return null;
  if (slug.length === 3) {
    // Eski imzalı uzun link — iptal edilemez (kod yok). Geriye-uyum için render'da desteklenir.
    const [emlakciId, birimId, token] = slug;
    return verifyShareToken(emlakciId, birimId, token) ? { emlakciId, birimId, kod: null } : null;
  }
  if (slug.length === 1) {
    // Yeni kısa kod — iptal edilebilir (aktif=false → çözüm null). kod'u geri döndür ki
    // etkileşim/lead API'leri de kod üzerinden yetkilendirilsin (render+aksiyon tutarlı revoke).
    const coz = await paylasimKoduCoz(slug[0]);
    return coz ? { ...coz, kod: slug[0] } : null;
  }
  return null;
}

/** Kısa kodu (emlakçı, birim) çiftine çözer. Geçersiz/pasif/hata → null. */
export async function paylasimKoduCoz(
  kod: string,
): Promise<{ emlakciId: string; birimId: string } | null> {
  if (!kod || kod.length > 24) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("paylasim_kod")
      .select("emlakci_id, birim_id")
      .eq("kod", kod)
      .eq("aktif", true)
      .maybeSingle();
    if (!data) return null;
    return { emlakciId: data.emlakci_id as string, birimId: data.birim_id as string };
  } catch {
    return null;
  }
}
