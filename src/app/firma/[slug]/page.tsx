import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { B2BCta } from "@/components/seo/B2BCta";
import { firmaGetir, type FirmaProje } from "@/lib/seo/firma";
import { ASAMA_ETIKET, type InsaatAsama } from "@/lib/types";
import { MapPin, CalendarClock, ChevronRight, ShieldCheck, Building2, Globe } from "lucide-react";

export const revalidate = 3600;

const SITE = "https://projedar.com";

const NAV = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Güven", href: "/guven" },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const firma = await firmaGetir(slug);
  if (!firma) return {};
  const konum = [firma.profil.ilce, firma.profil.il].filter(Boolean).join(", ");
  const title = `${firma.ad} projeleri${konum ? ` · ${konum}` : ""} | Projedar`;
  const desc = `${firma.ad} müteahhit firmasının yeni konut projeleri: konum, daire tipleri ve inşaat aşamasıyla. Projedar tahsisli canlı proje satış ağı.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE}/firma/${slug}` },
    openGraph: { title, description: desc, url: `${SITE}/firma/${slug}`, type: "website", siteName: "Projedar" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

function ProjeKarti({ p }: { p: FirmaProje }) {
  const konum = [p.ilce, p.il].filter(Boolean).join(", ");
  const asama = p.asama ? ASAMA_ETIKET[p.asama as InsaatAsama] ?? null : null;
  return (
    <Link href={`/proje/${p.slug}`} className="kart block p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink">{p.ad}</h3>
        <ChevronRight size={16} className="mt-0.5 flex-none text-teal" aria-hidden />
      </div>
      {konum ? <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-soft"><MapPin size={13} className="opacity-60" />{konum}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-ink-soft">
        {asama ? <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-white/60 px-2.5 py-1"><CalendarClock size={11} className="text-teal" />{asama}</span> : null}
        {p.odaTipleri.length ? <span className="rounded-full border border-[var(--cizgi)] bg-white/60 px-2.5 py-1">{p.odaTipleri.slice(0, 4).join(" · ")}</span> : null}
      </div>
    </Link>
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const firma = await firmaGetir(slug);
  if (!firma) notFound();

  const konum = [firma.profil.ilce, firma.profil.il].filter(Boolean).join(", ");
  const kurulus = firma.profil.kurulus_yili ? String(firma.profil.kurulus_yili) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: firma.ad,
        url: `${SITE}/firma/${firma.slug}`,
        ...(firma.profil.logo_url ? { logo: firma.profil.logo_url } : {}),
        ...(firma.profil.web ? { sameAs: [firma.profil.web] } : {}),
        ...(firma.profil.hakkinda ? { description: firma.profil.hakkinda } : {}),
      },
      {
        "@type": "CollectionPage",
        name: `${firma.ad} projeleri`,
        url: `${SITE}/firma/${firma.slug}`,
        isPartOf: { "@type": "WebSite", name: "Projedar", url: SITE },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: firma.projeler.length,
          itemListElement: firma.projeler.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.ad, url: `${SITE}/proje/${p.slug}` })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE },
          { "@type": "ListItem", position: 2, name: "Konut projeleri", item: `${SITE}/konut-projeleri` },
          { "@type": "ListItem", position: 3, name: firma.ad, item: `${SITE}/firma/${firma.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa" className="shrink-0"><Logo size={26} wordmark /></Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">{n.etiket}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:block"><Link href="/login" className="btn-ghost">Giriş yap</Link></span>
            <Link href="/kayit" className="btn-action whitespace-nowrap hover:-translate-y-0.5">Ücretsiz başla</Link>
          </div>
        </nav>
      </header>

      <ProjedarBanner />

      <section className="relative border-b border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
          <nav aria-label="Konum yolu" className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-ink-soft">
            <Link href="/" className="hover:text-ink">Ana sayfa</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/konut-projeleri" className="hover:text-ink">Konut projeleri</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-ink">{firma.ad}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-white/70 px-3 py-1 text-ink-soft"><Building2 size={13} className="text-teal" /> Müteahhit firma</span>
            {firma.dogrulanmis ? <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-teal"><ShieldCheck size={13} /> Doğrulanmış</span> : null}
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{firma.ad}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[12.5px] text-ink-soft">
            {konum ? <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="opacity-70" />{konum}</span> : null}
            {kurulus ? <span>Kuruluş: {kurulus}</span> : null}
            {firma.profil.web ? <a href={firma.profil.web} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1.5 text-teal hover:underline"><Globe size={13} /> Resmi site ↗</a> : null}
          </div>
          {firma.profil.hakkinda ? <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-soft">{firma.profil.hakkinda}</p> : null}
          <p className="mt-4 font-mono text-xs text-[var(--ink-faint)]">{firma.projeler.length} proje</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{firma.ad} projeleri</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {firma.projeler.map((p) => <ProjeKarti key={p.slug} p={p} />)}
        </div>
      </div>

      <div className="border-t border-[var(--cizgi)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6"><B2BCta /></div>
      </div>

      <footer className="border-t border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa"><Logo size={22} wordmark /></Link>
          <p className="max-w-md text-xs leading-relaxed text-ink-soft">Tahsisli canlı proje satış ağı. Fiyat ve stok her projenin kendi sayfasında canlı tutulur.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-soft">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-ink">{n.etiket}</Link>)}
          </nav>
        </div>
      </footer>
    </main>
  );
}
