"use client";

import { useState } from "react";

export function DavetPanel({ link, ad }: { link: string; ad: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  const mesaj = `${ad} seni ProjePazar canlı stok ağına davet ediyor. Kaydol, sana tahsisli projeleri canlı gör ve paylaş: ${link}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(mesaj)}`;
  const mail = `mailto:?subject=${encodeURIComponent("ProjePazar daveti")}&body=${encodeURIComponent(mesaj)}`;

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 1500);
    } catch {
      /* clipboard izni yoksa sessiz geç — kullanıcı elle seçebilir */
    }
  };

  return (
    <div className="kart p-5">
      <label className="text-xs font-bold text-ink">Davet linkin</label>
      <div className="mt-1 flex gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-hair bg-soft px-3 py-2 font-mono text-[12px] text-ink"
        />
        <button
          type="button"
          onClick={kopyala}
          className="shrink-0 rounded-lg bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          {kopyalandi ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-action flex-1 justify-center text-center">
          WhatsApp ile davet et
        </a>
        <a href={mail} className="btn-ghost flex-1 justify-center text-center">
          Mail ile
        </a>
      </div>

      <p className="mt-4 rounded-xl border border-teal/20 bg-teal-soft/50 px-3.5 py-2.5 text-[12px] font-medium text-teal-d">
        Davet edilen danışman kaydolur ve <strong>MYS + vergi levhası</strong> yükler. Sen onayladıktan (admin doğrulaması)
        sonra ona tahsis açarsın — davet, belge doğrulamasını atlamaz.
      </p>
      <p className="mt-2 text-[11px] text-gray">Aynı link tüm davetlerinde kullanılabilir.</p>
    </div>
  );
}
