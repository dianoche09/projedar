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

type Ceyrek = { ad: string; ay: string; yeniProje: number; kumProje: number; kumDanisman: number; gelir: number };

// 24 aylık hedef: Ay 24 → ~100 kümülatif proje + ~5.000 ÖDEYEN danışman + ~150 ofis; aylara göre artan.
// gelir = 3 akış TOPLAMI (müteahhit + emlakçı Pro + ofis). Yıl 1 müteahhit-ağırlıklı (danışman/ofis kurucu ücretsiz),
// Yıl 2'de emlakçı + ofis geliri biner → çıkış run-rate ~37M ₺ (Ç8 × 4).
const CEYREKLER: Ceyrek[] = [
  { ad: "Ç1", ay: "Ay 1-3", yeniProje: 16, kumProje: 16, kumDanisman: 50, gelir: 0.4 },
  { ad: "Ç2", ay: "Ay 4-6", yeniProje: 10, kumProje: 26, kumDanisman: 120, gelir: 0.9 },
  { ad: "Ç3", ay: "Ay 7-9", yeniProje: 11, kumProje: 37, kumDanisman: 300, gelir: 1.6 },
  { ad: "Ç4", ay: "Ay 10-12", yeniProje: 11, kumProje: 48, kumDanisman: 600, gelir: 2.4 },
  { ad: "Ç5", ay: "Ay 13-15", yeniProje: 12, kumProje: 60, kumDanisman: 1200, gelir: 3.8 },
  { ad: "Ç6", ay: "Ay 16-18", yeniProje: 13, kumProje: 73, kumDanisman: 2400, gelir: 5.6 },
  { ad: "Ç7", ay: "Ay 19-21", yeniProje: 13, kumProje: 86, kumDanisman: 3600, gelir: 7.4 },
  { ad: "Ç8", ay: "Ay 22-24", yeniProje: 14, kumProje: 100, kumDanisman: 5000, gelir: 9.3 },
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
            <span className="mono text-[8px] leading-tight text-[#2fd3bc]/70">
              {c.kumProje} proje
              <br />
              {c.kumDanisman.toLocaleString("tr-TR")} öd. dnş
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px]">
        <span className="mono text-white/50">Erken: 10 proje + ~750 danışman ~1 yıl ücretsiz (destekçi); emlakçı + ofis geliri Yıl 2&apos;de biner</span>
        <span className="mono font-bold text-[#2fd3bc]">Ay 24: ~100 proje · ~5.000 ödeyen danışman · ~150 ofis · çıkış run-rate ~37M ₺ · 24-ay tahsilat ~31M ₺</span>
      </div>
    </div>
  );
}

