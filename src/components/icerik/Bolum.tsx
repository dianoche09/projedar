import type { LucideIcon } from "lucide-react";

/**
 * İçerik bölümü (H2 + gövde). `id` TOC ve derin bağlantı için; `scroll-mt`
 * sabit üst bara denk gelmez. Opsiyonel `Ikon` başlığa görsel imza ekler.
 * Gövde metni `.icerik-govde` tipografisini alır.
 */
export function Bolum({
  id,
  baslik,
  Ikon,
  children,
}: {
  id: string;
  baslik: string;
  Ikon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2
        id={id}
        className="flex items-center gap-3 font-display text-[1.35rem] font-bold leading-snug tracking-tight text-ink sm:text-2xl"
      >
        {Ikon ? (
          <span
            className="inline-grid size-9 flex-none place-items-center rounded-xl bg-[var(--color-teal-soft)]"
            aria-hidden
          >
            <Ikon size={18} strokeWidth={1.9} className="text-teal-d" />
          </span>
        ) : null}
        {baslik}
      </h2>
      <div className="icerik-govde mt-4">{children}</div>
    </section>
  );
}
