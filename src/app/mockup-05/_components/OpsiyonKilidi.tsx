"use client";

import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * GERÇEK ETKİLEŞİM · opsiyon kilidi koreografisi.
 * Kullanıcı "Opsiyon damgasını bas" der: KİLİTLİ damgası karta
 * fiziksel bir mühür gibi iner, kart sarsılır, erişime kapanır;
 * diğer danışmanların mini ekranlarında kart anında kilitlenir.
 */

export function OpsiyonKilidi() {
  const [kilitli, setKilitli] = useState(false);
  const azalt = useReducedMotion();

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      {/* sol: koreografi adımları */}
      <div>
        <ol className="space-y-5">
          {[
            ["01", "Danışman opsiyon ister", "Alıcısı ciddi olan danışman tek dokunuşla 48 saatlik opsiyon talep eder."],
            ["02", "Damga veritabanında basılır", "Kilit uygulama katmanında değil, tekil indeksle doğrudan veritabanında tutulur. Aynı daireye ikinci opsiyon teknik olarak imkânsızdır."],
            ["03", "Kart ağın kalanına kapanır", "Diğer danışmanların ekranında birim anında amber KİLİTLİ etiketine döner; kimse boşa müşteri getirmez."],
          ].map(([no, baslik, metin]) => (
            <li key={no} className="flex gap-4">
              <span className="font-mono text-[13px] font-bold text-[#177e6f]">{no}</span>
              <div>
                <h3 className="font-display text-[16.5px] font-semibold text-[#17293d]">{baslik}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-[#5a6577]">{metin}</p>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => setKilitli((v) => !v)}
          className={`m5-btn mt-7 w-full sm:w-auto ${kilitli ? "m5-btn-kagit" : "m5-btn-ink"}`}
          aria-pressed={kilitli}
        >
          {kilitli ? "Damgayı kaldır (demo)" : "Opsiyon damgasını bas"}
        </button>
        <p className="mt-2.5 font-mono text-[10.5px] text-[#8b97a8]">temsili demo · gerçek sistemde kilidi veritabanı basar</p>
      </div>

      {/* sağ: damgalanan kart + diğer ekranlar */}
      <div>
        <motion.div
          className={`m5-dijital relative mx-auto max-w-sm px-5 pb-4 pt-5 ${kilitli ? "m5-kilit-doku" : ""}`}
          style={{ "--m5-sinyal": kilitli ? "#e3a12c" : "#2fb36b" } as CSSProperties}
          animate={kilitli && !azalt ? { x: [0, -3, 3, -1, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[14px] font-semibold text-[#10243a]">B-4-2 · 3+1</span>
            {kilitli ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf0da] px-2.5 py-1 text-[11px] font-semibold text-[#9a6a12]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e3a12c]" aria-hidden />
                Opsiyonda · 48s
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f5ec] px-2.5 py-1 text-[11px] font-semibold text-[#1f7d4c]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                Müsait
              </span>
            )}
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <span className="font-mono text-[26px] font-semibold leading-none text-[#10243a]">₺9,4M</span>
            <span className="font-mono text-[10.5px] text-[#7d8da0]">canlı fiyat</span>
          </div>
          <p className="mt-3 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-2.5 font-mono text-[10px] text-[#7d8da0]">
            Vadi Konakları · B blok · 4. kat
          </p>

          {/* damga: fiziksel iniş */}
          <AnimatePresence>
            {kilitli ? (
              <motion.span
                className="m5-muhur m5-muhur-kilit absolute right-4 top-1/2 z-10 text-[15px]"
                style={{ letterSpacing: "0.22em" }}
                initial={azalt ? { opacity: 0 } : { opacity: 0, scale: 2.6, rotate: -22, y: "-50%" }}
                animate={{ opacity: 1, scale: 1, rotate: -12, y: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, y: "-50%", transition: { duration: 0.18 } }}
                transition={azalt ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 22 }}
              >
                Kilitli
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* diğer danışmanların ekranı */}
        <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b97a8]">
          Ağdaki diğer danışmanların ekranı
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-3">
          {["Danışman B", "Danışman C"].map((ad) => (
            <div
              key={ad}
              className={`m5-dijital px-3.5 pb-3 pt-3.5 transition-opacity duration-300 ${kilitli ? "opacity-70" : ""}`}
              style={{ "--m5-sinyal": kilitli ? "#e3a12c" : "#2fb36b" } as CSSProperties}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11.5px] font-semibold text-[#10243a]">B-4-2</span>
                <span className="font-mono text-[9px] text-[#7d8da0]">{ad}</span>
              </div>
              <p className={`mt-2 font-mono text-[11px] font-semibold ${kilitli ? "text-[#9a6a12]" : "text-[#1f7d4c]"}`}>
                {kilitli ? "erişime kapandı" : "paylaşılabilir"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
