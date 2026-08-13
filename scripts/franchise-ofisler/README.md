# Franchise Emlak Ofisleri Taraması (Katman 0)

Türkiye'deki franchise emlak markalarının **kendi resmî ofis listelerinden** işletme düzeyi
veri toplar. Kaynak sayısı az, veri yapılandırılmış, erişim legal: bu yüzden Google Places
veya ilan portalı taramasından **önce** çalıştırılacak katman budur.

## Çalıştırma

```bash
npx tsx scripts/franchise-ofisler/tarama.ts
```

Tek marka için:

```bash
npx tsx scripts/franchise-ofisler/tarama.ts --marka=remax
```

Çıktı `cikti/` altına yazılır (gitignore'lu, veri repoda tutulmaz):

* `franchise-ofisler.csv` : UTF-8 BOM'lu, Excel uyumlu tam liste
* `franchise-ofisler.xlsx` : `Ofisler` + `Marka Ozeti` + `Il Ozeti` sayfaları

## Kapsanan markalar

| Marka | Kaynak | Yöntem | Son tespit |
|---|---|---|---|
| RE/MAX | `remax.com.tr/tr/ofisler` | Next.js RSC payload, sayfalama | 314 |
| Turyap | `turyap.com.tr/Ofisler_Harita.aspx` | Harita veri alanı, tek istek | 355 |
| COLDWELL BANKER | `cb.com.tr/tr-TR/Offices/Search` | Sayfalama, çok geçişli | 225 / 227 beyan |
| Realty World | `realtyworld.com.tr/tr/ofisler` | POST, boş filtre | 137 |
| Altın Emlak | `altinemlak.com.tr/ofisler` | SSR kart, sayfalama | 130 |
| CENTURY 21 | `century21.com.tr/tr-TR/Offices/Search` | Sayfalama, çok geçişli | 81 / 81 beyan |

Toplam: **1.242 kayıt, 1.203'ü Türkiye içi, 62 il.**

Century 21 ve Coldwell Banker aynı platformu kullandığı için tek adapter (`masterturk.ts`)
ikisini de besler.

## Erişim ve robots durumu (2026-08-13 doğrulandı)

Her tarama öncesi `robots.txt` kontrol edildi:

* RE/MAX, Turyap, Altın Emlak, Realty World: `User-agent: *` → `Allow: /`.
* Century 21 ve Coldwell Banker: yalnız hesap sayfaları ve `?officeid=`, `?sorting=`,
  `?selectedcounties=` gibi parametreli URL'ler `Disallow`. Kullanılan `pager_p` parametresi
  yasaklı listede değil; yasaklı parametreli hiçbir URL çağrılmıyor.

İstekler arasında bekleme var, tarama tek geçişte birkaç yüz istek düzeyinde kalır.

## Bilinçli olarak TOPLANMAYAN veriler

Bunlar teknik eksiklik değil, karar:

1. **Danışman kimlik bilgisi.** Gerçek kişi adı, cep telefonu, kişisel e-posta toplanmaz.
   KVKK kapsamında kişisel veridir ve B2B değeri düşük. Danışman bilgisi yalnız **agrege sayı**
   olarak tutulur (`danismanSayisi`). Ofis düzeyi veri (tüzel kişi / tacir) bu kapsamda değildir:
   Ticari İletişim Yönetmeliği gereği tacir ve esnafa önceden onay almadan ticari elektronik
   ileti gönderilebilir, İYS kaydı ve çıkış hakkı şartıyla.
2. **Realty World e-postaları.** Cloudflare e-posta gizlemesiyle korunuyor. Decode etmek sitenin
   bilinçli koruma tercihini aşmak olur; alan boş bırakılır.
3. **İlan portalı verileri** (Sahibinden, Hepsiemlak, Emlakjet aktif ilan sayısı). Bu sitelerin
   kullanım şartları taramayı yasaklıyor ve aktif bot koruması var.
4. **Instagram takipçi / gönderi sayıları.** Graph API iş hesabı izni olmadan ToS ihlali.
5. **Google Maps puan ve yorum sayısı.** Places API ile alınabilir ama Google Maps Platform
   şartları `place_id` dışındaki içeriğin kalıcı saklanmasını yasaklar. Kalıcı CSV üretimiyle
   uyuşmuyor. Katman 1'de sorgu anında tazelenerek kullanılacak.

## Bilinen sınırlar

* **Coldwell Banker'da 2 ofis eksik** (225 tespit / 227 beyan). Sunucu sayfalamayı kararlı
  sıralamayla vermiyor: aynı ofis birden çok sayfada çıkarken bazıları görünmüyor. Liste 6 kez
  yeniden dolaşılıyor, yakınsama sonrası kalan fark konsola uyarı olarak basılıyor. Sessiz
  eksiltme yok.
* **Danışman sayısı yalnız RE/MAX'te var** (6.847). Diğer markalar liste sayfasında yayımlamıyor,
  alan `null` kalır ve özetlerde "Doğrulanamadı" yazar. Tahmin üretilmez.
* **12 kayıtta il doğrulanamadı.** Kaynakta "Diğer" yazan veya il alanı boş bırakılmış ofisler.
  `kapsam` kolonunda `Doğrulanamadı` olarak işaretlidir, silinmez.
* **27 kayıt yurt dışı** (Almanya, KKTC, Dubai, ABD vb.). Silinmez, `kapsam` kolonunda
  `Yurt dışı` işaretlenir ve il istatistiklerine katılmaz.
* **Bağımsız ofisler bu katmanda yok.** Türkiye'de yetki belgeli emlak işletmesi sayısı 47 bini
  aşıyor; buradaki 1.203 kayıt yalnız kurumsal franchise segmentidir.

## Veri tazeliği

`cekilmeTarihi` her satırda zorunludur. Ofis sayıları ve iletişim bilgileri değişkendir;
listeyi kullanmadan önce script yeniden çalıştırılmalıdır. Kaynak sitelerin HTML yapısı
değişirse adapter'lar hata fırlatır (sessiz boş sonuç dönmez).

## Sonraki katmanlar

* **Katman 1:** Pilot şehirler için Google Places grid taraması. Kalıcı saklanan tek alan
  `place_id`, diğer alanlar sorgu anında tazelenir.
* **Katman 2:** Yeni konut ve proje satış sinyali. Kaynağı emlakçı tarafı değil müteahhit
  tarafıdır: yapı ruhsatı verileri, belediye proje kayıtları, proje siteleri.
