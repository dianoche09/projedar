"use client";

import { useState } from "react";
import { DURUM_ETIKET } from "@/lib/types";
import { durumGrup, type DurumGrup } from "@/lib/stok";
import { DaireModal, type ModalBirim, type Eklenti } from "./DaireModal";
import { useSecim } from "./SecimDuzenle";

// Tek doğru kaynak: durumGrup (stok kesitiyle AYNI renk dili → aynı daire iki ekranda aynı renk).
const GRUP_HUCRE: Record<DurumGrup, string> = {
  acik: "h-musait",
  opsiyon: "h-opsiyon",
  satildi: "h-satildi",
  planli: "h-planli",
  kapali: "h-kilit", // satılamaz (arsa payı) / stop / kiralandı → kesikli gri
};

/** Birim durumu (+satilabilir) → bina kesiti hücre sınıfı (v2 .hucre). */
function hucreSinif(durum: string, satilabilir: boolean): string {
  return GRUP_HUCRE[durumGrup(durum, satilabilir)];
}

/**
 * Bina kesiti hücresi — durum-renkli gradient + daire no + tip (oda).
 * Tıkla → merkezi Daire MODAL. mod: üretici (durum/not) | emlakçı (paylaş/opsiyon).
 * Seçim modunda (SecimDuzenle) toplu işaretleme.
 */
export function BirimHucre({
  birim,
  projeId,
  mod = "uretici",
  projeAd = "",
  shareUrl = "",
  benimOpsiyon = false,
  opsiyonYontemi = "talep_kod",
  eklentiler = [],
  onSec,
}: {
  birim: ModalBirim;
  projeId: string;
  mod?: "uretici" | "emlakci";
  projeAd?: string;
  shareUrl?: string;
  benimOpsiyon?: boolean;
  opsiyonYontemi?: string;
  eklentiler?: Eklenti[];
  /** Verilirse hücre kendi modalını AÇMAZ; seçimi yukarı bildirir (tek merkezi DaireModal). */
  onSec?: (id: string) => void;
}) {
  const [acik, setAcik] = useState(false);
  const secim = useSecim();
  const secimModu = secim?.secimModu ?? false;
  const seciliMi = secim?.secili.has(birim.id) ?? false;
  const tip = birim.oda ?? birim.tip_ad ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => (secimModu ? secim!.toggle(birim.id) : onSec ? onSec(birim.id) : setAcik(true))}
        title={`${birim.daire_no ?? ""} · ${DURUM_ETIKET[birim.durum]}${!birim.satilabilir ? " · arsa payı (satılamaz)" : ""}`}
        className={`hucre min-w-[48px] shrink-0 ${hucreSinif(birim.durum, birim.satilabilir)} ${
          seciliMi ? "ring-2 ring-white" : ""
        }`}
      >
        {seciliMi ? (
          <span className="text-[14px] font-bold">✓</span>
        ) : (
          <>
            <span className="font-mono text-[11px] font-bold leading-none">{birim.daire_no ?? "—"}</span>
            {tip ? (
              <span className="mt-[3px] text-[8.5px] font-semibold leading-none opacity-85">{tip}</span>
            ) : null}
          </>
        )}
      </button>

      {acik && !secimModu && !onSec ? (
        <DaireModal
          birim={birim}
          projeId={projeId}
          mod={mod}
          projeAd={projeAd}
          shareUrl={shareUrl}
          benimOpsiyon={benimOpsiyon}
          opsiyonYontemi={opsiyonYontemi}
          eklentiler={eklentiler}
          onKapat={() => setAcik(false)}
        />
      ) : null}
    </>
  );
}
