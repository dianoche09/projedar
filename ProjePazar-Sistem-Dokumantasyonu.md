# ProjePazar : Sistem Dokümantasyonu (Kod Doğrulanmış)

> **Üretim tarihi:** 2026-07-26
> **Kaynak:** Repo'nun tam koddan taranması (45 sayfa, 7 API route, 19 tablo, 13 migration, 30 component, 15 lib modülü) + bağlayıcı dokümanlar (`ProjePazar-Sistem-Kurallari.md`, `ProjePazar-Devir-Dokumani.md`) + 170 commit geçmişi.
> **Amaç:** Ürünün ne olduğu, her aşamanın nasıl ilerlediği, ve sistemdeki tüm sayfaların içeriği/kapsamı/birbiriyle ilişkisi tek dosyada. Bu dosya durum fotoğrafıdır; bağlayıcı kaynak değildir (bağlayıcı kaynak: Sistem Kuralları).

---

## 1. Ürün özü (tek paragraf)

ProjePazar, çok müteahhitli, üretici kontrollü, **canlı bir konut stoğu dağıtım ağıdır**. Üretici (müteahhit) stoğunu, fiyatını, dağıtımını ve lead'ini tek noktadan yönetir; emlakçı yalnız kendine **tahsis edilmiş** projeleri tek canlı havuzdan görür, tek tıkla paylaşır ve lead toplar. Ortada **tek doğru kaynak** durur: bir fiyat/durum değişince tüm yetkili emlakçılara anında yansır. Konumlanma: "en hızlı satış yapılan ağ" ve gayrimenkulün **güven protokolü**. Tekil CRM değil, açık pazaryeri değil, ilan portalı değil, broker değil: saf satış altyapısı, komisyona dokunmaz.

**Çekirdek değer:** "Bu daire hâlâ satılık mı, fiyatı ne?" sorusuna her an %100 doğru cevap.
**Asıl moat:** üretici kontrolü (granüler tahsis) + veri yerçekimi (events Faz 1'den birikir, geçmişe doldurulamaz).

---

## 2. Stack ve mimari

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript strict) + Tailwind v4 + `motion` |
| Backend/DB | Supabase: PostgreSQL + Auth + Realtime + Storage + **RLS her tabloda** |
| Hosting | Vercel: serverless + tek günlük cron (`syd1` region) |
| PWA | serwist (service worker + manifest), mobil önce |
| Mail | Resend (transactional, best-effort) |
| Faz 2 | Claude API (parse/içerik), WhatsApp Cloud API (butonlu teyit) |

**Güvenlik mimarisi çekirdeği:** Görünürlük tamamen Postgres RLS'e devredilmiş. Sayfa kodunda `emlakci_id` filtresi bilerek yoktur; `tahsis` tablosu + RLS fonksiyonları görünürlüğü belirler. Service-role (`createAdminClient`) yalnız server action / cron / route handler'da kullanılır, `NEXT_PUBLIC` olmadığı için client bundle'ına girmez. Browser yalnız anon key kullanır.

**Klasör yapısı:**
```
src/app/(auth)/login         : giriş
src/app/kayit                : self-registration wizard (+ /belge KYC adımı)
src/app/uretici/...          : Müteahhit Konsolu (14 sayfa)
src/app/havuz/...            : Emlakçı Havuzu (10 sayfa)
src/app/admin/...            : Admin Paneli (platform işletmecisi, 9 sayfa)
src/app/p/[emlakci]/[birim]/[token]  : imzalı paylaşım mikrositesi (public)
src/app/api/...              : cron dispatcher + lead + etkileşim + emlakçı arama
src/lib/supabase             : client / server / admin / middleware
src/lib/*                    : belge, bildirim, events, sharing, stok, tahsis, telefon...
src/components               : Berrak Güven tasarım sistemi bileşenleri
db/                          : 13 migration (canlıda uygulandı)
supabase-schema.sql          : ana şema (16 tablo; 13 migration merge bekliyor)
```

---

## 3. Roller ve panelleri (DEĞİŞMEZ)

Her rol **AYRI** yüzey görür. Bir rolün ekranı başka role gösterilmez.

| Rol kodu | Kim | Panel | Faz 1 durumu |
|---|---|---|---|
| `uretici` | Müteahhit (Ü1 pro / Ü2 concierge) | **Müteahhit Konsolu** (`/uretici`) | ✅ tam |
| `emlakci` | Danışman (E1 pro / E2 basit) | **Emlakçı Havuzu** (`/havuz`) | ✅ tam |
| `ofis_yetkili` | Emlak ofisi / franchise | Faz 1'de ayrı panel yok, `/havuz` görür | Faz 2 konsol |
| `marka_yetkili` | Remax/C21 marka | Faz 2 | ayrı panel yok |
| `arsa_sahibi` | Kat karşılığı arsa sahibi | Faz 2 (salt-okunur) | ayrı panel yok |
| `admin` | **BİZ (platform işletmecisi)** | **Admin Paneli** (`/admin`) | ✅ tam |

