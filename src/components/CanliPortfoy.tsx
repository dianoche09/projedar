"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { UyelikPopup } from "@/components/UyelikPopup";

export type PortfoyProje = {
  src: string;
  ad: string;
  konum: string;
  musait: number;
  opsiyon: number;
  satildi: number;
  taze: string;
  sinyal: string;
  g: number;
  a: number;
  r: number;
  eski?: boolean;
};

/**
 * Anasayfa "Canlı portföy" kartları. Kapalı-devre (DEĞİŞMEZ #4): kart tıklanınca
 * gerçek stok yerine üyelik kapısı açılır — canlı veri yalnız üyeye görünür.
 */
export function CanliPortfoy({ items }: { items: PortfoyProje[] }) {
  const [uyelik, setUyelik] = useState(false);

  return (
    <>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (
          <Reveal key={p.ad} delay={i * 80}>
            <button
              type="button"
              onClick={() => setUyelik(true)}
              className="kart kart-3d group flex h-full w-full flex-col overflow-hidden p-0 text-left"
              aria-label={`${p.ad} — üye ol, canlı stoğu gör`}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={`${p.ad} projesi`} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" aria-hidden style={{ background: "linear-gradient(180deg, transparent 50%, rgba(8,20,34,0.55) 100%)" }} />
                <span className="absolute right-2.5 top-2.5 rounded-full bg-[rgba(30,155,138,0.92)] px-2 py-0.5 text-[10px] font-semibold text-white">✓ Doğrulanmış</span>
                <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-navy opacity-0 transition-opacity group-hover:opacity-100">Üye ol → canlı gör</span>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="font-display text-sm font-bold text-white drop-shadow">{p.ad}</div>
                  <div className="text-[11px] text-white/90">{p.konum}</div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <div className="mb-2.5 flex gap-4">
                  <div className="flex flex-col"><b className="font-mono text-[17px] font-semibold text-green">{p.musait}</b><span className="font-mono text-[9px] uppercase tracking-wide text-[var(--ink-faint)]">Müsait</span></div>
                  <div className="flex flex-col"><b className="font-mono text-[17px] font-semibold text-amber">{p.opsiyon}</b><span className="font-mono text-[9px] uppercase tracking-wide text-[var(--ink-faint)]">Opsiyon</span></div>
                  <div className="flex flex-col"><b className="font-mono text-[17px] font-semibold text-red">{p.satildi}</b><span className="font-mono text-[9px] uppercase tracking-wide text-[var(--ink-faint)]">Satıldı</span></div>
                </div>
                <div className="flex h-2 overflow-hidden rounded-md bg-[rgba(16,36,58,0.07)]">
                  <span className="block h-full bg-green" style={{ width: `${p.g}%` }} />
                  <span className="block h-full bg-amber" style={{ width: `${p.a}%` }} />
                  <span className="block h-full bg-red" style={{ width: `${p.r}%` }} />
                </div>
                <div className="mt-auto flex items-center justify-between pt-2.5">
                  <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${p.eski ? "text-[#9a6a12]" : "text-[#1f7d4c]"}`}>
                    <span className={`size-1.5 rounded-full ${p.eski ? "bg-amber" : "bg-green nabiz"}`} /> {p.taze}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-teal-d)]">{p.sinyal}</span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
      {uyelik ? <UyelikPopup onKapat={() => setUyelik(false)} /> : null}
    </>
  );
}
