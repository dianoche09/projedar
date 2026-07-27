"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Lock, MousePointer2, RotateCcw } from "lucide-react";

/**
 * Hero · "CEPHEDE İKİ EL" — tek ekran, scroll'suz, 4 kare otomatik koreografi.
 * K1: teslime yakın cephe, tek pencere yeşil çerçeveli + mono etiket; başlık
 *     görselin içindeki sol gökyüzü boşluğunda.
 * K2: iki danışman kartı-imleci ekran kenarlarından pencereye süzülür; sahne
 *     pencereye mikro-zoom yapar (1.0 → 1.08).
 * K3: D1 dokunur → çerçeve amber, cam kilit mührü "klik" ile oturur; D2 buzlu
 *     cam bariyere çarpar, kartına kırmızı "erişim kapalı" rozeti düşer.
 * K4: diğer etiketli pencereler senkron dalga ile nabız atar; köşedeki mini
 *     danışman ekranları amber'a döner, ağ dışı ekran güncellenmez.
 * prefers-reduced-motion: K4 statik gösterilir, animasyon yok.
 */

/* HERO GÖRSELİ — TEK SABİT: masaüstü ve mobil aynı dosya; mobil kadraj
   CSS ile (sahne konumu) dikey kırpılır, ayrı dosya yok. */
const HERO_GORSEL = "/generated/shared/aday-5-teslime-yakin.jpg";

/* Sinyal renkleri (sabit) */
const RENK = {
  green: "#2fb36b",
  amber: "#e3a12c",
  red: "#d15a4e",
} as const;

/* Kahraman pencere: fotoğraftaki gerçek pencereye % koordinat hizalı
   (sağ-orta blok, 2. sıra koyu camlı pencere). Sahne = 1920x1080 kadraj. */
const PENCERE = { left: 56.5, top: 32.5, w: 8.4, h: 15.5 };
const PENCERE_MERKEZ = { x: 60.7, y: 40.2 };

/* K4 nabız pencereleri: cephedeki diğer gerçek pencerelere hizalı merkezler */
const NABIZ_PENCERELER = [
  { x: 60.9, y: 12, kod: "A-2-6" },
  { x: 60.3, y: 63, kod: "B-3-2" },
  { x: 43.0, y: 34.5, kod: "A-1-4" },
  { x: 42.0, y: 57, kod: "B-1-1" },
  { x: 78.0, y: 30, kod: "C-2-3" },
];

/* Alt köşe mini danışman ekranları: 3 ağ içi + 1 ağ dışı */
const MINI_EKRANLAR = [
  { ad: "ekran 1", agIci: true },
  { ad: "ekran 2", agIci: true },
  { ad: "ekran 3", agIci: true },
  { ad: "ekran 4", agIci: false },
];

type Kare = 1 | 2 | 3 | 4;

