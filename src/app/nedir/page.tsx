import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { Users, Building2, Radio, ShieldCheck, Layers, HandCoins, Network, ChevronRight } from "lucide-react";

export const revalidate = 3600;
const SITE = "https://projedar.com";
const NAV = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Güven", href: "/guven" },
];

const SSS = [
  { s: "Projedar bir ilan portalı mı?", c: "Hayır. Projedar son kullanıcıya ilan sunmaz; kapalı devre, profesyoneller arası (B2B) bir ağdır. Fiyat ve canlı stok yalnız yetkili gayrimenkul danışmanlarına açılır." },
  { s: "Projedar komisyon alır mı?", c: "Hayır. Projedar satışın komisyonuna ortak olmaz; danışman kendi komisyonunu alır. Gelir modeli müteahhit/geliştirici ile abonelik/anlaşma üzerinedir." },
  { s: "Danışman olarak katılmak ücretli mi?", c: "Temel danışman hesabı ücretsizdir. Katıldığında, müteahhidin sana tahsis ettiği projeleri canlı stoktan görür ve müşterine paylaşırsın." },
  { s: "Müteahhit olarak ne kazanırım?", c: "Stoğunu, fiyatını ve dağıtımını tek panelden yönetirsin; projeni yalnız yetkilendirdiğin danışmanlar satar. Çift satış ve stok karmaşası sistemle engellenir." },
];

