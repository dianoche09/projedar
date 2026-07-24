"use client";

import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";

/**
 * Mini canlı havuz kartı — /emlakci landing "dert→çözüm" bloğunun sağ tarafı.
 * Scripted olay döngüsüyle canlı güncelleme hissi verir (fiyat/durum değişir,
 * tazelik "şimdi"ye döner, satır kısa süre parlar). Veriler ÖRNEK — rozetli.
 */

type Durum = "musait" | "opsiyon";
type Birim = { kod: string; tip: string; net: number; fiyat: string; durum: Durum; taze: string };

const BASLANGIC: Birim[] = [
  { kod: "A-7-2", tip: "3+1", net: 142, fiyat: "₺8,75M", durum: "musait", taze: "2 dk önce" },
  { kod: "A-4-1", tip: "2+1", net: 94, fiyat: "₺5,80M", durum: "musait", taze: "11 dk önce" },
  { kod: "B-9-4", tip: "4+1", net: 186, fiyat: "₺12,2M", durum: "opsiyon", taze: "26 dk önce" },
  { kod: "C-5-3", tip: "3+1", net: 138, fiyat: "₺8,40M", durum: "musait", taze: "1 sa önce" },
];

/** Scripted olay döngüsü — örnek görünüm; gerçek üründe kaynak Supabase Realtime. */
const OLAYLAR: { kod: string; fiyat?: string; durum?: Durum }[] = [
  { kod: "A-7-2", fiyat: "₺8,90M" },
  { kod: "C-5-3", durum: "opsiyon" },
  { kod: "A-4-1", fiyat: "₺5,95M" },
  { kod: "C-5-3", durum: "musait" },
  { kod: "A-7-2", fiyat: "₺8,75M" },
  { kod: "A-4-1", fiyat: "₺5,80M" },
];

const DURUM_GORSEL: Record<Durum, { sinif: string; etiket: string }> = {
  musait: { sinif: "d-musait", etiket: "Müsait" },
  opsiyon: { sinif: "d-opsiyon", etiket: "Opsiyon" },
};

export function HavuzKarti() {
  const [birimler, setBirimler] = useState<Birim[]>(BASLANGIC);
  const [parlayan, setParlayan] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const olayNo = useRef(0);
  const toastZamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let parlamaZamanlayici: ReturnType<typeof setTimeout> | null = null;
    const aralik = setInterval(() => {
      const olay = OLAYLAR[olayNo.current % OLAYLAR.length];
      olayNo.current += 1;
      setBirimler((prev) =>
        prev.map((b) =>
          b.kod === olay.kod
            ? { ...b, fiyat: olay.fiyat ?? b.fiyat, durum: olay.durum ?? b.durum, taze: "şimdi" }
            : b,
        ),
      );
      setParlayan(olay.kod);
      parlamaZamanlayici = setTimeout(() => setParlayan(null), 1100);
    }, 3600);
    return () => {
      clearInterval(aralik);
      if (parlamaZamanlayici) clearTimeout(parlamaZamanlayici);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastZamanlayici.current) clearTimeout(toastZamanlayici.current);
    };
  }, []);

  const paylas = () => {
    setToast(true);
    if (toastZamanlayici.current) clearTimeout(toastZamanlayici.current);
    toastZamanlayici.current = setTimeout(() => setToast(false), 2400);
  };

  return (
    <div className="kart signal-top relative overflow-hidden p-0" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
      <span className="absolute right-4 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
        örnek görünüm
      </span>

      {/* başlık — tahsisli havuz + canlılık rozeti */}
      <div className="border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-display text-base font-bold text-ink">Sana tahsisli havuz</span>
          <span className="rounded-full bg-[var(--color-teal-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-teal-d)]">✓ Doğrulanmış projeler</span>
        </div>
        <span className="taze t-0 mt-1.5">
          <span className="nokta nabiz" /> {parlayan ? "şimdi güncellendi" : "2 dk önce güncellendi"}
        </span>
      </div>

      {/* birim satırları — canlı fiyat + durum + tazelik */}
      <ul className="flex flex-col">
        {birimler.map((b) => {
          const d = DURUM_GORSEL[b.durum];
          const parliyor = parlayan === b.kod;
          return (
            <li
              key={b.kod}
              className={`flex items-center gap-3 border-b border-[var(--cizgi)] px-5 py-3 transition-colors duration-700 last:border-b-0 ${parliyor ? "bg-[var(--color-teal-soft)]" : "bg-transparent"}`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-semibold text-ink">{b.kod}</span>
                  <span className="font-mono text-[11px] text-ink-soft">{b.tip} · {b.net} m²</span>
                </div>
                <span className={`taze mt-1 ${b.taze === "şimdi" ? "t-0" : "t-7"}`}>
                  <span className="nokta" /> {b.taze}
                </span>
              </div>
              <span className="font-mono text-[15px] font-semibold text-ink">{b.fiyat}</span>
              <span className={`durum ${d.sinif}`}><span className="nokta" />{d.etiket}</span>
            </li>
          );
        })}
      </ul>

      {/* alt bar — paylaş + canlı fiyat notu */}
      <div className="relative flex items-center justify-between gap-3 border-t border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-3.5">
        <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">Fiyat paylaşımda canlı değerden basılır</span>
        <button type="button" onClick={paylas} className="btn-action px-4 text-[13px]">
          <Share2 size={14} strokeWidth={2} /> Müşteriye paylaş
        </button>
        <span
          aria-live="polite"
          className={`paylas-toast absolute bottom-full right-4 mb-2 rounded-full border border-[var(--cizgi)] bg-white px-3.5 py-2 font-mono text-[11px] font-semibold text-ink shadow-[var(--golge-2)] ${toast ? "acik" : ""}`}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green align-middle" />
          Örnek: link canlı fiyatla hazır
        </span>
      </div>
    </div>
  );
}
