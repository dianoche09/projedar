import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminIdVeya } from "@/lib/kesif/guard";
import { anahtarlariOku } from "@/lib/kesif/anahtar";
import { kesfet } from "@/lib/kesif/kesfet";
import { normalize } from "@/lib/kesif/dedup";
import { SEGMENTLER, type Segment } from "@/lib/kesif/tipler";

export const maxDuration = 300; // keşif çok sorgulu → uzun sürebilir (Fluid Compute)

/**
 * Keşif motoru API (admin-only, service-role).
 * GET   → aday listesi (filtre: il/segment/durum) + huni istatistikleri
 * POST  → kampanya çalıştır (keşif; Claude YOK, ucuz) → aday havuzuna yaz
 * PATCH → aday alan güncelle (durum/not/email/telefon)
 */

export async function GET(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const admin = createAdminClient();
  const sp = req.nextUrl.searchParams;
  const il = (sp.get("il") ?? "").trim();
  const segment = (sp.get("segment") ?? "").trim();
  const durum = (sp.get("durum") ?? "").trim();

  let qb = admin
    .from("aday")
    .select(
      "id, firma_adi, segment, kisi, email, telefon, website, il, ilce, ozet, kaynak, durum, temas_sayisi, son_temas, sonraki_takip, opt_out, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (il) qb = qb.eq("il", il);
  if (segment) qb = qb.eq("segment", segment);
  if (durum) qb = qb.eq("durum", durum);

  const [{ data: adaylar }, { data: huniRaw }] = await Promise.all([
    qb,
    admin.from("aday").select("durum"),
  ]);

  const huni: Record<string, number> = {};
  for (const r of huniRaw ?? []) huni[(r.durum as string) ?? "yeni"] = (huni[(r.durum as string) ?? "yeni"] ?? 0) + 1;

  return NextResponse.json({ adaylar: adaylar ?? [], huni });
}

const KampanyaSchema = z.object({
  il: z.string().trim().min(2).max(60),
  segmentler: z.array(z.enum(SEGMENTLER)).min(1),
});

export async function POST(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const parsed = KampanyaSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ hata: "Geçersiz giriş (il + segment gerekli)" }, { status: 400 });
  const { il, segmentler } = parsed.data;

  const anahtar = await anahtarlariOku();
  if (!anahtar.serpapi_key && !anahtar.serper_key && !anahtar.places_key) {
    return NextResponse.json(
      { hata: "Keşif anahtarı yok. /admin/pazarlama'dan SerpAPI/Serper/Places anahtarı girin." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: kampanya, error: kampErr } = await admin
    .from("kesif_kampanya")
    .insert({ il, segmentler, durum: "calisiyor", baslatan: adminId })
    .select("id")
    .single();
  if (kampErr || !kampanya) {
    return NextResponse.json(
      { hata: `Kampanya oluşturulamadı: ${kampErr?.message ?? "bilinmeyen"} (migration uygulandı mı?)` },
      { status: 500 },
    );
  }
  const kampanyaId = kampanya.id as string;

  try {
    const yil = new Date().getFullYear();
    const { adaylar, hatalar } = await kesfet(il, segmentler as Segment[], anahtar, yil);

    // Aday havuzuna yaz — dedup uniq index (firma_adi_norm, il) çift kaydı reddeder (ignore).
    const satirlar = adaylar.map((a) => ({
      firma_adi: a.firma_adi,
      firma_adi_norm: normalize(a.firma_adi),
      segment: a.segment,
      email: a.email ?? null,
      telefon: a.telefon ?? null,
      website: a.website ?? null,
      il,
      ilce: a.ilce ?? null,
      adres: a.adres ?? null,
      ozet: a.ozet ?? null,
      kaynak: a.kaynak,
      kaynak_url: a.kaynak_url ?? null,
      kampanya_id: kampanyaId,
      durum: "yeni",
    }));

    let eklenen = 0;
    if (satirlar.length) {
      const { data: ekli, error: upErr } = await admin
        .from("aday")
        .upsert(satirlar, { onConflict: "firma_adi_norm,il", ignoreDuplicates: true })
        .select("id");
      if (upErr) throw new Error(`Aday yazma hatası: ${upErr.message}`);
      eklenen = ekli?.length ?? 0;
    }

    await admin
      .from("kesif_kampanya")
      .update({
        durum: "tamamlandi",
        bulunan_aday: eklenen,
        sonuc: { toplam_bulunan: adaylar.length, eklenen, hatalar: hatalar.slice(0, 20) },
      })
      .eq("id", kampanyaId);

    return NextResponse.json({ kampanya_id: kampanyaId, bulunan: adaylar.length, eklenen, hatalar });
  } catch (e) {
    await admin.from("kesif_kampanya").update({ durum: "hata", sonuc: { hata: (e as Error).message } }).eq("id", kampanyaId);
    return NextResponse.json({ hata: (e as Error).message }, { status: 500 });
  }
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  durum: z.string().trim().max(30).optional(),
  notlar: z.string().trim().max(2000).optional(),
  email: z.string().trim().max(200).optional(),
  telefon: z.string().trim().max(40).optional(),
});

export async function PATCH(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ hata: "Geçersiz giriş" }, { status: 400 });
  const { id, ...alanlar } = parsed.data;

  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(alanlar)) if (v !== undefined) patch[k] = v;
  if (Object.keys(patch).length === 0) return NextResponse.json({ hata: "Değişiklik yok" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("aday").update(patch).eq("id", id);
  if (error) return NextResponse.json({ hata: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
