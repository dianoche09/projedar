import { ChevronRight } from "lucide-react";
import { refCoz, icerikYolu } from "@/lib/icerik/kayit";
import { KATEGORI_ETIKET, type IcerikIliskiler, type IcerikMeta } from "@/lib/icerik/tipler";
import { AnalitikLink } from "./AnalitikLink";

function coz(refs?: string[]): IcerikMeta[] {
  return (refs ?? [])
    .map((r) => refCoz(r))
    .filter((m): m is IcerikMeta => Boolean(m));
}

/**
 * Silo iç link bloğu. İlişkiler registry üzerinden çözülür; YALNIZ yayında
 * (published) içerikler gösterilir — yayınlanmamış hedefe 404 link verilmez.
 * Hiç yayında ilişki yoksa blok render edilmez.
 */
export function IlgiliSayfalar({
  iliskiler,
  slug,
}: {
  iliskiler: IcerikIliskiler;
  slug: string;
}) {
  const hub = iliskiler.hub ? refCoz(iliskiler.hub) : undefined;
  const kalan = [...coz(iliskiler.siblings), ...coz(iliskiler.tools), ...coz(iliskiler.glossary)];
  const hepsi = [...(hub ? [hub] : []), ...kalan];
  if (!hepsi.length) return null;

  return (
    <section aria-labelledby="ilgili-baslik">
      <h2 id="ilgili-baslik" className="font-display text-lg font-bold tracking-tight text-ink">
        İlgili sayfalar
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {hepsi.map((m) => (
          <AnalitikLink
            key={`${m.kategori}/${m.slug}`}
            href={icerikYolu(m)}
            olay="related_content_click"
            olayProps={{ from: slug, to: m.slug, kategori: m.kategori }}
            className="kart kart-3d group flex h-full flex-col p-4"
          >
            <span className="flex items-center justify-between">
              <span className="rounded-md bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal-d">
                {KATEGORI_ETIKET[m.kategori]}
              </span>
              <ChevronRight
                size={16}
                className="text-ink-soft transition-transform group-hover:translate-x-0.5"
              />
            </span>
            <span className="mt-2 font-display text-[14.5px] font-bold leading-snug tracking-tight text-ink">
              {m.h1 ?? m.title}
            </span>
          </AnalitikLink>
        ))}
      </div>
    </section>
  );
}
