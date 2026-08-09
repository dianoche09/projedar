# Emlakçı Paneli Geliştirme Planı (2026-08-10)

Kaynak: havuz/ kapsamlı envanter (Explore agent) + bu oturumda eklenenler. Hedef: "emlakçının her gün açtığı başucu uygulaması" (canlı stok + hız + bildirim), **tekil CRM inşa etmeden** (CLAUDE.md değişmezi).

## Durum (özet)
Panel olgun: ana havuz (filtre/sıralama/harita/kart), proje detay (medya/künye/stok/tahsis/güven skoru/katalog), opsiyon (3 yöntem + DB kilit + cron), lead (platform-kaynaklı, durum ilerletme), performans hunisi, hakediş, eşleştir, lansman, bildirim, KYC.
Bu oturumda eklendi: **kazanç görünürlüğü** (kart/KPI/daire/modal) + **fiyat düşüşü bildirimi** + opsiyon süresi bildirimi (zaten vardı).

## CRM sınırı (değişmez)
YAP: platform-kaynaklı sinyali emlakçıya geri ver (canlı stok, bildirim, paylaşım kolaylığı). YAPMA: lead notu/görev/hatırlatma, manuel lead ekleme, müşteri-özel not, kişisel pipeline. Favori/kayıtlı-arama'yı **"bildirim aboneliği"** olarak konumla, "kişisel liste" olarak değil.

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

## YAPMA (kapsam dışı, CRM)
- Lead notu / görev / hatırlatma sistemi
- Manuel lead ekleme / dış lead import
- Müşteri-özel not, kişisel pipeline drag-drop

---

## Önerilen sıra
FAZ 1 (1→6, hızlı görünür değer) → FAZ 2 #7 digest (en yüksek getiri) → #9 takip → FAZ 3 Web Push. Yan akış ve teknik borç aralara serpiştirilir.
