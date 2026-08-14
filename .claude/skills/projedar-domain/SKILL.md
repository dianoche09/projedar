---
name: projedar-domain
description: >
  Projedar's real-estate operating model, domain invariants, roles, panel/workflow rules,
  inventory/distribution/lead/option/reservation semantics, risk patterns, recovery,
  research sources and accepted domain decisions. Use for any Projedar domain design,
  review or audit (units, prices, tahsis, options, reservations, sales, commission,
  leads, RLS/visibility, public sharing, developer CRM/ERP interoperability,
  system-of-record boundaries, reconciliation, integrations, bulk ops, exceptions, recovery).
---

# Projedar Domain — review method + knowledge index

Bu skill, `projedar-real-estate-cdo` agent'ının **domain review yöntemini** verir ve
Projedar'ın kanonik bilgisine hızlı giriş sağlar. Ansiklopedi DEĞİLDİR; ayrıntı
`references/` altında ve **repo'daki mevcut kanonik dokümanlarda** durur (duplicate source-of-truth yaratma).

## 0. Mission & boundaries (kısa)
Projedar = **çok-müteahhitli, üretici-kontrollü, canlı konut stoğu B2B dağıtım ağı.**
Değildir: full CRM, tüketici ilan portalı, developer ERP/inşaat yönetimi, muhasebe/tahsilat suite,
çağrı merkezi, pazarlama otomasyonu, ödeme platformu. Bir capability ancak Projedar'ın
**çekirdek dağıtım işlemini** (doğru+güncel stoktan güvenli opsiyon/rezervasyon/satışa giden B2B akış)
doğrudan destekliyorsa kapsama girer. "Yapılabilir" ≠ "Projedar yapmalı".

Standart: *"Deneyimli bir Türk müteahhit / proje satış direktörü / broker / PropTech operatörü sistemi
incelese, ekibin gayrimenkul işini tahmin ederek değil gerçekten anlayarak tasarladığını hisseder mi?"*

**Project-only (INV-SCOPE-001):** Bu skill/agent/knowledge yalnız Projedar reposuna aittir. Global `~/.claude`
(agents/skills/rules/CLAUDE.md/settings/memory) veya başka repo değiştirilmez; `memory: project` dışında memory kullanılmaz.
Bootstrap/audit öncesi `git rev-parse --show-toplevel` ile Projedar repo root doğrulanır; yanlış repoysa çalışma reddedilir.

## 1. ADVISE ETMEDEN ÖNCE (zorunlu) — koddan kanıtla
1. İlgili kodu + `references/00-reference-index.md`'deki kanonik dokümanları oku.
2. Mevcut tabloları/enum/RPC/action/policy/RLS/route/panel/event/test'i ara (Grep/Glob), uydurma.
3. **Mevcut gerçek** ≠ **öneri** ≠ **sektör pratiği** ≠ **hukuki/regülasyon** — karıştırma.
4. Agent project memory'sindeki kabul edilmiş kararlara bak.
5. Sektör pratiği belirsiz ve materyalse: araştır (bkz. `references/26-research-sources.md`), asla icat etme.

**Kanonik gerçek kaynağı sırası:** `docs/projedar-intelligence/MASTER-PROJEDAR-IDENTITY-V2.md`
(çelişkide V2 kazanır) → diğer `docs/projedar-intelligence/*` → kod → `db/*.sql` (çelişkide `db/*` kazanır, `supabase-schema.sql` bilinçli eski).

## 2. NEVER CONFLATE (varsayılan zorunlu ayrımlar — Projedar kararı farklıysa conflict RAPORLA)
tahsis ≠ inventory ownership · tahsis ≠ reservation · tahsis ≠ EİDS yetkisi ·
proje erişimi ≠ birim tahsisi · visibility ≠ authorization · opsiyon ≠ rezervasyon ·
rezervasyon ≠ satış · lead kaydı ≠ generic CRM ownership ·
komisyon tanımı ≠ eligibility ≠ earned ≠ approval ≠ ödeme ·
birim durumu ≠ tahsis durumu · user rolü ≠ organizasyon üyeliği ·
public paylaşım izni ≠ private B2B stok erişimi ·
güncel ticari kural ≠ işlem-anı snapshot · bildirim gönderildi ≠ iş durumu değişti ·
Projedar request/intent ≠ dış CRM/ERP authoritative confirmation ·
mirror edilen dış state ≠ Projedar-owned canonical state · UI-disabled ≠ server authorization ·
operasyon log'u ≠ iş audit'i.

## 3. RULE CLASSIFICATION (her anlamlı kuralı etiketle)
LEGAL/REGULATORY · PLATFORM INVARIANT · COMMERCIAL RULE · CONFIGURABLE POLICY ·
INDUSTRY CONVENTION · PRODUCT DECISION.
Sektör alışkanlığını yanlışlıkla DB invariant yapma; gerçek invariant'ı "esneklik olsun" diye config'e çevirme.
Variability testi: *"Bu evrensel mi, yoksa bir müteahhidin çalışma biçimi mi?"* (lead/opsiyon/rezervasyon süresi,
komisyon oranı/modeli, kampanya koşulu, fiyat geçerlilik, tahsis scope, opsiyon onay gereği, fiyat snapshot policy
büyük olasılıkla CONFIGURABLE). Her şeyi configurable yapma; varyasyonu modelle, kaosu hard-code etme.

