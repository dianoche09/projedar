# Projedar AI Katmanı — Taslak Strateji ve Ürün Planı

**Durum:** Taslak / yaşayan doküman  
**Amaç:** Projedar’ın mevcut ürün çekirdeğini bozmadan, zaman içinde oluşacak özgün operasyonel veriyi gerçek ekonomik değere dönüştüren yapay zekâ katmanını planlamak.  
**Dayanak:** Türkiye Yapay Zekâ Eylem Planı 2026–2030 içindeki özel sektör, KOBİ, veri, finansman, güvenilir yapay zekâ ve ölçekleme yaklaşımı; ayrıca Projedar’ın mevcut ürün mimarisi ve iş modeli.

---

## 1. Ana çıkarım

Projedar bugün bir “AI ürünü” olarak yeniden konumlandırılmamalıdır.

Projedar’ın asıl değeri:

- çok müteahhitli canlı yeni konut stoğu,
- üretici kontrollü tahsis,
- emlakçı bazlı erişim,
- müşteri çakışmasını azaltan kurallar,
- opsiyon / rezervasyon akışı,
- stok-fiyat güncelliği,
- dağıtım ağının ölçülebilir hale gelmesi

üzerinden oluşmaktadır.

Yapay zekâ katmanı, bu çekirdeğin üstüne sonradan eklenen bir “chatbot” değil; **dağıtım, eşleştirme ve satış kararlarını iyileştiren karar destek sistemi** olmalıdır.

### Temel tez

> Projedar’ın uzun vadeli AI avantajı, genel amaçlı bir model geliştirmekten değil; “hangi stok, hangi kanal, hangi müşteri, hangi zamanda, hangi sonuçla eşleşti?” sorusunun cevabını veren özgün işlem verisinden doğacaktır.

Bu nedenle ilk hedef **AI özelliği üretmek değil, AI için doğru veriyi kaybetmeden toplamak** olmalıdır.

---

## 2. AI katmanının stratejik rolü

Projedar AI, dört temel soruya cevap vermelidir:

1. **Hangi bağımsız bölüm hangi müşteriye daha uygundur?**
2. **Hangi stok ne kadar sürede satılabilir?**
3. **Hangi stok hangi emlakçı / ofis / kanala tahsis edilmelidir?**
4. **Müteahhit dağıtım, fiyat, kampanya ve stok kararlarında neyi değiştirmelidir?**

Bu dört soru dışındaki AI geliştirmeleri, doğrudan ölçülebilir iş değeri üretmiyorsa öncelikli olmamalıdır.

---

# 3. Projedar AI ürün ailesi

## 3.1. Buyer–Unit Matching Engine

### Amaç

Bir emlakçının müşterisi için, yalnızca o emlakçının erişebildiği ve gerçekten satışa açık canlı stok içerisinden en uygun bağımsız bölümleri sıralamak.

### Girdiler

- bütçe,
- peşinat,
- ödeme planı tercihi,
- lokasyon,
- oda tipi,
- m²,
- teslim tarihi,
- oturum / yatırım amacı,
- kat / cephe tercihleri,
- proje tipi,
- ulaşım veya POI tercihleri,
- geçmiş gösterim / ilgi sinyalleri,
- müşterinin daha önce reddettiği seçenekler.

### Çıktı

Her bağımsız bölüm için:

- **uygunluk skoru,**
- sıralama,
- en güçlü 3–5 eşleşme nedeni,
- varsa kritik uyumsuzluk,
- fiyat / ödeme planı uygunluğu,
- “neden bunu öneriyoruz?” açıklaması.

### Kritik ürün kuralı

AI, kullanıcının yetkili olmadığı stoğu asla önermemelidir.

**Tahsis ve erişim kuralları AI’dan önce gelir.**

---

## 3.2. Sell-Through Probability / Stok Satış Olasılığı

### Amaç

Her bağımsız bölümün belirli zaman ufuklarında satılma olasılığını tahmin etmek.

Örnek:

- 14 gün içinde satış olasılığı,
- 30 gün içinde satış olasılığı,
- 60 gün içinde satış olasılığı.

### Kullanılabilecek sinyaller

