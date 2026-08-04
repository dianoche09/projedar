# Sunum Deck'leri — Tasarım (final durum)

Tarih: 2026-08-04 · Durum: v5, canlıda (`ffc77ff`)

## Amaç
Yüz yüze görüşmelerde laptop/tabletten sunulan dört HTML deck:
- `/sunum/uretici` (17 slayt): müteahhit anlaşması kapatma
- `/sunum/emlakci` (16 slayt): ücretsiz danışman katılımı
- `/sunum/pitch` (14 slayt): yatırımcı sunumu
- `/sunum/gtm` (12 slayt): go-to-market stratejisi (pitch eki)

Hepsi gizli link: `robots noindex` (sunum/layout.tsx), sitemap dışı, middleware'de login'siz erişime açık.

## Görsel yön (kullanıcı kararı)
Koyu sinematik "komuta" teması + fal.ai (nano-banana-2) üretimi 6 sinematik görsel
(`public/sunum/*.jpg`: santiye-gece, konut-aksam, sehir-panorama, ag-isiklari,
vinc-siluet, kule-cephe; 16:9, 1920px, lacivert/teal grade).

## Teknik yapı
- `src/components/sunum/DeckShell.tsx` (client): tam ekran sahne; ok tuşları
  (ArrowLeft/Right, Space, PgUp/Dn, Home/End) + swipe + tıklanabilir progress +
  mono sayaç. Tüm slaytlar mounted (demo state korunur); aktif slayt `aktif`
  sınıfı alır → `.da .da-1..6` kademeli giriş, `.kenburns` yavaş zoom
  (globals.css "SUNUM DECK" bölümü). `select-none` (sunumda yanlış seçim olmasın).
- `src/components/sunum/Slayt.tsx`: koyu içerik slaytı (kicker/başlık/alt/içerik).
- `src/components/sunum/parcalar.tsx`: GorselSlayt (tam ekran görsel, orta/sol),
  MaddeKart, AdimSirasi, OnayMadde, DevSayi, TazelikOlcek, CanliBirimKart,
  LeadSorguKart, OrnekRozet. Kanıt kartları (birim/mikrosite/sorgu) bilinçli
  BEYAZ: koyu zeminde ürün gerçekliği olarak parlar.
- Canlı demolar: `KuleDemo` + `TahsisPaneli` slaytlara gömülü.

## İçerik kuralları (kullanıcı kararları)
- **Kıtlık vaadi YOK:** "bölge başına sınırlı üretici/Kurucu Müteahhit kontenjanı"
  hiçbir materyalde kullanılmaz (bkz. memory `kitlik-vaadi-yok`).
- **Zam anlatısı tek yerde:** üretici deck'te yalnız "Perşembe 17:40" senaryo slaytı.
- **Anasayfa dil hizası:** "Bloklar yükselir. Stok erir." · "Opsiyon bir söz değil.
  Kilittir." · "Fiyat kopyalanmaz. Link bir penceredir." · kapı metaforlu tahsis ·
  "Kazancın %100'ü sende".
- Uzun tire yok; "bayat" yok; rakam iddiaları TÜİK 2025 kaynaklı
  (1.688.910 toplam · 540.786 ilk el · %32 pay · Ankara 152.534 · İstanbul 280.262 ·
  İzmir 96.998); örnek veriler "örnek" rozetli.
- Üretici deck fiyat/teklif rakamı içermez ("anlaşma görüşülür").

## Slayt omurgaları
- **Üretici:** kapak(görsel) → 72 saat zam senaryosu → tek kayıt/pencere →
  4 adım + KuleDemo → kokpit → tahsis + TahsisPaneli → kilit(görsel) →
  opsiyon talep→onay → tazelik → mikrosite turu → ödeme+yatırım → lansman/bildirim/PWA →
  zekâ paketi (radar+fiyat önerisi+raporlar) → lead sorgu → ağ&güven (davet+KYC+komisyonsuz) →
  ilk gün(görsel) → CTA(görsel).
- **Emlakçı:** kapak → problem → cebinde satış ofisi → 4 adım + KuleDemo →
  bul (filtre+harita+kesit) → müşteri eşleştirme (uyum skoru) → mikrosite (PDF gönderen
  kaybediyor + form lead'i) → kilit(görsel) → opsiyon akışı → lead defteri →
  lansman radarı → tazelik → cepte (PWA) → ücret (%100) → katılım (KYC) → CTA.
- **Pitch:** kapak → problem(görsel, 540 bin) → maliyet → çözüm (4 mekanizma) →
  canlı demo → pazar (TÜİK) → neden şimdi (EİDS/hacim/WhatsApp) → iş modeli →
  2×2 rekabet ("boş hücre bizim") → moat → ürün durumu → GTM özeti → vizyon(görsel) → kapanış.
- **GTM:** kapak → arz-önce ilkesi → Ankara→İst→İzmir → segment Ü1/Ü2 → kanal müteahhit →
  kanal danışman → concierge onboarding → veri yerçekimi çarkı → fiyatlama →
  EİDS kozu → KPI (ilk 90 gün çerçevesi) → yol haritası(görsel).

## Doğrulama
Lint 0 hata · dört deck dev + production'da gezildi (klavye/swipe/demo etkileşimi,
konsol temiz) · production fetch: 4/4 200 + noindex.
