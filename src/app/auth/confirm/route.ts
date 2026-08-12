import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Markalı auth doğrulama route'u — link tamamen projedar.com üzerinde kalır
 * (supabase.co/verify yerine). Admin şifre sıfırlama / hesap kurulumu bağlantıları
 * `token_hash`'i buraya taşır; verifyOtp ile recovery oturumu kurulur ve `next`'e gidilir.
 * `next` yalnız iç yola izin verir (open redirect kalkanı).
 */
const IZINLI_TIP: EmailOtpType[] = ["recovery", "invite", "email", "signup", "magiclink"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/sifre-yenile";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/sifre-yenile";

  if (token_hash && type && IZINLI_TIP.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
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
