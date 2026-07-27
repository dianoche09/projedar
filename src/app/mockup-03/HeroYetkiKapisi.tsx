"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Hero: "Yetki Kapılı Şantiye Haritası" — fazlı şantiye hava çekimi üzerinde
 * 4 karelik otomatik koreografi (~15sn döngü):
 *  K1 kuruluş: bitmiş blokta CANLI künye + yeşil nabızlı birim noktası,
 *     çevrede taramalı 3 sektör alanı, kenarlarda 2 danışman düğümü.
 *  K2 akış: D1 ve D2 düğümlerinden aynı birim noktasına iki kesikli akış
 *     çizgisi ilerler; her yolun üstünde kendi sektör kapısı vardır.
 *  K3 yetki: D1 akışı kapısından geçip daireye varır, nokta amber + kilit.
 *     D2 akışı kapıda durur: kapı kırmızı mühürle kapanır, akış noktası
 *     sınırda titreyip söner, D2 düğümüne "erişim yok" rozeti düşer.
 *  K4 sonuç: yalnız yetkili sektörler sırayla aydınlanır, D2 sektörü gri
 *     kalır; köşede mono künye kartı özetler.
 * "tekrar" düğmesi ve danışman düğümüne tıklama koreografiyi K2'den başlatır.
 * prefers-reduced-motion: K4 statik gösterilir. Sahne katmanı dekoratiftir
 * (aria-hidden); bilgi hero metninde ve künye kartında vardır.
 */

/** Kare süreleri (ms). Toplam döngü ~15.6sn. */
const KARE_SURE: Record<number, number> = { 1: 2600, 2: 4200, 3: 4200, 4: 4600 };

