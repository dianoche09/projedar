import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { NasilCalisirAdimlar } from "./NasilCalisirAdimlar";
import { CircleSlash, SlidersHorizontal, Database } from "lucide-react";

/** Müteahhit (üretici) rol landing'i — güven-önce, veri-öne, komuta merkezi dili. */

const SITE = "https://projepazar.vercel.app";

export const metadata: Metadata = {
  title: "Müteahhit için Tahsisli Canlı Proje Satış Ağı | ProjePazar",
  description:
    "Stok, fiyat ve tahsis tek noktadan sizde. Çift satış veritabanı seviyesinde imkânsız, komisyon yok. Müteahhitler için kapalı devre canlı proje satış ağı.",
  alternates: { canonical: "/muteahhit" },
  openGraph: {
    title: "Müteahhit için Tahsisli Canlı Proje Satış Ağı | ProjePazar",
    description:
      "Envanter kontrolü sende: stok, fiyat ve kimin göreceği tek noktadan. Çift satış yapısal olarak imkânsız. Komisyonsuz, kapalı devre satış ağı.",
    type: "website",
    siteName: "ProjePazar",
    url: `${SITE}/muteahhit`,
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title: "Müteahhit için Tahsisli Canlı Proje Satış Ağı | ProjePazar" },
};

const NAV = [
  { etiket: "Nasıl çalışır", href: "#nasil-calisir" },
  { etiket: "Neden farklı", href: "#karsilastirma" },
  { etiket: "Kurucu müteahhit", href: "#kurucu" },
  { etiket: "Sık sorulanlar", href: "#sss" },
];

/** Üç kale — model konumlaması (Rakip Analizi 5.3). */
const KALELER = [
  {
    Icon: CircleSlash,
    baslik: "Komisyonsuz",
    metin: "Satıştan pay almayız — sabit yıllık anlaşma. Ne kadar satarsan sat, maliyetin değişmez; işlemin içine girmeyiz.",
    sinyal: "var(--color-teal)",
  },
  {
    Icon: SlidersHorizontal,
    baslik: "Kontrol sende",
    metin: "Kime, hangi fiyatla, ne kadar açacağını sen belirlersin. Tahsis daire seviyesinde: tüm proje, tek blok ya da seçili daireler.",
    sinyal: "var(--color-navy)",
  },
  {
    Icon: Database,
    baslik: "Çift-satış kalkanı",
    metin: "Söz değil, veritabanı garantisi. Aktif opsiyon DB seviyesinde kilitlenir; aynı daireye ikinci opsiyon teknik olarak imkânsız.",
    sinyal: "var(--color-green)",
  },
];

/** Karşılaştırma — isim vermeden model kıyası. */
const KIYAS_SATIRLARI: { etiket: string; portal: string; crm: string; biz: string }[] = [
  {
    etiket: "Komisyon",
    portal: "Satıştan pay alır",
    crm: "Lisans + modül ücreti",
    biz: "Sıfır komisyon — sabit yıllık anlaşma",
  },
  {
    etiket: "Stok kontrolü",
    portal: "Ortak havuz; kim neyi görüyor belirsiz",
    crm: "Kendi ekibinle sınırlı, ağ yok",
    biz: "Tahsis sende: kime, hangi fiyat, ne kadar",
  },
  {
    etiket: "Çift-satış garantisi",
    portal: "Söze ve operasyona bağlı",
    crm: "Uygulama katmanında, delinebilir",
    biz: "Veritabanı kilidi — yapısal olarak imkânsız",
  },
  {
    etiket: "Tazelik",
    portal: "İlan girildiği günde kalır",
    crm: "Elle güncelleme, bayatlama görünmez",
    biz: "Her kayıtta “● X önce”; bayatlayan veri görünür",
  },
  {
    etiket: "Kapalı devre",
    portal: "Herkese açık ilan",
    crm: "Kapalı ama dağıtım ağı yok",
    biz: "Kapalı devre + tahsisli emlakçı ağı",
  },
];

