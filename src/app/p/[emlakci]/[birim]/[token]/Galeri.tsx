"use client";

import { useCallback, useEffect, useState } from "react";

/** Mikrosite proje foto galerisi: tıkla-büyüt lightbox (klavye + prev/next + sayaç). */
export function Galeri({ fotolar, ad }: { fotolar: string[]; ad: string }) {
  const [acik, setAcik] = useState<number | null>(null);
  const kapat = useCallback(() => setAcik(null), []);
  const git = useCallback(
    (yon: 1 | -1) => setAcik((i) => (i == null ? i : (i + yon + fotolar.length) % fotolar.length)),
    [fotolar.length],
  );

  useEffect(() => {
    if (acik == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") kapat();
      else if (e.key === "ArrowRight") git(1);
      else if (e.key === "ArrowLeft") git(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [acik, git, kapat]);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fotolar.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setAcik(i)}
            className="group relative block aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl border border-hair bg-paper"
            aria-label={`${ad} görsel ${i + 1} büyüt`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${ad} görsel ${i + 1}`} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {acik != null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={kapat}
          role="dialog"
          aria-modal="true"
          aria-label={`${ad} görsel ${acik + 1}`}
        >
          <button
            type="button"
            onClick={kapat}
            aria-label="Kapat"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
          >
            ×
          </button>
          {fotolar.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); git(-1); }}
                aria-label="Önceki"
                className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); git(1); }}
                aria-label="Sonraki"
                className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
              >
                ›
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotolar[acik]}
            alt={`${ad} görsel ${acik + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 font-mono text-xs text-white">
            {acik + 1} / {fotolar.length}
          </span>
        </div>
      ) : null}
    </>
  );
}