- stokta kalma süresi,
- fiyat değişimleri,
- proje içindeki benzer birimlerin satış hızı,
- oda tipi,
- m²,
- kat,
- cephe,
- teslim tarihi,
- ödeme planı,
- emlakçı görüntüleme sayısı,
- paylaşım sayısı,
- müşteri eşleşme sayısı,
- opsiyon girişimleri,
- iptal edilen opsiyonlar,
- rezervasyon geçmişi,
- dönemsel talep,
- proje bazlı hız,
- lokasyon bazlı satış temposu.

### Kullanım

Müteahhit panelinde:

- **yüksek satış ihtimali,**
- **normal,**
- **stok riski yükseliyor**

gibi aksiyon odaklı gruplar gösterilebilir.

### Önemli not

Bu skor “satılır / satılmaz” kesin kararı değildir.

Karar desteğidir.

---

## 3.3. Stale Inventory / Stok Yaşlanma Riski

Sell-through modelinin daha operasyonel versiyonudur.

### Sistem şu soruyu cevaplar:

> “Hangi bağımsız bölümler mevcut fiyat, ödeme planı, kanal dağılımı ve talep yapısıyla giderek satılması zor stok haline geliyor?”

### Önerilebilecek aksiyonlar

- daha geniş emlakçı havuzuna aç,
- farklı ofis segmentine tahsis et,
- ödeme planını gözden geçir,
- kampanya uygula,
- fiyatı yeniden değerlendir,
- komisyon teşvikini değiştir,
- paylaşım görünürlüğünü artır,
- belirli müşteri segmentlerine yönlendir.

AI **aksiyon önerir**, ticari kararı müteahhit verir.

---

## 3.4. Broker–Inventory Allocation Engine

Projedar’ın uzun vadede en değerli AI modüllerinden biri olabilir.

### Amaç

Müteahhide:

> “Hangi bağımsız bölümü hangi emlakçıya / ofise / gruba açmalıyım?”

sorusunda karar desteği vermek.

### Sinyaller

- danışmanın geçmiş satışları,
- lokasyon uzmanlığı,
- proje tipi uzmanlığı,
- fiyat segmenti,
- müşteri portföyü özellikleri,
- geçmiş tahsis → satış dönüşümü,
- tahsis edilen stoğu aktif kullanma oranı,
- opsiyon performansı,
- müşteri çakışması oranı,
- stale stok satış başarısı,
- dönemsel aktivite.

### Çıktı

Örnek:

**A Grubu**
- yüksek satış olasılığı,
- premium birimler,
- 7 günlük özel tahsis.

**B Grubu**
- geniş stok,
- 14 günlük tahsis.

**C Grubu**
- belirli stok tipleri,
- kontrollü pilot tahsis.

### Yönetim ilkesi

AI tahsisi otomatik değiştirmemelidir.

İlk aşamalarda:

> **AI önerir → müteahhit onaylar.**

---

# 4. Müteahhit Intelligence Layer

Yapay zekâ yalnızca emlakçı tarafına değil, esas olarak müteahhit tarafına ekonomik değer üretmelidir.

Müteahhit panelinde ayrı bir **Intelligence** katmanı düşünülebilir.

## Gösterilebilecek göstergeler

- proje satış hızı,
- stok devir hızı,
- son 7 / 30 / 90 gün satış trendi,
- bağımsız bölüm bazında stok riski,
- emlakçı/ofis performansı,
- tahsis → görüntüleme,
- görüntüleme → müşteri,
- müşteri → opsiyon,
- opsiyon → rezervasyon,
- rezervasyon → satış dönüşümü,
- fiyat değişiminin talebe etkisi,
- kampanya etkisi,
- ödeme planı etkisi,
- en hızlı satan tipler,
- yavaşlayan tipler,
- talep açığı / stok fazlası.

### Nihai hedef

Projedar yalnızca:

> “Stoğum nerede?”

sorusunun değil;

> **“Stoğumu nasıl daha hızlı ve daha doğru dağıtmalıyım?”**

sorusunun da cevabını vermelidir.

---

# 5. Demand Forecasting

## Proje bazında

- önümüzdeki 30 gün beklenen talep,
- oda tipine göre talep,
- fiyat segmentine göre talep,
- ödeme planı tercihi,
- kanal bazında talep.

## Bölge bazında

Yeterli veri oluştuğunda:

- lokasyon,
- proje tipi,
- fiyat segmenti,
- teslim dönemi

bazında talep tahmini yapılabilir.

