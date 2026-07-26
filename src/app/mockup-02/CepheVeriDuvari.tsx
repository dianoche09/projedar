import Image from "next/image";

/**
 * CepheVeriDuvari · Mockup 02 hero görseli (gerçek görsel, fal.ai üretimi).
 * Gece cephesi ürün anlatımının kendisidir: pencere ızgarası = canlı stok
 * ızgarası. Görselin üzerine gerçek kodla durum noktaları (yeşil nabızlı,
 * amber, kırmızı) ve mono fiyat çipleri bindirilir; sağdaki karanlık negatif
 * alan anlatım panelini taşır. Duotone + grafit degrade ile zemine harmanlanır.
 * Mobil ayrı kompozisyon: görsel kuleye kırpılır (sol kaydırma), çipler
 * gizlenir, anlatım görsel altına iner. İşaret yerleşimi ÖRNEKTİR.
 */

type Isaret = {
  x: number; // görselin yüzdesi (1920x1088 oranlı kutu içinde sabit)
  y: number;
  renk: string;
  gecikme: string;
  cip?: { kod: string; detay: string; renkAd: string };
};

const ISARETLER: Isaret[] = [
  {
    x: 29.5,
    y: 26,
    renk: "#2fb36b",
    gecikme: "0s",
    cip: { kod: "A-12-3", detay: "₺7,4M · müsait", renkAd: "#5ed492" },
  },
  {
    x: 21.5,
    y: 47,
    renk: "#e3a12c",
    gecikme: "0.7s",
    cip: { kod: "A-9-1", detay: "opsiyon · 41 sa", renkAd: "#eab23f" },
  },
  {
    x: 44,
    y: 57,
    renk: "#d15a4e",
    gecikme: "1.3s",
    cip: { kod: "A-6-2", detay: "satıldı", renkAd: "#e0796e" },
  },
  { x: 17, y: 36, renk: "#2fb36b", gecikme: "1.8s" },
  { x: 47.5, y: 76, renk: "#2fb36b", gecikme: "0.4s" },
  { x: 36, y: 66.5, renk: "#e3a12c", gecikme: "1.1s" },
];

export function CepheVeriDuvari() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        {/* mobil: kuleye kırpılmış geniş şerit; sm+: tam kare */}
        <div className="relative -ml-[18%] w-[175%] sm:ml-0 sm:w-full">
          <div className="relative aspect-[1920/1088]">
            <Image
              src="/generated/mockup-02/hero-gece-cephe.jpg"
              alt="Gece konut kulesi cephesi: yanan pencereler canlı stok kayıtları gibi"
              fill
              priority
              sizes="(min-width: 640px) 100vw, 175vw"
              className="m2-cephe-img object-cover"
            />
            {/* duotone teal tonu + grafit zemine harman */}
            <div className="m2-cephe-teal" aria-hidden />
            <div className="m2-cephe-ton" aria-hidden />

            {/* pencere ızgarasına hizalı canlı durum işaretleri */}
            <div aria-hidden>
              {ISARETLER.map((isaret) => (
                <div
                  key={`${isaret.x}-${isaret.y}`}
                  className="absolute"
                  style={{ left: `${isaret.x}%`, top: `${isaret.y}%` }}
                >
                  <span className="relative block size-2 rounded-full sm:size-2.5" style={{ background: isaret.renk }}>
                    <span
                      className="m2-halka"
                      style={{ color: isaret.renk, animationDelay: isaret.gecikme }}
                    />
                  </span>
                  {isaret.cip ? (
                    <span className="absolute left-3.5 top-1/2 hidden -translate-y-1/2 items-center sm:flex">
                      <span className="h-px w-5 bg-white/30" />
                      <span className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-white/15 bg-[rgba(18,19,22,0.85)] px-2.5 py-1.5 font-mono text-[10px] leading-none text-white/85">
                        <b className="font-semibold">{isaret.cip.kod}</b>
                        <span style={{ color: isaret.cip.renkAd }}>{isaret.cip.detay}</span>
                      </span>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {/* sağ karanlık negatif alan: anlatım paneli (desktop) */}
            <div className="absolute right-[4%] top-1/2 hidden w-[30%] max-w-[340px] -translate-y-1/2 lg:block">
              <p className="m2-etiket text-[var(--m2-teal)]">Cephe, canlı veri duvarı</p>
              <p className="mt-4 font-display text-[22px] font-extrabold leading-snug tracking-tight text-white xl:text-[26px]">
                Her pencere bir kayıt. Durum, fiyat, tazelik: hepsi canlı.
              </p>
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/55">
                Proje ağa açıldığında blok kesiti bu cephe gibi okunur: yeşil müsait, amber opsiyonda, kırmızı satıldı.
              </p>
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-green" /> müsait</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber" /> opsiyon</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-red" /> satıldı</span>
              </p>
            </div>

            {/* dürüstlük rozeti */}
            <span className="absolute left-3 top-3 rounded border border-white/15 bg-[rgba(18,19,22,0.7)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/55 sm:left-auto sm:right-4 sm:top-4">
              örnek yerleşim
            </span>
          </div>
        </div>
      </div>

      {/* mobil + tablet: anlatım görselin altında (ayrı kompozisyon) */}
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:hidden">
        <p className="m2-etiket text-[var(--m2-teal)]">Cephe, canlı veri duvarı</p>
        <p className="mt-3 max-w-md font-display text-[18px] font-extrabold leading-snug tracking-tight text-white">
          Her pencere bir kayıt. Durum, fiyat, tazelik: hepsi canlı.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/60">
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-green" /> müsait</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber" /> opsiyon</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-red" /> satıldı</span>
        </p>
      </div>
    </div>
  );
}
