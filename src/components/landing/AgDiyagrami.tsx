"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * Bölüm 4: "Tek proje yazılımı değil. Satış ağı."
 * Soldan sağa akış diyagramı: geliştirici firmalar → canlı proje havuzu →
 * yetkili danışmanlar → müşteri paylaşım bağlantıları.
 * Danışman düğümüne hover: yalnız ona tahsisli çizgi/birimler parlar (tahsis görünür olur).
 * Mobil: dikey akış + otomatik sırayla vurgulama. Tüm veriler örnektir.
 */

type NoktaDurum = "musait" | "opsiyon" | "satildi";

const RENK: Record<NoktaDurum, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

function noktaDurum(i: number): NoktaDurum {
  let h = ((i + 3) * 2654435761) % 100;
  if (h < 0) h += 100;
  if (h < 56) return "musait";
  if (h < 78) return "opsiyon";
  return "satildi";
}

const FIRMALAR = [
  { ad: "Atlas Yapı", y: 140, havuzY: 150 },
  { ad: "Vadi İnşaat", y: 215, havuzY: 220 },
  { ad: "Kule GYO", y: 290, havuzY: 290 },
];

const DANISMANLAR = [
  { ad: "A. Yılmaz", y: 90, birimler: [2, 3, 8] },
  { ad: "D. Aksoy", y: 165, birimler: [6, 12, 13, 18] },
  { ad: "M. Kaya", y: 240, birimler: [21, 26, 27] },
  { ad: "S. Demir", y: 315, birimler: [32, 33, 38] },
  { ad: "E. Çetin", y: 390, birimler: [40, 45, 46] },
];

const NOKTA_SAYISI = 48;
const noktaX = (i: number) => 330 + (i % 6) * 28;
const noktaY = (i: number) => 132 + Math.floor(i / 6) * 28;

/** i indeksli birim hangi danışmana tahsisli (yoksa -1) */
function tahsisSahibi(i: number): number {
  return DANISMANLAR.findIndex((d) => d.birimler.includes(i));
}

