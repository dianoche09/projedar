# PROJEDAR — AI CONTEXT (tek parça sistem bağlamı)

> Bu metin, Projedar hakkında bir yapay zekaya verilebilecek yoğun ve kendine-yeter bağlamdır. Repo kod denetimiyle (2026-08-09, main branch) doğrulanmıştır. Çelişkide **kod-gerçeği** esastır. Gizli değerler yazılmamıştır.

---

## 1. Marka ve konumlanma

**Projedar** (domain **projedar.com**, repo `dianoche09/projedar`; eski ad **ProjePazar**, iç doküman dosya adlarında korunmuş) Türkiye'nin yeni konut projeleri için tasarlanmış, **çok-müteahhitli, üretici-kontrollü, canlı bir konut stoğu dağıtım ağıdır.** Wordmark "proje" (navy) + "dar" (teal); logo bir radar (proje + "-dar" + radar çağrışımı). Konumlanma cümlesi: "Türkiye'nin yeni konut satış dağıtım altyapısı: müteahhit stoğunu tek merkezden yönetir, her emlakçı yalnız kendine tahsisli daireyi canlı görür, komisyonsuz. Portal değil, satışın omurgası."

**Ne DEĞİL:** açık pazaryeri (Sahibinden/Topli), ilan portalı, tekil CRM (Novo), 3D/immersive stüdyo (Relata), broker. "Saf satış altyapısı; komisyona dokunmaz, sözleşmeye taraf olmaz." Kategori cümlesi: "Yeni konut projeleri için tahsisli canlı satış ağı" — sektörün güven protokolü.

**Marka tonu:** kurumsal, teknoloji-odaklı, sektör-içi, güven-ağırlıklı; iki dile ayrılır (müteahhit: kontrol/envanter/çift satış; emlakçı: kazanç/müşteri/paylaş). Kaçınılan diller (uygulanmış kurallar): çıplak "komisyon yok" → "kazancın %100'ü senin / Projedar pay almaz"; kıtlık/kontenjan vaadi yok; uzun tire yok; "bayat" yerine "güncel değil"; "kapalı" tek başına değil.

---

## 2. Çözülen problem ve çekirdek mekanizma

Bugün proje stoğu Excel/PDF/WhatsApp/telefon arasında dağınık ve eskidir; aynı daire farklı kanalda farklı fiyat; çift satış felaketi; kim-getirdi belirsizliği. Çekirdek değer: **"Bu daire hâlâ satılık mı, fiyatı ne?" sorusuna her an %100 doğru cevap.**

Çekirdek mekanizma dört parçadır:
1. **Tek doğru kaynak (`birim` tablosu):** her bağımsız bölümün fiyatı/durumu tek yerde; paylaşımda/katalogda/mikrositede canlı basılır, kopyalanmaz.
2. **Granüler tahsis (`tahsis` + RLS):** müteahhit kime/neyi/hangi şartla açacağını daire seviyesinde belirler; görünürlük tamamen Postgres RLS'e devredilmiş; emlakçı yalnız kendine tahsisliyi görür, `tahsis` satırını bile okumaz.
3. **DB seviyesi çift-satış kalkanı (`opsiyon_tek_aktif`):** bir birimde aynı anda tek aktif opsiyon (partial unique index); ödemeye bağlı değil, uygulama katmanına güvenmez.
4. **Veri yerçekimi (`events`):** her paylaşım/görüntüleme/lead/satış append-only iz zincirine yazılır; talep radarı + güven skoru + fiyat geçmişini besler; geçmişe doldurulamaz = asıl moat.

---

## 3. Roller ve panel ayrımı (DEĞİŞMEZ)

`rol` enum: `uretici, emlakci, ofis_yetkili, arsa_sahibi, marka_yetkili, admin`. Her rol AYRI panel görür (`src/lib/roller.ts`):
- **`uretici` (müteahhit) → `/uretici`** — Müteahhit Kokpiti (proje/stok/tahsis/opsiyon/fiyat/lead-sorgu/analitik).
- **`emlakci` → `/havuz`** — Emlakçı Havuzu (tahsisli canlı stok/paylaş/opsiyon/lead/eşleştir).
- **`admin` → `/admin`** — Platform işletmecisi (BİZ), **asla üretici değil**: gelir/hesap/doğrulama/denetim/büyüme. Stok/birim/fiyat düzenlemez.
- **`ofis_yetkili`, `marka_yetkili`, `arsa_sahibi` → `/havuz`** (Faz-1; ayrı konsol Faz-2).

