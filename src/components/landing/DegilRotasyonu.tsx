"use client";

import { useEffect, useState } from "react";

/**
 * "X değil, dağıtım altyapısı" başlığındaki X: üstü çizili, dönüşümlü terim.
 * "Satış ofisi yazılımı" ↔ "İlan sitesi" 2,8 sn'de bir yumuşak crossfade ile değişir.
 * prefers-reduced-motion: ilk terim statik. Genişlik en uzun terime göre sabitlenir (layout zıplamaz).
 */

const TERIMLER = ["Satış ofisi yazılımı", "İlan sitesi"];

export function DegilRotasyonu() {
  const [aktif, setAktif] = useState(0);
  const [azalt, setAzalt] = useState(false);

  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (m) {
      const raf = requestAnimationFrame(() => setAzalt(true));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => setAktif((v) => (v + 1) % TERIMLER.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-grid align-baseline">
      {TERIMLER.map((t, k) => {
        const gorunur = azalt ? k === 0 : k === aktif;
        return (
          <span
            key={t}
            className="col-start-1 row-start-1 whitespace-nowrap text-ink-soft line-through decoration-[#c0564a] decoration-[0.12em] transition-opacity duration-500"
            style={{ opacity: gorunur ? 1 : 0 }}
            aria-hidden={!gorunur}
          >
            {t}
          </span>
        );
      })}
    </span>
  );
}
