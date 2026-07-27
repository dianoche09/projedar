"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LuksStok · Mockup 06 canlı stok bölümü (lüks varyant).
 * Rezidans birim listesi tek canlı kayıttan okunur: mono fiyat sütunu,
 * sabit sinyal rozetleri (yeşil müsait, amber opsiyon, kırmızı satıldı),
 * tazelik etiketi. Birkaç saniyede bir B-4-1 satırının fiyatı üretici
 * tarafından güncelleniyormuş gibi değişir; satır kısa bir pirinç parıltısı
 * alır, tazelik "şimdi" olur. prefers-reduced-motion: canlı tik çalışmaz.
 * TÜM VERİLER ÖRNEKTİR.
 */

type Durum = "musait" | "opsiyon" | "satildi";

type Birim = {
  kod: string;
  tip: string;
  fiyat: string;
  durum: Durum;
  taze: string;
};

const BIRIMLER: Birim[] = [
  { kod: "PH-1", tip: "6+2 penthouse", fiyat: "₺68,0M", durum: "musait", taze: "şimdi" },
  { kod: "B-4-2", tip: "5+1 çift cephe", fiyat: "₺24,5M", durum: "opsiyon", taze: "kilit · 48 sa" },
  { kod: "B-4-1", tip: "5+1 çift cephe", fiyat: "₺23,8M", durum: "musait", taze: "2 dk önce" },
  { kod: "A-9-1", tip: "4+1 marina cephe", fiyat: "₺18,4M", durum: "satildi", taze: "bugün" },
  { kod: "A-7-2", tip: "4+1 marina cephe", fiyat: "₺17,9M", durum: "musait", taze: "şimdi" },
  { kod: "C-2-1", tip: "4+1 bahçe teras", fiyat: "₺16,2M", durum: "musait", taze: "6 dk önce" },
];

const CANLI_FIYATLAR = ["₺23,8M", "₺24,1M"] as const;

const DURUM_ROZET: Record<Durum, { sinif: string; ad: string }> = {
  musait: { sinif: "d-musait", ad: "Müsait" },
  opsiyon: { sinif: "d-opsiyon", ad: "Opsiyon" },
  satildi: { sinif: "d-satildi", ad: "Satıldı" },
};

export function LuksStok() {
  const [fiyatIdx, setFiyatIdx] = useState(0);
  const [canli, setCanli] = useState(false);
  const [parilti, setParilti] = useState(false);
  const pariltiZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kare = requestAnimationFrame(() => setCanli(true));
    const zamanlayici = setInterval(() => {
      setFiyatIdx((i) => 1 - i);
      setParilti(true);
      pariltiZamanlayici.current = setTimeout(() => setParilti(false), 1400);
    }, 4600);
    return () => {
      cancelAnimationFrame(kare);
      clearInterval(zamanlayici);
      if (pariltiZamanlayici.current) clearTimeout(pariltiZamanlayici.current);
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border border-[rgba(168,130,63,0.28)] bg-white"
      style={{ boxShadow: "0 2px 6px rgba(33,26,14,0.05), 0 22px 50px rgba(33,26,14,0.10)" }}
    >
      <style>{`
        @keyframes lsParilti {
          0% { background-color: rgba(201, 162, 94, 0.22); }
          100% { background-color: transparent; }
        }
        .ls-parilti { animation: lsParilti 1.4s ease-out both; }
        @keyframes lsFiyat {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: none; }
        }
        .ls-fiyat { animation: lsFiyat 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ls-parilti, .ls-fiyat { animation: none; }
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(168,130,63,0.18)] bg-[#faf7f0] px-5 py-3.5 sm:px-6">
        <span className="flex items-center gap-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <span className={`size-1.5 rounded-full bg-green ${canli ? "nabiz" : ""}`} aria-hidden />
          Marina Ridge Rezidans · canlı liste
        </span>
        <span className="rounded-md border border-[rgba(168,130,63,0.3)] bg-white px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8a6d33]">
          örnek veri
        </span>
      </div>

      <ul>
        {BIRIMLER.map((b) => {
          const canliSatir = b.kod === "B-4-1";
          const rozet = DURUM_ROZET[b.durum];
          return (
            <li
              key={b.kod}
              className={`flex items-center gap-3 border-b border-[rgba(33,26,14,0.06)] px-5 py-3.5 last:border-b-0 sm:gap-4 sm:px-6 ${
                canliSatir && parilti ? "ls-parilti" : ""
              }`}
            >
              <span className="w-[52px] flex-none font-mono text-[12.5px] font-bold text-ink sm:w-[60px]">
                {b.kod}
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-[13px] text-ink-soft sm:block">
                {b.tip}
              </span>
              <span className="w-[64px] flex-none text-right sm:w-[76px]">
                {canliSatir ? (
                  <span key={fiyatIdx} className="ls-fiyat inline-block font-mono text-[13.5px] font-semibold text-ink">
                    {CANLI_FIYATLAR[fiyatIdx]}
                  </span>
                ) : (
                  <span className="font-mono text-[13.5px] font-semibold text-ink">{b.fiyat}</span>
                )}
              </span>
              <span className={`durum ${rozet.sinif} w-[76px] flex-none justify-center`}>
                <span className="nokta" aria-hidden />
                {rozet.ad}
              </span>
              <span className="hidden w-[92px] flex-none text-right font-mono text-[10px] text-[var(--ink-faint)] sm:block">
                {canliSatir && canli ? "şimdi" : b.taze}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-[rgba(168,130,63,0.18)] bg-[#faf7f0] px-5 py-3 font-mono text-[10px] leading-relaxed text-[var(--ink-faint)] sm:px-6">
        Fiyat yalnız bu kayıtta yaşar. Üretici bir kez günceller, tahsisli ağdaki her ekran ve her paylaşım bağlantısı aynı saniye yeni değeri okur.
      </p>
    </div>
  );
}
