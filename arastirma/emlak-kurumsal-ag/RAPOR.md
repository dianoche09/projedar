# Türkiye Emlak Sektörü Kurumsal Ağ Haritası

**Hazırlanma tarihi:** 2026-08-13 · **Kapsam:** Emlak, gayrimenkul, taşınmaz ticareti, değerleme, konut geliştirme alanındaki oda, dernek, federasyon, konfederasyon, birlik, ticaret odası meslek komitesi ve franchise yapıları.

**Veri seti:** `cikti/Turkiye-Emlak-Kurumsal-Ag.xlsx` (7 sheet) + eşdeğer CSV'ler.
**Kayıt sayısı:** 82 kuruluş · 4 ticaret odası komitesi · 3 franchise ağı · 17 doğrulanmış protokol · 10 kesişim kişisi.

---

## 0. Önce şunu netleştirelim: bu bir "ilk 100" listesi değil, 89 satırlık bir öncelik listesi

Brief 100 kuruluş sıralaması istiyordu. **Kamuya açık ve doğrulanabilir kaynaklardan 82 kuruluş + 4 komite + 3 franchise ağı = 89 kayıt çıkarabildim.** Sayıyı 100'e tamamlamak için ancak varlığını doğrulayamadığım isimler uydurmam ya da aynı kuruluşu farklı yazımlarla tekrar kaydetmem gerekirdi; ikisini de yapmadım. Kalite kurallarının "üye sayısını tahmin etme", "tekrarları temizle", "aktif olmayanları işaretle" maddeleri buna öncelikli.

Eksik kalan yaklaşık 10-15 kayıt büyük olasılıkla **il ESOB birliklerinin oda listelerinde** duruyor (81 ilin ESOB sitesi tek tek taranmalı) ve bu ancak sistematik bir scraping işiyle çıkar. Bölüm 6'da bunu ayrı bir iş kalemi olarak tanımladım.

---

## 1. Sektörün örgütlenme mimarisi: dört ayrı hiyerarşi, tek pazar

Türkiye'de emlak sektörü **tek bir çatı altında değil, birbirine paralel dört ayrı hukuki hiyerarşide** örgütlü. İşbirliği stratejisi bunu anlamadan kurulamaz, çünkü her hiyerarşi farklı bir müşteri segmentine açılıyor:

| # | Hiyerarşi | Hukuki dayanak | Kimi kapsar | Projedar için ne demek |
|---|---|---|---|---|
| 1 | **TESK → il ESOB → emlak ihtisas odası** | 5362 s. Kanun | **Esnaf statüsündeki** emlak ofisleri | Emlakçı tarafının zorunlu kayıt kapısı. Yetki belgesi oda kaydı olmadan alınamıyor → kapsama fiilen %100 |
| 2 | **TOBB → ticaret odası → gayrimenkul meslek komitesi** | 5174 s. Kanun | **Şirket statüsündeki** (tacir) emlak işletmeleri | Kurumsal/büyük ofisler burada. İTO 21. Grup tek başına 13.207 faal üye |
| 3 | **Dernek / federasyon / birlik** (TEMFED, TEDB, TÜGEM, TEMOBİR) | 5253 s. Dernekler K. + 3335 s. Kanun | Gönüllü üyelik, sektörün "sesi" | Hızlı hareket eden, teknoloji işbirliğine en açık katman |
| 4 | **Franchise ağları** (RE/MAX, Coldwell Banker, CENTURY 21) | Ticari sözleşme | Markalı ofis ağları | Tek anlaşmayla yüzlerce ofis — en hızlı yayılım kanalı |

Buna **üretici (arz) tarafı** için beşinci bir kolon ekleniyor: İMKON (konfederasyon, ~120.000 üye), KONUTDER (markalı konut üreticileri), GYODER (yatırımcı/GYO), TMB, İNDER.

> **Stratejik sonuç:** Aynı emlak ofisi hem odaya (zorunlu) hem derneğe (gönüllü) hem de franchise ağına (ticari) bağlı olabilir. Bu üçlü bindirmeyi bilerek kurgularsanız, bir ofise üç ayrı kanaldan meşruiyetle dokunursunuz. Bilmeden kurgularsanız aynı kişiye üç kez sıfırdan anlatırsınız.

