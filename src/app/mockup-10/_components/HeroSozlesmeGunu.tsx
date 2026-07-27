"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Sözleşme Günü (H6 tactile-sade) · tone: luxury/restraint
 * Kurgu: üstten plan masası; planın üzerinde tek imza kalemi (fotoğrafta) ve
 * tek "REZERVE · 48 SA" damga izi (statik, mürekkep dokusu). Süs yok, asetat yok.
 * TEK dram: damganın yanında nabızlı mono geri sayım, saniye akar.
 * prefers-reduced-motion: statik "47:12", nabız yok.
 */

const BASLANGIC_SANIYE = 47 * 3600 + 12 * 60 + 33;

function sureBicimle(toplamSaniye: number): string {
  const sa = Math.floor(toplamSaniye / 3600);
  const dk = Math.floor((toplamSaniye % 3600) / 60);
  const sn = toplamSaniye % 60;
  return `${sa}:${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

export function HeroSozlesmeGunu() {
  const [kalan, setKalan] = useState(BASLANGIC_SANIYE);
  const [azalt, setAzalt] = useState(false);

  useEffect(() => {
    const statik = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (statik) {
      const raf = requestAnimationFrame(() => setAzalt(true));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => setKalan((k) => (k > 0 ? k - 1 : k)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#efe7d6] text-[#1b2a41]"
      aria-label="Sözleşme masası: plan üzerinde rezerve damgası ve işleyen 48 saatlik opsiyon sayacı"
    >
      <Image
        src="/generated/mockup-05/plan-masa-topdown.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[46%_50%]"
      />
      {/* antet boşluğu okunurluğu: üstte yumuşak fildişi perde */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,241,230,0.9) 0%, rgba(246,241,230,0.62) 26%, rgba(246,241,230,0) 52%, rgba(38,32,20,0.14) 100%)",
        }}
      />

      {/* başlık: antet boşluğu */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pt-20 sm:px-10 sm:pt-24">
          <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.24em] text-[#7d6027]">
            Sözleşme günü · canlı kayıt
          </p>
          <h1 className="m10-serif mt-3 max-w-[12ch] text-[13vw] font-bold leading-[1.02] tracking-tight sm:text-[68px] lg:text-[84px]">
            Söz değil. Kayıt.
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-[#41506a] sm:text-[16.5px]">
            Opsiyon damgası veritabanında: aynı daireye ikinci imza atılamaz.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-[#1b2a41] px-7 text-[15px] font-bold text-[#f8f4e9] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi kayda alın
            </Link>
            <Link
              href="/kayit?rol=emlakci"
              className="group inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-[#1b2a41] hover:text-[#7d6027]"
            >
              Danışman olarak katılın
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* tek damga izi + nabızlı geri sayım */}
      <div className="absolute left-1/2 top-[62%] z-10 -translate-x-1/2 sm:left-auto sm:right-[11%] sm:top-[47%] sm:translate-x-0">
        <div className="rotate-[-8deg]">
          <span
            className="inline-block whitespace-nowrap rounded-[6px] border-[3px] border-[#e3a12c] px-5 py-2.5 font-mono text-[15px] font-bold uppercase tracking-[0.22em] text-[#e3a12c] mix-blend-multiply sm:px-6 sm:text-[19px]"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(227,161,44,0.45)",
              WebkitMaskImage:
                "radial-gradient(135% 135% at 32% 28%, #000 50%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.18) 100%)",
              maskImage:
                "radial-gradient(135% 135% at 32% 28%, #000 50%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.18) 100%)",
              filter: "blur(0.3px)",
            }}
          >
            Rezerve · 48 sa
          </span>
        </div>
        <p className="mt-4 flex rotate-[-2deg] items-center gap-2 font-mono text-[12px] font-semibold tracking-[0.08em] text-[#1b2a41] sm:text-[13px]">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#e3a12c] motion-safe:animate-pulse"
          />
          B-4-2 · kilitli · <span className="tabular-nums">{azalt ? "47:12" : sureBicimle(kalan)}</span>
        </p>
      </div>

      {/* alt köşe künyesi */}
      <p className="absolute bottom-6 left-6 z-10 font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#f8f4e9] sm:bottom-8 sm:left-10">
        opsiyon kilidi veritabanında kurulur · temsili örnek
      </p>
    </section>
  );
}
