"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero · "VAZİYET PLANI" (Mockup 05, sıfırdan yeni kompozisyon)
 * Tek ekran (h-svh): masaya serili 5 kulelik vaziyet planı çizimi full-bleed;
 * başlık plan kâğıdının üst antet boşluğunda. Plan üzerinde 5 kule ayak izine
 * hizalı 5 durum rozeti (4 yeşil "satışta", 1 amber "opsiyon dolu").
 * TEK sakin dram: 10 sn'lik döngüde bir yeşil rozet amber'a döner ve yanında
 * minik "KİLİTLİ" damga izi belirir; sonra yeşile geri döner, sıradaki kuleye
 * geçer. Alt künye bandı: "vaziyet planı · 142 daire · örnek".
 * prefers-reduced-motion: statik rozetler, dram yok. Tüm veriler örnektir.
 */

const RENK = { green: "#2fb36b", amber: "#e3a12c" } as const;

/* 5 kule ayak izi: 1920x1088 plan kadrajına % hizalı merkezler */
const KULELER = [
  { kod: "K1", x: 41.5, y: 30.5, opsiyon: false },
  { kod: "K2", x: 42.5, y: 46.5, opsiyon: false },
  { kod: "K3", x: 51.0, y: 51.5, opsiyon: true },
  { kod: "K4", x: 54.0, y: 42.0, opsiyon: false },
  { kod: "K5", x: 37.5, y: 59.5, opsiyon: false },
] as const;

/* dram: 7 sn bekleme + 3 sn kilit = 10 sn'lik döngü, sırayla yeşil kuleler */
const BEKLE_MS = 7000;
const KILIT_MS = 3000;
const YESIL_SIRA = [0, 1, 3, 4] as const;

