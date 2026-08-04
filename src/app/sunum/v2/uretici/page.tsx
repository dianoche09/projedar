import type { Metadata } from "next";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Copy,
  Database,
  EyeOff,
  FileSpreadsheet,
  Gavel,
  Handshake,
  Layers,
  ListChecks,
  Megaphone,
  Percent,
  Radar,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  AkisSema,
  AlintiSlayt,
  CanliBirimKart,
  EkranKart,
  FarkTablosu,
  FiyatListesiMock,
  GorselSlayt,
  MaddeKart,
  OnayMadde,
  SoruKart,
} from "@/components/sunum/parcalar";
import { AgDiyagrami } from "@/components/landing/AgDiyagrami";
import { KuleDemo } from "@/components/landing/KuleDemo";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";

export const metadata: Metadata = {
  title: "Projedar · Üretici Sunumu v2",
  description: "Proje sahipleri için Projedar tanıtım sunumu (v2).",
};

/* v2 — sade anlatım kurgusu: kapak, nedir, sorun, alıntı, çözüm(şema), canlı veri,
   tek kaynak, opsiyon kilidi(demo), tahsis(demo), nasıl çalışır, değer önerisi,
   ağın gücü, fark tablosu, platform araçları, güven, regülasyon, SSS, özet,
   başlangıç, CTA. */
