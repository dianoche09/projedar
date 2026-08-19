"use client";

import { useRef, useState } from "react";

/**
 * Mikrosite interaktif ödeme simülasyonu (Sprint 2): peşinat yükselir → taksit düşer.
 * Üreticinin planı varsayılan değerdir; hesap örnektir, resmî plan üreticinin koşullarına tabidir.
 * İlk etkileşimde bir kez anonim "odeme_hesap" sinyali yazar (Katman A, PII yok).
 */

const fmt = (n: number) => n.toLocaleString("tr-TR");
const TAKSITLER = [12, 24, 36, 48];

export function OdemeSlider({
  liste,
  psim,
  varsayilanPesinat,
  varsayilanTaksit,
  vadeFarkiPct,
  araOdemePct,
  emlakci,
  birim,
  proje,
  token,
  kod,
}: {
  liste: number;
  psim: string;
  varsayilanPesinat: number | null;
  varsayilanTaksit: number | null;
  vadeFarkiPct: number;
  araOdemePct: number;
  emlakci: string;
  birim: string;
  proje: string;
  token: string;
  /** Yeni kısa link kodu (iptal edilebilir). Varsa yetki bundan çözülür; yoksa legacy token. */
  kod?: string | null;
}) {
  const [pesinatPct, setPesinatPct] = useState(() => Math.min(80, Math.max(10, varsayilanPesinat ?? 30)));
  const [taksit, setTaksit] = useState(() =>
    TAKSITLER.includes(varsayilanTaksit ?? 0) ? (varsayilanTaksit as number) : 24,
  );
  const sinyalGitti = useRef(false);

  const pesinat = Math.round((liste * pesinatPct) / 100);
  const kalan = Math.max(0, liste - pesinat - Math.round((liste * araOdemePct) / 100));
  const aylik = taksit > 0 ? Math.round((kalan * (1 + vadeFarkiPct / 100)) / taksit) : 0;

  /* ilk etkileşimde tek anonim sinyal (fire-and-forget) */
  const sinyal = () => {
    if (sinyalGitti.current) return;
    sinyalGitti.current = true;
    void fetch("/api/etkilesim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(kod ? { kod } : { emlakci, birim, token }), proje, tip: "odeme_hesap" }),
    }).catch(() => {});
  };

  return (
    <div className="mt-3 border-t border-hair pt-3 print:hidden">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-gray">
          Ödeme simülasyonu
        </span>
        <span className="font-sans text-[10px] text-gray">örnek hesap</span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between font-sans text-[12px]">
          <span className="text-gray">Peşinat</span>
          <span className="font-mono font-semibold text-ink">
            %{pesinatPct} · {fmt(pesinat)} {psim}
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={pesinatPct}
          onChange={(e) => {
            setPesinatPct(Number(e.target.value));
            sinyal();
          }}
          className="mt-1.5 w-full accent-[var(--color-teal,#1e9b8a)]"
          aria-label="Peşinat yüzdesi"
        />
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 font-sans">
        <span className="mr-1 text-[12px] text-gray">Vade</span>
        {TAKSITLER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTaksit(t);
              sinyal();
            }}
            className={`rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
              taksit === t
                ? "border-teal bg-teal text-white"
                : "border-hair text-ink hover:bg-paper"
            }`}
          >
            {t} ay
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-baseline justify-between rounded-lg bg-teal/8 px-3 py-2.5">
        <span className="font-sans text-[12px] font-medium text-teal-d">Aylık taksit</span>
        <span className="text-lg font-bold text-teal-d">
          {fmt(aylik)} {psim}
          <span className="ml-1 text-[11px] font-medium">/ay</span>
        </span>
      </div>
      {araOdemePct > 0 ? (
        <p className="mt-1.5 font-sans text-[10.5px] text-gray">Ara ödemeler (%{araOdemePct}) hesaba dahildir.</p>
      ) : null}
      <p className="mt-1.5 font-sans text-[10.5px] leading-relaxed text-gray">
        Bu bir örnek hesaplamadır; resmî ödeme planı üreticinin belirlediği koşullara tabidir.
      </p>
    </div>
  );
}
