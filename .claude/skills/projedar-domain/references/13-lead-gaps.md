# 13 — Lead Protection / Conflict / Dispute (gaps)

> Status: MIXED · Last verified: 2026-08-14 · Mevcut kanonik: V2 A.5 + `db/2026-07-24_lead-select-rls.sql`, `db/2026-08-11_lead-derinlik-*.sql`.

## Mevcut (KANITLI)
- `lead.ilk_paylasan_id` + `atanan_id` = paylaşan emlakçı (`src/app/api/lead/route.ts:74-75`).
- `telefon_norm` (`normalizeTelefon`, indexli); geçersiz telefon reddedilir.
- Dedup/throttle: `(telefon_norm, birim_id)` 10dk → 429.
- Opsiyon onayında rakip pending talepler auto-reject (tek "first-wins" çözümü).
- Müşteri sahipliği **garanti edilmez**; platform arbitraj yapmaz (Sistem-Kuralları). Müteahhit birebir sorguyla `ilk_paylasan_id` görür.

## Ele ALINMAYAN (gap — RISK-LEAD-001, DEBT-002, OQ-LEAD-001)
- Aynı müşteri, iki ofis/danışman (farklı link/birim/>10dk) → farklı `ilk_paylasan_id`; durable cross-agent claim YOK.
- Eş/aile, alternatif telefon, e-posta değişimi, typo → identity graph yok.
- Danışman ofis değişimi / çalışan ayrılması → lead sahiplik devri tanımsız.
- Zaman-damgalı müşteri-claim sertifikası YOK (doc 10:34).

## Tasarım ilkesi
Projedar "kanıtı kaydeder/enforce eder/recommend eder" ile "kimin haklı olduğuna nihai karar verir" rollerini KARIŞTIRMAZ. Match/possible-match/no-match/conflict confidence yaklaşımı; ihtilafta review queue + evidence, sessiz karar değil.
