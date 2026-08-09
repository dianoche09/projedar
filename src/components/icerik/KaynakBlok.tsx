import { ExternalLink } from "lucide-react";
import { kaynaklariCoz } from "@/lib/icerik/kaynaklar";
import { trTarih } from "@/lib/icerik/bicim";
import { AnalitikLink } from "./AnalitikLink";

/**
 * Resmî kaynaklar bloğu. Kaynak id'leri kayda çözülür (öncelik sırasıyla) ve
 * numaralandırılır — gövdedeki iddialar bu numaralara atıf yapabilir ([1]).
 * Kaynaklar dekoratif değil; her biri tıklanır (source_click) ve kaynak
 * kontrol tarihi görünür.
 */
export function KaynakBlok({
  kaynakIds,
  sourceCheckedAt,
  slug,
}: {
  kaynakIds: string[];
  sourceCheckedAt: string;
  slug: string;
}) {
  const kaynaklar = kaynaklariCoz(kaynakIds);
  if (!kaynaklar.length) return null;

  return (
    <section aria-labelledby="kaynaklar-baslik" className="not-prose">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="kaynaklar-baslik"
          className="font-display text-lg font-bold tracking-tight text-ink"
        >
          Resmî kaynaklar
        </h2>
        <span className="font-mono text-[11px] text-[var(--ink-faint)]">
          Kaynak kontrolü: {trTarih(sourceCheckedAt)}
        </span>
      </div>
      <ol className="mt-4 flex flex-col gap-2.5">
        {kaynaklar.map((k, i) => (
          <li key={k.id}>
            <AnalitikLink
              href={k.url}
              external
              olay="source_click"
              olayProps={{ slug, kaynak: k.id, kurum: k.kurum }}
              className="group flex items-start gap-3 rounded-xl border border-[var(--cizgi)] bg-white px-4 py-3 transition-colors hover:border-[rgba(16,36,58,0.2)]"
            >
              <span className="mt-0.5 inline-grid size-5 flex-none place-items-center rounded-md bg-[var(--color-soft)] font-mono text-[11px] font-semibold text-ink-soft">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="rounded-md bg-[var(--color-navy-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-navy">
                    {k.kurum}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--ink-faint)]">
                    Kaynağa git <ExternalLink size={11} />
                  </span>
                </span>
                <span className="mt-1 block text-[13.5px] leading-snug text-ink group-hover:underline">
                  {k.baslik}
                </span>
              </span>
            </AnalitikLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
