import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Search } from "lucide-react";
import { Logo } from "@/components/Logo";

/** "örnek" işaret rozeti: örnek veri gerçek veriyle karışmasın. */
export function OrnekRozet() {
  return (
    <span className="mono rounded-md border border-[var(--cizgi-2)] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
      örnek
    </span>
  );
}

/** İkonlu madde kartı; sinyal verilirse üstte 4px renk şeridi çıkar. */
export function MaddeKart({
  Ikon,
  baslik,
  metin,
  sinyal,
}: {
  Ikon: LucideIcon;
  baslik: string;
  metin: ReactNode;
  sinyal?: string;
}) {
  return (
    <div
      className={`kart p-5 text-left ${sinyal ? "signal-top" : ""}`}
      style={sinyal ? ({ "--_sig": sinyal } as CSSProperties) : undefined}
    >
      <Ikon size={20} strokeWidth={1.9} className="text-navy" />
      <h3 className="mt-3 text-[15px] font-bold text-ink">{baslik}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{metin}</p>
    </div>
  );
}

/** Numaralı adım dizisi (nasıl çalışır / sonraki adım). */
export function AdimSirasi({ adimlar }: { adimlar: { baslik: string; metin: string }[] }) {
  const kolon = adimlar.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <ol className={`grid gap-3 text-left sm:grid-cols-2 ${kolon}`}>
      {adimlar.map((a, i) => (
        <li key={a.baslik} className="kart p-5">
          <span className="mono text-[11px] font-bold text-teal">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-2 text-[15px] font-bold text-ink">{a.baslik}</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{a.metin}</p>
        </li>
      ))}
    </ol>
  );
}

/** Onay işaretli madde satırı (çözüm slaytları). */
export function OnayMadde({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={19} strokeWidth={2} className="mt-0.5 flex-none text-teal" />
      <span className="text-[15px] leading-relaxed text-ink">{children}</span>
    </li>
  );
}

/** Tazelik rozet ölçeği: sistemin imza sinyali, eşik eşik. */
export function TazelikOlcek() {
  const esikler = [
    { sinif: "t-0", etiket: "2 sa önce", nabiz: true, aciklama: "0-24 saat: canlı" },
    { sinif: "t-7", etiket: "3 gün önce", nabiz: false, aciklama: "1-7 gün: güncel" },
    { sinif: "t-15", etiket: "12 gün önce", nabiz: false, aciklama: "7-15 gün: dikkat" },
    { sinif: "t-eski", etiket: "23 gün önce", nabiz: false, aciklama: "15 gün ve üzeri: güncel değil" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {esikler.map((e) => (
        <div key={e.sinif} className="kart p-4">
          <span className={`taze ${e.sinif} text-[13px]`}>
            <span className={`nokta ${e.nabiz ? "nabiz" : ""}`} /> {e.etiket}
          </span>
          <p className="mono mt-2.5 text-[10.5px] leading-relaxed text-[var(--ink-faint)]">{e.aciklama}</p>
        </div>
      ))}
    </div>
  );
}

/** Canlı fiyatlı mini birim kartı (tek doğru kaynak görseli). */
export function CanliBirimKart({ dipnot }: { dipnot: string }) {
  return (
    <div className="kart signal-top p-5" style={{ "--_sig": "#2fb36b" } as CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-ink">A-7-2</p>
          <p className="mono mt-0.5 text-[11px] text-ink-soft">3+1 · 7. kat · Güney cephe</p>
        </div>
        <OrnekRozet />
      </div>
      <p className="mono mt-4 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
        Liste fiyatı · canlı
      </p>
      <p className="mono mt-1 text-[30px] font-semibold leading-none tracking-tight text-ink">₺8,45M</p>
      <p className="mt-2 flex items-center gap-1.5">
        <span className="taze t-0 text-[11.5px]">
          <span className="nokta nabiz" /> 2 dk önce güncellendi
        </span>
      </p>
      <p className="mono mt-3 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-3 text-[10.5px] leading-relaxed text-[#1f7d4c]">
        {dipnot}
      </p>
    </div>
  );
}

/** Kim-getirdi sorgu kartı: ad/telefon sorgusu ve ilk kayıt sonucu. */
export function LeadSorguKart() {
  return (
    <div className="kart mx-auto max-w-md p-5 text-left">
      <div className="flex items-center justify-between gap-2">
        <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Müşteri sorgusu</p>
        <OrnekRozet />
      </div>
      <div className="mt-3 flex items-center gap-2.5 rounded-[13px] border border-[var(--cizgi-2)] bg-[var(--color-soft)] px-3.5 py-3">
        <Search size={16} strokeWidth={2} className="flex-none text-[var(--ink-faint)]" />
        <span className="mono text-[14px] tracking-wide text-ink">0532 ··· ·· 48</span>
      </div>
      <div className="mt-3 rounded-[13px] border border-teal bg-[var(--color-teal-soft)] px-3.5 py-3">
        <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-teal-d)]">
          Sorgu sonucu
        </p>
        <p className="mt-1 text-[14px] font-semibold text-ink">İlk kayıt: D. Aksoy · 14 gün önce</p>
      </div>
    </div>
  );
}

/** Kapak / kapanış slaytı: aurora + ızgara doku + logo + büyük mesaj. */
export function KapakSlayt({
  kicker,
  baslik,
  alt,
  children,
}: {
  kicker: string;
  baslik: ReactNode;
  alt?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden px-6 pb-24 pt-20 text-center">
      <div className="izgara-doku absolute inset-0" aria-hidden />
      <div className="hero-aurora" aria-hidden />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <Logo size={64} />
        <p className="mono mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-teal">{kicker}</p>
        <h1 className="font-display mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-ink sm:text-6xl">
          {baslik}
        </h1>
        {alt ? <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{alt}</p> : null}
        {children}
      </div>
    </div>
  );
}
