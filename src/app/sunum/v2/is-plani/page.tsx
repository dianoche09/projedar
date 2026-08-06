import type { Metadata } from "next";
import {
  AlertTriangle,
  BadgeCheck,
  Copy,
  Database,
  EyeOff,
  Gavel,
  Handshake,
  Layers,
  MapPin,
  MessageCircle,
  Network,
  PhoneCall,
  Rocket,
  ShieldCheck,
  Store,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { DeckShell } from "@/components/sunum/DeckShell";
import { Slayt } from "@/components/sunum/Slayt";
import { AdimSirasi, AkisSema, DevSayi, GorselSlayt, MaddeKart } from "@/components/sunum/parcalar";

export const metadata: Metadata = {
  title: "Projedar · İş Planı v2",
  description: "İş planı (v2): ürün, pazar, gelir modeli, GTM, operasyon ve yol haritası.",
};

/** Gelir modeli mini fiyat tablosu (koyu tema). */
function FiyatKart({
  baslik,
  alt,
  satirlar,
  vurgu,
}: {
  baslik: string;
  alt: string;
  satirlar: { ad: string; kapasite: string; fiyat: string }[];
  vurgu?: boolean;
}) {
  return (
    <div className={`deck-kart flex h-full flex-col p-5 text-left ${vurgu ? "ring-1 ring-[#2fd3bc]/40" : ""}`}>
      <p className={`mono text-[10.5px] font-bold uppercase tracking-wider ${vurgu ? "text-[#2fd3bc]" : "text-white/55"}`}>{baslik}</p>
      <p className="mt-1 text-[12.5px] leading-snug text-white/65">{alt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {satirlar.map((s) => (
          <div key={s.ad} className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-2 first:border-0 first:pt-0">
            <div>
              <p className="text-[13px] font-semibold text-white/90">{s.ad}</p>
              <p className="mono text-[10.5px] text-white/45">{s.kapasite}</p>
            </div>
            <p className={`mono flex-none text-[13px] font-bold ${vurgu ? "text-[#2fd3bc]" : "text-white/80"}`}>{s.fiyat}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* v2 · 13 slayt: kapak, özet, sorun, çözüm, pazar, gelir modeli (müteahhit),
   gelir modeli (danışman+ofis), GTM, operasyon, rekabet, yol haritası, ekip&risk, kapanış. */
export default function IsPlaniV2() {
  const slides = [
    /* 1 · Kapak */
    <GorselSlayt
      key="kapak"
      gorsel="/sunum/sehir-panorama.jpg"
      logo
      kicker="Projedar · İş planı"
      baslik="Yeni konut satışının dağıtım altyapısı"
      alt="İnşaat firmalarının konut stoğunu yetkili danışman ağına canlı veriyle dağıtan, komisyonsuz ve kapalı devre B2B ağ. Ürün canlı: projedar.com."
    >
      <p className="da da-4 mono mt-10 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#2fd3bc]">
        Stok kontrolü üreticide. Dağıtım ağda. Çift satış imkânsız.
      </p>
    </GorselSlayt>,

    /* 2 · Yönetici özeti */
    <Slayt key="ozet" genis kicker="Yönetici özeti" baslik="Tek cümlede iş">
      <p className="deck-soft -mt-2 mb-6 max-w-3xl text-[15px] leading-relaxed">
        Projedar, birincil konut satışının dağınık ve elle yürüyen bilgi katmanını tek canlı ağa taşır: üretici stoğunu,
        fiyatını ve kime açılacağını tek noktadan yönetir; yetkili danışman canlı veriyle satar. Gelir müteahhit
        anlaşmasından gelir, komisyona dokunulmaz.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <DevSayi deger="Canlı" etiket="Ürün yayında (projedar.com): stok, tahsis, opsiyon, paylaşım" renk="#2fd3bc" />
        <DevSayi deger="540K" etiket="Yıllık ilk el (yeni) konut satışı: hedef pazar" kaynak="TÜİK 2025" />
        <DevSayi deger="0" etiket="Komisyon: gelir yazılım anlaşmasından, satıştan değil" />
        <DevSayi deger="B2B" etiket="Kapalı devre, davetli ve doğrulanmış ağ" />
      </div>
    </Slayt>,

    /* 3 · Sorun */
    <GorselSlayt key="sorun" gorsel="/sunum/excel-kaos.jpg" hiza="sol" kicker="Sorun" baslik="Satış hâlâ Excel ve WhatsApp'ta">
      <div className="da da-3 mt-8 grid w-full gap-3 sm:grid-cols-2">
        <MaddeKart Ikon={Copy} baslik="Dağınık, eskiyen veri" metin="Stok Excel ve PDF ile dolaşır; zam geldiğinde saha günlerce eski fiyatla satar." />
        <MaddeKart Ikon={AlertTriangle} baslik="Çift satış riski" metin="Aynı daireye birden fazla kapora; itibar kaybı ve hukuki risk kroniktir." sinyal="#e07a6e" />
        <MaddeKart Ikon={EyeOff} baslik="Üretici için kör nokta" metin="Firma stoğunu kimin nasıl sattığını göremez; fiyat disiplini sahada erir." />
        <MaddeKart Ikon={PhoneCall} baslik="Danışman için sürtünme" metin="Doğru bilgi telefon teyidine bakar; müşteri bekler, fırsat kaçar." />
      </div>
    </GorselSlayt>,

    /* 4 · Çözüm + ürün */
    <Slayt key="cozum" genis kicker="Çözüm & ürün" baslik="Üyelere özel canlı stok ağı" alt="Üretici stoğunu Projedar'da yönetir; yetkili danışman her an güncel fiyat ve stokla satar. Alıcıya ulaşan bilgi tek kaynaktan beslenen birebir linktir.">
      <AkisSema
        dugumler={[
          { baslik: "İnşaat firmaları", alt: "Stok + fiyat + yetki", gorsel: "bina" },
          { baslik: "PROJEDAR", alt: "Canlı senkron ağ", vurgu: true, gorsel: "logo" },
          { baslik: "Danışmanlar → Alıcı", alt: "Birebir link paylaşımı", gorsel: "danisman" },
        ]}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <MaddeKart Ikon={Zap} baslik="Canlı veri" metin="Değişiklik saniyeler içinde tüm ağda; sürüm karmaşası biter." sinyal="#2fd3bc" />
        <MaddeKart Ikon={MessageCircle} baslik="Tek kaynak link" metin="Müşteriye giden link her açılışta güncel değeri gösterir." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Database} baslik="Opsiyon kilidi" metin="Opsiyonlanan daire DB seviyesinde kilitlenir; çift satış yapısal engelli." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Layers} baslik="Kontrollü erişim" metin="Kimin neyi göreceğini üretici daire bazında tanımlar." sinyal="#2fd3bc" />
      </div>
    </Slayt>,

    /* 5 · Pazar */
    <Slayt key="pazar" genis kicker="Pazar" baslik="Büyük ve büyüyen bir pazar">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DevSayi deger="1,69M" etiket="2025 toplam konut satışı (+%14,3)" kaynak="TÜİK" />
        <DevSayi deger="540.786" etiket="İlk el (yeni konut): hedef pazarımız (+%11,6)" kaynak="TÜİK" renk="#2fd3bc" />
        <DevSayi deger="%32" etiket="İlk el satışların payı: her 3 satıştan 1'i" kaynak="TÜİK" />
        <DevSayi deger="+%49,3" etiket="İpotekli satışta yıllık artış: canlanan talep" kaynak="TÜİK" />
      </div>
      <p className="deck-kart deck-soft mt-4 px-5 py-4 text-[13.5px] leading-relaxed">
        Bir 100 birimlik proje sellout değeri ~470M TL; yeni proje pazarlaması satışın %1-2 kadardır. Tek satış bile
        yıllık platform ücretini kat kat karşılar: ödeme gücü tartışmasız.
      </p>
    </Slayt>,

    /* 6 · Gelir modeli · Müteahhit */
    <Slayt key="gelir-muteahhit" genis kicker="Gelir modeli · 1" baslik="Müteahhit: proje/daire ölçekli, yıllık" alt="Ana gelir. İlk ~10 müteahhit kurucu (ücretsiz); sonrası taban minimum + yönetilen aktif daire adedine göre kademeli. Ağ büyüdükçe gelir kendiliğinden artar. Komisyon yok.">
      <div className="grid gap-3 sm:grid-cols-2">
        <FiyatKart
          baslik="Müteahhit paketleri · yıllık"
          alt="Ağdaki aktif daire adedine göre (satılınca düşer)"
          vurgu
          satirlar={[
            { ad: "Kurucu", kapasite: "ilk ~10 müteahhit · ilk yıl", fiyat: "Ücretsiz" },
            { ad: "Başlangıç", kapasite: "≤ 50 daire", fiyat: "150.000 ₺" },
            { ad: "Profesyonel", kapasite: "51-150 daire", fiyat: "280.000 ₺" },
            { ad: "İşletme", kapasite: "151-350 daire", fiyat: "480.000 ₺" },
            { ad: "Kurumsal", kapasite: "350+ / çok proje", fiyat: "İletişim" },
            { ad: "Villa / ticari", kapasite: "adet-bazlı", fiyat: "~18.000 ₺/adet" },
          ]}
        />
        <div className="flex flex-col gap-3">
          <MaddeKart Ikon={Handshake} baslik="Değer nettir" metin="Hızlı stok erimesi, fiyat disiplini, sıfır çift satış. Kurulum concierge ile bizde; 'evet' demenin maliyeti sıfır." sinyal="#2fd3bc" />
          <MaddeKart Ikon={BadgeCheck} baslik="Öngörülebilir" metin="Müteahhit daire adedini bilir, fiyatını net görür. Marjinal ücret büyük projede azalır (hacim avantajı)." />
        </div>
      </div>
    </Slayt>,

    /* 7 · Gelir modeli · Danışman & Ofis */
    <Slayt key="gelir-danisman" genis kicker="Gelir modeli · 2" baslik="Danışman: kurucu ücretsiz, sonra Pro; ofis danışman-ölçekli" alt="Danışman tarafı kurucu programla ücretsiz açılır (ağ likiditesini yaratan taraf bilinçli sübvanse edilir); kontenjan sonrası Pro. Gelir katmanları değer kanıtlandıkça derinleşir.">
      <div className="grid gap-3 sm:grid-cols-2">
        <FiyatKart
          baslik="Danışman · bireysel"
          alt="Aylık veya yıllık"
          satirlar={[
            { ad: "Kurucu", kapasite: "ilk ~1000 danışman · ilk yıl", fiyat: "Ücretsiz" },
            { ad: "Pro", kapasite: "gelişmiş araç + marka", fiyat: "750 ₺/ay · 7.500 ₺/yıl" },
          ]}
        />
        <FiyatKart
          baslik="Ofis / Franchise"
          alt="Danışman sayısına göre (aylık/yıllık)"
          satirlar={[
            { ad: "Baz", kapasite: "≤ 5 danışman", fiyat: "25.000 ₺/yıl" },
            { ad: "Büyüme", kapasite: "6-15 danışman", fiyat: "55.000 ₺/yıl" },
            { ad: "Kurumsal Ofis", kapasite: "16-30 danışman", fiyat: "95.000 ₺/yıl" },
            { ad: "Enterprise", kapasite: "30+ danışman", fiyat: "İletişim" },
          ]}
        />
      </div>
      <p className="deck-faint mono mt-4 text-[10.5px] uppercase tracking-wider">
        Komisyon yok: danışmanın kazancına dokunulmaz. Premium = araç ve erişim ücreti. Sonra: veri ürünleri (talep/fiyat endeksi).
      </p>
    </Slayt>,

    /* 8 · GTM */
    <Slayt key="gtm" kicker="Go-to-market" baslik="Önce stok, tek şehirde yoğunluk" alt="İki taraflı ağların mezarlığı boş ağlarla doludur. Sıralama nettir: önce arz, sonra danışman; Ankara'da derinleş, sonra taşı.">
      <AdimSirasi
        adimlar={[
          { baslik: "Arz önce", metin: "Danışmanı çeken tek şey burada olan tahsisli, canlı, doğrulanmış stoktur; boş ekranla açılmaz." },
          { baslik: "Ankara → İstanbul → İzmir", metin: "Giriş pazarı Ankara (152.534 satış, kurucu sahada). Kanıt döngüsü kapanınca oyun kitabı taşınır." },
          { baslik: "Davet zinciri", metin: "Müteahhit kendi emlakçı çevresini davet eder; ofislerle toplu katılım; ilk ~1000 danışman kurucu (ücretsiz)." },
        ]}
      />
    </Slayt>,

    /* 9 · Operasyon */
    <Slayt key="operasyon" kicker="Operasyon" baslik="Sürtünmeyi biz yutuyoruz" alt="B2B araçların öldüğü yer kurulumdur; bizde kurulum ürünün değil ekibin işi.">
      <AdimSirasi
        adimlar={[
          { baslik: "Concierge stok girişi", metin: "Proje, birim, fiyat ve tahsisler ekibimizce girilir; müteahhit ilk gün canlı." },
          { baslik: "KYC kalite kapısı", metin: "Danışman belge doğrulamasından geçer; doğrulanana kadar demo görür. Ağın güveni korunur." },
          { baslik: "İlk paylaşım anı", metin: "Danışmanın ilk WhatsApp paylaşımı dakikalar içinde; değer anı gecikmez." },
        ]}
      />
    </Slayt>,

    /* 10 · Rekabet + savunulabilirlik */
    <Slayt key="rekabet" genis kicker="Rekabet & savunulabilirlik" baslik="Kopyalanması zor olan: kombinasyon" alt="İlan portalları stoğu herkese teşhir eder; CRM'ler tek firmanın içine bakar. Beş özelliği bir arada sunan başka oyuncu yok.">
      <div className="grid gap-3 sm:grid-cols-2">
        <MaddeKart Ikon={Network} baslik="Tek özellik değil, kombinasyon" metin="Çok müteahhitli havuz + tahsisli erişim + DB kilidi + komisyonsuz: her biri kopyalanabilir; dördü birden rakibin modelini bozmadan olmaz." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Database} baslik="Veri birikimi" metin="Her paylaşım, görüntüleme ve opsiyon ilk günden kayıtta; geçmişe dönük üretilemez, ağ büyüdükçe derinleşir." />
        <MaddeKart Ikon={Handshake} baslik="İki tarafı da tutan model" metin="Üretici kontrolü kaybetmez, danışman komisyonsuz ve kesintisiz kazanır; iki taraf da ağda kalmayı seçer." />
        <MaddeKart Ikon={Gavel} baslik="Regülasyon kalkanı" metin="EİDS açık ilanı zorlaştırırken tahsisli birebir paylaşım kapsam dışı; mevzuat modeli koruyor." />
      </div>
    </Slayt>,

    /* 11 · Yol haritası */
    <GorselSlayt key="yol" gorsel="/sunum/vinc-siluet.jpg" hiza="sol" kicker="Yol haritası" baslik="Kanıt → ölçek → katman">
      <div className="da da-3 mt-8 w-full">
        <AdimSirasi
          adimlar={[
            { baslik: "Faz 1 · Bugün: Ankara kanıtı", metin: "Platform canlı; ilk üretici anlaşmaları, davetli danışman ağı, ilk satış vakaları ve talep verisi." },
            { baslik: "Faz 2 · Ölçek & derinleşme", metin: "İstanbul + İzmir; WhatsApp Cloud API ve AI eşleştirme; ofis aboneliği ve danışman Pro geliri." },
            { baslik: "Faz 3 · Gelir katmanları", metin: "Ofis/franchise SaaS, emlakçı premium, veri ürünleri (talep endeksi, fiyat zekâsı); yurtdışı proje stoğu." },
          ]}
        />
      </div>
    </GorselSlayt>,

    /* 12 · Ekip & riskler */
    <Slayt key="ekip-risk" genis kicker="Ekip & risk" baslik="Tek elden kurulan sistem, bilinen riskler">
      <div className="grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Wrench} baslik="Kurucu: ürün + büyüme tek elde" metin="Platform dış kaynak olmadan uçtan uca kuruldu ve canlıda; gayrimenkul teknolojisinde yayında ürün deneyimi." sinyal="#2fd3bc" />
        <MaddeKart Ikon={Users} baslik="İlk ekip: saha + concierge" metin="Yatırımla ilk kadro: üretici/danışman kazanımı ve kurulum operasyonu." />
        <MaddeKart Ikon={Store} baslik="Kademeli büyüme" metin="Ürün mühendisliği, pazarlama ve destek ölçekle devreye alınır." />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <MaddeKart Ikon={Rocket} baslik="Risk: soğuk başlangıç" metin="Azaltma: arz-önce sıralama + concierge kurulum; boş ağ riskini yapısal olarak eler." />
        <MaddeKart Ikon={ShieldCheck} baslik="Risk: müteahhit ikna" metin="Azaltma: canlı demo + referans zinciri + regülasyon argümanı; karar verici tek kişi." />
        <MaddeKart Ikon={MapPin} baslik="Risk: coğrafi dağılım" metin="Azaltma: tek şehirde yoğunluk; ağ etkisi bölgesel, kanıt kapanmadan yeni şehir açılmaz." />
      </div>
    </Slayt>,

    /* 13 · Kapanış */
    <GorselSlayt key="kapanis" gorsel="/sunum/ag-isiklari.jpg" kicker="Kapanış" baslik="Yeni konut satışının dağıtım altyapısını birlikte kuralım" alt="Finansal projeksiyon ve birim ekonomisi için: projedar.com/sunum/v2/finansal">
      <p className="da da-4 mono mt-9 text-[15px] font-semibold tracking-wide text-[#2fd3bc]">projedar.com</p>
    </GorselSlayt>,
  ];

  return <DeckShell baslik="İş planı · v2" slides={slides} />;
}
