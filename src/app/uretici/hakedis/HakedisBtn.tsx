"use client";

import { useState, useTransition } from "react";
import { hakedisIsaretle } from "./actions";

/** Müteahhit hakediş ödeme toggle'ı — "Ödendi işaretle" / "Geri al". */
export function HakedisBtn({
  birimId,
  projeId,
  odendi: baslangic,
}: {
  birimId: string;
  projeId: string;
  odendi: boolean;
}) {
  const [odendi, setOdendi] = useState(baslangic);
  const [bekle, basla] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  function degistir() {
    setHata(null);
    const hedef = !odendi;
    basla(async () => {
      const r = await hakedisIsaretle(birimId, projeId, hedef);
      if (r.ok) setOdendi(hedef);
      else setHata(r.mesaj);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={degistir}
        disabled={bekle}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50 ${
          odendi
            ? "bg-green-soft text-green hover:bg-green/15"
            : "bg-teal text-white hover:bg-teal-d"
        }`}
      >
        {bekle ? "…" : odendi ? "Ödendi ✓ · geri al" : "Ödendi işaretle"}
      </button>
      {hata ? <span className="text-[11px] text-red">{hata}</span> : null}
    </div>
  );
}
