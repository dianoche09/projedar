# 06 — API & INTEGRATIONS

Etiketler: KANITLI / ÇIKARIM. Gizli değerler yazılmadı.

---

## 1. API mimarisi (App Router route handlers + server actions)

**Auth topolojisi:** `src/proxy.ts` (Next 16 middleware) matcher `/api`'yi **hariç tutar** → her `/api/*` route kendi auth'unu yapar (yorumdan KANITLI: "api rotaları kendi auth'unu yönetir"). Server actions Next.js POST/action korumasına dayanır; ayrı CSRF token yok.

### AUTH
| Endpoint | Method | Auth | I/O |
|---|---|---|---|
| `/auth/callback` | GET | — | `exchangeCodeForSession(code)`; open-redirect kalkanı (`next` yalnız `/` başlayıp `//` başlamayan); hata→`/login?hata` |
| `(auth)/login` actions | server action | — | `girisYap` (Zod email+pw min6, `signInWithPassword`, `son_giris` update, `durum!=aktif`→`/hesap-bekliyor` else `panelYolu(rol)`), `cikisYap` |
| `(auth)/sifremi-unuttum` | server action | — | `sifreSifirlamaIste` (kullanıcı-enum koruması: her zaman aynı mesaj) |
| `(auth)/sifre-yenile` | server action | recovery session | `sifreYenile` (pw min6 + eşleşme, `updateUser`, `signOut`) |

### CRON (hepsi GET, `cronYetkiKontrol` = Bearer CRON_SECRET, fail-closed)
| Endpoint | İş | İstemci |
|---|---|---|
| `/api/cron` | Dispatcher (sıralı): `opsiyon_suresi → stok_acilis → freshness → kesif_followup` | service-role |
| `/api/cron/freshness` | 15g eski birim `stale=true` | service-role |
| `/api/cron/option-expiry` | Süresi geçen opsiyon sil (trigger birimi müsait yapar) + geçici doğrulama penceresi dolan serbest | service-role |
| `/api/cron/stok-acilis` | `planli` + `satisa_acilis<=now` + `satilabilir` → `musait` + `acilis` event | service-role |
| `/api/indexnow` | `indexNowGonder()` (force-dynamic) | — |

### PUBLIC / TOKEN-GATED
| Endpoint | Method | Kapı | Not |
|---|---|---|---|
| `/api/lead` | POST | HMAC `verifyShareToken` + Zod (`kvkk: z.literal(true)`, ad 2-80, tel 7-20, niyet enum) + normalize + **10dk throttle (429)** | service-role; `lead` insert (atanan=ilk_paylasan=emlakci) + `events lead` + emlakçıya bildirim |
| `/api/etkilesim` | POST | HMAC token; tip ∈ [favori, odeme_hesap] | service-role `events` (PII yok). **Throttle YOK** (token replay riski); `catch{}` sessiz (log yok) |
| `/api/kesif/cikis` | GET | `adayDavetGecerli(...,"cikis")` HMAC | `aday.opt_out=true`, inline HTML; İYS/ETK opt-out |

