import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { B2BCta } from "@/components/seo/B2BCta";
import { tumHubProjeleri, illerOzet, ilcelerOzet, type HubProje } from "@/lib/seo/konut-hub";
import { MapPin, Building2, CalendarClock, ChevronRight } from "lucide-react";

export const revalidate = 3600;

const SITE = "https://projedar.com";

const NAV = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Güven", href: "/guven" },
];

const ASAMA: Record<string, string> = {
  planlama: "Planlama", temel: "Temel", kaba_insaat: "Kaba inşaat", ince_insaat: "İnce inşaat",
  cevre_duzenleme: "Çevre düzenleme", tamamlandi: "Tamamlandı",
  lansman: "Lansman", insaat: "İnşaat halinde", teslim: "Teslim edildi",
};

type Kapsam =
  | { tur: "kok" }
  | { tur: "il"; ilSlug: string; il: string }
  | { tur: "ilce"; ilSlug: string; il: string; ilceSlug: string; ilce: string };

/** Route dilimini + veriyi çözer; geçersiz konumda notFound. */
function kapsamCoz(dilim: string[] | undefined, hepsi: HubProje[]): { kapsam: Kapsam; liste: HubProje[] } {
  const d = dilim ?? [];
  if (d.length === 0) return { kapsam: { tur: "kok" }, liste: hepsi };
  if (d.length > 2) notFound();

  const ilSlug = d[0];
  const ildeki = hepsi.filter((p) => p.ilSlug === ilSlug);
  if (!ildeki.length) notFound();
  const il = ildeki[0].il;

  if (d.length === 1) return { kapsam: { tur: "il", ilSlug, il }, liste: ildeki };

  const ilceSlug = d[1];
  const ilcedeki = ildeki.filter((p) => p.ilceSlug === ilceSlug);
  if (!ilcedeki.length) notFound();
  const ilce = ilcedeki[0].ilce as string;
  return { kapsam: { tur: "ilce", ilSlug, il, ilceSlug, ilce }, liste: ilcedeki };
}

