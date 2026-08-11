import {
  Share2,
  ShieldCheck,
  Instagram,
  Link2,
  AlertTriangle,
  Ban,
  MessageSquareText,
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
 * Rehber gövdesi: EİDS ve sosyal medyada ilan paylaşımı (EİDS kümesi kardeşi).
 * Ceza/kapsam iddiaları resmî kaynağa [n] atıflı (Ticaret Bakanlığı basın açıklaması [1],
 * EİDS yetki uygulaması [2]). Tutar/kural değişebilir; kaynak kontrolü damgada.
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
  { id: "kural", baslik: "Kural: ne paylaşılabilir?" },
  { id: "platformlar", baslik: "Hangi platformlar kapsamda?" },
  { id: "dogru-paylasim", baslik: "Doğru paylaşım nasıl yapılır?" },
  { id: "ceza", baslik: "Ceza ve denetim" },
  { id: "paylasilamaz", baslik: "Neyi paylaşamazsınız?" },
  { id: "senaryolar", baslik: "Örnek durumlar" },
  { id: "birebir-paylasim", baslik: "Birebir paylaşım ve tahsisli link" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          Sosyal medyada doğrudan ilan niteliğinde görsel veya metin paylaşmak risklidir. Ticaret
          Bakanlığı denetimleri sosyal medyayı da kapsar; işletmelerin yalnızca{" "}
          <strong>EİDS ile doğrulanmış ve resmî platformda yayımlanmış ilanın bağlantısını</strong>{" "}
          paylaşması beklenir.<Kaynak n={1} /> Aksi durumda her ihlal için{" "}
          <strong>286.206 TL’ye kadar</strong> idari para cezası uygulanabilir.<Kaynak n={1} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "286.206 ₺", etiket: "Doğrulanmamış paylaşım, her ihlal (üst sınır)", renk: "red" },
          { deger: "Doğrulanmış link", etiket: "Sosyal medyada paylaşılabilen tek biçim", renk: "teal" },
          { deger: "Tüm platformlar", etiket: "Instagram, Facebook, WhatsApp dahil elektronik ortam", renk: "amber" },
          { deger: "Denetim aktif", etiket: "Sosyal medya paylaşımları denetim kapsamında", renk: "navy" },
        ]}
      />

      <Bolum id="ozet" baslik="Kısa cevap" Ikon={ShieldCheck}>
        <p>
          Sosyal medyada emlak paylaşımı tamamen yasak değildir; ancak <strong>doğrudan ilan</strong>{" "}
          paylaşmak yerine, EİDS ile doğrulanmış ilanın <strong>bağlantısını</strong> paylaşmak esastır.
          Doğrulama olmadan yapılan doğrudan ilan paylaşımı ceza riski taşır.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="kural" baslik="Kural: sosyal medyada ne paylaşılabilir?" Ikon={Share2}>
        <p>
          EİDS düzenlemesiyle, taşınmaz ilanlarının yetkili kişilerce ve doğrulanmış biçimde verilmesi
          esastır. Sosyal medya, elektronik ortamda ilan verilen bir kanal olarak bu kapsamdadır.<Kaynak n={2} />
        </p>
        <ul>
          <li><strong>Paylaşılabilir:</strong> EİDS ile doğrulanmış ve resmî ilan platformunda yayımlanmış ilanın bağlantısı.</li>
          <li><strong>Riskli:</strong> Doğrudan fiyat, konum ve iletişim içeren ilan görseli veya metni (doğrulama olmadan).</li>
        </ul>
      </Bolum>

      <Bolum id="platformlar" baslik="Hangi platformlar kapsamda?" Ikon={Instagram}>
        <p>
          Denetimin kapsamı, elektronik ortamda ilan verilebilen tüm sosyal medya ve mesajlaşma
          kanallarını içerecek şekilde genişletilmiştir. Instagram, Facebook ve WhatsApp dahil elektronik
          ortamda verilen ilanlar bu kapsamdadır.<Kaynak n={1} />
        </p>
        <BolumGorsel
          src="/generated/rehber/eids-sosyal-medya.jpg"
          alt="Takım elbiseli bir profesyonel, telefonunda bir konut projesi görselini paylaşırken"
          caption="Sosyal medyada doğrudan ilan yerine, doğrulanmış ilanın bağlantısı paylaşılır (temsilî görsel)."
        />
      </Bolum>

      <Bolum id="dogru-paylasim" baslik="Doğru paylaşım nasıl yapılır?" Ikon={Link2}>
        <SurecAkisi
          adimlar={[
            { baslik: "İlanı doğrula", aciklama: "İlan, EİDS ile yetki doğrulaması yapılarak resmî platformda yayımlanır." },
            { baslik: "Bağlantıyı al", aciklama: "Doğrulanmış ilanın resmî bağlantısını (link) kopyalayın." },
            { baslik: "Bağlantıyı paylaş", aciklama: "Sosyal medyada doğrudan görsel/metin yerine bu bağlantıyı paylaşın." },
          ]}
        />
        <p>
          Bu akış, danışmanın sosyal medyada görünür kalmasını sağlarken doğrudan ilan paylaşımının
          getirdiği riski ortadan kaldırır.
        </p>
      </Bolum>

      <Bolum id="ceza" baslik="Ceza ve denetim" Ikon={AlertTriangle}>
        <VurguKutusu tip="uyari" baslik="Her ihlal ayrı ceza doğurabilir">
          <p>
            Sistem doğrulaması olmadan doğrudan ilan niteliğinde görsel veya metin paylaşan işletmelere,
            tespit edilen <strong>her ihlal için 286.206 TL’ye kadar</strong> idari para cezası
            uygulanabilir. Çok sayıda paylaşım, çok sayıda ihlal anlamına gelebilir.<Kaynak n={1} />
          </p>
        </VurguKutusu>
        <p>
          Ticaret Bakanlığı ayrıca yetkisiz işletmelerin ihbar edilebildiği bir modül üzerinden
          denetimi güçlendirmiştir.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="paylasilamaz" baslik="Neyi paylaşamazsınız?" Ikon={Ban}>
        <ul>
          <li>Doğrulama olmadan, fiyat ve iletişim içeren ilan görseli veya afişi.</li>
          <li>“Satılık/Kiralık” niteliğinde, ilan sayılabilecek doğrudan metin paylaşımı.</li>
          <li>Yetki belgesi ve EİDS doğrulaması olmadan yürütülen ilan faaliyeti.</li>
        </ul>
      </Bolum>

      <Bolum id="senaryolar" baslik="Örnek durumlar" Ikon={MessageSquareText}>
        <SenaryoKutusu baslik="Instagram story’de daire fotoğrafı ve fiyat paylaşmak">
          <p>
            Doğrulama olmadan doğrudan ilan niteliği taşıyan bir paylaşım risk oluşturur. Bunun yerine,
            doğrulanmış ilanın bağlantısını paylaşın; görsel kullanacaksanız doğrudan ilan yerine yönlendirici
            içerik tercih edin.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="WhatsApp durumunda ilan paylaşmak">
          <p>
            WhatsApp da elektronik ortamda ilan verilen bir kanal olarak değerlendirilebilir. Müşteriyle
            birebir iletişimde, doğrulanmış ilanın bağlantısını paylaşmak daha güvenli bir yaklaşımdır.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="birebir-paylasim" baslik="Birebir paylaşım ve tahsisli link" Ikon={Link2}>
        <p>
          Kamuya açık ilan paylaşımı ile müşteriye birebir gönderilen bağlantı farklı yaklaşımlardır.
          Birebir, yetkili ağ içinde ve doğrulanmış bir bağlantıyla yürütülen paylaşım, açık ilan
          paylaşımının getirdiği baskıdan daha az etkilenir. Bunun EİDS kapsamındaki nihai nitelemesi
          hukuki değerlendirmeye tabidir; işlem öncesi resmî kaynakları teyit edin.<Kaynak n={2} />
        </p>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={AlertTriangle}>
        <ul>
          <li>Doğrulanmış ilan bağlantısı yerine doğrudan ilan görseli/metni paylaşmak.</li>
          <li>WhatsApp ve mesajlaşma kanallarını denetim dışı sanmak.</li>
          <li>Bir paylaşımın “tek seferlik” olduğunu düşünüp çok sayıda ihlal riskini gözden kaçırmak.</li>
          <li>Yetki belgesi ve EİDS doğrulaması olmadan ilan faaliyeti yürütmek.</li>
        </ul>
      </Bolum>

      <IcerikFAQ
        sorular={[
          {
            s: "Sosyal medyada emlak ilanı paylaşmak yasak mı?",
            c: (
              <p>
                Tamamen yasak değildir; ancak doğrudan ilan yerine, EİDS ile doğrulanmış ve resmî platformda
                yayımlanmış ilanın bağlantısı paylaşılmalıdır. Doğrulama olmadan doğrudan ilan paylaşımı ceza
                riski taşır.
              </p>
            ),
          },
          {
            s: "Doğrulanmamış paylaşımın cezası nedir?",
            c: (
              <p>
                Doğrulama olmadan doğrudan ilan paylaşan işletmelere, tespit edilen her ihlal için 286.206
                TL’ye kadar idari para cezası uygulanabilir.
              </p>
            ),
          },
          {
            s: "WhatsApp’ta ilan paylaşmak kapsamda mı?",
            c: (
              <p>
                WhatsApp dahil elektronik ortamda ilan verilen kanallar denetim kapsamında değerlendirilebilir.
                Birebir iletişimde de doğrulanmış ilan bağlantısını paylaşmak daha güvenlidir.
              </p>
            ),
          },
          {
            s: "Sadece görsel paylaşsam, iletişim koymasam olur mu?",
            c: (
              <p>
                Görselin doğrudan ilan niteliği (fiyat, konum, satılık/kiralık ibaresi) taşıması riski
                sürdürür. En güvenli yol, doğrulanmış ilanın bağlantısını paylaşmaktır.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
