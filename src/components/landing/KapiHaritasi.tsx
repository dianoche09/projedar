"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Mockup 03 yıldız sahnesi: kontrollü satış ağı kartografisi.
 * Solda proje kütlesi (üstten plan lekesi, birimler durum renkli), ortada yetki
 * duvarı ve kapılar (fiziksel filtre), sağda danışman erişim alanları (sektörler).
 * Kullanıcı bir yetki profili seçer; veri akışı yalnız açık kapılardan geçer,
 * kapalı kapıda akış görünür şekilde durur (soluk kilit deseni + duran nokta).
 * Mobil: dikey kompozisyon + otomatik tur (tap ile devralınır). Veriler örnektir.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const RENK: Record<Durum, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

function birimDurum(i: number): Durum {
  let h = ((i + 7) * 2654435761) % 100;
  if (h < 0) h += 100;
  if (h < 58) return "musait";
  if (h < 80) return "opsiyon";
  return "satildi";
}

type BolgeId = "k1" | "m2" | "b2" | "d4";

const BOLGELER: {
  id: BolgeId;
  kapi: string;
  sektor: string;
  ad: string;
  danisman: number;
  y: number;
}[] = [
  { id: "k1", kapi: "KAPI 01", sektor: "SEKTÖR K1", ad: "Kuzey Ofis", danisman: 4, y: 128 },
  { id: "m2", kapi: "KAPI 02", sektor: "SEKTÖR M2", ad: "Merkez Ofis", danisman: 5, y: 232 },
  { id: "b2", kapi: "KAPI 03", sektor: "SEKTÖR B2", ad: "Bağımsız danışmanlar", danisman: 3, y: 336 },
  { id: "d4", kapi: "KAPI 04", sektor: "SEKTÖR D4", ad: "D. Aksoy, özel tahsis", danisman: 1, y: 440 },
];

const PROFILLER: { id: string; ad: string; acik: BolgeId[]; kim: string }[] = [
  { id: "tum", ad: "Tüm ağ", acik: ["k1", "m2", "b2", "d4"], kim: "13 danışman görüyor" },
  { id: "ofisler", ad: "Yalnız ofisler", acik: ["k1", "m2"], kim: "2 ofis, 9 danışman görüyor" },
  { id: "secili", ad: "Seçili danışmanlar", acik: ["b2"], kim: "yalnız 3 seçili danışman görüyor" },
  { id: "ozel", ad: "Özel tahsis: D. Aksoy", acik: ["d4"], kim: "yalnız D. Aksoy görüyor" },
];

/** A blok lekesi: 8×3, B blok lekesi: 3×5. Toplam 36 birim (plan görünümü). */
const BIRIMLER: { x: number; y: number }[] = [
  ...Array.from({ length: 24 }, (_, i) => ({ x: 56 + (i % 8) * 18, y: 158 + Math.floor(i / 8) * 18 })),
  ...Array.from({ length: 12 }, (_, i) => ({ x: 56 + (i % 3) * 18, y: 228 + Math.floor(i / 3) * 18 })),
];

/** Yetki duvarı gövde parçaları (kapı boşlukları hariç). */
const DUVAR_PARCALARI: [number, number][] = [
  [88, 108],
  [148, 212],
  [252, 316],
  [356, 420],
  [460, 480],
];

function KilitGlif({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <path
        d={`M${x - 4} ${y - 1} v-3.4 a4 4 0 0 1 8 0 v3.4`}
        fill="none"
        stroke="#7d8da0"
        strokeWidth="1.6"
      />
      <rect x={x - 5.5} y={y - 1} width="11" height="9" rx="2" fill="#7d8da0" />
    </g>
  );
}

