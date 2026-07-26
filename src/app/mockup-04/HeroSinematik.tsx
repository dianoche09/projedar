"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Lock } from "lucide-react";

/**
 * Hero · sinematik bina fotoğrafı (akşam-mavi saat) + canlı veri katmanı.
 * Masaüstü: yatay kadraj, sol-üst negatif alanda metin; cephe üzerinde
 * yüzen fiyat/durum/kilit etiketleri. Mobil: dikey kadraj, hafif katman.
 * Ken-burns: görsel çok yavaş geri çekilir (reduced-motion: statik poster).
 */

/* HERO GÖRSELİ — TEK SABİT: kullanıcı seçimi netleşince yalnız bu iki satır değişir.
   Adaylar: /generated/mockup-04/hero-aksam-temiz.jpg · /generated/shared/cephe-altin-saat.jpg */
const HERO_GORSEL_MASAUSTU = "/generated/mockup-04/hero-aksam-temiz.jpg";
const HERO_GORSEL_MOBIL = "/generated/mockup-04/hero-kule-mobil.jpg";

type EtiketRenk = "green" | "amber" | "red";

const RENK: Record<EtiketRenk, string> = {
  green: "#2fb36b",
  amber: "#e3a12c",
  red: "#d15a4e",
};

function VeriEtiketi({
  x,
  y,
  renk,
  kilit,
  gecikme,
  children,
}: {
  x: string;
  y: string;
  renk: EtiketRenk;
  kilit?: boolean;
  gecikme: number;
  children: React.ReactNode;
}) {
  const azHareket = useReducedMotion();
  return (
    <motion.div
      className="absolute z-10"
      style={{ left: x, top: y }}
      initial={azHareket ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: gecikme, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={azHareket ? "" : "yuzme"} style={{ animationDelay: `${gecikme}s` }}>
        <span
          className="mono inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-[#ece9e2]"
          style={{
            borderColor: `${RENK[renk]}66`,
            background: "rgba(6, 14, 26, 0.82)",
            boxShadow: `0 0 22px ${RENK[renk]}2e`,
          }}
        >
          {kilit ? (
            <Lock size={11} strokeWidth={2.5} style={{ color: RENK[renk] }} />
          ) : (
            <span className="size-1.5 rounded-full" style={{ background: RENK[renk] }} aria-hidden />
          )}
          {children}
        </span>
        {/* tahsis çizgisi: etiketten cepheye inen ince işaret */}
        <span
          aria-hidden
          className="mx-auto block h-7 w-px"
          style={{ background: `linear-gradient(180deg, ${RENK[renk]}88, transparent)` }}
        />
      </div>
    </motion.div>
  );
}

export function HeroSinematik() {
  const azHareket = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {/* sinematik zemin: masaüstü yatay, mobil dikey kompozisyon */}
      <motion.div
        className="absolute inset-0"
        initial={azHareket ? false : { scale: 1.07 }}
        animate={{ scale: 1 }}
        transition={{ duration: 16, ease: "linear" }}
      >
        <div className="absolute inset-0 hidden md:block">
          <Image
            src={HERO_GORSEL_MASAUSTU}
            alt="Akşam alacasında çağdaş bir konut projesi cephesi"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 md:hidden">
          <Image
            src={HERO_GORSEL_MOBIL}
            alt="Akşam alacasında çağdaş bir konut projesi, alttan yukarı bakış"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </motion.div>

      {/* okunurluk perdeleri: sol metin bandı + alt zemin geçişi */}
      <div
        aria-hidden
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,18,32,0.88) 0%, rgba(8,18,32,0.55) 34%, rgba(8,18,32,0.06) 58%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,18,32,0.55) 0%, transparent 26%, transparent 55%, rgba(8,18,32,0.94) 92%, #081220 100%)",
        }}
      />

      {/* üst bar */}
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg font-extrabold tracking-tight text-[#ece9e2]">
            Proje<span className="text-[#3fbfae]">Pazar</span>
          </span>
          <span className="mono hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:inline">
            Design Lab · Mockup 04
          </span>
        </div>
        <Link
          href="/kayit"
          className="mono hidden rounded-[11px] border border-white/20 px-4 py-2 text-[11.5px] font-semibold text-[#ece9e2] transition-colors hover:border-[#3fbfae]/60 hover:text-[#3fbfae] sm:inline-flex"
        >
          Ağa katıl
        </Link>
      </header>

      {/* cephe üzerindeki canlı veri katmanı (geniş ekran: metinle çakışmayan sağ bölge) */}
      <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block" aria-hidden>
        <VeriEtiketi x="61%" y="26%" renk="green" gecikme={0.9}>
          A-9-2 · ₺7,40M · şimdi
        </VeriEtiketi>
        <VeriEtiketi x="76%" y="46%" renk="amber" kilit gecikme={1.25}>
          B-6-1 · 48s kilit
        </VeriEtiketi>
        <VeriEtiketi x="64%" y="68%" renk="red" gecikme={1.6}>
          B-2-4 · satıldı · 14:02
        </VeriEtiketi>
      </div>
      {/* dar ekranlarda hafif katman: üst bölgede, metin alanına girmez */}
      <div className="pointer-events-none absolute inset-0 z-10 lg:hidden" aria-hidden>
        <VeriEtiketi x="10%" y="14%" renk="green" gecikme={0.9}>
          A-9-2 · ₺7,40M · şimdi
        </VeriEtiketi>
        <VeriEtiketi x="52%" y="27%" renk="amber" kilit gecikme={1.3}>
          B-6-1 · kilitli
        </VeriEtiketi>
      </div>

      {/* metin bloğu */}
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-5 pb-16 md:justify-center md:pb-24">
        <motion.div
          className="max-w-xl"
          initial={azHareket ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3fbfae]">
            Canlı konut stoğu dağıtım ağı
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-[#ece9e2] sm:text-5xl lg:text-[56px]">
            Projenizin stoğu artık{" "}
            <span className="text-[#3fbfae]">yaşayan bir ağ.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-white/65">
            Beton gerçek, veri canlı. Fiyat, durum ve opsiyon tek doğru kaynaktan
            akar; her danışmanın ekranında aynı saniyede güncellenir.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/kayit"
              className="inline-flex h-12 items-center justify-center rounded-[13px] bg-[#1e9b8a] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a8676]"
            >
              Projemi canlı ağa aç
            </Link>
            <Link
              href="/kayit"
              className="inline-flex h-12 items-center justify-center rounded-[13px] border border-white/25 px-6 text-[14px] font-semibold text-[#ece9e2] transition-colors hover:border-white/50"
            >
              Danışman olarak katıl
            </Link>
          </div>
          <p className="mono mt-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#2fb36b] nabiz" /> tek doğru kaynak
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#e3a12c]" /> 48 saat opsiyon kilidi
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#3fbfae]" /> komisyon yok
            </span>
          </p>
        </motion.div>
      </div>

      {/* kaydırma ipucu */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 hidden justify-center md:flex" aria-hidden>
        <span className="mono flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-white/35">
          kaydır
          <span className="block h-8 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </span>
      </div>
    </section>
  );
}
