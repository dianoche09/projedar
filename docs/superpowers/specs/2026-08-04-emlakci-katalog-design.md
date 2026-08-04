# Emlakçı Proje Kataloğu — Tasarım (Sprint 1: müşteri kataloğu)

**Tarih:** 2026-08-04
**Durum:** Onaylandı (kullanıcı, brainstorming)
**Kapsam:** Emlakçının tahsisli dairelerini tek projede seçip, müşteriye gönderilecek kompakt "fiyat-listesi" kataloğu (print-optimize HTML → PDF) üretmesi.

## Bağlam ve kilitli kısıtlar

- **tasks.md Karar #5 (PDF):** PDF standalone değil → **mikrosite export'u**. Canlı fiyat + ödeme planı + kapak + danışman kartı, hep `/p/` verisinden. **Print-optimize HTML/`window.print()`**, ağır `@react-pdf` motoru YOK. Tek-doğru-kaynak korunur.
- **DEĞİŞMEZ #2:** Fiyat/durum yalnız `birim` tablosunda. Katalog veriyi kopyalamaz; her açılışta canlı basılır.
- **DEĞİŞMEZ #1 (RLS-önce):** Emlakçı yalnız tahsisli birimleri görür. Katalog server route'u RLS'e tabi; tahsis dışı id sessizce elenir.
- **DEĞİŞMEZ #4 (kapalı-devre):** Açık ilan yok. Katalog sayfası emlakçı-only (auth); çıktı (PDF) müşteriye birebir gönderilir.
- **REFRAME pusulası:** "Veri yerçekimi üretiyor mu?" Düz PDF üretmez; katalog **içindeki mikrosite linkleri** üretir (tıklama → `goruntuleme` sinyali) + katalog oluşturma `katalog` event'i.
- **Tasarım dili:** Berrak Güven tokenları (mevcut mikrosite ile birebir). Sinyal renkleri: yeşil=müsait, amber=opsiyon, kırmızı=satıldı.

## Onaylanan kararlar (brainstorming)

