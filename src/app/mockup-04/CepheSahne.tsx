"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Clock, Lock, X } from "lucide-react";

/**
 * CepheSahne · SIGNATURE MOMENT.
 * Scroll ile "kamera" gerçek cephe fotoğrafına yaklaşır (scale + sticky);
 * yaklaştıkça pencereler canlı veri hücrelerine dönüşür. Hücreler gerçekten
 * tıklanabilir: veri kartı açılır, müsait dairede opsiyon denenebilir
 * (yeşil hücre amber kilide döner). Reduced-motion: statik poster, katman açık.
 * TÜM VERİLER ÖRNEKTİR; state bileşen içindedir.
 */

type Durum = "musait" | "opsiyon" | "satildi";

type Hucre = {
  kod: string;
  x: number; // sol %, görsel kutusuna göre
  y: number; // üst %
  durum: Durum;
  tip: string;
  net: number;
  kat: number;
  cephe: string;
  fiyat: string;
};

const RENK: Record<Durum, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

const DURUM_AD: Record<Durum, string> = {
  musait: "Müsait",
  opsiyon: "Opsiyon",
  satildi: "Satıldı",
};

const HUCRE_W = 11;
const HUCRE_H = 6.1;

/* cephe-frontal.jpg pencere ızgarasına yaklaşık oturtulmuş örnek stok */
const HUCRELER: Hucre[] = [
  { kod: "A-12-2", x: 27, y: 10.2, durum: "musait", tip: "3+1", net: 138, kat: 12, cephe: "Güney", fiyat: "₺8,90M" },
  { kod: "A-12-5", x: 66, y: 10.2, durum: "satildi", tip: "4+1", net: 176, kat: 12, cephe: "Güney-Batı", fiyat: "₺9,20M" },
  { kod: "A-11-1", x: 14, y: 17.6, durum: "musait", tip: "3+1", net: 138, kat: 11, cephe: "Güney-Doğu", fiyat: "₺8,60M" },
  { kod: "A-11-4", x: 53, y: 17.6, durum: "opsiyon", tip: "2+1", net: 96, kat: 11, cephe: "Güney", fiyat: "₺8,45M" },
  { kod: "A-10-3", x: 40, y: 25, durum: "musait", tip: "3+1", net: 142, kat: 10, cephe: "Güney", fiyat: "₺8,10M" },
  { kod: "A-9-6", x: 79, y: 32.4, durum: "musait", tip: "2+1", net: 94, kat: 9, cephe: "Batı", fiyat: "₺7,90M" },
  { kod: "A-8-2", x: 27, y: 39.8, durum: "opsiyon", tip: "3+1", net: 142, kat: 8, cephe: "Güney", fiyat: "₺7,60M" },
  { kod: "A-7-4", x: 53, y: 47.2, durum: "musait", tip: "2+1", net: 96, kat: 7, cephe: "Güney", fiyat: "₺7,30M" },
  { kod: "A-6-1", x: 14, y: 54.6, durum: "satildi", tip: "3+1", net: 138, kat: 6, cephe: "Güney-Doğu", fiyat: "₺7,10M" },
  { kod: "A-5-5", x: 66, y: 62, durum: "musait", tip: "2+1", net: 94, kat: 5, cephe: "Güney-Batı", fiyat: "₺6,80M" },
  { kod: "A-4-3", x: 40, y: 69.4, durum: "musait", tip: "3+1", net: 142, kat: 4, cephe: "Güney", fiyat: "₺6,55M" },
  { kod: "A-3-6", x: 79, y: 76.8, durum: "satildi", tip: "2+1", net: 94, kat: 3, cephe: "Batı", fiyat: "₺6,30M" },
];

