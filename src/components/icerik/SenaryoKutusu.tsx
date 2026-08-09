import { MessageSquareText } from "lucide-react";

/**
 * Saha senaryosu kutusu. Danışmanın gerçek iş sorusunu ("müşteri fiyat
 * listesini istedi, ne göndermeliyim?") ve pratik yaklaşımı vurgular.
 */
export function SenaryoKutusu({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className="signal-top not-prose rounded-2xl border border-[var(--cizgi)] bg-[var(--color-navy-soft)]/50 p-5 sm:p-6"
      style={{ ["--_sig" as string]: "var(--color-navy)" }}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-grid size-9 flex-none place-items-center rounded-xl bg-white"
          aria-hidden
        >
          <MessageSquareText size={18} strokeWidth={1.8} color="var(--color-navy)" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            Saha senaryosu
          </p>
          <h3 className="mt-0.5 font-display text-[15px] font-bold leading-snug text-ink">
            {baslik}
          </h3>
          <div className="icerik-govde mt-2 text-[14px]">{children}</div>
        </div>
      </div>
    </aside>
  );
}
