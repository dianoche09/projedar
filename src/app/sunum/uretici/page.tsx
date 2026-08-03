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
  MapPin,
  PhoneCall,
  ShieldCheck,
  Star,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  CanliBirimKart,
  KapakSlayt,
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

/* 12 slayt: kapak, problem, çözüm, akış, tahsis, çift satış, tazelik,
   kim-getirdi, talep radarı, konum, kurucu müteahhit, sonraki adım. */
export default function UreticiSunum() {
  const slides = [
    /* 1 · Kapak */
    <KapakSlayt
      key="kapak"
      kicker="Projedar · Üretici sunumu"
      baslik="Canlı konut stoğu dağıtım ağı"
      alt="Stok, fiyat ve dağıtım tek noktadan yönetilir. Kontrol tamamen üreticide."
    >
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <span className="taze t-0 rounded-full border border-[var(--cizgi-2)] bg-white/85 px-3.5 py-2 text-[12px]">
          <span className="nokta nabiz" /> canlı · şimdi güncellendi
        </span>
        <span className="mono flex items-center gap-3 rounded-full border border-[var(--cizgi-2)] bg-white/85 px-3.5 py-2 text-[11px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-green" /> müsait</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber" /> opsiyon</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-red" /> satıldı</span>
        </span>
      </div>
      <p className="mono mt-12 text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
        ok tuşları veya kaydırma ile ilerleyin
      </p>
    </KapakSlayt>,

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
          sinyal="#d15a4e"
        />
      </div>
    </Slayt>,

    /* 3 · Çözüm özü */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Tek doğru kaynak"
      alt="Fiyat ve durum yalnız tek yerde tutulur. Her paylaşım, her ekran o canlı değerden beslenir."
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
    <Slayt
      key="akis"
      genis
      kicker="Nasıl çalışır"
      baslik="Stoktan satışa dört adım"
    >
      <AdimSirasi
        adimlar={[
          { baslik: "Stok girilir", metin: "Blok, kat, daire, fiyat: tek doğru kaynağa bir kez." },
          { baslik: "Tahsis edilir", metin: "Hangi ofis veya danışman neyi görecek, siz belirlersiniz." },
          { baslik: "Ağ paylaşır", metin: "Danışman iki dokunuşla WhatsApp'tan canlı sayfayı paylaşır." },
          { baslik: "Opsiyon ve satış", metin: "48 saatlik opsiyon kilidi; satış durumu anında tüm ağda." },
        ]}
      />
      <p className="mono mb-3 mt-8 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-teal">
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

    /* 6 · Çift satış */
    <Slayt
      key="kilit"
      orta
      kicker="Güven"
      baslik="Çift satış yapısal olarak imkânsız"
      alt="Kilit uygulama ekranında değil, veritabanının kendisinde. Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Database}
          baslik="Kilit DB seviyesinde"
          metin="Aktif opsiyon veritabanı kuralıyla teklenir; yazılım hatası bile ikinci opsiyonu yazamaz."
          sinyal="#e3a12c"
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

    /* 7 · Fiyat senkron + tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Zam yaptınız. Ağ saniyeler içinde güncel."
      alt="Her birimin yanında son güncelleme yaşar. Eskiyen veri gizlenmez; rozet rengiyle kendini belli eder."
    >
      <TazelikOlcek />
      <p className="kart mt-5 px-5 py-4 text-[13.5px] leading-relaxed text-ink-soft">
        15 gün hareketsiz kalan projede tazelik sigortası devreye girer: size tek dokunuşlu teyit gider,
        cevapsız kalırsa rozet uyarıya döner. Ağ hiçbir zaman eski veriyle konuşmaz.
      </p>
    </Slayt>,

    /* 8 · Kim-getirdi görünürlüğü */
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

    /* 9 · Talep Radarı */
    <Slayt
      key="radar"
      kicker="Veri"
      baslik="Talep Radarı: ağ ne söylüyor?"
      alt="Her görüntüleme, paylaşım ve opsiyon sinyal üretir. Bu veri projenizde birikir ve fiyat kararlarınızı besler."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="kart signal-top p-5" style={{ "--_sig": "#1e9b8a" } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">İçgörü</p>
            <OrnekRozet />
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-ink">
            A Blok 7. kat 3+1 daireler son 7 günde diğer tiplere göre %42 daha fazla görüntülendi.
          </p>
          <p className="mt-2 text-[12.5px] text-ink-soft">Şerefiye ve fiyat kararına doğrudan girdi.</p>
        </div>
        <div className="kart signal-top p-5" style={{ "--_sig": "#1e9b8a" } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">İçgörü</p>
            <OrnekRozet />
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-ink">
            En çok paylaşılan: B Blok 2+1. En çok opsiyonlanan: A Blok 3+1.
          </p>
          <p className="mt-2 text-[12.5px] text-ink-soft">
            Hangi stoğun eridiğini tahminden değil sinyalden okursunuz.
          </p>
        </div>
      </div>
    </Slayt>,

    /* 10 · Komisyonsuz + kapalı devre */
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

    /* 11 · Kurucu Müteahhit */
    <Slayt
      key="kurucu"
      kicker="Erken aşama"
      baslik="Kurucu Müteahhit: bölge başına sınırlı"
      alt="Tahsis modeli dengeli bir ağ ister. Bir bölgede sınırlı sayıda üreticiyle çalışıyoruz ki her projenin danışman ağı gerçekten satsın."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={MapPin}
          baslik="Neden sınırlı?"
          metin="Aynı bölgede sınırsız proje danışman ilgisini böler. Kontenjan, ağın satış gücünü korur."
        />
        <MaddeKart
          Ikon={Star}
          baslik="Kurucu avantajı"
          metin="Erken anlaşan üretici bölgesinde önceliği ve kurulum desteğinin tamamını alır."
          sinyal="#1e9b8a"
        />
      </div>
    </Slayt>,

    /* 12 · Sonraki adım */
    <Slayt
      key="cta"
      orta
      kicker="Sonraki adım"
      baslik="Kurulumu biz yapıyoruz"
      alt="Ekibinizin panel öğrenmesi gerekmez: stok girişini ve tahsis kurulumunu concierge ekibimiz sizinle birlikte yapar."
    >
      <AdimSirasi
        adimlar={[
          { baslik: "Anlaşma görüşmesi", metin: "Kapsam ve bölge kontenjanı birlikte netleşir." },
          { baslik: "Concierge kurulum", metin: "Proje, stok ve tahsisler ekibimizce girilir." },
          { baslik: "Ağ satmaya başlar", metin: "Danışmanlar tahsisli stoğu aynı gün paylaşmaya başlar." },
        ]}
      />
      <p className="mono mt-10 text-[13px] font-semibold tracking-wide text-navy">projedar.com/muteahhit</p>
    </Slayt>,
  ];

  return <DeckShell baslik="Üretici sunumu" slides={slides} />;
}
