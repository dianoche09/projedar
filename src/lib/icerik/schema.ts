/**
 * JSON-LD üretimi (server). Yalnız görünür içerikle tutarlı alanlar üretilir
 * (schema, sayfada olmayan veriyi iddia etmez).
 *
 * Şemalar: Organization + BreadcrumbList + (uygun tiplerde) Article + (gerçek
 * SSS varsa) FAQPage. FAQPage yalnızca sayfada GÖRÜNEN gerçek soru-cevaptan
 * üretilir (yapay soru yok); amaç Google rich-result değil, AI arama/asistan
 * motorlarının (ChatGPT, Perplexity, Gemini) soru-cevabı açık okuyabilmesidir (GEO).
 */
import type { IcerikMeta } from "./tipler";

/** Sayfada görünen SSS öğesi (görünür FAQ ile FAQPage schema tek kaynağı paylaşır). */
export type SssOgesi = { s: string; c: string };
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
    ...(m.heroGorsel ? { image: [`${SITE}${m.heroGorsel}`] } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": m.canonical },
    author: { "@type": "Organization", name: m.author },
    publisher: {
      "@type": "Organization",
      name: "Projedar",
      logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
    },
  };
}

/** FAQPage — yalnız sayfada görünen gerçek soru-cevaptan (GEO odaklı). */
export function faqSchema(sss: SssOgesi[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sss.map((q) => ({
      "@type": "Question",
      name: q.s,
      acceptedAnswer: { "@type": "Answer", text: q.c },
    })),
  };
}

/** İçeriğe uygun tüm şemalar (tek <script> içinde dizi olarak basılır). */
export function icerikSchemas(m: IcerikMeta, sss?: SssOgesi[]): object[] {
  const list: object[] = [organizationSchema(), breadcrumbSchema(m)];
  if (ARTICLE_TIPLERI.has(m.contentType)) list.push(articleSchema(m));
  if (sss && sss.length) list.push(faqSchema(sss));
  return list;
}

export { icerikYolu };
