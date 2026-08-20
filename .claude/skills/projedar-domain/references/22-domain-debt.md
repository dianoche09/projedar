# 22 — Domain Debt (living)

> Status: CURRENT · Last verified: 2026-08-14 · Seed: ilk audit
> "Şimdilik böyle" kararlarını kaybetme; sektör gerçeği sanma.

## DOMAIN-DEBT-001 — Tahsis-revoke cascade yok
Current simplification: `tahsis_toplu` yalnız tahsis satırını değiştirir.
Real-world not covered: revoke edilen danışmanın aktif opsiyonu/lead'i serbest/transfer edilmiyor.
Risk: RISK-TAHSIS-001. Affected: /uretici tahsis, opsiyon, lead.
Temporary mitigation: yok. Future resolution: revoke policy + cascade. Revisit trigger: ofis konsolu / iç dağıtım Faz-2.

## DOMAIN-DEBT-011 — T13 takip bildirimi yalnız cron-expiry yolunda düşer → RESOLVED (2026-08-20, `8ab1438`)
Was: `opsiyon_bekleyen` notify+cleanup YALNIZ `opsiyon_serbest_birak` (cron-expiry) içindeydi → gönüllü bırakma/vazgeçme/manuel release bildirmiyor, `satis_beklemede` takibi orphan kalıyordu.
FIX (`db/2026-08-20b_bekleyen-tum-yollar.sql`, canlı doğrulandı): notify+cleanup mantığı `opsiyon_serbest_birak`'tan ALINDI (fonksiyon pür-N10 expiry'ye döndü, INV-CRON-001/002+B3 saf) ve `birim.durum` trigger'ına (`birim_bekleyen_islet_trg` AFTER UPDATE OF durum ON birim) taşındı. `opsiyon_birim_trg` (AFTER INSERT/**DELETE**/UPDATE ON opsiyon → `opsiyon_birim_senkron`) her release yolunda `birim.durum`'u senkronladığı için (DELETE→'musait', UPDATE→'satildi') trigger EVRENSEL yakalar: →musait (opsiyonlu/satis_beklemede'den) = bildir+sil (tek-seferlik); →satildi/kiralandi = sil (orphan yok). Tüm 4 release yolu artık tek zincirden geçer.
Ref: INV-BEKLE-001, DDR-016.

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

## DOMAIN-DEBT-008 — Tarihsel yanlış-etiketli `sure_doldu` expiry event'leri (backfill YOK)
Current: N10 fix'inden (`666675c`, 2026-08-19) önce Vercel günlük cron'u geçici-kilit (dogrulandi=false) expiry'lerini düz `sure_doldu` bastı; oysa doğrusu `dogrulama_sure_doldu` (INV-CRON-002). Fix ileriye dönük; geçmiş `events` satırları düzeltilmedi.
Not covered: güven-skoru RPC bu tarihsel satırlarda `dusen` sayımını eksik görür → etkilenen müteahhitte doğrulama oranı marjinal yüksek. Volume düşük (pg_cron 15dk'da çoğunu doğru etiketle yakalıyordu; Vercel yalnız 03:00 örtüşmesinde kapıyordu) + skor `talep+gecici >= 3` eşiğiyle gated.
Karar: **backfill YAPMA** (owner + CDO onayı) — event append-only/immutable (INV-EVENT-001); düşük hacim düzeltmenin denetim-bütünlüğü riskini haklı çıkarmaz. Risk: RISK-CRON-001 residual (bilgi). Revisit: yalnız bir müteahhit güven-skoru itirazı bu döneme dayanırsa manuel incele.

## DOMAIN-DEBT-009 — `hakedis` migration bilinçli uygulanmadı (Option L) + tek artık okuyucu
Current: `db/2026-08-09_hakedis-defteri.sql` yazıldı ama **hiç uygulanmadı** ve Option L (DDR-014) ile uygulanmayacak — hakediş canlı-hesap ayna olarak çözüldü, kalıcı defter/ödeme-durumu REDDEDİLDİ (INV-COMM-002).
Karar: **migration'ı uygulama** (owner + CDO). Payment-ledger yeniden açılmaz; yalnız salt-earned-snapshot (accuracy) ayrı kararla değerlendirilebilir (DDR-014 tradeoff notları).
**Artık okuyucu (P2, MODE B N4 bulgusu):** `src/app/uretici/stok/page.tsx:62` hâlâ `from("hakedis").select("birim_id,emlakci_id")` çağırıyor → müteahhit stok grid'inde satılan birimin "satan danışman" adını buradan çözüyor (`saticiAd`, `:98-100`). Tablo olmadığından `data=null` (graceful, crash yok) ama **satılan birimlerde satan danışman adı HİÇ görünmez** — Option L'de kalıcı. `birimSatisKapat`'tan writer kaldırıldığı için tek yazar da yok.
Fix (küçük, Option L ile tutarlı): kaynağı `hakedis` yerine `opsiyon` (`sonuc='satildi'` + `satici_id`) yap — `/uretici/hakedis`'in zaten kullandığı desen. Affected: /uretici/stok grid "kim sattı" kolonu.
Not: `birim_satici_kazanci` RPC (tablo değil, fonksiyon) canlı kalır ve iki hakediş sayfasının da tutar kaynağıdır — silinmez.

## DOMAIN-DEBT-KYC-01 — KYC override audit non-atomik (fire-and-forget)
Current: `belgeKarar` onay yolunda UPDATE profiles + UPDATE kullanici_belge ÖNCE, sonra `kayitYaz` (fire-and-forget,
hatayı yutar — `src/lib/events.ts:49-56`), sonra redirect. Override başarılı olup audit INSERT sessizce düşerse
`belge_durumu='dogrulandi'` kalıcı olur ama override gerekçesi/eksik-set kaydı KAYBOLUR → INV-AUDIT-001 zayıflar.
Ayrıca iki UPDATE transaction'da değil (2. fail → kullanici_belge=dogrulandi ama profiles eski; fail-safe: erişim VERİLMEZ).
Not covered: yüksek-şiddet override için garantili iz. Risk: governance/denetlenebilirlik. Affected: /admin belgeKarar, denetim UI.
Temporary mitigation: yok (pre-existing pattern tüm auditlerde). Future: override'ı tek RPC'de (SECURITY DEFINER) profiles+belge+events
atomik yaz, ya da en az override yolunda audit hatasını yut-ma. Revisit: KYC override sıklığı artınca / denetim ihtilafında.
