"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { kayitYaz } from "@/lib/events";

/** Çağıran oturumun admin olduğunu doğrula (admin/actions.ts adminGuard ile aynı desen). Admin id döner. */
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
 * KVKK silme talebini işaretle (yalnız admin — adminGuard + RLS admin_update).
 * E3/DÜRÜSTLÜK: 'islendi' = "talep alındı, manuel işlenecek" (İZ) — İMHA DEĞİL. Otomatik erasure
 * (auth silme + PII anonimleştirme + yasal-minimum saklama) henüz kurulmadı; retention hukuk onayına bağlı.
 * State-değiştiren admin aksiyonu → E2/INV-AUDIT-001 gereği denetime yazılır.
 */
export async function talebiIsle(
  id: string,
  durum: "islendi" | "reddedildi",
) {
  const adminId = await adminGuard();
  const supabase = await createClient();

  const { error } = await supabase
    .from("hesap_silme_talebi")
    .update({
      durum,
      islenme_tarihi: new Date().toISOString(),
      isleyen_admin: adminId,
    })
    .eq("id", id);
  // Sessiz başarısızlık yok: RLS/hata durumunda kullanıcıya yansıt (diğer admin action'larla tutarlı).
  if (error) redirect(`/admin/hesap-silme?hata=${encodeURIComponent(error.message)}`);

  await kayitYaz({
    tip: "hesap",
    profileId: adminId,
    payload: { eylem: "kvkk_talep_isaret", hedef: id, durum, not: durum === "islendi" ? "alındı-manuel (imha DEĞİL)" : "reddedildi" },
  });
  revalidatePath("/admin/hesap-silme");
}
