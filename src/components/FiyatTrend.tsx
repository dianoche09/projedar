import { fmtPara, zamanOnce } from "@/lib/types";

export type FiyatNokta = { t: string; fiyat: number };

/**
 * Fiyat geçmişi mini grafiği (server component — dep yok, inline SVG sparkline).
 * Veri kaynağı: events tip='fiyat' (DB trigger birim_fiyat_log). DEĞİŞMEZ #2 korunur:
 * tek doğru kaynak birim.liste_fiyati; bu yalnız append-only değişim izinin görselidir.
 * Olgusal gösterim (kaç değişim, toplam %, son ne zaman) — kıtlık/abartı dili YOK.
 */
export function FiyatTrend({
  noktalar,
  paraBirimi = "TRY",
}: {
  noktalar: FiyatNokta[];
  paraBirimi?: string;
}) {
  if (noktalar.length < 2) return null;

  const fiyatlar = noktalar.map((n) => n.fiyat);
  const min = Math.min(...fiyatlar);
  const max = Math.max(...fiyatlar);
  const ilk = fiyatlar[0];
  const son = fiyatlar[fiyatlar.length - 1];
  const toplamPct = ilk ? ((son - ilk) / ilk) * 100 : 0;
  const degisim = noktalar.length - 1;
  const gunMetin = zamanOnce(noktalar[noktalar.length - 1].t);
  const yukari = son >= ilk;
  const renk = yukari ? "var(--color-teal)" : "var(--color-red)";

  // sparkline path
  const W = 168;
  const H = 40;
  const pad = 4;
  const span = max - min || 1;
  const koord = noktalar.map((n, i) => {
    const x = pad + (i / (noktalar.length - 1)) * (W - 2 * pad);
    const y = pad + (1 - (n.fiyat - min) / span) * (H - 2 * pad);
    return [x, y] as const;
  });
  const cizgi = "M" + koord.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const [sx, sy] = koord[koord.length - 1];

  const isaret = toplamPct > 0 ? "+" : "";

  return (
    <div className="mt-3 rounded-xl border border-hair bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="mono text-[10px] font-bold uppercase tracking-[0.08em] text-gray">
          Fiyat geçmişi
        </span>
        <span
          className="mono text-[11px] font-bold tabular-nums"
          style={{ color: renk }}
        >
          {isaret}
          {toplamPct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-none" aria-hidden>
          <path d={cizgi} fill="none" stroke={renk} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={sx} cy={sy} r="2.4" fill={renk} />
        </svg>
        <div className="min-w-0 text-[11px] leading-tight text-gray">
          <p className="tabular-nums">
            {fmtPara(min, paraBirimi)} – {fmtPara(max, paraBirimi)}
          </p>
          <p className="mt-0.5">
            {degisim} değişim · {gunMetin}
          </p>
        </div>
      </div>
    </div>
  );
}