export const metadata: Metadata = {
  title: "Projedar nedir? Tahsisli canlı konut satış ağı | Projedar",
  description: "Projedar; yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, geliştirici kontrollü tahsisle yönetilen nötr bir B2B ağdır. İlan portalı değildir; komisyona ortak olmaz.",
  alternates: { canonical: `${SITE}/nedir` },
  openGraph: { title: "Projedar nedir?", description: "Tahsisli canlı konut projesi satış ağı. İlan portalı değil, kapalı devre B2B.", url: `${SITE}/nedir`, type: "website", siteName: "Projedar" },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}/nedir#sayfa`, url: `${SITE}/nedir`, name: "Projedar nedir?", inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}/#website` } },
      { "@type": "FAQPage", "@id": `${SITE}/nedir#faq`, mainEntity: SSS.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })) },
    ],
  };
}

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <ProjeTopbar />

      {/* HERO */}
      <section className="komuta relative isolate flex min-h-[72svh] flex-col justify-end overflow-hidden text-white">
        <div className="komuta-grid absolute inset-0" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 82% 8%, rgba(47,211,188,0.18), transparent 60%)" }} />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-16 pt-28 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7fd4c4] backdrop-blur-md"><span className="size-2 rounded-full bg-green nabiz" /> Canlı ağ</span>
          <h1 className="mt-5 max-w-[20ch] font-display text-[clamp(2.4rem,6vw,4.2rem)] font-black leading-[0.98] tracking-tight">Projedar nedir?</h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/85">
            Yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, <span className="font-semibold text-white">geliştirici kontrollü tahsisle</span> yönetilen <span className="text-[#7fd4c4]">nötr bir B2B ağ</span>. İlan portalı değil; bir satış altyapısı.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kayit?rol=emlakci&kaynak=nedir" className="btn-action hover:-translate-y-0.5">Danışman olarak ücretsiz katıl</Link>
            <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[44px] items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15">Projeni ağa ekle</Link>
          </div>
        </div>
      </section>

      {/* NÖTR AĞ tanımı */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tek cümlede</p>
          <p className="mt-4 text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
            Bağımsız danışmanın <span className="text-teal">tek hesapla</span> birçok geliştiricinin stoğuna eriştiği; ama erişimin açık pazar değil, <span className="text-teal">geliştirici kontrollü tahsisle</span> yönetildiği ağ.
          </p>
        </div>
      </section>

      {/* KİME GÖRE */}
      <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Kime göre</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Projedar kimin için?</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <div className="kart signal-top p-7" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
              <span className="inline-grid size-12 place-items-center rounded-2xl bg-[var(--color-teal-soft)]"><Users size={24} className="text-teal-d" /></span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">Gayrimenkul danışmanı</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Tek hesapla birçok geliştiricinin sana tahsisli projelerini canlı stoktan gör, müşterine tek dokunuşla paylaş. Komisyonun sende kalır; Projedar pay almaz.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                {["Canlı fiyat ve durum (müsait/opsiyon/satıldı)", "Çift satış koruması", "Ücretsiz temel hesap"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><ChevronRight size={15} className="mt-0.5 flex-none text-teal" />{t}</li>
                ))}
              </ul>
              <Link href="/emlakci" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-d hover:underline">Danışmanlar için detay <ChevronRight size={14} /></Link>
            </div>
            <div className="kart signal-top p-7" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
              <span className="inline-grid size-12 place-items-center rounded-2xl bg-[rgba(19,49,75,0.08)]"><Building2 size={24} strokeWidth={1.7} color="var(--color-navy)" /></span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">Müteahhit / geliştirici</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Stoğunu, fiyatını ve dağıtımını tek panelden yönet. Projeni yalnız yetkilendirdiğin danışmanlar satsın; kim, neyi, hangi fiyata satıyor tek noktadan kontrol et.</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                {["Tahsisli, kontrollü dağıtım", "Tek doğru kaynak: fiyat/stok tek yerde", "Doğrulanmış geliştirici rozeti"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><ChevronRight size={15} className="mt-0.5 flex-none text-teal" />{t}</li>
                ))}
              </ul>
              <Link href="/muteahhit" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-d hover:underline">Müteahhitler için detay <ChevronRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Nasıl çalışır</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Üç adımda tahsisli satış</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { ik: Network, b: "Geliştirici projeyi ağa ekler", a: "Müteahhit stoğunu, fiyatını ve daire tiplerini tek panelden tanımlar." },
              { ik: Layers, b: "Danışmanlara tahsis eder", a: "Hangi danışmanın hangi birimleri satacağını geliştirici belirler; erişim kontrollüdür." },
              { ik: Radio, b: "Danışman canlı satar", a: "Tahsisli daireleri canlı fiyat ve durumla görür, müşterine paylaşır; stok tek kaynaktan güncel kalır." },
            ].map((x, i) => (
              <div key={x.b} className="kart p-6">
                <div className="flex items-center gap-3">
                  <span className="inline-grid size-10 place-items-center rounded-xl bg-[var(--color-teal-soft)]"><x.ik size={20} className="text-teal-d" /></span>
                  <span className="font-mono text-sm font-bold text-teal-d">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{x.b}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEDEN FARKLI */}
      <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Neden farklı</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Portallardan üç net fark</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { ik: HandCoins, b: "Komisyona ortak olmaz", a: "Projedar satış komisyonundan pay almaz. Danışman kendi komisyonunu alır." },
              { ik: Radio, b: "Canlı, tek doğru kaynak", a: "Fiyat ve stok tek yerde canlı tutulur; eski/yanlış ilan sorunu olmaz." },
              { ik: ShieldCheck, b: "İlan değil, tahsis", a: "Açık pazar değil; erişim geliştirici kontrollü tahsisle yönetilir. Kapalı devre B2B." },
            ].map((x) => (
              <div key={x.b} className="kart p-6">
                <span className="inline-grid size-11 place-items-center rounded-2xl bg-[var(--color-teal-soft)]"><x.ik size={22} className="text-teal-d" /></span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">{x.b}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl text-center"><p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Projedar hakkında</h2></div>
          <div className="mt-10 flex flex-col gap-3">
            {SSS.map((q) => (
              <details key={q.s} className="sss-item kart p-0 hover:-translate-y-0.5">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* KAPANIŞ CTA */}
      <section className="px-5 pb-24 pt-4 sm:px-6">
        <div className="komuta relative mx-auto w-full max-w-5xl overflow-hidden rounded-[26px]">
          <div className="komuta-grid absolute inset-0" aria-hidden />
          <div className="relative px-6 py-14 text-center sm:px-10">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Yeni konut projeleri, doğru satış ağında.</h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75">Danışmansan ücretsiz katıl, komisyonun sende; müteahhitsen projeni ekle, tek panelden yönet.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/kayit?rol=emlakci&kaynak=nedir" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-8 text-[15px] font-bold text-ink transition-all hover:-translate-y-0.5 sm:w-auto">Danışman olarak katıl</Link>
              <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto">Projeni ağa ekle</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa"><Logo size={22} wordmark /></Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-soft">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-ink">{n.etiket}</Link>)}
          </nav>
        </div>
      </footer>
    </main>
  );
}
