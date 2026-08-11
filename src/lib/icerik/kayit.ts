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
      siblings: ["rehber/tasinmaz-ticareti-yetki-belgesi", "rehber/eids-sosyal-medya-ilan-paylasimi"],
      tools: [],
      glossary: [],
    },
    ctaLevel: "medium",
    heroGorsel: "/generated/rehber/eids-hero.jpg",
    heroAlt:
      "Modern bir ofiste, pencereden konut projesi silüeti görünürken tablet üzerinde proje inceleyen gayrimenkul danışmanı",
    canonical: `${SITE}/rehber/eids-emlakci-rehberi`,
    index: true,
    published: true,
  },
  {
    slug: "tasinmaz-ticareti-yetki-belgesi",
    kategori: "rehber",
    contentType: "rehber",
    title: "Taşınmaz Ticareti Yetki Belgesi Nasıl Alınır? (2026)",
    h1: "Taşınmaz Ticareti Yetki Belgesi: Şartlar, Başvuru ve 2026 Güncel Durum",
    description:
      "Taşınmaz ticareti yetki belgesi nedir, işletme ve sorumlu emlak danışmanı şartları, Seviye 5 mesleki yeterlilik, TTBS başvurusu ve 2026 yıllık harç. Resmî kaynaklı, güncel rehber.",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-11",
    sourceCheckedAt: "2026-08-11",
    author: "Projedar Editoryal",
    reviewer: null,
    sources: ["ticaret-tasinmaz-yonetmelik", "ttbs-yetki-belgesi"],
    iliskiler: {
      hub: null,
      siblings: ["rehber/eids-emlakci-rehberi"],
      tools: [],
      glossary: [],
    },
    ctaLevel: "medium",
    heroGorsel: "/generated/rehber/eids-hero.jpg",
    heroAlt: "Modern bir emlak ofisinde belge ve tablet üzerinde çalışan gayrimenkul danışmanı",
    canonical: `${SITE}/rehber/tasinmaz-ticareti-yetki-belgesi`,
    index: true,
    published: true,
  },
  {
    slug: "eids-sosyal-medya-ilan-paylasimi",
    kategori: "rehber",
    contentType: "rehber",
    title: "EİDS ve Sosyal Medyada Emlak İlanı Paylaşımı (Ceza ve Kurallar)",
    h1: "EİDS ve Sosyal Medyada İlan Paylaşımı: Kurallar, Ceza ve Doğru Yöntem",
    description:
      "Sosyal medyada emlak ilanı paylaşımı yasak mı? Instagram, Facebook ve WhatsApp'ta doğrulanmamış paylaşımın 286.206 TL cezası ve doğru paylaşım yöntemi. Resmî kaynaklı rehber.",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-11",
    sourceCheckedAt: "2026-08-11",
    author: "Projedar Editoryal",
    reviewer: null,
    sources: ["ticaret-eids-basin", "ticaret-eids-yetki"],
    iliskiler: {
      hub: null,
      siblings: ["rehber/eids-emlakci-rehberi"],
      tools: [],
      glossary: [],
    },
    ctaLevel: "medium",
    heroGorsel: "/generated/rehber/eids-sosyal-medya.jpg",
    heroAlt: "Bir profesyonel, telefonunda konut projesi görselini paylaşırken",
    canonical: `${SITE}/rehber/eids-sosyal-medya-ilan-paylasimi`,
    index: true,
    published: true,
  },
  {
    slug: "e-devletten-emlakciya-eids-yetkisi",
    kategori: "rehber",
    contentType: "rehber",
    title: "e-Devlet'ten Emlakçıya EİDS Yetkisi Nasıl Verilir? (2026)",
    h1: "e-Devlet Üzerinden EİDS Yetkilendirme: Adım Adım Rehber",
    description:
      "Taşınmaz sahibi e-Devlet üzerinden emlak işletmesine EİDS yetkisini nasıl verir? Adımlar, en az 3 ay süre, taşınmaz bazında yetki, hisseli durum ve yetki belgesinden farkı. Resmî kaynaklı rehber.",
    publishedAt: "2026-08-11",
    updatedAt: "2026-08-11",
    sourceCheckedAt: "2026-08-11",
    author: "Projedar Editoryal",
    reviewer: null,
    sources: ["ticaret-eids-yetki", "edevlet-tasinmaz-izin"],
    iliskiler: {
      hub: null,
      siblings: ["rehber/eids-emlakci-rehberi", "rehber/tasinmaz-ticareti-yetki-belgesi"],
      tools: [],
      glossary: [],
    },
    ctaLevel: "medium",
    heroGorsel: "/generated/rehber/eids-edevlet.jpg",
    heroAlt: "Bir gayrimenkul danışmanı, dizüstü bilgisayarda e-Devlet üzerinden dijital yetkilendirme ekranını incelerken",
    canonical: `${SITE}/rehber/e-devletten-emlakciya-eids-yetkisi`,
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
