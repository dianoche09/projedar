"use client";

import { Fragment, useEffect, useState } from "react";

/**
 * DurumMakinesi · Mockup 02 hero nesnesi.
 * Dev durum KELİMESİ ekranın görsel nesnesidir: MÜSAİT (yeşil, yazı nabız atar)
 * yeniden yazılarak OPSİYONLANDI (amber) olur, sonra SATILDI (kırmızı) gelir ve
 * üstü gözün önünde çizilir; ardından birim yeniden müsait düşer.
 * GERÇEK ETKİLEŞİM: kullanıcı kelimeye veya yol haritasındaki adıma dokunarak
 * akışı kendi yönetir. TÜM VERİLER ÖRNEKTİR. Sadece CSS + React state.
 */

type Durum = {
  kelime: string;
  renk: string;
  iz: string;
  boyut: string;
  nabiz?: boolean;
  cizili?: boolean;
};

const DURUMLAR: Durum[] = [
  {
    kelime: "MÜSAİT",
    renk: "#2fb36b",
    iz: "B-4-2 · 3+1 · ₺9,4M · şimdi güncellendi",
    boyut: "text-[clamp(3.2rem,15vw,12rem)]",
    nabiz: true,
  },
  {
    kelime: "OPSİYONLANDI",
    renk: "#e3a12c",
    iz: "B-4-2 · Yılmaz Emlak kilitledi · 48 saat sayaç başladı",
    boyut: "text-[clamp(1.9rem,8vw,6.6rem)]",
  },
  {
    kelime: "SATILDI",
    renk: "#d15a4e",
    iz: "B-4-2 · kayıt kapandı · tüm ekranlarda aynı anda güncellendi",
    boyut: "text-[clamp(2.8rem,13vw,10.5rem)]",
    cizili: true,
  },
];

export function DurumMakinesi() {
  const [i, setI] = useState(0);
  const [tur, setTur] = useState(0); // elle müdahale zamanlayıcıyı sıfırlar

  useEffect(() => {
    // hareketi azalt: otomatik akış yok, kelime yine dokunmayla değişir
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const zamanlayici = setInterval(() => setI((p) => (p + 1) % DURUMLAR.length), 3800);
    return () => clearInterval(zamanlayici);
  }, [tur]);

  const sec = (k: number) => {
    setI(k);
    setTur((t) => t + 1);
  };

  const d = DURUMLAR[i];

  return (
    <div className="border-y border-[var(--m2-cizgi)]">
      {/* yayın başlığı */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--m2-cizgi-soft)] py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--m2-ink-soft)]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
          canlı durum makinesi · birim B-4-2
        </span>
        <span className="rounded border border-[var(--m2-cizgi)] px-2 py-0.5 text-[9px]">örnek veri</span>
      </div>

      {/* dev kelime: sayfanın nesnesi, dokununca ilerler */}
      <button
        type="button"
        onClick={() => sec((i + 1) % DURUMLAR.length)}
        aria-label={`Şu anki durum: ${d.kelime}. Sonraki duruma geçmek için dokun.`}
        className="block w-full cursor-pointer overflow-hidden py-6 text-left sm:py-9"
      >
        <span
          key={`${d.kelime}-${tur}`}
          className={`m2-dev m2-kelime ${d.nabiz ? "m2-kelime-nabiz" : ""} ${d.cizili ? "m2-ustucizgi" : ""} ${d.boyut}`}
          style={{ color: d.renk }}
        >
          {d.kelime}
        </span>
      </button>

      <p aria-live="polite" className="mono text-[12px] text-[var(--m2-ink-soft)] sm:text-[13px]">
        {d.iz}
      </p>

      {/* durum yolu: her adım tıklanabilir */}
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--m2-cizgi-soft)] py-2">
        {DURUMLAR.map((s, k) => (
          <Fragment key={s.kelime}>
            {k > 0 ? (
              <span aria-hidden className="font-mono text-[11px] text-[var(--m2-ink-soft)]">
                →
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => sec(k)}
              aria-label={`Durumu ${s.kelime} yap`}
              className="min-h-[44px] rounded px-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] transition-opacity"
              style={{ color: s.renk, opacity: k === i ? 1 : 0.38 }}
            >
              {s.kelime}
            </button>
          </Fragment>
        ))}
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--m2-ink-soft)] sm:inline">
          kelimeye dokun, akışı sen yönet
        </span>
      </div>
    </div>
  );
}
