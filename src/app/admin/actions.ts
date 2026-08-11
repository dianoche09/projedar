"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { mailGonder, hesapKurulumMaili, parolaSifirlamaMaili } from "@/lib/mail";
import { zUuid } from "@/lib/uuid";

/** Çağıran oturumun admin olduğunu doğrula (service-role işlemleri öncesi şart). Admin id döner. */
async function adminGuard(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profil } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  if (profil?.rol !== "admin") redirect("/");
  return user.id;
}

/**
 * Güçlü rastgele geçici parola (yalnız server). Kullanıcıya ASLA gösterilmez; hesap
 * güvenli kurtarma bağlantısıyla kurulur. Admin/plaintext parola tutmayı bitirir.
 */
function geciciParola(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`;
}

/** İstek origin'i (mail içi mutlak link için). */
async function istekOrigin(): Promise<string> {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host") ?? "projedar.com"}`;
}

/**
 * Tek-kullanımlık kurtarma bağlantısı üret (Supabase generateLink) + best-effort mail.
 * Link /auth/callback → /sifre-yenile'ye düşer; kullanıcı KENDİ parolasını belirler.
 * Üretilen linki döner (mail düşmezse admin elle iletebilsin — admin-in-the-loop fallback).
 */
async function kurulumLinkiGonder(
  admin: ReturnType<typeof createAdminClient>,
  origin: string,
  email: string,
  ad: string | null,
  tur: "kurulum" | "sifirlama",
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/sifre-yenile` },
  });
  const link = data?.properties?.action_link ?? null;
  if (error || !link) return null;
  await mailGonder({
    to: email,
    konu: tur === "kurulum" ? "Projedar · hesabın hazır, şifreni belirle" : "Projedar · şifre sıfırlama",
    html: tur === "kurulum" ? hesapKurulumMaili({ ad, link }) : parolaSifirlamaMaili({ ad, link }),
  });
  return link;
}

/** Üretici doğrulama / güven rozeti (admin yetkisi — RLS is_admin owner). */
export async function ureticiDogrula(formData: FormData) {
  const adminId = await adminGuard();
  const supabase = await createClient();
  const uretici_id = String(formData.get("uretici_id"));
  const dogrula = formData.get("dogrula") === "true";
  await supabase.from("uretici").update({ dogrulanmis: dogrula }).eq("id", uretici_id);
  await kayitYaz({ tip: "dogrulama", profileId: adminId, payload: { uretici_id, dogrula } });
  revalidatePath("/admin");
  revalidatePath("/admin/ureticiler");
}

const AtaSchema = z.object({
  ofis_id: zUuid,
  paket_id: z.union([zUuid, z.literal("")]),
});

/**
 * Ofise abonelik paketi ata (tek aktif abonelik). Boş paket = aboneliği kaldır.
 * Önce mevcut aktif/deneme aboneliği iptal eder (unique partial index ihlalini önler).
 */
export async function ofiseAbonelikAta(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = AtaSchema.safeParse({
    ofis_id: formData.get("ofis_id"),
    paket_id: formData.get("paket_id") ?? "",
  });
  if (!parsed.success) return;
  const { ofis_id, paket_id } = parsed.data;

  const supabase = await createClient();
  await supabase
    .from("abonelik")
    .update({ durum: "iptal" })
    .eq("ofis_id", ofis_id)
    .in("durum", ["deneme", "aktif"]);
  if (paket_id) {
    await supabase.from("abonelik").insert({ ofis_id, paket_id, durum: "aktif" });
  }
  await kayitYaz({ tip: "abonelik", profileId: adminId, payload: { ofis_id, paket_id: paket_id || null } });
  revalidatePath("/admin");
}

const UretAtaSchema = z.object({
  uretici_id: zUuid,
  paket_id: z.union([zUuid, z.literal("")]),
});

/**
 * Üreticiye abonelik paketi ata (gelir modeli ANA ayağı: müteahhit anlaşması). Boş paket = kaldır.
 * Tek aktif abonelik (abonelik_uretici_aktif unique index) — önce mevcut aktif/deneme iptal edilir.
 */
export async function ureticiyeAbonelikAta(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = UretAtaSchema.safeParse({
    uretici_id: formData.get("uretici_id"),
    paket_id: formData.get("paket_id") ?? "",
  });
  if (!parsed.success) return;
  const { uretici_id, paket_id } = parsed.data;

  const supabase = await createClient();
  await supabase
    .from("abonelik")
    .update({ durum: "iptal" })
    .eq("uretici_id", uretici_id)
    .in("durum", ["deneme", "aktif"]);
  if (paket_id) {
    const { error } = await supabase.from("abonelik").insert({ uretici_id, paket_id, durum: "aktif" });
    if (error) redirect(`/admin/ureticiler?hata=${encodeURIComponent(error.message)}`);
  }
  await kayitYaz({ tip: "abonelik", profileId: adminId, payload: { uretici_id, paket_id: paket_id || null } });
  revalidatePath("/admin");
  revalidatePath("/admin/ureticiler");
  redirect(`/admin/ureticiler?mesaj=${encodeURIComponent(paket_id ? "Abonelik atandı" : "Abonelik kaldırıldı")}`);
}

// ── KYC belge doğrulama (admin onay/red → emlakçı belge_durumu; trigger 'dogrulandi'ya yalnız admin izin verir) ──
export async function belgeKarar(formData: FormData): Promise<void> {
  const adminId = await adminGuard();
  const profileId = String(formData.get("profile_id"));
  const karar = String(formData.get("karar"));
  if (!zUuid.safeParse(profileId).success || (karar !== "onay" && karar !== "red")) {
    redirect("/admin/basvurular?hata=" + encodeURIComponent("Geçersiz istek"));
  }
  const yeni = karar === "onay" ? "dogrulandi" : "red";
  const supabase = await createClient();
  await supabase.from("kullanici_belge").update({ durum: yeni }).eq("profile_id", profileId).eq("durum", "beklemede");
  await supabase.from("profiles").update({ belge_durumu: yeni }).eq("id", profileId);
  await kayitYaz({ tip: "dogrulama", profileId: adminId, payload: { hedef: profileId, karar: yeni } });
  revalidatePath("/admin/basvurular");
  revalidatePath("/admin");
  redirect(`/admin/basvurular?mesaj=${encodeURIComponent(karar === "onay" ? "Danışman doğrulandı" : "Belgeler reddedildi")}`);
}

// ── Başvuru dosyası: tek başvuranın tüm detayı (service-role yalnız sunucuda, DEĞİŞMEZ #1) ──
export type DosyaBelge = { tip: string; imzali: string | null; durum: string; ai_sonuc: unknown; created_at: string };
export type DosyaOlay = { id: string; tip: string; payload: unknown; created_at: string };
export type DosyaVeri = {
  id: string;
  ad: string | null;
  telefon: string | null;
  talep_rol: string | null;
  rol: string | null;
  durum: string | null;
  belge_durumu: string | null;
  ofis_id: string | null;
  il: string | null;
  ilce: string | null;
  kayit_meta: Record<string, unknown> | null;
  profil_detay: Record<string, unknown> | null;
  created_at: string;
  belgeler: DosyaBelge[];
  olaylar: DosyaOlay[];
};

/** Tek başvuranın tam dosyasını çeker (profil_detay + KYC belge + ai_sonuc + iz). */
export async function getDosya(id: string): Promise<{ ok: true; veri: DosyaVeri } | { ok: false; hata: string }> {
  await adminGuard();
  if (!zUuid.safeParse(id).success) return { ok: false, hata: "Geçersiz başvuru" };

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, hata: "Service-role anahtarı tanımlı değil" };
  }

  const { data: p, error } = await admin
    .from("profiles")
    .select("id, ad, telefon, talep_rol, rol, durum, belge_durumu, ofis_id, il, ilce, kayit_meta, profil_detay, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !p) return { ok: false, hata: "Başvuru bulunamadı" };

  const { data: belgeRaw } = await admin
    .from("kullanici_belge")
    .select("tip, url, durum, ai_sonuc, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: true });

  const belgeler: DosyaBelge[] = [];
  for (const b of belgeRaw ?? []) {
    const { data: signed } = await admin.storage.from("kyc-belge").createSignedUrl(b.url as string, 3600);
    belgeler.push({
      tip: b.tip as string,
      imzali: signed?.signedUrl ?? null,
      durum: b.durum as string,
      ai_sonuc: b.ai_sonuc,
      created_at: b.created_at as string,
    });
  }

  const { data: olayRaw } = await admin
    .from("events")
    .select("id, tip, payload, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(12);

  return {
    ok: true,
    veri: {
      id: p.id as string,
      ad: p.ad as string | null,
      telefon: p.telefon as string | null,
      talep_rol: p.talep_rol as string | null,
      rol: p.rol as string | null,
      durum: p.durum as string | null,
      belge_durumu: p.belge_durumu as string | null,
      ofis_id: p.ofis_id as string | null,
      il: p.il as string | null,
      ilce: p.ilce as string | null,
      kayit_meta: (p.kayit_meta ?? null) as Record<string, unknown> | null,
      profil_detay: (p.profil_detay ?? null) as Record<string, unknown> | null,
      created_at: p.created_at as string,
      belgeler,
      olaylar: (olayRaw ?? []) as DosyaOlay[],
    },
  };
}

// ── Üyelik paketi CRUD (tip/fiyat/kota %100 admin-kontrollü; üç hedef) ──
const bosNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

const PaketSchema = z.object({
  ad: z.string().trim().min(1).max(60),
  hedef: z.enum(["ofis", "uretici", "emlakci"]),
  fiyat_aylik: z.coerce.number().min(0),
  para_birimi: z.enum(["TRY", "USD", "EUR"]),
  kota_proje: z.coerce.number().int().positive().nullable(),
  kota_koltuk: z.coerce.number().int().positive().nullable(),
  kota_ai: z.coerce.number().int().nonnegative().nullable(),
  gelismis_rapor: z.boolean(),
  aktif: z.boolean(),
});

function paketGirdi(formData: FormData) {
  return PaketSchema.safeParse({
    ad: formData.get("ad"),
    hedef: formData.get("hedef"),
    fiyat_aylik: formData.get("fiyat_aylik") ?? 0,
    para_birimi: formData.get("para_birimi") ?? "TRY",
    kota_proje: bosNull(formData.get("kota_proje")),
    kota_koltuk: bosNull(formData.get("kota_koltuk")),
    kota_ai: bosNull(formData.get("kota_ai")),
    gelismis_rapor: formData.get("gelismis_rapor") === "on",
    aktif: formData.get("aktif") !== "false",
  });
}

/** Yeni üyelik paketi tanımla — ad/fiyat/kota tamamen admin girer (hardcode yok). */
export async function paketEkle(formData: FormData) {
  await adminGuard();
  const parsed = paketGirdi(formData);
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("abonelik_paketi").insert(parsed.data);
  revalidatePath("/admin");
}

/** Mevcut paketi düzenle (fiyat/kota/özellik/aktiflik). */
export async function paketDuzenle(formData: FormData) {
  await adminGuard();
  const id = zUuid.safeParse(formData.get("id"));
  const parsed = paketGirdi(formData);
  if (!id.success || !parsed.success) return;
  const supabase = await createClient();
  await supabase.from("abonelik_paketi").update(parsed.data).eq("id", id.data);
  revalidatePath("/admin");
}

/** Paketi sil — atanmış aktif abonelik varsa silmek yerine pasifleştirir. */
export async function paketSil(formData: FormData) {
  await adminGuard();
  const id = zUuid.safeParse(formData.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("abonelik")
    .select("id", { count: "exact", head: true })
    .eq("paket_id", id.data)
    .in("durum", ["deneme", "aktif"]);
  if (count && count > 0) {
    await supabase.from("abonelik_paketi").update({ aktif: false }).eq("id", id.data);
  } else {
    await supabase.from("abonelik_paketi").delete().eq("id", id.data);
  }
  revalidatePath("/admin");
}

// ── Onay kuyruğu (kayıt → admin onayı → aktif) ──
const OnaySchema = z.object({
  kullanici_id: zUuid,
  rol: z.enum(["uretici", "emlakci", "ofis_yetkili", "marka_yetkili", "arsa_sahibi"]),
  ofis_id: z.union([zUuid, z.literal("")]),
});

/** Bekleyen kaydı onayla: rol + ofis ata, durum=aktif, onay izini bırak. */
export async function kullaniciOnayla(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = OnaySchema.safeParse({
    kullanici_id: formData.get("kullanici_id"),
    rol: formData.get("rol"),
    ofis_id: formData.get("ofis_id") ?? "",
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({
      rol: parsed.data.rol,
      ofis_id: parsed.data.ofis_id || null,
      durum: "aktif",
      onaylayan_id: adminId,
      onay_tarihi: new Date().toISOString(),
    })
    .eq("id", parsed.data.kullanici_id);
  await kayitYaz({ tip: "onay", profileId: adminId, payload: { kullanici_id: parsed.data.kullanici_id, rol: parsed.data.rol, eylem: "onay" } });
  revalidatePath("/admin");
  revalidatePath("/admin/basvurular");
}

/** Bekleyen kaydı reddet → durum=pasif (soft; iz kalır, silinmez). */
export async function kullaniciReddet(formData: FormData) {
  const adminId = await adminGuard();
  const id = zUuid.safeParse(formData.get("kullanici_id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ durum: "pasif" }).eq("id", id.data);
  await kayitYaz({ tip: "onay", profileId: adminId, payload: { kullanici_id: id.data, eylem: "red" } });
  revalidatePath("/admin");
  revalidatePath("/admin/basvurular");
}

/** Hesap durumu değiştir (aktif/pasif/askıya/arşiv) — kullanıcı yaşam döngüsü. */
export async function hesapDurumDegistir(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = z
    .object({
      kullanici_id: zUuid,
      durum: z.enum(["aktif", "pasif", "askida", "arsivli"]),
    })
    .safeParse({
      kullanici_id: formData.get("kullanici_id"),
      durum: formData.get("durum"),
    });
  if (!parsed.success) return;
  if (parsed.data.kullanici_id === adminId && parsed.data.durum !== "aktif") {
    redirect(`/admin/kullanicilar?hata=${encodeURIComponent("Kendi hesabını devre dışı bırakamazsın")}`);
  }
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ durum: parsed.data.durum })
    .eq("id", parsed.data.kullanici_id);
  await kayitYaz({ tip: "onay", profileId: adminId, payload: { kullanici_id: parsed.data.kullanici_id, eylem: "durum", durum: parsed.data.durum } });
  revalidatePath("/admin");
  revalidatePath("/admin/kullanicilar", "layout");
}

// ── Kullanıcı düzenleme (rol + ofis + durum tek formda) ──
const KullaniciSchema = z.object({
  kullanici_id: zUuid,
  rol: z.enum(["uretici", "emlakci", "ofis_yetkili", "marka_yetkili", "arsa_sahibi", "admin"]),
  ofis_id: z.union([zUuid, z.literal("")]),
  durum: z.enum(["onay_bekliyor", "aktif", "pasif", "askida", "arsivli"]),
});

/** Kullanıcıyı düzenle (rol/ofis/durum) — admin user yönetimi. */
export async function kullaniciGuncelle(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = KullaniciSchema.safeParse({
    kullanici_id: formData.get("kullanici_id"),
    rol: formData.get("rol"),
    ofis_id: formData.get("ofis_id") ?? "",
    durum: formData.get("durum"),
  });
  if (!parsed.success) return;
  if (parsed.data.kullanici_id === adminId && (parsed.data.rol !== "admin" || parsed.data.durum !== "aktif")) {
    redirect(`/admin/kullanicilar?hata=${encodeURIComponent("Kendi rol/durumunu düşüremezsin")}`);
  }

  const supabase = await createClient();
  // Kategorizasyon (segment tahsis için): marka/il/ilce/uzmanlik. Boş + ofis varsa → ofisten türet.
  const kat: { marka: string | null; il: string | null; ilce: string | null; uzmanlik: string | null } = {
    marka: String(formData.get("marka") ?? "").trim() || null,
    il: String(formData.get("il") ?? "").trim() || null,
    ilce: String(formData.get("ilce") ?? "").trim() || null,
    uzmanlik: String(formData.get("uzmanlik") ?? "").trim() || null,
  };
  if (parsed.data.ofis_id && (!kat.marka || !kat.il || !kat.ilce)) {
    const { data: ofis } = await supabase
      .from("ofis")
      .select("marka, il, ilce")
      .eq("id", parsed.data.ofis_id)
      .single();
    if (ofis) {
      kat.marka = kat.marka ?? ((ofis.marka as string | null) ?? null);
      kat.il = kat.il ?? ((ofis.il as string | null) ?? null);
      kat.ilce = kat.ilce ?? ((ofis.ilce as string | null) ?? null);
    }
  }
  await supabase
    .from("profiles")
    .update({
      rol: parsed.data.rol,
      ofis_id: parsed.data.ofis_id || null,
      durum: parsed.data.durum,
      marka: kat.marka,
      il: kat.il,
      ilce: kat.ilce,
      uzmanlik: kat.uzmanlik,
    })
    .eq("id", parsed.data.kullanici_id);
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin");
}

// ── Admin kullanıcı oluşturma (service-role) ──
const OlusturSchema = z.object({
  email: z.string().email("Geçerli e-posta"),
  ad: z.string().trim().min(2, "Ad-soyad"),
  telefon: z.string().trim().max(20).optional(),
  rol: z.enum(["uretici", "emlakci", "ofis_yetkili", "marka_yetkili", "arsa_sahibi", "admin"]),
  ofis_id: z.union([zUuid, z.literal("")]),
});

/**
 * Admin yeni kullanıcı oluşturur (createUser + profil rol/ofis/aktif). Service-role.
 * Düz-metin parola YOK: rastgele geçici parola atanır, kullanıcıya kurulum bağlantısı
 * e-postalanır ve ilk girişte KENDİ şifresini belirler.
 */
export async function kullaniciOlustur(formData: FormData) {
  await adminGuard();
  const parsed = OlusturSchema.safeParse({
    email: formData.get("email"),
    ad: formData.get("ad"),
    telefon: (formData.get("telefon") as string) || undefined,
    rol: formData.get("rol"),
    ofis_id: formData.get("ofis_id") ?? "",
  });
  if (!parsed.success) {
    redirect(`/admin/kullanicilar?hata=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const { email, ad, telefon, rol, ofis_id } = parsed.data;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    redirect(`/admin/kullanicilar?hata=${encodeURIComponent("Service-role anahtarı tanımlı değil (.env + Vercel)")}`);
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: geciciParola(),
    email_confirm: true,
    user_metadata: { ad, telefon: telefon ?? null },
  });
  if (error || !created.user) {
    redirect(`/admin/kullanicilar?hata=${encodeURIComponent(error?.message ?? "Oluşturulamadı")}`);
  }

  // Admin oluşturduğu için doğrudan aktif + rol/ofis atanmış
  await admin
    .from("profiles")
    .update({ ad, telefon: telefon ?? null, rol, ofis_id: ofis_id || null, durum: "aktif" })
    .eq("id", created.user.id);

  // Kurulum bağlantısı e-postala (best-effort). Mail düşmezse detay sayfasından tekrar gönderilebilir.
  const link = await kurulumLinkiGonder(admin, await istekOrigin(), email, ad, "kurulum");
  revalidatePath("/admin/kullanicilar");
  redirect(
    `/admin/kullanicilar?mesaj=${encodeURIComponent(
      link
        ? `${email} oluşturuldu · kurulum bağlantısı e-postasına gönderildi`
        : `${email} oluşturuldu · e-posta gönderilemedi, detay sayfasından sıfırlama linki gönder`,
    )}`,
  );
}

