import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI } from "@/lib/seo/icerik-esigi";

const SITE = "https://projedar.com";

/**
 * Statik landing + yasal sayfalar + programmatic proje sayfaları (public_slug opt-in).
 * Kapalı-devre: panel/havuz/mikrosite yok. Eşik-altı public_slug'lar dahil EDİLMEZ
 * (sayfa notFound verir → soft-404 olmasın). DB down ise statik'e graceful düşer.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statik: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/muteahhit`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/emlakci`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/guven`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/kullanim-kosullari`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/gizlilik`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/kvkk-aydinlatma`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let projeler: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const [{ data: projeRaw }, { data: tipRaw }] = await Promise.all([
      supabase
        .from("proje")
        .select(
          "id, public_slug, son_guncelleme, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )",
        )
        .not("public_slug", "is", null),
      supabase.from("daire_tipi").select("proje_id"),
    ]);

    const tipSayim = new Map<string, number>();
    for (const t of (tipRaw ?? []) as { proje_id: string }[]) {
      tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    projeler = ((projeRaw ?? []) as any[])
      .filter(
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
      )
      .map((p) => ({
        url: `${SITE}/proje/${p.public_slug}`,
        lastModified: p.son_guncelleme ? new Date(p.son_guncelleme) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch {
    projeler = [];
  }

  return [...statik, ...projeler];
}
