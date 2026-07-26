"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

/**
 * Final CTA · bina görseli geri döner, bu kez tek kule değil bütün mahalle:
 * ağ büyümüş hissi. Kulelerin üzerinde nabız atan sinyal noktaları.
 * Görsel lazy yüklenir; reduced-motion'da noktalar statik.
 */

const NOKTALAR: { x: string; y: string; renk: string; gecikme: number }[] = [
  { x: "24%", y: "56%", renk: "#2fb36b", gecikme: 0 },
  { x: "37%", y: "50%", renk: "#3fbfae", gecikme: 0.6 },
  { x: "50%", y: "48%", renk: "#2fb36b", gecikme: 1.1 },
  { x: "61%", y: "52%", renk: "#e3a12c", gecikme: 1.7 },
  { x: "76%", y: "47%", renk: "#2fb36b", gecikme: 2.3 },
  { x: "88%", y: "58%", renk: "#3fbfae", gecikme: 2.9 },
];

export function FinalCta() {
  const azHareket = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-white/[0.06]">
      <style>{`
        @keyframes ppAgNabiz {
          0% { box-shadow: 0 0 0 0 var(--pp-renk); opacity: 1; }
          70% { box-shadow: 0 0 0 10px transparent; opacity: 0.85; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
        }
        .pp-ag-nokta { animation: ppAgNabiz 3.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pp-ag-nokta { animation: none; } }
      `}</style>

      <div className="relative min-h-[86svh]">
        <Image
          src="/generated/mockup-04/final-ag.jpg"
          alt="Gece sisinde ışıkları yanan birden çok konut kulesi, büyüyen bir ağ"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* okunurluk perdesi */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #081220 0%, rgba(8,18,32,0.42) 30%, rgba(8,18,32,0.30) 55%, rgba(8,18,32,0.9) 100%)",
          }}
        />

        {/* kulelerin üzerinde ağ sinyalleri */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {NOKTALAR.map((n, i) => (
            <span
              key={i}
              className="pp-ag-nokta absolute size-2 rounded-full"
              style={
                {
                  left: n.x,
                  top: n.y,
                  background: n.renk,
                  animationDelay: `${n.gecikme}s`,
                  "--pp-renk": `${n.renk}77`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="relative mx-auto flex min-h-[86svh] w-full max-w-6xl flex-col items-center justify-center px-5 py-24 text-center">
          <motion.div
            initial={azHareket ? false : { opacity: 0, y: 28 }}
            whileInView={azHareket ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-2xl flex-col items-center"
          >
            <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">
              Ağ büyüyor
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-[#ece9e2] sm:text-5xl">
              Her akşam biraz daha fazla ışık bu ağa bağlanıyor.
            </h2>
            <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/65">
              Stoğunuz yaşayan bir ağda dolaşsın: doğru danışmanda, doğru
              fiyatla, her zaman taze. Projeniz de bu ışıklardan biri olsun.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kayit"
                className="inline-flex h-12 items-center justify-center rounded-[13px] bg-[#1e9b8a] px-7 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a8676]"
              >
                Projemi canlı ağa aç
              </Link>
              <Link
                href="/kayit"
                className="inline-flex h-12 items-center justify-center rounded-[13px] border border-white/30 px-7 text-[14px] font-semibold text-[#ece9e2] transition-colors hover:border-white/60"
              >
                Danışman olarak katıl
              </Link>
            </div>
            <p className="mono mt-7 text-[10.5px] uppercase tracking-[0.16em] text-white/35">
              kurulum concierge ile · komisyon yok · erken dönem danışman hesabı ücretsiz
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
