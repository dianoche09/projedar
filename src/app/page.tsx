import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LansmanPopup } from "@/components/LansmanPopup";
import { panelYolu } from "@/lib/roller";
import { Sayaclar } from "@/components/Sayaclar";
import { HeroFazSeridi as HeroZamanAkisi } from "@/components/landing/HeroZamanAkisi";
import { CeliskiSahnesi } from "@/components/landing/CeliskiSahnesi";
import { DegilRotasyonu } from "@/components/landing/DegilRotasyonu";
import { SizintiSahnesi } from "@/components/landing/SizintiSahnesi";
import { KilitKoreografi } from "@/components/landing/KilitKoreografi";
import { KapiHaritasi } from "@/components/landing/KapiHaritasi";
import { AgDiyagrami } from "@/components/landing/AgDiyagrami";
import { KapanisFooter } from "@/components/KapanisFooter";
import "@/app/mockup-02/mockup02.css";
import { CanliKomutaMerkezi } from "@/components/CanliKomutaMerkezi";
import { CanliHavuzDemo } from "@/components/CanliHavuzDemo";
import { CanliPortfoy } from "@/components/CanliPortfoy";
import { BirebirPaylasim } from "@/components/BirebirPaylasim";
import { Reveal } from "@/components/Reveal";
import { AnaMenu } from "@/components/AnaMenu";
import { ShieldCheck, Database, BadgeCheck, CircleSlash, Lock, FileCheck } from "lucide-react";

/** Proje anatomisi, proje sahibi ne yükler / danışman ne görür. */
const YUKLER = [
  "Proje künyesi: ad, konum, teslim tarihi, doğrulama",
  "Blok · kat · daire yapısı (bina kesiti)",
  "Tip · oda · net/brüt m² · cephe · manzara",
  "Liste fiyatı + ödeme planı (peşinat/taksit)",
  "Durum: müsait / opsiyon / satıldı",
  "Kat planı, görseller, video, broşür",
  "Tahsis: hangi daire kime açık",
];
const GORUR = [
  "Canlı stok + durum sinyalleri (yeşil/amber/kırmızı)",
  "Kat planı + net/brüt + cephe + kat",
  "Canlı fiyat + ödeme planı",
  'Bilginin ne kadar güncel olduğu her kayıtta yazar (ör. "2 dk önce")',
  "Tek tıkla paylaş + opsiyon al",
  "Birebir canlı mikrosite linki",
  "Yalnız kendine açık daireler (gerisi gizli)",
];

/** Güven / teminat unsurları (sahte logo yerine dürüst güven). */
const GUVEN = [
  { Icon: ShieldCheck, b: "Sıfır çift satış", a: "Bir daire opsiyonlandığı anda sistem onu herkes için kilitler. Aynı daire iki kişiye birden satılamaz; bu bir söz değil, sistemin çalışma şeklidir." },
  { Icon: Database, b: "Herkes yalnız kendine açılanı görür", a: "Kim hangi projeyi, hangi daireyi görecek; bunu proje sahibi belirler. Danışmana açılmayan daire ekranında hiç görünmez." },
  { Icon: BadgeCheck, b: "Doğrulanmış projeler", a: "Her proje, belgeleri kontrol edildikten sonra doğrulama rozetiyle yayınlanır; kaynağı belirsiz ilan yoktur." },
  { Icon: CircleSlash, b: "Kazancın %100'ü senin", a: "Satıştan pay almayız; danışman için başlangıçta tamamen ücretsizdir." },
  { Icon: Lock, b: "Kapalı, davetli ağ", a: "Herkese açık ilan yoktur; projeler yalnız davetli ve yetkili danışmanlara açılır, müşteriye birebir paylaşılır." },
  { Icon: FileCheck, b: "Müşterin sende kalır", a: "Müşterinin kişisel verisi toplanıp profillenmez; alıcı bilgisi danışmanda kalır, kimseyle paylaşılmaz." },
];

const SITE = "https://projedar.com";

