"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * DosyaKaosu: "eski sistem bozuk" sticky storytelling bölümü.
 * Desktop: normal akışta sticky panel; scroll ilerledikçe dağınık parçalar
 * (Excel, PDF, WhatsApp balonları, bayat ekran görüntüsü, çakışma etiketi)
 * merkeze toplanıp soluklaşır ve tek ProjePazar canlı kayıt kartında birleşir.
 * Mobil ve prefers-reduced-motion: sticky yok, dikey iki statik sahne (kaos → tek kart).
 */

type ParcaKonum = {
  id: string;
  stil: CSSProperties;
  hedefX: number;
  hedefY: number;
  don: number;
};

/* sahne yerleşimi + merkeze toplanma vektörleri (px) */
const KONUMLAR: ParcaKonum[] = [
  { id: "excel", stil: { left: "2%", top: "4%" }, hedefX: 170, hedefY: 150, don: -6 },
  { id: "pdf", stil: { right: "2%", top: "2%" }, hedefX: -170, hedefY: 160, don: 5 },
  { id: "balon1", stil: { right: "5%", top: "62%" }, hedefX: -140, hedefY: -110, don: 3 },
  { id: "balon2", stil: { left: "4%", top: "68%" }, hedefX: 170, hedefY: -125, don: -4 },
  { id: "ekran", stil: { left: "35%", top: "0%" }, hedefX: 10, hedefY: 170, don: 2 },
  { id: "cakisma", stil: { left: "30%", top: "84%" }, hedefX: 30, hedefY: -170, don: -2 },
];

export function DosyaKaosu({ className = "" }: { className?: string }) {
  const sahneRef = useRef<HTMLDivElement>(null);
  const azalt = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sahneRef, offset: ["start start", "end end"] });

  const kartOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const kartScale = useTransform(scrollYProgress, [0.55, 0.7], [0.92, 1]);
  const kartY = useTransform(scrollYProgress, [0.55, 0.7], [26, 0]);
  const satirOpacity = useTransform(scrollYProgress, [0.74, 0.86], [0, 1]);
  const satirY = useTransform(scrollYProgress, [0.74, 0.86], [10, 0]);

  return (
    <div ref={sahneRef} className={className}>
      {/* desktop: sticky sahne (scroll ele geçirilmez, normal akış) */}
      {azalt ? null : (
        <div className="relative hidden h-[260vh] lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            <div className="relative h-[520px] w-full max-w-3xl">
              <span className="absolute right-0 top-0 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
                temsili örnek
              </span>
              {KONUMLAR.map((k) => (
                <KaosParca key={k.id} konum={k} kayma={scrollYProgress}>
                  {ICERIK[k.id]}
                </KaosParca>
              ))}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div style={{ opacity: kartOpacity, scale: kartScale, y: kartY }}>
                  <CanliKayitKarti />
                </motion.div>
              </div>
              <motion.p
                className="absolute inset-x-0 bottom-8 text-center font-mono text-[12.5px] text-ink-soft"
                style={{ opacity: satirOpacity, y: satirY }}
              >
                On farklı dosya yerine tek canlı gerçek.
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* mobil + reduced-motion: dikey iki sahne (kaos kolajı → tek canlı kart) */}
      <div className={azalt ? "block" : "lg:hidden"}>
        <div className="relative overflow-hidden">
          <span className="absolute right-1 top-0 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            temsili örnek
          </span>
          <div className="flex flex-wrap items-start justify-center gap-3 pt-7">
            <div className="-rotate-3">{ICERIK.excel}</div>
            <div className="rotate-2">{ICERIK.pdf}</div>
            <div className="rotate-1">{ICERIK.balon1}</div>
            <div className="-rotate-2">{ICERIK.balon2}</div>
            <div className="rotate-2">{ICERIK.ekran}</div>
            <div className="-rotate-1">{ICERIK.cakisma}</div>
          </div>
        </div>
        <div className="my-7 flex flex-col items-center gap-1.5" aria-hidden>
          <span className="h-8 w-px bg-[var(--cizgi-2)]" />
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1l6 6 6-6" stroke="var(--color-ink-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-center px-2">
          <CanliKayitKarti />
        </div>
        <p className="mt-4 text-center font-mono text-[12px] text-ink-soft">On farklı dosya yerine tek canlı gerçek.</p>
      </div>
    </div>
  );
}

/* scroll'a bağlı kaos parçası: belirir → merkeze toplanırken küçülüp soluklaşır */
function KaosParca({ konum, kayma, children }: { konum: ParcaKonum; kayma: MotionValue<number>; children: ReactNode }) {
  const opacity = useTransform(kayma, [0, 0.08, 0.4, 0.58], [0.9, 1, 1, 0]);
  const x = useTransform(kayma, [0.18, 0.58], [0, konum.hedefX]);
  const y = useTransform(kayma, [0.18, 0.58], [0, konum.hedefY]);
  const rotate = useTransform(kayma, [0.18, 0.58], [konum.don, 0]);
  const scale = useTransform(kayma, [0.18, 0.58], [1, 0.55]);
  return (
    <motion.div className="absolute" style={{ ...konum.stil, opacity, x, y, rotate, scale }}>
      {children}
    </motion.div>
  );
}

/* ---------- kaos parçaları ---------- */

function DosyaGlif({ renk, tur }: { renk: string; tur: string }) {
  return (
    <svg width="30" height="36" viewBox="0 0 30 36" aria-hidden className="flex-none">
      <path
        d="M6.5 2.5h10.8L25 10.2V32c0 .8-.7 1.5-1.5 1.5H8c-.8 0-1.5-.7-1.5-1.5V4c0-.8.7-1.5 1.5-1.5z"
        fill="#fff"
        stroke="var(--cizgi-2)"
        strokeWidth="1.2"
      />
      <path d="M17.3 2.5v7.7H25" fill="none" stroke="var(--cizgi-2)" strokeWidth="1.2" />
      <rect x="2" y="19" width="22" height="10" rx="2.5" fill={renk} />
      <text x="13" y="26.4" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#fff" fontFamily="var(--font-mono), monospace">
        {tur}
      </text>
    </svg>
  );
}

function ExcelKart() {
  return (
    <div className="w-52 rounded-2xl border border-[var(--cizgi)] bg-white px-3.5 py-3 shadow-[var(--golge-1)]">
      <div className="flex items-center gap-2.5">
        <DosyaGlif renk="var(--color-green)" tur="XLS" />
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] font-semibold text-ink">fiyat_listesi_SON_v3.xlsx</p>
          <span className="taze t-eski mt-1">
            <span className="nokta" />18 gün önce
          </span>
        </div>
      </div>
    </div>
  );
}

