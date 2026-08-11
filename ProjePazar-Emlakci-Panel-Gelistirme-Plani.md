# Emlakçı Paneli Geliştirme Planı (2026-08-10)

Kaynak: havuz/ kapsamlı envanter (Explore agent) + bu oturumda eklenenler. Hedef: "emlakçının her gün açtığı başucu uygulaması" (canlı stok + hız + bildirim), **tekil CRM inşa etmeden** (CLAUDE.md değişmezi).

## Durum (özet)
Panel olgun: ana havuz (filtre/sıralama/harita/kart), proje detay (medya/künye/stok/tahsis/güven skoru/katalog), opsiyon (3 yöntem + DB kilit + cron), lead (platform-kaynaklı, durum ilerletme), performans hunisi, hakediş, eşleştir, lansman, bildirim, KYC.
Bu oturumda eklendi: **kazanç görünürlüğü** (kart/KPI/daire/modal) + **fiyat düşüşü bildirimi** + opsiyon süresi bildirimi (zaten vardı).

## CRM sınırı (değişmez) — 2026-08-11 revize: "stok-bağlı genişletme"
Üst doktrin (Sistem Kuralları 5.2 "danışman müşteri adayını kaydeder/takip eder" + Lock-in #5 "müşteri + satış geçmişi burada birikir") lead-takip birikmesini **ISTER**. Bu yüzden eski battaniye-yasak ("lead notu/hatırlatma hiç yok") daraltıldı. Yeni sınır tek testle çizilir:

**Test:** Özellik `tahsis→paylaşım→lead→opsiyon→satış` zincirine ve `events` veri-yerçekimine bağlı mı (EVET) yoksa stoktan bağımsız genel kişi/görev/pipeline defteri mi (HAYIR)?

- **YAP:** platform-kaynaklı sinyali emlakçıya geri ver (canlı stok, bildirim, paylaşım). **Platform-lead'ine bağlı**: not/aktivite timeline, kayıp nedeni, takip hatırlatması (kişisel + stok-tetikli), hafif enrichment (email/bütçe/ihtiyaç/etiket/sıcaklık). Hepsi **minimal ve lead'e bağlı**.
- **YAPMA:** stoktan bağımsız **manuel/dış lead** girişi ve import, kişisel **pipeline/kanban** (durum-pill zaten var, ötesi yok), müşteri 360° profilleme (Identity Graph Katman B — KVKK kararı olmadan), ödeme/tahsilat defteri, müteahhide toplu lead feed.
- Favori/kayıtlı-arama'yı **"bildirim aboneliği"** olarak konumla, "kişisel liste" olarak değil.
- Pazarlama dili: "müşterin senin, kimse çalamaz"; çıplak "komisyon yok/komisyonsuz" YASAK; sahiplik "garanti" değil "görünürlük/şeffaflık".

---

## FAZ 1 — Quick wins (yüksek değer / düşük efor, S)
Günlük sürtünmeyi hemen azaltan, backend'siz ya da hafif işler.

1. **DaireModal: `navigator.share` + "Linki kopyala"** — şu an yalnız WhatsApp. Native paylaşım (SMS/mail/Telegram) + kopyala. Paylaşım sürtünmesini bitirir.
2. **Ana havuzda serbest-metin arama** — mevcut client verisi üzerinde anlık filtre; sıfır backend. Portföy tarama hızı.
3. **Eşleştir'i anlık-filtreye çevir** — gereksiz "Eşleştir" butonunu kaldır (filtre zaten canlı).
4. **Foto lightbox/galeri** — proje detay fotoları yeni-sekme yerine modal galeri (mobil swipe).
5. **havuz `error.tsx`** — Supabase down senaryosunda ham hata yerine güven veren sınır.
6. **`lib/para.ts` + `lib/tazelik.ts` ortak helper** — 6+ dosyadaki kopya para/tazelik/süre mantığını birleştir (teknik borç, ileriki işleri hızlandırır).

## FAZ 2 — Engagement çekirdeği (geri-getirme, M)
"Her gün aç" alışkanlığını kuran mekanizmalar. Veri büyük ölçüde hazır.

7. **Günlük "Havuzda bugün" digest kartı** (ana havuz üstü) — son 24-48s tahsisli stoktan: fiyat düşüşü + yeni müsait daire + opsiyonu bitişe yakın olanlar, tek kartta. **#1 geri-getirici.** Fiyat düşüşü cron'da zaten hesaplanıyor; `son_guncelleme` + opsiyon `kilit_bitis` mevcut.
8. **Kartta "bugün değişen" rozeti** — "fiyat düştü / yeni müsait" işareti (fiyat delta cron'dan, durum `son_guncelleme`'den).
9. **Proje "takip et" = bildirim aboneliği** — favoriyi CRM-listesi değil, "bu projede hareket olunca bildir" olarak kur (sunum zaten bunu vaat ediyor: sunum/emlakci). Takip DB'si minimal (emlakçı+proje).
10. **Bildirim merkezinde tip filtresi + tercihler** — BildirimListe filtre + profilde hangi tipi al (push/mail).

## FAZ 3 — Büyük kaldıraç (L)
11. **Web Push (PWA)** — Serwist SW var ama push handler + subscription + cron→push yok. "Sana tahsisli X projede fiyat düştü" → uygulamayı arka-plandan açtırır. En güçlü uzun-vadeli tutma; digest + fiyat/opsiyon bildirimlerini push'a bağlar. Not: pwa-development skill mevcut.

## Yan akış — iş kolaylaştırma (M, fırsatça)
12. **Eşleştir → toplu katalog** — bulunan 3 daireyi tek katalog/mesaj olarak müşteriye gönder (şu an tek tek).
13. **Lead → WhatsApp şablon ön-dolgu** — dönüş mesajını proje/daire + link ile ön-doldur.
14. **Opsiyon arşivi sekmesi** — Opsiyonlarım yalnız aktifleri gösteriyor; kaybedilen/tamamlanan geçmişi (öğrenme + güven).
15. **Lansman → takvime ekle / hatırlat** (.ics veya bildirim).

## Teknik borç (sürekli)
16. **Ana havuz agregatını RPC/view'a taşı** — client-join (O(proje×birim)) büyük tahsiste ağırlaşır; `emlakci_havuz_ozet` benzeri.
17. **DaireModal focus-trap + role=dialog + Esc** — erişilebilirlik.

## FAZ 0 — Lead bug/güvenlik (koşulsuz, önce) — 2026-08-11
Doktrinden bağımsız; bug + güvenlik.
- **L0.1 `niyet` veri kaybı (P0/S):** `LeadForm` niyet topluyor, `/api/lead` Zod parse ediyor ama `lead` insert'ine yazılmıyor (`api/lead/route.ts:64-75`). Kolon ekle + insert + panelde göster.
- **L0.2 RLS açığı (P1/M):** `lead_insert with check(true)` (`supabase-schema.sql:391`) → anon key ile doğrudan sahte lead/PII basılabilir. SECURITY DEFINER RPC'ye taşı veya policy daralt (DEĞİŞMEZ #1).
- **L0.3 Durum→event + `updated_at`/`son_temas_at` (P1/S):** `leadDurumGuncelle` (`havuz/actions.ts:479-501`) log yazmıyor; funnel/güven-skoru/tazelik verisi üretilmiyor.

## FAZ 4 — Lead derinliği (stok-bağlı, "kayıt altına alma") — 2026-08-11 kararı
Kullanıcı kararı (2026-08-11): stok-bağlı genişletme. Hepsi platform-lead'ine bağlı, minimal.
- **L1 Lead detay görünümü** — kim-getirdi, proje/birim/paylaşım, niyet, durum geçmişi tek ekranda (salt-okuma zengin). Manuel lead formu DEĞİL.
- **L2 Not + aktivite timeline** — `lead_not` tablosu; zaman damgalı serbest not + `events`'ten stok olayları (paylaştın/baktı/opsiyon) tek akışta.
- **L3 Kayıp nedeni** — `kayip_nedeni` (fiyat/kredi/başkasından aldı/ulaşılamadı) → müteahhide geri-besleme.
- **L4 Takip hatırlatması** — `sonraki_aksiyon_at`/`_notu` (kişisel "Cuma ara") + stok-tetikli ("fiyat düştü → müşterini ara"); `bildirim` + cron (`option-expiry` deseni) hazır.
- **L5 Hafif enrichment** — email, bütçe, ihtiyaç (oda/m²/bölge), etiket, sıcaklık; hepsi opsiyonel, zorunlu değil.
- **L6 Kim-getirdi/Lead Protection görünürlüğü** — "ilk bayrağı sen diktin"; RLS zaten DB-seviyesinde koruyor.
- **L7 Çift-lead uyarısı** (aynı `telefon_norm`) — birleştirme opsiyonel/dikkatli (farklı emlakçı = insan kararı).

## YAPMA (kapsam dışı, CRM) — revize
- Stoktan bağımsız **manuel/dış lead** girişi ve import
- Kişisel **pipeline/kanban** drag-drop (durum-pill ötesi)
- Müşteri 360° profilleme (Identity Graph Katman B, KVKK kararı olmadan)
- ML lead skorlama, drip email/SMS otomasyonu, dialer
- Ödeme/tahsilat/alacak-borç defteri · müteahhide toplu lead feed

---

## Önerilen sıra
**FAZ 0 (L0.1→L0.3, koşulsuz bug/güvenlik)** → FAZ 1 (1→6, hızlı görünür değer) → FAZ 4 (L1→L2 CRM çekirdeği, L4 takip) → FAZ 2 #7 digest → #9 takip → FAZ 3 Web Push. Yan akış ve teknik borç aralara serpiştirilir.
