# 26 — Research Sources (registry)

> Status: CURRENT · Last verified: 2026-08-14 · Trust tier: A(resmi) B(standart/prod) C(anekdot)
> Kural: kaynak = pattern research, feature kopyası DEĞİL. Kopyalamadan önce lisans + kullanıcı onayı.
> Şablon: URL · Type · Checked · Trust · What learned · Applicability · Mismatch · Decision.

## A — Claude Code resmi (config için)
- https://code.claude.com/docs/en/sub-agents · Official docs · A · agent frontmatter (model/effort/skills/memory/tools/color) — 2.1.92'de hepsi destekli.
- https://code.claude.com/docs/en/skills · A · SKILL.md + references + progressive disclosure.
- https://code.claude.com/docs/en/memory · A · CLAUDE.md vs auto-memory, `.claude/rules/` auto-discovery + `paths:`.

## B — Gayrimenkul / domain standards (pattern research)
- github.com/ahacker-1/cre-agent-skills · B · router/specialist-skill ayrımı. Mismatch: CRE ABD ticari; TR new-development değil. Alınan: modüler skill/reference deseni. Kopyalanmayan: business rules.
- reso.org/specs, dd.reso.org, github.com/RESOStandards/* · B · resource/field/lookup standardizasyon + interoperability. Mismatch: ABD/MLS; TR'ye birebir taşınmaz. Alınan: terminoloji/interoperability lensi.

## C — Reference implementations (reservation/inventory eng.)
- github.com/datadrivenconstruction/OpenConstructionERP · B · lead→reservation lifecycle. Uyarı: ERP; Projedar'ı ERP yapma. Yalnız pattern.
- github.com/TelivityAI/haip (hotel PMS) · B · reservation state machine, double-booking, cancellation, bulk partial-failure. Mismatch: hotel≠real estate sale.
- github.com/Shelf-nu/shelf.nu · B · double-booking prevention, role-based access, availability. Concurrency lensi.

## C2 — TR konut proje satış CRM (mental model / scope guard — feature kopyası DEĞİL)
- gayrimenkulcrm.com / prismcrm.com · C · proje satış yönetimi, blok/daire stok, ödeme planı.
- konutmatik.com · C · dijital satış ofisi, canlı stok, opsiyon/rezervasyon/sözleşme/tahsilat zinciri.
- novoxcrm.com · C · proje stok/fiyat/satış, broker portal, ödeme planı.
Kural: "rakipte var → bizde de olmalı" GEÇERSİZ. Her capability için OWN/MIRROR/INITIATE/OBSERVE/REFERENCE testi (`references/30`).

## E — TR resmi regülasyon → `references/27-regulatory-watch.md`
