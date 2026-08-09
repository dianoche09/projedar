import {
  CalendarClock,
  ShieldCheck,
  Users,
  ClipboardCheck,
  KeyRound,
  Building2,
  Share2,
  FileText,
  MessageSquareText,
  AlertTriangle,
} from "lucide-react";
import { AnswerFirst } from "@/components/icerik/AnswerFirst";
import { Bolum } from "@/components/icerik/Bolum";
import { GuncelDurumTablosu } from "@/components/icerik/GuncelDurumTablosu";
import { SenaryoKutusu } from "@/components/icerik/SenaryoKutusu";
import { IcerikFAQ } from "@/components/icerik/IcerikFAQ";
import { IstatistikSerit } from "@/components/icerik/IstatistikSerit";
import { SurecAkisi } from "@/components/icerik/SurecAkisi";
import { VurguKutusu } from "@/components/icerik/VurguKutusu";
import { BolumGorsel } from "@/components/icerik/IcerikGorsel";
import type { TocOge } from "@/components/icerik/IcerikToc";

/**
 * Pilot içerik gövdesi: EİDS emlak danışmanı rehberi (hub).
 *
 * Tarih/ceza/zorunluluk gibi tüm mevzuat iddiaları resmî kaynaklara dayanır
 * (KaynakBlok'taki numaralara [n] ile atıf). Uydu konular (sosyal medya, yetki
 * belgesi başvurusu, yetki sözleşmesi karşılaştırması) burada TÜKETİLMEZ;
 * özetlenir, derinleşme ayrı sayfalara bırakılır.
 *
 * Görsel zenginlik: hero (layout'ta) + bölüm görselleri + veri-görsel modüller
 * (KPI şeridi, süreç akışı, sinyal uyarısı) + bölüm ikonları.
 */

/** Kaynak referansı — alttaki "Resmî kaynaklar" bölümüne götürür. */
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
  { id: "guncel-durum", baslik: "2026 güncel durum" },
  { id: "eids-nedir", baslik: "EİDS nedir?" },
  { id: "kimleri-ilgilendirir", baslik: "Kimleri ilgilendirir?" },
  { id: "danisman-sureci", baslik: "Danışman açısından süreç" },
  { id: "yetkilendirme", baslik: "Yetkilendirme nasıl işler?" },
  { id: "yeni-konut", baslik: "Sıfır konut projelerinde dikkat" },
  { id: "sosyal-medya", baslik: "Sosyal medya ve paylaşım" },
  { id: "yetki-sozlesmesi-farki", baslik: "Yetki sözleşmesinden farkı" },
  { id: "senaryolar", baslik: "Danışman senaryoları" },
  { id: "sik-hatalar", baslik: "Sık yapılan hatalar" },
];

