import {
  Building2,
  ListChecks,
  ScrollText,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Users,
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
 * Rehber gövdesi: projeden (off-plan) konut satışı — danışman süreci + ön ödemeli
 * konut satışı yasal çerçevesi. Mevzuat iddiaları resmî kaynağa [n] atıflı
 * (Ticaret Bakanlığı bilgilendirme [1], Ön Ödemeli Konut Satışları Yönetmeliği [2]).
 * Süre/oran/şart değişebilir; kaynak kontrolü damgada, yürürlükteki metin esastır.
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
  { id: "nedir", baslik: "Projeden satış nedir?" },
  { id: "surec", baslik: "Danışman için satış süreci" },
  { id: "sozlesme", baslik: "Ön ödemeli konut satış sözleşmesi" },
  { id: "cayma", baslik: "Cayma ve dönme hakkı" },
  { id: "teslim", baslik: "Teslim süresi ve teminat" },
  { id: "riskler", baslik: "Danışmanın üç büyük riski" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

/** Görünür SSS + FAQPage schema (tek kaynak). */
export const faq = [
  {
    s: "Projeden (off-plan) konut satışı için yapı ruhsatı şart mı?",
    c: "Evet. Yapı ruhsatı alınmadan tüketiciyle ön ödemeli konut satış sözleşmesi yapılamaz. Bu, sözleşmenin geçerlilik şartıdır.",
  },
  {
    s: "Ön ödemeli konut satışında teslim süresi en fazla ne kadardır?",
    c: "Güncel düzenlemede devir veya teslim süresi sözleşme tarihinden itibaren en fazla 48 aydır. Bazı yönetmelik metinlerinde 36 ay geçtiği için yürürlükteki süreyi resmî kaynaktan teyit etmek gerekir.",
  },
  {
    s: "Tüketici cayma hakkını ne kadar sürede kullanabilir?",
    c: "Tüketici, sözleşmeden 14 gün içinde gerekçe göstermeden ve cezai şart ödemeden cayabilir; bildirimin bu süre içinde notere verilmesi yeterlidir.",
  },
  {
    s: "Aynı konut birden fazla kişiye satılırsa ne olur?",
    c: "Bir konutun birden fazla tüketiciye satılması, tüketiciye sözleşmeden bedelsiz dönme hakkı verir. Bu yüzden çift satışın önlenmesi hem hukuki hem ticari bir zorunluluktur.",
  },
  {
    s: "Danışman satış fiyatını nereden almalı?",
    c: "Fiyat, projenin tek doğru güncel kaynağından alınmalıdır. Eski listeden veya eski mesajdan alınan fiyat, müşteri önünde ve sözleşmede sorun yaratır.",
  },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Projeden (off-plan) konut satışı, henüz tamamlanmamış bir projedeki konutun tüketiciye ön
          ödemeli olarak satılmasıdır. Danışman açısından süreç dört adımdır: <strong>güncel ve doğru
          stok/fiyatı teyit et, müşteriyle eşleştir, yasal sözleşmeyi kur, teslime kadar takip et.</strong>{" "}
          Yasal çerçevede yapı ruhsatı şarttır, teslim süresi en fazla <strong>48 ay</strong>, tüketicinin{" "}
          <strong>14 gün</strong> cayma hakkı vardır.<Kaynak n={1} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "Yapı ruhsatı", etiket: "Sözleşme için ön şart", renk: "navy" },
          { deger: "En fazla 48 ay", etiket: "Teslim süresi (güncel düzenleme)", renk: "amber" },
          { deger: "14 gün", etiket: "Gerekçesiz cayma hakkı", renk: "teal" },
          { deger: "Bedelsiz dönme", etiket: "Çift satış halinde tüketici lehine", renk: "red" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={Building2}>
        <p>
          Projeden konut satışı, danışman için iki katmanlıdır: <strong>operasyon</strong> (doğru stok, güncel
          fiyat, müşteri eşleştirme, opsiyon) ve <strong>hukuk</strong> (ön ödemeli konut satış sözleşmesi ve
          tüketiciyi koruyan kurallar). İki katman da doğru yürütülmezse satış, teslime kadar geçen sürede
          çeşitli risklerle karşılaşır. Bu rehber ikisini birlikte açıklar.
        </p>
      </Bolum>

      <Bolum id="nedir" baslik="Projeden (off-plan) satış nedir?" Ikon={Building2}>
        <p>
          Projeden satış, inşaatı devam eden veya henüz başlamamış bir projedeki konutun, tamamlanmadan önce
          satılmasıdır. Tüketici bedeli peşin veya taksitle öder; konut ileride teslim edilir. Bu satış biçimi
          Türkiye&apos;de <strong>ön ödemeli konut satışı</strong> olarak düzenlenmiştir ve tüketici lehine özel
          koruma kurallarına tabidir.<Kaynak n={1} />
        </p>
        <p>
          Danışman için bu, hazır konut satışından farklıdır: satılan şey henüz fiziksel olarak yoktur, bu yüzden
          <strong> bilgi doğruluğu</strong> (fiyat, kat, cephe, teslim tarihi) ve <strong>sözleşmenin
          düzgünlüğü</strong> öne çıkar.
        </p>
      </Bolum>

      <Bolum id="surec" baslik="Danışman için satış süreci" Ikon={ListChecks}>
        <p>Pratik akış dört adımdır:</p>
        <SurecAkisi
          adimlar={[
            { baslik: "Stok ve fiyatı teyit et", aciklama: "Hangi daire müsait, hangisi opsiyonda, güncel fiyat ne? Bilgi tek doğru kaynaktan, canlı alınmalı." },
            { baslik: "Müşteriyle eşleştir", aciklama: "Bütçe, kat, cephe ve teslim beklentisine göre uygun daireyi öner; müşteriyi kaydet." },
            { baslik: "Opsiyon / rezervasyon", aciklama: "Uygun daire müşteri adına kısa süreli opsiyona alınır; bu süre çift satışı önlemek için kritiktir." },
            { baslik: "Sözleşme ve takip", aciklama: "Ön ödemeli konut satış sözleşmesi kurulur; teslime kadar süreç takip edilir." },
          ]}
        />
        <BolumGorsel
          src="/generated/rehber/eids-hero.jpg"
          alt="Bir gayrimenkul danışmanı, ofiste tablet üzerinde konut projesi planını müşteriye gösterirken"
          caption="Projeden satışta danışmanın en kritik girdisi, güncel ve doğru stok/fiyat bilgisidir (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="sozlesme" baslik="Ön ödemeli konut satış sözleşmesi" Ikon={ScrollText}>
        <p>
          Ön ödemeli konut satışında sözleşmenin geçerliliği belirli şartlara bağlıdır:<Kaynak n={2} />
        </p>
        <ul>
          <li><strong>Yapı ruhsatı:</strong> Yapı ruhsatı alınmadan tüketiciyle ön ödemeli konut satış sözleşmesi yapılamaz.</li>
          <li><strong>Şekil şartı:</strong> Satış, tapu siciline tescil edilir; satış vaadi sözleşmesi ise noterde düzenleme şeklinde yapılır.</li>
          <li><strong>Ön bilgilendirme:</strong> Tüketiciye, sözleşmenin kurulmasından en az bir gün önce Bakanlıkça belirlenen bilgileri içeren ön bilgilendirme formu verilir.<Kaynak n={1} /></li>
        </ul>
        <VurguKutusu tip="bilgi" baslik="Danışmanın rolü">
          <p>
            Danışman sözleşmeyi tek başına kurmaz; ancak sürecin doğru işlemesi (ruhsat var mı, fiyat güncel mi,
            hangi daire tahsis edildi) danışmanın verdiği bilginin doğruluğuna bağlıdır. Yanlış bilgi, sözleşme
            aşamasında ortaya çıkar ve güven kaybına yol açar.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="cayma" baslik="Cayma ve dönme hakkı" Ikon={RotateCcw}>
        <p>
          Tüketicinin iki ayrı hakkı vardır ve karıştırılmamalıdır:<Kaynak n={2} />
        </p>
        <ul>
          <li>
            <strong>Cayma hakkı (14 gün):</strong> Tüketici, sözleşmeden 14 gün içinde gerekçe göstermeden ve
            cezai şart ödemeden cayabilir; bildirimin bu süre içinde notere verilmesi yeterlidir.
          </li>
          <li>
            <strong>Dönme hakkı (teslime kadar):</strong> Tüketici, devir veya teslime kadar sözleşmeden
            dönebilir. Bu durumda satıcı, vergi ve harç gibi yasal masraflar ile sözleşme bedelinin yüzde
            ikisine kadar tazminat isteyebilir.
          </li>
        </ul>
        <p>
          Bazı hallerde tüketici <strong>hiçbir bedel ödemeden</strong> döner; bunların biri doğrudan satış
          disiplinini ilgilendirir: <strong>bir konutun birden fazla tüketiciye satılması.</strong> Yani çift
          satış, yalnız ticari değil hukuki bir sorundur ve tüketici lehine sonuç doğurur.<Kaynak n={2} />
        </p>
      </Bolum>

      <Bolum id="teslim" baslik="Teslim süresi ve teminat" Ikon={Clock}>
        <p>
          Güncel düzenlemede devir veya teslim süresi, sözleşme tarihinden itibaren <strong>en fazla 48
          aydır</strong>; taraflar daha kısa bir süre üzerinde anlaşabilir ve satıcı bu süreyle bağlı olur.
          Bazı yönetmelik metinlerinde süre 36 ay olarak geçtiğinden, yürürlükteki süreyi resmî kaynaktan teyit
          etmek gerekir.<Kaynak n={1} />
        </p>
        <p>
          Belirli büyüklüğün üzerindeki projelerde satıcının, satışa başlamadan önce <strong>bina tamamlama
          sigortası</strong> yaptırması veya Bakanlıkça belirlenen diğer teminatı sağlaması zorunludur. Bu
          teminatlar, iflas veya haciz gibi durumlara karşı koruma altındadır.<Kaynak n={2} />
        </p>
        <VurguKutusu tip="uyari" baslik="Teslim tarihi bir taahhüttür">
          <p>
            Danışmanın müşteriye söylediği teslim tarihi, projenin resmî taahhüdüyle uyumlu olmalıdır. Sahada
            dolaşan eski bir teslim tarihi, müşteri beklentisini yanlış kurar ve sonradan güven sorununa döner.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="riskler" baslik="Danışmanın üç büyük riski" Ikon={AlertTriangle}>
        <p>Projeden satışta danışmanı en çok zorlayan üç nokta ve neden önemli olduğu:</p>
        <ul>
          <li><strong>Eski fiyat:</strong> Eski listeden veya eski mesajdan alınan fiyat müşteri önünde bozulur; sözleşme aşamasında düzeltme güveni sarsar.</li>
          <li><strong>Çift satış:</strong> Aynı dairenin iki müşteriye söz verilmesi, tüketiciye bedelsiz dönme hakkı doğurur ve iki tarafı da kaybettirir.<Kaynak n={2} /></li>
          <li><strong>Dağınık stok:</strong> Hangi dairenin müsait, hangisinin opsiyonda olduğunun net olmaması, hem yanlış vaade hem zaman kaybına yol açar.</li>
        </ul>
        <VurguKutusu tip="dogru" baslik="Bu üç risk aynı kökten gelir">
          <p>
            Üçü de <strong>tek doğru, güncel ve tahsisli bir stok kaynağı</strong> olmadığında büyür. Fiyat ve
            durumun tek yerde canlı tutulması, kime hangi dairenin açık olduğunun net olması ve aktif opsiyonun
            kilitlenmesi bu riskleri yapısal olarak azaltır. Projedar tam olarak bu disiplini kurar: canlı tek
            kaynak, granüler tahsis ve çift satış kalkanı.
          </p>
        </VurguKutusu>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={Users}>
        <SenaryoKutusu baslik="Müşteriye verdiğim fiyat, sözleşmede farklı çıktı">
          <p>
            Fiyat büyük olasılıkla güncel kaynaktan alınmadı. Her teklifte fiyatı projenin canlı, tek doğru
            kaynağından teyit edin; eski liste veya eski mesajdaki değeri kullanmayın.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Aynı daireyi başka bir danışman da satmış">
          <p>
            Çift satış, tüketiciye bedelsiz dönme hakkı verir ve iki tarafı da mağdur eder. Daire müşteri adına
            kısa süreli opsiyona alınmadan ilerlenmemeli; opsiyonun tek merkezde kilitlenmesi bunu önler.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={ShieldCheck}>
        <ul>
          <li>Yapı ruhsatı olmadan satış sözleşmesine ilerlemek.</li>
          <li>Cayma hakkı (14 gün) ile teslime kadar dönme hakkını karıştırmak.</li>
          <li>Eski fiyat veya eski teslim tarihiyle müşteri beklentisini yanlış kurmak.</li>
          <li>Daireyi opsiyona almadan birden fazla müşteriye söz vermek (çift satış riski).</li>
          <li>Ön bilgilendirme formu ve sözleşme şekil şartlarını atlamak.</li>
        </ul>
      </Bolum>

      <IcerikFAQ sorular={faq} />
    </>
  );
}
