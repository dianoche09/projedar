"use client";

import { useEffect } from "react";

/** Havuz hata sınırı — yükleme/sorgu hatasında beyaz ekran yerine kurtarma + tekrar dene. */
export default function HavuzError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[havuz] hata:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-red-soft">
        <svg className="size-7 text-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-ink">Havuz yüklenemedi</h2>
        <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
          Bağlantı ya da geçici bir sorun oldu. Tekrar dene; sürerse birazdan yeniden aç.
        </p>
      </div>
      <button type="button" onClick={reset} className="btn-action active:scale-[0.98]">
        Tekrar dene
      </button>
    </div>
  );
}
