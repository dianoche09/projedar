# 23 — Open Questions / Validation Required (living)

> Status: CURRENT · Last verified: 2026-08-20
> Etiket: PROJECT DECISION REQUIRED · EXTERNAL DOMAIN EXPERT · REGULATORY · LEGAL. Sessizce koda çevirme.

## OQ-TAHSIS-001 — Tahsis revoke edilince aktif opsiyon ne olmalı? [PROJECT DECISION]
Seçenekler: (a) opsiyon korunur doğal expiry'ye kadar, (b) hemen expire, (c) müteahhit onayıyla serbest. Lead sahipliği: de-alloc danışmanda kalsın mı, transfer mi? Bugün tanımsız (RISK-TAHSIS-001).

## OQ-PRICE-001 — Aktif opsiyon fiyat snapshot taşımalı mı? [PROJECT DECISION + LEGAL]
Müşteriye gösterilen fiyat opsiyon anında kilitlenmeli mi? Ticari/hukuki bağlayıcılık? Tek-referans (DDR-002) ile denge (RISK-PRICE-001).

## OQ-LEAD-001 — Cross-agent müşteri-claim modeli ne olmalı? [PROJECT DECISION + EXTERNAL DOMAIN EXPERT]
Durable first-touch claim? Identity graph (telefon+isim+eş)? Sistem-Kuralları "platform arbitraj yapmaz" ilkesiyle nasıl uzlaşır (record/evidence, hakem değil)?

## OQ-CRM-001 — Entegrasyon gelince hangi veri sınıfı MIRROR, hangisi OWN? [PROJECT DECISION]
Stok/fiyat/satış müteahhit CRM authoritative olabilir; tahsis/lead-protection Projedar OWN. Matris: `references/29`/`30`. Karar verilmeden entegrasyon implementasyonu onaylanmaz.

## OQ-CRM-002 — CRM≠Projedar fiyat çelişkisinde broker'a hangisi gösterilir? [PROJECT DECISION]

## OQ-AUDIT-001 — admin opsiyon-bypass audit netliği [PROJECT DECISION]
admin herhangi bir birime gerçek opsiyon yaratabilir (`db/2026-08-13_opsiyon-admin-bypass.sql`). Audit'te "admin adına" ayrımı yeterince net mi?

## OQ-EIDS-001 — Tahsis hangi işlemlerde "ilan" sayılır? [REGULATORY + LEGAL]
V2 B.4: "muaf/ilan değil" kesin hüküm olarak kullanılmaz. `references/27`.

## OQ-KVKK-001..004 — Gerçek erasure (Option B) retention kuralları [REGULATORY + LEGAL VALIDATION REQUIRED]
E3/DDR-013: gerçek erasure kurulmadan önce hukuk cevabı gerekir:
1. Anonimleştirilmiş ticari/satış kaydı saklama süresi (TTK/VUK, ör. 10 yıl)?
2. Buyer (non-user) self-servis erasure kanalı olsun mu, yoksa yalnız danışman/müteahhit üzerinden mi? (bugün buyer kanalı yok)
3. Aktif satış/hakediş olan emlakçı silinince hakediş+satış anonimleştirilip saklansın (şema RESTRICT zaten zorluyor) — onay?
4. KYC belgeleri (`kullanici_belge` + `kyc-belge` bucket) hemen mi silinsin, N yıl mı saklansın (KYC/doğrulama yükümlülüğü)?

