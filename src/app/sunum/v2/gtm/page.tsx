import type { Metadata } from "next";
import {
  Building2,
  Gavel,
  Gift,
  Handshake,
  Layers,
  MessageCircle,
  Network,
  Radar,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import { AdimSirasi, DevSayi, GorselSlayt, MaddeKart, OnayMadde } from "@/components/sunum/parcalar";

export const metadata: Metadata = {
  title: "Projedar · Go-to-Market Stratejisi v2",
  description: "Yatırımcı sunumu eki (v2): ağın kuruluş ve büyüme planı.",
};

/* Flywheel düğümü */
function Halka({ no, metin }: { no: number; metin: string }) {
  return (
    <div className="deck-kart flex items-center gap-3 px-4 py-3.5 text-left">
      <span className="mono flex size-8 flex-none items-center justify-center rounded-full border border-[#2fd3bc]/40 bg-[rgba(47,211,188,0.12)] text-[12px] font-bold text-[#2fd3bc]">
        {no}
      </span>
      <span className="text-[13.5px] font-semibold leading-snug text-white/90">{metin}</span>
    </div>
  );
}

/* v2 · 12 slayt: kapak, ilke, coğrafya, segment, kanal-müteahhit, kanal-emlakçı,
   onboarding, flywheel, fiyatlama, regülasyon, KPI, yol haritası. */
export default function GtmV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/ag-isiklari.jpg"
      logo
      kicker="Projedar · Go-to-market"
      baslik="Ağı nasıl kuruyoruz"
      alt="Arz önce, güven önce, tek şehirde yoğunluk. Pitch deck'in saha planı."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Önce stok. Sonra ağ. Sonra veri.
      </p>
    </GorselSlayt>,

    /* 2 · İlke: arz önce */
    <Slayt
      key="ilke"
      kicker="Kuruluş ilkesi"
      baslik="Boş ağ ölür. Önce stok gelir."
      alt="İki taraflı pazaryerlerinin mezarlığı boş ağlarla doludur: danışmanı davet edip gösterecek stok bulamayan her davetli ağ denemesi söndü. Sıralamamız bu yüzden nettir."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Building2}
          baslik="1 · Stok mıknatıstır"
          metin="Danışmanı ağa çeken şey yalnız burada olan tahsisli, canlı, doğrulanmış stoktur."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Users}
          baslik="2 · Danışman stoğa gelir"
          metin="Stok hazır olmadan danışman tarafı açılmaz; ilk izlenim boş ekran olamaz."
        />
        <MaddeKart
          Ikon={Target}
          baslik="3 · Yoğunluk > yaygınlık"
          metin="Tek şehirde derin ağ, on şehirde sığ ağdan değerlidir; ağ etkisi bölgeseldir."
        />
      </div>
    </Slayt>,

    /* 3 · Coğrafya */
    <Slayt
      key="cografya"
      kicker="Coğrafi sıralama"
      baslik="Ankara → İstanbul → İzmir"
      alt="Başlangıç pazarı Ankara: büyük, erişilebilir ve kurucunun sahada olduğu şehir. Kanıt döngüsü kapanınca aynı oyun kitabı sıradaki şehre taşınır."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <DevSayi deger="152.534" etiket="Ankara konut satışı, 2025 · giriş pazarı" kaynak="TÜİK" renk="#2fd3bc" />
        <DevSayi deger="280.262" etiket="İstanbul konut satışı, 2025 · 2. adım" kaynak="TÜİK" />
        <DevSayi deger="96.998" etiket="İzmir konut satışı, 2025 · 3. adım" kaynak="TÜİK" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Türkiye genelinde satışların %32&apos;si ilk el (TÜİK 2025). Hedef evren: bu üç şehirdeki aktif yeni konut
        projeleri ve onları satan danışman ağı.
      </p>
    </Slayt>,

    /* 4 · Segment */
    <Slayt
      key="segment"
      kicker="Hedef segment"
      baslik="İki üretici profili, tek ürün"
      alt="Dijital olgunluğu düşük üreticiyi tutan ürün, kurumsalı zaten tutar. İkisine de aynı motor, farklı yüz."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Building2}
          baslik="Ü1 · Markalı, çok projeli müteahhit"
          metin="PRO kokpit: tahsis stratejisi, talep radarı, performans. Gelirin ana kaynağı; referans değeri yüksek."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={MessageCircle}
          baslik="Ü2 · Geleneksel müteahhit"
          metin="Panel öğrenmez: WhatsApp ve concierge ile çalışır, stoğu biz gireriz. Havuzu büyüten geniş taban."
        />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Danışman tarafında öncelik profesyonel ve ofise bağlı danışmanlar; ofis üzerinden toplu katılım,
        tek tek ikna maliyetini düşürür.
      </p>
    </Slayt>,

    /* 5 · Kanal: müteahhit */
    <Slayt
      key="kanal-muteahhit"
      kicker="Kanal 1 · Müteahhit"
      baslik="Doğrudan satış, canlı demo, referans"
    >
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <ul className="space-y-4">
          <OnayMadde>
            <b>Birebir görüşme:</b> canlı ürün demosuyla masa başı satış; bu sunum ve üretici deck&apos;i satış aracıdır.
          </OnayMadde>
          <OnayMadde>
            <b>Sıcak giriş:</b> müteahhit çevresi, proje satış müdürleri ve sektör ağı üzerinden tanıdık zinciriyle ilerlenir; soğuk satış değil.
          </OnayMadde>
          <OnayMadde>
            <b>Referans zinciri:</b> ilk projelerin satış hikâyesi ve talep verisi, sonraki müteahhidin ikna materyali olur.
          </OnayMadde>
        </ul>
        <MaddeKart
          Ikon={Handshake}
          baslik="Satış döngüsü kısa tutulur"
          metin="Karar verici tek kişi (patron/satış müdürü); teklif fiyat listesi değil kontrol ve hız vaadidir. Kurulum concierge ile bizde olduğu için 'evet' demenin maliyeti sıfıra iner."
          sinyal="#2fd3bc"
        />
      </div>
    </Slayt>,

    /* 6 · Kanal: emlakçı */
    <Slayt
      key="kanal-emlakci"
      kicker="Kanal 2 · Danışman"
      baslik="Davet zinciri: ağ kendini büyütür"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Network}
          baslik="Müteahhit davet eder"
          metin="Her üretici mevcut emlakçı çevresini platforma davet eder; ilk danışman dalgası maliyetsiz gelir."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Users}
          baslik="Ofisler toplu katılır"
          metin="Ofis ve franchise'larla tek görüşmede onlarca danışman; iç dağıtım ofis konsolundan."
        />
        <MaddeKart
          Ikon={Gift}
          baslik="Kurucu + organik yayılım"
          metin="İlk ~1000 danışman kurucu program (ücretsiz); paylaşılan her canlı link alan tarafta 'bu neyle hazırlandı?' sorusunu doğurur."
        />
      </div>
    </Slayt>,

    /* 7 · Onboarding */
    <Slayt
      key="onboarding"
      kicker="Aktivasyon"
      baslik="Sürtünmeyi biz yutuyoruz"
      alt="B2B araçların öldüğü yer kurulumdur. Bizde kurulum ürünün değil ekibin işi."
    >
      <AdimSirasi
        adimlar={[
          { baslik: "Concierge stok girişi", metin: "Proje, birimler, fiyatlar ve tahsisler ekibimizce girilir; müteahhit ilk gün canlı." },
          { baslik: "KYC kalite kapısı", metin: "Danışman belge doğrulamasından geçer; doğrulanana kadar demo proje görür. Ağın güveni korunur." },
          { baslik: "İlk paylaşım anı", metin: "Danışmanın ilk WhatsApp paylaşımı dakikalar içinde gerçekleşir; değer anı gecikmez." },
        ]}
      />
    </Slayt>,

    /* 8 · Flywheel */
    <Slayt
      key="flywheel"
      kicker="Büyüme motoru"
      baslik="Veri yerçekimi çarkı"
      alt="Her paylaşım sinyal üretir; sinyal müteahhide değer olur; değer yeni stoğu getirir. Çark her turda hızlanır."
    >
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <Halka no={1} metin="Müteahhit stok açar" />
        <Halka no={2} metin="Danışmanlar tahsisli stoğu paylaşır" />
        <Halka no={3} metin="Her görüntüleme ve opsiyon sinyal üretir" />
        <Halka no={4} metin="Talep Radarı müteahhide zekâ sunar" />
        <Halka no={5} metin="Satış hızlanır, hikâye oluşur" />
        <Halka no={6} metin="Yeni müteahhitler ağa gelir → 1'e dön" />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Sinyaller gün birinden birikir; bu veri geçmişe dönük üretilemez, geç girenin açığı kapanmaz.
      </p>
    </Slayt>,

    /* 9 · Fiyatlama */
    <Slayt
      key="fiyatlama"
      kicker="Fiyatlama"
      baslik="Kurucu program, sonra kademeli SaaS"
      alt="İlke: komisyon yok. Lansman kozu: ilk kurucular ücretsiz — ağı hızla doldurur; kontenjan dolup kanıt biriktikçe paketleşir."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart
          Ikon={Handshake}
          baslik="Müteahhit · ilk ~10 kurucu"
          metin="İlk ~10 müteahhit kurucu (ücretsiz): referans + vaka + stok likiditesi. Sonrası ağdaki aktif daire adedine göre kademeli yıllık."
          sinyal="#2fd3bc"
        />
        <MaddeKart
          Ikon={Gift}
          baslik="Danışman · ilk ~1000 kurucu"
          metin="İlk ~1000 danışman ilk yıl ücretsiz; ağın likidite tarafı bilinçli sübvanse edilir. Kontenjan sonrası Pro/ofis."
        />
        <MaddeKart
          Ikon={Layers}
          baslik="Sonra · SaaS katmanları"
          metin="Kontenjan dolunca danışman Pro, ofis/franchise aboneliği, veri ürünleri: değer kanıtlanınca paralı."
        />
      </div>
    </Slayt>,

    /* 10 · Regülasyon kozu */
    <Slayt
      key="regulasyon"
      kicker="Regülasyon"
      baslik="EİDS bizim rüzgârımız"
      alt="Şubat 2026'dan beri açık ilan rejimi sertleşti: kural dışı sosyal medya ilan paylaşımının cezası ilan başına 286.206 TL. Sektör güvenli paylaşım yolu arıyor."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart
          Ikon={Gavel}
          baslik="Açık ilan riskli hale geldi"
          metin="Danışmanın alıştığı 'her yere ilan bas' düzeni ceza riskiyle daraldı; kontrolsüz paylaşım artık maliyetli."
        />
        <MaddeKart
          Ikon={ShieldCheck}
          baslik="Tahsisli paylaşım çıkış yolu"
          metin="'İlan yok, tahsis var': birebir canlı sayfa paylaşımı ilan rejiminin dışında konumlanır. Satış görüşmesinde en güçlü argümanlardan biri."
          sinyal="#2fd3bc"
        />
      </div>
    </Slayt>,

    /* 11 · KPI */
    <Slayt
      key="kpi"
      kicker="Ölçüm"
      baslik="Dört gösterge, tek soru: ağ canlı mı?"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart Ikon={Building2} baslik="Arz" metin="Aktif proje ve satılabilir birim sayısı; havuza yeni giren stok hızı." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Ağ" metin="Doğrulanmış danışman sayısı ve tahsis başına aktif danışman." />
        <MaddeKart Ikon={Radar} baslik="Akış" metin="Haftalık paylaşım, görüntüleme, opsiyon ve satış dönüşümü." />
        <MaddeKart Ikon={ShieldCheck} baslik="Güven" metin="Stok tazelik oranı: yeşil rozetli birimlerin payı; ağın nabzı budur." />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        İlk 90 gün hedef çerçevesi: Ankara&apos;da ilk 3-5 aktif proje + ilk 100 doğrulanmış danışman +
        haftalık düzenli paylaşım-opsiyon akışı. Bu döngü kapanmadan yeni şehir açılmaz.
      </p>
    </Slayt>,

    /* 12 · Yol haritası */
    <GorselSlayt
      key="yol"
      gorsel="/sunum/sehir-panorama.jpg"
      hiza="sol"
      kicker="Yol haritası"
      baslik="Kanıt → ölçek → katman"
    >
      <div className="da da-4 mt-8 w-full">
        <AdimSirasi
          adimlar={[
            { baslik: "Faz 1 · Ankara kanıtı", metin: "İlk üretici anlaşmaları, davetli danışman ağı, ilk satış vakaları ve talep verisi." },
            { baslik: "Faz 2 · Ölçek", metin: "İstanbul ve İzmir; WhatsApp Cloud API otomasyonu ve AI eşleştirme katmanı." },
            { baslik: "Faz 3 · Gelir katmanları", metin: "Ofis/franchise SaaS, emlakçı premium, veri ürünleri (talep endeksi, fiyat zekâsı)." },
          ]}
        />
      </div>
      <p className="da da-5 mono mt-9 text-[13px] font-semibold tracking-wide text-[#2fd3bc]">
        projedar.com · pitch: projedar.com/sunum/v2/pitch
      </p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Go-to-market · v2" slides={slides} />;
}
