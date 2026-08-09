"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * KVKK silme talebini işle (yalnız admin — RLS admin_update policy).
 * Not: durum işaretleme İZ amaçlıdır; gerçek hesap/veri silmeyi admin ayrıca yapar.
 */
export async function talebiIsle(
  id: string,
  durum: "islendi" | "reddedildi",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("hesap_silme_talebi")
    .update({
      durum,
      islenme_tarihi: new Date().toISOString(),
      isleyen_admin: user?.id ?? null,
    })
    .eq("id", id);

  revalidatePath("/admin/hesap-silme");
}
