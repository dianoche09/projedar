# 25 — Domain Test Catalog (living)

> Status: TARGET · Last verified: 2026-08-14
> Bugün otomatik test YOK (doc 10:67). Bu katalog invariant→test eşlemesidir; kritik olanlar önce.
> En güçlü katman seç: DB constraint/index > transaction/lock > RLS > server RPC > UI (son).

| Test ID | Invariant | Tip | Senaryo | Beklenen | Öncelik |
|---|---|---|---|---|---|
| T-OPT-001 | INV-OPT-001 | concurrency | Aynı birime 2 eşzamanlı `opsiyon_al_dogrudan` | 1 başarı, diğeri 23505 unique_violation | P0 |
| T-OPT-002 | INV-OPT-001 | concurrency | 2 pending talep + eşzamanlı 2 `opsiyon_talep_onayla` | 1 opsiyon, diğer talep auto-reject | P0 |
| T-OPT-003 | INV-OPT-002 | RLS | Emlakçı doğrudan `INSERT opsiyon` | RLS red (`is_admin()` gate) | P0 |
| T-OPT-004 | INV-OPT-004 | cron | kilit_bitis geçmiş opsiyon | `opsiyon_serbest_birak` siler, birim musait | P1 |
| T-RLS-001 | INV-RLS-001 | RLS | Tahsissiz emlakçı başka birim sorgular | 0 satır | P0 |
| T-RLS-002 | INV-RLS-001 | RLS | KYC-doğrulanmamış emlakçı tahsisli (non-demo) birim | görmez (yalnız demo) | P0 |
| T-RLS-003 | INV-RLS-003 | trigger | Non-admin kendini `belge_durumu='dogrulandi'` UPDATE | trigger red | P1 |
| T-TAHSIS-001 | INV-TAHSIS-002 | RLS | Askıya alınmış tahsis sonrası birim sorgu | görünmez | P1 |
| T-TAHSIS-002 | INV-TAHSIS-003 | RPC | `kaldirildi` tahsise `devam` aksiyonu | reddedilir (terminal) | P2 |
| T-TAHSIS-003 | RISK-TAHSIS-001 | integration | Aktif opsiyonlu birimin tahsisi kaldırılır | **karar sonrası** beklenen davranış (bugün: opsiyon kilitli kalır) | P1 |
| T-LEAD-001 | INV-LEAD-002 | api | Aynı telefon+birim 10dk içinde 2. lead | 429, tek satır | P1 |
| T-LEAD-002 | INV-LEAD-003 | RLS | Üretici toplu lead SELECT | 0 satır (yalnız birebir sorgu) | P1 |
| T-SHARE-001 | INV-SHARE-001 | api | Geçersiz HMAC token → mikrosite | `notFound()` | P1 |
| T-PRICE-001 | INV-PRICE-001 | integration | Fiyat değişir → mikrosite yeniden yüklenir | canlı yeni fiyat | P2 |
| T-EVENT-001 | RISK-EVENT-001 | api | `/api/etkilesim` flood | (throttle eklendikten sonra) rate-limit | P2 |
