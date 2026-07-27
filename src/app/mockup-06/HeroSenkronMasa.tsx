"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Hero · "İKİ EKRAN, TEK SANİYE" (Mockup 06, sıfırdan yeni kompozisyon)
 * Tek ekran (h-svh), split diptik 5/7:
 *  SOL şerit (5/12): kule fotoğrafı dikey kırpım + düşük opaklıklı navy örtü;
 *  üzerinde başlık "İki ekran. Tek saniye." + alt satır + 2 CTA.
 *  SAĞ (7/12): açık zemin, yan yana iki minimal telefon çerçevesi (CSS, nötr
 *  koyu çerçeve, süs yok); ikisinde de aynı daire kartı.
 * TEK dram döngüsü: solda "Opsiyon al" dokunuşu, sol kart amber
 * "kilitlendi · 48 sa"; sağ kart AYNI ANDA kilit rozetiyle soluklaşır ve
 * "erişim kapalı" düşer; 4 sn sonra sıfırlanır. Aradaki senkron: tek ince
 * çizgi nabzı. Mobil: üstte görsel + başlık, altta telefonlar yan yana küçük.
 * prefers-reduced-motion: kilitli kare statik, döngü yok. Veriler örnektir.
 */

type Faz = "bekle" | "dokun" | "kilit";

const AMBER = "#e3a12c";

/* dram zamanlaması: 2.6 sn bekleme + 1.1 sn dokunuş + 4 sn kilit, sonra sıfır */
const SURELER: Record<Faz, number> = { bekle: 2600, dokun: 1100, kilit: 4000 };
const SIRA: Record<Faz, Faz> = { bekle: "dokun", dokun: "kilit", kilit: "bekle" };

const FAZ_METNI: Record<Faz, string> = {
  bekle: "İki telefonda aynı daire açık: A-12-3, 18,9 milyon lira, müsait.",
  dokun: "Soldaki danışman opsiyon al tuşuna dokunuyor.",
  kilit:
    "Sol ekranda kayıt 48 saatliğine kilitlendi; sağ ekran aynı saniye kapandı.",
};