### Kullanım

Yeni proje sisteme alınırken:

> “Bu stok dağılımı mevcut Projedar talebiyle ne kadar uyumlu?”

sorusu cevaplanabilir.

Bu, ileride yalnız satış değil, ürün geliştirme tarafında da değer yaratabilir.

---

# 6. Price & Inventory Anomaly Detection

Bu alan erken dönemde bile fayda üretebilir.

### Sistem tespit eder:

- alışılmadık fiyat değişimi,
- yanlış girilmiş fiyat,
- tutarsız m²/fiyat,
- stok statüsü çelişkisi,
- satılmış görünen ama hâlâ aktif stok,
- fiyat listesi ile panel arasında uyumsuzluk,
- ödeme planında olağan dışı değişiklik,
- aynı birimin farklı kaynaklarda farklı görünmesi.

### Neden önemli?

Projedar’ın temel vaatlerinden biri **canlı ve güvenilir stok** olmalıdır.

AI/istatistiksel anomali tespiti bu vaadi doğrudan güçlendirir.

Bu modül, daha karmaşık tahmin modellerinden önce devreye alınabilir.

---

# 7. “Freshness Intelligence”

Projedar için klasik AI’dan daha önemli olabilecek bir alan.

Her proje / bağımsız bölüm için:

## Freshness Score

- stok ne zaman güncellendi?
- fiyat ne zaman doğrulandı?
- müteahhit CRM kaynağı aktif mi?
- manuel müdahale yapıldı mı?
- son satış/tahsis hareketi ne zaman?
- veri kaynağında senkron problemi var mı?

### Örnek

**Freshness: 96/100 — Güncel**

veya

**Freshness: 61/100 — Fiyat doğrulaması gerekli**

Bu skor Projedar’ın “canlı stok” iddiasını ölçülebilir hale getirir.

---

# 8. Lead / müşteri tarafında AI

Projedar klasik CRM’e dönüşmemelidir.

Bu nedenle müşteri tarafındaki AI, CRM fonksiyonlarını çoğaltmak yerine **satış eşleştirmesini desteklemelidir.**

## Olabilecek özellikler

### Lead Intent Score

Müşteri:

- sadece araştırıyor,
- aktif alıcı,
- kısa vadede satın alma ihtimali yüksek

şeklinde sınıflandırılabilir.

### Next Best Unit

Müşteri için sıradaki en mantıklı bağımsız bölüm.

### Next Best Action

Emlakçıya:

- yeni birim göster,
- ödeme planı alternatifi sun,
- fiyat güncellemesini bildir,
- yeni stok açıldı,
- opsiyon süresi bitiyor

gibi bağlamsal öneri.

---

# 9. LLM / üretken yapay zekânın rolü

LLM, Projedar’ın çekirdek karar motoru olmamalıdır.

### LLM için uygun alanlar

- proje özetleme,
- ödeme planını açıklama,
- birim karşılaştırmasını doğal dilde anlatma,
- müşteriye özel sunum metni oluşturma,
- müteahhit için performans özetleri,
- emlakçıya günlük “ne değişti?” özeti,
- proje dokümanlarından bilgi çıkarma,
- fiyat listesi / PDF / Excel içeriğini yapılandırılmış veriye dönüştürme,
- açıklanabilir AI çıktılarının doğal dilde sunulması.

### LLM için uygun olmayan alanlar

- tahsis kararını tek başına vermek,
- satış olasılığını yalnız prompt ile tahmin etmek,
- stok statüsünü uydurmak,
- fiyatı belirlemek,
- erişim/yetki kurallarını aşmak.

Çekirdek skorlar mümkün olduğunca:

- kurallı sistem,
- istatistik,
- ranking,
- klasik ML,
- gradient boosting,
- recommendation modelleri,
- zaman serisi

gibi yöntemlerle çalışmalı; LLM **açıklama ve kullanıcı etkileşimi katmanı** olmalıdır.

---

# 10. Veri stratejisi

## 10.1. En kritik prensip

Bugünden itibaren yalnız “son durum” tutulmamalıdır.

**Her değişiklik olay olarak kaydedilmelidir.**

Örneğin:

`unit_price_changed`

`unit_status_changed`

`allocation_created`

`allocation_removed`

`allocation_extended`

`broker_viewed_unit`

`broker_shared_unit`

