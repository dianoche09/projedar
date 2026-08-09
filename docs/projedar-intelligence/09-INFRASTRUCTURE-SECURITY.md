# 09 — INFRASTRUCTURE, SECURITY, PERFORMANCE, A11Y, TESTS

Etiketler: KANITLI / ÇIKARIM / TODO. Gizli değerler yazılmadı.

---

## 1. Teknoloji stack (§32 — KANITLI `package.json`)

| Katman | Teknoloji |
|---|---|
| Framework | Next.js **16.2.9** (App Router) |
| Language | TypeScript **^5** (strict) |
| Frontend | React **19.2.4** + React DOM 19.2.4 |
| CSS | Tailwind **v4** (`@tailwindcss/postcss`, CSS-first `@theme`) |
| UI | Custom component set (shadcn/Radix/MUI YOK); `lucide-react` ^1.22 ikonlar |
| Motion | `motion` ^12.42 |
| Backend/DB | Supabase (`@supabase/supabase-js` ^2.108, `@supabase/ssr` ^0.12) — Postgres + Auth + Realtime + Storage + RLS |
| Auth | Supabase Auth (e-posta/parola, PKCE callback) |
| Storage | Supabase Storage (`proje-medya` public, `kyc-belge` private) |
| Hosting | Vercel (serverless + cron, region `syd1`) |
| Maps | Leaflet ^1.9 + OSM (anahtarsız) |
| Mail | Resend ^6.16 |
| Excel | `xlsx` ^0.18 (stok import/export) |
| Validation | Zod ^4.4 |
| PWA | serwist ^9.5 (`@serwist/next`) |
| State | React server components + `useState`/`useTransition` (harici state lib yok) |
| Forms | Native + server actions + `useFormStatus` |
| Toploader | `nextjs-toploader` ^3.9 |
| Analytics | Yerel `events` tablosu (harici GA4/PostHog/pixel kodda yok) |
| Monitoring | Yok kodda (Sentry entegre değil; claude.ai Sentry MCP oturumda ama koda bağlı değil) |
| Testing | **Yok** (Jest/Vitest/Playwright/Cypress bağımlılığı yok) |

## 2. Deployment & infrastructure (§33 — KANITLI)

