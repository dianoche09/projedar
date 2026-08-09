import type { Metadata } from "next";
import {
  BadgeCheck,
  Bell,
  Building2,
  Camera,
  Clock,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  Handshake,
  LayoutDashboard,
  Layers,
  ListChecks,
  Megaphone,
  Percent,
  Printer,
  Radar,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Table2,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  AlintiSlayt,
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

/** Senaryo zaman çizelgesi satırı: mono saat + olay. */
function ZamanSatir({ saat, metin, kirmizi = false }: { saat: string; metin: string; kirmizi?: boolean }) {
  return (
    <div
      className={`deck-kart flex items-center gap-4 px-5 py-3.5 text-left ${
        kirmizi ? "border-[#e07a6e]/60 bg-[rgba(224,122,110,0.1)]" : ""
      }`}
    >
      <span className={`mono w-24 flex-none text-[12px] font-bold ${kirmizi ? "text-[#e07a6e]" : "text-[#2fd3bc]"}`}>
        {saat}
      </span>
      <span className={`text-[14.5px] font-medium leading-snug ${kirmizi ? "text-[#ffb3a8]" : "text-white/90"}`}>
        {metin}
      </span>
    </div>
  );
}

/* 21 slayt — kapsamlı tur: kapak, senaryo, alıntı, nedir, çözüm, akış(demo), kokpit,
   tahsis(demo), kilit(görsel), opsiyon akışı, tazelik, mikrosite, ödeme+türler,
   lansman, zekâ paketi, lead sorgu, danışman-neden, ağ & güven, kazanç özeti,
   ilk gün, CTA. */
export default function UreticiSunum() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/santiye-gece.jpg"
      logo
      kicker="Projedar · Üretici sunumu"
      baslik="Bloklar yükselir. Stok erir."
      alt="Yeni projelerin profesyonel satış ağı: canlı stok, tahsisli dağıtım, kilitli opsiyon. Kontrol baştan sona sizde."
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
    </GorselSlayt>,

    /* 2 · Senaryo: 72 saat */
    <Slayt
      key="senaryo"
      kicker="Tanıdık gelecek"
      baslik="Perşembe 17:40. Zam kararı aldınız."
      alt="Sonraki 72 saatte sahada neler oluyor?"
    >
      <div className="grid gap-2.5">
        <ZamanSatir saat="Per 17:41" metin="Yeni fiyat listesi Excel'de hazırlandı." />
        <ZamanSatir saat="Per 18:05" metin="PDF beş WhatsApp grubuna gönderildi. Artık kimde olduğunu bilmiyorsunuz." />
        <ZamanSatir saat="Cum 11:00" metin="İki ofis müşteriye hâlâ eski listeden teklif veriyor." />
        <ZamanSatir saat="Cmt 14:20" metin="Aynı daireye ikinci kapora alındı. Telefonlar susmuyor." kirmizi />
      </div>
      <p className="font-display mt-7 text-[22px] font-bold leading-snug text-white sm:text-[28px]">
        Sorun ekibiniz değil. <span className="text-[#2fd3bc]">Kopyalanabilen liste.</span>
      </p>
    </Slayt>,

    /* 3 · Alıntı vuruşu */
    <AlintiSlayt
      key="alinti"
      metin="Sahada dolaşan her eski fiyat listesi, projenizin kârından eksilir."
      alt="Yanlış fiyatla açılan görüşme ya satışı düşürür ya güveni. İkisinin de faturası proje sahibine kesilir."
    />,

    /* 4 · Bir bakışta */
    <Slayt
      key="nedir"
      kicker="Bir bakışta"
      baslik="Projedar nedir?"
      alt="İnşaat firmalarını ve yetkili danışmanları canlı, doğru veriyle buluşturan, yalnızca yetkili üyelere açık konut stoğu ağı. Siz stoğu yönetirsiniz; ağ her zaman sizin belirlediğiniz güncel veriyle satar."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri"
          metin="Fiyat veya durum değişikliği tüm ağa anında yayılır; kimse eski bilgiyle çalışamaz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Database}
          baslik="Tek kaynak"
          metin="Paylaşılan link her açılışta güncel değeri basar; kopyalanan PDF'ler tarihe karışır."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Opsiyon kilidi"
          metin="Opsiyonlanan birim veritabanı seviyesinde kilitlenir; çift satış çakışmalarının önüne geçilir."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Kontrollü erişim"
          metin="Hangi danışman hangi projeyi, bloğu, daireyi görür: karar her zaman proje sahibinin."
        />
      </div>
    </Slayt>,

    /* 3 · Çözüm özü */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Fiyat kopyalanmaz. Link bir penceredir."
      alt="Liste kaynağından koptuğu an yaşlanmaya başlar. Burada kopacak liste yok: fiyat ve durum tek kayıtta yaşar, paylaşılan her link o kayda açılan bir penceredir."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <OnayMadde>Link her açılışta canlı kayıttan okur; eski fiyat dolaşacak kopya bulamaz.</OnayMadde>
          <OnayMadde>Tüm ağ üç renkle konuşur: müsait, opsiyon, satıldı. Yorum farkı yoktur.</OnayMadde>
          <OnayMadde>Sahada sizin yazdığınızdan başka rakam yoktur; markanız yanlış bilgiyle yıpranmaz.</OnayMadde>
        </ul>
        <CanliBirimKart dipnot="Danışmanın paylaştığı linkte fiyat bu canlı değerden basılır." />
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
      <div style={{ zoom: 0.78 } as React.CSSProperties}>
        <KuleDemo />
      </div>
    </Slayt>,

    /* 5 · Kokpit */
    <Slayt
      key="kokpit"
      kicker="Komuta merkezi"
      baslik="Bütün proje tek ekranda nefes alır"
      alt="Üretici kokpiti: taze stok, satış hızı, açık talepler ve canlı hareket akışı. Satış ofisine sormadan, günün fotoğrafı her an önünüzde."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={LayoutDashboard}
          baslik="Canlı KPI şeridi"
          metin="Müsait, opsiyonda ve satılan birim; bugünkü hareket; ortalama tazelik. Anlık, yorumsuz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Table2}
          baslik="Tek canlı fiyat listesi"
          metin="Tüm blokların bütün birimleri tek tabloda; filtrele, satıra tıkla, daireyi tek noktadan yönet."
        />
        <MaddeKart
          Ikon={ListChecks}
          baslik="Toplu güncelleme"
          metin="Seçtiğiniz birimlerde fiyatı veya durumu tek işlemle değiştirin; blok blok dolaşmak yok."
        />
        <MaddeKart
          Ikon={Building2}
          baslik="Bina kesiti görünümü"
          metin="Blok ve kat bazında renkli kesit: hangi katta ne kaldı, tek bakışta."
        />
      </div>
    </Slayt>,

    /* 6 · Tahsis */
    <Slayt
      key="tahsis"
      genis
      kicker="Kontrol"
      baslik="Yetki bir ayar değil, kapıdır"
      alt="Tüm ağ, seçili ofisler, tek danışman veya 7 günlük özel tahsis: kapıları siz açarsınız. Kapalı kapının arkasındaki danışman, projenin varlığını bile görmez."
    >
      <TahsisPaneli />
    </Slayt>,

    /* 7 · Kilit mesajı (görsel) */
    <GorselSlayt
      key="kilit-mesaj"
      gorsel="/sunum/kule-cephe.jpg"
      hiza="sol"
      kicker="Güven"
      baslik="Opsiyon bir söz değil. Kilittir."
      alt="İki kapora, iki mağdur, bir mahkeme: bu hikâye burada bitiyor. Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz; çift satışın önüne yapısal olarak geçilir."
    />,

    /* 8 · Opsiyon akışı */
    <Slayt
      key="opsiyon-akis"
      kicker="Opsiyon akışı"
      baslik="Son söz her zaman sizde"
      alt="Kilit veritabanında yaşar; süreç ise sizin kurallarınızla işler."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={ListChecks}
          baslik="Talep → onay kuyruğu"
          metin="Danışman opsiyon talebi açar, panelinizdeki kuyruğa düşer; siz onaylayınca kilit doğar. Doğrudan opsiyon da tanımlanabilir."
          sinyal="#e8b04b"
        />
        <MaddeKart
          Ikon={Clock}
          baslik="48 saat, sonra otomatik"
          metin="Süre bitince daire kendiliğinden müsaite döner; unutulan kilit, bekleyen stok kalmaz."
        />
        <MaddeKart
          Ikon={Database}
          baslik="Kilit en dipte"
          metin="Aktif opsiyon veritabanı kuralıyla teklenir; yazılım hatası bile ikinci opsiyonu yazamaz."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Kendi satışınız da içeride"
          metin="Satış ofisinizin sattığı daire ile ağın sattığı daire aynı durum makinesinde; çakışma ihtimali yok."
        />
      </div>
    </Slayt>,

    /* 9 · Tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Eski veri bu ağda saklanamaz"
      alt="Her birimin yanında son güncelleme yaşar: 'canlı · 2 dk önce'. Eskiyen veri gizlenmez, rozet rengiyle kendini ele verir; müşteri karşısında kimse 41 günlük dosya konuşmaz."
    >
      <TazelikOlcek />
      <p className="deck-kart deck-soft mt-5 px-5 py-4 text-[13.5px] leading-relaxed">
        15 gün hareketsiz kalan birim tazelik sigortasıyla otomatik işaretlenir; rozeti uyarıya döner ve siz
        güncelleyene kadar öyle kalır. Bu ağda kimse eski veriyle konuşamaz.
      </p>
    </Slayt>,

    /* 10 · Mikrosite */
    <Slayt
      key="mikrosite"
      kicker="Satış yüzü"
      baslik="Her dairenin kendi canlı satış sayfası"
      alt="Danışmanın müşteriye gönderdiği link bir broşür değil, projenizin canlı vitrini. İçinde satışı kapatan her şey var:"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Camera}
          baslik="Galeri, kat planı, künye"
          metin="Proje görselleri, kat planı, ada/parsel ve imar bilgisi, malzeme ve donatılar: kurumsal ve eksiksiz."
        />
        <MaddeKart
          Ikon={CreditCard}
          baslik="Etkileşimli ödeme planı"
          metin="Müşteri peşinatı kaydırır, taksit anında yeniden hesaplanır; pazarlık masaya hazır gelir."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={UserPlus}
          baslik="Sayfadan lead düşer"
          metin="İlgilenen müşteri formu doldurur; talep doğrudan paylaşan danışmana düşer, satış zinciri kopmaz."
        />
        <MaddeKart
          Ikon={Printer}
          baslik="Gerekirse kâğıda da"
          metin="Aynı sayfa yazdırmaya hazır düzene döner; masaya çıktı isteyen müşteri de boş dönmez."
        />
      </div>
    </Slayt>,

    /* 13 · Ödeme planı + yatırım verisi + Türkiye gerçekleri */
    <Slayt
      key="odeme"
      kicker="Satış objesi"
      baslik="Fiyat değil, satın alma planı satarsınız"
      alt="Her birimin fiyatının yanında yapılandırılmış ödeme planı ve yatırım verisi durur; danışman rakam uydurmaz, sizin planınızı anlatır."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={CreditCard}
          baslik="Yapılandırılmış plan"
          metin="Peşinat yüzdesi, taksit sayısı, ara ödemeler: birim kaydında tanımlı, her yerde aynı."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Yatırım verisi"
          metin="Kira getirisi ve amortisman süresi gibi alanlar; yatırımcı alıcıya konuşan sayılar."
        />
        <MaddeKart
          Ikon={Search}
          baslik="Konut, ticari, depo, otopark"
          metin="Her birim türü tek sistemde; dükkan ve ofisi ayrı bir danışman grubuna tahsis edebilirsiniz."
        />
        <MaddeKart
          Ikon={Building2}
          baslik="Kat karşılığı netliği"
          metin="Arsa sahibi payı etiketlidir: havuzda görünür ama satışa kapalıdır. Pay karışıklığı ve anlaşmazlık biter."
        />
      </div>
    </Slayt>,

    /* 12 · Lansman & duyuru */
    <Slayt
      key="lansman"
      kicker="Lansman"
      baslik="Duyuruyu bir kez yapın, bütün ağ duysun"
      alt="Yeni etap, kampanya veya fiyat aksiyonu: tek duyuru girersiniz, tahsisli her danışmanın Lansman Radarı'na aynı anda düşer."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Megaphone}
          baslik="Lansman duyurusu"
          metin="Kampanyayı panelden yayınlarsınız; telefon zinciri kurmadan bütün ağ aynı mesajı alır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Bell}
          baslik="Anlık bildirim"
          metin="Fiyat, tahsis, opsiyon ve lead hareketleri panel ve e-posta bildirimiyle anında taraflara gider."
        />
        <MaddeKart
          Ikon={Smartphone}
          baslik="Cepte çalışır"
          metin="Kurulabilir mobil uygulama (PWA): danışman sahada, siz yoldayken bile ağ elinizin altında."
        />
      </div>
    </Slayt>,

    /* 13 · Zekâ paketi */
    <Slayt
      key="zeka"
      kicker="Veri"
      baslik="Hangi daire satar? Tahmin değil, sinyal."
      alt="Her görüntüleme, paylaşım ve opsiyon iz bırakır. Şerefiye ve fiyat kararını his değil, kendi projenizin verisi versin."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="deck-kart signal-top p-5 text-left" style={{ "--_sig": "#2fd3bc" } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-2">
            <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/60">Talep Radarı</p>
            <OrnekRozet />
          </div>
          <p className="mt-2.5 text-[14px] font-semibold leading-relaxed text-white">
            A Blok 7. kat 3+1 daireler son 7 günde %42 daha fazla görüntülendi.
          </p>
          <p className="deck-soft mt-2 text-[12px]">Hangi tip ilgi görüyor, hangi stok eriyor: sinyalden okursunuz.</p>
        </div>
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Dinamik fiyat önerisi"
          metin="Talep sinyali benzer birimlerle kıyaslanır, sistem fiyat önerir. Karar ve onay her zaman sizde; kendiliğinden fiyat değişmez."
        />
        <MaddeKart
          Ikon={Radar}
          baslik="Raporlar"
          metin="Görüntülemeden satışa dönüşüm hunisi, en aktif danışmanlar, proje performansı: dönem raporu tek tıkla."
        />
      </div>
    </Slayt>,

    /* 14 · Lead sorgu */
    <Slayt
      key="lead"
      kicker="Şeffaflık"
      baslik={<>&ldquo;Bu müşteri benim&rdquo; kavgası bitiyor</>}
      alt="Danışman müşterisini kaydeder. Satış ofisinize gelen ismi veya telefonu sorgularsınız: ilk kimin kaydı, hangi tarihte, anında ekranda."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Danışman atlanırsa görünür olur; emek kayıt altındadır.</OnayMadde>
          <OnayMadde>Platform lead dağıtmaz, garanti vermez; yalnız kaydı şeffaf gösterir.</OnayMadde>
          <OnayMadde>Lead listesi size akmaz; yalnız sorguladığınız ismin sonucunu görürsünüz.</OnayMadde>
        </ul>
        <LeadSorguKart />
      </div>
    </Slayt>,

    /* 16 · Ağın gücü: danışman motivasyonu */
    <Slayt
      key="danisman-neden"
      kicker="Ağın gücü"
      baslik="Danışman bu ağda neden satar?"
      alt="Bir ağ, danışmanı kadar güçlüdür. Katılım güçlü, çünkü danışman için giriş bariyeri sıfır:"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Üyelik ücretsiz"
          metin="Giriş bariyeri yok; ağ hızla büyür, stoğunuz gerçekten satan danışmanlara ulaşır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Percent}
          baslik="Komisyon kesintisi yok"
          metin="Danışmanın kazancından pay alınmaz; tam motivasyonla sizin projenizi satar."
        />
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri avantajı"
          metin="Müşterisine her an doğru bilgi verir: masada fiyat tutar, satış iptal olmaz."
        />
      </div>
      <p className="deck-kart mt-4 px-5 py-4 text-[14px] font-semibold leading-relaxed text-white/90">
        Sonuç: stoğunuz, satmaya istekli ve doğru bilgiyle donanmış bir ağda dolaşır.
      </p>
    </Slayt>,

    /* 17 · Ağ & güven */
    <Slayt
      key="ag-guven"
      kicker="Ağ & güven"
      baslik="Belgeli ağ, davetle büyür"
      alt="Açık ilan değil, tahsis var; Projedar komisyondan pay almaz. Ağın her üyesi belgeli, her proje doğrulanmış."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={UserPlus}
          baslik="Kendi ağınızı davet edin"
          metin="Çalıştığınız ofisleri ve danışmanları davet linkiyle içeri alırsınız; ağınız ilk günden hazır gelir."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Belgeli danışmanlar"
          metin="Her danışman mesleki yeterlilik belgesi ve vergi levhasıyla doğrulanır; belgesiz kimse stoğunuzu göremez."
        />
        <MaddeKart
          Ikon={Handshake}
          baslik="Komisyona dokunmayız"
          metin="Gelirimiz yazılım anlaşmasıdır; satış komisyonunuza ve para akışınıza karışmayız."
        />
        <MaddeKart
          Ikon={EyeOff}
          baslik="Açık ilana kapalı"
          metin="Son kullanıcıya açık ilan yok; stoğu yalnız tahsis verdiğiniz danışmanlar görür. Doğrulanmış rozetiniz her paylaşımda markanızı taşır."
        />
      </div>
    </Slayt>,

    /* 18 · Kazanç özeti */
    <Slayt key="kazanc" orta kicker="Özet" baslik="Projedar size ne kazandırır?">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Fiyat disiplini"
          metin="Sahada tek doğru fiyat konuşulur; zam ve kampanya kontrollü, eş zamanlı uygulanır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Çift satış koruması"
          metin="Opsiyon kilidi kapora çakışmalarını ve mağduriyet krizlerini sistemsel olarak engeller."
        />
        <MaddeKart
          Ikon={Users}
          baslik="Yaşayan satış ağı"
          metin="Stoğunuz doğru danışmanlarda, güncel veriyle dolaşır; satış temposu düşmez."
        />
        <MaddeKart
          Ikon={Eye}
          baslik="Tam görünürlük"
          metin="Hangi danışman aktif, hangi birim ilgi görüyor: hepsi panelinizde."
        />
      </div>
    </Slayt>,

    /* 19 · İlk gün (görsel) */
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
          metin="Stok ve tahsisleri concierge ekibimiz sizinle birlikte girer; mevcut Excel listeniz doğrudan içe aktarılır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Radar}
          baslik="İlk hafta ilk sinyaller"
          metin="Görüntüleme, paylaşım ve opsiyon verisi ilk haftadan Talep Radarı'nda birikmeye başlar."
        />
      </div>
    </GorselSlayt>,

    /* 17 · Sonraki adım */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/vinc-siluet.jpg"
      kicker="Sonraki adım"
      baslik="Bir proje verin. Gerisini izleyin."
      alt="Ekibinizin panel öğrenmesi gerekmez: kurulumu biz yapar, ağı birlikte çalıştırırız."
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
