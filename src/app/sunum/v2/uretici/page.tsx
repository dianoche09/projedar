import type { Metadata } from "next";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Building2,
  Camera,
  Copy,
  CreditCard,
  Database,
  EyeOff,
  FileSpreadsheet,
  Handshake,
  Layers,
  ListChecks,
  Megaphone,
  Printer,
  Radar,
  Search,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  UserPlus,
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
  DevSayi,
  EkranKart,
  FarkTablosu,
  FiyatListesiMock,
  GorselSlayt,
  LeadSorguKart,
  MaddeKart,
  OnayMadde,
  OrnekRozet,
  SoruKart,
  TazelikOlcek,
  ZamanSatir,
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

    /* 2 · Nedir (teknoloji görsel zemin) */
    <GorselSlayt
      key="nedir"
      gorsel="/sunum/veri-bina.jpg"
      hiza="sol"
      kicker="Bir bakışta"
      baslik="Projedar nedir?"
      alt="İnşaat firmalarıyla gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan, yalnızca yetkili üyelere açık bir konut stoğu ağı. Siz stoğu yönetirsiniz; ağ her zaman sizin belirlediğiniz güncel veriyle satar."
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
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
          metin="Bir daire opsiyonlandığında veritabanı seviyesinde kilitlenir; çift satışın önüne yapısal olarak geçilir."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Tahsisli erişim"
          metin="Hangi danışman hangi projeyi, bloğu, hatta daireyi görür: karar proje sahibinin."
        />
      </div>
    </GorselSlayt>,

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

    /* 3b · Senaryo: 72 saat */
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
          { baslik: "Proje sahibi", alt: "Stok + fiyat + yetki", gorsel: "bina" },
          { baslik: "PROJEDAR", alt: "Canlı senkron ağ", vurgu: true, gorsel: "logo" },
          { baslik: "Yetkili danışmanlar", alt: "Birebir müşteri paylaşımı", gorsel: "danisman" },
        ]}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <OnayMadde>Fiyatı siz belirlersiniz, ağ anında görür.</OnayMadde>
        <OnayMadde>Opsiyon kilidiyle çift satış biter.</OnayMadde>
        <OnayMadde>Kim neyi görür, siz karar verirsiniz.</OnayMadde>
      </ul>
    </Slayt>,

    /* 6 · Özellik: canlı veri (görsel zemin) */
    <GorselSlayt
      key="canli-veri"
      gorsel="/sunum/tech-arayuz.jpg"
      hiza="sol"
      kicker="Özellik · Canlı veri"
      baslik="Değişiklik anında tüm ağda"
    >
      <div className="da da-3 mt-7 grid w-full items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Fiyat ve stok tek merkezden yönetilir; kampanya ve zam aynı saniye tüm ağda geçerli olur.</OnayMadde>
          <OnayMadde>&ldquo;Bende eski liste varmış&rdquo; mazereti kalmaz.</OnayMadde>
          <OnayMadde>Her bilginin üzerinde tazelik damgası yaşar: &ldquo;2 dk önce güncellendi&rdquo; gibi.</OnayMadde>
        </ul>
        <EkranKart url="projedar.com/uretici/stok">
          <FiyatListesiMock />
        </EkranKart>
      </div>
    </GorselSlayt>,

    /* 7 · Özellik: tek kaynak (görsel zemin) */
    <GorselSlayt
      key="tek-kaynak"
      gorsel="/sunum/danisman-musteri.jpg"
      hiza="sol"
      kicker="Özellik · Tek kaynak"
      baslik="PDF değil, yaşayan link"
    >
      <div className="da da-3 mt-7 grid w-full items-center gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          <OnayMadde>Danışman müşterisine dosya değil Projedar linki gönderir; link her açılışta o anki fiyatı gösterir.</OnayMadde>
          <OnayMadde>Ekran görüntüsü ve PDF dolaşımı biter; hiçbir kopya eskimez, çünkü kopya yoktur.</OnayMadde>
          <OnayMadde>Fiyat bilgisi her zaman kaynağından doğrulanır.</OnayMadde>
        </ul>
        <CanliBirimKart dipnot="Danışmanın paylaştığı linkte fiyat bu canlı değerden basılır." />
      </div>
    </GorselSlayt>,

    /* 7a · Satış yüzü: mikrosite turu */
    <Slayt
      key="satis-yuzu"
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

    /* 7c · Satış objesi: ödeme + yatırım + türler */
    <Slayt
      key="satis-objesi"
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

    /* 7b · Kilit mesajı (görsel) */
    <GorselSlayt
      key="kilit-mesaj"
      gorsel="/sunum/kule-cephe.jpg"
      hiza="sol"
      kicker="Güven"
      baslik="Opsiyon bir söz değil. Kilittir."
      alt="İki kapora, iki mağdur, bir mahkeme: bu hikâye burada bitiyor. Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz; çift satışın önüne yapısal olarak geçilir."
    />,

    /* 8 · Özellik: opsiyon kilidi + demo */
    <Slayt
      key="opsiyon"
      genis
      kicker="Özellik · Opsiyon kilidi"
      baslik="Kilidi kendiniz deneyin"
      alt="Kilidin nasıl verileceğini proje bazında siz seçersiniz (anında veya sizin onayınızla); satış da ancak sizin onayınızla kesinleşir."
    >
      <p className="mono mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2fd3bc]">
        Deneyin: bir daireye dokunun, opsiyon kilidini test edin
      </p>
      <EkranKart url="projedar.com/havuz/proje/cankaya-vadi" kucult zemin="acik">
        <KuleDemo />
      </EkranKart>
    </Slayt>,

    /* 9 · Özellik: tahsis + demo */
    <Slayt
      key="tahsis"
      genis
      kicker="Özellik · Tahsis"
      baslik="Kim neyi görür? Siz seçersiniz"
      alt="Stoğunuz herkese değil, seçtiklerinize açılır. Hangi ofisin veya danışmanın hangi projeye, bloğa, daire tipine, hatta tek tek dairelere erişeceğini siz tanımlarsınız; münhasırlık ve kontenjan gibi koşulları da tahsisle belirlersiniz. Yetki anında verilir, anında kaldırılır."
    >
      <EkranKart url="projedar.com/uretici/tahsis" kucult zemin="acik">
        <TahsisPaneli />
      </EkranKart>
    </Slayt>,

    /* 10 · Nasıl çalışır */
    <Slayt key="nasil" kicker="Nasıl çalışır" baslik="Sabah stok girin. Akşam ağ satsın.">
      <AdimSirasi
        akisli
        adimlar={[
          { baslik: "Projenizi yükleyin", metin: "Birim listesi, fiyatlar, kat planları ve görsellerle projenizi tanımlayın. Excel'den içe aktarma var." },
          { baslik: "Danışmanları yetkilendirin", metin: "Çalıştığınız ofisleri ağa davet edin; erişim kapsamını belirleyin." },
          { baslik: "Ağ satışa başlasın", metin: "Danışmanlar canlı veriyle müşterilerine birebir sunum yapar." },
          { baslik: "Opsiyon ve satışı izleyin", metin: "Kilitler, opsiyonlar ve satışlar panelinize anlık düşer." },
        ]}
      />
    </Slayt>,

    /* 10a · Kokpit */
    <Slayt
      key="kokpit"
      kicker="Komuta merkezi"
      baslik="Bütün proje tek ekranda nefes alır"
      alt="Üretici kokpiti: taze stok, satış hızı, açık talepler ve canlı hareket akışı. Satış ofisine sormadan, günün fotoğrafı her an önünüzde."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Radar}
          baslik="Canlı KPI şeridi"
          metin="Müsait, opsiyonda ve satılan birim; bugünkü hareket; ortalama tazelik. Anlık, yorumsuz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Search}
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

    /* 10a2 · Opsiyon akışı detay */
    <Slayt key="opsiyon-akis" kicker="Opsiyon akışı" baslik="Son söz her zaman sizde">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={ListChecks}
          baslik="Talep → onay kuyruğu"
          metin="Danışman opsiyon talebi açar, panelinizdeki kuyruğa düşer; siz onaylayınca kilit doğar. Doğrudan opsiyon da tanımlanabilir."
          sinyal="#e8b04b"
        />
        <MaddeKart
          Ikon={Bell}
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
          metin="Satış ofisinizin sattığı daire ile ağın sattığı daire aynı sistemde; çakışma ihtimali yok."
        />
      </div>
    </Slayt>,

    /* 10a3 · Tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Eski veri bu ağda saklanamaz"
      alt="Her birimin yanında son güncelleme yaşar: 'canlı · 2 dk önce'. Eskiyen veri gizlenmez, rozet rengiyle kendini ele verir."
    >
      <TazelikOlcek />
      <p className="deck-kart deck-soft mt-5 px-5 py-4 text-[13.5px] leading-relaxed">
        15 gün hareketsiz kalan birim tazelik sigortasıyla otomatik işaretlenir; rozeti uyarıya döner ve siz
        güncelleyene kadar öyle kalır. Bu ağda kimse eski veriyle konuşamaz.
      </p>
    </Slayt>,

    /* 10b · Lansman & duyuru */
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
          metin="Kurulabilir mobil uygulama: danışman sahada, siz yoldayken bile ağ elinizin altında."
        />
      </div>
    </Slayt>,

    /* 10c · Zekâ paketi */
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
          metin="Talep sinyali benzer birimlerle kıyaslanır, sistem fiyat önerir. Karar ve onay her zaman sizde."
        />
        <MaddeKart
          Ikon={Radar}
          baslik="Raporlar"
          metin="Görüntülemeden satışa dönüşüm hunisi, en aktif danışmanlar, proje performansı: tek tıkla."
        />
      </div>
    </Slayt>,

    /* 10d · Şeffaflık: lead sorgu */
    <Slayt
      key="lead-sorgu"
      kicker="Şeffaflık"
      baslik={<>&ldquo;Bu müşteri benim&rdquo; kavgası bitiyor</>}
      alt="Danışman müşterisini platformda kaydeder. Satış ofisinize gelen ismi veya telefonu sorgularsınız: ilk kimin kaydı, hangi tarihte, anında ekranda."
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

    /* 12 · Ağın gücü + canlı ağ diyagramı (birleşik) */
    <Slayt
      key="agin-gucu"
      genis
      kicker="Ağın gücü"
      baslik="Danışmanlar neden Projedar'da?"
      alt="Üyelik danışmana ücretsiz, komisyonundan kesinti yok, canlı veri onun en büyük satış avantajı: bu yüzden ağ gerçekten satar. Aşağıda canlı ağ: bir danışmanın üstüne gelin, yalnız ona tahsisli hat parlar."
    >
      <EkranKart url="projedar.com" kucult zemin="acik">
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

    /* 14 · Platform araçları (görsel zemin) */
    <GorselSlayt key="platform" gorsel="/sunum/sehir-panorama.jpg" hiza="sol" kicker="Platform" baslik="Panelinizdeki araçlar">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
    </GorselSlayt>,

    /* 15 · Güven (görsel zemin) */
    <GorselSlayt key="guven" gorsel="/sunum/konut-aksam.jpg" hiza="sol" kicker="Güven" baslik="İlan sitesi değil, üyelere özel iş ağı">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
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
        <MaddeKart
          Ikon={UserPlus}
          baslik="Kendi ağınızı davet edin"
          metin="Çalıştığınız ofisleri ve danışmanları davet linkiyle içeri alırsınız; ağınız ilk günden hazır gelir."
        />
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Belgeli danışmanlar"
          metin="Her danışman mesleki yeterlilik belgesi ve vergi levhasıyla doğrulanır; belgesiz kimse stoğunuzu göremez."
        />
      </div>
    </GorselSlayt>,

    /* 16 · Regülasyon (dev rakam) */
    <Slayt key="regulasyon" genis kicker="Regülasyon" baslik="Yeni ilan düzenlemesi Projedar'ın lehine">
      <div className="grid items-center gap-8 lg:grid-cols-[340px_1fr]">
        <DevSayi
          deger="286 bin TL+"
          etiket="Kural dışı sosyal medya ilan paylaşımı başına öngörülen idari para cezası"
          kaynak="EİDS düzenlemesi · Şubat 2026"
          renk="#e07a6e"
        />
        <ul className="space-y-4">
          <OnayMadde>
            <b>İlan değil, tahsis:</b> Projedar&apos;da halka açık ilan yoktur. Bilgi yalnız yetkili danışmana tahsisle, müşteriye birebir linkle ulaşır; ilan kapsamına girmez.
          </OnayMadde>
          <OnayMadde>
            <b>Prestijiniz korunur:</b> projeniz portallarda onlarca farklı fiyatla dolaşan bir pazar tezgâhına dönmez; sahada yalnız onaylı bilgi vardır.
          </OnayMadde>
          <OnayMadde>
            <b>Danışman ağınız da güvende:</b> danışmanlarınız ceza riski taşıyan ilanlar yerine ağ içi tahsisli linkle satar: hızlı, kontrollü, mevzuata uyumlu.
          </OnayMadde>
        </ul>
      </div>
    </Slayt>,

    /* 17 · SSS */
    <Slayt key="sss" kicker="Sık sorulanlar" baslik="Aklınıza takılanlar">
      <div className="grid gap-3 sm:grid-cols-2">
        <SoruKart
          soru="Stoğumuz internete açılıyor mu?"
          cevap="Hayır. Stoğunuz halka açık değildir; verinizi yalnızca yetkilendirdiğiniz danışmanlar görür, açık ilan yayınlanmaz."
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
            { baslik: "Çift satış çakışmaları ortadan kalkar", metin: "Opsiyon kilidi ve kayıtlı süreç, kapora çakışmalarını ve mağduriyetleri bitirir." },
            { baslik: "Kontrol ve talep zekâsı sizde", metin: "Kim neyi görür siz seçersiniz; ağdaki her sinyal Talep Radarı'nda fiyat ve satış kararına dönüşür." },
          ]}
        />
      </div>
    </GorselSlayt>,

    /* 19 · Başlangıç */
    <Slayt key="baslangic" kicker="Başlangıç" baslik="Yayına alma süreci">
      <AdimSirasi
        akisli
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
