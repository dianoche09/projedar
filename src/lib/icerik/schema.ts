/**
 * JSON-LD üretimi (server). Yalnız görünür içerikle tutarlı alanlar üretilir
 * (schema, sayfada olmayan veriyi iddia etmez).
 *
 * İlk aşama şemaları: Organization + BreadcrumbList + (uygun tiplerde) Article.
 * FAQPage/HowTo bilinçli olarak KULLANILMAZ (Google rich-result beklentisi
 * üzerine mimari kurulmaz).
 */
import type { IcerikMeta } from "./tipler";
import { KATEGORI_ETIKET } from "./tipler";
import { icerikYolu } from "./kayit";

const SITE = "https://projedar.com";

/** Article üretilen içerik tipleri (metinsel, tarih taşıyan içerik). */
const ARTICLE_TIPLERI = new Set(["rehber", "how-to", "karsilastirma"]);

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Projedar",
    url: SITE,
    logo: `${SITE}/icon-512.png`,
    description:
      "Çok-müteahhitli, üretici-kontrollü canlı konut stoğu dağıtım ağı. Proje ve stok bilgisi, geliştiricinin belirlediği tahsis yapısı içinde profesyoneller arasında kontrollü dağıtılır.",
  };
}

export function breadcrumbSchema(m: IcerikMeta) {
  const ogeler = [
    { name: "Ana sayfa", item: SITE },
    { name: KATEGORI_ETIKET[m.kategori], item: `${SITE}/${m.kategori}` },
    { name: m.h1 ?? m.title, item: m.canonical },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: ogeler.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.name,
      item: o.item,
    })),
  };
}

export function articleSchema(m: IcerikMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m.h1 ?? m.title,
    description: m.description,
    inLanguage: "tr-TR",
    datePublished: m.publishedAt,
    dateModified: m.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": m.canonical },
    author: { "@type": "Organization", name: m.author },
    publisher: {
      "@type": "Organization",
      name: "Projedar",
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
  };
}

/** İçeriğe uygun tüm şemalar (tek <script> içinde @graph dizisi olarak basılır). */
export function icerikSchemas(m: IcerikMeta): object[] {
  const list: object[] = [organizationSchema(), breadcrumbSchema(m)];
  if (ARTICLE_TIPLERI.has(m.contentType)) list.push(articleSchema(m));
  return list;
}

export { icerikYolu };
