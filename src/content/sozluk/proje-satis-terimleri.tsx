import {
  BookOpen,
  Lock,
  LayoutGrid,
  Wallet,
  TrendingUp,
  Building2,
  Percent,
  ScrollText,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Sözlük gövdesi: proje/konut satış terimleri (opsiyon, tahsis, kapora, şerefiye,
 * kat irtifakı/mülkiyeti, hizmet bedeli). Mevzuata değen tanımlar resmî kaynağa [n]
 * atıflı (Taşınmaz Ticareti Yönetmeliği [1], Ön Ödemeli Konut Yönetmeliği [2]).
 * Sektör terimleri tanımı pratiktir; hukuki niteleme sözleşme/duruma göre değişir.
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
  { id: "opsiyon", baslik: "Opsiyon" },
  { id: "tahsis", baslik: "Tahsis" },
  { id: "kapora", baslik: "Kapora" },
  { id: "serefiye", baslik: "Şerefiye" },
  { id: "kat-irtifaki", baslik: "Kat irtifakı ve kat mülkiyeti" },
  { id: "hizmet-bedeli", baslik: "Hizmet bedeli (hakediş)" },
  { id: "on-odemeli", baslik: "Ön ödemeli konut satışı" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Emlakta opsiyon ne demek?",
    c: "Opsiyon, bir dairenin belirli bir süre boyunca bir alıcı adına satıştan çekilerek rezerve edilmesidir. Süre boyunca o daire başka bir alıcıya satılamaz.",
  },
  {
    s: "Tahsis ne anlama gelir?",
    c: "Tahsis, müteahhidin belirli daireleri veya projeleri yalnız seçtiği danışmanlara açmasıdır; kimin neyi göreceğini müteahhit belirler.",
  },
  {
    s: "Kapora ile kaparo aynı şey mi?",
    c: "Halk arasında ikisi de kullanılır; alıcının satın alma niyetini göstermek için verdiği ön ödemedir. Hukuki niteliği (cayma parası mı, pey akçesi mi) sözleşmeye göre değişir.",
  },
  {
    s: "Şerefiye neye göre belirlenir?",
    c: "Şerefiye, bir dairenin kat, cephe, manzara ve konum gibi üstünlükleri nedeniyle taban fiyata eklenen değer farkıdır.",
  },
  {
    s: "Kat irtifakı ile kat mülkiyeti farkı nedir?",
    c: "Kat irtifakı henüz tamamlanmamış yapıdaki bağımsız bölüm için, kat mülkiyeti ise tamamlanmış yapıdaki bağımsız bölümün mülkiyeti için kurulur.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Proje ve konut satışında en çok karıştırılan terimler: <strong>opsiyon</strong> (süreli rezervasyon),{" "}
          <strong>tahsis</strong> (müteahhidin daireyi seçili danışmana açması), <strong>kapora</strong> (alıcının
          niyet ön ödemesi), <strong>şerefiye</strong> (kat/cephe/manzara değer farkı). Bu sözlük, danışmanın
          sahada kullandığı terimleri net tanımlarla açıklar.
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Opsiyon", etiket: "Süreli rezervasyon", renk: "amber" },
          { deger: "Tahsis", etiket: "Seçili danışmana açma", renk: "teal" },
          { deger: "Kapora", etiket: "Niyet ön ödemesi", renk: "navy" },
          { deger: "Şerefiye", etiket: "Konum/kat değer farkı", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={BookOpen}>
        <p>
          Aşağıdaki terimler proje satışında günlük kullanılır; ama yanlış anlaşıldığında müşteri önünde
          hataya ve hakediş anlaşmazlığına yol açar. Her terim, pratik tanımıyla ve gerektiğinde mevzuat
          bağlantısıyla verilmiştir.
        </p>
      </Bolum>

      <Bolum id="opsiyon" baslik="Opsiyon" Ikon={Lock}>
        <p>
          <strong>Opsiyon</strong>, bir dairenin belirli bir süre boyunca bir alıcı adına satıştan çekilerek
          rezerve edilmesidir. Süre boyunca o daire başka bir alıcıya satılamaz. Opsiyonun net ve tek merkezde
          tutulması, çift satışı önlemenin en pratik yoludur: aynı daireye aynı anda ikinci bir aktif opsiyon
          açılmamalıdır.
        </p>
      </Bolum>

      <Bolum id="tahsis" baslik="Tahsis" Ikon={LayoutGrid}>
        <p>
          <strong>Tahsis</strong>, müteahhidin belirli daireleri veya projeleri yalnız seçtiği danışmanlara
          açmasıdır. Tahsis daire seviyesinde yönetilebilir: tüm proje, tek blok ya da seçili daireler
          belirlenen danışman ve ofislere açılır. Kimin neyi göreceğini müteahhit belirler.
        </p>
      </Bolum>

      <Bolum id="kapora" baslik="Kapora" Ikon={Wallet}>
        <p>
          <strong>Kapora</strong> (halk arasında kaparo), alıcının satın alma niyetini göstermek için verdiği
          ön ödemedir. Hukuki niteliği duruma göre değişir: pey akçesi mi, cayma parası mı olduğu ve iade
          koşulları taraflar arasındaki sözleşmeye bağlıdır. Bu yüzden kaporanın koşulları yazılı olarak
          netleştirilmelidir.
        </p>
        <VurguKutusu tip="bilgi" baslik="Kaporayı sözleşmeye bağlayın">
          <p>
            &quot;Kapora yandı / iade edilir&quot; tartışmaları çoğu zaman yazılı koşul olmadığı için çıkar.
            Tutarı, iade şartını ve hangi işleme mahsup edileceğini baştan yazın.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="serefiye" baslik="Şerefiye" Ikon={TrendingUp}>
        <p>
          <strong>Şerefiye</strong>, bir dairenin kat, cephe, manzara ve konum gibi üstünlükleri nedeniyle
          taban fiyata eklenen değer farkıdır. Aynı metrekaredeki iki daire, şerefiye nedeniyle farklı
          fiyatlanabilir. Danışman, şerefiye farkını müşteriye somut gerekçelerle (yükseklik, cephe yönü,
          manzara) açıklayabilmelidir.
        </p>
      </Bolum>

      <Bolum id="kat-irtifaki" baslik="Kat irtifakı ve kat mülkiyeti" Ikon={Building2}>
        <p>
          <strong>Kat irtifakı</strong>, henüz tamamlanmamış (inşaat hâlindeki) bir yapıdaki bağımsız bölüm
          için tapuda kurulan haktır. <strong>Kat mülkiyeti</strong> ise tamamlanmış yapıdaki bağımsız bölümün
          ayrı mülkiyetidir. Projeden satışta çoğu zaman önce kat irtifakı bulunur; yapı tamamlanınca kat
          mülkiyetine geçilir. Müşteriye teslim ve tapu sürecini anlatırken bu ayrım önemlidir.
        </p>
      </Bolum>

      <Bolum id="hizmet-bedeli" baslik="Hizmet bedeli (hakediş)" Ikon={Percent}>
        <p>
          <strong>Hizmet bedeli</strong>, danışmanın aracılık hizmetinin karşılığıdır (halk arasında komisyon).
          Alım satımda hizmet bedeli, aracılık sözleşmesindeki satış bedelinin KDV hariç en fazla{" "}
          <strong>yüzde 4</strong>&apos;üdür; talep edebilmek için yetki belgesi ve yazılı yetkilendirme
          sözleşmesi gerekir.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="on-odemeli" baslik="Ön ödemeli konut satışı" Ikon={ScrollText}>
        <p>
          <strong>Ön ödemeli konut satışı</strong>, konut teslim edilmeden önce bedelin peşin veya taksitle
          ödendiği satıştır. Tüketici lehine özel kurallara tabidir: yapı ruhsatı şarttır, teslim süresi en
          fazla 48 aydır ve tüketicinin 14 gün cayma hakkı vardır.<Kaynak n={2} />
        </p>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