/* v2 · 11 slayt: kapak, gelir mimarisi, fiyat çapası, 24 aylık plan, kazanım, pazar payı,
   birim ekonomisi, gider & ekip, senaryolar, yatırım, kapanış. */
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
        Baz senaryo (24 ay hedefi) · saha verisiyle güncellenir
      </p>
    </GorselSlayt>,

    /* 2 · Gelir mimarisi */
    <Slayt key="mimari" genis kicker="Gelir mimarisi" baslik="Üç gelir akışı, tek ağ" alt="Projedar komisyondan pay almaz. Gelir yazılım/erişim aboneliğinden; her iki taraftan da (müteahhit + emlakçı) + ofis/franchise aboneliğinden. Veri ürünleri sonraki faz.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="1 · Müteahhit anlaşması (ANA, erken)" metin="İlk müteahhitler kurucu programıyla ücretsiz. Sonrası aktif daire adedine göre yıllık: küçük proje (&lt;50 daire) 40-85K → 150K orta → 600K+ enterprise. Yüksek LTV, düşük churn." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="2 · Emlakçı Pro (Yıl 2)" metin="Kurucu danışman ücretsiz; sonra Pro ~9.000₺/yıl (750₺/ay). Rakip CRM'lerin (RE-OS 13-14K, Novo 24-36K) altında → benimseme kolay." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Layers} baslik="3 · Ofis / franchise (Yıl 2)" metin="Kademeli ofis aboneliği ~25-95K₺/yıl (danışman sayısına göre). Binlerce kurumsal franchise ofis (RE/MAX, C21, Turyap…). Veri ürünleri sonraki faz." sinyal="#2fd3bc" />
      </div>
    </Slayt>,

    /* 2b · Fiyat çapası */
    <Slayt key="fiyat-capasi" genis kicker="Fiyat çapası" baslik="Sektör zaten yazılıma ödüyor, üstelik komisyonlu" alt="İlan portalları hariç: emlakçı, ofis ve müteahhit halihazırda CRM ve dijital-satış yazılımına ödeme yapıyor. Ödeme isteği kanıtlı; bizim fiyatımız altında ve komisyonsuz.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Users} baslik="Emlakçı CRM (yerli)" metin="RE-OS ₺1.100-1.200/ay (~13-14K/yıl) · Novo Pro ₺2.999/ay (~36K/yıl) · EmlakCRMx ~4K/yıl. Bizim emlakçı Pro: ~9K/yıl." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Building2} baslik="Ofis / müteahhit yazılımı" metin="RE-OS ofis ~29-32K/yıl · Novo Business ₺4.999/ay (~60K/yıl) · DomusHub ~100-200K/yıl · Nogbase ~685K/yıl. Bizim ofis: 25-95K; müteahhit: 150-600K." />
        <MaddeKart Ikon={Coins} baslik="Üstelik komisyonsuz" metin="Bunların çoğu komisyonlu ya da tek-firma iç sistemi. Biz komisyondan pay almıyoruz + çok-müteahhit canlı stok veriyoruz." sinyal="#2fd3bc" />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Kaynak: yerli CRM fiyat sayfaları + iç rakip analizi (2026). Portal ilan ücretleri hariç; bu, ilan-dışı yazılım harcamasıdır.
      </p>
    </Slayt>,

    /* 3 · 24 aylık plan */
    <Slayt key="plan" genis kicker="24 aylık plan" baslik="Gelir Ay 1'den; kurucu aşama tamamlanınca ivmelenir" alt="Piyasada binlerce proje var: arz kısıt değil, kısıt saha ve concierge kapasitesi. İlk kurucu müteahhitler ücretsiz olduğu için ağ hızlı dolar; paralı müteahhit geliri Ay 1-2'de başlar ve referans çarkıyla ivmelenir.">
      <ProjeksiyonBar />
    </Slayt>,

    /* 4 · Kazanım & run-rate */
    <Slayt key="kazanim" genis kicker="Kazanım" baslik="Referans-satış hızıyla büyüme">
      <div className="grid gap-3 sm:grid-cols-4">
        <DevSayi deger="~100" etiket="Ay 24 kümülatif proje (~%5 pazar)" renk="#2fd3bc" />
        <DevSayi deger="~5.000" etiket="Ay 24 ödeyen danışman (Pro/ofis)" renk="#2fd3bc" />
        <DevSayi deger="~150" etiket="Ay 24 ofis / franchise aboneliği" renk="#2fd3bc" />
        <DevSayi deger="~37M ₺" etiket="Ay 24 çıkış run-rate (müteahhit + emlakçı + ofis)" renk="#2fd3bc" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        İlk müteahhitler kurucu programıyla ücretsiz kazanılır (referans + vaka + stok likiditesi). Yıl 1 müteahhit-ağırlıklı
        (ilk paralı gelir Ay 1-2); Yıl 2&apos;de emlakçı Pro ve ofis/franchise geliri üst üste biner → üç akış birlikte çıkış
        run-rate&apos;ini ~37M ₺&apos;ye taşır.
      </p>
    </Slayt>,

    /* 4b · Pazar payı / penetrasyon */
    <Slayt key="pazar-payi" genis kicker="Pazar payı" baslik="Hedef: 2 yılda ~%5 proje, ~%10 danışman" alt="İki taraftan da (müteahhit + emlakçı) + ofisten gelir üreten yapı. Hedef pazarın küçük bir kesiti: talep yaratmıyoruz, mevcut hacmin bir dilimine erişiyoruz.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="Projelerin ~%5'i sistemde" metin="Aktif kurumsal proje evreni ~2.000 (1.000-2.500 aktif geliştirici; 540.786 ilk-el konut/TÜİK 2025). 24 ayda ~100 proje ≈ ~%5 listeleme." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Danışmanların ~%10'una ulaşım" metin="62.000+ MYK belgeli danışman. ~6.000 danışman ağda ≈ ~%10; bunun ~5.000'i ödeyen (Pro/ofis)." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Layers} baslik="Ofis / franchise" metin="88.572 yetki belgeli emlak işletmesi; binlerce kurumsal franchise (RE/MAX, C21, Turyap…). ~150 ofis aboneliği = küçük bir dilim." />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Pazar büyüklüğü: ~2,7 trilyon ₺ yıllık ilk-el konut cirosu; TR PropTech ~1,4 milyar $ (2024). Penetrasyon hedefi mütevazı ve ulaşılabilir; asıl kısıt talep değil, saha/concierge kapasitesi.
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
        <MaddeKart Ikon={Target} baslik="Muhafazakar" metin="Ay 24 ~60 proje · ~2.500 ödeyen danışman · ~80 ofis, çıkış run-rate ~22M ₺. Yavaş kazanım; alt bant." />
        <MaddeKart Ikon={Rocket} baslik="Baz (hedef)" metin="Ay 24 ~100 proje · ~5.000 ödeyen danışman · ~150 ofis, çıkış run-rate ~37M ₺; 24 ay tahsilat ~31M ₺." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="Agresif" metin="Ay 24 ~150 proje · ~8.000 ödeyen danışman · ~250 ofis, çıkış run-rate ~60M ₺+. Erken 2. şehir + güçlü referans döngüsü." />
      </div>
    </Slayt>,

    /* 8 · Yatırım */
    <Slayt key="yatirim" kicker="Yatırım" baslik="$200K / %25 — sermaye büyümeye" alt="Ürün canlı ve dış kaynaksız kuruldu; tur, 24 aylık büyümeyi ve saha kadrosunu fonlar.">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <DevSayi deger="$200K" etiket="Tur büyüklüğü · %25 hisse karşılığı" renk="#2fd3bc" />
        <DevSayi deger="~$800K" etiket="Post-money değerleme (pre-money ~$600K)" />
        <DevSayi deger="$150K + $50K" etiket="Şirkete sermaye (primary) + kurucu emek/yatırım karşılığı (secondary)" renk="#2fd3bc" />
      </div>
      <p className="deck-faint mono mb-3 text-[10.5px] uppercase tracking-wider">$150K sermaye kullanımı (aşağıdaki üç kalem):</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Users} baslik="Saha & concierge" metin="Üretici/danışman kazanımı ve kurulum operasyonu: kazanım hızını belirleyen ana kalem." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Building2} baslik="Ürün derinleşme" metin="WhatsApp Cloud API, AI eşleştirme, ofis/Pro araçları, veri ürünleri altyapısı." />
        <MaddeKart Ikon={Banknote} baslik="Pazarlama & runway" metin="Marka, sektör etkinlikleri, 24 aylık nakit tamponu." />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        $50K, kurucunun bugüne kadarki geliştirme ve yatırımının kısmi karşılığıdır (secondary). Rakamlar muhafazakar bazdır ve saha verisiyle güncellenir.
      </p>
    </Slayt>,

    /* 9 · Kapanış */
    <GorselSlayt key="kapanis" gorsel="/sunum/ag-isiklari.jpg" kicker="Kapanış" baslik="Kurulu ürün, net model, ölçeklenebilir plan" alt="İş planı: projedar.com/sunum/v2/is-plani · Pitch: projedar.com/sunum/v2/pitch">
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Finansal projeksiyon · v2" slides={slides} />;
}
