"use client";

import { useEffect, useState } from "react";
import { ilgiBildir } from "@/app/danisman/actions";

/** Kalan süreyi "3g 4sa" / "5sa 20dk" / "12dk" biçiminde döndürür. */
function geriSayim(hedef: number): string {
  const fark = hedef - Date.now();
  if (fark <= 0) return "açılıyor…";
  const gun = Math.floor(fark / 86_400_000);
  const saat = Math.floor((fark % 86_400_000) / 3_600_000);
  const dk = Math.floor((fark % 3_600_000) / 60_000);
  if (gun > 0) return `${gun}g ${saat}sa`;
  if (saat > 0) return `${saat}sa ${dk}dk`;
  return `${dk}dk`;
}

/**
 * Emlakçı vitrini: planlı (dalga) birimler için "yakında açılıyor" geri sayım rozeti
 * + "açılınca haber ver" (açılış öncesi talep sinyali = 'ilgi' event). Opsiyon alınamaz;
 * amaç kıtlık + senkron talep yaratmak (veri yerçekimi).
 */
export function DalgaTeaser({
  projeId,
  birimId,
  adet,
  acilis,
}: {
  projeId: string;
  birimId: string; // en yakın açılışlı temsili birim — 'ilgi' buna yazılır
  adet: number;
  acilis: string; // ISO
}) {
  const hedef = new Date(acilis).getTime();
  const [kalan, setKalan] = useState(() => geriSayim(hedef));
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "ok">("bos");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    const t = setInterval(() => setKalan(geriSayim(hedef)), 60_000);
    return () => clearInterval(t);
  }, [hedef]);

  const haberVer = async () => {
    setDurum("gonderiliyor");
    const r = await ilgiBildir(birimId, projeId);
    setDurum(r.ok ? "ok" : "bos");
    setMesaj(r.mesaj);
  };

  const acilisMetin = new Date(acilis).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="kart belir belir-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-navy/20 bg-navy/[0.03] p-4">
      <span className="inline-flex size-9 flex-none items-center justify-center rounded-full bg-navy/10 text-[15px] text-navy">
        ◷
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-navy">
          {adet} birim yakında açılıyor · {acilisMetin}
        </p>
        <p className="mono text-[12px] text-ink-soft">Açılışa {kalan}</p>
      </div>
      {durum === "ok" ? (
        <span className="rounded-full bg-green-soft px-3 py-1.5 text-[12px] font-semibold text-teal-d">
          ✓ {mesaj}
        </span>
      ) : (
        <button
          type="button"
          onClick={haberVer}
          disabled={durum === "gonderiliyor"}
          className="rounded-lg border border-navy bg-navy px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {durum === "gonderiliyor" ? "…" : "Açılınca haber ver"}
        </button>
      )}
    </div>
  );
}
