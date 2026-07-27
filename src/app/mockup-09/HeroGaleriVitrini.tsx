"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * HeroGaleriVitrini · Mockup 09 hero sahnesi.
 * Karanlık galeri duvarı fotoğrafının plaket hizasına KOD ile daire
 * plaketleri bindirilir. 4 karelik koreografi (~15 sn, döngülü):
 *  K1 galeri sakin, B-4-2 yeşil nokta nabızlı
 *  K2 iki danışman kartviziti iki yandan aynı plakete süzülür
 *  K3 D1 değer, cam rezerve kapağı iner (klik), nokta amber,
 *     "rezerve · 48 sa" pirinç şeridi; D2 cama çarpar, erişim kapalı
 *  K4 duvar boyunca spot dalgası + davetli listesi kartları + mono fiş
 * Plakete tıklayınca koreografi K2'den yeniden başlar.
 * prefers-reduced-motion: statik K4 karesi, zamanlayıcı çalışmaz.
 * Tüm veriler örnektir.
 */

type Faz = 1 | 2 | 3 | 4;

const FAZ_SURE: Record<Faz, number> = { 1: 3600, 2: 2600, 3: 4600, 4: 4600 };

/* duvardaki diğer eser plaketleri (tahsisli, görünür) */
const DIGER_PLAKETLER: { kod: string; alt: string; poz: string; dalga: string }[] = [
  { kod: "A-7-1", alt: "3+1 · ₺18,9M", poz: "m9-poz-a71", dalga: "m9-dalga-1" },
  { kod: "A-12-4", alt: "4,5+1 · ₺27,2M", poz: "m9-poz-p5", dalga: "m9-dalga-2" },
  { kod: "C-2-3", alt: "5+1 · ₺41,0M", poz: "m9-poz-p6", dalga: "m9-dalga-3" },
];

/* K4 davetli listesi: aynı plaket üç davetli ekranında amber */
const DAVETLILER = ["Yılmaz Gayrimenkul", "Aksoy Emlak", "Meram Ofis"];

