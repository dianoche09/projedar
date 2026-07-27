/**
 * LuksStok · "canlı stok" bölümü: lüks kule stoğunun tek doğru kaynaktan
 * okunan canlı kaydı. Statik sunum (server bileşen); durum rozetleri ve
 * tazelik etiketleri tasarım sisteminin sabit sinyalleriyle basılır.
 * TÜM VERİLER ÖRNEKTİR.
 */

type Durum = "musait" | "opsiyon" | "satildi";

type Birim = {
  kod: string;
  tip: string;
  metrekare: string;
  fiyat: string;
  durum: Durum;
  durumYazi: string;
  taze: string;
  tazeSinif: "t-0" | "t-7" | "t-15" | "t-eski";
  nabiz?: boolean;
};

const BIRIMLER: Birim[] = [
  { kod: "PH-42-1", tip: "5+1 çatı dubleksi", metrekare: "412", fiyat: "₺48,5M", durum: "musait", durumYazi: "Müsait", taze: "az önce", tazeSinif: "t-0", nabiz: true },
  { kod: "B-33-4", tip: "5+1 rezidans", metrekare: "366", fiyat: "₺39,7M", durum: "musait", durumYazi: "Müsait", taze: "2 sa önce", tazeSinif: "t-0" },
  { kod: "C-28-2", tip: "4+1 rezidans", metrekare: "297", fiyat: "₺31,2M", durum: "satildi", durumYazi: "Satıldı", taze: "dün", tazeSinif: "t-7" },
  { kod: "B-4-2", tip: "4+1 rezidans", metrekare: "289", fiyat: "₺24,5M", durum: "opsiyon", durumYazi: "Opsiyon", taze: "3 dk önce", tazeSinif: "t-0", nabiz: true },
  { kod: "A-17-3", tip: "3+1 rezidans", metrekare: "204", fiyat: "₺19,8M", durum: "musait", durumYazi: "Müsait", taze: "bugün", tazeSinif: "t-7" },
  { kod: "A-9-1", tip: "2+1 rezidans", metrekare: "148", fiyat: "₺14,9M", durum: "musait", durumYazi: "Müsait", taze: "16 gün önce", tazeSinif: "t-15" },
];

const DURUM_SINIF: Record<Durum, string> = {
  musait: "d-musait",
  opsiyon: "d-opsiyon",
  satildi: "d-satildi",
};

export function LuksStok() {
  return (
    <div className="kart overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3 sm:px-5">
        <span className="flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
          <span className="freshdot nabiz bg-green" />
          Marmara Kule · 142 birim · canlı kayıt
        </span>
        <span className="rounded-md border border-[var(--cizgi-2)] bg-white px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          örnek veri
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Birim</th>
              <th>Tip</th>
              <th>m²</th>
              <th>Fiyat</th>
              <th>Durum</th>
              <th>Tazelik</th>
            </tr>
          </thead>
          <tbody>
            {BIRIMLER.map((b) => (
              <tr key={b.kod}>
                <td className="mono font-semibold">{b.kod}</td>
                <td className="text-ink-soft">{b.tip}</td>
                <td className="mono text-ink-soft">{b.metrekare}</td>
                <td className="mono font-bold">{b.fiyat}</td>
                <td>
                  <span className={`durum ${DURUM_SINIF[b.durum]}`}>
                    <span className="nokta" />
                    {b.durumYazi}
                  </span>
                </td>
                <td>
                  <span className={`taze ${b.tazeSinif}`}>
                    <span className={`nokta${b.nabiz ? " nabiz" : ""}`} />
                    {b.taze}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