**KRİTİK AYRIM (kodda doğrulandı):** `admin` ASLA üretici değildir. Admin paneli stok/birim/fiyat/bina kesiti düzenleme ekranı içermez; yalnız gelir, hesap, doğrulama, denetim yapar. Admin gerektiğinde üretici panelini "impersonation" ile görebilir (amber uyarı bandıyla), ama kendi paneli üretici işi görmez. Rol → panel eşlemesi: `src/lib/roller.ts` (`panelYolu()`).

---

## 4. Aşama ilerleyişi : yol haritası vs gerçek durum

Devir Dokümanı 12 PR'lık bir build sırası tanımlar. Aşağıda her PR'ın **gerçek koda ve commit geçmişine göre** (170 commit, 16 Haz > 26 Tem) durumu. Not: proje yol haritasından **iki kez stratejik reframe** geçirdi (aşağıda), bu yüzden bazı PR'lar "yapıldı ama modeli değişti" durumunda.

### 4.1 PR bazlı durum

| PR | Kapsam | Durum | Not / gerçek uygulama |
|---|---|---|---|
| PR-1 | Scaffold (Next.js+Tailwind+Supabase+Auth+PWA+tasarım tokenları) | ✅ | İlk commit `feat: PR-1 scaffold + PR-2 şema` |
| PR-2 | Şema & RLS & seed | ✅ | 16 tablo + çift-satış index + RLS; sonradan 13 migration ile 19 tabloya evrildi |
| PR-3 | Üretici stok + künye + zaman çizelgesi + belge | ✅ | Wizard (7 adım) + kurulum + generator + Excel import + medya/belge |
| PR-4 | Tahsis + komisyon | ✅ → **evrildi** | Klasik "isim seç" tahsis, **segment tahsise** dönüştü (Tüm ağ/Marka/Şehir/Uzmanlık); daire bazlı kapsam eklendi |
| PR-5 | Emlakçı havuz + proje detay + daire modal | ✅ | Havuz + proje detay + `EmlakciStok` (Realtime canlı fiyat) |
| PR-6 | Opsiyon makinesi + audit log | ✅ → **evrildi** | Doğrudan opsiyon **kaldırıldı**; emlakçı yalnız **talep** açar, müteahhit **onaylar** (RPC + FOR UPDATE kilidi). Çift-satış kalkanı DB'de |
| PR-7 | Paylaşım + Lead Protection + public microsite | ✅ / **kısmi** | İmzalı mikrosite (`/p/`) tam olgun. Ayrı `public_slug` proje mikrositesi **Faz 2** (404 link basılmıyor) |
| PR-8 | Lead Engine V0.1 + eşleştirme bildirimi | **REVİZE** | Lead Engine **kaldırıldı** (2026-06-18 kararı). Yerine: sorgu-only lead modeli + Müşteri Eşleştirme + in-app/mail bildirim |
| PR-9 | Tazelik + fiyat sapma | ✅ | `freshness` cron (15 gün > stale), on-platform fiyat kilidi (emlakçı fiyat değiştiremez) |
| PR-10 | Admin/Concierge + belge doğrulama rozeti | ✅ **genişledi** | "Minimal admin" yerine **kapsamlı** admin: MRR, onay kuyruğu, üretici/ofis doğrulama+abonelik, KYC belge review, denetim izi |
| PR-11 | PWA/saha cilası + deploy | ✅ | `PwaKur`, mobil cila, canlı Vercel deploy |
| PR-12 | Hesaplama araçları (SEO mikrosite) | ⛔ **yapılmadı** | Çekirdek dışı, ertelendi |

### 4.2 Yol haritası ötesinde eklenen (reframe ürünleri)

Bu işler orijinal PR listesinde yoktu; iki reframe sonrası "veri yerçekimi" tezine göre eklendi:

- **Talep Radarı / Satış Zekâsı** (`/uretici/talep-radari`) : events tabanlı dönüşüm hunisi + içgörü. Rakiplerin yapamadığı davranış verisi = moat.
- **Dinamik Fiyat Önerisi** (`/uretici/fiyat-onerisi`) : events talep sinyalinden fiyat nudge (öneri-only, fiyatı değiştirmez).
- **Müşteri Eşleştirme** (`/havuz/eslestir`) : kritere göre tahsisli havuzdan en uygun birim (fit-skor; NLP katmanı Faz 2).
- **Segment tahsis** : müteahhit isim aramaz, segmente açar (marka/şehir/uzmanlık).
- **KYC belge gate** : doğrulanmamış emlakçı yalnız demo proje görür (DB seviyesinde).
- **In-app + mail bildirim** : opsiyon talep/onay, tahsis, lead için anlık bildirim.

### 4.3 İki stratejik reframe (neden yol haritasından saptı)

1. **2026-06-18 : Lead Engine kaldırıldı.** "Platform lead dağıtmaz/garanti vermez" kararı. Model: danışman kendi lead'ini toplar, müteahhit yalnız ad/telefon **sorgular** ("kim getirdi görünürlüğü"). Gelir modeli fazlandı: erken = müteahhit anlaşması + emlakçı bedava.
2. **2026-06-28/29 : "Sales Intelligence Platform" tezi.** Her özellik için pusula: "veri yerçekimini artırıyor mu?" Kategori netleşti: **"Tahsisli Canlı Satış Ağı"**. Landing geliştirici-önce konumlandı; PaylasimVitrin (sosyal medya paylaşım iddiası) EİDS ceza riski nedeniyle kaldırıldı.

