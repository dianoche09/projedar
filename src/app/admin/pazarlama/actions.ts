"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

/** BYOK entegrasyon anahtarları — her alan opsiyonel; boş bırakılan alan MEVCUDU KORUR. */
const ALANLAR = [
  "claude_key",
  "fal_key",
  "elevenlabs_key",
  "publer_key",
  "publer_workspace_id",
  "render_url",
  "render_token",
  "serpapi_key",
  "serper_key",
  "places_key",
] as const;

const AyarSchema = z.object({
  claude_key: z.string().trim().max(500).optional(),
  fal_key: z.string().trim().max(500).optional(),
  elevenlabs_key: z.string().trim().max(500).optional(),
  publer_key: z.string().trim().max(500).optional(),
  publer_workspace_id: z.string().trim().max(500).optional(),
  render_url: z.string().trim().max(500).optional(),
  render_token: z.string().trim().max(500).optional(),
  serpapi_key: z.string().trim().max(500).optional(),
  serper_key: z.string().trim().max(500).optional(),
  places_key: z.string().trim().max(500).optional(),
});

/**
 * Entegrasyon anahtarlarını kaydet (singleton satır, kısmi güncelleme).
 * Boş gelen alan patch'e girmez → o anahtar silinmez, mevcut değeri korunur.
 * Anahtar temizlemek için özel değer "-" gönderilir (→ null).
 */
export async function pazarlamaAyarKaydet(formData: FormData): Promise<void> {
  const adminId = await adminGuard();

  const parsed = AyarSchema.safeParse(
    Object.fromEntries(ALANLAR.map((a) => [a, formData.get(a) ?? undefined])),
  );
  if (!parsed.success) {
    redirect(`/admin/pazarlama?hata=${encodeURIComponent("Geçersiz giriş")}`);
  }

  const patch: Record<string, string | null> = {};
  for (const a of ALANLAR) {
    const v = (parsed.data[a] ?? "").trim();
    if (v === "-") patch[a] = null; // açık temizleme
    else if (v) patch[a] = v; // doluysa güncelle; boşsa dokunma
  }

  if (Object.keys(patch).length === 0) {
    redirect(`/admin/pazarlama?mesaj=${encodeURIComponent("Değişiklik yapılmadı")}`);
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    redirect(`/admin/pazarlama?hata=${encodeURIComponent("Service-role anahtarı tanımlı değil (.env + Vercel)")}`);
  }

  const { error } = await admin
    .from("pazarlama_entegrasyon")
    .upsert(
      { id: "default", ...patch, updated_at: new Date().toISOString(), updated_by: adminId },
      { onConflict: "id" },
    );
  if (error) {
    redirect(`/admin/pazarlama?hata=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/pazarlama");
  redirect(`/admin/pazarlama?mesaj=${encodeURIComponent("Anahtarlar kaydedildi")}`);
}
