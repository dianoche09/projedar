"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { fiyatOneriUygula, fiyatOneriReddet } from "@/app/uretici/actions";
import { paraKisa } from "@/lib/stok";

/** Kuyruk aksiyonu submit butonu — pending sırasında disable + etiket (çift-submit kalkanı, min 44px). */
function KuyrukBtn({
  disabled,
  cesit,
  etiket,
  bekleyen,
}: {
  disabled: boolean;
  cesit: "uygula" | "reddet";
  etiket: string;
  bekleyen: string;
}) {
  const { pending } = useFormStatus();
  const stil =
    cesit === "uygula"
      ? "bg-teal text-white hover:bg-teal-d"
      : "border border-hair bg-card text-gray hover:text-red";
  return (
    <button
      disabled={disabled || pending}
      className={`min-h-[44px] rounded-lg px-4 text-xs font-bold transition-colors disabled:opacity-40 ${stil}`}
    >
      {pending ? bekleyen : etiket}
    </button>
  );
}

export type OneriKart = {
  id: string;
  proje_ad: string;
  daire: string;
  kural_ad: string;
  eski: number | null;
  yeni: number;
  para: string;
};

/** Dinamik fiyat kurallarının ürettiği bekleyen önerilerin onay kuyruğu (mod='oneri'). */
export function OneriKuyrugu({ oneriler }: { oneriler: OneriKart[] }) {
  const [secili, setSecili] = useState<Set<string>>(() => new Set(oneriler.map((o) => o.id)));
  if (oneriler.length === 0) return null;
  const tumu = secili.size === oneriler.length;
  const idStr = [...secili].join(",");
  const topla = (id: string) =>
    setSecili((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section className="belir mb-6 rounded-2xl border border-teal/30 bg-teal/[0.04] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[16px] font-bold text-ink">Kural Önerileri · Onay Bekliyor</h2>
          <p className="text-[12px] text-ink-soft">
            Dinamik fiyat kuralların {oneriler.length} birimde değişiklik önerdi. Seçip uygula ya da reddet.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={fiyatOneriReddet}>
            <input type="hidden" name="oneri_idler" value={idStr} />
            <KuyrukBtn disabled={secili.size === 0} cesit="reddet" etiket="Seçileni reddet" bekleyen="Reddediliyor…" />
          </form>
          <form action={fiyatOneriUygula}>
            <input type="hidden" name="oneri_idler" value={idStr} />
            <KuyrukBtn disabled={secili.size === 0} cesit="uygula" etiket={`Seçileni uygula (${secili.size})`} bekleyen="Uygulanıyor…" />
          </form>
        </div>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-hair bg-card">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-8">
                  <input
                    type="checkbox"
                    checked={tumu}
                    onChange={() => setSecili(tumu ? new Set() : new Set(oneriler.map((o) => o.id)))}
                    aria-label="Tümünü seç"
                  />
                </th>
                <th>Proje · Daire</th>
                <th>Kural</th>
                <th className="text-right">Mevcut</th>
                <th className="text-right">Yeni</th>
              </tr>
            </thead>
            <tbody>
              {oneriler.map((o) => (
                <tr key={o.id}>
                  <td>
                    <input type="checkbox" checked={secili.has(o.id)} onChange={() => topla(o.id)} aria-label="Seç" />
                  </td>
                  <td>
                    <span className="block text-[12.5px] font-medium text-ink">{o.proje_ad}</span>
                    <span className="mono text-[11px] text-gray">{o.daire}</span>
                  </td>
                  <td className="text-[12px] text-ink-soft">{o.kural_ad}</td>
                  <td className="mono text-right text-gray">{o.eski != null ? paraKisa(o.eski, o.para) : "—"}</td>
                  <td className="mono text-right font-semibold text-teal-d">{paraKisa(o.yeni, o.para)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
