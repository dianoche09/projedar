# 23 — Open Questions / Validation Required (living)

> Status: CURRENT · Last verified: 2026-08-14
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

## OQ-SHARE-001 — Satış/opsiyon sonrası dolaşımdaki paylaşım kodları deaktive edilmeli mi? [PRODUCT DECISION]
Bugün `paylasim_kod.aktif` manuel; mikrosite canlı bastığı için satıldı görünür ama link hâlâ geçerli.

## OQ-PRICEVIS-001 — Tahsis revoke/expire olunca dolaşımdaki mikrosite fiyatı da çekilmeli mi? [PRODUCT DECISION]
`birim_gorunur_fiyat` yöneten tahsis çözülmezse `coalesce(...,true)` → fiyat gösterir. Mikrosite (service-role, RLS backstop yok) paylaşan danışmanın tahsisi kaldırıldıktan/süresi dolduktan sonra da paylaşılmış `/p/{kod}` linkinde canlı fiyatı göstermeye devam eder. A1 `fiyat_gorunur=false` durumunu düzeltir ama "tahsis çekildi" durumunu değil. Müteahhit "bu danışmanı çektim" derken paylaşımların da düşmesini bekleyebilir. (MODE B P2, pre-existing.)
