"use client";

import { useEffect, useState } from "react";

/**
 * CanliStok · Mockup 01 Bölüm 02: tek kaynak stok paftası.
 * Pafta çerçeveli mono tablo: durum karesi + tazelik + canlı fiyat sütunu.
 * Bayat satır amber zeminle kendini ele verir. Üst şeritte saniye sayacı
 * "senkron" damgasını canlı tutar (hareket değil, metin: reduced-motion dostu).
 * TÜM VERİLER ÖRNEKTİR.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const RENK: Record<Durum, string> = {
  musait: "var(--color-green)",
  opsiyon: "var(--color-amber)",
  satildi: "var(--color-red)",
};

const ETIKET: Record<Durum, string> = {
  musait: "MÜSAİT",
  opsiyon: "OPSİYON",
  satildi: "SATILDI",
};

type Satir = {
  kod: string;
  tip: string;
  durum: Durum;
  taze: string;
  bayat: boolean;
  fiyat: string;
};

const SATIRLAR: Satir[] = [
  { kod: "A-11", tip: "2+1", durum: "musait", taze: "2 dk önce", bayat: false, fiyat: "₺7.120.000" },
  { kod: "A-12", tip: "3+1", durum: "opsiyon", taze: "kalan 22:14", bayat: false, fiyat: "₺9.450.000" },
  { kod: "A-13", tip: "3+1", durum: "musait", taze: "9 gün önce", bayat: true, fiyat: "₺9.575.000" },
  { kod: "A-14", tip: "4+1", durum: "satildi", taze: "dün", bayat: false, fiyat: "₺12.900.000" },
];

export function CanliStok() {
  const [sn, setSn] = useState(4);

  useEffect(() => {
    const sayac = setInterval(() => setSn((s) => (s >= 47 ? 0 : s + 1)), 1000);
    return () => clearInterval(sayac);
  }, []);

  return (
    <div className="dt-cerceve relative overflow-hidden font-mono text-[13px]">
      <span className="absolute right-3 top-2.5 rounded-[2px] border border-[var(--cizgi-2)] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek
      </span>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b-[1.5px] border-ink bg-[rgba(16,36,58,0.04)] px-4 py-3 pr-20 sm:px-5">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink">
          Canlı stok · Blok A
        </span>
        <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-teal-d)]">tek kaynak</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-[#1f7d4c]">
          <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
          senkron {sn < 2 ? "edildi" : `${sn} sn önce`}
        </span>
      </div>

      <ul aria-label="Örnek canlı stok satırları">
        {SATIRLAR.map((s) => (
          <li
            key={s.kod}
            className={`grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[var(--cizgi)] px-4 py-3.5 last:border-b-0 sm:grid-cols-[56px_44px_minmax(0,1fr)_auto] sm:px-5 ${
              s.bayat ? "bg-[rgba(227,161,44,0.07)]" : ""
            }`}
          >
            <span className="font-semibold text-ink">{s.kod}</span>
            <span className="hidden text-ink-soft sm:inline">{s.tip}</span>
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.06em] text-ink">
                <span
                  className="size-[9px] flex-none rounded-[2px] border border-ink"
                  style={{ background: RENK[s.durum] }}
                  aria-hidden
                />
                {ETIKET[s.durum]}
              </span>
              <span className={`text-[10.5px] ${s.bayat ? "text-[#9a6a12]" : "text-[var(--ink-faint)]"}`}>
                {s.taze}
                {s.bayat ? " · bayat" : ""}
              </span>
            </span>
            <span className="text-right font-semibold text-ink">{s.fiyat}</span>
          </li>
        ))}
      </ul>

      <p className="border-t border-[var(--cizgi)] px-4 py-2.5 text-[10.5px] leading-relaxed text-[var(--ink-faint)] sm:px-5">
        Not: fiyat yalnız birim satırında tutulur; paylaşılan her sayfa bu satırı okur.
      </p>
    </div>
  );
}
