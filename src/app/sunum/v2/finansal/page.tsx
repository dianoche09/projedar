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
  description: "24 aylık finansal plan (v2): ilk 6 ay yatırım dönemi, gelir modeli, birim ekonomisi, senaryolar.",
};

type Ceyrek = { ad: string; ay: string; muteahhit: number; kumMuteahhit: number; gelir: number; kurulus?: boolean };

const CEYREKLER: Ceyrek[] = [
  { ad: "Ç1", ay: "Ay 1-3", muteahhit: 0, kumMuteahhit: 0, gelir: 0, kurulus: true },
  { ad: "Ç2", ay: "Ay 4-6", muteahhit: 0, kumMuteahhit: 0, gelir: 0, kurulus: true },
  { ad: "Ç3", ay: "Ay 7-9", muteahhit: 4, kumMuteahhit: 4, gelir: 1.0 },
  { ad: "Ç4", ay: "Ay 10-12", muteahhit: 6, kumMuteahhit: 10, gelir: 1.5 },
  { ad: "Ç5", ay: "Ay 13-15", muteahhit: 7, kumMuteahhit: 17, gelir: 1.85 },
  { ad: "Ç6", ay: "Ay 16-18", muteahhit: 8, kumMuteahhit: 25, gelir: 2.15 },
  { ad: "Ç7", ay: "Ay 19-21", muteahhit: 9, kumMuteahhit: 34, gelir: 2.5 },
  { ad: "Ç8", ay: "Ay 22-24", muteahhit: 10, kumMuteahhit: 44, gelir: 2.85 },
];

