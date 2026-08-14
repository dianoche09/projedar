# İlk FULL PRODUCT AUDIT — Projedar (2026-08-14)

> Agent: projedar-real-estate-cdo (MODE D) · Kurulum sonrası ilk audit.
> Kaynak: kod denetimi (main, 2026-08-14) + `docs/projedar-intelligence/*` + `db/*.sql`. Her bulgu kanıt-dayanaklı.
> **Audit ≠ feature emri.** Bulgular P0-P3 + Now/Next/Later/Out-of-scope önceliklidir.

## Executive Domain Assessment
Projedar'ın çekirdek dağıtım mekaniği domain açısından **sağlam ve olgun**: çift-satış kalkanı DB'de
(`opsiyon_tek_aktif` + FOR UPDATE), granüler tahsis + RLS + SECURITY DEFINER, tek-referans fiyat, tazelik sinyali,
opsiyon üç-yöntem yaşam döngüsü + cron. Deneyimli bir proje satış direktörü **stok/opsiyon çekirdeğine güven duyar.**
"Hayır" dedirtecek yerler **çevrede**: (1) tahsis-revoke ile aktif opsiyon/lead arasında reconciliation yok,
(2) "kim getirdi" dayanıklı bir claim değil, (3) kritik invariant'ların hiç otomatik testi yok,
(4) birkaç public/event yüzeyinde throttle/token sıkılığı eksik. Ölçek ve entegrasyon (CRM/ERP) tarafı bugün yok →
gelecekte system-of-record/reconciliation disiplini şart (bootstrap edildi: `references/29`, `references/30`).

## Current Operating Model (gerçekten çalışan)
Üretici `/uretici`'de proje/blok/tip/birim kurar (sihirbaz + Excel import + concierge), granüler tahsis eder,
opsiyon onaylar. Emlakçı **`/danisman`**'da (not: doküman `/havuz` demiş, kod `/danisman` — DRIFT) yalnız kendine
tahsisli + KYC-doğrulanmış birimi görür, imzalı mikrosite paylaşır, üç yöntemle opsiyon alır, lead yönetir.
Admin `/admin`'de gelir/hesap/doğrulama/denetim/büyüme yürütür (stok düzenlemez). Source-of-truth = Projedar DB;
dış CRM/ERP entegrasyonu YOK; stok manuel/Excel/concierge girilir.

## Prioritized Findings

### P0
**F-P0-1 — Kritik invariant'larda otomatik test yok.** Çift-satış/RLS/lead kalkanları yalnız kodda; regresyon testi yok
(doc 10:67). Ürünün tüm güven iddiası bu invariant'lara dayanıyor. Kanıt: test dizini yok. Kök neden: TDD altyapısı kurulmamış.
Önerilen en küçük çözüm: `references/25` kataloğundan P0 testleri (T-OPT-001/002/003, T-RLS-001/002) — DB-seviyesi concurrency + RLS.
Now.

### P1
**F-P1-1 — Tahsis-revoke aktif opsiyon/lead'i serbest bırakmıyor (cross-panel consequence gap).**
`tahsis_toplu` yalnız `tahsis.durum` değiştirir, `opsiyon`/`lead`'e cascade etmez (`db/2026-08-12_tahsis-yasam-dongusu.sql:182-197`;
opsiyon/lead RLS tahsis-gated değil). Üretici "bu ajana artık satma" der ama aktif opsiyon kilitli kalır (birim yeniden
dağıtılamaz), lead'ler de-alloc danışmanda. Etki: üretici niyeti ↔ sistem state çelişkisi, ticari ihtilaf.
Çözüm: revoke policy kararı (OQ-TAHSIS-001) + seçilen davranışı DB/RPC'de enforce + T-TAHSIS-003. **Now (karar) / Next (uygulama).**

**F-P1-2 — "Kim getirdi" dayanıklı cross-agent claim değil.** Dedup yalnız `(telefon_norm, birim_id, 10dk)`
(`src/app/api/lead/route.ts:44-59`); farklı danışman/birim/>10dk → ayrı `ilk_paylasan_id`. Zaman-damgalı claim sertifikası
YOK (doc 10:34). Aynı müşteriyi iki danışman iddia edebilir. Sistem-Kuralları "platform arbitraj yapmaz" ilkesiyle dengeli
tasarla (record/evidence + review queue, hakem değil). Karar: OQ-LEAD-001. **Next.**

### P2
**F-P2-1 — Aktif opsiyon fiyat snapshot taşımıyor.** Mikrosite/PDF canlı basar; orta-opsiyon fiyat değişimi müşteriye
gösterileni sessizce değiştirir. Tek-referans (DDR-002) ile dengeli commercial snapshot kararı (OQ-PRICE-001, LEGAL). Next/Later.