`buyer_matched`

`buyer_rejected_unit`

`option_created`

`option_expired`

`option_cancelled`

`reservation_created`

`sale_completed`

`commission_changed`

`payment_plan_changed`

`inventory_synced`

`inventory_sync_failed`

### Neden?

AI modeli gelecekte:

> “Şu an ne var?”

sorusundan çok:

> “Ne oldu, hangi sırayla oldu ve sonucu neydi?”

sorusuyla eğitilecektir.

---

# 11. AI için tutulması gereken minimum veri

## Bağımsız bölüm

- unit_id
- project_id
- blok
- kat
- tip
- net/brüt m²
- cephe
- fiyat
- fiyat geçmişi
- ödeme planı
- teslim tarihi
- durum
- durum geçmişi
- tahsis geçmişi
- rezervasyon geçmişi
- satış tarihi

## Müteahhit

- developer_id
- proje portföyü
- stok politikası
- tahsis kuralları
- kanal tercihleri

## Emlakçı / ofis

- broker_id
- office_id
- lokasyon
- uzmanlık
- proje görüntüleme geçmişi
- paylaşım geçmişi
- tahsis geçmişi
- opsiyon performansı
- satış performansı

## Müşteri

KVKK ve minimum veri ilkesi gözetilerek:

- anonim/pseudonymous buyer_id,
- bütçe bandı,
- lokasyon tercihi,
- oda tipi,
- ödeme kapasitesi,
- teslim beklentisi,
- yatırım/oturum amacı,
- reddettiği / beğendiği seçenekler.

## Olay

Her olay:

- actor,
- object,
- event_type,
- timestamp,
- source,
- previous_value,
- new_value

ile kaydedilmelidir.

---

# 12. AI mimarisi — önerilen yaklaşım

## Katman 1 — Rules

İş kuralları.

Örneğin:

- kullanıcı yetkili değilse stok görünmez,
- bütçe dışında ise eşleşme dışı,
- tahsisli olmayan stok önerilmez.

## Katman 2 — Features

Model girdileri.

Örneğin:

- fiyat/ortalama oranı,
- stok yaşı,
- danışmanın dönüşüm oranı,
- proje talep indeksi.

## Katman 3 — Predictive Models

- matching,
- sell-through,
- allocation,
- demand,
- anomaly.

## Katman 4 — Recommendation / Optimization

Modellerin sonuçlarını ticari öneriye dönüştürür.

## Katman 5 — LLM Explanation

> “Neden bunu öneriyoruz?”

sorusunu açıklayan doğal dil katmanı.

---

# 13. Cold Start stratejisi

Projedar ilk gün yeterli geçmiş veriye sahip olmayacaktır.

Bu nedenle üç aşamalı yaklaşım gerekir.

## Aşama 1 — Rule Based

Uzman kuralları.

## Aşama 2 — Hybrid

Kural + ilk davranış verileri.

## Aşama 3 — Learned

Yeterli işlem oluşunca machine learning.

Bu nedenle AI özelliği için “yeterli veri birikene kadar beklemek” gerekmiyor; ancak ilk sürümlerin AI olduğu iddiası abartılmamalıdır.

---

# 14. Model başarı ölçütleri

AI performansı yalnız accuracy ile ölçülmemelidir.

## Matching

- top-5 acceptance rate,
- müşteri → opsiyon dönüşümü,
- önerilen stok → satış oranı.

## Sell-through

- tahmin kalibrasyonu,
- MAE / Brier score,
- riskli stok tespit başarısı.

## Allocation

- tahsis → satış dönüşümü,
- tahsis edilen stokta satış süresi,
- boşta kalan tahsis oranı.

## Demand

- forecast error,
- tip/lokasyon bazında tahmin doğruluğu.

## İş metriği

En önemlisi:

- satış süresi,
- stok devir hızı,
- conversion,
- stale inventory,
- satış başına emlakçı aktivitesi.

---

# 15. Güvenilir AI prensipleri

Türkiye Yapay Zekâ Eylem Planı; güvenilirlik, açıklanabilirlik, veri koruma, risk yaklaşımı ve insan gözetimini ana bileşenler arasında ele almaktadır.

Projedar’ın AI tasarımında baştan şu ilkeler uygulanmalıdır:

## 1. Human in the Loop

AI önerir.

