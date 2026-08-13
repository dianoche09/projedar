"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SeciBirim = {
  id: string;
  daire_no: string | null;
  oda: string | null;
  kat: number | null;
  net_m2: number | null;
  liste_fiyati: number | null;
  para_birimi: string | null;
};

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

/**
 * Müşteri kataloğu için daire seçimi — proje detay sayfasında. Checkbox ile seç,
 * "Katalog oluştur" → /danisman/proje/[id]/katalog?b=... server route'u açılır (canlı katalog).
 * EmlakciStok'a dokunmaz (izole seçim katmanı).
 */
export function KatalogSecici({ projeId, birimler }: { projeId: string; birimler: SeciBirim[] }) {
  const router = useRouter();
  const [secili, setSecili] = useState<Set<string>>(new Set());

  if (birimler.length === 0) return null;

  const tumu = secili.size === birimler.length;

  const toggle = (id: string) =>
    setSecili((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleTumu = () => setSecili(tumu ? new Set() : new Set(birimler.map((b) => b.id)));

  const olustur = () => {
    if (secili.size === 0) return;
    router.push(`/danisman/proje/${projeId}/katalog?b=${[...secili].join(",")}`);
  };

  return (
    <div className="kart mt-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Müşteri Kataloğu</h2>
          <p className="mt-0.5 text-[13px] text-gray">
            Daire seç, tek sayfa katalog üret, müşterine gönder. Fiyat canlı basılır.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTumu}
          className="mono flex-none text-[11px] font-bold uppercase tracking-[0.08em] text-teal-d hover:text-teal"
        >
          {tumu ? "Seçimi kaldır" : "Tümünü seç"}
        </button>
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-hair">
        {birimler.map((b) => {
          const psim = PARA_SIMGE[b.para_birimi ?? "TRY"] ?? "₺";
          return (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-3 border-b border-hair px-3.5 py-2.5 last:border-b-0 hover:bg-soft"
            >
              <input
                type="checkbox"
                checked={secili.has(b.id)}
                onChange={() => toggle(b.id)}
                className="size-4 flex-none rounded border-hair text-teal focus:ring-0 focus:ring-offset-0"
              />
              <span className="mono w-14 flex-none font-semibold text-ink">{b.daire_no ?? "—"}</span>
              <span className="flex-1 truncate text-[12.5px] text-ink-soft">
                {b.oda ?? "—"}
                {b.kat != null ? ` · K${b.kat}` : ""}
                {b.net_m2 ? ` · ${b.net_m2}m²` : ""}
              </span>
              <span className="mono flex-none text-[12.5px] font-semibold text-ink">
                {b.liste_fiyati ? `${fmt(Number(b.liste_fiyati))} ${psim}` : "—"}
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={olustur}
        disabled={secili.size === 0}
        className="btn-action mt-4 w-full disabled:opacity-50"
      >
        Katalog oluştur{secili.size > 0 ? ` (${secili.size} daire)` : ""}
      </button>
    </div>
  );
}
