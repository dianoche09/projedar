import { PenLine, Info } from "lucide-react";
import { trTarih } from "@/lib/icerik/bicim";

/**
 * Yazar/inceleyen (E-E-A-T) + yasal bilgilendirme notu.
 *
 * Sahte kimlik üretilmez: gerçek bir hukukçu incelemediyse "reviewer" boş
 * bırakılır ve "hukuk danışmanınca incelendi" gibi iddia YAPILMAZ. Bunun yerine
 * genel bilgilendirme notu gösterilir.
 */
export function YazarInceleyen({
  author,
  reviewer,
  updatedAt,
}: {
  author: string;
  reviewer?: string | null;
  updatedAt: string;
}) {
  return (
    <div className="not-prose rounded-2xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
        <span className="inline-flex items-center gap-2 text-ink">
          <PenLine size={14} className="text-ink-soft" />
          <span className="font-medium">{author}</span>
        </span>
        {reviewer ? (
          <span className="text-ink-soft">
            İnceleyen: <span className="font-medium text-ink">{reviewer}</span>
          </span>
        ) : null}
        <span className="font-mono text-[11.5px] text-[var(--ink-faint)]">
          Güncelleme: {trTarih(updatedAt)}
        </span>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft">
        <Info size={14} className="mt-0.5 flex-none text-[var(--ink-faint)]" />
        Bu içerik genel bilgilendirme amacı taşır; somut işlemlerde güncel mevzuat ve profesyonel
        hukuk görüşü dikkate alınmalıdır.
      </p>
    </div>
  );
}
