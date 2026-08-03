"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Zaman Akışı (H6 photographic, 3-faz crossfade) · tone: luxury/restraint
 * Kullanıcı fikri: büyük proje inşaattan teslime video gibi akar, bloklar faz faz satılır.
 * Aynı sahnenin 3 gerçek fazı (nano-banana-2 edit ile tutarlı) üst üste crossfade olur;
 * kuleler üzerindeki satış noktaları fazla birlikte yeşilden kırmızıya döner, stok sayacı erir,
 * teslim karesinde "PROJE TÜKENDİ" rozeti düşer. Başlık sabittir: sahne değişir, söz değişmez.
 * prefers-reduced-motion: statik teslim karesi. pre-emit critique: P5 H5 E4 S5 R4 V5
 */

type Faz = { gorsel: string; etiket: string; ay: string; musait: number; satilmisOran: number };

const FAZLAR: Faz[] = [
  { gorsel: "/generated/mockup-07/faz-1-kaba.jpg", etiket: "KABA YAPI", ay: "AY 8", musait: 121, satilmisOran: 0.15 },
  { gorsel: "/generated/mockup-07/faz-2-karma.jpg", etiket: "İNCE İŞLER", ay: "AY 19", musait: 58, satilmisOran: 0.6 },
  { gorsel: "/generated/mockup-07/faz-3-tamam.jpg", etiket: "TESLİM", ay: "AY 30", musait: 6, satilmisOran: 0.96 },
];

/** 3 kule üzerinde satış noktaları (% koordinat, fotoğraf kompozisyonuna hizalı).
 *  `sira` satılma sırası: oran arttıkça küçük sıralılar kırmızıya döner. */
const NOKTALAR: { x: number; y: number; sira: number }[] = [
  { x: 20, y: 30, sira: 2 }, { x: 23, y: 40, sira: 5 }, { x: 19, y: 52, sira: 9 }, { x: 22, y: 63, sira: 13 }, { x: 20, y: 74, sira: 1 },
  { x: 47, y: 36, sira: 7 }, { x: 50, y: 46, sira: 3 }, { x: 48, y: 58, sira: 11 }, { x: 51, y: 68, sira: 15 }, { x: 49, y: 77, sira: 6 },
  { x: 74, y: 28, sira: 10 }, { x: 77, y: 39, sira: 4 }, { x: 75, y: 51, sira: 14 }, { x: 78, y: 62, sira: 8 }, { x: 76, y: 73, sira: 12 },
];

const ADIM_SURE = 5200;

