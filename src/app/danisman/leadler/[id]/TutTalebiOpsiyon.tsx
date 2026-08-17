"use client";

import { useState, useTransition } from "react";
import { opsiyonAlGecici } from "@/app/danisman/actions";
import { useToast } from "@/components/ui/Toast";

/**
 * D1/Option B köprüsü — "almak istiyorum" (on_rezervasyon) lead'inden tek-tık GERÇEK geçici opsiyon.
 * Kilit yine danışman-başlatır + kota + müteahhit doğrulaması (opsiyon_al_gecici RPC gate'leri).
 * Müşteri hiçbir zaman kendi kendine kilitlemez; buyer'a "tutuyoruz" vaadi verilmez (kopya düzeltildi).
 */
export function TutTalebiOpsiyon({
  birimId,
  projeId,
  musteriAd,
  musteriTel,
}: {
  birimId: string;
  projeId: string;
  musteriAd: string;
  musteriTel: string;
}) {
  const [bekle, basla] = useTransition();
  const [alindi, setAlindi] = useState(false);
  const toast = useToast();

  function al() {
    basla(async () => {
      const r = await opsiyonAlGecici(
        birimId,
        projeId,
        musteriAd,
        musteriTel,
        "Müşterinin 'almak istiyorum' talebinden geçici opsiyon",
      );
      toast.goster(r.mesaj, r.ok ? "basari" : "hata");
      if (r.ok) setAlindi(true);
    });
  }

  if (alindi) {
    return (
      <p className="text-[12.5px] font-semibold text-green">
        ✓ Geçici opsiyon alındı — müteahhit doğrulaması bekliyor. Opsiyonlarım&apos;dan takip et.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={al}
      disabled={bekle}
      className="w-full rounded-xl bg-teal py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-teal-d disabled:opacity-50"
    >
      {bekle ? "Kilitleniyor…" : `Geçici opsiyon al · müşteri: ${musteriAd || "—"}`}
    </button>
  );
}
