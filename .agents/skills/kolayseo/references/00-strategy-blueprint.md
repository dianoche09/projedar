# KolaySEO — SEO/GEO Sistemi Sıfırdan Kurulum Blueprint

> **Bu dosyanın amacı:** Kolayimar içindeki tüm SEO + GEO (Generative Engine Optimization) altyapısını,
> **bağımsız bir `kolayseo` projesi** olarak sıfırdan kurabilecek düzeyde, en ince ayrıntısına kadar belgelemek.
> Bu dosyayı yeni bir Claude Code oturumuna verip "bu blueprint'e göre kolayseo projesini kur" dediğinde,
> sistemin tamamı yeniden üretilebilir olmalıdır.
>
> **Kaynak proje:** `kolayimar-main` (Next.js App Router + React + TypeScript + Supabase + Tailwind).
> **Belge tarihi:** 2026-08-04. Kod referansları o tarihteki `main` branch'e aittir.
>
> **▶ Otomasyon (asıl kullanım):** Bu blueprint'in çalıştırılabilir hali `~/.claude/skills/kolayseo/`
> skill'idir — herhangi bir Next.js projesinde `/kolayseo` ile çağrılır (jenerik motor + verbatim
> template'ler + fazlı kurulum + command-center/OpenSEO köprüsü). Bu doküman **anlatı/gerekçe** referansı;
> **skill kurulum motorudur.** İkisi çakışmaz: strateji/karar burada, uygulanabilir kod skill'de.

---

## 0. Claude için kurulum talimatı (bu dosyayı alan ajana)

Sen `kolayseo` adında **yeni ve bağımsız** bir SEO/GEO motoru kuruyorsun. Bu motor iki şekilde
kullanılabilir; hangisini kurduğunu kullanıcıya SOR (varsayım yapma):

1. **Klon modu** — Kolayimar'ın imar/kadastro nişindeki SEO/GEO sistemini birebir yeniden kur
   (aynı sayfa aileleri, aynı programmatic eksenler).
2. **Jenerik motor modu** — Nişten bağımsız, `siteConfig` + veri dosyalarıyla herhangi bir siteye
   uygulanabilen taşınabilir SEO/GEO toolkit'i kur (imar'a özel içerik yerine placeholder içerik).

Her iki modda da **mimari aynıdır**; farkı yalnızca içerik/veri katmanı belirler. Bu blueprint,
mimariyi (yeniden kullanılabilir motor) net biçimde nişe-özel içerikten ayırır: **Bölüm 4-8 = motor
(her modda aynı)**, **Bölüm 4.4 / 7 = nişe-özel veri (moda göre değişir)**.

**Çalışma sırası:** Bölüm 13'teki fazlı kurulum sırasını TodoWrite'a dök, faz faz uygula. Her fazda
Bölüm 15'teki anti-pattern'leri kontrol listesi olarak geç. Kurulum bitince Bölüm 16 doğrulama
checklist'ini çalıştır.

---

## 1. Stratejik tez (neden bu mimari)

Bu sistem tek bir gerçeğin üstüne kurulu: **modern arama üç kanala aynı anda hitap etmelidir.**

| Kanal | Hedef | Bu sistemdeki karşılığı |
|-------|-------|-------------------------|
| **Klasik SEO** (Google/Bing organik) | Sıralama + tık | Teknik altyapı + schema + programmatic sayfalar |
| **GEO** (ChatGPT / Perplexity / Gemini / AI Overview) | Marka AI cevaplarında **kaynak** olarak geçsin | llms.txt, AI-crawler izinleri, answer-first içerik, FAQ schema |
| **İstihbarat** (kapalı-döngü) | Ölç → fırsat türet → aksiyon al | SEO Command Center (SerpAPI + GSC + OpenSEO + IndexNow) |

**Kolayimar'dan çıkan en kritik ders (motorun tasarımını belirleyen gerçek):** on-page mükemmel olsa
bile **domain otoritesi (backlink) ana darboğazdır.** Çekirdek yüksek-hacimli kelimelerde devlet/otorite
siteleri tavan koyar. Bu yüzden motorun ROI önceliği şudur:

1. **Programmatic ölçek** (kanıtlanmış trafik makinesi — düşük zorluklu, backlink beklemez)
2. **Kolay-kazanım landing'ler** (KD0-6 "nedir"/hesaplayıcı kelimeleri — backlink beklemez)
3. **Otorite** (embeddable widget + dizin + veri-PR — yavaş ama darboğazı açar)
4. **İstihbarat/otomasyon** (kapalı-döngü fırsat motoru)

Motor bu önceliği **koda gömer**: programmatic üretim ucuz ve güvenli (doorway-safe), widget sistemi
backlink üretir, command center fırsatı otomatik yüzeye çıkarır.

---

## 2. Teknoloji stack + önkoşullar

