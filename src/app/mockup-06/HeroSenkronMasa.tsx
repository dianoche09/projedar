"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * HeroSenkronMasa · Mockup 06 hero: "Senkron İki Telefon" konsepti (lüks segment).
 * Yeşil mermer ve pirinç detaylı masa fotoğrafı sahnedir; deri sumen üzerinde
 * CSS ile çizilmiş iki premium telefon durur. 4 karelik otomatik koreografi
 * (~14 sn döngü, açılıştan ~2 sn sonra başlar, sürekli tekrar eder):
 *   K1 Açılış: iki telefonda AYNI daire kartı, B-4-2 · ₺24,5M · müsait.
 *   K2 Uzanış: sol telefonda parmak halkası "Opsiyon al" tuşuna iner;
 *              sağ telefonda imleç aynı karta doğru süzülür.
 *   K3 Kilit: sol kart amber "kilitlendi · 48 sa" olur; sağ kart AYNI SANİYE
 *             kilit rozetiyle soluklaşır, dokunuş mikro titremeyle reddedilir;
 *             iki telefon arasında masadan geçen senkron ışık çizgisi yanar.
 *   K4 Fiş: telefonların altında pirinç plaka: "aynı kayıt · aynı saniye ·
 *           tek gerçek"; kenardaki ağ dışı üçüncü cihaz güncellenmez, soluk kalır.
 * Telefona dokunmak koreografiyi 2. kareden, "tekrar" tuşu 1. kareden başlatır.
 * prefers-reduced-motion: son kare statik gösterilir, döngü çalışmaz.
 * Mobil: ayrı kompozisyon, telefonlar alt alta, senkron çizgisi dikey.
 * TÜM VERİLER ÖRNEKTİR.
 */

type Kare = 1 | 2 | 3 | 4;

const AMBER = "#e3a12c";
const KIRMIZI = "#d15a4e";
const PIRINC = "#c9a25e";

/* kare süreleri (ms) · toplam döngü ~14 sn */
const SURELER: Record<Kare, number> = { 1: 3200, 2: 3400, 3: 3600, 4: 3800 };

const KARE_METNI: Record<Kare, string> = {
  1: "Kare 1: İki telefonda aynı daire açık. B-4-2, 24,5 milyon lira, müsait.",
  2: "Kare 2: Soldaki danışman opsiyon almak üzere tuşa uzanıyor, sağdaki danışman aynı karta yöneliyor.",
  3: "Kare 3: Sol telefonda kayıt 48 saatliğine kilitlendi, sağ telefonda aynı saniye erişim kapandı.",
  4: "Kare 4: Aynı kayıt, aynı saniye, tek gerçek. Ağ dışındaki cihaz güncellenmedi.",
};

