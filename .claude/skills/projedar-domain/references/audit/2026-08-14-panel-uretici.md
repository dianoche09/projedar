# Audit — ÜRETİCİ paneli (MODE D, scoped) · 2026-08-14

> Scope: `src/app/uretici/**` + dokundukları RPC/tablo/RLS. Kanıt: file:line.
> Method: projedar-domain. Kanonik sıra: MASTER-IDENTITY-V2 > docs/intelligence > kod > db/*.sql.
> Bu dosya kalıcı bulgu indeksidir; tam gerekçe audit sohbet çıktısında.

## Executive
Panel gerçek bir "broker dağıtım komuta merkezi" iskeletine sahip (tahsis merkezli, canlı stok,
opsiyon disiplini config'i, talep radarı). Ama birkaç yerde **iş bütünlüğü modellenmemiş**: münhasırlık
zorlanmıyor (dekoratif), tahsis-revoke aktif opsiyon/lead'i serbest bırakmıyor, toplu güncelleme
opsiyon desync kalkanını atlıyor, "satıldı"ya iki farklı kapıdan gidiliyor, proje yayın/taslak durumu yok,
migration-gated özellikler canlı gibi gösteriliyor (dev notu müşteriye sızıyor). Ölçek: tüm ekranlar
üreticinin TÜM birimini limitsiz çekip JS'te agregeliyor + N+1 RPC (hakediş/fiyat-önerisi).

## Bulgular (ID · sev · kanıt)
- U-01 P1 — münhasır (exclusivity) hiçbir yerde zorlanmıyor; RLS `emlakci_birim_gorebilir` münhasırı yok sayar; çakışan "Tüm ağ" tahsisi münhasır vaadi sessizce kırar. UI "tek-kanal tahsis" diye söz veriyor. Kanıt: `db/2026-08-12_tahsis-yasam-dongusu.sql:123-126` (yalnız veri), `tahsis/page.tsx:418-424`, `actions.ts:1170-1185` (dedup/uyarı yok).
- U-02 P1 — Toplu durum güncelleme opsiyon desync kalkanını atlar. Tek `birimDurumGuncelle` opsiyonu temizler (`actions.ts:409-426`), `birimTopluGuncelle` (`actions.ts:825-846`) temizlemez → opsiyonlu→müsait toplu geçişte hayalet opsiyon satırı kalır.
- U-03 P1 — Tahsis askıya al/kaldır aktif opsiyon/lead'e cascade etmiyor. `tahsis_toplu` yalnız tahsis.durum + event (`db/2026-08-12_tahsis-yasam-dongusu.sql:140-200`). Danışman görünürlüğü gider ama opsiyonu açık kalır, birim yeniden dağıtılamaz. (= RISK-TAHSIS-001/DEBT-001, kod-doğrulandı.)
- U-04 P1 — "Satıldı"ya iki kapı: `birimSatisKapat` (hakediş yazar + satıcı atıf + komisyon) vs `birimDurumGuncelle(durum=satildi)` (hakediş YOK). Grid'den chip ile satış hakediş defterine düşmez; stok "kim sattı" boş çıkar. `actions.ts:417-421` vs `501-580`, `stok/page.tsx:92-103`.
- U-05 P1 — Aktif opsiyon/satılan birimde fiyat/daire_no serbest düzenlenebilir. `birimGuncelle` (`actions.ts:461-494`) ve `birimTopluGuncelle` durum filtresi yok → orta-opsiyon fiyat değişimi mikrosite'ye canlı basar (RISK-PRICE-001), satılan birimin kaydı bozulur.
- U-06 P2 — Proje yayın/taslak durumu YOK (`proje`de yayin/durum kolonu yok). Wizard "Yayınla" sadece link; tahsis adım 6'da eklenince eksik (fiyatsız/medyasız) proje ağa açılır. `ProjeWizard.tsx:462-498`, `proje/yeni` akışı.
- U-07 P2 — Migration-gated özellikler canlı gibi + dev notu müşteriye sızıyor: ödeme planı (`actions.ts:1556-1583`, `kurulum:360-362`), dinamik fiyat (`kurulum:368-370`), birim.gorsel (`stok/page.tsx:65-67`). UI'da "db/...sql migration'ı çalıştır" metni üretici-görünür.
- U-08 P2 — Ölçek tavanı: kokpit/stok/projeler/talep-radari/raporlar üreticinin TÜM birimini limitsiz çeker + JS agrege (`page.tsx:60-64`, `stok/page.tsx:52-56`); dashboard proje×birim O(n²) filter (`page.tsx:242-247`). talep-radari 20k event limiti (`talep-radari:58`).
- U-09 P2 — N+1 RPC: hakediş her satılan birim için `birim_satici_kazanci` (`hakedis/page.tsx:68-78`); opsiyonlar her sahip için `emlakci_skor` (`opsiyonlar:114-119`).
- U-10 P2 — Tahsis ekleme akıbet önizlemesi yok (kaç birim açılıyor); segment yalnız danışman SAYISI gösterir (`TahsisHedef.tsx:141-152`), etkilenen birim/çakışma yok.
- U-11 P3 — durum enum'da `kiralandi` (kira) satış dağıtım ağında; kira lifecycle'ı yok, konflasyon. `actions.ts:384-392`.
- U-12 P3 — `birimDurumGuncelle` proje sahipliğini/`proje_id` eşleşmesini doğrulamaz, yalnız RLS'e dayanır (`actions.ts:429-432`); `birimGuncelle` daha savunmacı (`:486-490`). Tutarsız ama RLS-backed.

## Doğrulanan sağlamlar (regresyon yazılırsa korunacak)
- Opsiyon çift-satış kalkanı DB'de (partial unique + FOR UPDATE) — INV-OPT-001.
- Medya/tip/birim görsel yükleme IDOR kalkanı (proje_id eşleşmesi) — `actions.ts:283-289, 595-601`.
- Lead-sorgu birebir (fishing yok, wildcard escape) — `lead-sorgu:64-73`.
- Talep-radari/raporlar events RLS'e güvenmeyip kod-scope proje filtresi — `talep-radari:64-66`.
- Dalga cron planli→musait idempotent (satisa_acilis temizlenir) — `cron/_lib/isler.ts`.
