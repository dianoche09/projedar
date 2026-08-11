import {
  Sparkles,
  Building2,
  RefreshCw,
  TrendingUp,
  MapPin,
  Search,
  AlertTriangle,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { SurecAkisi } from "@/components/icerik/SurecAkisi";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { SenaryoKutusu } from "@/components/icerik/SenaryoKutusu";
import { BolumGorsel } from "@/components/icerik/IcerikGorsel";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Rehber gövdesi: sıfır (projeden) konut satmanın emlak danışmanına avantajları +
 * fırsat/yatırım değerlendirme METODOLOJİSİ (tavsiye değil). Komisyon/mevzuat
 * noktaları atıflı ([1] Taşınmaz Ticareti Yön., [2] Ön Ödemeli Konut Yön.).
 * Claim politikası: kesin getiri/yükseliş vaadi YOK; "yatırım tavsiyesi değildir" şerhi.
 */

function Kaynak({ n }: { n: number }) {
  return (
    <sup>
      <a
        href="#kaynaklar-baslik"
        className="ml-0.5 font-mono text-[10px] font-semibold text-teal-d no-underline hover:underline"
        aria-label={`Kaynak ${n}`}
      >
        [{n}]
      </a>
    </sup>
  );
}

export const toc: TocOge[] = [
  { id: "ozet", baslik: "Kısa cevap" },
  { id: "sifir-nedir", baslik: "Sıfır konut nedir?" },
  { id: "avantajlar", baslik: "Emlakçıya avantajları" },
  { id: "firsat", baslik: "Fırsat projesi nasıl anlaşılır?" },
  { id: "bolge", baslik: "Gelişen bölge sinyalleri" },
  { id: "musteri", baslik: "Yatırımcı müşteriye değer katmak" },
  { id: "ne-arar", baslik: "Emlakçı sahada ne arar?" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Sıfır konut satmak emlakçıya ne kazandırır?",
    c: "Geniş ve çeşitli stok, güncel fiyatla çalışma, opsiyonla korunan satış ve yatırımcı müşteriye değer katma imkânı sağlar. Doğru kurulduğunda ikinci el satışa göre daha ölçeklenebilir bir portföy sunar.",
  },
  {
    s: "Bir konut projesi 'fırsat' mı, nasıl anlaşılır?",
    c: "Konum, teslim ufku, geliştiricinin güvenilirliği, fiyat/metrekare kıyası ve ödeme koşulları birlikte değerlendirilir. Tek bir düşük fiyat 'fırsat' anlamına gelmez; toplam çerçeveye bakılır.",
  },
  {
    s: "Gelişen bölge nasıl belirlenir?",
    c: "Ulaşım ve altyapı yatırımları, imar planı değişiklikleri, nüfus ve talep hareketi, arz durumu ve fiyat trendi gibi sinyaller birlikte okunur. Bunlar değerlendirme sinyalidir, kesin getiri vaadi değildir.",
  },
  {
    s: "Emlakçı yatırım tavsiyesi verebilir mi?",
    c: "Emlak danışmanı, taşınmaza ilişkin bilgi ve değerlendirme sunar; ancak kesin getiri vaadi vermek doğru değildir. Nihai yatırım kararı müşteriye aittir; danışman doğru bilgiyle karar zeminini güçlendirir.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Sıfır (projeden) konut satmak emlak danışmanına dört şey kazandırır: <strong>geniş ve çeşitli
          stok, güncel fiyatla çalışma, opsiyonla korunan satış ve yatırımcı müşteriye değer katma
          imkânı.</strong> Doğru kurulduğunda, ikinci el satışa göre daha ölçeklenebilir bir portföy sunar.
          Bu rehber avantajları ve bir projeyi/bölgeyi değerlendirme çerçevesini emlakçı gözüyle açıklar.
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Geniş stok", etiket: "Çok daire, tek portföy", renk: "navy" },
          { deger: "Canlı fiyat", etiket: "Güncel değerden satış", renk: "teal" },
          { deger: "Opsiyon", etiket: "Satışı koruyan rezervasyon", renk: "amber" },
          { deger: "Yatırımcıya değer", etiket: "Doğru değerlendirme çerçevesi", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={Sparkles}>
        <p>
          İkinci el satışta danışman tek bir taşınmaza bağlıdır; sıfır konut satışında ise bir projenin
          onlarca dairesine erişebilir. Bu, portföyü büyütür ama iki şeye bağlıdır: <strong>doğru, güncel
          stok bilgisi</strong> ve <strong>bir projeyi/bölgeyi sağlıklı değerlendirebilme</strong>. İkisini
          birlikte ele alıyoruz.
        </p>
      </Bolum>

      <Bolum id="sifir-nedir" baslik="Sıfır konut nedir?" Ikon={Building2}>
        <p>
          <strong>Sıfır konut</strong>, hiç kullanılmamış, ilk el konuttur; çoğu zaman bir proje kapsamında,
          inşaat hâlinde (projeden) veya yeni tamamlanmış olarak satılır. Projeden satış, tüketici lehine özel
          kurallara tabi olan ön ödemeli konut satışı biçiminde yürüyebilir.<Kaynak n={2} /> Emlakçı için
          sıfır konut, tek bir daire değil, bir stok havuzu anlamına gelir.
        </p>
      </Bolum>

      <Bolum id="avantajlar" baslik="Emlakçıya avantajları" Ikon={TrendingUp}>
        <ul>
          <li><strong>Stok çeşitliliği:</strong> Tek projede farklı kat, cephe ve tipte çok daire; farklı bütçedeki müşteriye aynı projeden seçenek sunulur.</li>
          <li><strong>Güncel fiyatla çalışma:</strong> Fiyat tek kaynaktan canlı geldiğinde, müşteri önünde eski fiyatla zor durumda kalınmaz.</li>
          <li><strong>Opsiyonla korunan satış:</strong> Daire müşteri adına opsiyona alınınca, aynı daire başka danışmana aynı anda satılamaz.</li>
          <li><strong>Komisyon netliği:</strong> Hizmet bedeli ve paylaşımı yazılı sözleşmede belirlenir; hakediş baştan bellidir.<Kaynak n={1} /></li>
          <li><strong>Yatırımcı müşteriye değer:</strong> Doğru değerlendirme çerçevesiyle, yatırım amaçlı alıcıya güçlü bir danışman olunur.</li>
        </ul>
      </Bolum>

      <Bolum id="firsat" baslik="Fırsat projesi nasıl anlaşılır?" Ikon={Search}>
        <p>
          &quot;Fırsat&quot; tek bir düşük fiyat değildir; toplam çerçeveye bakılır. Bir projeyi değerlendirirken:
        </p>
        <SurecAkisi
          adimlar={[
            { baslik: "Konum ve erişim", aciklama: "Ulaşım, iş merkezlerine uzaklık, çevre donatıları. Konum, değerin en kalıcı bileşenidir." },
            { baslik: "Teslim ufku", aciklama: "Teslim ne zaman? Ön ödemeli satışta yasal teslim süresi en fazla 48 aydır; erken teslim riski azaltır." },
            { baslik: "Geliştirici güveni", aciklama: "Geliştiricinin geçmişi, teslim performansı ve doğrulanabilirliği." },
            { baslik: "Fiyat/m² kıyası", aciklama: "Aynı bölgedeki benzer projelerle metrekare fiyatı kıyası; ödeme planı koşulları." },
          ]}
        />
        <BolumGorsel
          src="/generated/rehber/eids-hero.jpg"
          alt="Bir emlak danışmanı, ofiste tablet üzerinde konut projesi konum ve fiyat verilerini değerlendirirken"
          caption="Fırsat, tek fiyat değil; konum, teslim, geliştirici ve fiyat/m² birlikte değerlendirilir (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="bolge" baslik="Gelişen bölge sinyalleri" Ikon={MapPin}>
        <p>
          Bir bölgenin gelişme potansiyeli tek bir veriden okunmaz; birkaç sinyal birlikte değerlendirilir:
        </p>
        <ul>
          <li><strong>Ulaşım ve altyapı yatırımları:</strong> Yeni metro, yol, köprü veya altyapı projeleri erişimi ve talebi değiştirir.</li>
          <li><strong>İmar planı değişiklikleri:</strong> Yeni imar kararları, yoğunluk ve kullanım biçimini etkiler.</li>
          <li><strong>Nüfus ve talep hareketi:</strong> Bölgeye göç, istihdam ve konut talebindeki yön.</li>
          <li><strong>Arz durumu:</strong> Bölgede devam eden proje sayısı ve tamamlanma hızı.</li>
          <li><strong>Fiyat trendi:</strong> Geçmiş dönem fiyat/m² hareketi (geçmiş performans geleceğin garantisi değildir).</li>
        </ul>
        <VurguKutusu tip="uyari" baslik="Bu bir yatırım tavsiyesi değildir">
          <p>
            Yukarıdakiler değerlendirme <strong>sinyalleridir</strong>, kesin getiri veya değer artışı vaadi
            değildir. Emlak danışmanı bilgi ve çerçeve sunar; nihai yatırım kararı ve sorumluluğu müşteriye
            aittir. Kesin kazanç, &quot;kesin yükselir&quot; gibi ifadelerden kaçının.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="musteri" baslik="Yatırımcı müşteriye değer katmak" Ikon={TrendingUp}>
        <p>
          Yatırım amaçlı alıcı, &quot;nereye&quot; kadar &quot;neden&quot; sorusunun cevabını arar. Danışman, yukarıdaki
          çerçeveyi somut verilerle (konum, teslim, fiyat/m², bölge sinyalleri) doldurarak müşterinin karar
          zeminini güçlendirir. Vaat değil, <strong>şeffaf değerlendirme</strong> güven kazandırır; bu güven
          tekrar eden iş ve referans getirir.
        </p>
      </Bolum>

      <Bolum id="ne-arar" baslik="Emlakçı sahada ne arar?" Ikon={RefreshCw}>
        <p>
          Sıfır konut satan danışmanın sahada aradığı üç şey nettir: <strong>doğru ve güncel stok</strong>{" "}
          (hangi daire müsait, hangisi opsiyonda, güncel fiyat), <strong>hızlı paylaşım</strong> (müşteriye
          tek dokunuşla doğru bilgi) ve <strong>korunan hakediş</strong> (kaydı ve opsiyonu net). Bu üçü
          sağlandığında danışman satışa, pazarlıkla değil bilgiyle girer.
        </p>
        <VurguKutusu tip="dogru" baslik="Bilgi doğruysa satış hızlanır">
          <p>
            Güncel fiyat, net opsiyon ve tahsisli stok; danışmanın müşteri önünde güvenle konuşmasını sağlar.
            Projedar bu üçünü ağ içinde canlı tutar: tek kaynak fiyat, granüler tahsis ve çift satış kalkanı.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={Building2}>
        <SenaryoKutusu baslik="Yatırımcı müşteri 'nereye alayım' diye soruyor">
          <p>
            Tek bir bölge önermek yerine değerlendirme çerçevesini paylaşın: konum, teslim, geliştirici,
            fiyat/m² ve bölge sinyalleri. Kararı müşteri verir; siz zemini güçlendirirsiniz. Kesin getiri
            vaadinden kaçının.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="'Bu proje fırsat mı' diye emin değilim">
          <p>
            Fiyatı tek başına değil; aynı bölgedeki benzer projelerle fiyat/m² kıyası, teslim ufku ve
            geliştirici güveniyle birlikte değerlendirin. Eksik veriyle &quot;fırsat&quot; demeyin.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={AlertTriangle}>
        <ul>
          <li>Tek düşük fiyata bakıp &quot;fırsat&quot; demek; toplam çerçeveyi atlamak.</li>
          <li>Müşteriye kesin getiri veya &quot;kesin yükselir&quot; vaadinde bulunmak.</li>
          <li>Eski fiyat veya eski teslim tarihiyle konuşmak.</li>
          <li>Daireyi opsiyona almadan birden fazla müşteriye söz vermek.</li>
          <li>Bölge sinyallerini tek veriye indirgemek (yalnız fiyat trendi gibi).</li>
        </ul>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
