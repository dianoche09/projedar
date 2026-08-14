# 18 — Real-World Scenarios (living seed)

> Status: CURRENT seed · Last verified: 2026-08-14
> Her senaryoda: affected role/panel · detection · prevention · recovery · audit. Bugünkü davranış koddan.

## S-01 İki danışman aynı saniyede aynı birime opsiyon
Bugün: DB `opsiyon_tek_aktif` + FOR UPDATE → 1 başarı, diğeri 23505. ✓ (T-OPT-001).

## S-02 Aktif opsiyon varken tahsis kaldırılır
Bugün: opsiyon kilitli kalır, birim yeniden dağıtılamaz, lead de-alloc danışmanda. ⚠️ RISK-TAHSIS-001. Recovery: manuel. Karar: OQ-TAHSIS-001.

## S-03 Opsiyon sürerken fiyat değişir
Bugün: mikrosite canlı basar → müşteriye gösterilen fiyat sessizce değişir; opsiyon snapshot yok. ⚠️ RISK-PRICE-001.

## S-04 Platform-dışı satış (telefon/Excel)
Bugün: Projedar'da birim musait görünür; yalnız tazelik sinyali (tespit≠önleme). ⚠️ RISK-OFFSYSTEM-001.

## S-05 Aynı müşteri iki danışmandan gelir (>10dk / farklı birim)
Bugün: iki bağımsız lead, farklı `ilk_paylasan_id`. ⚠️ RISK-LEAD-001. İhtilaf: müteahhit birebir sorguyla ilk kaydedeni görür ama global claim yok.

## S-06 Danışman ofisten ayrılır (aktif opsiyon/lead varken)
Bugün: opsiyon/lead RLS `own/atanan/ilk_paylasan` → hesap pasifleşene dek erişim; devir akışı yok. ⚠️ DEBT-005/OQ-LEAD-001.

## S-07 Cron opsiyon expiry çalışmazsa
Bugün: pg_cron 15dk; çalışmazsa birim `opsiyonlu` kilitli kalır. Recovery: manuel/cron restart. Monitoring gap.

## S-08 Geçersiz/forwarded paylaşım linki
Bugün: geçersiz token → `notFound()`; geçerli link forward edilirse mikrosite canlı stok gösterir (satıldıysa satildi basar). Link expiry/revoke manuel (OQ-SHARE-001).

## S-09 Admin concierge herhangi bir birime opsiyon yaratır
Bugün: `is_admin() OR` bypass ile mümkün (`db/2026-08-13_opsiyon-admin-bypass.sql`). Audit netliği OQ-AUDIT-001.

## S-10 Excel toplu import yarıda fail
Bugün: `StokImport` önizle/dry-run → commit; eslesmeyen_blok/mukerrer sınıflama. Partial-failure semantiği doğrulanmalı (T- eklenebilir).
