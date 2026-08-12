# KolaySEO — Çok-Kiracılı (Multi-Tenant) SaaS Mimarisi

> **Amaç:** Tek-kiracılı KolaySEO motorunu (skill `~/.claude/skills/kolayseo/`) satılabilir çok-kiracılı
> bir SaaS'a çevirmenin teknik tasarımı. **Eşlik:** `kolayseo-go-to-market.md` (satış), blueprint (kurulum).
> **Karar sahibi:** solo kurucu — tasarım basit, kanıt-önce, düşük operasyon yükü.

---

## 1. Topoloji kararı (en önemli mimari seçim)

SEO ürünlerinin klasik çatalı: programmatic sayfalar + robots/sitemap/llms.txt/schema **nerede yaşar?**

| Topoloji | Nasıl | Artı | Eksi |
|----------|-------|------|------|
| **B1 — Edge/reverse-proxy** | Müşteri DNS'i bize yönlenir; sayfaları biz edge'de serve ederiz | "Gerçek SaaS", müşteri kod yazmaz | Karmaşık, riskli (müşteri trafiğinin önünde durursun), altyapı ağır |
| **B2 — Subdomain hosting** | `seo.musteridomain.com` CNAME → bizde host | Sayfalar bizde, müşteri domain otoritesine kısmen akar | Subdomain otoritesi ana domain'den zayıf; CNAME kurulumu |
| **B3 — Kurulum-hizmet + agentless Command Center** ✅ | Programmatic/teknik SEO müşterinin KENDİ sitesine kurulur (tek-seferlik); Command Center merkezi SaaS dışarıdan çalışır | SEO değeri doğru yerde (müşteri domain'i) birikir; SaaS tarafı hafif; solo-uyumlu | Kurulum elle/skill ile (ama standartlaştırılabilir) |

**Seçim: B3.** Neden: SEO otoritesi müşterinin ana domain'inde birikmeli (blueprint §1 dersi). Edge-proxy
karmaşası solo için taşınamaz. B3, GTM §4'teki "Kurulum (hizmet) + Command Center (SaaS)" paketlemesiyle
birebir örtüşür.

## 2. ⭐ Kilit içgörü: Command Center AGENTLESS'tır

**Command Center (Katman 5) müşterinin sitesine kod koymadan çalışır.** Çünkü tüm veri kaynakları dışarıdan:

| Yetenek | Nasıl çalışır (müşteri sitesine dokunmadan) |
|---------|--------------------------------------------|
| Pozisyon + AI Overview tarama | SerpAPI müşteri domain'ini Google'da **dışarıdan** arar |
| Gerçek tık/gösterim/CTR | Müşteri **GSC OAuth** verir → API'den veri çekilir (Search Console erişim yetkisi, kod değil) |
| Site audit (orphan/duplicate/backlink) | OpenSEO/DataForSEO müşteri domain'ini **dışarıdan** tarar |
| Fırsat motoru | Tamamen toplanan SerpAPI verisinden türer (DB) |
| IndexNow dağıtım | Müşteri **sitemap.xml**'ini okur → URL'leri submit eder |

**Tek müşteri-tarafı gereksinim:** IndexNow için `public/<key>.txt` (tek satır token) — bu da opsiyonel
(müşteri Bing Webmaster'dan key alır ya da IndexNow kapatılır).

**Ürün sonucu:** Command Center'a abone olmak için **kurulum ŞART DEĞİL.** Herhangi bir siteye (kurulum
yapılmamış olsa bile) "domain + GSC yetkisi + izlenecek kelimeler" ile bağlanır. Bu:
- Onboarding'i dakikalara indirir (kod deploy yok),
- Command Center'ı **bağımsız satılabilir SaaS** yapar (Kurulum paketi olmadan da),
- Kurulum paketini "programmatic sayfa üretimi isteyenler" için upsell'e çevirir.

> Programmatic sayfa ÜRETİMİ (Katman 4) ise müşteri sitesine kod gerektirir → bu "Kurulum" paketi
> (tek-seferlik hizmet/skill). İki katman temiz ayrılır: **Katman 5 = agentless SaaS, Katman 4 = kurulum hizmeti.**

## 3. Tenant veri modeli

Mevcut tek-kiracılı tablolar (`arama_istihbarati`, `seo_findings`, `cron_heartbeats`) tenant-izole edilir.

```sql
-- Kiracı (müşteri sitesi)
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,                 -- panel URL'i /app/<slug>
  name text NOT NULL,
  domain text NOT NULL,                        -- izlenen site (KENDI_DOMAIN)
  gsc_site_url text,                           -- sc-domain:musteri.com (OAuth sonrası)
  plan text NOT NULL DEFAULT 'trial',          -- trial | solo | pro | agency
  status text NOT NULL DEFAULT 'active',       -- active | paused | churned
  serpapi_quota_month integer NOT NULL DEFAULT 200,   -- aylık sorgu tavanı (plan'a göre)
  scan_frequency text NOT NULL DEFAULT 'weekly',      -- weekly | biweekly (maliyet kontrolü)
  parent_tenant_id uuid REFERENCES public.tenants(id),-- white-label: ajans → son-müşteri
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Kim hangi kiracıya erişir (kullanıcı ↔ tenant, çok-çok)
CREATE TABLE public.tenant_members (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner',          -- owner | member | agency_admin
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Kiracı başına SEO konfigürasyonu (eskiden kod sabiti: SORGULAR/RAKIP_DOMAINS)
CREATE TABLE public.tenant_seo_config (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  sorgular jsonb NOT NULL DEFAULT '[]',        -- izlenen kelimeler (eski SORGULAR[])
  rakip_domains jsonb NOT NULL DEFAULT '[]',   -- izlenen rakipler (eski RAKIP_DOMAINS[])
  ticari_rakipler jsonb NOT NULL DEFAULT '[]', -- resmi/devlet hariç tutma listesi
  sitemap_url text,                             -- IndexNow + audit için
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Kiracı kimlik bilgileri (şifreli — GSC refresh token vb.)
CREATE TABLE public.tenant_credentials (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  gsc_refresh_token_enc text,                  -- OAuth refresh token (ŞİFRELİ saklanır)
  serpapi_key_enc text,                         -- opsiyonel: müşteri kendi key'i (yoksa merkez key)
  indexnow_key text,                            -- müşteri public/<key>.txt token'ı
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Mevcut tablolara tenant_id ekle + izolasyon:**
```sql
ALTER TABLE public.arama_istihbarati ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.seo_findings      ADD COLUMN tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.cron_heartbeats   ADD COLUMN tenant_id uuid;  -- tenant başına cron sağlığı (opsiyonel)
CREATE INDEX ON public.arama_istihbarati (tenant_id, sorgu, checked_at DESC);
CREATE INDEX ON public.seo_findings (tenant_id, status, severity, created_at DESC);
```

**RLS (kritik — veri sızıntısı riski):** service-role admin API'ler tenant_id'yi HER sorguda filtreler.
İleride kullanıcı-tarafı doğrudan Supabase erişimi açılırsa, RLS policy'si `tenant_members`'a bağlanır:
```sql
-- Örnek policy (kullanıcı JWT'siyle doğrudan okuma açılırsa):
CREATE POLICY tenant_read ON public.arama_istihbarati FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()));
```
> **MVP'de** tüm erişim service-role admin API üzerinden; her handler `requireTenantAccess(user, tenantId)`
> ile yetki doğrular + sorguya `.eq('tenant_id', tenantId)` ekler. RLS ikinci savunma hattı.

## 4. Per-tenant credential stratejisi

| Kaynak | Strateji | Neden |
|--------|----------|-------|
| **GSC** | Müşteri **OAuth** ile bağlar → refresh token şifreli saklanır | Müşterinin kendi verisi; SA-paylaşımı yerine OAuth = self-serve + güvenli |
| **SerpAPI** | **Merkez key + tenant kota** (varsayılan); isteyen kendi key'ini verir | Basit onboarding; maliyet kota ile kontrol |
| **IndexNow** | Müşteri kendi `public/<key>.txt` token'ı (opsiyonel) | Müşteri domain'inde doğrulama şart |
| **OpenSEO/DataForSEO** | Merkez key; tenant başına periyodik audit | Aylık, düşük frekans |

**Şifreleme:** `tenant_credentials.*_enc` alanları uygulama-seviyesi şifreleme (ör. libsodium/`crypto`
AES-GCM, anahtar env `TENANT_CRED_ENC_KEY`). Supabase Vault de kullanılabilir. **Ham token DB'de plaintext YOK.**

## 5. Cron fan-out + maliyet modeli

Tek-tenant cron (haftalık `collectAramaIstihbarati`) artık **tüm aktif tenant'lar üzerinde** döner:

```
/api/cron/arama-istihbarati (Pzt 04:00):
  tenants(status='active', scan due?) → her tenant için:
    tenant_seo_config.sorgular + rakip_domains yükle
    collectAramaIstihbarati(svc, tenantId, config)  → arama_istihbarati (tenant_id ile)
