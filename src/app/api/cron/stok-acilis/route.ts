import { NextResponse } from "next/server";
import { cronYetkiKontrol } from "../_lib/auth";
import { stokAcilisCalistir } from "../_lib/isler";

/**
 * Kademeli/planlı açılım cron'u (MVP-1) — elle tetikleme için tekil endpoint.
 * Günlük otomatik çalışma /api/cron dispatcher üzerinden yapılır.
 */
export async function GET(request: Request) {
  // Cron güvenliği (fail-closed)
  const yetkisiz = cronYetkiKontrol(request);
  if (yetkisiz) return yetkisiz;

  const sonuc = await stokAcilisCalistir();
  return NextResponse.json(sonuc.govde, { status: sonuc.status });
}