/** Telefon ekranındaki daire kartı: iki telefonda da aynı kayıttır. */
function DaireKarti({
  kilitli,
  soluk,
  reddedildi,
  titriyor,
}: {
  kilitli: boolean;
  soluk: boolean;
  reddedildi: boolean;
  titriyor: boolean;
}) {
  return (
    <div
      className={`relative rounded-[10px] border bg-white px-2.5 py-2 transition-all duration-300 ${
        titriyor ? "sm6-titre" : ""
      }`}
      style={{
        borderColor: kilitli ? AMBER : "rgba(16,36,58,0.14)",
        opacity: soluk ? 0.52 : 1,
        filter: soluk ? "saturate(0.6)" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono text-[9px] font-bold text-ink">B-4-2 · 5+1</span>
        {kilitli ? (
          <span
            className="sm6-belir inline-flex items-center gap-[3px] rounded-full px-1.5 py-[2px] font-mono text-[6.5px] font-bold uppercase tracking-wider"
            style={{ background: "#fbf0da", color: "#9a6a12" }}
          >
            <Lock size={6} strokeWidth={3.5} />
            kilitli
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-[3px] rounded-full px-1.5 py-[2px] font-mono text-[6.5px] font-bold uppercase tracking-wider"
            style={{ background: "#e5f5ec", color: "#1f7d4c" }}
          >
            <span className="size-1 rounded-full bg-green" aria-hidden />
            müsait
          </span>
        )}
      </div>
      <p className="mt-1.5 font-mono text-[15px] font-semibold leading-none text-ink">₺24,5M</p>
      <p className="mt-1 font-mono text-[6.5px] uppercase tracking-[0.09em] text-[var(--ink-faint)]">
        {kilitli ? "opsiyon · 48 sa" : "canlı fiyat · şimdi"}
      </p>
      {reddedildi ? (
        <span
          className="sm6-belir absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-white px-1.5 py-[2px] font-mono text-[6.5px] font-bold uppercase tracking-wider"
          style={{ borderColor: KIRMIZI, color: "#a23f34" }}
        >
          erişim kapalı
        </span>
      ) : null}
    </div>
  );
}

/** Premium telefon çerçevesi: koyu gövde, pirinç kenar ışığı, çentik. */
function TelefonGovde({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[22px] border border-[#3d372c] bg-[#15120d] p-[6px]"
      style={{
        boxShadow:
          "0 0 0 1px rgba(201,162,94,0.30), 0 22px 44px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="relative overflow-hidden rounded-[16px] bg-[#f6f2ea]">
        <span
          aria-hidden
          className="absolute left-1/2 top-[5px] z-10 h-[4px] w-[30px] -translate-x-1/2 rounded-full bg-[#15120d]"
        />
        {children}
      </div>
    </div>
  );
}

export function HeroSenkronMasa() {
  const [kare, setKare] = useState<Kare>(1);
  const [oynuyor, setOynuyor] = useState(false);
  const [oynadi, setOynadi] = useState(false);
  const [statik, setStatik] = useState(false);

  /* açılış: reduced-motion ise statik son kare, değilse ~2 sn sonra otomatik başla */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  /* koreografi saati: süre dolunca sıradaki kare, K4'ten K1'e döngü (tekrar) */
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

  const kilitli = kare >= 3;

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-6">
      <style>{`
        @keyframes sm6Halka {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.55); }
          70%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.9); }
        }
        .sm6-halka { animation: sm6Halka 1.5s ease-out infinite; }
        @keyframes sm6Belir {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: none; }
        }
        .sm6-belir { animation: sm6Belir 0.32s ease-out both; }
        @keyframes sm6Titre {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2.5px); }
          45% { transform: translateX(2px); }
          70% { transform: translateX(-1.5px); }
        }
        .sm6-titre { animation: sm6Titre 0.34s cubic-bezier(0.3, 0, 0.3, 1) 0.18s 1; }
        @keyframes sm6CizgiYan {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .sm6-cizgi { animation: sm6CizgiYan 0.5s ease-out both; }
        @keyframes sm6Akis {
          from { stroke-dashoffset: 26; }
          to { stroke-dashoffset: 0; }
        }
        .sm6-akis { stroke-dasharray: 4 22; animation: sm6Akis 1.1s linear infinite; }
        @keyframes sm6Plaka {
          0% { opacity: 0; transform: translate(-50%, 8px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .sm6-plaka { animation: sm6Plaka 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
        @media (prefers-reduced-motion: reduce) {
          .sm6-halka, .sm6-belir, .sm6-titre, .sm6-cizgi, .sm6-akis, .sm6-plaka { animation: none; }
          .sm6-halka { opacity: 0; }
        }
      `}</style>

      {/* ============ MOBİL BAŞLIK: sahnenin üstünde, normal akışta ============ */}
      <div className="pb-6 sm:hidden">
        <p className="m6-damga">Kapalı devre lüks konut ağı</p>
        <h1 className="m6-display mt-3 text-[30px] font-bold leading-[1.08] text-ink">
          Stok değişir. Fiyat değişir.
          <br />
          <span className="text-[#8a6d33]">Link değişmez.</span>
        </h1>
        <p className="mt-3 max-w-[44ch] text-[14px] leading-relaxed text-ink-soft">
          İki danışman, aynı daire, aynı saniye: kaydı kimin kilitlediğini
          veritabanı söyler. Masada izleyin.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Link href="/kayit?rol=uretici" className="m6-tus m6-tus-dolu !min-h-[44px] !px-5 !text-[12px]">
            Projemi ağa aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="m6-tus m6-tus-cizgi !min-h-[44px] !px-5 !text-[12px]">
            Danışman olarak katıl
          </Link>
        </div>
      </div>

      {/* ============ SAHNE: lüks masa ============ */}
      <div
        className="relative overflow-hidden rounded-[18px] border border-[rgba(201,162,94,0.4)] bg-[#15120d]"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.12) inset, 0 30px 70px rgba(21,18,13,0.45)" }}
      >
        <div className="relative aspect-[2/3] w-full sm:aspect-[1920/1088]">
          {/* iç kadraj: fotoğraf oranı sabit; mobilde dikey crop, tüm sahne
              koordinatları bu katmanın yüzdeleridir */}
          <div className="absolute inset-y-0 left-1/2 aspect-[1920/1088] h-full -translate-x-1/2">
            <Image
              src="/generated/mockup-06/luks-masa.jpg"
              alt="Yeşil mermer ve pirinç detaylı lüks bir masa: deri sumen üzerinde iki telefon aynı daire kaydını gösteriyor"
              fill
              priority
              sizes="(min-width: 640px) 1100px, 235vw"
              className="object-cover"
            />
            {/* okunurluk katmanı: üstte başlık için yumuşak karartma, altta vinyet */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(56% 52% at 16% 16%, rgba(12,15,12,0.62), transparent 68%), linear-gradient(180deg, rgba(12,15,12,0.34) 0%, transparent 34%, rgba(12,15,12,0.30) 100%)",
              }}
            />

            {/* ============ MASAÜSTÜ BAŞLIK: masanın üst boşluğunda ============ */}
            <div className="absolute left-[4.5%] top-[7%] z-20 hidden max-w-[360px] sm:block">
              <p className="m6-damga !text-[rgba(233,214,175,0.75)]">Kapalı devre lüks konut ağı</p>
              <h1 className="m6-display mt-2.5 text-[clamp(26px,3.2vw,37px)] font-bold leading-[1.07] text-[#f3ead8]">
                Stok değişir. Fiyat değişir.
                <br />
                <span className="text-[#dcae5f]">Link değişmez.</span>
              </h1>
              <p className="mt-2.5 max-w-[38ch] text-[13.5px] leading-relaxed text-[rgba(243,234,216,0.78)]">
                İki danışman, aynı daire, aynı saniye: kaydı kimin kilitlediğini
                veritabanı söyler.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link href="/kayit?rol=uretici" className="m6-tus m6-tus-fildisi !min-h-[42px] !px-4 !text-[11.5px]">
                  Projemi ağa aç
                </Link>
                <Link href="/kayit?rol=emlakci" className="m6-tus m6-tus-seffaf !min-h-[42px] !px-4 !text-[11.5px]">
                  Danışman olarak katıl
                </Link>
              </div>
            </div>

            {/* ============ SENKRON IŞIK ÇİZGİSİ (K3+) ============ */}
            {kilitli ? (
              <>
                {/* masaüstü: yatay, iki telefon arasında */}
                <svg
                  className="sm6-cizgi absolute left-[42.5%] top-[46.4%] z-[5] hidden h-[6px] w-[11%] sm:block"
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line x1="0" y1="3" x2="100" y2="3" stroke={PIRINC} strokeWidth="1.4" opacity="0.5" vectorEffect="non-scaling-stroke" />
                  {statik ? null : (
                    <line className="sm6-akis" x1="0" y1="3" x2="100" y2="3" stroke="#f3e3c0" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={26} />
                  )}
                </svg>
                {/* mobil: dikey, alt alta iki telefon arasında */}
                <svg
                  className="sm6-cizgi absolute left-[46.8%] top-[45%] z-[5] h-[6.5%] w-[6px] sm:hidden"
                  viewBox="0 0 6 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line x1="3" y1="0" x2="3" y2="100" stroke={PIRINC} strokeWidth="1.4" opacity="0.5" vectorEffect="non-scaling-stroke" />
                  {statik ? null : (
                    <line className="sm6-akis" x1="3" y1="0" x2="3" y2="100" stroke="#f3e3c0" strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={26} />
                  )}
                </svg>
              </>
            ) : null}

            {/* ============ SOL TELEFON: opsiyonu alan danışman ============ */}
            <button
              type="button"
              onClick={() => baslat(2)}
              aria-label="Sol telefon: koreografiyi opsiyon anından başlat"
              className="absolute left-[46.8%] top-[25%] z-[6] w-[112px] -translate-x-1/2 -translate-y-1/2 text-left sm:left-[36%] sm:top-[47%] sm:w-[148px]"
            >
              <TelefonGovde>
                <div className="px-2 pb-2 pt-3.5">
                  <div className="flex items-center justify-between px-0.5 pb-1.5">
                    <span className="font-mono text-[6.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                      Danışman A · tahsisli
                    </span>
                    <span className="font-mono text-[6.5px] text-[var(--ink-faint)]">14:02</span>
                  </div>
                  <DaireKarti kilitli={kilitli} soluk={false} reddedildi={false} titriyor={false} />
                  {/* opsiyon tuşu + K2 parmak halkası */}
                  <div className="relative mt-1.5">
                    <span
                      className={`flex min-h-[26px] items-center justify-center rounded-[8px] font-mono text-[8px] font-bold uppercase tracking-[0.09em] transition-colors duration-300 ${
                        kilitli ? "bg-[#fbf0da] text-[#9a6a12]" : "bg-navy text-white"
                      }`}
                    >
                      {kilitli ? (
                        <span className="inline-flex items-center gap-1">
                          <Lock size={8} strokeWidth={3} />
                          kilitlendi · 48 sa
                        </span>
                      ) : (
                        "Opsiyon al"
                      )}
                    </span>
                    {kare === 2 && !statik ? (
                      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35" />
                        <span className="sm6-halka absolute left-1/2 top-1/2 size-8 rounded-full border-2 border-white/80" />
                      </span>
                    ) : null}
                  </div>
                </div>
              </TelefonGovde>
            </button>

            {/* ============ SAĞ TELEFON: aynı karta uzanan ikinci danışman ============ */}
            <button
              type="button"
              onClick={() => baslat(2)}
              aria-label="Sağ telefon: koreografiyi opsiyon anından başlat"
              className="absolute left-[46.8%] top-[71%] z-[6] w-[112px] -translate-x-1/2 -translate-y-1/2 text-left sm:left-[60%] sm:top-[47%] sm:w-[148px]"
            >
              <TelefonGovde>
                <div className="relative px-2 pb-2 pt-3.5">
                  <div className="flex items-center justify-between px-0.5 pb-1.5">
                    <span className="font-mono text-[6.5px] font-bold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                      Danışman B · tahsisli
                    </span>
                    <span className="font-mono text-[6.5px] text-[var(--ink-faint)]">14:02</span>
                  </div>
                  <DaireKarti
                    kilitli={kilitli}
                    soluk={kilitli}
                    reddedildi={kilitli}
                    titriyor={kare === 3 && !statik}
                  />
                  <div className="mt-1.5">
                    <span
                      className={`flex min-h-[26px] items-center justify-center rounded-[8px] font-mono text-[8px] font-bold uppercase tracking-[0.09em] transition-all duration-300 ${
                        kilitli
                          ? "bg-[rgba(16,36,58,0.06)] text-[var(--ink-faint)]"
                          : "bg-navy text-white"
                      }`}
                    >
                      Opsiyon al
                    </span>
                  </div>
                  {/* imleç: K2'de karta süzülür, K3'te sınırdan geri döner */}
                  {kare >= 2 && !statik ? (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute z-10 ${kare === 3 ? "sm6-titre" : ""}`}
                      style={{
                        left: kare === 2 ? "52%" : "72%",
                        top: kare === 2 ? "34%" : "58%",
                        opacity: kare >= 4 ? 0 : 1,
                        transition: "left 1.3s cubic-bezier(0.3, 0, 0.2, 1) 0.4s, top 1.3s cubic-bezier(0.3, 0, 0.2, 1) 0.4s, opacity 0.5s ease",
                      }}
                    >
                      <span className="block size-4 rounded-full border-2 border-white bg-[rgba(21,18,13,0.45)] shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
                    </span>
                  ) : null}
                </div>
              </TelefonGovde>
            </button>

            {/* ============ K4: PİRİNÇ PLAKA FİŞİ ============ */}
            {kare >= 4 ? (
              <span
                className="sm6-plaka absolute left-[46.8%] top-[92.5%] z-[7] -translate-x-1/2 whitespace-nowrap rounded-[4px] border border-[rgba(243,227,192,0.5)] px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#2a2312] sm:top-[80%] sm:text-[10px]"
                style={{
                  background: "linear-gradient(170deg, #e7cf9a 0%, #c9a25e 55%, #b08d4a 100%)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 20px rgba(0,0,0,0.45)",
                }}
              >
                aynı kayıt · aynı saniye · tek gerçek
              </span>
            ) : null}

            {/* ============ AĞ DIŞI ÜÇÜNCÜ CİHAZ: kenarda, hiç güncellenmez ============ */}
            <div
              className="absolute left-[62%] top-[6.5%] z-[6] w-[86px] sm:left-[85%] sm:top-[67%] sm:w-[104px]"
              style={{ opacity: 0.6, filter: "saturate(0.35) brightness(0.9)" }}
              aria-hidden
            >
              <div className="rounded-[10px] border border-[rgba(255,255,255,0.18)] bg-[#211d16] p-[4px] shadow-[0_10px_24px_rgba(0,0,0,0.5)]">
                <div className="rounded-[7px] bg-[#efe9dc] px-1.5 py-1.5">
                  <p className="font-mono text-[6px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                    ağ dışı liste
                  </p>
                  <p className="mt-1 font-mono text-[7.5px] font-semibold text-ink">B-4-2 · ₺21,9M</p>
                  <p className="mt-0.5 inline-flex rounded-[3px] bg-[#fbf0da] px-1 py-[1px] font-mono text-[5.5px] font-bold uppercase tracking-wider text-[#9a6a12]">
                    41 gün önce
                  </p>
                </div>
              </div>
              {kare >= 4 ? (
                <p className="sm6-belir mt-1 text-center font-mono text-[6.5px] font-bold uppercase tracking-[0.12em] text-[rgba(243,234,216,0.75)]">
                  güncellenmedi
                </p>
              ) : null}
            </div>
          </div>

          {/* ---- dış kadraj: örnek damgası + kontrol ---- */}
          <span className="pointer-events-none absolute bottom-2.5 left-3 z-[9] font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[rgba(243,234,216,0.6)]">
            örnek veri
          </span>

          {statik ? null : (
            <button
              type="button"
              onClick={() => baslat(1)}
              className="absolute bottom-2 right-2 z-[10] inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[rgba(243,227,192,0.45)] bg-[rgba(21,18,13,0.72)] px-4 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#f3ead8] transition-colors hover:bg-[rgba(21,18,13,0.9)]"
            >
              <span aria-hidden>▸</span>
              {oynadi ? "tekrar" : "izle"}
            </button>
          )}
        </div>
      </div>

      {/* ekran okuyucu için kare anlatımı */}
      <p className="sr-only" aria-live="polite">
        {KARE_METNI[kare]}
      </p>
    </section>
  );
}