**F-P2-2 — `/api/etkilesim` throttle/log yok.** Geçerli paylaşım linkiyle sınırsız event insert → `tahsis_ozet` sayacı +
audit zinciri kirlenir (`src/app/api/etkilesim/route.ts`). `/api/lead` throttle'lı; buraya da IP/token throttle ekle. **Next.**

**F-P2-3 — HMAC paylaşım token'ı 64-bit + non-constant-time compare** (`src/lib/sharing.ts:26,32-35`). Token uzunluğunu artır +
`timingSafeEqual`. **Next.**

**F-P2-4 — BYOK pazarlama anahtarları plaintext** (doc 04:98). Supabase Vault/şifreleme. **Later.**

**F-P2-5 — `ofis_yetkili/marka_yetkili/arsa_sahibi` ayrı panel yok** → `/danisman`'a düşer (`src/lib/roller.ts:18-20`).
Ofis roll-up/ekip performansı/pay paneli yok. Bilinçli Faz-2 (DEBT-005). **Later.**

**F-P2-6 — Doküman↔kod DRIFT.** doc 02/04 emlakçı panelini `/havuz` der; kod `/danisman`. `docs/projedar-intelligence/02,04`
güncellenmeli (yanıltıcı). **Now (küçük doc fix).**

**F-P2-7 — Satış/opsiyon sonrası paylaşım kodları proaktif deaktive edilmiyor** (`paylasim_kod.aktif` manuel,
`db/2026-08-14_paylasim-kod.sql:11`). Mikrosite satıldı basar ama link geçerli kalır. Karar OQ-SHARE-001. **Later.**

### P3
- `fiyat_kurali` (dinamik fiyat) şema var iş mantığı yok; `opsiyon_talep.kod` dormant → karar/temizlik (DEBT-006).
- `talep-radari` 20k satır tarama limiti — ölçek borcu (doc 10:64).
- Landing "Canlı Portföy/sayaçlar" bilinçli MOCK (etiketli) — domain riski değil.
- `tahsis.updated_at` backfill yok → rozet `baslangic`'e düşer (düşük).

## Domain Model Risks
Yanlış birleştirme/soyutlama taraması temiz: tahsis≠inventory, opsiyon≠rezervasyon ayrımları korunmuş.
**Not:** Projedar'da "reservation" ayrı bir first-class kavram olarak zayıf — `birim_durum` `satis_beklemede` +
`opsiyon.durum` üzerinden yürüyor. Sektör mental modelinde opsiyon<rezervasyon<satış ayrı güç seviyeleridir;
Projedar bunu tek opsiyon lifecycle'ına indirgemiş (bilinçli sadeleştirme mi? OQ olarak izlenebilir). Şimdilik risk düşük.

## Authorization / RLS / Leakage
RLS mimarisi güçlü (SECURITY DEFINER + tahsis-gate + `proxy.ts` her istekte `getUser()`). Write path'lerin çoğu
service-role (tasarım gereği) → doğruluk server-action guard'larına bağlı, test yok (F-P0-1 ile örtüşür).
Raw Postgres hata sızıntısı (eski doc 10:62) **düzeltilmiş** (`src/app/danisman/actions.ts:92-95`) → downgrade.

## Recovery & Exceptions
Cron expiry monitoring/alerting yok (S-07). Ticari override audit'i kısmen var (`tahsis_toplu` events old/new).
"Prod DB'ye SQL" bazı düzeltmeler için tek yol → recovery playbook boşlukları `references/20`.

## Unknown / Validation Required
OQ-TAHSIS-001, OQ-PRICE-001, OQ-LEAD-001, OQ-CRM-001/002, OQ-AUDIT-001, OQ-EIDS-001 (regulatory/legal), OQ-SHARE-001.
Detay: `references/23-open-questions-validation.md`.

## Öneri sırası (özet)
- **Now:** F-P0-1 (P0 testleri), F-P1-1 revoke policy KARARI, F-P2-6 doc drift fix.
- **Next:** F-P1-1 uygulama, F-P1-2 lead claim kararı+tasarım, F-P2-2/2-3 (etkilesim throttle + token).
- **Later:** F-P2-1 snapshot, F-P2-4 vault, F-P2-5 ofis konsolu, F-P2-7 paylaşım deaktive.
- **Out-of-scope (bugün):** CRM/ERP entegrasyonu, sözleşme/tahsilat, tam customer 360.
