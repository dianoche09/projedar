# KolaySEO — Go-to-Market Planı (ürünleştirme)

> **Amaç:** Kolayimar'ın kanıtlanmış SEO/GEO motorunu (skill `~/.claude/skills/kolayseo/` + blueprint
> `docs/kolayseo-seo-geo-kurulum-blueprint.md`) satılabilir bir ürüne çevirmek.
> **Bağlam:** solo/indie kurucu (product+code+satış tek elde). Bu plan solo-uyumlu, kanıt-önce, düşük-riskli.
> **Eşlik eden belge:** `docs/kolayseo-multi-tenant-mimari.md` (SaaS teknik tasarımı).

---

## 1. Konumlandırma (en kritik karar)

**KolaySEO genel bir SEO aracı DEĞİLDİR.** Genel SEO'da Ahrefs / Semrush / SurferSEO / Frase + yerli
oyuncular var — solo girmek intihar, farklılaşma yok.

**KolaySEO = veri-yoğun dikey nişler için "programmatic SEO + GEO fabrikası".** Üç şey aynı anda:
1. **Programmatic ölçek** — konum/kategori × hizmet matrisinden doorway-safe yüzlerce sayfa (kanıt: #4-6, %4-22 CTR).
2. **GEO-first** — llms.txt + FAQ/HowTo schema + answer-first ile AI aramada (ChatGPT/Perplexity/AI Overview) **kaynak** olmak. **Bu pazar yeni, TR'de neredeyse boş — asıl farklılaşma burada.**
3. **Kapalı-döngü istihbarat** — SerpAPI + GSC + IndexNow + fırsat motoru (ölç → fırsat → aksiyon).

**Tek cümlelik konumlanma (test edilecek):**
> "İşletmenizi Google'da ve yapay zeka aramalarında (ChatGPT, Perplexity) bulunur kılan otomatik SEO/GEO motoru — genel araç değil, nişinize göre yüzlerce sayfa üreten + haftalık fırsat çıkaran sistem."

## 2. En güçlü koz: kendi case study'n

Rakiplerin yapamadığı: **"Bu motoru kendi siteme kurdum → Kolayimar milyonlarca Google gösterimi, programmatic sayfalar #4-6, %4-22 CTR. İşte GSC ekranı."** Ürünün en pahalı parçası (gerçek sonuç) sende var. Her satış konuşmasının, landing'in, cold-mail'in çıpası bu olmalı. Ekran görüntüsü + gerçek rakam = güven.

> **Dürüstlük sınırı (marka kuralı):** abartma. "Milyonlarca gösterim" GERÇEK (GSC), ama "1 numara garantisi" YASAK. Motorun dürüst kapsamı: **işin %70'i (mekanizma + süreç); backlink/otorite hâlâ müşterinin işi.** Bunu satışta açıkça söyle — güven artırır, iade azaltır.

## 3. Hedef müşteri (ICP) — A ve B, ama SIRAYLA

İkisini de hedefleyeceğiz, ama **aynı anda ikisine tam güç = solo'da dağılma.** Sıra:

### ICP-A (ÖNCE) — Matris'i olan son işletmeler
Konum/kategori çeşitliliği olan, SEO'dan somut lead alan işletmeler:
- Emlak ofisi ağları / franchise, gayrimenkul geliştiriciler
- Hukuk büroları (şehir × dava türü), muhasebe/danışmanlık
- Klinik/sağlık zincirleri (şehir × hizmet), estetik
- Yerel hizmet ağları (nakliyat, tesisat, temizlik — şehir × hizmet)
- E-ticaret (kategori × marka × özellik sayfaları)

**Neden önce A:** case study'n birebir uyar (Kolayimar de tam bu — konum×hizmet matrisi), satış döngüsü kısa, nakit hızlı, referans/vaka biriktirir.

### ICP-B (SONRA) — Ajanslar / geliştiriciler (white-label)
SEO/dijital ajanslar, web geliştirici stüdyoları — motoru **kendi müşterilerine** kurar.
**Neden sonra:** ölçek onlarda (1 ajans = N son-müşteri), ama satışı zor (ajans kendi süreçlerine güvenir, "neden senin motorun?" itirazı). A'dan gelen vaka kanıtı B satışını kolaylaştırır. B'yi **white-label tier** olarak paketle.

## 4. Ürün paketleme — 3 katman

Motor tek; satış 3 farklı iştah/bütçeye göre paketlenir:

| Paket | Ne | Model | Kim |
|-------|-----|-------|-----|
| **1. Kurulum (Setup)** | Motoru müşterinin sitesine kur: robots+sitemap+llms.txt+schema+N programmatic sayfa+command center. Tanımlı kapsam, sabit fiyat. | **Productized service** (tek seferlik) | A |
| **2. Command Center (İzleme)** | Merkezi SaaS: haftalık istihbarat + fırsat kuyruğu + IndexNow + GSC + digest. Aylık abonelik. | **SaaS** (aylık/yıllık) | A |
| **3. White-label Engine** | Ajansa motor lisansı + eğitim + çok-müşteri command center. | **Lisans + retainer** | B |

**Neden bu üçlü doğru:** Kurulum (1) müşteriyi getirir ve nakit üretir; Command Center (2) elde tutar (tekrarlayan gelir); White-label (3) ölçeği açar. **1 → 2 doğal geçiş** (kurulumu yaptın, izlemeyi sat).

> Bu, önceki strateji analizinin Faz 1 (productized service) → Faz 2 (command center SaaS) → Faz 3 (white-label) yolunun paketlenmiş hali. Teknik tarafı `kolayseo-multi-tenant-mimari.md`.

## 5. Fiyatlandırma çerçevesi (kesin değil — pazar testiyle oturt)

Solo'da **değer-bazlı + basit** fiyatla; saat satma. Aşağıdakiler başlangıç çıpası (TR + global $):

**Kurulum (tek seferlik):**
- Starter (tek eksen, ~50 programmatic sayfa + teknik + GEO): ~₺25–50K / $800–1.5K
- Growth (çok eksen, ~200+ sayfa + command center kurulum): ~₺60–120K / $2–4K
- (Fiyat değil, **sonuç** sat: "3 ayda X organik sayfa + AI aramada görünürlük.")

**Command Center (aylık abonelik):**
- Solo/işletme: ~₺2–5K/ay ($60–150) — N kelime izleme, haftalık fırsat, IndexNow, digest
- Pro: ~₺6–15K/ay ($200–500) — daha çok kelime/rakip, GSC entegre, öncelikli fırsat
- Kademe metriği: izlenen sorgu sayısı + programmatic sayfa sayısı + rakip sayısı.

**White-label (ajans):**
- Aylık taban + son-müşteri başına ücret (ör. ₺15K/ay + müşteri başına ₺2K). Ajans marjını korur.

> **Maliyet farkındalığı:** SerpAPI + Claude + fal + GSC kotası **tenant sayısıyla çarpılır.** Fiyat, tenant başına değişken maliyeti (özellikle SerpAPI sorgu × sıklık) rahat karşılamalı. Detay: multi-tenant belgesi §maliyet.

## 6. İlk 90 gün (solo yürütme planı)

**Ay 1 — Kanıt + ilk pilotlar (nakit + vaka)**
- 2-3 **pilot müşteri** bul (indirimli/ücretsiz-ilk, karşılığında vaka + geri bildirim). ICP-A'dan.
- Her pilota **Kurulum paketi** uygula (skill zaten kuruyor). Süreci ölç: kaç saat, ne tekrarlıyor.
- Kolayimar case study'sini **tek sayfalık satış landing'ine** çevir (GSC ekranı + rakam + "kime uygun").

**Ay 2 — Command Center SaaS MVP + tekrarlanabilir kurulum**
- Multi-tenant Command Center MVP (bkz. teknik belge Faz 1): tenant + izole veri + onboarding + billing.
- Pilotları aylık aboneliğe geçir (kurulumdan izlemeye doğal upsell).
- Kurulum sürecini **checklist + skill fazlarıyla** standartlaştır (saat başına değer artır).

**Ay 3 — Dağıtım + ilk ödeyen kohort**
- Satış landing + Kolayimar vaka + 2-3 pilot vakası yayında.
- Outbound: ICP-A listesine (emlak/hukuk/klinik ağları) case-study'li cold-mail + LinkedIn.
- İçerik: "GEO nedir, işletmeni ChatGPT'de nasıl bulunur kılarsın" (kendi ilacını iç — KolaySEO ile).
- Hedef: 5-10 ödeyen Command Center abonesi + 3-5 kurulum.

## 7. Satış kanalları (solo-uyumlu, öncelik sırası)

1. **Kendi vaka + içerik (inbound)** — GEO/programmatic'i kendi sitende sergile; "kanıtı yaşayan" satış.
2. **Outbound (ICP-A listeleri)** — emlak/hukuk/klinik ağlarına kişisel, case-study'li dokunuş. Solo'da düşük hacim yüksek isabet.
3. **LinkedIn build-in-public** — süreç + sonuç paylaşımı (mevcut founder içerik hattına ekle; [[linkedin-founder-content]] tonu: mütevazı, kanıt-önce).
4. **Ajans ortaklıkları (ICP-B, sonra)** — 1-2 ajansla white-label pilot; onların müşteri tabanına eriş.
5. **Marketplace/dizin (opsiyonel)** — Vercel/Next.js ekosistemi, ürün-avı tarzı lansman (skill = boilerplate açısı).

## 8. Farklılaşma / mesaj hattı (rakip diline karşı)

| Rakip der ki | Sen dersin ki |
|--------------|---------------|
| "SEO analiz aracı" (Ahrefs/Semrush) | "Analiz değil — sayfaları ÜRETEN + fırsatı aksiyona çeviren motor." |
| "İçerik yazarı" (Surfer/Frase) | "Tek sayfa değil — nişinin tüm konum×hizmet matrisi, otomatik." |
| "SEO ajansı" (retainer) | "Ajans hızında değil — kanıtlı motor + haftalık otomatik istihbarat, şeffaf." |
| Kimse (GEO) | "AI aramada kaynak olmak — ChatGPT/Perplexity çağında bulunurluk. Erken hareket." |

## 9. Metrikler (neyi izle)

- **Aktivasyon:** kurulumdan sonra ilk programmatic sayfa indexlendi + ilk fırsat üretildi (time-to-value).
- **Retention:** Command Center aylık yenileme oranı (asıl SaaS sağlığı).
- **Kanıt üretimi:** müşteri başına "önce/sonra" organik sayfa + gösterim delta'sı (yeni vaka = yeni satış).
- **Birim ekonomi:** tenant başına SerpAPI/Claude maliyeti vs abonelik (marj pozitif mi).

## 10. Riskler + panzehir

| Risk | Panzehir |
|------|----------|
| "Genel SEO aracı" tuzağına düşmek | Konumlanmayı niş programmatic + GEO'da tut; genel keyword-tool yapma. |
| Solo bant genişliği (kurulum elle, ölçeklenmez) | Kurulumu skill fazlarıyla standartlaştır; asıl gelir SaaS (Command Center) olsun. |
| Değişken maliyet (SerpAPI tenant×sıklık) | Fiyat kademesini kota'ya bağla; sıklığı planla ayarla (§multi-tenant maliyet). |
| Doorway/thin-content cezası (müşteri sitesinde) | `district-content.ts` hash-variant + gerçek-veri-yoksa-render-etme zorunlu; her tenant için doğrula. |
| Müşteri sonucu göremeden churn | Time-to-value'yu kısalt (ilk 30 günde indexlenen sayfa + AI görünürlük kanıtı). |
| GEO ölçümü zor ("ChatGPT'de çıkıyor muyuz") | Periyodik LLM-cevap örnekleme özelliği ekle (eoma.ai fikri; [[seo-competitive-data]] E-E-A-T notu). |

## 11. Bir sonraki somut adım
1. Kolayimar case study'sini tek-sayfa satış landing'ine çevir (GSC ekranı + rakam).
2. Multi-tenant Command Center MVP'sini kur (teknik belge Faz 1).
3. 2-3 ICP-A pilot bul, Kurulum paketini uygula, aylık aboneliğe geçir.

İlişkili: [[seo-command-center]] [[seo-competitive-data]] [[funnel-kanama-raporu]] · skill `~/.claude/skills/kolayseo/`
