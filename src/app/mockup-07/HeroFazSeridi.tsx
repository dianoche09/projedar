"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Hero: "Faz Şeridi" (inşaat zamanla yarış) — yatay 3 karelik sinema şeridi
 * üzerinde 4 karelik otomatik koreografi (~16sn döngü):
 *  K1 kuruluş: TEMEL (blueprint, CSS/SVG) → KABA YAPI (vinçli kule fotoğrafı)
 *     → TESLİM (altın saat rezidans). Şerit üstünde ilerleyen zaman imleci;
 *     her karenin altında eriyen mono stok sayacı (142 → 87 → 12).
 *  K2 talep: KABA YAPI karesinde daire etiketi belirir (B-4-2 · ₺24,5M);
 *     D1 (teal) ve D2 (gri) danışman çipleri şeridin iki ucundan kareye kayar.
 *  K3 kilit: D1 önce varır → etiket amber "kilitlendi", kare kenarına pirinç
 *     kilit rozeti oturur. D2 kareye ulaştığında kırmızı durdurma çizgisi +
 *     "erişim kapalı" düşer.
 *  K4 senkron: kilit bilgisi amber dalga ile şerit boyunca yayılır; TEMEL
 *     planındaki hücre ve TESLİM karesindeki izdüşüm de amber olur
 *     (geçmiş-gelecek senkron). İmleç ilerler, mono fiş özetler.
 * Mobil: şerit dikey akar (fazlar üst üste); çipler üst/alt uçtan gelir.
 * prefers-reduced-motion: K4 statik gösterilir. Sahne dekoratiftir
 * (aria-hidden); bilgi hero metninde ve fişte vardır.
 */

/** Kare süreleri (ms). Toplam döngü ~16sn. */
const KARE_SURE: Record<number, number> = { 1: 3000, 2: 4200, 3: 4200, 4: 4600 };

/** Zaman imlecinin ray üzerindeki konumu (aktif faz karesi). */
const IMLEC: Record<number, string> = { 1: "16.6%", 2: "50%", 3: "50%", 4: "83.4%" };

const RAY = [
  { konum: "16.6%", etiket: "temel · ay 0" },
  { konum: "50%", etiket: "kaba yapı · ay 14" },
  { konum: "83.4%", etiket: "teslim · ay 30" },
];

