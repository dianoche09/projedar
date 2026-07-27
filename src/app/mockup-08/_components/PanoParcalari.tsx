import type { CSSProperties } from "react";

/**
 * MOCKUP 08 · ortak pano parçaları
 * Magnet daire kartı + mini danışman panosu. Saf sunum; hem hero
 * koreografisi hem alt bölümler kullanır. Sinyal renkleri sabittir.
 */

export type KartDurum = "yesil" | "amber" | "kirmizi";

const DURUM_SINIF: Record<KartDurum, string> = {
  yesil: "m8-k-yesil",
  amber: "m8-k-amber",
  kirmizi: "m8-k-kirmizi",
};

export function MagnetKart({
  kod,
  tip,
  fiyat,
  durum,
  nabiz = false,
  className = "",
  style,
}: {
  kod: string;
  tip: string;
  fiyat: string;
  durum: KartDurum;
  nabiz?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`m8-kart ${DURUM_SINIF[durum]} ${nabiz ? "m8-kart-nabiz" : ""} ${className}`}
      style={style}
    >
      <span>
        <span className="m8-kart-kod block">{kod}</span>
        <span className="m8-kart-tip block">{tip}</span>
      </span>
      <span className="m8-kart-fiyat">{fiyat}</span>
    </span>
  );
}

/** mini danışman panosu: 6x3 hücre; hedef hücre koreografiyle renk değiştirir */
export function MiniPano({
  ad,
  hedefIndex = 7,
  doluIndexler = [1, 4, 9, 12, 16],
  agDisi = false,
  className = "",
  style,
}: {
  ad: string;
  hedefIndex?: number;
  doluIndexler?: number[];
  agDisi?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`m8-mini ${agDisi ? "m8-mini-agdisi" : ""} ${className}`}
      style={style}
    >
      <span className="m8-mini-ad">
        {ad}
        {agDisi ? <span className="text-[#a23f34]">eski</span> : null}
      </span>
      <span className="m8-mini-izgara">
        {Array.from({ length: 18 }, (_, i) => (
          <i
            key={i}
            className={
              i === hedefIndex
                ? "m8-mini-hedef"
                : doluIndexler.includes(i)
                  ? "dolu"
                  : undefined
            }
          />
        ))}
      </span>
      {agDisi ? <span className="m8h-mini-uyari">güncellenmedi</span> : null}
    </span>
  );
}
