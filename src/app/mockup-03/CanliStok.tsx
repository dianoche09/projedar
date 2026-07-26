"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Canlı stok: tek doğru kaynak tablosu. B-4-2 satırının fiyatı belirli aralıkla
 * canlı güncellenir; tazelik damgası "şimdi" olarak yanar. Amaç: fiyatın tek
 * kayıtta yaşadığını, tablonun bir liste değil canlı kayıt olduğunu göstermek.
 * Veriler örnektir.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const DURUM_ETIKET: Record<Durum, { sinif: string; ad: string }> = {
  musait: { sinif: "d-musait", ad: "Müsait" },
  opsiyon: { sinif: "d-opsiyon", ad: "Opsiyonda" },
  satildi: { sinif: "d-satildi", ad: "Satıldı" },
};

const SATIRLAR: { daire: string; tip: string; m2: string; fiyat: string; durum: Durum; taze: string; canli?: boolean }[] = [
  { daire: "A-2-1", tip: "2+1", m2: "84", fiyat: "₺6,90M", durum: "musait", taze: "12 dk önce" },
  { daire: "A-2-2", tip: "2+1", m2: "86", fiyat: "₺7,05M", durum: "opsiyon", taze: "3 dk önce" },
  { daire: "B-4-2", tip: "3+1", m2: "128", fiyat: "", durum: "musait", taze: "şimdi", canli: true },
  { daire: "B-4-3", tip: "3+1", m2: "131", fiyat: "₺9,80M", durum: "satildi", taze: "1 sa önce" },
  { daire: "C-1-4", tip: "4+1", m2: "172", fiyat: "₺13,2M", durum: "musait", taze: "22 dk önce" },
];

const CANLI_FIYATLAR = ["₺9,40M", "₺9,52M"] as const;

export function CanliStok() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [fiyatIdx, setFiyatIdx] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(() => setFiyatIdx((i) => 1 - i), 4200);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="kart relative overflow-hidden p-0">
      <span className="absolute right-4 top-3.5 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek
      </span>
      <div className="border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-3.5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
          Çankaya Vadi · A ve B Blok
        </p>
        <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
          Tek doğru kaynak · fiyat yalnız burada değişir
        </p>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Daire</th>
            <th className="max-sm:hidden">Tip</th>
            <th className="max-sm:hidden">Net m²</th>
            <th>Fiyat</th>
            <th>Durum</th>
            <th>Tazelik</th>
          </tr>
        </thead>
        <tbody>
          {SATIRLAR.map((s) => (
            <tr key={s.daire} className={s.canli ? "bg-[var(--color-teal-soft)]/35" : undefined}>
              <td className="font-mono font-semibold">{s.daire}</td>
              <td className="font-mono max-sm:hidden">{s.tip}</td>
              <td className="font-mono max-sm:hidden">{s.m2}</td>
              <td className="font-mono font-semibold">
                {s.canli ? (
                  <span className="relative inline-block overflow-hidden align-middle">
                    <motion.span
                      key={fiyatIdx}
                      initial={reduce ? false : { opacity: 0, y: 9 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="block"
                    >
                      {CANLI_FIYATLAR[fiyatIdx]}
                    </motion.span>
                  </span>
                ) : (
                  s.fiyat
                )}
              </td>
              <td>
                <span className={`durum ${DURUM_ETIKET[s.durum].sinif}`}>
                  <span className="nokta" />
                  {DURUM_ETIKET[s.durum].ad}
                </span>
              </td>
              <td>
                {s.canli ? (
                  <span className="taze t-0">
                    <span className="nokta nabiz" />
                    şimdi
                  </span>
                ) : (
                  <span className="taze t-7">
                    <span className="nokta" />
                    {s.taze}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[var(--cizgi)] px-5 py-3 font-mono text-[9.5px] leading-relaxed text-[var(--ink-faint)]">
        B-4-2 az önce güncellendi: dolaşımdaki her paylaşım linki bir sonraki açılışta bu değeri basar.
      </p>
    </div>
  );
}
