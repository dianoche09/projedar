"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Canlı stok: dijital kartlar. Tazelik rozeti sayfaya girerken
 * fiziksel bir mühür gibi "basılır" (büyükten oturur, hafif döner).
 * Reduced-motion: mühür animasyonsuz, direkt görünür.
 */

type Birim = {
  kod: string;
  tip: string;
  fiyat: string;
  sinyal: string;
  durum: "musait" | "opsiyon" | "satildi";
  durumMetin: string;
  muhurMetin: string;
  muhurRenk: string;
  tazeMetin: string;
  cizik?: boolean;
};

const BIRIMLER: Birim[] = [
  {
    kod: "A-3-4", tip: "2+1 · 96 m²", fiyat: "₺7,9M", sinyal: "#2fb36b",
    durum: "musait", durumMetin: "Müsait",
    muhurMetin: "şimdi", muhurRenk: "#1f7d4c", tazeMetin: "az önce yazıldı",
  },
  {
    kod: "B-4-2", tip: "3+1 · 142 m²", fiyat: "₺9,4M", sinyal: "#e3a12c",
    durum: "opsiyon", durumMetin: "Opsiyonda",
    muhurMetin: "kilitli", muhurRenk: "#9a6a12", tazeMetin: "46 saat kaldı",
  },
  {
    kod: "C-1-2", tip: "1+1 · 64 m²", fiyat: "₺4,8M", sinyal: "#d15a4e",
    durum: "satildi", durumMetin: "Satıldı",
    muhurMetin: "kapandı", muhurRenk: "#a23f34", tazeMetin: "dün kapandı", cizik: true,
  },
];

const DURUM_STIL: Record<Birim["durum"], { zemin: string; renk: string; nokta: string }> = {
  musait: { zemin: "#e5f5ec", renk: "#1f7d4c", nokta: "#2fb36b" },
  opsiyon: { zemin: "#fbf0da", renk: "#9a6a12", nokta: "#e3a12c" },
  satildi: { zemin: "#f8e7e4", renk: "#a23f34", nokta: "#d15a4e" },
};

export function CanliStok() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {BIRIMLER.map((b, i) => (
        <BirimKarti key={b.kod} birim={b} gecikme={i * 0.14} />
      ))}
    </div>
  );
}

function BirimKarti({ birim, gecikme }: { birim: Birim; gecikme: number }) {
  const stil = DURUM_STIL[birim.durum];
  return (
    <div className="m5-dijital px-5 pb-4 pt-5" style={{ "--m5-sinyal": birim.sinyal } as CSSProperties}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[14px] font-semibold text-[#10243a]">{birim.kod}</span>
          <p className="mt-0.5 text-[12px] text-[#5a6577]">{birim.tip}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: stil.zemin, color: stil.renk }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: stil.nokta }} aria-hidden />
          {birim.durumMetin}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <span
          className={`font-mono text-[25px] font-semibold leading-none text-[#10243a] ${birim.cizik ? "line-through decoration-[#d15a4e] decoration-2 opacity-55" : ""}`}
        >
          {birim.fiyat}
        </span>
        <MuhurBas gecikme={gecikme} renk={birim.muhurRenk}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
          {birim.muhurMetin}
        </MuhurBas>
      </div>
      <p className="mt-3 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-2.5 font-mono text-[10px] text-[#7d8da0]">
        son yazış: {birim.tazeMetin}
      </p>
    </div>
  );
}

/* mühür basma hareketi: havadan iner, hafif dönerek oturur */
function MuhurBas({ gecikme, renk, children }: { gecikme: number; renk: string; children: ReactNode }) {
  const azalt = useReducedMotion();
  return (
    <motion.span
      className="m5-muhur"
      style={{ color: renk }}
      initial={azalt ? false : { opacity: 0, scale: 2.1, rotate: -20 }}
      whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
      viewport={{ once: true, amount: 0.7 }}
      transition={azalt ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 24, delay: gecikme }}
    >
      {children}
    </motion.span>
  );
}