**Zorunlu:**
- **Next.js** (App Router, ≥14; Kolayimar'da Next 16 + Turbopack). `output: 'standalone'`.
- **React 19** + **TypeScript**.
- **Tailwind CSS** (landing sayfaları için; token-bazlı, hardcoded renk yok).
- **Supabase** (Postgres) — istihbarat tabloları + blog kaynağı için. (Motorun teknik SEO katmanı
  Supabase'siz de çalışır; yalnızca command-center + dinamik blog/askı beslemesi DB ister.)
- **Vercel** — cron + deploy (main→production). Dinamik `sitemap.ts`/`robots.txt` route'ları serverless.

**Dış servisler (opsiyonel ama command-center için gerekli):**
- **SerpAPI** — haftalık pozisyon + AI Overview taraması (`SERPAPI_API_KEY`).
- **Google Search Console API** — gerçek clicks/impressions/CTR (service account).
- **IndexNow** — Bing/Yandex/Naver anlık indeksleme (key = public token, ücretsiz).
- **OpenSEO MCP** (veya DataForSEO/Ahrefs) — aylık derin audit (orphan/duplicate/backlink). Bu bir
  **MCP tool**'dur, repo'da kod değildir; çıktısı `seo_findings` tablosuna elle/periyodik yazılır.
- **Resend** (veya herhangi bir SMTP) — haftalık SEO digest e-postası.

**Bağımlılık notu:** GSC istemcisi `jose` (RS256 JWT) kullanır — ekstra Google SDK paketi YOK.

---

## 3. Mimari — 5 katman

```
┌─────────────────────────────────────────────────────────────────────┐
│ KATMAN 5 — SEO COMMAND CENTER (istihbarat / kapalı-döngü)            │
│   SerpAPI collect → arama_istihbarati → opportunities engine        │
│   GSC client · OpenSEO→seo_findings · IndexNow dağıtım · haftalık    │
│   digest mail · admin panel /dashboard/admin/arama-istihbarati      │
├─────────────────────────────────────────────────────────────────────┤
│ KATMAN 4 — PROGRAMMATIC SEO (trafik makinesi)                       │
│   /imar-durumu/[city]/[district] · /parsel-sorgu/[city]/[district]  │
│   valuation [slug]/[city] · emlak-vergisi [city] · imar-hukuku      │
│   [konu] · determinist içerik motoru (doorway-safe)                 │
├─────────────────────────────────────────────────────────────────────┤
│ KATMAN 3 — GEO / AI-SEARCH                                          │
│   /llms.txt (+ /llms-full.txt) · robots AI-crawler allow-list ·     │
│   Content-Signal · RFC 8288 Link headers · answer-first içerik      │
├─────────────────────────────────────────────────────────────────────┤
│ KATMAN 2 — STRUCTURED DATA (schema/JSON-LD)                         │
│   StructuredData component · Organization/WebSite/FAQ/HowTo/Article │
│   /Breadcrumb/WebApplication/LocalBusiness generator'ları           │
├─────────────────────────────────────────────────────────────────────┤
│ KATMAN 1 — TEKNİK SEO ALTYAPI                                       │
│   siteConfig · generateMetadata · /robots.txt · /sitemap.xml ·      │
│   next.config (redirects/headers/canonical domain)                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Tek doğruluk kaynağı: `src/lib/seo.ts`** — `siteConfig` objesi tüm katmanları besler (domain, marka,
anahtar kelimeler, tüm schema generator'ları). Yeni projede **ilk değiştirilecek dosya budur.**

---

## 4. KATMAN 1 — Teknik SEO altyapı

### 4.1 `src/lib/seo.ts` — merkezi konfigürasyon + metadata + schema (TEK KAYNAK)

Bu ~620 satırlık dosya sistemin kalbidir. İçeriği:

**a) `siteConfig`** — her şeyin türediği kök obje:
```ts
export const siteConfig = {
  name: 'Kolayimar',
  title: 'Kolayimar — Yapay Zeka Destekli Parsel ve İmar Sorgulama',
  description: '...81 il, ücretsiz.',              // 150-160 kr, keyword-first
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kolayimar.com',
  ogImage: '/og-image.jpg',
  twitterHandle: '@kolayimar',
  keywords: [ /* 20 çekirdek kelime */ ],
  locale: 'tr_TR',
  type: 'website',
}
```
> **kolayseo uyarlaması:** `name`/`title`/`description`/`url`/`keywords`/`twitterHandle` değiştir. Geri
> kalan tüm dosya bu objeden türer — tek noktadan marka değişir.

**b) Statik schema objeleri** (root layout'ta enjekte edilir):
- `organizationSchema` — `@id: {url}/#organization`, legalName, logo (ImageObject 512×512),
  `knowsAbout[]`, `brand`, `address` (PostalAddress), `contactPoint[]`, `sameAs[]` (sosyal profiller).
  `alternateName` marka yazım varyantlarını kapsar (AI'nın markayı tanıması için kritik).
- `websiteSchema` — `@id: {url}/#website`, `publisher: {@id: .../#organization}` (entity graph bağlama),
  `potentialAction: SearchAction` (sitelinks search box).
- `localBusinessSchema` — geo koordinat, açılış saatleri, telefon, priceRange.
- `homeServiceSchema` — Service + OfferCatalog.
- `siteNavigationSchema` — `ItemList` + `SiteNavigationElement[]` (Google'ın doğru sitelink seçmesi için;
  en önemli 7 giriş route'u; legal sayfalar kasıtlı hariç).
- `mobileApplicationSchema` — MobileApplication (featureList, ücretsiz Offer).
- `homeFAQSchema` — `generateFAQSchema([...])` ile üretilmiş 6 soruluk ana sayfa FAQ (en yüksek GEO etkisi).

**c) Generator fonksiyonları** (her landing sayfa bunları çağırır):
```ts
generateMetadata({ title, description, keywords?, image?, url?, type?, noIndex? }): Metadata
  // → title'a "| Kolayimar" ekler (yoksa), canonical (self-ref), OG, Twitter card,
  //   robots (index/follow + googleBot max-image-preview:large). noIndex=true → noindex+nofollow.
generateFAQSchema(faqs: {question, answer}[])         → FAQPage
generateHowToSchema({ name, description, steps[] })    → HowTo
generateArticleSchema({ title, description, image, datePublished, dateModified?, author? })
  → Article (author varsa Person+worksFor, yoksa Organization; publisher logo)
generateBreadcrumbSchema(items: {name, url}[])         → BreadcrumbList
generateServiceSchema({ name, description, provider?, areaServed? })  → Service
generateWebApplicationSchema({ name, url, description, free? })       → WebApplication (fiyat TRY 0)
generateSoftwareApplicationSchema({ name, url, description, featureList?, ... }) → SoftwareApplication
generateJsonLd(data)  → { __html: JSON.stringify(data) }   // legacy inline kullanım
```

**d) `pageMetadata`** — sık sayfalar için hazır metadata şablonları (home/parselSorgu/imarDurumu/...).
Legal sayfalar `noIndex: true`.

> **Anti-pattern (koda gömülü ders):** `keywords` alanı Google'da ÖLÜ (2009'dan beri). Yine de OG/Twitter
> ve bazı AI tarayıcıları için tutuluyor; emek buraya değil title/description/canonical/JSON-LD'ye gider.

### 4.2 `src/app/robots.txt/route.ts` — dinamik robots (AI-crawler allow-list)

Route Handler olarak üretilir (statik dosya DEĞİL). Yapısı:
- **`AI_CRAWLERS[]`** — 27 AI botu **açıkça `Allow: /`** ile whitelist'lenir: `GPTBot`, `ChatGPT-User`,
  `OAI-SearchBot`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`,
  `GoogleOther`, `Amazonbot`, `BraveBot`, `PhindBot`, `cohere-ai`, `FacebookBot`, `Meta-ExternalAgent`,
  `Applebot-Extended`, `Bytespider`, `CCBot`, `Diffbot`, `YouBot`, `AI2Bot`, `ImagesiftBot`, `OmgiliBot`,
  `PiplBot`, `SemrushBot-OCOB`, `Timpibot`, `KangarooBot`.
- **Generic botlar** (`*`): private path'ler blok (`/dashboard/`, `/admin/`, `/api/`, `/_next/`) +
  `/test-*`, `/*.json$`, `/*?*utm_*`.
- **Arama motorları** (Googlebot/Bingbot): `/_next/` bloklanmaz (aksi halde render bozulur, CWV zarar
  görür, "indexed despite blocked" uyarısı çıkar) — yalnız `/dashboard/`, `/admin/`, `/api/` blok.
- Sonuna: `Sitemap:`, `Host:`, llms.txt/llms-full.txt işaret satırları, ve
  **`Content-Signal: ai-train=yes, search=yes, ai-input=yes`** (contentsignals.org).
- Header: `Content-Type: text/plain`, `Cache-Control: public, max-age=3600, s-maxage=86400`.

### 4.3 `src/app/sitemap.ts` — dinamik sitemap (statik + programmatic + DB)

`MetadataRoute.Sitemap` döner. Bölümler (priority ile):
- `home` (1.0) · `imarHukukuPages` (0.7) · `askiPages` (0.85/0.75, DB'den aktif iller) ·
  `toolPages` (0.9, ~45 landing sabit liste) · `serviceDirectPages` (0.7) · `cinsPages` (0.7) ·
  `infoPages` (0.6) · `cityImarPages`+`cityParselPages` (0.8, 81 il) ·
  `districtImarPages`+`districtParselPages` (0.7, ~240 ilçe `getAllDistrictParams()`) ·
  `valuationLandingPages`+`valuationCityPages` (0.85/0.75) · `emlakVergisi` + city (0.9/0.8) ·
  `konutFiyatTrendi` (0.9) · `blogPages` (0.7, **DB `blog_posts` + statik `blogData` dedup**) ·
  `legalPages` (0.3) · `authPages` (0.3).
- **DB beslemesi**: blog + askı, Supabase service-role ile try/catch içinde çekilir; DB düşerse statik
  liste yeterli (graceful degrade).
- **Kritik kural (koda yorumlanmış):** sitemap'e YALNIZ gerçek route'u (`src/app/<slug>/page.tsx`) olan
  slug'lar konur. Var olmayan slug = Google'a soft-404. Yeni landing açınca buraya ekle, silince çıkar.

### 4.4 `next.config.js` — canonical domain, redirect, RFC 8288 header

- **Canonical domain redirect (301):** `kolayimar.com` (apex) → `www.kolayimar.com`. Tek domain'de
  tutarlı session/cookie; OAuth session bölünmesini engeller.
- **301 birleştirmeler:** eski/varyant yollar → gerçek route (`/parsel-sorgulama`→`/parsel-sorgu`,
  `/faq`→`/sss`, ...). Soft-404 + link eşitliği kaybını bitirir.
- **RFC 8288 `Link` header (ana sayfa)** — agent discovery yüzeyi:
  ```
  Link: </.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json",
        </llms.txt>; rel="alternate"; type="text/markdown",
        </sitemap.xml>; rel="sitemap"; type="application/xml"
  ```
- `images.formats: ['image/avif','image/webp']`, `output: 'standalone'`, `skipTrailingSlashRedirect: true`.

---

## 5. KATMAN 2 — Structured Data (schema/JSON-LD)

### 5.1 `src/components/seo/StructuredData.tsx` — JSON-LD enjeksiyon bileşeni

**Kritik implementasyon detayı (React 19 tuzağı — birebir kopyalanmalı):** JSON-LD, JSX `<script>` olarak
DEĞİL, gizli bir `<div>` içinde `dangerouslySetInnerHTML` ile ham HTML olarak basılır. React 19'un
resource-hoisting davranışı, `<div>` kökü altındaki JSX `<script>` etiketlerini sessizce düşürüyordu.
`dangerouslySetInnerHTML` ile React script'i hiç görmez, SSR HTML'ine aynen düşer. `</` → `<` kaçışı
XSS-safe.

```tsx
export default function StructuredData({ data }: { data: any }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const html = `<script type="application/ld+json">${json}</script>`
  return <div suppressHydrationWarning style={{ display: 'none' }}
              dangerouslySetInnerHTML={{ __html: html }} />
}
export function MultipleStructuredData({ items }: { items: any[] }) {
  return <>{items.map((d, i) => <StructuredData key={i} data={d} />)}</>
}
```

### 5.2 Root layout enjeksiyonu (`src/app/layout.tsx`)

Ana sayfada/site-geneli 6 statik schema `<head>`'e enjekte edilir:
```tsx
import { organizationSchema, websiteSchema, homeServiceSchema,
         mobileApplicationSchema, homeFAQSchema, localBusinessSchema,
         siteNavigationSchema } from '@/lib/seo'
// <body> içinde:
<StructuredData data={organizationSchema} />
<StructuredData data={websiteSchema} />
<StructuredData data={homeServiceSchema} />
<StructuredData data={mobileApplicationSchema} />
<StructuredData data={localBusinessSchema} />
<StructuredData data={siteNavigationSchema} />
```

### 5.3 Landing sayfa schema deseni (`<slug>/layout.tsx`)

Her "nedir"/hesaplayıcı landing'i **kendi `layout.tsx`'inde** 5 schema basar (örnek `kaks-nedir`):
`FAQPage` + `HowTo` + `BreadcrumbList` + `WebApplication` + `Article`. `metadata` da burada export edilir
(title/description/keywords/canonical/OG). `page.tsx` yalnız görsel içerik + hesaplayıcı.
> **Standart:** yeni landing = `<slug>/{page,layout,faqs}.tsx`. `faqs.ts` ayrı (client+server paylaşımı).
> Tailwind renk **statik class** olmalı — template literal (`bg-${x}`) derlenmez, JIT görmez.

---

## 6. KATMAN 3 — GEO / AI-Search

### 6.1 `/llms.txt` — dinamik AI kaynak haritası (`src/app/llms.txt/route.ts`)

- **El yazımı base** (`src/data/llms-base.txt`, ~437 satır) `readFileSync(join(process.cwd(), ...))` ile
  okunur. **`nft` literal yol kuralı**: yol LİTERAL olmalı (dinamik yol tüm `public/`'i bundle'a katar →
  >250MB → deploy error). Base bulunamazsa minimal fallback.
- Base sonuna **DB'den yayınlanan `blog_posts` kategorize** eklenir (slug/title/category/excerpt),
  böylece AI/panelden üretilen her blog otomatik AI kaynak haritasına girer.
- `revalidate = 3600`, `runtime = 'nodejs'`, `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`.

**`src/data/llms-base.txt` yapısı** (global CLAUDE.md llms.txt standardı — zorunlu sıra):
```
# {Marka}
> 1-2 cümle özet (ne, kime, temel fark)
## About            (2-3 paragraf + Website/Platform/Kategori/Firma/MERSIS/İletişim künye)
## Key Pages        (kategorize, TÜM ana sayfalar link+açıklama)
## Features         (kategori kategori, SPESİFİK rakamlarla — "65+ sounds" gibi)
## Who It Helps      (hedef segmentler + kullanım senaryoları)
## Evidence/Research (peer-reviewed: Yazar (Yıl), Dergi — bulgu; inline citation)
## Key Differentiators
## Blog/Knowledge Base  (TÜM yazılar, konuya göre kategorize — highlight değil hepsi)
## Disclaimer
```
- `public/llms-full.txt` (~656 satır) = tam içerik dökümü (statik, robots'ta işaret edilir).

### 6.2 GEO içerik kuralları (landing + programmatic sayfalarına gömülü)

- **Answer-first:** H2 sonrası ilk 150 karakterde net cevap/sonuç. (`imar-hukuku` topic'lerinde
  `answerFirst` alanı = citability paragrafı.)
- **Passage density:** 50-150 kelimelik paragraflar, her birinde ≥1 veri noktası.
- **FAQPage schema** her landing'de (en yüksek GEO etkisi). AI Overview kaybı = `opportunities` motoru
  "answer-first + FAQPage ekle/güçlendir" aksiyonu üretir.
- **Content-Signal header** + 27 AI-crawler allow (Bölüm 4.2).
- **RFC 8288 Link header** + `.well-known/api-catalog` (Bölüm 4.4) — agent-readiness yüzeyi.

---

## 7. KATMAN 4 — Programmatic SEO (trafik makinesi)

**Kanıtlanmış model:** `[city]/[district]` sayfaları Kolayimar'da #4-6 sıralamada, %4-22 CTR, sayfa başına
yüzlerce tık üretir. Motor **doorway-safe** olmalı — her sayfa GERÇEK unique içerik taşımalı, yoksa
thin-content cezası TÜM siteyi vurur.

### 7.1 Dinamik route ağacı
```
src/app/imar-durumu/[city]/page.tsx              (+ layout.tsx, opengraph-image.tsx)
src/app/imar-durumu/[city]/[district]/page.tsx
src/app/parsel-sorgu/[city]/[district]/page.tsx
src/app/gayrimenkul-degerleme/[city]/page.tsx    (valuation ailesi, 4 slug)
src/app/emlak-vergisi-hesaplama/[city]/page.tsx
src/app/askidaki-imar-planlari/[il]/...          (DB-driven, aktif iller)
src/app/imar-hukuku/[konu]/...                    (tek dinamik route + topic data)
```
Her sayfa: `generateStaticParams()` (SSG), `generateMetadata()` (unique title/desc/keywords/canonical/OG),
`revalidate` (ör. askı verisi 21600s = 6 saat), `notFound()` guard.

### 7.2 Determinist içerik motoru — `src/lib/district-content.ts` (thin-content'i önleyen kalp)

İki katman:
1. **`CURATED`** — ~60 tanınmış ilçe için GERÇEK karakteristik (character/knownFor/typicalKaks/urbanType/
   landmarks). Uydurma yok; genel bilinen özellikler.
2. **Variant havuzları** — `INTRO_VARIANTS` (8), `CONTENT_VARIANTS` (8), `CTA_TAG_VARIANTS` (8),
   `CHARACTER_DESCRIPTORS` (9 karakter tipi). İlçe adının **stable hash**'iyle deterministik seçilir:
   ```ts
   const stableHash = (s) => { let h=0; for(...) h=(h*31+s.charCodeAt(i))>>>0; return h }
   const intro    = INTRO_VARIANTS[h % 8]
   const content  = CONTENT_VARIANTS[(h>>>3) % 8]
   const ctaTag   = CTA_TAG_VARIANTS[(h>>>5) % 8]
   ```
   Böylece curated verisi olmayan ilçe bile **unique-görünen, gerçek** bir sayfa alır. Variant metinleri
   Türk imar/kadastro mekaniği hakkında genel-doğru cümlelerdir (uydurma değil).
- `getDistrictContent(city, district)` → `{ intro, contentParagraph, ctaTag, characterText, knownFor,
  typicalKaks, urbanType, landmarks[] }`. Sayfa bu blokları hero + içerik + CTA'ya yerleştirir.
- **Gerçek veri katmanı**: sayfa ayrıca `getIlceData` (askıdaki gerçek planlar) + `getIlceEmsalBandi`
  (aktif ilan m² fiyat bandı) çeker; veri yoksa o bölüm render EDİLMEZ (boş/uydurma göstermez).

### 7.3 Veri kaynakları (nişe-özel — moda göre)
- `src/constants/districts.ts` — `CITY_DISTRICTS[]` (~240 ilçe/43 il, doorway-safe). `getAllDistrictParams()`,
  `findDistrictByParams()`.
- `src/constants/valuation-types.ts` — 4 valuation slug × şehir matrisi (title/desc üreteçleriyle).
- `src/constants/emlak-vergisi.ts` — `EMLAK_CITY_SLUGS`.
- `src/lib/imar-hukuku/` — **topic sistemi**: `types.ts` (`ImarHukukuTopic` içerik-blok modeli:
  p/ul/callout/warn/steps/cmp/table + faqs + howTo + mevzuat + answerFirst), `topics/*.ts` (konu başına
  tam içerik), `topics/index.ts` (`BUILT[]` — yalnız içeriği yazılmış konular route üretir), `getTopicSlugs()`.
  Yeni konu = `topics/<slug>.ts` yaz + index'e import+push. **KD0 dev-hacim hukuk kelimeleri** (veraset,
  izale-i şuyu, şufa...) buradan hedeflenir.
- `src/lib/faqs/service-faqs.ts` — sayfa başına FAQ setleri + `imarDurumuDistrictFAQs(city,district)` gibi
  parametrik FAQ üreteçleri (programmatic FAQ schema için).

> **kolayseo (jenerik mod) uyarlaması:** Bu veri dosyalarını kendi nişinin eksenleriyle değiştir
> (ör. şehir×hizmet, kategori×marka). Motor (`district-content.ts` deseni) aynı kalır: curated + hash-variant.

---

## 8. KATMAN 5 — SEO Command Center (istihbarat / kapalı-döngü)

Amaç: sistemi tek yönlü "termometre"den **kapalı-döngü**ye çevirmek — ölç → fırsat türet → aksiyon yüzeye çıkar.

### 8.1 Toplama — `src/lib/arama-istihbarati/collect.ts` (SerpAPI)

- **`SORGULAR[]`** (~32 sorgu): bilgi-amaçlı (sorgulama/nedir/hesaplama) + ticari-niyet (satılık/alıcı).
- **`RAKIP_DOMAINS[]`** (izlenen rakipler) + `KENDI_DOMAIN`.
- Her sorgu için SerpAPI (`engine=google, gl=tr, hl=tr, num=20`) → tek `arama_istihbarati` satırı.
  Tek yanıttan **3 sinyal** çıkar (ek maliyet yok): (1) kendi organik pozisyon + rakip pozisyonları,
  (2) reklam verenler (`json.ads`), (3) **AI Overview** var mı + kendi domain kaynak mı (`json.ai_overview.references`).
- `collectAramaIstihbarati(svc)` → `{ sorguSayisi, basarili, hata, ilk10, aiOverviewAtif }`.

### 8.2 Fırsat motoru — `src/lib/arama-istihbarati/opportunities.ts` (Modül 3)

`deriveOpportunities(rows)` — snapshot'lardan (checked_at DESC) sorgu başına **en yüksek öncelikli tek
fırsat** türetir. Yeni tablo/cron GEREKTİRMEZ (mevcut veriden türer). 4 fırsat tipi:
- **`bosluk`** (yüksek) — ilk 10'da yokuz ama ticari rakip ilk 10'da → "güçlü public+schema'lı landing aç".
- **`dusus`** (yüksek) — önceki snapshot'a göre pozisyon kötüleşti → "sayfayı kontrol et (noindex/redirect/rakip)".
- **`itme`** (orta) — #4-10 arasıyız → "iç link + FAQ derinliği + title/meta ile ilk 3'e taşı".
- **`ai_overview`** (orta/düşük) — AI Overview var, kaynak değiliz → "answer-first + FAQPage ekle".
- `TICARI_RAKIPLER` filtresi: TKGM/CSB gibi **resmi devlet kaynakları rakip SAYILMAZ** (altında olmak normal).
- `firsatOzet(firsatlar)` → admin kart başlığı sayaçları.

### 8.3 IndexNow — `src/lib/seo/indexnow.ts` + `api/cron/seo-distribution`

- `submitToIndexNow(urls)` — tek POST ile **Bing/Yandex/Seznam/Naver/Yep**'i tetikler (Google IndexNow
  KULLANMAZ — sitemap+crawl ile gelir). Aynı-host filtresi, 10.000'lik batch, 202/200 = kabul.
- **Key = public token** (`INDEXNOW_KEY`, secret DEĞİL). `public/<key>.txt` host kökünde yayınlanır;
  dosyanın dizini submit kapsamını belirler (kökte = tüm site).
- **Cron** (`0 3 */3 * *`): `sitemap()`'ten tüm URL'leri toplar → IndexNow'a bildirir. Auth: `Bearer CRON_SECRET`.
  Heartbeat'e yazar (`recordCronRun`).
> **Anti-pattern:** klasik "sitemap ping" endpoint'i 2023'te KAPANDI. Anlık indeksleme kanalı = IndexNow.

### 8.4 GSC istemcisi — `src/lib/seo/gsc.ts`

- Service account JSON (`GOOGLE_GSC_SA_KEY`, base64 veya ham) → `jose` ile RS256 JWT → OAuth token →
  Search Analytics API. Ekstra Google SDK YOK.
- `isGscConfigured()`, `fetchSearchAnalytics({startDate, endDate, dimensions, rowLimit})`, `gscDateRange(days)`
  (GSC verisi ~3 gün gecikmeli). Credential yoksa **null döner** — sistem SerpAPI ile çalışmaya devam eder
  (graceful degrade).
> **Anti-pattern:** llms.txt GSC ile alakasız (AI kanalı vs klasik arama). Karıştırma.

### 8.5 Bulgu kuyruğu — `src/lib/seo/findings.ts` + `seo_findings` tablosu

- OpenSEO aylık audit (orphan/duplicate/backlink) + GSC CTR fırsatları tek kuyruğa (`seo_findings`) düşer.
- `SeoFindingCategory`: orphan | duplicate_content | duplicate_meta | backlink | ctr | perf | **site_health**.
  `site_health` satırı **metrik snapshot** taşır (delta/trend için); diğerleri aksiyon.
- `sortFindings()` (severity+tazelik), `healthDelta(latest, prev, key)` (trend oku).
- **OpenSEO bir MCP tool'dur, repo'da kod değil.** Çıktısı elle/periyodik `seo_findings`'e yazılır
  (admin API `api/admin/seo-findings`).

### 8.6 Haftalık digest — `api/cron/seo-weekly-digest` (Pazartesi 07:00)

Tek e-postada admin'in önüne 4 blok getirir ("aç da bak" beklemeden):
1. Site sağlığı delta (OpenSEO snapshot: orphan/duplicate/backlink ▲▼)
2. Açık bulgu kuyruğu (`seo_findings`, elle çözülene kadar her hafta hatırlatır)
3. Fırsat kuyruğu (`deriveOpportunities`, son 90g SerpAPI)
4. GSC gerçek veri (credential varsa: son 7g tık/gösterim + CTR fırsatı)
- `renderEmail({title, preheader, blocks})` ile marka mail; `sendEmail`; heartbeat. Sakin haftada bile
  "yeni bulgu yok" satırıyla ritmi korur.

### 8.7 Toplama cron + admin panel

- **`api/cron/arama-istihbarati`** (`0 4 * * 1`, Pazartesi) — `collectAramaIstihbarati`. Auth Bearer.
- **`api/admin/arama-istihbarati`** — GET (son 90g snapshot + `deriveOpportunities` + özet),
  POST (manuel tarama tetikle). Admin-role guard (`isAdminRole`).
- **`api/admin/gsc-performance`** — top queries + CTR fırsatı (gösterim yüksek/tık düşük).
- **Panel** `/dashboard/admin/arama-istihbarati` — İstihbarat + Fırsat Kuyruğu + Site Sağlığı & Bulgular +
  GSC gerçek veri kartları. **Yeni menü açılmaz** — her şey bu tek sayfaya katlanır (north-star: karmaşa az).

---

## 9. Veritabanı şeması (Supabase migrations)

**`arama_istihbarati`** (SerpAPI snapshot deposu):
```sql
CREATE TABLE public.arama_istihbarati (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sorgu text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  kolayimar_pozisyon integer,                            -- NULL = ilk 20'de yok
  kolayimar_url text,
  rakipler jsonb NOT NULL DEFAULT '[]',                  -- [{domain, pozisyon}]
  reklamlar jsonb NOT NULL DEFAULT '[]',                 -- [{domain, baslik}]
  ai_overview_var boolean NOT NULL DEFAULT false,
  ai_overview_kolayimar boolean NOT NULL DEFAULT false,
  ai_overview_kaynaklar jsonb NOT NULL DEFAULT '[]',
  organik_ozet jsonb NOT NULL DEFAULT '[]',              -- top10 [{pozisyon, domain, baslik}]
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ... (sorgu, checked_at DESC);  CREATE INDEX ... (checked_at DESC);
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;   -- public policy YOK; yalnız service_role (admin API)
```

**`seo_findings`** (bulgu kuyruğu + sağlık trendi):
```sql
CREATE TABLE public.seo_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'openseo',        -- openseo | gsc | manual
  category text NOT NULL,                          -- orphan|duplicate_content|duplicate_meta|backlink|ctr|perf|site_health
  severity text NOT NULL DEFAULT 'orta',          -- yuksek | orta | dusuk
  baslik text NOT NULL, aksiyon text, url text,
  metrik jsonb NOT NULL DEFAULT '{}',              -- site_health: {orphans, duplicateContent, ...}
  status text NOT NULL DEFAULT 'open',            -- open | done | ignored
  resolved_at timestamptz, resolved_by text
);
CREATE INDEX ... (status, severity, created_at DESC);  CREATE INDEX ... (category, created_at DESC);
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;   -- yalnız service_role
```
> Blog beslemesi için `blog_posts` (slug, title, category, excerpt, status, published_at, updated_at) tablosu
> varsayılır — sitemap + llms.txt bundan yayınlanmış yazıları çeker. Yoksa statik `blogData` yeterli.

---

## 10. Environment değişkenleri (tam liste)

| Env | Zorunlu? | Ne için |
|-----|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Evet | `siteConfig.url` (canonical/OG/sitemap kökü). Yoksa fallback domain. |
| `NEXT_PUBLIC_SUPABASE_URL` | DB için | Supabase client (sitemap/llms.txt blog beslemesi). |
| `SUPABASE_SERVICE_ROLE_KEY` | DB için | Service-role (istihbarat tabloları + blog). **Secret.** |
| `CRON_SECRET` | Cron için | Tüm cron'ların `Bearer` auth'u. Prod'da tanımlı OLMALI. |
| `SERPAPI_API_KEY` | Command Center | Haftalık pozisyon + AI Overview taraması. |
| `GOOGLE_GSC_SA_KEY` | GSC (ops.) | Service account JSON (base64 veya ham). Yoksa SerpAPI fallback. |
| `GSC_SITE_URL` | GSC (ops.) | `sc-domain:kolayimar.com`. |
| `INDEXNOW_KEY` | IndexNow (ops.) | Public token; default kod içinde. `public/<key>.txt` ile eşleşmeli. |
| `ADMIN_NOTIFY_EMAIL` | Digest (ops.) | Haftalık SEO mail alıcısı (default info@...). |
| `RESEND_API_KEY` (veya SMTP) | Digest | `sendEmail` sağlayıcısı. |

> **Güvenlik:** `.env` ASLA commit'lenmez. IndexNow key hariç hepsi secret. Service-role sadece
> server-side. GSC SA JSON prod-only.

---

## 11. Cron yapılandırması (`vercel.json`)

```jsonc
{ "crons": [
  { "path": "/api/cron/arama-istihbarati", "schedule": "0 4 * * 1" },   // Pzt 04:00 — SerpAPI tara
  { "path": "/api/cron/seo-weekly-digest", "schedule": "0 7 * * 1" },   // Pzt 07:00 — mail (04:00 sonrası)
  { "path": "/api/cron/seo-distribution",  "schedule": "0 3 */3 * *" }  // 3 günde bir 03:00 — IndexNow
] }
```
- Sıra önemli: digest, tarama (04:00) TAMAMLANDIKTAN sonra (07:00) çalışır.
- Her cron `dynamic='force-dynamic'`, `Bearer CRON_SECRET` guard, `recordCronRun` heartbeat.
- **Middleware uyarısı:** `/api/cron/*` route'ları middleware'de 307 redirect'e TAKILMAMALI (yoksa cron
  sessizce ölür). Cron path'lerini middleware matcher'dan hariç tut.

---

## 12. Dosya haritası (motor — kopyalanacak çekirdek)

```
src/lib/seo.ts                              ★ TEK KAYNAK — siteConfig + tüm schema/metadata generator
src/lib/seo/indexnow.ts                     IndexNow client
src/lib/seo/gsc.ts                          Google Search Console client (jose JWT)
src/lib/seo/findings.ts                     seo_findings tip + sort/delta helper
src/lib/arama-istihbarati/collect.ts        SerpAPI toplayıcı (SORGULAR, RAKIP_DOMAINS)
src/lib/arama-istihbarati/opportunities.ts  Fırsat motoru (deriveOpportunities)
src/lib/district-content.ts                 ★ Determinist içerik motoru (doorway-safe)
src/lib/faqs/service-faqs.ts                Sayfa FAQ setleri + parametrik üreteçler
src/lib/imar-hukuku/{types,topics/*}.ts     Topic içerik sistemi (nişe-özel)
src/components/seo/StructuredData.tsx        ★ JSON-LD enjeksiyon (React 19-safe)
src/data/llms-base.txt                      llms.txt el yazımı base
public/llms-full.txt                        Tam içerik dökümü
public/<INDEXNOW_KEY>.txt                    IndexNow doğrulama token dosyası
src/app/robots.txt/route.ts                 Dinamik robots (27 AI crawler)
src/app/sitemap.ts                          Dinamik sitemap (statik+programmatic+DB)
src/app/llms.txt/route.ts                   Dinamik llms.txt (base + DB blog)
src/app/api/cron/arama-istihbarati/route.ts
src/app/api/cron/seo-distribution/route.ts
src/app/api/cron/seo-weekly-digest/route.ts
src/app/api/admin/arama-istihbarati/route.ts
src/app/api/admin/gsc-performance/route.ts
src/app/api/admin/seo-findings/route.ts
src/app/dashboard/admin/arama-istihbarati/page.tsx   Command Center paneli
src/app/<slug>/{page,layout,faqs}.tsx        "nedir"/hesaplayıcı landing deseni
src/app/imar-durumu/[city]/[district]/page.tsx        Programmatic sayfa deseni
src/constants/{districts,valuation-types,emlak-vergisi}.ts   Programmatic veri (nişe-özel)
supabase/migrations/*_arama_istihbarati.sql
supabase/migrations/*_seo_findings.sql
next.config.js                              redirects + RFC 8288 headers + canonical domain
vercel.json                                 cron tanımları
```

---

## 13. Kurulum sırası (fazlı — TodoWrite'a dök)

**Faz 0 — İskelet + tek kaynak (30 dk)**
1. Next.js App Router + TS + Tailwind + Supabase projesi.
2. `src/lib/seo.ts` yaz — `siteConfig`'i YENİ markaya göre doldur (name/title/desc/url/keywords/sameAs/
   address/contactPoint). Tüm generator'ları kopyala.
3. `src/components/seo/StructuredData.tsx` (React 19-safe, birebir).

**Faz 1 — Teknik SEO altyapı (Katman 1)**
4. `src/app/robots.txt/route.ts` (27 AI crawler + Content-Signal).
5. `src/app/sitemap.ts` (önce statik sayfalar; programmatic bölümleri Faz 3'te ekle).
6. `next.config.js` — canonical domain redirect + RFC 8288 Link header + 301 birleştirmeler.
7. Root `layout.tsx` — 6 statik schema enjeksiyonu.

**Faz 2 — GEO (Katman 3)**
8. `src/data/llms-base.txt` (zorunlu sıra, künye + About + Key Pages + Features + Evidence + Blog + Disclaimer).
9. `src/app/llms.txt/route.ts` (base + DB blog; nft literal yol).
10. `public/llms-full.txt` (tam döküm).

**Faz 3 — Programmatic (Katman 4)**
11. Veri dosyaları: `districts.ts` (+ valuation/emlak). **Doorway-safe** — her satır unique içerik üretebilmeli.
12. `src/lib/district-content.ts` (curated + hash-variant motoru).
13. Dinamik route'lar (`[city]/[district]/page.tsx`) + `generateStaticParams`/`generateMetadata`.
14. `service-faqs.ts` parametrik FAQ üreteçleri; her programmatic sayfaya FAQ+Breadcrumb schema.
15. sitemap'e programmatic bölümleri ekle.
16. (Opsiyonel) `imar-hukuku` topic sistemi — KD0 dev-hacim kelimeler.

**Faz 4 — Command Center (Katman 5)**
17. Migration'lar: `arama_istihbarati` + `seo_findings` (RLS, service-role only).
18. `collect.ts` (SORGULAR — kendi niş sorguların) + `opportunities.ts`.
19. `indexnow.ts` + `public/<key>.txt` + `api/cron/seo-distribution`.
20. `gsc.ts` + `findings.ts` + admin API'ler.
21. `api/cron/arama-istihbarati` + `api/cron/seo-weekly-digest`.
22. Admin panel `/dashboard/admin/arama-istihbarati` (tek sayfa, 4 kart).
23. `vercel.json` cron'ları + env'ler.

**Faz 5 — Otorite (kod-dışı, kullanıcı işi)**
24. Embeddable widget sistemi (`/embed` + `/embed/[arac]`, attribution `<a>` = gerçek backlink) — Bölüm 14.4.
25. Dizin kayıtları + veri-PR kiti + widget dağıtım maili.

---

## 14. Domain/marka parametrizasyonu (kolayimar → kolayseo)

Motor `siteConfig`-driven olduğu için marka değişimi tek noktadan yayılır. Değiştirilecekler:
1. **`siteConfig`** (seo.ts) — name/title/description/url/keywords/twitterHandle/locale.
2. **Statik schema objeleri** (seo.ts) — legalName/address/contactPoint/sameAs/knowsAbout/foundingDate/geo.
3. **`robots.txt/route.ts`** — `siteConfig.url`'den türer; AI-crawler listesi aynı kalır.
4. **`llms-base.txt` + `llms-full.txt`** — tamamen yeni marka içeriği (künye/features/blog).
5. **`indexnow.ts`** — `HOST` sabiti + yeni `INDEXNOW_KEY` + `public/<key>.txt`.
6. **`collect.ts`** — `SORGULAR` (kendi niş kelimelerin) + `RAKIP_DOMAINS` + `KENDI_DOMAIN`.
7. **Programmatic veri** (districts/valuation/...) — jenerik modda kendi eksenlerinle değiştir.
8. **`next.config.js`** — canonical domain redirect host'u.
9. **Logo/OG** — `public/images/logo.png` (512×512) + `public/og-image.jpg` (1200×630).

### 14.4 Embeddable widget (otorite motoru — backlink stratejisi)
`src/lib/embed/tools.ts` — `EMBED_TOOLS[]` registry (slug/ad/landingPath/anchor/height). `buildEmbedSnippet(tool)`
= `<iframe src="/embed/<slug>">` + **görünür attribution `<a>` linki** (dofollow backlink). Partnerler snippet'i
kendi sitesine yapıştırır; iframe içeriği değil attribution linki backlink'i taşır. `/embed` galeri indekslenir,
`/embed/[arac]` iframe sayfaları `noindex`. Endeksa'nın 5.9M backlink'i bu modelden gelir (widget → ilan sayfalarına gömülü).

---

## 15. Anti-pattern'ler / öğrenilen dersler (koda gömülü — TEKRAR ETME)

| # | Yanılgı | Gerçek |
|---|---------|--------|
| 1 | Sitemap ping ile anlık indeksleme | **2023'te KAPANDI.** Anlık kanal = IndexNow (Bing/Yandex; Google değil). |
| 2 | llms.txt GSC'yi etkiler | **Alakasız.** llms.txt = AI kanalı, GSC = klasik arama. Karıştırma. |
| 3 | meta keywords SEO getirir | **2009'dan beri ölü.** Emek → title/desc/canonical/JSON-LD. |
| 4 | JSX `<script>` ile JSON-LD | React 19 sessizce düşürür → `dangerouslySetInnerHTML` gizli div (Bölüm 5.1). |
| 5 | Dinamik `readFile` yolu | Tüm `public/`'i bundle'a katar → >250MB → deploy error. **Yol LİTERAL olmalı.** |
| 6 | Tüm ilçeleri thin sayfayla aç | **Doorway cezası TÜM siteyi vurur.** Her sayfa unique içerik (curated+hash-variant). |
| 7 | Google'ı IndexNow'a submit | Google IndexNow KULLANMAZ; sitemap+crawl ile gelir. |
| 8 | `/_next/`'i Googlebot'a blokla | Render bozar, CWV zarar, "indexed despite blocked". Yalnız generic botlara blokla. |
| 9 | Var olmayan slug'ı sitemap'e koy | Soft-404. Yalnız gerçek `page.tsx` route'ları. |
| 10 | On-page ile #1 çözülür | Çekirdek yüksek-hacimde **domain otoritesi tavan koyar.** Programmatic + KD0 + widget'a yönel. |
| 11 | Devlet sitelerini rakip say | TKGM/CSB rakip DEĞİL (fırsat motorunda filtrele); altında olmak normal. |
| 12 | Tailwind template-literal class (`bg-${x}`) | JIT görmez, derlenmez. **Statik class** kullan. |
| 13 | Cron `/api/cron/*` middleware'e takılır | 307 → cron sessiz ölür. Matcher'dan hariç tut. |

---

## 16. Doğrulama / test checklist (kurulum sonrası)

**Katman 1-2 (teknik + schema):**
- [ ] `/robots.txt` 200; 27 AI crawler `Allow: /`; Sitemap+Host+Content-Signal satırları var.
- [ ] `/sitemap.xml` 200; statik + programmatic + blog URL'leri; hiç 404/soft-404 slug yok.
- [ ] Ana sayfa kaynağında 6 `application/ld+json` script (Organization/WebSite/Service/Mobile/Local/Nav).
- [ ] Landing'de FAQPage+HowTo+Breadcrumb+WebApplication+Article. Rich Results Test geçer.
- [ ] Canonical self-ref; apex→www 301; eski yollar 301.

**Katman 3 (GEO):**
- [ ] `/llms.txt` 200, base + DB blog kategorize; `/llms-full.txt` 200.
- [ ] Ana sayfa `Link` header'ı (api-catalog + llms.txt + sitemap).
- [ ] `geo audit --url <site>` skoru (hedef 68+; global CLAUDE.md GEO tooling).

**Katman 4 (programmatic):**
- [ ] `[city]/[district]` örnek 5 sayfa — her biri unique intro/content (hash-variant çalışıyor).
- [ ] Veri olmayan bölümler render EDİLMİYOR (boş/uydurma yok).

**Katman 5 (command center):**
- [ ] Migration'lar uygulandı (RLS on, public policy yok).
- [ ] `api/cron/arama-istihbarati` (Bearer guard: 401 without / 200 with) → snapshot yazıyor.
- [ ] `submitToIndexNow` 202/200; `public/<key>.txt` 200.
- [ ] `api/cron/seo-distribution` sitemap URL'lerini submit ediyor.
- [ ] GSC bağlıysa `fetchSearchAnalytics` veri dönüyor; bağlı değilse null (fallback bozulmuyor).
- [ ] Haftalık digest maili 4 bloğu render ediyor; boş haftada "yeni bulgu yok".
- [ ] Admin panel `/dashboard/admin/arama-istihbarati` — İstihbarat+Fırsat+Sağlık+GSC kartları.

---

## 17. v1.1 — Kod doğrulaması sonrası eklenen çekirdek parçalar

> Bu bölüm, blueprint'in ilk sürümünde eksik/atlanmış ama **kodda gerçekten var olan** ve SEO motorunun
> tam çalışması için gereken parçaları belgeler. (2026-08-04 kod-vs-belge doğrulaması.) Bunlar olmadan
> kurulum "eksiksiz" sayılmaz.

### 17.1 Internal-linking / otorite katmanı (kodun içindeki backlink darboğazı çözümü)

Otorite darboğazının (§1) **kod tarafı** bu üç bileşendir — her yeni programmatic/landing sayfası bunları kullanmalı:

- **`src/components/seo/CityLinkHub.tsx`** — Server component; il/ilçe programmatic sayfalarının altına
  **81-il çapraz link ağı** koyar. Props: `basePath` (`/imar-durumu`|`/parsel-sorgu`), `title`, `linkSuffix`,
  `currentSlug` (kendi sayfasına link vermez), `sibling` (kardeş ağa köprü: imar-durumu ↔ parsel-sorgu).
  `TURKISH_CITIES`'ten türer, `toSlug` TR-normalize. **Neden kritik:** site audit'te 114 il sayfası
  **orphan** çıkmıştı (footer yalnız büyük illere link veriyordu) → bu mesh her il sayfasına iç link +
  tarama yolu getirir. JS yükü yok.
- **`src/components/layout/Footer.tsx` → "İmar Rehberi & Ücretsiz Araçlar" bloğu** (~satır 238) — site-geneli
  internal linking: ~15 landing (kaks/taks/gabari/çekme/arsa-degerleme/rayic/emlak-vergisi/tapu-harci +
  tapu aileleri + `/embed`). Bu sayfalar önceden HİÇBİR yerden dahili link almıyordu → her sayfadan otorite akar.
- **`src/components/seo/SourcesBlock.tsx`** — E-E-A-T katmanı. Props: `kaynaklar: {ad,url}[]` + `guncelleme`
  (insan-okur tarih). Mevzuat-dayanaklı landing'lerin altına **görünür kaynakça + son güncelleme + İlkelerimiz
  linki + "bilgilendirme amaçlıdır" disclaimer** basar. **Standart:** yeni "nedir"/mevzuat landing'i =
  `page + layout + faqs` + **SourcesBlock + Article schema** (kurum-seviyesi; uydurma named-author YOK).

> **Kurulum sırasına ekle (Faz 3):** her programmatic sayfaya CityLinkHub, her mevzuat landing'ine SourcesBlock,
> Footer'a internal-link bloğu. Bunlar "otorite" fazının (Faz 5) **kod tarafındaki ilk taşı** — widget/dizin
> gelmeden önce site-içi otorite akışını kurar.

### 17.2 HowTo schema kütüphanesi — `src/lib/howto-schemas.ts`

`seo.ts`'teki `generateHowToSchema` **generator**'dır; içerik `howto-schemas.ts`'te durur: **14 hazır `HowTo`
objesi** (`parselSorguHowTo`, `imarDurumuHowTo`, `katKarsiligiHowTo`, `degerlemeHowTo`, `riskAnaliziHowTo`,
`ecriMisilHowTo`, `bagimsizBolumHowTo`, `droneCekimiHowTo`, `olcumAplikasyonHowTo`, `modelleme3DHowTo`,
`sinirKazikCakimiHowTo`, `yasalCinsDegisikligiHowTo`, `haritaKrokiHowTo`, `mimariDegerlendirmeHowTo`).
Tip: `{ name, description, steps: {name,text}[] }`. Service/landing layout'ları bunları `generateHowToSchema`'ya
verip **AI Overview için adım-adım schema** basar. **kolayseo uyarlaması:** kendi hizmet/süreç HowTo'larını
buraya yaz; her biri 4-5 somut adım, uydurma süre/rakam yok.

### 17.3 Dinamik Open Graph görselleri — `opengraph-image.tsx`

Statik `og-image.jpg`'a ek olarak **`next/og ImageResponse` ile runtime OG üretimi**:
- `src/app/opengraph-image.tsx` (site-geneli, 1200×630, marka logosu + "Kolayimar" kelime markası; gömülü
  `public/fonts/Inter-Black.ttf` + `Inter-Light.ttf`).
- `src/app/imar-durumu/[city]/opengraph-image.tsx` (programmatic: her il için **dinamik başlıklı** OG).
- **Kurulum notu:** fontlar `readFile(process.cwd()/public/fonts/...)` ile LİTERAL yoldan okunur
  (§4.2/anti-pattern #5 aynı kural). `toAB()` ile Buffer→ArrayBuffer. kolayseo'da marka SVG + font değişir.

### 17.4 İKİ GSC istemcisi var (belge tekini anlatıyordu — düzeltme)

Kodda **iki ayrı Search Console yolu** var, ikisi de gerçek:
1. **`src/lib/seo/gsc.ts`** (§8.4) — `jose` RS256 JWT, `fetchSearchAnalytics`, command-center/fırsat motoru için.
2. **`src/lib/analytics/gsc.ts`** (`getGscReport`) + **`src/lib/analytics/google-sa.ts`** (`resolvedServiceAccountEmail`)
   — `src/app/api/admin/gsc-analytics/route.ts`'in kullandığı analytics-tarafı rapor yolu (`?days=28`).

Yani admin tarafında **`gsc-performance`** (CTR fırsatı, seo/gsc.ts) VE **`gsc-analytics`** (genel Search
Analytics raporu, analytics/gsc.ts) iki ayrı route. kolayseo'da tek yola indirgenebilir; ama mevcut sistemi
birebir klonluyorsan ikisini de taşı (§12 dosya haritasına `src/lib/analytics/{gsc,google-sa}.ts` +
`api/admin/gsc-analytics` ekle).

### 17.5 Valuation ailesi = 4 AYRI route (belge "4 slug" diyordu — netleştirme)

`src/constants/valuation-types.ts` → `VALUATION_TYPES` (4 kayıt: `gayrimenkul-degerleme`, `ekspertiz-raporu`,
`konut-ekspertiz`, `banka-ekspertiz-degerleme`) + `VALUATION_TYPE_SLUGS`. Bunların her biri **kendi route
klasörü**:
```
src/app/gayrimenkul-degerleme/[city]/page.tsx
src/app/ekspertiz-raporu/[city]/page.tsx
src/app/konut-ekspertiz/[city]/page.tsx
src/app/banka-ekspertiz-degerleme/[city]/page.tsx
```
Yani "valuation ailesi" tek dinamik route değil; **4 slug × top-10 şehir matrisi** üzerinden 4 ayrı sayfa
ağacı (aynı `VALUATION_TYPES` verisinden beslenir). Sitemap'e dördü de eklenir.

### 17.6 Programmatic veri + schema yardımcıları (askı/emsal)

Programmatic sayfaların "gerçek veri" katmanı (§7.2'de değinilen, ama dosyaları listelenmemişti):
- **`src/lib/aski/seo-data.ts`** — `getAktifIller`, `getIlData`, `getIlceData`, `getSonIlanlar`, `getToplamIlan`
  (DB'den aktif askı planları) + **`buildItemListSchema(ilanlar, pageUrl)`** (askı listelerine `ItemList`
  JSON-LD) + `PLAN_TIPI_LABEL`/`planTipiLabel`/`trTarih` yardımcıları.
- **`src/lib/emsal/seo-data.ts`** — `getIlceEmsalBandi(city, district)` (aktif ilanlardan m² fiyat bandı;
  veri yoksa bölüm render EDİLMEZ) + `formatTL`.
> **Not:** `src/lib/calculators/villa-karsiligi-schema.ts` isim benzerliğine rağmen **SEO schema DEĞİL** —
> hesaplayıcı için Zod input validation'ı. SEO motoruna dahil etme.

### 17.7 `kolayseo` skill (bonus — zaten var)

Bu blueprint'in yanında bir **`kolayseo` Claude skill'i** de mevcut (niş-agnostik SEO/GEO kurulum motoru).
Blueprint = "ne + neden + tam mimari"; skill = "adım adım uygula" tetikleyicisi. İkisi birlikte kullanılır.

### 17.8 Güncellenmiş dosya haritası eki (§12'ye ekle)

```
src/components/seo/CityLinkHub.tsx          81-il çapraz internal-link mesh (orphan kurtarma)
src/components/seo/SourcesBlock.tsx         E-E-A-T kaynakça + güncelleme + disclaimer
src/components/layout/Footer.tsx            "İmar Rehberi & Ücretsiz Araçlar" internal-link bloğu
src/lib/howto-schemas.ts                    14 hazır HowTo objesi (AI Overview)
src/lib/aski/seo-data.ts                    Programmatic askı veri + ItemList schema
src/lib/emsal/seo-data.ts                   Programmatic emsal fiyat bandı verisi
src/lib/analytics/gsc.ts + google-sa.ts     2. GSC yolu (gsc-analytics route)
src/app/api/admin/gsc-analytics/route.ts    Genel Search Analytics raporu (?days=)
src/app/opengraph-image.tsx                 Site-geneli dinamik OG
src/app/imar-durumu/[city]/opengraph-image.tsx   Programmatic dinamik OG
src/app/{gayrimenkul-degerleme,ekspertiz-raporu,konut-ekspertiz,banka-ekspertiz-degerleme}/[city]/  4 valuation ailesi
```

### 17.9 Checklist eki (§16'ya ekle)

- [ ] Programmatic il sayfalarında CityLinkHub render ediyor (81-il mesh; orphan yok).
- [ ] Mevzuat landing'lerinde SourcesBlock + Article schema var (E-E-A-T).
- [ ] Footer'da internal-link bloğu (~15 landing + /embed) tüm sayfalarda görünüyor.
- [ ] `/opengraph-image` ve programmatic `[city]/opengraph-image` 200 + doğru başlık render ediyor.
- [ ] Her iki GSC yolu (gsc-performance + gsc-analytics) credential varsa veri dönüyor.
- [ ] 4 valuation route ailesi (×top-10 şehir) sitemap'te + unique metadata.

---

## Ek — Kolayimar gerçek durum notları (bağlam; jenerik modda atla)

- **Darboğaz doğrulandı:** kolayimar 9 referring domain vs Endeksa 1.977; çekirdek kelimede #4-5 tavan.
  Programmatic KANITLI (#4-6, %4-22 CTR). KD0-6 kelimeler (rayiç/emlak-vergisi/veraset/tevhit) backlink beklemez.
- **En güçlü hamleler (yapıldı):** footer site-geneli internal linking, rayiç hesaplayıcı, embeddable widget,
  E-E-A-T katmanı (SourcesBlock + Article schema), imar-hukuku KD0 ekseni.
- **Açık büyük işler:** dizin kayıtları (kullanıcı), widget dağıtımı, programmatic dikkatli ölçek,
  keyword-gap otomasyonu (GSC striking-distance), CTR fix (otorite-bağımlı, marjinal).
```