export function KapiHaritasi() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  const [profilIdx, setProfilIdx] = useState(0);
  const [elle, setElle] = useState(false); // kullanıcı devraldı mı (otomatik tur durur)

  const profil = PROFILLER[profilIdx];
  const acikMi = (id: BolgeId) => profil.acik.includes(id);
  const acikSayi = profil.acik.length;

  // otomatik tur: görünürken profiller sırayla gezilir, ilk seçimde durur
  useEffect(() => {
    if (!inView || reduce || elle) return;
    const t = setInterval(() => setProfilIdx((i) => (i + 1) % PROFILLER.length), 3600);
    return () => clearInterval(t);
  }, [inView, reduce, elle]);

  const sec = (i: number) => {
    setElle(true);
    setProfilIdx(i);
  };

  return (
    <div ref={ref} className={inView ? "kh-canli" : undefined}>
      <style>{`
        @keyframes khAkis { to { stroke-dashoffset: -28; } }
        .kh-akis { stroke-dasharray: 6 8; }
        .kh-canli .kh-akis { animation: khAkis 1.4s linear infinite; }
        @keyframes khHalka {
          0% { opacity: 0.7; transform: scale(0.6); }
          80% { opacity: 0; transform: scale(1.6); }
          100% { opacity: 0; }
        }
        .kh-halka { transform-box: fill-box; transform-origin: center; }
        .kh-canli .kh-halka { animation: khHalka 2.2s ease-out infinite; }
        @keyframes khYatay { to { background-position: 22px 0; } }
        .kh-yatay {
          height: 3px;
          border-radius: 2px;
          background: repeating-linear-gradient(90deg, rgba(30, 155, 138, 0.6) 0 5px, transparent 5px 11px);
          background-size: 22px 3px;
        }
        .kh-canli .kh-yatay { animation: khYatay 1.1s linear infinite; }
        @keyframes khDikey { to { background-position: 0 22px; } }
        .kh-dikey {
          width: 2px;
          height: 24px;
          margin: 0 auto;
          background: repeating-linear-gradient(180deg, rgba(30, 155, 138, 0.55) 0 5px, transparent 5px 11px);
          background-size: 2px 22px;
        }
        .kh-canli .kh-dikey { animation: khDikey 1.2s linear infinite; }
        .kh-kilit-bar {
          background: repeating-linear-gradient(135deg, rgba(16, 36, 58, 0.06) 0 6px, rgba(16, 36, 58, 0.12) 6px 12px);
          border: 1px dashed rgba(16, 36, 58, 0.22);
        }
        @media (prefers-reduced-motion: reduce) {
          .kh-canli .kh-akis, .kh-canli .kh-halka, .kh-canli .kh-yatay, .kh-canli .kh-dikey {
            animation: none !important;
          }
        }
      `}</style>

      {/* ---- yetki profili seçici (gerçek etkileşim, iki görünümde ortak) ---- */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Yetki profili seçimi" className="flex flex-wrap gap-2">
          {PROFILLER.map((p, i) => {
            const aktif = i === profilIdx;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => sec(i)}
                className={`inline-flex items-center gap-2 rounded-[11px] border px-3 py-2 text-[12.5px] font-semibold transition-all ${
                  aktif
                    ? "border-teal bg-[var(--color-teal-soft)] text-ink shadow-[var(--golge-1)]"
                    : "border-[var(--cizgi-2)] bg-white text-ink-soft hover:border-[rgba(16,36,58,0.22)] hover:text-ink"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${aktif ? "bg-teal" : "bg-[var(--ink-faint)]"}`}
                  aria-hidden
                />
                {p.ad}
              </button>
            );
          })}
        </div>
        {!elle ? (
          <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            otomatik tur · seçince durur
          </span>
        ) : null}
      </div>

      {/* ============ MASAÜSTÜ: kartografi SVG ============ */}
      <div className="relative hidden rounded-[20px] border border-[var(--cizgi)] bg-white p-3 shadow-[var(--golge-2)] md:block">
        <span className="absolute right-4 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          örnek ağ
        </span>
        <svg
          viewBox="0 0 980 520"
          className="h-auto w-full"
          role="img"
          aria-label="Ağ haritası: proje kütlesinden doğan veri, yetki duvarındaki kapılardan geçer; yalnız seçili profildeki açık kapıların arkasındaki erişim alanları canlı akışı alır, kapalı kapılarda akış durur"
        >
          <defs>
            <pattern id="khKilitDesen" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="rgba(16,36,58,0.045)" />
              <rect width="3" height="8" fill="rgba(16,36,58,0.10)" />
            </pattern>
          </defs>

          {/* ince koordinat dokusu + harita künyesi */}
          <g aria-hidden="true">
            {[60, 130, 200, 270, 340, 410, 480].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="980" y2={y} stroke="rgba(16,36,58,0.03)" strokeWidth="1" />
            ))}
            {[140, 280, 420, 560, 700, 840].map((x) => (
              <line key={`v${x}`} x1={x} y1="52" x2={x} y2="500" stroke="rgba(16,36,58,0.03)" strokeWidth="1" />
            ))}
            <text x="8" y="512" fill="rgba(16,36,58,0.22)" fontSize="8" fontFamily="var(--font-mono), monospace">
              0,0
            </text>
            <text x="946" y="512" fill="rgba(16,36,58,0.22)" fontSize="8" fontFamily="var(--font-mono), monospace">
              980
            </text>
            <text x="8" y="20" fill="rgba(16,36,58,0.30)" fontSize="8" fontFamily="var(--font-mono), monospace" letterSpacing="0.1em">
              PLAN · DAĞITIM AĞI · 1:500
            </text>
          </g>

          {/* kolon başlıkları */}
          {(
            [
              [123, "PROJE KÜTLESİ"],
              [482, "YETKİ KAPILARI"],
              [772, "ERİŞİM ALANLARI"],
            ] as const
          ).map(([x, ad]) => (
            <text
              key={ad}
              x={x}
              y="42"
              textAnchor="middle"
              fill="#46586b"
              fontSize="10"
              fontWeight="700"
              letterSpacing="0.08em"
              fontFamily="var(--font-mono), monospace"
            >
              {ad}
            </text>
          ))}

          {/* ---- proje kütlesi: üstten plan lekesi ---- */}
          <text x="48" y="120" fill="#10243a" fontSize="10" fontWeight="700" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
            PROJE · ÇANKAYA VADİ
          </text>
          <text x="48" y="134" fill="#7d8da0" fontSize="8.5" fontFamily="var(--font-mono), monospace">
            36 birim · tek canlı kayıt
          </text>
          <rect x="48" y="150" width="150" height="70" rx="5" fill="#ffffff" stroke="rgba(16,36,58,0.28)" strokeWidth="1.4" />
          <rect x="48" y="220" width="70" height="90" rx="5" fill="#ffffff" stroke="rgba(16,36,58,0.28)" strokeWidth="1.4" />
          {BIRIMLER.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="14" height="14" rx="2.5" fill={RENK[birimDurum(i)]} opacity="0.9" />
          ))}

          {/* sıradaki proje: soluk leke (ağ büyür) */}
          <rect x="48" y="352" width="110" height="56" rx="5" fill="none" stroke="rgba(16,36,58,0.18)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text x="56" y="384" fill="rgba(16,36,58,0.30)" fontSize="8" fontFamily="var(--font-mono), monospace">
            PROJE 02 · sıraya alındı
          </text>

          {/* ---- veri doğuş noktası + gövde hattı ---- */}
          <line x1="198" y1="260" x2="221" y2="260" stroke="rgba(19,49,75,0.35)" strokeWidth="1.5" />
          <circle className="kh-halka" cx="230" cy="260" r="12" fill="none" stroke="#1e9b8a" strokeWidth="1.5" />
          <circle cx="230" cy="260" r="6.5" fill="#1e9b8a" />
          <text x="230" y="242" textAnchor="middle" fill="#1a8676" fontSize="8" fontWeight="700" letterSpacing="0.08em" fontFamily="var(--font-mono), monospace">
            VERİ DOĞAR
          </text>
          <path className="kh-akis" d="M237 260 H330" fill="none" stroke="#1e9b8a" strokeWidth="2" />
          <circle cx="330" cy="260" r="3.2" fill="#13314b" />

          {/* ---- kapı başına akış: açıksa duvarı geçer, kapalıysa kapıda durur ---- */}
          {BOLGELER.map((b) => {
            const acik = acikMi(b.id);
            return (
              <g key={b.id}>
                {acik ? (
                  <path
                    className="kh-akis"
                    d={`M330 260 C 390 260, 396 ${b.y}, 462 ${b.y} L 500 ${b.y} C 540 ${b.y}, 548 ${b.y}, 600 ${b.y}`}
                    fill="none"
                    stroke="#1e9b8a"
                    strokeWidth="2"
                    style={{ transition: "opacity 0.35s ease" }}
                  />
                ) : (
                  <>
                    <path
                      d={`M330 260 C 390 260, 396 ${b.y}, 456 ${b.y}`}
                      fill="none"
                      stroke="rgba(16,36,58,0.20)"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                      style={{ transition: "stroke 0.35s ease" }}
                    />
                    {/* geçemeyen akış: kapının önünde duran veri noktası */}
                    <circle cx="456" cy={b.y} r="3.5" fill="#46586b" opacity="0.8" />
                  </>
                )}
              </g>
            );
          })}

          {/* ---- yetki duvarı gövdesi ---- */}
          {DUVAR_PARCALARI.map(([y1, y2]) => (
            <rect
              key={y1}
              x="470"
              y={y1}
              width="24"
              height={y2 - y1}
              fill="rgba(19,49,75,0.09)"
              stroke="rgba(19,49,75,0.20)"
              strokeWidth="1"
            />
          ))}

          {/* ---- kapılar: açık boşluk ya da kilit desenli dolgu ---- */}
          {BOLGELER.map((b) => {
            const acik = acikMi(b.id);
            return (
              <g key={b.id}>
                <text
                  x="482"
                  y={b.y - 27}
                  textAnchor="middle"
                  fill="#7d8da0"
                  fontSize="7.5"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  fontFamily="var(--font-mono), monospace"
                >
                  {b.kapi}
                </text>
                {acik ? (
                  <g>
                    <line x1="470" y1={b.y - 20} x2="494" y2={b.y - 20} stroke="#1e9b8a" strokeWidth="2" />
                    <line x1="470" y1={b.y + 20} x2="494" y2={b.y + 20} stroke="#1e9b8a" strokeWidth="2" />
                  </g>
                ) : (
                  <g>
                    <rect
                      x="470"
                      y={b.y - 20}
                      width="24"
                      height="40"
                      fill="url(#khKilitDesen)"
                      stroke="rgba(16,36,58,0.28)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <KilitGlif x={482} y={b.y - 3} />
                  </g>
                )}
                <text
                  x="482"
                  y={b.y + 34}
                  textAnchor="middle"
                  fill={acik ? "#1a8676" : "#7d8da0"}
                  fontSize="7"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  fontFamily="var(--font-mono), monospace"
                >
                  {acik ? "AÇIK" : "KAPALI"}
                </text>
              </g>
            );
          })}

          {/* ---- erişim alanları (sektörler) ---- */}
          {BOLGELER.map((b) => {
            const acik = acikMi(b.id);
            return (
              <g key={b.id} style={{ opacity: acik ? 1 : 0.4, transition: "opacity 0.35s ease" }}>
                <rect
                  x="600"
                  y={b.y - 38}
                  width="344"
                  height="76"
                  rx="12"
                  fill="#ffffff"
                  stroke={acik ? "#1e9b8a" : "rgba(16,36,58,0.14)"}
                  strokeWidth={acik ? 1.4 : 1}
                  style={{ transition: "stroke 0.35s ease" }}
                />
                {!acik ? (
                  <rect x="600" y={b.y - 38} width="344" height="76" rx="12" fill="url(#khKilitDesen)" opacity="0.55" />
                ) : null}
                <text
                  x="616"
                  y={b.y - 17}
                  fill="#7d8da0"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  fontFamily="var(--font-mono), monospace"
                >
                  {b.sektor} · {b.danisman} DANIŞMAN
                </text>
                <text x="616" y={b.y + 3} fill="#10243a" fontSize="13" fontWeight="600">
                  {b.ad}
                </text>
                {Array.from({ length: b.danisman }, (_, i) => (
                  <circle
                    key={i}
                    cx={616 + i * 13}
                    cy={b.y + 21}
                    r="3.6"
                    fill={acik ? "#1e9b8a" : "#9aa7b4"}
                    style={{ transition: "fill 0.35s ease" }}
                  />
                ))}
                <text
                  x="928"
                  y={b.y - 15}
                  textAnchor="end"
                  fill={acik ? "#1a8676" : "#7d8da0"}
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  fontFamily="var(--font-mono), monospace"
                >
                  {acik ? "CANLI AKIŞ" : "ERİŞİM YOK"}
                </text>
                <text x="928" y={b.y + 24} textAnchor="end" fill="#46586b" fontSize="9.5" fontFamily="var(--font-mono), monospace">
                  {acik ? "canlı fiyatla paylaşır" : "veri kapıda durdu"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ============ MOBİL: dikey sadeleşmiş kartografi ============ */}
      <div className="md:hidden">
        {/* veri kaynağı */}
        <div className="relative rounded-[16px] border border-[var(--cizgi)] bg-white p-4 shadow-[var(--golge-1)]">
          <span className="absolute right-3 top-3 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek
          </span>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            Proje · Çankaya Vadi
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
              <span className="size-2 rounded-full bg-teal nabiz" aria-hidden />
              Veri doğar: tek canlı kayıt
            </span>
            <span className="font-mono text-[10px] text-[var(--ink-faint)]">36 birim</span>
          </div>
          <div className="mt-3 grid grid-cols-12 gap-1" aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className="aspect-square rounded-[3px]" style={{ background: RENK[birimDurum(i)], opacity: 0.9 }} />
            ))}
          </div>
        </div>

        <div className="kh-dikey mt-3" aria-hidden />

        {/* kapılar + erişim alanları */}
        <div className="mt-3 space-y-2">
          {BOLGELER.map((b) => {
            const acik = acikMi(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-[14px] border bg-white px-3.5 py-3 transition-all duration-300 ${
                  acik ? "border-[rgba(30,155,138,0.5)]" : "border-[var(--cizgi-2)] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--ink-faint)]">
                    {b.kapi} · {b.sektor}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
                      acik ? "text-[var(--color-teal-d)]" : "text-[var(--ink-faint)]"
                    }`}
                  >
                    {acik ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-ink">{b.ad}</span>
                  <span className="font-mono text-[10px] text-ink-soft">{b.danisman} danışman</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5">
                  {acik ? (
                    <span className="kh-yatay min-w-0 flex-1" aria-hidden />
                  ) : (
                    <span className="kh-kilit-bar h-2.5 min-w-0 flex-1 rounded-full" aria-hidden />
                  )}
                  <span className="font-mono text-[9.5px] text-[var(--ink-faint)]">
                    {acik ? "canlı veri akıyor" : "veri kapıda durdu"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- kim görüyor: durum satırı (iki görünümde ortak) ---- */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[13px] border border-[var(--cizgi)] bg-white px-4 py-3">
        <motion.span
          key={profil.id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-mono text-[11.5px] font-semibold text-ink"
          aria-live="polite"
        >
          Profil: {profil.ad} · {profil.kim}
        </motion.span>
        <span className="font-mono text-[10.5px] text-ink-soft">
          {acikSayi}/4 kapı açık · {4 - acikSayi} yol kapalı
        </span>
      </div>
      <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--ink-faint)]">
        Akış kuralı basittir: veri tek kayıtta doğar, yalnız açık kapıdan geçer. Kapalı kapının arkasındaki
        danışman bu projenin varlığını bile görmez.
      </p>
    </div>
  );
}
