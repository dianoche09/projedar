import { NextResponse } from "next/server";
import { cronYetkiKontrol } from "../cron/_lib/auth";
import { indexNowGonder } from "@/lib/seo/indexnow";

// Landing içeriği değişince Bing/Yandex'e anlık bildir. Elle veya cron ile tetiklenir;
// CRON_SECRET ile korunur (Bearer). Middleware /api'yi zaten muaf tutar.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const yetkisiz = cronYetkiKontrol(request);
  if (yetkisiz) return yetkisiz;

  const sonuc = await indexNowGonder();
  return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 502 });
}
