import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI } from "@/lib/seo/icerik-esigi";
import { sitemapIcerikleri, icerikYolu } from "@/lib/icerik/kayit";
import { tumHubProjeleri } from "@/lib/seo/konut-hub";
import { tumFirmaSluglari } from "@/lib/seo/firma";

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
    { url: `${SITE}/rehber`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/sozluk`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/karsilastirma`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
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

  // Dış katalog projeleri (aktif + ağa girmemiş): aynı eşik; forward'lananlar hariç,
  // kendi public_slug'larıyla URL çakışması dedup'lanır (resolver kendi DB'yi önceler).
  let katalog: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: katRaw } = await supabase
      .from("katalog_proje")
      .select("slug, il, ilce, mahalle, oda_tipleri, durum, teslim, updated_at")
      .eq("aktif", true)
      .is("eslesen_proje_id", null);
    const mevcut = new Set(projeler.map((x) => x.url));
    /* eslint-disable @typescript-eslint/no-explicit-any */
    katalog = ((katRaw ?? []) as any[])
      .filter(
        (k) =>
          projeIcerikSkoru({
            il: k.il,
            ilce: k.ilce,
            mahalle: k.mahalle,
            insaat_asamasi: k.durum,
            teslim_tarihi: k.teslim,
            kunye: {},
            daireTipiSayisi: Array.isArray(k.oda_tipleri) ? k.oda_tipleri.length : 0,
            dogrulanmis: false,
          }) >= ICERIK_ESIGI,
      )
      .map((k) => ({
        url: `${SITE}/proje/${k.slug}`,
        lastModified: k.updated_at ? new Date(k.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }))
      .filter((x) => !mevcut.has(x.url));
    /* eslint-enable @typescript-eslint/no-explicit-any */
  } catch {
    katalog = [];
  }

  // Konut projeleri hub'ı: kök + il + il/ilçe kırılım sayfaları (SEO iç bağlantı ağı).
  let hub: MetadataRoute.Sitemap = [{ url: `${SITE}/konut-projeleri`, lastModified: now, changeFrequency: "weekly", priority: 0.6 }];
  try {
    const hepsi = await tumHubProjeleri();
    const iller = new Set<string>();
    const ilceler = new Set<string>();
    for (const p of hepsi) {
      iller.add(p.ilSlug);
      if (p.ilceSlug) ilceler.add(`${p.ilSlug}/${p.ilceSlug}`);
    }
    hub = [
      ...hub,
      ...[...iller].map((il) => ({ url: `${SITE}/konut-projeleri/${il}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
      ...[...ilceler].map((x) => ({ url: `${SITE}/konut-projeleri/${x}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.4 })),
    ];
  } catch {
    // hub kök URL'si yine de kalır
  }

  // Müteahhit kurumsal sayfaları (/firma/[slug]): eşik-geçen projesi olan firmalar.
  let firmalar: MetadataRoute.Sitemap = [];
  try {
    const liste = await tumFirmaSluglari();
    firmalar = liste.map((f) => ({ url: `${SITE}/firma/${f.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 }));
  } catch {
    firmalar = [];
  }

  // Sektörel içerik sayfaları (registry'den otomatik; yüzlerce içerik olsa da
  // sitemap elle güncellenmez). Yalnız published + index'lenebilir olanlar.
  const icerikler: MetadataRoute.Sitemap = sitemapIcerikleri().map((m) => ({
    url: `${SITE}${icerikYolu(m)}`,
    lastModified: new Date(m.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...statik, ...icerikler, ...hub, ...firmalar, ...projeler, ...katalog];
}
