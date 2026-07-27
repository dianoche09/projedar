import type { ReactNode } from "react";

/**
 * MOCKUP 10 · Baskı parçaları
 * Letterpress dünyasının küçük, tekrar kullanılan basılı parçaları:
 * pirinç süsleme ayracı ve soluk "eski baskı" davetiye kartı.
 */

export function Susleme({ className = "" }: { className?: string }) {
  return (
    <div className={`m10-susleme ${className}`} aria-hidden>
      <i />
    </div>
  );
}

type EskiBaskiProps = {
  ad: string;
  eskiFiyat: string;
  surum: string;
  muhur?: ReactNode;
  className?: string;
};

/** Soluk, geçersiz eski davetiye baskısı: üstü çizili fiyat + mühür */
export function EskiBaskiKarti({ ad, eskiFiyat, surum, muhur, className = "" }: EskiBaskiProps) {
  return (
    <div className={`m10-eski-baski px-4 pb-4 pt-3 text-center ${className}`}>
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#8b8f98]">
        {surum}
      </p>
      <p className="m10-serif mt-1.5 text-[15px] font-semibold tracking-wide text-[#4a5261]">{ad}</p>
      <p className="mono m10-cizik-fiyat mx-auto mt-1.5 inline-block text-[13px] font-semibold">
        {eskiFiyat}
      </p>
      <div className="mt-2 flex justify-center">
        {muhur ?? <span className="m10-muhur m10-muhur-gecersiz text-[9px]">geçersiz baskı</span>}
      </div>
    </div>
  );
}