## OQ-SHARE-001 — Paylaşım revoke tutarlılığı [FULLY RESOLVED 2026-08-20 → DDR-015 + INV-SHARE-002/003]
RESOLVED (owner, güvenlik-sertleştirme bloğu · commits `5e038f2`,`c9f39c0`,`9532bda`).
**MODE A bulgusu (orijinal soruyu genişletti):** sorun yalnız "render iptal edilse de link geçerli" değildi — API yetki kapısı da (`/api/lead`+`/api/etkilesim`) `aktif`'i **bypass ediyordu** (deterministik HMAC token'la yetkilendiriyorlardı; kısa-kod mikrositesi bile token türetiyordu, `p/[...slug]/page.tsx:124`). Yani `aktif=false` yalnız render'ı iptal ediyor, lead-capture+etkileşimi ETMİYORDU.
**Çözüm (DDR-015):** kısa kod = uçtan-uca yetki kimliği; `slugCoz` kod döner, iki API `paylasimKoduCoz` (`aktif=true`) ile çözer + (emlakci,birim)'i kod'dan türetir (client id'leri güvenilmez), kod-yolunda token client'a hiç gitmez → `aktif=false` render+lead+etkileşimi TUTARLI iptal eder. Uzun link emisyonu deprecate (fail-closed); legacy 3-parça link render backward-compat, iptal edilemez, break-glass=`LEAD_SHARE_SECRET` rotasyonu.
**Alt-soru (satış→kod otomatik-deaktivasyonu) — FULLY RESOLVED 2026-08-20 (owner, MODE A DDR "degrade-not-kill"):** Satış `paylasim_kod.aktif`'e DOKUNMAZ. Gerekçe (MODE A bulgusu): (1) satılan birimde lead zaten N11 durum-kapısıyla bloklu (`api/lead/route.ts:68-83`) → kodu öldürmek lead korumasına sıfır katkı; (2) mikrosite satılan birimi zaten dürüstçe "Satıldı + benzer daireler"e düşürüyor (`p/[...slug]/page.tsx:336,676,694,702`) → `aktif=false`→404 bu funnel-recovery'yi REGRESYONA uğratırdı; (3) `aktif` DDR-015'te revoke kimliği olarak tekilleştirildi → satış ile revoke aynı boole'yi paylaşırsa ters re-share niyeti çakışır. **Karar:** `aktif=false` = **yalnız kasıtlı revoke** (INV-SHARE-002); satış-degrade `birim.durum`-güdümlü; tek gerçek boşluk (`/api/etkilesim` durum-kapısız) kapatıldı (INV-SHARE-003, commit `0593733`). "aktif manuel" artık **kasıtlı tasarım tercihi**, boşluk değil. Trigger/`pasif_nedeni`/reverse-trigger KURULMADI (gereksiz). Bu OQ tamamen kapalı; kalan ilişkili konu yalnız tahsis-revoke→mikrosite fiyat düşüşü = OQ-PRICEVIS-001 (ayrı).

## OQ-UR-001 — Üretici `dogrulanmis` güven rozeti kanıt-tabanlı mı, admin-attestation mı? [PRODUCT DECISION]
N12 kapanışı: `ureticiEkle` (`src/app/admin/actions.ts:704-706,719-724`) üreticiyi `dogrulanmis:true` başlatır, `vergi_no`
kaydeder ve `tip:"hesap"` audit'ine `dogrulanmis_otomatik:true` yazar → grant TRACED (INV-AUDIT-001 sağlanır, "izsiz"
şikâyeti çözüldü). Kalan boşluk: rozet dış doğrulama (YAMBİS/TTBS/vergi_no gerçekliği) YAPMADAN "doğrulandı" iddia eder;
bugün bir admin-attestation'dır. Karar gerek: (a) rozet kanıt-bağlı mı olmalı yoksa "admin-onaylı" olarak mı etiketlenmeli;
(b) `dogrulanmis:false` başlatma REDDEDİLDİ (admin'in kasıtlı oluşturması = güven kararı; 2. tık friction, gold-plating).
Ayrıca P3 gözlemlenebilirlik: auto-grant `tip:"hesap"`, manuel `ureticiDogrula` `tip:"dogrulama"` (`:75`) — denetim feed'i
`dogrulama` filtresinde auto-grant'ı kaçırır; tutarlılık istenirse auto-grant da `tip:"dogrulama"` emit edebilir (opsiyonel).
**Bu OQ-KYC-02 / DEBT-KYC-01'den AYRIDIR** (onlar emlakçı MYS/mesleki_yeterlilik; bu üretici firma-legitimliği).

## OQ-KYC-02 — Zorunlu-olmayan belgenin AI-flag'i tek-tık onayı bloklamalı mı? [PRODUCT DECISION]
N6 kararı (2): zorunlu set = yalnız `mesleki_yeterlilik`; `vergi_levhasi` zorunlu DEĞİL. Ama `belgeKarar` `aiFlagli`'yı
TÜM belgeler üzerinden hesaplar (`src/app/admin/actions.ts:204-206`): geçerli MYS + AI-flagged (bulanık) vergi_levhasi
→ override+gerekce zorunlu olur. Güvenli (erişim yanlış verilmez, yalnız friction) ama "vergi zorunlu değil" niyetiyle
çelişebilir. Karar gerek: AI-flag friction'ı yalnız zorunlu-set belgelerine mi daraltalım, yoksa tüm belgelerde mi kalsın?
Bugünkü davranış: tüm belgeler (fail-safe). MODE B P2, kabul edilebilir/kasıtlı olabilir.

## OQ-ORGROLE-001 — Faz-1 stopgap org rollerinin (ofis_yetkili / marka_yetkili / arsa_sahibi) yetenek modeli ne olmalı? [PROJECT DECISION]
N3 kapanışı (commit `e1d4cc1`): bu üç rol ayrı panele sahip değil, `/danisman` havuzuna park ediliyor (`src/lib/roller.ts` ROL_PANEL + ORG_ROLLER/ROL_KISI_ETIKET). KANIT-DOĞRULANMIŞ GÖRÜNÜRLÜK GERÇEĞİ: `ofisEkle` (`src/app/admin/actions.ts:796-799`) profili `rol='ofis_yetkili', durum='aktif'` yaratır ama `belge_durumu` SET ETMEZ → default `'yok'` kalır. Görünürlük gate `emlakci_birim_tahsisli`/`emlakci_birim_gorebilir` (`db/2026-08-17_tahsis-devir-opsiyon-lead.sql:14-58`) = `proje.demo=true` OR (`belge_durumu='dogrulandi'` AND eşleşen tahsis). `hedef_tip='ofis' AND hedef_id=current_ofis()` dalı KYC conjunct'ının İÇİNDE → org rolü ofis'e tahsisli gerçek stoğu bile GÖREMEZ, yalnız `demo=true` görür. N3 bu gerçeği dürüst çerçeveledi (org banner "Ofis konsolun Faz-2'de geliyor", `/danisman/dogrulama` linki YOK; rol-doğru etiket) ama yetenek modeli TANIMSIZ. Kararlar gerek:
1. `ofisEkle` `belge_durumu='dogrulandi'` set etmeli mi (admin-provisioning = doğrulama, INV-RLS-003 ile uyumlu — non-admin kendini yapamaz, admin yapabilir) ki ofis_yetkili `hedef_tip='ofis'` tahsislerini görsün? Yan etki: o zaman advisor havuzuna tam girer.
2. Org rolleri advisor GİBİ işlem yapabilmeli mi (opsiyon alma/paylaşım) yoksa yalnız-görüntüleme mi? (ofis_yetkili/marka bir satan danışman değil, gözetimci.)
3. Gerçek ofis roll-up konsolu = Faz-2; **YENİ cross-user RLS görünürlük yüzeyi** ister (ofis_yetkili'nin ALT danışmanlarının tahsis+stoğunu görmesi) → P1 authorization tasarımı, ASLA service-role aggregation ile değil (DEĞİŞMEZ #1). Karar verilmeden roll-up implementasyonu onaylanmaz.
Bugünkü davranış: demo-preview + "konsol yakında" (dürüst, güvenli, yeni görünürlük vermez).

## OQ-PRICEVIS-001 — Tahsis revoke/expire olunca dolaşımdaki mikrosite fiyatı da çekilmeli mi? [PRODUCT DECISION]
`birim_gorunur_fiyat` yöneten tahsis çözülmezse `coalesce(...,true)` → fiyat gösterir. Mikrosite (service-role, RLS backstop yok) paylaşan danışmanın tahsisi kaldırıldıktan/süresi dolduktan sonra da paylaşılmış `/p/{kod}` linkinde canlı fiyatı göstermeye devam eder. A1 `fiyat_gorunur=false` durumunu düzeltir ama "tahsis çekildi" durumunu değil. Müteahhit "bu danışmanı çektim" derken paylaşımların da düşmesini bekleyebilir. (MODE B P2, pre-existing.)
