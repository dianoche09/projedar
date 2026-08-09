# 00 — MASTER PROJEDAR IDENTITY

> Kaynak: repo kod denetimi (2026-08-09, main) + bağlayıcı dokümanlar (`ProjePazar-Sistem-Kurallari.md`, `Projedar-Urun-Referansi.md`, `ProjePazar-Sentez-Karar-Raporu.md`, `ProjePazar-Tasarim-Ruhu.md`).
> Kanıt etiketleri: **KANITLI** (koddan doğrulandı) · **ÇIKARIM** (dolaylı sonuç) · **MOCK** (bilinçli demo veri) · **TODO** · **ESKİ/DRIFT** (doküman↔kod uyumsuzluğu).
> Gizli değerler (secret/anahtar) hiçbir yerde yazılmadı; yalnız varlıkları ve amaçları belirtildi.

---

## 1. EXECUTIVE SUMMARY

**Projedar nedir?** Çok-müteahhitli, üretici-kontrollü, **canlı bir konut stoğu dağıtım ağı**. Bir inşaat firması (müteahhit/"üretici") yeni konut projesinin stoğunu, fiyatını, satış durumunu ve dağıtımını tek merkezden yönetir; bağımsız gayrimenkul danışmanı ("emlakçı") yalnız kendisine **tahsis edilmiş** birimleri tek canlı havuzdan görür, tek tıkla WhatsApp'tan paylaşır ve gelen müşteri adaylarını (lead) toplar. Ortada **tek doğru kaynak** durur: bir fiyat/durum değişince yetkili tüm danışmanlara anında yansır. (KANITLI — `src/app/uretici/*`, `src/app/havuz/*`, `birim` tablosu.)

**Kime hizmet ediyor?** İki taraflı B2B: (a) yeni proje üreten kurumsal + geleneksel müteahhitler, (b) bağımsız emlak danışmanları / ofisleri / markaları. Alıcı (son kullanıcı) sisteme **giriş yapmaz**; yalnız danışmanın paylaştığı imzalı mikrosite linkini (`/p/[emlakci]/[birim]/[token]`) anonim görür ve lead formu doldurabilir. (KANITLI.)

**Çözdüğü temel problem:** "Bu daire hâlâ satılık mı, fiyatı ne?" sorusuna her an %100 doğru cevap. Bugünün gerçeği: stok Excel/PDF/WhatsApp gruplarında dağınık ve eski; aynı daire farklı kanalda farklı fiyat; çift satış felaketi; kim getirdi belirsizliği. Projedar bunu tek canlı kayıt + granüler tahsis + DB seviyesi çift-satış kilidi + görünür tazelik ile çözer.

**Merkezindeki mekanizma:** `tahsis` (allocation) → RLS ile görünürlük + `birim` (tek doğru fiyat/durum) + `opsiyon` (DB partial-unique-index çift-satış kilidi) + `events` (append-only iz zinciri / veri yerçekimi).

