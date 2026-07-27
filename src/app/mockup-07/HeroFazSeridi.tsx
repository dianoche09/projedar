"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Zaman Akışı (H6 photographic, 3-faz crossfade) · tone: luxury/restraint
 * Kullanıcı fikri: büyük proje inşaattan teslime video gibi akar, bloklar faz faz satılır.
 * Aynı sahnenin 3 gerçek fazı (nano-banana-2 edit ile tutarlı) üst üste crossfade olur;
 * kuleler üzerindeki satış noktaları fazla birlikte yeşilden kırmızıya döner, stok sayacı erir,
 * teslim karesinde "PROJE TÜKENDİ" rozeti düşer. Başlık sabittir: sahne değişir, söz değişmez.
 * prefers-reduced-motion: statik teslim karesi. pre-emit critique: P5 H5 E4 S5 R4 V5
 */

type Faz = { gorsel: string; etiket: string; ay: string; musait: number; satilmisOran: number };

const FAZLAR: Faz[] = [
  { gorsel: "/generated/mockup-07/faz-1-kaba.jpg", etiket: "KABA YAPI", ay: "AY 8", musait: 121, satilmisOran: 0.15 },
  { gorsel: "/generated/mockup-07/faz-2-karma.jpg", etiket: "İNCE İŞLER", ay: "AY 19", musait: 58, satilmisOran: 0.6 },
  { gorsel: "/generated/mockup-07/faz-3-tamam.jpg", etiket: "TESLİM", ay: "AY 30", musait: 6, satilmisOran: 0.96 },
];

/** 3 kule üzerinde satış noktaları (% koordinat, fotoğraf kompozisyonuna hizalı).
 *  `sira` satılma sırası: oran arttıkça küçük sıralılar kırmızıya döner. */
const NOKTALAR: { x: number; y: number; sira: number }[] = [
  { x: 20, y: 30, sira: 2 }, { x: 23, y: 40, sira: 5 }, { x: 19, y: 52, sira: 9 }, { x: 22, y: 63, sira: 13 }, { x: 20, y: 74, sira: 1 },
  { x: 47, y: 36, sira: 7 }, { x: 50, y: 46, sira: 3 }, { x: 48, y: 58, sira: 11 }, { x: 51, y: 68, sira: 15 }, { x: 49, y: 77, sira: 6 },
  { x: 74, y: 28, sira: 10 }, { x: 77, y: 39, sira: 4 }, { x: 75, y: 51, sira: 14 }, { x: 78, y: 62, sira: 8 }, { x: 76, y: 73, sira: 12 },
];

const ADIM_SURE = 5200;

