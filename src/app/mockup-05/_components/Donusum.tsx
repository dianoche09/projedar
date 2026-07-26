"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { DijitalKart, ExcelSayfa, FiyatListesiSayfa, KatPlani, WhatsappDokumu } from "./KagitParcalari";

/**
 * SIGNATURE MOMENT · "kâğıtlar sıkışır, tek canlı kayıt kalır"
 * Dört basılı katman (Excel, fiyat listesi, WhatsApp dökümü, kat planı)
 * scroll ile merkeze gelir, fiziksel olarak sıkışıp deste olur,
 * sonra deste kâğıttan ekrana morph olur: tek canlı dijital kayıt.
 * Mobil + reduced-motion: sticky yok, üç statik sahne.
 */

type Katman = {
  id: string;
  /* dağınık başlangıç (merkezden px) */
  basX: number;
  basY: number;
  basRot: number;
  /* deste hedefi (hafif ofsetli yığın) */
  sonY: number;
  sonRot: number;
};

const KATMANLAR: Katman[] = [
  { id: "plan", basX: -300, basY: -140, basRot: -7, sonY: -13, sonRot: -1.4 },
  { id: "excel", basX: 300, basY: -120, basRot: 6, sonY: -5, sonRot: 1 },
  { id: "wa", basX: -280, basY: 150, basRot: 5, sonY: 4, sonRot: -0.8 },
  { id: "liste", basX: 290, basY: 140, basRot: -5, sonY: 12, sonRot: 0.6 },
];

export function Donusum({ className = "" }: { className?: string }) {
  const sahneRef = useRef<HTMLDivElement>(null);
  const azalt = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sahneRef, offset: ["start start", "end end"] });

  /* deste sıkışması: 0.42-0.56 arası hafif squash */
  const desteScale = useTransform(scrollYProgress, [0.42, 0.56, 0.66], [1, 0.96, 0.9]);
  const desteOpacity = useTransform(scrollYProgress, [0.56, 0.68], [1, 0]);

  /* kâğıttan ekrana morph */
  const kartOpacity = useTransform(scrollYProgress, [0.62, 0.74], [0, 1]);
  const kartScale = useTransform(scrollYProgress, [0.62, 0.76], [0.9, 1]);
  const kartY = useTransform(scrollYProgress, [0.62, 0.76], [18, 0]);
  const satirOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const satirY = useTransform(scrollYProgress, [0.8, 0.9], [10, 0]);

  return (
    <div ref={sahneRef} className={className}>
      {/* desktop: sticky sahne */}
      {azalt ? null : (
        <div className="relative hidden h-[280vh] lg:block">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            <div className="relative h-[540px] w-full max-w-3xl">
              <span className="absolute right-0 top-2 z-10 rounded-[4px] border border-[rgba(23,41,61,0.18)] bg-[#fdfbf4] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8b97a8]">
                temsili örnek
              </span>

              {/* kâğıt destesi */}
              <motion.div
                className="absolute inset-0"
                style={{ scale: desteScale, opacity: desteOpacity }}
              >
                {KATMANLAR.map((k, i) => (
                  <DonusumKatmani key={k.id} katman={k} sira={i} kayma={scrollYProgress}>
                    {KATMAN_ICERIK[k.id]}
                  </DonusumKatmani>
                ))}
              </motion.div>

              {/* hedef: canlı dijital kayıt */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div style={{ opacity: kartOpacity, scale: kartScale, y: kartY }}>
                  <DijitalKart genis />
                </motion.div>
              </div>

              <motion.p
                className="absolute inset-x-0 bottom-8 text-center font-mono text-[12.5px] text-[#5a6577]"
                style={{ opacity: satirOpacity, y: satirY }}
              >
                Dört kopya sıkıştı; B-4-2 artık yalnız burada yaşıyor.
              </motion.p>
            </div>
          </div>
        </div>
      )}

      {/* mobil + reduced-motion: üç statik sahne */}
      <div className={azalt ? "block" : "lg:hidden"}>
        <div className="relative overflow-hidden">
          <span className="absolute right-1 top-0 z-10 rounded-[4px] border border-[rgba(23,41,61,0.18)] bg-[#fdfbf4] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8b97a8]">
            temsili örnek
          </span>
          <div className="flex flex-wrap items-start justify-center gap-4 pt-7">
            <div className="-rotate-2">{KATMAN_ICERIK.plan}</div>
            <div className="rotate-2">{KATMAN_ICERIK.excel}</div>
            <div className="rotate-1">{KATMAN_ICERIK.wa}</div>
            <div className="-rotate-1">{KATMAN_ICERIK.liste}</div>
          </div>
        </div>
        <div className="my-7 flex flex-col items-center gap-1.5" aria-hidden>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b97a8]">kâğıtlar sıkışır</span>
          <span className="h-8 w-px bg-[rgba(23,41,61,0.2)]" />
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1l6 6 6-6" stroke="#5a6577" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex justify-center px-2">
          <DijitalKart genis />
        </div>
        <p className="mt-4 text-center font-mono text-[12px] text-[#5a6577]">
          Dört kopya sıkıştı; B-4-2 artık yalnız burada yaşıyor.
        </p>
      </div>
    </div>
  );
}

/* tek katman: dağınık konumdan merkeze süzülür, desteye oturur */
function DonusumKatmani({
  katman,
  sira,
  kayma,
  children,
}: {
  katman: Katman;
  sira: number;
  kayma: MotionValue<number>;
  children: ReactNode;
}) {
  /* katmanlar sırayla oturur: her birinin penceresi hafif kaydırılır */
  const bas = 0.06 + sira * 0.05;
  const son = 0.4 + sira * 0.03;
  const x = useTransform(kayma, [bas, son], [katman.basX, 0]);
  const y = useTransform(kayma, [bas, son], [katman.basY, katman.sonY]);
  const rotate = useTransform(kayma, [bas, son], [katman.basRot, katman.sonRot]);
  const opacity = useTransform(kayma, [0, 0.05], [0, 1]);
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: sira }}>
      <motion.div style={{ x, y, rotate, opacity }}>{children}</motion.div>
    </div>
  );
}

const KATMAN_ICERIK: Record<string, ReactNode> = {
  plan: <KatPlani />,
  excel: <ExcelSayfa />,
  wa: <WhatsappDokumu />,
  liste: <FiyatListesiSayfa />,
};