/**
 * Kullanıcıya şifre sıfırlama bağlantısı gönder (admin tetikli). Düz-metin parola YOK:
 * güvenli tek-kullanımlık link e-postalanır, kullanıcı KENDİ şifresini belirler.
 * useActionState imzası — sonuç + fallback link'i UI'da gösterir (redirect'te link sızmaz).
 */
export type SifreLinkState = { ok: boolean; mesaj: string; link?: string | null } | null;

export async function parolaSifirlamaLinkiGonder(
  _prev: SifreLinkState,
  formData: FormData,
): Promise<SifreLinkState> {
  const adminId = await adminGuard();
  const id = zUuid.safeParse(formData.get("kullanici_id"));
  if (!id.success) return { ok: false, mesaj: "Geçersiz kullanıcı" };

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, mesaj: "Service-role anahtarı tanımlı değil (.env + Vercel)" };
  }

  const { data: u, error: e0 } = await admin.auth.admin.getUserById(id.data);
  const email = u?.user?.email;
  if (e0 || !email) return { ok: false, mesaj: "Kullanıcının e-posta adresi bulunamadı" };

  const { data: p } = await admin.from("profiles").select("ad").eq("id", id.data).single();
  const link = await kurulumLinkiGonder(admin, await istekOrigin(), email, (p?.ad as string | null) ?? null, "sifirlama");
  if (!link) return { ok: false, mesaj: "Sıfırlama bağlantısı üretilemedi" };

  await kayitYaz({ tip: "onay", profileId: adminId, payload: { kullanici_id: id.data, eylem: "parola_sifirlama_link" } });
  return {
    ok: true,
    mesaj: `Sıfırlama bağlantısı ${email} adresine gönderildi. Kullanıcı kendi şifresini belirleyecek.`,
    link,
  };
}

