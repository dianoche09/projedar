/**
 * KPI / istatistik şeridi (veri-görsel). Answer-first altında anahtar rakamları
 * öne çıkarır: hem görsel zenginlik hem GEO (sayısal veri taranabilir olur).
 * Tasarım diline (mono rakam, sinyal renk) uygundur.
 */
export type Istatistik = {
  deger: string;
  etiket: string;
  renk?: "teal" | "green" | "amber" | "red" | "navy";
};

const RENK: Record<NonNullable<Istatistik["renk"]>, { metin: string; zemin: string }> = {
  teal: { metin: "text-teal-d", zemin: "bg-[var(--color-teal-soft)]" },
  green: { metin: "text-green", zemin: "bg-[var(--color-green-soft)]" },
  amber: { metin: "text-amber", zemin: "bg-[var(--color-amber-soft)]" },
  red: { metin: "text-red", zemin: "bg-[var(--color-red-soft)]" },
  navy: { metin: "text-navy", zemin: "bg-[var(--color-navy-soft)]" },
};

export function IstatistikSerit({ ogeler }: { ogeler: Istatistik[] }) {
  return (
    <div className="not-prose grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ogeler.map((o, i) => {
        const renk = RENK[o.renk ?? "teal"];
        return (
          <div
            key={i}
            className={`signal-top rounded-2xl border border-[var(--cizgi)] bg-white p-4 ${renk.zemin}/40`}
            style={{ ["--_sig" as string]: `var(--color-${o.renk ?? "teal"})` }}
          >
            <p className={`mono text-xl font-bold leading-none tracking-tight sm:text-2xl ${renk.metin}`}>
              {o.deger}
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">{o.etiket}</p>
          </div>
        );
      })}
    </div>
  );
}