export function HeroFazSeridi() {
  // adım 0-1-2 = fazlar · adım 3 = teslim karesinde "tükendi" tutuşu
  const [adim, setAdim] = useState(0);
  const [oynuyor, setOynuyor] = useState(true);
  const azaltRef = useRef(false);

  const faz = Math.min(adim, FAZLAR.length - 1);
  const tukendi = adim === 3;
  const aktif = FAZLAR[faz];

  useEffect(() => {
    const azalt = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    azaltRef.current = azalt;
    if (!azalt) return;
    const raf = requestAnimationFrame(() => {
      setAdim(3);
      setOynuyor(false);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!oynuyor) return;
    const id = setInterval(() => setAdim((a) => (a + 1) % 4), ADIM_SURE);
    return () => clearInterval(id);
  }, [oynuyor]);

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-ink text-white"
      aria-label="Proje zaman akışı: inşaattan teslime, satışlar faz faz tükenir"
    >
      {/* 3 faz görseli üst üste; aktif görünür (video hissi: yavaş crossfade + hafif ölçek) */}
      {FAZLAR.map((f, i) => (
        <div
          key={f.gorsel}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
          style={{ opacity: i === faz ? 1 : 0 }}
          aria-hidden={i !== faz}
        >
          <Image
            src={f.gorsel}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-[50%_38%] transition-transform duration-[6000ms] ease-linear"
            style={{ transform: i === faz ? "scale(1.045)" : "scale(1.0)" }}
          />
        </div>
      ))}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(11,20,32,0.42) 0%, rgba(11,20,32,0.05) 30%, rgba(11,20,32,0.05) 55%, rgba(11,20,32,0.72) 100%)" }}
      />

      {/* satış noktaları: faz ilerledikçe yeşil → kırmızı */}
      <div className="absolute inset-0 hidden sm:block" aria-hidden>
        {NOKTALAR.map((n) => {
          const satildi = n.sira / NOKTALAR.length <= (tukendi ? 1 : aktif.satilmisOran);
          return (
            <span
              key={`${n.x}-${n.y}`}
              className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/70 transition-colors duration-1000"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                background: satildi ? "var(--color-red, #d15a4e)" : "var(--color-green, #2fb36b)",
                boxShadow: "0 1px 6px rgba(8,16,28,0.5)",
              }}
            />
          );
        })}
      </div>

      {/* başlık: sabit tek hiyerarşi */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">Büyük konut projeleri için</p>
          <h1 className="mt-3 max-w-[14ch] font-display text-[11vw] font-extrabold leading-[1.0] tracking-tight sm:text-[64px] lg:text-[80px]">
            Bloklar yükselir. Stok erir.
          </h1>
          <p className="mt-4 max-w-[44ch] text-pretty text-[15px] leading-relaxed text-white/85 sm:text-[16.5px]">
            İnşaat ilerlerken satış ağınız çalışır: her opsiyon anında kilitlenir, her fiyat canlı basılır, teslim gününe stok kalmaz.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-7 text-[15px] font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi ağa açın
            </Link>
            <Link href="/kayit?rol=emlakci" className="group inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white/90 hover:text-white">
              Danışman olarak katılın
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TÜKENDİ anı */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] z-10 -translate-x-1/2 transition-all duration-700"
        style={{ opacity: tukendi ? 1 : 0, transform: `translateX(-50%) scale(${tukendi ? 1 : 0.92})` }}
        aria-hidden={!tukendi}
      >
        <div className="rounded-full border border-white/40 bg-[rgba(11,20,32,0.68)] px-7 py-3 backdrop-blur-sm">
          <p className="font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-white">Proje tükendi · teslim tamam</p>
        </div>
      </div>

      {/* alt künye: faz noktaları + eriyen stok + oynat/duraklat */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-[rgba(11,20,32,0.5)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {FAZLAR.map((f, i) => (
                <button
                  key={f.etiket}
                  type="button"
                  onClick={() => setAdim(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === faz && !tukendi ? "w-7 bg-white" : "w-3 bg-white/35 hover:bg-white/60"}`}
                  aria-label={`Faz ${i + 1}: ${f.etiket}`}
                />
              ))}
            </div>
            <p className="font-mono text-[12px] font-semibold tracking-wider text-white/85">
              {tukendi ? "TESLİM · AY 30" : `${aktif.etiket} · ${aktif.ay}`}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-[12.5px] tracking-wide text-white/85">
              <span
                className="mr-1.5 inline-block size-2 rounded-full align-middle"
                style={{ background: tukendi ? "var(--color-red, #d15a4e)" : "var(--color-green, #2fb36b)" }}
              />
              müsait: <b className="font-bold tabular-nums text-white">{tukendi ? 0 : aktif.musait}</b> / 142 · örnek akış
            </p>
            <button
              type="button"
              onClick={() => setOynuyor((o) => (azaltRef.current ? false : !o))}
              className="min-h-9 rounded-full border border-white/30 px-4 font-mono text-[11.5px] font-semibold text-white/90 transition-colors hover:border-white/60 hover:bg-white/10"
            >
              {oynuyor ? "duraklat" : "oynat"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