export function HeroSinematik() {
  const azHareket = useReducedMotion();
  const [hamKare, setKare] = useState<Kare>(1);
  const [dongu, setDongu] = useState(0);
  const k2denBaslaRef = useRef(false);

  /* prefers-reduced-motion: K4 statik gösterilir, koreografi çalışmaz */
  const kare: Kare = azHareket ? 4 : hamKare;

  useEffect(() => {
    if (azHareket) return;
    const zamanlayicilar: ReturnType<typeof setTimeout>[] = [];
    const k2den = k2denBaslaRef.current;
    k2denBaslaRef.current = false;

    if (k2den) {
      /* tekrar: bekleme karesini atla, doğrudan K2'den oynat */
      zamanlayicilar.push(setTimeout(() => setKare(2), 0));
      zamanlayicilar.push(setTimeout(() => setKare(3), 2600));
      zamanlayicilar.push(setTimeout(() => setKare(4), 6400));
      zamanlayicilar.push(setTimeout(() => setKare(1), 11600));
      zamanlayicilar.push(setTimeout(() => setDongu((d) => d + 1), 12000));
    } else {
      zamanlayicilar.push(setTimeout(() => setKare(2), 2000));
      zamanlayicilar.push(setTimeout(() => setKare(3), 4600));
      zamanlayicilar.push(setTimeout(() => setKare(4), 8400));
      zamanlayicilar.push(setTimeout(() => setKare(1), 13600));
      zamanlayicilar.push(setTimeout(() => setDongu((d) => d + 1), 14000));
    }
    return () => zamanlayicilar.forEach(clearTimeout);
  }, [dongu, azHareket]);

  function tekrarOynat() {
    if (azHareket) return;
    k2denBaslaRef.current = true;
    setDongu((d) => d + 1);
  }

  const kilitli = kare >= 3;
  const cerceveRenk = kilitli ? RENK.amber : RENK.green;

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#e9e4da]">
      <style>{`
        .hero04-sahne {
          position: absolute;
          --sw: max(100vw, 200svh);
          width: var(--sw);
          aspect-ratio: 1920 / 1080;
          left: calc(50vw - var(--sw) * ${PENCERE_MERKEZ.x / 100});
          top: 0;
        }
        @media (min-width: 1024px) {
          .hero04-sahne {
            --sw: max(100vw, 177.78svh);
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }
      `}</style>

      {/* SAHNE: sabit 16:9 kadraj; mobil konumu kahraman pencereyi ortalar */}
      <div className="hero04-sahne">
        {/* mikro-zoom katmanı: K2'de pencereye doğru scale 1.0 → 1.08 */}
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: `${PENCERE_MERKEZ.x}% ${PENCERE_MERKEZ.y}%` }}
          animate={{ scale: !azHareket && kare >= 2 ? 1.08 : 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={HERO_GORSEL}
            alt="İskelesi sökülmekte olan, teslime yakın bir konut projesi cephesi"
            fill
            priority
            sizes="(max-width: 1023px) 250vw, 100vw"
            className="object-cover"
          />
          {/* hafif duotone: sıcak-nötr ışık korunur, karartma yok */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, rgba(30,155,138,0.10) 0%, rgba(30,155,138,0.04) 45%, rgba(15,34,51,0.08) 100%)",
              mixBlendMode: "soft-light",
            }}
          />

          {/* KAHRAMAN PENCERE: ince çerçeve (K1 yeşil → K3 amber) */}
          <motion.div
            className="absolute z-10 rounded-[6px] border-[1.5px]"
            style={{
              left: `${PENCERE.left}%`,
              top: `${PENCERE.top}%`,
              width: `${PENCERE.w}%`,
              height: `${PENCERE.h}%`,
            }}
            animate={{
              borderColor: cerceveRenk,
              boxShadow: `0 0 0 1px ${cerceveRenk}33, 0 0 26px ${cerceveRenk}40`,
            }}
            transition={{ duration: 0.45 }}
          >
            {/* mono etiket: pencerenin üstünde */}
            <span
              className="mono absolute bottom-[calc(100%+8px)] left-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-[#ece9e2]"
              style={{
                borderColor: `${cerceveRenk}66`,
                background: "rgba(6, 14, 26, 0.84)",
                boxShadow: `0 0 20px ${cerceveRenk}2e`,
              }}
            >
              {kilitli ? (
                <Lock size={11} strokeWidth={2.5} style={{ color: RENK.amber }} />
              ) : (
                <span className="size-1.5 rounded-full" style={{ background: RENK.green }} aria-hidden />
              )}
              {kilitli ? "B-4-2 · ₺9,4M · 48 sa kilit" : "B-4-2 · ₺9,4M · müsait"}
            </span>

            {/* tıklanabilir alan: koreografiyi K2'den yeniden başlatır (≥44px) */}
            <button
              type="button"
              onClick={tekrarOynat}
              aria-label="Koreografiyi pencereden yeniden oynat"
              className="pointer-events-auto absolute -inset-1 z-20 min-h-11 min-w-11 cursor-pointer rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3fbfae]"
            />

            {/* K3: buzlu cam bariyer — pencerenin önünde, D2 tarafında (lokal blur) */}
            <motion.div
              aria-hidden
              className="absolute -right-[7%] -top-[5%] h-[110%] w-[16%] rounded-md border border-white/45 bg-white/25 backdrop-blur-[6px]"
              initial={false}
              animate={{ opacity: kilitli ? 1 : 0, scaleY: kilitli ? 1 : 0.7 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* K3: cam kilit mührü — yukarıdan iner, "klik" ölçek oturması */}
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 z-10 flex size-11 items-center justify-center rounded-full border-2 bg-white/25 backdrop-blur-sm"
              style={{ borderColor: RENK.amber, boxShadow: `0 0 24px ${RENK.amber}55` }}
              initial={false}
              animate={
                kilitli
                  ? {
                      opacity: 1,
                      y: "-50%",
                      x: "-50%",
                      scale: azHareket ? 1 : [1.28, 0.92, 1],
                    }
                  : { opacity: 0, y: "-130%", x: "-50%", scale: 1.28 }
              }
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.7, 1] }}
            >
              <Lock size={18} strokeWidth={2.5} style={{ color: RENK.amber }} />
            </motion.div>
          </motion.div>

          {/* K4: cephedeki diğer etiketli pencereler — senkron dalga, 140ms stagger */}
          {NABIZ_PENCERELER.map((p, i) => (
            <div
              key={p.kod}
              aria-hidden
              className="absolute z-[5]"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {!azHareket && kare === 4 && (
                <motion.span
                  className="absolute left-1/2 top-1/2 block size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{ borderColor: RENK.green }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: [0.4, 1.7], opacity: [0.85, 0] }}
                  transition={{ duration: 1, delay: i * 0.14, repeat: 2, repeatDelay: 0.7, ease: "easeOut" }}
                />
              )}
              <motion.span
                className="mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[9.5px] font-semibold text-[#ece9e2]"
                style={{ borderColor: `${RENK.green}55`, background: "rgba(6,14,26,0.8)" }}
                initial={false}
                animate={{ opacity: kare === 4 ? 1 : 0, y: kare === 4 ? 0 : 6 }}
                transition={{ duration: 0.4, delay: azHareket ? 0 : i * 0.14 }}
              >
                {p.kod} · müsait
              </motion.span>
            </div>
          ))}

          {/* K2-K3: danışman kartı-imleçleri (yalnız hareket açıkken) */}
          {!azHareket && (
            <>
              {/* D1 · teal: soldan süzülür, pencereye dokunur, opsiyonu alır */}
              <motion.div
                aria-hidden
                className="absolute left-[47.5%] top-[43.5%] z-20 w-[126px] lg:left-[44%] lg:w-[150px]"
                initial={false}
                animate={kare >= 2 ? { x: 0, opacity: 1 } : { x: "-70vw", opacity: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="rounded-[10px] border border-[#3fbfae]/60 bg-[rgba(6,14,26,0.88)] px-2.5 py-2 shadow-[0_8px_28px_rgba(6,14,26,0.4)]">
                  <p className="mono flex items-center gap-1.5 text-[10px] font-semibold text-[#ece9e2]">
                    <MousePointer2 size={11} className="text-[#3fbfae]" />
                    danışman 1
                  </p>
                  <p className="mono mt-1 flex items-center gap-1.5 text-[9.5px] text-white/60">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: kilitli ? RENK.amber : RENK.green }}
                    />
                    {kilitli ? "opsiyonu aldı" : "ağ içi · tahsisli"}
                  </p>
                </div>
                <MousePointer2
                  size={14}
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 text-[#3fbfae]"
                />
              </motion.div>

              {/* D2 · gri: sağdan süzülür, bariyere çarpar, erişim kapalı */}
              <motion.div
                aria-hidden
                className="absolute left-[63.5%] top-[47%] z-20 w-[126px] lg:left-[66%] lg:w-[150px]"
                initial={false}
                animate={kare >= 2 ? { x: 0, opacity: 1 } : { x: "70vw", opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* çarpma: sert duruş + kısa geri tepme */}
                <motion.div
                  animate={kare >= 3 ? { x: [-12, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="rounded-[10px] border border-white/30 bg-[rgba(6,14,26,0.88)] px-2.5 py-2 shadow-[0_8px_28px_rgba(6,14,26,0.4)]">
                    <p className="mono flex items-center gap-1.5 text-[10px] font-semibold text-[#ece9e2]">
                      <MousePointer2 size={11} className="text-white/50" />
                      danışman 2
                    </p>
                    <p className="mono mt-1 flex items-center gap-1.5 text-[9.5px] text-white/60">
                      <span className="size-1.5 rounded-full bg-white/35" />
                      tahsis bekliyor
                    </p>
                  </div>
                  <motion.span
                    className="mono absolute -bottom-2.5 left-2 rounded-[5px] border px-1.5 py-0.5 text-[8.5px] font-bold text-white"
                    style={{ borderColor: RENK.red, background: RENK.red }}
                    initial={false}
                    animate={{ opacity: kare >= 3 ? 1 : 0, scale: kare >= 3 ? 1 : 0.7 }}
                    transition={{ duration: 0.25, delay: 0.25 }}
                  >
                    erişim kapalı
                  </motion.span>
                  <MousePointer2
                    size={14}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 -scale-x-100 text-white/50"
                  />
                </motion.div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* okunurluk: yalnız açık (beyazlatan) perde, karartma yok */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[40svh] lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,242,235,0.94) 0%, rgba(246,242,235,0.62) 55%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden w-[46vw] lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(246,242,235,0.55) 0%, rgba(246,242,235,0.25) 60%, transparent 100%)",
        }}
      />
      {/* alt bölüme geçiş: kısa zemin bağlantısı */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[12svh]"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(8,18,32,0.9) 78%, #081220 100%)" }}
      />

      {/* üst bar */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-5">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg font-extrabold tracking-tight text-[#0f2233]">
            Proje<span className="text-[#177f70]">Pazar</span>
          </span>
          <span className="mono hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0f2233]/45 sm:inline">
            Design Lab · Mockup 04
          </span>
        </div>
        <Link
          href="/kayit"
          className="mono hidden rounded-[11px] border border-[#0f2233]/25 px-4 py-2 text-[11.5px] font-semibold text-[#0f2233] transition-colors hover:border-[#177f70] hover:text-[#177f70] sm:inline-flex"
        >
          Ağa katıl
        </Link>
      </header>

      {/* başlık: görselin içindeki sol üst gökyüzü boşluğunda (klasik split yok) */}
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-[76px] lg:left-[5vw] lg:right-auto lg:top-[18svh] lg:max-w-[440px] lg:px-0 lg:pt-0">
        <motion.div
          initial={azHareket ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#177f70]">
            Canlı konut stoğu dağıtım ağı
          </p>
          <h1 className="mt-3 font-display text-[30px] font-extrabold leading-[1.06] tracking-tight text-[#0f2233] sm:text-4xl lg:text-[46px]">
            Projenizin stoğu{" "}
            <span className="text-[#177f70]">artık yaşayan bir ağ.</span>
          </h1>
          <p className="mt-3 max-w-[340px] text-[13.5px] leading-relaxed text-[#0f2233]/70 lg:mt-4 lg:text-[14.5px]">
            Bir danışman opsiyon aldığında bütün ağ aynı saniyede görür. Çift
            satış daha başlamadan biter.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/kayit"
              className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#1e9b8a] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a8676]"
            >
              Projemi ağa aç
            </Link>
            <Link
              href="/kayit"
              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#0f2233]/30 px-5 text-[13px] font-semibold text-[#0f2233] transition-colors hover:border-[#0f2233]/60"
            >
              Danışman olarak katıl
            </Link>
          </div>
        </motion.div>
      </div>

      {/* alt sol: tekrar + mono fiş */}
      <div className="absolute bottom-4 left-4 z-30 flex flex-col items-start gap-2 lg:bottom-6 lg:left-6">
        <motion.p
          className="mono rounded-lg border border-white/15 bg-[rgba(6,14,26,0.84)] px-2.5 py-1.5 text-[10px] font-semibold text-[#ece9e2]"
          initial={false}
          animate={{ opacity: kare === 4 ? 1 : 0, y: kare === 4 ? 0 : 8 }}
          transition={{ duration: 0.4 }}
        >
          <span style={{ color: RENK.amber }}>kilit</span> · 48 sa ·{" "}
          <span style={{ color: RENK.green }}>ağ güncel</span>
        </motion.p>
        {!azHareket && (
          <button
            type="button"
            onClick={tekrarOynat}
            className="mono inline-flex h-11 items-center gap-1.5 rounded-[11px] border border-white/20 bg-[rgba(6,14,26,0.84)] px-3.5 text-[10.5px] font-semibold text-[#ece9e2] transition-colors hover:border-[#3fbfae]/60 hover:text-[#3fbfae]"
          >
            <RotateCcw size={11} strokeWidth={2.5} />
            tekrar
          </button>
        )}
      </div>

      {/* alt sağ: K4 mini danışman ekranları (3 ağ içi amber, 1 ağ dışı gri) */}
      <div className="absolute bottom-4 right-4 z-30 flex items-end gap-1.5 lg:bottom-6 lg:right-6 lg:gap-2" aria-hidden>
        {MINI_EKRANLAR.map((e, i) => (
          <motion.div
            key={e.ad}
            className={`w-[58px] rounded-md border px-1.5 py-1.5 lg:w-[68px] ${
              e.agIci ? "border-white/20" : "border-white/10 opacity-70"
            }`}
            style={{ background: "rgba(6,14,26,0.86)" }}
            initial={false}
            animate={{ opacity: kare === 4 ? (e.agIci ? 1 : 0.7) : 0, y: kare === 4 ? 0 : 10 }}
            transition={{ duration: 0.4, delay: azHareket ? 0 : i * 0.1 }}
          >
            <p className="mono text-[8px] font-semibold text-white/55">{e.ad}</p>
            <div className="mt-1 grid grid-cols-3 gap-0.5">
              {[0, 1, 2, 3, 4, 5].map((h) => (
                <span
                  key={h}
                  className="h-1.5 rounded-[2px]"
                  style={{
                    background:
                      h === 1 && e.agIci && kare === 4 ? RENK.amber : "rgba(255,255,255,0.14)",
                  }}
                />
              ))}
            </div>
            <p
              className="mono mt-1 text-[7.5px] font-semibold"
              style={{ color: e.agIci ? RENK.green : "rgba(255,255,255,0.4)" }}
            >
              {e.agIci ? "güncel" : "ağ dışı"}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
