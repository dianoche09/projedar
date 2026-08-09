import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { B2BCta } from "@/components/seo/B2BCta";
import { tumHubProjeleri, illerOzet, ilcelerOzet, type HubProje } from "@/lib/seo/konut-hub";
import { temaGorsel, havuzGorsel } from "@/lib/seo/tema-gorsel";
import { MapPin, Building2, ChevronRight } from "lucide-react";

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

/** Görselli proje kartı (proje sayfalarındaki benzer-kart diliyle uyumlu). */
function ProjeKarti({ p }: { p: HubProje }) {
  const konum = [p.ilce, p.il].filter(Boolean).join(", ");
  const asama = p.asama ? ASAMA[p.asama] ?? null : null;
  const kapak = p.kapak ?? temaGorsel(p.il) ?? havuzGorsel(p.slug, "konum");
  const govde = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={kapak} alt="" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.04) 0%, rgba(8,20,34,0.6) 100%)" }} />
        {asama ? <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{asama}</span> : null}
        {p.kapak ? null : <span className="absolute right-3 top-3 rounded bg-black/35 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm">Temsili</span>}
        <h3 className="absolute inset-x-3.5 bottom-3 font-display text-[15px] font-bold leading-snug tracking-tight text-white drop-shadow">{p.ad}</h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {konum ? <p className="flex items-center gap-1.5 text-[13px] text-ink-soft"><MapPin size={13} className="opacity-60" />{konum}</p> : null}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-ink-soft">
            {p.odaTipleri.length ? <span className="rounded bg-[var(--color-teal-soft)] px-2 py-0.5 font-semibold text-teal-d">{p.odaTipleri.slice(0, 3).join(" · ")}</span> : null}
            {p.m2 ? <span className="rounded border border-[var(--cizgi)] px-2 py-0.5">{p.m2}</span> : null}
          </div>
          {p.esik ? <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden /> : null}
        </div>
      </div>
    </>
  );
  const cls = "kart kart-3d group flex h-full flex-col overflow-hidden p-0";
  return p.esik ? (
    <Link href={`/proje/${p.slug}`} className={cls}>{govde}</Link>
  ) : (
    <div className={cls}>{govde}</div>
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
  const heroGorsel = kapsam.tur === "kok" ? havuzGorsel("konut-projeleri", "konum") : (temaGorsel(kapsam.il) ?? havuzGorsel(kapsam.ilSlug, "konum"));

  const iller = kapsam.tur === "kok" ? illerOzet(hepsi) : [];
  const ilceler = kapsam.tur === "il" ? ilcelerOzet(hepsi, kapsam.ilSlug) : [];
  const projeler = [...liste].sort((a, b) => Number(b.esik) - Number(a.esik) || a.ad.localeCompare(b.ad, "tr"));

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(kapsam, liste, h1, yol)) }} />

      <ProjeTopbar />

      {/* ============ KOYU GÖRSELLİ HERO ============ */}
      <section className="relative isolate flex min-h-[52svh] flex-col justify-end overflow-hidden bg-ink text-white">
        <Image src={heroGorsel} alt="" fill priority sizes="100vw" className="scale-105 object-cover object-[50%_45%]" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,16,28,0.55) 0%, rgba(6,16,28,0.2) 34%, rgba(6,16,28,0.92) 100%)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 70% at 18% 30%, rgba(30,155,138,0.24) 0%, transparent 62%)" }} />
        <span className="absolute bottom-4 right-4 z-10 rounded-md border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] text-white/70">Temsili görsel</span>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-24 sm:px-6">
          <nav aria-label="Konum yolu" className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Ana sayfa</Link>
            <ChevronRight size={12} className="opacity-50" />
            {kapsam.tur === "kok" ? (
              <span className="text-white/90">Konut projeleri</span>
            ) : (
              <Link href="/konut-projeleri" className="hover:text-white">Konut projeleri</Link>
            )}
            {kapsam.tur === "il" ? (<><ChevronRight size={12} className="opacity-50" /><span className="text-white/90">{kapsam.il}</span></>) : null}
            {kapsam.tur === "ilce" ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${kapsam.ilSlug}`} className="hover:text-white">{kapsam.il}</Link><ChevronRight size={12} className="opacity-50" /><span className="text-white/90">{kapsam.ilce}</span></>) : null}
          </nav>
          <h1 className="mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-5xl [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">{h1}</h1>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-white/80">{ozet}</p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-mono text-xs text-white/85 backdrop-blur-md"><span className="size-1.5 rounded-full bg-[#2fd3bc]" />{liste.length} proje</p>
        </div>
      </section>

      <ProjedarBanner />

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

        {/* Proje listesi (görselli, ferah kartlar) */}
        <section>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            {kapsam.tur === "kok" ? "Projeler" : kapsam.tur === "il" ? `${kapsam.il} projeleri` : `${kapsam.ilce} projeleri`}
          </h2>
          {projeler.length ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