```

**Maliyet gerçeği (kritik):** SerpAPI maliyeti = **Σ(tenant × sorgu_sayısı × sıklık).** 100 tenant × 30
sorgu × haftalık = 3.000 SerpAPI çağrısı/hafta. Kontrol kaldıraçları:
- `serpapi_quota_month` (plan başına sorgu tavanı) — enforce et.
- `scan_frequency` (weekly/biweekly) — düşük plan seyrek tarar.
- **Batch + zaman yayma:** tüm tenant'ları tek cron çalışmasında tarama (Vercel maxDuration). Tenant'ları
  güne/saate yay (ör. tenant_id hash → hafta günü) ya da bir "iş kuyruğu" tablosu + `*/N dakika` worker cron.
- **Fiyat kademesi kota'yı karşılamalı** (GTM §5): abonelik > tenant değişken maliyeti.

> **Ölçek uyarısı:** Vercel cron 300sn sınırı; 50+ tenant'ta tek cron yetmez → **kuyruk deseni**:
> `scan_queue` tablosu + sık çalışan worker (her turda K tenant işler). MVP'de (≤20 tenant) basit döngü yeter.

## 6. Onboarding akışı (agentless — dakikalar)

```
1. Kaydol (e-posta/Google)  → users + ilk tenant (trial) + tenant_members(owner)
2. Domain gir               → tenants.domain + tenant_seo_config.sitemap_url
3. GSC bağla (OAuth)        → tenant_credentials.gsc_refresh_token_enc + tenants.gsc_site_url
                              (opsiyonel — yoksa SerpAPI-only fallback, blueprint §8.4)
