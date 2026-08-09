import { Breadcrumb } from "./Breadcrumb";
import { IcerikDamgasi } from "./IcerikDamgasi";
import { KaynakBlok } from "./KaynakBlok";
import { IlgiliSayfalar } from "./IlgiliSayfalar";
import { YazarInceleyen } from "./YazarInceleyen";
import { IcerikToc, type TocOge } from "./IcerikToc";
import { IcerikHero } from "./IcerikGorsel";
import { IcerikGoruntuleme } from "./IcerikGoruntuleme";
import { AnaMenu } from "@/components/AnaMenu";
import { KapanisFooter } from "@/components/KapanisFooter";
import { icerikSchemas } from "@/lib/icerik/schema";
import type { IcerikMeta } from "@/lib/icerik/tipler";

/**
 * Sektörel içerik iskeleti. Tüm içerik tipleri (rehber/araç/sözlük/karşılaştırma)
 * bu layout'u paylaşır. Çevresel her şey (breadcrumb, damga, yazar, kaynak,
 * ilgili, cta, schema) meta'dan OTOMATİK gelir; gövde yalnız orta içeriğe
 * odaklanır. Projedar'ın doğal public yüzeyidir (ayrı blog görünümü değil).
 */
export function IcerikLayout({
  meta,
  toc = [],
  children,
}: {
  meta: IcerikMeta;
  toc?: TocOge[];
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full flex-col">
      <IcerikGoruntuleme slug={meta.slug} kategori={meta.kategori} />
      <AnaMenu aktif={meta.kategori} />

      {/* ---- içerik gövdesi ---- */}
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <Breadcrumb kategori={meta.kategori} baslik={meta.h1 ?? meta.title} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_236px] lg:gap-12">
          <article className="min-w-0">
            <header className="max-w-3xl">
              <h1 className="font-display text-[1.9rem] font-extrabold leading-[1.15] tracking-tight text-ink sm:text-[2.4rem]">
                {meta.h1 ?? meta.title}
              </h1>
              <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{meta.description}</p>
              <div className="mt-4">
                <IcerikDamgasi updatedAt={meta.updatedAt} sourceCheckedAt={meta.sourceCheckedAt} />
              </div>
            </header>

            {/* hero görsel */}
            {meta.heroGorsel ? (
              <div className="mt-6 max-w-3xl">
                <IcerikHero src={meta.heroGorsel} alt={meta.heroAlt ?? ""} />
              </div>
            ) : null}

            {/* mobil içindekiler */}
            {toc.length ? (
              <div className="mt-6 lg:hidden">
                <IcerikToc ogeler={toc} mod="mobil" />
              </div>
            ) : null}

            {/* gövde */}
            <div className="mt-8 flex max-w-3xl flex-col gap-10">{children}</div>

            {/* yazar + kaynak */}
            <div className="mt-12 flex max-w-3xl flex-col gap-8">
              <YazarInceleyen
                author={meta.author}
                reviewer={meta.reviewer}
                updatedAt={meta.updatedAt}
              />
              <KaynakBlok
                kaynakIds={meta.sources}
                sourceCheckedAt={meta.sourceCheckedAt}
                slug={meta.slug}
              />
            </div>
          </article>

          {/* masaüstü içindekiler */}
          {toc.length ? (
            <aside className="hidden lg:block">
              <IcerikToc ogeler={toc} mod="masaustu" />
            </aside>
          ) : null}
        </div>

        {/* ilgili sayfalar (silo) */}
        <div className="mt-14 max-w-4xl">
          <IlgiliSayfalar iliskiler={meta.iliskiler} slug={meta.slug} />
        </div>
      </div>

      {/* ---- ortak kapanış (Ağ büyüyor CTA + footer) ---- */}
      <KapanisFooter />

      {/* ---- JSON-LD (Organization + BreadcrumbList + Article) ---- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(icerikSchemas(meta)) }}
      />
    </main>
  );
}