// ── Hesap tanımlama: ÜRETİCİ firma + sahip kullanıcı (service-role) ──
const UreticiEkleSchema = z.object({
  ad: z.string().trim().min(2, "Firma adı en az 2 karakter"),
  vergi_no: z.string().trim().max(20).optional(),
  sahip_ad: z.string().trim().min(2, "Sahip ad-soyad"),
  sahip_email: z.string().email("Geçerli e-posta"),
});

/**
 * Admin yeni ÜRETİCİ hesabı açar: firma kaydı + sahip kullanıcı (rol=uretici, aktif, doğrulanmış).
 * Düz-metin parola YOK: sahip kurulum bağlantısıyla kendi şifresini belirler.
 */
export async function ureticiEkle(formData: FormData) {
  await adminGuard();
  const parsed = UreticiEkleSchema.safeParse({
    ad: formData.get("ad"),
    vergi_no: (formData.get("vergi_no") as string) || undefined,
    sahip_ad: formData.get("sahip_ad"),
    sahip_email: formData.get("sahip_email"),
  });
  if (!parsed.success) {
    redirect(`/admin/ureticiler?hata=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const d = parsed.data;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    redirect(`/admin/ureticiler?hata=${encodeURIComponent("Service-role anahtarı tanımlı değil (.env + Vercel)")}`);
  }

  // 1) Sahip kullanıcı (auth) — rol=uretici, aktif; rastgele parola, kurulum linki gönderilir
  const { data: created, error } = await admin.auth.admin.createUser({
    email: d.sahip_email,
    password: geciciParola(),
    email_confirm: true,
    user_metadata: { ad: d.sahip_ad },
  });
  if (error || !created.user) {
    redirect(`/admin/ureticiler?hata=${encodeURIComponent(error?.message ?? "Sahip kullanıcı oluşturulamadı")}`);
  }
  await admin.from("profiles").update({ ad: d.sahip_ad, rol: "uretici", durum: "aktif" }).eq("id", created.user.id);

  // 2) Üretici firma kaydı + sahip bağı (admin açtığı için doğrulanmış)
  const { error: e2 } = await admin.from("uretici").insert({
    ad: d.ad,
    vergi_no: d.vergi_no ?? null,
    sahip_id: created.user.id,
    dogrulanmis: true,
  });
  if (e2) redirect(`/admin/ureticiler?hata=${encodeURIComponent(e2.message)}`);

  const link = await kurulumLinkiGonder(admin, await istekOrigin(), d.sahip_email, d.sahip_ad, "kurulum");
  revalidatePath("/admin/ureticiler");
  redirect(
    `/admin/ureticiler?mesaj=${encodeURIComponent(
      `${d.ad} eklendi · sahip ${d.sahip_email}${link ? " · kurulum bağlantısı gönderildi" : " · e-posta gönderilemedi, kullanıcıdan sıfırlama iste"}`,
    )}`,
  );
}

// ── Hesap tanımlama: OFİS + yetkili kullanıcı (service-role) ──
const OfisEkleSchema = z.object({
  ad: z.string().trim().min(2, "Ofis adı en az 2 karakter"),
  marka: z.string().trim().max(60).optional(),
  il: z.string().trim().max(40).optional(),
  ilce: z.string().trim().max(40).optional(),
  yetkili_ad: z.string().trim().min(2, "Yetkili ad-soyad"),
  yetkili_email: z.string().email("Geçerli e-posta"),
});

/**
 * Admin yeni OFİS hesabı açar: ofis kaydı + yetkili kullanıcı (rol=ofis_yetkili, ofis_id, aktif).
 * Düz-metin parola YOK: yetkili kurulum bağlantısıyla kendi şifresini belirler.
 */
export async function ofisEkle(formData: FormData) {
  await adminGuard();
  const parsed = OfisEkleSchema.safeParse({
    ad: formData.get("ad"),
    marka: (formData.get("marka") as string) || undefined,
    il: (formData.get("il") as string) || undefined,
    ilce: (formData.get("ilce") as string) || undefined,
    yetkili_ad: formData.get("yetkili_ad"),
    yetkili_email: formData.get("yetkili_email"),
  });
  if (!parsed.success) {
    redirect(`/admin/ofisler?hata=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  const d = parsed.data;

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    redirect(`/admin/ofisler?hata=${encodeURIComponent("Service-role anahtarı tanımlı değil (.env + Vercel)")}`);
  }

  // 1) Ofis kaydı
  const { data: ofis, error } = await admin
    .from("ofis")
    .insert({ ad: d.ad, marka: d.marka ?? null, il: d.il ?? null, ilce: d.ilce ?? null })
    .select("id")
    .single();
  if (error || !ofis) {
    redirect(`/admin/ofisler?hata=${encodeURIComponent(error?.message ?? "Ofis oluşturulamadı")}`);
  }

  // 2) Yetkili kullanıcı — rol=ofis_yetkili, ofise bağlı, aktif; rastgele parola, kurulum linki
  const { data: created, error: e2 } = await admin.auth.admin.createUser({
    email: d.yetkili_email,
    password: geciciParola(),
    email_confirm: true,
    user_metadata: { ad: d.yetkili_ad },
  });
  if (e2 || !created.user) {
    redirect(`/admin/ofisler?hata=${encodeURIComponent(e2?.message ?? "Yetkili oluşturulamadı")}`);
  }
  await admin
    .from("profiles")
    .update({ ad: d.yetkili_ad, rol: "ofis_yetkili", ofis_id: ofis.id, durum: "aktif" })
    .eq("id", created.user.id);

  const link = await kurulumLinkiGonder(admin, await istekOrigin(), d.yetkili_email, d.yetkili_ad, "kurulum");
  revalidatePath("/admin/ofisler");
  redirect(
    `/admin/ofisler?mesaj=${encodeURIComponent(
      `${d.ad} eklendi · yetkili ${d.yetkili_email}${link ? " · kurulum bağlantısı gönderildi" : " · e-posta gönderilemedi, kullanıcıdan sıfırlama iste"}`,
    )}`,
  );
}
