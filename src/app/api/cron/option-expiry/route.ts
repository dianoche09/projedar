import { NextResponse } from "next/server";
import { cronYetkiKontrol } from "../_lib/auth";
import { opsiyonSuresiCalistir } from "../_lib/isler";

/**
 * Opsiyon süre aşımı cron'u — elle tetikleme için tekil endpoint.
 * Günlük otomatik çalışma /api/cron dispatcher üzerinden yapılır.
 */
export async function GET(request: Request) {
  // Cron güvenliği (fail-closed)
  const yetkisiz = cronYetkiKontrol(request);
  if (yetkisiz) return yetkisiz;

  const sonuc = await opsiyonSuresiCalistir();
  return NextResponse.json(sonuc.govde, { status: sonuc.status });
}
