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

## Fiyat/m² benchmark (benchmark.py)
`projeler.csv`'den il ve il+ilçe bazlı ₺/m² medyan tablosu üretir.
```bash
python3 benchmark.py --min-proje 3
```
Çıktı: `cikti/benchmark-il.csv`, `cikti/benchmark-ilce.csv`, `cikti/benchmark.md`.

> **Nüans:** kart yalnız fiyat aralığı + m² aralığı verir, birim bazlı değil. İki uç
> ölçü hesaplanır: `tl_m2_giris = fiyat_min/alan_min` (giriş daire), `tl_m2_ust =
> fiyat_max/alan_max` (üst daire). Medyan alınır. Yaklaşıktır, benchmark amaçlı.
> Fiyatı gizli projeler (çoğu KKTC/döviz) hesaba girmez ("-" görünür).

## Sınırlar (bilerek)
- **Kişisel veri toplanmaz** (danışman telefon/e-posta yok) — KVKK.
- Sadece Allow olan liste sayfaları gezilir; filtre/görsel URL'lerine girilmez.
- Nazik ol: `--gecikme` ile bekleme koy, cache'i kullan, `--sayfa` ile tavan koy.
- Bağımlılık yok — sadece Python stdlib.