export function AgDiyagrami() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const reduce = useReducedMotion();

  // masaüstü: hover ile vurgulanan danışman
  const [aktif, setAktif] = useState<number | null>(null);
  // mobil: otomatik sırayla vurgulama
  const [oto, setOto] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setOto((a) => (a + 1) % DANISMANLAR.length), 2600);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <div ref={ref} className={inView ? "ag-canli" : undefined}>
      <style>{`
        @keyframes agAkis { to { stroke-dashoffset: -28; } }
        .ag-hat { stroke-dasharray: 5 9; }
        .ag-canli .ag-hat { animation: agAkis 1.5s linear infinite; }
        @keyframes agDikey { to { background-position: 0 22px; } }
        .ag-dikey {
          width: 2px;
          height: 26px;
          margin: 0 auto;
          background: repeating-linear-gradient(180deg, rgba(30, 155, 138, 0.55) 0 5px, transparent 5px 11px);
          background-size: 2px 22px;
        }
        .ag-canli .ag-dikey { animation: agDikey 1.2s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ag-canli .ag-hat, .ag-canli .ag-dikey { animation: none !important; }
        }
      `}</style>

      {/* ============ MASAÜSTÜ: yatay SVG akış ============ */}
      <div className="relative hidden md:block">
        <span className="absolute right-0 top-0 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          örnek ağ
        </span>
        <svg
          viewBox="0 0 980 430"
          className="h-auto w-full"
          role="img"
          aria-label="Akış diyagramı: geliştirici firmalar stoğu canlı proje havuzuna verir, her yetkili danışman havuzdan yalnız kendisine tahsisli birimleri görür ve müşteriye canlı fiyatlı bağlantı paylaşır"
        >
          {/* ince koordinat/mimari doku */}
          <g aria-hidden="true">
            {[60, 130, 200, 270, 340, 410].map((y) => (
              <line key={y} x1="0" y1={y} x2="980" y2={y} stroke="rgba(16,36,58,0.035)" strokeWidth="1" />
            ))}
            <text x="6" y="424" fill="rgba(16,36,58,0.22)" fontSize="8" fontFamily="var(--font-mono), monospace">
              0,0
            </text>
            <text x="948" y="424" fill="rgba(16,36,58,0.22)" fontSize="8" fontFamily="var(--font-mono), monospace">
              980
            </text>
          </g>

          {/* kolon başlıkları */}
          {(
            [
              [115, "GELİŞTİRİCİ FİRMALAR"],
              [400, "CANLI PROJE HAVUZU"],
              [710, "YETKİLİ DANIŞMANLAR"],
              [890, "MÜŞTERİ BAĞLANTILARI"],
            ] as const
          ).map(([x, ad]) => (
            <text
              key={ad}
              x={x}
              y="34"
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

          {/* firma → havuz hatları */}
          {FIRMALAR.map((f, i) => (
            <path
              key={f.ad}
              className="ag-hat"
              d={`M190 ${f.y} C 244 ${f.y}, 246 ${f.havuzY}, 300 ${f.havuzY}`}
              fill="none"
              stroke={aktif === null ? "rgba(19,49,75,0.30)" : "rgba(19,49,75,0.10)"}
              strokeWidth="1.6"
              style={{ transition: "stroke 0.3s ease", animationDelay: `${i * 0.35}s` }}
            />
          ))}

          {/* firma düğümleri */}
          {FIRMALAR.map((f) => (
            <g key={f.ad} style={{ opacity: aktif === null ? 1 : 0.35, transition: "opacity 0.3s ease" }}>
              <rect x="40" y={f.y - 22} width="150" height="44" rx="11" fill="#ffffff" stroke="rgba(16,36,58,0.14)" />
              <circle cx="58" cy={f.y} r="3.5" fill="#13314b" />
              <text x="70" y={f.y + 4} fill="#10243a" fontSize="12" fontWeight="600">
                {f.ad}
              </text>
            </g>
          ))}

          {/* havuz bloğu */}
          <rect x="300" y="100" width="200" height="250" rx="14" fill="#ffffff" stroke="rgba(16,36,58,0.14)" />
          <text
            x="400"
            y="118"
            textAnchor="middle"
            fill="#7d8da0"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="0.1em"
            fontFamily="var(--font-mono), monospace"
          >
            TEK DOĞRU KAYNAK
          </text>

          {/* havuz → danışman tahsis hatları (danışman başına farklı alt-küme) */}
          {DANISMANLAR.map((d, di) =>
            d.birimler.map((b, bi) => {
              const vurgulu = aktif === di;
              const soluk = aktif !== null && !vurgulu;
              return (
                <path
                  key={`${d.ad}-${b}`}
                  className="ag-hat"
                  d={`M${noktaX(b)} ${noktaY(b)} C ${noktaX(b) + 80} ${noktaY(b)}, 556 ${d.y}, 640 ${d.y}`}
                  fill="none"
                  stroke={vurgulu ? "#1e9b8a" : "rgba(16,36,58,0.20)"}
                  strokeWidth={vurgulu ? 2 : 1.4}
                  style={{
                    opacity: soluk ? 0.08 : 1,
                    transition: "opacity 0.3s ease, stroke 0.3s ease",
                    animationDelay: `${(di * 0.3 + bi * 0.15) % 1.2}s`,
                  }}
                />
              );
            })
          )}

          {/* havuz birim noktaları (durum renkli) */}
          {Array.from({ length: NOKTA_SAYISI }, (_, i) => {
            const sahip = tahsisSahibi(i);
            const vurgulu = aktif !== null && sahip === aktif;
            const soluk = aktif !== null && !vurgulu;
            return (
              <circle
                key={i}
                cx={noktaX(i)}
                cy={noktaY(i)}
                r={vurgulu ? 7.5 : 6}
                fill={RENK[noktaDurum(i)]}
                stroke={vurgulu ? "#10243a" : "none"}
                strokeWidth={vurgulu ? 1.5 : 0}
                style={{ opacity: soluk ? 0.15 : 0.95, transition: "opacity 0.3s ease, r 0.3s ease" }}
              />
            );
          })}

          {/* danışman düğümleri + hover alanı */}
          {DANISMANLAR.map((d, di) => {
            const vurgulu = aktif === di;
            const soluk = aktif !== null && !vurgulu;
            return (
              <g
                key={d.ad}
                onMouseEnter={() => setAktif(di)}
                onMouseLeave={() => setAktif(null)}
                style={{ opacity: soluk ? 0.25 : 1, transition: "opacity 0.3s ease", cursor: "default" }}
              >
                <rect
                  x="640"
                  y={d.y - 19}
                  width="140"
                  height="38"
                  rx="10"
                  fill={vurgulu ? "#e2f3f0" : "#ffffff"}
                  stroke={vurgulu ? "#1e9b8a" : "rgba(16,36,58,0.14)"}
                  strokeWidth={vurgulu ? 1.5 : 1}
                  style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
                />
                <circle cx="658" cy={d.y} r="3.5" fill={vurgulu ? "#1e9b8a" : "#46586b"} />
                <text x="670" y={d.y + 4} fill="#10243a" fontSize="12" fontWeight="600">
                  {d.ad}
                </text>
                <text
                  x="772"
                  y={d.y + 4}
                  textAnchor="end"
                  fill="#7d8da0"
                  fontSize="9"
                  fontFamily="var(--font-mono), monospace"
                >
                  {d.birimler.length}
                </text>
              </g>
            );
          })}

          {/* danışman → müşteri linki */}
          {DANISMANLAR.map((d, di) => {
            const vurgulu = aktif === di;
            const soluk = aktif !== null && !vurgulu;
            return (
              <g key={d.ad} style={{ opacity: soluk ? 0.15 : 1, transition: "opacity 0.3s ease" }}>
                <path
                  className="ag-hat"
                  d={`M780 ${d.y} L830 ${d.y}`}
                  fill="none"
                  stroke={vurgulu ? "#1e9b8a" : "rgba(16,36,58,0.20)"}
                  strokeWidth={vurgulu ? 2 : 1.4}
                  style={{ transition: "stroke 0.3s ease", animationDelay: `${di * 0.2}s` }}
                />
                <rect
                  x="830"
                  y={d.y - 17}
                  width="120"
                  height="34"
                  rx="9"
                  fill="#ffffff"
                  stroke={vurgulu ? "#1e9b8a" : "rgba(16,36,58,0.14)"}
                  style={{ transition: "stroke 0.3s ease" }}
                />
                <text x="842" y={d.y - 2} fill="#10243a" fontSize="9.5" fontWeight="600">
                  müşteri linki
                </text>
                <text x="842" y={d.y + 10} fill="#1a8676" fontSize="8.5" fontFamily="var(--font-mono), monospace">
                  canlı fiyatla ↗
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ============ MOBİL: dikey akış + otomatik vurgu ============ */}
      <div className="md:hidden">
        <div className="relative">
          <span className="absolute right-0 top-0 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek ağ
          </span>

          {/* geliştirici firmalar */}
          <p className="mb-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            Geliştirici firmalar
          </p>
          <div className="flex flex-wrap gap-2">
            {FIRMALAR.map((f) => (
              <span
                key={f.ad}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--cizgi-2)] bg-white px-3 py-2 text-[12px] font-semibold text-ink"
              >
                <span className="size-1.5 rounded-full bg-navy" aria-hidden />
                {f.ad}
              </span>
            ))}
          </div>

          <div className="ag-dikey mt-3" aria-hidden />

          {/* canlı proje havuzu */}
          <div className="mt-3 rounded-2xl border border-[var(--cizgi)] bg-white p-4 shadow-[var(--golge-1)]">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-soft">
                Canlı proje havuzu
              </span>
              <span className="font-mono text-[9px] text-[var(--ink-faint)]">tek doğru kaynak</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5" aria-hidden>
              {Array.from({ length: 24 }, (_, i) => {
                const sahip = tahsisSahibi(i);
                const vurgulu = sahip === oto;
                return (
                  <span
                    key={i}
                    className="aspect-square rounded-[4px] transition-all duration-300"
                    style={{
                      background: RENK[noktaDurum(i)],
                      opacity: vurgulu ? 1 : 0.28,
                      boxShadow: vurgulu ? "0 0 0 2px rgba(30,155,138,0.45)" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="ag-dikey mt-3" aria-hidden />

          {/* yetkili danışmanlar (sırayla vurgulanır) */}
          <p className="mb-2 mt-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            Yetkili danışmanlar
          </p>
          <div className="space-y-2">
            {DANISMANLAR.map((d, di) => {
              const vurgulu = oto === di;
              return (
                <div
                  key={d.ad}
                  className="flex items-center justify-between gap-3 rounded-[12px] border bg-white px-3 py-2.5 transition-all duration-300"
                  style={{
                    borderColor: vurgulu ? "#1e9b8a" : "var(--cizgi-2)",
                    background: vurgulu ? "#f2faf8" : "#fff",
                    opacity: vurgulu ? 1 : 0.55,
                  }}
                >
                  <span className="text-[12.5px] font-semibold text-ink">{d.ad}</span>
                  <span className="flex items-center gap-2">
                    <span className="flex gap-1" aria-hidden>
                      {d.birimler.map((b) => (
                        <span key={b} className="size-2.5 rounded-[3px]" style={{ background: RENK[noktaDurum(b)] }} />
                      ))}
                    </span>
                    <span className="font-mono text-[10px] text-ink-soft">{d.birimler.length} birim açık</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="ag-dikey mt-3" aria-hidden />

          {/* müşteri paylaşım bağlantısı */}
          <div className="mt-3 flex items-center justify-between rounded-[12px] border border-[var(--cizgi-2)] bg-white px-3 py-2.5">
            <span className="text-[12px] font-semibold text-ink">Müşteri paylaşım bağlantısı</span>
            <span className="font-mono text-[10px] font-semibold text-[var(--color-teal-d)]">canlı fiyatla ↗</span>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center font-mono text-[11px] leading-relaxed text-ink-soft">
        Her proje kendi verisini yönetir. Her danışman yalnızca kendisine açık stoğu görür.
      </p>
    </div>
  );
}
