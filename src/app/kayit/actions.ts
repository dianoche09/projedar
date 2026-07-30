"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { belgeleriKaydet } from "@/lib/belge";
import { davetGecerli } from "@/lib/davet";
import { profilDetayTopla, KOLON_ALANLARI } from "@/lib/kayitAlanlar";

// Self-registration — rol seçimli. Kayıt 'onay_bekliyor' başlar (handle_new_user trigger).
// Role-özel kapsamlı profil (firma/yetki/faaliyet) profil_detay jsonb'ye yazılır (lib/kayitAlanlar).
const kayitSemasi = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(6, "Parola en az 6 karakter olmalı"),
  ad: z.string().trim().min(2, "Ad-soyad gir"),
  telefon: z.string().trim().max(20).optional(),
  talep_rol: z.enum(["uretici", "emlakci", "ofis_yetkili"], { message: "Hesap türü seç" }),
});

export async function kayitOl(formData: FormData) {
  const sonuc = kayitSemasi.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    ad: formData.get("ad"),
    telefon: (formData.get("telefon") as string) || undefined,
    talep_rol: formData.get("talep_rol"),
  });
  if (!sonuc.success) {
    redirect(`/kayit?hata=${encodeURIComponent(sonuc.error.issues[0].message)}`);
  }
  const { email, password, ad, telefon, talep_rol } = sonuc.data;

  // Role-özel kapsamlı profil (firma / yetki belge no / faaliyet) → profil_detay.
  const detay = profilDetayTopla(talep_rol, (k) => formData.get(k) as string | null);

  // Müteahhit daveti (imzalı) — yalnız emlakçı rolünde ve imza geçerliyse attribution.
  // NOT: davet KYC'yi ATLAMAZ; emlakçı yine belge_durumu='yok' başlar (DB guard zorlar).
  const d = (formData.get("d") as string) || undefined;
  const n = (formData.get("n") as string) || undefined;
  const t = (formData.get("t") as string) || undefined;
  const davetEden = talep_rol === "emlakci" && davetGecerli(d, n, t) ? d : null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // profil_detay METADATA'ya da yazılır: e-posta onayı AÇIKSA signUp oturum döndürmez →
      // aşağıdaki profil update RLS'e takılır; metadata'daki kopya veriyi kaybolmaktan korur.
      data: { ad, telefon: telefon ?? null, talep_rol, kayit_meta: { davet_eden: davetEden, profil_detay: detay } },
    },
  });
  if (error) {
    redirect(`/kayit?hata=${encodeURIComponent(error.message)}`);
  }

  // Oturum yalnız e-posta onayı KAPALIYKEN açılır. Varsa: kapsamlı veriyi profile yaz
  // (segmentasyon alanları il/ilce/uzmanlik/marka kendi kolonuna DA → segment tahsis çalışır).
  const oturumVar = !!data?.session;
  if (data?.user && oturumVar) {
    const kolon: Record<string, string> = {};
    for (const k of KOLON_ALANLARI) if (detay[k]) kolon[k] = detay[k];
    const { error: upErr } = await supabase.from("profiles").update({ profil_detay: detay, ...kolon }).eq("id", data.user.id);
    if (upErr && Object.keys(kolon).length) {
      await supabase.from("profiles").update(kolon).eq("id", data.user.id);
    }
  }

  // Emlakçı belge adımı OTURUM ister → yalnız oturum varsa oraya. Onay açıksa (oturum yok)
  // herkes bekleme ekranına; belge/profil sonra (onay + giriş) tamamlanır. Veri metadata'da güvende.
  redirect(oturumVar && talep_rol === "emlakci" ? "/kayit/belge" : "/hesap-bekliyor");
}

/**
 * Kayıt wizard'ının 3. adımı — emlakçı yetki belgesi (MYS + vergi levhası) yükler.
 * Atlanabilir: yüklemezse belge_durumu='yok' kalır → doğrulanana kadar yalnız demo proje görür.
 */
export async function kayitBelgeYukle(formData: FormData): Promise<void> {
  const r = await belgeleriKaydet(formData);
  if (!r.ok && r.hata === "AUTH") redirect("/login");
  if (!r.ok) redirect(`/kayit/belge?hata=${encodeURIComponent(r.hata)}`);
  redirect("/hesap-bekliyor");
}