export function CepheSahne() {
  const azHareket = useReducedMotion();
  const sahneRef = useRef<HTMLDivElement>(null);
  const [secili, setSecili] = useState<Hucre | null>(null);
  const [opsiyonlu, setOpsiyonlu] = useState<string[]>([]);

  const { scrollYProgress } = useScroll({
    target: sahneRef,
    offset: ["start start", "end end"],
  });
  const olcek = useTransform(scrollYProgress, [0, 0.6], [1.02, 1.3]);
  const katmanOpaklik = useTransform(scrollYProgress, [0.28, 0.62], [0, 1]);
  const fotoYazi = useTransform(scrollYProgress, [0.05, 0.3], [1, 0]);
  const veriYazi = useTransform(scrollYProgress, [0.55, 0.78], [0, 1]);

  useEffect(() => {
    if (!secili) return;
    const tusla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSecili(null);
    };
    window.addEventListener("keydown", tusla);
    return () => window.removeEventListener("keydown", tusla);
  }, [secili]);

  const durumBul = (h: Hucre): Durum => (opsiyonlu.includes(h.kod) ? "opsiyon" : h.durum);

  const sayilar = { musait: 0, opsiyon: 0, satildi: 0 };
  for (const h of HUCRELER) sayilar[durumBul(h)]++;

  const opsiyonAl = (h: Hucre) => {
    if (durumBul(h) !== "musait") return;
    setOpsiyonlu((p) => [...p, h.kod]);
  };

  const kare = (
    <motion.div
      style={{ scale: azHareket ? 1 : olcek }}
      className="relative w-[175%] max-w-none flex-none sm:w-full sm:max-w-3xl lg:max-w-4xl"
    >
      <div className="relative aspect-[1600/1216] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        <Image
          src="/generated/mockup-04/cephe-frontal.jpg"
          alt="Modern bir konut bloğunun akşam alacasında cepheden çekilmiş fotoğrafı, pencere ızgarası"
          fill
          sizes="(max-width: 640px) 175vw, (max-width: 1024px) 768px, 896px"
          className="object-cover"
        />
        {/* hafif sinematik perde: katman kontrastı için */}
        <div aria-hidden className="absolute inset-0 bg-[#081220]/20" />

        {/* veri katmanı: pencereler hücreye dönüşür */}
        <motion.div style={{ opacity: azHareket ? 1 : katmanOpaklik }} className="absolute inset-0">
          {HUCRELER.map((h) => {
            const durum = durumBul(h);
            const renk = RENK[durum];
            const benim = opsiyonlu.includes(h.kod);
            const seciliMi = secili?.kod === h.kod;
            return (
              <button
                key={h.kod}
                type="button"
                onClick={() => setSecili(h)}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${HUCRE_W}%`,
                  height: `${HUCRE_H}%`,
                  borderColor: seciliMi ? "#ece9e2" : `${renk}e6`,
                  background: `${renk}3a`,
                  boxShadow: `0 0 20px ${renk}55, inset 0 0 12px ${renk}2e`,
                }}
                className="absolute flex items-center justify-center rounded-[5px] border-[1.5px] transition-transform duration-200 hover:scale-[1.07] sm:rounded-[7px]"
                aria-label={`Daire ${h.kod}, ${DURUM_AD[durum]}, detay için dokun`}
              >
                <span className="mono hidden text-[9.5px] font-bold leading-none text-[#ece9e2] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:block lg:text-[11px]">
                  {h.kod}
                </span>
                {benim ? (
                  <Lock
                    size={11}
                    strokeWidth={2.5}
                    className="absolute right-0.5 top-0.5 text-[#ffd591] sm:right-1 sm:top-1"
                  />
                ) : null}
              </button>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );

  const sayacSeridi = (
    <div className="mono pointer-events-none flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] text-white/60">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-[3px] bg-[#2fb36b]" /> müsait{" "}
        <b className="font-semibold text-[#ece9e2]">{sayilar.musait}</b>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-[3px] bg-[#e3a12c]" /> opsiyon{" "}
        <b className="font-semibold text-[#ece9e2]">{sayilar.opsiyon}</b>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-[3px] bg-[#d15a4e]" /> satıldı{" "}
        <b className="font-semibold text-[#ece9e2]">{sayilar.satildi}</b>
      </span>
      <span className="font-semibold text-[#3fbfae]">yeşil hücreye dokun, opsiyonu dene</span>
    </div>
  );

  return (
    <section className="relative border-t border-white/[0.06]">
      {/* bölüm girişi */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-20 sm:pt-24">
        <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">Canlı stok</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-[#ece9e2] sm:text-4xl">
          Kamera yaklaşınca bina, sisteme dönüşür.
        </h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">
          Sahadaki beton ile panele düşen veri aynı şey. Her pencere bir birim
          kaydı: durum, fiyat, tazelik. Aşağı kaydırın, cepheye yaklaşın.
        </p>
      </div>

      {azHareket ? (
        /* reduced-motion: statik poster, veri katmanı açık */
        <div className="relative flex flex-col items-center gap-5 overflow-hidden px-0 pb-20 pt-6 sm:px-5">
          {sayacSeridi}
          <div className="flex w-full justify-center overflow-hidden">{kare}</div>
          {secili ? (
            <VeriKarti
              hucre={secili}
              durum={durumBul(secili)}
              benim={opsiyonlu.includes(secili.kod)}
              onOpsiyon={() => opsiyonAl(secili)}
              onKapat={() => setSecili(null)}
            />
          ) : null}
        </div>
      ) : (
        /* sinematik yaklaşma: 260vh parkur, sticky kadraj */
        <div ref={sahneRef} className="relative h-[260vh]">
          <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-4 overflow-hidden px-0 sm:px-5">
            {sayacSeridi}
            <div className="flex w-full flex-1 items-center justify-center overflow-hidden py-2">{kare}</div>

            {/* kadraj altyazıları: fotoğraftan veriye geçiş */}
            <div className="pointer-events-none relative h-6 w-full max-w-4xl px-5" aria-hidden>
              <motion.p
                style={{ opacity: fotoYazi }}
                className="mono absolute left-5 top-0 text-[10.5px] uppercase tracking-[0.22em] text-white/45"
              >
                Sahadaki gerçek bina
              </motion.p>
              <motion.p
                style={{ opacity: veriYazi }}
                className="mono absolute left-5 top-0 text-[10.5px] uppercase tracking-[0.22em] text-[#3fbfae]"
              >
                Aynı bina: canlı veri
              </motion.p>
            </div>
            <div className="h-4" aria-hidden />

            {secili ? (
              <VeriKarti
                hucre={secili}
                durum={durumBul(secili)}
                benim={opsiyonlu.includes(secili.kod)}
                onOpsiyon={() => opsiyonAl(secili)}
                onKapat={() => setSecili(null)}
              />
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}

function VeriKarti({
  hucre,
  durum,
  benim,
  onOpsiyon,
  onKapat,
}: {
  hucre: Hucre;
  durum: Durum;
  benim: boolean;
  onOpsiyon: () => void;
  onKapat: () => void;
}) {
  const renk = RENK[durum];
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`Daire ${hucre.kod} veri kartı`}
      className="absolute z-30 rounded-2xl border border-white/12 bg-[#0b1a2b] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.6)] max-sm:inset-x-3 max-sm:bottom-4 sm:right-6 sm:top-1/2 sm:w-80 sm:-translate-y-1/2 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-extrabold tracking-tight text-[#ece9e2]">
            Daire {hucre.kod}
          </h3>
          <p className="mono mt-0.5 text-[11px] text-white/50">
            {hucre.tip} · {hucre.kat}. kat · {hucre.cephe} cephe
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <span className="mono rounded-md border border-white/15 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wider text-white/40">
            örnek
          </span>
          <button
            type="button"
            onClick={onKapat}
            aria-label="Kapat"
            className="flex size-9 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-[#ece9e2]"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mono mt-3 grid grid-cols-2 gap-x-4 text-[11.5px]">
        {(
          [
            ["Net alan", `${hucre.net} m²`],
            ["Brüt alan", `${Math.round(hucre.net * 1.18)} m²`],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-dashed border-white/10 py-1.5">
            <span className="text-white/40">{k}</span>
            <span className="font-medium text-[#ece9e2]">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className="mono text-[24px] font-semibold leading-none tracking-tight text-[#ece9e2]">
            {hucre.fiyat}
          </div>
          <div className="mono mt-1.5 flex items-center gap-1.5 text-[10px] text-[#4fc98c]">
            <span className="size-1.5 rounded-full bg-[#2fb36b] nabiz" /> canlı · şimdi
          </div>
        </div>
        <span
          className="mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold"
          style={{ color: renk, background: `${renk}1f`, border: `1px solid ${renk}55` }}
        >
          <span className="size-1.5 rounded-full" style={{ background: renk }} />
          {DURUM_AD[durum]}
        </span>
      </div>

      {benim ? (
        <div className="mt-3.5 rounded-xl border border-[#e3a12c]/60 bg-[#e3a12c]/10 p-3">
          <div className="flex items-start gap-2.5">
            <span className="flex size-7 flex-none items-center justify-center rounded-full bg-[#e3a12c] text-[#081220]">
              <Lock size={13} strokeWidth={2.5} />
            </span>
            <p className="text-[11.5px] leading-relaxed text-[#f3cf8f]">
              48 saat size kilitlendi (örnek). Diğer danışmanların ekranında bu
              hücre artık amber ve kilitli. Çift satış DB seviyesinde imkansız.
            </p>
          </div>
        </div>
      ) : durum === "musait" ? (
        <button
          type="button"
          onClick={onOpsiyon}
          className="mt-3.5 flex h-11 w-full items-center justify-center gap-1.5 rounded-[13px] bg-[#e3a12c] text-[13.5px] font-semibold text-[#081220] transition-colors hover:bg-[#d19325]"
        >
          <Clock size={14} strokeWidth={2.2} /> Opsiyon al (dene)
        </button>
      ) : (
        <p className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11.5px] leading-relaxed text-white/55">
          {durum === "opsiyon"
            ? "Bu daire başka bir danışman tarafından opsiyonlanmış. Şu anda işlem yapılamaz."
            : "Bu daire satıldı. İşlem yapılamaz."}
        </p>
      )}
    </div>
  );
}