---

## 2. Ağın en kritik özelliği: kişiler kurumlardan daha çok bağlantı taşıyor

Araştırmanın en değerli bulgusu tablo değil, **çift/üçlü şapkalı isimler**. Türkiye emlak örgütlenmesinde birkaç kişi birden fazla hiyerarşinin kesişiminde duruyor. Bu kişilerle tek görüşme, kurumsal yoldan aylar sürecek erişimi tek adımda açıyor:

| Kişi | Kesişen roller | Tek temasla açılan kapı |
|---|---|---|
| **Hakan Akçam** | ATEM Başkanı **+** TEDB Genel Başkanı | Ankara oda tabanı **+** 81 il / 980 ilçe birlik teşkilatı |
| **Hakan Akdoğan** | TÜGEM Genel Başkanı **+** İTO 21. Grup Komite Başkanı | 2.000+ dernek üyesi **+** 13.207 faal İTO üyesi **+** TÜGEM MLS platformu |
| **Tahir Tellioğlu** | İMKON Genel Başkanı **+** TOBB İnşaat Müteahhitleri Meclisi Başkanı | ~120.000 müteahhit **+** TOBB politika masası |
| **İsmail Çağlar** | ANEKO (Antalya) Başkanı **+** TEDB Başkan Yardımcısı | Antalya pazarı **+** ulusal birlik yönetimi |
| **Gazi Çelik** | Eskişehir Odası Başkanı **+** TEMFED YK Üyesi | Eskişehir **+** federasyon gündemi |
| **Alpay Hacıoğlu** | KEO Başkanı **+** KESOB Birlik Başkan Vekili | Kocaeli odası **+** il birliği karar mekanizması |
| **Ömer Yetgin** | BEMDER (Bodrum) Başkanı **+** MEDEO YK Üyesi | Bodrum lüks pazarı **+** Muğla il odası |
| **Bahattin Akyüz** | Manisa Emlak Müşavirleri Derneği **+** Manisa ESO Başkanı | Manisa emlak **+** il esnaf örgütlenmesi tepesi |

Tam liste: `03-yonetim-karar-vericiler.csv`.

---

## 3. On beş başlıkta ağ haritası

**1) Ulusal çapta en etkili emlak kuruluşları** — TEDB (Cumhurbaşkanlığı kararıyla kurulmuş, 81 il teşkilatı iddiası), TEMFED (TESK sisteminin emlak federasyonu, 44 üye kuruluş), TÜGEM (2.000+ üye, kendi MLS'i), GYODER (268 kurumsal üye, arz tarafı).

**2) En büyük federasyon ve konfederasyonlar** — İMKON (5 federasyon, 51 dernek, ~120.000 üye) sayı olarak açık ara birinci; emlak özelinde TEMFED; esnaf çatısında TESK (82 birlik, 13 mesleki federasyon).

**3) En yüksek üye sayısına sahip kuruluşlar (doğrulanmış)** — İMKON ~120.000 · İTO 21. Grup 13.207 faal · TEMFED ~22.000 sektör mensubu (federasyon beyanı) · GYODER 268 kurumsal üye · TÜGEM 2.000+ · BEMO ~2.000 · KEO ~1.700 · Gaziantep ~1.500 · KEMKO 1.225+ · Muğla MEDEO 571 · Denizli DEMO 547+ · MASED 230.

**4) En güçlü emlakçılar odaları** — İEKO (İstanbul), ATEM (Ankara), İZEKO (İzmir), BEMO (Bursa), KEO (Kocaeli), KEMKO (Konya), GAZİTEM (Gaziantep), ANEKO (Antalya).

**5) En aktif yerel emlak dernekleri** — BEMDER (Bodrum), FEMDER (Fethiye), MASED (Manisa), DİEM-DER (Diyarbakır), Balıkesir Sorumlu Emlak Müşavirleri Derneği.

**6) Gayrimenkul danışmanlarına en fazla erişimi olan kuruluşlar** — TEDB (ilçe düzeyine inen tek teşkilat), TEMFED (44 üye kuruluş üzerinden), franchise ağları (RE/MAX ~5.400 danışman, Coldwell Banker ~4.000).