export const metadata: Metadata = {
  title: "Projedar | Yeni Konut Projelerinin Canlı Satış Ağı",
  description:
    "İnşaat firmalarının canlı proje bilgilerini, güncel fiyatlarını ve bağımsız bölüm durumlarını yetkili gayrimenkul danışmanlarıyla tek satış ağında buluşturur. Bir daire değişir, bütün ağ güncellenir. Kontrollü erişim, tek doğru veri; Projedar satış komisyonuna ortak olmaz.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Projedar | Yeni Konut Projelerinin Canlı Satış Ağı",
    description:
      "Proje sahibiyle yetkili danışmanları aynı canlı, güncel gerçekte buluşturan satış ve dağıtım ağı. Tek doğru veri, çift-satış kalkanı; Projedar satış komisyonuna ortak olmaz.",
    type: "website",
    siteName: "Projedar",
    url: SITE,
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title: "Projedar | Yeni Konut Projelerinin Canlı Satış Ağı" },
};


const FAYDA = {
  prod: {
    rol: "Proje sahibi için",
    baslik: "Kontrolü bırakmadan, her yere ulaş",
    alt: "Stoğun, fiyatın, dağıtımın tek elde.",
    sinyal: "var(--color-navy)",
    maddeler: [
      ["Yüzlerce danışmana tek noktadan ulaş", "herkes anında doğru fiyatı görür."],
      ["Markan yanlış bilgiyle yıpranmaz", "eski fiyat dolaşımda kalmaz."],
      ["Kime ne açık, sen belirlersin", "istersen belirli daireleri yalnız seçtiğin danışmanlara aç."],
      ["Satışı canlı izle", "hangi daire ilgi görüyor, ne zaman opsiyonlandı."],
    ],
  },
  cons: {
    rol: "Gayrimenkul danışmanı için",
    baslik: "Doğru daire, doğru fiyat, tek dokunuş",
    alt: "Canlı satış ağı, dağınık dosya yok, ücretsiz.",
    sinyal: "var(--color-teal)",
    maddeler: [
      ["Sana tahsisli projeler tek canlı ağda", "dağınık Excel, eski PDF, WhatsApp yok."],
      ["Her zaman canlı fiyat", "eski fiyatla müşteri önünde rezil olma."],
      ["Tek dokunuşla paylaş", "fiyat o anki canlı değerden basılır."],
      ["Kazancın %100'ü sende", "komisyondan pay almayız; başlangıçta tamamen ücretsiz."],
    ],
  },
} as const;

const ADIMLAR = [
  { no: "01", baslik: "Proje sahibi stoğunu yükler", metin: "Proje, blok ve daireler tek noktaya alınır. Fiyat ve durum tek doğru kaynakta toplanır." },
  { no: "02", baslik: "Canlı satış ağına açılır", metin: "Yetkili danışmanlar ağdaki projeleri canlı görür. Proje sahibi isterse belirli daireleri yalnız seçtiği danışmanlara özel açar." },
  { no: "03", baslik: "Danışman müşterisine paylaşır", metin: "Danışman kendine açık daireleri tek dokunuşla iletir; fiyat o anki canlı değerden basılır." },
  { no: "04", baslik: "Opsiyon → satış kapanır", metin: "Daire opsiyona kilitlenir; çift-satış kalkanı çakışmayı engeller. Satışta stok anında güncellenir." },
];

const PORTFOY = [
  { src: "/gorseller/render-cankaya-vadi.jpg", ad: "Çankaya Vadi", konum: "Ankara · Çankaya", musait: 58, opsiyon: 22, satildi: 20, taze: "2 dk önce", sinyal: "▲ Yüksek talep", g: 58, a: 22, r: 20 },
  { src: "/gorseller/render-kule-rezidans.jpg", ad: "Kule Rezidans", konum: "İstanbul · Ataşehir", musait: 31, opsiyon: 14, satildi: 45, taze: "11 dk önce", sinyal: "▲ İlgi artıyor", g: 34, a: 16, r: 50 },
  { src: "/gorseller/render-sahil-konutlari.jpg", ad: "Sahil Konutları", konum: "İzmir · Çeşme", musait: 12, opsiyon: 8, satildi: 60, taze: "2 gün önce", sinyal: "Son birimler", g: 15, a: 10, r: 75, eski: true },
  { src: "/gorseller/render-meydan-park.jpg", ad: "Meydan Park", konum: "Ankara · Etimesgut", musait: 44, opsiyon: 9, satildi: 17, taze: "37 dk önce", sinyal: "Yeni açıldı", g: 62, a: 13, r: 25 },
];

