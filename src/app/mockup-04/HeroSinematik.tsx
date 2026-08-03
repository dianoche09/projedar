"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero · "MONUMENTAL KULE" (Mockup 04, sıfırdan yeni kompozisyon)
 * Tek ekran (h-svh): alçak açıdan 40 katlı kule full-bleed; başlık görselin
 * SOL gök boşluğunda, sabit tek hiyerarşi. TEK sakin dram: cephedeki tek
 * pencere etiketi (mono, nabızlı) 9 sn'lik döngüde bir kez amber "kilitli"ye
 * dönüp yeşile geri döner. Alt künye bandı: "teslime 4 ay · örnek görünüm".
 * prefers-reduced-motion: statik yeşil etiket, nabız yok. Tüm veriler örnektir.
 */

const RENK = { green: "#2fb36b", amber: "#e3a12c" } as const;

/* dram zamanlaması: 9 sn'lik döngü, ~2.6 sn amber kilit */
const MUSAIT_MS = 6400;
const KILIT_MS = 2600;

/* kahraman pencere: 1920x1088 kadraja % hizalı (kulenin sağ yüzü, orta kat) */
const PENCERE = { left: 64.8, top: 62.5, w: 2.5, h: 4.8 };

export function HeroSinematik() {
  const [kilitli, setKilitli] = useState(false);
  const [statik, setStatik] = useState<boolean | null>(null);

  /* açılışta hareket tercihi okunur; azaltılmışsa dram hiç başlamaz */
  useEffect(() => {
    const kimlik = requestAnimationFrame(() =>
      setStatik(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
    return () => cancelAnimationFrame(kimlik);
  }, []);

  useEffect(() => {
    if (statik !== false) return;
    const kimlik = setTimeout(
      () => setKilitli((k) => !k),
      kilitli ? KILIT_MS : MUSAIT_MS
    );
    return () => clearTimeout(kimlik);
  }, [kilitli, statik]);

  const renk = kilitli ? RENK.amber : RENK.green;

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#dfe7ef]"
      aria-label="Kırk katlı kule: her dairenin fiyatı ve durumu tek canlı kayıtta yaşar"
    >
      <style>{`
        /* sahne: 1920x1088 sabit kadraj; mobilde kule (x %62) viewport ortasına
           gelecek şekilde dikey kırpılır, masaüstünde tam kadraj görünür */
        .hk4-sahne {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          --sw: max(100vw, 176.5svh);
          width: var(--sw);
          aspect-ratio: 1920 / 1088;
          left: calc(50vw - var(--sw) * 0.62);
        }
        @media (min-width: 1024px) {
          .hk4-sahne { left: min(0px, calc(100vw - var(--sw))); }
        }
        @keyframes hk4Halka {
          0% { opacity: 0.75; transform: scale(0.85); }
          70%, 100% { opacity: 0; transform: scale(1.65); }
        }
        .hk4-halka { animation: hk4Halka 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hk4-halka { animation: none; opacity: 0; }
        }
      `}</style>

      {/* full-bleed kule fotoğrafı */}
      <div className="hk4-sahne">
        <Image
          src="/generated/shared/buyuk-kule-cephe.jpg"
          alt="Alçak açıdan çekilmiş, tepesinde iskelesi duran 40 katlı bir konut kulesi"
          fill
          priority
          sizes="250vw"
          className="object-cover"
        />

        {/* TEK pencere etiketi: çerçeve + nabız + mono veri (tek sakin dram) */}
        <div
          className="absolute z-10"
          style={{
            left: `${PENCERE.left}%`,
            top: `${PENCERE.top}%`,
            width: `${PENCERE.w}%`,
            height: `${PENCERE.h}%`,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-[4px] border-2 transition-colors duration-700"
            style={{
              borderColor: renk,
              boxShadow: `0 0 0 1px ${renk}33, 0 0 22px ${renk}55`,
            }}
          />
          {statik === false && (
            <span
              aria-hidden
              className="hk4-halka absolute inset-0 rounded-[4px] border-2"
              style={{ borderColor: renk }}
            />
          )}
          <span
            className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-[#ece9e2] transition-colors duration-700"
            style={{
              borderColor: `${renk}77`,
              background: "rgba(8,18,32,0.86)",
              boxShadow: `0 0 18px ${renk}2e`,
            }}
          >
            <span
              aria-hidden
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle transition-colors duration-700"
              style={{ background: renk }}
            />
            {kilitli ? "28-4 · ₺31,5M · kilitli" : "28-4 · ₺31,5M · müsait"}
          </span>
        </div>
      </div>

      {/* okunurluk: mobilde üstten, masaüstünde soldan açık perde (karartma yok) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[48svh] lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(238,243,248,0.94) 0%, rgba(238,243,248,0.6) 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-[46vw] lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(236,242,248,0.82) 0%, rgba(236,242,248,0.4) 60%, transparent 100%)",
        }}
      />

      {/* üst bar */}
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-5 pt-5 sm:px-8">
          <span className="font-display text-lg font-extrabold tracking-tight text-ink">
            Proje<span className="text-[#177f70]">dar</span>
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">
            Design Lab · Mockup 04
          </span>
        </div>
      </header>

      {/* başlık: sol gök boşluğunda, sabit tek hiyerarşi */}
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-[84px] sm:px-8 lg:left-[5vw] lg:right-auto lg:top-[22svh] lg:max-w-[500px] lg:px-0 lg:pt-0">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#177f70]">
          Canlı konut stoğu dağıtım ağı
        </p>
        <h1 className="font-display mt-3 max-w-[12ch] text-[38px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[52px] lg:text-[62px]">
          40 kat. Tek canlı kayıt.
        </h1>
        <p className="mt-4 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-soft sm:text-[16px]">
          Her dairenin fiyatı ve durumu tek kaynakta yaşar; paylaşılan her
          linkte o anki değer basılır.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/kayit?rol=uretici"
            className="inline-flex min-h-12 items-center rounded-full bg-[#1e9b8a] px-7 text-[14.5px] font-bold text-white transition-colors hover:bg-[#1a8676]"
          >
            Projemi ağa aç
          </Link>
          <Link
            href="/kayit?rol=emlakci"
            className="inline-flex min-h-12 items-center rounded-full border border-ink/30 px-6 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink/60"
          >
            Danışman olarak katıl
          </Link>
        </div>
      </div>

      {/* alt künye bandı */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/20 bg-[rgba(8,18,32,0.55)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-5 py-3.5 sm:px-8">
          <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Projedar · Monumental Kule
          </p>
          <p className="font-mono text-[11.5px] tracking-wide text-white/85">
            <span
              aria-hidden
              className="mr-1.5 inline-block size-2 rounded-full align-middle transition-colors duration-700"
              style={{ background: renk }}
            />
            teslime 4 ay · örnek görünüm
          </p>
        </div>
      </div>

      {/* ekran okuyucu: dramın o anki durumu */}
      <p className="sr-only" aria-live="polite">
        {kilitli
          ? "Örnek daire 28-4 şu an 48 saatliğine kilitli."
          : "Örnek daire 28-4 şu an müsait, fiyatı 31,5 milyon lira."}
      </p>
    </section>
  );
}