**7) En aktif ticaret odası gayrimenkul komiteleri** — İTO 21. Grup Gayrimenkul Hizmetleri (13.207 faal üye, aktif komite başkanlığı), ATO 62. Gayrimenkul Danışmanlık Hizmetleri (üyeye sözleşme taslağı yayınlıyor).

**8) En fazla etkinlik yapan kuruluşlar** — TÜGEM (yılda 900+ etkinlik, 100.000+ katılımcı beyanı), GYODER (Gayrimenkul Zirvesi, Gelişen Kentler Zirvesi, Çözüm Platformu), TEDB (bölgesel toplantılar), İMKON (İnşaat Sektör Çalıştayları).

**9) Teknoloji şirketleriyle işbirliğine en açık kuruluşlar** — İZEKO (üyelerine oda-özel CRM sunuyor), KEO (dijital sözleşme anlaşması), TEDB (Kerberos BT + UMAR yapay zekâ hukuk sistemi), TÜGEM (kendi MLS platformu), Ankara Üniv. PropTech Hub (Apsiyon ile kurulmuş).

**10) Protokol geçmişi bulunan kuruluşlar** — Gaziantep (Garanti BBVA + MBA Okulları), Denizli DEMO (Yenişehir Anakamp), Aydın (Belgesem), Kocaeli KEO, İzmir İZEKO, GYODER (BÜYEM, REIDIN, TÜKD), TEMFED (MYK), TDUB (CAATS), TÜGEM (International MLS Forum). Tam liste: `04-protokol-gecmisi.csv`.

**11) Türkiye çapında şube/temsilcilik ağı bulunanlar** — TEDB (81 il + 980 ilçe + 64 ülke), TEMOBİR (il/ilçe başkanlıkları), TÜGEM (il teşkilatları), RE/MAX (259-325 ofis), Coldwell Banker (~250 ofis).

**12) Dijital olarak en aktif kuruluşlar** — TÜGEM (çok yüksek), BEMO (Instagram ~5.059 takipçi + X resmi hesabı), GYODER, GKL, ATEM (@ankaraatem ~3.659), KEO, İZEKO, KEMKO.

**13) Emlak ofislerine doğrudan erişim sağlayabilecek kuruluşlar** — İEKO ve ATEM (yetki belgesi için zorunlu kayıt), il odaları genel olarak, franchise ağları, TEDB.

**14) Bölgesel olarak güçlü ancak ulusal çapta az bilinen kuruluşlar** — MEDEO (Muğla, 12 ilçeden 571 üye), TİNEMOD (Trabzon — inşaatçı + emlakçı aynı çatıda), Kahramanmaraş Emlak Müşavirleri Derneği (deprem sonrası en yoğun yeni konut arzı), Trakya Umum Emlak Müşavirleri Derneği, Silivri Emlak Komisyoncuları ve Müşavirleri Derneği.

**15) İşbirliği için öncelikli temas kurulması gerekenler** — Bölüm 4'teki ilk 12.

---

## 4. Projedar için ilk 12 temas (skor + neden)

Tam sıralama `07-kurumsal-oncelik-listesi.csv`. Buradaki 12, "bir çeyrekte gerçekten görüşülebilecek" sayıya indirgenmiş hali:

