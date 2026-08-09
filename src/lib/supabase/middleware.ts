import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Login'siz erişilebilen rotalar (paylaşım landing'i ve public microsite Faz/PR-7'de). */
function herkeseAcik(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/muteahhit") || // public rol landing (üretici)
    pathname.startsWith("/emlakci") || // public rol landing (emlakçı)
    pathname.startsWith("/guven") || // güven protokolü sayfası (public)
    pathname.startsWith("/mockup-") || // deneysel landing konseptleri (design lab)
    pathname.startsWith("/design-lab") || // konsept karşılaştırma sayfası
    pathname.startsWith("/recommended") || // final öneri konsepti
    pathname.startsWith("/login") ||
    pathname.startsWith("/sifremi-unuttum") || // şifre sıfırlama isteği (public)
    pathname.startsWith("/sifre-yenile") || // recovery oturumuyla yeni parola
    pathname.startsWith("/auth/") || // Supabase auth callback (code → oturum)
    pathname.startsWith("/kayit") || // self-registration
    pathname.startsWith("/p/") || // imzalı paylaşım landing
    pathname.startsWith("/proje/") || // public proje microsite (PR-7)
    pathname === "/konut-projeleri" || pathname.startsWith("/konut-projeleri/") || // public SEO hub (il/ilçe kırılımı)
    pathname.startsWith("/rehber") || // sektörel içerik: rehberler (public SEO/GEO)
    pathname.startsWith("/araclar") || // sektörel içerik: hesaplayıcılar/araçlar (public)
    pathname.startsWith("/sozluk") || // sektörel içerik: terim sözlüğü (public)
    pathname.startsWith("/karsilastirma") || // sektörel içerik: karşılaştırmalar (public)
    pathname.startsWith("/sablonlar") || // sektörel içerik: indirilebilir şablonlar (public)
    pathname.startsWith("/firma/") || // public müteahhit kurumsal SEO sayfası
    pathname.startsWith("/dogrula/") || // sertifika doğrulama (imzalı token, PII yok)
    pathname.startsWith("/kvkk-aydinlatma") || // KVKK aydınlatma (lead formundan, anonim erişim)
    pathname.startsWith("/kullanim-kosullari") || // hukuki sayfa (public)
    pathname.startsWith("/gizlilik") || // hukuki sayfa (public)
    pathname.startsWith("/tasarim") || // tasarım yönü örnekleri (geçici showcase)
    pathname.startsWith("/sunum") || // yüz yüze görüşme deck'leri (gizli link, noindex)
    pathname.startsWith("/anasayfa_mockup") || // interaktif anasayfa prototipi
    pathname.startsWith("/mockups") // design lab: skill karşılaştırma mockup'ları (public/mockups)
  );
}

/**
 * Her istekte Supabase oturumunu tazeler ve korumalı rotaları /login'e yönlendirir.
 * @supabase/ssr deseni: cookie'leri request+response arasında senkron tut.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() oturumu doğrular (getSession'a güvenme — token'ı server'da doğrular)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user && !herkeseAcik(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Pasif / onay bekleyen kullanıcı panellere giremez → bekleme ekranı
  if (user && !herkeseAcik(pathname) && pathname !== "/hesap-bekliyor") {
    const { data: profil } = await supabase
      .from("profiles")
      .select("durum")
      .eq("id", user.id)
      .single();
    if (profil && profil.durum !== "aktif") {
      const url = request.nextUrl.clone();
      url.pathname = "/hesap-bekliyor";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
