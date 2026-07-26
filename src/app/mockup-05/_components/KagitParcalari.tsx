import type { CSSProperties, ReactNode } from "react";

/**
 * Mockup 05 · kâğıt parçaları: basılı fiyat listesi, Excel satırları,
 * WhatsApp dökümü, kat planı, yapışkan not, dijital canlı kart.
 * Tüm doku CSS/SVG; görsel yok. Hem kaos sahnesi hem signature moment kullanır.
 */

export function Bant({ style }: { style?: CSSProperties }) {
  return <span className="m5-bant" style={style} aria-hidden />;
}

export function Zimba({ style }: { style?: CSSProperties }) {
  return <span className="m5-zimba" style={style} aria-hidden />;
}

export function Atac({ style }: { style?: CSSProperties }) {
  return (
    <svg
      width="18"
      height="42"
      viewBox="0 0 18 42"
      fill="none"
      aria-hidden
      className="absolute z-[3]"
      style={style}
    >
      <path
        d="M13 8v22a4.5 4.5 0 0 1-9 0V10a3 3 0 0 1 6 0v18"
        stroke="#8b97a8"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Muhur({ tur, children }: { tur: "bayat" | "eski" | "canli" | "kilit" | "onay" | "ink"; children: ReactNode }) {
  return <span className={`m5-muhur m5-muhur-${tur}`}>{children}</span>;
}

/* ---------- 1 · basılı fiyat listesi ---------- */
export function FiyatListesiSayfa() {
  return (
    <div className="m5-kagit m5-kivrik w-60 px-4 pb-4 pt-5">
      <Bant style={{ top: -10, left: "50%", transform: "translateX(-50%) rotate(-2deg)" }} />
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#5a6577]">
        Vadi Konakları · A Blok
      </p>
      <p className="font-display mt-1 text-[15px] font-semibold text-[#17293d]">Fiyat Listesi (basılı)</p>
      <div className="mt-3 space-y-0 border-t border-[rgba(23,41,61,0.14)]">
        {[
          ["A-2-1", "₺7,9M"],
          ["A-3-4", "₺8,6M"],
          ["B-4-2", "₺8,2M"],
        ].map(([kod, fiyat]) => (
          <div key={kod} className="flex items-center justify-between border-b border-dashed border-[rgba(23,41,61,0.12)] py-1.5 font-mono text-[11px] text-[#17293d]">
            <span>{kod}</span>
            <span>{fiyat}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[9px] text-[#8b97a8]">çıktı: 12 gün önce</span>
        <Muhur tur="bayat">Bayat</Muhur>
      </div>
    </div>
  );
}

/* ---------- 2 · Excel satırları ---------- */
export function ExcelSayfa() {
  return (
    <div className="m5-kagit m5-kivrik w-60 px-4 pb-4 pt-4">
      <Zimba style={{ top: -3, left: 18, transform: "rotate(-24deg)" }} />
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 items-center rounded-[4px] bg-[#2fb36b] px-2 font-mono text-[9px] font-bold text-white">XLS</span>
        <p className="truncate font-mono text-[10.5px] font-semibold text-[#17293d]">fiyat_listesi_SON_v3.xlsx</p>
      </div>
      <div className="mt-3 overflow-hidden rounded-[4px] border border-[rgba(23,41,61,0.14)]">
        <div className="grid grid-cols-[28px_1fr_1fr] bg-[rgba(23,41,61,0.05)] font-mono text-[8.5px] font-bold uppercase text-[#5a6577]">
          <span className="border-r border-[rgba(23,41,61,0.1)] px-1.5 py-1" aria-hidden />
          <span className="border-r border-[rgba(23,41,61,0.1)] px-1.5 py-1">Daire</span>
          <span className="px-1.5 py-1">Fiyat</span>
        </div>
        {[
          ["4", "B-4-2", "₺8,4M"],
          ["5", "B-4-3", "₺9,1M"],
          ["6", "C-1-2", "₺7,2M"],
        ].map(([no, kod, f]) => (
          <div key={no} className="grid grid-cols-[28px_1fr_1fr] border-t border-[rgba(23,41,61,0.1)] font-mono text-[9.5px] text-[#17293d]">
            <span className="border-r border-[rgba(23,41,61,0.1)] px-1.5 py-1 text-[#8b97a8]">{no}</span>
            <span className="border-r border-[rgba(23,41,61,0.1)] px-1.5 py-1">{kod}</span>
            <span className="px-1.5 py-1">{f}</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[9px] text-[#d15a4e]">aynı daire, üç ayrı fiyat</p>
    </div>
  );
}

/* ---------- 3 · WhatsApp yazışma dökümü ---------- */
export function WhatsappDokumu() {
  return (
    <div className="m5-kagit m5-kivrik w-56 px-4 pb-4 pt-4">
      <Atac style={{ top: -14, right: 14 }} />
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#5a6577]">
        WhatsApp dökümü
      </p>
      <div className="mt-3 space-y-2">
        <div className="max-w-[92%] rounded-xl rounded-bl-[4px] border border-[rgba(47,179,107,0.3)] bg-[#eaf6ee] px-3 py-2">
          <p className="text-[11.5px] leading-snug text-[#17293d]">B-4-2 hâlâ müsait mi?</p>
          <p className="mt-0.5 text-right font-mono text-[8px] text-[#8b97a8]">09:41</p>
        </div>
        <div className="max-w-[92%] rounded-xl rounded-bl-[4px] border border-[rgba(23,41,61,0.12)] bg-white px-3 py-2">
          <p className="text-[11.5px] leading-snug text-[#17293d]">Hangi liste güncel, v2 mi v3 mü?</p>
          <p className="mt-0.5 text-right font-mono text-[8px] text-[#8b97a8]">11:26</p>
        </div>
      </div>
      <p className="mt-2.5 font-mono text-[9px] text-[#8b97a8]">cevapsız: 2 çağrı</p>
    </div>
  );
}

/* ---------- 4 · kat planı kâğıdı ---------- */
export function KatPlani() {
  return (
    <div className="m5-kagit m5-kivrik w-56 px-4 pb-3.5 pt-4">
      <Zimba style={{ top: -3, right: 22, transform: "rotate(18deg)" }} />
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#5a6577]">
        Kat planı · 4. kat
      </p>
      <svg viewBox="0 0 200 96" className="mt-2.5 w-full" aria-hidden>
        <rect x="4" y="4" width="192" height="88" fill="none" stroke="rgba(23,41,61,0.35)" strokeWidth="1.5" />
        <path d="M70 4v88M132 4v88M70 48h62M4 60h66M132 34h64" stroke="rgba(23,41,61,0.25)" strokeWidth="1" />
        <rect x="76" y="10" width="50" height="32" fill="rgba(47,179,107,0.14)" stroke="#2fb36b" strokeWidth="1.2" />
        <text x="101" y="30" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#1f7d4c" fontWeight="700">B-4-2</text>
        <text x="36" y="34" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="rgba(23,41,61,0.4)">B-4-1</text>
        <text x="164" y="70" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="rgba(23,41,61,0.4)">B-4-3</text>
      </svg>
      <p className="mt-2 font-mono text-[9px] text-[#8b97a8]">elle işaretli: hangi daire kaldı?</p>
    </div>
  );
}

/* ---------- yapışkan not ---------- */
export function YapiskanNot({ metin, altMetin }: { metin: string; altMetin?: string }) {
  return (
    <div className="m5-not w-36 px-3.5 pb-4 pt-5">
      <p className="text-[13px] font-semibold leading-snug text-[#6b4e10]" style={{ fontFamily: "var(--font-display), sans-serif" }}>
        {metin}
      </p>
      {altMetin ? <p className="mt-1 text-[10.5px] leading-snug text-[#8a6a20]">{altMetin}</p> : null}
    </div>
  );
}

/* ---------- hedef: canlı dijital kayıt kartı ---------- */
export function DijitalKart({ genis = false }: { genis?: boolean }) {
  return (
    <div
      className={`m5-dijital ${genis ? "w-80" : "w-72"} max-w-full px-5 pb-4 pt-5`}
      style={{ "--m5-sinyal": "#2fb36b" } as CSSProperties}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[13.5px] font-semibold text-[#10243a]">B-4-2 · 3+1</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f5ec] px-2.5 py-1 text-[11px] font-semibold text-[#1f7d4c]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
          Müsait
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="font-mono text-[27px] font-semibold leading-none text-[#10243a]">₺9,4M</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium text-[#1f7d4c]">
          <span className="m5-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
          şimdi güncellendi
        </span>
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-2.5">
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#7d8da0]">ProjePazar · canlı kayıt</span>
        <span className="font-mono text-[9.5px] text-[#7d8da0]">tek doğru kaynak</span>
      </div>
    </div>
  );
}
