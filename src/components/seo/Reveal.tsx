"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Hafif, yeniden kullanılabilir scroll-reveal sarmalayıcı.
 * globals.css'teki `.reveal` / `.reveal.gor` çiftini IntersectionObserver ile
 * tetikler (bir kez). `delay` ile kart dizilerinde stagger sağlanır.
 * prefers-reduced-motion `.reveal` seviyesinde CSS tarafından zaten iptal edilir.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gor, setGor] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler[0]?.isIntersecting) {
          setGor(true);
          gozlemci.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.08 },
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${gor ? " gor" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