export function Govde() {
  return (
    <>
      <AnswerFirst>
        <p>
          EİDS (Elektronik İlan Doğrulama Sistemi), taşınmaz ilanlarının yetkili kişilerce
          verildiğini e-Devlet üzerinden doğrulayan resmî sistemdir. <strong>1 Şubat 2026</strong>{" "}
          tarihinden itibaren satılık konut dahil tüm satılık taşınmaz ilanlarında yetki doğrulaması
          zorunludur; kiralık ilanlarda bu zorunluluk 1 Ocak 2025’ten beri geçerlidir.
          <Kaynak n={1} /> Doğrulama yapılmadan ilan yayımlayan işletmelere idari para cezası
          uygulanır.
          <Kaynak n={2} />
        </p>
      </AnswerFirst>

      <IstatistikSerit
        ogeler={[
          { deger: "1 Şub 2026", etiket: "Satılık ilanlarda zorunlu", renk: "amber" },
          { deger: "286.206 ₺", etiket: "Doğrulanmamış sosyal medya paylaşımı, her ihlal (üst sınır)", renk: "red" },
          { deger: "3 ay", etiket: "En az yetki süresi", renk: "teal" },
          { deger: "e-Devlet", etiket: "Yetkilendirme kanalı", renk: "navy" },
        ]}
      />

      <Bolum id="guncel-durum" baslik="2026 güncel durum" Ikon={CalendarClock}>
        <GuncelDurumTablosu
          baslik="EİDS uygulama takvimi ve temel kurallar"
          kolonlar={["Konu", "Durum"]}
          satirlar={[
            ["Kimlik doğrulama", "1 Kasım 2023’ten beri"],
            ["Yetki doğrulama (2. faz)", "15 Eylül 2024’ten beri"],
            ["Kiralık ilanlarda zorunlu", "1 Ocak 2025"],
            ["Satılık ilanlarda zorunlu", "1 Şubat 2026"],
            ["Yetkilendirme kanalı", "e-Devlet"],
            ["Yetki süresi", "En az 3 ay"],
            ["Sosyal medya paylaşımı", "Yalnızca doğrulanmış resmî ilan bağlantısı"],
            ["Doğrulanmamış paylaşım", "Her ihlal için 286.206 TL’ye kadar idari para cezası"],
          ]}
          dipnot="Kaynak kontrolü: 9 Ağustos 2026. Tutar ve tarihler değişebilir; işlem öncesi aşağıdaki resmî kaynakları teyit edin."
        />
        <p>
          Tablo, danışmanın günlük işini doğrudan etkileyen noktaları özetler. Aşağıdaki bölümler her
          maddeyi, sahadaki karşılığıyla açıklar.
        </p>
      </Bolum>

      <Bolum id="eids-nedir" baslik="EİDS nedir?" Ikon={ShieldCheck}>
        <p>
          EİDS, Ticaret Bakanlığı bünyesinde kurulan ve taşınmaz ilanı yayımlamak isteyen kişilerin
          kimliğini ve ilanı verme yetkisini elektronik ortamda doğrulayan sistemdir.<Kaynak n={1} />{" "}
          Amaç, sahte ilanların, gerçek olmayan portföylerin ve yetkisiz aracılık faaliyetinin önüne
          geçmektir.
        </p>
        <p>
          Sistem iki katmanlı çalışır. Birincisi <strong>kimlik doğrulama</strong>: ilanı veren
          kişinin kim olduğunun teyidi. İkincisi <strong>yetki doğrulama</strong>: bu kişinin o
          taşınmaz için ilan verme yetkisinin olup olmadığının teyidi. Satılık taşınmazlarda ikinci
          katman 1 Şubat 2026’dan itibaren zorunludur.<Kaynak n={1} />
        </p>
        <p>
          Uygulamada bu, şu anlama gelir: Taşınmaz Ticareti Yetki Belgesi bulunmayan bir işletme ilan
          giremez; yetki belgesi olan işletme de yalnızca kendisine e-Devlet üzerinden yetki verilmiş
          taşınmazlar için ilan yayımlayabilir.
        </p>
      </Bolum>

      <Bolum id="kimleri-ilgilendirir" baslik="Kimleri ilgilendirir?" Ikon={Users}>
        <p>Sistem, taşınmaz ilanı yayımlayan hemen herkesi kapsar:</p>
        <ul>
          <li>
            <strong>Emlak işletmeleri ve gayrimenkul danışmanları:</strong> yetki belgesi ve
            taşınmaz bazında yetkilendirme olmadan ilan veremez.
          </li>
          <li>
            <strong>Proje ve sıfır konut satış danışmanları:</strong> müteahhidin veya proje
            sahibinin verdiği ticari satış yetkisi ile EİDS yetkisi ayrı kavramlardır; ilan
            yayımlanacaksa EİDS yetkisi de gerekir.
          </li>
          <li>
            <strong>Taşınmaz sahipleri:</strong> kendi taşınmazları için ilan verebilir; eş ile 1. ve
            2. derece kan hısımları da kendi taşınmazlarıyla ilgili ilan verebilir.
          </li>
        </ul>
        <p>
          Hisseli taşınmazlarda tüm hissedarların yetki vermesi gerekmez; tek bir hissedarın EİDS
          yetkisi vermesi ilan için yeterli olabilir.<Kaynak n={1} />
        </p>
      </Bolum>

      <Bolum id="danisman-sureci" baslik="Emlak danışmanı açısından süreç" Ikon={ClipboardCheck}>
        <p>
          Bir danışman için pratik akış, bir taşınmazı ilana çıkarmadan önce iki koşulun sağlanmasına
          dayanır: işletmenin yetki belgesinin olması ve ilgili taşınmaz için sahibinden EİDS yetkisi
          alınmış olması.
        </p>
        <ul>
          <li>Taşınmaz sahibiyle çalışma koşullarını netleştirin.</li>
          <li>Sahibin e-Devlet üzerinden işletmenizi ilgili taşınmaz için yetkilendirmesini sağlayın.</li>
          <li>Yetki tanımlandıktan sonra ilanı doğrulanmış olarak yayımlayın.</li>
          <li>İlanda sistemin ürettiği doğrulama bilgisini (kod/QR) görünür tutun.<Kaynak n={1} /></li>
        </ul>
        <p>
          Bu akış, danışmanın “bu portföyü ilana çıkarabilir miyim?” sorusuna işlem öncesinde net
          cevap vermesini gerektirir. Yetki alınmadan yapılan yayın, hem ilan platformunda hem sosyal
          medyada risk oluşturur.
        </p>
      </Bolum>

      <Bolum id="yetkilendirme" baslik="Yetkilendirme nasıl işler?" Ikon={KeyRound}>
        <p>
          Yetkilendirme e-Devlet üzerinden yapılır. Taşınmaz sahibi, ilgili hizmet üzerinden
          çalışacağı emlak işletmesini o taşınmaz için tanımlar. Verilen yetki belirli bir süre için
          geçerlidir; yetki süresi en az 3 ay olarak belirlenir ve bu süre boyunca işletme o taşınmaz
          için ilan yayımlayabilir.<Kaynak n={3} />
        </p>
        <SurecAkisi
          adimlar={[
            { baslik: "Koşullar netleşir", aciklama: "Danışman ile taşınmaz sahibi çalışma koşullarını belirler." },
            { baslik: "e-Devlet’ten yetki", aciklama: "Sahip, işletmeyi ilgili taşınmaz için yetkilendirir." },
            { baslik: "Doğrulama bilgisi", aciklama: "Taşınmaza özgü kod/QR oluşur." },
            { baslik: "İlan yayımlanır", aciklama: "İlan doğrulanmış olarak yayına alınır." },
          ]}
        />
        <BolumGorsel
          src="/generated/rehber/eids-edevlet.jpg"
          alt="Bir dizüstü bilgisayar ekranında dijital doğrulama kalkanı ve onay işareti, yanında telefon tutan el"
          caption="Yetkilendirme ve doğrulama e-Devlet üzerinden, taşınmaz bazında yapılır (temsilî görsel)."
        />
        <p>
          Yetkilendirme işlemi tamamlandığında, taşınmaza özgü doğrulama bilgisi oluşur ve ilanların
          bu bilgiyle yayımlanması beklenir. Yetki süresinin dolması, işletmenin o taşınmaz için ilan
          verme hakkını sonlandırır. Taşınmaz Ticareti Yetki Belgesi başvurusu ise ayrı bir süreçtir;
          bu rehber EİDS yetkilendirmesine odaklanır.
        </p>
      </Bolum>

      <Bolum id="yeni-konut" baslik="Sıfır konut projelerinde dikkat edilmesi gerekenler" Ikon={Building2}>
        <p>
          Yeni ve sıfır konut projelerinde danışmanın en çok karıştırdığı nokta, iki farklı yetkinin
          aynı sanılmasıdır:
        </p>
        <ul>
          <li>
            <strong>Ticari satış yetkisi:</strong> müteahhit veya proje sahibinin, belirli bağımsız
            bölümleri belirli danışmanlara/ofislere satması için verdiği izin. Bu, tarafların
            aralarındaki ticari düzenlemedir.
          </li>
          <li>
            <strong>EİDS yetkisi:</strong> ilan yayımlamak için gereken, e-Devlet üzerinden taşınmaz
            bazında verilen resmî doğrulama.
          </li>
        </ul>
        <p>
          Projeden konut satan bir danışman, elinde ticari satış yetkisi olsa dahi bir ilan
          yayımlayacaksa EİDS tarafını da gözetmelidir. Tapusu henüz oluşmamış bağımsız bölümler,
          kampanya ve fiyat değişiklikleri gibi durumlar bu tabloyu karmaşıklaştırabilir; bu nedenle
          proje bazında sürecin baştan netleştirilmesi önerilir.
        </p>
      </Bolum>

      <Bolum id="sosyal-medya" baslik="Sosyal medya ve dijital paylaşım" Ikon={Share2}>
        <p>
          Ticaret Bakanlığı, denetimlerin kapsamını sosyal medyada paylaşım yapan işletmeleri de
          içerecek şekilde genişletmiştir. Instagram, Facebook ve WhatsApp dahil elektronik ortamda
          verilen ilanlar bu kapsamdadır.<Kaynak n={2} />
        </p>
        <BolumGorsel
          src="/generated/rehber/eids-sosyal-medya.jpg"
          alt="Takım elbiseli bir profesyonel, telefonunda bir konut projesi görselini paylaşırken"
          caption="Sosyal medyada doğrudan ilan yerine, doğrulanmış ilanın bağlantısı paylaşılır (temsilî görsel)."
        />
        <VurguKutusu tip="uyari" baslik="Doğrudan ilan paylaşımı ceza riski taşır">
          <p>
            Sistem doğrulaması olmadan doğrudan ilan niteliğinde görsel veya metin paylaşan
            işletmelere, tespit edilen her ihlal için 286.206 TL’ye kadar idari para cezası
            uygulanabilir. Sosyal medyada yalnızca EİDS ile doğrulanmış ilanın bağlantısını
            paylaşın.<Kaynak n={2} />
          </p>
        </VurguKutusu>
        <p>
          Sosyal medya paylaşımının pratik kuralları, örnek durumlar ve karar adımları ayrıca ele
          alınması gereken bir konudur; bu rehber temel çerçeveyi verir.
        </p>
      </Bolum>

      <Bolum id="yetki-sozlesmesi-farki" baslik="EİDS ile yetki sözleşmesi arasındaki kavramsal fark" Ikon={FileText}>
        <p>
          Danışmanların sık karıştırdığı iki kavramı ayırmak önemlidir. <strong>Emlak yetki
          sözleşmesi</strong>, danışman ile taşınmaz sahibi arasındaki ticari ilişkiyi (çalışma
          koşulları, hizmet, süre) düzenleyen belgedir. <strong>EİDS yetkisi</strong> ise ilan
          yayımlamak için gereken resmî, taşınmaz bazlı doğrulamadır.
        </p>
        <p>
          Biri tarafların aralarındaki anlaşmayı, diğeri devletin ilan yayımına ilişkin doğrulamasını
          ifade eder. Bir sözleşmeye sahip olmak, EİDS yetkisinin alındığı anlamına gelmez; ikisi
          birlikte gözetilir.
        </p>
      </Bolum>

      <Bolum id="senaryolar" baslik="Danışman senaryoları" Ikon={MessageSquareText}>
        <SenaryoKutusu baslik="Sahibi “ilanı hemen yayımla” diyor, henüz e-Devlet yetkisi verilmedi">
          <p>
            İşletmenizin yetki belgesi olsa bile, ilgili taşınmaz için sahibin e-Devlet üzerinden
            yetkilendirmesi tamamlanmadan ilan yayımlamak risk oluşturur. Önce yetkilendirmenin
            yapılmasını sağlayın; doğrulama tamamlandıktan sonra yayına geçin.
          </p>
        </SenaryoKutusu>
        <SenaryoKutusu baslik="Projeden konut satıyorsunuz, müteahhit satış yetkisi verdi">
          <p>
            Müteahhidin verdiği ticari satış yetkisi, ilan yayımlamak için gereken EİDS yetkisinin
            yerine geçmez. Bir ilan yayımlayacaksanız taşınmaz bazında EİDS tarafını da netleştirin;
            proje bazında süreci baştan planlamak sonradan doğacak sorunları önler.
          </p>
        </SenaryoKutusu>
      </Bolum>

      <Bolum id="sik-hatalar" baslik="Sık yapılan hatalar" Ikon={AlertTriangle}>
        <ul>
          <li>Ticari satış yetkisini EİDS yetkisiyle aynı sanmak.</li>
          <li>Yetkilendirme tamamlanmadan ilanı yayına almak.</li>
          <li>Sosyal medyada doğrulanmış ilan bağlantısı yerine doğrudan ilan görseli/metni paylaşmak.</li>
          <li>Yetki süresinin dolduğunu fark etmeden yayını sürdürmek.</li>
          <li>İlanda sistemin ürettiği doğrulama bilgisini (kod/QR) görünür tutmamak.</li>
        </ul>
      </Bolum>

      <IcerikFAQ
        sorular={[
          {
            s: "EİDS satılık konut ilanlarında ne zaman zorunlu oldu?",
            c: (
              <p>
                Satılık konut dahil tüm satılık taşınmaz ilanlarında yetki doğrulaması 1 Şubat
                2026’dan itibaren zorunludur. Kiralık ilanlarda zorunluluk 1 Ocak 2025’ten beri
                geçerlidir.
              </p>
            ),
          },
          {
            s: "Müteahhidin verdiği satış yetkisi EİDS yetkisi yerine geçer mi?",
            c: (
              <p>
                Hayır. Müteahhidin ticari satış yetkisi taraflar arasındaki düzenlemedir; ilan
                yayımlamak için gereken EİDS yetkisi ise e-Devlet üzerinden taşınmaz bazında verilen
                resmî doğrulamadır. İkisi birlikte gözetilir.
              </p>
            ),
          },
          {
            s: "Sosyal medyada emlak ilanı paylaşmak yasak mı?",
            c: (
              <p>
                Doğrudan ilan niteliğinde görsel veya metin paylaşımı risklidir. İşletmelerin,
                yalnızca EİDS ile doğrulanmış ve resmî platformda yayımlanmış ilanın bağlantısını
                paylaşması beklenir; aksi durumda her ihlal için 286.206 TL’ye kadar idari para
                cezası uygulanabilir.
              </p>
            ),
          },
          {
            s: "Yetki süresi ne kadardır?",
            c: <p>Taşınmaz sahibinin verdiği EİDS yetkisi en az 3 ay olarak belirlenir.</p>,
          },
          {
            s: "Hisseli taşınmazda tüm hissedarların yetki vermesi gerekir mi?",
            c: (
              <p>
                Hayır. Hisseli taşınmazlarda tek bir hissedarın EİDS yetkisi vermesi ilan için
                yeterli olabilir.
              </p>
            ),
          },
        ]}
      />
    </>
  );
}
