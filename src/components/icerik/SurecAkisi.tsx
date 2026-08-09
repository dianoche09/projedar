/**
 * Süreç akışı (veri-görsel). Numaralı adımları yatay (desktop) / dikey (mobil)
 * bir akış olarak gösterir. "Yetkilendirme nasıl işler" gibi adımlı konular için.
 */
export type SurecAdim = { baslik: string; aciklama?: string };

export function SurecAkisi({ adimlar }: { adimlar: SurecAdim[] }) {
  return (
    <ol className="not-prose grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {adimlar.map((a, i) => (
        <li
          key={i}
          className="relative flex flex-col rounded-2xl border border-[var(--cizgi)] bg-white p-4"
        >
          <span className="inline-grid size-8 place-items-center rounded-xl bg-[var(--color-teal-soft)] font-mono text-sm font-bold text-teal-d">
            {i + 1}
          </span>
          <p className="mt-3 font-display text-[14px] font-bold leading-snug text-ink">{a.baslik}</p>
          {a.aciklama ? (
            <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{a.aciklama}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
