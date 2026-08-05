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
  PhoneCall,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import {
  AdimSirasi,
  AkisSema,
  AlintiSlayt,
  DevSayi,
  EkranKart,
  GorselSlayt,
  MaddeKart,
  OnayMadde,
} from "@/components/sunum/parcalar";
import { KuleDemo } from "@/components/landing/KuleDemo";

export const metadata: Metadata = {
  title: "Projedar · Yatırımcı Sunumu v2",
  description: "Yatırımcı sunumu (v2): yeni konut projeleri için tahsisli canlı satış ağı.",
};

/** Rekabet karşılaştırma tablosu: satırlar yetenek, sütunlar oyuncu. */
function RekabetTablo() {
  const satirlar = [
    "Canlı fiyat ve stok",
    "Çok müteahhitli ortak havuz",
    "Bağımsız danışman ağına dağıtım",
    "Veritabanında çift satış kalkanı",
    "Komisyonsuz model",
  ];
  const kolonlar: { ad: string; degerler: boolean[] }[] = [
    { ad: "İlan portalları", degerler: [false, true, false, false, false] },
    { ad: "Tek firmaya çalışan CRM'ler", degerler: [true, false, false, false, false] },
    { ad: "Projedar", degerler: [true, true, true, true, true] },
  ];
  return (
    <div className="deck-kart overflow-x-auto p-2 text-left">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-white/60" />
            {kolonlar.map((k) => (
              <th
                key={k.ad}
                className={`px-4 py-3 text-center text-[12.5px] font-bold ${
                  k.ad === "Projedar" ? "text-[#2fd3bc]" : "text-white/80"
                }`}
              >
                {k.ad}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s, i) => (
            <tr key={s} className="border-t border-white/10">
              <td className="px-4 py-3 font-semibold text-white/90">{s}</td>
              {kolonlar.map((k) => (
                <td key={k.ad} className="px-4 py-3 text-center">
                  <span
                    className={`mono text-[14px] font-bold ${
                      k.degerler[i] ? (k.ad === "Projedar" ? "text-[#2fd3bc]" : "text-white/70") : "text-[#e07a6e]"
                    }`}
                  >
                    {k.degerler[i] ? "✓" : "✕"}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* v2 — sade yatırımcı kurgusu: kapak, vizyon, sorun, pazar, çözüm(şema), ürün,
   canlı demo, iş modeli, ağ etkisi, rekabet, savunulabilirlik, zamanlama,
   yol haritası, ekip & yatırım, kapanış. */
export default function PitchV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/sehir-panorama.jpg"
      logo
      kicker="Projedar · Yatırımcı sunumu"
      baslik="Yeni konut projeleri için tahsisli canlı satış ağı"
      alt="Projedar, inşaat firmalarının konut stoğunu yetkili danışman ağına canlı veriyle dağıtan, yalnızca yetkili üyelere açık B2B ağdır. İlan portalı değil: gayrimenkulün güven protokolü."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Bloklar yükselir. Stok erir.
      </p>
    </GorselSlayt>,

    /* 2 · Vizyon */
    <AlintiSlayt
      key="vizyon"
      metin="Türkiye'de satılan her yeni konutun, Projedar ağı üzerinden satılması."
      alt="Bugün Excel listeleri, WhatsApp grupları ve telefon teyitleriyle dönen milyarlarca liralık birincil konut satışını tek canlı ağda topluyoruz."
    />,

    /* 3 · Sorun (görsel zemin) */
    <GorselSlayt
      key="sorun"
      gorsel="/sunum/excel-kaos.jpg"
      hiza="sol"
      kicker="Sorun"
      baslik="Yeni konut satışı hâlâ elle yürüyor"
    >
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Copy}
          baslik="Dağınık, eskiyen veri"
          metin="Proje stokları Excel ve PDF listelerle elden ele dolaşır; zam geldiğinde saha günlerce eski fiyatla satar."
        />
        <MaddeKart
          Ikon={AlertTriangle}
          baslik="Çift satış ve mağduriyet"
          metin="Aynı daireye birden fazla kapora alınabilir; itibar kaybı ve hukuki risk sektörün kronik sorunudur."
          sinyal="#e07a6e"
        />
        <MaddeKart
          Ikon={EyeOff}
          baslik="Üretici için kör nokta"
          metin="İnşaat firması stoğunu kimin, kime, hangi fiyatla sunduğunu göremez; fiyat disiplini sahada erir."
        />
        <MaddeKart
          Ikon={PhoneCall}
          baslik="Danışman için sürtünme"
          metin="Doğru bilgiye ulaşmak telefon teyidine bakar; müşteri bekletilir, satış fırsatı kaçar."
        />
      </div>
    </GorselSlayt>,

    /* 4 · Pazar */
    <Slayt
      key="pazar"
      genis
      kicker="Pazar"
      baslik="Büyük ve büyüyen bir pazar"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DevSayi deger="1,69M" etiket="2025'te Türkiye'de satılan toplam konut (+%14,3)" kaynak="TÜİK" />
        <DevSayi deger="540.786" etiket="İlk el (yeni konut) satışı: hedef pazarımız (+%11,6)" kaynak="TÜİK" renk="#2fd3bc" />
        <DevSayi deger="%32" etiket="İlk el satışların toplam içindeki payı: her 3 satıştan 1'i" kaynak="TÜİK" />
        <DevSayi deger="+%49,3" etiket="İpotekli satışlarda yıllık artış: canlanan talep" kaynak="TÜİK" />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Kaynak: TÜİK Konut Satış İstatistikleri, 2025 yıllık verileri
      </p>
    </Slayt>,

    /* 5 · Çözüm */
    <Slayt
      key="cozum"
      genis
      kicker="Çözüm"
      baslik="Üyelere özel canlı konut stoğu ağı"
      alt="İnşaat firmaları stoğunu Projedar'da yönetir; yetkilendirdikleri danışmanlar her an güncel fiyat ve stokla satar. Müşteriye ulaşan her bilgi, tek kaynaktan beslenen birebir linktir."
    >
      <AkisSema
        dugumler={[
          { baslik: "İnşaat firmaları", alt: "Stok + fiyat + yetki", gorsel: "bina" },
          { baslik: "PROJEDAR", alt: "Canlı senkron ağ", vurgu: true, gorsel: "logo" },
          { baslik: "Danışmanlar → Alıcı", alt: "Birebir link paylaşımı", gorsel: "danisman" },
        ]}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        <OnayMadde>Canlı veri: değişiklik anında tüm ağda.</OnayMadde>
        <OnayMadde>Opsiyon kilidi çift satışın önüne geçer.</OnayMadde>
        <OnayMadde>Kontrollü erişim: yetki üreticide.</OnayMadde>
      </ul>
    </Slayt>,

    /* 6 · Ürün (teknoloji görsel zemin) */
    <GorselSlayt key="urun" gorsel="/sunum/veri-bina.jpg" hiza="sol" kicker="Ürün" baslik="Fark yaratan dört yetenek">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Zap}
          baslik="Canlı veri"
          metin="Fiyat ve stok değişikliği tüm ağa saniyeler içinde yayılır; sürüm karmaşası biter."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Tek kaynak link"
          metin="Müşteriye giden link her açılışta güncel değeri gösterir; kopyalanan PDF'ler tarihe karışır."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Database}
          baslik="Opsiyon kilidi"
          metin="Opsiyonlanan daire veritabanı seviyesinde kilitlenir; çift satışın önüne yapısal olarak geçilir."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Kontrollü erişim"
          metin="Üretici, hangi danışmanın hangi projeyi ve daireyi göreceğini daire bazında tanımlar."
          sinyal="#2fd3bc"
        />
      </div>
    </GorselSlayt>,

    /* 7 · Canlı demo */
    <Slayt key="demo" genis kicker="Ürün · Canlı demo" baslik="Slayt değil, çalışan ürün">
      <p className="deck-soft -mt-3 mb-5 text-[14px]">
        Bu bir görsel değil: aşağıdaki bina kesiti etkileşimli. Bir daireye dokunun, opsiyon kilidini deneyin.
      </p>
      <EkranKart url="projedar.com/havuz/proje/cankaya-vadi" kucult zemin="acik">
        <KuleDemo />
      </EkranKart>
    </Slayt>,

    /* 8 · İş modeli */
    <Slayt
      key="is-modeli"
      kicker="İş modeli"
      baslik="Danışmana ücretsiz; gelirimiz yazılım anlaşmasından"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Handshake}
          baslik="Gelir: müteahhit anlaşması"
          metin="Erken aşamada gelir, inşaat firmalarıyla birebir B2B anlaşmalardan gelir. Değer net: hızlı stok erimesi, fiyat disiplini, sıfır çift satış. Komisyona dokunulmaz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Users}
          baslik="Büyüme: danışmanlar"
          metin="Danışmana üyelik ücretsiz, satıştan kesinti yok; kazancın %100'ü onun. Sıfır bariyer, ağın dağıtım tarafını hızla büyütür."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Ölçek: kademeli gelir"
          metin="Değer kanıtlandıkça devreye girer: danışman premium araçları, ofis/franchise abonelikleri ve veri ürünleri."
        />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Fiyatlandırma detayları ve birim ekonomisi: görüşmede paylaşılacaktır.
      </p>
    </Slayt>,

    /* 9 · Ağ etkisi */
    <Slayt
      key="ag-etkisi"
      genis
      kicker="Ağ etkisi"
      baslik="Kendi kendini büyüten döngü"
    >
      <AdimSirasi
        akisli
        adimlar={[
          { baslik: "Daha çok proje", metin: "Üreticiler stoğunu ağa taşır." },
          { baslik: "Daha çok danışman", metin: "Zengin portföy danışman çeker; katılım ücretsiz." },
          { baslik: "Daha hızlı satış", metin: "Canlı veri ve geniş ağ stoku eritir." },
          { baslik: "Daha güçlü çekim", metin: "Sonuç gören üreticiler yeni projeleri ağa getirir; döngü yeniden başlar." },
        ]}
      />
    </Slayt>,

    /* 10 · Rekabet */
    <Slayt
      key="rekabet"
      genis
      kicker="Rekabet"
      baslik="Neden mevcut çözümler yetmiyor?"
      alt="İlan portalları stoğu herkese teşhir eder; CRM yazılımları tek firmanın içine bakar. Bu beş özelliği bir arada sunan başka oyuncu yok."
    >
      <RekabetTablo />
    </Slayt>,

    /* 11 · Savunulabilirlik */
    <Slayt key="savunma" kicker="Savunulabilirlik" baslik="Kopyalanması zor olan ne?">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Network}
          baslik="Tek özellik değil, kombinasyon"
          metin="Çok müteahhitli havuz + tahsisli erişim + veritabanı kilidi + komisyonsuz model: her biri tek tek kopyalanabilir; dördü birden, rakibin iş modelini bozmadan olmaz."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={BarChart3}
          baslik="Veri birikimi"
          metin="Her paylaşım, görüntüleme ve opsiyon ilk günden kayıt altında. Bu kayıt geçmişe dönük üretilemez; ağ büyüdükçe derinleşir."
        />
        <MaddeKart
          Ikon={Handshake}
          baslik="İki tarafı da tutan model"
          metin="Üretici kontrolü hiç kaybetmez, danışman ücretsiz ve kesintisiz kazanır; iki taraf da ağda kalmayı kendisi seçer."
        />
        <MaddeKart
          Ikon={Gavel}
          baslik="Regülasyon kalkanı"
          metin="Yeni EİDS ilan düzenlemesi açık paylaşımı zorlaştırırken tahsisli birebir paylaşım modeli kapsam dışı; mevzuat modeli koruyor."
        />
      </div>
    </Slayt>,

    /* 12 · Zamanlama */
    <Slayt key="zamanlama" kicker="Zamanlama" baslik="Neden şimdi?">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={TrendingUp}
          baslik="Fiyat oynaklığı"
          metin="Yüksek enflasyon ortamında proje fiyatları sık güncellenir; 'güncel veri' hiç olmadığı kadar kritik."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Gavel}
          baslik="Regülasyon rüzgârı"
          metin="Şubat 2026 EİDS düzenlemesi açık ilan paylaşımını zorlaştırdı; tahsisli birebir dağıtım tam bu boşluğa oturuyor."
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Saha zaten dijitalde"
          metin="Danışmanlar işini WhatsApp'ta yürütüyor; Projedar mevcut alışkanlığın üzerine kuruluyor, davranış değişikliği istemiyor."
        />
        <MaddeKart
          Ikon={Rocket}
          baslik="Boş kategori"
          metin="İlan portalları ikinci ele, CRM'ler tek firmaya odaklı; yeni konut satışının ağ katmanı sahipsiz."
        />
      </div>
    </Slayt>,

    /* 13 · Yol haritası (görsel zemin) */
    <GorselSlayt key="yol" gorsel="/sunum/vinc-siluet.jpg" hiza="sol" kicker="Yol haritası" baslik="Nereden nereye">
      <div className="da da-3 mt-8 w-full">
      <AdimSirasi
        adimlar={[
          { baslik: "Faz 1 · Bugün: canlı satış ağı", metin: "Platform canlı (projedar.com): stok, tahsis, opsiyon, paylaşım tamam. Lansman: ilk üretici ve danışman ağı." },
          { baslik: "Faz 2 · Derinleşme", metin: "WhatsApp ve yapay zekâ katmanı; ofis aboneliği ve premium gelirler; yurtdışı projeler (Dubai, KKTC, Avrupa)." },
          { baslik: "Faz 3 · Veri ürünleri", metin: "Gerçek işlemden fiyat ve talep endeksi; piyasa zekâsı ve raporlama; finansal katman." },
        ]}
      />
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Türklerin yurtdışı gayrimenkul yatırımı 2025&apos;te yaklaşık 2,4 milyar dolar: Faz 2&apos;de aynı tahsis
        modeli yurtdışı proje stoğuna açılır.
      </p>
      </div>
    </GorselSlayt>,

    /* 14 · Ekip & yatırım */
    <Slayt
      key="ekip-yatirim"
      kicker="Ekip & yatırım"
      baslik="Tek elden kurulan, hazır sistem"
      alt="Kurucu: ürün, yazılım ve büyüme tek elde; gayrimenkul teknolojisi alanında yayında ürün geliştirme deneyimi. Platform dış kaynak olmadan uçtan uca kuruldu ve canlıda."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Wrench}
          baslik="Ürün & mühendislik"
          metin="Platformun derinleşmesi: mobil deneyim, entegrasyonlar, yapay zekâ katmanı."
        />
        <MaddeKart
          Ikon={Building2}
          baslik="Ağ büyümesi"
          metin="Saha ekibi; üretici ve danışman kazanımı, kurulum (concierge) operasyonu."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Users}
          baslik="Pazarlama & operasyon"
          metin="Marka, sektör etkinlikleri, destek operasyonu."
        />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Tur büyüklüğü, değerleme ve kullanım planı: görüşmede paylaşılacaktır.
      </p>
    </Slayt>,

    /* 15 · Kapanış */
    <GorselSlayt
      key="kapanis"
      gorsel="/sunum/ag-isiklari.jpg"
      kicker="Kapanış"
      baslik="Yeni konut satışının dağıtım altyapısını birlikte kuralım"
      alt="Detaylı finansallar, birim ekonomisi ve canlı ürün demosu için görüşelim."
    >
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Yatırımcı sunumu · v2" slides={slides} />;
}
