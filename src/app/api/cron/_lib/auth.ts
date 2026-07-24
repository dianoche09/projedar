import { NextResponse } from "next/server";

/**
 * Cron güvenliği — FAIL-CLOSED.
 * - CRON_SECRET tanımsızsa endpoint ÇALIŞMAZ (500 + log). Açık kapı bırakılmaz.
 * - Vercel cron, isteğe otomatik `Authorization: Bearer <CRON_SECRET>` header'ı ekler;
 *   eşleşmeyen istek 401 alır.
 * Dönüş: sorun varsa hazır NextResponse, yetki tamsa null.
 */
export function cronYetkiKontrol(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error("CRON_SECRET tanımlı değil; cron endpoint'i kapalı (fail-closed).");
    return NextResponse.json({ hata: "Sunucu yapılandırma hatası" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ hata: "Yetkisiz erişim" }, { status: 401 });
  }

  return null;
}
