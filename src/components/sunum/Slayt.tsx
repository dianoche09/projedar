import type { ReactNode } from "react";

/** Ortak slayt yerleşimi: kicker + başlık + alt metin + içerik alanı. */
export function Slayt({
  kicker,
  baslik,
  alt,
  genis = false,
  orta = false,
  children,
}: {
  kicker?: string;
  baslik?: ReactNode;
  alt?: ReactNode;
  /** true: içerik max-w-6xl (demo bileşenli slaytlar) */
  genis?: boolean;
  /** true: metin ortalanır (büyük mesaj slaytları) */
  orta?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-full w-full items-center justify-center px-5 pb-24 pt-20 sm:px-10">
      <div className={`w-full ${genis ? "max-w-6xl" : "max-w-4xl"} ${orta ? "text-center" : ""}`}>
        {kicker ? (
          <p className="mono text-[11px] font-bold uppercase tracking-[0.16em] text-teal">{kicker}</p>
        ) : null}
        {baslik ? (
          <h2 className="font-display mt-3 text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            {baslik}
          </h2>
        ) : null}
        {alt ? (
          <p className={`mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-lg ${orta ? "mx-auto" : ""}`}>
            {alt}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
