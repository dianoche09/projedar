# 21 — Abuse / Gaming Register (living seed)

> Status: CURRENT seed · Last verified: 2026-08-14
> Kontrol riskle orantılı olsun; ürünü gereksiz friction'a boğma.

| Abuse | Vektör | Bugünkü kontrol | Gap |
|---|---|---|---|
| Speculative lead squatting | sahte lead ile müşteri-claim | `(telefon,birim,10dk)` throttle; geçersiz telefon red | durable claim yok → düşük değerli (RISK-LEAD-001) |
| Event log flooding | geçerli paylaşım linki → `/api/etkilesim` spam | **yok (throttle/log yok)** | RISK-EVENT-001 — throttle ekle |
| Opsiyon bloklama | geçici opsiyonla stok kilitleme | kota (düşük güven skoru→1), süre + cron serbest bırakma, doğrulama zorunlu | ✓ makul |
| Tahsisli olmayan stok görme | RLS baypası denemesi | SECURITY DEFINER + tahsis-gate | ✓ (test yok — RISK-TEST-001) |
| Eski çalışan erişimi | pasif hesap/stale session | `proxy.ts` her istekte `getUser()` + `durum=aktif` | ✓; ama tahsis-revoke→opsiyon gap (RISK-TAHSIS-001) |
| Paylaşım linki forward/scrape | public mikrosite | token + fiyat OG'ye basılmaz + canlı stok public'te gizli | link expiry/revoke manuel (OQ-SHARE-001) |
| KYC-gate bypass | kendini doğrulama | `belge_durumu_guard` trigger | ✓ |
| Komisyon eligibility manipülasyonu | — | komisyon danışman-görünür, Projedar pay almaz | düşük yüzey |
| Token brute/timing | 64-bit HMAC + non-const compare | — | RISK-SHARE-001 |