export function HeroYetkiKapisi() {
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

  /** K2'den yeniden başlat: tekrar düğmesi + danışman düğümü tıklaması. */
  const tekrarla = () => {
    if (azalt) return;
    setDongu((d) => d + 1);
    setKare(2);
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes ykCiz { to { stroke-dashoffset: 0; } }
        .yk-ciz { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ykCiz 2.6s ease-in-out forwards; }
        @keyframes ykMars { to { stroke-dashoffset: -32; } }
        .yk-mars { stroke-dasharray: 7 9; animation: ykMars 1.3s linear infinite; }
        @keyframes ykHalka {
          0% { opacity: 0.85; transform: scale(0.5); }
          80% { opacity: 0; transform: scale(1.8); }
          100% { opacity: 0; }
        }
        .yk-halka { transform-box: fill-box; transform-origin: center; animation: ykHalka 2.2s ease-out infinite; }
        @keyframes ykTitre {
          0% { transform: translateX(0); opacity: 1; }
          12% { transform: translateX(-5px); }
          24% { transform: translateX(5px); }
          36% { transform: translateX(-4px); }
          48% { transform: translateX(4px); }
          60% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(0); opacity: 0; }
        }
        .yk-titre { transform-box: fill-box; animation: ykTitre 1.5s ease-out 0.5s forwards; }
        @keyframes ykAydinlan {
          0% { opacity: 0; }
          45% { opacity: 0.42; }
          100% { opacity: 0.2; }
        }
        .yk-aydinlan { animation: ykAydinlan 1.2s ease-out forwards; }
        .yk-nokta { fill: #2fb36b; transition: fill 0.5s ease 0.9s; }
        .yk-nokta--amber { fill: #e3a12c; }
        .yk-halka-cizgi { stroke: #7fd9c8; transition: stroke 0.5s ease 0.9s; }
        .yk-halka-cizgi--amber { stroke: #e3a12c; }
        .yk-gec { opacity: 0; transition: opacity 0.5s ease; }
        .yk-gec--acik { opacity: 1; }
        .yk-muhur { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 0.45s ease 0.6s; }
        .yk-muhur--kapali { stroke-dashoffset: 0; }
        @media (prefers-reduced-motion: reduce) {
          .yk-ciz, .yk-mars, .yk-halka, .yk-aydinlan { animation: none !important; }
          .yk-ciz { stroke-dashoffset: 0 !important; }
          .yk-aydinlan { opacity: 0.2 !important; }
          .yk-titre { animation: none !important; opacity: 0 !important; }
        }
      `}</style>

      {/* sahne: görsel + kartografi aynı kutuda, hizası bozulmadan kırpılır.
          Mobil: sol kenara sabit → bitmiş blok + tek kapı + tek sektör görünür. */}
      <div
        className="absolute inset-y-0 left-0 aspect-[1920/1088] min-w-full lg:left-1/2 lg:-translate-x-1/2"
        aria-hidden="true"
      >
        <Image
          src="/generated/shared/aday-4-hava-fazlar.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 180vw, 100vw"
          className="object-cover saturate-[0.82]"
        />

        {/* tahsis kartografisi */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1920 1088"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="ykTarama"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="12" height="12" fill="rgba(255,255,255,0.015)" />
              <rect width="1.8" height="12" fill="rgba(255,255,255,0.1)" />
            </pattern>
            {/* kesikli akışın kalemle çizilir gibi ilerlemesi: maske yolu dolu çizilir */}
            <mask id="ykMaskD1">
              {kare >= 2 && (
                <path
                  key={`m1-${dongu}`}
                  className="yk-ciz"
                  d="M 172 486 C 226 540, 248 558, 446 560"
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="10"
                />
              )}
            </mask>
            <mask id="ykMaskD2">
              {kare >= 2 && (
                <path
                  key={`m2-${dongu}`}
                  className="yk-ciz"
                  d="M 1788 560 C 1640 638, 1430 668, 1214 650"
                  pathLength={1}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="10"
                />
              )}
            </mask>
          </defs>

          {/* ── K1: sektör alanları (taramalı) ─────────────────────────── */}
          {/* SEKTÖR K1: bitmiş blok çevresi, D1'in alanı */}
          <rect x="120" y="640" width="570" height="350" rx="14" fill="url(#ykTarama)" stroke="rgba(127,217,200,0.6)" strokeWidth="2" strokeDasharray="10 8" />
          {kare >= 4 && (
            <rect key={`p1-${dongu}`} className="yk-aydinlan" x="120" y="640" width="570" height="350" rx="14" fill="#1e9b8a" opacity="0" />
          )}
          <rect x="134" y="654" width="300" height="34" rx="8" fill="rgba(10,27,44,0.82)" stroke="rgba(127,217,200,0.35)" />
          <text x="150" y="676" fill="#cfe6e1" fontSize="15" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
            SEKTÖR K1 · 4 DANIŞMAN
          </text>

          {/* SEKTÖR K2: orta iskele bloğunun sahası */}
          <rect x="750" y="706" width="470" height="320" rx="14" fill="url(#ykTarama)" stroke="rgba(127,217,200,0.45)" strokeWidth="2" strokeDasharray="10 8" />
          {kare >= 4 && (
            <rect key={`p2-${dongu}`} className="yk-aydinlan" style={{ animationDelay: "0.65s" }} x="750" y="706" width="470" height="320" rx="14" fill="#1e9b8a" opacity="0" />
          )}
          <rect x="764" y="720" width="300" height="34" rx="8" fill="rgba(10,27,44,0.82)" stroke="rgba(127,217,200,0.3)" />
          <text x="780" y="742" fill="#cfe6e1" fontSize="15" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
            SEKTÖR K2 · 3 DANIŞMAN
          </text>

          {/* SEKTÖR D4: D2'nin alanı, koreografi boyunca gri kalır */}
          <rect x="1440" y="690" width="420" height="330" rx="14" fill="url(#ykTarama)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeDasharray="6 6" />
          <rect x="1454" y="704" width="304" height="34" rx="8" fill="rgba(10,27,44,0.82)" stroke="rgba(255,255,255,0.18)" />
          <text x="1470" y="726" fill="rgba(255,255,255,0.75)" fontSize="15" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
            SEKTÖR D4 · 2 DANIŞMAN
          </text>

          {/* ── K1: bitmiş blok CANLI künyesi + birim noktası ──────────── */}
          <line x1="352" y1="360" x2="372" y2="416" stroke="rgba(127,217,200,0.5)" strokeWidth="1.5" />
          <rect x="252" y="318" width="236" height="42" rx="10" fill="rgba(10,27,44,0.85)" stroke="rgba(127,217,200,0.4)" />
          <circle className="yk-halka" cx="276" cy="339" r="9" fill="none" stroke="#2fb36b" strokeWidth="2" />
          <circle cx="276" cy="339" r="4.5" fill="#2fb36b" />
          <text x="292" y="345" fill="#ffffff" fontSize="16" fontWeight="600" letterSpacing="0.05em" fontFamily="var(--font-mono), monospace">
            CANLI · 142 birim
          </text>

          {/* birim noktası: K1 yeşil nabızlı → K3 amber + kilit */}
          <circle
            className={`yk-halka yk-halka-cizgi${kare >= 3 ? " yk-halka-cizgi--amber" : ""}`}
            cx="470"
            cy="560"
            r="20"
            fill="none"
            strokeWidth="2.5"
          />
          <circle className={`yk-nokta${kare >= 3 ? " yk-nokta--amber" : ""}`} cx="470" cy="560" r="9" stroke="#eef1f6" strokeWidth="2.5" />
          {/* kilit glifi: K3'te opsiyon kilidi düşer */}
          <g className={`yk-gec${kare >= 3 ? " yk-gec--acik" : ""}`} style={{ transitionDelay: kare >= 3 ? "1.1s" : "0s" }}>
            <rect x="452" y="500" width="36" height="26" rx="6" fill="#e3a12c" />
            <path d="M 462 500 v-6 a8 8 0 0 1 16 0 v6" fill="none" stroke="#e3a12c" strokeWidth="3.5" />
            <circle cx="470" cy="512" r="3.5" fill="#10243a" />
          </g>

          {/* ── K2: kesikli akış çizgileri (maske ile çizilir) ─────────── */}
          {kare >= 2 && (
            <g key={`akis-${dongu}`}>
              {/* D1 akışı: kapısından geçer, daireye varır */}
              <path
                className="yk-mars"
                d="M 172 486 C 226 540, 248 558, 446 560"
                fill="none"
                stroke="#7fd9c8"
                strokeWidth="2.5"
                mask="url(#ykMaskD1)"
              />
              {/* D2 akışı: yolu kapıda biter */}
              <path
                className="yk-mars"
                d="M 1788 560 C 1640 638, 1430 668, 1214 650"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2.5"
                mask="url(#ykMaskD2)"
                opacity={kare >= 3 ? 0.4 : 1}
                style={{ transition: "opacity 0.6s ease 0.9s" }}
              />
              {/* D2 akış noktası: sınırda iki kez titrer, söner */}
              {kare >= 3 && (
                <circle key={`t-${dongu}`} className="yk-titre" cx="1218" cy="650" r="6" fill="rgba(255,255,255,0.9)" />
              )}
            </g>
          )}

          {/* ── K2: sektör kapıları (her akışın kendi kapısı) ──────────── */}
          <g className={`yk-gec${kare >= 2 ? " yk-gec--acik" : ""}`}>
            {/* D1'in kapısı: açık */}
            <g transform="translate(300 552)">
              <line x1="-17" y1="13" x2="17" y2="13" stroke="rgba(127,217,200,0.8)" strokeWidth="2.5" />
              <path d="M -11 13 V -3 Q -11 -13 0 -13 Q 11 -13 11 -3 V 13" fill="rgba(10,27,44,0.55)" stroke="#7fd9c8" strokeWidth="3" />
            </g>
            {/* D2'nin kapısı: K3'te kırmızı mühürle kapanır */}
            <g transform="translate(1196 646)">
              <line x1="-17" y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />
              <path
                d="M -11 13 V -3 Q -11 -13 0 -13 Q 11 -13 11 -3 V 13"
                fill="rgba(10,27,44,0.55)"
                stroke={kare >= 3 ? "#d15a4e" : "rgba(255,255,255,0.8)"}
                strokeWidth="3"
                style={{ transition: "stroke 0.4s ease 0.6s" }}
              />
              <path
                className={`yk-muhur${kare >= 3 ? " yk-muhur--kapali" : ""}`}
                d="M -14 0 H 14"
                pathLength={1}
                fill="none"
                stroke="#d15a4e"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* ── K1: danışman düğümleri (tıklama → K2'den tekrar) ───────── */}
          <g className="pointer-events-auto cursor-pointer" onClick={tekrarla}>
            <circle cx="150" cy="470" r="18" fill="rgba(10,27,44,0.85)" stroke="#7fd9c8" strokeWidth="2.5" />
            <text x="150" y="476" textAnchor="middle" fill="#7fd9c8" fontSize="14" fontWeight="700" fontFamily="var(--font-mono), monospace">
              D1
            </text>
          </g>
          <g className="pointer-events-auto cursor-pointer" onClick={tekrarla}>
            <circle cx="1806" cy="556" r="18" fill="rgba(10,27,44,0.85)" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
            <text x="1806" y="562" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="14" fontWeight="700" fontFamily="var(--font-mono), monospace">
              D2
            </text>
            {/* K3: erişim yok mikro rozeti */}
            <g className={`yk-gec${kare >= 3 ? " yk-gec--acik" : ""}`} style={{ transitionDelay: kare >= 3 ? "1.6s" : "0s" }}>
              <rect x="1642" y="500" width="148" height="32" rx="8" fill="rgba(10,27,44,0.85)" stroke="rgba(209,90,78,0.6)" />
              <circle cx="1660" cy="516" r="4" fill="#d15a4e" />
              <text x="1672" y="521" fill="#eebbb4" fontSize="13.5" fontWeight="600" letterSpacing="0.05em" fontFamily="var(--font-mono), monospace">
                ERİŞİM YOK
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* navy duotone: hafif, altın saat sıcaklığı korunur */}
      <div className="pointer-events-none absolute inset-0 bg-[#13314b]/35 mix-blend-multiply" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,44,0.82)_0%,rgba(10,27,44,0.2)_42%,rgba(10,27,44,0.6)_100%)]" aria-hidden="true" />

      {/* K4: köşe künye kartı */}
      <div
        className={`absolute bottom-4 right-4 rounded-[10px] border border-[rgba(127,217,200,0.35)] bg-[rgba(10,27,44,0.85)] px-3.5 py-2.5 backdrop-blur-sm transition-opacity duration-500 sm:bottom-5 sm:right-5 ${
          kare >= 4 ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-mono text-[10.5px] font-semibold tracking-[0.05em] text-white/90 sm:text-[11.5px]">
          <span className="text-[#e3a12c]">1 kilit</span>
          <span className="text-white/40"> · </span>
          <span className="text-[#7fd9c8]">2 sektör güncellendi</span>
          <span className="text-white/40"> · </span>
          <span className="text-[#eebbb4]">1 erişim yok</span>
        </p>
      </div>

      {/* koreografi kontrolü: kare göstergesi + tekrar */}
      {!azalt && (
        <div className="absolute bottom-4 left-4 flex items-center gap-3 sm:bottom-5 sm:left-5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((k) => (
              <span
                key={k}
                className={`size-1.5 rounded-full transition-colors duration-300 ${
                  k === kare ? "bg-[#7fd9c8]" : "bg-white/25"
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
      )}
    </div>
  );
}