export function HeroGaleriVitrini() {
  const [faz, setFaz] = useState<Faz>(1);
  const [statik, setStatik] = useState(false);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* hareketi azalt: koreografi durur, statik K4 karesi kalır
     (hydration uyumu için ilk boyamadan sonra, rAF callback içinde) */
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kare = requestAnimationFrame(() => {
      setStatik(true);
      setFaz(4);
    });
    return () => cancelAnimationFrame(kare);
  }, []);

  /* faz zinciri: her karenin süresi dolunca sıradakine geç, K4 sonrası tekrar */
  useEffect(() => {
    if (statik) return;
    zamanlayici.current = setTimeout(() => {
      setFaz((f) => (f === 4 ? 1 : ((f + 1) as Faz)));
    }, FAZ_SURE[faz]);
    return () => {
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
    };
  }, [faz, statik]);

  /* plakete tıklayınca K2'den yeniden oynat */
  const yenidenOynat = useCallback(() => {
    if (statik) return;
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    setFaz(1);
    /* aynı fazda tıklanırsa da geçiş görünsün diye önce K1'e alıp bir kare sonra K2 */
    requestAnimationFrame(() => setFaz(2));
  }, [statik]);

  const rezerve = faz >= 3;

  return (
    <section className="m9-sahne relative" data-faz={faz} aria-label="Galeri vitrini tanıtım sahnesi">
      {/* ---- duvar kadrajı: mobil dikey kırpım, masaüstü 16:9 birebir hiza ---- */}
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[1920/1080]">
        <Image
          src="/generated/mockup-09/galeri-duvar.jpg"
          alt="Koyu antrasit galeri duvarı: ceviz çıtalar, spot ışıklı pirinç plaketler"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[63%_50%] sm:object-center"
        />
        {/* sol karanlık boşluk + alt vinyet: soldaki plaketlerin spotu sönük kalır (tahsis dışı) */}
        <div className="m9-scrim-sol" aria-hidden />
        <div className="m9-scrim-alt" aria-hidden />

        {/* ---- ana eser: B-4-2 (tıklanınca koreografi yeniden) ---- */}
        <button
          type="button"
          onClick={yenidenOynat}
          className="m9-plaket m9-hero-plaket m9-poz-hero"
          aria-label="B-4-2 plaketi: rezerve koreografisini yeniden oynat"
        >
          <span className="m9-plaket-ic">
            <span className="m9-plaket-kod">
              <span className="m9-nokta" data-renk={rezerve ? "amber" : "green"} aria-hidden />
              B-4-2
            </span>
            <span className="m9-plaket-alt">4+1 · ₺24,5M</span>
          </span>
          {/* rezerve camekanı: yarı saydam kapak, pirinç menteşe */}
          <span className="m9-cam" aria-hidden />
          <span className="m9-rezerve" aria-hidden>
            rezerve · 48 sa
          </span>
        </button>

        {/* ---- diğer tahsisli eserler (K4 dalgası bunların üstünden geçer) ---- */}
        {DIGER_PLAKETLER.map((p) => (
          <div key={p.kod} className={`m9-plaket ${p.poz} ${p.dalga}`} aria-hidden>
            <span className="m9-plaket-ic">
              <span className="m9-plaket-kod">
                <span className="m9-nokta" data-renk="green" />
                {p.kod}
              </span>
              <span className="m9-plaket-alt">{p.alt}</span>
            </span>
          </div>
        ))}

        {/* ---- K2-K3: danışman kartvizitleri ---- */}
        <div className="m9-kartvizit m9-kv-1" aria-hidden>
          <span className="m9-kv-ic">
            <span className="m9-kv-ad">S. Yılmaz</span>
            <span className="m9-kv-ofis">Yılmaz Gayrimenkul · davetli</span>
          </span>
        </div>
        <div className="m9-kartvizit m9-kv-2" aria-hidden>
          <span className="m9-kv-ic">
            <span className="m9-kv-ad">M. Kaya</span>
            <span className="m9-kv-ofis">Kaya Emlak</span>
            <span className="m9-kv-rozet">erişim kapalı</span>
          </span>
        </div>

        {/* ---- K4: davetli listesi kartları (aynı plaket üç ekranda amber) ---- */}
        <div className="m9-davetliler" aria-hidden>
          {DAVETLILER.map((ad) => (
            <div key={ad} className="m9-davetli">
              <span>{ad}</span>
              <span className="m9-davetli-durum">B-4-2</span>
            </div>
          ))}
          <div className="m9-davetli m9-davetsiz">
            <span>Kaya Emlak</span>
            <span>görünmüyor</span>
          </div>
        </div>

        {/* ---- K4: mono fiş ---- */}
        <p className="m9-fis" aria-hidden>
          sergi canlı · yalnız davetliler
        </p>
      </div>

      {/* ---- başlık: masaüstünde duvarın sol karanlık boşluğunda, mobilde altta ---- */}
      <div className="relative z-20 mx-auto max-w-xl px-5 pb-12 pt-8 sm:absolute sm:left-[4.5%] sm:top-1/2 sm:mx-0 sm:max-w-[400px] sm:-translate-y-1/2 sm:px-0 sm:pb-0 sm:pt-0">
        <p className="m9-etiket">Kapalı devre satış galerisi</p>
        <h1 className="m9-baslik mt-5 text-[clamp(2rem,4.6vw,3.4rem)]">
          Her proje. Her danışman.
          <span className="mt-1 block text-[var(--m9-pirinc-acik)]">Tek canlı gerçek.</span>
        </h1>
        <p className="mt-4 max-w-[36ch] text-[14px] leading-relaxed text-[var(--m9-ink-soft)]">
          Lüks konut stoğu bir ilanda değil, davetli bir sergide satılır: fiyat tek kayıtta yaşar,
          opsiyon camın arkasında kilitlenir.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/kayit?rol=uretici" className="m9-btn m9-btn-dolu m9-btn-kucuk">
            Projemi vitrine aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="m9-btn m9-btn-cizgi m9-btn-kucuk">
            Davetli danışman ol
          </Link>
        </div>
      </div>
    </section>
  );
}