Müteahhit / emlakçı karar verir.

## 2. Explainability

Her skor için:

- temel nedenler,
- kullanılan veri türleri,
- model güven seviyesi

gösterilebilir.

## 3. Override

Kullanıcı AI önerisini değiştirebilir.

## 4. Audit

AI önerisi ve insan kararı kaydedilir.

## 5. Privacy

Müşteri verisi minimum seviyede tutulur.

## 6. Access Control

AI mevcut rol ve tahsis yetkilerini aşamaz.

---

# 16. Türkiye Yapay Zekâ Eylem Planı ile eşleşme

## Eylem 8 — Sektörel AI / KOBİ Kuponları

Projedar gayrimenkul/konut sektöründe olduğu için Eylem 8’in ilk faz açık öncelikleri arasında doğrudan yer almamaktadır.

Ancak çağrılar sektör bağımsız veya geniş kapsamlı KOBİ AI dönüşümüne açılırsa:

- matching,
- sell-through,
- allocation,
- demand forecasting

gibi modüllerin PoC/pilot geliştirilmesi için değerlendirilebilir.

### Kullanılabilecek destek kalemleri

Eylem Planı; kupon mekanizmasında:

- yazılım,
- bulut GPU/CPU,
- veri hizmetleri,
- güvenlik/uygunluk testleri

gibi kalemleri öngörmektedir.

---

## Eylem 10 — Yapay Zekâ Finansman Merdiveni

Projedar, ürün-pazar uyumu ve gerçek AI ekonomik etkisi kanıtlandıktan sonra Yapay Zekâ Büyüme Fonu açısından potansiyel aday haline gelebilir.

Bunun için AI’ın:

> “üründe bulunan özellik”

değil,

> “şirketin büyümesini ve müşterinin ekonomik sonucunu etkileyen çekirdek yetkinlik”

olması gerekir.

Örnek kanıt:

- satış süresi %X düştü,
- stok devir hızı %Y arttı,
- matching conversion %Z arttı.

---

## Eylem 6 — Herkes İçin GPU

Projedar’ın ilk aşamada önemli GPU ihtiyacı beklenmemelidir.

Ancak ileride:

- recommendation training,
- embedding,
- büyük ölçekli inference,
- LLM operasyonu

artarsa kullanılabilir.

Stratejik bağımlılık oluşturulmamalıdır.

---

## Eylem 4 / 16 — Güvenilir AI

Projedar yüksek etkili kamu AI sistemi değildir.

Yine de gelecekte otomatik ticari tavsiyeler üreteceği için:

- açıklanabilirlik,
- model kayıtları,
- veri menşei,
- insan gözetimi,
- bias kontrolü

baştan tasarlanmalıdır.

---

# 17. Geliştirme fazları

# FAZ 0 — Şimdi

## Amaç

AI geliştirmeden önce AI-ready Projedar.

### Yapılacaklar

- event taxonomy oluştur,
- fiyat geçmişini eksiksiz tut,
- stok durum geçmişini tut,
- tahsis geçmişini tut,
- opsiyon/rezervasyon olaylarını kaydet,
- müşteri tercihlerini yapılandırılmış hale getir,
- emlakçı aktivitesini event olarak kaydet,
- “neden satıldı / neden kaybedildi” feedback alanları oluştur,
- veri kalite metrikleri oluştur.

**Çıktı:** AI-ready operational dataset.

---

# FAZ 1 — Erken değer

## 1. Freshness Score

## 2. Price / Inventory Anomaly Detection

## 3. Rule-Based Buyer Matching

## 4. AI-generated explanation & summary

### Neden önce bunlar?

- az veriyle çalışır,
- kullanıcıya hemen değer verir,
- çekirdek ürünü bozmaz,
- veri toplamayı hızlandırır.

---

# FAZ 2 — Predictive AI

Yeterli işlem verisi oluştuktan sonra:

## 1. Buyer–Unit Matching Model

## 2. Sell-through Score

## 3. Stale Inventory Risk

## 4. Lead Intent

### Amaç

Operasyonel veriden tahmin üretmeye başlamak.

---

# FAZ 3 — Distribution Intelligence

## 1. Broker–Inventory Allocation Recommendation

## 2. Demand Forecasting

## 3. Next Best Action

## 4. Campaign / payment-plan effectiveness

