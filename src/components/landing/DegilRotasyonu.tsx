"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "X değil, dağıtım altyapısı" başlığındaki X: dönüşümlü terim.
 * Akış: terim yazılır (fade) → kısa bekleme → üstü SOLDAN SAĞA çizilir → bekler → sonraki terim.
 * Terim akış içinde render edilir; genişlik her kelimenin kendi genişliğidir (uzun terime göre boşluk kalmaz).
 * prefers-reduced-motion: ilk terim, çizgisi çekili, statik.
 */

const TERIMLER = ["Satış ofisi yazılımı", "İlan sitesi"];
const YAZ_SURE = 750; // terim görünür, çizgi henüz yok
const CIZILI_SURE = 2100; // çizili bekleme

export function DegilRotasyonu() {
  const [aktif, setAktif] = useState(0);
  const [cizili, setCizili] = useState(false);
  const [azalt, setAzalt] = useState(false);
  const zamanlar = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (m) {
      const raf = requestAnimationFrame(() => {
        setAzalt(true);
        setCizili(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    let iptal = false;
    const dongu = (i: number) => {
      if (iptal) return;
      setAktif(i);
      setCizili(false);
      zamanlar.current.push(
        setTimeout(() => {
          if (iptal) return;
          setCizili(true);
          zamanlar.current.push(setTimeout(() => dongu((i + 1) % TERIMLER.length), CIZILI_SURE));
        }, YAZ_SURE),
      );
    };
    const raf = requestAnimationFrame(() => dongu(0));
    return () => {
      iptal = true;
      cancelAnimationFrame(raf);
      zamanlar.current.forEach(clearTimeout);
      zamanlar.current = [];
    };
  }, []);

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline">
      <style>{`
        @keyframes degil-yaz { from { opacity: 0; transform: translateY(0.12em); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <span
        key={TERIMLER[aktif]}
        className="text-ink-soft"
        style={azalt ? undefined : { animation: "degil-yaz 380ms ease-out both" }}
      >
        {TERIMLER[aktif]}
      </span>
      {/* üstü çizme: soldan sağa çekilen ÇAPRAZ çizgi (referans: İLAN YOK stili) */}
      <span
        aria-hidden
        className="absolute -left-[1%] top-[54%] h-[0.11em] w-[103%] origin-left rounded-full bg-[#c0564a]"
        style={{
          transform: cizili ? "rotate(-4deg) scaleX(1)" : "rotate(-4deg) scaleX(0)",
          transition: azalt ? undefined : "transform 480ms cubic-bezier(0.4, 0, 0.2, 1) 60ms",
        }}
      />
    </span>
  );
}
