"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Büyük Maket (H6 photographic) · tone: restraint
 * Çok kuleli site maketi full-bleed sahnedir; maket "dijital ikiz" metaforunu taşır.
 * TEK sakin dram: fotoğraftaki tek canlı etiket 9 sn'de bir amber "opsiyonlandı ·
 * kilitli" haline döner, kısa süre sonra yeşile geri gelir. Başka koreografi yok.
 * Başlık sol üst negatif alanda sabittir; alt künye bandı sahneyi kapatır.
 * prefers-reduced-motion: statik yeşil etiket, döngü çalışmaz. TÜM VERİLER ÖRNEKTİR.
 */

const OPSIYON_DONGUSU = 9000;
const OPSIYON_SURESI = 2600;

export function HeroKesitMasasi() {
  const [opsiyonlu, setOpsiyonlu] = useState(false);
  const [azalt, setAzalt] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const uygula = () => {
      setAzalt(mq.matches);
      if (mq.matches) setOpsiyonlu(false);
    };
    uygula();
    mq.addEventListener("change", uygula);
    return () => mq.removeEventListener("change", uygula);
  }, []);

  useEffect(() => {
    if (azalt) return;
    let geriDonus: number | undefined;
    const dongu = window.setInterval(() => {
      setOpsiyonlu(true);
      geriDonus = window.setTimeout(() => setOpsiyonlu(false), OPSIYON_SURESI);
    }, OPSIYON_DONGUSU);
    return () => {
      window.clearInterval(dongu);
      if (geriDonus) window.clearTimeout(geriDonus);
    };
  }, [azalt]);

  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-[#e9e6df] text-ink"
      aria-label="Büyük maket: projenin dijital ikizi, her daire tek canlı kayıt"
    >
      {/* full-bleed maket fotoğrafı */}
      <Image
        src="/generated/shared/buyuk-site-maketi.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_46%] sm:object-[58%_44%]"
      />
      {/* sol üst negatif alanı derinleştiren hafif ışık perdesi */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(118deg, rgba(247,245,239,0.9) 0%, rgba(247,245,239,0.55) 32%, rgba(247,245,239,0) 62%)",
        }}
      />

      {/* başlık: sabit tek hiyerarşi, sol üst */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pt-20 sm:px-10 sm:pt-24">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-soft">
            Büyük konut projeleri için
          </p>
          <h1 className="mt-3 max-w-[13ch] font-display text-[11vw] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[60px] lg:text-[76px]">
            Projenin dijital ikizi canlı.
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-[16.5px]">
            Maket değil: her daire tek canlı kayıt. Fiyat değişir, bütün ağ aynı
            saniye görür.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center border-[1.5px] border-ink bg-ink px-6 font-mono text-[13px] font-semibold uppercase tracking-[0.07em] text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi ağa açın
            </Link>
            <Link
              href="/kayit?rol=emlakci"
              className="inline-flex min-h-12 items-center border-[1.5px] border-ink bg-white/85 px-6 font-mono text-[13px] font-semibold uppercase tracking-[0.07em] text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              Danışman olarak katılın
            </Link>
          </div>
        </div>
      </div>

      {/* tek canlı etiket: maketteki bir daire, ağda yaşayan kayıt */}
      <div
        className="absolute left-1/2 top-[48%] z-10 -translate-x-1/2 sm:left-[55%] sm:top-[40%]"
        aria-live="polite"
      >
        <div
          className="flex items-center gap-2.5 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[11.5px] font-semibold tracking-wide text-white shadow-[0_6px_18px_rgba(16,36,58,0.35)] backdrop-blur-sm transition-colors duration-700"
          style={{
            background: "rgba(16,36,58,0.82)",
            borderColor: opsiyonlu ? "var(--color-amber, #e3a12c)" : "rgba(255,255,255,0.4)",
          }}
        >
          <span className="relative flex size-2.5 flex-none">
            {!opsiyonlu && !azalt && (
              <span
                aria-hidden
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                style={{ background: "var(--color-green, #2fb36b)" }}
              />
            )}
            <span
              className="relative inline-flex size-2.5 rounded-full transition-colors duration-700"
              style={{
                background: opsiyonlu
                  ? "var(--color-amber, #e3a12c)"
                  : "var(--color-green, #2fb36b)",
              }}
            />
          </span>
          {opsiyonlu ? (
            <span>A KULE · 12-3 · opsiyonlandı · kilitli</span>
          ) : (
            <span>
              A KULE · 12-3 · <b className="font-bold">₺18,2M</b> · şimdi
            </span>
          )}
        </div>
        {/* etiketi makete bağlayan kısa iğne */}
        <span aria-hidden className="mx-auto block h-9 w-px bg-ink/45" />
      </div>

      {/* alt künye bandı */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t-[1.5px] border-ink/20 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-6 py-4 sm:px-10">
          <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
            <span
              aria-hidden
              className="mr-2 inline-block size-2 rounded-full align-middle"
              style={{ background: "var(--color-green, #2fb36b)" }}
            />
            Dijital ikiz · canlı stok
          </p>
          <p className="font-mono text-[11.5px] tracking-wide text-ink-soft">
            3 kule · <b className="font-bold tabular-nums text-ink">142</b> daire · örnek görünüm
          </p>
        </div>
      </div>
    </section>
  );
}
