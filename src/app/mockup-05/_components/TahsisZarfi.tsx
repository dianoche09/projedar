"use client";

import { useState } from "react";

/**
 * Tahsis metaforu: proje ilana asılmaz, seçilmiş danışmanlara zarflanır.
 * Zarfa dokununca kapak açılır, üç isim etiketi çıkar.
 */

const DANISMANLAR = [
  { ad: "Danışman A", bolge: "Çankaya sahası", tahsis: "B blok · 12 birim" },
  { ad: "Danışman B", bolge: "Oran sahası", tahsis: "A blok · 8 birim" },
  { ad: "Danışman C", bolge: "İncek sahası", tahsis: "C blok · 6 birim" },
];

export function TahsisZarfi() {
  const [acik, setAcik] = useState(false);

  return (
    <div className="mx-auto max-w-md">
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        className={`m5-zarf block w-full text-left ${acik ? "acik" : ""}`}
        aria-expanded={acik}
        aria-label={acik ? "Zarfı kapat" : "Zarfı aç: tahsis listesini gör"}
      >
        <div className="m5-zarf-govde px-5 pb-5 pt-5">
          <span className="m5-zarf-kapak" aria-hidden />

          {/* zarf üstü: adres satırı */}
          <div className="relative z-[5] flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#5a6577]">
                Vadi Konakları · dağıtım zarfı
              </p>
              <p className="font-display mt-1 text-[16px] font-semibold text-[#17293d]">
                Yalnız 3 danışmana zarflandı
              </p>
            </div>
            <span className="m5-muhur m5-muhur-onay flex-none">Tahsis</span>
          </div>

          {/* zarf içeriği: isim etiketleri */}
          <div className="m5-zarf-icerik relative z-[2] mt-5 space-y-2.5">
            {DANISMANLAR.map((d) => (
              <div key={d.ad} className="m5-isim-etiket">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#e2f3f0] font-mono text-[11px] font-bold text-[#177e6f]">
                  {d.ad.slice(-1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#17293d]">{d.ad}</p>
                  <p className="font-mono text-[10px] text-[#8b97a8]">{d.bolge}</p>
                </div>
                <span className="font-mono text-[10px] font-medium text-[#177e6f]">{d.tahsis}</span>
              </div>
            ))}
          </div>

          <p className="relative z-[5] mt-4 border-t border-dashed border-[rgba(23,41,61,0.14)] pt-3 text-center font-mono text-[10.5px] text-[#8b97a8]">
            {acik ? "Kalan ağ bu stoğu hiç görmez." : "Zarfa dokun: tahsis listesi açılır"}
          </p>
        </div>
      </button>
    </div>
  );
}
