/**
 * Güncel durum tablosu. YALNIZ gerçekten tablo gerektiren sayfalarda kullanılır
 * (her rehbere zorla eklenmez). Semantik <table>; mobilde yatay kaydırma
 * güvenli (taşma yaratmaz).
 */
export function GuncelDurumTablosu({
  baslik,
  kolonlar,
  satirlar,
  dipnot,
}: {
  baslik?: string;
  kolonlar: string[];
  satirlar: (string | React.ReactNode)[][];
  dipnot?: string;
}) {
  return (
    <figure className="not-prose kart overflow-hidden p-0">
      {baslik ? (
        <figcaption className="border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-3 font-display text-sm font-semibold text-ink">
          {baslik}
        </figcaption>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-[var(--cizgi)]">
              {kolonlar.map((k) => (
                <th
                  key={k}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {satirlar.map((satir, i) => (
              <tr
                key={i}
                className="border-b border-[var(--cizgi)] last:border-0 hover:bg-[var(--color-soft)]/60"
              >
                {satir.map((hucre, j) => (
                  <td
                    key={j}
                    className={`px-5 py-3 align-top text-ink ${j === 0 ? "font-medium" : "text-ink-soft"}`}
                  >
                    {hucre}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {dipnot ? (
        <figcaption className="border-t border-[var(--cizgi)] px-5 py-2.5 text-[11.5px] text-[var(--ink-faint)]">
          {dipnot}
        </figcaption>
      ) : null}
    </figure>
  );
}
