# Araştırma

Projedar'ın pazar, rakip ve envanter araştırmalarının tek toplandığı yer. Analiz raporları
(`.md`) doğrudan burada, veri setleri konu klasörlerinde durur.

## Veri setleri

| Klasör | Ne | Kapsam | Üreten script |
|---|---|---|---|
| `emlakci-ofisler/` | Franchise emlak ofisleri | 1.242 kayıt, 1.203 TR, 62 il, 6 marka | `emlakci-ofisler/tarama.ts` |
| `muteahhit-firmalar/` | Müteahhit ve geliştirici envanteri | firma + proje + lead + stok zaman serisi | `muteahhit-firmalar/*.py` |
| `konut-projeleri/` | Konut projesi envanteri (Emlakjet) | proje listesi, il/ilçe benchmark | `konut-projeleri/*.py` |
| `rakip-tarama/` | Rakip platform taraması | — | `rakip-tarama/rakip_tarama.py` |
| `emlak-kurumsal-ag/` | Oda, dernek, federasyon haritası | 82 kuruluş, 17 protokol, 10 kesişim kişisi | `emlak-kurumsal-ag/build.py` |

`muteahhit-firmalar/` ve `konut-projeleri/` bağlıdır: müteahhit taraması, konut projeleri
`cikti/projeler.csv` dosyasını tohum listesi olarak okur.

## Analiz raporları

`00-arastirma-sentez.md` üst sentez; `01`-`07` arası rakip analizi, fiyatlandırma, müteahhit
benimseme, çift satış ve güven, yasal çerçeve, paketleme ve global kapalı dağıtım modelleri.

## Repoya ne girer

* **Girer:** analiz raporları (`.md`), elle toplanan kaynak veri (`.json`), üretici scriptler ve README'ler.
* **Girmez:** her konunun `cikti/` klasörü. Üretilen tablolar, ham HTML ve loglar oradadır;
  toplamı 500 MB'ı aşıyor ve hızla eskiyor.

Veri diskte durur, repoda durmaz. Kullanmadan önce ilgili scripti yeniden çalıştırın: ofis
sayıları, stok ve iletişim bilgileri değişkendir, her kayıtta çekilme tarihi vardır.

## Yeniden üretme

```bash
npx tsx arastirma/emlakci-ofisler/tarama.ts
```

```bash
python3 arastirma/konut-projeleri/emlakjet_envanteri.py
```

```bash
python3 arastirma/muteahhit-firmalar/proje_detay.py
```

Her konu klasöründe kod (kökte), veri (`cikti/`) ve kendi `README.md` dosyası bulunur:
kaynak, robots.txt durumu, KVKK kapsamı ve bilinen eksikler oradadır.
