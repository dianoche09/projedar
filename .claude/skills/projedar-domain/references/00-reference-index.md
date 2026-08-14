# 00 — Reference Index (Projedar domain knowledge map)

> Status: CURRENT · Last verified: 2026-08-14 · Confidence: High
>
> **İlke:** Repo'da zaten kod-doğrulanmış kanonik dokümanlar var. Bu skill onları **YENİDEN YAZMAZ**;
> her spec-reference numarasını ya (A) okunacak mevcut dokümana ya da (B) net-new dosyaya eşler.
> Çelişkide `docs/projedar-intelligence/MASTER-PROJEDAR-IDENTITY-V2.md` kazanır; `db/*.sql` > `supabase-schema.sql`.

## A. Mevcut kanonik kaynaklar (repo — ÖNCE BUNLARI OKU)
| Konu | Kaynak dosya |
|---|---|
| **Kanonik master truth (26 tablo/13 enum, gerçek↔konumlandırma↔hukuki ayrımı)** | `docs/projedar-intelligence/MASTER-PROJEDAR-IDENTITY-V2.md` |
| Bağlayıcı sistem yapısı (roller/admin/gelir — DEĞİŞMEZ) | `ProjePazar-Sistem-Kurallari.md` |
| Ürün & iş modeli | `docs/projedar-intelligence/01-PRODUCT-AND-BUSINESS.md` |
| Roller & yetki & RLS | `docs/projedar-intelligence/02-USERS-ROLES-PERMISSIONS.md` |
| Feature envanteri | `docs/projedar-intelligence/03-FEATURE-INVENTORY.md` |
| **Veri modeli (tablo/enum/ilişki)** | `docs/projedar-intelligence/04-DATA-MODEL.md` |
| Route & sayfa haritası | `docs/projedar-intelligence/05-ROUTES-AND-PAGES.md` |
| API & entegrasyon | `docs/projedar-intelligence/06-API-AND-INTEGRATIONS.md` |
| Public/SEO/GEO yüzeyleri | `docs/projedar-intelligence/07-SEO-GEO-PUBLIC-SURFACES.md` |
| Altyapı & güvenlik | `docs/projedar-intelligence/09-INFRASTRUCTURE-SECURITY.md` |
| Roadmap & tech-debt | `docs/projedar-intelligence/10-TODO-ROADMAP-TECH-DEBT.md` |
| **Çelişkiler & eski kod (audit yakıtı)** | `docs/projedar-intelligence/11-CONTRADICTIONS-AND-OLD-CODE.md` |
| Finansal model | `docs/projedar-intelligence/FINANSAL-MODEL.md` |
| Build sırası & kabul kriterleri | `ProjePazar-Devir-Dokumani.md` |
| Aktif backlog / düzeltmeler | `ProjePazar-Gelistirme-Duzeltme-Backlog.md` · `ProjePazar-Gorev-Takip.md` |
| Tasarım ruhu | `ProjePazar-Tasarim-Ruhu.md` · memory `tasarim-dili.md` |
| Şema (canlı = kök + db/*) | `supabase-schema.sql` + `db/*.sql` |

## B. Spec §54 reference numarası → kaynak eşlemesi
| # | Spec konusu | Nerede |
|---|---|---|
| 00 Product Charter | mevcut | MASTER-IDENTITY-V2 Bölüm A/B/C/D + Sistem-Kurallari |
| 01 Domain Glossary | mevcut+ | 04-DATA-MODEL + V2 Bölüm E enum listesi; "never conflate" → SKILL.md §2 |
| 02 Current System Map | mevcut | 05-ROUTES + 06-API + 09-INFRA |
| 03 Domain Model | mevcut | 04-DATA-MODEL + V2 D.14-17 |
| 04 Role Capability Matrix | mevcut | 02-USERS-ROLES §2 |
| 05 Panel/Nav/Workbench Map | mevcut | 05-ROUTES + 03-FEATURE-INVENTORY |
| 06 State Machines | mevcut+ | V2 A.4 (opsiyon) + D.15 (birim_durum) + `db/2026-08-05_opsiyon-yasam-dongusu.sql`, `db/2026-08-12_tahsis-yasam-dongusu.sql` |
| **07 Business Invariants** | **NET-NEW** | `references/07-business-invariants.md` |
| **08 Cross-Panel Consequence Matrix** | **NET-NEW** | `references/08-cross-panel-consequence-matrix.md` |
| 09 Authorization/Visibility/Tenancy | mevcut | 02-USERS-ROLES §3 + 09-INFRA (RLS/SECURITY DEFINER) |
| 10 Inventory/Tahsis/Distribution | mevcut | V2 A.2/D.17 + `db/2026-06-29d_tahsis-daire-kapsam.sql`, `db/2026-08-12_tahsis-yasam-dongusu.sql` |
| 11 Option/Reservation/Sale | mevcut | V2 A.4 + `db/2026-06-29*_opsiyon*`, `db/2026-08-04_opsiyon-*`, `db/2026-08-05_opsiyon-yasam-dongusu.sql` |
| 12 Pricing/Campaign/Snapshot | mevcut | `db/2026-08-04_fiyat-gecmisi.sql`, `db/2026-08-11_dinamik-fiyat.sql`, `db/2026-08-10_emlakci-birim-fiyat.sql` |
| 13 Lead Protection/Conflict/Dispute | mevcut+ | V2 A.5 + `db/2026-07-24_lead-select-rls.sql`, `db/2026-08-11_lead-derinlik-*.sql`; boşluklar → `references/13-lead-gaps.md` (net-new, ince) |
| 14 Commission | mevcut | V2 Bölüm C + `komisyon_tip/deger` (tahsis) |
| 15 Public/Private Sharing | mevcut | 07-SEO-GEO-PUBLIC-SURFACES + V2 A.5/D.20/D.27 |
| 16 Freshness/Provenance | mevcut | V2 A.3 (tazelik + stale cron) |
| **17 Risk Register** | **NET-NEW (living)** | `references/17-risk-register.md` |
| 18 Real-World Scenarios | net-new (living) | `references/18-real-world-scenarios.md` (audit seed) |
| 19 Known Failure Modes | mevcut+ | 10-TODO + 11-CONTRADICTIONS |
| 20 Exception/Recovery Playbook | net-new (living) | `references/20-exception-recovery-playbook.md` (audit sonrası doldurulur) |
| 21 Abuse/Gaming | net-new (living) | `references/21-abuse-gaming-register.md` (audit seed) |
| **22 Domain Debt** | **NET-NEW (living)** | `references/22-domain-debt.md` |
| **23 Open Questions/Validation** | **NET-NEW (living)** | `references/23-open-questions-validation.md` |
| **24 Architecture/Domain Decisions (ADR)** | **NET-NEW (living)** | `references/24-domain-architecture-decisions.md` |
| **25 Domain Test Catalog** | **NET-NEW (living)** | `references/25-domain-test-catalog.md` |
| **26 Research Sources** | **NET-NEW** | `references/26-research-sources.md` |
| **27 Regulatory Watch** | **NET-NEW** | `references/27-regulatory-watch.md` |
| **28 Project Sales CRM Interoperability** | **NET-NEW** | `references/28-project-sales-crm-interoperability.md` |
| **29 System-of-Record / Reconciliation Matrix** | **NET-NEW** | `references/29-system-of-record-reconciliation-matrix.md` |
| **30 Developer Sales System Boundary** | **NET-NEW** | `references/30-developer-sales-system-boundary.md` |

## C. İlk audit çıktısı
İlk FULL PRODUCT AUDIT: `references/audit/2026-08-14-first-full-audit.md` (agent kurulum sonrası üretti).