export function HeroFazSeridi() {
  // adım 0-1-2 = fazlar · adım 3 = teslim karesinde "tükendi" tutuşu
  const [adim, setAdim] = useState(0);
  const [oynuyor, setOynuyor] = useState(true);
  const [azalt, setAzalt] = useState(false);
  // video oynatılamıyorsa (düşük pil modu, autoplay engeli, yükleme hatası):
  // 3 fazlı görsel crossfade yedeğine düşer, video sonradan oynarsa geri döner
  const [yedek, setYedek] = useState(false);
  const azaltRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const faz = Math.min(adim, FAZLAR.length - 1);
  const tukendi = adim === 3;
  const aktif = FAZLAR[faz];

  useEffect(() => {
    const azalt = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    azaltRef.current = azalt;
    if (!azalt) return;
    const raf = requestAnimationFrame(() => {
      setAzalt(true);
      setAdim(3);
      setOynuyor(false);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /** Video zamanı → satış aşaması: 8sn'lik timelapse 4 adıma bölünür (son dilim = tükendi). */
  const videoZamani = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const oran = v.currentTime / v.duration;
    const yeni = oran < 0.3 ? 0 : oran < 0.62 ? 1 : oran < 0.86 ? 2 : 3;
    setAdim((a) => (a === yeni ? a : yeni));
  };

  // reduced-motion ve görsel-yedek modlarında zamanlayıcı döngüsü fazları çevirir
  useEffect(() => {
    if (!oynuyor || (!azaltRef.current && !yedek)) return;
    const id = setInterval(() => setAdim((a) => (a + 1) % 4), ADIM_SURE);
    return () => clearInterval(id);
  }, [oynuyor, yedek]);

  // video izleyicisi: kısa süre içinde ilerlemiyorsa görsel yedeğine geç
  useEffect(() => {
    if (azalt) return;
    const kontrol = setTimeout(() => {
      const v = videoRef.current;
      if (!v || v.paused || v.currentTime < 0.15) setYedek(true);
    }, 2500);
    return () => clearTimeout(kontrol);
  }, [azalt]);

  // otomatik oynatma garantisi: bazı tarayıcılar autoplay'i geciktirir/engeller;
  // mount'ta, sekme geri geldiğinde ve ilk dokunuşta oynatmayı dene
  useEffect(() => {
    if (azalt) return;
    const dene = () => {
      const v = videoRef.current;
      if (v && v.paused) void v.play().catch(() => {});
    };
    dene();
    const zaman = setTimeout(dene, 600);
    const gorunur = () => {
      if (!document.hidden) dene();
    };
    const dokunus = () => {
      dene();
      window.removeEventListener("pointerdown", dokunus);
    };
    document.addEventListener("visibilitychange", gorunur);
    window.addEventListener("pointerdown", dokunus);
    return () => {
      clearTimeout(zaman);
      document.removeEventListener("visibilitychange", gorunur);
      window.removeEventListener("pointerdown", dokunus);
    };
  }, [azalt]);

  return (
    <section
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-ink text-white"
      aria-label="Proje zaman akışı: inşaattan teslime, satışlar faz faz tükenir"
    >
      {/* GERÇEK VİDEO: inşaattan teslime tek çekim timelapse (Seedance i2v, başlangıç=kaba, bitiş=tamam).
          reduced-motion / video oynatılamıyorsa: statik teslim karesi fallback. */}
      {azalt ? (
        <Image src={FAZLAR[2].gorsel} alt="" fill priority sizes="100vw" className="object-cover object-[50%_38%]" />
      ) : (
        <>
          <video
            ref={videoRef}
            className={`absolute inset-0 size-full object-cover object-[50%_38%] ${yedek ? "opacity-0" : ""}`}
            src="/generated/mockup-07/insaat-timelapse.mp4"
            poster={FAZLAR[0].gorsel}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onTimeUpdate={videoZamani}
            onPlaying={() => setYedek(false)}
            onError={() => setYedek(true)}
            aria-hidden
          />
          {yedek
            ? FAZLAR.map((f, i) => (
                <Image
                  key={f.gorsel}
                  src={f.gorsel}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={`object-cover object-[50%_38%] transition-opacity duration-1000 ${i === faz ? "opacity-100" : "opacity-0"}`}
                />
              ))
            : null}
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(11,20,32,0.5) 0%, rgba(11,20,32,0.08) 32%, rgba(11,20,32,0.05) 55%, rgba(11,20,32,0.72) 100%)" }}
      />
      {/* yazı okunurluğu: başlık bölgesine lokal koyu ışıma (her fazda metin net okunur) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(58% 64% at 20% 28%, rgba(11,20,32,0.68) 0%, rgba(11,20,32,0.34) 48%, transparent 72%)" }}
      />

      {/* satış noktaları: faz ilerledikçe yeşil → kırmızı */}
      <div className="absolute inset-0 hidden sm:block" aria-hidden>
        {NOKTALAR.map((n) => {
          const satildi = n.sira / NOKTALAR.length <= (tukendi ? 1 : aktif.satilmisOran);
          return (
            <span
              key={`${n.x}-${n.y}`}
              className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/70 transition-colors duration-1000"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                background: satildi ? "var(--color-red, #d15a4e)" : "var(--color-green, #2fb36b)",
                boxShadow: "0 1px 6px rgba(8,16,28,0.5)",
              }}
            />
          );
        })}
      </div>

      {/* başlık: sabit tek hiyerarşi (akış içinde; alt künye mt-auto ile hep görünür) */}
      <div className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pb-10 pt-16 sm:px-10 sm:pt-24">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">Yeni projelerin profesyonel satış ağı</p>
          <h1 className="mt-3 max-w-[14ch] font-display text-[11vw] font-extrabold leading-[1.0] tracking-tight sm:text-[60px] lg:text-[76px]">
            Bloklar yükselir. Stok erir.
          </h1>
          <p className="mt-4 max-w-[52ch] text-pretty text-[14.5px] leading-relaxed text-white/85 sm:text-[16px]">
            Projedar; inşaat firmalarının canlı proje bilgilerini, güncel fiyatlarını ve bağımsız bölüm durumlarını
            yetkili gayrimenkul danışmanlarıyla tek satış ağında buluşturur. Fiyat ya da durum değişince bütün yetkili ağ aynı anda güncellenir.
          </p>
          {/* rol kartları (kullanıcı tasarımı): koyu = proje sahibi, beyaz = danışman */}
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
            <Link
              href="/muteahhit"
              className="group rounded-2xl bg-[#0d2438]/90 p-4 ring-1 ring-white/15 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/60">Müteahhit · Proje sahibi</p>
              <p className="mt-1.5 font-display text-lg font-extrabold text-white">Proje sahibiyim</p>
              <p className="mt-1 text-[12px] leading-snug text-white/70">Projeni yetkili danışman ağına aç; kim neyi görür, sen belirle. Satışı canlı izle.</p>
              <span className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#1e9b8a] px-5 text-[13px] font-bold text-white transition-colors group-hover:bg-[#1a8676]">
                Projemi satış ağına aç <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Link>
            <Link
              href="/emlakci"
              className="group rounded-2xl bg-white/95 p-4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5"
            >
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-soft">Gayrimenkul danışmanı</p>
              <p className="mt-1.5 flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                Danışmanım
                <span className="rounded-full bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-teal-d)]">Ücretsiz</span>
              </p>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">Sana tahsisli projeleri canlı gör; müşterine tek dokunuşla doğru fiyatı paylaş.</p>
              <span className="mt-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-teal-d)] px-5 text-[13px] font-bold text-[var(--color-teal-d)] transition-colors group-hover:bg-[var(--color-teal-d)] group-hover:text-white">
                Danışman olarak katıl <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* dev müsait sayısı: sağda, faz değiştikçe erir (m02 eriyen sayı dili) */}
      <div
        className="pointer-events-none absolute bottom-24 right-5 z-[5] text-right sm:bottom-28 sm:right-10 lg:right-14"
        aria-live="polite"
      >
        <style>{`@keyframes ppSayiGir { from { opacity: 0; transform: translateY(0.16em); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {tukendi ? (
          <p
            key="son"
            className="ml-auto max-w-[18ch] text-right font-display text-2xl font-bold leading-snug text-white [text-shadow:0_2px_28px_rgba(8,16,28,0.6)] sm:text-3xl"
            style={{ animation: azalt ? undefined : "ppSayiGir 700ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            Stok ağda eridi. Sıradaki proje seninki olsun.
          </p>
        ) : (
          <>
            <p
              key={faz}
              className="font-mono font-semibold tabular-nums leading-[0.82] tracking-tight text-white [text-shadow:0_2px_28px_rgba(8,16,28,0.6)]"
              style={{
                fontSize: "clamp(4.5rem, 15vw, 11.5rem)",
                animation: azalt ? undefined : "ppSayiGir 700ms cubic-bezier(0.16, 1, 0.3, 1) both",
              }}
            >
              {aktif.musait}
            </p>
            <p className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              müsait daire · 142 içinden · canlı
            </p>
          </>
        )}
      </div>

      {/* alt künye: akış içinde yüzen bar; mt-auto ile her ekranda tam görünür */}
      <div className="relative z-10 mx-3 mb-5 mt-auto rounded-2xl border border-white/20 bg-[rgba(11,20,32,0.6)] pt-0 backdrop-blur-md sm:mx-8 sm:mb-7 lg:mx-12">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {FAZLAR.map((f, i) => (
                <button
                  key={f.etiket}
                  type="button"
                  onClick={() => {
                    setAdim(i);
                    const v = videoRef.current;
                    if (v && v.duration) v.currentTime = (i === 0 ? 0.05 : i === 1 ? 0.4 : 0.7) * v.duration;
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === faz && !tukendi ? "w-7 bg-white" : "w-3 bg-white/35 hover:bg-white/60"}`}
                  aria-label={`Faz ${i + 1}: ${f.etiket}`}
                />
              ))}
            </div>
            <p className="font-mono text-[12px] font-semibold tracking-wider text-white/85">
              {tukendi ? "TESLİM · AY 30" : `${aktif.etiket} · ${aktif.ay}`}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span
                className="mr-1.5 inline-block size-2 rounded-full align-middle"
                style={{ background: tukendi ? "var(--color-red, #d15a4e)" : "var(--color-green, #2fb36b)" }}
              />
              örnek akış
            </p>
            <button
              type="button"
              onClick={() => {
                const v = videoRef.current;
                if (v) {
                  if (v.paused) void v.play();
                  else v.pause();
                }
                setOynuyor((o) => (azaltRef.current ? false : !o));
              }}
              className="min-h-9 rounded-full border border-white/30 px-4 font-mono text-[11.5px] font-semibold text-white/90 transition-colors hover:border-white/60 hover:bg-white/10"
            >
              {oynuyor ? "duraklat" : "oynat"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
