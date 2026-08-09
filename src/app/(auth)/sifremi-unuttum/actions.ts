"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// MVP kod kuralı: input doğrulama Zod ile (CLAUDE.md).
const semasi = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
});

/**
 * Şifre sıfırlama bağlantısı iste.
 * Kullanıcı enumeration'ı önlemek için e-posta kayıtlı olsun olmasın HEP aynı mesaj döner.
 * Bağlantı /auth/callback üzerinden oturuma çevrilip /sifre-yenile'ye yönlendirir.
 */
export async function sifreSifirlamaIste(formData: FormData) {
  const sonuc = semasi.safeParse({ email: formData.get("email") });
  if (!sonuc.success) {
    redirect(
      `/sifremi-unuttum?hata=${encodeURIComponent(sonuc.error.issues[0].message)}`,
    );
  }

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();

  try {
    // Enumeration koruması: hata/sonuç sızdırma — çıktı hep aynı.
    await supabase.auth.resetPasswordForEmail(sonuc.data.email, {
      redirectTo: `${origin}/auth/callback?next=/sifre-yenile`,
    });
  } catch {
    // Sessiz: kayıtlı olmayan e-posta ya da geçici hata kullanıcıya sızmaz.
  }

  redirect(
    `/sifremi-unuttum?mesaj=${encodeURIComponent(
      "Kayıtlıysa sıfırlama bağlantısı e-postana gönderildi. Gelen kutunu (ve spam) kontrol et.",
    )}`,
  );
}
