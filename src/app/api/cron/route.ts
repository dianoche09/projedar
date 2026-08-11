import { NextResponse } from "next/server";
import { cronYetkiKontrol } from "./_lib/auth";
import {
  freshnessCalistir,
  opsiyonSuresiCalistir,
  stokAcilisCalistir,
  fiyatKuraliCalistir,
  kesifFollowupCalistir,
  katalogUretCalistir,
  type CronSonuc,
} from "./_lib/isler";

// Katalog üretimi SerpAPI+Claude çağırır (yavaş); 300s'e kadar izin ver.
export const maxDuration = 300;

/**
 * Günlük cron DISPATCHER (Vercel Hobby: cron sayısı/sıklığı sınırlı → tek path).
 * vercel.json bu path'i günde bir tetikler; işler SIRAYLA çalışır:
 * 1. opsiyon-suresi — süresi dolan opsiyonlar temizlenir (birimler müsait olur)
 * 2. stok-acilis    — açılış tarihi gelen planlı birimler müsait yapılır
 * 3. freshness      — 15+ gündür güncellenmeyenler stale işaretlenir (son_guncelleme sırası önemli)
 * 4. kesif-followup — davet edilip yanıtsız adaylara hatırlatma
 * 5. katalog-uret   — kademeli SEO içerik (SerpAPI+Claude, ~10/gün); EN SON, kredi harcar
 * Bir işin hatası diğerlerini durdurmaz; sonuçlar toplu döner.
 * Tekil route'lar (freshness/stok-acilis/option-expiry) elle tetikleme için durur.
 */
export async function GET(request: Request) {
  const yetkisiz = cronYetkiKontrol(request);
  if (yetkisiz) return yetkisiz;

  const isler: Array<[string, () => Promise<CronSonuc>]> = [
    ["opsiyon_suresi", opsiyonSuresiCalistir],
    ["stok_acilis", stokAcilisCalistir],
    // Stok açıldıktan sonra dinamik fiyat kuralları (yeni müsait birimler de değerlendirilsin)
    ["fiyat_kurali", fiyatKuraliCalistir],
    ["freshness", freshnessCalistir],
    ["kesif_followup", kesifFollowupCalistir],
    // EN SON: kredi harcayan + yavaş katalog üretimi (kritik işler önce garanti olsun).
    ["katalog_uret", katalogUretCalistir],
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
