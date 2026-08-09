# 11 — CONTRADICTIONS & OLD/UNUSED CODE

Etiketler: KANITLI / ÇIKARIM / ESKİ / MOCK.

---

## 1. Çelişki raporu (§60)

| Konu | Kaynak A | Kaynak B | Muhtemel güncel durum |
|---|---|---|---|
| Şema gerçeği | `supabase-schema.sql` (kök): `opsiyon_insert` emlakçı-can-insert; 5-arg `emlakci_birim_gorebilir` | `db/2026-06-29*.sql`: insert `is_admin()` only; 6-arg fonksiyon | **`db/*` kazanır** — kök şema bilinçli eski (dosya başı uyarı) |
| Tasarım renk (paper) | Doküman/Marka Panosu: `#F4F2EE` | `globals.css`: `#eef1f6` | **Kod (`#eef1f6`)** — "Spatial Açık" (2026-06-28) eski "Berrak Güven"i geçersiz kıldı |
| Tasarım metin (ink) | Doküman `#0F2638` | `globals.css` `#10243a` | Kod |
| Fontlar | Doküman: Bricolage Grotesque + Instrument Sans | Kod: Outfit + Inter + Geist Mono | Kod |
| Env değişkeni | Doküman `NEXT_PUBLIC_APP_URL` | Kod `NEXT_PUBLIC_SITE_URL` | Kod |
| Tazelik eşiği | DEĞİŞMEZ metni "N günden eski" | Kod: stale=15g; UI rozeti 7g amber | İkisi birlikte — cron 15g `stale`, UI 7g amber uyarı |
| Emlakçı ücret | Bazı deck/fiyat metinleri "Pro 750/ay" | Kod: emlakçı bedava, paket zorunlu değil | Erken = bedava (basic); premium sonra |
| Komisyon dili | Eski "Komisyon yok" / "Komisyonun %100'ü senin" | Backlog: "Projedar komisyona ORTAK OLMAZ" | Güncel = "kazancın %100'ü senin / Projedar pay almaz" (çıplak "komisyon yok" yasak) |
| "TR'de ilk / emsal yok" | Eski konumlanma | Sentez: Tapuva/EDAP/Topli var, kategori 2-5 yaş | "İlk DEME"; "kombinasyonda saf-play az, TR'de en derini biz" |
| Lead modeli | Eski "Lead Engine" (platform lead dağıtır) | 2026-06-18 reframe: platform lead dağıtmaz | Danışman kendi lead'ini toplar; müteahhit yalnız sorgular |
| Opsiyon yöntemi | Enum `opsiyon_yontem (dogrudan, talep_kod)` | `proje.opsiyon_ayar.yontem (gecici, onay, dogrudan)` | Yeni jsonb ayar aktif; legacy enum senkron tutulur |
| Marka adı | Doküman dosya adları `ProjePazar-*` | Kod/domain `Projedar` | Projedar (dosya adları korundu) |
| Ana sayfa "canlı" veri | Landing "Canlı Portföy" kartları | Kod: hardcoded 4 demo proje | MOCK ("örnek akış" etiketli); gerçek canlı yalnız panel/mikrosite |
| Hukuki sayfa index | Sitemap: 3 hukuki sayfa (priority 0.3) | Page metadata: `robots noindex` | noindex kazanır (sitemap tutarsız — zararsız) |
| Tablo sayısı | Doküman "16 tablo / 19+ tablo" | DB gerçeği: 25 tablo | 25 (kök 16 + db migration'ları) |
| Rol paneli | Doküman: ofis/marka/arsa ayrı konsol | Kod: hepsi `/havuz` | Faz-1 `/havuz`; ayrı konsol Faz-2 |

**Not:** Çelişkilerin çoğu **doküman-eski / kod-güncel** yönünde. Kural: bağlayıcı öz `ProjePazar-Sistem-Kurallari.md` + kod; çelişkide **kod-gerçeği** esastır (bu doküman seti kodu esas aldı).

## 2. İç fonksiyon çoğaltmaları (KANITLI — last-applied wins)
- `handle_new_user()` 3× tanımlı (`create or replace`); final = hesap_durum versiyonu (talep_rol/kayit_meta).
- `emlakci_*_gorebilir` / `opsiyon_talep_onayla` birden çok kez `create or replace`; final: 6-arg gorebilir, `FOR UPDATE` + onay_gun onayla.
- 5-arg `emlakci_birim_gorebilir` `db/2026-06-29d`'de `drop function` (orphan temizlik).

## 3. Kullanılmayan / eski / dormant kod (§37)

- **Kök `supabase-schema.sql`:** eski snapshot (canlı ≠ bu dosya; `db/*` uygula). Referans amaçlı tutuluyor.
- **`fiyat_kurali` tablosu:** dinamik fiyat — şema var, iş mantığı yok (Faz-2 iskelet).
- **`opsiyon_talep.kod / kod_son`:** kod-mekanizması dormant (geçici/dogrudan/onay RPC'lerine geçildi).
- **`proje` yurtdışı kolonları:** `para_birimi≠TRY, oturum_uygun, golden_visa_esik, diller` — boş, Faz-2.
- **`birim.usd_endeksli`, `odeme_plani_url`:** dursun/legacy.
- **`arsa_sahibi`/`marka_yetkili` rolleri:** ayrı panel yok (`/havuz`'a düşer).
- **Mockup/tasarim sayfaları:** `mockup-01..11`, `/tasarim/[yon]`, `public/*_mockup.html`, `public/logo-adaylari*.html`, `public/mockups/*` — design-lab, ürün değil (working-tree'de bir kısmı git-untracked).
- **Yabancı asset:** `public/mockups/assets/kolayimar-logo.png` (kardeş projeden — Projedar markası değil).
- **`_bildirim` dizini:** yalnız server actions (component yok; UI `BildirimListe`).
- **Redirect stub sayfalar:** `/admin/onay`, `/admin/dogrulama` → `/admin/basvurular` (bilinçli konsolidasyon, ölü değil).
- **Landing demo bileşenleri:** `CanliPortfoy`, `Sayaclar`, `CanliKomutaMerkezi` — MOCK/örnek veri (bilinçli, etiketli).

## 4. Eski ürün vizyonu izleri (git/doküman)
- **ProjePazar → Projedar** marka geçişi (domain projedar.com).
- **"Lead Engine" kaldırıldı** (2026-06-18) — platform artık lead dağıtmaz/garanti vermez.
- **"Sales Intelligence Platform" reframe** (2026-06-28/29) — "veri yerçekimi" pusulası, "Tahsisli Canlı Satış Ağı" kategorisi, geliştirici-önce landing.
- **"Berrak Güven" → "Spatial Açık"** tasarım sistemi evrimi (renk/font drift bundan).
- Son commit'ler: lansman popup redesign, `/konut-projeleri` hub (404 fix), landing güven-kritik wording, bölge benchmark genişletme.

## 5. Neyi gösteriyor
Repo **hızlı iterasyonda, kod-güncel doküman-geriden** bir üründür: canlı MVP + zengin doküman katmanı + aktif reframe geçmişi. Şema evrimi disiplinli (migration'lar, DB-kalkanları), tasarım/marka aktif olgunlaşıyor (Spatial Açık, yeni logo adayları). Dormant iskeletler (fiyat_kurali, yurtdışı kolonları, ofis/marka/arsa rolleri) net Faz-2 sinyalleri; MOCK'lar bilinçli+etiketli. En önemli okuma kuralı: **çelişkide koda ve `db/*.sql`'e güven.**
