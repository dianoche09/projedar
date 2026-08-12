/**
 * SEO Utilities — THE SINGLE SOURCE.
 *
 * `siteConfig` drives every layer (metadata, robots, sitemap, schema). To re-brand
 * the whole system for a new project, edit `siteConfig` + the static schema objects
 * below; every generator derives from them.
 */

import { Metadata } from 'next'

/** ── CONFIG: fill for THIS project ─────────────────────────────────────── */
export const siteConfig = {
  name: 'YourBrand',
  title: 'YourBrand — One-line keyword-first title (~60 chars)',
  description:
    'One-sentence, keyword-first description of what the product does, for whom, and the key differentiator (120-160 chars, include a soft CTA).',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com',
  ogImage: '/og-image.jpg',
  twitterHandle: '@yourbrand',
  keywords: [
    // 15-20 core keywords (Google ignores meta keywords since 2009, but OG/AI use these)
    'your primary keyword', 'secondary keyword', 'category term',
  ],
  locale: 'en_US', // e.g. 'tr_TR'
  type: 'website',
}

/** ── Static schema objects (injected site-wide in root layout) ─────────── */

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  alternateName: [siteConfig.name, `${siteConfig.name}.com`], // brand spelling variants (AI recognition)
  legalName: 'YOUR LEGAL COMPANY NAME',
  url: siteConfig.url,
  logo: {
    '@type': 'ImageObject',
    url: `${siteConfig.url}/images/logo.png`,
    width: 512,
    height: 512,
  },
  image: `${siteConfig.url}/images/logo.png`,
  description: siteConfig.description,
  slogan: 'Your one-line slogan',
  foundingDate: '2024',
  knowsAbout: ['Topic A', 'Topic B', 'Topic C'], // your entity's expertise areas
  brand: { '@type': 'Brand', name: siteConfig.name, logo: `${siteConfig.url}/images/logo.png` },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressLocality: 'City',
    addressRegion: 'Region',
    streetAddress: 'Street 1',
    postalCode: '00000',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+1-000-000-0000',
      contactType: 'customer service',
      areaServed: 'US',
      availableLanguage: ['English'],
    },
  ],
  sameAs: [
    'https://www.facebook.com/yourbrand',
    'https://www.instagram.com/yourbrand',
    'https://www.linkedin.com/company/yourbrand',
    'https://twitter.com/yourbrand',
    'https://www.youtube.com/@yourbrand',
  ],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteConfig.url}/#website`,
  name: siteConfig.name,
  alternateName: [siteConfig.name, `${siteConfig.name}.com`],
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: siteConfig.locale.replace('_', '-'),
  publisher: { '@id': `${siteConfig.url}/#organization` }, // links entity graph
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: siteConfig.name,
  image: `${siteConfig.url}/images/logo.png`,
  '@id': siteConfig.url,
  url: siteConfig.url,
  telephone: '+1-000-000-0000',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Street 1',
    addressLocality: 'City',
    addressRegion: 'Region',
    postalCode: '00000',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 0.0, longitude: 0.0 },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
}

export const homeServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Your Service Category',
  provider: { '@type': 'Organization', name: siteConfig.name, logo: `${siteConfig.url}/images/logo.png` },
  areaServed: 'US',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service One' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Service Two' } },
    ],
  },
}

