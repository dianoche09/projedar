"use client";

import { useEffect, useState, type CSSProperties } from "react";

/**
 * YasayanKule: hero ürün görselleştirmesi (ürünün çalışan kısa demosu).
 * Stilize kule kesiti üzerinde otomatik senaryo döngüsü:
 * müsait vurgusu → danışman bağlanır → opsiyon kilidi → ikinci danışman
 * sistemce reddedilir (çift-satış kalkanı) → başka hücrenin fiyatı güncellenir →
 * mini danışman ekranları senkron nabız → kapanış mesajı → döngü başa döner.
 * prefers-reduced-motion: statik son durum.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const RENK: Record<Durum, string> = {
  musait: "var(--color-green)",
  opsiyon: "var(--color-amber)",
  satildi: "var(--color-red)",
};

/* kule: 6 kat × 4 daire (üstten alta K6..K1) */
const KATLAR = [6, 5, 4, 3, 2, 1] as const;
const DURUMLAR: Durum[][] = [
  ["satildi", "musait", "opsiyon", "musait"],
  ["musait", "satildi", "musait", "opsiyon"],
  ["opsiyon", "musait", "musait", "satildi"],
  ["musait", "opsiyon", "satildi", "musait"],
  ["satildi", "musait", "musait", "opsiyon"],
  ["musait", "satildi", "opsiyon", "musait"],
];

/* geometri (viewBox 0 0 440 320) */
const X0 = 112;
const Y0 = 58;
const HW = 46;
const HH = 32;
const ARA = 6;
const hX = (sutun: number) => X0 + sutun * (HW + ARA);
const hY = (satir: number) => Y0 + satir * (HH + ARA);

/* senaryo hücreleri */
const HEDEF = { satir: 2, sutun: 1, kod: "B-4-2" }; // K4, daire 2
const FIYATLI = { satir: 4, sutun: 2, kod: "B-2-3" }; // K2, daire 3

/* adım süreleri (ms): vurgu → bağlan → kilit → ret → fiyat → senkron → mesaj */
const SURELER = [1700, 1700, 1800, 2000, 1800, 1600, 2300];

const EKRANLAR = ["Danışman · A. Yılmaz", "Danışman · M. Kaya", "Satış Ofisi"];