function PdfKart() {
  return (
    <div className="w-52 rounded-2xl border border-[var(--cizgi)] bg-white px-3.5 py-3 shadow-[var(--golge-1)]">
      <div className="flex items-center gap-2.5">
        <DosyaGlif renk="var(--color-red)" tur="PDF" />
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] font-semibold text-ink">A_blok_guncel_fiyat(2).pdf</p>
          <span className="taze t-eski mt-1">
            <span className="nokta" />32 gün önce
          </span>
        </div>
      </div>
    </div>
  );
}

function WaBalon({ metin, saat }: { metin: string; saat: string }) {
  return (
    <div className="max-w-52 rounded-2xl rounded-bl-md border border-[rgba(47,179,107,0.25)] bg-[var(--color-green-soft)] px-3.5 py-2.5 shadow-[var(--golge-1)]">
      <p className="text-[12.5px] leading-snug text-ink">{metin}</p>
      <p className="mt-1 text-right font-mono text-[9px] text-[var(--ink-faint)]">{saat}</p>
    </div>
  );
}

function EskiEkranKart() {
  return (
    <div className="w-48 rounded-2xl border border-[var(--cizgi)] bg-white p-3 shadow-[var(--golge-1)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[10.5px] font-semibold text-ink">ekran_goruntusu.png</p>
        <span className="taze t-eski flex-none">
          <span className="nokta" />25 gün
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5 rounded-lg border border-[var(--cizgi)] bg-[var(--color-soft)] p-2.5">
        <div className="h-1.5 w-3/4 rounded bg-[rgba(16,36,58,0.12)]" />
        <div className="h-1.5 w-full rounded bg-[rgba(16,36,58,0.09)]" />
        <div className="flex items-center justify-between gap-2">
          <div className="h-1.5 w-2/3 rounded bg-[rgba(16,36,58,0.09)]" />
          <span className="font-mono text-[9px] text-red line-through">₺8,2M</span>
        </div>
      </div>
    </div>
  );
}

function CakismaEtiket() {
  return (
    <span
      className="rozet border border-[rgba(209,90,78,0.3)] shadow-[var(--golge-1)]"
      style={{ background: "var(--color-red-soft)", color: "#a23f34" }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
        <path d="M6 1.2 11 10.4H1z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M6 4.6v2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="6" cy="8.9" r="0.7" fill="currentColor" />
      </svg>
      iki danışman aynı daireyi satıyor
    </span>
  );
}

/* ---------- birleşme hedefi: tek canlı kayıt ---------- */

function CanliKayitKarti() {
  return (
    <div className="kart signal-top w-80 max-w-full px-5 pb-4 pt-5" style={{ "--_sig": "var(--color-green)" } as CSSProperties}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[13.5px] font-semibold text-ink">B-4-2 · 3+1</span>
        <span className="durum d-musait">
          <span className="nokta" />Müsait
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="font-mono text-[27px] font-semibold leading-none text-ink">₺9,4M</span>
        <span className="taze t-0">
          <span className="nokta nabiz" />şimdi güncellendi
        </span>
      </div>
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-dashed border-[rgba(16,36,58,0.1)] pt-2.5">
        <span className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--ink-faint)]">ProjePazar · canlı kayıt</span>
        <span className="font-mono text-[9.5px] text-[var(--ink-faint)]">tek doğru kaynak</span>
      </div>
    </div>
  );
}

/* parça id → içerik (fonksiyon bildirimleri hoist edildiği için burada güvenli) */
const ICERIK: Record<string, ReactNode> = {
  excel: <ExcelKart />,
  pdf: <PdfKart />,
  balon1: <WaBalon metin="Bu daire hâlâ müsait mi?" saat="09:41" />,
  balon2: <WaBalon metin="Hangi liste güncel?" saat="11:26" />,
  ekran: <EskiEkranKart />,
  cakisma: <CakismaEtiket />,
};