### 4.4 Şu anki genel durum

> **Roadmap çekirdeği büyük ölçüde bitti.** Stok + tahsis + opsiyon(talep-onay) + paylaşım + lead(sorgu) + tazelik + admin + KYC + analitik hepsi commit'li ve canlıda. **Kalan gerçek frontlar:** (a) mikrosite medya zenginleştirme (video embed / harita / interaktif ödeme slider), (b) QA/cila sweep, (c) Faz 2 dış bağımlılıklar (WhatsApp Cloud API, AI/LLM, KYC AI oto-doğrulama, mail env). Ayrıca **commit edilmemiş** aktif iş: KYC belge yükleme akışı (working tree'de).

---

## 5. Veritabanı şeması (19 tablo)

> Ana şema `supabase-schema.sql` 16 tablo tanımlar; `db/` altındaki 13 migration 3 tablo daha ekler (`mahal`, `kullanici_belge`, `bildirim`) ve mevcut tabloları genişletir. **Kod migration kolonlarını kullanır**; canlıda hepsi uygulanmış varsayılır. Ana şema dosyası tek başına deploy edilirse eksik kalır (merge bekliyor).

### 5.1 Çekirdek tablolar

| # | Tablo | Rol | RLS özeti |
|---|---|---|---|
| 1 | **profiles** | Kullanıcı (auth.users 1-1). rol, ad, telefon, ofis_id, durum (onay yaşam döngüsü), `belge_durumu` (KYC), marka/il/ilce/uzmanlik (segment) | self + admin görür; `belge_durumu_guard` trigger emlakçının kendini doğrulamasını engeller |
| 2 | **ofis** | Emlak ofisi/franchise | herkes okur (liste), yazma admin |
| 3 | **uretici** | Müteahhit firma. dogrulanmis (güven rozeti), sahip_id | sahip veya admin |
| 4 | **proje** | Proje künyesi + konum + inşaat zaman çizelgesi + `public_slug` + `demo` (vitrin) + Faz 2 yurtdışı alanları | sahip üretici tam; emlakçı yalnız tahsisli (`emlakci_proje_tahsisli()`) |
| 5 | **blok** | Proje bloğu | sahip; tahsisli emlakçı okur |
| 6 | **daire_tipi** | Daire tipi (3+1 vb.), plan_url, taban_fiyat, banyo/balkon/otopark | sahip (CRUD şart); tahsisli emlakçı okur |
| 7 | **birim** | **TEK DOĞRU KAYNAK** (fiyat/durum). tur, islem_tipi, satilabilir, satisa_acilis, durum, liste_fiyati, odeme_plani jsonb, ana_birim_id (eklenti), stale | sahip tam; emlakçı yalnız `emlakci_birim_gorebilir()` (daire bazlı + KYC + segment). **Realtime publication'da** |
| 8 | **tahsis** | **GÖRÜNÜRLÜĞÜN KAYNAĞI**. kapsam jsonb (blok/kat/tip/tür/birim), hedef_tip, hedef_filtre (segment), komisyon, münhasır | yalnız sahip üretici/admin |
| 9 | **opsiyon** | Birim kilidi. satici_id, durum, kilit_bitis | **çift-satış kalkanı: `opsiyon_tek_aktif` unique partial index**. INSERT admin-only (talep→onay) |
| 10 | **lead** | Müşteri talebi. telefon_norm, atanan_id, ilk_paylasan_id, kvkk_riza | insert public (server token doğrular); SELECT yalnız admin + atanan/ilk_paylaşan emlakçı (2026-07-24 daraltıldı, üretici feed görmez) |
| 11 | **events** | Append-only audit (paylaşım/görüntüleme/lead/opsiyon) | select admin/kendi/sahip; **INSERT policy yok → yalnız service-role yazar** |
| 12 | **proje_belge** | Ruhsat/iskan/yapı denetim + kapak medya | sahip; tahsisli emlakçı okur |
| 13 | **abonelik_paketi** | SaaS kademe tanımı (admin gelir) | herkes okur; yazma admin |
| 14 | **abonelik** | Atanan abonelik (ofis VEYA üretici) | abone başına tek aktif (unique partial index); admin tam, self okur |
| 15 | **fiyat_kurali** | (Faz 2 hazır) dinamik fiyatlama | sahip üretici/admin |
| 16 | **opsiyon_talep** | Opsiyon talep→onay. durum, karar_veren_id, opsiyon_id | `opsiyon_talep_bekleyen_tek` unique (dup engeli); emlakçı tahsisli+müsait birime talep açar |
| 17 | **mahal** | (migration) Teslim standardı (zemin/duvar/tavan/marka) | sahip; tahsisli emlakçı okur |
| 18 | **kullanici_belge** | (migration) KYC belge (mesleki_yeterlilik/vergi_levhasi), ai_sonuc jsonb | self/admin; private `kyc-belge` bucket |
| 19 | **bildirim** | (migration) in-app bildirim | self okur/günceller; **INSERT policy yok → service-role yazar** (spoof engeli) |

### 5.2 Üç teknik değişmezin DB karşılığı

