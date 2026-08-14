# 17 — Risk Register (living)

> Status: CURRENT · Last verified: 2026-08-14 · Seed: ilk full audit (2026-08-14)
> Şablon: Impact(Critical/High/Medium/Low) · Likelihood(Frequent/Plausible/Unlikely) · Detectability(Immediate/Delayed/Difficult) · Recovery(Automatic/Manual/Dispute/Irreversible)

## RISK-TEST-001 — Kritik invariant'larda otomatik test yok
Status: Open · Impact: Critical · Likelihood: Plausible · Detectability: Delayed · Recovery: Manual
Senaryo: Opsiyon/RLS/lead invariant'ları (INV-OPT-001..003, INV-RLS-001..003) yalnız kodda; regresyon testi yok (doc 10:67). Bir migration/refactor kalkanı sessizce kırabilir; çift-satış/veri-sızıntısı prod'da fark edilir.
Kontrol: DB-seviyesi concurrency + RLS testleri (`references/25`). En yüksek öncelik.

## RISK-TAHSIS-001 — Tahsis-revoke aktif opsiyon/lead'i serbest bırakmaz
Status: Open · Impact: High · Likelihood: Plausible · Detectability: Difficult · Recovery: Manual/Dispute
Senaryo: Üretici bir danışmanın tahsisini kaldırır ("artık bu ajana satma"). `tahsis_toplu` yalnız `tahsis.durum` değiştirir, `opsiyon`/`lead`'e cascade etmez (`db/2026-08-12_tahsis-yasam-dongusu.sql:182-197`; opsiyon/lead RLS tahsis-gated değil). Sonuç: birim `opsiyonlu` kilitli kalır (yeniden dağıtılamaz), lead'ler de-alloc danışmanda kalır. Üretici niyeti ↔ sistem state çelişir.
Kontrol: revoke akışında explicit karar (opsiyonu koru/expire-et/serbest-bırak) + lead sahiplik politikası. PROJECT DECISION (OQ-TAHSIS-001).

## RISK-PRICE-001 — Aktif opsiyon fiyat snapshot taşımıyor
Status: Open · Impact: Medium · Likelihood: Plausible · Detectability: Difficult · Recovery: Dispute
Senaryo: Danışman müşteriye mikrosite paylaştı, opsiyon aldı. Üretici fiyatı değiştirdi. Mikrosite/PDF canlı bastığı için müşteriye gösterilen fiyat sessizce değişir; opsiyon satırı işlem-anı fiyatını tutmuyor. Ticari anlaşmazlık riski.
Kontrol: opsiyon/rezervasyon oluşumunda commercial snapshot (fiyat/ödeme planı/komisyon) — ticari/hukuki gerekçeyle. PROJECT DECISION (OQ-PRICE-001).

## RISK-LEAD-001 — "Kim getirdi" dayanıklı cross-agent claim değil
Status: Open · Impact: Medium · Likelihood: Frequent · Detectability: Delayed · Recovery: Dispute
Senaryo: Dedup yalnız `(telefon_norm, birim_id, 10dk)`. Farklı danışman linki / farklı birim / 10dk sonrası → farklı `ilk_paylasan_id` ile ikinci bağımsız lead. Aynı müşteriyi iki danışman "getirdim" diyebilir; zaman-damgalı claim sertifikası YOK (doc 10:34). Eş/alternatif telefon/ofis değişimi ele alınmıyor.
Kontrol: identity graph + durable first-touch claim (PROJECT DECISION, OQ-LEAD-001) — ama Sistem-Kuralları "platform arbitraj yapmaz" ilkesiyle dengeli tasarla (record/evidence, hakem değil).

## RISK-EVENT-001 — /api/etkilesim throttle'sız event insert
Status: Open · Impact: Medium · Likelihood: Plausible · Detectability: Delayed · Recovery: Manual
Senaryo: Geçerli public paylaşım linki olan biri `/api/etkilesim`'e sınırsız event basabilir (throttle/log yok, `src/app/api/etkilesim/route.ts`). `tahsis_ozet` "değişiklik" sayacını ve audit zincirini kirletir. Karşılaştır: `/api/lead` throttle'lı.
Kontrol: IP/token throttle + log.

## RISK-SHARE-001 — HMAC token 64-bit + non-constant-time compare
Status: Open · Impact: Low · Likelihood: Unlikely · Detectability: Difficult · Recovery: Manual
Senaryo: Paylaşım token'ı `HMAC-SHA256(...).slice(0,16)` = 64-bit truncated (`src/lib/sharing.ts:26`); `verifyShareToken` `expected===token` (timingSafeEqual değil, `:32-35`). Brute/timing marjinal ama mevcut; token hem PII lead hem event kapısı.
Kontrol: token uzunluğunu artır + `timingSafeEqual`.

## RISK-SECRET-001 — BYOK pazarlama anahtarları plaintext
Status: Open · Impact: Medium · Likelihood: Unlikely · Detectability: Difficult · Recovery: Manual
Senaryo: `pazarlama_entegrasyon` API anahtarları plaintext (doc 04:98; Vault Faz-2). DB erişimi → anahtar sızıntısı.
Kontrol: Supabase Vault / şifreleme.

## RISK-OFFSYSTEM-001 — Platform-dışı satış reconciliation'ı yok
Status: Accepted (bugün) · Impact: Medium · Likelihood: Frequent · Detectability: Difficult · Recovery: Manual
Senaryo: Müteahhit telefon/Excel/kendi ofisinde satış yapar; Projedar'da birim hâlâ musait görünür. Bugünkü mekanizma yalnız tazelik sinyali (tespit, önleme değil). Entegrasyon gelince reconciliation gerekli (`references/29`).