/** İki telefonda da aynı kayıt: tek daire kartı. */
function DaireKarti({ kilitli, soluk }: { kilitli: boolean; soluk: boolean }) {
  return (
    <div
      className="relative rounded-[10px] border bg-white px-2.5 py-2 transition-all duration-300"
      style={{
        borderColor: kilitli ? AMBER : "rgba(16,36,58,0.14)",
        opacity: soluk ? 0.5 : 1,
        filter: soluk ? "saturate(0.55)" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="whitespace-nowrap font-mono text-[9.5px] font-bold text-ink">A-12-3</span>
        {kilitli ? (
          <span
            className="inline-flex items-center gap-[3px] rounded-full bg-[#fbf0da] px-1.5 py-[2px] font-mono text-[7px] font-bold uppercase tracking-wider text-[#9a6a12]"
          >
            <Lock size={7} strokeWidth={3.2} />
            kilitli
          </span>
        ) : (
          <span className="inline-flex items-center gap-[3px] rounded-full bg-[#e5f5ec] px-1.5 py-[2px] font-mono text-[7px] font-bold uppercase tracking-wider text-[#1f7d4c]">
            <span aria-hidden className="size-1 rounded-full bg-green" />
            müsait
          </span>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[17px] font-semibold leading-none text-ink">₺18,9M</p>
      <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.09em] text-[var(--ink-faint)]">
        {kilitli ? "opsiyon · 48 sa" : "canlı fiyat · şimdi"}
      </p>
    </div>
  );
}

/** Minimal telefon çerçevesi: nötr koyu gövde, süs yok. */
function Telefon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[148px] rounded-[24px] border border-[#2a3442] bg-[#1c2530] p-[6px] shadow-[0_16px_38px_rgba(16,36,58,0.28)] sm:w-[168px] lg:w-[186px]">
      <div className="relative overflow-hidden rounded-[18px] bg-[#f6f4ee]">
        <span
          aria-hidden
          className="absolute left-1/2 top-[5px] z-10 h-[4px] w-[28px] -translate-x-1/2 rounded-full bg-[#1c2530]"
        />
        {children}
      </div>
    </div>
  );
}

export function HeroSenkronMasa() {
  const [faz, setFaz] = useState<Faz>("bekle");
  const [statik, setStatik] = useState<boolean | null>(null);

  useEffect(() => {
    const kimlik = requestAnimationFrame(() =>
      setStatik(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
    return () => cancelAnimationFrame(kimlik);
  }, []);

  useEffect(() => {
    if (statik !== false) return;
    const kimlik = setTimeout(() => setFaz((f) => SIRA[f]), SURELER[faz]);
    return () => clearTimeout(kimlik);
  }, [faz, statik]);

  /* reduced-motion: kilitli kare statik gösterilir */
  const kilitli = statik === true || faz === "kilit";

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden"
      aria-label="İki danışman ekranı: biri opsiyon aldığında diğeri aynı saniye kilitlenir"
    >
      <style>{`
        @keyframes hs6Halka {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.55); }
          70%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.9); }
        }
        .hs6-halka { animation: hs6Halka 1.1s ease-out infinite; }
        @keyframes hs6Belir {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: none; }
        }
        .hs6-belir { animation: hs6Belir 0.32s ease-out both; }
        @keyframes hs6Nabiz {
          0% { left: 0; opacity: 0; }
          18% { opacity: 1; }
          100% { left: calc(100% - 14px); opacity: 0; }
        }
        .hs6-nabiz { animation: hs6Nabiz 0.7s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .hs6-halka, .hs6-belir, .hs6-nabiz { animation: none; }
          .hs6-halka { opacity: 0; }
          .hs6-belir { opacity: 1; }
          .hs6-nabiz { opacity: 0; }
        }
      `}</style>

      <div className="flex h-full flex-col lg:grid lg:grid-cols-12">
        {/* ============ SOL ŞERİT (5/12): görsel + başlık ============ */}
        <div className="relative h-[46%] min-h-[290px] flex-none lg:col-span-5 lg:h-full">
          <Image
            src="/generated/shared/buyuk-kule-cephe.jpg"
            alt="Alçak açıdan teslime yaklaşan bir konut kulesi"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover object-[62%_26%]"
          />
          {/* düşük opaklıklı navy örtü */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(16,36,58,0.52) 0%, rgba(16,36,58,0.4) 45%, rgba(16,36,58,0.66) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-center px-5 py-6 sm:px-8 lg:px-10">
            <p className="m6-damga !text-[rgba(233,214,175,0.78)]">
              Kapalı devre lüks konut ağı
            </p>
            <h1 className="m6-display mt-3 max-w-[10ch] text-[34px] font-bold leading-[1.04] text-[#f6f2ea] sm:text-[42px] lg:text-[clamp(38px,3.6vw,52px)]">
              İki ekran. Tek saniye.
            </h1>
            <p className="mt-3.5 max-w-[38ch] text-[13.5px] leading-relaxed text-[rgba(243,234,216,0.82)] sm:text-[15px]">
              Bir danışman opsiyon aldığında diğerinin ekranı aynı anda
              kilitlenir.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href="/kayit?rol=uretici"
                className="m6-tus m6-tus-fildisi !min-h-[46px] !px-5 !text-[12px]"
              >
                Projemi ağa aç
              </Link>
              <Link
                href="/kayit?rol=emlakci"
                className="m6-tus m6-tus-seffaf !min-h-[46px] !px-5 !text-[12px]"
              >
                Danışman olarak katıl
              </Link>
            </div>
          </div>
        </div>

        {/* ============ SAĞ (7/12): iki telefon + senkron çizgisi ============ */}
        <div className="relative flex flex-1 items-center justify-center bg-[#f4f0e7] lg:col-span-7">
          <div className="flex items-center">
            {/* SOL TELEFON: opsiyonu alan danışman */}
            <Telefon>
              <div className="px-2 pb-2 pt-4">
                <div className="flex items-center justify-between px-0.5 pb-1.5">
                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    Danışman A · tahsisli
                  </span>
                  <span className="font-mono text-[7px] text-[var(--ink-faint)]">14:02</span>
                </div>
                <DaireKarti kilitli={kilitli} soluk={false} />
                <div className="relative mt-1.5">
                  <span
                    className={`flex min-h-[28px] items-center justify-center rounded-[8px] font-mono text-[8.5px] font-bold uppercase tracking-[0.09em] transition-colors duration-300 ${
                      kilitli ? "bg-[#fbf0da] text-[#9a6a12]" : "bg-navy text-white"
                    }`}
                  >
                    {kilitli ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-[8px] sm:text-[8.5px]">
                        <Lock size={8} strokeWidth={3} className="flex-none" />
                        kilitlendi · 48 sa
                      </span>
                    ) : (
                      "Opsiyon al"
                    )}
                  </span>
                  {/* dokunuş halkası */}
                  {faz === "dokun" && statik === false && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <span className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-navy/25" />
                      <span className="hs6-halka absolute left-1/2 top-1/2 size-9 rounded-full border-2 border-navy/70" />
                    </span>
                  )}
                </div>
              </div>
            </Telefon>

            {/* SENKRON: tek ince çizgi + kilit anında nabız */}
            <div
              aria-hidden
              className="relative mx-2 h-[2px] w-8 rounded-full transition-colors duration-300 sm:mx-3 sm:w-14"
              style={{ background: kilitli ? `${AMBER}66` : "rgba(16,36,58,0.16)" }}
            >
              {faz === "kilit" && statik === false && (
                <span
                  className="hs6-nabiz absolute top-1/2 h-[6px] w-[14px] -translate-y-1/2 rounded-full"
                  style={{ background: AMBER, boxShadow: `0 0 10px ${AMBER}` }}
                />
              )}
            </div>

            {/* SAĞ TELEFON: aynı saniye kilitlenen danışman */}
            <Telefon>
              <div className="relative px-2 pb-2 pt-4">
                <div className="flex items-center justify-between px-0.5 pb-1.5">
                  <span className="font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    Danışman B · tahsisli
                  </span>
                  <span className="font-mono text-[7px] text-[var(--ink-faint)]">14:02</span>
                </div>
                <DaireKarti kilitli={kilitli} soluk={kilitli} />
                <div className="mt-1.5">
                  <span
                    className={`flex min-h-[28px] items-center justify-center rounded-[8px] font-mono text-[8.5px] font-bold uppercase tracking-[0.09em] transition-all duration-300 ${
                      kilitli
                        ? "bg-[rgba(16,36,58,0.06)] text-[var(--ink-faint)]"
                        : "bg-navy text-white"
                    }`}
                  >
                    Opsiyon al
                  </span>
                </div>
                {kilitli && (
                  <span
                    className="hs6-belir absolute bottom-[38px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-white px-2 py-[3px] font-mono text-[7.5px] font-bold uppercase tracking-wider"
                    style={{ borderColor: "#d15a4e", color: "#a23f34" }}
                  >
                    erişim kapalı
                  </span>
                )}
              </div>
            </Telefon>
          </div>

          {/* künye satırı */}
          <p className="absolute inset-x-0 bottom-3.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)] sm:bottom-5">
            aynı kayıt · aynı saniye · örnek akış
          </p>
        </div>
      </div>

      {/* ekran okuyucu: dramın o anki durumu */}
      <p className="sr-only" aria-live="polite">
        {FAZ_METNI[statik === true ? "kilit" : faz]}
      </p>
    </section>
  );
}
