# 07 — SEO / GEO / PUBLIC SURFACES

Etiketler: KANITLI / ÇIKARIM / TODO.

---

## 1. SEO altyapı dosyaları

### robots.ts (`src/app/robots.ts`)
- **Disallow (gizli):** `/havuz`, `/uretici`, `/admin`, `/api`, `/hesap-bekliyor`, `/p/`, `/tasarim`, `/login`, `/kayit`, `/mockup`, `/sunum`, `/_bildirim`.
- **31 AI crawler explicit allow:** GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Google-CloudVertexBot, Applebot, Applebot-Extended, Amazonbot, Bytespider, CCBot, Meta-ExternalAgent, FacebookBot, cohere-ai, Diffbot, PhindBot, YouBot, DuckAssistBot, PetalBot, Bravebot, ImagesiftBot, Timpibot (+ genel `*`). sitemap + host set.

### sitemap.ts (dinamik)
- Statik: `/` (1.0), `/muteahhit` (0.9), `/emlakci` (0.9), `/guven` (0.7), 3 hukuki (0.3 — **ama noindex**, tutarsızlık).
- Hub: `/konut-projeleri` (0.6) + il (0.5) + ilçe (0.4) — `tumHubProjeleri()`.
- Projeler: kendi DB `public_slug` **projeIcerikSkoru≥5 filtre** (0.7) + `katalog_proje` (aktif, eşleşmemiş, eşik-filtre, dedup, 0.5). DB-down → graceful boş.

### llms.txt / llms-full.txt
- `public/llms.txt` (76 satır, özet) + `public/llms-full.txt` (151 satır, genişletilmiş). İkisi de: Projedar tanımı, Hakkında, Ana Sayfalar (link), Temel Özellikler, Kimler İçin, Farklılıklar, 7 SSS, Yasal Uyarı. "İlan portalı değildir", komisyon yok, kapalı-devre B2B, PWA vurgusu. Global llms.txt standardına uygun.

### IndexNow
- `src/lib/seo/indexnow.ts`; key dosyası `public/a3f5c9e1b7d2486fa3f5c9e1b7d2486f.txt` (public token, secret değil). Bing/Yandex/Naver (Google değil). Default URL'ler `/`, `/muteahhit`, `/emlakci`, `/guven`. `INDEXNOW_KEY` env + public fallback. Admin SEO yayınında proje URL'i push.

### RFC 8288 Link header + Content-Signal (`next.config.ts`)
- `/` için `Link: </llms.txt>; rel=alternate; type=text/markdown, </sitemap.xml>; rel=sitemap` (AI/agent keşfi).
- Tüm yollara `Content-Signal: search=yes, ai-train=yes, ai-input=yes` (2025 içerik izin standardı). Panel/mikrosite robots'ta zaten disallow.

## 2. Root metadata (`src/app/layout.tsx`)
- `metadataBase: https://projedar.com`, `lang="tr"`, `applicationName: Projedar`, manifest linked, apple-web-app capable.
- Title (template YOK — çift "Projedar" olmasın diye): **"Projedar — Canlı Konut Stoğu Dağıtım Ağı"**.
- Description: "Çok-müteahhitli, üretici-kontrollü canlı konut stoğu dağıtım ağı. Tek doğru kaynak, granüler tahsis, çift-satış kalkanı, görünür tazelik."
- `robots: index,follow` (site geneli indexlenebilir); googleBot max-image-preview:large, max-snippet:-1.
- OG type=website, siteName=Projedar, locale=tr_TR; twitter summary_large_image. Fonts Outfit/Inter/Geist Mono. themeColor `#eef1f6`.

## 3. Dinamik OG görseli (`src/app/opengraph-image.tsx`)
- Dosya-tabanlı, node runtime, 1200×630 PNG, koyu komuta gradient. İçerik: wordmark "Projedar" + "Canlı konut stoğu dağıtım ağı" + "Tek doğru kaynak · Çift satış kalkanı · Komisyon yok" + müsait/opsiyon/satıldı sinyal satırı + "Canlı · 2 dk önce". Tüm route'lara otomatik; twitter fallback buna. Mikrositede birim-özel OG (`/p/.../opengraph-image.tsx`, fiyat basmaz).

## 4. JSON-LD schema envanteri (KANITLI)

| Sayfa | Schema tipleri |
|---|---|
| `/` | Organization, WebSite (inLanguage tr-TR), SoftwareApplication (BusinessApplication, offers price "0" TRY), Service (areaServed Türkiye), SiteNavigationElement, FAQPage (7 Q) |
| `/muteahhit` | WebPage, BreadcrumbList, FAQPage (7 Q) |
| `/emlakci` | BreadcrumbList, FAQPage (6 Q) |
| `/guven` | WebPage, BreadcrumbList, FAQPage (6 Q) |
| `/proje/[slug]` | WebPage, **ApartmentComplex** (address, geo, numberOfAccommodationUnits, amenityFeature, developer Org), BreadcrumbList, FAQPage |
| `/konut-projeleri` | CollectionPage, ItemList (eşik-geçen, max 50), BreadcrumbList |

