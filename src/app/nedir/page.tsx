import type { Metadata } from "next";
import Link from "next/link";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { KapanisFooter } from "@/components/KapanisFooter";
import { NedirTabSwitcher } from "./NedirTabSwitcher";

export const revalidate = 3600;
const SITE = "https://projedar.com";

const SSS = [
  { s: "Projedar bir ilan portalı mı?", c: "Hayır. Projedar son kullanıcıya ilan sunmaz; profesyoneller arası (B2B), tahsisle yönetilen bir ağdır. Fiyat ve canlı stok yalnız yetkili gayrimenkul danışmanlarına açılır." },
  { s: "Projedar komisyon alır mı?", c: "Hayır. Projedar satışın komisyonuna ortak olmaz; danışman kendi komisyonunu alır. Gelir modeli müteahhit/geliştirici ile abonelik üzerinedir." },
  { s: "Danışman olarak katılmak ücretli mi?", c: "Temel danışman hesabı ücretsizdir. Katıldığında, müteahhidin sana tahsis ettiği projeleri canlı stoktan görür ve müşterine paylaşırsın." },
  { s: "Müteahhit olarak ne kazanırım?", c: "Stoğunu, fiyatını ve dağıtımını tek panelden yönetirsin; projeni yalnız yetkilendirdiğin danışmanlar satar. Çift satış ve stok karmaşası sistemle engellenir." },
];

// Tek bakışta — mono eyebrow + net ifade (anasayfa rol-kartı diliyle kardeş)
const BAKIS = [
  { e: "NE", b: "Canlı konut stoğu dağıtım ağı", d: "Yeni projeleri yetkili danışmanlarla tek canlı havuzda buluşturur." },
  { e: "KİME", b: "Müteahhit ve danışman için", d: "Profesyoneller arası (B2B). Son kullanıcıya ilan değil." },
  { e: "NASIL", b: "Tek panel, tahsis, canlı satış", d: "Müteahhit yönetir, danışmana tahsis eder; danışman canlı satar." },
  { e: "NE DEĞİL", b: "İlan portalı değil", d: "Projedar satış komisyonuna ortak olmaz; danışmanın kazancı danışmanın kalır." },
];

export const metadata: Metadata = {
  title: "Projedar nedir? Tahsisli canlı konut satış ağı | Projedar",
  description: "Projedar; yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, geliştirici kontrollü tahsisle yönetilen bir B2B satış ağıdır. İlan portalı değildir; komisyona ortak olmaz.",
  alternates: { canonical: `${SITE}/nedir` },
  openGraph: { title: "Projedar nedir?", description: "Tahsisli canlı konut projesi satış ağı. İlan portalı değil, profesyoneller arası B2B.", url: `${SITE}/nedir`, type: "website", siteName: "Projedar" },
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

const GIR = `
@keyframes nedirGir { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
.nedir-gir { opacity: 0; animation: nedirGir .55s cubic-bezier(0.16,1,0.3,1) forwards; }
@media (prefers-reduced-motion: reduce) { .nedir-gir { opacity: 1; animation: none; } }
`;

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <style dangerouslySetInnerHTML={{ __html: GIR }} />
      <ProjeTopbar />

      {/* KISA BAŞLIK + NET TANIM (komuta, anasayfa craft'ı) */}
      <section className="komuta relative isolate overflow-hidden text-white">
        <div className="komuta-grid absolute inset-0" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 85% 0%, rgba(47,211,188,0.16), transparent 60%)" }} />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="nedir-gir flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7fd4c4]" style={{ animationDelay: "0ms" }}>
            <span className="size-2 rounded-full bg-green nabiz" /> Yeni konut projelerinin canlı satış ağı
          </p>
          <h1 className="nedir-gir mt-6 font-display text-[clamp(2.5rem,7vw,4.4rem)] font-black leading-[0.98] tracking-tight" style={{ animationDelay: "60ms" }}>
            Projedar nedir?
          </h1>
          <p className="nedir-gir mt-6 max-w-2xl text-pretty text-[1.05rem] leading-relaxed text-white/85 sm:text-lg" style={{ animationDelay: "120ms" }}>
            Yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, <span className="font-semibold text-white">geliştirici kontrollü tahsisle</span> yönetilen canlı bir satış ağı. Müteahhit stoğunu, fiyatını ve dağıtımını tek panelden yönetir; danışman yalnız kendisine tahsisli projeleri canlı görür ve müşterisine paylaşır. <span className="text-[#7fd4c4]">İlan portalı değil.</span>
          </p>
          <div className="nedir-gir mt-9 flex flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href="/kayit?rol=emlakci&kaynak=nedir" className="btn-action active:scale-[0.98] hover:-translate-y-0.5">Danışman olarak ücretsiz katıl</Link>
            <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[46px] items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-all active:scale-[0.98] hover:bg-white/15">Projeni ağa ekle</Link>
          </div>
        </div>
      </section>

      {/* TEK BAKIŞTA — mono eyebrow'lu net kartlar */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-px overflow-hidden rounded-[20px] border border-[var(--cizgi)] bg-[var(--cizgi)] sm:grid-cols-2">
            {BAKIS.map((x) => (
              <div key={x.e} className="flex flex-col bg-[var(--color-card)] p-7">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-d">{x.e}</span>
                <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink">{x.b}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KISA SSS */}
      <section className="border-t border-[var(--cizgi)] px-5 pb-20 pt-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-d">Sık sorulanlar</p>
          <div className="mt-6 flex flex-col gap-3">
            {SSS.map((q) => (
              <details key={q.s} className="sss-item kart p-0">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 3 TASARIM KONSEPTİ MOCKUP LAB - İNTERAKTİF CANLI SEKME DEĞİŞTİRİCİ */}
      <section className="border-t border-[var(--cizgi)] bg-[var(--soft)] px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-center sm:text-left">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-d">Tasarım Laboratuvarı & İnteraktif Deneyim</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">/nedir İçin 3 Yapısal Konsepti Canlı Deneyimleyin</h2>
            </div>
            <a href="/mockups/nedir.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-teal hover:underline shrink-0">
              Lab Karşılaştırma Merkezini Aç ↗
            </a>
          </div>

          {/* İNTERAKTİF CANLI SEKME DEĞİŞTİRİCİ BİLEŞENİ */}
          <NedirTabSwitcher />
        </div>
      </section>

      <KapanisFooter />
    </main>
  );
}
