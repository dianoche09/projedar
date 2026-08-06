import type { Metadata } from "next";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ClipboardList,
  FileX,
  Filter,
  Flag,
  Gavel,
  Lock,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Percent,
  ShieldCheck,
  Smartphone,
  Target,
  UserPlus,
  Wallet,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  AkisSema,
  AlintiSlayt,
  EkranKart,
  FarkTablosu,
  FiyatListesiMock,
  GorselSlayt,
  MaddeKart,
  OnayMadde,
  OrnekRozet,
  SoruKart,
} from "@/components/sunum/parcalar";
import { KuleDemo } from "@/components/landing/KuleDemo";

export const metadata: Metadata = {
  title: "Projedar · Danışman Sunumu v2",
  description: "Gayrimenkul danışmanları için Projedar tanıtım sunumu (v2).",
};

/* v2 — sade anlatım kurgusu: kapak, nedir, sorun, alıntı, çözüm(şema), canlı veri,
   tek kaynak(mikrosite), opsiyon(demo), kazanç modeli, nasıl çalışır, değer önerisi,
   fark tablosu, platform araçları, ayrıcalık, regülasyon, SSS, örnek akış, özet, CTA. */
export default function EmlakciSunumV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/konut-aksam.jpg"
      logo
      kicker="Projedar · Gayrimenkul danışmanları için"
      baslik="Canlı stok, güncel fiyat, kilitli opsiyon"
      alt="Yetkili olduğun projelerin daima güncel birim ve fiyat bilgisine eriş; müşterine tek linkle sun, opsiyonu kilitle. Kurucu danışman ol: ilk 1000 üye ücretsiz. Komisyon kesintisi yok, kazancının %100'ü senin."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Bloklar yükselir. Stok erir.
      </p>
    </GorselSlayt>,

    /* 2 · Nedir (teknoloji görsel zemin) */
    <GorselSlayt
      key="nedir"
      gorsel="/sunum/tech-arayuz.jpg"
      hiza="sol"
      kicker="Bir bakışta"
      baslik="Projedar nedir?"
      alt="İnşaat firmalarıyla gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan, yalnızca yetkili danışmanlara açık bir konut stoğu ağı. Sen müşterini getirirsin; Projedar sana her an doğru ürün bilgisini ve opsiyon güvencesini sağlar."
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri"
          metin="Fiyat veya stok değişikliği tüm ağa anında yayılır; her bilginin üzerinde 'ne zaman güncellendi' damgası durur."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Tek kaynak"
          metin="Paylaştığın link her açılışta güncel değeri gösterir; kopyalanan PDF'ler tarihe karışır."
        />
        <MaddeKart
          Ikon={Lock}
          baslik="Opsiyon kilidi"
          metin="Opsiyonladığın daire veritabanı seviyesinde sana kilitlenir; çift satışın önüne yapısal olarak geçilir."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Tahsisli erişim"
          metin="Sana açılan stok rakibinin ekranında yok; içeride olmak gerçek bir avantaj."
        />
      </div>
    </GorselSlayt>,

    /* 3 · Sorun (görsel zemin) */
    <GorselSlayt
      key="sorun"
      gorsel="/sunum/excel-kaos.jpg"
      hiza="sol"
      kicker="Sorun"
      baslik="Proje satarken sahada neler yaşanıyor?"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={FileX}
          baslik="Eski fiyat listeleri"
          metin="Elindeki PDF üç zam öncesinden kalma; müşteri karşısında yanlış fiyat vermek güvenini zedeler."
        />
        <MaddeKart
          Ikon={PhoneCall}
          baslik="Doğru bilgiye ulaşmak zor"
          metin="Hangi daire boş? Satış ofisini arayıp teyit beklemek müşteri kaybettirir."
        />
        <MaddeKart
          Ikon={Flag}
          baslik="Kapora çakışmaları"
          metin="Sen müşteri getirirken daire başkasına satılmış çıkar; emeğin ve itibarın yanar."
          sinyal="#e07a6e"
        />
        <MaddeKart
          Ikon={Wallet}
          baslik="Aracılık maliyetleri"
          metin="Portföy erişimi için üyelikler, ilan paketleri, kesintiler: kazanç daha satmadan erir."
        />
      </div>
    </GorselSlayt>,

    /* 4 · Alıntı */
    <AlintiSlayt
      key="alinti"
      metin="Müşterine dünün fiyatını söylediğin an, güven biter."
      alt="Proje satışında danışmanın en değerli sermayesi doğru bilgidir. Projedar bu sermayeyi her an cebinde tutar."
    />,

    /* 5 · Çözüm + şema */
    <Slayt
      key="cozum"
      genis
      kicker="Çözüm"
      baslik="Proje stoğu cebinde, canlı"
      alt="Yetkilendirildiğin projelerin birim, fiyat ve durum bilgisi her an güncel olarak önünde. Müşterine tek link gönderirsin; o link her açılışta doğru bilgiyi gösterir."
    >
      <AkisSema
        dugumler={[
          { baslik: "Proje sahipleri", alt: "Canlı stok + fiyat", gorsel: "bina" },
          { baslik: "PROJEDAR", alt: "Yetkili erişim + kilit", vurgu: true, gorsel: "logo" },
          { baslik: "Sen → Müşterin", alt: "Birebir link paylaşımı", gorsel: "danisman" },
        ]}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <OnayMadde>Üyelik tamamen ücretsiz.</OnayMadde>
        <OnayMadde>Satışından komisyon alınmaz.</OnayMadde>
        <OnayMadde>Opsiyon kilidi emeğini korur.</OnayMadde>
      </ul>
    </Slayt>,

    /* 6 · Canlı veri (görsel zemin) */
    <GorselSlayt
      key="canli-veri"
      gorsel="/sunum/satis-ofisi.jpg"
      hiza="sol"
      kicker="Özellik · Canlı veri"
      baslik="Her an satış ofisi kadar güncel"
    >
      <div className="da da-3 mt-7 grid w-full items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Üretici fiyat güncellediğinde bilgi aynı saniye ekranına yansır; teyit telefonu biter.</OnayMadde>
          <OnayMadde>Tazelik damgası bilgini kanıtlar: &ldquo;2 dk önce güncellendi&rdquo; gibi.</OnayMadde>
          <OnayMadde>Satılan daire anında kapanır; boşuna pazarlamazsın.</OnayMadde>
        </ul>
        <EkranKart url="projedar.com/havuz">
          <FiyatListesiMock />
        </EkranKart>
      </div>
    </GorselSlayt>,

    /* 7 · Tek kaynak: adınla canlı sayfa */
    <Slayt
      key="tek-kaynak"
      kicker="Özellik · Tek kaynak"
      baslik="WhatsApp'tan tek link, hep doğru"
      alt="Müşterine PDF değil, senin adına hazırlanan canlı bir sunum sayfası gönderirsin: galeri, kat planı, ödeme planı hesaplayıcı, konum ve her açılışta o anki güncel fiyat."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          <OnayMadde>Adına imzalı, müşteriye özel sayfa; senin kartın en üstte.</OnayMadde>
          <OnayMadde>Galeri, ödeme planı ve konum tek linkte.</OnayMadde>
          <OnayMadde>Sayfadaki formu dolduran müşteri senin lead&apos;in olur.</OnayMadde>
        </ul>
        <EkranKart url="projedar.com/p/vadi-a07">
        <div className="kart overflow-hidden p-0 text-left">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3">
            <span className="taze t-0 text-[11px]">
              <span className="nokta nabiz" /> Canlı stoktan alındı · 2 dk önce güncellendi
            </span>
            <OrnekRozet acik />
          </div>
          <div className="px-4 py-4">
            <p className="font-display text-lg font-extrabold tracking-tight text-ink">Vadi Konakları · A-07</p>
            <p className="mono mt-0.5 text-[11px] text-ink-soft">3+1 · 7. kat · 142 m² net</p>
            <p className="mono mt-3 text-[26px] font-semibold leading-none tracking-tight text-ink">₺6.320.000</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[13px] border border-[var(--cizgi)] bg-[var(--color-soft)] px-3.5 py-3">
              <div>
                <p className="text-[13px] font-bold text-ink">D. Aksoy</p>
                <p className="mono text-[10.5px] text-ink-soft">Gayrimenkul danışmanı</p>
              </div>
              <span className="btn-wa pointer-events-none h-10 min-h-0 px-4 text-[12.5px]">WhatsApp</span>
            </div>
          </div>
        </div>
        </EkranKart>
      </div>
    </Slayt>,

    /* 8 · Opsiyon + demo */
    <Slayt
      key="opsiyon"
      genis
      kicker="Özellik · Opsiyon kilidi"
      baslik="Müşterin için daireyi kilitle"
      alt="Müşterin karar aşamasındayken daireyi opsiyonlarsın: daire veritabanı seviyesinde sana kilitlenir. Başka danışman aynı daireyi satamaz; 'sattık, kusura bakma' araması tarihe karışır. Süre bitince daire kendiliğinden serbest kalır."
    >
      <p className="mono mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#2fd3bc]">
        Dene: bir daireye dokun, opsiyon kilidini test et
      </p>
      <EkranKart url="projedar.com/havuz/proje/cankaya-vadi" kucult zemin="acik">
        <KuleDemo />
      </EkranKart>
    </Slayt>,

    /* 9 · Kazanç modeli (görsel zemin) */
    <GorselSlayt
      key="kazanc"
      gorsel="/sunum/anahtar-teslim.jpg"
      hiza="sol"
      kicker="Kazanç modeli"
      baslik="Kurucu üyelik ücretsiz, komisyonsuz kazanç"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Kurucu: ilk 1000 ücretsiz"
          metin="İlk 1000 kurucu danışman için kayıt, erişim ve kullanım ücretsiz (ilk yıl); ilan paketi, abonelik yok."
          sinyal="#3ddc8f"
        />
        <MaddeKart
          Ikon={Percent}
          baslik="Komisyon kesintisi yok"
          metin="Satıştan kazandığın komisyon tamamen senin; Projedar pay almaz."
        />
        <MaddeKart
          Ikon={ClipboardList}
          baslik="Koşullar baştan net"
          metin="Her projenin komisyon ve satış koşulları üreticiyle arandaki anlaşmayla belirlenir; platform şeffaf zemin sunar."
        />
      </div>
      <p className="da da-4 deck-kart mt-4 w-full px-5 py-4 text-[14px] font-semibold leading-relaxed text-white/90">
        Maliyetin sıfır, kazancın senin: Projedar gelirini proje sahiplerinden elde eder.
      </p>
    </GorselSlayt>,

    /* 10 · Nasıl çalışır */
    <Slayt key="nasil" kicker="Nasıl çalışır" baslik="Kayıttan satışa dört adım">
      <AdimSirasi
        akisli
        adimlar={[
          { baslik: "Ücretsiz kaydol", metin: "Ofis veya bireysel danışman olarak başvur; profilin oluşsun." },
          { baslik: "Yetki al", metin: "Proje sahipleri seni yetkilendirsin; erişimin anında açılsın." },
          { baslik: "Linkle sun", metin: "Müşterine birebir link gönder; her açılışta güncel bilgi görsün." },
          { baslik: "Opsiyonla, sat", metin: "Daireyi kilitle, satışı kapat; komisyonun tamamen senin." },
        ]}
      />
    </Slayt>,

    /* 11 · Değer önerisi (görsel zemin) */
    <GorselSlayt
      key="deger"
      gorsel="/sunum/danisman-musteri.jpg"
      hiza="sol"
      kicker="Değer önerisi"
      baslik="Projedar danışmana ne kazandırır?"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Hız ve doğruluk"
          metin="Teyit telefonları olmadan anında doğru bilgi; müşteri karşısında hep bir adım önde olursun."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Flag}
          baslik="Korunan emek"
          metin="Opsiyon kilidi + 'ilk kaydeden' izi: müşterin satış ofisine tek başına gitse bile kimin getirdiği bellidir."
        />
        <MaddeKart
          Ikon={Filter}
          baslik="Proje portföyü"
          metin="Yetkili olduğun projelerin tüm stoğu tek ekranda; portföy maliyeti sıfır."
        />
        <MaddeKart
          Ikon={BadgeCheck}
          baslik="Profesyonel imaj"
          metin="Müşteriye canlı, doğrulanabilir veriyle sunum yapmak seni rakiplerinden ayırır."
        />
      </div>
    </GorselSlayt>,

    /* 12 · Fark tablosu */
    <Slayt key="fark" genis kicker="Fark" baslik="Bugünkü düzen ve Projedar">
      <FarkTablosu
        eski={[
          "Elindeki fiyat listesi kaç zam öncesinden kalma, belirsiz",
          "Boş daireyi öğrenmek için satış ofisini arayıp beklersin",
          "Getirdiğin müşterinin dairesi başkasına satılabilir",
          "Portföy erişimi için üyelik ve ilan paketlerine ödersin",
        ]}
        yeni={[
          "Fiyat ve stok her an güncel, teyide gerek yok",
          "Tüm birim durumları tek ekranda, anında",
          "Opsiyon kilidi daireyi sana kilitler, emeğin korunur",
          "Kurucu üyelik ücretsiz, kazancından kesinti yok",
        ]}
      />
    </Slayt>,

    /* 13 · Platform araçları */
    <Slayt key="platform" genis kicker="Platform" baslik="Gündelik işini kolaylaştıran araçlar">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MaddeKart
          Ikon={Filter}
          baslik="Proje ve birim ekranı"
          metin="Yetkili projeler tek ekranda: konum ve özellik filtreleri, harita görünümü, canlı durum."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Birebir paylaşım linki"
          metin="Müşteriye özel link; WhatsApp'tan tek dokunuşla gönderim."
        />
        <MaddeKart
          Ikon={Lock}
          baslik="Opsiyon yönetimi"
          metin="Daireyi kilitle; opsiyon süreni ve durumunu takip et."
        />
        <MaddeKart
          Ikon={Bell}
          baslik="Anlık bildirimler"
          metin="Fiyat değişimi, yeni kampanya, stok hareketi: anında haberin olur."
        />
        <MaddeKart
          Ikon={Smartphone}
          baslik="Mobil kullanım"
          metin="Sahada, müşteri yanında; tüm bilgiler telefonunda."
        />
        <MaddeKart
          Ikon={BookOpen}
          baslik="Müşteri kataloğu"
          metin="Seçtiğin daireleri tek tıkla şık bir fiyat listesine dönüştür; katalogdaki her fiyat canlı basılır."
        />
        <MaddeKart
          Ikon={Target}
          baslik="Müşteri eşleştirme"
          metin="Müşterinin kriterini gir; havuzundaki en uygun daireler uyum skoruyla sıralansın."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={ClipboardList}
          baslik="Lead defteri"
          metin="Müşterini kaydet, durumunu takip et; 'ilk kaydeden' izi emeğini korur."
        />
        <MaddeKart
          Ikon={Megaphone}
          baslik="Lansman Radarı"
          metin="Tahsisli projelerinin kampanya ve etap duyuruları tek akışta; fırsatı kaçırmazsın."
        />
      </div>
    </Slayt>,

    /* 14 · Ayrıcalık */
    <Slayt key="ayricalik" kicker="Ayrıcalık" baslik="Yetkili ağın içinde olmak">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Lock}
          baslik="Yalnız yetkililere açık"
          metin="Projedar bir ilan sitesi değildir; stoklara yalnızca yetkili danışmanlar erişir. İçeride olmak bir ayrıcalıktır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={UserPlus}
          baslik="Üreticiyle doğrudan ilişki"
          metin="Yetki, üreticinin sana güveninin göstergesidir; platform bu ilişkiyi görünür ve kalıcı kılar."
        />
        <MaddeKart
          Ikon={Flag}
          baslik="İlk bayrağı sen dikersin"
          metin="Kaydettiğin her müşteri adayı adına yazılır; üretici o müşteriyi sorguladığında ilk getirenin sen olduğunu görür."
        />
        <MaddeKart
          Ikon={Target}
          baslik="Aktifliğin görünür"
          metin="Paylaşım ve opsiyon hareketin üreticiler tarafından görülür; yeni yetkilendirmelerin kapısını açar."
        />
      </div>
    </Slayt>,

    /* 15 · Regülasyon */
    <Slayt
      key="regulasyon"
      kicker="Regülasyon"
      baslik="İlan cezası riski olmadan paylaş"
      alt="Şubat 2026'dan beri satılık ilanlar EİDS kaydına bağlı; kurala aykırı sosyal medya paylaşımlarına 286 bin TL'yi aşan idari para cezası öngörülüyor."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Gavel}
          baslik="Projedar linki ilan değildir"
          metin="Müşterine gönderdiğin sayfa halka açık ilan değil, sana tahsisli birebir sunumdur; yalnız yetkili ağ içinde dolaşır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="WhatsApp'ta güvenle"
          metin="İlan açmadan, ceza riski taşımadan müşterine profesyonel sunum yaparsın; link her açılışta güncel."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Profesyonel fark"
          metin="Rakiplerin mevzuatla boğuşurken sen yetkili ağın içinden, üreticinin onaylı bilgisiyle çalışırsın."
        />
      </div>
    </Slayt>,

    /* 16 · SSS */
    <Slayt key="sss" kicker="Sık sorulanlar" baslik="Aklına takılanlar">
      <div className="grid gap-3 sm:grid-cols-2">
        <SoruKart
          soru="Gerçekten tamamen ücretsiz mi?"
          cevap="Evet. Üyelik, erişim ve kullanım ücretsizdir; satış komisyonundan da kesinti yapılmaz. Projedar gelirini proje sahiplerinden elde eder."
        />
        <SoruKart
          soru="Müşterimi platform kapar mı?"
          cevap="Hayır. Paylaşım birebir linkle yapılır; müşteri senin müşterindir, platform araya girmez."
        />
        <SoruKart
          soru="Hangi projelere erişirim?"
          cevap="Proje sahiplerinin seni yetkilendirdiği projelere. Yetki, üreticiyle arandaki iş ilişkisine dayanır."
        />
        <SoruKart
          soru="Opsiyon nasıl işler?"
          cevap="Müşterin için daireyi panelden opsiyonlarsın; daire sana kilitlenir, süre bitiminde otomatik serbest kalır."
        />
      </div>
    </Slayt>,

    /* 17 · Örnek akış (görsel zemin) */
    <GorselSlayt
      key="ornek-akis"
      gorsel="/sunum/el-sikisma.jpg"
      hiza="sol"
      kicker="Örnek akış"
      baslik="Bir satışın hikâyesi"
    >
      <div className="da da-3 mt-8 w-full">
        <AdimSirasi
          akisli
          adimlar={[
            { baslik: "Talep geldi", metin: "Müşterin yeni projede 3+1 arıyor; yetkili olduğun projeleri açıyorsun." },
            { baslik: "Link gönderdin", metin: "Uygun dairenin linkini WhatsApp'tan paylaştın; müşteri güncel fiyatı gördü." },
            { baslik: "Opsiyonladın", metin: "Müşteri ciddileşti; daireyi kilitledin. Artık kimse o daireyi satamaz." },
            { baslik: "Satışı kapattın", metin: "Sözleşme imzalandı; komisyonun kesintisiz senin." },
          ]}
        />
      </div>
    </GorselSlayt>,

    /* 18 · Özet */
    <Slayt key="ozet" kicker="Özet" baslik="Üç cümlede Projedar">
      <AdimSirasi
        adimlar={[
          { baslik: "Her an doğru bilgiyle satarsın", metin: "Canlı fiyat ve stok cebinde; müşteri karşısında asla eski veriyle kalmazsın." },
          { baslik: "Emeğin sistemle korunur", metin: "Opsiyon kilidi ve 'ilk kaydeden' izi, getirdiğin müşteriyi ve hak edişini güvenceye alır." },
          { baslik: "Maliyetin sıfırdır", metin: "Kurucu üyelik ücretsiz, komisyon kesintisi yok; kazandığın tamamen senin." },
        ]}
      />
    </Slayt>,

    /* 19 · CTA */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/sehir-panorama.jpg"
      kicker="Sonraki adım"
      baslik="Erken kaydol, ilk yetkilendirilenlerden ol"
      alt="Projedar yeni açılıyor: şimdi ücretsiz kaydolan danışmanlar, ağ büyüdükçe ilk yetkilendirilen profesyoneller arasında yer alır. Kayıt birkaç dakika sürer."
    >
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com/kayit</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Danışman sunumu · v2" slides={slides} />;
}
