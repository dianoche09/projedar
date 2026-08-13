import type { ReactNode } from "react";

type Rozet = { etiket: string; renk?: string; bg?: string; nabiz?: boolean };

/**
 * Tüm danışman/panel sayfalarında ORTAK sayfa başlığı (pool referansı).
 * Yapı: rozet (opsiyonel) + h1 (font-display 27/31 navy) + alt metin + sağ aksiyon slotu.
 * Kullanıcı kuralı (2026-08-14): tüm sayfalar aynı başlık yapısı; içerik sağ alanı tam doldurur (max-w-[1240px]).
 */
export function SayfaBaslik({
  rozet,
  baslik,
  altMetin,
  sag,
}: {
  rozet?: Rozet;
  baslik: string;
  altMetin?: string;
  sag?: ReactNode;
}) {
  const renk = rozet?.renk ?? "var(--color-teal)";
  return (
    <header className="belir mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {rozet ? (
          <div className="mb-1.5 flex items-center gap-2.5">
            <span className="rozet" style={{ background: rozet.bg ?? "rgba(30,155,138,.12)", color: renk }}>
              <span className={`freshdot ${rozet.nabiz ? "nabiz" : ""}`} style={{ background: renk }} />
              {rozet.etiket}
            </span>
          </div>
        ) : null}
        <h1 className="font-display text-[27px] font-bold leading-none tracking-tight text-navy md:text-[31px]">
          {baslik}
        </h1>
        {altMetin ? <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">{altMetin}</p> : null}
      </div>
      {sag ? <div className="flex flex-none items-center gap-2">{sag}</div> : null}
    </header>
  );
}

/** Standart içerik sarmalayıcı: sağ alanı tam dolduran genişlik (pool ile aynı). */
export function SayfaKabuk({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1240px] text-ink">{children}</div>;
}