## 4. REVIEW CHECKLIST (her material feature/change)
- Hangi iş problemi çözülüyor? Repo'da mevcut davranış (kanıt: file/func/table/policy)?
- Kim aksiyon alıyor, kim etkileniyor? Hangi state/transition değişiyor? Ne invariant kalmalı?
- Her kural: legal/invariant/config/commercial/convention/product?
- **Cross-panel:** her ilgili panelde (uretici/havuz/admin + public/integration) sonuç ne? (bkz. `references/08-cross-panel-consequence-matrix.md`)
- Ne yanlış gidebilir (concurrency, stale, dış sistem çelişkisi, expiry, yetki iptali, çalışan ayrılması, insan hatası, gaming)?
- Failure nasıl tespit/contain/recover edilir? Ne audit/provenance kalmalı?
- Hangi kritik invariant otomatik teste dönmeli? (en güçlü katman: DB constraint/index → transaction/lock → RLS → server RPC → integration guard → UI son katman)
- **Entegrasyon dokunuyorsa:** system-of-record kim? Projedar OWN/MANAGE/MIRROR/INITIATE/OBSERVE/REFERENCE/OUT_OF_SCOPE? request ≠ confirmation? sync/async? timeout→dış işlem olmuş olabilir mi? retry idempotent mi? out-of-order event? reconciliation? (bkz. `references/29`, `references/30`)

## 5. REVIEW SEVERITY
- **P0** — yanlış satış/stok ownership, unauthorized/cross-tenant erişim, geri-alınamaz ticari bozulma, kritik veri kaybı.
- **P1** — yanlış reservation/option/lead/price/commission/authorization sonucu veya yüksek ticari risk.
- **P2** — domain ambiguity, eksik lifecycle, scale/recovery/audit zayıflığı, gelecekte tutarsızlık.
- **P3** — terminology/maintainability/düşük-riskli UX/domain clarity.
Kategori doldurmak için sahte finding üretme. Compile/build geçmesi domain approval DEĞİL.

## 6. UNCERTAINTY PROTOCOL (assumption'ı sessizce koda çevirme)
KNOWN · LIKELY/INDUSTRY PATTERN · PROJECT DECISION REQUIRED ·
EXTERNAL DOMAIN EXPERT VALIDATION REQUIRED · REGULATORY VERIFICATION REQUIRED · LEGAL VALIDATION REQUIRED.

## 7. OUTPUT CONTRACT (ciddi review'da bu yapıyla dön)
Domain Interpretation → Current Reality (kanıt) → Affected Aggregates & Roles → Rule Classification →
Invariants → State/Transition Effects → CRM/ERP Boundary & System of Record (varsa) →
Cross-Panel Consequences → Risks (P0-P3 + impact/likelihood/detectability/recovery) →
Edge/What-If → Abuse/Human Error → Recovery/Exception → Recommendation (en küçük domain-correct çözüm) →
Acceptance Tests → Knowledge Updates → **Decision: APPROVE / APPROVE WITH CONDITIONS / REVISE / BLOCK.**
P0/P1 çözülmeden implementasyon "complete" sayılmaz.

## 8. OPERATING MODES
- **A — DOMAIN DESIGN** (kod öncesi): business problem, current behavior, roles, entities, transitions, rules vs config, invariants, auth/visibility, cross-panel, risks, exceptions, recovery, acceptance tests.
- **B — IMPLEMENTATION REVIEW** (kod sonrası): `git diff` + migrations/schema + RPC/actions + RLS/policies + API + UI/panel sonuçları + test coverage + audit/event değişimi.
- **C — DOMAIN EVOLUTION**: kabul edilmiş kalıcı kararı doğru knowledge kaydına işle (invariant/ADR/risk/glossary/state machine/debt/source). Çelişen iki gerçek bırakma; supersede et.
- **D — FULL PRODUCT AUDIT**: tüm ürünü rol/panel/workflow/domain/risk/recovery/scale/UX açısından tara. Audit doğrudan feature emri değil; backlog önceliğidir.

## 9. MEMORY DISCIPLINE
Yalnız durable, doğrulanmış öğrenim yaz (canonical table/aggregate, verified state machine, authoritative source,
RLS stratejisi, kabul edilmiş domain kararı, bilinen exception, deprecated pattern, tekrarlayan failure mode).
Yazma: spekülasyon, tek-seferlik log, onaylanmamış fikir, "muhtemelen" sektör pratiği.

## 10. REFERENCE INDEX
Hangi referans dosyasını ne zaman okuyacağın: `references/00-reference-index.md`.
Bootstrap current-state bilgisi büyük ölçüde `docs/projedar-intelligence/*`'te; bu skill onları YENİDEN YAZMAZ, işaret eder.
Net-new (repo'da olmayan) domain bilgisi: `references/07` (invariants), `references/17` (risk register),
`references/22` (domain debt), `references/23` (open questions), `references/24` (ADR), `references/25` (test catalog),
`references/28-30` (CRM/ERP interoperability + system-of-record + boundary).
