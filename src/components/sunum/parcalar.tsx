/* eslint-disable @next/next/no-img-element -- tam ekran sinematik arkaplan, statik public görsel */
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Building2, CheckCircle2, MessageCircle, Search } from "lucide-react";
import { Logo } from "@/components/Logo";

/** Marka yazımı: metindeki "Projedar" logo formatında basılır (proje + yeşil "dar"). */
export function markali(v: ReactNode): ReactNode {
  if (typeof v !== "string" || !v.includes("Projedar")) return v;
  const parcalar = v.split("Projedar");
  return parcalar.map((p, i) => (
    <span key={i}>
      {i > 0 ? (
        <span className="font-display font-extrabold tracking-tight">
          proje<span className="text-[#2fd3bc]">dar</span>
        </span>
      ) : null}
      {p}
    </span>
  ));
}

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
    <div className="relative flex min-h-full w-full items-center overflow-hidden px-6 pb-20 pt-14 sm:px-12">
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
          {markali(baslik)}
        </h1>
        {alt ? (
          <p className={`da da-3 mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-xl ${orta ? "" : ""}`}>
            {markali(alt)}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** Tam ekran alıntı/vuruş slaytı: tek büyük cümle + opsiyonel alt satır. */
export function AlintiSlayt({ metin, alt }: { metin: ReactNode; alt?: string }) {
  return (
    <div className="flex min-h-full w-full items-center justify-center px-6 pb-24 pt-20">
      <div className="max-w-4xl text-center">
        <p className="da da-1 font-display text-3xl font-extrabold leading-[1.18] text-white sm:text-[44px]">
          &ldquo;{markali(metin)}&rdquo;
        </p>
        {alt ? (
          <p className="da da-2 deck-soft mx-auto mt-7 max-w-2xl text-[15px] leading-relaxed sm:text-lg">{markali(alt)}</p>
        ) : null}
      </div>
    </div>
  );
}

/** SaaS katalog görünümü: tarayıcı çerçevesi içinde ürün ekranı/bileşeni.
 *  kucult: yüksek demoları slayta sığdırır (zoom) · zemin="acik": açık zeminli
 *  ürün grafikleri (AgDiyagrami vb.) doğru renklerle basılır. */
export function EkranKart({
  url = "projedar.com",
  kucult = false,
  zemin = "koyu",
  children,
}: {
  url?: string;
  kucult?: boolean;
  zemin?: "koyu" | "acik";
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#0b1c2e] shadow-[0_26px_90px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="flex flex-none gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-[#e07a6e]/80" />
          <i className="size-2.5 rounded-full bg-[#e8b04b]/80" />
          <i className="size-2.5 rounded-full bg-[#3ddc8f]/80" />
        </span>
        <span className="mono mx-auto flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1 text-[10.5px] text-white/65">
          <span className="size-1.5 rounded-full bg-[#3ddc8f]" aria-hidden /> {url}
        </span>
        <span className="w-12 flex-none" aria-hidden />
      </div>
      <div
        className={`p-3 sm:p-4 ${zemin === "acik" ? "bg-[#eef1f6]" : ""}`}
        style={kucult ? ({ zoom: 0.62 } as React.CSSProperties) : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/** İçerikle ilgili fotoğraf kartı (grid içinde yan görsel). */
export function GorselKart({ src, oran = "aspect-[4/3]" }: { src: string; oran?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/12 shadow-[0_20px_70px_rgba(0,0,0,0.5)] ${oran}`}>
      {}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

/** Eski düzen (✕) ve Projedar (✓) karşılaştırma tablosu. */
export function FarkTablosu({
  eski,
  yeni,
  eskiBaslik = "Bugünkü düzen",
  yeniBaslik = "Projedar ile",
}: {
  eski: string[];
  yeni: string[];
  eskiBaslik?: string;
  yeniBaslik?: string;
}) {
  return (
    <div className="grid gap-3 text-left lg:grid-cols-2">
      <div className="deck-kart p-5 sm:p-6">
        <p className="mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#e07a6e]">{eskiBaslik}</p>
        <ul className="mt-4 space-y-3">
          {eski.map((m) => (
            <li key={m} className="flex items-start gap-2.5">
              <span className="mono flex-none text-[13px] font-bold text-[#e07a6e]">✕</span>
              <span className="deck-soft text-[13.5px] leading-relaxed">{markali(m)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="deck-kart border-[#2fd3bc]/40 bg-[rgba(47,211,188,0.08)] p-5 sm:p-6">
        <p className="mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#2fd3bc]">{yeniBaslik}</p>
        <ul className="mt-4 space-y-3">
          {yeni.map((m) => (
            <li key={m} className="flex items-start gap-2.5">
              <span className="mono flex-none text-[13px] font-bold text-[#2fd3bc]">✓</span>
              <span className="text-[13.5px] leading-relaxed text-white/90">{markali(m)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Senaryo zaman çizelgesi satırı: mono saat + olay (72 saat senaryo slaytı). */
export function ZamanSatir({ saat, metin, kirmizi = false }: { saat: string; metin: string; kirmizi?: boolean }) {
  return (
    <div
      className={`deck-kart flex items-center gap-4 px-5 py-3.5 text-left ${
        kirmizi ? "border-[#e07a6e]/60 bg-[rgba(224,122,110,0.1)]" : ""
      }`}
    >
      <span className={`mono w-24 flex-none text-[12px] font-bold ${kirmizi ? "text-[#e07a6e]" : "text-[#2fd3bc]"}`}>
        {saat}
      </span>
      <span className={`text-[14.5px] font-medium leading-snug ${kirmizi ? "text-[#ffb3a8]" : "text-white/90"}`}>
        {metin}
      </span>
    </div>
  );
}

/** Soru-cevap kartı (SSS slaytları). */
export function SoruKart({ soru, cevap }: { soru: string; cevap: string }) {
  return (
    <div className="deck-kart p-5 text-left">
      <p className="text-[15px] font-bold leading-snug text-white">{markali(soru)}</p>
      <p className="deck-soft mt-2 text-[13px] leading-relaxed">{markali(cevap)}</p>
    </div>
  );
}

/** Yatay akış şeması: bina ikonlu üretici → animasyonlu projedar logosu → danışman avatarları. */
export function AkisSema({
  dugumler,
}: {
  dugumler: { baslik: string; alt: string; vurgu?: boolean; gorsel?: "bina" | "danisman" | "logo" }[];
}) {
  return (
    <div className="flex flex-col items-stretch gap-2.5 text-left lg:flex-row lg:items-stretch">
      {dugumler.map((d, i) => (
        <div key={d.baslik} className="contents">
          {i > 0 ? (
            <span className="mono flex flex-none items-center justify-center text-[18px] font-bold text-[#2fd3bc] lg:px-1">
              ⇄
            </span>
          ) : null}
          <div
            className={`flex-1 rounded-2xl border p-4 sm:p-5 ${
              d.vurgu
                ? "border-[#2fd3bc] bg-[rgba(47,211,188,0.12)] shadow-[0_0_40px_rgba(47,211,188,0.18)]"
                : "deck-kart"
            }`}
          >
            {d.gorsel === "logo" ? (
              <div className="flex items-center gap-3.5">
                <span className="relative inline-flex flex-none">
                  <span className="deck-ping" aria-hidden />
                  <span className="deck-ping" style={{ animationDelay: "0.7s" }} aria-hidden />
                  <Logo size={42} acik />
                </span>
                <div>
                  <p className="font-display text-[21px] font-extrabold leading-none tracking-tight text-white">
                    proje<span className="text-[#2fd3bc]">dar</span>
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-white/90">{d.alt}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-1.5" aria-hidden>
                  {d.gorsel === "bina" ? (
                    <>
                      <span className="deck-ikon !h-9 !w-9"><Building2 size={17} strokeWidth={1.9} /></span>
                      <span className="deck-ikon !h-9 !w-9 opacity-80"><Building2 size={15} strokeWidth={1.9} /></span>
                      <span className="deck-ikon !h-9 !w-9 opacity-60"><Building2 size={13} strokeWidth={1.9} /></span>
                    </>
                  ) : null}
                  {d.gorsel === "danisman" ? (
                    <>
                      {["AY", "DA", "MK"].map((ad, j) => (
                        <span
                          key={ad}
                          className="mono -ml-1 flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/12 text-[10px] font-bold text-white/90 first:ml-0"
                          style={{ zIndex: 3 - j }}
                        >
                          {ad}
                        </span>
                      ))}
                      <span className="deck-ikon !h-9 !w-9 -ml-1"><MessageCircle size={16} strokeWidth={1.9} /></span>
                    </>
                  ) : null}
                </div>
                <p className="text-[14.5px] font-bold text-white">{markali(d.baslik)}</p>
                <p className="deck-soft mt-1 text-[12px] leading-relaxed">{d.alt}</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Canlı fiyat listesi mock'u: KPI şeridi + stok barı + durum/tazelik rozetli satırlar. */
export function FiyatListesiMock() {
  const satirlar = [
    { kod: "A-04 · 2+1", fiyat: "₺4.850.000", taze: "güncel", yeni: false, renk: "#2fb36b" },
    { kod: "A-07 · 3+1", fiyat: "₺6.320.000", taze: "az önce", yeni: true, renk: "#2fb36b" },
    { kod: "A-09 · 3+1", fiyat: "₺6.410.000", taze: "güncel", yeni: false, renk: "#e3a12c" },
    { kod: "A-11 · 4+1", fiyat: "₺8.150.000", taze: "güncel", yeni: false, renk: "#d15a4e" },
  ];
  return (
    <div className="kart overflow-hidden p-0 text-left shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3">
        <span className="font-display text-[14px] font-bold text-ink">Vadi Konakları · A Blok</span>
        <OrnekRozet acik />
      </div>
      <div className="border-b border-[var(--cizgi)] px-4 py-3">
        <div className="mono flex items-center gap-3.5 text-[11px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-green" /> 25 müsait</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber" /> 7 opsiyon</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-red" /> 6 satıldı</span>
        </div>
        <div className="stokbar mt-2.5">
          <span style={{ width: "66%", background: "#2fb36b" }} />
          <span style={{ width: "18%", background: "#e3a12c" }} />
          <span style={{ width: "16%", background: "#d15a4e" }} />
        </div>
      </div>
      <div>
        {satirlar.map((s) => (
          <div key={s.kod} className="flex items-center justify-between gap-3 border-b border-[var(--cizgi)] px-4 py-2.5 last:border-b-0">
            <span className="mono flex items-center gap-2 text-[12px] font-semibold text-ink">
              <span className="size-2 flex-none rounded-[3px]" style={{ background: s.renk }} aria-hidden />
              {s.kod}
            </span>
            <span className="mono text-[13.5px] font-semibold text-ink">{s.fiyat}</span>
            <span className={`taze ${s.yeni ? "t-0" : "t-7"} text-[10.5px]`}>
              <span className={`nokta ${s.yeni ? "nabiz" : ""}`} /> {s.taze}
            </span>
          </div>
        ))}
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
      <span className="deck-ikon">
        <Ikon size={20} strokeWidth={1.9} />
      </span>
      <h3 className="mt-3.5 text-[15px] font-bold text-white">{markali(baslik)}</h3>
      <p className="deck-soft mt-1.5 text-[13px] leading-relaxed">{markali(metin)}</p>
    </div>
  );
}

/** Numaralı adım dizisi (koyu cam kartlar); akisli=true → üstte animasyonlu veri akışı hattı. */
export function AdimSirasi({
  adimlar,
  akisli = false,
}: {
  adimlar: { baslik: string; metin: string }[];
  akisli?: boolean;
}) {
  const kolon = adimlar.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <div>
      {akisli ? (
        <div className="relative mb-5 hidden lg:block" aria-hidden>
          <div className="deck-akis absolute inset-x-10 top-1/2 h-[2px] -translate-y-1/2" />
          <span className="deck-akis-nokta" />
          <div className={`relative grid gap-3 ${kolon}`}>
            {adimlar.map((a) => (
              <span key={a.baslik} className="mx-auto flex size-5 items-center justify-center rounded-full border border-[#2fd3bc]/50 bg-[#0a1f33]">
                <span className="size-2.5 rounded-full bg-[#2fd3bc] shadow-[0_0_10px_rgba(47,211,188,0.9)]" />
              </span>
            ))}
          </div>
        </div>
      ) : null}
    <ol className={`grid gap-3 text-left sm:grid-cols-2 ${kolon}`}>
      {adimlar.map((a, i) => (
        <li key={a.baslik} className="deck-kart p-5">
          <span className="deck-ikon mono !h-9 !w-9 text-[13px] font-bold">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 text-[15px] font-bold text-white">{markali(a.baslik)}</h3>
          <p className="deck-soft mt-1.5 text-[13px] leading-relaxed">{markali(a.metin)}</p>
        </li>
      ))}
    </ol>
    </div>
  );
}

/** Onay işaretli madde satırı. */
export function OnayMadde({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        size={19}
        strokeWidth={2}
        className="mt-0.5 flex-none text-[#2fd3bc] drop-shadow-[0_0_8px_rgba(47,211,188,0.55)]"
      />
      <span className="text-[15px] leading-relaxed text-white/90">{markali(children)}</span>
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
    <div className="deck-kart min-w-0 p-5 text-left sm:p-6">
      <p className="deck-dev break-words text-[30px] sm:text-[36px] lg:text-[42px]" style={{ color: renk }}>
        {deger}
      </p>
      <p className="mt-2.5 text-[13.5px] font-semibold leading-snug text-white/90">{markali(etiket)}</p>
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
