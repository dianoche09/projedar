# MASTER PROJEDAR IDENTITY — V2 (red-team / consistency audit sonrası kanonik sürüm)

> **Statü:** Bu dosya, V1 (`00-MASTER-PROJEDAR-IDENTITY.md` + `PROJEDAR_AI_CONTEXT.md`) üzerinde yapılan tutarlılık/red-team denetiminin çıktısıdır. **Çelişkide V2 kazanır; Projedar'ın kanonik master hafızası budur.**
> **Denetim tarihi:** 2026-08-09. Kaynak: repo kod denetimi (main) + V1 raporu. Repo yeniden taranmadı; sayılar koddan bizzat yeniden doğrulandı.
> **Etiketler:** **KANITLI** (koddan doğrulandı) · **ÇIKARIM** (dolaylı) · **KONUMLANDIRMA** (pazarlama/strateji iddiası — kod-gerçeği değil) · **HUKUKİ-İDDİA** (avukat onayı gerektirir) · **MOCK** · **TODO** · **DRIFT** (doküman↔kod).
> **En sık kural:** "Ürün bugün ne yapıyor" (Bölüm A) ile "Biz nasıl konumlandırıyoruz" (Bölüm B) **kesin ayrıdır**. Bir AI, B'yi A gibi (kesin gerçek) sunmamalıdır.

---

## 0. V1 → V2 DÜZELTME KAYDI (neyi neden değiştirdim)

