"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { META_AYARLAR, tokenTemizle } from "@/lib/seo/site-ayar";

/** Çağıran oturumun admin olduğunu doğrula (service-role işlemi öncesi şart). */
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
 * Bilinen meta ayarlarını (arama motoru doğrulama token'ları) toplu kaydeder.
 * Token'lar yapıştırma prefiksinden temizlenir (google-site-verification=… → …).
 * Kayıttan sonra `site-ayar` cache tag'i revalidate → layout meta anında yansır.
 */
export async function metaAyarKaydet(formData: FormData) {
  await adminGuard();
  const admin = createAdminClient();

  const now = new Date().toISOString();
  const rows = META_AYARLAR.map((a) => ({
    anahtar: a.anahtar,
    deger: tokenTemizle(formData.get(a.anahtar) as string) ?? "",
    guncelleme: now,
  }));

  const { error } = await admin.from("site_ayar").upsert(rows, { onConflict: "anahtar" });
  if (error) {
    redirect(`/admin/ayarlar?hata=${encodeURIComponent("Kaydedilemedi. Tablo uygulandı mı? " + error.message)}`);
  }

  revalidateTag("site-ayar");
  revalidatePath("/admin/ayarlar");
  redirect("/admin/ayarlar?ok=1");
}
