"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * HeroKesitMasasi · Mockup 01 hero: "Kesit Masası" konsepti.
 * Fiziksel kesit maketi bir masa sahnesidir; üstünde 4 karelik otomatik
 * koreografi oynar (sayfa açılışından ~2 sn sonra, ~14 sn döngü):
 *   K1 Açılış: sakin maket + hücre pinleri, hero hücre nabızlı (B-4-2).
 *   K2 Etkileşim: iki danışman kartı kadraj kenarından süzülür, çizgiler uzar.
 *   K3 Kilit: D1 çizgisi oturur, pin amber olur, kilit pimi saplanır;
 *             D2 çizgisi hücre sınırından kırmızı çarpı ile geri seker.
 *   K4 Yayılım: masadaki mini danışman ekranları amber'e döner (130 ms sıra),
 *             tek sakin dalga, köşede "kilit · 48 sa" fişi; ağ dışı ekran donuk kalır.
 * Kullanıcı "izle/tekrar" ile baştan, hücreye dokunarak 2. kareden başlatır.
 * prefers-reduced-motion: K4'ün son hali statik gösterilir, döngü çalışmaz.
 * Mobil: başlık üstte, maket dikey crop, sahne tek hücre + 2 kart + 2 mini
 * ekranla sadeleşir. TÜM VERİLER ÖRNEKTİR.
 */

type Kare = 1 | 2 | 3 | 4;
type Durum = "musait" | "opsiyon" | "satildi";

const YESIL = "#2fb36b";
const AMBER = "#e3a12c";
const KIRMIZI = "#d15a4e";
const TEAL = "#1e9b8a";
const GRI = "#8fa0b2";

const RENK: Record<Durum, string> = {
  musait: YESIL,
  opsiyon: AMBER,
  satildi: KIRMIZI,
};

/* kare süreleri (ms) · toplam döngü ~14 sn */
const SURELER: Record<Kare, number> = { 1: 3000, 2: 3500, 3: 3000, 4: 4500 };

const KARE_METNI: Record<Kare, string> = {
  1: "Kare 1: Maket sakin, B-4-2 dairesi müsait ve nabız atıyor.",
  2: "Kare 2: İki danışman aynı daireye uzanıyor.",
  3: "Kare 3: Danışman 1 opsiyon kilidini aldı, Danışman 2 hücre sınırından geri döndü: erişim kapalı.",
  4: "Kare 4: Kilit tüm tahsisli danışman ekranlarına yayıldı; ağ dışı ekran güncellenmedi.",
};

/* maket üzerindeki hücre pinleri (x/y: fotoğraf yüzdesi) */
type Pin = { kod: string; x: number; y: number; durum: Durum; hero?: boolean };

const PINLER: Pin[] = [
  { kod: "B-4-2", x: 44, y: 34, durum: "musait", hero: true },
  { kod: "B-5-2", x: 44, y: 23, durum: "musait" },
  { kod: "B-5-3", x: 52, y: 22, durum: "opsiyon" },
  { kod: "B-4-4", x: 65, y: 39, durum: "musait" },
  { kod: "B-3-2", x: 41, y: 47, durum: "satildi" },
  { kod: "B-2-3", x: 49.5, y: 59, durum: "musait" },
  { kod: "B-2-6", x: 71, y: 61, durum: "opsiyon" },
  { kod: "B-1-3", x: 49.5, y: 70, durum: "musait" },
];

/* masa yüzeyindeki mini danışman ekranları */
const EKRANLAR = [
  { ad: "Ekran 1", agDisi: false, konum: "left-[29%] top-[84%] sm:left-[14%] sm:top-[85%]" },
  { ad: "Ekran 2", agDisi: false, konum: "hidden sm:block sm:left-[31%] sm:top-[88%]" },
  { ad: "Ekran 3", agDisi: false, konum: "hidden sm:block sm:left-[48%] sm:top-[86%]" },
  { ad: "Ekran 4", agDisi: true, konum: "left-[46%] top-[87%] sm:left-[66%] sm:top-[88%]" },
] as const;

