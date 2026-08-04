import type { Metadata } from "next";
import {
  BadgeCheck,
  Bell,
  Camera,
  Clock,
  ClipboardList,
  CreditCard,
  Database,
  FileX,
  Filter,
  History,
  Lock,
  Map,
  Megaphone,
  Percent,
  PhoneCall,
  Printer,
  Smartphone,
  Target,
  Ticket,
  UserPlus,
  UserX,
  Wallet,
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

export const metadata: Metadata = {
  title: "Projedar · Danışman Sunumu",
  description: "Yüz yüze görüşme sunumu: canlı konut stoğu dağıtım ağı, emlakçı tarafı.",
};

/* 16 slayt — kapsamlı tur: kapak, problem, çözüm, akış(demo), bul(filtre+harita),
   eşleştirme, mikrosite, kilit(görsel), opsiyon akışı, lead defteri, lansman radarı,
   tazelik, cepte, ücret, katılım, CTA. */
export default function EmlakciSunum() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/konut-aksam.jpg"
      logo
      kicker="Projedar · Danışman sunumu"
      baslik="Sana tahsisli stok. Herkes göremez."
      alt="Yeni konut projelerini canlı fiyatla, kendi adınla, dakikalar içinde paylaş. Üyelik ücretsiz."
    >
      <div className="da da-4 mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12.5px] font-semibold text-[#3ddc8f] backdrop-blur-md">
          <span className="nabiz size-2 rounded-full bg-[#3ddc8f]" /> canlı · şimdi güncellendi
        </span>
        <span className="mono rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold text-white/85 backdrop-blur-md">
          üyelik ücretsiz
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
      baslik={<>&ldquo;Bu daire hâlâ satılık mı?&rdquo;</>}
      alt="Müşteri karşısında en pahalı şey eskiyen bilgidir."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={FileX}
          baslik="Eskiyen PDF listeler"
          metin="WhatsApp gruplarında dolaşan dosyanın kaç günlük olduğu belli değil."
        />
        <MaddeKart
          Ikon={PhoneCall}
          baslik="Teyit turları"
          metin="Her daire için müteahhidi arayıp sormak zaman ve fırsat kaybettirir."
        />
        <MaddeKart
          Ikon={Wallet}
          baslik="Aracılık maliyetleri"
          metin="Portföye erişmek için üyelikler, ilan paketleri, kesintiler: kazanç daha satmadan erir."
        />
        <MaddeKart
          Ikon={UserX}
          baslik="Güven kaybı"
          metin="Satıldı çıkan daire veya eski fiyat, müşteriyi bir daha geri getirmez."
          sinyal="#e07a6e"
        />
      </div>
    </Slayt>,

    /* 3 · Alıntı vuruşu */
    <AlintiSlayt
      key="alinti"
      metin="Müşterine dünün fiyatını söylediğin an, güven biter."
      alt="Proje satışında danışmanın en değerli sermayesi doğru bilgidir. Projedar bu sermayeyi her an cebinde tutar."
    />,

    /* 3 · Çözüm */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Cebinde canlı satış ofisi"
      alt="Sana tahsisli projeler tek ekranda; her birimin yanında son güncelleme yaşar. Müteahhidi aramadan, listeyi sormadan satarsın."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <OnayMadde>Fiyat ve durum her an canlı: masada fiyat tutar, satış iptal olmaz.</OnayMadde>
          <OnayMadde>Yalnız sana tahsisli projeleri görürsün; havuz sade kalır.</OnayMadde>
          <OnayMadde>Onlarca üreticinin sana açık stoğu tek ekranda; proje proje dosya kovalamazsın.</OnayMadde>
        </ul>
        <CanliBirimKart dipnot="Müşteriye giden linkte fiyat bu canlı değerden basılır." />
      </div>
    </Slayt>,

    /* 4 · Nasıl çalışır + KuleDemo */
    <Slayt key="akis" genis kicker="Nasıl çalışır" baslik="Bul, paylaş, kilitle">
      <AdimSirasi
        adimlar={[
          { baslik: "Havuzdan bul", metin: "Bölge, tip, bütçe filtrele; yalnız sana tahsisli stok." },
          { baslik: "İki dokunuşla paylaş", metin: "WhatsApp'a hazır mesaj ve canlı sayfa linki." },
          { baslik: "Müşteri canlıyı görür", metin: "Fiyat ve durum her açılışta güncel; senin kartın üstte." },
          { baslik: "Opsiyon al", metin: "Beğendi mi? 48 saatlik kilitle daireyi güvenceye al." },
        ]}
      />
      <p className="mono mb-3 mt-8 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2fd3bc]">
        Dene: bir daireye dokun, opsiyon kilidini test et
      </p>
      <div style={{ zoom: 0.78 } as React.CSSProperties}>
        <KuleDemo />
      </div>
    </Slayt>,

    /* 5 · Bul: filtre + harita */
    <Slayt
      key="bul"
      kicker="Bul"
      baslik="Doğru daire üç dokunuş uzakta"
      alt="Havuz sadece liste değil: filtre, harita ve bina kesiti aynı ekranda. Müşteri telefondayken doğru daireyi bulursun."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Filter}
          baslik="Akıllı filtreler"
          metin="İl/ilçe, tip, bütçe, durum ve daire özellikleri (manzara, otopark, akıllı ev...) ile saniyede daralt."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Map}
          baslik="Harita görünümü"
          metin="Tahsisli projelerini haritada gör; müşteri 'şu bölgede ne var?' dediğinde cevap ekranda."
        />
        <MaddeKart
          Ikon={Camera}
          baslik="Bina kesiti"
          metin="Blok ve kat kat renkli kesit: hangi cephe, hangi kat müsait, tek bakışta."
        />
      </div>
    </Slayt>,

    /* 6 · Müşteri eşleştirme */
    <Slayt
      key="eslestir"
      kicker="Eşleştirme"
      baslik="Müşterinin kriterini gir, sistem daireyi bulsun"
      alt="Bütçe, tip, bölge, özellik: kriterleri girersin, havuzundaki en uygun daireler uyum sırasına dizilir. Müşteriye 'bakıp döneyim' demezsin."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Target}
          baslik="Uyum skoruyla sıralı"
          metin="Her aday daire kritere ne kadar uyduğuyla puanlanır; en güçlü üç seçenekle müşteriye dönersin."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Clock}
          baslik="Telefon kapanmadan"
          metin="Eşleştirme anlıktır: müşteri hattayken seçenekleri paylaşır, sıcağı sıcağına opsiyon alırsın."
        />
      </div>
    </Slayt>,

    /* 7 · Mikrosite */
    <Slayt
      key="mikrosite"
      kicker="Paylaşım"
      baslik="PDF gönderen kaybediyor"
      alt="Senin gönderdiğin link her açılışta canlı fiyatı basar ve senin adınla açılır. İçinde satışı kapatan her şey:"
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-3">
          <MaddeKart
            Ikon={Camera}
            baslik="Galeri, kat planı, proje künyesi"
            metin="Görseller, kat planı, olanaklar ve imar bilgisi: müşterinin soracağı her şey sayfada."
          />
          <MaddeKart
            Ikon={CreditCard}
            baslik="Oynanabilir ödeme planı"
            metin="Müşteri peşinatı kaydırır, taksit anında değişir; 'hesaplayıp dönerim' devri biter."
            sinyal="#2fd3bc"
          />
          <MaddeKart
            Ikon={UserPlus}
            baslik="Formdan lead sana düşer"
            metin="Sayfadaki formu dolduran müşteri senin lead'in olur; kimse araya giremez."
          />
          <MaddeKart
            Ikon={Printer}
            baslik="Yazdırmaya hazır"
            metin="Aynı sayfa tek tuşla çıktı düzenine döner; masada kâğıt isteyen müşteri de tamam."
          />
        </div>
        <div className="kart overflow-hidden p-0 text-left shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3">
            <span className="taze t-0 text-[11px]">
              <span className="nokta nabiz" /> Canlı stoktan alındı · 2 dk önce güncellendi
            </span>
            <OrnekRozet acik />
          </div>
          <div className="px-4 py-4">
            <p className="font-display text-lg font-extrabold tracking-tight text-ink">Çankaya Vadi · A-7-2</p>
            <p className="mono mt-0.5 text-[11px] text-ink-soft">3+1 · 7. kat · Güney cephe · 142 m² net</p>
            <p className="mono mt-3 text-[26px] font-semibold leading-none tracking-tight text-ink">₺8,45M</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[13px] border border-[var(--cizgi)] bg-[var(--color-soft)] px-3.5 py-3">
              <div>
                <p className="text-[13px] font-bold text-ink">D. Aksoy</p>
                <p className="mono text-[10.5px] text-ink-soft">Gayrimenkul danışmanı</p>
              </div>
              <span className="btn-wa pointer-events-none h-10 min-h-0 px-4 text-[12.5px]">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </Slayt>,

    /* 8 · Opsiyon mesajı (görsel) */
    <GorselSlayt
      key="kilit-mesaj"
      gorsel="/sunum/kule-cephe.jpg"
      hiza="sol"
      kicker="Güvence"
      baslik="Opsiyonu aldıysan daire senindir"
      alt="48 saat boyunca daire sana kilitli. Çift satış veritabanı seviyesinde engellidir; kimse daireyi altından alamaz."
    />,

    /* 9 · Opsiyon akışı */
    <Slayt key="kilit" orta kicker="Mekanizma" baslik="48 saat kimse dokunamaz">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart
          Ikon={Lock}
          baslik="Anında kilit"
          metin="Opsiyon doğduğu an daire tüm danışman ekranlarında kilitli görünür."
          sinyal="#e8b04b"
        />
        <MaddeKart
          Ikon={ClipboardList}
          baslik="Talep → onay"
          metin="Projeye göre talep açarsın, üretici onaylar; ya da doğrudan opsiyon alırsın. Opsiyonlarım sayfasında hepsi takipte."
        />
        <MaddeKart
          Ikon={Clock}
          baslik="48 saat süre"
          metin="Müşterinle rahat çalış; süre bitince daire kendiliğinden açılır."
        />
        <MaddeKart
          Ikon={Database}
          baslik="DB seviyesinde kalkan"
          metin="Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz."
        />
      </div>
    </Slayt>,

    /* 10 · Lead defteri */
    <Slayt
      key="lead"
      kicker="Emeğin kayıtlı"
      baslik="Müşterini kimse elinden alamaz"
      alt="Müşterini kaydeder, durumunu takip edersin. Üretici o ismi sorguladığında ilk kaydın senin olduğunu görür: atlanırsan görünür olur."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Lead defteri sende: müşteri, durum, not; süreç tek ekranda.</OnayMadde>
          <OnayMadde>Lead listen üreticiye akmaz; üretici yalnız tek tek sorgulayabilir.</OnayMadde>
          <OnayMadde>Paylaştıkların da kayıtlı: hangi daireyi kime, ne zaman gönderdin, takibi kolay.</OnayMadde>
        </ul>
        <LeadSorguKart />
      </div>
    </Slayt>,

    /* 11 · Lansman Radarı */
    <Slayt
      key="lansman"
      kicker="Fırsatlar"
      baslik="Kampanya ayağına gelir"
      alt="Tahsisli projelerinde yeni etap, kampanya veya fiyat aksiyonu olduğunda Lansman Radarı'na düşer; duyuruyu kaçırmaz, ilk arayan sen olursun."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Megaphone}
          baslik="Lansman Radarı"
          metin="Sana açık projelerin duyuruları tek akışta; grup mesajı arasında kaybolmaz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Bell}
          baslik="Anlık bildirim"
          metin="Fiyat değişti, yeni tahsis açıldı, opsiyonun onaylandı: panel ve e-posta ile anında haber."
        />
        <MaddeKart
          Ikon={History}
          baslik="Her şey izli"
          metin="Opsiyonların, paylaşımların, lead'lerin: hepsi kendi sayfasında, hesap verilebilir."
        />
      </div>
    </Slayt>,

    /* 12 · Tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Bir daha eski fiyatla yakalanmazsın"
      alt="Rozet yeşilse veri canlıdır. Eskiyen veri gizlenmez, rengiyle kendini ele verir; müşteri karşısında hep en güncel rakam sende."
    >
      <TazelikOlcek />
    </Slayt>,

    /* 13 · Cepte */
    <Slayt
      key="cepte"
      orta
      kicker="Sahada"
      baslik="Ofis değil, cep uygulaması"
      alt="Kurulabilir mobil uygulama (PWA): havuz, paylaşım ve opsiyon telefonunda. Müşterinin karşısında, şantiye önünde, arabada; nerede satış varsa orada."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Smartphone}
          baslik="Telefona kurulur"
          metin="Uygulama mağazası derdi yok; siteden telefona kur, uygulama gibi kullan."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Target}
          baslik="Üç dokunuş"
          metin="Bul, paylaş, opsiyon al: saha akışı üç dokunuşa göre tasarlandı."
        />
        <MaddeKart
          Ikon={Bell}
          baslik="Haber sana gelir"
          metin="Takip ettiğin stokta hareket olunca bildirim düşer; ekran başında beklemezsin."
        />
      </div>
    </Slayt>,

    /* 15 · Ayrıcalık */
    <Slayt
      key="ayricalik"
      kicker="Ayrıcalık"
      baslik="Yetkili ağın içinde olmak"
      alt="Projedar bir ilan sitesi değildir; stoklara yalnız yetkili danışmanlar erişir. İçeride olmak bir ayrıcalıktır ve bu ayrıcalık çalışır:"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Lock}
          baslik="Herkes giremez"
          metin="Sana tahsisli stok rakibinin ekranında yok; elindeki portföy gerçekten senin avantajın."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Target}
          baslik="Aktifliğin görünür"
          metin="Paylaşım ve opsiyon hareketin üreticinin ekranında; iyi çalışan danışmana yeni tahsislerin kapısı açılır."
        />
        <MaddeKart
          Ikon={UserPlus}
          baslik="Üreticiyle doğrudan ilişki"
          metin="Tahsis, üreticinin sana güveninin göstergesi; platform bu ilişkiyi görünür ve kalıcı kılar."
        />
      </div>
    </Slayt>,

    /* 16 · Ücret */
    <Slayt
      key="ucret"
      orta
      kicker="Ücret"
      baslik="Kazancın %100'ü sende"
      alt="Üyelik ücretsiz, komisyondan pay almayız. Gelirimizi proje sahibiyle yaptığımız anlaşmadan alırız; senin kazandığın komisyon tamamen senindir."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Üyelik ücretsiz"
          metin="Temel erişim için ödeme yok; kayıt ol, tahsisli havuzunu gör."
          sinyal="#3ddc8f"
        />
        <MaddeKart
          Ikon={Percent}
          baslik="Komisyonun senin"
          metin="Satıştan pay almayız, aracılık kesintisi yoktur."
        />
        <MaddeKart
          Ikon={Ticket}
          baslik="İlan ücreti yok"
          metin="İlan vermezsin; müşterinle birebir canlı sayfa paylaşırsın."
        />
        <MaddeKart
          Ikon={ClipboardList}
          baslik="Koşullar baştan net"
          metin="Her projenin komisyon koşulu üreticiyle arandaki anlaşmayla baştan bellidir; sürpriz yok."
        />
      </div>
    </Slayt>,

    /* 15 · Katılım */
    <Slayt
      key="katilim"
      kicker="Katılım"
      baslik="Belgeni yükle, ağa gir"
      alt="Bu ağda herkes belgelidir: üreticiler de danışmanlar da doğrulanır. Doğrulanmış rozeti müşterine ve üreticiye tek bakışta güven verir."
    >
      <AdimSirasi
        adimlar={[
          { baslik: "Kayıt ol", metin: "Birkaç dakikada hesabını aç." },
          { baslik: "Belgeni yükle", metin: "Mesleki yeterlilik belgen ve vergi levhan; doğrulama tamamlanana kadar demo projeyle sistemi keşfedersin." },
          { baslik: "Havuzun açılır", metin: "Doğrulanmış rozetinle tahsisli stoğa erişir, paylaşmaya başlarsın." },
        ]}
      />
    </Slayt>,

    /* 16 · Kapanış CTA */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/sehir-panorama.jpg"
      kicker="Sonraki adım"
      baslik="İlk tahsisli projeni gör"
      alt="Kayıt birkaç dakika sürer; üyelik ücretsizdir."
    >
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com/kayit</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Danışman sunumu" slides={slides} />;
}