const SSS: { s: string; c: string }[] = [
  {
    s: "ProjePazar satıştan komisyon alıyor mu?",
    c: "Hayır. Hiçbir satıştan pay almayız; gelir modeli sabit yıllık anlaşmadır. Ne kadar satarsanız satın maliyetiniz değişmez, işlemin içine girmeyiz.",
  },
  {
    s: "Stok ve fiyat kontrolü kimde?",
    c: "Tamamen sizde. Fiyat ve durum yalnız birim kaydında tutulur, hiçbir yerde kopyalanmaz. Paylaşımda fiyat o anki canlı değerden basılır; eski fiyat dolaşıma giremez.",
  },
  {
    s: "Çift satış nasıl engelleniyor?",
    c: "Uygulama sözüyle değil, veritabanı kuralıyla. Aktif opsiyon DB seviyesinde benzersiz kilitle korunur; aynı daireye ikinci opsiyon açmak teknik olarak imkânsızdır.",
  },
  {
    s: "Hangi emlakçılar stoğumu görür?",
    c: "Yalnız sizin tahsis ettikleriniz. Tahsis daire seviyesindedir: tüm projeyi, tek bloğu ya da seçili daireleri belirlediğiniz emlakçı ve ofislere açarsınız; gerisi herkese kapalı kalır.",
  },
  {
    s: "Bu bir ilan portalı mı? EİDS'e takılır mıyım?",
    c: "İlan portalı değildir. Son kullanıcıya açık ilan yayını yoktur; stok yalnız tahsisli emlakçıların kapalı havuzunda görünür. İlan değil, tahsis — kapalı devre paylaşım modeli budur.",
  },
  {
    s: "Başlamak için ne gerekiyor?",
    c: "Bir görüşme. Projenizi konuşuruz, stok ve fiyat yapınız tek doğru kaynağa alınır, tahsis kurallarınızı siz belirlersiniz. İlk dönemde kurulum concierge desteğiyle yapılır.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}/muteahhit#sayfa`,
        url: `${SITE}/muteahhit`,
        name: "Müteahhit için Tahsisli Canlı Proje Satış Ağı",
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${SITE}/#website` },
        description:
          "Geliştirici firmalar için tahsisli canlı proje satış ağı: stok, fiyat ve tahsis tek noktadan; çift satış veritabanı seviyesinde imkânsız; komisyonsuz model.",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}/muteahhit#sss`,
        mainEntity: SSS.map((q) => ({
          "@type": "Question",
          name: q.s,
          acceptedAnswer: { "@type": "Answer", text: q.c },
        })),
      },
    ],
  };
}

