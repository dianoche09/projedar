# 24 — Domain Architecture Decisions (ADR, living)

> Status: CURRENT · Last verified: 2026-08-14
> DEĞİŞMEZLER (CLAUDE.md) = kabul edilmiş ADR'ler olarak kaydedildi. Yeni karar buraya; çelişen eski kararı supersede et.

## DDR-001 — RLS-önce görünürlük, tahsis üzerinden
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Görünürlük tamamen Postgres RLS + `tahsis` + SECURITY DEFINER fonksiyonlarında. Client'tan service-role yok (yalnız server/cron). Neden: kapalı-devre B2B, çok-tenant izolasyon. Enforcement: `emlakci_birim_gorebilir`/`emlakci_proje_tahsisli`.

## DDR-002 — Tek referans kaynak (birim)
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Fiyat/durum yalnız `birim`; paylaşım canlı basar, kopyalamaz. Neden: stale/çelişki önleme. Tradeoff: aktif opsiyon fiyat snapshot taşımıyor (RISK-PRICE-001 → gelecekte snapshot kararı gerekebilir, DDR-002'yi ezmeden).

## DDR-003 — Çift-satış kalkanı DB'de
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Aktif opsiyon çakışması `opsiyon_tek_aktif` partial unique index + FOR UPDATE. Uygulama katmanına güvenilmez. Enforcement: `db/2026-08-05_opsiyon-yasam-dongusu.sql`.

## DDR-004 — WhatsApp MVP = yalnız giden deep-link
Date: (kuruluş) · Status: Accepted · Class: Product decision
Karar: Serbest-metin AI parse ile stoğa yazma YOK (Faz-2). Fiyat panel/concierge ile güncellenir.

## DDR-005 — Komisyondan pay alınmaz
Date: 2026-06-18 · Status: Accepted · Class: Product decision
Karar: Müteahhidin danışmana tanımladığı satış komisyonundan Projedar pay almaz. DB'de `komisyon_tip/deger` var (danışmanın kazancı). İşlem ücreti karara bağlı değil → truth'a girmez. Kaynak: V2 Bölüm C.

## DDR-006 — admin = platform işletmecisi, üretici değil
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: admin panelinde stok/birim/fiyat CRUD yok; admin gelir/hesap/doğrulama/denetim/büyüme yapar. Roller ayrı panel görür.

## DDR-007 — Emlakçı paneli route = /danisman
Date: (drift düzeltmesi, 2026-08-14 doğrulandı) · Status: Accepted · Class: Product decision
Karar: Emlakçı paneli `/danisman` (kod). Dokümanlarda geçen `/havuz` ESKİ. `HAVUZ_ROL` sabiti kod-içi ad olarak kalmış olabilir ama route `/danisman`. Not: doc 02/04 güncellenmeli (drift).

## Bekleyen kararlar → `references/23-open-questions-validation.md`
