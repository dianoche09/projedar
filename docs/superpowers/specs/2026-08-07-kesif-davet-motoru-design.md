# Keşif & Davet Motoru — Tasarım Dokümanı

**Tarih:** 2026-08-07
**Kapsam:** Admin (BİZ / platform işletmecisi) tarafı büyüme motoru
**Yaklaşım:** B — Katmanlı keşif + Claude zenginleştirme + kapalı davet hunisi

## 1. Amaç ve Bağlam

Platform işletmecisi (admin) için, yeni konut projesi olan **müteahhit/geliştirici firmaları**, satıştaki **konut projelerini** ve **emlak ofisi/emlakçıları** web'den otomatik keşfeden; Claude ile zenginleştiren (segment + uygunluk skoru + özet + iletişim doğrulama); tek tık onaylı **davet e-postası** gönderen ve kayda dönüşen adayı huniyle takip eden bir motor.

Gelir modeliyle birebir hizalı (ProjePazar CLAUDE.md / tasks memory):
- **Müteahhit anlaşması = ana gelir** → müteahhit keşfi en öncelikli.
- **Emlakçı bedava (basic)** → havuzu dolduran dağıtım ağını çoğaltır.

Bu motor mevcut kayıt/onay akışının **üst-hunisidir**; onu bozmaz. Kayda dönüşen aday mevcut `/admin/basvurular` (onay + KYC) kuyruğuna düşer.

### Referans (Kolayimar)
Kolayimar "Partner Keşif Motoru" (`src/app/api/admin/partner-discovery/*`) temel desen kaynağı:
SerpAPI Google Maps + web fallback + regex iletişim çıkarımı + `partner_prospects` / `discovery_campaigns` / `partner_outreach_log` üçlüsü + davet endpoint + günlük follow-up cron + admin-only RLS.

Kolayimar'da **olmayan**, ProjePazar'ın eklediği iki katman:
1. **Claude zenginleştirme** (Kolayimar'da `ai_summary` alanı var ama içine yalnız SERP snippet'i yazılıyor; LLM yok).
2. **Davet-token'lı onboarding** (Kolayimar daveti genel başvuru sayfasına link atar; ProjePazar'da imzalı davet token'ı `src/lib/davet.ts` zaten var, huni kapatılır).

## 2. Değişmezler Uyumu (ProjePazar CLAUDE.md)

- **DEĞİŞMEZ #1 (RLS-önce):** `aday` / `kesif_kampanya` / `aday_temas` tabloları admin-only. RLS enable + public/authenticated policy YOK → yalnız service-role (server route / cron) erişir. Aday PII (email/telefon) client'a gitmez.
- **Client'tan service-role kullanılmaz** — tüm keşif/mail işlemleri server route veya cron içinde.
- Bu motor müşteri görünürlüğü (tahsis) modeline dokunmaz; tamamen admin BD katmanıdır.
- Kapsam disiplini: çok-modüllü CRM yarışına girilmez (drip/WhatsApp/ML scoring = kapsam dışı, Faz sonrası).

## 3. Veri Modeli — `db/2026-08-07_kesif-motoru.sql`

### `aday` (prospect)
| Alan | Tip | Not |
|---|---|---|
| `id` | uuid pk | |
| `firma_adi` | text not null | |
| `firma_adi_norm` | text | normalize (lower/trim/boşluk sadeleştirme) — dedup için |
| `segment` | text | `muteahhit` \| `ofis` \| `emlakci` \| `proje` |
| `kisi` | text | irtibat kişisi (varsa) |
| `email` | text | regex/SERP'ten |
| `telefon` | text | TR format regex |
| `website` | text | |
| `il` | text | |
| `ilce` | text | |
| `adres` | text | |
| `proje_sayisi` | int | Claude tahmini (müteahhit) |
| `uygunluk_skoru` | int | 0-100, Claude |
| `ozet` | text | Claude tek cümle |
| `kaynak` | text | `serpapi_maps` \| `serper_web` \| `places` |
| `kaynak_url` | text | |
| `kampanya_id` | uuid fk → kesif_kampanya | |
| `durum` | text | pipeline (aşağıda) |
| `ilk_temas` | timestamptz | |
| `son_temas` | timestamptz | |
| `temas_sayisi` | int default 0 | |
| `sonraki_takip` | timestamptz | follow-up cron sorgusu |
| `donusen_user_id` | uuid | huni kapanışı (kayıt olan aday) |
| `opt_out` | bool default false | ticari ileti reddi |
| `not` | text | admin notu |
| `created_at` / `updated_at` | timestamptz | trigger |