export default function MuteahhitSayfasi() {
  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      {/* ============ ÜST MENÜ ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="ProjePazar ana sayfa" className="shrink-0"><Logo size={26} wordmark /></Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">{n.etiket}</a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">Giriş yap</Link>
            <Link href="/kayit?rol=uretici" className="btn-action">Projenizi konuşalım</Link>
          </div>
        </nav>
      </header>

      {/* ============ HERO — güven önce, görsel yok, veri öne ============ */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-aurora" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:px-6 lg:pb-24 lg:pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,155,138,0.22)] bg-[var(--color-teal-soft)] px-3.5 py-1.5 font-mono text-[11.5px] font-semibold text-[var(--color-teal-d)]">
              <span className="size-2 rounded-full bg-green nabiz" /> MÜTEAHHİTLER İÇİN
            </span>
            <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[56px]">
              Envanter kontrolü sende.
              <br />
              <span className="text-teal">Çift satış yapısal olarak imkânsız.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Geliştirici firmalar için <strong className="font-semibold text-ink">tahsisli canlı proje satış ağı</strong> — stok, fiyat ve kimin göreceği tek noktadan, <strong className="font-semibold text-ink">sizde</strong>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/kayit?rol=uretici" className="btn-action px-7 text-[15px] max-sm:min-h-[52px]">Projenizi konuşalım</Link>
              <a href="#nasil-calisir" className="btn-ghost px-7 text-[15px] max-sm:min-h-[52px]">Nasıl çalışır</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Komisyonsuz", "Tahsisli görünürlük", "DB seviyesinde opsiyon kilidi", "Kapalı devre"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi-2)] bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-soft backdrop-blur-sm">
                  <span className="size-[5px] rounded-full bg-teal" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ NASIL ÇALIŞIR — 4 adım, canlı mini-simülasyonlar ============ */}
      <section id="nasil-calisir" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Akış</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Nasıl çalışır?</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Stoktan opsiyona dört adım. Her adımda tek doğru kaynak korunur; aşağıdaki mini panellerin hepsi ürünün gerçek mekaniğinin örnek görünümüdür.</p>
            </div>
          </Reveal>
          <NasilCalisirAdimlar />
        </div>
      </section>

      {/* ============ ÜÇ KALE ============ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Üç kale</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Model üç garantiye oturur</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Üçü de pazarlama cümlesi değil; ikisi veritabanı kuralı, biri gelir modelinin kendisi.</p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {KALELER.map((k, i) => (
              <Reveal key={k.baslik} delay={i * 100}>
                <div className="kart kart-3d signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: k.sinyal }}>
                  <span className="inline-grid size-11 place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                    <k.Icon size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-ink">{k.baslik}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{k.metin}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KARŞILAŞTIRMA — isim vermeden ============ */}
      <section id="karsilastirma" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Neden farklı</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Portal değil, CRM modülü değil</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Komisyonlu pazaryerleri satıştan pay alır; CRM broker modülleri seni kendi adanda bırakır. ProjePazar tahsisli dağıtım altyapısıdır.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="kart mt-12 overflow-x-auto p-0">
              <table className="tbl min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-[160px]" />
                    <th>Komisyonlu pazaryerleri</th>
                    <th>CRM broker modülleri</th>
                    <th className="bg-[var(--color-teal-soft)] text-[var(--color-teal-d)]">ProjePazar</th>
                  </tr>
                </thead>
                <tbody>
                  {KIYAS_SATIRLARI.map((r) => (
                    <tr key={r.etiket}>
                      <td className="font-mono text-[11px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">{r.etiket}</td>
                      <td className="whitespace-normal text-ink-soft"><span className="mr-1.5 font-bold text-red">✕</span>{r.portal}</td>
                      <td className="whitespace-normal text-ink-soft"><span className="mr-1.5 font-bold text-amber">~</span>{r.crm}</td>
                      <td className="whitespace-normal bg-[rgba(226,243,240,0.45)] font-medium"><span className="mr-1.5 font-bold text-green">✓</span>{r.biz}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ KURUCU MÜTEAHHİT — mekanikli, dürüst kıtlık ============ */}
      <section id="kurucu" className="relative scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="kart signal-top mx-auto max-w-3xl p-8 sm:p-10" style={{ ["--_sig" as string]: "var(--color-amber)" }}>
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#9a6a12]">Kurucu Müteahhit</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Bölge başına sınırlı kurucu kontenjanı</h2>
              <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">
                İlk dönemde her bölgede sınırlı sayıda kurucu müteahhitle çalışıyoruz. Sebep pazarlama değil, <strong className="font-semibold text-ink">tahsis modelinin kendisi</strong>: aynı bölgede sınırsız müteahhit, emlakçı ağının odağını böler. Ağın satması için emlakçının havuzunda az ve güçlü proje olması gerekir.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {[
                  "Bölgedeki emlakçı ağının odağı kurucu projelerde toplanır",
                  "Kuruluş dönemi anlaşma koşulları kurucu müteahhit için sabitlenir",
                  "Kurulum concierge ile yapılır: stok ve tahsis yapınızı birlikte kurarız",
                ].map((m) => (
                  <li key={m} className="flex gap-2.5 text-[13.5px] leading-snug text-ink">
                    <span className="mt-0.5 inline-grid size-5 flex-none place-items-center rounded-md bg-[var(--color-amber-soft)] text-xs font-bold text-[#9a6a12]">◆</span>
                    {m}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-[11.5px] text-[var(--ink-faint)]">Sahte sayaç yok: bölgenizdeki güncel kontenjan durumunu görüşmede net söyleriz.</p>
              <div className="mt-6">
                <Link href="/kayit?rol=uretici" className="btn-primary px-7 text-[15px] max-sm:min-h-[52px] max-sm:w-full">Kontenjan durumunu sor</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ EİDS / UYUMLULUK ŞERİDİ ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-5 py-10 text-center sm:px-6">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Konumlandırma</span>
          <p className="max-w-2xl text-pretty font-display text-lg font-bold tracking-tight text-ink">
            İlan değil, tahsis. Kapalı devre paylaşım — <span className="text-teal">EİDS ilan rejimine takılmadan.</span>
          </p>
        </div>
      </section>

      {/* ============ SSS ============ */}
      <section id="sss" className="relative scroll-mt-20">
        <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Müteahhitlerin sorduğu</h2>
            </div>
          </Reveal>
          <div className="mt-12 flex flex-col gap-3">
            {SSS.map((q, i) => (
              <Reveal key={q.s} delay={i * 50}>
                <details className="sss-item kart p-0">
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

      {/* ============ KAPANIŞ CTA ============ */}
      <section className="relative px-5 pb-24 pt-20 sm:px-6">
        <Reveal>
          <div className="komuta relative mx-auto w-full max-w-5xl overflow-hidden rounded-[26px]">
            <div className="komuta-grid absolute inset-0" aria-hidden />
            <div className="relative px-6 py-14 text-center sm:px-10">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs">
                {["Komisyon yok", "Tahsis sende", "DB seviyesinde kilit"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-white/90 backdrop-blur-md">{t}</span>
                ))}
              </div>
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Stoğun, fiyatın, ağın — tek komuta merkezinden.</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75">Projeni ağa açmadan önce modeli birlikte konuşalım: stok yapın, tahsis kuralların, bölgendeki kurucu kontenjanı.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/kayit?rol=uretici" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-8 text-[15px] font-bold text-ink transition-all hover:bg-white/90 sm:min-h-[44px] sm:w-auto">Projenizi konuşalım</Link>
                <a href="#nasil-calisir" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:bg-white/15 sm:min-h-[44px] sm:w-auto">Nasıl çalışır</a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mt-auto border-t border-[var(--cizgi)] bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-12 sm:px-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo size={24} wordmark />
            <p className="max-w-xs text-center text-xs leading-relaxed text-ink-soft md:text-left">Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan kapalı konut stoğu ağı.</p>
          </div>
          <nav aria-label="Yasal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink-soft">
            <Link href="/kullanim-kosullari" className="transition-colors hover:text-ink hover:underline">Kullanım Koşulları</Link>
            <Link href="/gizlilik" className="transition-colors hover:text-ink hover:underline">Gizlilik</Link>
            <Link href="/kvkk-aydinlatma" className="transition-colors hover:text-ink hover:underline">KVKK Aydınlatma</Link>
          </nav>
        </div>
        <div className="border-t border-[var(--cizgi)] px-5 py-5 text-center text-[11px] text-[var(--ink-faint)] sm:px-6">© 2026 ProjePazar — Tüm hakları saklıdır.</div>
      </footer>
    </main>
  );
}