/** 24 aylık çeyreklik gelir bar grafiği (koyu tema). İlk 6 ay yatırım dönemi. */
function ProjeksiyonBar() {
  const maxGelir = Math.max(...CEYREKLER.map((c) => c.gelir));
  return (
    <div className="deck-kart p-5 text-left">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height: 190 }}>
        {CEYREKLER.map((c) => (
          <div key={c.ad} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className={`mono text-[11px] font-bold ${c.kurulus ? "text-white/40" : "text-[#2fd3bc]"}`}>
              {c.kurulus ? "0" : `${c.gelir.toLocaleString("tr-TR")}M`}
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: c.kurulus ? 4 : `${Math.max(8, (c.gelir / maxGelir) * 150)}px`,
                background: c.kurulus
                  ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.12), rgba(255,255,255,0.12) 4px, transparent 4px, transparent 8px)"
                  : "linear-gradient(180deg, #2fd3bc 0%, #1a8f7f 100%)",
              }}
            />
            <span className="mono text-[10px] font-semibold text-white/70">{c.ad}</span>
            <span className="mono text-[8.5px] text-white/35">{c.ay}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px]">
        <span className="mono text-white/50">
          <span className="mr-1.5 inline-block size-2 rounded-sm" style={{ background: "repeating-linear-gradient(45deg,rgba(255,255,255,0.2),rgba(255,255,255,0.2) 3px,transparent 3px,transparent 6px)" }} />
          Ay 1-6: yatırım dönemi (gelir 0)
        </span>
        <span className="mono font-bold text-[#2fd3bc]">24 ay toplam tahsilat ~11,85M ₺ · ay 24 yıllık run-rate ~12M ₺</span>
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
      alt="İlk 6 ay yatırım dönemi (gelir yok): ürün canlı, ilk müteahhit anlaşmaları ve ağ kuruluyor. Ay 7'den itibaren komisyonsuz yazılım geliri."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Muhafazakar baz senaryo · saha verisiyle güncellenir
      </p>
    </GorselSlayt>,

    /* 2 · Gelir mimarisi */
    <Slayt key="mimari" genis kicker="Gelir mimarisi" baslik="Tek ana gelir, iki büyüme katmanı" alt="Komisyon yok. Gelir yazılım/erişim anlaşmasından; değer metriği yönetilen daire ve danışman sayısı.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="Müteahhit anlaşması · ANA" metin="Yönetilen daire adedine göre kademeli yıllık (150K → 600K+). Erken dönem gelirin çekirdeği; yüksek LTV, düşük churn." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Danışman Pro + Ofis" metin="Temel kalıcı ücretsiz (moat). Pro 7.500₺/yıl, ofis danışman-kademeli 25K+. Yıl 2'de devreye girer." />
        <MaddeKart Ikon={Layers} baslik="Veri ürünleri · SONRA" metin="Talep/fiyat endeksi, piyasa zekâsı. Ağ büyüyüp veri derinleşince açılır; yüksek marjlı katman." />
      </div>
    </Slayt>,

    /* 3 · 24 aylık plan */
    <Slayt key="plan" genis kicker="24 aylık plan" baslik="İlk 6 ay yatırım, sonra kademeli gelir" alt="Kuruluş dönemi bilinçli gelirsizdir: arz-önce ilkesiyle önce stok ve doğrulanmış danışman ağı kurulur; gelir ay 7'de referans-satışla başlar.">
      <ProjeksiyonBar />
    </Slayt>,

    /* 4 · Kazanım & run-rate */
    <Slayt key="kazanim" genis kicker="Kazanım" baslik="Referans-satış hızıyla büyüme">
      <div className="grid gap-3 sm:grid-cols-4">
        <DevSayi deger="Ay 7" etiket="İlk gelir: ilk müteahhit anlaşmaları (kuruluş sonrası)" renk="#2fd3bc" />
        <DevSayi deger="~10" etiket="Ay 12 sonu kümülatif müteahhit (1. yıl)" />
        <DevSayi deger="~44" etiket="Ay 24 sonu kümülatif müteahhit" renk="#2fd3bc" />
        <DevSayi deger="~12M ₺" etiket="Ay 24 yıllık gelir run-rate (müteahhit + Pro/ofis)" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        İlk ~20 müteahhit el-ile referans satışıyla kazanılır (dijital reklam değil): karar verici tek kişi, satış
        döngüsü kısa, kurulum concierge ile bizde. İkinci yılda İstanbul/İzmir ve ofis/Pro geliri devreye girer.
      </p>
    </Slayt>,

    /* 5 · Birim ekonomisi */
    <Slayt key="birim" genis kicker="Birim ekonomisi" baslik="Tek anlaşma, CAC'ı hızla karşılar" alt="Yıllık peşin sözleşme + düşük churn + referans-CAC = sağlıklı geri ödeme.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart Ikon={Coins} baslik="Ort. anlaşma" metin="~250K ₺/yıl (band 150-600K). Proje büyüklüğü arttıkça üst pakete geçer." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="LTV" metin="Düşük churn × yıllık yenileme: 3 yılda 750K ₺+ (PropTech benchmark $20-100K)." />
        <MaddeKart Ikon={Target} baslik="CAC" metin="Referans/el-satış: dijital reklamsız, düşük maliyet. Karar verici tek kişi." />
        <MaddeKart Ikon={Calculator} baslik="Geri ödeme" metin="Yıllık peşin tahsilat: tek anlaşma edinim maliyetini ilk yılda karşılar." sinyal="#2fd3bc" />
      </div>
    </Slayt>,

    /* 6 · Gider & ekip */
    <Slayt key="gider" genis kicker="Gider & ekip" baslik="Yalın başlangıç, ölçekle büyüyen kadro" alt="Ürün canlı ve dış kaynaksız kuruldu; sabit maliyet düşük. Yatırım öncelikle saha ve concierge kadrosuna.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Wallet} baslik="Ay 1-6 · yalın" metin="Solo kurucu + altyapı (sunucu/araç). Düşük burn; ürün zaten yayında, ana iş ilk anlaşmalar ve ağ kurulumu." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Ay 7-12 · ilk kadro" metin="Saha + concierge (üretici/danışman kazanımı, stok girişi). Burn ölçülü artar; gelir devreye girer." />
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
        <MaddeKart Ikon={Rocket} baslik="Baz (bu plan)" metin="Ay 24 ~44 müteahhit, run-rate ~12M ₺; 24 ay tahsilat ~11,85M ₺. Referans-satış hızıyla gerçekçi." sinyal="#2fd3bc" />
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
