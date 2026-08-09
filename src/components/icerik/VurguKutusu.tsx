import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

/**
 * Sinyal vurgu kutusu (veri-görsel). Sinyal renk sistemiyle kritik noktayı
 * öne çıkarır: uyarı (kırmızı, ör. ceza), doğru uygulama (yeşil), bilgi (teal).
 */
type VurguTip = "uyari" | "dogru" | "bilgi";

const STIL: Record<VurguTip, { renk: string; zemin: string; Ikon: typeof Info; etiket: string }> = {
  uyari: { renk: "var(--color-red)", zemin: "var(--color-red-soft)", Ikon: AlertTriangle, etiket: "Dikkat" },
  dogru: { renk: "var(--color-green)", zemin: "var(--color-green-soft)", Ikon: CheckCircle2, etiket: "Doğru uygulama" },
  bilgi: { renk: "var(--color-teal)", zemin: "var(--color-teal-soft)", Ikon: Info, etiket: "Bilgi" },
};

export function VurguKutusu({
  tip = "bilgi",
  baslik,
  children,
}: {
  tip?: VurguTip;
  baslik?: string;
  children: React.ReactNode;
}) {
  const s = STIL[tip];
  return (
    <aside
      className="not-prose signal-top rounded-2xl border border-[var(--cizgi)] p-5"
      style={{ ["--_sig" as string]: s.renk, background: `color-mix(in srgb, ${s.zemin} 55%, #fff)` }}
    >
      <div className="flex items-start gap-3">
        <span className="inline-grid size-8 flex-none place-items-center rounded-xl bg-white" aria-hidden>
          <s.Ikon size={17} strokeWidth={1.9} color={s.renk} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: s.renk }}>
            {s.etiket}
          </p>
          {baslik ? (
            <p className="mt-0.5 font-display text-[15px] font-bold leading-snug text-ink">{baslik}</p>
          ) : null}
          <div className="icerik-govde mt-1.5 text-[14px]">{children}</div>
        </div>
      </div>
    </aside>
  );
}
