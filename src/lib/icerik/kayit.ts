/**
 * Merkezî içerik registry.
 *
 * Tüm sektörel içeriklerin META kaydı burada. Sitemap, internal linking,
 * schema, breadcrumb ve CTA bu tek kaynaktan türetilir; yeni sayfa = 1 kayıt
 * + 1 gövde dosyası. Yüzlerce içerik olsa da sitemap elle güncellenmez.
 *
 * KURAL: yalnız `published: true` içerikler linklenir ve sitemap'e girer
 * (yayınlanmamış hedefe 404 internal link verilmez).
 */
import type { IcerikMeta, IcerikKategori } from "./tipler";

const SITE = "https://projedar.com";

export const ICERIKLER: IcerikMeta[] = [
  {
    slug: "eids-emlakci-rehberi",
    kategori: "rehber",
    contentType: "rehber",
    title: "EİDS Rehberi 2026: Emlak Danışmanları İçin İlan Yetkilendirme",
    h1: "EİDS: Emlak Danışmanları İçin İlan Yetkilendirme Rehberi",
    description:
      "EİDS nedir, satılık ilanlarda 1 Şubat 2026 zorunluluğu, e-Devlet yetkilendirme ve sosyal medya kuralları. Emlak danışmanları için resmî kaynaklı, güncel rehber.",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-09",
    sourceCheckedAt: "2026-08-09",
    author: "Projedar Editoryal",
    reviewer: null,
    sources: ["ticaret-eids-yetki", "ticaret-eids-basin", "edevlet-tasinmaz-izin"],
    iliskiler: {
      // Faz 1 kardeşleri yayınlandıkça buraya eklenecek (published filtresi
      // sayesinde yayınlanana kadar linklenmez):
      //   "rehber/eids-sosyal-medya-ilan-paylasimi"
      //   "rehber/e-devletten-emlakciya-eids-yetkisi"
      //   "rehber/tasinmaz-ticareti-yetki-belgesi"
      //   "karsilastirma/eids-vs-yetki-sozlesmesi"
      hub: null,
      siblings: [],
      tools: [],
      glossary: [],
    },
    ctaLevel: "medium",
    canonical: `${SITE}/rehber/eids-emlakci-rehberi`,
    index: true,
    published: true,
  },
];

/** Kategori-içi slug ile içerik bul (yalnız yayında). */
export function icerikBul(kategori: IcerikKategori, slug: string): IcerikMeta | undefined {
  return ICERIKLER.find((m) => m.kategori === kategori && m.slug === slug && m.published);
}

/** Bir kategorinin yayındaki içerikleri (yeni → eski). */
export function kategoriIcerikleri(kategori: IcerikKategori): IcerikMeta[] {
  return ICERIKLER.filter((m) => m.kategori === kategori && m.published).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

/** Sitemap için tüm yayındaki + index'lenebilir içerikler. */
export function sitemapIcerikleri(): IcerikMeta[] {
  return ICERIKLER.filter((m) => m.published && m.index);
}

/** "kategori/slug" referansını yayındaki içeriğe çözer (yoksa undefined → linklenmez). */
export function refCoz(ref: string): IcerikMeta | undefined {
  const [kategori, slug] = ref.split("/");
  return ICERIKLER.find((m) => m.kategori === kategori && m.slug === slug && m.published);
}

/** İçerik URL yolu (kategori + slug). canonical ise meta.canonical'da (tam URL). */
export function icerikYolu(m: Pick<IcerikMeta, "kategori" | "slug">): string {
  return `/${m.kategori}/${m.slug}`;
}
