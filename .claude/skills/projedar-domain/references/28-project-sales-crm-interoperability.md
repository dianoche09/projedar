# 28 — Project Sales CRM Interoperability (mental model, scope sınırı)

> Status: TARGET/REFERENCE (Projedar'a CRM feature kopyalamak İÇİN DEĞİL — sınır yönetimi için)
> Last verified: 2026-08-14 · Confidence: Medium (sektör mental modeli) · Amaç: interoperability, scope guard

## Neden bu dosya var
Müteahhit satış ekibi PrismCRM/Konutmatik/Novo CRM gibi sistemlere alışkın. Bu lifecycle'ları
**anlamak** Projedar'ın dağıtım köprüsünü doğru kurmak için gerekli; **kopyalamak** değil.
"Understanding a domain does not imply Projedar should own it."

## Developer-side satış operasyonu lifecycle (sektör mental modeli — LIKELY/INDUSTRY PATTERN)
```
Lead → Müşteri → İhtiyaç/Qualification → Proje → Bağımsız Bölüm
 → Teklif → Opsiyon → Rezervasyon → Satış → Sözleşme → Ödeme/Tahsilat → Tapu/Teslim
```
Paralel inventory/commercial lifecycle:
```
Proje → Etap/Faz → Blok → Kat → Bağımsız Bölüm → Fiyat → Kampanya → Ödeme Planı → Durum
```
Tipik durum kelimeleri (sektör): satışa kapalı · satışta · opsiyonda · rezerve · sözleşme aşamasında ·
satıldı · iptal · tekrar satışta. **Bunlar enum olarak kopyalanmaz** — Projedar'ın gerçek `birim_durum`'u
(musait/opsiyonlu/satis_beklemede/satildi/stop/planli/kiralandi) koddan gelir (V2 D.15).

## Projedar'ın bu lifecycle'daki yeri
Projedar **tüm satış operasyonunu** üstlenmez. Yeri:
```
Developer sales reality (CRM/ERP/Excel/telefon)
   → [Projedar: controlled broker distribution + tahsis + canlı stok + opsiyon/lead protection]
   → Office/Advisor/Buyer workflow
```
Yani Projedar = müteahhidin authoritative satış gerçekliği ile broker dağıtım ağı arasındaki **güvenilir köprü.**

## Projedar scope İÇİ (broker distribution transaction için gerekli minimum)
canlı stok görünürlüğü + tazelik · granüler tahsis · opsiyon (3 yöntem) · lead kaydı + kim-getirdi ·
imzalı paylaşım/katalog · komisyon görünürlüğü (pay almadan) · güven/doğrulama.

## Projedar scope DIŞI (bkz. `references/30` CRM Scope Guard)
full customer 360 · sözleşme authoring · tahsilat/muhasebe · senet/çek · call center · marketing automation ·
satış-sonrası servis · inşaat ERP · görev/randevu yönetimi.

## Her CRM capability için karar sorusu
> Projedar'ın broker dağıtım işlemini doğru/güvenli/entegre yürütmesi için bunu **OWN** etmesi mi gerekir,
> yoksa **MIRROR / INITIATE / OBSERVE / REFERENCE** etmesi yeterli mi?

Araştırma kaynakları: `references/26-research-sources.md` (PrismCRM/Konutmatik/Novo — pattern research, feature kopyası değil).
