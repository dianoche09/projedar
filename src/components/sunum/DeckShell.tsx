"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Tam ekran koyu sinematik sunum kabuğu: ok tuşları + swipe + alt kontrol barı.
 * Tüm slaytlar mounted kalır (KuleDemo/TahsisPaneli gibi demoların state'i
 * korunur); aktif slayt "aktif" sınıfını alır → .da elemanları sırayla belirir,
 * .kenburns görselleri yavaşça yakınlaşır (globals.css deck teması).
 */
export function DeckShell({ baslik, slides }: { baslik: string; slides: ReactNode[] }) {
  const [aktif, setAktif] = useState(0);
  const son = slides.length - 1;

  const git = useCallback((n: number) => setAktif(Math.min(son, Math.max(0, n))), [son]);

  useEffect(() => {
    const tusla = (e: KeyboardEvent) => {
      const hedef = e.target as HTMLElement | null;
      if (hedef?.closest("input, textarea, select, [contenteditable='true']")) return;
      // buton odaklıyken Space butona bırakılır (demo bileşenleri buton içerir)
      const butonda = Boolean(hedef?.closest("button, a, [role='button']"));
      if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && !butonda)) {
        e.preventDefault();
        setAktif((v) => Math.min(son, v + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setAktif((v) => Math.max(0, v - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setAktif(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setAktif(son);
      }
    };
    window.addEventListener("keydown", tusla);
    return () => window.removeEventListener("keydown", tusla);
  }, [son]);

  const dokunus = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className="deck-zemin relative h-dvh w-full select-none overflow-hidden"
      onTouchStart={(e) => {
        dokunus.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const t0 = dokunus.current;
        dokunus.current = null;
        if (!t0) return;
        const dx = e.changedTouches[0].clientX - t0.x;
        const dy = e.changedTouches[0].clientY - t0.y;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
        setAktif((v) => (dx < 0 ? Math.min(son, v + 1) : Math.max(0, v - 1)));
      }}
    >
      {/* üst bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="pointer-events-auto">
          <Logo size={26} wordmark acik />
        </span>
        <span className="mono rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md">
          {baslik}
        </span>
      </header>

      {/* slaytlar: hepsi mounted, yalnız aktif görünür */}
      {slides.map((s, i) => (
        <section
          key={i}
          aria-hidden={i !== aktif}
          className={`deck-slayt absolute inset-0 overflow-y-auto transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            i === aktif
              ? "aktif translate-x-0 opacity-100"
              : `pointer-events-none opacity-0 ${i < aktif ? "-translate-x-8" : "translate-x-8"}`
          }`}
        >
          {s}
        </section>
      ))}

      {/* alt kontrol barı */}
      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 px-5 pb-4 sm:gap-4 sm:px-8">
        <button
          type="button"
          onClick={() => git(aktif - 1)}
          disabled={aktif === 0}
          aria-label="Önceki slayt"
          className="flex size-11 flex-none items-center justify-center rounded-[13px] border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => git(i)}
              aria-label={`Slayt ${i + 1}`}
              aria-current={i === aktif ? "true" : undefined}
              className="group flex h-8 min-w-0 flex-1 items-center"
            >
              <span
                className={`h-1 w-full rounded-full transition-colors ${
                  i <= aktif ? "bg-[#2fd3bc]" : "bg-white/15 group-hover:bg-white/30"
                }`}
              />
            </button>
          ))}
        </div>

        <span className="mono flex-none text-[11px] font-semibold tabular-nums text-white/70">
          {String(aktif + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        <button
          type="button"
          onClick={() => git(aktif + 1)}
          disabled={aktif === son}
          aria-label="Sonraki slayt"
          className="flex size-11 flex-none items-center justify-center rounded-[13px] bg-teal text-white shadow-[0_6px_18px_rgba(30,155,138,0.4)] transition-colors hover:bg-[#1a8676] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={18} strokeWidth={2.2} />
        </button>
      </footer>
    </div>
  );
}