- **Vercel:** serverless (Fluid Compute); `vercel.json` region `syd1`, cron `/api/cron` 03:00 UTC; `maxDuration=300` keşif route'larında.
- **Build:** `next build --webpack` (Turbopack değil — bilinçli). `dev: next dev --webpack`.
- **Domain:** `projedar.com` (metadataBase, canonical).
- **CI/CD:** `.github/` mevcut (workflow); "direkt canlıya" deseni (memory: PR ceremony yok, main'e push→Vercel deploy).
- **Environment ayrımı:** production odaklı; env pull `--environment=production` (memory `hesaplar-ayri`). Ayrı staging kod-kanıtı yok.
- **Region migration planı:** Sydney→Frankfurt (TR latency, Faz-2).
- **Next 16 notu:** middleware → `src/proxy.ts` (proxy convention).

## 3. Environment variables (§34 — KANITLI koddan; değerler YAZILMADI)

| Kategori | Değişken | Amaç |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL (public) |
| Supabase | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (browser/server RLS) |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | Service-role (server/cron, RLS bypass — NEXT_PUBLIC değil) |
| App | `NEXT_PUBLIC_SITE_URL` | Base URL (link/mail/mikrosite) |
| Güvenlik | `LEAD_SHARE_SECRET` | HMAC paylaşım/davet token imzası (fallback YOK) |
| Cron | `CRON_SECRET` | Cron Bearer auth (fail-closed) |
| Mail | `RESEND_API_KEY` | Resend transactional e-posta |
| Mail | `MAIL_FROM` | Gönderen adresi |
| SEO | `INDEXNOW_KEY` | IndexNow anahtarı (public token, fallback var) |

**Not/drift:** Doküman `NEXT_PUBLIC_APP_URL` der; kod `NEXT_PUBLIC_SITE_URL` kullanır. Faz-2 (kodda YOK): `WHATSAPP_*`, `ANTHROPIC_API_KEY` (runtime). Keşif anahtarları (serpapi/serper/places) + içerik anahtarları (claude/fal/elevenlabs/publer/render) **env'de değil, DB `pazarlama_entegrasyon`'da BYOK**. `.env.example` + `.env.local` var (permission-korumalı; değerler okunmadı).

## 4. Güvenlik (§44 — KANITLI)

**Güçlü:**
- **RLS-önce (DEĞİŞMEZ #1):** her tabloda açık; görünürlük SECURITY DEFINER fonksiyonlarında. Service-role yalnız server (bundle'a girmez).
- **DB-kalkanları (partial-unique/CHECK):** çift-satış (`opsiyon_tek_aktif`), bekleyen-talep, tek-abonelik, tek-silme-talebi, aday-dedup, abonelik-XOR.
- **KYC-gate trigger:** `belge_durumu_guard` (non-admin kendini doğrulayamaz).
- **HMAC token:** paylaşım/davet (`LEAD_SHARE_SECRET`, fallback yok → forge kalkanı).
- **Cron fail-closed:** `CRON_SECRET` yoksa 500.
- **Input validation:** Zod tüm body-alan route'larda + server actions; ILIKE wildcard escape (`emlakci-ara`); UUID validation (`zUuid` lenient + strict `z.string().uuid()`).
- **Auth:** `getUser()` (server-side token doğrula, getSession'a güvenme); open-redirect kalkanı (auth callback + `geriYol`); kullanıcı-enumerasyon koruması (şifre sıfırlama); XSS escape (`htmlKacir` mail).
- **KVKK:** ayrı açık rıza checkbox, anonim sinyaller (IP/PII yok), veri minimizasyonu, `hesap_silme_talebi`.
- **IDOR kalkanları:** medya/tip yükleme sahiplik kontrolü; storage own-folder policy.
- **admin çift-guard:** layout + `adminGuard()` + kendi hesabını demote edememe.

**Zayıf / risk (ÇIKARIM):**
- **Tek savunma hattı RLS:** bazı panel sorguları client-side owner filtresi içermez (leadler, bildirimler); RLS regresyonu = veri sızıntısı.
- **HMAC token 16-hex (64 bit):** kısaltılmış; keyed HMAC olduğu için pratik olarak brute-force online guessing gerektirir (rate-limit'siz endpoint'lerde teorik yüzey).
- **Dağıtık rate-limit yok:** yalnız `/api/lead` 10dk throttle (uygulama-katmanı, yarış penceresi); `/api/etkilesim` throttle'sız (token replay → sinyal spam).
- **CSRF:** özel token yok (Next.js server action korumasına dayanır) — standart posture.
- **Plaintext API anahtarları:** `pazarlama_entegrasyon` düz metin (pgsodium/Vault Faz-2 notu).
- **Keşif KVKK:** iş-iletişim verisi rıza öncesi kazınır; opt-out reaktif; robots.txt kontrolü yok (yalnız UA).
- **Geçici debug info-leak (TODO):** `havuz/actions.ts:91-95` ham Postgres hata metni UI'a.
- **Secret rotate önerisi:** doküman geçmiş token ifşasını not eder (operasyonel).
- Potansiyel ciddi açık **görülmedi**; yukarıdakiler sertleştirme/cila seviyesi (exploit tarifi verilmedi).

## 5. Performans (§45 — KANITLI)

- **Rendering:** SSR (paneller), **ISR** (`/proje/[slug]` + `/konut-projeleri` `revalidate=3600`), server components ağırlıklı.
- **CDN/edge:** Vercel edge cache; statik asset'ler; OG dosya-tabanlı (cache'lenebilir).
- **Realtime:** Supabase Realtime yalnız `birim` (proje-filtre); "nice-to-have" (tempo saat/gün).
- **Pagination:** stok tablosu 30/sayfa; denetim/bildirim limit 100; lead-sorgu 25.
- **Image opt:** Next Image + AI-üretim statik görseller; harita OSM raster.
- **Query opt:** indexler (proje_id, durum, ana_birim_id, telefon_norm, (tip,created_at)). **Ölçek uyarısı:** `talep-radari` events 20.000 satır limitli — hacimde SQL agregasyona taşınmalı (kod yorumu). Binlerce proje/stok için RLS SECURITY DEFINER fonksiyon çağrıları maliyet olabilir (ÇIKARIM — profil gerekebilir).
- **Cron dispatcher:** sıralı; toplu update'ler; region syd1 (TR latency → Frankfurt planı).

## 6. Erişilebilirlik & UX (§46 — KANITLI)

- `Form` bileşeni: görünür label, `Field` (label/helper/error), ≥44px, 16px input (zoom-safe) — ui-ux-pro-max kuralları belgelenmiş.
- Focus-visible ring (teal @12%); active scale(0.96) tap feedback.
- `prefers-reduced-motion: reduce` tam saygı (global kill-switch + per-section).
- Loading states: `LogoLoader`, `SubmitButton` pending, `loading.tsx` (üretici).
- Empty states: her liste sayfasında anlamlı boş-durum copy'si.
- Toast: `ToastSaglayici`/`useToast` (basari/hata/bilgi, 3.5s).
- **Boşluk (ÇIKARIM):** aria/keyboard-nav derinliği sınırlı denetlenmiş; kapsamlı a11y audit kod-kanıtı yok (skeleton yerine spinner).

## 7. Test altyapısı (§47)

- **YOK.** `package.json`'da hiçbir test framework yok (Jest/Vitest/Playwright/Cypress). `test/`, `__tests__/`, `*.test.ts` kod-kanıtı yok.
- Kalite güvencesi: TypeScript strict + ESLint (`eslint src`, `eslint-config-next`) + manuel QA + gstack/browser skill'leri (harici).
- **Kritik flow'lar (opsiyon/çift-satış/RLS) otomatik test edilmiyor** — DB-kalkanları koruma sağlar ama regresyon testi yok (risk).
- Scriptler (`scripts/test-hesaplar.mjs`) test hesabı seed'i, unit test değil.

## 8. Kod kalitesi gözlemi (Zero-Tolerance uyumu)
- Mock/dummy/placeholder üretim kodunda **yok** (landing demo'ları bilinçli+etiketli). TODO/FIXME **yok** (tek geçici: havuz debug leak). `console.log` yok (yalnız `console.error`). Unused import taraması temiz (ÇIKARIM — agent grep'leri). Tasarım token sistemi büyük ölçüde uygulanmış (birkaç raw slate-* istisna).
