# Emlakjet Proje Envanteri

Projedar için **müteahhit + fiyat benchmark** veri kaynağı. emlakjet.com'un
`satilik-konut/projeler` listesini gezip her projenin meta verisini CSV'ye döker.

## Neden mümkün
- Sayfa Next.js ama **SSR**: tüm veri HTML içinde gömülü gelir, JS/headless gerekmez.
- Düz `urllib` ile HTTP 200; bot duvarı / login yok.
- Sayfa başına 30 kart, `?sayfa=N` ile ~50 sayfa (~1500 proje).
- `robots.txt` listeleme sayfalarını Allow eder (filtre/görsel URL'leri Disallow).

## Ne çeker (kart başına)
proje id · ad · il · ilçe · m² aralığı · oda tipi · konut sayısı · teslim ·
müteahhit adı + id · fiyat min/max (₺) · detay URL.

> Fiyat = liste/"başlayan" fiyat aralığı, gerçek satış fiyatı değil. Benchmark için.

## Kullanım
```bash
cd scripts/emlakjet-envanteri

python3 emlakjet_envanteri.py --kuru       # önce: kaç sayfa, tahmini süre
python3 emlakjet_envanteri.py --sayfa 3    # deneme: ilk 3 sayfa
python3 emlakjet_envanteri.py              # tümü (otomatik son sayfa tespiti)
python3 emlakjet_envanteri.py --gecikme 2.5  # sayfalar arası 2.5sn (nazik)
python3 emlakjet_envanteri.py --yenile     # cache'i yok say, taze indir
```

## Çıktı
- `cikti/projeler.csv` — tam veri (id, ad, il/ilçe, m², oda, konut, teslim, müteahhit, fiyat min/max, url)
- `cikti/rapor.md` — özet (en çok projesi olan müteahhitler, il dağılımı)
- `cikti/ham/sayfa-NNN.html` — ham cache (tekrar koşuda site yorulmaz)

## Sınırlar (bilerek)
- **Kişisel veri toplanmaz** (danışman telefon/e-posta yok) — KVKK.
- Sadece Allow olan liste sayfaları gezilir; filtre/görsel URL'lerine girilmez.
- Nazik ol: `--gecikme` ile bekleme koy, cache'i kullan, `--sayfa` ile tavan koy.
- Bağımlılık yok — sadece Python stdlib.