/** Helps Google pick correct sitelinks. Point at your most important entry routes. */
export const siteNavigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${siteConfig.name} Main Services`,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: [
    { '@type': 'SiteNavigationElement', position: 1, name: 'Primary Tool', url: `${siteConfig.url}/primary`, description: '...' },
    { '@type': 'SiteNavigationElement', position: 2, name: 'Secondary Tool', url: `${siteConfig.url}/secondary`, description: '...' },
  ],
}

export const mobileApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: siteConfig.name,
  operatingSystem: 'WEB',
  applicationCategory: 'BusinessApplication',
  url: siteConfig.url,
  description: siteConfig.description,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: ['Feature A', 'Feature B', 'Feature C'],
}

/** ── Generators (each landing page calls these) ────────────────────────── */

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: `${siteConfig.url}${item.url}`,
    })),
  }
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question', name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function generateHowToSchema(howTo: {
  name: string; description: string; steps: Array<{ name: string; text: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, i) => ({
      '@type': 'HowToStep', position: i + 1, name: step.name, text: step.text,
    })),
  }
}

export function generateArticleSchema(article: {
  title: string; description: string; image: string
  datePublished: string; dateModified?: string; author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${siteConfig.url}${article.image}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.author
      ? {
          '@type': 'Person', name: article.author, url: `${siteConfig.url}/blog`,
          worksFor: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
        }
      : { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    publisher: {
      '@type': 'Organization', name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/images/logo.png` },
    },
  }
}

export function generateServiceSchema(service: {
  name: string; description: string; provider?: string; areaServed?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: { '@type': 'Organization', name: service.provider || siteConfig.name },
    areaServed: { '@type': 'Country', name: service.areaServed || 'US' },
  }
}

export function generateWebApplicationSchema(opts: {
  name: string; url: string; description: string; free?: boolean
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    applicationCategory: 'Utilities',
    url: opts.url,
    description: opts.description,
    offers: { '@type': 'Offer', price: opts.free !== false ? '0' : undefined, priceCurrency: 'USD' },
    operatingSystem: 'Web',
    inLanguage: siteConfig.locale.split('_')[0],
    provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  }
}

export function generateSoftwareApplicationSchema(opts: {
  name: string; url: string; description: string
  applicationCategory?: string; operatingSystem?: string; featureList?: string[]; free?: boolean; image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    applicationCategory: opts.applicationCategory || 'BusinessApplication',
    operatingSystem: opts.operatingSystem || 'Web Browser',
    inLanguage: siteConfig.locale.split('_')[0],
    ...(opts.image ? { image: opts.image.startsWith('http') ? opts.image : `${siteConfig.url}${opts.image}` } : {}),
    offers: { '@type': 'Offer', price: opts.free !== false ? '0' : undefined, priceCurrency: 'USD' },
    ...(opts.featureList?.length ? { featureList: opts.featureList } : {}),
    provider: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
  }
}

export function generateJsonLd(data: any) {
  return { __html: JSON.stringify(data) }
}

/** Home/site-wide FAQ (highest GEO impact — answer-first, specific numbers). */
export const homeFAQSchema = generateFAQSchema([
  { question: 'What is ' + siteConfig.name + '?', answer: 'Self-contained 40-60 word definition with a concrete differentiator and a number.' },
  { question: 'Is it free?', answer: 'Clear answer in the first sentence, then the nuance.' },
  // add ≥5 questions total, each answer answer-first with a data point
])

/** ── Page metadata ─────────────────────────────────────────────────────── */
export function generateMetadata({
  title, description, keywords, image, url, type = 'website', noIndex = false,
}: {
  title: string; description: string; keywords?: string[]; image?: string
  url?: string; type?: 'website' | 'article'; noIndex?: boolean
}): Metadata {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`
  const fullUrl = url ? `${siteConfig.url}${url}` : siteConfig.url
  const ogImage = image ? `${siteConfig.url}${image}` : `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title: fullTitle,
    description,
    keywords: keywords || siteConfig.keywords,
    openGraph: {
      title: fullTitle, description, url: fullUrl, siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: siteConfig.locale, type,
    },
    twitter: {
      card: 'summary_large_image', title: fullTitle, description,
      images: [ogImage], creator: siteConfig.twitterHandle,
    },
    robots: {
      index: !noIndex, follow: !noIndex,
      googleBot: {
        index: !noIndex, follow: !noIndex,
        'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1,
      },
    },
    alternates: { canonical: fullUrl }, // self-referencing canonical
  }
}
