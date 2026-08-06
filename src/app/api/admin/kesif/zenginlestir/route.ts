import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminIdVeya } from "@/lib/kesif/guard";
import { anahtarlariOku } from "@/lib/kesif/anahtar";
import { zenginlestir } from "@/lib/kesif/zenginlestir";
import type { AdayHam, Segment } from "@/lib/kesif/tipler";

export const maxDuration = 300;

/**
 * Seçili adayları Claude ile zenginleştir (admin-tetikli — token maliyeti kontrollü).
 * Ham aday → segment + uygunluk_skoru + özet + iletişim doğrulama. durum='zenginlesti'.
 */
const Schema = z.object({ adayIds: z.array(z.string().uuid()).min(1).max(50) });

export async function POST(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ hata: "Geçersiz giriş (adayIds)" }, { status: 400 });

  const { claude_key } = await anahtarlariOku();
  if (!claude_key) {
    return NextResponse.json(
      { hata: "Claude anahtarı yok. /admin/pazarlama'dan claude_key girin." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: adaylar } = await admin
    .from("aday")
    .select("id, firma_adi, segment, website, telefon, email, adres, ozet")
    .in("id", parsed.data.adayIds);
  if (!adaylar?.length) return NextResponse.json({ hata: "Aday bulunamadı" }, { status: 404 });

  const hamlar: AdayHam[] = adaylar.map((a) => ({
    firma_adi: a.firma_adi as string,
    segment: (a.segment as Segment) ?? "muteahhit",
    website: (a.website as string) ?? undefined,
    telefon: (a.telefon as string) ?? undefined,
    email: (a.email as string) ?? undefined,
    adres: (a.adres as string) ?? undefined,
    ozet: (a.ozet as string) ?? undefined,
    kaynak: "serpapi_maps",
  }));

  let zengin;
  try {
    zengin = await zenginlestir(hamlar, claude_key);
  } catch (e) {
    return NextResponse.json({ hata: `Zenginleştirme hatası: ${(e as Error).message}` }, { status: 500 });
  }

  // firma_adi ile eşle; her adayı güncelle. İletişim: Claude değeri ?? mevcut (regex kaybolmasın).
  const zMap = new Map(zengin.map((z) => [z.firma_adi.trim().toLocaleLowerCase("tr-TR"), z]));
  let guncellenen = 0;
  for (const a of adaylar) {
    const z = zMap.get((a.firma_adi as string).trim().toLocaleLowerCase("tr-TR"));
    if (!z) continue;
    const { error } = await admin
      .from("aday")
      .update({
        segment: z.segment,
        uygunluk_skoru: z.uygunluk_skoru,
        ozet: z.ozet,
        proje_sayisi: z.proje_sayisi ?? null,
        kisi: z.kisi ?? null,
        email: z.email ?? (a.email as string) ?? null,
        telefon: z.telefon ?? (a.telefon as string) ?? null,
        durum: "zenginlesti",
      })
      .eq("id", a.id as string);
    if (!error) guncellenen++;
  }

  return NextResponse.json({ guncellenen, toplam: adaylar.length });
}
