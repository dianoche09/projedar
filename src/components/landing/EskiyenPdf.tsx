"use client";

import { useEffect, useRef, useState } from "react";

/**
 * EskiyenPdf · "bozuk sistem" sahnesi: sol tarafta şantiye fazı ilerler ve
 * canlı fiyat yükselir; sağ tarafta danışmanın elindeki Şubat tarihli PDF
 * aynı fiyatta kalır, faz ilerledikçe solar ve "geride" rozeti kızarır.
 * Faz adımına tıklanınca otomatik akış durur, sahne elle gezilir.
 * prefers-reduced-motion: otomatik ilerleme yok, son faz statik gösterilir.
 * TÜM VERİLER ÖRNEKTİR.
 */

const FAZLAR = [
  {
    ad: "Temel",
    ay: "ay 0",
    canli: "₺21,9M",
    fark: null,
    rozet: "güncel",
    rozetSinif: "d-musait",
  },
  {
    ad: "Kaba yapı",
    ay: "ay 14",
    canli: "₺24,5M",
    fark: "₺2,6M",
    rozet: "1 faz geride",
    rozetSinif: "d-opsiyon",
  },
  {
    ad: "Teslime doğru",
    ay: "ay 30",
    canli: "₺26,8M",
    fark: "₺4,9M",
    rozet: "2 faz geride",
    rozetSinif: "d-satildi",
  },
] as const;

/** PDF eskidikçe artan solma katsayıları (faz sırasına göre). */
const SOLMA = ["", "opacity-85 saturate-[0.55]", "opacity-70 saturate-[0.25]"] as const;

export function EskiyenPdf() {
  const [faz, setFaz] = useState(0);
  const elle = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // hydration uyumu: senkron setState yok, ilk boyamadan sonra son faza geç
      const kare = requestAnimationFrame(() => setFaz(2));
      return () => cancelAnimationFrame(kare);
    }
    const t = setInterval(() => {
      if (elle.current) return;
      setFaz((f) => (f + 1) % FAZLAR.length);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const aktif = FAZLAR[faz];

  return (
    <div className="kart relative overflow-hidden p-5 sm:p-7">
      <span className="absolute right-4 top-4 rounded-md border border-[var(--cizgi-2)] bg-[var(--color-soft)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek veri
      </span>

      <div className="grid gap-8 md:grid-cols-2 md:gap-10">
        {/* ── sol: şantiye gerçeği (canlı kayıt) ─────────────────────── */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-teal-d)]">
            Şantiye gerçeği · canlı kayıt
          </p>

          {/* faz adımları */}
          <div className="mt-5 flex items-center gap-1.5" role="group" aria-label="Şantiye fazını seç">
            {FAZLAR.map((f, i) => (
              <div key={f.ad} className="flex flex-1 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    elle.current = true;
                    setFaz(i);
                  }}
                  aria-pressed={i === faz}
                  className={`flex min-h-11 w-full flex-col items-center justify-center rounded-xl border px-1 py-2 transition-all duration-300 ${
                    i === faz
                      ? "border-teal bg-teal-soft shadow-[var(--golge-1)]"
                      : i < faz
                        ? "border-[var(--cizgi-2)] bg-white"
                        : "border-dashed border-[var(--cizgi-2)] bg-transparent"
                  }`}
                >
                  <span className={`text-[11.5px] font-bold leading-tight ${i === faz ? "text-[var(--color-teal-d)]" : "text-ink-soft"}`}>
                    {f.ad}
                  </span>
                  <span className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                    {f.ay}
                  </span>
                </button>
                {i < FAZLAR.length - 1 && (
                  <span className={`h-px w-3 flex-none ${i < faz ? "bg-teal" : "bg-[var(--cizgi-2)]"}`} aria-hidden />
                )}
              </div>
            ))}
          </div>

          {/* canlı fiyat */}
          <div className="mt-6 rounded-2xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-5">
            <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
              B-4-2 · canlı fiyat
            </p>
            <p className="mono mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{aktif.canli}</p>
            <p className="taze t-0 mt-3">
              <span className="nokta nabiz" />
              az önce güncellendi · tek doğru kaynak
            </p>
          </div>
        </div>

        {/* ── sağ: eldeki eski PDF ───────────────────────────────────── */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Eldeki dosya · Şubat sürümü
          </p>

          <div
            className={`relative mt-5 rounded-2xl border border-[var(--cizgi-2)] bg-white p-5 shadow-[var(--golge-1)] transition-all duration-700 ${SOLMA[faz]}`}
            style={{ transform: faz > 0 ? `rotate(${faz * 0.7}deg)` : "none" }}
          >
            <span className={`durum ${aktif.rozetSinif} absolute right-4 top-4`}>
              <span className="nokta" />
              {aktif.rozet}
            </span>

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-9 flex-none flex-col items-center justify-center rounded-md border border-[var(--color-red)]/40 bg-red-soft">
                <span className="font-mono text-[8.5px] font-bold text-[var(--color-red)]">PDF</span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">fiyat_listesi_temel.pdf</p>
                <p className="font-mono text-[10px] text-[var(--ink-faint)]">Şubat · sürüm 3 · e-postayla dağıtıldı</p>
              </div>
            </div>

            <div className="mt-4 space-y-2" aria-hidden="true">
              <div className="h-2 w-4/5 rounded bg-[var(--color-hair)]" />
              <div className="h-2 w-3/5 rounded bg-[var(--color-hair)]" />
            </div>

            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-[var(--color-soft)] px-4 py-3">
              <span className="text-[12px] font-medium text-ink-soft">B-4-2</span>
              <span className={`mono text-xl font-bold ${faz > 0 ? "text-[var(--ink-faint)] line-through decoration-[var(--color-red)]/60" : "text-ink"}`}>
                ₺21,9M
              </span>
            </div>
          </div>

          {/* fark satırı */}
          <p
            className={`mono mt-4 text-[12px] font-semibold text-[var(--color-red)] transition-opacity duration-500 ${
              aktif.fark ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!aktif.fark}
          >
            müşteriye söylenen: ₺21,9M · gerçek: {aktif.canli} · fark: {aktif.fark ?? "₺0"}
          </p>
        </div>
      </div>
    </div>
  );
}
