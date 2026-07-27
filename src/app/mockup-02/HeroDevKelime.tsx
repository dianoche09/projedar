"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAzalt } from "@/components/landing/useAzalt";

/* Hallmark · hero: Eriyen Sayı (H4 stat-led) · tone: control-room restraint
 * Sahnenin nesnesi DEV TABULAR SAYI: müsait daire adedi. TEK sakin dram:
 * sayı 6,5 sn'de bir yumuşak count-down adımıyla düşer (satışlar); her düşüşte
 * küçük kırmızı "+N satıldı · şimdi" fişi belirip söner. 30'a inince sayaç
 * 142'ye sıfırlanır; band üzerinde kalıcı "örnek akış" rozeti durur.
 * Grafit zemin + %12 soluk gece cephesi doku; tipografi nesnedir.
 * prefers-reduced-motion: statik 142, fiş yok. TÜM VERİLER ÖRNEKTİR.
 */

const ADIMLAR = [142, 138, 121, 97, 84, 66, 51, 30] as const;
const ADIM_SURE = 6500;
const TWEEN_SURE = 900;

export function HeroDevKelime() {
  const azalt = useAzalt();
  const [adim, setAdim] = useState(0);
  const [gorunen, setGorunen] = useState<number>(ADIMLAR[0]);
  const [fis, setFis] = useState<{ id: number; adet: number } | null>(null);
  const gorunenRef = useRef<number>(ADIMLAR[0]);

  useEffect(() => {
    if (azalt) return;
    const id = window.setInterval(
      () => setAdim((a) => (a + 1) % ADIMLAR.length),
      ADIM_SURE,
    );
    return () => window.clearInterval(id);
  }, [azalt]);

  useEffect(() => {
    const hedef = ADIMLAR[adim];
    const bas = gorunenRef.current;
    let raf = 0;
    let t0 = 0;
    const tik = (t: number) => {
      const k = Math.min(1, (t - t0) / TWEEN_SURE);
      const e = 1 - Math.pow(1 - k, 3);
      const v = Math.round(bas + (hedef - bas) * e);
      gorunenRef.current = v;
      setGorunen(v);
      if (k < 1) raf = requestAnimationFrame(tik);
    };
    // ilk kare rAF içinde: efekt gövdesinde senkron setState yok
    raf = requestAnimationFrame((t) => {
      if (adim === 0) {
        // sıfırlanma: fiş yok, sayı anında oturur
        setFis(null);
        gorunenRef.current = hedef;
        setGorunen(hedef);
        return;
      }
      setFis({ id: adim, adet: ADIMLAR[adim - 1] - hedef });
      t0 = t;
      tik(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [adim]);

  return (
    <section
      className="relative flex h-svh min-h-[640px] flex-col overflow-hidden"
      style={{ background: "var(--m2-zemin)" }}
      aria-label="Eriyen sayı: müsait daire adedi satışlarla canlı düşer, bütün ağ aynı sayıyı izler"
    >
      <style>{`
        @keyframes m2hFisDus {
          0% { opacity: 0; transform: translateY(-10px); }
          14% { opacity: 1; transform: translateY(0); }
          72% { opacity: 1; transform: translateY(8px); }
          100% { opacity: 0; transform: translateY(18px); }
        }
        .m2h-fis { animation: m2hFisDus 2.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .m2h-fis { animation: none; opacity: 0; }
        }
      `}</style>

      {/* soluk arka doku: gece cephesi, yalnız zemin hissi */}
      <Image
        src="/generated/mockup-02/hero-gece-cephe.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="object-cover object-[30%_30%] opacity-[0.12]"
      />
      <div className="komuta-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

      {/* başlık: sabit tek hiyerarşi, sol üst */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 sm:px-10 sm:pt-24">
        <p className="m2-etiket text-[var(--m2-teal)]">Büyük konut projeleri için</p>
        <h1 className="m2-dev mt-4 max-w-[13ch] text-[clamp(2.4rem,7vw,4.8rem)] text-[var(--m2-ink)]">
          Stok eriyor. Ağ izliyor.
        </h1>
        <p className="mt-4 max-w-[44ch] text-pretty text-[15px] leading-relaxed text-[var(--m2-ink-soft)] sm:text-[16.5px]">
          Her satış tek canlı kayıttan düşer; bütün ağ aynı saniye aynı sayıyı
          görür. Kopya liste yok, bayat fiyat yok.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href="/kayit?rol=uretici" className="m2-btn m2-btn-dolu">
            Projenizi ağa açın
          </Link>
          <Link href="/kayit?rol=emlakci" className="m2-btn m2-btn-cizgi">
            Danışman olarak katılın
          </Link>
        </div>
      </div>

      {/* dev tabular sayı: sahnenin nesnesi */}
      <div className="relative z-10 flex min-h-0 flex-1 items-end justify-center px-6 sm:justify-end sm:px-12">
        <div className="relative" aria-live="polite">
          {fis && !azalt && (
            <p
              key={fis.id}
              className="m2h-fis absolute -top-3 right-0 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[11px] font-semibold tracking-wide sm:-right-4"
              style={{
                color: "var(--m2-red)",
                borderColor: "rgba(209,90,78,0.5)",
                background: "rgba(209,90,78,0.1)",
              }}
            >
              +{fis.adet} satıldı · şimdi
            </p>
          )}
          <p
            className="font-mono font-semibold tabular-nums leading-[0.82] tracking-tight text-[var(--m2-ink)]"
            style={{ fontSize: "min(42vw, 36vh)" }}
          >
            {azalt ? ADIMLAR[0] : gorunen}
          </p>
        </div>
      </div>

      {/* alt künye bandı: sayının altındaki mono satır */}
      <div
        className="relative z-10 border-t"
        style={{ borderColor: "var(--m2-cizgi)", background: "rgba(18,19,22,0.72)" }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-6 py-4 sm:px-10">
          <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[var(--m2-ink-soft)]">
            <span
              aria-hidden
              className="mr-2 inline-block size-2 rounded-full align-middle"
              style={{ background: "var(--m2-green)" }}
            />
            3 kule · müsait daire · canlı
          </p>
          <p
            className="rounded-full border px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--m2-ink-soft)]"
            style={{ borderColor: "var(--m2-cizgi)" }}
          >
            örnek akış
          </p>
        </div>
      </div>
    </section>
  );
}
