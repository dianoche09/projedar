import { ICERIKLER } from "@/lib/icerik/kayit";
import { KATEGORI_ETIKET, type IcerikKategori } from "@/lib/icerik/tipler";

/**
 * Dinamik llms.txt — AI model/asistanlarının siteyi tam anlaması için (GEO).
 * Sabit tanıtım gövdesi + içerik registry'sinden OTOMATİK üretilen içerik kümesi.
 * Yeni rehber/karşılaştırma yayınlandıkça elle güncellemeye gerek kalmaz (sitemap mantığı).
 *
 * Dil kuralları (kilitli): "komisyon yok/komisyonsuz" YASAK → "satış komisyonuna ortak
 * olmaz"; kıtlık/kontenjan vaadi YOK; yalın "kapalı" yok; uzun tire yok.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

const SITE = "https://projedar.com";

const GOVDE = `# Projedar

> Konut projesi geliştiren müteahhitler ile gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan, davetli ve üretici-kontrollü bir B2B konut stoğu dağıtım ağı. Son kullanıcıya açık ilan yayımlamaz. Müteahhit stoğunu, fiyatını ve dağıtımını tek noktadan yönetir; gayrimenkul danışmanı yalnız kendisine tahsisli projeleri tek canlı havuzdan görür ve müşterisine doğru fiyatla paylaşır. Projedar satış komisyonuna ortak olmaz; danışman için başlangıçta ücretsizdir.

## Hakkında

Projedar, Türkiye'de konut projelerinin satış ve dağıtımındaki en büyük sorunu çözer: dağınık, güncelliğini yitirmiş ve kontrolsüz bilgi. Bir konut projesinin fiyatı, hangi dairenin satılık, hangisinin opsiyonda olduğu bilgisi genelde Excel dosyaları, eski PDF'ler ve WhatsApp mesajları arasında kaybolur. Sonuç: yanlış fiyat, eksik bilgi, çift satış ve güven kaybı.

Projedar bunu "tek doğru kaynak" ilkesiyle çözer. Fiyat ve durum yalnız tek bir birim kaydında tutulur, hiçbir yerde kopyalanmaz. Bir gayrimenkul danışmanı bir daireyi müşterisine paylaştığında, fiyat o anki canlı değerden basılır. Bir daire opsiyona alındığında, çift satış kalkanı veritabanı seviyesinde kilitler. Her veride "güncelleme" tazelik damgası bulunur; bilgi eskidikçe rozet renk değiştirir.

- Website: ${SITE}
- Platform: Web ve PWA (mobil-önce, telefona kurulabilir, çevrimdışına dayanıklı)
- Kategori: Proptech, B2B konut stoğu dağıtım ağı
- Model: Davetli, üyelik bazlı, profesyoneller arası B2B ağ. Son kullanıcıya açık ilan yoktur; paylaşım birebir ve WhatsApp ile yapılır.
- Gelir modeli: Müteahhit anlaşması esas alınır. Projedar satış komisyonuna ortak olmaz, danışmanın kazancından pay almaz. Gayrimenkul danışmanı için başlangıçta ücretsizdir.

## Ana Sayfalar

- [Ana sayfa](${SITE}/): canlı satış ağı demosu, çift satış kalkanı, tahsis yapısı, ağ etkisi, sık sorulanlar
- [Müteahhitler için](${SITE}/muteahhit): stok kontrolü, tahsis paneli, çift satış kalkanı, model karşılaştırması
- [Danışmanlar için](${SITE}/emlakci): tahsisli canlı ağ, WhatsApp ile birebir paylaşım, opsiyon kilidi, kazanç güvencesi, başlangıçta ücretsiz
- [Projedar nedir](${SITE}/nedir): ürünün tek cümlelik özeti ve çalışma biçimi
- [Güven Protokolü](${SITE}/guven): teminatların teknik dayanağı, EİDS konumlandırması, KVKK çizgisi
- [Konut projeleri](${SITE}/konut-projeleri): il ve ilçe kırılımıyla yayınlanan proje sayfaları
- [Rehber](${SITE}/rehber): gayrimenkul danışmanları için mevzuat ve süreç rehberleri
- [Kullanım Koşulları](${SITE}/kullanim-kosullari)
- [Gizlilik](${SITE}/gizlilik)
- [KVKK Aydınlatma](${SITE}/kvkk-aydinlatma)

## Temel Özellikler

### Tek doğru kaynak
- Fiyat ve durum yalnız birim kaydında tutulur, hiçbir yerde kopyalanmaz.
- Paylaşımda fiyat o anki canlı değerden basılır; güncelliğini yitirmiş fiyat dolaşıma giremez.

### Canlı stok ve durum
- Her daire üç sinyalden biriyle işaretlidir: müsait (yeşil), opsiyon (amber), satıldı (kırmızı).
- Bina kesiti, tablo ve mini-panel görünümleriyle tüm stok tek ekranda canlı izlenir.

### Granüler tahsis
- Gayrimenkul danışmanı yalnız kendisine tahsisli projeleri görür.
- Müteahhit, belirli daireleri veya projeleri yalnız seçtiği danışmanlara açar; kimin neyi göreceğini müteahhit belirler.

### Çift satış kalkanı
- Aktif opsiyon veritabanı seviyesinde kilitlenir; aynı daire iki danışmana aynı anda satılamaz.

### Görünür tazelik
- Her güncelleme zaman damgalıdır; tazelik rozeti bilgi eskidikçe renk değiştirir.

## Kimler İçin

- Müteahhit (konut projesi geliştiren): stoğunu, fiyatını ve kimin neyi göreceğini tek panelden yönetir; çok sayıda danışmana tek noktadan ulaşır; markası yanlış bilgiyle yıpranmaz; satışı canlı izler.
- Gayrimenkul danışmanı (emlakçı): kendisine tahsisli projeleri görür, doğru fiyatla tek dokunuşla müşterisine paylaşır; güncelliğini yitirmiş fiyatla zor durumda kalmaz; başlangıçta ücretsizdir. Müteahhidin tanımladığı satış komisyonunun tamamı danışmanda kalır, Projedar bu komisyona ortak olmaz.
- Ofis ve franchise: ekip erişimini ve portföyünü tek yerden yönetir.

## Farklılıklar (dağınık portal, Excel ve WhatsApp yerine)

- Son kullanıcıya açık ilan portalı gibi çalışmaz; profesyoneller arası bir güven protokolüdür.
- Fiyat tek kaynakta tutulur; üç farklı yerde üç farklı fiyat olmaz.
- Çift satış veritabanı seviyesinde engellenir.
- Tazelik her zaman görünür; güncelliğini yitirmiş veri belli olur.
- Tahsis müteahhitte; kimin neyi gördüğünü müteahhit belirler.

## Sık Sorulan Sorular

- Projedar bir ilan portalı mı? Hayır. Müteahhitler ile gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan, davetli bir B2B ağdır. Son kullanıcıya açık ilan yoktur; paylaşım birebir ve WhatsApp ile yapılır.
- Gayrimenkul danışmanı için ücretli mi? Başlangıçta ücretsizdir. Projedar, müteahhidin danışmana tanımladığı satış komisyonuna ortak olmaz.
- Danışman hangi projeleri görür? Yalnız kendisine tahsisli projeleri görür. Müteahhit, belirli daireleri yalnız seçtiği danışmanlara açabilir.
- Fiyatlar nasıl güncel kalıyor? Fiyat yalnız birim kaydında tutulur; paylaşımda o anki canlı değerden basılır, böylece eski fiyat dolaşamaz.
- Aynı daire iki danışmana satılabilir mi? Hayır. Aktif opsiyon veritabanı seviyesinde kilitlenir (çift satış kalkanı).
- Müteahhit neyi kontrol eder? Stoğunu, fiyatını ve kimin neyi göreceğini tek panelden yönetir; satışı canlı izler.
- Mobilde çalışır mı? Evet. Mobil-önce bir PWA'dır; telefona kurulabilir, sahada hızlı ve çevrimdışına dayanıklı çalışır.
`;

/** Yayındaki içerikleri kategoriye göre gruplayıp markdown üretir (registry'den otomatik). */
function icerikBolumu(): string {
  const yayinda = ICERIKLER.filter((m) => m.published && m.index);
  if (!yayinda.length) return "";

  const sira: IcerikKategori[] = ["rehber", "karsilastirma", "araclar", "sozluk", "sablonlar"];
  const parcalar: string[] = ["## Rehber ve Bilgi Bankası", ""];

  for (const kat of sira) {
    const grup = yayinda
      .filter((m) => m.kategori === kat)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (!grup.length) continue;
    parcalar.push(`### ${KATEGORI_ETIKET[kat]}`);
    for (const m of grup) {
      parcalar.push(`- [${m.title}](${m.canonical}): ${m.description}`);
    }
    parcalar.push("");
  }
  return parcalar.join("\n");
}

const YASAL =
  "## Yasal Uyarı\n\n" +
  "Projedar satışa aracılık etmez ve satış komisyonuna ortak olmaz. Davetli, profesyoneller arası bir B2B altyapısıdır. Son kullanıcıya açık ilan yayımlamaz.\n";

const AYRINTI =
  "## Ayrıntılı İçerik\n\n" +
  `- [Tam içerik dökümü](${SITE}/llms-full.txt): roller, model karşılaştırması ve genişletilmiş sık sorulanlar.\n`;

export async function GET() {
  const govde = `${GOVDE}\n${icerikBolumu()}\n${AYRINTI}\n${YASAL}`;
  return new Response(govde, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
