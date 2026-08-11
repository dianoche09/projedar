"use client";

import { useState, useTransition } from "react";
import { leadNotEkle } from "@/app/havuz/actions";
import { useToast } from "@/components/ui/Toast";

const TIPLER: [string, string][] = [
  ["not", "Not"],
  ["arama", "Arama"],
  ["whatsapp", "WhatsApp"],
  ["gorusme", "Görüşme"],
];

/** L2: lead'e hızlı aktivite/not ekleme (timeline'a düşer). */
export function LeadNotForm({ leadId }: { leadId: string }) {
  const [tip, setTip] = useState("not");
  const [govde, setGovde] = useState("");
  const [bekliyor, basla] = useTransition();
  const toast = useToast();

  const ekle = () => {
    const t = govde.trim();
    if (!t || bekliyor) return;
    basla(async () => {
      const r = await leadNotEkle(leadId, tip, t);
      if (r.ok) {
        setGovde("");
        toast.goster("Not eklendi", "basari");
      } else {
        toast.goster("Eklenemedi", "hata");
      }
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {TIPLER.map(([v, et]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTip(v)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              tip === v ? "bg-navy text-white" : "border border-hair text-gray hover:border-teal hover:text-ink"
            }`}
          >
            {et}
          </button>
        ))}
      </div>
      <textarea
        value={govde}
        onChange={(e) => setGovde(e.target.value)}
        placeholder="Görüşme özeti, müşterinin dediği, sonraki adım…"
        rows={3}
        maxLength={1000}
        className="w-full resize-y rounded-xl border border-hair bg-white px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-teal"
      />
      <div className="flex justify-end">
        <button type="button" onClick={ekle} disabled={bekliyor || !govde.trim()} className="btn-primary disabled:opacity-60">
          {bekliyor ? "Ekleniyor…" : "Ekle"}
        </button>
      </div>
    </div>
  );
}
