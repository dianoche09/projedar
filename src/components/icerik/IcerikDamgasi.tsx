import { trTarih } from "@/lib/icerik/bicim";

/**
 * İçerik tazelik damgası. İki kavram AYRI gösterilir:
 *  - Son güncelleme: içerik metni en son ne zaman değişti
 *  - Kaynak kontrolü: mevzuat/kaynak en son ne zaman doğrulandı (metin değişmese de)
 */
export function IcerikDamgasi({
  updatedAt,
  sourceCheckedAt,
}: {
  updatedAt: string;
  sourceCheckedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11.5px] text-ink-soft">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-green" aria-hidden />
        Son güncelleme: <span className="text-ink">{trTarih(updatedAt)}</span>
      </span>
      <span className="hidden text-[var(--ink-faint)] sm:inline" aria-hidden>
        ·
      </span>
      <span className="inline-flex items-center gap-1.5">
        Kaynak kontrolü: <span className="text-ink">{trTarih(sourceCheckedAt)}</span>
      </span>
    </div>
  );
}
