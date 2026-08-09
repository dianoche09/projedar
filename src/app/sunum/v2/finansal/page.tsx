import type { Metadata } from "next";
import {
  Banknote,
  Building2,
  Calculator,
  Coins,
  Flame,
  Layers,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import { DevSayi, GorselSlayt, MaddeKart } from "@/components/sunum/parcalar";

export const metadata: Metadata = {
  title: "Projedar · Finansal Projeksiyon v2",
  description: "24 aylık finansal plan (v2): gelir Ay 1'den (müteahhit-ölçekli), birim ekonomisi, senaryolar.",
};

type Ceyrek = { ad: string; ay: string; muteahhit: number; kumMuteahhit: number; gelir: number };

const CEYREKLER: Ceyrek[] = [
  { ad: "Ç1", ay: "Ay 1-3", muteahhit: 16, kumMuteahhit: 16, gelir: 1.2 },
  { ad: "Ç2", ay: "Ay 4-6", muteahhit: 10, kumMuteahhit: 26, gelir: 2.0 },
  { ad: "Ç3", ay: "Ay 7-9", muteahhit: 11, kumMuteahhit: 37, gelir: 2.4 },
  { ad: "Ç4", ay: "Ay 10-12", muteahhit: 11, kumMuteahhit: 48, gelir: 2.6 },
  { ad: "Ç5", ay: "Ay 13-15", muteahhit: 12, kumMuteahhit: 60, gelir: 2.9 },
  { ad: "Ç6", ay: "Ay 16-18", muteahhit: 13, kumMuteahhit: 73, gelir: 3.1 },
  { ad: "Ç7", ay: "Ay 19-21", muteahhit: 13, kumMuteahhit: 86, gelir: 3.3 },
  { ad: "Ç8", ay: "Ay 22-24", muteahhit: 14, kumMuteahhit: 100, gelir: 3.5 },
];

/** 24 aylık çeyreklik gelir bar grafiği (koyu tema). Gelir Ç1'den başlar; kurucu aşama tamamlanınca ivmelenir. */
function ProjeksiyonBar() {
  const maxGelir = Math.max(...CEYREKLER.map((c) => c.gelir));
  return (
    <div className="deck-kart p-5 text-left">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height: 190 }}>
        {CEYREKLER.map((c) => (
          <div key={c.ad} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="mono text-[11px] font-bold text-[#2fd3bc]">{c.gelir.toLocaleString("tr-TR")}M</span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${Math.max(8, (c.gelir / maxGelir) * 150)}px`,
                background: "linear-gradient(180deg, #2fd3bc 0%, #1a8f7f 100%)",
              }}
            />
            <span className="mono text-[10px] font-semibold text-white/70">{c.ad}</span>
            <span className="mono text-[8.5px] text-white/35">{c.ay}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px]">
        <span className="mono text-white/50">Ç1: ilk ~10 müteahhit kurucu (ücretsiz); gelir paralı müteahhitle Ay 1&apos;den</span>
        <span className="mono font-bold text-[#2fd3bc]">24 ay toplam tahsilat ~21M ₺ · ay 24 run-rate ~22M ₺</span>
      </div>
    </div>
  );
}

/* v2 · 9 slayt: kapak, gelir mimarisi, 24 aylık plan, kazanım, birim ekonomisi,
   gider & ekip, senaryolar, yatırım, kapanış. */
export default function FinansalV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/veri-bina.jpg"
      logo
      kicker="Projedar · Finansal projeksiyon"
      baslik="24 aylık plan"
      alt="Ürün canlı. İlk müteahhitler kurucu programıyla ücretsiz ve hızlı katılır; paralı müteahhit geliri Ay 1'den başlar, kurucu aşama tamamlanınca ivmelenir. Projedar satış komisyonundan pay almaz."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Muhafazakar baz senaryo · saha verisiyle güncellenir
      </p>
    </GorselSlayt>,

    /* 2 · Gelir mimarisi */
    <Slayt key="mimari" genis kicker="Gelir mimarisi" baslik="Tek ana gelir, iki büyüme katmanı" alt="Projedar komisyondan pay almaz. Gelir yazılım/erişim anlaşmasından; değer metriği ağdaki aktif daire (satılınca düşer) ve danışman sayısı.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="Müteahhit anlaşması · ANA" metin="İlk müteahhitler kurucu programıyla ücretsiz. Sonrası ağdaki aktif daire adedine göre kademeli yıllık: küçük proje (&lt;50 daire) 40-85K giriş → 150K orta → 600K+ enterprise; yüksek LTV, düşük churn." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Danışman Pro + Ofis" metin="Kurucu program danışmanları ücretsiz. Sonra Pro 7.500₺/yıl, ofis danışman-kademeli 25K+. Gelir katmanı Yıl 2." />
        <MaddeKart Ikon={Layers} baslik="Veri ürünleri · SONRA" metin="Talep/fiyat endeksi, piyasa zekâsı. Ağ büyüyüp veri derinleşince açılır; yüksek marjlı katman." />
      </div>
    </Slayt>,

    /* 3 · 24 aylık plan */
    <Slayt key="plan" genis kicker="24 aylık plan" baslik="Gelir Ay 1'den; kurucu aşama tamamlanınca ivmelenir" alt="Piyasada binlerce proje var: arz kısıt değil, kısıt saha ve concierge kapasitesi. İlk kurucu müteahhitler ücretsiz olduğu için ağ hızlı dolar; paralı müteahhit geliri Ay 1-2'de başlar ve referans çarkıyla ivmelenir.">
      <ProjeksiyonBar />
    </Slayt>,

    /* 4 · Kazanım & run-rate */
    <Slayt key="kazanim" genis kicker="Kazanım" baslik="Referans-satış hızıyla büyüme">
      <div className="grid gap-3 sm:grid-cols-4">
        <DevSayi deger="Ay 13" etiket="İlk paralı gelir (kurucu dönem sonrası)" renk="#2fd3bc" />
        <DevSayi deger="~10" etiket="Ay 12 kümülatif müteahhit (kurucu, ücretsiz)" />
        <DevSayi deger="~44" etiket="Ay 24 kümülatif müteahhit" renk="#2fd3bc" />
        <DevSayi deger="~12M ₺" etiket="Ay 24 yıllık gelir run-rate (müteahhit + Pro/ofis)" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        İlk ~10 müteahhit kurucu programıyla ücretsiz kazanılır (referans + vaka + stok likiditesi): el-ile referans
        satışı, dijital reklam değil, karar verici tek kişi, kurulum concierge ile bizde. Paralı müteahhit akışı ve
        danışman Pro/ofis geliri Yıl 2&apos;de üst üste biner.
      </p>
    </Slayt>,

    /* 5 · Birim ekonomisi */
    <Slayt key="birim" genis kicker="Birim ekonomisi" baslik="Tek anlaşma, CAC'ı hızla karşılar" alt="Yıllık peşin sözleşme + düşük churn + referans-CAC = sağlıklı geri ödeme.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart Ikon={Coins} baslik="Ort. anlaşma" metin="~250K ₺/yıl (band 40K giriş - 600K+). Küçük proje yumuşak giriş kademesiyle başlar, büyüklük arttıkça üst pakete geçer." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="LTV" metin="Düşük churn × yıllık yenileme: 3 yılda 750K ₺+ (PropTech benchmark $20-100K)." />
        <MaddeKart Ikon={Target} baslik="CAC" metin="Referans/el-satış: dijital reklamsız, düşük maliyet. Karar verici tek kişi." />
        <MaddeKart Ikon={Calculator} baslik="Geri ödeme" metin="Yıllık peşin tahsilat: tek anlaşma edinim maliyetini ilk yılda karşılar." sinyal="#2fd3bc" />
      </div>
    </Slayt>,

    /* 6 · Gider & ekip */
    <Slayt key="gider" genis kicker="Gider & ekip" baslik="Yalın başlangıç, ölçekle büyüyen kadro" alt="Ürün canlı ve dış kaynaksız kuruldu; sabit maliyet düşük. Yatırım öncelikle saha ve concierge kadrosuna.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Wallet} baslik="Ay 1-6 · yalın" metin="Solo kurucu + altyapı (sunucu/araç). Düşük burn; ürün zaten yayında, ana iş ilk anlaşmalar ve ağ kurulumu." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Ay 7-12 · kurucu dönem" metin="Saha + concierge (kurucu müteahhit/danışman kazanımı, stok girişi). Burn ölçülü artar; gelir henüz minimal, ağ likiditesi kurulur." />
        <MaddeKart Ikon={Flame} baslik="Ay 13-24 · ölçek" metin="Küçük ekip (ürün, pazarlama, destek) + 2. şehir. Burn gelirle dengelenir, run-rate hızlanır." />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Aylık burn ve kadro büyüklüğü yatırım turuna göre netleşir; kurulu ürün nedeniyle sermaye ürün değil büyümeye gider.
      </p>
    </Slayt>,

    /* 7 · Senaryolar */
    <Slayt key="senaryo" genis kicker="Senaryolar" baslik="Üç patika, aynı model" alt="Baz senaryo referans-satış hızına dayanır; alt ve üst bantlar kazanım hızının çarpanıdır.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Target} baslik="Muhafazakar" metin="Ay 24 ~28 müteahhit, run-rate ~7,5M ₺. Yavaş kazanım; alt sınır güveni." />
        <MaddeKart Ikon={Rocket} baslik="Baz (bu plan)" metin="Ay 24 ~44 müteahhit, run-rate ~12M ₺; 24 ay tahsilat ~10,8M ₺. Kurucu dönem sonrası referans-satış hızıyla gerçekçi." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="Agresif" metin="Ay 24 ~80 müteahhit + hızlı ofis/Pro, run-rate ~25M ₺+. Erken 2. şehir ve güçlü referans döngüsü." />
      </div>
    </Slayt>,

    /* 8 · Yatırım */
    <Slayt key="yatirim" kicker="Yatırım" baslik="Sermaye ürüne değil, büyümeye" alt="Ürün canlı ve dış kaynaksız kuruldu; tur, 24 aylık büyümeyi ve saha kadrosunu fonlar.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Users} baslik="Saha & concierge" metin="Üretici/danışman kazanımı ve kurulum operasyonu: kazanım hızını belirleyen ana kalem." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Building2} baslik="Ürün derinleşme" metin="WhatsApp Cloud API, AI eşleştirme, ofis/Pro araçları, veri ürünleri altyapısı." />
        <MaddeKart Ikon={Banknote} baslik="Pazarlama & runway" metin="Marka, sektör etkinlikleri, 24 aylık nakit tamponu." />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Tur büyüklüğü, değerleme ve kullanım detayı görüşmede paylaşılır. Yukarıdaki rakamlar muhafazakar bazdır ve saha verisiyle güncellenir.
      </p>
    </Slayt>,

    /* 9 · Kapanış */
    <GorselSlayt key="kapanis" gorsel="/sunum/ag-isiklari.jpg" kicker="Kapanış" baslik="Kurulu ürün, net model, ölçeklenebilir plan" alt="İş planı: projedar.com/sunum/v2/is-plani · Pitch: projedar.com/sunum/v2/pitch">
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Finansal projeksiyon · v2" slides={slides} />;
}
