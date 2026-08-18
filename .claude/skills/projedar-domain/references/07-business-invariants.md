# 07 — Business Invariants (Projedar)

> Status: MIXED · Last verified: 2026-08-14 · Confidence: High
> Evidence: `db/*.sql`, `MASTER-PROJEDAR-IDENTITY-V2.md`, kod denetimi (2026-08-14)
> Her invariant: ID · ifade · rule class · enforcement katmanı · test durumu.
> **Not:** Bugün otomatik test YOK (doc 10). "Test: ✗" = invariant kodda korunuyor ama regresyon testi yok.

| ID | Invariant | Class | Enforcement (kanıt) | Test |
|---|---|---|---|---|
| INV-OPT-001 | Bir birim aynı anda iki çakışan aktif opsiyon tutamaz | PLATFORM INVARIANT | DB partial unique `opsiyon_tek_aktif on opsiyon(birim_id) where durum in('opsiyonlu','satis_beklemede')` + `opsiyon_talep_onayla` FOR UPDATE + re-check `durum='musait'` (`db/2026-08-05_opsiyon-yasam-dongusu.sql:91-92`) | ✗ |
| INV-OPT-002 | Emlakçı opsiyonu doğrudan INSERT edemez; yalnız SECURITY DEFINER RPC | PLATFORM INVARIANT | RLS `opsiyon_insert with check(is_admin())` (`db/2026-06-29_opsiyon-talep-onay.sql:18`) | ✗ |
| INV-OPT-003 | Opsiyon yöntemi projeye göre (dogrudan/onay/geçici) zorlanır; yanlış yöntem RPC reddedilir | COMMERCIAL RULE | RPC gate `proje.opsiyon_ayar.yontem` (`db/2026-08-13_opsiyon-admin-bypass.sql:8-54`) | ✗ |
| INV-OPT-004 | Süresi dolan opsiyon serbest bırakılır (kilit_bitis / dogrulama_bitis) | PLATFORM INVARIANT | pg_cron 15dk `opsiyon_serbest_birak` (`db/2026-08-05_opsiyon-yasam-dongusu.sql:14-31`) | ✗ |
| INV-TAHSIS-001 | Tahsis = görünürlük/dağıtım ilişkisi, stok ownership DEĞİL | PLATFORM INVARIANT | `birim` tek referans; `tahsis` ayrı tablo (V2 A.2/D.17) | ✗ |
| INV-TAHSIS-002 | Askıda/kaldırılmış tahsis emlakçıya birim görünürlüğü VERMEZ | PLATFORM INVARIANT | `emlakci_birim_gorebilir` `t.durum='aktif' AND baslangic<=now() AND (bitis is null OR bitis>now())` (`db/2026-08-12_tahsis-yasam-dongusu.sql:41-58`) | ✗ |
| INV-TAHSIS-003 | Kaldırılmış (kaldirildi) tahsis terminal; tekrar geçiş yapılamaz | PLATFORM INVARIANT | `tahsis_toplu` `durum<>'kaldirildi'` filtresi (`:149,178`) | ✗ |
| INV-RLS-001 | Emlakçı yalnız kendine tahsisli + KYC-dogrulandi + kapsam-içi (veya demo) birimi görür | PLATFORM INVARIANT | SECURITY DEFINER `emlakci_birim_gorebilir` (6-arg) + KYC gate | ✗ |
| INV-RLS-002 | Service-role yalnız server/cron; client bundle'a girmez (`NEXT_PUBLIC` değil) | PLATFORM INVARIANT | V2 D.6; `createAdminClient` server-only | ✗ |
| INV-RLS-003 | Non-admin kendini `belge_durumu='dogrulandi'` yapamaz (KYC-gate bypass kalkanı) | PLATFORM INVARIANT | trigger `belge_durumu_guard` (doc 02:94) | ✗ |
| INV-PRICE-001 | Fiyat/durum tek referans `birim`; paylaşım/katalog/mikrosite canlı basar, kopyalamaz | PLATFORM INVARIANT (DEĞİŞMEZ #2) | `/p/{kod}` request-time service-role read (`src/lib/sharing.ts:144-161`) | ✗ |
| INV-PRICE-002 | WhatsApp metni ve OG görseline fiyat basılmaz (cache donması) | PRODUCT DECISION | V2 A.2 | ✗ |
| INV-LEAD-001 | Lead `atanan_id=ilk_paylasan_id`=paylaşan emlakçı (ilk kaydeden) | COMMERCIAL RULE | `src/app/api/lead/route.ts:74-75` | ✗ |
| INV-LEAD-002 | Aynı `(telefon_norm, birim_id)` 10dk içinde ikinci lead oluşturmaz (throttle) | CONFIGURABLE POLICY | `api/lead/route.ts:44-59` (429) — **not durable cross-agent claim** | ✗ |
| INV-LEAD-003 | Müteahhit toplu lead feed'i görmez; yalnız ad/telefon birebir sorgu | PLATFORM INVARIANT | `db/2026-07-24_lead-select-rls.sql` (producer arm removed) | ✗ |
| INV-COMM-001 | Müteahhidin danışmana tanımladığı satış komisyonundan Projedar pay ALMAZ | PRODUCT DECISION | V2 Bölüm C; `tahsis.komisyon_tip/deger` emlakçıya RLS-görünür | ✗ |
| INV-FRESH-001 | Her yazışta `son_guncelleme=now()`; 15g+ birim `stale=true` | PLATFORM INVARIANT (DEĞİŞMEZ #5) | daily cron `freshnessCalistir` (V2 A.3) | ✗ |
| INV-EVENT-001 | `events` append-only; INSERT yalnız service-role/SECURITY DEFINER | PLATFORM INVARIANT | doc 04:73 (no client INSERT policy) | ✗ |
| INV-SHARE-001 | Geçersiz HMAC token → `notFound()`; fallback yok | PLATFORM INVARIANT | `src/lib/sharing.ts` (LEAD_SHARE_SECRET, no fallback) | ✗ |
| INV-ADMIN-001 | admin = platform işletmecisi; stok/birim/fiyat düzenlemez (panelde yok) | PLATFORM INVARIANT | Sistem-Kurallari B.1; admin panelinde stok CRUD yok | ✗ |
| INV-SCOPE-001 | Projedar CDO'nun agent/skill/rules/knowledge/kararları YALNIZ Projedar reposunda geçerli; başka Claude projesinin davranışını değiştiremez, global config'e taşınmaz, `memory: project` dışında memory kullanılmaz | PLATFORM INVARIANT | agent scope guard + `git rev-parse --show-toplevel` doğrulaması; global `~/.claude` dokunulmaz | ✗ |
| INV-ADMIN-002 | admin canlı (non-demo) birimde `opsiyon.satici_id`/satıcı OLAMAZ; concierge aksiyonu scope'lu + `kaynak='admin_concierge'` işaretli olmalı | PLATFORM INVARIANT | **İHLAL:** `db/2026-08-13_opsiyon-admin-bypass.sql:14,30` `is_admin() OR` ile açıyor → audit E1/F1a | ✗ |
| INV-AUDIT-001 | Her state-değiştiren admin mutasyonu `events`'e satır yazar (actor + before/after); "denetim" UI bütünlük iddiası buna bağlı | PLATFORM INVARIANT | **FIX (E2):** `tip="hesap"` audit → kullaniciGuncelle (before/after, rol→admin `yuksek_riskli`), kullaniciOlustur, ureticiEkle (dogrulanmis_otomatik), ofisEkle, paketEkle/Duzenle/Sil; denetim UI'da görünür/filtrelenir | ✗ |
| INV-SALE-001 | Tüm "→satıldı" geçişleri tek satış-kapama yolundan (hakediş + satıcı attribution); grid'de ham `durum=satildi` yasak | PLATFORM INVARIANT | **FIX (C1, `c5e7165`+):** `birimDurumGuncelle`/`birimTopluGuncelle` ham `satildi` reddeder → `birimSatisKapat` zorunlu; toplu seçenekten kaldırıldı. Açık istisna: Excel import "zaten satılmış" (doğrudan satış, danışman yok, hakediş yok — meşru initial-load) | ✗ |
| INV-STATE-001 | Hiçbir cron path `satis_beklemede` birimi serbest bırakamaz (sözleşme aşaması korunur) | PLATFORM INVARIANT | **FIX (B3):** iki cron yolu da (`isler.ts` + pg_cron `opsiyon_serbest_birak`) yalnız `opsiyonlu` serbest bırakır; `satis_beklemede` müteahhit teyidine (birimSatisKapat) veya manuel geri-alışa bağlı | ✗ |
| INV-EXCL-001 | Münhasır tahsis kapsamı, aynı birimlerde başka aktif tahsisle çakışamaz (veya açık override+audit) | COMMERCIAL RULE | **UYGULANMIYOR:** `munhasir` yalnız display flag → audit B4/U-01 | ✗ |
| INV-PRICEVIS-001 | Fiyat-görünürlük RPC'leri authenticated çağrıda advisor kimliğini `auth.uid()`'ten türetir; client'ın geçtiği advisor param YALNIZ service-role (mikrosite) için güvenilir → `coalesce(auth.uid(), p_emlakci)`, asla tersi | PLATFORM INVARIANT | `db/2026-08-14_fiyat-redaksiyon-tek-kaynak.sql` (MODE B P1 düzeltmesi); `birim_gorunur_fiyat` authenticated'a grant EDİLMEZ | ✗ |

## Aday invariant kararları (spec §55 → ACCEPT/MODIFY)
- INV-CANDIDATE-001 → **ACCEPT** = INV-OPT-001.
- INV-CANDIDATE-002 → **ACCEPT** = INV-TAHSIS-001.
- INV-CANDIDATE-003 (suspended tahsis yeni ticari taahhüt yaratamaz) → **MODIFY:** yeni görünürlük/opsiyon engellenir (INV-TAHSIS-002) ama **mevcut aktif opsiyon serbest bırakılmaz** (gap — bkz. `references/17` RISK-TAHSIS-001, `references/22` DEBT-001).
- INV-CANDIDATE-004 (fiyat değişimi geçmiş rezervasyon terms'ini sessizce değiştirmez) → **DECISION REQUIRED:** bugün opsiyon satırı fiyat snapshot TAŞIMAZ; mikrosite canlı basar → orta-opsiyon fiyat değişimi müşteriye gösterileni sessizce değiştirir (bkz. `references/17` RISK-PRICE-001, OQ-PRICE-001).
- INV-CANDIDATE-005 (public görünürlük ≠ private stok) → **ACCEPT:** public'te canlı stok sayısı/fiyat gösterilmez (V2 D.27).
- INV-CANDIDATE-006 (yetki kaybı → stale session ayrıcalık taşımaz) → **ACCEPT (partial):** `proxy.ts` her istekte `getUser()` server-doğrular; RLS `durum='aktif'` gate. Tahsis-revoke→opsiyon gap ayrı (RISK-TAHSIS-001).
- INV-CANDIDATE-007 (ticari override attributable/auditable) → **ACCEPT (partial):** `tahsis_toplu` events'e old/new yazar; ama admin opsiyon-bypass audit netliği OQ-AUDIT-001.
