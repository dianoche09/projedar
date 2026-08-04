import type { Metadata } from "next";
import {
  AlertTriangle,
  Building2,
  Clock,
  Copy,
  Database,
  EyeOff,
  FileSpreadsheet,
  Handshake,
  PhoneCall,
  Radar,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  CanliBirimKart,
  GorselSlayt,
  LeadSorguKart,
  MaddeKart,
  OnayMadde,
  OrnekRozet,
  TazelikOlcek,
} from "@/components/sunum/parcalar";
import { KuleDemo } from "@/components/landing/KuleDemo";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";

export const metadata: Metadata = {
  title: "Projedar · Üretici Sunumu",
  description: "Yüz yüze görüşme sunumu: canlı konut stoğu dağıtım ağı, üretici tarafı.",
};

/* 13 slayt: kapak, problem, çözüm, akış(demo), tahsis(demo), kilit-mesaj(görsel),
   kilit-mekanizma, tazelik, kim-getirdi, talep radarı, konum, kurucu, CTA. */
export default function UreticiSunum() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/santiye-gece.jpg"
      logo
      kicker="Projedar · Üretici sunumu"
      baslik="Canlı konut stoğu dağıtım ağı"
      alt="Stok, fiyat ve dağıtım tek noktadan. Kontrol tamamen üreticide."
    >
      <div className="da da-4 mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12.5px] font-semibold text-[#3ddc8f] backdrop-blur-md">
          <span className="nabiz size-2 rounded-full bg-[#3ddc8f]" /> canlı · şimdi güncellendi
        </span>
        <span className="mono flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] text-white/85 backdrop-blur-md">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#3ddc8f]" /> müsait</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e8b04b]" /> opsiyon</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e07a6e]" /> satıldı</span>
        </span>
      </div>
      <p className="da da-5 mono mt-12 text-[10px] uppercase tracking-[0.18em] text-white/50">
        ok tuşları veya kaydırma ile ilerleyin
      </p>
    </GorselSlayt>,

    /* 2 · Problem */
    <Slayt
      key="problem"
      kicker="Bugünkü durum"
      baslik="Fiyat listeniz şu an kaç kopya?"
      alt="Liste paylaşıldığı anda kontrolünüzden çıkar. Satış sahada sürerken bilgi dünkü dosyada kalır."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={FileSpreadsheet}
          baslik="Excel ve PDF dakikada eskir"
          metin="Fiyatı güncellediğiniz anda sahadaki hiçbir kopya artık güncel değildir."
        />
        <MaddeKart
          Ikon={Copy}
          baslik="Kaç kopya dolaşıyor, bilinmez"
          metin="Hangi emlakçıda hangi sürüm var, kimse söyleyemez."
        />
        <MaddeKart
          Ikon={PhoneCall}
          baslik="Eski fiyatla pazarlık"
          metin="Müşteri eski listeyle gelir; aradaki fark masada tartışma yaratır."
        />
        <MaddeKart
          Ikon={AlertTriangle}
          baslik="Çift satış riski"
          metin="Aynı daireye iki ayrı kapora: telafisi zor bir güven krizi."
          sinyal="#e07a6e"
        />
      </div>
    </Slayt>,

    /* 3 · Çözüm özü */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Fiyatın tek sahibi var: siz"
      alt="Fiyat ve durum yalnız tek yerde tutulur. Her paylaşım, her ekran o canlı değerden beslenir; sahada sizin yazdığınızdan başka rakam yoktur."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <OnayMadde>Fiyatı siz güncellersiniz, tüm ağ anında aynı değeri görür.</OnayMadde>
          <OnayMadde>Durum üç renkte netleşir: müsait, opsiyon, satıldı.</OnayMadde>
          <OnayMadde>Kopya yoktur: paylaşılan link her açıldığında canlı değeri basar.</OnayMadde>
        </ul>
        <CanliBirimKart dipnot="Emlakçının paylaştığı linkte fiyat bu canlı değerden basılır." />
      </div>
    </Slayt>,

    /* 4 · Nasıl çalışır + KuleDemo */
    <Slayt key="akis" genis kicker="Nasıl çalışır" baslik="Sabah stok girin. Akşam ağ satsın.">
      <AdimSirasi
        adimlar={[
          { baslik: "Stok girilir", metin: "Blok, kat, daire, fiyat: tek doğru kaynağa bir kez." },
          { baslik: "Tahsis edilir", metin: "Hangi ofis veya danışman neyi görecek, siz belirlersiniz." },
          { baslik: "Ağ paylaşır", metin: "Danışman iki dokunuşla WhatsApp'tan canlı sayfayı paylaşır." },
          { baslik: "Opsiyon ve satış", metin: "48 saatlik opsiyon kilidi; satış durumu anında tüm ağda." },
        ]}
      />
      <p className="mono mb-3 mt-8 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2fd3bc]">
        Deneyin: bir daireye dokunun, opsiyon kilidini test edin
      </p>
      <KuleDemo />
    </Slayt>,

    /* 5 · Tahsis */
    <Slayt
      key="tahsis"
      genis
      kicker="Kontrol"
      baslik="Herkes her şeyi görmek zorunda değil"
      alt="Görünürlük tahsisle tanımlanır: tüm ağ, seçili ofisler, tek danışman veya süreli özel tahsis. Kapsam dışındaki birim herkese kapalıdır."
    >
      <TahsisPaneli />
    </Slayt>,

    /* 6 · Kilit mesajı (görsel) */
    <GorselSlayt
      key="kilit-mesaj"
      gorsel="/sunum/kule-cephe.jpg"
      hiza="sol"
      kicker="Güven"
      baslik="Çift satış yapısal olarak imkânsız"
      alt="Kilit uygulama ekranında değil, veritabanının kendisinde. Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz."
    />,

    /* 7 · Kilit mekanizması */
    <Slayt key="kilit" orta kicker="Mekanizma" baslik="Kilit nasıl çalışır?">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Database}
          baslik="Kilit DB seviyesinde"
          metin="Aktif opsiyon veritabanı kuralıyla teklenir; yazılım hatası bile ikinci opsiyonu yazamaz."
          sinyal="#e8b04b"
        />
        <MaddeKart
          Ikon={Clock}
          baslik="48 saat opsiyon"
          metin="Opsiyon alan danışmana net süre tanır; süre bitince daire kendiliğinden açılır."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Tüm ağ aynı anda görür"
          metin="Kilitlenen daire her danışman ekranında anında kilitli görünür."
        />
      </div>
    </Slayt>,

    /* 8 · Fiyat senkron + tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Zam yaptınız. Ağ saniyeler içinde güncel."
      alt="Her birimin yanında son güncelleme yaşar. Eskiyen veri gizlenmez; rozet rengiyle kendini belli eder."
    >
      <TazelikOlcek />
      <p className="deck-kart deck-soft mt-5 px-5 py-4 text-[13.5px] leading-relaxed">
        15 gün hareketsiz kalan projede tazelik sigortası devreye girer: size tek dokunuşlu teyit gider,
        cevapsız kalırsa rozet uyarıya döner. Ağ hiçbir zaman eski veriyle konuşmaz.
      </p>
    </Slayt>,

    /* 9 · Kim-getirdi görünürlüğü */
    <Slayt
      key="lead"
      kicker="Şeffaflık"
      baslik="Bu müşteri kimin? Sorgulayın, görün."
      alt="Danışman müşterisini platformda kaydeder. Satış ofisinize gelen bir ismi veya telefonu sorguladığınızda, o müşterinin ilk kimin kaydı olduğunu görürsünüz."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Danışman atlanırsa görünür olur; emek kayıt altındadır.</OnayMadde>
          <OnayMadde>Platform lead dağıtmaz, sahiplik garantisi vermez; yalnız kaydı şeffaf gösterir.</OnayMadde>
          <OnayMadde>Lead listesi size akmaz; yalnız sorguladığınız ismin sonucunu görürsünüz.</OnayMadde>
        </ul>
        <LeadSorguKart />
      </div>
    </Slayt>,

    /* 10 · Talep Radarı */
    <Slayt
      key="radar"
      kicker="Veri"
      baslik="Talep Radarı: ağ ne söylüyor?"
      alt="Her görüntüleme, paylaşım ve opsiyon sinyal üretir. Bu veri projenizde birikir ve fiyat kararlarınızı besler."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="deck-kart signal-top p-5 text-left" style={{ "--_sig": "#2fd3bc" } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/60">İçgörü</p>
            <OrnekRozet />
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-white">
            A Blok 7. kat 3+1 daireler son 7 günde diğer tiplere göre %42 daha fazla görüntülendi.
          </p>
          <p className="deck-soft mt-2 text-[12.5px]">Şerefiye ve fiyat kararına doğrudan girdi.</p>
        </div>
        <div className="deck-kart signal-top p-5 text-left" style={{ "--_sig": "#2fd3bc" } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/60">İçgörü</p>
            <OrnekRozet />
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-white">
            En çok paylaşılan: B Blok 2+1. En çok opsiyonlanan: A Blok 3+1.
          </p>
          <p className="deck-soft mt-2 text-[12.5px]">Hangi stoğun eridiğini tahminden değil sinyalden okursunuz.</p>
        </div>
      </div>
    </Slayt>,

    /* 11 · Komisyonsuz + kapalı devre */
    <Slayt key="konum" orta kicker="Konum" baslik="İlan yok, komisyon yok. Tahsis var.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Handshake}
          baslik="Komisyona dokunmayız"
          metin="Gelirimiz yazılım anlaşmasıdır; satış komisyonunuza ve para akışınıza karışmayız."
        />
        <MaddeKart
          Ikon={EyeOff}
          baslik="Kapalı devre"
          metin="Son kullanıcıya açık ilan yok; stoğu yalnız tahsis verdiğiniz danışmanlar görür."
        />
        <MaddeKart
          Ikon={Building2}
          baslik="Kontrol üreticide"
          metin="Fiyat, görünürlük ve dağıtım her an sizin elinizde; dilediğinizde daraltırsınız."
        />
      </div>
    </Slayt>,

    /* 12 · İlk gün (görsel) */
    <GorselSlayt
      key="ilk-gun"
      gorsel="/sunum/konut-aksam.jpg"
      hiza="sol"
      kicker="İlk gün"
      baslik="Sabah kurulum, akşam satışta"
      alt="Aylık dijital dönüşüm projesi değil: projeniz aynı gün yayına girer, danışmanlarınız aynı gün paylaşmaya başlar."
    >
      <div className="da da-4 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Rocket}
          baslik="Aynı gün yayın"
          metin="Stok ve tahsisleri concierge ekibimiz sizinle birlikte girer; ekibinize kurulum yükü binmez."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Radar}
          baslik="İlk hafta ilk sinyaller"
          metin="Görüntüleme, paylaşım ve opsiyon verisi ilk haftadan Talep Radarı'nda birikmeye başlar."
        />
      </div>
    </GorselSlayt>,

    /* 13 · Sonraki adım */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/vinc-siluet.jpg"
      kicker="Sonraki adım"
      baslik="Kurulumu biz yapıyoruz"
      alt="Ekibinizin panel öğrenmesi gerekmez: stok girişini ve tahsis kurulumunu concierge ekibimiz sizinle birlikte yapar."
    >
      <div className="da da-4 mt-8 w-full">
        <AdimSirasi
          adimlar={[
            { baslik: "Anlaşma görüşmesi", metin: "Kapsam ve proje planı birlikte netleşir." },
            { baslik: "Concierge kurulum", metin: "Proje, stok ve tahsisler ekibimizce girilir." },
            { baslik: "Ağ satmaya başlar", metin: "Danışmanlar tahsisli stoğu aynı gün paylaşmaya başlar." },
          ]}
        />
      </div>
      <p className="da da-5 mono mt-10 text-[14px] font-semibold tracking-wide text-[#2fd3bc]">
        projedar.com/muteahhit
      </p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Üretici sunumu" slides={slides} />;
}
