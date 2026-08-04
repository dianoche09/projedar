/* eslint-disable @next/next/no-img-element -- tam ekran sinematik arkaplan, statik public görsel */
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Search } from "lucide-react";
import { Logo } from "@/components/Logo";

/** "örnek" işaret rozeti: örnek veri gerçek veriyle karışmasın (koyu zemin). */
export function OrnekRozet({ acik = false }: { acik?: boolean }) {
  return acik ? (
    <span className="mono rounded-md border border-[var(--cizgi-2)] bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
      örnek
    </span>
  ) : (
    <span className="mono rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
      örnek
    </span>
  );
}

/** Tam ekran görsel slayt: kapak, bölüm geçişi ve büyük mesaj sahneleri. */
export function GorselSlayt({
  gorsel,
  hiza = "orta",
  logo = false,
  kicker,
  baslik,
  alt,
  children,
}: {
  /** public/sunum altındaki dosya, ör. "/sunum/santiye-gece.jpg" */
  gorsel: string;
  /** orta: ortalanmış kapak · sol: sola yaslı bölüm başlığı */
  hiza?: "orta" | "sol";
  logo?: boolean;
  kicker?: string;
  baslik: ReactNode;
  alt?: ReactNode;
  children?: ReactNode;
}) {
  const orta = hiza === "orta";
  return (
    <div className="relative flex min-h-full w-full items-center overflow-hidden px-6 pb-24 pt-20 sm:px-12">
      <div className={`deck-gorsel ${orta ? "" : "sol"}`} aria-hidden>
        <img src={gorsel} alt="" className="kenburns" />
      </div>
      <div
        className={`relative z-10 flex w-full flex-col ${
          orta ? "mx-auto max-w-4xl items-center text-center" : "max-w-3xl items-start text-left"
        }`}
      >
        {logo ? (
          <span className="da da-1 mb-7">
            <Logo size={60} acik />
          </span>
        ) : null}
        {kicker ? (
          <p className="da da-1 mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#2fd3bc]">{kicker}</p>
        ) : null}
        <h1 className="da da-2 font-display mt-4 text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-[64px]">
          {baslik}
        </h1>
        {alt ? (
          <p className={`da da-3 mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-xl ${orta ? "" : ""}`}>
            {alt}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** İkonlu madde kartı (koyu cam); sinyal verilirse üstte 4px renk şeridi. */
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
      className={`deck-kart p-5 text-left ${sinyal ? "signal-top" : ""}`}
      style={sinyal ? ({ "--_sig": sinyal } as CSSProperties) : undefined}
    >
      <Ikon size={20} strokeWidth={1.9} className="text-[#2fd3bc]" />
      <h3 className="mt-3 text-[15px] font-bold text-white">{baslik}</h3>
      <p className="deck-soft mt-1.5 text-[13px] leading-relaxed">{metin}</p>
    </div>
  );
}

/** Numaralı adım dizisi (koyu cam kartlar). */
export function AdimSirasi({ adimlar }: { adimlar: { baslik: string; metin: string }[] }) {
  const kolon = adimlar.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <ol className={`grid gap-3 text-left sm:grid-cols-2 ${kolon}`}>
      {adimlar.map((a, i) => (
        <li key={a.baslik} className="deck-kart p-5">
          <span className="mono text-[11px] font-bold text-[#2fd3bc]">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-2 text-[15px] font-bold text-white">{a.baslik}</h3>
          <p className="deck-soft mt-1.5 text-[13px] leading-relaxed">{a.metin}</p>
        </li>
      ))}
    </ol>
  );
}

/** Onay işaretli madde satırı. */
export function OnayMadde({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 size={19} strokeWidth={2} className="mt-0.5 flex-none text-[#2fd3bc]" />
      <span className="text-[15px] leading-relaxed text-white/90">{children}</span>
    </li>
  );
}

/** Dev vurgu istatistiği: mono büyük rakam + etiket (+ opsiyonel kaynak). */
export function DevSayi({
  deger,
  etiket,
  kaynak,
  renk = "#ffffff",
}: {
  deger: string;
  etiket: string;
  kaynak?: string;
  renk?: string;
}) {
  return (
    <div className="deck-kart p-6 text-left">
      <p className="deck-dev text-[40px] sm:text-[52px]" style={{ color: renk }}>
        {deger}
      </p>
      <p className="mt-2.5 text-[13.5px] font-semibold leading-snug text-white/90">{etiket}</p>
      {kaynak ? <p className="deck-faint mono mt-1.5 text-[10px] uppercase tracking-wider">{kaynak}</p> : null}
    </div>
  );
}

/** Tazelik rozet ölçeği (koyu tema renkleri): sistemin imza sinyali. */
export function TazelikOlcek() {
  const esikler = [
    { renk: "#3ddc8f", nabiz: true, etiket: "2 sa önce", aciklama: "0-24 saat: canlı" },
    { renk: "#3ddc8f", nabiz: false, etiket: "3 gün önce", aciklama: "1-7 gün: güncel" },
    { renk: "#e8b04b", nabiz: false, etiket: "12 gün önce", aciklama: "7-15 gün: dikkat" },
    { renk: "#e07a6e", nabiz: false, etiket: "23 gün önce", aciklama: "15 gün ve üzeri: güncel değil" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {esikler.map((e) => (
        <div key={e.etiket} className="deck-kart p-4 text-left">
          <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: e.renk }}>
            <span
              className={`size-2 flex-none rounded-full ${e.nabiz ? "nabiz" : ""}`}
              style={{ background: e.renk }}
            />
            {e.etiket}
          </span>
          <p className="deck-faint mono mt-2.5 text-[10.5px] leading-relaxed">{e.aciklama}</p>
        </div>
      ))}
    </div>
  );
}

/** Canlı fiyatlı mini birim kartı: koyu zeminde parlayan BEYAZ kanıt kartı. */
export function CanliBirimKart({ dipnot }: { dipnot: string }) {
  return (
    <div
      className="kart signal-top p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
      style={{ "--_sig": "#2fb36b" } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-extrabold tracking-tight text-ink">A-7-2</p>
          <p className="mono mt-0.5 text-[11px] text-ink-soft">3+1 · 7. kat · Güney cephe</p>
        </div>
        <OrnekRozet acik />
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

/** Kim-getirdi sorgu kartı: beyaz kanıt kartı (koyu zeminde pop). */
export function LeadSorguKart() {
  return (
    <div className="kart mx-auto max-w-md p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2">
        <p className="mono text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">Müşteri sorgusu</p>
        <OrnekRozet acik />
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