| # | V1'deki sorun | Düzeltme (V2) |
|---|---|---|
| 1 | **Sayı hatası:** "25 tablo, 14 enum" tekrarlandı | **26 tablo, 13 enum** (koddan `create table`/`create type as enum` sayımıyla doğrulandı — Bölüm E). V1 yanlıştı. |
| 2 | **"%100 doğru stok"** çekirdek değer olarak sunuldu; ama stok girişi manuel/Excel/concierge, dış API yok → dış-dünya doğruluğu garanti edilemez | Yeniden çerçeve: **"Yetkili ağ için tek referans stok kaynağı oluşturur ve verinin son güncellenme zamanını görünür kılar."** "%100 doğru" absolutist ifadesi truth'tan çıkarıldı. |
| 3 | **"Çift satış yapısal olarak imkânsız"** kesin ürün claim'i | Yeniden çerçeve: **"Aynı stok için eşzamanlı aktif opsiyon çakışmasını veritabanı seviyesinde engeller."** Platform-dışı/geç-giriş satışlar kapsam dışı (fiziksel dünya garanti edilmez). |
| 4 | **Gelir modeli çelişkisi:** "sonraki aşama: işlem-başı opsiyonel pay" ↔ "alınmayacak: işlem-başı ücret" | İşlem ücreti **karara bağlanmadı → master truth'a GİRMEZ.** Truth: komisyondan pay yok + müteahhit anlaşması + emlakçı basic bedava + gelecekte premium/SaaS. |
| 5 | **"Komisyon = yok"** yanlış semantik (DB'de `komisyon_tip/komisyon_deger` var; emlakçının müteahhitten komisyonu mevcut) | Kanonik ifade: **"Müteahhit tarafından emlak danışmanına tanımlanan satış komisyonundan Projedar pay almaz."** Kısa: "Projedar emlakçı komisyonuna ortak olmaz." Popup: "Emlakçı komisyonundan Projedar pay almaz." "işlem komisyonundan pay almaz" ve truth olarak "kazancın %100'ü senin" **kullanılmaz** (ofis/franchise payı olabilir). |
| 6 | **EİDS "ilan değil / muaf"** AI context'te kesin hukuki gerçek gibi | HUKUKİ-İDDİA olarak işaretlendi; "muaftır/ilan değildir" kesin hüküm olarak kullanılmaz (Bölüm B.4). |
| 7 | KANITLI etiketi bazı pazarlama/strateji yorumlarına da yapıştırılmış (moat, "en olgun", "güven protokolü", "%100 doğru") | Bu ifadeler KONUMLANDIRMA/ÇIKARIM olarak yeniden sınıflandı (Bölüm B.1). |

**Absolutist claim envanteri (AI context'te dikkatli kullan — Bölüm B.5):** "%100 doğru", "imkânsız", "garanti", "muaf", "ilan değildir", "her an", "hiç değişmez". Bunlar landing/pazarlama diliyse kalabilir; **truth/AI-context'te koşullandırılmadan kullanılmaz.**

---

# BÖLÜM A — ÜRÜN BUGÜN NE YAPIYOR (kod-gerçeği, KANITLI)

Bu bölüm yalnız koddan doğrulanabilen gerçekleri içerir. Bir AI bunları kesin olarak kabul edebilir.

## A.1 Ne olduğu (mimari gerçek)
Projedar, **çok-müteahhitli, üretici-kontrollü bir konut stoğu dağıtım ağıdır.** Üç ayrı rol paneli koddadır ve gerçek Supabase verisiyle çalışır:
- **`/uretici`** (müteahhit) — proje/blok/tip/birim kurulum (sihirbaz + Excel import + concierge), granüler tahsis CRUD, opsiyon onay/doğrulama, planlı stok açılış (dalga), fiyat/ödeme, analitik (talep radarı/raporlar/fiyat önerisi), lead-sorgu, lansman, davet, firma profili.
- **`/havuz`** (emlakçı) — yalnız kendine tahsisli canlı stok (liste + Leaflet harita + filtre), proje detayı (Supabase Realtime canlı fiyat), imzalı paylaşım, üç opsiyon yöntemi, müşteri kataloğu, lead yönetimi, eşleştir, KYC.
- **`/admin`** (platform işletmecisi — asla üretici değil) — gelir/MRR, hesap tanımlama, başvuru/KYC doğrulama, güven skorları, denetim, üyelik paketleri, KVKK silme, BYOK pazarlama anahtar kasası, **Keşif** büyüme motoru.
- `ofis_yetkili`/`marka_yetkili`/`arsa_sahibi` rolleri şu an ayrı panele sahip değil → `/havuz`'a düşer (ayrı konsollar Faz-2).

## A.2 Çekirdek mekanizma (KANITLI)
1. **Tek referans kaynak (`birim` tablosu):** fiyat/durum tek yerde; paylaşımda/katalogda/mikrositede o anki canlı değerden basılır, kopyalanmaz. WhatsApp metnine ve OG görseline fiyat **basılmaz** (cache'te donar diye).
2. **Granüler tahsis + RLS:** görünürlük tamamen Postgres RLS'e devredilmiş; SECURITY DEFINER fonksiyonlar (`emlakci_proje_tahsisli`, `emlakci_birim_gorebilir` 6-arg) belirler. Emlakçı `tahsis` satırını doğrudan okuyamaz; yalnız kendine tahsisli + (KYC `belge_durumu='dogrulandi'`) + kapsam-içi birimi görür (veya `demo` proje).
3. **Eşzamanlı opsiyon çakışma kilidi (DB):** `create unique index opsiyon_tek_aktif on opsiyon (birim_id) where durum in ('opsiyonlu','satis_beklemede')` + `opsiyon_birim_senkron` trigger + onay RPC `FOR UPDATE`. İkinci aktif opsiyon INSERT'i 23505 unique_violation alır.
4. **Append-only iz zinciri (`events`):** paylaşım/görüntüleme/lead/opsiyon/satış/fiyat kayıtları; talep radarı + güven skoru + fiyat geçmişini besler; INSERT yalnız service-role/SECURITY DEFINER.

## A.3 Tazelik (KANITLI — "%100 doğru"nun gerçek karşılığı)
Veri doğruluğu **garanti edilmez; görünür kılınır.** `birim.son_guncelleme` her yazışta güncellenir; UI'da "X önce" + 4-kademe rozet (0-24sa yeşil, 1-7g teal, 7-15g amber, 15g+ gri); günlük cron `freshnessCalistir` 15 günden eski birimi `stale=true` yapar. Yani mimari "tek referans + tazelik sinyali" verir; müteahhit güncellemezse veri eskiyebilir (tazelik sistemi tam da bunun için var).

## A.4 Opsiyon motoru (KANITLI)
Proje bazında üç yöntem (`proje.opsiyon_ayar.yontem`): **dogrudan** (anında kilit), **onay/talep_kod** (`opsiyon_talep` → müteahhit onayı, FOR UPDATE), **geçici** (anında kilit `dogrulandi=false`, müşteri zorunlu + kota, düşük güven skoru → kota 1; müteahhit doğrular/reddeder, süre dolarsa cron serbest bırakır). Opsiyon INSERT emlakçıya kapalı (RLS `is_admin()`), yalnız SECURITY DEFINER RPC. Durum makinesi: musait → opsiyonlu → satis_beklemede → (onay) satildi / (red) musait; opsiyonlu → (kilit_bitis, cron) musait; planli → (satisa_acilis, cron) musait.

## A.5 Paylaşım / lead / kim-getirdi (KANITLI)
- İmzalı mikrosite `/p/[emlakci]/[birim]/[token]` (HMAC-SHA256, `LEAD_SHARE_SECRET`, fallback yok; geçersiz token → `notFound()`; veri `createAdminClient` RLS-bypass — tek kapı token). Görüntüleme anonim `events` sinyali (IP/PII yok).
- Lead `/api/lead`: HMAC token + Zod + ayrı açık-rıza checkbox (`kvkk: z.literal(true)`) + telefon normalize + 10dk throttle (429). Lead `atanan_id=ilk_paylasan_id=emlakci`.
- Müşteri sahipliği **garanti edilmez**: platform arbitraj yapmaz; müteahhit `/uretici/lead-sorgu`'da ad/telefon birebir sorgulayınca "ilk kaydeden danışman"ı görür (`ilk_paylasan_id`). Toplu lead feed'i müteahhide gitmez.

## A.6 Doğrulama/güven (KANITLI)
Üretici `dogrulanmis` rozeti (admin) + proje `belge_dogrulandi` + emlakçı KYC (`kullanici_belge` → `kyc-belge` private bucket → admin onay, `belge_durumu_guard` trigger non-admin'in kendini doğrulamasını engeller). Güven skoru DB RPC (`emlakci_skor`/`muteahhit_skor`, yanıt 30/SLA 25/doğrulama 25/tazelik 20; `<3 işlem → "Yeni"`).

## A.7 Teknik (KANITLI)
Next.js 16.2.9 (App Router, TS strict, `next build --webpack`) + React 19.2 + Tailwind v4 + Supabase (Postgres+Auth+Realtime+Storage+RLS) + Vercel (serverless + cron, region `syd1`) + serwist PWA. Middleware = `src/proxy.ts` (Next 16). Üç Supabase istemcisi: browser (anon), server (anon+cookie), service-role (yalnız server, bundle'a girmez). Vercel cron günlük 03:00 UTC (`opsiyon_suresi → stok_acilis → freshness → kesif_followup`) + pg_cron 2 job/15dk. **Harici analytics/ödeme/test framework YOK** (GA4/PostHog/Stripe/iyzico/Jest/Playwright kodda yok); analytics = birinci-parti `events`.

## A.8 Veri modeli (KANITLI — Bölüm E'de doğrulandı)
**26 tablo, 13 enum, 2 storage bucket.** Çekirdek enum `birim_durum`: musait/opsiyonlu/satis_beklemede/satildi/stop/planli/kiralandi. DB-kalkanı deseni tutarlı (partial-unique/CHECK: çift-opsiyon, bekleyen-talep, tek-abonelik, tek-silme-talebi, aday-dedup, abonelik-XOR). `supabase-schema.sql` (kök) bilinçli eski; canlı = kök + `db/*.sql` (27 migration); çelişkide `db/*` kazanır.

## A.9 Bugün çalışan (production, gerçek-veri) modüller
Üretici paneli (17 sayfa), havuz paneli (12 sayfa) + mikrosite, admin paneli (15+ sayfa), opsiyon motoru + DB kilidi, planlı açılış, Realtime, KYC, imzalı paylaşım + katalog (print/PDF), lead akışı, tazelik cron'u, güven skoru, üretici analitiği, public proje SEO (`/proje/[slug]` + `/konut-projeleri` + `/firma/[slug]`), Keşif motoru (SerpAPI/Serper/Places + site e-posta kazıma → `aday` funnel → davet), SEO/GEO altyapısı (robots 31 AI crawler, sitemap, llms.txt, dinamik OG, IndexNow), PWA.

## A.10 Bugün ÇALIŞMAYAN / demo / iskelet (KANITLI)
- **MOCK:** ana sayfa "Canlı Portföy" 4 kartı + hero eritme sayaçları (bilinçli "örnek akış"; DB-bağlı değil). Diğer landing simülasyonları etiketli.
- **Faz-2 / dormant:** WhatsApp yalnız deep-link (Cloud API + serbest-metin AI parse yok), dinamik fiyat otomasyonu (`fiyat_kurali` boş iskelet), `opsiyon_talep.kod` dormant, yurtdışı kolonları (para_birimi≠TRY/oturum/golden-visa/diller) boş, ofis/marka/arsa ayrı konsolları yok, semantik eşleştirme (kural-tabanlı), hakediş defteri/claim sertifikası/dijital sözleşme/EOI yok.
- **Teknik borç/TODO:** `havuz/actions.ts:91-95` geçici debug ham Postgres hata metnini UI'a sızdırıyor; `talep-radari` events 20.000 satır limit; dağıtık rate-limit yok (`/api/etkilesim` throttle'sız); plaintext BYOK anahtar; sıfır otomatik test; 3 hukuki sayfa TASLAK; latin-ext font eksik; tasarım token istisnaları.

---

# BÖLÜM B — BİZ NASIL KONUMLANDIRIYORUZ (pazarlama/strateji/hukuki — kod-gerçeği DEĞİL)

Bu bölümdeki ifadeler **iddia/konumlandırmadır**; bir AI bunları kesin gerçek gibi sunmamalı, özellikle sektörel/hukuki içerikte koşullandırmalıdır.

## B.1 KANITLI görünümlü ama aslında KONUMLANDIRMA/ÇIKARIM olan ifadeler (V1 düzeltmesi)
- "Gayrimenkulün güven protokolü / satışın omurgası" → KONUMLANDIRMA.
- "Asıl moat = kombinasyon (çok-müteahhit + tahsis + DB kilit + komisyonsuz + veri yerçekimi)" → strateji ÇIKARIMI (mekanizmalar KANITLI, "moat" yorumu değil).
- "Veri yerçekimi = asıl moat / geçmişe doldurulamaz" → strateji ÇIKARIMI (`events` append-only KANITLI; "moat" iddia).
- "En olgun sayfa (mikrosite)" → kalitatif ÇIKARIM.
- "En hızlı satış yapılan ağ" → KONUMLANDIRMA (ölçülmüş metrik yok).
- Rakip kıyasları (Novo/Topli/DomusHub/Nogbase…) → doküman-kaynaklı, kod değil.
- Fiyat bandları (emlakçı 750/ay, müteahhit 150-600K, enterprise 650K+) → Sentez raporu **kararı/önerisi**; kodda paket olarak seed edilmemiş.
- Öz-değerlendirme skorları (problem 9/10 vb.) → dokümandan, subjektif.

## B.2 Çekirdek değer — düzeltilmiş, savunulabilir ifade
V1'deki "'Bu daire hâlâ satılık mı?' sorusuna her an %100 doğru cevap" **kullanılmaz.** Yerine:
> **"Yetkili ağ için tek referans stok kaynağı oluşturur ve verinin son güncellenme zamanını görünür kılar."**

## B.3 Çift satış — düzeltilmiş ifade
V1/landing'deki "Çift satış yapısal olarak imkânsız" **koşullandırılmadan kullanılmaz.** Yerine:
> **"Aynı stok için eşzamanlı aktif opsiyon çakışmasını veritabanı seviyesinde engeller."**
(Landing'de mevcut "yapısal olarak imkânsız" H1'i de bu yönde revize edilmeli.)

## B.4 EİDS / KVKK / hukuki — HUKUKİ-İDDİA (kesin hüküm değil)
V1 AI-context'teki "EİDS'den muaf / ilan değildir" **kesin gerçek olarak kullanılmaz.** Kanonik ifade:
> **"Projedar teknik olarak yalnız ağa/tahsise açık bir B2B dağıtım modeli uygular. Bunun EİDS kapsamında hangi işlemlerde ilan sayılıp sayılmayacağı ve olası istisnalar hukuki değerlendirmeye tabidir; 'EİDS'den muaftır' veya 'ilan değildir' kesin hüküm olarak kullanılmaz."**
KVKK tarafında da: ayrı açık rıza + veri minimizasyonu KANITLI (kod); ama nihai uyum beyanı hukuki incelemeye tabidir. Hukuki sayfalar (gizlilik/kullanım/kvkk) TASLAK.

## B.5 Absolutist kelime politikası (AI context için)
Şu kelimeler truth/AI-context'te **koşullandırılmadan yasak:** "%100 doğru", "imkânsız", "garanti", "muaf", "ilan değildir", "her an", "hiç değişmez". Pazarlama yüzeyinde geçerlerse "iddia/hedef" olduğu açık olmalı.

## B.6 İki kanonik cümle (bir AI bunları AYRI amaçla kullanmalı)

**Ürün gerçeği (factual açıklama / dokümantasyon için — Bölüm A dayanağı):**
> **Projedar, birden fazla müteahhidin proje ve bağımsız bölüm stoklarını üretici-kontrollü tahsis kurallarıyla emlak danışmanlarına dağıtan B2B konut stoğu ağıdır.**

**Marka konumlandırması (landing / copy / satış materyali için — KONUMLANDIRMA):**
> **Projedar, yeni konut satışının dağıtım altyapısıdır.**

Genişletilmiş konumlandırma (opsiyonel copy): "Türkiye'nin yeni konut satış dağıtım altyapısı: müteahhit stoğunu tek merkezden yönetir, her emlakçı yalnız kendine tahsisli daireyi canlı görür. Projedar emlakçı komisyonuna ortak olmaz. Portal değil, satışın omurgası." (son cümle KONUMLANDIRMA.)

---

# BÖLÜM C — GELİR MODELİ (çelişki temizlenmiş — KANONİK TRUTH)

> **Müteahhit tarafından emlak danışmanına tanımlanan satış komisyonundan Projedar pay almaz.** Erken gelir modeli **müteahhit anlaşmasıdır** (birebir B2B, Admin'de manuel). **Emlak danışmanı basic ücretsizdir.** Gelecekte **emlakçı premium ve ofis/franchise SaaS abonelik** ürünleri olabilir.

- **İşlem/başı ücret: KARARA BAĞLI DEĞİL → master context'e GİRMEZ.** (V1'deki "opsiyonel işlem ücreti" ↔ "alınmayacak işlem ücreti" çelişkisi böyle çözülür.)
- **Komisyon semantiği (kritik):** DB'de `tahsis.komisyon_tip (yuzde|sabit|yok)` + `komisyon_deger` VAR — bu **müteahhidin emlak danışmanına tanımladığı komisyondur** ve emlakçı kendi kazancını görür (RLS). Projedar bu komisyondan **pay almaz.** Kanonik sabit ifadeler:
  - Truth/uzun: **"Müteahhit tarafından emlak danışmanına tanımlanan satış komisyonundan Projedar pay almaz."**
  - Marka/kısa: **"Projedar emlakçı komisyonuna ortak olmaz."**
  - Popup: **"Emlakçı komisyonundan Projedar pay almaz."**
  - **KULLANMA:** çıplak "komisyon yok"; "işlem komisyonundan pay almaz" (yanlış çağrışım); truth olarak "kazancın %100'ü senin" (ofis/franchise ile danışman arasında ayrı paylaşım olabilir → yalnız pazarlama copy'sinde, iddia olarak). Projedar'ın garanti ettiği tek şey: **o komisyondan pay almıyor.**
- **Kod altyapısı:** `abonelik_paketi` + `abonelik` (tek-aktif) + admin CRUD + MRR hesabı hazır (KANITLI). Sabit fiyat kodda seed edilmemiş; admin tanımlar.

---

# BÖLÜM D — MASTER PRODUCT TRUTH (yalnız koddan çıkan gerçekler, düzeltilmiş)

Bir AI'a sistem bağlamı olarak verilebilecek, absolutist/pazarlama/hukuki-iddiadan arındırılmış çekirdek gerçekler:

1. Ürün adı **Projedar**, domain **projedar.com**; eski ad ProjePazar (iç doküman adlarında). Repo `dianoche09/projedar`.
2. Stack: Next.js 16.2.9 (App Router, TS strict) + React 19.2 + Tailwind v4 + Supabase (Postgres+Auth+Realtime+Storage+RLS) + Vercel + serwist PWA. Middleware `src/proxy.ts`.
3. Üç gerçek rol paneli: `uretici→/uretici`, `emlakci→/havuz`, `admin→/admin`. ofis/marka/arsa → `/havuz` (Faz-1).
4. admin = platform işletmecisi; stok/birim/fiyat düzenlemez (gelir/hesap/doğrulama/denetim/büyüme).
5. Görünürlük Postgres RLS + `tahsis` + SECURITY DEFINER fonksiyonlarında; emlakçı yalnız kendine tahsisli + KYC-dogrulandi + kapsam-içi birimi görür (veya `demo`).
6. Service-role yalnız server/cron; `NEXT_PUBLIC` değil → client bundle'a girmez.
7. Fiyat/durum tek referans `birim` tablosunda; paylaşım/katalog/mikrosite canlı basar; WhatsApp metni/OG'ye fiyat basılmaz.
8. Eşzamanlı aktif opsiyon çakışması DB partial-unique-index ile engellenir (`opsiyon_tek_aktif`); ikinci aktif opsiyon 23505 hatası.
9. Opsiyon üç yöntem (dogrudan/onay/geçici); opsiyon INSERT emlakçıya kapalı → SECURITY DEFINER RPC.
10. WhatsApp yalnız giden deep-link (Cloud API + AI parse yok, Faz-2).
11. Tazelik: `son_guncelleme` + 4-kademe rozet + 15g stale cron. Veri doğruluğu garanti edilmez, görünür kılınır.
12. Mobil-önce + PWA (serwist NetworkFirst).
13. Vercel cron günlük 03:00 (`opsiyon_suresi→stok_acilis→freshness→kesif_followup`) + pg_cron 2×15dk.
14. **26 tablo, 13 enum, 2 bucket** (`proje-medya` public, `kyc-belge` private).
15. `birim_durum`: musait/opsiyonlu/satis_beklemede/satildi/stop/planli/kiralandi. Üç net satış durumu: satılabilir / planlı / kalıcı satılamaz (arsa payı).
16. Eklenti (otopark/depo) `birim.ana_birim_id`; KPI/tahsiste `ana_birim_id IS NULL` filtresi.
17. Tahsis boyutları: kapsam(blok/kat/tip/tür/birim) × hedef(herkes+segment/ofis/danışman) × şartlar(komisyon/münhasır/kontenjan/fiyat_gorunur/bitis).
18. **Müteahhit tarafından emlak danışmanına tanımlanan satış komisyonundan Projedar pay almaz; DB'de bu komisyon (`komisyon_tip/deger`) vardır.** İşlem ücreti karara bağlı değil (truth'a girmez).
19. Gelir: erken=müteahhit anlaşması (manuel) + emlakçı basic bedava; sonra=premium/SaaS. `abonelik`/`abonelik_paketi` + MRR altyapısı var.
20. Paylaşım HMAC token (16-hex, fallback yok); mikrosite RLS-bypass yalnız token kapısında; anonim KVKK-safe sinyaller.
21. Lead: HMAC + Zod + ayrı açık-rıza checkbox + 10dk throttle; `atanan_id=ilk_paylasan_id=emlakci`; RLS admin/atanan/ilk_paylaşan (müteahhit feed görmez, yalnız birebir sorgu).
22. Müşteri sahipliği garanti edilmez; "kim-getirdi görünürlüğü" (`ilk_paylasan_id`), arbitraj yok.
23. `events` append-only iz zinciri (INSERT service-role/SECURITY DEFINER); ayrı `denetim` tablosu yok.
24. Güven skoru DB RPC (yanıt/SLA/doğrulama/tazelik ağırlıklı; `<3 işlem` → "Yeni").
25. KYC: `kullanici_belge` + private bucket + admin onay + `belge_durumu_guard` trigger.
26. Keşif motoru: BYOK SerpAPI/Serper/Places + site e-posta kazıma → `aday` funnel → davet (Resend + WhatsApp deep-link) + takip cron; opt-out reaktif.
27. Public SEO: `/proje/[slug]` (ISR, çift kaynak DB+scraped `katalog_proje`, ince-içerik eşiği), `/konut-projeleri` hub, `/firma/[slug]`. **Canlı stok sayısı + fiyat public'te gösterilmez.**
28. SEO altyapı: robots (31 AI crawler), dinamik sitemap, llms.txt+llms-full.txt, dinamik OG, IndexNow, JSON-LD (Organization/WebSite/SoftwareApplication/Service/FAQPage/ApartmentComplex/CollectionPage).
29. Tasarım sistemi "Spatial Açık" (`globals.css`); sinyal trio müsait `#2fb36b`/opsiyon `#e3a12c`/satıldı `#d15a4e`; font Outfit/Inter/Geist Mono; kullanıcı dark mode yok.
30. Auth: Supabase e-posta/parola; kayıt → `handle_new_user` trigger → `onay_bekliyor` → admin onay → `panelYolu(rol)`.
31. E-posta Resend (best-effort); SMS/push yok. Harici analytics/ödeme/test yok.
32. `supabase-schema.sql` bilinçli eski; canlı = kök + `db/*.sql`; çelişkide `db/*` kazanır.
33. Ana sayfa "Canlı Portföy"/sayaçlar bilinçli MOCK ("örnek akış"); gerçek canlı veri yalnız panel/mikrosite.

**Bu 33 madde dışındaki "moat/en iyi/güven protokolü/EİDS muaf/%100/imkânsız" ifadeleri truth değildir → Bölüm B.**

---

# BÖLÜM E — SAYI DOĞRULAMA (self-verification, KANITLI)

Koddan (`grep create table` / `grep create type as enum` — supabase-schema.sql + db/*.sql + supabase/migrations/*.sql) doğrulanan kesin sayımlar:

**26 tablo:** profiles, ofis, uretici, proje, blok, daire_tipi, birim, tahsis, opsiyon, opsiyon_talep, lead, events, proje_belge, mahal, kullanici_belge, abonelik_paketi, abonelik, fiyat_kurali, bildirim, lansman, katalog_proje, pazarlama_entegrasyon, kesif_kampanya, aday, aday_temas, hesap_silme_talebi.

**13 enum:** rol, hesap_durum, birim_durum, birim_tur, islem_tipi, tapu_durum, sahiplik, komisyon_tip, opsiyon_yontem, insaat_asama, lead_kaynak, lead_durum, tahsis_hedef.

**2 bucket:** proje-medya (public), kyc-belge (private).

**Route doğrulaması (`/firma/[slug]`):** V2 taramadan yazıldı ama bu route KANITLI mevcut ve production-ready — `src/app/firma/[slug]/page.tsx` + `src/lib/seo/firma.ts` (ikisi de git-tracked, `sitemap.ts` + `proxy`/middleware'e bağlı; bugün P1-2'de eklendi). Yani A.9 ve D.27'deki `/firma/[slug]` doğrudur, çıkarılmaz.

**Not:** V1 ve alt dokümanlar (00, 04, PROJEDAR_AI_CONTEXT) "25 tablo / 14 enum" der — **HATALI.** Kanonik sayı: **26 / 13.** (V1 dosyaları referans olarak durur; kanonik = bu V2.)

---

# BÖLÜM F — SEKTÖREL/SEO İÇERİK İÇİN GÜVENLİ EŞLEME (çalışan özelliklere bağlan)

İçerik/CTA'ları **yalnız Bölüm A'daki çalışan özelliklere** bağla; hayali/gelecek özelliğe CTA verme. Absolutist/hukuki ifade kullanma (Bölüm B.4/B.5).

| İçerik sorusu | Bağlanacak GERÇEK özellik | Dikkat |
|---|---|---|
| "Stok teyidi / güncel stok nedir?" | Canlı `birim` + tazelik rozeti | "%100 doğru" deme → "son güncelleme görünür" |
| "Opsiyon nedir?" | Opsiyon motoru (3 yöntem) | — |
| "Müşteriye proje nasıl gönderilir?" | İmzalı mikrosite `/p/...` | Birebir/WhatsApp; "ilan değil" hukuki kesinlik verme |
| "Fiyat neden güncel değil?" | Tazelik sistemi + syndication | Müteahhit güncellemesine bağlı |
| "Aynı daire iki danışman opsiyonlayabilir mi?" | `opsiyon_tek_aktif` DB kilidi | "eşzamanlı aktif opsiyon çakışması engellenir" (imkânsız deme) |
| "Müşteri kaydı nasıl korunur?" | `ilk_paylasan_id` + lead flow | Sahiplik garantisi VERME |
| "Komisyon alıyor musunuz?" | Komisyon oranı DB'de (`komisyon_tip/deger`), Projedar pay almaz | "Müteahhitin danışmana tanımladığı satış komisyonundan Projedar pay almaz" / kısa: "Projedar emlakçı komisyonuna ortak olmaz" |

---

*Bu V2, Projedar'ın kanonik master hafızasıdır. V1 (`00-*`, `PROJEDAR_AI_CONTEXT.md`) ve diğer alt dokümanlar detay/kaynak olarak durur; sayı/claim çelişkisinde V2 esastır. AI context olarak paylaşırken Bölüm A (gerçek) + Bölüm C (gelir) + Bölüm D (truth) + Bölüm E (sayılar) yeterlidir; Bölüm B ifadelerini "konumlandırma/iddia" olarak etiketleyerek aktar.*