**Pipeline `durum`:** `yeni` → `zenginlesti` → `davet_edildi` → `acildi` → `kayit_oldu` | `reddedildi` | `soguk`

**Uniq index:** `(firma_adi_norm, il)` — aynı firma+il tek kayıt (dedup DB seviyesinde).
**Index:** `il`, `durum`, `segment`, `sonraki_takip` (partial: durum='davet_edildi').

### `kesif_kampanya`
`id`, `il`, `segmentler text[]`, `durum` (`calisiyor`/`tamamlandi`/`hata`), `bulunan_aday int`, `sonuc jsonb` (aday id listesi + kaynak dağılımı), `baslatan uuid`, `created_at`.

### `aday_temas` (outreach log)
`id`, `aday_id fk`, `kanal` (`email`/`whatsapp`), `yon` (`giden`/`gelen`), `konu`, `mesaj`, `durum` (`gonderildi`/`acildi`/`yanit`/`opt_out`/`hata`), `gonderen uuid`, `meta jsonb`, `created_at`.

### `pazarlama_entegrasyon` (mevcut tablo — kolon ekleme)
`serpapi_key`, `serper_key`, `places_key` (BYOK; yalnız service-role okur — mevcut desen).

### RLS
Üç yeni tablo: `alter table ... enable row level security;` + policy tanımlanmaz → yalnız service-role. (Mevcut `pazarlama_entegrasyon` ile aynı yaklaşım.)

## 4. Keşif Katmanı — `src/lib/kesif/`

| Dosya | Sorumluluk | Bağımlılık |
|---|---|---|
| `tipler.ts` | Zod şemaları: `AdayHam`, `AdayZengin`, `Segment` | zod |
| `sorgular.ts` | `sorgularUret(il, segment): string[]` — TR sorgu seti | — |
| `kaynaklar/serpapi-maps.ts` | `araMaps(sorgu, key): AdayHam[]` (SerpAPI `google_maps`, `ll=@39.9334,32.8597,6z`, `hl=tr`) | fetch |
| `kaynaklar/serper-web.ts` | `araWeb(sorgu, key): AdayHam[]` (Serper varsa; Maps <3 sonuçta fallback) | fetch |
| `kaynaklar/places.ts` | `araPlaces(sorgu, key): AdayHam[]` (Google Places Text Search) | fetch |
| `cikar.ts` | `emailCikar(s)`, `telefonCikar(s)` — TR regex (Kolayimar `extractEmail/Phone`) | — |
| `dedup.ts` | `normalize(firma)`, `benzersizle(adaylar)` | — |
| `zenginlestir.ts` | `zenginlestir(hamlar, claudeKey): AdayZengin[]` — Claude çağrısı | @anthropic-ai/sdk |

**`sorgularUret` örnek:**
- `muteahhit` → `"{il} inşaat firması"`, `"{il} konut projesi"`, `"{il} gayrimenkul geliştirme"`
- `proje` → `"{il} yeni konut projesi"`, `"{il} satılık daire proje"`
- `ofis`/`emlakci` → `"{il} emlak ofisi"`, `"{il} gayrimenkul danışmanı"`