function baslikMetni(kapsam: Kapsam): { h1: string; ozet: string; title: string; desc: string } {
  if (kapsam.tur === "il") {
    return {
      h1: `${kapsam.il} konut projeleri`,
      ozet: `${kapsam.il} genelindeki yeni konut projeleri, ilçe kırılımıyla. Fiyat ve stok bilgisi projenin sayfasında canlı tutulur.`,
      title: `${kapsam.il} Konut Projeleri | Projedar`,
      desc: `${kapsam.il} yeni konut projeleri: ilçe, daire tipleri ve inşaat aşamasıyla. Projedar tahsisli canlı satış ağı.`,
    };
  }
  if (kapsam.tur === "ilce") {
    return {
      h1: `${kapsam.ilce}, ${kapsam.il} konut projeleri`,
      ozet: `${kapsam.il} ${kapsam.ilce} bölgesindeki yeni konut projeleri. Her projenin fiyatı ve stoğu kendi sayfasında güncel tutulur.`,
      title: `${kapsam.ilce} ${kapsam.il} Konut Projeleri | Projedar`,
      desc: `${kapsam.ilce}, ${kapsam.il} yeni konut projeleri: daire tipleri, m² ve inşaat aşamasıyla. Projedar canlı satış ağı.`,
    };
  }
  return {
    h1: "Konut projeleri",
    ozet: "Türkiye genelinde yeni konut projeleri, il ve ilçe kırılımıyla. Fiyat ve stok her projenin kendi sayfasında canlı tutulur; Projedar tahsisli canlı satış ağıdır.",
    title: "Konut Projeleri | Projedar",
    desc: "Türkiye'de yeni konut projeleri: il ve ilçe kırılımı, daire tipleri ve inşaat aşamasıyla. Projedar tahsisli canlı proje satış ağı.",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ dilim?: string[] }> }): Promise<Metadata> {
  const { dilim } = await params;
  const hepsi = await tumHubProjeleri();
  const { kapsam } = kapsamCoz(dilim, hepsi);
  const { title, desc } = baslikMetni(kapsam);
  const yol = "/konut-projeleri" + (dilim?.length ? "/" + dilim.join("/") : "");
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE}${yol}` },
    openGraph: { title, description: desc, url: `${SITE}${yol}`, type: "website", siteName: "Projedar" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

function ProjeKarti({ p }: { p: HubProje }) {
  const konum = [p.ilce, p.il].filter(Boolean).join(", ");
  const asama = p.asama ? ASAMA[p.asama] ?? null : null;
  const govde = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[15px] font-bold leading-snug tracking-tight text-ink">{p.ad}</h3>
        {p.esik ? <ChevronRight size={16} className="mt-0.5 flex-none text-teal" aria-hidden /> : null}
      </div>
      {konum ? <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-soft"><MapPin size={13} className="opacity-60" />{konum}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[11px] text-ink-soft">
        {asama ? <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-white/60 px-2.5 py-1"><CalendarClock size={11} className="text-teal" />{asama}</span> : null}
        {p.odaTipleri.length ? <span className="rounded-full border border-[var(--cizgi)] bg-white/60 px-2.5 py-1">{p.odaTipleri.slice(0, 4).join(" · ")}</span> : null}
        {p.m2 ? <span className="rounded-full border border-[var(--cizgi)] bg-white/60 px-2.5 py-1">{p.m2}</span> : null}
      </div>
    </>
  );
  const kart = "kart block p-4 sm:p-5";
  return p.esik ? (
    <Link href={`/proje/${p.slug}`} className={`${kart} transition-transform hover:-translate-y-0.5`}>{govde}</Link>
  ) : (
    <div className={kart}>{govde}</div>
  );
}

function jsonLd(kapsam: Kapsam, liste: HubProje[], h1: string, yol: string) {
  const kirimlar: { "@type": string; position: number; name: string; item: string }[] = [
    { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE },
    { "@type": "ListItem", position: 2, name: "Konut projeleri", item: `${SITE}/konut-projeleri` },
  ];
  if (kapsam.tur === "il") kirimlar.push({ "@type": "ListItem", position: 3, name: kapsam.il, item: `${SITE}/konut-projeleri/${kapsam.ilSlug}` });
  if (kapsam.tur === "ilce") {
    kirimlar.push({ "@type": "ListItem", position: 3, name: kapsam.il, item: `${SITE}/konut-projeleri/${kapsam.ilSlug}` });
    kirimlar.push({ "@type": "ListItem", position: 4, name: kapsam.ilce, item: `${SITE}/konut-projeleri/${kapsam.ilSlug}/${kapsam.ilceSlug}` });
  }
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: h1,
        url: `${SITE}${yol}`,
        isPartOf: { "@type": "WebSite", name: "Projedar", url: SITE },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: liste.length,
          itemListElement: liste.filter((p) => p.esik).slice(0, 50).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.ad,
            url: `${SITE}/proje/${p.slug}`,
          })),
        },
      },
      { "@type": "BreadcrumbList", itemListElement: kirimlar },
    ],
  };
}

export default async function Page({ params }: { params: Promise<{ dilim?: string[] }> }) {
  const { dilim } = await params;
  const hepsi = await tumHubProjeleri();
  const { kapsam, liste } = kapsamCoz(dilim, hepsi);
  const { h1, ozet } = baslikMetni(kapsam);
  const yol = "/konut-projeleri" + (dilim?.length ? "/" + dilim.join("/") : "");

  const iller = kapsam.tur === "kok" ? illerOzet(hepsi) : [];
  const ilceler = kapsam.tur === "il" ? ilcelerOzet(hepsi, kapsam.ilSlug) : [];
  const projeler = [...liste].sort((a, b) => Number(b.esik) - Number(a.esik) || a.ad.localeCompare(b.ad, "tr"));

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(kapsam, liste, h1, yol)) }} />

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
            {kapsam.tur === "kok" ? (
              <span className="text-ink">Konut projeleri</span>
            ) : (
              <Link href="/konut-projeleri" className="hover:text-ink">Konut projeleri</Link>
            )}
            {kapsam.tur === "il" ? (<><ChevronRight size={12} className="opacity-50" /><span className="text-ink">{kapsam.il}</span></>) : null}
            {kapsam.tur === "ilce" ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${kapsam.ilSlug}`} className="hover:text-ink">{kapsam.il}</Link><ChevronRight size={12} className="opacity-50" /><span className="text-ink">{kapsam.ilce}</span></>) : null}
          </nav>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{h1}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-soft">{ozet}</p>
          <p className="mt-3 font-mono text-xs text-[var(--ink-faint)]">{liste.length} proje</p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
        {/* İl kırılımı (kök) */}
        {iller.length ? (
          <section className="mb-14">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">İllere göre</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {iller.map((il) => (
                <Link key={il.ilSlug} href={`/konut-projeleri/${il.ilSlug}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-white/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-teal/50 hover:text-teal">
                  <Building2 size={14} className="opacity-60" />{il.il}
                  <span className="font-mono text-[11px] text-ink-soft">{il.sayi}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* İlçe kırılımı (il sayfası) */}
        {ilceler.length ? (
          <section className="mb-14">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">İlçelere göre</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {ilceler.map((i) => (
                <Link key={i.ilceSlug} href={`/konut-projeleri/${(kapsam as { ilSlug: string }).ilSlug}/${i.ilceSlug}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-white/70 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-teal/50 hover:text-teal">
                  <MapPin size={14} className="opacity-60" />{i.ilce}
                  <span className="font-mono text-[11px] text-ink-soft">{i.sayi}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Proje listesi */}
        <section>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            {kapsam.tur === "kok" ? "Projeler" : kapsam.tur === "il" ? `${kapsam.il} projeleri` : `${kapsam.ilce} projeleri`}
          </h2>
          {projeler.length ? (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projeler.map((p) => <ProjeKarti key={`${p.kaynak}-${p.slug}`} p={p} />)}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Bu bölgede henüz listelenen proje yok.</p>
          )}
        </section>
      </div>

      <div className="border-t border-[var(--cizgi)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6"><B2BCta /></div>
      </div>

      <footer className="border-t border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa"><Logo size={22} wordmark /></Link>
          <p className="max-w-md text-xs leading-relaxed text-ink-soft">Tahsisli canlı proje satış ağı. İlan portalı değildir; fiyat ve stok her projenin kendi sayfasında canlı tutulur.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-soft">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="hover:text-ink">{n.etiket}</Link>)}
          </nav>
        </div>
      </footer>
    </main>
  );
}
