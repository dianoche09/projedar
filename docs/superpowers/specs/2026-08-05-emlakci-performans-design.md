# Emlakçı Performans Ekranı — Tasarım (katalog 2. sprint, parça 2)

**Tarih:** 2026-08-05
**Durum:** Onaylandı (kullanıcı, brainstorming)
**Kapsam:** Emlakçının kendi satış performansını gösteren ekran — dönüşüm hunisi + KPI + en çok dönüşen projeler. Son 30 gün penceresi.

## Onaylanan kararlar

1. Metrik kapsamı: **huni + KPI + aktif projeler** (AskUserQuestion).
2. Pencere: **son 30 gün** (tek pencere, delta yok — YAGNI).
3. Konum: `EmlakciNav`'a "Performansım" + `/havuz/performans` server route.

## Bağlam / kilitli kısıtlar

- **REFRAME pusulası:** events'ten türetilen zekâ = veri yerçekimi. Bu ekran mevcut event/opsiyon/lead verisini emlakçının kendi performansına çevirir (retention + motivasyon).
- **RLS-önce (DEĞİŞMEZ #1):** tüm veri emlakçının kendisi. `events.profile_id=auth.uid()` (events_select policy), `lead` RLS (atanan/ilk_paylaşan), `opsiyon.satici_id=emlakci`. Çapraz-emlakçı sızıntı yok.
- **Migration yok:** yeni tablo/kolon yok. Mevcut `events`, `lead`, `opsiyon`, `proje`.
- **Tasarım dili:** v2-emlakci kart stili (`kart kart-3d`, `mono`, sinyal renkleri). Grafik reuse.

## Veri kaynakları (son 30 gün; hepsi emlakçı-scope)

| Metrik | Kaynak | Sorgu |
|---|---|---|
| Paylaşım | `events` | `tip=paylasim`, `profile_id=uid`, `created_at>=30g` |
| Görüntüleme | `events` | `tip=goruntuleme`, `profile_id=uid`, `created_at>=30g` |
| Lead | `lead` | RLS scope, `created_at>=30g` |
| Opsiyon | `opsiyon` | `satici_id=uid`, `created_at>=30g` (tüm durumlar) |
| Satış | `opsiyon` | `satici_id=uid`, `durum=satildi`, `created_at>=30g` |
| En çok dönüşen projeler | `events` (paylasim/goruntuleme) + `lead`, `proje_id` bazında grupla | top 5 |

**Not (satış penceresi):** `opsiyon` tablosunda `updated_at` yok; satış tarihi ayrı tutulmuyor. Satış = opsiyon `created_at` 30g penceresinde durum=satildi olanlar (opsiyon alınma tarihi; satış genelde opsiyona yakın). Kabul edilen yaklaşım; ileride `opsiyon.satis_tarihi` eklenirse iyileştirilir.

## Bileşenler

### 1. `havuz/performans/page.tsx` (server, yeni)
- Auth user → `emlakciId`. Yoksa `notFound`/login.
- `otuzGunOnce = new Date(Date.now() - 30*86400000).toISOString()`.
- Paralel çek: events (tip in paylasim/goruntuleme, profile_id, 30g, `select tip, proje_id`), lead (30g, `select proje_id`), opsiyon (satici_id, 30g, `select durum, birim_id`), proje adları (top proje isimleri için).
- Hesapla: KPI sayıları, dönüşüm oranları, proje bazında grup (top 5).
- Render: KPI şeridi + dönüşüm adımları (bar) + en çok dönüşen projeler listesi.

### 2. `EmlakciNav.tsx` (modify)
- "Performansım" menü öğesi (`/havuz/performans`), bar-chart ikonu. `paylastiklarim`'dan sonra. `tam: true`.

### 3. Reuse
- `src/components/ui/Grafik.tsx` — `YiginBar` (dönüşüm oranı barları) ve/veya `Donut`.
- Stat kartları: `uretici/raporlar` Stat pattern (inline).

## Dönüşüm gösterimi

Klasik daralan funnel DEĞİL (görüntüleme > paylaşım olabilir: 1 paylaşım → N görüntüleme). "Aşama + oran" gösterimi:
- Görüntüleme / Paylaşım → "yayılma" (paylaşım başına kaç görüntüleme)
- Lead / Görüntüleme → "ilgi" (%)
- Opsiyon / Lead → "ciddiyet" (%)
- Satış / Opsiyon → "kapanış" (%)

Her aşama: sayı + oran + bar (görsel). 0'a bölme koruması (payda 0 → "—").

## Kapsam dışı (YAGNI)

Zaman serisi grafiği · tarih filtresi · bu ekrandan export · üretici-tarzı 60g delta · daire bazında kırılım.

## Test

- eslint 0 error (yeni route + nav).
- `tsc --noEmit` temiz.
- Elle: emlakçı `/havuz/performans` → KPI/oran/proje listesi doğru; verisi olmayan emlakçıda 0/"—" graceful.

## Riskler

- **0-bölme:** her oran hesabı payda 0 kontrolü (`payda ? ... : "—"`).
- **Boş durum:** hiç aktivite → tüm KPI 0, "Henüz veri yok, paylaşımla başla" mesajı.
- **Satış penceresi kusuru:** yukarıda not edildi (created_at bazlı).