1. **Birincil iş:** müşteri kataloğu (bu sprint). Emlakçı kendi analitiği + Lead/Paylaşım CSV export = **2. sprint, kapsam dışı.**
2. **Kapsam:** tek proje, **seçmeli** (checkbox).
3. **Layout:** kompakt fiyat-listesi (kapak + özet grid + her satırda mikrosite link).
4. **Seçim UI yeri:** proje detay sayfasına ayrı, hafif `KatalogSecici` bölümü (EmlakciStok'a dokunulmaz — o zaten kompleks).

## Akış

```
havuz/proje/[id]  (proje detay, emlakçı)
  └─ KatalogSecici: müsait+satılabilir daireleri checkbox listeler
       ├─ seçim state + sayaç + "tümünü seç"
       └─ "Katalog oluştur (N daire)"  → router.push
            └─ havuz/proje/[id]/katalog?b=id1,id2,...
                 ├─ server: auth + RLS ile seçilen birimleri çek (tahsis dışı elenir)
                 ├─ print-optimize katalog render (canlı veri)
                 ├─ "PDF / Yazdır" (window.print) → müşteriye WhatsApp
                 └─ açılışta: kayitYaz({tip:'katalog', ...})
```

## Bileşenler (izole, tek amaçlı)

### 1. `KatalogSecici` (client component)
- **Konum:** `havuz/proje/[id]/page.tsx` içinde bir bölüm.
- **Girdi:** proje id, müsait+satılabilir birim listesi (server'dan prop; `{id, daire_no, oda, kat, net_m2, liste_fiyati, para_birimi}`).
- **Davranış:** her birim satırında checkbox; "tümünü seç" toggle; seçili sayaç; "Katalog oluştur (N daire)" butonu seçili>0 iken aktif → `/havuz/proje/[id]/katalog?b={seçili id'ler virgülle}`.
- **Bağımlılık:** yok (saf UI state + `next/navigation`).
- **Sınır:** yalnız seçim + navigasyon. Veri çekmez, render etmez.

### 2. `havuz/proje/[id]/katalog/page.tsx` (server component)
- **Girdi:** `params.id` (proje), `searchParams.b` (virgüllü birim id listesi).
- **Davranış:**
  1. `createClient()` (server, auth'lu). Kullanıcı yoksa `notFound`/login.
  2. `b` parse → id dizisi (boş/geçersiz → boş katalog uyarısı).
  3. Proje çek (ad, il/ilçe, kapak, künye özet, üretici doğrulanmış, teslim, inşaat %). Proje `id`'ye eşleşmeyen veya emlakçının erişemediği → RLS eler.
  4. Seçilen birimleri `.in('id', ids).eq('proje_id', id)` çek (RLS tahsis policy yetkisiz birimi eler; tek-proje kısıtı `proje_id` filtresiyle). Tip/plan_url join.
  5. Danışman profili (`profiles`: ad, telefon, foto_url, **logo_url**).
  6. Her birim için `generateShareToken(emlakciId, birimId)` → mikrosite linki.
  7. `after(() => kayitYaz({tip:'katalog', profileId, projeId, payload:{birimler: ids}}))`.
- **Render:** kapak + özet grid + danışman kartı + `YazdirButonu` (reuse).
- **Bağımlılık:** `@/lib/supabase/server`, `@/lib/sharing`, `@/lib/events`, `YazdirButonu`.

### 3. `YazdirButonu` (mevcut, reuse)
- `window.print()`. Ek motor yok.

## Katalog içeriği (hep canlı `/p/` kaynağından)

- **Kapak:** proje adı, kapak fotoğrafı, künye özeti (il/ilçe · teslim · inşaat %), doğrulanmış üretici rozeti.
- **Her daire (kompakt kart/satır):** daire no · oda · net/brüt m² · kat · yön · **canlı fiyat** · ödeme özeti (peşinat + N ay taksit, `odeme_plani`'den) · mini kat planı görseli (`tip.plan_url`) · **imzalı mikrosite linki** (URL metni; QR = Faz-2, kapsam dışı).
- **Kapak sayfasında (proje bilgisiyle birlikte):** danışman kartı — `logo_url` (varsa) + foto + ad + "Gayrimenkul Danışmanı" + telefon. (Her sayfada footer tekrarı = YAGNI, kapsam dışı.)

## Beyaz-etiket

Danışman kartında `profile.logo_url` kullanılır. Bu, mikrositede çekilip **kullanılmayan** `logo_url`'i katalog bağlamında aktive eder (mikrosite'de kullanımı ayrı, kapsam dışı).

## Veri modeli / DB

- **Migration GEREKMEZ.** `events.tip` = `text` (CHECK constraint yok, `supabase-schema.sql:209`). `katalog` tipini `OlayTip` union'a eklemek yeterli.
- Yeni tablo/kolon yok. Tüm veri mevcut `proje`, `birim`, `daire_tipi`, `proje_belge`, `profiles`'tan.

## Print CSS

- A4 hedef. Her daire kartı `break-inside-avoid`. Navigasyon/butonlar `print:hidden` (mevcut mikrosite pattern'i).
- `globals.css` mevcut print variant'larını kullan; gerekiyorsa katalog-özel `@media print` kuralı eklenir.

## Kapsam dışı (YAGNI)

Çok-proje portföy · QR kod · gerçek PDF motoru · e-posta ile gönderme · emlakçı analitik/performans ekranı · Lead/Paylaşım CSV export (hepsi 2. sprint veya sonrası).

## Erişim

`EmlakciNav`'a menü eklenmez (proje-bağlamlı özellik). Yalnız `havuz/proje/[id]` içinden tetiklenir.

## Test

- Print CSS elle doğrulama (deploy sonrası A4 çıktı: kapak + kartlar + sayfa kırılımı + `print:hidden`).
- Proje test altyapısı yok (package.json'da test script yok) → unit test eklenmez.
- Doğrulama: `npx eslint` değişen dosyalar + canlıda emlakçı akışı (seç → oluştur → yazdır).

## Riskler / açık uçlar

- **URL uzunluğu:** id'ler query param'da (uuid 36 char). ~50 daire ~1800 char < 2000 limit; makul. 50+ seçim beklenmiyor (tek proje, müşteriye özel).
- **RLS teyidi:** katalog route'unda seçilen id'lerin gerçekten emlakçının tahsisinde olduğu RLS ile garanti; ayrıca `.eq('proje_id', id)` ile tek-proje kısıtı. Impl'de doğrulanacak.
- **`goruntuleme` çift sayım:** katalogdaki link müşteride açılınca mikrosite zaten sinyal yazıyor; ek değişiklik yok.
