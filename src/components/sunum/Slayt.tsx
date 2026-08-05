import type { ReactNode } from "react";
import { markali } from "@/components/sunum/parcalar";

/** Koyu tema içerik slaytı: kicker + başlık + alt metin + içerik (kademeli giriş). */
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
    <div className="flex min-h-full w-full items-center justify-center px-5 pb-20 pt-14 sm:px-10">
      <div className={`w-full ${genis ? "max-w-6xl" : "max-w-4xl"} ${orta ? "text-center" : ""}`}>
        {kicker ? (
          <p className="da da-1 mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#2fd3bc]">{kicker}</p>
        ) : null}
        {baslik ? (
          <h2 className="da da-2 font-display mt-3 text-3xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-[52px]">
            {markali(baslik)}
          </h2>
        ) : null}
        {alt ? (
          <p className={`da da-3 deck-soft mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-lg ${orta ? "mx-auto" : ""}`}>
            {markali(alt)}
          </p>
        ) : null}
        {children ? <div className="da da-4 mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
