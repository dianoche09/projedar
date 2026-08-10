import type { Metadata } from "next";
import Link from "next/link";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { KapanisFooter } from "@/components/KapanisFooter";
import { Radio, Users, Layers, ShieldCheck } from "lucide-react";

export const revalidate = 3600;
const SITE = "https://projedar.com";

const SSS = [
  { s: "Projedar bir ilan portalı mı?", c: "Hayır. Projedar son kullanıcıya ilan sunmaz; profesyoneller arası (B2B), tahsisle yönetilen bir ağdır. Fiyat ve canlı stok yalnız yetkili gayrimenkul danışmanlarına açılır." },
  { s: "Projedar komisyon alır mı?", c: "Hayır. Projedar satışın komisyonuna ortak olmaz; danışman kendi komisyonunu alır. Gelir modeli müteahhit/geliştirici ile abonelik üzerinedir." },
  { s: "Danışman olarak katılmak ücretli mi?", c: "Temel danışman hesabı ücretsizdir. Katıldığında, müteahhidin sana tahsis ettiği projeleri canlı stoktan görür ve müşterine paylaşırsın." },
  { s: "Müteahhit olarak ne kazanırım?", c: "Stoğunu, fiyatını ve dağıtımını tek panelden yönetirsin; projeni yalnız yetkilendirdiğin danışmanlar satar. Çift satış ve stok karmaşası sistemle engellenir." },
];

const BAKIS = [
  { ik: Radio, t: "Ne", d: "Canlı konut stoğu dağıtım ağı. Yeni projeleri yetkili danışmanlarla buluşturur." },
  { ik: Users, t: "Kime", d: "Müteahhit/geliştirici ve gayrimenkul danışmanı için. Profesyoneller arası (B2B)." },
  { ik: Layers, t: "Nasıl", d: "Müteahhit tek panelden yönetir, danışmana tahsis eder; danışman canlı satar." },
  { ik: ShieldCheck, t: "Ne değil", d: "İlan portalı değil. Projedar satış komisyonuna ortak olmaz." },
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

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <ProjeTopbar />

      {/* KISA BAŞLIK + NET TANIM */}
      <section className="komuta relative isolate overflow-hidden text-white">
        <div className="komuta-grid absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-14 pt-28 sm:px-6 sm:pb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7fd4c4] backdrop-blur-md"><span className="size-2 rounded-full bg-green nabiz" /> Canlı konut ağı</span>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,5vw,3.2rem)] font-black leading-[1.02] tracking-tight">Projedar nedir?</h1>
          <p className="mt-5 text-pretty text-[1.05rem] leading-relaxed text-white/85 sm:text-lg">
            Projedar, yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, <span className="font-semibold text-white">geliştirici kontrollü tahsisle</span> yönetilen canlı bir satış ağıdır. Müteahhit stoğunu, fiyatını ve dağıtımını tek panelden yönetir; danışman yalnız kendisine tahsisli projeleri canlı görür ve müşterisine paylaşır. <span className="text-[#7fd4c4]">İlan portalı değildir.</span>
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/kayit?rol=emlakci&kaynak=nedir" className="btn-action active:scale-[0.98] hover:-translate-y-0.5">Danışman olarak ücretsiz katıl</Link>
            <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[44px] items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-all active:scale-[0.98] hover:bg-white/15">Projeni ağa ekle</Link>
          </div>
        </div>
      </section>

      {/* TEK BAKIŞTA */}
      <section className="px-5 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tek bakışta</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {BAKIS.map((x) => (
              <div key={x.t} className="kart flex items-start gap-4 p-5">
                <span className="inline-grid size-11 flex-none place-items-center rounded-2xl bg-[var(--color-teal-soft)]"><x.ik size={20} className="text-teal-d" /></span>
                <div>
                  <h2 className="font-display text-base font-bold text-ink">{x.t}</h2>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">{x.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KISA SSS */}
      <section className="border-t border-[var(--cizgi)] px-5 pb-16 pt-14 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p>
          <div className="mt-5 flex flex-col gap-3">
            {SSS.map((q) => (
              <details key={q.s} className="sss-item kart p-0">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <KapanisFooter />
    </main>
  );
}
