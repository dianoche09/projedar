"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Gece Silüeti (H6 atmospheric) · tone: luxury/restraint
 * Kurgu: gece kule cephesi tam ekran; pencere ızgarası doğal veri-grid.
 * Işık yanan pencere = teslim edilen daire (oturum iması yok, yalnız kayıt).
 * TEK dram: 7 sn'de bir karanlık bir pencere yumuşakça aydınlanır ve
 * köşe sayacı "teslim: 96/142" bir artar. prefers-reduced-motion: statik.
 */

const PENCERELER: { x: number; y: number }[] = [
  { x: 36, y: 30 },
  { x: 58, y: 42 },
  { x: 44, y: 56 },
  { x: 66, y: 26 },
  { x: 30, y: 46 },
  { x: 52, y: 66 },
  { x: 70, y: 52 },
  { x: 40, y: 38 },
  { x: 62, y: 62 },
  { x: 34, y: 64 },
  { x: 56, y: 24 },
  { x: 72, y: 38 },
];

const BASLANGIC_TESLIM = 96;
const TOPLAM_BIRIM = 142;
const STATIK_YANAN = 4;
const DRAM_SURE = 7000;

export function HeroGeceSilueti() {
  const [yanan, setYanan] = useState(0);

  useEffect(() => {
    const azalt = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (azalt) {
      const raf = requestAnimationFrame(() => setYanan(STATIK_YANAN));
      return () => cancelAnimationFrame(raf);
    }
    const id = setInterval(() => setYanan((y) => Math.min(PENCERELER.length, y + 1)), DRAM_SURE);
    return () => clearInterval(id);
  }, []);

  const teslim = Math.min(TOPLAM_BIRIM, BASLANGIC_TESLIM + yanan);

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#0b0b0d] text-[#ece7dd]"
      aria-label="Gece kule cephesi: ışığı yanan her pencere teslim edilen bir daire kaydıdır"
    >
      <Image
        src="/generated/mockup-02/hero-gece-cephe.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[55%_40%]"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,11,13,0.62) 0%, rgba(11,11,13,0.14) 32%, rgba(11,11,13,0.16) 60%, rgba(11,11,13,0.78) 100%)",
        }}
      />

      {/* yumuşakça yanan pencereler */}
      <div className="absolute inset-0" aria-hidden>
        {PENCERELER.map((p, i) => (
          <span
            key={`${p.x}-${p.y}`}
            className="absolute hidden -translate-x-1/2 -translate-y-1/2 rounded-[2px] transition-opacity duration-[1800ms] ease-out sm:block"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: 10,
              height: 15,
              background: "#ffd9a3",
              boxShadow: "0 0 18px 6px rgba(255,205,140,0.42)",
              opacity: i < yanan ? 0.92 : 0,
            }}
          />
        ))}
      </div>

      {/* başlık */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-[#c9a35a]">
            Büyük konut projeleri için
          </p>
          <h1 className="m9-baslik mt-3 max-w-[14ch] text-[11vw] font-extrabold text-white sm:text-[62px] lg:text-[78px]">
            Her ışık, kapanan bir satış.
          </h1>
          <p className="mt-4 max-w-[44ch] text-pretty text-[15px] leading-relaxed text-[rgba(236,231,221,0.85)] sm:text-[16.5px]">
            Satış ağı çalıştıkça proje dolar; stok tek kayıttan erir.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-7 text-[15px] font-bold text-[#131316] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi ağa açın
            </Link>
            <Link
              href="/kayit?rol=emlakci"
              className="group inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white/90 hover:text-white"
            >
              Danışman olarak katılın
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* alt künye: lejant + teslim sayacı */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-[rgba(11,11,13,0.55)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:px-10">
          <p className="flex items-center gap-2.5 font-mono text-[11.5px] tracking-wide text-[rgba(236,231,221,0.85)]">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2 rounded-[1px] bg-[#ffd9a3]"
              style={{ boxShadow: "0 0 10px 3px rgba(255,205,140,0.4)" }}
            />
            ışık yanan: teslim edilen daire
          </p>
          <p className="font-mono text-[12.5px] tracking-wide text-[rgba(236,231,221,0.85)]">
            teslim: <b className="font-bold tabular-nums text-white">{teslim}</b>
            <span className="tabular-nums">/{TOPLAM_BIRIM}</span> · temsili örnek
          </p>
        </div>
      </div>
    </section>
  );
}
