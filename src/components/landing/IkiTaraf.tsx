"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Bölüm 5: "İki taraf, aynı gerçek"
 * Ortada tek canlı daire kaydı; iki yandan bu kayda bağlanan iki yetki paneli.
 * "Fiyatı tek yerden değiştir" satırına hover/tap: ortadaki kartta fiyat yumuşakça
 * değişir, sağ panelde "paylaşım linki güncellendi" nabzı yanar (aynı veri, iki yetki).
 * Mobil: üstte kart, altında iki panel dikey. Veriler örnektir.
 */

const FIYATLAR = ["₺9,40M", "₺9,52M"] as const;

const SOL_SATIRLAR: { metin: string; etkilesim?: boolean }[] = [
  { metin: "Stoğu canlı yönet" },
  { metin: "Fiyatı tek yerden değiştir", etkilesim: true },
  { metin: "Görünürlüğü tahsis et" },
  { metin: "Opsiyonları takip et" },
  { metin: "Talebi gör" },
  { metin: "Markanı eski bilgiden koru" },
];

const SAG_SATIRLAR: { metin: string; nabizli?: boolean }[] = [
  { metin: "Yetkili projeleri tek ekranda gör" },
  { metin: "Güncel fiyatla paylaş", nabizli: true },
  { metin: "Telefon trafiğini azalt" },
  { metin: "Güvenle opsiyonla" },
  { metin: "Kazancını koru" },
  { metin: "Dağınık dosyadan kurtul" },
];

export function IkiTaraf() {
  const reduce = useReducedMotion();
  const [fiyatIdx, setFiyatIdx] = useState(0);
  const [nabza, setNabza] = useState(0); // her fiyat değişiminde artar, nabız + akış tetikler
  const [linkNabzi, setLinkNabzi] = useState(false);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  // unmount temizliği: bekleyen nabız zamanlayıcısını kapat
  useEffect(
    () => () => {
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
    },
    []
  );

  const fiyatDegistir = () => {
    if (linkNabzi) return; // nabız sürerken tekrar tetikleme
    setFiyatIdx((i) => 1 - i);
    setNabza((n) => n + 1);
    setLinkNabzi(true);
    zamanlayici.current = setTimeout(() => setLinkNabzi(false), 2000);
  };

  return (
    <div>
      <style>{`
        @keyframes ikiGit {
          from { left: -3px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          to { left: calc(100% - 5px); opacity: 0; }
        }
        .iki-git {
          position: absolute;
          top: -2.5px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-teal);
          animation: ikiGit 0.8s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .iki-git { animation: none; opacity: 0; }
        }
      `}</style>

      <div className="grid items-center gap-4 lg:grid-cols-[1fr_34px_minmax(260px,300px)_34px_1fr] lg:gap-0">
        {/* ---- SOL: proje sahibi yetki paneli ---- */}
        <div className="order-2 rounded-2xl border border-[var(--cizgi)] bg-white/70 p-4 shadow-[var(--golge-1)] lg:order-none lg:p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            <span className="size-2 rounded-[3px] bg-navy" aria-hidden />
            Proje sahibi
          </p>
          <ul className="space-y-0.5">
            {SOL_SATIRLAR.map((s) =>
              s.etkilesim ? (
                <li key={s.metin}>
                  <button
                    type="button"
                    onMouseEnter={fiyatDegistir}
                    onClick={fiyatDegistir}
                    className="group flex w-full items-center justify-between gap-2 rounded-[10px] border border-dashed border-[rgba(30,155,138,0.45)] bg-[var(--color-teal-soft)]/60 px-2.5 py-2 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-[var(--color-teal-soft)]"
                  >
                    {s.metin}
                    <span className="font-mono text-[9.5px] font-semibold text-[var(--color-teal-d)]">
                      dene →
                    </span>
                  </button>
                </li>
              ) : (
                <li
                  key={s.metin}
                  className="flex items-center gap-2 px-2.5 py-2 text-[13px] text-ink-soft"
                >
                  <span className="size-1 rounded-full bg-[var(--ink-faint)]" aria-hidden />
                  {s.metin}
                </li>
              )
            )}
          </ul>
        </div>

        {/* ---- SOL bağlantı hattı (yalnız masaüstü) ---- */}
        <div className="relative hidden h-px bg-gradient-to-r from-[rgba(19,49,75,0.28)] to-[rgba(30,155,138,0.45)] lg:block" aria-hidden>
          {linkNabzi ? <span key={`sol-${nabza}`} className="iki-git" /> : null}
        </div>

        {/* ---- ORTA: tek canlı daire kaydı ---- */}
        <div className="kart signal-top order-1 relative p-5 lg:order-none" style={{ "--_sig": "var(--color-green)" } as React.CSSProperties}>
          <span className="absolute right-3.5 top-3.5 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek
          </span>
          <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
            Tek canlı kayıt
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[14px] font-semibold text-ink">B-4-2 · 3+1</span>
            <span className="durum d-musait">
              <span className="nokta" />
              Müsait
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <span className="relative inline-block overflow-hidden">
              <motion.span
                key={fiyatIdx}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="block font-mono text-[30px] font-semibold leading-none text-ink"
              >
                {FIYATLAR[fiyatIdx]}
              </motion.span>
            </span>
            <span className="taze t-0">
              <span className="nokta nabiz" />
              şimdi
            </span>
          </div>
          <p className="mt-3 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-2.5 font-mono text-[9.5px] leading-relaxed text-[var(--ink-faint)]">
            Fiyat yalnız bu kayıtta tutulur. Paylaşımda hep buradaki canlı değer basılır.
          </p>
        </div>

        {/* ---- SAĞ bağlantı hattı (yalnız masaüstü) ---- */}
        <div className="relative hidden h-px bg-gradient-to-r from-[rgba(30,155,138,0.45)] to-[rgba(19,49,75,0.28)] lg:block" aria-hidden>
          {linkNabzi ? <span key={`sag-${nabza}`} className="iki-git" style={{ animationDelay: "0.35s" }} /> : null}
        </div>

        {/* ---- SAĞ: danışman yetki paneli ---- */}
        <div className="order-3 rounded-2xl border border-[var(--cizgi)] bg-white/70 p-4 shadow-[var(--golge-1)] lg:order-none lg:p-5">
          <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            <span className="size-2 rounded-[3px] bg-teal" aria-hidden />
            Gayrimenkul danışmanı
          </p>
          <ul className="space-y-0.5">
            {SAG_SATIRLAR.map((s) => (
              <li
                key={s.metin}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-2 text-[13px] text-ink-soft"
              >
                <span className="size-1 rounded-full bg-[var(--ink-faint)]" aria-hidden />
                {s.metin}
                {s.nabizli ? (
                  <motion.span
                    initial={false}
                    animate={
                      linkNabzi
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: reduce ? 1 : 0.92 }
                    }
                    transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-green-soft)] px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[#1f7d4c]"
                    aria-live="polite"
                  >
                    <span className={`size-1.5 rounded-full bg-green ${linkNabzi ? "nabiz" : ""}`} aria-hidden />
                    {linkNabzi ? "paylaşım linki güncellendi" : ""}
                  </motion.span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[10.5px] text-[var(--ink-faint)]">
        Aynı veri, iki yetki: soldaki satıra dokun, kart ve paylaşım linki birlikte güncellensin.
      </p>
    </div>
  );
}
