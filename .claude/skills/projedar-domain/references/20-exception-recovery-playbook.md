# 20 — Exception / Recovery Playbook (living)

> Status: MIXED · Last verified: 2026-08-14
> Kim neyi nasıl düzeltebilir? "Prod DB'ye SQL atarız" normal operasyon modeli DEĞİL.

| Durum | Tespit | Kim düzeltir | Nasıl (bugün) | Gap / hedef |
|---|---|---|---|---|
| Opsiyon yanlış birime alındı | danışman/üretici fark eder | üretici (red) / cron (expiry) | opsiyon reddi/serbest bırakma | undo/grace yok |
| Tahsis yanlış toplu verildi | üretici | üretici | `tahsis_toplu` askıya al/kaldır | preview/affected-count var mı doğrula |
| Birim yanlışlıkla musait'e döndü | üretici | üretici | manuel durum düzelt | immutable satış geçmişi korunmalı |
| Cron opsiyon expiry çalışmadı | monitoring gap | ops | cron restart | alerting yok (S-07) |
| Yanlış fiyat girildi | üretici/danışman | üretici | fiyat düzelt (`fiyat_gecmisi` log) | aktif opsiyon etkisi (RISK-PRICE-001) |
| Lead ihtilafı | müteahhit sorgu | (arbitraj yok) | `ilk_paylasan_id` görünür | review queue + evidence hedefi (OQ-LEAD-001) |
| Paylaşım linki sızıntısı | — | danışman/üretici | `paylasim_kod.aktif=false` manuel | proaktif deaktive yok (OQ-SHARE-001) |

## İlke
Ticari override görünmez olmamalı (audit: `events` old/new — `tahsis_toplu` yapıyor). Kritik failure için: kim tespit eder, kim düzeltir (auto/manual), hangi related record etkilenir, hangi historical record immutable kalır, kim bilgilendirilir, ticari hak etkilendi mi, incident/audit nasıl tutulur.
