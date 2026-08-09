"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * KVKK hesap / veri silme talebi oluştur.
 * Kullanıcı oturumuyla (anon key + RLS self_insert) yazılır — spoofing yok.
 * Mükerrer açık talep DB'deki partial unique index ile engellenir; çakışma sessiz geçilir
 * (kullanıcı zaten "beklemede" durumunu görür). Gerçek silmeyi admin panelden yapar.
 */
export async function hesapSilmeTalebiOlustur(
  revalideYolu: string,
  formData: FormData,
) {
  const sebep =
    String(formData.get("sebep") ?? "")
      .trim()
      .slice(0, 1000) || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("hesap_silme_talebi").insert({
    profile_id: user.id,
    eposta: user.email ?? null,
    sebep,
  });
  // Not: unique index çakışması (zaten beklemede talep) sessiz — hata sızdırmıyoruz.

  revalidatePath(revalideYolu);
}
