# Projedar Rakip Tarama (SerpAPI)

Sistematik SERP taramasıyla Türkiye rakip evrenini kapatmak için. Manuel Google
aramasını değil, tekrarlanabilir + bütçe-korumalı bir pipeline'ı hedefler.

## Ne yapar
1. **Faz 1 (ulusal):** 50 Türkçe/İngilizce sorgu (Projedar'ın 6 tanımlayıcı
   ekseninden türetildi) google.com.tr üzerinde çalışır, top-N sonucu toplar.
2. **Faz 2 (`--local`):** lokasyon-duyarlı sorguları 9 şehir × varyant koşar.
3. Domainleri tekilleştirir, portal/sosyal/haber gürültüsünü eler.
4. Her domaine **0-100 Projedar-directness** skoru verir (6 eksen + A+B+C nadir
   kombo bonusu) ve sınıflar: Direct / Adjacent / Uzak-benchmark / İzle-doğrulanmadı.
5. **Faz 3 (`--enrich`):** hayatta kalanlara `site:` indeks sayımı + anasayfa
   tarama (ürün sinyali vs. vaporware "çok yakında" şüpheli sayacı).

## Bütçe / maliyet koruması
SerpAPI'de her arama = 1 kredi. Bu yüzden:
- **Cache:** her ham cevap `cikti/ham/` altına yazılır; tekrar koşu API'ye gitmez.
- **`--max-aramalar N`:** sert tavan (varsayılan 60). Tavan dolunca durur.
- **`--kuru`:** dry-run — plan + tahmini krediyi gösterir, hiç API çağırmaz.

## Kullanım
```bash
cd scripts/rakip-tarama

python3 rakip_tarama.py --kuru                    # önce her zaman: plan + maliyet
python3 rakip_tarama.py                           # Faz 1 (~50 kredi)
python3 rakip_tarama.py --local                   # + lokasyon (bütçe tavanına dikkat)
python3 rakip_tarama.py --enrich --max-aramalar 80
```

## API anahtarı
Otomatik bulunur — sırasıyla: `--anahtar` argümanı → adında `SERP` geçen ortam
değişkeni → proje kökündeki `.env.local` / `.env`. Anahtar koda/çıktıya yazılmaz.

## Çıktı
- `cikti/domainler.csv` — tam veri (eksen kırılımı, indeks, sinyaller dahil)
- `cikti/rapor.md` — directness'e göre sıralı skor tablosu

## Skorlama eksenleri (`sorgular.py::LEKSIKON`)
A çok-müteahhit · B emlakçı/broker ağı · C canlı stok+fiyat · D çift-satış önleme ·
E komisyon/abonelik modeli · F tahsis/kapalı-devre. Ağırlıklar oradan ayarlanır.

> Not: skor bir **ön elektir**, kesin karar değil. Yüksek skorlu adaylar memory'deki
> `rakip-analizi.md` + repo `ProjePazar-Rakip-Analizi.md` teardown mantığıyla elle
> doğrulanmalı (özellikle "İzle / doğrulanmadı" = vaporware şüphesi olanlar).
