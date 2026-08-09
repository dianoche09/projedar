"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Login ile tutarlı: parola en az 6 karakter (CLAUDE.md kod kuralı — Zod doğrulama).
const semasi = z
  .object({
    password: z.string().min(6, "Parola en az 6 karakter olmalı"),
    password2: z.string(),
  })
  .refine((d) => d.password === d.password2, {
    message: "Parolalar eşleşmiyor",
    path: ["password2"],
  });

/**
 * Yeni parolayı kaydet. Recovery oturumu (callback'te kurulan) gerektirir.
 * Başarıda oturumu kapatıp login'e mesajla yönlendirir — kullanıcı yeni parolayla girer.
 */
export async function sifreYenile(formData: FormData) {
  const sonuc = semasi.safeParse({
    password: formData.get("password"),
    password2: formData.get("password2"),
  });
  if (!sonuc.success) {
    redirect(
      `/sifre-yenile?hata=${encodeURIComponent(sonuc.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/sifre-yenile?hata=${encodeURIComponent(
        "Bağlantı geçersiz veya süresi dolmuş. Sıfırlamayı yeniden dene.",
      )}`,
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: sonuc.data.password,
  });
  if (error) {
    redirect(`/sifre-yenile?hata=${encodeURIComponent(error.message)}`);
  }

  await supabase.auth.signOut();
  redirect(
    `/login?mesaj=${encodeURIComponent(
      "Şifren güncellendi. Yeni parolanla giriş yap.",
    )}`,
  );
}
