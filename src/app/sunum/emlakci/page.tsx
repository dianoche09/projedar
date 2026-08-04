import type { Metadata } from "next";
import {
  BadgeCheck,
  Clock,
  FileX,
  Lock,
  Percent,
  PhoneCall,
  ShieldCheck,
  Ticket,
  UserX,
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

export const metadata: Metadata = {
  title: "Projedar · Danışman Sunumu",
  description: "Yüz yüze görüşme sunumu: canlı konut stoğu dağıtım ağı, emlakçı tarafı.",
};

/* 12 slayt: kapak, problem, çözüm, akış(demo), mikrosite, opsiyon-mesaj(görsel),
   opsiyon-mekanizma, lead, tazelik, ücret, katılım, CTA. */
export default function EmlakciSunum() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/konut-aksam.jpg"
      logo
      kicker="Projedar · Danışman sunumu"
      baslik="Sana tahsisli projeler. Tek canlı havuz."
      alt="Yeni konut projelerini her an güncel fiyat ve durumla paylaş. Temel üyelik ücretsiz."
    >
      <div className="da da-4 mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12.5px] font-semibold text-[#3ddc8f] backdrop-blur-md">
          <span className="nabiz size-2 rounded-full bg-[#3ddc8f]" /> canlı · şimdi güncellendi
        </span>
        <span className="mono rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold text-white/85 backdrop-blur-md">
          temel üyelik ücretsiz
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
      <div className="grid gap-3 sm:grid-cols-3">
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
          Ikon={UserX}
          baslik="Güven kaybı"
          metin="Satıldı çıkan daire veya eski fiyat, müşteriyi bir daha geri getirmez."
          sinyal="#e07a6e"
        />
      </div>
    </Slayt>,

    /* 3 · Çözüm */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Cebinde canlı satış ofisi"
      alt="Sana tahsisli projeler tek ekranda; her birimin yanında son güncelleme yaşar. Müteahhidi aramadan, listeyi sormadan satarsın."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <OnayMadde>Fiyat ve durum her an canlı; teyit turu yok.</OnayMadde>
          <OnayMadde>Yalnız sana tahsisli projeleri görürsün; havuz sade kalır.</OnayMadde>
          <OnayMadde>Bölge, tip ve bütçeye göre filtrele; saniyeler içinde doğru daire.</OnayMadde>
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
      <KuleDemo />
    </Slayt>,

    /* 5 · Mikrosite */
    <Slayt
      key="mikrosite"
      kicker="Paylaşım"
      baslik="PDF değil: yaşayan satış sayfası"
      alt="Gönderdiğin link her açıldığında canlı fiyatı basar. Üstte canlı stok rozeti, altta senin kartın ve WhatsApp butonun."
    >
      <div className="kart mx-auto max-w-md overflow-hidden p-0 text-left shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
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
    </Slayt>,

    /* 6 · Opsiyon mesajı (görsel) */
    <GorselSlayt
      key="kilit-mesaj"
      gorsel="/sunum/kule-cephe.jpg"
      hiza="sol"
      kicker="Güvence"
      baslik="Opsiyonu aldıysan daire senindir"
      alt="48 saat boyunca daire sana kilitli. Çift satış veritabanı seviyesinde engellidir; kimse daireyi altından alamaz."
    />,

    /* 7 · Opsiyon mekanizması */
    <Slayt key="kilit" orta kicker="Mekanizma" baslik="Kilit nasıl çalışır?">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Lock}
          baslik="Anında kilit"
          metin="Opsiyon aldığın an daire diğer tüm danışman ekranlarında kilitli görünür."
          sinyal="#e8b04b"
        />
        <MaddeKart
          Ikon={Clock}
          baslik="48 saat süre"
          metin="Müşterinle rahat çalış; süre bitince daire kendiliğinden açılır."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="DB seviyesinde kalkan"
          metin="Aynı daireye ikinci aktif opsiyon teknik olarak açılamaz."
        />
      </div>
    </Slayt>,

    /* 8 · Lead koruması */
    <Slayt
      key="lead"
      kicker="Emeğin kayıtlı"
      baslik="Müşterin kayıtla korunur"
      alt="Müşterini platforma kaydedersin. Üretici o ismi veya telefonu sorguladığında ilk kaydın senin olduğunu görür: atlanırsan görünür olur."
    >
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-4">
          <OnayMadde>Lead listen üreticiye akmaz; üretici yalnız tek tek sorgulayabilir.</OnayMadde>
          <OnayMadde>Kaydın tarihiyle birlikte durur; kim önce getirdi tartışması biter.</OnayMadde>
          <OnayMadde>Takip senin elinde: notlar, durum, süreç sende kalır.</OnayMadde>
        </ul>
        <LeadSorguKart />
      </div>
    </Slayt>,

    /* 9 · Tazelik */
    <Slayt
      key="tazelik"
      kicker="Tazelik"
      baslik="Hep günceli paylaşırsın"
      alt="Rozet yeşilse veri canlıdır. Eskiyen veri gizlenmez; sen bir daha eski fiyatla yakalanmazsın."
    >
      <TazelikOlcek />
    </Slayt>,

    /* 10 · Ücret */
    <Slayt
      key="ucret"
      orta
      kicker="Ücret"
      baslik="Temel üyelik ücretsiz. Komisyon kesintisi yok."
      alt="Gelirimizi üreticiyle yaptığımız anlaşmadan alırız. Senin kazandığın komisyon tamamen senindir."
    >
      <div className="grid gap-3 sm:grid-cols-3">
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
      </div>
    </Slayt>,

    /* 11 · Katılım */
    <Slayt
      key="katilim"
      kicker="Katılım"
      baslik="Doğrulanmış danışmanlar ağı"
      alt="Bu ağda herkes belgelidir: üreticiler de danışmanlar da doğrulanır. Rozetin, müşterine ve üreticiye güven verir."
    >
      <AdimSirasi
        adimlar={[
          { baslik: "Kayıt ol", metin: "Birkaç dakikada hesabını aç." },
          { baslik: "Belgeni yükle", metin: "Mesleki yeterlilik belgen ve vergi levhan; doğrulama tamamlanana kadar demo projeyle sistemi keşfedersin." },
          { baslik: "Havuzun açılır", metin: "Doğrulanmış rozetinle tahsisli stoğa erişir, paylaşmaya başlarsın." },
        ]}
      />
    </Slayt>,

    /* 12 · Kapanış CTA */
    <GorselSlayt
      key="cta"
      gorsel="/sunum/sehir-panorama.jpg"
      kicker="Sonraki adım"
      baslik="İlk tahsisli projeni gör"
      alt="Kayıt birkaç dakika sürer; temel üyelik ücretsizdir."
    >
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com/kayit</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Danışman sunumu" slides={slides} />;
}
