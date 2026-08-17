"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { tahsisTopluAksiyon } from "@/app/uretici/actions";

type OpsRow = {
  opsiyon_id: string;
  birim_id: string;
  daire_no: string | null;
  satici_ad: string | null;
  durum: string;
  kilit_bitis: string | null;
};

/**
 * Tahsis KALDIR — B1/DDR-008. Kaldırmadan önce kapsamdaki aktif opsiyonları kontrol eder.
 * Aktif opsiyon yoksa doğrudan kaldırır. Varsa müteahhide iki seçenek sunar:
 *  · Süresine bırak (grandfather, öneri) — opsiyon doğal süresine kadar yaşar.
 *  · Serbest bırak — opsiyonları serbest bırakıp kaldırır (müteahhit bilinçli kararı).
 * Projedar hakem değildir; karar müteahhidindir + audit'e yazılır.
 */
export function TahsisKaldir({ tahsisId, projeId }: { tahsisId: string; projeId: string }) {
  const [modal, setModal] = useState<OpsRow[] | null>(null);
  const [kontrol, setKontrol] = useState(false);
  const [bekle, basla] = useTransition();

  function gonder(karar: "" | "serbest" | "sure") {
    const fd = new FormData();
    fd.set("proje_id", projeId);
    fd.set("aksiyon", "kaldir");
    fd.append("tahsis_ids", tahsisId);
    if (karar) fd.set("opsiyon_karar", karar);
    basla(async () => {
      await tahsisTopluAksiyon(fd);
    });
  }

  async function tikla() {
    setKontrol(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.rpc("tahsis_aktif_opsiyonlar", { p_proje_id: projeId, p_ids: [tahsisId] });
      const ops = (data ?? []) as OpsRow[];
      if (ops.length === 0) {
        gonder(""); // aktif opsiyon yok → doğrudan kaldır (grandfather no-op)
      } else {
        setModal(ops);
      }
    } finally {
      setKontrol(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={tikla}
        disabled={kontrol || bekle}
        className="rounded-lg border border-[var(--cizgi-2)] px-2.5 py-[5px] text-[11px] font-semibold text-gray transition-colors hover:border-red hover:bg-red-soft hover:text-red disabled:opacity-50"
      >
        {kontrol ? "…" : "Kaldır"}
      </button>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-hair bg-card p-5 shadow-lg">
            <h3 className="font-display text-lg font-bold text-ink">Bu kapsamda aktif opsiyon var</h3>
            <p className="mt-1 text-[12.5px] leading-snug text-gray">
              Tahsisi kaldırınca aşağıdaki aktif opsiyonlar için karar ver. Süresine bırakırsan opsiyon doğal
              süresine kadar geçerli kalır; serbest bırakırsan daire hemen müsait olur.
            </p>
            <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
              {modal.map((o) => (
                <li key={o.opsiyon_id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-2 text-[12px]">
                  <span className="font-medium text-ink">Daire {o.daire_no ?? "—"}</span>
                  <span className="text-gray">
                    {o.satici_ad ?? "Danışman"}
                    {o.kilit_bitis ? ` · ${new Date(o.kilit_bitis).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} bitiş` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={bekle}
                onClick={() => gonder("sure")}
                className="w-full rounded-xl border border-hair bg-card py-2.5 text-[13px] font-bold text-ink transition-colors hover:border-teal hover:bg-teal-soft disabled:opacity-50"
              >
                Süresine bırak ve kaldır <span className="font-normal text-gray">(öneri)</span>
              </button>
              <button
                type="button"
                disabled={bekle}
                onClick={() => gonder("serbest")}
                className="w-full rounded-xl bg-red/85 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-red disabled:opacity-50"
              >
                Serbest bırak ve kaldır
              </button>
              <button
                type="button"
                disabled={bekle}
                onClick={() => setModal(null)}
                className="w-full py-1.5 text-[12px] font-medium text-gray hover:text-ink"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