4. İzlenecek kelimeler gir  → tenant_seo_config.sorgular (öneri: GSC'den top query auto-import)
                              + rakip_domains (öneri: SERP'ten otomatik çıkar)
5. İlk tarama tetikle       → collect (1 tenant) → ilk snapshot + ilk fırsat kuyruğu
6. Panel                    → /app/<slug>/dashboard : İstihbarat + Fırsat + Sağlık + GSC
```

**Time-to-value:** adım 5 sonunda müşteri ilk fırsat listesini görür (kurulum/deploy beklemeden). Bu, GTM
§9 "aktivasyon" metriğinin çıpası.

## 7. Billing + kota enforcement

- **Sağlayıcı:** global için Stripe / Lemon Squeezy / Paddle; TR için iyzico. Plan = `tenants.plan`.
- **Kota enforce noktaları:** cron collect (SerpAPI kotası), izlenen sorgu sayısı (plan tavanı), tenant
  sayısı (agency planı). Kota aşımında: cron o tenant'ı atlar + panelde "limit doldu, yükselt" nudge.
- **Trial → paid:** trial N gün / M tarama; bitince Command Center salt-okunur + upgrade CTA.
- **White-label (agency):** `parent_tenant_id` ile ajans altında son-müşteri tenant'ları; faturalama ajansa,
  kota ajans planından düşer. `role='agency_admin'` tüm alt-tenant'ları görür.

## 8. Routing + panel

- **Tenant-scoped route:** `/app/<tenantSlug>/...` (veya tenant-switcher + cookie'de aktif tenant).
- **Panel = tek sayfa, 4 kart** (blueprint §8.7 north-star korunur): İstihbarat + Fırsat Kuyruğu + Site
  Sağlığı & Bulgular + GSC. Her kart `?tenant=<id>` ile filtreli admin API çağırır.
- **Admin (senin) süper-paneli:** tüm tenant'lar, kota kullanımı, cron sağlığı, MRR — ayrı `/admin/tenants`.

## 9. Güvenlik (multi-tenant = veri sızıntısı riski yükselir)

- **Her admin API handler'ı `requireTenantAccess(user, tenantId)`** — kullanıcı bu tenant'ın üyesi mi?
  (tenant_members). Eksikse 403. **HER sorguya `.eq('tenant_id', tenantId)`** — tenant_id parametreyi
  ASLA client'a güvenme, session'dan/üyelikten türet.
- **RLS ikinci hat** (§3). Credential şifreli (§4). GSC OAuth scope minimal (`webmasters.readonly`).
- **Cron internal**: `Bearer CRON_SECRET`; tenant döngüsü service-role, kullanıcı context'i yok.
- **White-label izolasyon:** ajans son-müşteri verisini görür ama son-müşteriler birbirini GÖRMEZ
  (`parent_tenant_id` + role kontrolü).

## 10. Faz planı (MVP → ölçek)

**Faz 1 — Command Center SaaS MVP (agentless, ilk gelir)**
1. `tenants` + `tenant_members` + `tenant_seo_config` + `tenant_credentials` migration.
2. Mevcut tablolara `tenant_id` + index + `requireTenantAccess` gate.
3. `collect.ts`/`opportunities.ts`/`gsc` → tenant-parametrik (config DB'den, kod sabiti değil).
4. Onboarding akışı (§6) + GSC OAuth + kelime/rakip girişi.
5. Cron fan-out (basit döngü, ≤20 tenant) + kota enforce.
6. Tenant panel (`/app/<slug>`, 4 kart) + billing (trial→paid).
> Çıktı: kurulum yapmamış herhangi bir siteye Command Center satılabilir.

**Faz 2 — Kurulum entegrasyonu (upsell)**
7. Programmatic/teknik SEO kurulumunu skill fazlarıyla standartlaştır (Katman 1-4, müşteri sitesine).
8. Kurulum sonrası tenant'a "programmatic sayfa sayısı" + sitemap otomatik bağlanır.

**Faz 3 — Ölçek + white-label**
9. Cron kuyruk deseni (`scan_queue` + worker) — 50+ tenant.
10. Agency planı (`parent_tenant_id` + agency_admin paneli).
11. GEO ölçüm modülü (periyodik LLM-cevap örnekleme — "ChatGPT'de çıkıyor muyuz").

## 11. Skill/blueprint'ten delta (ne değişir, ne aynı kalır)

| Aynı kalır (motor) | Değişir (SaaS katmanı) |
|--------------------|------------------------|
| seo.ts, robots, sitemap, llms, schema, district-content, GEO | `siteConfig` → **per-tenant** (DB'den; runtime resolve) |
| collect/opportunities/gsc/findings/indexnow mantığı | Girdileri **tenant config'ten** alır (SORGULAR/RAKIP kod sabiti → DB) |
| Migration'lar (arama_istihbarati, seo_findings) | **+tenant_id** + yeni tenant/config/credential tabloları |
| Cron guard (CRON_SECRET) | Cron **tüm tenant'lar üzerinde fan-out** + kota |
| Admin API'ler | **requireTenantAccess** + tenant filtresi |
| Panel (4 kart, north-star) | **tenant-scoped** + billing + süper-admin |

> **Önemli:** Motorun kendisi (skill template'leri) neredeyse değişmez — sadece **konfigürasyon kaynağı**
> kod-sabitinden tenant-DB'ye taşınır ve cron çok-tenant döner. Bu, ürünleştirmeyi düşük-riskli yapar:
> kanıtlı motor korunur, üstüne ince bir multi-tenant kabuk geçirilir.

İlişkili: `kolayseo-go-to-market.md` · `kolayseo-seo-geo-kurulum-blueprint.md` · skill `~/.claude/skills/kolayseo/` · [[seo-command-center]]
