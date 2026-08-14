# 29 — System-of-Record / Reconciliation Matrix

> Status: CURRENT (bugün tek sistem = Projedar) + TARGET (entegrasyon senaryosu)
> Last verified: 2026-08-14 · Evidence: V2 A.2/A.4/A.7 · Confidence: High (current)

## Bugünkü gerçek
Tek authoritative sistem = **Projedar DB**. Reconciliation "iki sistem" problemi bugün YOK.
Ama **request ≠ confirmation** ve **out-of-order/timeout** disiplini, entegrasyon gelmeden ÖNCE tasarlanmalı
ki panel içi async akışlar (opsiyon talep→onay) ve gelecekteki CRM köprüsü güvenli olsun.

## SoR matrix (her kritik veri sınıfı)
| Kavram | Authoritative (CURRENT) | Projedar rolü | Sync yönü | Freshness | Conflict kuralı | Dış id/version | Kaynak yoksa fallback |
|---|---|---|---|---|---|---|---|
| Birim stok state | Projedar `birim` | OWN | — | `son_guncelleme`, 15g stale cron | tek yazıcı; opsiyon trigger | — | — |
| Fiyat | Projedar `birim` | OWN | — | canlı, `fiyat_gecmisi` | tek referans | — | — |
| Tahsis | Projedar `tahsis` | OWN | — | — | RLS+SECURITY DEFINER | — | — |
| Opsiyon | Projedar `opsiyon` | OWN | — | cron kilit-bitiş | `opsiyon_tek_aktif` partial unique | — | — |
| Lead / kim-getirdi | Projedar `lead`/`events` | OWN | — | — | `ilk_paylasan_id` first-write | — | — |
| **(TARGET) müteahhit CRM stok** | müteahhit CRM | MIRROR (öneri) | CRM→Projedar | SLA tanımlanmalı | quarantine, silent last-write-wins YASAK | external ref + version gerekli | son bilinen + stale badge |

## Command ≠ Confirmation (bugün panel-içi, yarın entegrasyon)
Opsiyon talep akışı (`opsiyon_talep` → müteahhit onayı) bugün **tek DB içinde** olduğu için atomik.
Entegrasyon geldiğinde (Projedar→dış CRM async): timeout, dış sistemde opsiyonun **oluşmadığını KANITLAMAZ**.
Gerekli olacak: idempotency key · correlation id · external request/reference id · explicit `pending` state ·
retry policy · authoritative status fetch · webhook/event confirmation · reconciliation job.

## Reconciliation davranışı (silent last-write-wins YASAK)
Çelişki tipleri (TARGET): CRM SOLD / Projedar AVAILABLE · CRM OPTIONED / Projedar AVAILABLE ·
fiyat farkı · unit inactive / broker-visible · reservation active / expired.
Risk seviyesine göre: auto-reconcile · quarantine/block · stale/unverified badge · manual review ·
responsible owner · conflict evidence · resolution audit.

## Off-System Reality (BUGÜN geçerli — entegrasyon olmadan da)
Müteahhit Projedar dışında (telefon/Excel/kendi ofisi/kendi CRM'i) satış/opsiyon yapabilir.
Projedar'da event olmaması gerçekte olmadığını göstermez. Her kritik state için:
"bu iş bugün WhatsApp/telefon/Excel ile nasıl yürüyor?" sorusu sorulmalı ve reconciliation davranışı düşünülmeli.
Bugünkü mekanizma: tazelik sinyali (son güncelleme + stale rozet) — ama bu tespit, önleme değil.

## Açık kararlar → `references/23-open-questions-validation.md`
