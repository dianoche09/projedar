import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth e-posta bağlantısı callback'i (şifre sıfırlama / recovery).
 * Maildeki `?code` PKCE kodunu oturuma çevirir, `next`'e (varsayılan /) yönlendirir.
 * `next` yalnız iç yola izin verir (open redirect kalkanı).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?hata=${encodeURIComponent(
      "Bağlantı doğrulanamadı veya süresi dolmuş. Sıfırlamayı yeniden dene.",
    )}`,
  );
}
