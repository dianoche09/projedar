"use client";

import { useState } from "react";

/**
 * GaleriTahsis · Mockup 09, tahsis bölümü ("özel sergi" dili).
 * TahsisPaneli deseninin koyu galeri uyarlaması: solda davet kapsamı
 * seçenekleri, sağda anında değişen eser duvarı önizlemesi. Davet dışında
 * kalan eserlerin ışığı söner (kilit desenli, soluk). Kimin gördüğü alt
 * satırda mono yazar. Tüm veriler örnektir.
 */

type Durum = "musait" | "opsiyon" | "satildi";

const DURUM_SINIF: Record<Durum, string> = {
  musait: "m9-eser-musait",
  opsiyon: "m9-eser-opsiyon",
  satildi: "m9-eser-satildi",
};

const ESER_SAYISI = 32;

function eserDurum(i: number): Durum {
  let h = ((i + 5) * 2654435761) % 100;
  if (h < 0) h += 100;
  if (h < 58) return "musait";
  if (h < 80) return "opsiyon";
  return "satildi";
}

/* her esere 0..4 arası davet grubu: kapsam daraldıkça daha az grup açık kalır */
const eserGrup = (i: number) => (i * 37 + 11) % 5;

type KapsamId = "tum" | "grup" | "secili" | "tek";

const KAPSAMLAR: { id: KapsamId; ad: string; kim: string; acik: (grup: number) => boolean }[] = [
  { id: "tum", ad: "Tüm davetli ağı", kim: "28 danışman bu sergiyi görüyor", acik: () => true },
  { id: "grup", ad: "Seçili ofisler", kim: "2 ofis, 9 danışman görüyor", acik: (g) => g < 3 },
  { id: "secili", ad: "Seçili danışmanlar", kim: "yalnız 3 davetli danışman", acik: (g) => g < 2 },
  { id: "tek", ad: "Tek davetli, süreli", kim: "yalnız D. Aksoy, 7 gün", acik: (g) => g === 0 },
];

export function GaleriTahsis() {
  const [secili, setSecili] = useState<KapsamId>("tum");
  const kapsam = KAPSAMLAR.find((k) => k.id === secili) ?? KAPSAMLAR[0];
  const acikSayi = Array.from({ length: ESER_SAYISI }, (_, i) => i).filter((i) =>
    kapsam.acik(eserGrup(i))
  ).length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--m9-cizgi)] bg-[var(--m9-zemin-2)]">
      <span className="absolute right-4 top-4 z-10 rounded border border-[var(--m9-cizgi)] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--m9-ink-soft)]">
        örnek
      </span>

      <div className="border-b border-[var(--m9-cizgi)] px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--m9-ink-soft)]">
          Davet listesi · Vadi Rezidans, B Blok
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[240px_1fr] md:gap-7">
        {/* ---- davet kapsamı seçenekleri ---- */}
        <div role="group" aria-label="Davet kapsamı seçimi" className="flex flex-wrap content-start gap-2 md:flex-col">
          {KAPSAMLAR.map((k) => {
            const aktif = k.id === secili;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => setSecili(k.id)}
                className="m9-kapsam-secenek"
              >
                <span className="m9-kapsam-halka" aria-hidden>
                  {aktif ? <span /> : null}
                </span>
                {k.ad}
              </button>
            );
          })}
        </div>

        {/* ---- eser duvarı önizlemesi ---- */}
        <div>
          <div className="rounded-xl border border-[var(--m9-cizgi)] bg-[#101013] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-[var(--m9-ink-soft)]">
                Sergi önizleme · 32 eser
              </span>
              {secili === "tek" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(227,161,44,0.14)] px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[#ecbd66]">
                  <span className="size-1.5 rounded-full bg-[var(--m9-amber)]" aria-hidden />
                  7 gün sonra otomatik kapanır
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-8 gap-1.5" aria-hidden>
              {Array.from({ length: ESER_SAYISI }, (_, i) => {
                const acik = kapsam.acik(eserGrup(i));
                return (
                  <span
                    key={i}
                    className={`m9-eser ${acik ? DURUM_SINIF[eserDurum(i)] : "m9-eser-kapali"}`}
                  />
                );
              })}
            </div>

            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] text-[var(--m9-ink-soft)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="m9-eser-musait size-2 rounded-[3px]" aria-hidden /> müsait
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="m9-eser-opsiyon size-2 rounded-[3px]" aria-hidden /> opsiyon
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="m9-eser-satildi size-2 rounded-[3px]" aria-hidden /> satıldı
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="m9-eser-kapali size-2 rounded-[3px]" aria-hidden /> ışığı sönük
              </span>
            </p>
          </div>

          {/* kimin gördüğü: mono durum satırı */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--m9-cizgi)] bg-[#101013] px-3.5 py-2.5">
            <span key={secili} className="font-mono text-[11.5px] font-semibold text-[var(--m9-ink)]" aria-live="polite">
              {kapsam.kim}
            </span>
            <span className="font-mono text-[10.5px] text-[var(--m9-ink-soft)]">
              {acikSayi}/{ESER_SAYISI} eser davette
            </span>
          </div>

          <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--m9-ink-soft)]">
            Davet dışında kalan eserin spotu söner: birim o ekranda hiç yoktur. Görünürlük tahsisle
            tanımlanır, tahmine bırakılmaz.
          </p>
        </div>
      </div>
    </div>
  );
}
