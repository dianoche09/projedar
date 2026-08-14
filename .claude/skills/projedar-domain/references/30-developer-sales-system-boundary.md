# 30 — Developer Sales System Boundary (CRM/ERP ↔ Projedar)

> Status: MIXED (CURRENT = bugün entegrasyon YOK; TARGET = gelecekte müteahhit CRM/ERP köprüsü)
> Last verified: 2026-08-14 · Evidence: `MASTER-PROJEDAR-IDENTITY-V2.md` A.7/A.10, `06-API-AND-INTEGRATIONS.md`
> Confidence: High (current state) / Low (target design — PROJECT DECISION REQUIRED)

## CURRENT (kod-gerçeği, KANITLI)
Bugün Projedar'ın **müteahhit CRM/ERP'sine bağlı hiçbir canlı entegrasyonu YOKTUR.**
- Stok/fiyat/tahsis/opsiyon **source-of-truth = Projedar DB** (`birim`, `tahsis`, `opsiyon`).
- Stok girişi: manuel (sihirbaz) + Excel import + concierge. Dış API senkron yok.
- WhatsApp = yalnız **giden deep-link** (Cloud API + serbest-metin AI parse YOK — Faz-2).
- Keşif motoru dış API kullanır (SerpAPI/Serper/Places + e-posta kazıma) ama bu **lead generation**, satış-sistemi entegrasyonu değil.

**Sonuç:** Bugün her domain kavramı için Projedar = **OWN**. "İki sistem çelişirse" problemi bugün YOK;
ama **off-system reality** problemi VAR (müteahhit telefon/Excel/kendi CRM'inde paralel satış yapabilir → §24 Off-System Reality Test hâlâ geçerli).

## Domain Ownership Classification (bugün → hedef)
Her developer-sales kavramı için Projedar'ın rolü. Bugün hepsi OWN; entegrasyon geldiğinde bazıları MIRROR/INITIATE/OBSERVE olabilir — bu **PROJECT DECISION REQUIRED**.

| Kavram | CURRENT rol | Muhtemel TARGET (entegrasyon halinde) | Not |
|---|---|---|---|
| Proje/blok/tip kimliği | OWN | MIRROR veya OWN | müteahhit CRM'de proje master olabilir |
| Birim satılabilirlik/stok state | OWN | MIRROR (developer authoritative) veya MANAGE | en kritik reconciliation noktası |
| Güncel fiyat | OWN | MIRROR | CRM≠Projedar fiyat → hangisi broker'a gösterilir? DECISION |
| Kampanya/ödeme planı | OWN | MIRROR/REFERENCE | — |
| Broker-görünür komisyon kuralı | OWN | OWN | Projedar dağıtım katmanı; komisyondan pay almaz (V2 C) |
| Tahsis / dağıtım | **OWN (her zaman)** | OWN | bu Projedar'ın çekirdek işi, dışarı verilmez |
| Lead/müşteri kimliği (dağıtımla ilgili) | OWN (kısmi) | MIRROR/REFERENCE | müteahhit CRM'de tam müşteri 360 olabilir → OUT_OF_SCOPE |
| Lead protection claim (`ilk_paylasan_id`) | **OWN** | OWN | Projedar'a özgü dağıtım hakkı |
| Opsiyon | OWN | INITIATE (Projedar başlatır) + CRM confirm | request ≠ confirmation |
| Rezervasyon | OWN | INITIATE/MIRROR | DECISION |
| Satış sonucu | OWN | MIRROR/OBSERVE (developer authoritative) | müteahhit fiziksel/CRM'de kapatır |
| Sözleşme state | OUT_OF_SCOPE | OUT_OF_SCOPE | Projedar sözleşme yazmaz |
| Tahsilat/ödeme | OUT_OF_SCOPE | OUT_OF_SCOPE | muhasebe suite değil |
| Tapu/teslim | OUT_OF_SCOPE | OBSERVE (opsiyonel) | — |

## CRM Scope Guard (Projedar YAPMAZ — müteahhit CRM'inde görülse bile)
call center/softphone · generic lead nurturing · görev/randevu yönetimi · marketing automation ·
SMS/e-mail campaign · full customer 360 · sözleşme authoring · tahsilat/muhasebe · senet/çek ·
satış-sonrası servis/ticketing · inşaat ERP. Bunlardan yalnız **broker dağıtım işlemini** doğru yürütmek için
gereken minimum yüzey seçilir. "Rakip CRM'de var → bizde de olmalı" GEÇERSİZ argüman; test:
*"Broker distribution transaction'ını doğru/güvenli/entegre yürütmek için bunu OWN etmem mi, MIRROR/INITIATE/OBSERVE etmem mi yeter?"*

## Developer Panel Design Rule
`/uretici` paneli klasik CRM dashboard kopyası DEĞİL, **broker distribution control center** olmalı:
broker ağıma hangi stok/proje açık · hangi veri güncel/stale · hangi ofis/danışman hangi tahsis kapsamında ·
hangi broker müşteri getirdi/conflict · hangi opsiyon/rezervasyon request bekliyor · hangi state çelişiyor ·
hangi ofis satış üretiyor · hangi komisyon hakkı oluştu/ihtilaflı · hangi dağıtım op'u attention gerektiriyor.

## Açık kararlar → `references/23-open-questions-validation.md` (OQ-CRM-*)
