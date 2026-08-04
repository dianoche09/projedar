import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: "middleware" → "proxy" file convention.
// Her istekte Supabase oturumunu tazeler, korumalı rotaları /login'e yönlendirir.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Şunlar HARİÇ tüm rotalar:
     * - api: API rotaları kendi auth'unu yönetir (cron = CRON_SECRET, lead = public). Middleware
     *   /login'e yönlendirmesin → yoksa /api/cron 307 olur, hiç çalışmaz.
     * - statik/PWA: _next/static, _next/image, favicon, sw.js, manifest, ikon/görsel uzantıları.
     * - SEO/metadata: robots.txt, sitemap.xml, opengraph-image, twitter-image. Bunlar anonim
     *   crawler'lar (Googlebot/GPTBot vb.) tarafından çekilir; /login'e yönlendirilirse
     *   robots+sitemap+OG görseli arama motorlarına görünmez olur.
     * - .txt/.xml static dosyalar: llms.txt, llms-full.txt, IndexNow key (<key>.txt) da anonim
     *   çekilir; uzantı muafiyeti bunları /login redirect'inden korur.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
