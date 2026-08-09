"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Yatay kaydırılabilir sarmalayıcı: sağ-kenar fade + "→ kaydır" ipucu.
 * Gerçek scrollLeft tespitiyle sona gelince VE kaydırılamazken (desktop) otomatik gizlenir.
 * fadeFrom = kapsayıcının zemin rengi (6 haneli hex); şeffaf uç aynı RGB'nin 00-alpha hali (gri tonlama olmaz).
 */
export function YatayKaydirma({
  children,
  containerClassName = "",
  fadeFrom = "#eef1f6",
  radius = 16,
}: {
  children: ReactNode;
  containerClassName?: string;
  fadeFrom?: string;
  radius?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [kaydirilabilir, setKaydirilabilir] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const guncelle = () => setKaydirilabilir(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    guncelle();
    el.addEventListener("scroll", guncelle, { passive: true });
    const ro = new ResizeObserver(guncelle);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", guncelle);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <div ref={scrollRef} className={`overflow-x-auto ${containerClassName}`}>
        {children}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-px right-px w-16 transition-opacity duration-300 ${kaydirilabilir ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `linear-gradient(to left, ${fadeFrom}, ${fadeFrom}00)`,
          borderTopRightRadius: radius,
          borderBottomRightRadius: radius,
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-white/90 px-2.5 py-1 font-mono text-[10px] tracking-wide text-ink-soft backdrop-blur-sm transition-opacity duration-300 ${kaydirilabilir ? "opacity-100" : "opacity-0"}`}
      >
        → kaydır
      </div>
    </div>
  );
}
