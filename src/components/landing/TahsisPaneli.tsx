"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Bölüm 6: "Herkes her şeyi görmek zorunda değil."
 * İnteraktif tahsis/permissions simülasyonu: solda kapsam seçenekleri,
 * sağda anında değişen mini stok önizlemesi. Görünmeyen birimler kilit-desenli
 * soluklaşır; kimin gördüğü alt satırda mono yazar. Veriler örnektir.
 * Mobil: seçenekler yatay sarmalı çip satırı, önizleme altta.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const DURUM_SINIF: Record<Durum, string> = {
  musait: "bg-green",
  opsiyon: "bg-amber",
  satildi: "bg-red",
};

const BIRIM_SAYISI = 40;

function birimDurum(i: number): Durum {
  let h = ((i + 5) * 2654435761) % 100;
  if (h < 0) h += 100;
  if (h < 58) return "musait";
  if (h < 79) return "opsiyon";
  return "satildi";
}

/** her birime 0..4 arası tahsis grubu: kapsam daraldıkça daha az grup açık kalır */
const birimGrup = (i: number) => (i * 37 + 11) % 5;

type KapsamId = "tum" | "ofis" | "danisman" | "ozel" | "sureli";

const KAPSAMLAR: { id: KapsamId; ad: string; kim: string; acik: (grup: number) => boolean }[] = [
  { id: "tum", ad: "Tüm ağ", kim: "34 danışman görüyor", acik: () => true },
  { id: "ofis", ad: "Seçili ofisler", kim: "2 ofis, 11 danışman görüyor", acik: (g) => g < 3 },
  { id: "danisman", ad: "Seçili danışmanlar", kim: "yalnız 3 seçili danışman", acik: (g) => g < 2 },
  { id: "ozel", ad: "Özel tahsis", kim: "yalnız D. Aksoy", acik: (g) => g === 0 },
  { id: "sureli", ad: "Süreli tahsis (7 gün)", kim: "yalnız D. Aksoy, 7 gün", acik: (g) => g === 0 },
];

export function TahsisPaneli() {
  const reduce = useReducedMotion();
  const [secili, setSecili] = useState<KapsamId>("tum");
  const kapsam = KAPSAMLAR.find((k) => k.id === secili) ?? KAPSAMLAR[0];
  const acikSayi = Array.from({ length: BIRIM_SAYISI }, (_, i) => i).filter((i) =>
    kapsam.acik(birimGrup(i))
  ).length;

  return (
    <div className="kart relative overflow-hidden p-0">
      <style>{`
        .tp-kilit {
          background: repeating-linear-gradient(135deg, rgba(16, 36, 58, 0.05) 0 6px, rgba(16, 36, 58, 0.10) 6px 12px);
          border: 1px dashed rgba(16, 36, 58, 0.20);
        }
      `}</style>

      <span className="absolute right-4 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek
      </span>

      <div className="border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
          Görünürlük tahsisi · Çankaya Vadi, A Blok
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[236px_1fr] md:gap-7">
        {/* ---- kapsam seçenekleri: masaüstü dikey liste, mobil sarmalı çipler ---- */}
        <div
          role="group"
          aria-label="Tahsis kapsamı seçimi"
          className="flex flex-wrap content-start gap-2 md:flex-col"
        >
          {KAPSAMLAR.map((k) => {
            const aktif = k.id === secili;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => setSecili(k.id)}
                className={`flex items-center gap-2.5 rounded-[11px] border px-3 py-2 text-left text-[12.5px] font-semibold transition-all md:py-2.5 ${
                  aktif
                    ? "border-teal bg-[var(--color-teal-soft)] text-ink shadow-[var(--golge-1)]"
                    : "border-[var(--cizgi-2)] bg-white text-ink-soft hover:border-[rgba(16,36,58,0.22)] hover:text-ink"
                }`}
              >
                <span
                  className={`flex size-3.5 flex-none items-center justify-center rounded-full border transition-colors ${
                    aktif ? "border-teal" : "border-[rgba(16,36,58,0.3)]"
                  }`}
                  aria-hidden
                >
                  {aktif ? <span className="size-1.5 rounded-full bg-teal" /> : null}
                </span>
                {k.ad}
              </button>
            );
          })}
        </div>

        {/* ---- mini stok önizlemesi ---- */}
        <div>
          <div className="rounded-2xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                Stok önizleme · 40 birim
              </span>
              {secili === "sureli" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-amber-soft)] px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[#9a6a12]">
                  <span className="size-1.5 rounded-full bg-amber" aria-hidden />7 gün sonra otomatik kapanır
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-8 gap-1.5" aria-hidden>
              {Array.from({ length: BIRIM_SAYISI }, (_, i) => {
                const acik = kapsam.acik(birimGrup(i));
                return (
                  <span
                    key={i}
                    className={`aspect-square rounded-[5px] transition-all duration-300 ${
                      acik ? DURUM_SINIF[birimDurum(i)] : "tp-kilit"
                    }`}
                    style={{ opacity: acik ? 0.95 : 0.7 }}
                  />
                );
              })}
            </div>

            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] text-[var(--ink-faint)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[3px] bg-green" aria-hidden /> müsait
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[3px] bg-amber" aria-hidden /> opsiyon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-[3px] bg-red" aria-hidden /> satıldı
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="tp-kilit size-2 rounded-[3px]" aria-hidden /> kapalı
              </span>
            </p>
          </div>

          {/* kimin gördüğü: mono durum satırı */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-[var(--cizgi)] bg-white px-3.5 py-2.5">
            <motion.span
              key={secili}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-[11.5px] font-semibold text-ink"
              aria-live="polite"
            >
              {kapsam.kim}
            </motion.span>
            <span className="font-mono text-[10.5px] text-ink-soft">
              {acikSayi}/{BIRIM_SAYISI} birim açık
            </span>
          </div>

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--ink-faint)]">
            Kapsam dışında kalan her birim herkese kapalıdır. Görünürlük tahsisle tanımlanır, tahmine bırakılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}