Bu faz Projedar’ın klasik SaaS’tan ayrışmaya başladığı aşamadır.

---

# FAZ 4 — AI-Native Distribution Network

Uzun vadeli hedef.

Projedar artık sadece stok dağıtan sistem değil:

> **Yeni konut stoğunun hangi kanala, hangi müşteriye, hangi şartla ve hangi zamanda dağıtılması gerektiğini öğrenen ağ.**

Bu seviyede network effect + proprietary data + AI birlikte moat oluşturur.

---

# 18. İlk ürün önceliği

Bugün başlamak gerekirse sıralama:

1. **Event/Data Foundation**
2. **Freshness Score**
3. **Anomaly Detection**
4. **Buyer–Unit Matching**
5. **Sell-through / Stale Inventory**
6. **Broker Allocation Recommendation**
7. **Demand Forecasting**
8. **Next Best Action**

Bu sıranın değiştirilmemesi önerilir.

Çünkü 6–8 numaralı sistemlerin kalitesi ilk beş adımda oluşan veriye bağlıdır.

---

# 19. Yapılmaması gerekenler

## “AI chatbot”u ana ürün gibi sunmak

Hayır.

## Projedar’ı “AI gayrimenkul platformu” diye erkenden yeniden markalamak

Hayır.

## Yeterli veri olmadan karmaşık prediction modeli geliştirmek

Hayır.

## Generic Real Estate LLM geliştirmek

Şimdilik hayır.

## AI’ın tahsis kurallarını bypass etmesine izin vermek

Kesinlikle hayır.

## Otomatik fiyat belirleme

Yeterli veri, governance ve ticari onay olmadan hayır.

## Black-box recommendation

Hayır.

Her önemli önerinin açıklanabilir olması gerekir.

---

# 20. Kuzey yıldızı

Projedar AI’ın nihai başarısı şu cümleyle ölçülmelidir:

> **“Doğru bağımsız bölümün, doğru emlakçı üzerinden, doğru müşteriye, doğru zamanda ulaşma olasılığını artırıyor muyuz?”**

Eğer bir AI özelliği bu soruya ölçülebilir katkı sağlamıyorsa, Projedar AI roadmap’inde öncelikli olmamalıdır.

---

# 21. Tek cümlelik ürün vizyonu

> **Projedar AI, yeni konut satışında canlı stok, tahsis ve gerçek işlem verisini kullanarak müteahhitlerin dağıtım kararlarını ve emlakçıların müşteri–stok eşleştirmesini optimize eden karar destek katmanıdır.**

---

# 22. Finansman / kamu desteği açısından izlenecek başlıklar

Türkiye Yapay Zekâ Eylem Planı kapsamında özellikle takip edilecekler:

- KOBİ Yapay Zekâ Kupon Programları,
- sektör bağımsız AI pilot çağrıları,
- Yapay Zekâ Büyüme Fonu,
- Ulusal Yapay Zekâ Araştırma Fonu’nun uygulamalı proje çağrıları,
- Herkes İçin GPU erişimi,
- teknogirişimlere yönelik özel destek pencereleri,
- güvenilir AI / model değerlendirme standartları.

Ancak Projedar ürünü **çağrıya uydurmak için değiştirilmemelidir.**

Çağrı Projedar’ın doğal ürün yol haritasıyla eşleşiyorsa kullanılmalıdır.

---

# 23. Nihai stratejik çıkarım

Projedar’ın AI avantajı, bugün bir model seçmekten değil; önümüzdeki yıllarda rakiplerin kolayca kopyalayamayacağı bir **işlem ve dağıtım veri grafiği** oluşturmaktan doğacaktır.

Bu veri grafiğinin temel ilişkileri:

**Developer → Project → Unit → Allocation → Broker → Buyer → Option → Reservation → Sale**

olmalıdır.

Buna fiyat, zaman, ödeme planı ve kullanıcı davranışı eklendiğinde Projedar;

sadece bir B2B stok ağı olmaktan çıkıp,

**Türkiye yeni konut pazarının dağıtım zekâsı katmanına**

dönüşebilir.

Bu nedenle bugünden alınması gereken en kritik teknik karar:

> **Her önemli kullanıcı ve stok hareketini gelecekte model eğitebilecek şekilde olay bazlı, zaman damgalı ve geçmişi korunarak saklamak.**

