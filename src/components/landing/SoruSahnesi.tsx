"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAzalt } from "./useAzalt";

/**
 * SoruSahnesi · m4 saha-whatsapp dilinden (kullanıcı seçimi).
 * Danışmanın en yorucu sorusu üç balonda birikir: "Hâlâ müsait mi?"
 * Ardından başlık düşer ve "sorulmuyor." kelimesinin üstü soldan sağa çizilir.
 * Görünüme girince başlar, kısa beklemeyle sürekli döner. Reduced-motion: statik son kare.
 */

const BALONLAR = [
  { m: "Bu daire hâlâ müsait mi?", z: "Salı 09:12" },
  { m: "Hâlâ müsait mi acaba?", z: "Perşembe 14:47" },
  { m: "Abi kusura bakma yine soracağım, hâlâ müsait mi?", z: "Bugün 08:03" },
];

const ADIM_ARALIK = 750;
const CIZGI_GECIKME = 900;
const DONGU_BEKLE = 5000;

export function SoruSahnesi() {
  const kok = useRef<HTMLDivElement>(null);
  const zamanlar = useRef<number[]>([]);
  const oynatRef = useRef<() => void>(() => {});
  const azalt = useAzalt();
  // adim: 0 boş · 1-3 balonlar · 4 çizgi çekildi
  const [adim, setAdim] = useState(0);

  const temizle = useCallback(() => {
    zamanlar.current.forEach((z) => window.clearTimeout(z));
    zamanlar.current = [];
  }, []);

  const oynat = useCallback(() => {
    temizle();
    if (azalt) {
      setAdim(4);
      return;
    }
    setAdim(0);
    for (let n = 1; n <= 3; n++) {
      zamanlar.current.push(window.setTimeout(() => setAdim(n), n * ADIM_ARALIK));
    }
    zamanlar.current.push(window.setTimeout(() => setAdim(4), 3 * ADIM_ARALIK + CIZGI_GECIKME));
    zamanlar.current.push(
      window.setTimeout(() => oynatRef.current(), 3 * ADIM_ARALIK + CIZGI_GECIKME + DONGU_BEKLE),
    );
  }, [azalt, temizle]);

  useEffect(() => {
    oynatRef.current = oynat;
  }, [oynat]);

  useEffect(() => {
    const el = kok.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          gozlemci.disconnect();
          oynat();
        }
      },
      { threshold: 0.3 },
    );
    gozlemci.observe(el);
    return () => {
      gozlemci.disconnect();
      temizle();
    };
  }, [oynat, temizle]);

  return (
    <div ref={kok} className="mx-auto max-w-3xl text-center">
      {/* biriken sorular */}
      <div className="mx-auto flex max-w-md flex-col items-end gap-3" aria-hidden={adim === 0}>
        {BALONLAR.map((b, i) => {
          const acik = adim >= i + 1;
          return (
            <div
              key={b.m}
              className="max-w-[92%] rounded-2xl rounded-br-md border border-[var(--cizgi)] bg-white px-4 py-2.5 text-left shadow-[var(--golge-1)] transition-all duration-500"
              style={{
                opacity: acik ? (adim >= 4 && i < 2 ? 0.55 : 1) : 0,
                transform: acik ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <p className="text-[13.5px] leading-snug text-ink">{b.m}</p>
              <p className="mt-1 text-right font-mono text-[10px] text-[var(--ink-faint)]">{b.z}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mt-10 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Bu soru artık{" "}
        <span className="relative inline-block whitespace-nowrap">
          sorulmuyor.
          <span
            aria-hidden
            className="absolute -left-[1%] top-[54%] h-[0.09em] w-[103%] origin-left rounded-full bg-[#c0564a]"
            style={{
              transform: adim >= 4 ? "rotate(-3deg) scaleX(1)" : "rotate(-3deg) scaleX(0)",
              transition: azalt ? undefined : "transform 520ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </span>
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
        Müteahhidin sana tahsis ettiği daireleri tek canlı havuzdan görürsün. Fiyat günceldir, durum
        bellidir, kimseye sormazsın: bakarsın, paylaşırsın, opsiyonlarsın.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/kayit?rol=emlakci" className="btn-action h-12 px-7 text-[15px]">
          Emlakçıyım, ücretsiz başla →
        </Link>
        <Link
          href="/muteahhit"
          className="inline-flex h-12 items-center justify-center rounded-full border-2 border-ink px-7 text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Proje sahibiyim
        </Link>
      </div>
      <p className="mt-4 text-[13px] text-ink-soft">
        Emlakçıya <b className="font-semibold text-[#1f7d4c]">tamamen ücretsiz</b>. Komisyonun{" "}
        <b className="font-semibold text-[#1f7d4c]">%100&apos;ü senin</b>, biz aradan pay almayız.
      </p>
    </div>
  );
}
