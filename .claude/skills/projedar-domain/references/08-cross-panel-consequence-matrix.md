# 08 — Cross-Panel Consequence Matrix

> Status: MIXED · Last verified: 2026-08-14 · Confidence: High (kod-doğrulandı)
> Paneller: **`/uretici`** (müteahhit) · **`/danisman`** (emlakçı — kod'da `/havuz` DEĞİL, drift düzeltildi) · **`/admin`** (platform) · **public/paylaşım** · **integration** (bugün yok).
> Bir olayın diğer panellerdeki sonucu tanımsızsa feature domain-complete DEĞİL.

| Event (initiator) | /uretici | /danisman | /admin | public/paylaşım | audit/event | Durum |
|---|---|---|---|---|---|---|
| **Fiyat değişimi** (üretici) | liste_fiyati güncellenir | canlı görür (Realtime) | — | mikrosite/katalog canlı basar | `birim_fiyat_log` events | ⚠️ **Aktif opsiyon fiyat snapshot TAŞIMAZ → orta-opsiyon değişim müşteriye gösterileni sessizce değiştirir** (RISK-PRICE-001) |
| **Tahsis askıya al/kaldır** (üretici) | tahsis_toplu + event | **birim görünürlüğü anında gider** | — | — | events old/new | ⚠️ **Mevcut aktif opsiyon serbest bırakılmaz (birim opsiyonlu kalır, yeniden dağıtılamaz); mevcut lead'ler de-alloc emlakçıda kalır** (RISK-TAHSIS-001, DEBT-001) |
| **Opsiyon talep** (danışman) | onay kuyruğuna düşer | pending görür | (bypass mümkün) | — | talep event | ✓ (onay atomik, rakip talepler auto-reject) |
| **Opsiyon onay** (üretici) | onaylar, rakip talepleri reddeder | birim opsiyonlu | — | mikrosite opsiyonlu basar | events | ✓ |
| **Opsiyon süre dolumu** (cron) | birim tekrar musait | görünür | — | mikrosite musait | sure_doldu event | ✓ |
| **Birim satıldı** (opsiyon→satildi) | KPI/analitik | satıldı görür | — | mikrosite satildi basar | satis event | ⚠️ Paylaşım kodu proaktif deaktive edilmez (`paylasim_kod.aktif` manuel) |
| **Planlı stok açılış** (cron) | dalga açılır | yeni birim görünür | — | public'e yansıyabilir | acilis event | ✓ |
| **Lead oluşumu** (public form) | feed görmez, yalnız birebir sorgu | kendi lead'i | görebilir | — | lead event | ⚠️ cross-agent müşteri-claim yok (RISK-LEAD-001) |
| **KYC doğrulama** (admin) | — | tahsisli detay açılır (demo→gerçek) | onaylar | — | — | ✓ |
| **Hesap durum değişimi** (admin) | — | erişim kapanır (`durum!=aktif`→/hesap-bekliyor) | değiştirir | — | — | ✓ (proxy her istekte doğrular) |
| **Üretici doğrulama rozeti** (admin) | rozet görünür | güven skoruna yansır | atar | public firma sayfası | — | ✓ |
| **(TARGET) dış CRM stok import** | çelişki olabilir | — | reconciliation | — | — | ⚠️ tanımsız (bugün entegrasyon yok — `references/29`) |

## Öncelikli açık sonuç boşlukları (audit P1)
1. **Tahsis-revoke → aktif opsiyon/lead** cascade YOK (`db/2026-08-12_tahsis-yasam-dongusu.sql:182-197`).
2. **Fiyat değişimi → aktif opsiyon terms** snapshot YOK.
3. **Satış/opsiyon → dolaşımdaki paylaşım kodları** proaktif deaktive edilmez.
