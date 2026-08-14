# 22 — Domain Debt (living)

> Status: CURRENT · Last verified: 2026-08-14 · Seed: ilk audit
> "Şimdilik böyle" kararlarını kaybetme; sektör gerçeği sanma.

## DOMAIN-DEBT-001 — Tahsis-revoke cascade yok
Current simplification: `tahsis_toplu` yalnız tahsis satırını değiştirir.
Real-world not covered: revoke edilen danışmanın aktif opsiyonu/lead'i serbest/transfer edilmiyor.
Risk: RISK-TAHSIS-001. Affected: /uretici tahsis, opsiyon, lead.
Temporary mitigation: yok. Future resolution: revoke policy + cascade. Revisit trigger: ofis konsolu / iç dağıtım Faz-2.

## DOMAIN-DEBT-002 — Lead claim 10dk pencere
Current: dedup `(telefon_norm, birim_id, 10dk)`.
Not covered: durable cross-agent first-touch, identity graph, eş/alt-telefon/ofis değişimi.
Risk: RISK-LEAD-001. Future: timestamped claim sertifikası (doc 10:34). Revisit: lead ihtilafı artınca.

## DOMAIN-DEBT-003 — Opsiyon fiyat snapshot yok
Current: opsiyon satırı işlem-anı fiyatını taşımaz (tek-referans canlı basar).
Not covered: orta-opsiyon fiyat değişimi. Risk: RISK-PRICE-001. Future: commercial snapshot (DDR-002'yi ezmeden).

## DOMAIN-DEBT-004 — Otomatik test yok
Current: opsiyon/RLS/lead invariant'ları test-siz. Risk: RISK-TEST-001. Future: `references/25` katalog.

## DOMAIN-DEBT-005 — ofis/marka/arsa ayrı panel yok
Current: `ofis_yetkili/marka_yetkili/arsa_sahibi` → `/danisman`'a düşer (`src/lib/roller.ts:18-20`).
Not covered: ofis roll-up/ekip performansı/iç dağıtım/pay paneli. Future: Faz-2 ayrı konsollar.

## DOMAIN-DEBT-006 — Dinamik fiyat / opsiyon_talep.kod dormant
Current: `fiyat_kurali` şema var, iş mantığı yok; `opsiyon_talep.kod` terk edilmiş. Future: karar/temizlik.

## DOMAIN-DEBT-007 — Yurtdışı kolonları boş
Current: `proje` para_birimi≠TRY/golden_visa/diller boş (doc 04:200). Future: uluslararası faz.
