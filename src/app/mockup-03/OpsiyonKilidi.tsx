"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * Opsiyon kilidi koreografisi: üç adımlık otomatik sahne.
 * 0) Birim müsait, iki danışman da aynı canlı kaydı görür.
 * 1) D. Aksoy opsiyon alır: birim amber kilide geçer (kilit veritabanında).
 * 2) M. Kaya aynı birimi dener: tekil indeks reddeder, çift satış imkânsız.
 * Adım noktalarına tıklanınca otomatik akış durur. Veriler örnektir.
 */

const ADIMLAR = [
  {
    baslik: "Birim müsait",
    metin: "B-4-2 yeşil: yetkili her danışman aynı canlı kaydı görüyor.",
  },
  {
    baslik: "D. Aksoy opsiyon aldı",
    metin: "Birim amber kilide geçti. Kilit uygulama ekranında değil, veritabanının kendisinde.",
  },
  {
    baslik: "M. Kaya aynı birimi denedi",
    metin: "Aktif opsiyon üzerindeki tekil kilit ikinci opsiyonu reddetti: aynı daire iki kez satılamaz.",
  },
];

function KilitIkon({ renk }: { renk: string }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke={renk} strokeWidth="1.7" />
      <rect x="3" y="7" width="10" height="7.5" rx="2" fill={renk} />
    </svg>
  );
}

export function OpsiyonKilidi() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [adim, setAdim] = useState(0);
  const [elle, setElle] = useState(false);

  useEffect(() => {
    if (!inView || reduce || elle) return;
    const t = setInterval(() => setAdim((a) => (a + 1) % ADIMLAR.length), 3000);
    return () => clearInterval(t);
  }, [inView, reduce, elle]);

  const kilitli = adim >= 1;

  return (
    <div ref={ref}>
      <div className="grid gap-4 md:grid-cols-[1fr_300px_1fr] md:items-stretch">
        {/* ---- D. Aksoy ---- */}
        <div
          className={`order-2 flex flex-col rounded-2xl border bg-white p-4 shadow-[var(--golge-1)] transition-all duration-300 md:order-none lg:p-5 ${
            kilitli ? "border-teal" : "border-[var(--cizgi)]"
          }`}
        >
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            <span className="size-2 rounded-[3px] bg-teal" aria-hidden />
            D. Aksoy · Merkez Ofis
          </p>
          <p className="mt-3 text-[13.5px] font-semibold text-ink">
            {kilitli ? "Opsiyonu aldı" : "Birimi canlı görüyor"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {kilitli
              ? "48 saatlik opsiyon süresi işliyor; müşterisiyle güvenle ilerliyor."
              : "Müşterisine B-4-2 için canlı fiyatlı link paylaştı."}
          </p>
          {kilitli ? (
            <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--color-teal-soft)] px-2.5 py-1 pt-1 font-mono text-[9.5px] font-semibold text-[var(--color-teal-d)]">
              <span className="size-1.5 rounded-full bg-teal" aria-hidden />
              opsiyon onda · 47 sa 12 dk kaldı
            </span>
          ) : null}
        </div>

        {/* ---- tek canlı kayıt ---- */}
        <div
          className="kart signal-top order-1 relative p-5 md:order-none"
          style={{ "--_sig": kilitli ? "var(--color-amber)" : "var(--color-green)" } as React.CSSProperties}
        >
          <span className="absolute right-3.5 top-3.5 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek
          </span>
          <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
            Tek canlı kayıt
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[14px] font-semibold text-ink">B-4-2 · 3+1</span>
            <span className={`durum ${kilitli ? "d-opsiyon" : "d-musait"}`}>
              <span className="nokta" />
              {kilitli ? "Opsiyonda" : "Müsait"}
            </span>
          </div>
          <p className="mt-2 font-mono text-[28px] font-semibold leading-none text-ink">₺9,52M</p>
          <div className="mt-3 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-3">
            <motion.p
              key={kilitli ? "kilit" : "acik"}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9.5px] font-semibold ${
                kilitli ? "bg-[var(--color-amber-soft)] text-[#9a6a12]" : "bg-[var(--color-green-soft)] text-[#1f7d4c]"
              }`}
            >
              {kilitli ? <KilitIkon renk="#9a6a12" /> : <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />}
              {kilitli ? "veritabanı kilidi aktif" : "kilit yok · herkese açık"}
            </motion.p>
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-[var(--ink-faint)]">
              Aktif opsiyon, opsiyon tablosundaki tekil kısmi indeksle korunur.
            </p>
          </div>
        </div>

        {/* ---- M. Kaya ---- */}
        <div
          className={`order-3 flex flex-col rounded-2xl border bg-white p-4 shadow-[var(--golge-1)] transition-all duration-300 md:order-none lg:p-5 ${
            adim === 2 ? "border-[rgba(209,90,78,0.5)]" : "border-[var(--cizgi)]"
          }`}
        >
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            <span className="size-2 rounded-[3px] bg-navy" aria-hidden />
            M. Kaya · Kuzey Ofis
          </p>
          <p className="mt-3 text-[13.5px] font-semibold text-ink">
            {adim === 2 ? "Opsiyon denemesi reddedildi" : adim === 1 ? "Kilidi anında görüyor" : "Birimi canlı görüyor"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {adim === 2
              ? "Uygulama hata vermedi, veritabanı izin vermedi. Çakışma diye bir şey kalmadı."
              : adim === 1
                ? "B-4-2 kendi ekranında amber yandı: boşa müşteri götürmüyor."
                : "Aynı kayıt, aynı canlı fiyat: kimse eski bilgiyle çalışmıyor."}
          </p>
          {adim === 2 ? (
            <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-[var(--color-red-soft)] px-2.5 py-1 font-mono text-[9.5px] font-semibold text-[#a23f34]">
              <KilitIkon renk="#a23f34" />
              reddedildi: aktif opsiyon var
            </span>
          ) : null}
        </div>
      </div>

      {/* ---- adım şeridi ---- */}
      <div className="mt-5 flex flex-col items-center gap-2.5">
        <div role="group" aria-label="Opsiyon sahnesi adımları" className="flex items-center gap-2">
          {ADIMLAR.map((a, i) => (
            <button
              key={a.baslik}
              type="button"
              aria-pressed={adim === i}
              aria-label={`Adım ${i + 1}: ${a.baslik}`}
              onClick={() => {
                setElle(true);
                setAdim(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                adim === i ? "w-7 bg-teal" : "w-2 bg-[rgba(16,36,58,0.18)] hover:bg-[rgba(16,36,58,0.32)]"
              }`}
            />
          ))}
        </div>
        <motion.p
          key={adim}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-center font-mono text-[11px] text-ink-soft"
          aria-live="polite"
        >
          <span className="font-semibold text-ink">{ADIMLAR[adim].baslik}.</span> {ADIMLAR[adim].metin}
        </motion.p>
      </div>
    </div>
  );
}
