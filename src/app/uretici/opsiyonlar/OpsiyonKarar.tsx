"use client";

import { useTransition } from "react";
import { opsiyonDogrula, opsiyonReddet } from "@/app/uretici/actions";
import { useToast } from "@/components/ui/Toast";

/**
 * Müteahhit GEÇİCİ opsiyon kararı — Doğrula (kesin kilit) / Reddet (daire serbest).
 * Geçici kilit: emlakçı gerçek müşteri için daireyi anında kilitledi; müteahhit teyit eder.
 */
export function OpsiyonKarar({ opsiyonId }: { opsiyonId: string }) {
  const [bekliyor, basla] = useTransition();
  const toast = useToast();

  return (
    <div className="flex flex-none items-center gap-2">
      <button
        type="button"
        disabled={bekliyor}
        onClick={() =>
          basla(async () => {
            const r = await opsiyonDogrula(opsiyonId);
            toast.goster(r.mesaj, r.ok ? "basari" : "hata");
          })
        }
        className="rounded-lg bg-green px-3 py-[7px] text-[11.5px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {bekliyor ? "…" : "Doğrula"}
      </button>
      <button
        type="button"
        disabled={bekliyor}
        onClick={() =>
          basla(async () => {
            const r = await opsiyonReddet(opsiyonId);
            toast.goster(r.mesaj, r.ok ? "basari" : "hata");
          })
        }
        className="rounded-lg border border-red/30 px-3 py-[7px] text-[11.5px] font-bold text-red transition-all hover:bg-red-soft disabled:opacity-50"
      >
        Reddet
      </button>
    </div>
  );
}
