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

## RISK-STATE-001 — `satis_beklemede` birim cron ile serbest kalıyor (çift-satış açığı)
Status: Open · Impact: High · Likelihood: Plausible · Detectability: Difficult · Recovery: Dispute
Senaryo: `satis_beklemede`'ye geçişte opsiyon `opsiyonlu` + eski `kilit_bitis` kalıyor; expiry cron (`isler.ts:159-182`, `db/2026-08-05:22-29`) siliyor → trigger birimi `musait` yapıyor. Sözleşme imzalanırken birim tekrar opsiyonlanabilir. Enforcement: INV-STATE-001. Audit B3/XP-03.

## RISK-CRON-001 — İki opsiyon-expiry scheduler, audit divergence
Status: Resolved-pending-tests (`666675c`, 2026-08-19) · Impact: Low · Likelihood: Frequent → n/a · Detectability: Delayed · Recovery: Automatic
Senaryo (çözülmeden önce): pg_cron (15dk) + Vercel (günlük) ikisi de aynı satırı silip event yazıyor; etiket farklı (`dogrulama_sure_doldu` vs hep düz `sure_doldu`) → "neden serbest kaldı" belirsiz + güven-skoru `dusen` yanlış sayımı (denominator eksilir → doğrulama oranı şişer), 03:00 örtüşmesinde çift-event.
Çözüm (corrected-B, MODE A onaylı): tek yetkili `opsiyon_serbest_birak()` fonksiyonu `DELETE … RETURNING`-tabanlı (idempotent, tek etiket kaynağı); pg_cron=primary, Vercel=`rpc()` failsafe + count>0 anomaly log (monitor-only DEĞİL). INV-CRON-001/002. Divergence + çift-event + etiket-yanlışı retire edildi.
Residual: yalnız ÇİFT arıza (pg_cron ölü VE Vercel günlük fail) → opsiyon `opsiyonlu` kilitli kalır = **çift-satış-güvenli** (INV-OPT-001 kalkanı + B3 hold), müteahhit panelinde görünür (opsiyonlu > kilit_bitis). Ek makineye gerek yok (P2). Historical mislabel: DOMAIN-DEBT-008 (backfill yok). Testler: T-CRON-001..005 (`references/25`), henüz yazılmadı → RISK-TEST-001 kapsamında.

## RISK-PRICEVIS-001 — Gizli fiyat (`fiyat_gorunur=false`) 3 yüzeyden sızıyor
Status: Open · Impact: High · Likelihood: Frequent · Detectability: Delayed · Recovery: Dispute
Senaryo: Mikrosite/katalog PDF/eşleştir redaksiyonu atlıyor (`p/[...slug]/page.tsx:138-153`, `katalog/page.tsx:74-101`, `eslestir/page.tsx:13-21`); müteahhidin danışmandan gizlediği fiyat müşteriye gidiyor. Takımın kendi "HIGH leak fix"i (`db/2026-08-10_emlakci-birim-fiyat.sql`) eksik. Audit A1/D-01/02/03.

## RISK-ADMIN-001 — Admin canlı stoğa satıcı olabiliyor + denetim kör
Status: Open · Impact: High · Likelihood: Plausible · Detectability: Difficult · Recovery: Dispute
Senaryo: `is_admin() OR` opsiyon bypass'ı (INV-ADMIN-002 ihlali) + kritik admin aksiyonları audit'e yazmıyor (INV-AUDIT-001) + izsiz admin üretimi. Audit E1/E2.

## RISK-OFFSYSTEM-001 — Platform-dışı satış reconciliation'ı yok
Status: Accepted (bugün) · Impact: Medium · Likelihood: Frequent · Detectability: Difficult · Recovery: Manual
Senaryo: Müteahhit telefon/Excel/kendi ofisinde satış yapar; Projedar'da birim hâlâ musait görünür. Bugünkü mekanizma yalnız tazelik sinyali (tespit, önleme değil). Entegrasyon gelince reconciliation gerekli (`references/29`).