export function HeroFazSeridi() {
  const [kare, setKare] = useState(1);
  const [dongu, setDongu] = useState(0);
  const [azalt, setAzalt] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const uygula = () => {
      setAzalt(mq.matches);
      if (mq.matches) setKare(4);
    };
    uygula();
    mq.addEventListener("change", uygula);
    return () => mq.removeEventListener("change", uygula);
  }, []);

  useEffect(() => {
    if (azalt) return;
    const t = setTimeout(() => {
      if (kare >= 4) {
        setDongu((d) => d + 1);
        setKare(1);
      } else {
        setKare((k) => k + 1);
      }
    }, KARE_SURE[kare]);
    return () => clearTimeout(t);
  }, [kare, dongu, azalt]);

  const tekrarla = () => {
    if (azalt) return;
    setDongu((d) => d + 1);
    setKare(1);
  };

  /* K1'de çipler uçlara ışınlanır (geri sarma animasyonu olmasın) */
  const cipGecis = kare === 1 ? "transition-none" : "transition-[top,left] ease-in-out";
  const cipTemel =
    "absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-bold shadow-[0_6px_18px_rgba(0,0,0,0.45)] backdrop-blur-sm";

  return (
    <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-6">
      <style>{`
        @keyframes fsDalgaY { from { transform: translateY(-130%); } to { transform: translateY(320%); } }
        @keyframes fsDalgaX { from { transform: translateX(-130%); } to { transform: translateX(320%); } }
        .fs-dalga {
          position: absolute; left: 0; right: 0; top: 0; height: 34%;
          background: linear-gradient(180deg, transparent, rgba(227, 161, 44, 0.18), transparent);
          animation: fsDalgaY 1.5s ease-in-out forwards;
        }
        @media (min-width: 1024px) {
          .fs-dalga {
            top: 0; bottom: 0; height: auto; width: 34%; right: auto;
            background: linear-gradient(90deg, transparent, rgba(227, 161, 44, 0.18), transparent);
            animation-name: fsDalgaX;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .fs-dalga { animation: none; opacity: 0; }
        }
      `}</style>

      {/* ── zaman rayı: ilerleyen imleç ─────────────────────────────── */}
      <div className="relative mb-7 h-11" aria-hidden="true">
        <div className="absolute inset-x-[6%] top-[9px] h-px bg-white/15" />
        {RAY.map((r) => (
          <div key={r.etiket}>
            <span
              className="absolute top-[6px] size-[7px] -translate-x-1/2 rounded-full border border-white/40 bg-[#0a1826]"
              style={{ left: r.konum }}
            />
            <span
              className="absolute top-5 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:text-[10px]"
              style={{ left: r.konum }}
            >
              {r.etiket}
            </span>
          </div>
        ))}
        {/* pirinç imleç */}
        <span
          className="absolute top-[5px] size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#c9a35f] shadow-[0_0_10px_rgba(201,163,95,0.8)] transition-[left] duration-1000 ease-in-out"
          style={{ left: IMLEC[kare] }}
        />
      </div>

      {/* ── film şeridi: 3 faz karesi (mobilde dikey akar) ──────────── */}
      <div className="relative" aria-hidden="true">
        <div className="grid gap-3 lg:grid-cols-3">
          {/* KARE 1 · TEMEL: koyu blueprint (CSS/SVG) */}
          <div>
            <div className="komuta-grid relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1826] lg:aspect-[4/3]">
              <svg
                viewBox="0 0 400 250"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 h-full w-full"
              >
                {/* aks çizgileri */}
                <line x1="72" y1="0" x2="72" y2="250" stroke="rgba(127,217,200,0.14)" strokeWidth="1" />
                <line x1="328" y1="0" x2="328" y2="250" stroke="rgba(127,217,200,0.14)" strokeWidth="1" />
                <line x1="0" y1="48" x2="400" y2="48" stroke="rgba(127,217,200,0.14)" strokeWidth="1" />
                {/* temel taban planı */}
                <rect x="104" y="62" width="192" height="126" rx="4" fill="none" stroke="#7fd9c8" strokeWidth="1.6" strokeDasharray="9 7" opacity="0.85" />
                <rect x="122" y="78" width="156" height="94" rx="2" fill="rgba(127,217,200,0.05)" stroke="rgba(127,217,200,0.4)" strokeWidth="1" />
                {/* kazık noktaları */}
                {[140, 176, 212, 248].map((x) =>
                  [96, 124, 152].map((y) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                  ))
                )}
                {/* B-4-2 hücresi: K4'te amber senkron */}
                <rect
                  x="228"
                  y="112"
                  width="34"
                  height="26"
                  rx="3"
                  stroke={kare >= 4 ? "#e3a12c" : "rgba(255,255,255,0.35)"}
                  strokeWidth="1.6"
                  fill={kare >= 4 ? "rgba(227,161,44,0.3)" : "transparent"}
                  style={{ transition: "fill 0.6s ease 1.1s, stroke 0.6s ease 1.1s" }}
                />
                <text x="245" y="129" textAnchor="middle" fill={kare >= 4 ? "#f2c14e" : "rgba(255,255,255,0.5)"} fontSize="9" fontWeight="700" fontFamily="var(--font-mono), monospace" style={{ transition: "fill 0.6s ease 1.1s" }}>
                  B-4-2
                </text>
                {/* ölçü çizgisi */}
                <line x1="104" y1="212" x2="296" y2="212" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="104" y1="206" x2="104" y2="218" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <line x1="296" y1="206" x2="296" y2="218" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <text x="200" y="232" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10.5" letterSpacing="0.08em" fontFamily="var(--font-mono), monospace">
                  42 KAT · 142 BAĞIMSIZ BÖLÜM
                </text>
              </svg>
              <span className="absolute bottom-2.5 left-2.5 rounded-md border border-white/15 bg-[#0a1826]/85 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/80">
                Faz 1 · Temel
              </span>
            </div>
            <p className={`mt-2 text-center font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors duration-500 ${kare === 1 ? "text-white" : "text-white/45"}`}>
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green align-middle" />
              142 müsait
            </p>
          </div>

          {/* KARE 2 · KABA YAPI: vinçli lüks kule */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1826] lg:aspect-[4/3]">
              <Image
                src="/generated/mockup-07/luks-insaat-kule.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,38,0.35)_0%,rgba(10,24,38,0.05)_45%,rgba(10,24,38,0.55)_100%)]" />

              {/* daire etiketi: K2 belirir, K3 amber kilitlenir */}
              <div
                className={`absolute left-[56%] top-[26%] -translate-x-1/2 transition-all duration-500 ${
                  kare >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                <span
                  className={`block rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] font-bold tracking-[0.04em] shadow-lg backdrop-blur-sm transition-colors duration-500 ${
                    kare >= 3
                      ? "border-[#e3a12c]/70 bg-[#2b1f07]/85 text-[#f2c14e]"
                      : "border-white/25 bg-[#0a1826]/85 text-white"
                  }`}
                  style={{ transitionDelay: kare >= 3 ? "0.2s" : "0s" }}
                >
                  {kare >= 3 ? "B-4-2 · kilitlendi" : "B-4-2 · ₺24,5M"}
                </span>
                <span className="mx-auto block h-5 w-px bg-white/45" />
                <span
                  className={`mx-auto block size-2.5 rounded-full border-2 border-[#eef1f6] transition-colors duration-500 ${
                    kare >= 3 ? "bg-amber" : "bg-green"
                  }`}
                  style={{ transitionDelay: kare >= 3 ? "0.2s" : "0s" }}
                />
              </div>

              {/* pirinç kilit rozeti: K3'te kare kenarına oturur */}
              <span
                className={`absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full border border-[#e8d3a4] shadow-[0_4px_14px_rgba(0,0,0,0.45)] transition-all duration-500 ${
                  kare >= 3 ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                style={{
                  background: "linear-gradient(145deg, #dcbc7d, #a97f3f)",
                  transitionDelay: kare >= 3 ? "0.5s" : "0s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="#2a1f0d" />
                  <path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 v3" stroke="#2a1f0d" strokeWidth="2.6" fill="none" />
                </svg>
              </span>

              <span className="absolute bottom-2.5 left-2.5 rounded-md border border-white/15 bg-[#0a1826]/85 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/80">
                Faz 2 · Kaba yapı
              </span>
            </div>
            <p className={`mt-2 text-center font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors duration-500 ${kare === 2 || kare === 3 ? "text-white" : "text-white/45"}`}>
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green align-middle" />
              87 müsait
              <span className={`text-[#f2c14e] transition-opacity duration-500 ${kare >= 3 ? "opacity-100" : "opacity-0"}`}> · 1 kilit</span>
            </p>
          </div>

          {/* KARE 3 · TESLİM: altın saat rezidans */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/12 bg-[#0a1826] lg:aspect-[4/3]">
              <Image
                src="/generated/mockup-07/luks-bitmis-rezidans.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover saturate-[0.9]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,24,38,0.3)_0%,rgba(10,24,38,0.05)_45%,rgba(10,24,38,0.55)_100%)]" />

              {/* B-4-2 izdüşümü: K4'te amber olur (geçmiş-gelecek senkron) */}
              <div className="absolute left-[55%] top-[34%] -translate-x-1/2">
                <span
                  className={`mx-auto block size-8 rounded-full border-2 border-dashed transition-all duration-700 ${
                    kare >= 4
                      ? "border-[#e3a12c] shadow-[0_0_18px_rgba(227,161,44,0.55)]"
                      : "border-white/40"
                  }`}
                  style={{ transitionDelay: kare >= 4 ? "1.1s" : "0s" }}
                />
                <span
                  className={`mt-1.5 block whitespace-nowrap rounded-md border border-[#e3a12c]/70 bg-[#2b1f07]/85 px-2 py-1 font-mono text-[9.5px] font-bold tracking-[0.05em] text-[#f2c14e] backdrop-blur-sm transition-opacity duration-500 ${
                    kare >= 4 ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: kare >= 4 ? "1.4s" : "0s" }}
                >
                  B-4-2 · teslim izdüşümü
                </span>
              </div>

              <span className="absolute bottom-2.5 left-2.5 rounded-md border border-white/15 bg-[#0a1826]/85 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-white/80">
                Faz 3 · Teslim
              </span>
            </div>
            <p className={`mt-2 text-center font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors duration-500 ${kare === 4 ? "text-white" : "text-white/45"}`}>
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green align-middle" />
              12 müsait
            </p>
          </div>
        </div>

        {/* ── şerit üstü katman: çipler + durdurma çizgisi + dalga ──── */}
        <div className="pointer-events-none absolute inset-0">
          {/* K4: kilit bilgisi şerit boyunca amber dalga ile yayılır */}
          {kare >= 4 && !azalt && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div key={`dalga-${dongu}`} className="fs-dalga" />
            </div>
          )}

          {/* K3: kırmızı durdurma çizgisi + erişim kapalı */}
          <div
            className={`absolute inset-0 z-20 transition-opacity duration-500 ${kare >= 3 ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: kare >= 3 ? "2.1s" : "0s" }}
          >
            <span className="absolute inset-x-5 top-[65.5%] h-[2.5px] rounded-full bg-[#d15a4e] shadow-[0_0_12px_rgba(209,90,78,0.7)] lg:inset-x-auto lg:bottom-8 lg:left-[66.3%] lg:top-6 lg:h-auto lg:w-[2.5px]" />
            <span className="absolute right-5 top-[65.5%] -translate-y-[130%] rounded-md border border-[rgba(209,90,78,0.6)] bg-[#0a1826]/90 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#eebbb4] lg:left-[66.3%] lg:right-auto lg:top-9 lg:-translate-x-1/2 lg:translate-y-0">
              erişim kapalı
            </span>
          </div>

          {/* D1 çipi (teal): önce varır, kilidi o alır */}
          <span
            className={`${cipTemel} ${cipGecis} duration-[4000ms] border-[#5ecfba]/80 bg-[#0a1826]/90 text-[#7fd9c8] ${
              kare >= 2 ? "left-1/2 top-1/2" : "left-1/2 top-[2%] lg:left-[2%] lg:top-1/2"
            }`}
          >
            <span className="size-1.5 rounded-full bg-teal" />
            D1
          </span>

          {/* D2 çipi (gri): çizgide durur */}
          <span
            className={`${cipTemel} ${cipGecis} duration-[6400ms] border-white/35 bg-[#0a1826]/90 text-white/70 ${
              kare >= 2 ? "left-1/2 top-[70%] lg:left-[69.5%] lg:top-1/2" : "left-1/2 top-[98%] lg:left-[98%] lg:top-1/2"
            }`}
          >
            <span className="size-1.5 rounded-full bg-white/50" />
            D2
          </span>
        </div>
      </div>

      {/* ── alt bar: koreografi kontrolü + mono fiş ─────────────────── */}
      <div className="mt-5 flex min-h-10 flex-wrap items-center justify-between gap-3">
        {!azalt ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[1, 2, 3, 4].map((k) => (
                <span
                  key={k}
                  className={`size-1.5 rounded-full transition-colors duration-300 ${
                    k === kare ? "bg-[#c9a35f]" : "bg-white/25"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={tekrarla}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/85 backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            >
              tekrar
            </button>
          </div>
        ) : (
          <span />
        )}
        <p
          className={`rounded-[10px] border border-[rgba(201,163,95,0.4)] bg-[#0a1826]/85 px-3.5 py-2 font-mono text-[10.5px] font-semibold tracking-[0.05em] transition-opacity duration-500 sm:text-[11.5px] ${
            kare >= 4 ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: kare >= 4 ? "1.7s" : "0s" }}
        >
          <span className="text-[#dcc08c]">faz 2/3</span>
          <span className="text-white/40"> · </span>
          <span className="text-[#7fd9c8]">stok canlı</span>
          <span className="text-white/40"> · </span>
          <span className="text-white/85">ağ güncel</span>
        </p>
      </div>
    </div>
  );
}