| # | Kuruluş | Skor | Neden bu |
|---|---|---|---|
| 1 | **TEDB** (Hakan Akçam) | 10 | Tek görüşmede ATEM + ülke geneli teşkilat. Teknoloji firmalarıyla protokol geçmişi kanıtlı |
| 2 | **TÜGEM / İTO 21. Grup** (Hakan Akdoğan) | 10 | Dernek + ticaret odası komitesi aynı kişide. **Ama kendi MLS'i var** — rakip değil tamamlayıcı çerçevesi şart |
| 3 | **İEKO** (Nizameddin Aşa) | 10 | İstanbul'da yetki belgesinin zorunlu kapısı; en büyük tek pazar |
| 4 | **İZEKO** (Mesut Güleroğlu) | 10 | Üyesine zaten CRM satın almış oda — yazılım tedarikçisiyle çalışma süreci test edilmiş |
| 5 | **GAZİTEM** (Mehmet Aytaç) | 10 | Türkiye'nin en somut üye avantaj protokolü örneği (Garanti BBVA + eğitim). ~1.500 üye. En düşük dirençli giriş |
| 6 | **İMKON** (Tahir Tellioğlu) | 9 | Üretici tarafında ~120.000 üye; dijital aktifliği düşük → dijital dönüşüm argümanı burada satar |
| 7 | **KEO** (Alpay Hacıoğlu) | 9 | ~1.700 doğrulanmış üye, üye listesi açık, dijital sözleşme protokolü geçmişi |
| 8 | **BEMO** (Erdal Çelebi) | 9 | ~2.000 üye + en güçlü sosyal medya erişimi → duyuru maliyeti düşük |
| 9 | **KEMKO** (Abdullah Çiftci) | 9 | Sitesinde "indirim protokolleri" bölümü işletiyor; Ocak 2026'da yeni başkan |
| 10 | **MEDEO** (Ziya Ercan) | 9 | Tek temasla Bodrum-Fethiye-Marmaris hattı; yeni kurulmuş oda, işbirliğine en açık dönem |
| 11 | **ATEM** (Hakan Akçam) | 10 | 1 numarayla aynı kişi — tek toplantıda birleştirilmeli |
| 12 | **KONUTDER + GYODER** | 8 | Arz tarafı: markalı konut üreticileri ve GYO'lar. Düzenli rapor/anket üretiyorlar → veri işbirliği hazır zemin |

### Kaçınılması gereken hata
Listedeki sıralama **il odalarını ulusal yapılara feda etmiyor** — brief'in açıkça istediği gibi. GAZİTEM (~1.500 üye) skorda GYODER'in (268 kurumsal üye) önünde, çünkü Projedar'ın erişmesi gereken şey emlak **ofisi**, yatırımcı değil.

---

## 5. Önerilen işbirliği modelleri — kime hangisi

| Model | Kime |
|---|---|
| **Üyelere özel avantaj anlaşması** | GAZİTEM, KEMKO, DEMO, Aydın — bu odalar zaten bu formatı işletiyor, yeni bir süreç icat etmeye gerek yok |
| **Teknoloji işbirliği / API entegrasyonu** | İZEKO, KEO, TEDB, TÜGEM, RE/MAX, Coldwell Banker/MasterTürk |
| **Dijital dönüşüm projesi** | İMKON, Kayseri, Malatya, Trabzon, Kahramanmaraş — dijital altyapısı zayıf, ihtiyacı yüksek |
| **Eğitim işbirliği** | TEMFED (MYK belgelendirme yetkisi var), BEMO (eğitim merkezinde konumlu), Eskişehir (başkanı eğitim savunucusu), GYODER Akademi |
| **Veri / içerik işbirliği** | GYODER (REIDIN endeksi geçmişi), KONUTDER (sektörel anket), Ankara Üniv. PropTech Hub, Malatya (Kira Belirleme Komisyonu) |
| **Ortak kampanya (üretici + emlakçı pilotu)** | TİNEMOD (Trabzon) ve Aydın — inşaatçı ile emlakçıyı aynı çatıda topluyorlar, Projedar'ın iki taraflı modelini tek kurumda test etmek için ideal |
| **Bölgesel pilot** | MEDEO + BEMDER + FEMDER + Marmaris + Datça + Milas + Didim + Kuşadası → Ege kıyı hattı tek paket |
| **Kurumsal satış** | RE/MAX, MasterTürk (Coldwell Banker + CENTURY 21 + ERA tek karar mercii) |

---

## 6. Doğrulanamayanlar ve bir sonraki adım

Bunları "veri yok" diye sessizce geçmedim, çünkü kapsama boşluğunu bilmek listenin kendisi kadar önemli:

**Kurumsal olarak doğrulanamayan yapılar**
- **EMFED** (Emlak Müşavirleri Federasyonu): sitesi DNS düzeyinde çözülmüyor. Faal olup olmadığı belirsiz → temastan önce mülki idare dernek kaydı sorgulanmalı.
- **ULI Türkiye**: GKL kaynaklarına göre ULI Türkiye'den çekilmiş; güncel faaliyet kanıtı yok.
- **TEMOBİR**: genel başkanı ve üye sayısı bulunamadı; `.org` alan adı çözülmüyor, `.org.tr` çalışıyor.
- **DUD** (Değerleme Uzmanları Derneği): başkan bilgisi 2023 tarihli.
- **FIABCI Türkiye chapter**: güncel yönetim doğrulanamadı, yalnız akademik temsil teyitli.