### ROLE-GUARDED
| Endpoint | Method | Auth | Not |
|---|---|---|---|
| `/api/uretici/emlakci-ara` | GET | `["uretici","admin"]` (401/403) → sonra service-role | ILIKE wildcard escape (`%_\`); q min2 + ≥1 kriter; top-20 + count |
| `/api/admin/kesif` | GET/POST/PATCH | `adminIdVeya()` (403); `maxDuration=300` | GET aday liste + funnel; POST kampanya + `kesfet()` + mail extract + upsert dedup; PATCH aday düzenle |
| `/api/admin/kesif/davet` | POST | `adminIdVeya()` (403) | email (Resend) veya WhatsApp deep-link (server göndermez); opt_out→409; proje segment davet edilemez→400 |

## 2. CRON detayı (KANITLI `cron/_lib/isler.ts`)

- **Vercel cron:** `vercel.json` tek `{path:"/api/cron", schedule:"0 3 * * *"}`, region `syd1`. Günde bir 03:00 UTC. Sıra önemli: freshness EN SON (önceki işler `son_guncelleme` tazeler).
- **pg_cron (DB içi):** iki job `*/15 * * * *` — `opsiyon-serbest-birak`, `opsiyon-hatirlat` (saat-granüllü opsiyon yaşam döngüsü). Vercel cron + pg_cron birlikte çalışır.
- `freshnessCalistir`: `birim.stale=true where son_guncelleme < now-15g and stale=false`.
- `stokAcilisCalistir`: `planli+satilabilir+satisa_acilis<=now → musait, son_guncelleme=now, stale=false` + `acilis` event.
- `opsiyonSuresiCalistir`: expired opsiyon (kilit_bitis geçmiş VEYA dogrulandi=false+dogrulama_bitis geçmiş) → DELETE (trigger birimi serbest) + `sure_doldu` event.
- `kesifFollowupCalistir`: TAKIP_GUN=3, MAKS_TEMAS=3; davet_edildi+opt_out=false+temas<3+email → hatırlatma mail + `aday_temas` + temas++; `>=3` → soguk.

## 3. Supabase client mimarisi (RLS-kritik)

| İstemci | Dosya | Anahtar | RLS |
|---|---|---|---|
| Browser | `src/lib/supabase/client.ts` | anon | enforced |
| Server (SSR/route/action) | `src/lib/supabase/server.ts` | anon + cookie session | enforced (user) |
| Service-role | `src/lib/supabase/admin.ts` `createAdminClient()` | SERVICE_ROLE_KEY | **BYPASS** |

`createAdminClient` env eksikse throw; `autoRefreshToken:false, persistSession:false`; yalnız server (`NEXT_PUBLIC` değil → bundle'a girmez, DEĞİŞMEZ #1). Service-role kullanım yerleri: cron, `/api/{lead,etkilesim,kesif/cikis,uretici/emlakci-ara,admin/kesif/*}`, `lib/{events,bildirim,tahsis}.ts`, mikrosite, admin/havuz/uretici action'larının cross-profile okumaları, sitemap.

## 4. Entegrasyonlar (§16)

| Servis | Amaç | Kod yeri | Aktif |
|---|---|---|---|
| **Supabase** | Postgres + Auth + Realtime + Storage + RLS | `src/lib/supabase/*`, tüm veri | ✅ |
| **Vercel** | Serverless + cron (syd1) + hosting | `vercel.json`, deploy | ✅ |
| **Resend** | Transactional e-posta (best-effort) | `src/lib/mail.ts`, davet/keşif/auth | ✅ (anahtar varsa) |
| **Leaflet + OSM** | Harita (anahtarsız raster) | `HavuzHarita`, mikrosite | ✅ |
| **serwist** | PWA service worker | `src/app/sw.ts`, `next.config.ts` | ✅ |
| **IndexNow** | SEO ping (Bing/Yandex/Naver) | `src/lib/seo/indexnow.ts`, `/api/indexnow` | ✅ |
| **SerpAPI** | Google Maps aday keşfi | `src/lib/kesif/serpapi-maps.ts` | ✅ (BYOK) |
| **Serper** | Web arama fallback | `src/lib/kesif/serper-web.ts` | ✅ (BYOK) |
| **Google Places** | Text Search v1 çapraz kaynak | `src/lib/kesif/places.ts` | ✅ (BYOK) |
| **WhatsApp** | Giden **deep-link** (`wa.me`) — Cloud API YOK | `PaylasWhatsApp`, davet, opsiyon teyit | ✅ (deep-link); Cloud API Faz-2 |
| **fal.ai** | Görsel/kat planı üretimi (offline script) | `scripts/gen-*.mjs` | ✅ (script; runtime değil) |
| **Anthropic Claude** | Katalog içerik üretimi (offline script) + keşif skor | `scripts/katalog-uret.mjs` (`claude-sonnet-5`) | ✅ (script); runtime AI Faz-2 |
| **ElevenLabs / Publer / render** | Ses reel / oto-yayın / render (BYOK anahtar kasada) | `pazarlama_entegrasyon` | Anahtar alanı var; "sonraki faz" |
| **emlakjet** | Bölge benchmark scraping kaynağı (offline) | `scripts/emlakjet-envanteri/` | ✅ (offline) |
| Firebase/Clerk/Auth0/Stripe/iyzico/GA4/GTM/Sentry/PostHog/Mapbox/Twilio/SendGrid | — | YOK | ✗ (kodda yok; ödeme entegrasyonu hiç yok) |

**Ödeme altyapısı:** YOK — hiçbir ödeme sağlayıcı (Stripe/iyzico/LemonSqueezy) entegre değil. Abonelik geliri admin'de manuel; online ödeme/escrow bilinçli kapsam dışı ("sözleşmeye taraf olmayız").

## 5. WhatsApp ve paylaşım mantığı (§17 — KANITLI)

- **Mekanizma:** yalnız giden **deep-link** `https://wa.me/[num]?text=...` (emlakçı/admin kendi telefonundan; ücretsiz). Cloud API ile giden mesaj YOK (DEĞİŞMEZ #4 → Faz-2). Serbest-metin AI parse YOK.
- **`waNumara()`:** TR numara normalize.
- **Proje-genel paylaşım metni:** ad + konum + "N müsait daire · tipler" + "X'den başlayan fiyatlarla" (bu kart metni — fiyat basılır çünkü genel).
- **Birim paylaşım metni:** ad + daire/oda/m² + "Güncel fiyat ve detay: {shareUrl}" — **fiyat metne basılmaz** (WhatsApp cache'inde donar/eskir → DEĞİŞMEZ #2).
- **Tokenized link:** `/p/[emlakci]/[birim]/[token]`, HMAC-SHA256 16-hex, expire yok (statik türev), forge kalkanı.
- **PDF:** müşteri kataloğu `window.print()` (ayrı PDF motoru yok).
- **OG preview:** dinamik `opengraph-image.tsx` (fiyat/durum basmaz, donar diye), `robots: index:false`.
- **Tracking:** paylaşım/görüntüleme/katalog anonim `events` (danışman attribution `profile_id`; müşteri PII yok).
- **Consultant attribution:** `ilk_paylasan_id`/`atanan_id` lead'de.

## 6. E-posta akışları (§18)

Resend (`src/lib/mail.ts`, best-effort — anahtar yoksa sessiz atlar; `htmlKacir` XSS escape). Türler: kayıt onay, davet (üretici + keşif, İYS/ETK opt-out zorunlu cold-invite'ta), yeni tahsis, opsiyon talep/doğrulama/sonuç, lead, keşif takip. Şablonlar `mail-sablonlari/*.html` (davet, eposta-degisikligi, kayit-onay, magic-link, reauth, sifre-sifirlama) — Supabase auth + app markalı. Push/SMS **yok**.

## 7. Analytics ve dönüşüm takibi (§25)

- **Harici analytics YOK kodda:** GA4/GTM/Meta Pixel/PostHog/Mixpanel/Plausible/Vercel Analytics **entegre değil** (ÇIKARIM — src'de import yok; PostHog MCP oturumda var ama koda bağlı değil).
- **Yerel event sistemi (`events` tablosu) = birinci-parti analytics:** `paylasim, goruntuleme, lead, opsiyon(eylem: gecici/dogrudan/talep/satisa_donustu/vazgecildi/sure_doldu/dogrulandi), satis, fiyat, favori, odeme_hesap, katalog, acilis, ilgi, kurucu, dogrulama, abonelik, seo_yayin`. Bunlar talep radarı + güven skoru + fiyat geçmişi + denetimi besler.
- **CTA dönüşümü:** landing → `/kayit` (rol query); kurucu popup e-posta yakalama (`events tip='kurucu'`); mikrosite lead. Dönüşüm izleme birinci-parti (harici pixel yok). ÇIKARIM: reklam-attribution için harici analytics eklenmesi gerekebilir.

## 8. Veri kaynakları (§43)

- **Gerçek-zaman / near-real-time:** `birim` (Supabase Realtime), opsiyon durumu (RPC + trigger), lead (anlık insert).
- **Cron-güncellenen:** stale (günlük), planlı açılış (günlük), opsiyon süresi (günlük Vercel + 15dk pg_cron).
- **Manuel:** proje/stok/fiyat (üretici panel/Excel/concierge), tahsis, abonelik (admin).
- **Dış feed / scraped:** `katalog_proje` (offline `katalog-import.mjs`), `bolge-benchmark.json` (offline emlakjet), `aday` (keşif motoru — SerpAPI/Serper/Places + site kazıma).
- **Seed/mock:** `supabase/seed.sql` + `scripts/seed-*.mjs` (demo hesaplar/projeler; landing "Canlı Portföy" hardcoded MOCK).