export default function UreticiSunumV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/santiye-gece.jpg"
      logo
      kicker="Projedar · Proje sahipleri için"
      baslik="Stoğunuz yaşayan bir ağda dolaşsın"
      alt="Projedar, yeni konut projeleri için tahsisli canlı satış ağıdır: fiyat ve stok bilginiz yalnız yetkilendirdiğiniz danışmanlarda, her an güncel dolaşır. Doğru danışmanda, doğru fiyatla."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Bloklar yükselir. Stok erir.
      </p>
      <p className="da da-5 mono mt-8 text-[10px] uppercase tracking-[0.18em] text-white/50">
        ok tuşları veya kaydırma ile ilerleyin
      </p>
    </GorselSlayt>,

    /* 2 · Nedir */
    <Slayt
      key="nedir"
      kicker="Bir bakışta"
      baslik="Projedar nedir?"
      alt="İnşaat firmalarıyla gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan kapalı bir konut stoğu ağı. Siz stoğu yönetirsiniz; ağ her zaman sizin belirlediğiniz güncel veriyle satar."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri"
          metin="Fiyat veya stok değişikliği tüm ağa anında yayılır; her bilginin üzerinde 'ne zaman güncellendi' damgası durur."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Database}
          baslik="Tek kaynak"
          metin="Paylaşılan link her açılışta güncel değeri gösterir; kopyalanan PDF'ler tarihe karışır."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Opsiyon kilidi"
          metin="Bir daire opsiyonlandığında veritabanı seviyesinde kilitlenir; çift satış yapısal olarak imkânsızdır."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Tahsisli erişim"
          metin="Hangi danışman hangi projeyi, bloğu, hatta daireyi görür: karar proje sahibinin."
        />
      </div>
    </Slayt>,

    /* 3 · Sorun (görsel zemin) */
    <GorselSlayt
      key="sorun"
      gorsel="/sunum/excel-kaos.jpg"
      hiza="sol"
      kicker="Sorun"
      baslik="Bugün proje stoğu nasıl dolaşıyor?"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={FileSpreadsheet}
          baslik="Excel ve PDF listeler"
          metin="Fiyat listesi e-posta ve WhatsApp gruplarında elden ele dolaşır; kim hangi sürüme bakıyor, bilinmez."
        />
        <MaddeKart
          Ikon={Copy}
          baslik="Eskiyen fiyatlar"
          metin="Zam geldiğinde sahadaki listeler eskir; danışman müşteriye dünün fiyatını söyler, satış masada bozulur."
        />
        <MaddeKart
          Ikon={AlertTriangle}
          baslik="Çift satış riski"
          metin="Aynı daireye iki ayrı danışman kapora alabilir; telafisi zor itibar ve hukuk sorunları doğar."
          sinyal="#e07a6e"
        />
        <MaddeKart
          Ikon={EyeOff}
          baslik="Görünmez saha"
          metin="Stoğunuzu kimin, kime, hangi koşullarla sunduğunu göremezsiniz; kontrol elden çıkar."
        />
      </div>
    </GorselSlayt>,

    /* 4 · Alıntı */
    <AlintiSlayt
      key="alinti"
      metin="Sahada dolaşan her eski fiyat listesi, projenizin kârından eksilir."
      alt="Yanlış fiyatla açılan görüşme ya satışı düşürür ya güveni. İkisinin de faturası proje sahibine kesilir."
    />,

    /* 5 · Çözüm + şema */
    <Slayt
      key="cozum"
      genis
      kicker="Çözüm"
      baslik="Stoğunuz tek merkezden, canlı"
      alt="Projenizi ve birim listenizi Projedar'a taşırsınız. Yetkilendirdiğiniz danışmanlar her an sizin belirlediğiniz güncel fiyat ve stok üzerinden çalışır; müşteriye birebir linkle sunar."
    >
      <AkisSema
        dugumler={[
          { baslik: "Proje sahibi", alt: "Stok + fiyat + yetki" },
          { baslik: "PROJEDAR", alt: "Canlı senkron ağ", vurgu: true },
          { baslik: "Yetkili danışmanlar", alt: "Birebir müşteri paylaşımı" },
        ]}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <OnayMadde>Fiyatı siz belirlersiniz, ağ anında görür.</OnayMadde>
        <OnayMadde>Opsiyon kilidiyle çift satış biter.</OnayMadde>
        <OnayMadde>Kim neyi görür, siz karar verirsiniz.</OnayMadde>
      </ul>
    </Slayt>,

    /* 6 · Özellik: canlı veri */
    <Slayt
      key="canli-veri"
      kicker="Özellik · Canlı veri"
      baslik="Değişiklik anında tüm ağda"
      alt="Fiyat güncellediğinizde, daire sattığınızda veya kampanya açtığınızda ağdaki her danışman aynı saniye güncel veriyi görür. 'Bende eski liste varmış' mazereti kalmaz."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          <OnayMadde>Fiyat ve stok tek merkezden yönetilir.</OnayMadde>
          <OnayMadde>Değişiklik tüm ağa anında yayılır.</OnayMadde>
          <OnayMadde>Her bilginin üzerinde tazelik damgası: &ldquo;X önce güncellendi&rdquo;.</OnayMadde>
        </ul>
        <EkranKart url="projedar.com/uretici/stok">
          <FiyatListesiMock />
        </EkranKart>
      </div>
    </Slayt>,

    /* 7 · Özellik: tek kaynak */
    <Slayt
      key="tek-kaynak"
      kicker="Özellik · Tek kaynak"
      baslik="PDF değil, yaşayan link"
      alt="Danışman müşterisine dosya değil Projedar linki gönderir. Link her açılışta o anki fiyatı ve durumu gösterir. Dolaşımdaki hiçbir kopya eskimez, çünkü kopya yoktur."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <OnayMadde>Paylaşılan link her açılışta günceldir.</OnayMadde>
          <OnayMadde>Ekran görüntüsü ve PDF dolaşımı biter.</OnayMadde>
          <OnayMadde>Fiyat bilgisi her zaman kaynağından doğrulanır.</OnayMadde>
        </ul>
        <CanliBirimKart dipnot="Danışmanın paylaştığı linkte fiyat bu canlı değerden basılır." />
      </div>
    </Slayt>,

    /* 8 · Özellik: opsiyon kilidi + demo */
    <Slayt
      key="opsiyon"
      genis
      kicker="Özellik · Opsiyon kilidi"
      baslik="Çift satış, yapısal olarak imkânsız"
      alt="Bir danışman daire için opsiyon aldığında o daire veritabanı seviyesinde kilitlenir: başka hiç kimse aynı daireyi opsiyonlayamaz. Kilidin nasıl verileceğini proje bazında siz seçersiniz (anında veya sizin onayınızla); satış da ancak sizin onayınızla kesinleşir."
    >
      <p className="mono mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2fd3bc]">
        Deneyin: bir daireye dokunun, opsiyon kilidini test edin
      </p>
      <EkranKart url="projedar.com/havuz/proje/cankaya-vadi">
        <KuleDemo />
      </EkranKart>
    </Slayt>,

    /* 9 · Özellik: tahsis + demo */
    <Slayt
      key="tahsis"
      genis
      kicker="Özellik · Tahsis"
      baslik="Kim neyi görür? Siz seçersiniz"
      alt="Projedar kapalı bir ağdır. Hangi ofisin veya danışmanın hangi projeye, bloğa, daire tipine, hatta tek tek dairelere erişeceğini siz tanımlarsınız; münhasırlık ve kontenjan gibi koşulları da tahsisle belirlersiniz. Yetki anında verilir, anında kaldırılır."
    >
      <EkranKart url="projedar.com/uretici/tahsis">
        <TahsisPaneli />
      </EkranKart>
    </Slayt>,

    /* 10 · Nasıl çalışır */
    <Slayt key="nasil" kicker="Nasıl çalışır" baslik="Dört adımda canlı ağınız hazır">
      <AdimSirasi
        adimlar={[
          { baslik: "Projenizi yükleyin", metin: "Birim listesi, fiyatlar, kat planları ve görsellerle projenizi tanımlayın. Excel'den içe aktarma var." },
          { baslik: "Danışmanları yetkilendirin", metin: "Çalıştığınız ofisleri ağa davet edin; erişim kapsamını belirleyin." },
          { baslik: "Ağ satışa başlasın", metin: "Danışmanlar canlı veriyle müşterilerine birebir sunum yapar." },
          { baslik: "Opsiyon ve satışı izleyin", metin: "Kilitler, opsiyonlar ve satışlar panelinize anlık düşer." },
        ]}
      />
    </Slayt>,

    /* 11 · Değer önerisi (görsel zemin) */
    <GorselSlayt
      key="deger"
      gorsel="/sunum/el-sikisma.jpg"
      hiza="sol"
      kicker="Değer önerisi"
      baslik="Projedar proje sahibine ne kazandırır?"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Fiyat disiplini"
          metin="Sahada tek doğru fiyat konuşulur; kampanya ve zamlar kontrollü, eş zamanlı uygulanır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Çift satış koruması"
          metin="Opsiyon kilidi kapora çakışmalarını ve mağduriyet krizlerini sistemsel olarak engeller."
        />
        <MaddeKart
          Ikon={Users}
          baslik="Daha hızlı satış"
          metin="Daha çok danışman, güncel veriyle satar: stok bekletmez, satış temposu düşmez."
        />
        <MaddeKart
          Ikon={Radar}
          baslik="Talep zekâsı"
          metin="Hangi daire ilgi görüyor, hangi danışman aktif, talep nereye akıyor: Talep Radarı panelinizde."
        />
      </div>
    </GorselSlayt>,

    /* 12 · Ağın gücü */
    <Slayt
      key="agin-gucu"
      kicker="Ağın gücü"
      baslik="Danışmanlar neden Projedar'da?"
      alt="Bir ağ, danışmanı kadar güçlüdür. Projedar danışmanlar için tamamen ücretsizdir ve satışlarından komisyon almaz; bu yüzden ağa katılım güçlüdür."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Danışmana ücretsiz"
          metin="Üyelik ücreti yok; giriş bariyeri olmadığı için ağ hızla büyür."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Percent}
          baslik="Komisyon kesintisi yok"
          metin="Projedar danışmanın kazancından pay almaz; danışman tam motivasyonla satar."
        />
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri avantajı"
          metin="Danışman müşterisine her an doğru bilgi verir; güven ve hız kazanır."
        />
      </div>
      <p className="deck-kart mt-4 px-5 py-4 text-[14px] font-semibold leading-relaxed text-white/90">
        Sonuç: stoğunuz, satmaya istekli ve doğru bilgiyle donanmış bir ağda dolaşır.
      </p>
    </Slayt>,

    /* 12b · Ağ diyagramı (canlı grafik) */
    <Slayt
      key="ag-diyagram"
      genis
      kicker="Ağın gücü · Canlı görünüm"
      baslik="Tek proje aracı değil, ağ"
      alt="Her yeni proje haritaya bir kütle, her yeni danışman bir erişim noktası ekler. Bir danışmanın üstüne gelin: yalnız ona tahsisli hat parlar."
    >
      <EkranKart url="projedar.com">
        <AgDiyagrami />
      </EkranKart>
    </Slayt>,

    /* 13 · Fark tablosu */
    <Slayt key="fark" genis kicker="Fark" baslik="Bugünkü düzen ve Projedar">
      <FarkTablosu
        eski={[
          "Fiyat listeleri e-posta ve WhatsApp'ta elden ele dolaşır",
          "Zam sonrası saha günlerce eski fiyatla satar",
          "Aynı daireye birden fazla kapora alınabilir",
          "Stoğun sahada nasıl sunulduğu görünmez",
        ]}
        yeni={[
          "Tek merkez: fiyat ve stok tek kaynaktan yönetilir",
          "Değişiklik aynı saniye tüm ağda geçerli olur",
          "Opsiyon kilidi çift satışı sistemsel olarak engeller",
          "Her paylaşım ve opsiyon panelde izlenir",
        ]}
      />
    </Slayt>,

    /* 14 · Platform araçları */
    <Slayt key="platform" genis kicker="Platform" baslik="Panelinizdeki araçlar">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MaddeKart
          Ikon={Building2}
          baslik="Birim & stok yönetimi"
          metin="Bina kesiti üzerinde blok/kat/daire bazında canlı durum; Excel'den hızlı içe aktarma."
        />
        <MaddeKart
          Ikon={Megaphone}
          baslik="Fiyat, kampanya & lansman"
          metin="Fiyat güncellemeleri, kampanyalar ve lansman duyuruları tüm ağda eş zamanlı geçerli olur."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Tahsis yönetimi"
          metin="Ofis ve danışman bazında erişim kapsamı; münhasırlık, kontenjan ve komisyon koşulları."
        />
        <MaddeKart
          Ikon={ListChecks}
          baslik="Opsiyon onay merkezi"
          metin="Bekleyen talepler, aktif kilitler ve süre takibi tek kuyrukta; son söz sizde."
        />
        <MaddeKart
          Ikon={Radar}
          baslik="Talep Radarı"
          metin="Görüntülenme, paylaşım ve opsiyon sinyalleri talep haritasına dönüşür; fiyatı veriyle yönetirsiniz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Search}
          baslik="Müşteri sorgula"
          metin="Alıcının adını veya telefonunu sorgulayın; ilk hangi danışmanın getirdiğini görün, hak ediş tartışması bitsin."
        />
      </div>
    </Slayt>,

    /* 15 · Güven */
    <Slayt key="guven" kicker="Güven" baslik="Kapalı ağ: ilan sitesi değil, iş ağı">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={EyeOff}
          baslik="Halka açık ilan yok"
          metin="Stoğunuz ve fiyatlarınız internete saçılmaz; yalnızca yetkilendirdiğiniz profesyoneller görür."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Handshake}
          baslik="Birebir paylaşım"
          metin="Müşteriye ulaşan her bilgi, danışmanın birebir (WhatsApp) paylaştığı kontrollü linktir."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Yetki sizde"
          metin="Ağa kimin gireceğine, neyi göreceğine ve ne zaman çıkacağına siz karar verirsiniz."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="İzlenebilir süreç"
          metin="Opsiyondan satışa her adım kayıt altında; anlaşmazlık gündeme gelmez."
        />
      </div>
    </Slayt>,

    /* 16 · Regülasyon */
    <Slayt
      key="regulasyon"
      kicker="Regülasyon"
      baslik="Yeni ilan düzenlemesi Projedar'ın lehine"
      alt="Şubat 2026'dan beri halka açık satılık ilanlar EİDS kaydına bağlı; kurala aykırı sosyal medya paylaşımlarına 286 bin TL'yi aşan idari para cezası öngörülüyor."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Gavel}
          baslik="Kapalı devre: ilan değil, tahsis"
          metin="Projedar'da halka açık ilan yoktur. Bilgi yalnız yetkili danışmana tahsisle, müşteriye birebir linkle ulaşır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Building2}
          baslik="Prestijiniz korunur"
          metin="Projeniz portallarda onlarca farklı fiyatla dolaşan bir pazar tezgâhına dönmez; sahada yalnız onaylı bilgi vardır."
        />
        <MaddeKart
          Ikon={Users}
          baslik="Danışman ağınız da güvende"
          metin="Danışmanlarınız ceza riski taşıyan ilanlar yerine ağ içi tahsisli linkle satar: hızlı, kontrollü, mevzuata uyumlu."
        />
      </div>
    </Slayt>,

    /* 17 · SSS */
    <Slayt key="sss" kicker="Sık sorulanlar" baslik="Aklınıza takılanlar">
      <div className="grid gap-3 sm:grid-cols-2">
        <SoruKart
          soru="Stoğumuz internete açılıyor mu?"
          cevap="Hayır. Projedar kapalı bir ağdır; verinizi yalnızca yetkilendirdiğiniz danışmanlar görür, halka açık ilan yayınlanmaz."
        />
        <SoruKart
          soru="Mevcut satış ekibimiz ne olacak?"
          cevap="Aynen devam eder. Projedar satış ofisinizin yerini almaz; onu sahadaki danışman ağıyla güçlendirir."
        />
        <SoruKart
          soru="Fiyat kontrolü kimde?"
          cevap="Tamamen sizde. Fiyatı yalnızca siz güncellersiniz; danışmanlar hiçbir koşulda farklı fiyat gösteremez."
        />
        <SoruKart
          soru="Veri girmek bize yük olur mu?"
          cevap="Hayır. Birim listenizi Excel'den içe aktarırız, dilerseniz kurulumu tamamen biz üstleniriz; güncellemeleri WhatsApp'tan bildirmeniz bile yeterli."
        />
      </div>
    </Slayt>,

    /* 18 · Özet (görsel zemin) */
    <GorselSlayt
      key="ozet"
      gorsel="/sunum/satis-ofisi.jpg"
      hiza="sol"
      kicker="Özet"
      baslik="Üç cümlede Projedar"
    >
      <div className="da da-3 mt-8 w-full">
        <AdimSirasi
          adimlar={[
            { baslik: "Stoğunuz tek merkezden, canlı yönetilir", metin: "Fiyat ve birim durumu tüm ağda her an günceldir; sürüm karmaşası biter." },
            { baslik: "Çift satış imkânsızlaşır", metin: "Opsiyon kilidi ve kayıtlı süreç, kapora çakışmalarını ve mağduriyetleri bitirir." },
            { baslik: "Kontrol ve talep zekâsı sizde", metin: "Kim neyi görür siz seçersiniz; ağdaki her sinyal Talep Radarı'nda fiyat ve satış kararına dönüşür." },
          ]}
        />
      </div>
    </GorselSlayt>,

    /* 19 · Başlangıç */
    <Slayt key="baslangic" kicker="Başlangıç" baslik="Yayına alma süreci">
      <AdimSirasi
        adimlar={[
          { baslik: "Tanışma & demo", metin: "Projenizi dinliyor, platformu canlı örnekle gösteriyoruz." },
          { baslik: "Proje kurulumu", metin: "Birim listeniz ve görselleriniz platforma aktarılır; paneliniz açılır." },
          { baslik: "Ağ daveti", metin: "Çalıştığınız danışmanlar davet edilir, yetkiler tanımlanır." },
          { baslik: "Canlı yayın", metin: "Stoğunuz ağda dolaşmaya, opsiyonlar düşmeye başlar." },
        ]}
      />
    </Slayt>,

    /* 20 · CTA */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/vinc-siluet.jpg"
      kicker="Sonraki adım"
      baslik="Lansmanda ilk projeler arasında olun"
      alt="Projedar yeni açılıyor: kuruluş dönemine katılan proje sahiplerinin kurulumunu tamamen biz üstleniyoruz ve projeleri ağın ilk vitrininde yer alıyor. Bir demo görüşmesiyle başlayalım."
    >
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">
        projedar.com/muteahhit
      </p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Üretici sunumu · v2" slides={slides} />;
}