**Kategori — ne olduğu / olmadığı:**
- **Öyle:** B2B satış-dağıtım altyapısı / kapalı devre network / stok dağıtım sistemi + hafif SaaS.
- **Değil:** açık pazaryeri (Sahibinden/Topli değil), ilan portalı değil, tekil CRM (Novo/Yapısoft) değil, 3D/immersive stüdyo (Relata) değil, broker değil. "Saf satış altyapısı; komisyona dokunmaz, sözleşmeye taraf olmaz." (KANITLI — kod ve tüm landing copy'si bu çerçeveyi tutar.)

**Değer önerisi — müteahhit:** Stoğun tek canlı kayıtta; kime/neyi/hangi şartla satacağını sen belirlersin (granüler tahsis = kontrol kaybı korkusuna doğrudan cevap); çift satış yapısal olarak imkânsız (DB kilidi); "kim getirdi" iz zinciri; syndication (%zam saniyeler içinde tüm ağa); rakip müteahhit stoğunu/fiyatını göremez (satır-seviye RLS izolasyonu).

**Değer önerisi — danışman:** Tüm yetkili projeler tek ekranda, canlı fiyat/durum, tazelik damgası ("2 saat önce"); tamamen ücretsiz, "kazancın %100'ü senin, Projedar pay almaz"; imzalı mikrosite + müşteri kataloğu; lead senin.

**En önemli farklılaştırıcılar (moat = kombinasyon, tek özellik değil):** (1) çok-müteahhit tek canlı ortak havuz, (2) daire-seviyesi emlakçı-bazlı tahsis (RLS ile gizli görünürlük), (3) DB seviyesi ödemesiz çift-satış kalkanı (`opsiyon_tek_aktif` partial unique index), (4) komisyonsuz, (5) veri yerçekimi (`events` Faz-1'den birikir, geçmişe doldurulamaz), (6) WhatsApp/concierge ile dijitalleşmemiş küçük müteahhit erişimi, (7) Türkiye'ye özel (kat karşılığı arsa payı, koçan/KKTC, Türkçe-önce, EİDS kapalı-devre kalkanı).

**Bugün çalışan ürün (KANITLI — hepsi canlı, projedar.com):** 3 rol paneli (üretici kokpiti, emlakçı havuzu, admin), proje/blok/tip/birim kurulum sihirbazı + Excel import, granüler tahsis CRUD, opsiyon 3-yöntem (dogrudan/onay/geçici) + DB çift-satış kalkanı, planlı stok açılış (dalga), Supabase Realtime canlı fiyat listesi, imzalı paylaşım mikrositesi + müşteri kataloğu (print/PDF), KVKK-uyumlu lead akışı, tazelik sigortası cron'u, güven skoru RPC'leri, KYC belge doğrulama, admin gelir/hesap/denetim, BYOK pazarlama anahtar kasası, **Keşif** büyüme motoru (SerpAPI/Serper/Places ile aday keşfi + davet), SEO/GEO altyapısı (robots 31 AI crawler, sitemap, llms.txt, dinamik OG, `/proje/[slug]` + `/konut-projeleri` public SEO sayfaları), PWA (serwist).

**Planlanmış ama tamamlanmamış (Faz 2 — bilinçli sınır, TODO değil):** WhatsApp Cloud API ile giden mesaj (MVP = yalnız deep-link), serbest-metin AI parse ile stoğa yazma, dinamik fiyat otomasyonu (`fiyat_kurali` tablosu var, iş mantığı yok), Paylaşım Stüdyosu premium, arsa sahibi/marka konsolları (rol şemada var, ayrı panel yok), yurtdışı projeler (döviz/golden-visa/oturum kolonları şemada boş), hakediş defteri, müşteri-claim sertifikası, semantik/LLM eşleştirme.

**Kod-gerçeği vs pazarlama-iddiası ayrımı:** Landing iddialarının neredeyse tamamının backend karşılığı mevcut (§48 tablosu). Tek dikkat: ana sayfadaki "Canlı Portföy" kartları ve hero sayaçları **bilinçli demo veridir** (MOCK, "örnek akış" etiketli), DB-bağlı değildir; gerçek canlı veri yalnız panellerde ve mikrositede.

---

## 2. MASTER PRODUCT TRUTH (kanıtlı, 40 madde)

Aşağıdaki her madde koddan doğrulanmıştır ve başka bir yapay zekaya sistem bağlamı olarak verilebilir.

1. Ürün adı **Projedar**, domain **projedar.com**; eski ad **ProjePazar** (iç doküman dosya adlarında korunmuş). (KANITLI — `layout.tsx metadataBase`, `package.json name:"projedar"`.)
2. Stack: **Next.js 16.2.9 (App Router, TS strict) + React 19.2 + Tailwind v4 + Supabase (Postgres+Auth+Realtime+Storage+RLS) + Vercel + serwist PWA.** Build `next build --webpack`. (KANITLI — `package.json`, `next.config.ts`.)
3. Üç rol paneli ve **ayrı yüzeyler**: `uretici`→`/uretici`, `emlakci`→`/havuz`, `admin`→`/admin`. `ofis_yetkili/marka_yetkili/arsa_sahibi` şu an `/havuz`'a yönlenir (ayrı panel Faz-2). (KANITLI — `src/lib/roller.ts`.)
4. **admin = platform işletmecisi (BİZ), asla üretici değil.** Admin paneli stok/birim/fiyat düzenlemez; gelir/hesap/doğrulama/denetim yapar. (KANITLI — `src/app/admin/*`, footer copy.)
5. **DEĞİŞMEZ #1 — RLS önce:** görünürlük tamamen Postgres RLS'e devredilmiş; `tahsis` tablosu + SECURITY DEFINER fonksiyonlar (`emlakci_proje_tahsisli`, `emlakci_birim_gorebilir` 6-arg) belirler. Emlakçı `tahsis` satırını doğrudan okumaz. (KANITLI — `db/*.sql`.)
6. **Service-role (`SUPABASE_SERVICE_ROLE_KEY`) yalnız server/cron/route'ta**; `NEXT_PUBLIC` değil → client bundle'a girmez. Browser yalnız anon key. (KANITLI — `src/lib/supabase/{client,server,admin}.ts`.)
7. **DEĞİŞMEZ #2 — Tek doğru kaynak:** fiyat/durum yalnız `birim` tablosunda; paylaşımda/katalogda/mikrositede fiyat canlı değerden basılır, kopyalanmaz. WhatsApp metnine ve OG görseline fiyat **basılmaz** (donar/eskir diye). (KANITLI — `DaireModal.tsx`, `opengraph-image.tsx`.)
8. **DEĞİŞMEZ #3 — Çift-satış kalkanı DB'de:** `create unique index opsiyon_tek_aktif on opsiyon (birim_id) where durum in ('opsiyonlu','satis_beklemede')`. İkinci opsiyon INSERT'i 23505 unique_violation alır. Onay RPC'lerinde `FOR UPDATE`. (KANITLI — `supabase-schema.sql:188-190`, RPC'ler.)
9. Opsiyon INSERT'i emlakçıya **kapalı** (RLS `with check(is_admin())`); opsiyon yalnız SECURITY DEFINER RPC'lerle oluşturulur: `opsiyon_al_dogrudan`, `opsiyon_al_gecici`, `opsiyon_talep_onayla`. (KANITLI — `db/2026-06-29_opsiyon-talep-onay.sql`.)
10. Üç opsiyon yöntemi, proje bazında (`proje.opsiyon_ayar.yontem`): **dogrudan** (anında kilit), **onay/talep_kod** (müteahhit onayına düşer), **geçici** (anında kilitlenir ama `dogrulandi=false`, müşteri zorunlu + kota; müteahhit doğrular/reddeder, süre dolarsa cron serbest bırakır). (KANITLI.)
11. **DEĞİŞMEZ #4 — WhatsApp hibrit:** MVP yalnız giden **deep-link** (`wa.me/...`, emlakçı/admin kendi telefonundan). Cloud API ile giden mesaj ve serbest-metin AI parse = Faz 2. Kodda WHATSAPP/ANTHROPIC env'i yok. (KANITLI.)
12. **DEĞİŞMEZ #5 — Tazelik görünür:** `birim.son_guncelleme`; UI'da "X önce" + 4-kademe rozet; 15 günden eski → `stale=true` (günlük cron `freshnessCalistir`). (KANITLI — `cron/_lib/isler.ts`.)
13. **DEĞİŞMEZ #6 — Mobil-önce + PWA:** serwist SW (NetworkFirst navigations), `public/manifest.json` standalone, bottom-nav, ≥44px dokunma hedefleri. (KANITLI.)
14. Vercel cron: tek path `/api/cron`, günde bir **03:00 UTC**, region `syd1`; dispatcher sırası `opsiyon_suresi → stok_acilis → freshness → kesif_followup`. (KANITLI — `vercel.json`, `cron/route.ts`.)
15. Ayrıca **pg_cron** (DB içi) iki iş `*/15 * * * *`: `opsiyon-serbest-birak`, `opsiyon-hatirlat` (saat-granüllü opsiyon yaşam döngüsü). (KANITLI — `db/2026-08-05_opsiyon-yasam-dongusu.sql`.)
16. Veri modeli: **25 tablo, 14 enum, 2 storage bucket** (`proje-medya` public, `kyc-belge` private). (KANITLI.)
17. Çekirdek enum `birim_durum`: `musait, opsiyonlu, satis_beklemede, satildi, stop, planli, kiralandi`. (KANITLI.)
18. `birim_tur`: `daire, ofis, dukkan, villa, depo, otopark`; `islem_tipi`: `satilik, kiralik, satilik_kiralik, pay_satisi, satisa_kapali`; `tapu_durum`: `kat_irtifaki, kat_mulkiyeti, arsa_tapusu, kocan, yok`. (KANITLI.)
19. Üç net satış durumu birbirine karışmaz: **satılabilir** / **planlı** (`satisa_acilis` gelince cron açar) / **kalıcı satılamaz** (`sahiplik='arsa'` + `satilabilir=false`, arsa sahibi payı; havuzda görünür, satışa kapalı). (KANITLI.)
20. Eklenti birimler (otopark/depo) `birim.ana_birim_id` ile ana daireye bağlanır; KPI/tahsis hesaplarında `ana_birim_id IS NULL` filtresiyle hariç. (KANITLI.)
21. `tahsis` alanları: `kapsam jsonb {bloklar,katlar,tipler,turler,birimler}`, `hedef_tip (herkes|ofis|danisman)`, `hedef_id`, `hedef_filtre {marka,il,ilce,uzmanlik}` (canlı segment tahsisi), `komisyon_tip (yuzde|sabit|yok)`, `komisyon_deger`, `munhasir`, `kontenjan`, `fiyat_gorunur`, `bitis`. (KANITLI.)
22. Görünürlük denklemi: `demo` proje VEYA (KYC `belge_durumu='dogrulandi'` VE eşleşen aktif tahsis [herkes+segment-filtre | danisman=uid | ofis=current_ofis()] VE kapsam boyutları). (KANITLI — `emlakci_proje_tahsisli`.)
23. **Komisyon = yok (DEĞİŞMEZ).** Üretici tahsiste komisyon oranı/sabit tanımlayabilir (danışman kendi kazancını görür, başkasınınkini görmez — RLS); platform işlemden pay almaz. (KANITLI.)
24. Gelir modeli (fazlı): **ERKEN = müteahhit anlaşması (ana gelir, Admin'de manuel) + emlakçı bedava.** SONRA = emlakçı premium, ofis/franchise SaaS abonelik. `abonelik`/`abonelik_paketi` tabloları + admin CRUD var; MRR admin dashboard'da hesaplanır. (KANITLI.)
25. Paylaşım güvenliği: `generateShareToken` = HMAC-SHA256(`emlakci:birim`, `LEAD_SHARE_SECRET`) ilk 16 hex; **fallback yok** (env eksikse throw). Mikrosite token geçersizse `notFound()`. (KANITLI — `src/lib/sharing.ts`.)
26. Mikrosite (`/p/...`) verisi `createAdminClient` (RLS-bypass, server-only) ile çekilir; tek kapı HMAC token; görüntüleme anonim `events` sinyali (`after()`, PII/IP yok, KVKK-safe). (KANITLI.)
27. Lead: `/api/lead` public; HMAC token + Zod + `kvkk: z.literal(true)` (zorunlu ayrı açık rıza, boş checkbox) + telefon normalize + aynı telefon×birim 10 dk throttle (429). Lead `atanan_id=ilk_paylasan_id=emlakci`. (KANITLI.)
28. Lead görünürlüğü: RLS `lead_select` = admin VEYA atanan VEYA ilk_paylaşan; **müteahhit lead feed'i görmez** — yalnız `/uretici/lead-sorgu`'da ad/telefon birebir sorgu ile "ilk kaydeden danışman"ı görür (kim-getirdi görünürlüğü, sahiplik garantisi değil). (KANITLI — `db/2026-07-24_lead-select-rls.sql`.)
29. `events` append-only; INSERT RLS politikası yok → yalnız SECURITY DEFINER + service-role yazar. Ayrı `denetim` tablosu yoktur; iz zinciri = `events` + `opsiyon.karar_*` + `profiles.onaylayan_id`. (KANITLI.)
30. Güven skorları DB'de hesaplanır: RPC `emlakci_skor`, `muteahhit_skor` (+`*_tablo`); ağırlık yanıt 30 / SLA 25 / doğrulama 25 / tazelik 20; `<3 işlem → "Yeni"`. Düşük skorlu emlakçının geçici opsiyon kotası 1'e düşer. (KANITLI — `db/2026-08-05_guven-skoru.sql`.)
31. KYC: `kullanici_belge` (mesleki_yeterlilik/vergi_levhasi), `kyc-belge` private bucket (8MB, own-folder RLS), `ai_sonuc jsonb` (AI ön-tarama), `profiles.belge_durumu` (yok/beklemede/dogrulandi/red); trigger `belge_durumu_guard` non-admin'in kendini "dogrulandi" yapmasını engeller. (KANITLI.)
32. **Keşif motoru** (`src/lib/kesif` + `/api/admin/kesif`): admin BYOK anahtarlarıyla SerpAPI Maps + Serper web + Google Places'ten müteahhit/proje/ofis/emlakçı adayı keşfeder, siteden e-posta kazır, `aday` tablosuna dedup'lu yazar, Resend mail + WhatsApp deep-link ile davet eder; opt-out reaktif (`/api/kesif/cikis`). (KANITLI.)
33. Public SEO: `/proje/[slug]` (ISR 3600s) çift kaynak (kendi DB `public_slug` + kazınan `katalog_proje`); ince-içerik eşiği (`projeIcerikSkoru < 5 → notFound`); **canlı stok sayısı ve fiyat public'te GÖSTERİLMEZ** (rekabet bilgisi). `/konut-projeleri/[[...dilim]]` il/ilçe hub. (KANITLI.)
34. SEO altyapısı: `robots.ts` (31 AI crawler explicit allow; panel/mikrosite/mockup/sunum disallow), dinamik `sitemap.ts` (eşik-filtreli), `public/llms.txt`+`llms-full.txt`, dosya-tabanlı dinamik OG (`opengraph-image.tsx`), IndexNow (Bing/Yandex/Naver). (KANITLI.)
35. Tasarım sistemi **"Spatial Açık"** (kilit 2026-06-28); tokenlar `globals.css @theme`; sinyal trio kesin: müsait `#2fb36b` / opsiyon `#e3a12c` / satıldı `#d15a4e`. Kullanıcı-değiştirilebilir dark mode yok. Fontlar Outfit/Inter/Geist Mono. (KANITLI.)
36. Auth: Supabase e-posta/parola; `src/proxy.ts` (Next 16 middleware) oturumu tazeler, korumalı rotaları `/login`'e, pasif/onay-bekleyeni `/hesap-bekliyor`'a yönlendirir; `/api` proxy'den muaf (her route kendi auth'unu yapar). Kayıt → `handle_new_user` trigger → `durum='onay_bekliyor'` → admin onayı. (KANITLI.)
37. E-posta: Resend (transactional, best-effort; anahtar yoksa sessiz atlar) + markalı şablonlar (`mail-sablonlari/`, Supabase auth şablonları). SMS/push yok. (KANITLI.)
38. Bölge fiyat benchmark'ı: `src/data/bolge-benchmark.json` (kaynak emlakjet, ₺/m² giriş medyanı, 14 il / 47 ilçe); üretici stok kurulumunda rozet olarak; fiyatı asla override etmez (DEĞİŞMEZ #2). (KANITLI.)
39. `supabase-schema.sql` (kök) **bilinçli olarak eski**; canlı gerçek = kök şema + tüm `db/*.sql` migration'ları. Çelişkide `db/*.sql` kazanır. (KANITLI — dosya başı uyarısı + çapraz karşılaştırma.)
40. DB-kalkanı kültürü tutarlı: partial-unique/CHECK ile çift-satış (`opsiyon_tek_aktif`), bekleyen-talep tekilliği, tek-aktif-abonelik, tek-açık-silme-talebi, aday dedup, abonelik XOR — hiçbirinde uygulama katmanına güvenilmez. (KANITLI.)

---

## 3. PROJEDAR'IN GERÇEK ÜRÜN DURUMU (§48)

### A. Production-ready ve gerçekten çalışan
- Üretici paneli: kokpit, projeler, proje detay, kurulum sihirbazı (7 adım), stok tablosu + bina kesiti, tahsis CRUD, opsiyonlar onay/doğrulama kuyruğu, tahsis genel bakış, talep radarı, fiyat önerisi, raporlar, lead-sorgu, lansman, davet, bildirimler, ayarlar (firma profili). (KANITLI — tümü real Supabase, mock yok.)
- Emlakçı havuzu: havuz liste + filtre + harita (Leaflet), proje detay + Realtime canlı stok, opsiyonlarım, paylaştıklarım, leadler, eşleştir, lansman radarı, bildirimler, doğrulama (KYC), profil, müşteri kataloğu.
- Mikrosite `/p/[emlakci]/[birim]/[token]` (en zengin/olgun sayfa): canlı fiyat, galeri, ödeme slider, fiyat trendi, lead formu, anonim sinyaller, dinamik OG.
- Admin: dashboard/MRR, başvurular (onay+KYC birleşik), kullanıcılar, üreticiler, ofisler, üyelik paketleri, güven skorları, denetim, hesap-silme, kurucu liste, SEO yayın, pazarlama (BYOK), keşif.
- Opsiyon motoru (3 yöntem + DB kilidi), tazelik cron'u, planlı stok açılış, güven skoru RPC'leri, KYC akışı, SEO/GEO altyapısı, PWA.

### B. Çalışıyor fakat eksikleri/uyarıları var
- Ödeme planı özelliği `db/2026-06-28_odeme-plani.sql` migration'ı uygulanmadan graceful hata verir (migration-gated). (KANITLI.)
- `/hesap-bekliyor` sayfası eski stil token'ları kullanır (Berrak Güven/Spatial dışı). (KANITLI.)
- 3 hukuki sayfa (gizlilik/kullanım/kvkk) **TASLAK** — avukat incelemesi gerekiyor; ayrıca noindex olmalarına rağmen sitemap'te listeleniyorlar (zararsız tutarsızlık). (KANITLI.)
- `talep-radari` events sorgusu 20.000 satır limitli — hacimde SQL agregasyona taşınmalı (kod yorumu uyarıyor). (KANITLI.)

### C. UI mevcut fakat backend/mock durumda
- Ana sayfa "Canlı Portföy" 4 proje kartı + hero eritme sayaçları = **MOCK demo** ("örnek akış" etiketli, DB-bağlı değil). Diğer interaktif landing bileşenleri (CanliHavuzDemo, KilitKoreografi vb.) bilinçli simülasyon. (KANITLI.)
- `mockup-01..11` + `/tasarim/[yon]` = tasarım laboratuvarı sayfaları (noindex, ürün değil). (KANITLI.)

### D. Sadece plan / şema iskeleti / kullanılmayan
- `fiyat_kurali` tablosu (dinamik fiyat) — şema var, iş mantığı yok (Faz-2). (KANITLI.)
- `opsiyon_talep.kod/kod_son` kolonları — orijinal kod-mekanizması dormant (geçici/dogrudan/onay RPC'lerine geçildi). (ÇIKARIM.)
- `proje` yurtdışı kolonları (`oturum_uygun, golden_visa_esik, diller, para_birimi≠TRY`) — boş, Faz-2. (KANITLI.)
- `arsa_sahibi`/`marka_yetkili` rolleri — ayrı panel yok, `/havuz`'a düşer. (KANITLI.)

### İddia vs kod-gerçeği (seçme)
| Landing / doküman iddiası | Kodun gösterdiği gerçek |
|---|---|
| "Çift satış yapısal olarak imkânsız" | KANITLI — `opsiyon_tek_aktif` partial unique index + RPC FOR UPDATE. |
| "Komisyon yok / kazancın %100'ü senin" | KANITLI — platform pay almaz; `komisyon_tip='yok'` seçeneği; abonelik geliri. |
| "Rakip müteahhit fiyatımı göremez" | KANITLI — satır-seviye RLS + `uretici_id` izolasyonu. |
| "Canlı / anında güncellenir" | KANITLI panelde (Supabase Realtime `birim`); landing "Canlı Portföy" ise MOCK. |
| "Fiyat her yerde güncel" | KANITLI — paylaşımda/katalogda canlı basılır; WhatsApp metni/OG'ye bilinçli basılmaz. |
| "Doğrulanmış üretici/proje" | KANITLI — `uretici.dogrulanmis` + `proje.belge_dogrulandi` + KYC. |
| "Yurtdışı projeler" | Faz-2 — kolonlar boş, UI Faz-1 yurtiçi. |

---

## 4. EN GÜÇLÜ 10 ÜRÜN ÖZELLİĞİ (§49 — ürün gerçeği, pazarlama değil)

1. **DB seviyesi çift-satış kalkanı** (`opsiyon_tek_aktif` partial unique index + RPC `FOR UPDATE`) — ödemeye bağlı değil, uygulama katmanına güvenmez.
2. **Granüler tahsis + RLS gizli görünürlük** — daire/blok/kat/tip/tür/segment/ofis/danışman seviyesinde; emlakçı yalnız kendine açılanı görür, `tahsis` satırını bile okuyamaz.
3. **Tek doğru kaynak + canlı fiyat basımı** — fiyat yalnız `birim`'de; paylaşım/katalog/mikrosite anlık değerden basar, kopya yok.
4. **Supabase Realtime canlı stok** — emlakçı proje detayında birim değişiklikleri saniyeler içinde yansır.
5. **İmzalı paylaşım mikrositesi** (`/p/...`) — HMAC token, RLS-bypass sadece bu kapıda, anonim KVKK-safe görüntüleme sinyali, dinamik OG (fiyat basmadan).
6. **Opsiyon 3-yöntem motoru** (dogrudan/onay/geçici 2-fazlı) — müteahhit kontrollü, boş-opsiyon kalkanı (müşteri zorunlu + kota + düşük-skor kısıtı).
7. **Tazelik sigortası** — `son_guncelleme` + 4-kademe rozet + 15 günlük stale cron; "eski fiyatla rezil olma" değerini görünür kılar.
8. **Veri yerçekimi (`events`)** — append-only iz zinciri; talep radarı + güven skoru + fiyat geçmişi hep buradan; geçmişe doldurulamaz = moat.
9. **Keşif büyüme motoru** — SerpAPI/Serper/Places + site e-posta kazıma → `aday` funnel → davet/takip cron; cold-start silahı.
10. **Güven skoru sistemi** (DB RPC) — çift taraflı itibar; düşük-skor emlakçıya geçici opsiyon kotası kısıtı; admin komuta tabloları.

---

## 5. EN ÖNEMLİ 10 EKSİK (§50 — koddan görünür boşluklar)

1. **WhatsApp yalnız deep-link** — giden Cloud API otomasyonu ve serbest-metin parse yok (Faz-2 bilinçli sınır, ama "canlı senkron" vaadinin otomasyon ayağı eksik).
2. **Hakediş/komisyon defteri yok** — komisyon oranı gösterilir ama kazanılan-vs-ödenen takibi yok (retention kancası boşluğu).
3. **Zaman-damgalı müşteri-claim sertifikası yok** — lead timestamp var, ihraç edilen hukuki ispat aracı yok.
4. **Semantik/LLM eşleştirme yok** — `/havuz/eslestir` kural-tabanlı fit-skor; NLP/embedding Faz-2.
5. **Dinamik fiyat otomasyonu yok** — `fiyat_kurali` tablosu boş iskelet; sadece "öneri" (`/uretici/fiyat-onerisi`).
6. **Dağıtık rate-limit yok** — yalnız `/api/lead` 10-dk throttle (uygulama-katmanı, yarış penceresi); `/api/etkilesim` throttle'sız (token replay ile sinyal spam'i mümkün).
7. **RLS'e tam bağımlılık** — bazı panel sorguları client-side `profile_id`/`satici_id` filtresi içermez; RLS regresyonu doğrudan veri sızıntısı olur (tek savunma hattı).
8. **Geçici debug info-leak** — `havuz/actions.ts:91-95` ham Postgres hata metnini UI'a döndürüyor (kaldırılmalı "TANI (geçici)"). (TODO benzeri.)
9. **Hukuki sayfalar taslak** — gizlilik/kullanım/kvkk avukat incelemesinden geçmemiş; public `/hesap-silme` sayfası yok (app-store/portal beklentisi olursa boşluk).
10. **Cold-start / likidite** — ürün değil ama en büyük risk: iki taraflı pazar, müteahhit yoksa emlakçı gelmez (Keşif motoru + Kurucu Müteahhit stratejisi bunun azaltıcısı).

---

## 6. MASTER TANIMLAR (§55)

**25 kelime:** Projedar, müteahhitin yeni konut stoğunu tek canlı kaynaktan yönettiği, her emlakçının yalnız kendine tahsisli daireyi gördüğü, komisyonsuz, kapalı devre B2B satış dağıtım ağıdır.

**100 kelime:** Projedar, çok-müteahhitli ve üretici-kontrollü bir canlı konut stoğu dağıtım ağıdır. İnşaat firması projesinin stoğunu, fiyatını ve satış durumunu tek merkezden yönetir; bağımsız emlak danışmanı yalnız kendisine tahsis edilmiş birimleri tek canlı havuzdan görür, imzalı linkle WhatsApp'tan birebir paylaşır ve müşteri adayını toplar. Fiyat/durum tek doğru kaynakta (`birim`) tutulur, değişince tüm yetkili ağa anında yansır. Çift satış veritabanı seviyesinde imkânsızdır. Platform komisyona dokunmaz, sözleşmeye taraf olmaz; gelir müteahhit anlaşması ve (sonraki fazda) abonelikten gelir. Portal veya CRM değil; sektörün güven protokolü ve satış omurgasıdır.

**300-500 kelime:** Projedar, Türkiye'nin yeni konut projeleri için tasarlanmış, çok-müteahhitli ve üretici-kontrollü bir **canlı konut stoğu dağıtım ağıdır**. Ürünün çözdüğü problem nettir: bugün proje stoğu Excel, PDF, WhatsApp grupları ve telefon arasında dağınık ve eskidir; aynı daire farklı kanalda farklı fiyatla dolaşır; iki danışman aynı daireyi satabilir; kimin hangi müşteriyi getirdiği belirsizdir. Projedar bunu tek bir mimariyle çözer.

Sistemin çekirdeğinde **tek doğru kaynak** durur: her bağımsız bölümün fiyatı ve durumu yalnız `birim` tablosunda tutulur. Müteahhit ("üretici") projesini, bloklarını, daire tiplerini ve birimlerini bir kurulum sihirbazıyla (veya Excel import ya da concierge ile) tanımlar; fiyat, ödeme planı, şerefiye ve medyayı ekler. Ardından **granüler tahsis** yapar: hangi daireleri/blokları/katları/tipleri hangi ofise, danışmana veya segmente açacağını, komisyon görünürlüğünü ve münhasırlığı tek tek belirler. Görünürlük tamamen Postgres RLS'e devredilmiştir; emlakçı yalnız kendine tahsisli ve satılabilir birimleri görür, `tahsis` satırını bile okuyamaz. Rakip müteahhit, başka firmanın stoğunu/fiyatını göremez (satır-seviye izolasyon).

Emlakçı, tüm yetkili projelerini tek canlı havuzdan görür (filtre, harita, tazelik rozeti), bir birimi imzalı bir mikrosite linkiyle (`/p/[emlakci]/[birim]/[token]`, HMAC ile korunur) müşterisine WhatsApp'tan **birebir** paylaşır. Müşteri anonim mikrositede canlı fiyatı görür, KVKK açık rızasıyla lead bırakır; lead doğrudan paylaşan danışmana düşer. Çift satış **veritabanı seviyesinde** engellenir: bir birimde aynı anda tek aktif opsiyon olabilir (partial unique index). Opsiyon üç yöntemle alınır (anında/onaylı/geçici-doğrulamalı), hepsi müteahhit kontrolündedir.

Her paylaşım, görüntüleme, lead ve satış append-only `events` tablosuna yazılır; bu "veri yerçekimi" talep radarını, güven skorlarını ve fiyat geçmişini besler ve geçmişe doldurulamaz — asıl moat budur. Platform **komisyona dokunmaz**; gelir erken aşamada müteahhit anlaşması, sonraki aşamada emlakçı premium + ofis/franchise SaaS aboneliğidir.

Teknik olarak Next.js 16 (App Router) + Supabase (Postgres + Auth + Realtime + Storage + RLS) + Vercel + PWA üzerine kuruludur. Admin paneli platform işletmecisine aittir (asla üretici değildir): gelir, hesap tanımlama, doğrulama/güven rozeti, denetim ve büyüme motorunu (Keşif) yönetir. Projedar bir ilan portalı, açık pazaryeri veya CRM değildir; **gayrimenkulün güven protokolü ve satışın omurgasıdır.**

---

## 7. TEK CÜMLELİK POSITIONING — 5 ALTERNATİF (§56)

1. "Türkiye'nin yeni konut satış dağıtım altyapısı: müteahhit stoğunu tek merkezden yönetir, her emlakçı yalnız kendine tahsisli daireyi canlı görür, komisyonsuz." (doküman onaylı ana cümle)
2. "Yeni konut projeleri için tahsisli canlı satış ağı — portal değil, satışın omurgası."
3. "Çift satışın veritabanı seviyesinde imkânsız olduğu, komisyonsuz, üretici-kontrollü konut stoğu ağı."
4. "Bir daire değişir, bütün yetkili ağ anında güncellenir: gayrimenkulün güven protokolü."
5. "Müteahhit kontrolü + bağımsız emlakçı ağı + canlı tek doğru stok, tek kapalı devrede."

---

## 8. PROJEDAR'I REKABETÇİYE ANLATIR GİBİ (§51 — tarafsız)

Projedar, off-plan (proje/inşaat halindeki) konut satışı için bir **çok-taraflı dağıtım ağı + hafif transaction-governance katmanıdır**. Mimari olarak en yakın benzeri Dubai/MENA'daki off-plan "Sales OS" ürünleridir (DomusHub, Alnair, Nogbase), fakat üç yapısal fark taşır: (1) tek geliştiriciye kilitli SaaS değil, **çok-müteahhitli tek ortak canlı havuz**; (2) görünürlük **daire seviyesinde emlakçı-bazlı tahsis** ile RLS'te kesilir (proje-seviyesi değil); (3) çift-satış kilidi **ödemeye bağlı değil, DB partial-unique-index** ile sağlanır ve platform **komisyona hiç dokunmaz**.

Teknik olgunluk yüksek: 25 tablolu, RLS-önce, SECURITY DEFINER fonksiyonlarıyla görünürlük yöneten bir Postgres şeması; Supabase Realtime; append-only event log'dan türeyen talep/güven/fiyat analitiği; imzalı anonim paylaşım mikrositesi; günlük Vercel cron + saatlik pg_cron. Ürün canlı (projedar.com) ve üç rolün paneli de gerçek veriyle çalışıyor.

Zayıflıklar: iki taraflı pazarın cold-start'ı; WhatsApp otomasyonunun henüz deep-link seviyesinde olması; hakediş/sertifika gibi retention özelliklerinin Faz-2'de olması; dağıtık rate-limit ve bazı güvenlik cilalarının eksikliği; tek savunma hattının RLS olması. Yerel hendek güçlü: EİDS kapalı-devre kalkanı, KVKK-uyumlu lead akışı, kat karşılığı/koçan gibi Türkiye'ye özel modeller, Türkçe-önce.

---

## 9. YATIRIMCIYA ANLATIR GİBİ (§52)

- **Problem:** 2,7 trilyon TL/yıl ilk-el konut cirosu (2025), 88.572 yetki belgeli emlak işletmesi, ~25-40K kurumsal müteahhit; stok dağıtımı Excel/WhatsApp'ta dağınık, çift satış ve eski-fiyat kaynaklı iptal yaygın.
- **Çözüm:** tek doğru canlı stok + granüler tahsis + DB çift-satış kalkanı + görünür tazelik; komisyonsuz.
- **Kullanıcılar:** müteahhit (arz), bağımsız emlakçı/ofis/marka (dağıtım); alıcı dolaylı (mikrosite).
- **İş modeli:** erken = müteahhit anlaşması + emlakçı bedava; sonra = emlakçı premium + ofis/franchise SaaS abonelik (MRR altyapısı hazır). Komisyon yok (bilinçli).
- **Moat:** kombinasyon (çok-müteahhit + daire-seviye tahsis + DB kilit + komisyonsuz) + **veri yerçekimi** (events geçmişe doldurulamaz) + yerel regülasyon uyumu (EİDS/KVKK) + ağ etkisi.
- **Dağıtım avantajı:** WhatsApp/concierge ile dijitalleşmemiş müteahhide erişim + Keşif motoruyla otomatik aday keşfi.
- **Ölçeklenebilirlik:** multi-tenant baştan (`uretici_id` izolasyonu), serverless + RLS; Realtime "nice-to-have" (gayrimenkul temposu saat/gün). Ölçek uyarısı: bazı analitik sorguları agregasyona taşınmalı; Sydney→Frankfurt region migration TR latency için planlı.
- **Vizyon:** canlı stok ağı → proje veri altyapısı → fiyat/talep endeksi → yatırım platformu (finansal katman).
- **Olgunluk:** MVP çekirdeği canlı ve gerçek-veri; öz-değerlendirme (dokümandan): problem 9/10, çözüm 8/10, pazar 9/10, execution zorluğu 9/10, başarı ~6.5/10 — "execution belirler."

---

## 10. MÜTEAHHİDE / EMLAK DANIŞMANINA ANLATIR GİBİ (§53-54)

**Müteahhide:** Stoğunu bir kez gir, 40 danışmana tek tek WhatsApp'la fiyat güncelleme derdi bitsin. Kime hangi daireyi hangi şartla açacağına sen karar ver (granüler tahsis) — kontrolü bırakmadan her yere ulaş. İki danışman aynı daireyi satamaz (DB kilidi). Kim getirdi objektif iz zincirinde. Rakip firma stoğunu/fiyatını göremez. Doğrulanmış üretici rozetiyle sahte-ilan riskinden ayrış. Küçük müteahhitsen concierge kurar, WhatsApp'tan yönetirsin.

**Emlak danışmanına:** Tüm yetkili projelerin tek canlı ekranda; "son güncelleme 2 saat önce" — masada fiyat tutar, satış iptal olmaz. Tamamen ücretsiz, kazancının %100'ü sende (Projedar pay almaz). İmzalı linkle müşterine birebir paylaş; müşteri linkten lead bırakınca doğrudan sana düşer ("ilk bayrağı ben diktim"). Doğru daireyi bul (eşleştir), 48 saat opsiyonla kilitle, müşteri kataloğu üret. Saha için PWA: mobil-önce, kurulabilir.

---

*Devamı: `01`…`11` + `PROJEDAR_AI_CONTEXT.md`. Bağlayıcı kaynak: `ProjePazar-Sistem-Kurallari.md`. Bu doküman salt-okunur analizle üretildi; kod değiştirilmedi.*
