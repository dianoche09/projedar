import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { KapanisFooter } from "@/components/KapanisFooter";
import { B2BCta } from "@/components/seo/B2BCta";
import { tumHubProjeleri, illerOzet, ilcelerOzet, type HubProje } from "@/lib/seo/konut-hub";
import { lokasyonAgregatlari, KONUM_TALEP } from "@/lib/seo-komuta/inventory-aggregate";
import { lokasyonIndexPolicy } from "@/lib/seo-komuta/inventory-policy";
import { temaGorsel, havuzGorsel } from "@/lib/seo/tema-gorsel";
import { HubListe } from "@/components/seo/HubListe";
import { MapPin, Building2, ChevronRight } from "lucide-react";

export const revalidate = 3600;

const SITE = "https://projedar.com";


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

  // Inventory Quality Gate: kalite eşiğini geçmeyen (HOLD/NAVIGABLE_NOINDEX) lokasyon = noindex,follow.
  // canonical HER ZAMAN self (HOLD ≠ duplicate). Kök ve INDEX/REVIEW → index,follow.
  let robots: Metadata["robots"] = { index: true, follow: true };
  if (kapsam.tur !== "kok") {
    const konum = kapsam.tur === "il" ? kapsam.ilSlug : `${kapsam.ilSlug}/${kapsam.ilceSlug}`;
    const env = lokasyonAgregatlari(hepsi, { talep: KONUM_TALEP }).find((e) => e.konum === konum);
    if (env && lokasyonIndexPolicy(env).exposure === "NAVIGABLE_NOINDEX") robots = { index: false, follow: true };
  }

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE}${yol}` },
    robots,
    openGraph: { title, description: desc, url: `${SITE}${yol}`, type: "website", siteName: "Projedar" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
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
            <div className="mt-6"><HubListe projeler={projeler} ilFiltre={kapsam.tur === "kok"} /></div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">Bu bölgede henüz listelenen proje yok.</p>
          )}
        </section>
      </div>

      <div className="border-t border-[var(--cizgi)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6"><B2BCta /></div>
      </div>

      <KapanisFooter />
    </main>
  );
}
