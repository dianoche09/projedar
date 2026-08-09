import type { Metadata } from "next";
import {
  Banknote,
  Building2,
  Calculator,
  Coins,
  Flame,
  Globe,
  Layers,
  Rocket,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import { AlintiSlayt, DevSayi, GorselSlayt, MaddeKart } from "@/components/sunum/parcalar";

export const metadata: Metadata = {
  title: "Projedar · Finansal Projeksiyon v2",
  description: "24 aylık finansal plan (v2): gelir ilk aydan, üç gelir akışı, senaryolar.",
};

type Ceyrek = { ad: string; ay: string; yeniProje: number; kumProje: number; kumDanisman: number; gelir: number };

// 24 aylık hedef: Ay 24 → ~100 kümülatif proje + ~5.000 ödeyen danışman + ~150 ofis; aylara göre artan.
// gelir = 3 akış TOPLAMI (müteahhit + emlakçı + ofis), milyon ₺. Yıl 1 müteahhit-ağırlıklı; Yıl 2'de emlakçı + ofis biner.
const CEYREKLER: Ceyrek[] = [
  { ad: "Çeyrek 1", ay: "Ay 1-3", yeniProje: 16, kumProje: 16, kumDanisman: 50, gelir: 0.4 },
  { ad: "Çeyrek 2", ay: "Ay 4-6", yeniProje: 10, kumProje: 26, kumDanisman: 120, gelir: 0.9 },
  { ad: "Çeyrek 3", ay: "Ay 7-9", yeniProje: 11, kumProje: 37, kumDanisman: 300, gelir: 1.6 },
  { ad: "Çeyrek 4", ay: "Ay 10-12", yeniProje: 11, kumProje: 48, kumDanisman: 600, gelir: 2.4 },
  { ad: "Çeyrek 5", ay: "Ay 13-15", yeniProje: 12, kumProje: 60, kumDanisman: 1200, gelir: 3.8 },
  { ad: "Çeyrek 6", ay: "Ay 16-18", yeniProje: 13, kumProje: 73, kumDanisman: 2400, gelir: 5.6 },
  { ad: "Çeyrek 7", ay: "Ay 19-21", yeniProje: 13, kumProje: 86, kumDanisman: 3600, gelir: 7.4 },
  { ad: "Çeyrek 8", ay: "Ay 22-24", yeniProje: 14, kumProje: 100, kumDanisman: 5000, gelir: 9.3 },
];

/** 24 aylık çeyreklik gelir bar grafiği (koyu tema, büyük ve okunur). */
function ProjeksiyonBar() {
  const maxGelir = Math.max(...CEYREKLER.map((c) => c.gelir));
  return (
    <div className="deck-kart p-6 text-left">
      <div className="flex items-end gap-3 sm:gap-4" style={{ height: 340 }}>
        {CEYREKLER.map((c) => (
          <div key={c.ad} className="flex flex-1 flex-col items-center justify-end gap-2.5">
            <span className="mono text-[16px] font-bold text-[#2fd3bc]">{c.gelir.toLocaleString("tr-TR")}M ₺</span>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${Math.max(10, (c.gelir / maxGelir) * 270)}px`,
                background: "linear-gradient(180deg, #2fd3bc 0%, #1a8f7f 100%)",
              }}
            />
            <span className="mono text-[13px] font-bold text-white/85">{c.ad}</span>
            <span className="mono text-[10.5px] text-white/45">{c.ay}</span>
            <span className="mono text-[10px] leading-snug text-[#2fd3bc]/80">
              {c.kumProje} proje
              <br />
              {c.kumDanisman.toLocaleString("tr-TR")} ödeyen danışman
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[12px]">
        <span className="mono text-white/50">Erken: 10 proje + ~750 danışman ilk ~1 yıl ücretsiz (destekçi); emlakçı + ofis geliri Yıl 2&apos;de biner</span>
        <span className="mono font-bold text-[#2fd3bc]">Ay 24: ~100 proje · ~5.000 ödeyen danışman · ~150 ofis · yıllık gelir hızı ~37M ₺</span>
      </div>
    </div>
  );
}

/* v2 · 12 slayt, dönüşümlü ritim (görsel / veri / alıntı / grafik):
   kapak → gelir mimarisi(görsel) → global pazar → alıntı → 24 aylık plan(grafik)
   → kazanım → pazar payı(görsel) → birim ekonomisi → gider(görsel) → senaryolar → yatırım → kapanış */
export default function FinansalV2() {
  const slides = [
    /* 1 · Kapak (görsel) */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/veri-bina.jpg"
      logo
      kicker="Projedar · Finansal projeksiyon"
      baslik="24 aylık plan"
      alt="Ürün canlı. İlk müteahhitler kurucu programıyla ücretsiz ve hızlı katılır; ödeme yapan müteahhit geliri daha ilk aylarda başlar, kurucu aşama tamamlanınca hızlanır. Projedar satış komisyonundan pay almaz."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Baz senaryo (24 ay hedefi) · saha verisiyle güncellenir
      </p>
    </GorselSlayt>,

    /* 2 · Gelir mimarisi (görsel zemin) */
    <GorselSlayt key="mimari" gorsel="/sunum/el-sikisma.jpg" hiza="sol" kicker="Gelir mimarisi" baslik="Üç gelir akışı, tek ağ" alt="Projedar komisyondan pay almaz. Gelir yazılım aboneliğinden; hem müteahhit hem emlakçı hem de ofis/franchise tarafından gelir.">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="1 · Müteahhit anlaşması" metin="Erken ana gelir. İlk müteahhitler kurucu programıyla ücretsiz; sonrası aktif daire adedine göre yıllık 40 binden 600 bin ₺+'a. Uzun ömürlü müşteri, düşük ayrılma." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="2 · Emlakçı üyeliği" metin="Yıl 2'de biner. Kurucu danışman ücretsiz; sonra yıllık ~9.000 ₺. Sektördeki mevcut yazılımların altında → benimseme kolay." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Layers} baslik="3 · Ofis / franchise" metin="Yıl 2'de biner. Danışman sayısına göre kademeli ~25-95 bin ₺/yıl. Binlerce kurumsal franchise ofis var." sinyal="#2fd3bc" />
      </div>
    </GorselSlayt>,

    /* 3 · Global pazar & kategori (veri) */
    <Slayt key="global" genis kicker="Kategori & pazar" baslik="Kategori dünyada kanıtlı; Türkiye'de doğrudan rakip yok" alt="Benzer canlı-stok / yeni-konut satış platformları dünyada büyüyor ve gelir üretiyor. Türkiye'de bu birleşimi (çok-müteahhit + tahsis + komisyonsuz) sunan yok.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Globe} baslik="Global pazar büyük ve büyüyor" metin="Dünya emlak-teknoloji pazarı 2025'te ~45 milyar dolar, 2026'da ~50 milyar dolar; yıllık büyüme ~%13-16. Bu pazarın ~%65'i yazılım." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="Benzer platformlar para kazanıyor" metin="Kuzey Amerika ve Körfez'de canlı-stok / yeni-konut satış platformları yılda milyarlarca dolar işlem hacmi yönetiyor ve abonelik geliriyle büyüyor. Yani model çalışıyor." />
        <MaddeKart Ikon={Target} baslik="Türkiye'de boşluk" metin="Türkiye emlak-teknoloji pazarı ~1,4 milyar dolar (2024). Sektör yazılıma zaten ödüyor; ama çok-müteahhitli, tahsisli ve komisyonsuz birleşimi kimse sunmuyor." sinyal="#2fd3bc" />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Kaynak: global emlak-teknoloji pazar raporları (2025-2026). Bu rakamlar pazar büyüklüğüdür, tek bir şirketin cirosu değil.
      </p>
    </Slayt>,

    /* 4 · Alıntı (vuruş) */
    <AlintiSlayt
      key="alinti"
      metin="Gelir ilk aydan başlar; iş Yıl 2'de kendini besler."
      alt="Sermaye 24 ay idare parası değil, büyümeyi hızlandıran yakıttır."
    />,

    /* 5 · 24 aylık plan (büyük grafik) */
    <Slayt key="plan" genis kicker="24 aylık plan" baslik="Gelir ilk aydan başlar, Yıl 2'de hızlanır" alt="Piyasada binlerce proje var: arz kısıt değil, kısıt saha ve kurulum kapasitesi. İlk kurucu müteahhitler ücretsiz olduğu için ağ hızlı dolar; ödeme yapan müteahhit geliri ilk aylarda başlar.">
      <ProjeksiyonBar />
    </Slayt>,

    /* 6 · Kazanım (büyük sayılar) */
    <Slayt key="kazanim" genis kicker="Kazanım" baslik="Referans-satış hızıyla büyüme">
      <div className="grid gap-3 sm:grid-cols-4">
        <DevSayi deger="~100" etiket="Ay 24 kümülatif proje (pazarın ~%5'i)" renk="#2fd3bc" />
        <DevSayi deger="~5.000" etiket="Ay 24 ödeyen danışman" renk="#2fd3bc" />
        <DevSayi deger="~150" etiket="Ay 24 ofis / franchise aboneliği" renk="#2fd3bc" />
        <DevSayi deger="~37M ₺" etiket="Ay 24 yıllık gelir hızı (üç akış toplamı)" renk="#2fd3bc" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        İlk müteahhitler kurucu programıyla ücretsiz kazanılır (referans + örnek vaka + stok likiditesi). Yıl 1 müteahhit-ağırlıklı
        (ilk ödeme daha birinci-ikinci ayda); Yıl 2&apos;de emlakçı üyeliği ve ofis/franchise geliri üstüne biner → üç akış
        birlikte yıllık gelir hızını ~37M ₺&apos;ye taşır.
      </p>
    </Slayt>,

    /* 7 · Pazar payı (görsel zemin) */
    <GorselSlayt key="pazar-payi" gorsel="/sunum/konut-aksam.jpg" hiza="sol" kicker="Pazar payı" baslik="Hedef: 2 yılda ~%5 proje, ~%10 danışman" alt="İki taraftan da (müteahhit + emlakçı) + ofisten gelir üreten yapı. Hedef pazarın küçük bir kesiti; talep yaratmıyoruz, mevcut hacmin bir dilimine erişiyoruz.">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Building2} baslik="Projelerin ~%5'i sistemde" metin="Aktif kurumsal proje evreni ~2.000 (540.786 ilk-el konut/TÜİK 2025). 24 ayda ~100 proje ≈ ~%5." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Danışmanların ~%10'una ulaşım" metin="62.000+ belgeli danışman. ~6.000 danışman ağda ≈ ~%10; bunun ~5.000'i ödeyen." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Layers} baslik="Ofis / franchise" metin="88.572 yetki belgeli emlak işletmesi; binlerce kurumsal franchise. ~150 ofis = küçük bir dilim." />
      </div>
    </GorselSlayt>,

    /* 8 · Birim ekonomisi (veri) */
    <Slayt key="birim" genis kicker="Birim ekonomisi" baslik="Tek anlaşma, edinme maliyetini hızla karşılar" alt="Yıllık peşin sözleşme + düşük müşteri kaybı + referans yoluyla düşük edinme maliyeti = sağlıklı geri ödeme.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MaddeKart Ikon={Coins} baslik="Ortalama anlaşma" metin="~250 bin ₺/yıl (40 bin girişten 600 bin+'a). Küçük proje yumuşak giriş kademesiyle başlar, büyüklük arttıkça üst pakete geçer." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="Bir müşteriden 3 yıllık gelir" metin="Düşük ayrılma × yıllık yenileme: bir müteahhitten 3 yılda 750 bin ₺+ gelir." />
        <MaddeKart Ikon={Target} baslik="Müşteri edinme maliyeti" metin="Referans ve el-satışıyla kazanılır: dijital reklam yok, düşük maliyet. Karar veren tek kişi." />
        <MaddeKart Ikon={Calculator} baslik="Geri ödeme süresi" metin="Yıllık peşin tahsilat: tek anlaşma, o müşteriyi kazanma maliyetini ilk yıl içinde karşılar." sinyal="#2fd3bc" />
      </div>
    </Slayt>,

    /* 9 · Gider & ekip (görsel zemin) */
    <GorselSlayt key="gider" gorsel="/sunum/santiye-gece.jpg" hiza="sol" kicker="Gider & ekip" baslik="Yalın başlangıç, ölçekle büyüyen kadro" alt="Ürün canlı ve dış kaynaksız kuruldu; sabit maliyet düşük. Yatırım öncelikle saha ve kurulum kadrosuna gider.">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Wallet} baslik="Ay 1-6 · yalın" metin="Kurucu + altyapı. Düşük gider; ürün zaten yayında, ana iş ilk anlaşmalar ve ağ kurulumu." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="Ay 7-12 · kurucu dönem" metin="Saha + kurulum ekibi. Gider ölçülü artar; gelir henüz düşük, ağ likiditesi kurulur." />
        <MaddeKart Ikon={Flame} baslik="Ay 13-24 · ölçek" metin="Küçük ekip + 2. şehir. Gider gelirle dengelenir, büyüme hızlanır." />
      </div>
    </GorselSlayt>,

    /* 10 · Senaryolar (üç patika) */
    <Slayt key="senaryo" genis kicker="Senaryolar" baslik="Üç patika, aynı model" alt="Baz senaryo referans-satış hızına dayanır; alt ve üst bantlar kazanım hızının çarpanıdır.">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Target} baslik="Muhafazakâr" metin="Ay 24 ~60 proje · ~2.500 ödeyen danışman · ~80 ofis, yıllık gelir hızı ~22M ₺. Yavaş kazanım; alt bant." />
        <MaddeKart Ikon={Rocket} baslik="Baz (hedef)" metin="Ay 24 ~100 proje · ~5.000 ödeyen danışman · ~150 ofis, yıllık gelir hızı ~37M ₺; 24 ayda toplam tahsilat ~31M ₺." sinyal="#2fd3bc" />
        <MaddeKart Ikon={TrendingUp} baslik="Agresif" metin="Ay 24 ~150 proje · ~8.000 ödeyen danışman · ~250 ofis, yıllık gelir hızı ~60M ₺+. Erken 2. şehir + güçlü referans." />
      </div>
    </Slayt>,

    /* 11 · Yatırım (ask) */
    <Slayt key="yatirim" kicker="Yatırım" baslik="10 milyon ₺ / %25 — başlangıç değeri, ilk gelirle yükselir" alt="Ürün canlı ve dış kaynaksız kuruldu; değerin büyük kısmı zaten yaratıldı. 40M ₺'lik yatırım-sonrası değer cirosuz aşamanın fiyatıdır; ilk ödeyen müteahhitle yükselir.">
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <DevSayi deger="10M ₺ / %25" etiket="Turun büyüklüğü · yatırım sonrası değer ~40M ₺ (öncesi ~30M ₺)" renk="#2fd3bc" />
        <DevSayi deger="7,5M + 2,5M ₺" etiket="Şirkete sermaye + kurucunun emeğinin/yatırımının kısmi karşılığı" />
        <DevSayi deger="→ ~60M ₺+" etiket="İlk ödeyen müteahhit imzalanınca şirket değeri yükselir" renk="#2fd3bc" />
      </div>
      <p className="deck-faint mono mb-3 text-[10.5px] uppercase tracking-wider">7,5M ₺ sermaye kullanımı — öncelik ekip büyütme:</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Users} baslik="Saha & kurulum ekibi" metin="Müteahhit/danışman kazanımı + kurulum operasyonu: turun ana kullanımı, büyüme hızını belirleyen kalem." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Building2} baslik="Ürün derinleşme" metin="WhatsApp entegrasyonu, yapay zekâ eşleştirme, ofis/premium araçları, veri altyapısı." />
        <MaddeKart Ikon={Banknote} baslik="Pazarlama & nakit tamponu" metin="Marka, sektör etkinlikleri, nakit tamponu. Gelir ilk aydan başladığı için sermaye idare parası değil, büyüme yakıtıdır." />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        2,5M ₺ = kurucunun ürünü kendi kaynağıyla fikirden canlıya taşımasının kısmi karşılığıdır. Değerleme cirosuz aşamanın fiyatı; ilk gelirle yükselir.
      </p>
    </Slayt>,

    /* 12 · Kapanış (görsel) */
    <GorselSlayt key="kapanis" gorsel="/sunum/ag-isiklari.jpg" kicker="Kapanış" baslik="Kurulu ürün, net model, ölçeklenebilir plan" alt="İş planı: projedar.com/sunum/v2/is-plani · Pitch: projedar.com/sunum/v2/pitch">
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="Finansal projeksiyon · v2" slides={slides} />;
}