**İki-mod ilkesi:** SIMPLE (dijitalleşmemiş Ü2/E2: WhatsApp + birkaç buton, concierge) ve PRO (Ü1/E1: tam panel). "Ü2/E2'yi tutan ürün Ü1/E1'i zaten tutar."

**Yetki:** iki-katman guard (route/layout + server-action `adminGuard`/sahiplik) + asıl kapı **Postgres RLS**. Multi-tenant baştan (`uretici_id` izolasyonu) — rakip müteahhit başka firmanın stoğunu/fiyatını göremez.

---

## 4. İş modeli ve gelir (komisyon yok = DEĞİŞMEZ)

**İlke:** komisyona dokunmadan yazılım/erişim/veriden gelir; sözleşmeye taraf olunmaz.
- **ERKEN (şu an):** ana gelir = **müteahhit anlaşması** (birebir B2B, Admin'de manuel); **emlakçı bedava** ("kazancın %100'ü senin"). 
- **SONRA:** emlakçı premium (Paylaşım Stüdyosu/içerik) + ofis/franchise SaaS abonelik + (opsiyonel) işlem ücreti.
- **Altyapı:** `abonelik_paketi` (hedef ofis/uretici/emlakci, fiyat/kota) + `abonelik` (tek-aktif) + admin CRUD + MRR hesabı hazır. Sabit/varsayılan fiyat yok; %100 admin-kontrollü.
- **Alınmayacak:** boost/vitrin geliri, komisyon escrow, işlem-başı ücret (yalnız takip), serbest-metin AI stok yazma.

---

## 5. Canlı stok, tahsis ve opsiyon mekaniği

**Hiyerarşi:** `proje → blok → daire_tipi` (şablon) → `birim` (blok_id, tip_id, kat, daire_no). Eklenti (otopark/depo) `birim.ana_birim_id` ile ana daireye bağlanır.

**Birim durumları (`birim_durum` enum):** `musait, opsiyonlu, satis_beklemede, satildi, stop, planli, kiralandi`. Üç net satış durumu karışmaz: **satılabilir** / **planlı** (`satisa_acilis` gelince cron açar) / **kalıcı satılamaz** (`sahiplik='arsa'` + `satilabilir=false`, arsa payı; havuzda görünür, satışa kapalı). Türler: `daire/ofis/dukkan/villa/depo/otopark`; işlem: `satilik/kiralik/satilik_kiralik/pay_satisi/satisa_kapali`; tapu: `kat_irtifaki/kat_mulkiyeti/arsa_tapusu/kocan/yok`.

**Kurulum:** üretici `/uretici/proje/yeni` 7-adım sihirbaz veya `/kurulum`: künye/imar → blok/tip → birim üretimi (`birimGenerator` tip×kat, şerefiye, cap 500) veya Excel import (xlsx, dry-run) → fiyat/ödeme planı (`odeme_plani jsonb`) → medya → tahsis → yayınla. Concierge (admin) Ü2 için stok girer.

**Tahsis alanları:** `kapsam jsonb {bloklar,katlar,tipler,turler,birimler}` (boş = sınırsız), `hedef_tip (herkes|ofis|danisman)`, `hedef_filtre {marka,il,ilce,uzmanlik}` (canlı segment), `komisyon_tip (yuzde|sabit|yok)` + `komisyon_deger`, `munhasir`, `kontenjan`, `fiyat_gorunur`, `bitis`. Görünürlük denklemi (SECURITY DEFINER `emlakci_proje_tahsisli`/`emlakci_birim_gorebilir` 6-arg): `demo` proje VEYA (KYC `belge_durumu='dogrulandi'` VE eşleşen aktif tahsis [herkes+segment | danisman=uid | ofis=current_ofis()] VE kapsam boyutları).

**Opsiyon (kilit) — üç yöntem (`proje.opsiyon_ayar.yontem`):**
- **dogrudan:** `opsiyon_al_dogrudan` RPC → anında kilit.
- **onay/talep_kod:** `opsiyonTalepGonder` → `opsiyon_talep` (bekleyen-tek unique) → müteahhit `opsiyon_talep_onayla` (FOR UPDATE).
- **geçici:** `opsiyon_al_gecici` → anında kilit ama `dogrulandi=false`, müşteri zorunlu + kota (düşük güven skoru → kota 1); müteahhit `opsiyon_dogrula`/`opsiyon_reddet`; doğrulama penceresi dolarsa cron serbest bırakır.

Opsiyon INSERT'i emlakçıya **kapalı** (RLS `with check(is_admin())`) → yalnız SECURITY DEFINER RPC'ler. **Çift-satış kalkanı:** `create unique index opsiyon_tek_aktif on opsiyon(birim_id) where durum in ('opsiyonlu','satis_beklemede')` + `opsiyon_birim_senkron` trigger + onay RPC `FOR UPDATE`. Durum makinesi: musait → opsiyonlu → satis_beklemede → (müteahhit onay) satildi / (red) musait; opsiyonlu → (kilit_bitis) musait; planli → (satisa_acilis) musait.

---

## 6. Paylaşım, lead ve müşteri çakışması

**Paylaşım:** emlakçı `/havuz/proje/[id]`'de her birim için `generateShareToken(emlakci,birim)` = HMAC-SHA256(`LEAD_SHARE_SECRET`) ilk 16 hex (fallback yok). WhatsApp **deep-link** (`wa.me`, emlakçı telefonundan, ücretsiz) ile imzalı mikrosite linki `/p/[emlakci]/[birim]/[token]` paylaşılır. **Fiyat WhatsApp metnine ve OG görseline basılmaz** (donar/eskir) — canlı yalnız linkin arkasındaki mikrositede.

**Mikrosite (`/p/...`):** en olgun sayfa; token geçersizse `notFound()`; veri `createAdminClient` (RLS-bypass, tek kapı token) ile; canlı fiyat, galeri, ödeme slider, fiyat trendi, benzer birimler, lead formu. Görüntüleme anonim `events` sinyali (`after()`, IP/PII yok, KVKK-safe). Dinamik OG (`opengraph-image.tsx`, fiyat basmaz), `robots: index:false`.

**Lead:** `/api/lead` public; HMAC token + Zod + `kvkk: z.literal(true)` (ayrı boş açık-rıza checkbox, İlke Kararı 2026/347) + telefon normalize + aynı telefon×birim 10dk throttle (429). Lead `atanan_id=ilk_paylasan_id=emlakci`. Emlakçıya `/havuz/leadler`'e düşer + bildirim. RLS `lead_select` = admin/atanan/ilk_paylaşan.

**Müşteri çakışması / kim-getirdi:** platform **sahiplik garanti etmez, arbitraj yapmaz.** Danışman lead kaydeder (`telefon_norm`); müteahhit `/uretici/lead-sorgu`'da ad/telefon **birebir sorgulayınca** "ilk kaydeden danışman"ı görür — toplu liste yok, müteahhit lead feed'i görmez. "İlk bayrağı ben diktim" = `ilk_paylasan_id`. Süre-tabanlı koruma yok; uyuşmazlık taraflar arası.

---

## 7. Güven, doğrulama, tazelik

- **Üretici doğrulama:** `uretici.dogrulanmis` (admin) → "Doğrulanmış Üretici" rozeti. **Proje:** `proje.belge_dogrulandi` + `proje_belge`.
- **Emlakçı KYC:** `kullanici_belge` (mesleki_yeterlilik/vergi_levhasi) → `kyc-belge` private bucket (own-folder RLS) → admin `/admin/basvurular` (imzalı URL 1sa, AI ön-tarama `ai_sonuc`, e-Devlet manuel doğrulama) → `belge_durumu=dogrulandi/red`. Trigger `belge_durumu_guard` non-admin'in kendini doğrulamasını engeller.
- **Tazelik (DEĞİŞMEZ #5):** `birim.son_guncelleme`; UI "X önce" + 4-kademe rozet (0-24sa yeşil, 1-7g teal, 7-15g amber, 15g+ gri); günlük cron `freshnessCalistir` 15g eskiyi `stale=true`.
- **Güven skoru:** DB RPC `emlakci_skor`/`muteahhit_skor` (yanıt 30/SLA 25/doğrulama 25/tazelik 20); `<3 işlem → "Yeni"`; düşük-skor emlakçının geçici opsiyon kotası 1; admin `/admin/guven` komuta tabloları.

---

## 8. Teknik mimari

**Stack:** Next.js 16.2.9 (App Router, TS strict, `next build --webpack`) + React 19.2 + Tailwind v4 (CSS-first `@theme`) + Supabase (Postgres + Auth + Realtime + Storage + **RLS her tabloda**) + Vercel (serverless + cron, region syd1) + serwist PWA. Leaflet+OSM harita, Resend mail, `xlsx`, `zod`, `motion`, `lucide-react`. Harici state lib / test framework / ödeme sağlayıcı / harici analytics (GA4/PostHog/pixel) **YOK**.

**Supabase istemcileri:** browser (anon), server (anon+cookie), service-role (`createAdminClient`, RLS-bypass, **yalnız server** — `NEXT_PUBLIC` değil, bundle'a girmez). Görünürlük SECURITY DEFINER fonksiyonlarında; `events`/`bildirim` INSERT yalnız service-role (RLS insert politikası yok).

**Auth:** Supabase e-posta/parola; `src/proxy.ts` (Next 16 middleware) her istekte `getUser()` (server doğrular), korumalıyı `/login`'e, pasif/onay-bekleyeni `/hesap-bekliyor`'a; `/api` proxy'den muaf (kendi auth'u). Kayıt → `handle_new_user` trigger → `durum='onay_bekliyor'` → admin onay → `panelYolu(rol)`.

**Cron:** Vercel `/api/cron` günlük 03:00 UTC, dispatcher `opsiyon_suresi → stok_acilis → freshness → kesif_followup`; ayrıca pg_cron 2 job `*/15dk` (opsiyon serbest-bırak/hatırlat). Cron auth fail-closed (`CRON_SECRET`).

**Veri modeli:** 25 tablo, 14 enum, 2 bucket. Ana tablolar: `profiles, ofis, uretici, proje, blok, daire_tipi, birim, tahsis, opsiyon, opsiyon_talep, lead, events, proje_belge, mahal, kullanici_belge, abonelik_paketi, abonelik, fiyat_kurali, bildirim, lansman, katalog_proje, pazarlama_entegrasyon, kesif_kampanya, aday, aday_temas, hesap_silme_talebi`. DB-kalkanı deseni tutarlı (partial-unique/CHECK: çift-satış, bekleyen-talep, tek-abonelik, tek-silme, aday-dedup, abonelik-XOR). `supabase-schema.sql` (kök) bilinçli eski; canlı = kök + `db/*.sql` (27 migration).

---

## 9. Public yüzeyler, SEO/GEO

**Public/private ayrımı:** paneller (havuz/uretici/admin) + mikrosite robots disallow/noindex. Public index: `/`, `/muteahhit`, `/emlakci`, `/guven`, `/proje/[slug]` (ince-içerik eşiği ≥5), `/konut-projeleri/[[...dilim]]` (il/ilçe hub). **Canlı stok sayısı ve fiyat public'te GÖSTERİLMEZ** (rekabet bilgisi; yalnız danışman paneli/mikrosite).

**`/proje/[slug]`:** ISR 3600s, çift kaynak (kendi DB `public_slug` + kazınan `katalog_proje`), thin-content varyant motoru (genel B2B cümleler, uydurma proje verisi değil), JSON-LD ApartmentComplex+FAQ+Breadcrumb, "temsili görsel" AI-üretim.

**SEO altyapı:** `robots.ts` (31 AI crawler explicit allow), dinamik eşik-filtreli `sitemap.ts`, `public/llms.txt`+`llms-full.txt`, dosya-tabanlı dinamik OG, IndexNow (Bing/Yandex/Naver), Content-Signal + RFC-8288 Link header, kapsamlı JSON-LD (Organization/WebSite/SoftwareApplication/Service/FAQPage). **Blog/içerik altyapısı YOK** (sektörel SEO/GEO sayfaları için planlı).

---

## 10. Büyüme motoru (Keşif) ve regülasyon

**Keşif (`src/lib/kesif` + `/api/admin/kesif`):** admin BYOK anahtarlarıyla (SerpAPI Maps + Serper web + Google Places) müteahhit/proje/ofis/emlakçı adayı keşfeder, siteden e-posta kazır (UA `ProjedarBot/1.0`), `aday` tablosuna dedup'lu yazar (`firma_adi_norm,il`), Resend mail + WhatsApp deep-link ile davet eder, takip cron'u yürütür. Opt-out reaktif (`/api/kesif/cikis`). KVKK incelemesi önerilir (iş-iletişim verisi rıza öncesi).

**Regülasyon:** EİDS (1 Şubat 2026 zorunlu) — Projedar "ilan değil, tahsis" kapalı-devre konumu (açık ilan yok, birebir/WhatsApp; off-plan muaf). KVKK: ayrı açık rıza, veri minimizasyonu, "piyasa zekâsı evet müşteri profili hayır", `hesap_silme_talebi`. Taşınmaz ticareti: KYC belge. **Hukuki sayfalar (gizlilik/kullanım/kvkk) TASLAK, avukat incelemesi bekliyor.** Dijital aracılık sözleşmesi + claim sertifikası Faz-2.

---

## 11. Mevcut durum, bilinen eksikler, roadmap

**Çalışan (canlı, gerçek-veri):** 3 rol paneli, kurulum+Excel+tahsis+opsiyon(3 yöntem)+dalga+Realtime+mikrosite+katalog+lead+tazelik+güven skoru+KYC+admin gelir/denetim+BYOK+Keşif+SEO/GEO+PWA. Landing "Canlı Portföy"/sayaçlar bilinçli MOCK ("örnek akış").

**Bilinen eksikler:** WhatsApp Cloud API (deep-link'te), hakediş defteri, claim sertifikası, dijital sözleşme, EOI, semantik eşleştirme, dinamik fiyat otomasyonu (`fiyat_kurali` boş), dağıtık rate-limit, otomatik test, blog/içerik altyapısı, public `/hesap-silme`. Teknik borç: geçici debug leak (`havuz/actions.ts:91-95`), talep-radari ölçek limiti, plaintext BYOK anahtarlar, tasarım token istisnaları, latin-ext font eksiği.

**Roadmap sinyalleri:** WhatsApp otomasyonu + AI parse, dinamik fiyat, Paylaşım Stüdyosu, ofis/marka/arsa konsolları, yurtdışı projeler (şema kolonları boş), pgvector AI search, Identity Graph, finansal katman (fiyat/talep endeksi → yatırım platformu), Frankfurt migration. Kapsam dışı (DEĞİŞMEZ): 3D stüdyo, tam CRM/ERP, online ödeme/escrow, B2C açık ilan portalı.

---

## 12. Kritik terminoloji (kod ↔ UI)

uretici=müteahhit/üretici · emlakci=emlakçı/danışman · ofis=emlak ofisi · admin=platform işletmecisi(biz) · proje/blok/daire_tipi=şablon · **birim=bağımsız bölüm=stok=tek doğru kaynak** · tahsis=allocation(görünürlük) · opsiyon=kilit/hold · opsiyon_talep=onay isteği · lead=müşteri adayı · lansman=kampanya · şerefiye=kat/manzara fiyat farkı · tazelik=son_guncelleme/stale · ilk_paylasan_id=kim getirdi · aday=keşif prospect'i · kapsam=tahsis boyutu · events=iz zinciri/audit(ayrı denetim tablosu yok).

---

## 13. Bir AI'nın Projedar üzerine çalışırken uyması gereken DEĞİŞMEZLER

1. **RLS-önce** — görünürlük tahsis+RLS'te; client'tan service-role YOK.
2. **Tek doğru kaynak** — fiyat/durum yalnız `birim`'de; kopya yok; paylaşımda canlı basılır; metne/OG'ye fiyat basma.
3. **Çift-satış kalkanı DB'de** — `opsiyon_tek_aktif`; uygulama katmanına güvenme.
4. **WhatsApp yalnız deep-link** (MVP); serbest-metin AI parse ile stoğa yazma YASAK (Faz-2).
5. **Tazelik görünür** — `son_guncelleme=now()` her yazışta; stale rozet.
6. **Mobil-önce + PWA.**
7. **Komisyon YOK** — çıplak "komisyon yok" deme, "kazancın %100'ü senin".
8. **admin ≠ üretici** (platform işletmecisi).
9. Yeni özellik kapsam-disiplini testinden geçmeli ("canlı stok+üretici kontrolü+güven+dağıtım mı, yoksa CRM/ERP/3D mi?"); çelişkide bağlayıcı kaynak `ProjePazar-Sistem-Kurallari.md` + kod.
10. Migration'lar browser Supabase SQL Editor'den uygulanır (MCP/CLI bu projede Unauthorized); `db/` altına yaz, kullanıcıya kopyalanır SQL bloğu ver.