**Bulunamayan iller** — Hatay, Ordu, Van, Erzurum, Tekirdağ (oda), Balıkesir (oda) için il düzeyinde emlak **odası** tespit edilemedi; bazılarında yalnız dernek var, bazılarında emlakçılar karma odaya kayıtlı.

**Belirsiz komite** — İZTO'nun (İzmir Ticaret Odası) gayrimenkul meslek komitesinin grup numarası ve başkanı tespit edilemedi.

**Mükerrer risk** — "Güney Anadolu Emlak Müşavirleri Derneği" ile "Güneydoğu ve Doğu Anadolu Tüm Emlak Müşavirleri Derneği" aynı yapı olabilir. Diyarbakır'da üç paralel oluşum var (DİEM-DER, Diyarbakır Tüm Emlak Müşavirleri Derneği, bölgesel dernek) — hangisinin hâkim olduğu netleşmeden toplu işbirliği kurgulanmamalı.

**Kapatılması gereken veri boşluğu (ayrı iş kalemi):** 81 il ESOB sitesinin oda listelerini sistematik taramak. Bu tek iş, kayıp 10-15 odayı ve mevcut kayıtların büyük kısmının güncel başkan/telefon bilgisini kapatır. Repo'da hazır scraping altyapısı var (`scripts/`), robots.txt ve KVKK kontrolü yapılarak koşulabilir.

---

## 7. Kalite kuralları — bu veri setinde ne yapıldı, ne yapılmadı

- ✅ Yalnız kamuya açık kaynaklar kullanıldı; her kayıtta kaynak linki ve `Son Doğrulama Tarihi = 2026-08-13` var.
- ✅ **Üye sayısı hiçbir yerde tahmin edilmedi.** Bilinmiyorsa "Açıklanmamış", kaynağı varsa kaynağın tarihi ayrı kolonda.
- ✅ Kişisel telefon/özel e-posta toplanmadı; yalnız kurumsal iletişim bilgileri.
- ✅ Oda / dernek / federasyon / ticaret odası komitesi ayrı sınıflandırıldı ve karıştırılmadı.
- ✅ Resmi statüsü belirsiz oluşumlar "Platform / Topluluk" olarak işaretlendi (TEMOBİR, GKL, EurAsia Proptech).
- ✅ Faal olduğu doğrulanamayanlar "Aktifliği doğrulanamadı" olarak işaretlendi, listeden silinmedi.
- ⚠️ **TEMFED kayıtlarından alınan telefon/adres bilgilerinin önemli kısmı 2021 dönemine ait.** İlgili satırların "Notlar" alanında bu uyarı var — arama öncesi teyit şart.
- ⚠️ 2026 esnaf ve sanatkâr meslek kuruluşları genel kurul yılıdır; başkanlıklar yıl içinde değişmiş olabilir. Rapordaki başkanlıkların seçim tarihi bilinenler için not edildi.

---

## 8. Emlak ofisi veri setiyle eşleştirme

Brief'in "ana çalışma dosyasıyla eşleştir" maddesi **yapılamadı**: rapor yazıldığında repoda emlak ofisi veri seti yoktu. **2026-08-13 sonrası geçerli değil:** `arastirma/emlakci-ofisler/` altında 1.203 Türkiye franchise ofisi bulunuyor, eşleştirme artık yapılabilir.

Eşleştirme yapılacaksa **kesin ayrımı koruyun**:
- "Bu bölgede faaliyet gösteren ilgili meslek kuruluşu" → coğrafi eşleştirme, her zaman kurulabilir.
- "Bu işletme bu kuruluşun üyesidir" → **yalnız üye listesi doğrulamasıyla** kurulabilir.

İkincisi için hâlihazırda açık kaynak var: **KEO** (`keo.com.tr/uye-listesi`), **SEKDEO** (`sekdeo.org.tr/sekdeouyeler/`) ve **İZEKO** (yetki belgeli üyeler) üye listelerini web'de yayınlıyor. Bu üç il için gerçek üyelik doğrulaması mümkün; diğerleri için değil.
