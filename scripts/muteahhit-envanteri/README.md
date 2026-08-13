# Müteahhit / Konut Projesi Envanteri

Projedar için **geliştirici (müteahhit) + konut projesi + stok/satış** veri tabanı.
`scripts/emlakjet-envanteri` liste taramasının üstüne kurulur: orası proje
kartlarını verir, burası her projenin **detay payload'ını** açıp gerçek stok ve
satış verisini çıkarır.

## Neden bu kaynak

Emlakjet proje detay sayfası Next.js App Router ile SSR edilir ve tüm veri modeli
`self.__next_f.push([1,"..."])` içindeki RSC flight payload'ında **JSON olarak**
gömülü gelir. Yani HTML selector'ı değil, sabit alan adlarına sahip bir nesne
(`initialProject`) okunur. Kırılgan değil, JS/headless gerekmez, stdlib yeter.

Bu payload liste sayfasında **olmayan** alanları taşır:

| Alan | Ne verir | Doluluk* |
|---|---|---|
| `salesStatus` | ONGOING / FINISHED | %100 |
| `company.address` / `website` | firma adresi, web sitesi | %100 |
| `property.flatCount` | toplam bağımsız bölüm | %100 |
| `locationInfo.coordinates` | enlem / boylam | %90 |
| `company.phoneNumber` | kurumsal telefon | %85 |
| `projectBuildingStartedDay` | inşaat başlangıç tarihi | %77 |
| `property.deliveryDate` | teslim tarihi | %70 |
| **`property.remainingFlatCount`** | **kalan stok** | **%35** |
| **`percentageOfSale`** | **satış yüzdesi** | **%22** |

\* 40 projelik rastgele örneklemde ölçüldü (2026-08-13). Oranlar il ve proje
durumuna göre değişir; aktif/premium projelerde stok alanları belirgin daha dolu.

İki stok alanı birbirini **bağımsız doğruluyor**: ör. Fours Çanakkale 54 toplam,
8 kalan, `percentageOfSale` 0.85 → 54−8=46, 46/54=%85. Tutarlılık, verinin
pazarlama beyanı değil kayıt olduğunu gösteriyor.

Ek kaldıraç: her detay sayfası `relatedProjects` içinde 10-20 komşu projeyi
**tam nesne** olarak taşır. 30 projelik denemede 120 firma çıktı. Tarama kendi
evrenini genişletir.

## Sınırlar (bilerek)

- **Satış hızı geriye dönük üretilemez.** Payload yalnız anlık değeri verir.
  Aylık satış hızı, %50/%75/%90 sell-through süresi ve sold-out tarihi ancak
  `snapshot.py`'ın haftalık serisinden çıkar. Bu yüzden snapshot erken başlar.
- **Blok / etap sayısı** yapısal alan değil; proje açıklamasından regex ile
  çıkarılır ve `blok_etap_kaynak=Tahmini` olarak işaretlenir.
- **Ada/parsel ve yapı ruhsatı** bu kaynakta yok, toplu kamu veri seti de yok.
- Toplam bağımsız bölüm ile **satışa sunulan** stok aynı olmayabilir; arsa
  sahibi payı ve müteahhit stoğu ayrışmaz. `toplam_bagimsiz_bolum` ham değerdir.
- Fiyat alanı çoğu projede `priceVisibility=ASK` (gizli). Tip bazlı fiyat
  `konut_tipi.csv`'de liste sayfasından çok daha dolu gelir.

## Robots ve KVKK

- `emlakjet.com/robots.txt` (2026-08-13 doğrulandı): `Allow: /`;
  `/projeler/proje/*` ve `/projeler/firma/*` Disallow **değil**.
  `/proje-katalog/*` Disallow → katalog PDF'leri **indirilmez**, yalnız URL'si
  `katalog_url` kolonunda saklanır.
- Yalnız **tüzel kişi / işletme** verisi toplanır. Firma e-postası ancak rol
  tabanlıysa (`info@`, `bilgi@`, `satis@` ...) kaydedilir; gerçek kişi adı
  taşıyan adres atılır ve sayısı log'lanır. Danışman adı / cep telefonu
  toplanmaz. Bu, `scripts/franchise-ofisler` kapsam kararıyla aynı çizgidir.
- Nazik davran: `--gecikme` ile bekleme koy, cache'i kullan, `--limit` ile tavan koy.

## Kullanım

```bash
cd scripts/muteahhit-envanteri

python3 proje_detay.py --kuru --iller yogun     # plan: kaç proje, tahmini süre
python3 proje_detay.py --limit 50               # deneme
python3 proje_detay.py --iller yogun --tur 2    # 21 yoğun il, 2 keşif turu
python3 proje_detay.py --gecikme 2.0            # nazik mod

python3 snapshot.py                             # haftalık stok ölçümü (seriye ekler)
python3 lead_skor.py                            # B2B işbirliği skoru + öncelik listesi
```

## Çıktılar (`cikti/`)

| Dosya | İçerik |
|---|---|
| `proje.csv` | proje ana kaydı: konum, koordinat, stok, satış yüzdesi, tarihler, güven seviyesi |
| `firma.csv` | müteahhit: adres, kurumsal telefon, web sitesi, rol tabanlı e-posta |
| `konut_tipi.csv` | tip bazlı: oda tipi, brüt m², fiyat, ₺/m² |
| `kampanya.csv` | proje kampanyaları (ad, açıklama, bitiş tarihi) |
| `stok-zaman-serisi.csv` | haftalık snapshot, **append-only** |
| `lead.csv` | B2B skoru ve öncelik gerekçesiyle sıralı müteahhit listesi |
| `kesif.txt` | `relatedProjects`'ten bulunan, henüz çekilmemiş slug'lar |
| `ham/` | HTML cache (gitignore) |

## Veri güven seviyesi

Brief'in A-E kuralı `proje.csv.veri_guven` kolonunda uygulanır:

| Seviye | Koşul |
|---|---|
| A | kalan stok **ve** satış yüzdesi dolu |
| B | ikisinden biri dolu |
| C | yalnız satış durumu (ONGOING/FINISHED) var |
| E | hiçbiri yok |

`satilan_adet` asla tahmin edilmez; yalnız toplam ve kalan stoktan (veya toplam
ve yüzdeden) çıkarılır ve `satilan_kaynak=Hesaplanmış` olarak işaretlenir.

## Haftalık snapshot'ı otomatikleştirme

Zaman serisi ancak düzenli ölçümle birikir. Kurulum kullanıcı onayıyla yapılır:

```bash
crontab -e
# her pazartesi 04:00
0 4 * * 1 cd /path/to/repo/scripts/muteahhit-envanteri && /usr/bin/python3 snapshot.py
```
