import { NextResponse } from "next/server";
import { cronYetkiKontrol } from "./_lib/auth";
import {
  freshnessCalistir,
  opsiyonSuresiCalistir,
  stokAcilisCalistir,
  kesifFollowupCalistir,
  type CronSonuc,
} from "./_lib/isler";

/**
 * Günlük cron DISPATCHER (Vercel Hobby: cron sayısı/sıklığı sınırlı → tek path).
 * vercel.json bu path'i günde bir tetikler; üç iş SIRAYLA çalışır:
 * 1. opsiyon-suresi — süresi dolan opsiyonlar temizlenir (birimler müsait olur)
 * 2. stok-acilis    — açılış tarihi gelen planlı birimler müsait yapılır
 * 3. freshness      — 15+ gündür güncellenmeyenler stale işaretlenir (en son;
 *                     ilk iki iş son_guncelleme yenilediği için sıra önemli)
 * Bir işin hatası diğerlerini durdurmaz; sonuçlar toplu döner.
 * Tekil route'lar (freshness/stok-acilis/option-expiry) elle tetikleme için durur.
 */
export async function GET(request: Request) {
  const yetkisiz = cronYetkiKontrol(request);
  if (yetkisiz) return yetkisiz;

  const isler: Array<[string, () => Promise<CronSonuc>]> = [
    ["opsiyon_suresi", opsiyonSuresiCalistir],
    ["stok_acilis", stokAcilisCalistir],
    ["freshness", freshnessCalistir],
    ["kesif_followup", kesifFollowupCalistir],
  ];

  const sonuclar: Record<string, unknown> = {};
  let tumBasarili = true;

  for (const [ad, calistir] of isler) {
    try {
      const sonuc = await calistir();
      sonuclar[ad] = sonuc.govde;
      if (sonuc.status >= 400) tumBasarili = false;
    } catch (hata) {
      console.error(`Cron dispatcher '${ad}' hatası:`, hata);
      sonuclar[ad] = { hata: hata instanceof Error ? hata.message : "Bilinmeyen hata" };
      tumBasarili = false;
    }
  }

  return NextResponse.json(
    { basarili: tumBasarili, sonuclar },
    { status: tumBasarili ? 200 : 500 },
  );
}
