import {
  Copy,
  AlertTriangle,
  GitBranch,
  Lock,
  Database,
  Radio,
  Users,
  Clock,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IcerikCTA } from "@/components/icerik/IcerikCTA";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { SurecAkisi } from "@/components/icerik/SurecAkisi";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { SenaryoKutusu } from "@/components/icerik/SenaryoKutusu";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Pillar: müşteri çakışması / çift satış (operasyonel eksen).
 *
 * Ayrıştırma (cannibalization önleme): bu sayfa "aynı DAİRENİN iki alıcıya
 * satılması" operasyonel problemini ve stok/opsiyon kilidini işler. Komisyon/
 * hakediş (aynı MÜŞTERİYİ iki danışman) ekseni ayrı sayfadadır
 * (rehber/musteri-kaydi-ve-hakedis-korumasi), bu pillar ona link verir.
 *
 * Çift satış kalkanı iddiası ürün gerçeğidir (kod-doğrulanmış): opsiyon üzerinde
 * "aynı birim için aynı anda tek aktif opsiyon" veritabanı düzeyinde zorlanır
 * (unique partial index). Mutlak dil (imkânsız/garanti) kullanılmaz; kapsam
 * "ağ içinde" olarak sınırlıdır. Ön ödemeli konut mevzuat iddiaları [1][2] atıflı.
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
  { id: "nedir", baslik: "Çift satış nedir?" },
  { id: "neden-tehlikeli", baslik: "Neden bu kadar tehlikeli?" },
  { id: "kaynak", baslik: "Çift satış nereden çıkar?" },
  { id: "opsiyon-kilidi", baslik: "Yapısal çözüm: opsiyon kilidi" },
  { id: "canli-stok", baslik: "Canlı tek kaynak stok" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Çift satış nedir?",
    c: "Çift satış, aynı konut biriminin (dairenin) birbirinden habersiz iki farklı alıcıya satışa açılması ya da satılmasıdır. Genellikle stok tek merkezde tutulmadığında, iki danışman aynı daireyi aynı anda müşterisine kapattığında ortaya çıkar.",
  },
  {
    s: "Aynı daire iki farklı alıcıya satılırsa ne olur?",
    c: "Bir alıcı mutlaka mağdur olur: kapora iade süreçleri, ön ödemeli konut satış sözleşmesinde cayma ve teslim yükümlülükleri devreye girer, müteahhidin itibarı zarar görür ve danışmanın müşteriyle güveni sarsılır. Sorun teknik değil, güven ve itibar sorunudur.",
  },
  {
    s: "Çift satış nasıl önlenir?",
    c: "Stoğun tek canlı kaynakta tutulması ve bir birim satışa kapatıldığında aynı birimin başka bir danışmana aynı anda açık kalmaması gerekir. Excel, WhatsApp ve telefonla dağınık takip bu kilidi sağlayamaz; kilit yapısal olmalıdır.",
  },
  {
    s: "Opsiyon süresi ne işe yarar?",
    c: "Opsiyon, bir danışmanın bir birimi belirli bir süre için satışa kapatıp alıcıyla süreci tamamlamasına imkân verir. Opsiyon aktifken aynı birim başka bir danışmana aynı anda açık kalmazsa, iki danışmanın aynı daireyi kapatması engellenir.",
  },
  {
    s: "Projedar çift satışı nasıl engelliyor?",
    c: "Projedar'da bir birim opsiyona alındığında, aynı birim ağ içinde aynı anda başka bir danışmana açık kalmaz. Bu kural uygulama koduna değil doğrudan veritabanına gömülüdür: aynı birim için aynı anda birden fazla aktif opsiyon veritabanı düzeyinde reddedilir. Böylece iki danışmanın aynı daireyi aynı anda satışa kapatması yapısal olarak engellenir.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Çift satış, aynı dairenin birbirinden habersiz iki alıcıya satışa açılmasıdır ve neredeyse her
          zaman <strong>stoğun dağınık tutulmasından</strong> doğar. Önlemenin yolu tek: stok tek canlı
          kaynakta olacak ve bir birim satışa kapatıldığında aynı birim başka bir danışmana{" "}
          <strong>aynı anda açık kalmayacak.</strong> Projedar bu kilidi opsiyon üzerinden ve veritabanı
          düzeyinde uygular: aynı birim için aynı anda birden fazla aktif opsiyon reddedilir.
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Tek aktif opsiyon", etiket: "Bir birim aynı anda tek danışmana kilitlenir", renk: "amber" },
          { deger: "Canlı tek kaynak", etiket: "Fiyat ve durum yalnız üründe tutulur", renk: "teal" },
          { deger: "Veritabanı kilidi", etiket: "Kilit uygulamaya değil, DB'ye gömülü", renk: "navy" },
          { deger: "14 gün cayma", etiket: "Ön ödemeli konut satış sözleşmesinde", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={Copy}>
        <p>
          Bir daire iki alıcıya satıldığında kaybeden yalnızca satış olmaz; müteahhidin itibarı, danışmanın
          müşterisiyle güveni ve alıcının projeye inancı birlikte zarar görür. Bu rehber çift satışın nereden
          çıktığını ve stok kilidiyle nasıl yapısal biçimde engellendiğini anlatır. Kimin hangi müşteriyi
          getirdiği, yani komisyon/hakediş tarafı ayrı bir konudur; onu{" "}
          <a href="/rehber/musteri-kaydi-ve-hakedis-korumasi" className="font-semibold text-teal-d underline decoration-teal/30 underline-offset-2 hover:decoration-teal">
            müşteri kaydı ve hak ediş koruması
          </a>{" "}
          rehberinde ele alıyoruz.
        </p>
      </Bolum>

      <Bolum id="nedir" baslik="Çift satış nedir?" Ikon={AlertTriangle}>
        <p>
          Çift satış, aynı konut biriminin iki farklı alıcıya satışa açılması ya da satılmasıdır. Çoğunlukla
          kötü niyetten değil, <strong>stok bilgisinin dağınık ve gecikmeli</strong> olmasından kaynaklanır:
          bir danışman daireyi telefonla kapatır, ikinci danışman bunu saatler sonra öğrenir, o sırada kendi
          alıcısına aynı daireyi çoktan teklif etmiştir.
        </p>
        <p>
          Projeden (sıfır) konut satışında risk daha da yüksektir. Satış, ön ödemeli konut satış sözleşmesiyle
          yapılır; sözleşme kurulduktan sonra aynı birimi ikinci bir alıcıya vermek, cayma, kapora iadesi ve
          teslim yükümlülükleriyle ağır bir sürece dönüşür.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="neden-tehlikeli" baslik="Neden bu kadar tehlikeli?" Ikon={AlertTriangle}>
        <ul>
          <li><strong>Alıcı mağduriyeti:</strong> İki alıcıdan biri mutlaka daireyi kaybeder; süreç kapora iadesi ve hukuki tartışmayla uzar.</li>
          <li><strong>Müteahhit itibarı:</strong> Tek bir çift satış, projenin bütün satış ağında güveni sarsar; bir daha aynı hızla danışman bulmak zorlaşır.</li>
          <li><strong>Danışman güveni:</strong> Kendi alıcısına satamayan danışman, bir daha o stoğa temkinli yaklaşır; ağ yavaşlar.</li>
          <li><strong>Yasal yük:</strong> Ön ödemeli konutta cayma hakkı ve teslim süresi kuralları, ikinci satışı çözülmesi güç bir yükümlülüğe çevirir.<Kaynak n={2} /></li>
        </ul>
        <VurguKutusu tip="uyari" baslik="Sorun teknik değil, güven sorunudur">
          <p>
            Çift satış tek seferlik bir hata gibi görünse de asıl zararı güvene verir. Bir müteahhidin en
            değerli varlığı, stoğunu hızlı ve tereddütsüz satışa açabildiği danışman ağıdır; o güven bir kez
            kırıldığında ağın hızı düşer.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="kaynak" baslik="Çift satış nereden çıkar?" Ikon={GitBranch}>
        <p>
          Kök neden neredeyse her zaman aynıdır: <strong>tek ve canlı bir stok kaynağının olmaması.</strong>{" "}
          Stok dağınık tutulduğunda çakışma kaçınılmaz hale gelir:
        </p>
        <ul>
          <li><strong>Dağınık takip:</strong> Stok Excel, WhatsApp grupları ve telefon arasında bölününce, iki danışman aynı anda farklı bilgiye bakar.</li>
          <li><strong>Gecikmeli güncelleme:</strong> Bir daire satıldığında bilgi ağa dakikalar değil saatler sonra ulaşır; o boşlukta ikinci satış başlar.</li>
          <li><strong>Opsiyon takibinin olmaması:</strong> Bir birimin kimin için, ne zamana kadar kapatıldığı yazılı ve merkezî değilse, aynı birim ikinci kez teklif edilir.</li>
          <li><strong>Fiyatın çok yerde kopyalanması:</strong> Fiyat ve durum farklı listelerde ayrı ayrı tutulunca, hangisinin güncel olduğu bile belirsizleşir.</li>
        </ul>
      </Bolum>

      <Bolum id="opsiyon-kilidi" baslik="Yapısal çözüm: opsiyon kilidi" Ikon={Lock}>
        <p>
          Çift satışı önlemenin tek sağlam yolu, engeli iyi niyete ya da hızlı mesajlaşmaya değil{" "}
          <strong>yapıya</strong> gömmektir. Projedar bunu opsiyon üzerinden yapar:
        </p>
        <SurecAkisi
          adimlar={[
            { baslik: "Danışman opsiyon alır", aciklama: "Bir danışman bir birimi belirli bir süre için satışa kapatır; süreç boyunca alıcısıyla ilerler." },
            { baslik: "Birim aynı anda kilitlenir", aciklama: "Opsiyon aktifken aynı birim, ağ içinde başka bir danışmana aynı anda açık kalmaz." },
            { baslik: "Süre biterse serbest kalır", aciklama: "Opsiyon tamamlanır ya da süresi dolarsa birim yeniden dağıtıma açılır; kimse bilgiyi elle güncellemek zorunda kalmaz." },
          ]}
        />
        <VurguKutusu tip="dogru" baslik="Kilit veritabanı düzeyindedir">
          <p>
            Projedar&apos;da bir birim opsiyona alındığında, aynı birim için aynı anda ikinci bir aktif opsiyon
            <strong> veritabanı düzeyinde reddedilir.</strong> Bu kural uygulama koduna bırakılmaz: iki danışman
            aynı saniyede aynı daireyi kapatmaya çalışsa bile, ağ içinde yalnızca biri opsiyonu alabilir. Kilit
            koda değil <Database size={13} strokeWidth={2} className="inline align-[-2px] text-teal-d" /> veritabanına
            gömülü olduğu için, uygulama katmanındaki bir hata bu korumayı devre dışı bırakamaz.
          </p>
        </VurguKutusu>
        <p>
          Bu koruma ağ içindeki satış akışını kapsar; ağın dışında, tamamen çevrimdışı yürütülen bir satış
          doğal olarak sistemin görüş alanında değildir. Amaç, stoğun ağ üzerinden dağıtıldığı her yerde
          çakışmayı yapısal olarak ortadan kaldırmaktır.
        </p>
      </Bolum>

      <Bolum id="canli-stok" baslik="Canlı tek kaynak stok" Ikon={Radio}>
        <p>
          Opsiyon kilidi ancak stok tek bir canlı kaynakta tutulursa anlam kazanır. Projedar&apos;da bir
          birimin fiyatı ve durumu <strong>yalnız tek yerde</strong> yaşar; danışman bir bilgiyi
          paylaştığında değer o canlı kaynaktan basılır, ayrı bir kopyadan değil.
        </p>
        <ul>
          <li><strong>Tek doğru kaynak:</strong> Fiyat ve müsaitlik durumu tek yerde; hiçbir listede ayrı bir kopyası tutulmaz.</li>
          <li><strong>Anında görünürlük:</strong> Bir birim satışa kapandığında, ona erişimi olan danışmanlar durumu gecikmesiz görür.</li>
          <li><strong>Tazelik işareti:</strong> Her güncelleme zaman damgalıdır; bilgi eskidikçe bunu görünür kılan sinyaller devreye girer, danışman güncel olmayan fiyatı paylaşmaz.</li>
        </ul>
        <p>
          Bu yapı, açık ilan portalı ile tahsisli ağ arasındaki farkın da özüdür; iki modeli{" "}
          <a href="/karsilastirma/ilan-portali-vs-tahsisli-ag" className="font-semibold text-teal-d underline decoration-teal/30 underline-offset-2 hover:decoration-teal">
            konut satış modelleri karşılaştırmasında
          </a>{" "}
          ayrıntılı ele alıyoruz.
        </p>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={Users}>
        <SenaryoKutusu baslik="İki danışman aynı daireyi aynı gün kapattı">
          <p>
            Stok dağınıkken bu kaçınılmazdır: biri telefonla, diğeri WhatsApp&apos;tan aynı daireyi müşterisine
            kapatır. Opsiyon kilidi olan bir yapıda ise ilk opsiyonu alan danışman birimi kilitler; ikinci
            danışman aynı anda o birime opsiyon alamaz ve daha en baştan başka bir seçeneğe yönlenir.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Daire satıldı ama bilgi geç yayıldı">
          <p>
            Dağınık takipte satış bilgisi ağa saatler sonra ulaşır; o boşlukta ikinci satış başlar. Canlı tek
            kaynakta ise durum satıldığı an değişir ve aynı birimi paylaşan herkes bunu gecikmesiz görür.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={Clock}>
        <ul>
          <li>Stoğu Excel, WhatsApp ve telefon arasında bölerek tek canlı kaynak tutmamak.</li>
          <li>Bir birimin kimin için, ne zamana kadar kapatıldığını yazılı ve merkezî tutmamak.</li>
          <li>Fiyat ve durumu birden çok listeye kopyalayıp hangisinin güncel olduğunu belirsiz bırakmak.</li>
          <li>Çift satış korumasını iyi niyete ve hızlı mesajlaşmaya güvenerek yapıya gömmemek.</li>
          <li>Projeden satışta opsiyon süresini ve cayma hakkı kurallarını baştan netleştirmemek.</li>
        </ul>
      </Bolum>

      <IcerikCTA seviye="strong" slug="musteri-cakismasi-cift-satis" />

      <IcerikFAQ sorular={faq} />
    </>
  );
}
