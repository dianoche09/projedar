import { List } from "lucide-react";

export type TocOge = { id: string; baslik: string };

/**
 * İçindekiler. İki mod:
 *  - "mobil": katlanabilir <details> (varsayılan kapalı), agresif sticky yok.
 *  - "masaustu": yan sütunda sticky liste (yalnız lg+ görünür).
 */
export function IcerikToc({ ogeler, mod }: { ogeler: TocOge[]; mod: "mobil" | "masaustu" }) {
  if (ogeler.length < 3) return null;

  if (mod === "masaustu") {
    return (
      <nav aria-label="İçindekiler" className="sticky top-24">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-soft">
          <List size={13} strokeWidth={2} /> İçindekiler
        </p>
        <ol className="flex flex-col gap-2 border-l border-[var(--cizgi)] text-[13px]">
          {ogeler.map((o) => (
            <li key={o.id} className="-ml-px border-l-2 border-transparent pl-3 hover:border-teal">
              <a
                href={`#${o.id}`}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {o.baslik}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <details className="kart group p-0 lg:hidden">
      <summary className="flex items-center justify-between gap-3 px-5 py-3.5 font-display text-sm font-semibold text-ink">
        <span className="flex items-center gap-2">
          <List size={15} strokeWidth={2} className="text-teal-d" /> İçindekiler
        </span>
        <span className="text-teal transition-transform group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <ol className="flex flex-col gap-2.5 px-5 pb-4 text-[13.5px]">
        {ogeler.map((o) => (
          <li key={o.id}>
            <a href={`#${o.id}`} className="text-ink-soft hover:text-ink hover:underline">
              {o.baslik}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