export function YasayanKule({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const [adim, setAdim] = useState(0);
  const [statik, setStatik] = useState(false);

  useEffect(() => {
    let durdu = false;
    let zaman: ReturnType<typeof setTimeout>;
    const azalt = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const ilerle = (a: number) => {
      if (durdu) return;
      setAdim(a);
      zaman = setTimeout(() => ilerle((a + 1) % SURELER.length), SURELER[a]);
    };
    /* setState'ler zamanlayıcı callback'lerinde: adım 0 zaten başlangıç durumu */
    zaman = setTimeout(() => {
      if (durdu) return;
      if (azalt) {
        setStatik(true);
        setAdim(SURELER.length - 1);
        return;
      }
      ilerle(1);
    }, azalt ? 0 : SURELER[0]);
    return () => {
      durdu = true;
      clearTimeout(zaman);
    };
  }, []);

  /* g(n): n. adıma gelindi mi (statikte hepsi açık) */
  const g = (n: number) => statik || adim >= n;

  const hedefDurum: Durum = g(2) ? "opsiyon" : "musait";
  const fiyatYeni = g(4);

  const hedefKx = hX(HEDEF.sutun);
  const hedefKy = hY(HEDEF.satir);
  const hedefOrtaX = hedefKx + HW / 2;

  return (
    <div className={`relative select-none ${className}`}>
      <style>{`
        @keyframes ypkRed {
          0% { stroke-dashoffset: 1; }
          45% { stroke-dashoffset: 0; }
          62% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0.55; }
        }
        .ypk-red-ciz { animation: ypkRed 1.9s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes ypkVurgu { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        .ypk-vurgu { animation: ypkVurgu 1.6s ease-in-out infinite; }
        @keyframes ypkSenkron {
          0% { box-shadow: 0 0 0 0 rgba(30, 155, 138, 0.35); }
          70% { box-shadow: 0 0 0 8px rgba(30, 155, 138, 0); }
          100% { box-shadow: 0 0 0 0 rgba(30, 155, 138, 0); }
        }
        .ypk-senkron { animation: ypkSenkron 1.1s ease-out both; }
        @keyframes ypkBelir { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
        .ypk-belir { display: inline-block; animation: ypkBelir 0.45s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <span className="absolute right-2 top-2 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek
      </span>

      <svg
        viewBox="0 0 440 320"
        role="img"
        aria-label="Canlı stok demosu: bir daire opsiyonlanınca sistem kilitler, ikinci danışmanın denemesini reddeder ve tüm ekranlar aynı anda güncellenir"
        className="w-full"
      >
        {/* mimari detay: parapet + anten + koordinat işaretleri */}
        <line x1={106} y1={50} x2={320} y2={50} stroke="var(--cizgi-2)" strokeWidth={1.4} />
        <line x1={296} y1={50} x2={296} y2={36} stroke="var(--cizgi-2)" strokeWidth={1.2} />
        <circle cx={296} cy={34} r={2} fill="var(--color-ink-soft)" opacity={0.6} />
        {[
          [96, 44],
          [330, 44],
          [96, 268],
        ].map(([ax, ay]) => (
          <path key={`${ax}-${ay}`} d={`M ${ax - 4} ${ay} H ${ax + 4} M ${ax} ${ay - 4} V ${ay + 4}`} stroke="var(--cizgi-2)" strokeWidth={1} />
        ))}

        {/* zemin çizgisi + tarama */}
        <line x1={88} y1={292} x2={352} y2={292} stroke="var(--cizgi-2)" strokeWidth={1.4} />
        {[100, 128, 156, 184, 212, 240, 268, 296, 324].map((tx) => (
          <line key={tx} x1={tx} y1={292} x2={tx - 7} y2={300} stroke="var(--cizgi)" strokeWidth={1} />
        ))}

        {/* kat etiketleri */}
        {KATLAR.map((kat, k) => (
          <text key={kat} x={104} y={hY(k) + HH / 2 + 3} textAnchor="end" fontSize={8} fontFamily="var(--font-mono), monospace" fill="var(--ink-faint)">
            K{kat}
          </text>
        ))}

        {/* hücreler */}
        {KATLAR.map((kat, k) =>
          DURUMLAR[k].map((d, s) => {
            const hedefMi = k === HEDEF.satir && s === HEDEF.sutun;
            const durum = hedefMi ? hedefDurum : d;
            return (
              <g key={`${kat}-${s}`}>
                <rect
                  x={hX(s)}
                  y={hY(k)}
                  width={HW}
                  height={HH}
                  rx={6}
                  fill={RENK[durum]}
                  opacity={hedefMi ? 1 : 0.82}
                  style={{ transition: "fill 0.6s ease" }}
                />
                <text
                  x={hX(s) + HW / 2}
                  y={hY(k) + HH / 2 + 3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fontFamily="var(--font-mono), monospace"
                  fill="#fff"
                  opacity={0.92}
                >
                  {kat}-{s + 1}
                </text>
              </g>
            );
          })
        )}

        {/* hedef hücre vurgu halkası */}
        <rect
          x={hedefKx - 3}
          y={hedefKy - 3}
          width={HW + 6}
          height={HH + 6}
          rx={8}
          fill="none"
          stroke={RENK[hedefDurum]}
          strokeWidth={2}
          className={!statik && adim < 2 ? "ypk-vurgu" : ""}
          style={{ transition: "stroke 0.6s ease" }}
        />

        {/* kilit işareti (opsiyonlandı) */}
        <g transform={`translate(${hedefKx + HW - 12}, ${hedefKy + 4})`} style={{ opacity: g(2) ? 1 : 0, transition: "opacity 0.4s ease" }}>
          <path d="M1.7 3.4 V2 a2.3 2.3 0 0 1 4.6 0 v1.4" fill="none" stroke="#fff" strokeWidth={1.2} />
          <rect x={0.4} y={3.4} width={7.2} height={5.4} rx={1.4} fill="#fff" />
        </g>

        {/* üst açıklama pili (blueprint callout) */}
        <line x1={hedefOrtaX} y1={42} x2={hedefOrtaX} y2={hedefKy - 4} stroke="var(--cizgi-2)" strokeDasharray="3 3" strokeWidth={1} />
        <rect x={hedefOrtaX - 90} y={20} width={180} height={22} rx={7} fill="#fff" stroke="var(--cizgi-2)" />
        <circle cx={hedefOrtaX - 78} cy={31} r={3} fill={RENK[hedefDurum]} style={{ transition: "fill 0.6s ease" }} />
        <text
          x={hedefOrtaX + 6}
          y={34.5}
          textAnchor="middle"
          fontSize={10}
          fontFamily="var(--font-mono), monospace"
          fill="var(--color-ink)"
          style={{ opacity: g(2) ? 0 : 1, transition: "opacity 0.45s ease" }}
        >
          {HEDEF.kod} · müsait · ₺9,4M
        </text>
        <text
          x={hedefOrtaX + 6}
          y={34.5}
          textAnchor="middle"
          fontSize={10}
          fontFamily="var(--font-mono), monospace"
          fill="#9a6a12"
          style={{ opacity: g(2) ? 1 : 0, transition: "opacity 0.45s ease" }}
        >
          {HEDEF.kod} · opsiyonlandı · kilitli
        </text>

        {/* danışman 1: bağlanır */}
        <g>
          <circle cx={34} cy={110} r={13} fill="#fff" stroke="var(--cizgi-2)" strokeWidth={1.2} />
          <text x={34} y={113.5} textAnchor="middle" fontSize={9} fontWeight={700} fontFamily="var(--font-mono), monospace" fill="var(--color-ink)">
            AY
          </text>
          <text x={34} y={132} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono), monospace" fill="var(--ink-faint)">
            danışman
          </text>
          <path
            d={`M 47 114 C 95 116, 125 146, ${hedefKx - 4} ${hedefKy + HH / 2}`}
            fill="none"
            stroke="var(--color-teal)"
            strokeWidth={1.8}
            pathLength={1}
            strokeDasharray="1"
            style={{
              strokeDashoffset: g(1) ? 0 : 1,
              transition: g(1) ? "stroke-dashoffset 1.1s cubic-bezier(0.22, 0.61, 0.36, 1)" : "none",
            }}
          />
          <circle
            cx={hedefKx - 4}
            cy={hedefKy + HH / 2}
            r={3}
            fill="var(--color-teal)"
            style={{ opacity: g(1) ? 1 : 0, transition: g(1) ? "opacity 0.3s ease 0.9s" : "none" }}
          />
        </g>

        {/* danışman 2: dener, sistem reddeder */}
        <g>
          <circle cx={34} cy={206} r={13} fill="#fff" stroke="var(--cizgi-2)" strokeWidth={1.2} />
          <text x={34} y={209.5} textAnchor="middle" fontSize={9} fontWeight={700} fontFamily="var(--font-mono), monospace" fill="var(--color-ink)">
            MK
          </text>
          <text x={34} y={228} textAnchor="middle" fontSize={7} fontFamily="var(--font-mono), monospace" fill="var(--ink-faint)">
            danışman
          </text>
          <path
            d={`M 47 210 C 100 208, 125 172, ${hedefKx - 6} ${hedefKy + HH - 8}`}
            fill="none"
            stroke="var(--color-red)"
            strokeWidth={1.8}
            pathLength={1}
            strokeDasharray="1"
            className={g(3) && !statik ? "ypk-red-ciz" : ""}
            style={{ strokeDashoffset: statik ? 0.55 : 1 }}
          />
          {/* kırmızı çarpı + ret etiketi */}
          <g style={{ opacity: g(3) ? 1 : 0, transition: g(3) && !statik ? "opacity 0.3s ease 0.8s" : "opacity 0.2s ease" }}>
            <circle cx={hedefKx - 6} cy={hedefKy + HH - 8} r={7} fill="#fff" stroke="var(--color-red)" strokeWidth={1.4} />
            <path
              d={`M ${hedefKx - 9} ${hedefKy + HH - 11} l 6 6 M ${hedefKx - 3} ${hedefKy + HH - 11} l -6 6`}
              stroke="var(--color-red)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <text x={96} y={186} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono), monospace" fill="var(--color-red)" fontWeight={600}>
              sistem reddetti
            </text>
          </g>
        </g>

        {/* fiyat güncellenen hücre: sağ açıklama pili */}
        <line
          x1={hX(FIYATLI.sutun) + HW}
          y1={hY(FIYATLI.satir) + HH / 2}
          x2={318}
          y2={hY(FIYATLI.satir) + HH / 2}
          stroke="var(--cizgi-2)"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <rect x={318} y={hY(FIYATLI.satir) + HH / 2 - 11} width={106} height={22} rx={7} fill="#fff" stroke="var(--cizgi-2)" />
        <text x={328} y={hY(FIYATLI.satir) + HH / 2 + 3.5} fontSize={9.5} fontFamily="var(--font-mono), monospace" fill="var(--color-ink-soft)">
          {FIYATLI.kod} ·
        </text>
        <text
          x={378}
          y={hY(FIYATLI.satir) + HH / 2 + 3.5}
          fontSize={9.5}
          fontWeight={600}
          fontFamily="var(--font-mono), monospace"
          fill="var(--color-ink)"
          style={{ opacity: fiyatYeni ? 0 : 1, transition: "opacity 0.5s ease" }}
        >
          ₺8,9M
        </text>
        <text
          x={378}
          y={hY(FIYATLI.satir) + HH / 2 + 3.5}
          fontSize={9.5}
          fontWeight={600}
          fontFamily="var(--font-mono), monospace"
          fill="var(--color-ink)"
          style={{ opacity: fiyatYeni ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          ₺9,1M
        </text>
        <g style={{ opacity: fiyatYeni ? 1 : 0, transition: "opacity 0.4s ease 0.4s" }}>
          <circle cx={352} cy={hY(FIYATLI.satir) + HH / 2 + 20} r={2.4} fill="var(--color-green)" />
          <text
            x={359}
            y={hY(FIYATLI.satir) + HH / 2 + 23}
            fontSize={8.5}
            fontFamily="var(--font-mono), monospace"
            fill="#1f7d4c"
            fontWeight={600}
          >
            şimdi
          </text>
        </g>
      </svg>

      {/* kapanış mesajı */}
      <p
        className="pointer-events-none mt-1 min-h-5 text-center font-mono text-[11.5px] text-ink-soft"
        style={{
          opacity: g(6) ? 1 : 0,
          transform: g(6) ? "none" : "translateY(6px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
        aria-hidden={!g(6)}
      >
        Bir daire değiştiğinde, herkes aynı gerçeği görür.
      </p>

      {/* mini danışman ekranları: senkron nabız */}
      {compact ? null : (
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {EKRANLAR.map((ad, i) => (
            <div
              key={ad}
              className={`rounded-xl border border-[var(--cizgi)] bg-white p-2.5 shadow-[var(--golge-1)] sm:p-3 ${
                !statik && adim === 5 ? "ypk-senkron" : ""
              }`}
              style={{ animationDelay: `${i * 130}ms` }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)] sm:text-[9px]">
                  {ad}
                </span>
                <span className="freshdot nabiz bg-green" style={{ width: 5, height: 5 }} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-1.5">
                <span className="font-mono text-[10.5px] font-semibold text-ink">{HEDEF.kod}</span>
                <span
                  className={`durum ${hedefDurum === "opsiyon" ? "d-opsiyon" : "d-musait"}`}
                  style={{ fontSize: 9.5, padding: "2px 7px" } as CSSProperties}
                >
                  <span className="nokta" />
                  {hedefDurum === "opsiyon" ? "Opsiyon" : "Müsait"}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-dashed border-[rgba(16,36,58,0.1)] pt-1.5">
                <span className="font-mono text-[10.5px] text-ink-soft">{FIYATLI.kod}</span>
                <span key={fiyatYeni ? "yeni" : "eski"} className="ypk-belir font-mono text-[10.5px] font-semibold text-ink">
                  {fiyatYeni ? "₺9,1M" : "₺8,9M"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
