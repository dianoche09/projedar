"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Satış Ofisi Camı (H6 photographic) · tone: luxury/restraint
 * Kurgu: satış ofisinin camından üç kuleli şantiyeye bakış. İnce pervaz
 * çizgileri sahneyi çerçeveler, köşede "SATIŞ OFİSİ" etiketi durur;
 * camın üzerine üç kâğıt durum kartı yapıştırılmıştır (A/B/C kule).
 * TEK dram: 8 sn'de bir bir kartın satış yüzdesi 1-2 puan yumuşakça artar.
 * prefers-reduced-motion: statik kare.
 */

type KuleKarti = {
  ad: string;
  not: string;
  renk: string; // sinyal rengi, sabit
  baslangic: number;
  tavan: number;
  egim: string;
};

const KULELER: KuleKarti[] = [
  { ad: "A KULE", not: "satıldı", renk: "#d15a4e", baslangic: 86, tavan: 94, egim: "-rotate-1" },
  { ad: "B KULE", not: "satıldı", renk: "#e3a12c", baslangic: 61, tavan: 72, egim: "rotate-[0.75deg]" },
  { ad: "C KULE", not: "satışta", renk: "#2fb36b", baslangic: 24, tavan: 38, egim: "-rotate-[1.5deg]" },
];

const DRAM_SURE = 8000;

export function HeroSatisOfisiCami() {
  const [yuzdeler, setYuzdeler] = useState<number[]>(KULELER.map((k) => k.baslangic));
  const siraRef = useRef(0);

  useEffect(() => {
    const azalt = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (azalt) return;
    const id = setInterval(() => {
      const hedef = siraRef.current % KULELER.length;
      const adim = 1 + (siraRef.current % 2); // 1-2 puan
      siraRef.current += 1;
      setYuzdeler((eski) => eski.map((y, i) => (i === hedef ? Math.min(KULELER[i].tavan, y + adim) : y)));
    }, DRAM_SURE);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#1c1712] text-white"
      aria-label="Satış ofisi camından şantiye görünümü: üç kulenin satış durumu camdaki canlı kartlarda"
    >
      <Image
        src="/generated/shared/buyuk-uc-kule-santiye.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[60%_46%]"
      />

      {/* okunurluk degradesi + cam yansıması */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,11,0.58) 0%, rgba(20,16,11,0.1) 34%, rgba(20,16,11,0.08) 58%, rgba(20,16,11,0.6) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(112deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 66%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      {/* pencere pervazı: ince çerçeve + bölme çizgileri + köşe etiketi */}
      <div aria-hidden className="pointer-events-none absolute inset-3 border border-white/40 sm:inset-5">
        <span className="absolute inset-y-0 left-[63%] hidden w-px bg-white/20 sm:block" />
        <span className="absolute inset-x-0 top-[55%] hidden h-px bg-white/15 sm:block" />
      </div>
      <p className="absolute right-7 top-7 z-10 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-white/75 sm:right-10 sm:top-10">
        Satış ofisi
      </p>

      {/* başlık: sol üst gök boşluğu */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-7 pt-20 sm:px-12 sm:pt-24">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">
            Büyük konut projeleri için
          </p>
          <h1 className="mt-3 max-w-[14ch] font-display text-[11vw] font-extrabold leading-[1.02] tracking-tight sm:text-[62px] lg:text-[78px]">
            Satış ofisi artık her yerde.
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-white/85 sm:text-[16.5px]">
            Panodaki kartlar değil: canlı kayıtlar. Her danışman aynı gerçeği görür.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-7 text-[15px] font-bold text-[#261c10] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Satış ofisinizi ağa taşıyın
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

      {/* cama yapıştırılmış üç kâğıt durum kartı */}
      <div className="absolute bottom-16 right-5 z-10 flex w-[212px] flex-col gap-3 sm:bottom-20 sm:right-12 sm:w-[236px]">
        {KULELER.map((k, i) => (
          <div
            key={k.ad}
            className={`relative rounded-[3px] bg-[#f7f2e7] px-4 pb-3.5 pt-3 text-[#261c10] ${k.egim}`}
            style={{ boxShadow: "0 12px 26px rgba(10,8,5,0.45)" }}
          >
            <span
              aria-hidden
              className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rotate-[-3deg] rounded-[1px] bg-white/55"
              style={{ backdropFilter: "blur(1px)" }}
            />
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] font-bold tracking-[0.16em]">{k.ad}</span>
              <span className="font-mono text-[14px] font-bold tabular-nums" style={{ color: k.renk }}>
                %{yuzdeler[i]}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(38,28,16,0.14)]">
              <div
                className="h-full rounded-full transition-[width] duration-[1400ms] ease-out"
                style={{ width: `${yuzdeler[i]}%`, background: k.renk }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7a5e]">
              {k.not}
            </p>
          </div>
        ))}
      </div>

      {/* alt köşe künyesi */}
      <p className="absolute bottom-7 left-7 z-10 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/55 sm:bottom-10 sm:left-12">
        camdaki kartlar canlı kayıttır · temsili örnek
      </p>
    </section>
  );
}
