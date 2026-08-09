import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { firmaGetir, type FirmaProje, type Firma } from "@/lib/seo/firma";
import { temaGorsel, havuzGorsel } from "@/lib/seo/tema-gorsel";
import { ASAMA_ETIKET, type InsaatAsama } from "@/lib/types";
import { MapPin, ChevronRight, ShieldCheck, Building2, Globe } from "lucide-react";

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
  const desc = `${firma.ad} müteahhit/geliştirici firmasının yeni konut projeleri: konum, daire tipleri ve inşaat aşamasıyla. Projedar tahsisli canlı proje satış ağı.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE}/firma/${slug}` },
    openGraph: { title, description: desc, url: `${SITE}/firma/${slug}`, type: "website", siteName: "Projedar" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

/** Görselli proje kartı (proje/hub kart diliyle uyumlu). */
function ProjeKarti({ p }: { p: FirmaProje }) {
  const konum = [p.ilce, p.il].filter(Boolean).join(", ");
  const asama = p.asama ? ASAMA_ETIKET[p.asama as InsaatAsama] ?? null : null;
  const kapak = p.kapak ?? temaGorsel(p.il) ?? havuzGorsel(p.slug, "konum");
  return (
    <Link href={`/proje/${p.slug}`} className="kart kart-3d group flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={kapak} alt="" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.04) 0%, rgba(8,20,34,0.58) 100%)" }} />
        {asama ? <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{asama}</span> : null}
        {p.kapak ? null : <span className="absolute right-3 top-3 rounded bg-black/35 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm">Temsili</span>}
        <h3 className="absolute inset-x-3.5 bottom-3 font-display text-[15px] font-bold leading-snug tracking-tight text-white drop-shadow">{p.ad}</h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-[13px] text-ink-soft"><MapPin size={13} className="opacity-60" />{konum || "—"}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          {p.odaTipleri.length ? <div className="flex flex-wrap gap-1">{p.odaTipleri.slice(0, 4).map((o) => <span key={o} className="rounded bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-teal-d">{o}</span>)}</div> : <span />}
          <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function jsonLd(firma: Firma) {
  return {
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
        mainEntity: { "@type": "ItemList", numberOfItems: firma.projeler.length, itemListElement: firma.projeler.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.ad, url: `${SITE}/proje/${p.slug}` })) },
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
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const firma = await firmaGetir(slug);
  if (!firma) notFound();

  const kurulus = firma.profil.kurulus_yili ? String(firma.profil.kurulus_yili) : null;
  const heroGorsel = firma.projeler.find((p) => p.kapak)?.kapak ?? temaGorsel(firma.profil.il ?? firma.projeler[0]?.il) ?? havuzGorsel(firma.slug, "konum");
  const iller = [...new Set(firma.projeler.map((p) => p.il).filter(Boolean))] as string[];

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(firma)) }} />

      <ProjeTopbar />

      {/* ============ KOYU GÖRSELLİ HERO ============ */}
      <section className="relative isolate flex min-h-[52svh] flex-col justify-end overflow-hidden bg-ink text-white">
        <Image src={heroGorsel} alt="" fill priority sizes="100vw" className="scale-105 object-cover object-[50%_45%]" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,16,28,0.55) 0%, rgba(6,16,28,0.2) 34%, rgba(6,16,28,0.92) 100%)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 70% at 18% 30%, rgba(30,155,138,0.24) 0%, transparent 62%)" }} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-24 sm:px-6">
          <nav aria-label="Konum yolu" className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Ana sayfa</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/konut-projeleri" className="hover:text-white">Konut projeleri</Link>
            <ChevronRight size={12} className="opacity-50" />
            <span className="text-white/90">{firma.ad}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/85 backdrop-blur-md"><Building2 size={13} className="text-[#7fd4c4]" /> {firma.kaynak === "proje" ? "Müteahhit firma" : "Proje geliştiricisi"}</span>
            {firma.dogrulanmis ? <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2fd3bc]/50 bg-[#2fd3bc]/14 px-3 py-1 text-[#eafff6]"><ShieldCheck size={13} /> Doğrulanmış</span> : null}
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight [text-shadow:0_2px_30px_rgba(0,0,0,0.35)] sm:text-5xl">{firma.ad}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12.5px] text-white/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md"><span className="size-1.5 rounded-full bg-[#2fd3bc]" />{firma.projeler.length} proje</span>
            {iller.length ? <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="opacity-70" />{iller.slice(0, 4).join(", ")}</span> : null}
            {kurulus ? <span>Kuruluş {kurulus}</span> : null}
            {firma.profil.web ? <a href={firma.profil.web} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1.5 text-[#7fd4c4] hover:text-white"><Globe size={13} /> Resmi site ↗</a> : null}
          </div>
          {firma.profil.hakkinda ? <p className="mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/80">{firma.profil.hakkinda}</p> : null}
        </div>
      </section>

      <ProjedarBanner />

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{firma.ad} projeleri</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {firma.projeler.map((p) => <ProjeKarti key={p.slug} p={p} />)}
        </div>
      </div>

      {/* Firma CTA (ağda: yönet · katalog: ağa aç) */}
      <div className="border-t border-[var(--cizgi)] px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="komuta relative overflow-hidden rounded-[26px] p-8 text-center sm:p-12">
            <div className="komuta-grid absolute inset-0" aria-hidden />
            <div className="relative text-white">
              <h2 className="mx-auto max-w-[24ch] font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{firma.ad} projeleri, doğru satış ağında.</h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-white/75">
                {firma.kaynak === "proje"
                  ? `Gayrimenkul danışmanıysan Projedar ağına ücretsiz katıl, ${firma.ad} projelerini canlı stoktan sat. Geliştiriciysen stoğunu tek panelden yönet. Projedar satış komisyonuna ortak olmaz.`
                  : `Gayrimenkul danışmanıysan Projedar ağına ücretsiz katıl; geliştiriciysen ${firma.ad} projelerini ağa ekle, stoğunu ve fiyatını tek panelden yönet. Projedar satış komisyonuna ortak olmaz.`}
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/kayit?rol=uretici&kaynak=firma-seo" className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] bg-white px-7 text-[15px] font-bold text-ink transition-all hover:-translate-y-0.5">Projeni ağa ekle</Link>
                <Link href="/kayit?rol=emlakci&kaynak=firma-seo" className="inline-flex min-h-[48px] items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/15">Danışman olarak katıl</Link>
              </div>
            </div>
          </div>
        </div>
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
