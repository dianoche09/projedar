import { Reveal } from "@/components/Reveal";

/**
 * "Nasıl çalışır" 4 adım, statik ikon yerine canlı CSS mini-simülasyonlar.
 * CanliHavuzDemo'nun sadeleştirilmiş kardeşleri: JS state yok, saf CSS döngü animasyonu.
 * Tüm simülasyonlar dekoratif (aria-hidden) ve "örnek" olarak işaretli.
 */

const STOK_SATIRLARI: [string, string, string][] = [
  ["A-7-2", "3+1", "₺8,75M"],
  ["A-5-1", "2+1", "₺5,80M"],
  ["B-9-4", "4+1", "₺12,2M"],
];

const TAHSIS_SATIRLARI: [string, string][] = [
  ["Yılmaz Emlak", "A Blok · 12 daire"],
  ["Ofis Kule", "Tüm proje"],
  ["D. Aksoy", "3 daire"],
];

const ADIMLAR = [
  {
    no: "01",
    baslik: "Stoğunu yükle",
    metin: "Blok, kat, daire, fiyat ve ödeme planı tek doğru kaynağa alınır. Fiyat yalnız birim kaydında tutulur, hiçbir yerde kopyalanmaz.",
  },
  {
    no: "02",
    baslik: "Tahsis et",
    metin: "Hangi emlakçı veya ofis neyi görecek, sen belirlersin: tüm proje, tek blok ya da seçili daireler. Gerisi herkese kapalı kalır.",
  },
  {
    no: "03",
    baslik: "Emlakçı tahsisli havuzda görür",
    metin: "Emlakçı yalnız kendine açılan daireleri canlı görür; fiyat paylaşımda o anki canlı değerden basılır, tazelik damgası hep görünür.",
  },
  {
    no: "04",
    baslik: "Opsiyon kilidi devreye girer",
    metin: "Opsiyon alınan daire anında kilitlenir. DB kilidi: aynı birime ikinci opsiyon teknik olarak imkânsız, söz değil, veritabanı kuralı.",
  },
];

function StokYukleSim() {
  return (
    <div className="rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-3" aria-hidden>
      <div className="mb-1.5 grid grid-cols-[1fr_auto_auto_14px] items-center gap-2.5 border-b border-[var(--cizgi)] pb-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
        <span>Daire</span>
        <span>Tip</span>
        <span>Fiyat</span>
        <span />
      </div>
      {STOK_SATIRLARI.map(([kod, tip, fiyat], i) => (
        <div
          key={kod}
          className="msim-satir grid grid-cols-[1fr_auto_auto_14px] items-center gap-2.5 border-b border-dashed border-[var(--cizgi)] py-1.5 font-mono text-[10.5px] text-ink last:border-b-0"
          style={{ animationDelay: `${i * 0.9}s` }}
        >
          <span className="font-semibold">{kod}</span>
          <span className="text-ink-soft">{tip}</span>
          <span className="font-semibold">{fiyat}</span>
          <span className="text-center text-[11px] font-bold text-green">+</span>
        </div>
      ))}
    </div>
  );
}