**`zenginlestir` (Claude):** Girdi = ham aday listesi (firma adı, snippet, website, telefon). Çıktı (yapılandırılmış JSON, tool-use/`response_format`): her aday için `segment`, `uygunluk_skoru` (0-100, "yeni konut projesi olma / aktif emlak ofisi olma" olasılığı), `ozet` (tek cümle TR), `proje_sayisi` (tahmin), doğrulanmış `email`/`telefon` (snippet'te net değilse boş bırak — halüsinasyon yasak). Model: `claude-sonnet-5` (maliyet/kalite dengesi; keşif zenginleştirme hız-hacim işi). Prompt caching: sistem prompt sabit → cache.

## 5. API Route'ları (admin-only, service-role)

Hepsi başta `adminGuard()` (mevcut `src/app/admin/pazarlama/actions.ts` deseni) + `createAdminClient()`.

- **`api/admin/kesif/route.ts`**
  - `GET` → aday listesi (filtre: il/segment/durum) + huni istatistikleri (durum bazlı sayım).
  - `POST` `{ il, segmentler[] }` → `kesif_kampanya` aç → `sorgularUret` → `araMaps` (+`araWeb`/`araPlaces` fallback) → `cikar` → `benzersizle` → `aday` insert (`durum='yeni'`) → kampanya `tamamlandi`. Claude **çağrılmaz** (ucuz keşif).
  - `PATCH` `{ id, ... }` → aday alan güncelle (durum/not/email/telefon); `contacted`-benzeri geçişte temas alanları izlenir.
- **`api/admin/kesif/zenginlestir/route.ts`**
  - `POST` `{ adayIds[] }` → seçili `yeni` adayları `zenginlestir()` ile Claude'dan geçir → güncelle (`durum='zenginlesti'`, skor/segment/ozet). BYOK `claude_key` yoksa bilgilendirici hata.
- **`api/admin/kesif/davet/route.ts`**
  - `POST` `{ adayId, ekMesaj? }` → email yoksa 400 · `adayDavetToken` ile link · `davetMaili` (mailKabuk marketing footer) · `mailGonder` · `aday_temas` insert (`gonderildi`) · aday `durum='davet_edildi'`, `son_temas=now`, `temas_sayisi++`, `sonraki_takip=now+3g`.
- **`api/kesif/cikis/route.ts`** (public, token'lı opt-out)
  - `GET ?aday=<id>&t=<token>` → doğrula → `opt_out=true`, `durum='reddedildi'`, `aday_temas` (`opt_out`) → teşekkür sayfası. Suppress: opt-out'lu adaya bir daha davet/follow-up gönderilmez.

## 6. Davet + Kayıt Hunisi (kapalı)

- `src/lib/davet.ts`'e ekleme:
  - `adayDavetToken(adayId, rol)` = `HMAC(secret, "aday:{adayId}:{rol}")[..16]` (mevcut desen).
  - `adayDavetGecerli(adayId, rol, token)`.
- Davet linki: `/kayit?rol=<segment→rol>&aday=<id>&n=<firma>&t=<token>` (segment→rol: muteahhit→uretici, ofis→ofis_yetkili, emlakci→emlakci).
- **`proje` segmenti davet edilebilir rol DEĞİL** — bir proje adayı için zenginleştirme aşamasında arkasındaki müteahhit firma çıkarılır ve aday `segment='muteahhit'`e dönüştürülür (davet müteahhide gider). Proje adayı müteahhide çözülemezse `durum='soguk'` kalır, davet butonu pasif.
- `src/app/kayit/actions.ts`: `aday` + `t` geçerliyse kayıt sonrası service-role ile `aday.donusen_user_id=<yeni user>`, `durum='kayit_oldu'`, `aday_temas` (`yanit`). **Not:** davet KYC'yi atlamaz (mevcut kural korunur); aday yine `/admin/basvurular` kuyruğuna düşer.

## 7. Mail (KVKK / İYS uyumlu)

- `src/lib/mail.ts`'e `davetMaili({ firma, segment, il, link, cikisLink, ekMesaj? })`:
  - `mailKabuk` gövdesi (marka tutarlı) + **pazarlama footer varyantı**: opt-out linki + ETK/İYS ret ibaresi. Mevcut "işlem bildirimidir, pazarlama değildir" footer'ı KULLANILMAZ (soğuk davet ticari ilettir).
  - Best-effort `mailGonder` (RESEND_API_KEY yoksa sessiz atlar).
- **Hukuki not (kod değil):** Tacir alıcı (müteahhit firma / emlak ofisi) → ETK m.6 onaysız gönderilebilir; opt-out + İYS ret şart. Şahıs emlakçı gri alan → admin panelde uyarı gösterilir; opt-out edeni kalıcı suppress.

## 8. Otomasyon — mevcut cron dispatcher'a entegre

- `src/app/api/cron/_lib/isler.ts`'e `kesifFollowupCalistir(): CronSonuc` eklenir; `src/app/api/cron/route.ts` `isler` dizisine 4. iş (`["kesif_followup", kesifFollowupCalistir]`).
  - Sorgu: `durum='davet_edildi' AND sonraki_takip<=now AND opt_out=false AND temas_sayisi<3`.
  - Aksiyon: otomatik hatırlatma maili (`davetMaili`) → `temas_sayisi++`, `sonraki_takip=now+3g`. `temas_sayisi>=3` olursa `durum='soguk'`.
- **Yeni cron path YOK** (Vercel Hobby limiti; mevcut günlük dispatcher deseni korunur).

## 9. Admin UI

- **`src/app/admin/pazarlama/kesif/page.tsx`** (+ client bileşenleri):
  - Kampanya başlatıcı: il seç + segment çoklu seç → POST.
  - Aday kartları: segment + skor rozeti (renk: skor bandı), firma/kişi/iletişim/kaynak, butonlar: **Zenginleştir** (seçili) · **Davet Et** · durum düzenle.
  - Huni metrikleri: bulundu → zenginleşti → davet → açıldı → kayıt (durum sayımından).
- **`src/app/admin/pazarlama/page.tsx`** (mevcut BYOK): `serpapi_key`, `serper_key`, `places_key` alanları eklenir (mevcut `ALANLAR` + `AyarSchema` + form genişletme).
- Tasarım dili: mevcut admin `_ortak` bileşenleri (`SayfaBaslik`, `Uyari`) + "Canlı Proje Satış Komuta Merkezi" tokenları (tasarim-dili memory). AI-slop yok.

## 10. Hata Yönetimi ve Riskler

- **BYOK key yok** → route bilgilendirici hata (`?hata=...`), akış bozulmaz.
- **Mail** best-effort; SERP/Claude çağrıları try/catch → kampanya `hata` durumu, kısmi sonuç korunur.
- **Rate/kota:** SerpAPI/Claude harcaması admin tetikli (keşif ucuz, Claude yalnız seçili adayda). Kampanya başına sorgu sayısı sınırlı.
- **Dedup** DB uniq index ile garanti.
- **KVKK/İYS:** opt-out zorunlu + kalıcı suppress; şahıs emlakçı uyarısı; aday PII admin-only RLS.
- **Halüsinasyon:** Claude iletişim bilgisini uydurmaz — snippet'te net değilse boş bırakır (prompt kuralı).

## 11. Test / Doğrulama

- Test framework yok (vitest/jest kurulu değil). Doğrulama:
  - **Saf fonksiyonlar** (`cikar`, `dedup`, `sorgular`, `zenginlestir` prompt kurgusu) izole ve ileride birim-test edilebilir yazılır.
  - `npm run lint` + type-check (changed) her PR'da.
  - **Manuel QA:** (a) örnek il ile keşif → aday havuzu dolar (b) zenginleştir → skor/segment yazılır (c) davet → mail düşer + huni ilerler (d) davet linki → ön-dolu kayıt → `donusen_user_id` + başvuru kuyruğu (e) opt-out linki → suppress (f) cron follow-up → hatırlatma maili.

## 12. Kapsam Dışı (bu spec'te YAPILMAZ)

- Drip/sequence çok-dokunuşlu kampanya, WhatsApp outreach, ML lead scoring, A/B mail testi (kapsam disiplini — Faz sonrası).
- Emlak portalı (sahibinden/emlakjet) scraping — 4. kaynak olarak arayüz bırakılır ama ilk sürümde uygulanmaz (ToS/scraping riski; SerpAPI+Places+Serper yeterli başlangıç).
- Anahtar şifreleme (pgsodium/Vault) — mevcut `pazarlama_entegrasyon` notundaki gibi Faz sonrası sertleştirme.
