import {
  GitCompare,
  RefreshCw,
  ShieldCheck,
  Eye,
  Share2,
  Scale,
  Building2,
  Users,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { SenaryoKutusu } from "@/components/icerik/SenaryoKutusu";
import { BolumGorsel } from "@/components/icerik/IcerikGorsel";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Karşılaştırma gövdesi: açık ilan portalı modeli ile tahsisli profesyonel ağ modeli.
 * KATEGORİ-bazlı, rakip adı YOK. Dengeli: her modelin uygun olduğu ihtiyaç ayrı verilir.
 * Mevzuata değen noktalar atıflı (çift satış → bedelsiz dönme [1], ilan doğrulama/EİDS [2]).
 * Claim politikası: absolutist ifade yok ("imkânsız/%100" değil, "yapısal koruma").
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
  { id: "iki-model", baslik: "İki model kısaca" },
  { id: "fiyat", baslik: "Fiyat ve tazelik" },
  { id: "cift-satis", baslik: "Çift satış koruması" },
  { id: "gorunurluk", baslik: "Görünürlük ve tahsis" },
  { id: "dagitim", baslik: "Dağıtım ve erişim" },
  { id: "hangisi", baslik: "Hangisi hangi ihtiyaca uygun?" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "İlan portalı ile tahsisli ağ arasındaki temel fark nedir?",
    c: "İlan portalı, son kullanıcıya açık ilanların yayımlandığı bir pazaryeridir. Tahsisli ağ ise davetli, profesyoneller arası bir dağıtım katmanıdır; müteahhit kimin hangi projeyi göreceğini belirler ve stok tek canlı kaynakta tutulur.",
  },
  {
    s: "Çift satış hangi modelde daha iyi engellenir?",
    c: "Açık ilan modelinde çift satış çoğunlukla söze ve operasyona bağlıdır. Tahsisli ağ modelinde aktif opsiyon veritabanı seviyesinde kilitlenerek yapısal olarak korunur.",
  },
  {
    s: "Fiyat güncelliği hangi modelde daha güvenli?",
    c: "İlan portalında fiyat, ilan girildiği anda sabitlenir ve eskiyebilir. Tahsisli ağda fiyat tek kaynakta tutulur ve paylaşımda o anki canlı değerden basılır.",
  },
  {
    s: "İkisi birbirinin alternatifi mi?",
    c: "Zorunlu değil. İlan portalı geniş son kullanıcı erişimi için, tahsisli ağ ise çok danışmanlı proje stoğunun kontrollü dağıtımı için uygundur; farklı ihtiyaçlara hizmet ederler.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          <strong>İlan portalı</strong>, son kullanıcıya açık ilanların yayımlandığı bir pazaryeridir; geniş
          erişim sağlar ama fiyat ilan anında sabitlenir ve çift satış söze bağlıdır. <strong>Tahsisli ağ</strong>,
          davetli ve profesyoneller arası bir dağıtım katmanıdır; stok tek canlı kaynakta tutulur, kimin neyi
          göreceğini müteahhit belirler, aktif opsiyon veritabanı seviyesinde kilitlenir. İkisi farklı
          ihtiyaçlara hizmet eder.
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Açık pazaryeri", etiket: "İlan portalı: geniş son kullanıcı erişimi", renk: "navy" },
          { deger: "Davetli ağ", etiket: "Tahsisli ağ: profesyoneller arası dağıtım", renk: "teal" },
          { deger: "Canlı fiyat", etiket: "Tahsisli ağda tek kaynaktan basılır", renk: "amber" },
          { deger: "Yapısal kilit", etiket: "Çift satış veritabanı seviyesinde", renk: "red" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={Scale}>
        <p>
          Soru &quot;hangisi daha iyi&quot; değil, <strong>&quot;hangi işi yapıyorsun&quot;</strong> olmalıdır.
          Son kullanıcıya ulaşıp geniş talep toplamak istiyorsan ilan portalı; çok sayıda danışmanla bir
          projenin stoğunu doğru fiyat ve kontrolle dağıtmak istiyorsan tahsisli ağ modeli devreye girer. Bu
          karşılaştırma, ikisini beş boyutta karşılaştırır.
        </p>
      </Bolum>

      <Bolum id="iki-model" baslik="İki model kısaca" Ikon={GitCompare}>
        <ul>
          <li><strong>İlan portalı:</strong> Son kullanıcıya açık, ortak havuzda yayımlanan ilanlar. Amaç: geniş görünürlük ve talep toplama.</li>
          <li><strong>Tahsisli ağ:</strong> Davetli, profesyoneller arası dağıtım. Amaç: bir projenin stoğunu, fiyatını ve kime açık olduğunu tek noktadan kontrol ederek çok danışmana ulaştırmak.</li>
        </ul>
        <BolumGorsel
          src="/generated/rehber/eids-hero.jpg"
          alt="İki farklı çalışma modelini karşılaştıran bir gayrimenkul profesyoneli, ofiste ekran başında"
          caption="İki model rakip değil; farklı işleri çözer (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="fiyat" baslik="Fiyat ve tazelik" Ikon={RefreshCw}>
        <p>
          <strong>İlan portalı:</strong> Fiyat, ilan girildiği anda sabitlenir. Proje fiyatı değiştiğinde her
          ilanın elle güncellenmesi gerekir; güncellenmezse eski fiyat dolaşımda kalır.
        </p>
        <p>
          <strong>Tahsisli ağ:</strong> Fiyat tek kaynakta (birim kaydında) tutulur; paylaşımda o anki canlı
          değerden basılır. Böylece eski fiyat müşteri önüne çıkmaz. Her kayıtta görünür tazelik damgası bulunur.
        </p>
      </Bolum>

      <Bolum id="cift-satis" baslik="Çift satış koruması" Ikon={ShieldCheck}>
        <p>
          <strong>İlan portalı:</strong> Aynı dairenin iki danışman tarafından satılması çoğunlukla söze ve
          operasyona bağlı olarak önlenir; ortak havuzda kimin neyi opsiyonladığı net olmayabilir.
        </p>
        <p>
          <strong>Tahsisli ağ:</strong> Aktif opsiyon veritabanı seviyesinde kilitlenir; aynı daireye eşzamanlı
          ikinci aktif opsiyon açılamaz. Bu yalnız ticari değil hukuki bir konudur: bir konutun birden fazla
          tüketiciye satılması, tüketiciye sözleşmeden bedelsiz dönme hakkı verir.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="gorunurluk" baslik="Görünürlük ve tahsis" Ikon={Eye}>
        <p>
          <strong>İlan portalı:</strong> İlan yayımlandığında herkese açıktır; hedefli bir görünürlük kontrolü
          yoktur. İlan doğrulama kuralları (EİDS) bu alanda ayrıca gözetilir.<Kaynak n={2} />
        </p>
        <p>
          <strong>Tahsisli ağ:</strong> Görünürlük daire seviyesinde yönetilir; müteahhit belirli daireleri
          yalnız seçtiği danışmanlara açar. Kimin neyi gördüğü baştan bellidir.
        </p>
      </Bolum>

      <Bolum id="dagitim" baslik="Dağıtım ve erişim" Ikon={Share2}>
        <p>
          <strong>İlan portalı:</strong> Erişim geniştir; son kullanıcı doğrudan ilanı görür. Bu, tanıtım ve
          talep toplama için güçlüdür.
        </p>
        <p>
          <strong>Tahsisli ağ:</strong> Erişim davetli danışman ağıyla sınırlıdır; paylaşım birebir ve WhatsApp
          ile yapılır. Bu, bir projenin çok danışmanla kontrollü dağıtımı için güçlüdür.
        </p>
      </Bolum>

      <Bolum id="hangisi" baslik="Hangisi hangi ihtiyaca uygun?" Ikon={Building2}>
        <VurguKutusu tip="bilgi" baslik="İhtiyaca göre seç">
          <p>
            <strong>Geniş son kullanıcı erişimi</strong> ve talep toplama önceliğinse ilan portalı güçlüdür.{" "}
            <strong>Çok danışmanlı bir projenin stoğunu</strong> doğru fiyat, net tahsis ve çift satış koruması
            ile dağıtmak önceliğinse tahsisli ağ modeli bu işi yapısal olarak çözer. Çoğu müteahhit ikisini
            birlikte de kullanır: tanıtımı açık kanaldan, dağıtımı tahsisli ağdan.
          </p>
        </VurguKutusu>
        <p>
          Projedar, tahsisli ağ modelini kurar: canlı tek kaynak fiyat, granüler tahsis ve çift satış kalkanı.
          Bir ilan portalının yerine değil, onun çözmediği <strong>kontrollü, çok danışmanlı dağıtım</strong>{" "}
          ihtiyacı için konumlanır.
        </p>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={Users}>
        <SenaryoKutusu baslik="Proje fiyatı değişti; ilanlar hâlâ eski fiyatta">
          <p>
            Açık ilan modelinde her ilanın elle güncellenmesi gerekir; biri atlanırsa eski fiyat dolaşır.
            Tek kaynaktan canlı fiyat basan bir modelde bu sorun yapısal olarak azalır.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Aynı daireyi iki danışman sattı">
          <p>
            Ortak havuzda opsiyon net değilse bu olabilir ve tüketiciye bedelsiz dönme hakkı doğurur. Aktif
            opsiyonu veritabanı seviyesinde kilitleyen bir model, çakışmayı baştan engeller.<Kaynak n={1} />
          </p>
        </SenaryoKutusu>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
