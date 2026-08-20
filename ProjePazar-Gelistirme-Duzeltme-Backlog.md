# Projedar — Geliştirme & Düzeltme Backlog'u (2026-08)

Kaynak: `ProjePazar-Sentez-Karar-Raporu.md` (Rapor 5) + sistem-okuma itiraz matrisi + saha araştırması. Dosya yolları koddan doğrulandı.

---

## P0 — Güven-kritik + canlı bug (önce bunlar; çoğu metin, hızlı)

- [ ] **Kilitli-kural İHLALİ:** `src/app/muteahhit/page.tsx` içindeki "Bölge başına sınırlı kurucu kontenjanı" bölümünü kaldır/revize. Sebep: `kitlik-vaadi-yok` memory kuralını çiğniyor.
- [ ] **"Komisyona ortak olmaz" wording (danışmanın ofis payı var, "komisyonun %100 sende" yanlış anlaşılıyor):** → "Projedar satış komisyonuna ORTAK OLMAZ, işlem üzerinden komisyon almaz." Yerler:
  - `src/components/seo/ProjedarBanner.tsx` ("Emlakçı komisyonsuz satar" → "Danışman komisyonunun tamamını alır, Projedar pay almaz")
  - `src/components/seo/B2BCta.tsx` ("Yeni projeleri komisyonsuz sat" başlığı)
  - `src/components/seo/DavetPopup.tsx` ("komisyonsuz sat")
  - `src/app/proje/[slug]/page.tsx` (kapanış CTA + `sssListesi` cevabı)
  - `src/app/emlakci/page.tsx` (hero + kazanç bölümü)
- [ ] **M4 SSS eksik:** "Rakip müteahhit fiyatımı/stoğumu görebilir mi?" → "Hayır; havuz çok-müteahhitli olsa da her firmanın verisi satır seviyesinde izole (RLS/`uretici_id`); başka müteahhit stoğunu/fiyatını/tahsisini göremez." Ekle: `src/app/muteahhit/page.tsx` + `src/app/guven/page.tsx`.
- [ ] **E7 EİDS eksik (emlakçı):** `src/app/emlakci/page.tsx`'te EİDS + sosyal-medya paylaşım politikası hiç yok. Kısa yasal şerit + "tahsisli link ilan değil, birebir/WhatsApp; sosyal medyaya açık paylaşma" uyarısı ekle.
- [ ] **🔴 CANLI BUG: `/konut-projeleri[/il/ilce]` hub sayfaları YOK** ama `/proje` breadcrumb + nav buraya link veriyor → 404. Route oluştur (CollectionPage + ItemList + eşik-altı proje evi + il/ilçe kırılımı). Middleware `herkeseAcik`'e prefix ekle.

## P1 — İçerik + deck

- [ ] **/proje iki-mod içerik:** `veri.kaynak` (katalog vs ağdaki proje) ayrı dil.
  - Katalog (ağda değil): "bunu nasıl satarım" iddiası YOK; arama-niyeti FAQ (nerede / hangi firma / hangi daire tipleri / ne zaman teslim / fiyatları nasıl öğrenirim). `sssListesi`'ni hash-varyantla çeşitlendir (thin-content).
  - Ağdaki proje (kaynak=proje): proje-spesifik dil meşru.
- [ ] **/proje "Bu sayfa nedir" tekrarını kaldır**, yerine olgusal keyword-yoğun tanıtım (ad/il/ilçe/geliştirici/daire tipleri/m²/teslim'den üretilen).
- [ ] **/firma/[slug]:** müteahhit kurumsal SEO sayfası (firma adı aramasında çıkmak) + uretici public_slug migration.
- [ ] **Deck rekabet slaytı:** "emsal yok" değil; nötr-ağ + kombinasyon haritası (Connject/Tapuva/Topli TR + Nogbase/DomusHub global; kategori-kanıtı). `src/app/sunum/v2/pitch` + `gtm`.
- [ ] **Deck finansal:** fiyat çapaları (Nogbase ~685K, Novo 2-5K/user-ay, enterprise ~650K) + iki senaryo (floor 13-19M ARR + gerçek-fiyat baz). `src/app/sunum/v2/finansal`.
- [ ] **Konum cümlesini tüm deck + landing'de hizala:** "nötr ağ; bağımsız emlakçı tek hesapla çok geliştirici stoğu, açık pazar değil geliştirici-kontrollü tahsis."
- [ ] **M3 + M8/E9** mesajlarını deck'ten landing'e taşı (kendi satış ofisim çakışır mı / ağ yeterince büyük mü).

## P2 — Faz 2 ürün (saha + rakip kanıtlı; roadmap)

- [ ] Hakediş defteri (kazanılan-vs-ödenen). ⚠️ Platform pay ALMAZ, sadece müteahhit-emlakçı arası takip.
- [ ] Zaman-damgalı müşteri-claim sertifikası (PDF/QR); bypass koruması + hukuki ispat (çift-satışta önceki tarihli kayıt geçerli).
- [ ] Dijital aracılık sözleşmesi şablonu (Taşınmaz Tic. Yön. m.20 yazılı şart).
- [ ] EOI / pre-launch ön-talep yönetimi.
- [ ] Link-teklif + görüntülenme analitiği (DomusHub deseni).
- [ ] WhatsApp Cloud API otomasyon (MVP: deep-link giden).

## Fiyatlama eklemeleri (karar sonrası)

- [ ] Enterprise müteahhit üst kademe ~650K+.
- [ ] Küçük proje (<50 daire) 40-85K yumuşak giriş kademesi.
- [ ] "Ağdaki aktif daire" metriği (satılınca düşer).

## ⚠️ Almayacaklarımız (DEĞİŞMEZ + konum bozar)

- Boost/vitrin geliri (ilan portalı değiliz).
- Komisyon escrow / işlem-başı ücret (komisyona dokunma yok; sadece TAKİP).
- Serbest-metin AI ile stoğa yazma (MVP'de yasak, Faz 2).

## Senden bekleyen (kod değil, karar)

- [ ] Konum cümlesi onayı (memory'de kilitli).
- [ ] Finansal: iki senaryo mu, tek baz mı.
- [ ] Küçük-proje yumuşak giriş kademesi eklensin mi.
- [ ] (Opsiyonel, araştırma kapandı) Local off-plan taraması (Keşif Motoru, ~40-60 kredi).
