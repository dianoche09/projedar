import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI } from "@/lib/seo/icerik-esigi";

/**
 * Lansman popup için public-safe canlı havuz özeti.
 * Yalnız yayınlı (public_slug) VE içerik-eşiğini geçen projeler → ad + şehir + sayı.
 * Eşik sitemap ile BİREBİR aynı (projeIcerikSkoru >= ICERIK_ESIGI): thin-content
 * projeler popup'ta gösterilmez (doorway/kalitesizlik algısı önlenir).
 * Per-proje stok/satışa-açık sayısı DÖNMEZ (özel bilgi; public'te gösterilmez).
 * Service-role yalnız sunucuda; RLS'te anon proje okuyamaz (kapalı-devre).
 */
export const revalidate = 300;

export async function GET() {
  try {
    const admin = createAdminClient();
    const [{ data: projeRaw }, { data: tipRaw }] = await Promise.all([
      admin
        .from("proje")
        .select(
          "id, ad, public_slug, son_guncelleme, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )",
        )
        .not("public_slug", "is", null)
        .order("son_guncelleme", { ascending: false }),
      admin.from("daire_tipi").select("proje_id"),
    ]);

    const tipSayim = new Map<string, number>();
    for (const t of (tipRaw ?? []) as { proje_id: string }[]) {
      tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const uygun = ((projeRaw ?? []) as any[]).filter(
      (p) =>
        projeIcerikSkoru({
          il: p.il,
          ilce: p.ilce,
          mahalle: p.mahalle,
          lat: p.lat,
          lng: p.lng,
          ada: p.ada,
          parsel: p.parsel,
          emsal: p.emsal,
          taks: p.taks,
          insaat_asamasi: p.insaat_asamasi,
          teslim_tarihi: p.teslim_tarihi,
          baslama_tarihi: p.baslama_tarihi,
          kunye: p.kunye ?? {},
          daireTipiSayisi: tipSayim.get(p.id) ?? 0,
          dogrulanmis: Boolean(p.uretici?.dogrulanmis),
          belge_dogrulandi: p.belge_dogrulandi,
        }) >= ICERIK_ESIGI,
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const projeler = uygun.slice(0, 3).map((p) => ({
      ad: String(p.ad ?? "").trim(),
      sehir: [p.il, p.ilce].filter(Boolean).join(" · "),
    }));

    return NextResponse.json(
      { projeler, projeSay: uygun.length },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch {
    return NextResponse.json({ projeler: [], projeSay: 0 });
  }
}
