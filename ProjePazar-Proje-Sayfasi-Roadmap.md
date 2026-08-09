# Projedar `/proje` Public Sayfası — Rakip Analizi + Roadmap

Kaynak: kullanıcı derin araştırması (2026-08-09). Amaç: public proje sayfasını, Projedar'ın
**yalnız ağa/tahsise açık canlı stok + fiyat** modeline zarar vermeden Türkiye'nin en güçlü
proje BİLGİ sayfasına dönüştürmek. "Rakipte ne varsa kopyala" değil.

## Konumlandırma (üçüncü model)
- Sahibinden/Hepsiemlak: "Neler satılıyor?" (katalog ölçeği + filtre)
- ProjedeFırsat/GüncelProjeBilgileri: "Bu proje hakkında ne biliyoruz?" (modern detay + karşılaştırma + teknik)
- ProjeHattı: "Bugün hangi koşullarla alınabilir?" (tarihli fiyat + karar-öncesi kontrol)
- **Projedar:** "Proje hakkında DOĞRULANABİLİR bilgiyi public sun; satışın gerçek-zamanlı operasyonunu (canlı stok/fiyat/tahsis) yalnız yetkili ağa aç."

## Referans domainler (13) — öncelik: ProjedeFırsat, GüncelProjeBilgileri, Emlakjet, Sahibinden, Hepsiemlak, ProjeHattı
Büyük portal: sahibinden, hepsiemlak, emlakjet, zingat · Proje dikeyi: projedefirsat (3.303 proje, kat planı+kredi+lead), guncelprojebilgileri (karşılaştırma+teknik taksonomi), konutprojeleri, enyenikonutprojeleri, yeniemlak, yeniprojeler · Editoryal: emlakdream (proje haberleri) · Kurumsal: emlakkonut.com.tr · Seçili: projehatti (tarihli fiyat + karar-öncesi kontrol).
- Emlakjet farkı: bölge zekası (Endeksa: nüfus/eğitim/gelir) + firma profili bağlama.
- ProjedeFırsat farkı: tip bazında kat planı + oda + m² + "Bilgi Al" + kredi hesabı.
- ProjeHattı farkı: "Bilgi tarihi" + tip bazında peşinat/taksit/vadeli toplam + karar-öncesi kontrol.

## Public'e EKLENECEK (öncelikli)
**P0**
- Proje statüsü taksonomisi (ön talep / lansman / satışta / inşaat / hemen teslim / satışı tamamlandı) — standardize.
- İnşaat aşaması = görsel ilerleme (timeline/%).
- **Daire tip kartları:** 1+1/2+1/3+1 · net+brüt m² birlikte · **kat planı first-class** · banyo/balkon/otopark. (Fiyat + adet YOK → ağa geçiş sebebi.) [KISMEN YAPILDI: Ağda'da daire_tipi.plan_url plan kartları var]
- **Güncellik/kaynak satırı (hero altı):** "Kaynak: geliştirici/resmi/editoryal · Son kontrol: <tarih> · Durum: Satışta · Geliştirici: Doğrulanmış". (Projedar'ın en ayrıştırıcı bloğu.)
- Ödeme planı **var/yok sinyali** (public) + ödeme planı hesaplayıcı.
- Yakın POI (metro/hastane/okul/AVM + "X dk").
- Gerçek proje kapak görseli [YAPILDI: og:image, 51/76].

**P1**
- Net m² tip bazında; açık adres standardı; ilerleme timeline.
- Vadeli toplam maliyet (hesaplayıcı); peşinat/taksit public özet (koşul uygunsa).
- Bölge m² benchmark (içeride veri var → public agregasyon + metodoloji).
- Yapı denetim/ruhsat/iskan/tapu = **doğrulanmış belge vs geliştirici beyanı görsel olarak AYRI**.
- Proje karşılaştırma (teslim/oda/net-brüt/sosyal/ödeme/geliştirici normalize; canlı fiyat/stok karşılaştırması yalnız girişli danışman).
- `/firma/[slug]` geliştirici profili (doğrulama + devam/tamamlanan + şehirler + teslim geçmişi).
- Akıllı "benzer projeler" (aynı bütçe/teslim/oda/ödeme/bölge — nedenini söyle).
- Proje güncelleme akışı (fiyat/stok göstermeden "ilerleme %68'e güncellendi").
- Proje haberleri ayrı URL (`/guncel/x-yeni-etap`); kaynak geliştiriciden → rakipten güvenilir.
- Sektörel içerik cluster bağla (`/rehber`, `/araclar`, `/sozluk`).

**Ekstra public:** "Bu proje kimler için uygun?" (objektif filtre), "Karar öncesi kontrol" bloğu, favori/karşılaştır (localStorage), sosyal paylaş (imzalı müşteri paylaşımıyla KARIŞTIRMA), "Projeni ağa aç" (müteahhit) + "Ücretsiz danışman hesabı" (danışman) CTA'ları.

## Public YAPILMAYACAK (kayıt sebebi — DEĞİŞMEZ)
Daire bazlı canlı fiyat · canlı müsait stok sayısı · daire no · hangi danışmana tahsisli · tahsis koşulları · komisyon oranı · münhasırlık · daire-bazlı opsiyon · müşteri/lead (KVKK) · diğer danışman aktivitesi · satış-beklemede birim · daire-bazlı stok log.

## Hedef `/proje/[slug]` anatomisi
1 Hero (proje+lokasyon+geliştirici+statü+teslim) · 2 Güven/güncellik satırı · 3 Proje özeti (blok/bölüm/oda/net-brüt) · 4 Daire tipleri + kat planları · 5 Özellikler (yaşam/sosyal/güvenlik/teknik) · 6 Ödeme yapısı (var/yok + hesaplayıcı, fiyat yok) · 7 Proje hakkında · 8 Konum & çevre (harita+POI+ulaşım) · 9 Geliştirici (doğrulama+profil+diğer projeler) · 10 Karar öncesi kontrol · 11 Karşılaştır · 12 İlgili rehberler · 13 Benzer projeler · 14 Ana CTA (danışman ücretsiz) · 15 Müteahhit CTA (projeni ağa aç).