1. **RLS-önce (Değişmez #1):** Görünürlük `tahsis` + SECURITY DEFINER fonksiyonlar (`emlakci_birim_gorebilir` 6-arg: daire bazlı + KYC gate + segment filtre). Client'ta service-role yok.
2. **Tek doğru kaynak (Değişmez #2):** Fiyat/durum yalnız `birim`'de. Mikrosite ve havuz fiyatı canlı değerden basar, kopya tutmaz. `EmlakciStok`/`CanliIzgara` Realtime ile birim değişimini dinler.
3. **Çift-satış kalkanı DB'de (Değişmez #3):** `opsiyon_tek_aktif` unique partial index + `opsiyon_birim_senkron` trigger + `opsiyon_talep_bekleyen_tek` + onay RPC'de `FOR UPDATE`. Uygulama katmanına güvenilmez.

### 5.3 Migration kronolojisi (13 dosya)

| Tarih | Dosya | Ne ekledi |
|---|---|---|
| 06-17 | birim-realtime | birim tablosu Realtime publication'a |
| 06-17 | daire-tipi-detay | daire_tipi: banyo/balkon/otopark |
| 06-17 | mahal-listesi | mahal tablosu (teslim standardı) |
| 06-17 | proje-medya-storage | `proje-medya` public bucket |
| 06-28 | odeme-plani | `birim.odeme_plani` jsonb |
| 06-29 | opsiyon-talep-onay | Opsiyon talep→onay akışı; doğrudan opsiyon admin-only |
| 06-29b | opsiyon-talep-saglamlik | bekleyen-tek unique + FOR UPDATE kilidi (race engeli) |
| 06-29c | kyc-belge-dogrulama | KYC gate: belge_durumu + proje.demo + guard trigger + kullanici_belge + kyc-belge bucket |
| 06-29d | tahsis-daire-kapsam | daire bazlı kapsam (`kapsam.birimler`), 6-arg görünürlük fonksiyonu |
| 06-30 | eklenti-birim | `birim.ana_birim_id` (otopark/depo eklenti) |
| 07-01 | emlakci-kategorizasyon-segment | marka/il/ilce/uzmanlik + `tahsis.hedef_filtre` (segment tahsis) |
| 07-01b | bildirim | bildirim tablosu + self RLS |
| 07-24 | lead-select-rls | lead_select daraltma (üretici feed'i kaldırıldı) |

---

## 6. Sayfa envanteri (panel panel)

Her sayfa: rota, rol, amaç, içerik, veri kaynağı, ilişki, durum. Toplam 45 sayfa.

### 6.A PUBLIC + AUTH + KAYIT (13 sayfa)

**`/` (ana hub landing)** : Public, ancak giriş yapmışı panele yönlendirir (`durum!=aktif` → `/hesap-bekliyor`). Çift taraflı pazarlama/SEO landing'i. Hero + canlı portföy (statik demo) + ağ etkisi + `CanliHavuzDemo` + `CanliKomutaMerkezi` + SSS + JSON-LD (Organization/WebSite/FAQPage). İçerik hardcoded (DB'den proje çekmez). Link: `/muteahhit`, `/emlakci`, `/login`, `/kayit`. **Durum: tam işlevsel.**

**`/muteahhit` (üretici rol landing)** : Public, auth redirect yok. Müteahhide özel ikna: komisyonsuz + tahsis sende + DB çift-satış kalkanı. `NasilCalisirAdimlar` (4 adım canlı mini-simülasyon), isim vermeden karşılaştırma tablosu, "Kurucu Müteahhit" kıtlık kartı, EİDS uyum şeridi. CTA → `/kayit?rol=uretici`. **Durum: tam işlevsel (statik).**

**`/emlakci` (emlakçı rol landing)** : Public. "Tamamen ücretsiz, komisyonun %100'ü senin." Dert→çözüm (bayat Excel kaosu vs canlı `HavuzKarti`), 3 adım, KYC olumlu-gate kartı, `TazelikDemo`. CTA → `/kayit?rol=emlakci`. **Durum: tam işlevsel (statik + 2 demo).**

**`/tasarim` + `/tasarim/[yon]`** : Dahili tasarım karar aracı (pazarlama değil). Aynı örnek projeyi 4 tasarım "ruhunda" (luks/minimal/cesur/sicak) full-screen mockup'ta gösterir. `generateStaticParams`. **Durum: tam işlevsel statik prototip.**

**`/login`** : Public. E-posta/parola giriş. `AuthKabuk` + form → `girisYap` action. `girisYap`: Zod doğrulama, `signInWithPassword`, `son_giris` işaretle, `durum!=aktif` → `/hesap-bekliyor`, değilse `panelYolu(rol)`. **Durum: tam işlevsel.**

**`/kayit` (+ `KayitForm`)** : Public, giriş yapmışı `/`'a atar. 2-3 adımlı self-registration. Rol seçimi (uretici/ofis_yetkili/emlakci) + alanlar (uretici→vergi_no, ofis→ofis_adi). `kayitOl`: signUp + user_metadata; DB trigger `handle_new_user` `onay_bekliyor` başlatır. emlakci → `/kayit/belge`, diğer → `/hesap-bekliyor`. **Durum: tam işlevsel** (e-posta onayı test için kapalı, prod öncesi gözden geçir).

**`/kayit/belge` (KYC wizard 3/3)** : Giriş gerektirir. Danışman yetki belgesi (mesleki yeterlilik + vergi levhası) yükleme, atlanabilir. `kayitBelgeYukle` → `belgeleriKaydet` (`kyc-belge` bucket + `kullanici_belge` beklemede + `profiles.belge_durumu=beklemede`). **Durum: tam işlevsel.** (Not: working tree'de commit edilmemiş aktif iş bu akış.)

**`/hesap-bekliyor`** : Giriş gerektirir, aktif hesap → `/`. Durum-özel bekleme ekranı (onay_bekliyor/pasif/askida/arsivli). WhatsApp CTA ile hızlı aktivasyon + çıkış. **Durum: tam işlevsel.** Kozmetik bug: WhatsApp mesajında çift-encode (`%2520`).

**`/gizlilik`, `/kvkk-aydinlatma`, `/kullanim-kosullari`** : Public, `noindex`. KVKK/hukuki statik metinler. Mikrosite lead formu `/kvkk-aydinlatma`'ya link verir. **Durum: işlevsel ama TASLAK** (kod yorumunda "yayın öncesi hukuki inceleme gerekir").

**`/p/[emlakci]/[birim]/[token]` (paylaşım mikrositesi) ⭐** : **Public (anonim müşteri).** Sistemin en olgun sayfası. Detay Bölüm 8'de. **Durum: tam işlevsel.**

### 6.B ÜRETİCİ PANELİ (`/uretici`, 14 sayfa)

Layout guard: giriş yoksa `/login`; rol `uretici`/`admin` değilse `/`. Admin görürse amber "Admin olarak görüntülüyorsun" bandı.

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/uretici` (Kokpit) | Canlı stok komuta merkezi | 6 KPI + stok dağılım barı + proje kartları + basit Talep Radarı (stok-metrik) + full-width stok tablosu | ✅ tam |
| `/uretici/projeler` | Proje listesi | Kapaklı kart grid (stok/tazelik/fiyat aralığı) | ✅ tam |
| `/uretici/proje/yeni` | 7 adım kurulum sihirbazı | `ProjeWizard`: künye→blok/tip→birim üretimi→fiyat/ödeme→medya→tahsis→yayınla | ✅ tam |
| `/uretici/proje/[id]` | Günlük operasyon/satış | `BinaKesiti` (birim durum yönetimi) + **TAHSİS (MOAT)** CRUD + medya | ✅ tam (operasyonel çekirdek) |
| `/uretici/proje/[id]/kurulum` | Bir-kez kimlik | Künye/imar/yatırım/ödeme/mahal/stok kurulumu/tanıtım/belge | ✅ tam |
| `/uretici/stok` | Tek canlı fiyat listesi | `StokTablo` + `DaireModal` (üretici modu), `?durum=` filtre | ✅ tam |
| `/uretici/tahsis` | Dağıtım genel bakış | Proje bazlı tahsis tablosu (salt-okunur; CRUD proje detayda) | ✅ tam (view) |
| `/uretici/opsiyonlar` | Onay kuyruğu + kilitler | Bekleyen opsiyon talepleri (`TalepKarar` onay/red) + aktif kilit tablosu | ✅ tam |
| `/uretici/talep-radari` | Satış Zekâsı (veri-moat) | events dönüşüm hunisi + içgörü kartları + aktif danışmanlar + hareket feed | ✅ tam (events doluluğuna bağlı) |
| `/uretici/fiyat-onerisi` | Dinamik fiyat önerisi | events talep skoru → fiyat nudge (öneri-only) | ✅ tam (⚠️ sahiplik filtre riski, aşağıda) |
| `/uretici/raporlar` | Performans özeti | Daire tipi bazlı satış oranı (`YiginBar`) | ✅ tam (dar kapsam) |
| `/uretici/lead-sorgu` | Müşteri sorgula (kapalı-devre) | ad/telefon birebir eşleşme → "ilk kaydeden danışman"; toplu listeleme YOK | ✅ tam |
| `/uretici/bildirimler` | Bildirimler | Son 100 → `BildirimListe` | ✅ tam |
| `/uretici/ayarlar` | Profil + firma (salt-okunur) | Doğrulama rozeti, firma bilgisi; düzenleme concierge'de | ✅ kısmi (kasıtlı salt-okunur) |

### 6.C EMLAKÇI HAVUZU (`/havuz`, 10 sayfa)

Layout guard: izinli roller `emlakci/admin/ofis_yetkili/marka_yetkili/arsa_sahibi`. Doğrulanmamış emlakçı (`belge_durumu!=dogrulandi`) → "yalnız demo" bandı + `/havuz/dogrulama` CTA.

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/havuz` (Canlı Havuz) | Tahsisli projeler komuta ekranı | `HavuzListe`: filtreler + 4 KPI + proje kartları (stok bar, tazelik rozeti) + WhatsApp paylaş | ✅ tam |
| `/havuz/proje/[id]` | Proje detay + canlı fiyat listesi | Hero/künye/plan/mahal + `EmlakciStok` (Realtime). Her birim `/p/` mikrosite linki üretir | ✅ tam |
| `/havuz/opsiyonlarim` | Opsiyonlarım | Aktif kilitler (48s geri sayım) + bekleyen talepler (geri çek) | ✅ tam |
| `/havuz/paylastiklarim` | Paylaşım izleri | events (tip=paylasim) listesi, canlı fiyatla | ✅ tam |
| `/havuz/leadler` | Lead'lerim | Lead kartları + durum ilerletme + ara/WhatsApp | ✅ tam |
| `/havuz/eslestir` | Müşteri Eşleştirme | Kritere göre fit-skor sıralaması (NLP Faz 2) | ⚠️ kısmi (çekirdek çalışır) |
| `/havuz/bildirimler` | Bildirimler | Son 100 → `BildirimListe` | ✅ tam |
| `/havuz/dogrulama` | Hesap doğrulama (KYC) | Belge yükleme (`belgeYukle`) + durum kartı | ✅ tam |
| `/havuz/profil` | Profil (salt-okunur) | Kimlik + bağlı ofis; düzenleme yok | ✅ tam (kasıtlı) |

**Kritik doğrulama:** Emlakçı yalnız tahsisli birimi görür; filtre kodda değil, RLS'te (`birim_emlakci_select`). Doğrulanmamış emlakçı yalnız `proje.demo=true` görür (demo id sabit). Opsiyon: emlakçı doğrudan kilit ALAMAZ, `opsiyon_talep` (beklemede) yazar → müteahhit onaylar.

### 6.D ADMIN PANELİ (`/admin`, 9 sayfa)

Guard iki katmanlı: `layout.tsx` (rol=admin değilse `/`) + her action'da `adminGuard()`. Panel footer'ı: "Bu panel stok/birim/bina kesiti görmez : gelir, hesap, doğrulama, denetim odaklıdır."

| Rota | Amaç | Ana içerik | Durum |
|---|---|---|---|
| `/admin` (Genel Bakış) | Platform komuta merkezi | MRR + onay kuyruğu + üretici doğrulama + ofis abonelik + denetim son 5 | ✅ tam |
| `/admin/kullanicilar` | Tüm hesaplar | Liste + yeni kullanıcı oluştur (service-role) | ✅ tam |
| `/admin/kullanicilar/[id]` | Hesap detay | Profil + parola sıfırla + durum değiştir | ✅ tam |
| `/admin/ureticiler` | Müteahhit firmalar | Hesap aç + güven rozeti (doğrula) + **abonelik ata (ANA gelir)** | ✅ tam |
| `/admin/ofisler` | Ofisler | Hesap aç + koltuk kapasitesi + paket ata | ✅ tam |
| `/admin/uyelik` | Üyelik paketleri | `PaketYonetimi` CRUD (fiyat/kota; hardcode yok) | ✅ tam |
| `/admin/onay` | Onay kuyruğu | Bekleyen kayda rol+ofis ata → onayla/reddet | ✅ tam |
| `/admin/dogrulama` | KYC belge review | `kyc-belge` imzalı URL (1sa) + doğrula/reddet | ✅ tam (service-role) |
| `/admin/denetim` | İz zinciri | events son 100, tip filtreli | ✅ tam (service-role) |

**Üç ayrı onay/doğrulama akışı (kodda ayrı tablo/sayfa):** (a) kayıt onayı (`profiles.durum`), (b) üretici güven rozeti (`uretici.dogrulanmis`), (c) KYC belge (`kullanici_belge.durum` + `profiles.belge_durumu`). service-role yalnız 4 hesap-açma/parola action'ında ve denetim/dogrulama okumasında; hepsi graceful fallback'li.

---

## 7. API ve cron

Cron çizelgesi `vercel.json`: tek path `/api/cron`, `schedule: "0 3 * * *"` (her gün 03:00 UTC), region `syd1`. Vercel Hobby limiti nedeniyle tek cron; üç iş dispatcher içinde sırayla.

| Endpoint | Metod | İş | Güvenlik |
|---|---|---|---|
| `/api/cron` | GET | Dispatcher: opsiyon_suresi → stok_acilis → freshness (sırayla) | `cronYetkiKontrol` **fail-closed** (CRON_SECRET yoksa 500) |
| `/api/cron/freshness` | GET | 15 günden eski birimi `stale=true` (Değişmez #5) | service-role |
| `/api/cron/option-expiry` | GET | Süresi geçen opsiyonu sil (trigger birimi musait yapar) + audit | service-role |
| `/api/cron/stok-acilis` | GET | `planli` + `satisa_acilis<=now` birimi musait yap | service-role |
| `/api/etkilesim` | POST | Mikrosite anonim `favori` sinyali (PII yok) | HMAC token doğrular |
| `/api/lead` | POST | Public lead formu | Zod + HMAC token + telefon normalize + 10dk throttle |
| `/api/uretici/emlakci-ara` | GET | Tahsis danışman arama + segment sayımı | anon rol-guard → service-role (guard'lı) |

---

## 8. Paylaşım mikrositesi (`/p/...`) : uçtan uca akış

Sistemin en kritik ve olgun parçası. Kapalı-devre paylaşımın kalbi.

1. **Token üretimi:** Emlakçı `/havuz/proje/[id]`'de her birim için `generateShareToken(emlakciId, birimId)` = HMAC-SHA256 ilk 16 char (`LEAD_SHARE_SECRET`, fallback YOK). Link: `/p/{emlakci}/{birim}/{token}`.
2. **Paylaşım:** `PaylasWhatsApp` tıklanınca `paylasimKaydet` anonim event yazar, sonra `wa.me` deep-link açar (emlakçının kendi telefonundan, ücretsiz).
3. **Mikrosite açılışı (anonim):** `verifyShareToken` eşleşmezse `notFound()`. Veri `createAdminClient` (RLS bypass, server-only) ile çekilir: danışman + birim + proje + üretici + tip + benzer birimler + eklentiler + kapak.
4. **Canlı fiyat basımı:** Fiyat `birim.liste_fiyati`'ndan o anki değerle (kopya yok, Değişmez #2). Ödeme planı `odeme_plani` jsonb'den hesaplanır. `satilabilir=false` → "satışa kapalı".
5. **Tazelik:** `tazelikRenk(son_guncelleme)` nabız animasyonlu nokta + "X önce güncellendi".
6. **Event kaydı:** `after()` ile anonim görüntüleme (`events`, service-role, fire-and-forget). **KVKK-safe: müşteri kimliği/IP/telefon YOK.**
7. **Lead formu:** Yalnız `satilabilir && musait` ise. Niyet + ad + telefon + **ayrı açık-rıza checkbox** (KVKK İlke Kararı 2026/347). POST `/api/lead` → token doğrula + normalize + throttle → `lead` insert (atanan=ilk_paylasan=emlakci) + event + danışmana bildirim. PII yalnız lead sahibi danışmana gider.
8. **Lead sonucu** → emlakçının `/havuz/leadler` ekranına düşer. Zincir kapalı.

---

## 9. Lib ve component envanteri

### 9.1 Lib modülleri (15)

| Modül | İş |
|---|---|
| supabase/admin | `createAdminClient` service-role (server-only, env eksikse throw) |
| supabase/client | browser anon client (RLS) |
| supabase/server | SSR/action client (anon + cookie) |
| supabase/middleware | Oturum tazeleme + public rota beyaz-liste + korumalı rota gate |
| belge | `belgeleriKaydet`: KYC upload + kullanici_belge + belge_durumu |
| bildirim | `bildirimYaz/bildirimlerYaz` (admin client) + best-effort mail |
| events | `kayitYaz/kayitlarYaz` append-only audit (service-role, fire-and-forget) |
| gorsel | `projeKapak` deterministik fallback kapak |
| mail | Resend transactional (best-effort, HTML escape'li) |
| roller | `panelYolu` rol→panel eşleme |
| sharing | `generateShareToken/verifyShareToken` HMAC (fallback yok) |
| stok | Durum/tazelik/para yardımcıları (sinyal renkleri tek kaynak) |
| tahsis | `tahsisEmlakcilari/tahsisSecenekleri` (admin client) |
| telefon | `normalizeTelefon` +90 formatı |
| types | Paylaşılan DB tipleri + `fmtPara/zamanOnce` |
| uuid | Lenient UUID (demo seed id'leri için) |
| zaman | `simdiMs` (React Compiler purity) |

### 9.2 Component'ler (30)

**Domain:** BinaKesiti (bina kesiti ızgarası), BirimHucre (durum-renkli hücre), DaireModal (merkezi daire detay: üretici/emlakçı modu), EmlakciStok (Realtime stok), SecimDuzenle (toplu düzenle), ProjeKomutBari (proje KPI + tazele), PaylasWhatsApp (deep-link + sinyal), KatPlani (SVG fallback plan), CanliIzgara (emlakçı Realtime kesiti).

**Landing (örnek/demo veri):** HeroBina, HeroPanel, CanliHavuzDemo, CanliKomutaMerkezi, Sayaclar, Reveal, MagneticButton, GridMark, Logo.

**Admin:** PaketYonetimi (abonelik paketi CRUD).

**ui/:** AuthKabuk, BottomNav, EmlakciNav, UreticiNav, AdminNav (implied), Form (Input/Textarea/Select ≥44px dokunma), Grafik (Donut/YiginBar), LogoLoader, PwaKur, SubmitButton (useFormStatus), Toast (bağımlılıksız).

---

## 10. Sayfa ilişki haritası (akışlar)

**Onboarding akışı:**
```
/ (landing) → /kayit?rol=X → kayitOl → (emlakci) /kayit/belge → /hesap-bekliyor
                                     → (uretici/ofis) /hesap-bekliyor
admin onaylar (/admin/onay) → durum=aktif → login → panelYolu(rol)
```

**Üretici kurulum zinciri:**
```
/uretici/proje/yeni (wizard) → projeOlustur → /kurulum
  → blok/tip → birimGenerator/excelImport → fiyat/ödeme → medya → TAHSİS
  → /uretici/proje/[id] (operasyon)
```

**Tahsis → görünürlük → paylaşım → lead zinciri:**
```
üretici: tahsisEkle (segment/ofis/danışman + kapsam)
   ↓ RLS (emlakci_birim_gorebilir)
emlakçı: /havuz → /havuz/proje/[id] → generateShareToken
   ↓ PaylasWhatsApp (deep-link)
müşteri: /p/{...}/{token} → LeadForm → /api/lead
   ↓
emlakçı: /havuz/leadler   +   üretici: /uretici/lead-sorgu (sorgu-only)
```

**Opsiyon talep → onay zinciri:**
```
emlakçı: opsiyonTalepGonder → opsiyon_talep (beklemede) → bildirim
   ↓
üretici: /uretici/opsiyonlar → talepOnayla (RPC + FOR UPDATE)
   ↓ opsiyon_tek_aktif unique index (çift-satış kalkanı)
opsiyon (kilit) → birim.durum senkron (trigger) → emlakçıya bildirim
   ↓ /havuz/opsiyonlarim (48s geri sayım)
cron/option-expiry: süre dolunca sil → birim musait
```

**Analitik veri akışı:**
```
paylaşım/görüntüleme/lead/opsiyon → events (append-only)
   ↓
/uretici/talep-radari (dönüşüm hunisi) + /uretici/fiyat-onerisi (fiyat nudge)
   ↓
/admin/denetim (iz zinciri)
```

---

## 11. Bilinen kusurlar ve riskler (kod taramasından)

> **Güncelleme (2026-07-27):** Aşağıdaki #1 ve #8 tarama sırasında bildirilmiş ama koddan doğrulanınca **geçersiz/çözülmüş** çıktı (commit `f1a6311`). #5 bu oturumda düzeltildi. Kod-doğrulama, agent bulgularına körü körüne güvenmemenin neden gerekli olduğunu gösterdi.

| # | Konu | Etki | Durum |
|---|---|---|---|
| 1 | ~~`fiyat-onerisi` sahiplik filtresi tutarsız~~ | — | ✅ **Yanlış alarm.** Kod doğru zinciri kullanıyor: `uretici.sahip_id → uretici.id → proje.uretici_id` (page.tsx:62-67). `f1a6311`'de düzeltilmiş |
| 2 | `bildirimler` + layout bildirim sayımı `profile_id` filtresiz, tamamen RLS'e güveniyor | RLS gevşerse sızıntı | 🟡 RLS testi öner |
| 3 | 3 hukuki sayfa "TASLAK, hukuki inceleme gerekir" | Yayın riski | 🟡 avukat |
| 4 | Kayıt e-posta onayı test için kapalı | Prod öncesi açılmalı | 🟡 |
| 5 | ~~`/hesap-bekliyor` WhatsApp linkinde çift-encode (`%2520`)~~ | Kozmetik | ✅ **Düzeltildi** (2026-07-27, `%2520`→`%20`) |
| 6 | `leadler`/`paylastiklarim` limit-100 dışında hacim koruması yok | Büyümede | 🟢 |
| 7 | `supabase-schema.sql` 13 migration'ı merge etmemiş | Tek-dosya deploy eksik kalır | 🟡 |
| 8 | ~~`projepazar-sistem/` untracked çöp klasör~~ | Secret commit riski | ✅ **Çözülmüş.** `.gitignore:42`'de ignore ediliyor (`f1a6311`) |

---

## 12. Değişmezler ve güvenlik özeti (uyum durumu)

| Değişmez | Durum | Kanıt |
|---|---|---|
| #1 RLS-önce | ✅ | Görünürlük tahsis+RLS; service-role 7 yerde, hepsi server-only+guard'lı |
| #2 Tek doğru kaynak | ✅ | Fiyat yalnız birim'de; mikrosite/havuz canlı basar; Realtime |
| #3 Çift-satış DB'de | ✅ | unique partial index + trigger + FOR UPDATE onay RPC |
| #4 WhatsApp hibrit | ✅ (MVP) | Yalnız giden deep-link; serbest-metin AI parse yok (Faz 2) |
| #5 Tazelik görünür | ✅ | Her yazışta son_guncelleme; freshness cron; stale rozet |
| #6 Mobil-önce + PWA | ✅ | serwist, PwaKur, ≥44px dokunma, BottomNav |

**Ek güvenlik kalkanları:** KYC gate (belge_durumu_guard trigger), HMAC token fail-safe (LEAD_SHARE_SECRET fallback yok), cron fail-closed (CRON_SECRET), lead public insert kontrollü (token+Zod+throttle+normalize), IDOR kalkanları (medya/tip yükleme sahiplik kontrolü).

---

## 13. Faz 2 (kod yazma, sınır)

WhatsApp serbest-metin AI parse · Paylaşım Stüdyosu premium · ödeme planı motoru (döviz/senet) · dinamik fiyat otomasyonu (fiyat_kurali hazır) · opsiyon talep+kod · arsa sahibi paneli + pay bildirimi · fiyat/talep zekası killer paneller · marka konsolu · yurtdışı projeler (ülke/döviz/getiri/oturum/çok-dil alanları şemada hazır, boş) · Identity Graph (KVKK kapısı, kullanıcı kararı bekliyor) · finansal katman.

**NE YAPMAYIZ (kategori dışı):** 3D/immersive stüdyo motoru · tam CRM/ERP · online ödeme/escrow + otomatik sözleşme · fuar araçları · B2C açık ilan portalı.

---

*ProjePazar · Berrak Güven · Kod-doğrulanmış sistem dokümantasyonu · 2026-07-26. Bağlayıcı kaynak: `ProjePazar-Sistem-Kurallari.md`. Build sırası: `ProjePazar-Devir-Dokumani.md` Bölüm 16.*