## 5. Public vs private ayrımı (kritik)

- **Public index:** `/`, `/muteahhit`, `/emlakci`, `/guven`, `/proje/[slug]` (eşik geçerse), `/konut-projeleri/*`.
- **Public noindex:** `/p/...` mikrosite, hukuki sayfalar, sunum, mockup, tasarim.
- **Bilerek public YAPILMAYAN:** canlı stok sayısı + fiyat (yalnız danışman paneli/mikrosite); panel içeriği (havuz/uretici/admin robots disallow); tahsis bilgisi.
- **Middleware SEO muafiyeti:** `proxy.ts` matcher robots.txt/sitemap.xml/opengraph-image/twitter-image + `.txt/.xml` uzantılarını `/login` redirect'inden muaf tutar (crawler'lar için kritik fix).

## 6. Indexlenebilir URL aileleri
```
/                              (hub landing)
/muteahhit /emlakci /guven     (rol/güven landing)
/konut-projeleri               (SEO hub kök)
/konut-projeleri/{il}          (il kırılımı)
/konut-projeleri/{il}/{ilce}   (ilçe kırılımı)
/proje/{slug}                  (proje mikrosite, eşik≥5)
```

## 7. SEO açısından mevcut durum / boşluklar

**Güçlü (KANITLI):** 31 AI crawler allow, dinamik eşik-filtreli sitemap, iki llms.txt, dosya-tabanlı OG, IndexNow, kapsamlı JSON-LD, ince-içerik kalkanı (doorway-safe hub + `/proje` `notFound` eşiği), thin-content varyant motoru, Content-Signal + Link header.

**Boşluk/uyarı:**
- Blog / knowledge-base / rehber / sözlük / hesaplayıcı **YOK** (içerik altyapısı — §24). Programmatic SEO yalnız `/proje` + `/konut-projeleri` katalog kaynaklı.
- 3 hukuki sayfa noindex ama sitemap'te (zararsız tutarsızlık — TODO temizlik).
- Public `/hesap-silme` yok (app-store/portal account-deletion URL beklentisi olursa boşluk).
- `/firma/[slug]` müteahhit kurumsal SEO sayfası yok (backlog).
- `.well-known/*` agent-readiness ikincil (kapalı-devre B2B için).

## 8. GEO / AI search envanteri (§23)

**Var (KANITLI):** answer-first landing yapısı, FAQPage schema (4 public sayfa + proje), semantic HTML, structured data (yukarıda), server-rendered content (SSR/ISR), robots AI-crawler ayarları (31), llms.txt + llms-full.txt, Content-Signal header, güncelleme tarihi (proje `son_guncelleme`, hukuki "son güncelleme 2026-06-18"), yazar/kaynak (üretici Organization developer).

**Yok/zayıf:** blog citability blokları, harici otorite alıntıları (peer-review yok — sektör ürünü), Person/author schema (blog olmadığı için), date-stamped article schema (blog yok), Reddit/Ekşi mention pipeline (harici).

## 9. İçerik / sektörel sayfa altyapısı (§24)

- **CMS/MDX/Markdown blog:** YOK. İçerik DB-tabanlı (`katalog_proje.icerik jsonb` + `proje.kunye`) veya kod-içi copy.
- **Slug sistemi:** `public_slug` (proje), `katalog_proje.slug`, `slugify(il/ilce)` (hub). Kategori/tag/author/publish-date **yok** (blog olmadığı için).
- **Programmatic SEO:** `/proje/[slug]` (çift kaynak + varyant motoru) + `/konut-projeleri` hub. Sektörel bilgilendirme sayfaları (emlakçı arama-niyeti hedefli) **planlı ama henüz yok** — bu, en son kullanıcı oturumunun konusu (session summary "Sektörel sayfalar" görevi).
- **Sonuç:** mevcut altyapı proje-SEO'ya uygun; sektörel/rehber SEO-GEO sayfaları için blog/içerik altyapısı (MDX veya DB) eklenmeli.

## 10. Bölge veri seti (`src/data/bolge-benchmark.json`)
Tek dataset: `{kaynak:emlakjet, olcu:tl_m2_giris_medyan, proje_toplam:1500, min_proje:2, il:{14 giriş}, ilce:{47 giriş}}`. Örn İstanbul 114944₺/672 proje, Ankara 80000/177, İzmir/Çeşme 293103/11. Üretici stok benchmark rozeti (public yüzey değil). "Satış değil, benchmark."
