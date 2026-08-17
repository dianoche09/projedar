"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
 * KVKK silme talebini işle (yalnız admin — savunma derinliği: adminGuard + RLS admin_update).
 * Not: durum işaretleme İZ amaçlıdır; gerçek hesap/veri silmeyi admin ayrıca yapar.
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

  revalidatePath("/admin/hesap-silme");
}
