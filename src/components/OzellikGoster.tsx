import { OZELLIK_KATEGORILERI, type Ozellikler } from "@/lib/ozellikler";

/** Proje özniteliklerini kategori-gruplu chip listesi olarak gösterir. Mikrosite + havuz/proje ortak. */
export function OzellikGoster({ ozellikler, className = "" }: { ozellikler: Ozellikler; className?: string }) {
  const dolu = OZELLIK_KATEGORILERI.filter((k) => (ozellikler[k.key]?.length ?? 0) > 0);
  if (dolu.length === 0) return null;
  return (
    <div className={className}>
      {dolu.map((kat) => (
        <div key={kat.key} className="mt-4 first:mt-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">{kat.baslik}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(ozellikler[kat.key] ?? []).map((o) => (
              <span
                key={o}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-soft)] px-2.5 py-1 text-[13px] text-ink"
              >
                <span className="inline-flex size-4 flex-none items-center justify-center rounded bg-[var(--color-teal-soft)] text-[10px] text-[var(--color-teal-d)]">
                  ✓
                </span>
                {o}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
