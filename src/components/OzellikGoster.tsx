import { OZELLIK_KATEGORILERI, type Ozellikler } from "@/lib/ozellikler";

/**
 * Proje özniteliklerini kategori-gruplu, KOMPAKT 2-kolon grid olarak gösterir.
 * Çok sayıda özellikte (30+) alt-alta yığılıp "duvar" olmasın diye grid + kategori sayacı.
 * Mikrosite + havuz/proje ortak.
 */
export function OzellikGoster({ ozellikler, className = "" }: { ozellikler: Ozellikler; className?: string }) {
  const dolu = OZELLIK_KATEGORILERI.filter((k) => (ozellikler[k.key]?.length ?? 0) > 0);
  if (dolu.length === 0) return null;
  return (
    <div className={`grid gap-x-6 gap-y-5 sm:grid-cols-2 ${className}`}>
      {dolu.map((kat) => {
        const liste = ozellikler[kat.key] ?? [];
        return (
          <section key={kat.key} className="min-w-0">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">
              {kat.baslik}
              <span className="rounded-full bg-[var(--color-soft)] px-1.5 py-px text-[10px] font-semibold text-ink-soft">{liste.length}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {liste.map((o) => (
                <span
                  key={o}
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--color-soft)] px-2 py-1 text-[12.5px] leading-none text-ink-soft"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-d)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-none" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {o}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
