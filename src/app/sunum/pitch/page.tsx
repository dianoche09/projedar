import type { Metadata } from "next";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Copy,
  Database,
  EyeOff,
  Gavel,
  Handshake,
  Layers,
  MessageCircle,
  Network,
  Radar,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import { AdimSirasi, DevSayi, GorselSlayt, MaddeKart, OnayMadde } from "@/components/sunum/parcalar";
import { KuleDemo } from "@/components/landing/KuleDemo";

export const metadata: Metadata = {
  title: "Projedar · Pitch Deck",
  description: "Yatırımcı sunumu: yeni konut satışının canlı altyapısı.",
};

/* Rekabet matrisi hücresi (2×2: stok kontrolü × erişim) */
function MatrisHucre({
  baslik,
  ornek,
  biz = false,
}: {
  baslik: string;
  ornek: string;
  biz?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-left sm:p-5 ${
        biz
          ? "border-[#2fd3bc] bg-[rgba(47,211,188,0.12)] shadow-[0_0_40px_rgba(47,211,188,0.15)]"
          : "deck-kart"
      }`}
    >
      <p className={`text-[14px] font-bold ${biz ? "text-[#2fd3bc]" : "text-white"}`}>{baslik}</p>
      <p className={`mt-1.5 text-[12px] leading-relaxed ${biz ? "text-white/90" : "deck-soft"}`}>{ornek}</p>
    </div>
  );
}

/* 14 slayt: kapak, problem(görsel), problem-detay, çözüm, ürün(demo), pazar,
   neden-şimdi, iş modeli, rekabet, moat, ürün-durumu, GTM özeti, vizyon(görsel), kapanış. */
export default function PitchDeck() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/sehir-panorama.jpg"
      logo
      kicker="Projedar · Pitch deck"
      baslik="Yeni konut satışının canlı altyapısı"
      alt="Çok-müteahhitli, üretici-kontrollü, tahsisli canlı stok dağıtım ağı. Komisyonsuz; yalnızca yetkili danışmanlara açık."
    >
      <p className="da da-4 mono mt-12 text-[10px] uppercase tracking-[0.18em] text-white/50">
        ok tuşları veya kaydırma ile ilerleyin
      </p>
    </GorselSlayt>,

    /* 2 · Problem (görsel mesaj) */
    <GorselSlayt
      key="problem-mesaj"
      gorsel="/sunum/santiye-gece.jpg"
      hiza="sol"
      kicker="Problem"
      baslik="540 bin yeni konut, Excel ve WhatsApp'la satılıyor"
      alt="Türkiye'de 2025'te 540.786 ilk el konut satıldı (TÜİK). Bu satışların arkasındaki müteahhit-emlakçı koordinasyonu hâlâ kopya listeler ve telefon teyitleriyle dönüyor."
    />,

    /* 3 · Problemin maliyeti */
    <Slayt
      key="problem-detay"
      kicker="Problemin maliyeti"
      baslik="Kontrol yok, güven yok, veri yok"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Copy}
          baslik="Fiyat listesi anında eskir"
          metin="Müteahhit zam yapar; sahada onlarca eski kopya dolaşmaya devam eder. Yanlış fiyat pazarlığı gündelik olaydır."
        />
        <MaddeKart
          Ikon={AlertTriangle}
          baslik="Çift satış gerçek bir risk"
          metin="Aynı daireye iki kapora alınabilir; sonucu tazminat ve itibar kaybıdır."
          sinyal="#e07a6e"
        />
        <MaddeKart
          Ikon={EyeOff}
          baslik="Müteahhit kontrolü kaybeder"
          metin="Stok hangi emlakçıda, kim neyi kime hangi fiyatla anlatıyor: görünmez."
        />
        <MaddeKart
          Ikon={BarChart3}
          baslik="Talep verisi yok"
          metin="Hangi tip ilgi görüyor, hangi kat satmıyor: fiyat kararları veriye değil hisse dayanır."
        />
      </div>
    </Slayt>,

    /* 4 · Çözüm */
    <Slayt
      key="cozum"
      kicker="Çözüm"
      baslik="Tahsisli canlı satış ağı"
      alt="Dört mekanizma tek üründe birleşir. Bu birleşim incelediğimiz hiçbir yerli veya global rakipte yok."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Çok-müteahhitli canlı havuz"
          metin="Fiyat ve durum tek doğru kaynakta; her paylaşım canlı değerden basılır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Granüler tahsis"
          metin="Üretici stoğu ofis, danışman, blok, kat, süre bazında kime açacağını seçer."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Database}
          baslik="DB seviyesinde çift-satış kalkanı"
          metin="Aktif opsiyon veritabanı kuralıyla teklenir; 48 saat kilit, otomatik açılma."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Handshake}
          baslik="Komisyonsuz model"
          metin="Gelir müteahhit anlaşmasından; taraflar arasındaki komisyona dokunulmaz."
          sinyal="#2fd3bc"
        />
      </div>
    </Slayt>,

    /* 5 · Ürün (canlı demo) */
    <Slayt key="urun" genis kicker="Ürün · canlı demo" baslik="Slayt değil, çalışan ürün">
      <p className="deck-soft -mt-3 mb-5 text-[14px]">
        Bu bir görsel değil: aşağıdaki bina kesiti etkileşimli. Bir daireye dokunun, opsiyon kilidini deneyin.
      </p>
      <div style={{ zoom: 0.78 } as React.CSSProperties}>
        <KuleDemo />
      </div>
    </Slayt>,

    /* 6 · Pazar */
    <Slayt
      key="pazar"
      genis
      kicker="Pazar"
      baslik="Rekor kıran bir pazarın koordinasyon katmanı"
      alt="Konut satışı 2025'te tüm zamanların rekorunu kırdı. Biz konutun kendisini değil, her ilk el satışın arkasındaki koordinasyonu ürünleştiriyoruz."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DevSayi deger="1,69M" etiket="Toplam konut satışı, 2025 (+%14,3)" kaynak="TÜİK" />
        <DevSayi deger="540.786" etiket="İlk el (yeni konut) satışı, 2025 (+%11,6)" kaynak="TÜİK" renk="#2fd3bc" />
        <DevSayi deger="%32" etiket="İlk elin toplam satış içindeki payı" kaynak="TÜİK" />
        <DevSayi deger="+%49,3" etiket="İpotekli satışlarda yıllık artış: canlanan talep" kaynak="TÜİK" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Giriş pazarı Ankara: 2025&apos;te 152.534 konut satışıyla Türkiye&apos;nin ikinci büyük pazarı; İstanbul (280.262)
        ve İzmir (96.998) sıradaki genişleme adımları.
      </p>
    </Slayt>,

    /* 7 · Neden şimdi */
    <Slayt key="neden-simdi" kicker="Neden şimdi" baslik="Dört dalga aynı anda kırılıyor">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Gavel}
          baslik="Regülasyon: EİDS"
          metin="Şubat 2026'dan beri açık ilan sıkı yetki belgesi rejiminde; kural dışı sosyal medya paylaşımının cezası ilan başına 286.206 TL. 'İlan yok, tahsis var' modeli regülasyonun doğru tarafında."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Rocket}
          baslik="Rekor hacim, sert rekabet"
          metin="Satış hızı müteahhidin nakit akışı demek. Stok fazlası dönemde 'en hızlı satan kanal' kazanır."
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Saha WhatsApp'ta yaşıyor"
          metin="Emlakçının iş akışı zaten mobil ve WhatsApp-native; ürün bu alışkanlığın üstüne kurulu, alışkanlık değiştirmiyor."
        />
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Fiyat oynaklığı"
          metin="Yüksek enflasyon ortamında proje fiyatları ayda birkaç kez güncelleniyor; 'güncel veri' hiç olmadığı kadar kritik ve hiç olmadığı kadar kırılgan."
          sinyal="#2fd3bc"
        />
      </div>
    </Slayt>,

    /* 8 · İş modeli */
    <Slayt
      key="is-modeli"
      kicker="İş modeli"
      baslik="Gelir üreticiden, büyüme danışman ağından"
      alt="İlke değişmez: komisyona dokunmuyoruz. Yazılım, erişim ve veriden gelir."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Handshake}
          baslik="Bugün: müteahhit anlaşması"
          metin="Proje başına yıllık anlaşma; birebir B2B satış. Ana gelir kaynağı."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Users}
          baslik="Bugün: emlakçı ücretsiz"
          metin="Temel erişim bedava; ağın hızla büyümesini sağlayan kaldıraç."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Yarın: SaaS katmanları"
          metin="Değer kanıtlanınca ofis/franchise aboneliği ve emlakçı premium hizmetleri."
        />
      </div>
    </Slayt>,

    /* 9 · Rekabet (2×2) */
    <Slayt
      key="rekabet"
      kicker="Rekabet"
      baslik="Bu modeli yapan başka kimse yok"
      alt="Piyasadaki çözümler dört gruba ayrılıyor. Çok müteahhitli, üretici kontrollü ve komisyonsuz ağ kuran tek oyuncu biziz."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MatrisHucre
          baslik="Açık erişim · emlakçı kontrolü"
          ornek="İlan portalları, Topli (komisyonlu pazaryeri): stok kontrolü dağınık, fiyat disiplini yok."
        />
        <MatrisHucre
          baslik="Açık erişim · müteahhit kontrolü"
          ornek="Statik proje katalogları (Connject): medya var, canlı stok ve tahsis yok."
        />
        <MatrisHucre
          baslik="Tahsisli · emlakçı kontrolü"
          ornek="MLS/CRM ağları (RE-OS): emlakçı-merkezli, komisyonlu; müteahhit kontrolü yok."
        />
        <MatrisHucre
          biz
          baslik="Tahsisli · müteahhit kontrolü · çok-üretici"
          ornek="Projedar: canlı havuz + tahsisli erişim + veritabanında çift satış kalkanı + komisyonsuz. Bu alanda tek oyuncu biziz."
        />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Tek-firma CRM&apos;ler (Novo, Konutmatik) müteahhit hücresinde kalır; ağ etkisi kuramaz.
      </p>
    </Slayt>,

    /* 10 · Moat */
    <Slayt
      key="moat"
      kicker="Savunma"
      baslik="Özellik kopyalanır, ağ kopyalanmaz"
    >
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <ul className="space-y-4">
          <OnayMadde>
            <b>İki taraflı ağ yoğunluğu:</b> her yeni müteahhit emlakçıya, her emlakçı müteahhide değer katar.
          </OnayMadde>
          <OnayMadde>
            <b>Veri yerçekimi:</b> görüntüleme, paylaşım, opsiyon sinyalleri gün birinden birikir; geçmişe dönük üretilemez.
          </OnayMadde>
          <OnayMadde>
            <b>Güven protokolü:</b> doğrulanmış kimlik, tazelik rozeti, kim-getirdi kaydı; sektörün en kıt varlığı güvendir.
          </OnayMadde>
          <OnayMadde>
            <b>Çıkış maliyeti:</b> satış geçmişi, tahsis düzeni ve performans verisi platformda yaşar.
          </OnayMadde>
        </ul>
        <div className="grid gap-3">
          <MaddeKart
            Ikon={Network}
            baslik="Flywheel"
            metin="Daha çok stok → daha çok danışman → daha çok paylaşım ve sinyal → talep zekâsı → müteahhide daha çok değer → daha çok stok."
            sinyal="#2fd3bc"
          />
          <MaddeKart
            Ikon={Radar}
            baslik="Veri ürünleşir"
            metin="Talep Radarı bugün içgörü; yarın dinamik fiyat önerisi ve bölge talep endeksi."
          />
        </div>
      </div>
    </Slayt>,

    /* 11 · Ürün durumu */
    <Slayt
      key="durum"
      kicker="Ürün durumu"
      baslik="Fikir aşaması değil: sistem çalışıyor"
      alt="Ürün uçtan uca canlı; bu sunumdaki demo da üründen geliyor. İlk müteahhit anlaşmaları için sahadayız."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Building2}
          baslik="Üretici kokpiti"
          metin="Stok ve toplu fiyat yönetimi, granüler tahsis, opsiyon onay kuyruğu, lansman duyuruları, talep radarı, dinamik fiyat önerisi, raporlar, lead sorgusu, danışman daveti."
        />
        <MaddeKart
          Ikon={Users}
          baslik="Danışman yüzeyi"
          metin="Tahsisli canlı havuz (filtre + harita + kesit), müşteri eşleştirme, WhatsApp paylaşımı, opsiyon, lead defteri, lansman radarı, canlı mikrosite (ödeme planı + lead formu)."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Güven katmanı"
          metin="KYC belge doğrulama, doğrulanmış rozeti, DB seviyesinde opsiyon kilidi, tazelik takibi."
        />
        <MaddeKart
          Ikon={Zap}
          baslik="Altyapı"
          metin="Mobil-önce PWA; gerçek zamanlı senkron; işlemsel mail ve bildirim sistemi kurulu."
        />
      </div>
    </Slayt>,

    /* 12 · GTM özeti */
    <Slayt
      key="gtm"
      kicker="Go-to-market"
      baslik="Arz önce: Ankara'da yoğunluk"
      alt="Boş ağ ölür; biz önce stoğu getiriyoruz. Ayrıntılı plan ayrı GTM sunumunda."
    >
      <AdimSirasi
        adimlar={[
          { baslik: "İlk üreticiler", metin: "Concierge kurulumla proje aynı gün yayında; satış aracı canlı ürünün kendisi." },
          { baslik: "Davetli danışman ağı", metin: "Müteahhit kendi çevresini davet eder; ofisler toplu katılır; üyelik bedava." },
          { baslik: "Kanıt döngüsü", metin: "İlk satış hikâyeleri ve talep verisiyle sonraki müteahhitler; ardından İstanbul ve İzmir." },
        ]}
      />
      <p className="mono mt-8 text-[12px] font-semibold tracking-wide text-[#2fd3bc]">
        Detay: projedar.com/sunum/gtm
      </p>
    </Slayt>,

    /* 13 · Vizyon (görsel) */
    <GorselSlayt
      key="vizyon"
      gorsel="/sunum/ag-isiklari.jpg"
      kicker="Vizyon"
      baslik="Gayrimenkulün güven protokolü"
      alt="Hedef net: Türkiye'de satılan her yeni konut bu ağ üzerinden satılsın. Canlı stok, doğrulanmış taraflar, ölçülen talep; üstünde biriken veri, yeni konut piyasasının fiyat ve talep zekâsına dönüşür."
    />,

    /* 14 · Kapanış */
    <Slayt
      key="kapanis"
      orta
      kicker="Ekip & iletişim"
      baslik="Ağı birlikte kuralım"
      alt="Kurucu: ürün, yazılım ve büyüme tek elde; gayrimenkul teknolojisi alanında yayında ürün geliştirme deneyimi. Yatırım görüşmesi ve detaylı veri odası için iletişime geçin."
    >
      <p className="mono mt-6 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </Slayt>,
  ];

  return <DeckShell baslik="Pitch deck" slides={slides} />;
}
