# Sunum Deck'leri (üretici + emlakçı) — Tasarım

Tarih: 2026-08-04 · Durum: kullanıcı onaylı (chat)

## Amaç
Yüz yüze satış görüşmelerinde laptop/tabletten sunulacak iki HTML slide deck:
üretici (müteahhit anlaşması kapatma) ve emlakçı (ücretsiz ağa katılım).
Kompakt 10-12 slayt, fiyat/teklif rakamı yok ("anlaşma görüşülür").

## Teknik yapı
- Route'lar: `/sunum/uretici` ve `/sunum/emlakci`. `src/app/sunum/layout.tsx`
  ile `robots: noindex` (gizli link, sitemap dışı).
- `src/components/sunum/DeckShell.tsx` (client): tam ekran slayt sahnesi.
  Ok tuşları (← → Space PgUp/PgDn Home/End), swipe, alt bar (önceki/sonraki
  butonlar, tıklanabilir progress segmentleri, mono sayaç). Tüm slaytlar mounted
  kalır (KuleDemo/TahsisPaneli state'i korunur); aktif olmayan slayt opacity 0 +
  pointer-events none.
- `src/components/sunum/Slayt.tsx`: ortak slayt yerleşimi (kicker, başlık, alt
  metin, içerik). Berrak Güven / Spatial Açık tokenları birebir; yeni renk yok.
- Canlı bileşen yeniden kullanımı: `KuleDemo` (bina kesiti + opsiyon denemesi),
  `TahsisPaneli` (görünürlük simülasyonu) slaytlara gömülür.
- Print/PDF yok (yalnız yüz yüze kullanım, YAGNI).

## Üretici deck'i — 12 slayt
1. Kapak: logo + "Canlı konut stoğu dağıtım ağı" + canlı tazelik rozeti
2. Problem: Excel/PDF fiyat listeleri dakikada eskir, kopya sayısı bilinmez, çift satış riski
3. Çözüm özü: tek doğru kaynak, fiyat/durum tek yerde, paylaşım canlı değerden
4. Nasıl çalışır: stok → tahsis → ağ paylaşır → opsiyon/satış (KuleDemo canlı)
5. Tahsis = kontrol: kim neyi görür sen belirlersin (TahsisPaneli canlı)
6. Çift satış yapısal olarak imkânsız: DB seviyesinde opsiyon kilidi, 48s
7. Fiyat senkron + tazelik: zam → ağ saniyeler içinde güncel, eski fiyat dolaşamaz
8. Kim-getirdi görünürlüğü: ad/telefon sorgusu → ilk kaydeden danışman görünür
9. Talep Radarı: talep sinyalleri, insight kartı örneği, veri üreticide birikir
10. Komisyonsuz + kapalı devre: ilan yok, tahsis var; komisyona dokunulmaz
11. Kurucu Müteahhit: bölge başına sınırlı anlaşma (tahsis modeline gerekçeli kıtlık)
12. Sonraki adım: kurulum concierge (biz yaparız) + anlaşma görüşmesi CTA

## Emlakçı deck'i — 11 slayt
1. Kapak: sana tahsisli projeler, tek canlı havuz
2. Problem: "Bu daire hâlâ satılık mı?", eskiyen PDF, müşteri önünde güven kaybı
3. Çözüm: canlı havuz, her birimde son güncelleme, yalnız tahsisli projeler
4. Nasıl çalışır: bul → 2 dokunuşla paylaş → müşteri canlı sayfayı görür (KuleDemo)
5. Mikrosite: link her açıldığında canlı fiyat, danışman kartın üstte
6. Opsiyon kilidi: 48s, daire sana kilitli, diğer ekranlarda kilitli görünür
7. Lead'in senin: kaydet, müteahhit sorgularsa ilk sen görünürsün, atlanamazsın
8. Tazelik rozeti: eskiyen veri gizlenmez, hep günceli paylaşırsın
9. Bedava: temel üyelik ücretsiz, komisyon kesintisi yok
10. Katılım: kayıt + belge doğrulama → Doğrulanmış rozeti (öncesinde demo proje)
11. CTA: projedar.com/kayit

## İçerik dili kuralları
- Uzun tire "—" yok; "bayat" kelimesi yok ("eskiyen/güncel değil" kullanılır).
- Rakam iddiası uydurulmaz; örnek veriler "örnek" rozetiyle işaretli bileşenlerden gelir.
- Marka adı: Projedar · domain: projedar.com (sitemap ile tutarlı).

## Hata durumu / edge
- Klavye kısayolları form elemanı odaklıyken devre dışı (demo bileşenleri buton içerir;
  yalnız Space/ok tuşu default'u preventDefault ile alınır, buton odağındayken Space atlanır).
- `prefers-reduced-motion` mevcut global kurallarla korunur.
- Mobilde slayt içerikleri dikey scroll edebilir (overflow-y-auto), hiçbir içerik kesilmez.

## Doğrulama
- `npm run lint` + dev server'da her iki deck'te klavye/swipe/demo etkileşimi + ekran görüntüsü.
