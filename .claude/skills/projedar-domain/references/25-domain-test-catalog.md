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
| T-KYC-001 | INV-KYC-001 | action | Emlakçı 0 belge + onay (override yok) | blok (dogrulandi olmaz) | P1 |
| T-KYC-002 | INV-KYC-001 | action | Emlakçı yalnız MYS var + onay | dogrulandi (vergi zorunlu değil) | P1 |
| T-KYC-003 | INV-KYC-001 | action | Belge AI `gecerli===false` + onay (override yok) | blok; `ai_sonuc=null` veya `{beyan_edilen_no}` (gecerli yok) → bloklamaz | P1 |
| T-KYC-004 | INV-KYC-002 | action | MYS eksik + override+gerekce, `mys_belge_no` VAR | dogrulandi (evidence floor sağlandı) | P1 |
| T-KYC-005 | INV-KYC-002 | action | MYS eksik + override+gerekce, `mys_belge_no` YOK | blok (dayanaksız override reddi) | P1 |
| T-KYC-006 | INV-KYC-001 | action | Rol/talep_rol emlakçı DEĞİL (üretici/ofis) veya `.single()` prof=null | blok "yalnız danışman" (fail-closed) | P2 |
| T-KYC-007 | INV-KYC-001 | action | `red` yolu (doc check yok) + eksik belge | red her zaman geçer (bloklanmaz) | P2 |
| T-KYC-008 | INV-AUDIT-001 | audit | override onayı | `events` payload `override={eksik,ai_flagli,gerekce}`; normal onay `override:null` yazılır | P2 |
| T-TAHSIS-001 | INV-TAHSIS-002 | RLS | Askıya alınmış tahsis sonrası birim sorgu | görünmez | P1 |
| T-TAHSIS-002 | INV-TAHSIS-003 | RPC | `kaldirildi` tahsise `devam` aksiyonu | reddedilir (terminal) | P2 |
| T-TAHSIS-003 | RISK-TAHSIS-001 | integration | Aktif opsiyonlu birimin tahsisi kaldırılır | **karar sonrası** beklenen davranış (bugün: opsiyon kilitli kalır) | P1 |
| T-LEAD-001 | INV-LEAD-002 | api | Aynı telefon+birim 10dk içinde 2. lead | 429, tek satır | P1 |
| T-LEAD-002 | INV-LEAD-003 | RLS | Üretici toplu lead SELECT | 0 satır (yalnız birebir sorgu) | P1 |
| T-SHARE-001 | INV-SHARE-001 | api | Geçersiz HMAC token → mikrosite | `notFound()` | P1 |
| T-SHARE-002 | INV-SHARE-002 | integration | Birim `satildi` + kod `aktif=true` → mikrosite aç | 404 DEĞİL: "Satıldı" rozeti + lead formu YOK + "benzer daireler" (müsait) render; `paylasim_kod` satırı MUTASYONA UĞRAMAZ (satış sonrası `aktif`/satır değişmez) | P1 |
| T-SHARE-003 | INV-SHARE-002 | integration | `birimSatisKapat` çalışır | `paylasim_kod` tablosunda o birime ait hiçbir satır değişmez (aktif=true kalır); satış yalnız `birim.durum`+opsiyon lifecycle'ı değiştirir | P1 |
| T-SHARE-004 | INV-SHARE-003 | api | `/api/etkilesim` favori/ödeme, birim `satildi`/terminal | reddedilir (`birimLeadKabulEdilebilir` false), event YAZILMAZ — kod `aktif` olsa bile | P1 |
| T-SHARE-005 | INV-SHARE-002 | api | Kod `aktif=false` (kasıtlı revoke) → mikrosite + `/api/lead` + `/api/etkilesim` | hepsi reddeder (render 404, API'ler geçersiz); re-share `paylasimKodAl` AYNI ölü kodu döner (revoke yapışır) | P1 |
| T-PRICE-001 | INV-PRICE-001 | integration | Fiyat değişir → mikrosite yeniden yüklenir | canlı yeni fiyat | P2 |
| T-EVENT-001 | RISK-EVENT-001 | api | `/api/etkilesim` flood | (throttle eklendikten sonra) rate-limit | P2 |
| T-CRON-001 | INV-CRON-001 | concurrency | Aynı overdue set üzerinde 2 eşzamanlı `select opsiyon_serbest_birak()` | toplam delete=N, event=N, birim başına 0 duplicate event | P1 |
| T-CRON-002 | INV-CRON-002 | function | Geçici-kilit expiry (dogrulandi=false + dogrulama_bitis geçti) vs kesin-kilit expiry (kilit_bitis geçti) | event `eylem='dogrulama_sure_doldu'` vs `'sure_doldu'` (tek CASE) | P1 |
| T-CRON-003 | INV-CRON-001 | static/grep | `isler.ts` bağımsız `eylem:'sure_doldu'` literal veya kendi DELETE'i içermez; yalnız `rpc('opsiyon_serbest_birak')` | tek yazar doğrulandı | P2 |
| T-CRON-004 | INV-STATE-001 | function | Overdue ama `durum='satis_beklemede'` opsiyon | `opsiyon_serbest_birak` serbest BIRAKMAZ (0 delete) — B3 regression | P1 |
| T-CRON-005 | RISK-CRON-001 | integration/failsafe | pg_cron job devre dışı → günlük Vercel `opsiyonSuresiCalistir` | overdue `opsiyonlu` serbest + `temizlenen>0` anomaly log (`console.error`) | P2 |