export function HeroPlanMasasi() {
  const [statik, setStatik] = useState<boolean | null>(null);
  const [dram, setDram] = useState<{ aktif: number | null; sira: number }>({
    aktif: null,
    sira: 0,
  });

  useEffect(() => {
    const kimlik = requestAnimationFrame(() =>
      setStatik(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
    return () => cancelAnimationFrame(kimlik);
  }, []);

  useEffect(() => {
    if (statik !== false) return;
    const kimlik = setTimeout(
      () =>
        setDram((d) =>
          d.aktif === null
            ? { aktif: YESIL_SIRA[d.sira % YESIL_SIRA.length], sira: d.sira + 1 }
            : { aktif: null, sira: d.sira }
        ),
      dram.aktif === null ? BEKLE_MS : KILIT_MS
    );
    return () => clearTimeout(kimlik);
  }, [dram, statik]);

  const aktifKule = dram.aktif === null ? null : KULELER[dram.aktif].kod;

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#efe9da]"
      aria-label="Beş kulelik vaziyet planı: her kulenin satış durumu plan üzerinde canlı yaşar"
    >
      <style>{`
        /* sahne: 1920x1088 sabit kadraj; mobilde plan merkezi (x %45) viewport
           ortasına gelecek şekilde dikey kırpılır, masaüstünde tam kadraj */
        .hp5-sahne {
          position: absolute;
          top: 50%;
          /* mobil: kadraj aşağı kayar, kule rozetleri başlığın altında toplanır */
          transform: translateY(-32%);
          --sw: max(100vw, 176.5svh);
          width: var(--sw);
          aspect-ratio: 1920 / 1088;
          left: calc(50vw - var(--sw) * 0.45);
        }
        @media (min-width: 1024px) {
          .hp5-sahne {
            transform: translateY(-50%);
            left: min(0px, calc(100vw - var(--sw)) / 2);
          }
        }
        @keyframes hp5Damga {
          0% { opacity: 0; transform: rotate(-8deg) scale(1.35); }
          60% { opacity: 1; transform: rotate(-8deg) scale(0.94); }
          100% { opacity: 1; transform: rotate(-8deg) scale(1); }
        }
        .hp5-damga { animation: hp5Damga 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .hp5-damga { animation: none; }
        }
      `}</style>

      {/* full-bleed vaziyet planı fotoğrafı + rozet katmanı */}
      <div className="hp5-sahne">
        <Image
          src="/generated/shared/buyuk-vaziyet-plani.jpg"
          alt="Çizim masasına serili, beş kuleli bir konut projesinin vaziyet planı paftası"
          fill
          priority
          sizes="250vw"
          className="object-cover"
        />

        {/* 5 kule ayak izine hizalı durum rozetleri */}
        {KULELER.map((k, i) => {
          const kilitli = k.opsiyon || dram.aktif === i;
          const renk = kilitli ? RENK.amber : RENK.green;
          return (
            <div
              key={k.kod}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${k.x}%`, top: `${k.y}%` }}
            >
              <span
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 bg-[#fdfbf4] px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#17293d] transition-colors duration-500"
                style={{
                  borderColor: renk,
                  boxShadow: "0 2px 10px rgba(96,72,32,0.22)",
                }}
              >
                <span
                  aria-hidden
                  className="size-1.5 rounded-full transition-colors duration-500"
                  style={{ background: renk }}
                />
                {k.opsiyon
                  ? `${k.kod} · opsiyon dolu`
                  : dram.aktif === i
                    ? `${k.kod} · opsiyon`
                    : `${k.kod} · satışta`}
              </span>
              {/* dram anı: minik KİLİTLİ damga izi */}
              {dram.aktif === i && (
                <span className="hp5-damga m5-muhur m5-muhur-kilit absolute left-1/2 top-[calc(100%+7px)] -translate-x-1/2 !text-[10px]">
                  Kilitli
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* okunurluk: mobilde üstten kâğıt tonunda perde (masaüstünde antet zaten boş) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[46svh] lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(246,242,231,0.95) 0%, rgba(246,242,231,0.62) 55%, transparent 100%)",
        }}
      />

      {/* başlık: plan kâğıdının üst antet boşluğunda */}
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-14 sm:px-8 sm:pt-16 lg:left-[6%] lg:right-auto lg:top-[11%] lg:max-w-[430px] lg:px-0 lg:pt-0">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#177e6f]">
          Pafta 1 · Canlı satış durumu
        </p>
        <h1 className="font-display mt-3 max-w-[16ch] text-[32px] font-bold leading-[1.06] text-[#17293d] sm:text-[42px] lg:text-[46px]">
          Beş kule, tek plan, tek gerçek.
        </h1>
        <p className="mt-3.5 max-w-[46ch] text-[14px] leading-relaxed text-[#5a6577] sm:text-[15px]">
          Plandaki her ayak izi canlı kayda bağlıdır: durum değişir, rozet aynı
          saniye döner; kimse eski paftayla satış yapmaz.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/kayit?rol=uretici" className="m5-btn m5-btn-ink">
            Projemi canlı ağa aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="m5-btn m5-btn-kagit">
            Danışman olarak katıl
          </Link>
        </div>
      </div>

      {/* alt künye bandı */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[rgba(23,41,61,0.16)] bg-[rgba(246,242,231,0.9)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-5 py-3.5 sm:px-8">
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#8b97a8]">
            ProjePazar · Fiziksel veri sistemi
          </p>
          <p className="font-mono text-[11.5px] tracking-wide text-[#17293d]">
            <span
              aria-hidden
              className="mr-1.5 inline-block size-2 rounded-full bg-[#2fb36b] align-middle"
            />
            vaziyet planı · 142 daire · örnek
          </p>
        </div>
      </div>

      {/* ekran okuyucu: dramın o anki durumu */}
      <p className="sr-only" aria-live="polite">
        {aktifKule
          ? `Örnek dram: ${aktifKule} kulesinde bir daire için opsiyon kilidi basıldı.`
          : "Beş kuleden dördü satışta, K3 kulesinde opsiyonlar dolu."}
      </p>
    </section>
  );
}