const SSS: { s: string; c: string }[] = [
  { s: "Projedar bir ilan portalı mı?", c: "Hayır. Projedar, proje sahipleri ile gayrimenkul danışmanlarını canlı ve doğru veriyle buluşturan kapalı bir B2B ağdır. Son kullanıcıya açık ilan yoktur; paylaşım birebir/WhatsApp ile yapılır." },
  { s: "Gayrimenkul danışmanı için ücretli mi?", c: "Başlangıçta tamamen ücretsizdir ve hiçbir satıştan komisyon alınmaz. Danışman canlı ağdaki projeleri görür ve müşterisine paylaşır." },
  { s: "Danışman hangi projeleri görür?", c: "Danışman, canlı ağdaki tahsisli projeleri görür. Proje sahibi isterse belirli daireleri veya projeleri yalnız seçtiği danışmanlara özel açabilir (tahsis)." },
  { s: "Fiyatlar nasıl güncel kalıyor?", c: "Fiyat yalnız birim kaydında tutulur; hiçbir yerde kopyalanmaz. Paylaşımda fiyat o anki canlı değerden basıldığı için eski fiyat dolaşıma giremez." },
  { s: "Aynı daire iki danışmana satılabilir mi?", c: "Hayır. Aktif opsiyon veritabanı seviyesinde kilitlenir; çift-satış kalkanı iki danışmanın aynı daireyi aynı anda satışa kilitlemesini engeller." },
  { s: "Proje sahibi neyi kontrol eder?", c: "Stoğunu, fiyatını ve kimin neyi göreceğini tek panelden yönetir; satışı canlı izler. Tüm bilgi tek doğru kaynaktadır." },
  { s: "Mobilde çalışır mı?", c: "Evet. Projedar mobil-önce bir uygulamadır (PWA); telefona kurulabilir, sahada hızlı ve çevrimdışına dayanıklı çalışır." },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE}/#org`, name: "Projedar", url: SITE, logo: `${SITE}/icon-512.png`, description: "Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan kontrollü erişimli konut stoğu dağıtım ağı." },
      { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Projedar", inLanguage: "tr-TR", publisher: { "@id": `${SITE}/#org` } },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE}/#app`,
        name: "Projedar",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android (PWA)",
        description: "Çok-müteahhitli, üretici-kontrollü canlı konut stoğu dağıtım ağı. Tek doğru kaynak, granüler tahsis, çift-satış kalkanı, görünür tazelik.",
        publisher: { "@id": `${SITE}/#org` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY", description: "Gayrimenkul danışmanı için başlangıçta ücretsiz; Projedar satış komisyonuna ortak olmaz." },
      },
      {
        "@type": "Service",
        "@id": `${SITE}/#service`,
        name: "Canlı Konut Stoğu Dağıtım Ağı",
        serviceType: "Yeni konut projeleri için tahsisli canlı satış ve dağıtım ağı",
        provider: { "@id": `${SITE}/#org` },
        areaServed: { "@type": "Country", name: "Türkiye" },
        description: "Proje sahibi stoğunu, fiyatını ve dağıtımını tek noktadan yönetir; yetkili gayrimenkul danışmanları tahsisli projeleri tek canlı ağda görür ve paylaşır. Projedar satış komisyonuna ortak olmaz.",
        audience: [
          { "@type": "Audience", audienceType: "Müteahhit / konut projesi geliştiren firma" },
          { "@type": "Audience", audienceType: "Gayrimenkul danışmanı ve ofisi" },
        ],
      },
      {
        "@type": "SiteNavigationElement",
        "@id": `${SITE}/#nav`,
        name: ["Konut projeleri", "Müteahhitler için", "Danışmanlar için", "Projedar nedir?", "Rehber", "Güven Protokolü"],
        url: [`${SITE}/konut-projeleri`, `${SITE}/muteahhit`, `${SITE}/emlakci`, `${SITE}/nedir`, `${SITE}/rehber`, `${SITE}/guven`],
      },
      { "@type": "FAQPage", "@id": `${SITE}/#faq`, mainEntity: SSS.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })) },
    ],
  };
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Landing herkese açık — giriş yapmış kullanıcı YÖNLENDİRİLMEZ; header'da "Panele git" gösterilir.
  let panelHref: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("rol, durum").eq("id", user.id).single();
    panelHref = data && data.durum !== "aktif" ? "/hesap-bekliyor" : panelYolu(data?.rol);
  }

  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      {/* ============ ÜST MENÜ (ortak; anasayfada ikincil şerit yok) ============ */}
      <AnaMenu panelHref={panelHref} />

      {/* ============ HERO: Zaman Akışı (mockup-07'den; 3 fazlı video, kullanıcı seçimi) ============ */}
      <HeroZamanAkisi />

      {/* ============ NEDİR KARTI: hero'nun hemen altında (kullanıcı seçimi) ============ */}
      <section className="relative px-5 py-14 sm:px-6 sm:py-16">
        <Reveal>
          <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-[var(--cizgi)] bg-white p-7 shadow-[var(--golge-2)] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Nedir</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  <DegilRotasyonu /> değil,
                  <br />
                  <span className="inline-block border-b-[0.12em] border-green pb-0.5">dağıtım altyapısı</span>
                </h2>
              </div>
              <div className="content-center">
                <p className="text-pretty text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                  İnşaat halindeki lüks projenin verisi tek kayıtta tutulur: üretici fiyatı, durumu ve
                  kimin göreceğini tek noktadan yönetir. Danışman yalnız kendisine tahsisli birimleri
                  görür ve müşterisine her zaman canlı değerle paylaşır. Faz ilerledikçe değişen tek
                  şey fiyattır; kaydın adresi hiç değişmez.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ CANLI PORTFÖY (kullanıcı seçimi: NEDİR'in altında) ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Canlı portföy</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Her proje, tek canlı ağda
              </h2>
              <p className="mx-auto mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">Her proje bir mini-panel: müsait / opsiyon / satıldı dağılımı, son güncelleme, talep sinyali.</p>
            </div>
          </Reveal>
          <CanliPortfoy items={PORTFOY} />
        </div>
      </section>

      {/* ============ BOZUK SİSTEM: dört kanal çelişkisi (mockup-02'den) ============ */}
      <section className="border-b border-[var(--cizgi)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#a23f34]">Bozuk sistem</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                  Aynı daire. Dört kanal. Dört ayrı fiyat.
                </h2>
                <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                  Excel ekleri, PDF sürümleri, WhatsApp mesajları, telefon notları: her kopya kendi gerçeğini anlatır. Kaos aşağıda; izleyin.
                </p>
              </div>
              <div className="content-center">
                <p className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink sm:text-[16px] lg:whitespace-nowrap">
                  Alıcı milyonluk daireye bakıyor; danışman 41 günlük dosyaya.
                </p>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                  Lüks segmentte güven, kelimeden önce veriyle kurulur. Eski fiyat söyleyen danışman
                  yalnız satışı değil, projenin itibarını da riske atar. Sorun kişiler değil, mimari:
                  stok tek kaynaktan akmıyor.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] font-semibold">
                  {["Liste yaşı: 41 gün", "Kopya sayısı: bilinmiyor", "Çift satış riski: açık"].map((c) => (
                    <span key={c} className="rounded-full border border-[#d8b5ae] bg-[#faf1ef] px-3 py-1.5 text-[#a23f34]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <CeliskiSahnesi />
          </Reveal>
          {/* kontrolsüz dağılım vs kontrollü ağ (mockup-03'ten): eski fiyat sızar, canlı link kayıttan okur */}
          <Reveal delay={140} className="mt-14">
            <SizintiSahnesi />
          </Reveal>
        </div>
      </section>

      {/* ============ AKIŞ: nasıl çalışır (NEDİR'in devamı) ============ */}
      <section id="nasil-calisir" className="relative scroll-mt-20 border-b border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADIMLAR.map((a, i) => (
              <Reveal key={a.no} delay={i * 90}>
                <li className="kart kart-3d relative flex h-full flex-col p-6">
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-teal/30">{a.no}</span>
                  <h3 className="mt-3 font-display text-base font-bold tracking-tight text-ink">{a.baslik}</h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">{a.metin}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ CANLI HAVUZ (tam genişlik interaktif) ============ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Canlı ağ · dene</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Üretici kontrolü tutar, danışman güncel satar.</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Kat planı, net/brüt, cephe, ödeme planı ve canlı fiyat, hepsi tek tıkla açılır. Bina kesiti mi, tablo mu? Sen seç, daireye tıkla, detayı gör.</p>
            </div>
          </Reveal>
          <Reveal delay={100}><CanliHavuzDemo /></Reveal>
        </div>
      </section>

      {/* ============ ÇİFT SATIŞ KALKANI (mockup-02'den, koyu kontrol odası) ============ */}
      <div className="m2 overflow-x-clip">
        <section className="border-b border-[var(--m2-cizgi)]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="m2-etiket text-amber">Çift satış kalkanı</p>
            <h2 className="m2-dev mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,4rem)]">
              Opsiyon bir söz değil. Kilittir.
            </h2>
            <div className="mt-12">
              <KilitKoreografi />
            </div>
          </div>
        </section>

        {/* üç renk şeridi */}
        <section className="border-b border-[var(--m2-cizgi)] bg-[var(--m2-zemin-2)]/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-8 sm:px-6">
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[var(--m2-ink)]">Tüm ağ üç renkle konuşur.</p>
              <p className="mt-1 text-[13px] text-[var(--m2-ink-soft)]">Her birimin durumu her ekranda aynı sinyaldir, yorum farkı yoktur.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]">
              {(
                [
                  ["Müsait", "#2fb36b"],
                  ["Opsiyon", "#e3a12c"],
                  ["Satıldı", "#d15a4e"],
                ] as const
              ).map(([ad, renk]) => (
                <span key={ad} className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5" style={{ borderColor: `${renk}66`, color: renk }}>
                  <span className="size-2 rounded-full" style={{ background: renk }} aria-hidden />
                  {ad}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ============ TAHSİS (mockup-03'ten) ============ */}
      <section className="izgara-doku border-b border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tahsis</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Herkes her şeyi görmek zorunda değil
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Yetki bu ağda bir ayar değil, fiziksel bir kapıdır. Aşağıda bir yetki profili seç: verinin hangi
                kapılardan geçtiğini, hangi kapıda durduğunu ve kime ulaştığını haritada izle.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <KapiHaritasi />
          </Reveal>
        </div>
      </section>

      {/* ============ AĞ ETKİSİ (mockup-03'ten) ============ */}
      <section className="border-b border-[var(--cizgi)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Ağ etkisi</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Tek proje aracı değil, ağ
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Tek proje yazılımları her firmayı kendi adasında tutar. Burada her yeni proje haritaya bir kütle,
                her yeni danışman bir erişim noktası ekler: bir danışman onlarca üreticinin kendisine açık
                stoğunu tek ekrandan görür.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <AgDiyagrami />
          </Reveal>
        </div>
      </section>

      {/* ============ BİREBİR PAYLAŞIM (WhatsApp / 1:1 — EİDS yasal çerçeve) ============ */}
      <BirebirPaylasim />

      {/* ============ İKİ TARAFLI FAYDA ============ */}
      <section id="kimler-icin" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">İki taraf, tek gerçek</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Aynı canlı bilgi, <br className="hidden sm:block" /> iki taraf da kazanır</h2>
              <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Proje sahibi kontrolü bırakmaz, danışman doğru veriyle satar. Tek doğru kaynak ikisini de korur.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[FAYDA.prod, FAYDA.cons].map((f, i) => (
              <Reveal key={f.rol} delay={i * 120}>
                <div className="kart signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: f.sinyal }}>
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">{f.rol}</p>
                  <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">{f.baslik}</h3>
                  <p className="mb-4 mt-0.5 text-[13px] text-ink-soft">{f.alt}</p>
                  <ul className="flex flex-col gap-3">
                    {f.maddeler.map(([vurgu, devam]) => (
                      <li key={vurgu} className="flex gap-2.5 text-[13.5px] leading-snug text-ink">
                        <span className="mt-0.5 inline-grid size-5 flex-none place-items-center rounded-md bg-[var(--color-soft)] text-xs font-bold text-teal">✓</span>
                        <span><strong className="font-semibold">{vurgu}</strong>, {devam}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ İSTATİSTİK ŞERİDİ (kullanıcı seçimi: kapalı devre şeridinin yerinde) ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55 px-5 py-10 sm:px-6">
        <Sayaclar />
      </section>

      {/* ============ PROJE DETAYI: ne yüklenir / ne görülür ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Proje detayı</p>
              <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Bir projede ne var, kim neyi görür?</h3>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Proje sahibi her şeyi tek noktadan yükler; gayrimenkul danışmanı satışa lazım olanı canlı görür.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="kart signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Proje sahibi yükler</p>
                <h4 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">Tek panelden, eksiksiz</h4>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {YUKLER.map((y) => (<li key={y} className="flex gap-2.5 text-[13.5px] leading-snug text-ink"><span className="mt-0.5 inline-grid size-5 flex-none place-items-center rounded-md bg-[var(--color-navy-soft)] text-[11px] font-bold text-navy">↑</span>{y}</li>))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="kart signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Gayrimenkul danışmanı görür</p>
                <h4 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink">Canlı, doğru, satışa hazır</h4>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {GORUR.map((g) => (<li key={g} className="flex gap-2.5 text-[13.5px] leading-snug text-ink"><span className="mt-0.5 inline-grid size-5 flex-none place-items-center rounded-md bg-[var(--color-teal-soft)] text-[11px] font-bold text-[var(--color-teal-d)]">✓</span>{g}</li>))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CANLI KOMUTA MERKEZİ (koyu) ============ */}
      <CanliKomutaMerkezi />

      {/* ============ GÜVEN / TEMİNAT ============ */}
      <section className="relative isolate overflow-hidden border-t border-[var(--cizgi)] bg-white/55">
        <div className="mesh" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Güven protokolü</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Neden güvenli?</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Güven sözle değil, sistemin kendisiyle sağlanır: bu teminatların hiçbiri iyi niyete bağlı değildir.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GUVEN.map((g, i) => (
              <Reveal key={g.b} delay={(i % 3) * 90}>
                <div className="kart kart-3d flex h-full items-start gap-4 p-6">
                  <span className="inline-grid size-11 flex-none place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                    <g.Icon size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">{g.b}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{g.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KAPANIŞ CTA: Stok sende, fiyat sende, kontrol sende (m1 dilinden) ============ */}
      <section className="relative px-5 pb-24 pt-20 sm:px-6">
        <Reveal>
          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[28px]">
            <div className="relative overflow-hidden rounded-[26px]" style={{ background: "linear-gradient(140deg, #0a1c2e 0%, #0d2b3d 55%, #10493f 100%)" }}>
              <div className="izgara-doku absolute inset-0 opacity-[0.08]" aria-hidden />
              <div className="relative px-6 py-16 text-center sm:px-10 sm:py-20">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7fd4c4]">
                  <span aria-hidden className="mr-2 inline-block h-px w-8 translate-y-[-3px] bg-[#7fd4c4] align-middle" />
                  Ağ, davetle büyüyor
                </p>
                <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
                  Stok sende, fiyat sende, <span className="text-[#7fd4c4]">kontrol sende.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-[15.5px] leading-relaxed text-white/70">
                  Projenin künyesini bize ilet; stoğunu ekiple birlikte yükleyelim, kesitin aynı hafta canlıya dönsün.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/kayit?rol=uretici" className="inline-flex h-12 w-full items-center justify-center rounded-[13px] bg-white px-7 text-[15px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto">
                    Proje sahibiyim, görüşelim →
                  </Link>
                  <Link href="/kayit?rol=emlakci" className="inline-flex h-12 w-full items-center justify-center rounded-[13px] bg-[#1e9b8a] px-7 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a8676] sm:w-auto">
                    Danışmanım, ücretsiz katıl →
                  </Link>
                </div>
                <p className="mt-7 font-mono text-[12px] tracking-wide text-white/50">Kazancın %100&apos;ü senin · Açık ilan yok · Çift satış yok</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ SSS ============ */}
      <section id="sss" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Aklındakiler</h2>
            </div>
          </Reveal>
          <div className="mt-12 flex flex-col gap-3">
            {SSS.map((q, i) => (
              <Reveal key={q.s} delay={i * 50}>
                <details className="sss-item kart p-0 hover:-translate-y-0.5">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">
                    {q.s}
                    <span className="ok flex-none text-teal" aria-hidden>▾</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AĞ BÜYÜYOR + FOOTER: gece silüetiyle birleşik kapanış (ortak KapanisFooter) ============ */}
      <KapanisFooter />
      <LansmanPopup />
    </main>
  );
}
