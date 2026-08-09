import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/icerik/SiteChrome";
import { IcerikDamgasi } from "@/components/icerik/IcerikDamgasi";
import { kategoriIcerikleri } from "@/lib/icerik/kayit";

export const revalidate = 86400;

const SITE = "https://projedar.com";

export const metadata: Metadata = {
  title: "Emlak Danışmanı Rehberleri | Projedar",
  description:
    "Yeni konut satan gayrimenkul danışmanları için mevzuat, süreç ve saha rehberleri. EİDS, yetkilendirme ve proje satışı konularında güncel, resmî kaynaklı içerik.",
  alternates: { canonical: `${SITE}/rehber` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Emlak Danışmanı Rehberleri",
    description: "Yeni konut satan danışmanlar için güncel, resmî kaynaklı rehberler.",
    url: `${SITE}/rehber`,
    type: "website",
  },
};

export default function RehberIndex() {
  const rehberler = kategoriIcerikleri("rehber");

  return (
    <main className="flex min-h-full flex-col">
      <SiteHeader aktif="rehber" />

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <nav aria-label="İçerik konumu" className="text-[12.5px] text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-ink hover:underline">
                Ana sayfa
              </Link>
            </li>
            <ChevronRight size={13} className="flex-none text-[var(--ink-faint)]" aria-hidden />
            <li className="font-medium text-ink" aria-current="page">
              Rehber
            </li>
          </ol>
        </nav>

        <header className="mt-6 max-w-2xl">
          <h1 className="font-display text-[2rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
            Emlak Danışmanı Rehberleri
          </h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
            Yeni konut satan danışmanlar için mevzuat, süreç ve saha rehberleri. Her içerik resmî
            kaynaklara dayanır ve düzenli olarak güncellik kontrolünden geçer.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {rehberler.map((m) => (
            <Link
              key={m.slug}
              href={`/rehber/${m.slug}`}
              className="kart kart-3d group flex h-full flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal-d">
                  Rehber
                </span>
                <ChevronRight
                  size={16}
                  className="text-ink-soft transition-transform group-hover:translate-x-0.5"
                />
              </div>
              <h2 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink">
                {m.h1 ?? m.title}
              </h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
                {m.description}
              </p>
              <div className="mt-4">
                <IcerikDamgasi updatedAt={m.updatedAt} sourceCheckedAt={m.sourceCheckedAt} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