function TahsisSim() {
  return (
    <div className="rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-3" aria-hidden>
      {TAHSIS_SATIRLARI.map(([ad, kapsam], i) => (
        <div
          key={ad}
          className="flex items-center justify-between gap-2 border-b border-dashed border-[var(--cizgi)] py-1.5 last:border-b-0"
        >
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold text-ink">{ad}</div>
            <div className="msim-acik truncate font-mono text-[9px] text-[var(--color-teal-d)]" style={{ animationDelay: `${i * 0.75}s` }}>
              {kapsam} açık
            </div>
          </div>
          <span className="msim-iz relative h-[16px] w-[30px] flex-none rounded-full" style={{ animationDelay: `${i * 0.75}s` }}>
            <span
              className="msim-top absolute left-[2px] top-[2px] size-[12px] rounded-full bg-white shadow-[0_1px_2px_rgba(16,36,58,0.25)]"
              style={{ animationDelay: `${i * 0.75}s` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

function HavuzSim() {
  return (
    <div className="relative" aria-hidden>
      {/* arkada soluk kart, havuzdaki diğer tahsisli birimler hissi */}
      <div className="absolute inset-x-2 -top-1.5 h-8 rounded-xl border border-[var(--cizgi)] bg-white/55" />
      <div className="relative rounded-xl border border-[var(--cizgi)] bg-white p-3 shadow-[var(--golge-1)]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold text-ink">A-7-2 · 3+1</span>
          <span className="durum d-musait"><span className="nokta" />Müsait</span>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-2">
          <div>
            <div className="font-mono text-[17px] font-semibold leading-none text-ink">₺8,75M</div>
            <div className="mt-0.5 font-mono text-[9px] text-[var(--ink-faint)]">142 m² net · Güney</div>
          </div>
          <span className="taze t-0"><span className="nokta nabiz" />2 dk önce</span>
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[9px] text-[var(--ink-faint)]">yalnız tahsisli birimler görünür</p>
    </div>
  );
}

function OpsiyonKilitSim() {
  return (
    <div aria-hidden>
      <div className="relative overflow-hidden rounded-xl border border-[var(--cizgi)] bg-white p-3 pt-3.5 shadow-[var(--golge-1)]">
        {/* üst sinyal şeridi, müsait yeşil ↔ opsiyon amber çapraz geçiş */}
        <span className="msim-a absolute inset-x-0 top-0 h-1 bg-green" />
        <span className="msim-b absolute inset-x-0 top-0 h-1 bg-amber" />
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold text-ink">A-7-2 · ₺8,75M</span>
          <span className="relative inline-block h-[18px] w-[76px]">
            <span className="msim-a durum d-musait absolute right-0 top-0"><span className="nokta" />Müsait</span>
            <span className="msim-b durum d-opsiyon absolute right-0 top-0"><span className="nokta" />Opsiyon</span>
          </span>
        </div>
        <div className="msim-red mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--color-red-soft)] px-2 py-1.5 font-mono text-[9.5px] font-semibold text-[#a23f34]">
          <span aria-hidden>✕</span> 2. opsiyon denemesi, veritabanı reddetti
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[9px] text-[var(--ink-faint)]">DB kilidi: ikinci opsiyon teknik olarak imkânsız</p>
    </div>
  );
}

const SIMLER = [StokYukleSim, TahsisSim, HavuzSim, OpsiyonKilitSim];

export function NasilCalisirAdimlar() {
  return (
    <>
      <style>{`
        @keyframes msimSatir {
          0% { opacity: 0; transform: translateY(-5px); }
          6% { opacity: 1; transform: none; }
          88% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes msimIz {
          0%, 16% { background: rgba(16, 36, 58, 0.18); }
          26%, 86% { background: var(--color-teal); }
          100% { background: rgba(16, 36, 58, 0.18); }
        }
        @keyframes msimTop {
          0%, 16% { transform: translateX(0); }
          26%, 86% { transform: translateX(14px); }
          100% { transform: translateX(0); }
        }
        @keyframes msimAcik {
          0%, 20% { opacity: 0; }
          30%, 84% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes msimA {
          0%, 42% { opacity: 1; }
          52%, 88% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes msimB {
          0%, 42% { opacity: 0; }
          52%, 88% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes msimRed {
          0%, 58% { opacity: 0; transform: translateY(4px); }
          66%, 86% { opacity: 1; transform: none; }
          100% { opacity: 0; }
        }
        .msim-satir { opacity: 0; animation: msimSatir 7s ease-in-out infinite both; }
        .msim-iz { background: rgba(16, 36, 58, 0.18); animation: msimIz 6s ease-in-out infinite both; }
        .msim-top { animation: msimTop 6s ease-in-out infinite both; }
        .msim-acik { opacity: 0; animation: msimAcik 6s ease-in-out infinite both; }
        .msim-a { animation: msimA 8s ease-in-out infinite both; }
        .msim-b { opacity: 0; animation: msimB 8s ease-in-out infinite both; }
        .msim-red { opacity: 0; animation: msimRed 8s ease-in-out infinite both; }
        @media (prefers-reduced-motion: reduce) {
          .msim-satir, .msim-iz, .msim-top, .msim-acik, .msim-a, .msim-b, .msim-red { animation: none !important; }
          .msim-satir, .msim-acik, .msim-red { opacity: 1; transform: none; }
          .msim-b { opacity: 0; }
        }
      `}</style>

      <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ADIMLAR.map((a, i) => {
          const Sim = SIMLER[i];
          return (
            <Reveal key={a.no} delay={i * 90}>
              <li className="kart kart-3d relative flex h-full flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-teal/30">{a.no}</span>
                  <span className="rounded-md border border-[var(--cizgi-2)] bg-white px-1.5 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">örnek</span>
                </div>
                <Sim />
                <h3 className="mt-4 font-display text-base font-bold tracking-tight text-ink">{a.baslik}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{a.metin}</p>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </>
  );
}