export function HeroKesitMasasi() {
  const [kare, setKare] = useState<Kare>(1);
  const [oynuyor, setOynuyor] = useState(false);
  const [oynadi, setOynadi] = useState(false);
  const [statik, setStatik] = useState(false);

  /* açılış: reduced-motion ise statik son kare, değilse ~2 sn sonra otomatik başla */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* hydration sonrası tek kare ertele: senkron setState cascade'i yok */
      const kimlik = requestAnimationFrame(() => {
        setStatik(true);
        setKare(4);
      });
      return () => cancelAnimationFrame(kimlik);
    }
    const gecikme = setTimeout(() => {
      setOynadi(true);
      setOynuyor(true);
    }, 2000);
    return () => clearTimeout(gecikme);
  }, []);

  /* koreografi saati: kare süresi dolunca sıradakine geç, K4'ten K1'e döngü */
  useEffect(() => {
    if (!oynuyor || statik) return;
    const zamanlayici = setTimeout(() => {
      setKare((s) => (s === 4 ? 1 : ((s + 1) as Kare)));
    }, SURELER[kare]);
    return () => clearTimeout(zamanlayici);
  }, [kare, oynuyor, statik]);

  const baslat = useCallback(
    (k: Kare) => {
      if (statik) return;
      setOynadi(true);
      setOynuyor(true);
      setKare(k);
    },
    [statik]
  );

  /* geçiş yardımcıları: statik modda inline transition kapalı */
  const gecis = (deger: string) => (statik ? "none" : deger);

  const d1CizgiStil = {
    strokeDashoffset: kare >= 2 ? 0 : 100,
    transition: gecis(
      kare >= 2
        ? "stroke-dashoffset 2.6s cubic-bezier(0.4, 0, 0.2, 1) 0.45s"
        : "stroke-dashoffset 0.9s ease"
    ),
  };
  const d2CizgiStil = {
    strokeDashoffset: kare >= 3 ? 46 : kare === 2 ? 0 : 100,
    transition: gecis(
      kare >= 3
        ? "stroke-dashoffset 0.22s cubic-bezier(0.6, 0, 1, 1)"
        : kare === 2
          ? "stroke-dashoffset 2.9s cubic-bezier(0.4, 0, 0.2, 1) 0.45s"
          : "stroke-dashoffset 0.9s ease"
    ),
  };

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:pt-8">
      <style>{`
        @keyframes kmNabizHalka {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.7); }
          70%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.75); }
        }
        .km-nabiz-halka { animation: kmNabizHalka 1.7s ease-out infinite; }
        @keyframes kmKilitDus {
          0% { opacity: 0; transform: translateY(-16px); }
          55% { opacity: 1; transform: translateY(2px); }
          75%, 100% { opacity: 1; transform: translateY(0); }
        }
        .km-kilit { animation: kmKilitDus 0.45s cubic-bezier(0.5, 0, 0.65, 1) both; }
        @keyframes kmGolgeBelir {
          0%, 50% { opacity: 0; }
          70% { opacity: 1; }
          100% { opacity: 0.75; }
        }
        .km-golge { animation: kmGolgeBelir 0.6s ease-out both; }
        @keyframes kmCarpi {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .km-carpi { animation: kmCarpi 0.16s cubic-bezier(0.2, 0, 0.4, 1) 0.24s both; }
        @keyframes kmBelir {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .km-belir { animation: kmBelir 0.35s ease-out both; }
        @keyframes kmItme {
          0% { transform: translateX(0); }
          35% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        .km-itme { animation: kmItme 0.3s cubic-bezier(0.3, 0, 0.3, 1) 0.22s 1; }
        @keyframes kmMiniNabiz {
          0% { box-shadow: 0 0 0 0 rgba(227, 161, 44, 0.55); }
          100% { box-shadow: 0 0 0 10px rgba(227, 161, 44, 0); }
        }
        .km-mini-nabiz { animation: kmMiniNabiz 0.85s ease-out both; }
        @keyframes kmDalga {
          0% { box-shadow: 0 0 0 0 rgba(30, 155, 138, 0.4); }
          100% { box-shadow: 0 0 0 110px rgba(30, 155, 138, 0); }
        }
        .km-dalga { animation: kmDalga 2s cubic-bezier(0.2, 0.6, 0.4, 1) 0.5s both; }
        @media (prefers-reduced-motion: reduce) {
          .km-nabiz-halka, .km-kilit, .km-golge, .km-carpi, .km-belir, .km-itme, .km-mini-nabiz, .km-dalga { animation: none; }
          .km-nabiz-halka, .km-dalga { opacity: 0; }
        }
      `}</style>

      <div className="relative">
        {/* ============ BAŞLIK: mobilde üstte, masaüstünde sol üst negatif alanda ============ */}
        <div className="relative z-30 pb-6 lg:absolute lg:left-[4%] lg:top-[6.5%] lg:max-w-[420px] lg:pb-0">
          <h1 className="dt-display text-[clamp(27px,4.5vw,40px)] font-extrabold leading-[1.07] text-ink">
            Bir daire satıldığında,
            <br />
            bütün ağ aynı anda görür.
          </h1>
          <p className="mt-3 max-w-[42ch] text-[13.5px] leading-relaxed text-ink-soft sm:text-[14.5px]">
            Fiyat, durum ve opsiyon tek kayıtta yaşar; yalnız tahsisli danışman
            ağına yayılır. Kesit masasında izleyin.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link href="/kayit?rol=uretici" className="dt-tus dt-tus-dolu !min-h-[44px] !px-4 !text-[11.5px]">
              Projemi canlı ağa aç
            </Link>
            <Link href="/kayit?rol=emlakci" className="dt-tus dt-tus-cizgi !min-h-[44px] !px-4 !text-[11.5px]">
              Danışman olarak katıl
            </Link>
          </div>
          <a
            href="#sistem"
            className="mt-3.5 inline-flex min-h-[44px] items-center gap-1.5 font-mono text-[11.5px] font-semibold text-ink-soft underline decoration-[var(--cizgi-2)] underline-offset-4 transition-colors hover:text-ink"
          >
            Sistemin nasıl çalıştığını gör
            <span aria-hidden>↓</span>
          </a>
        </div>

        {/* ============ SAHNE: kesit masası ============ */}
        <div className="dt-cerceve relative p-1.5 sm:p-2">
          {/* köşe kayıt işaretleri */}
          <span aria-hidden className="absolute -left-[5px] -top-[5px] size-3 border-l-[1.5px] border-t-[1.5px] border-ink" />
          <span aria-hidden className="absolute -right-[5px] -top-[5px] size-3 border-r-[1.5px] border-t-[1.5px] border-ink" />
          <span aria-hidden className="absolute -bottom-[5px] -left-[5px] size-3 border-b-[1.5px] border-l-[1.5px] border-ink" />
          <span aria-hidden className="absolute -bottom-[5px] -right-[5px] size-3 border-b-[1.5px] border-r-[1.5px] border-ink" />

          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1px] border border-[var(--cizgi)] sm:aspect-[1920/1088]">
            {/* iç kadraj: fotoğraf oranı sabit, mobilde dikey crop; tüm sahne
                koordinatları bu katmanın yüzdeleridir */}
            <div className="absolute inset-y-0 left-1/2 aspect-[1920/1088] h-full -translate-x-1/2">
              <Image
                src="/generated/mockup-01/hero-kesit-maket.jpg"
                alt="Konut projesinin fiziksel kesit maketi bir masa üzerinde: katlar ve daireler açıkta, üzerinde canlı durum işaretleri"
                fill
                priority
                sizes="(min-width: 640px) 1100px, 235vw"
                className="object-cover"
              />
              {/* duotone işleme: ink gölge + teal ışıma, marka paletine bağlar */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background:
                    "linear-gradient(155deg, rgba(16,36,58,0.28) 0%, rgba(16,36,58,0.05) 42%, rgba(30,155,138,0.13) 100%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(247,245,239,0.05) 0%, transparent 30%, rgba(16,36,58,0.16) 100%)",
                }}
              />

              {/* danışman çizgileri: kart -> hücre (path-draw), mobil ve masaüstü ayrı yol */}
              <svg
                className="pointer-events-none absolute inset-0 z-[6] h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M 39 67.5 C 42 57, 42.5 46, 43.6 36.2"
                  className="sm:hidden"
                  fill="none"
                  stroke={TEAL}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  style={d1CizgiStil}
                />
                <path
                  d="M 16.5 60 C 26 55, 34 45, 43.4 35.4"
                  className="hidden sm:block"
                  fill="none"
                  stroke={TEAL}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  style={d1CizgiStil}
                />
                <path
                  d="M 52.5 21.5 C 50.5 25.5, 49.3 29, 48.7 32.2"
                  className="sm:hidden"
                  fill="none"
                  stroke={GRI}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  style={d2CizgiStil}
                />
                <path
                  d="M 79.5 24 C 68 26, 57 29.5, 48.9 33"
                  className="hidden sm:block"
                  fill="none"
                  stroke={GRI}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={100}
                  strokeDasharray={100}
                  style={d2CizgiStil}
                />
              </svg>

              {/* K4: tek sakin dalga halkası */}
              {kare === 4 && !statik ? (
                <span
                  className="km-dalga pointer-events-none absolute z-[5] size-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: "44%", top: "34%" }}
                  aria-hidden
                />
              ) : null}

              {/* hücre pinleri: dokunma alanı 44px, tıklayınca 2. kareden başlar */}
              {PINLER.map((p) => {
                const heroMu = Boolean(p.hero);
                const durum: Durum = heroMu && kare >= 3 ? "opsiyon" : p.durum;
                return (
                  <button
                    key={p.kod}
                    type="button"
                    onClick={() => baslat(2)}
                    aria-label={`${p.kod} dairesi: koreografiyi bu hücreden başlat`}
                    className={`absolute z-[7] size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
                      heroMu ? "flex" : "hidden sm:flex"
                    }`}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  >
                    {heroMu && kare <= 2 && !statik ? (
                      <span
                        aria-hidden
                        className="km-nabiz-halka absolute left-1/2 top-1/2 size-7 rounded-full border-2"
                        style={{ borderColor: YESIL }}
                      />
                    ) : null}
                    <span
                      aria-hidden
                      className={`flex items-center justify-center rounded-full border-2 border-white shadow-[0_1px_5px_rgba(16,36,58,0.45)] transition-colors duration-300 ${
                        heroMu ? "size-4" : "size-3"
                      }`}
                      style={{ background: RENK[durum] }}
                    >
                      {durum === "opsiyon" ? (
                        <Lock size={6} strokeWidth={3.5} className="text-white" />
                      ) : null}
                    </span>
                  </button>
                );
              })}

              {/* hero hücre etiketi */}
              <div className="pointer-events-none absolute z-[8]" style={{ left: "44%", top: "34%" }} aria-hidden>
                {kare >= 3 ? (
                  <span
                    key="kilitli"
                    className="km-belir absolute -top-[36px] left-0 -translate-x-1/2 whitespace-nowrap rounded-[2px] border-[1.5px] bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-ink shadow-[0_2px_8px_rgba(16,36,58,0.22)]"
                    style={{ borderColor: AMBER }}
                  >
                    B-4-2 · opsiyon · kilitli
                  </span>
                ) : (
                  <span
                    key="fiyat"
                    className="absolute -top-[32px] left-0 -translate-x-1/2 whitespace-nowrap rounded-[2px] border border-[var(--cizgi-2)] bg-white/95 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink"
                  >
                    B-4-2 · ₺9,4M
                  </span>
                )}
              </div>

              {/* K3: fiziksel kilit pimi (düşme + klik) */}
              {kare >= 3 ? (
                <div className="pointer-events-none absolute z-[9]" style={{ left: "44%", top: "34%" }} aria-hidden>
                  <span className="km-golge absolute -left-[7px] top-[7px] block h-[5px] w-[14px] rounded-full bg-[rgba(16,36,58,0.35)] blur-[1.5px]" />
                  <div className="km-kilit relative">
                    <span className="absolute -top-[24px] left-[-1.5px] block h-[19px] w-[3px] rounded-[1px] bg-ink" />
                    <span
                      className="absolute -top-[32px] left-[-5px] block size-2.5 rounded-[2px] border-[2.5px] border-ink"
                      style={{ background: AMBER }}
                    />
                  </div>
                </div>
              ) : null}

              {/* K3: D2 çizgisinin hücre sınırında kırmızı çarpı ile geri sekişi */}
              {kare >= 3 ? (
                <span
                  className="km-carpi absolute z-[9] flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] bg-white shadow-[0_1px_4px_rgba(16,36,58,0.3)]"
                  style={{ left: "48.6%", top: "32.6%", borderColor: KIRMIZI }}
                  aria-hidden
                >
                  <svg viewBox="0 0 8 8" className="size-2">
                    <path d="M1 1 L7 7 M7 1 L1 7" stroke={KIRMIZI} strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              ) : null}

              {/* Danışman 1: teal çerçeve, soldan süzülür */}
              <div
                className="absolute left-[29%] top-[67%] z-[8] w-[116px] sm:left-[5.5%] sm:top-[57%] sm:w-[132px]"
                style={{
                  transform: kare >= 2 ? "translateX(0)" : "translateX(-170%)",
                  opacity: kare >= 2 ? 1 : 0,
                  transition: gecis("transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease"),
                }}
                aria-hidden
              >
                <div className="rounded-[2px] border-[1.5px] bg-white p-2 shadow-[0_3px_10px_rgba(16,36,58,0.2)]" style={{ borderColor: TEAL }}>
                  <p className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink">
                    <span
                      className="flex size-4 flex-none items-center justify-center rounded-full text-[7px] font-bold text-white"
                      style={{ background: TEAL }}
                    >
                      D1
                    </span>
                    Danışman 1
                  </p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-ink-soft">tahsisli ağ</p>
                  {kare >= 3 ? (
                    <p className="km-belir mt-1 inline-flex items-center gap-1 rounded-[2px] bg-[var(--color-amber-soft)] px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-wider text-[#9a6a12]">
                      <Lock size={7} strokeWidth={3} />
                      opsiyon aldı
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Danışman 2: gri çerçeve, sağdan süzülür; K3'te sert geri itme */}
              <div
                className={`absolute left-[50%] top-[14%] z-[8] w-[116px] sm:left-[79%] sm:top-[20%] sm:w-[132px] ${
                  kare === 3 && !statik ? "km-itme" : ""
                }`}
                style={{
                  transform: kare >= 2 ? "translateX(0)" : "translateX(170%)",
                  opacity: kare >= 2 ? 1 : 0,
                  transition: gecis("transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, opacity 0.4s ease 0.12s"),
                }}
                aria-hidden
              >
                <div className="rounded-[2px] border-[1.5px] border-[#b7c2cd] bg-white p-2 shadow-[0_3px_10px_rgba(16,36,58,0.16)]">
                  <p className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-ink">
                    <span className="flex size-4 flex-none items-center justify-center rounded-full bg-[#8fa0b2] text-[7px] font-bold text-white">
                      D2
                    </span>
                    Danışman 2
                  </p>
                  <p className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-ink-soft">tahsis dışı</p>
                  {kare >= 3 ? (
                    <p className="km-belir mt-1 inline-flex items-center gap-1 rounded-[2px] bg-[var(--color-red-soft)] px-1.5 py-0.5 font-mono text-[7.5px] font-bold uppercase tracking-wider text-[#a23f34]">
                      erişim kapalı
                    </p>
                  ) : null}
                </div>
              </div>

              {/* masa yüzeyi: mini danışman ekranları */}
              {EKRANLAR.map((e, i) => {
                const guncel = kare >= 4 && !e.agDisi;
                return (
                  <div key={e.ad} className={`pointer-events-none absolute z-[7] w-[96px] sm:w-[106px] ${e.konum}`} aria-hidden>
                    <div
                      className={`rounded-[2px] border border-[var(--cizgi-2)] bg-white/95 px-2 py-1.5 shadow-[0_2px_8px_rgba(16,36,58,0.18)] ${
                        e.agDisi ? "opacity-75 grayscale-[0.3]" : ""
                      } ${guncel && !statik ? "km-mini-nabiz" : ""}`}
                      style={guncel && !statik ? { animationDelay: `${i * 130}ms` } : undefined}
                    >
                      <p className="font-mono text-[7.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                        {e.ad}
                        {e.agDisi ? " · ağ dışı" : ""}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 font-mono text-[9.5px] font-semibold text-ink">
                        <span
                          className="size-1.5 flex-none rounded-full transition-colors duration-300"
                          style={{ background: guncel ? AMBER : YESIL }}
                        />
                        B-4-2 · {guncel ? "opsiyon" : "müsait"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ---- dış kadraj katmanı: köşe fişleri ve kontrol ---- */}
            {kare === 4 ? (
              <span
                className="km-belir absolute right-2.5 top-2.5 z-[9] inline-flex items-center gap-1.5 rounded-[2px] border-[1.5px] bg-white/95 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#9a6a12]"
                style={{ borderColor: AMBER }}
                aria-hidden
              >
                <Lock size={9} strokeWidth={3} />
                kilit · 48 sa
              </span>
            ) : null}

            <span className="pointer-events-none absolute bottom-2 left-2.5 z-[9] font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/85 mix-blend-difference">
              örnek veri
            </span>

            {statik ? null : (
              <button
                type="button"
                onClick={() => baslat(1)}
                className="absolute bottom-2 right-2 z-[10] inline-flex min-h-[44px] items-center gap-1.5 rounded-[2px] border-[1.5px] border-ink bg-white/95 px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-white"
              >
                <span aria-hidden>▸</span>
                {oynadi ? "tekrar" : "izle"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ekran okuyucu için kare anlatımı */}
      <p className="sr-only" aria-live="polite">
        {KARE_METNI[kare]}
      </p>
    </section>
  );
}
