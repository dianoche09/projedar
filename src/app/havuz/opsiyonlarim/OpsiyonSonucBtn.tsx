"use client";

import { useState, useTransition } from "react";
import { opsiyonSonuc, opsiyonUzat } from "@/app/havuz/actions";
import { useToast } from "@/components/ui/Toast";

/** TR telefonu wa.me formatına (905xxxxxxxxx) çevirir. */
function waNumara(tel: string | null): string | null {
  if (!tel) return null;
  const d = tel.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("5")) return `90${d}`;
  if (d.length === 11 && d.startsWith("0")) return `90${d.slice(1)}`;
  if (d.length === 12 && d.startsWith("90")) return d;
  return d.length >= 10 ? d : null;
}

/**
 * Emlakçının aktif opsiyonu için sonuç + müşteri teyidi.
 * - Satışa dönüştür / Vazgeç → opsiyonSonuc (güven skoruna yansır).
 * - Müşteri teyidi: giden WhatsApp deep-link (DEĞİŞMEZ #4 uyumlu; serbest-metin/AI yok).
 *   Yalnız opsiyon kesinleştiğinde (müteahhit doğruladı) gösterilir.
 */
export function OpsiyonSonucBtn({
  birimId,
  projeId,
  projeAd,
  daireNo,
  musteriTel,
  kesin,
  uzatilabilir = false,
}: {
  birimId: string;
  projeId: string;
  projeAd: string;
  daireNo: string | null;
  musteriTel: string | null;
  /** Opsiyon kesin mi (müteahhit doğruladı / doğrulama gerektirmeyen yöntem). Geçici-doğrulanmamışsa yalnız Vazgeç. */
  kesin: boolean;
  /** Uzatma hakkı açık + henüz uzatılmamış mı (müteahhit-tanımlı). */
  uzatilabilir?: boolean;
}) {
  const [bekliyor, basla] = useTransition();
  const [vazgecMod, setVazgecMod] = useState(false);
  const [sebep, setSebep] = useState("");
  const toast = useToast();

  const teyitMetni = `Merhaba, ${projeAd} projesinde ${daireNo ?? ""} numaralı daire için opsiyonunuz müteahhit onayıyla kesinleşti. Detaylar için bana ulaşabilirsiniz.`;
  const num = waNumara(musteriTel);
  const waUrl = `https://wa.me/${num ?? ""}?text=${encodeURIComponent(teyitMetni)}`;

  const satisaDonustur = () =>
    basla(async () => {
      const r = await opsiyonSonuc(birimId, projeId, "satildi");
      toast.goster(r.mesaj, r.ok ? "basari" : "hata");
    });

  const vazgec = () =>
    basla(async () => {
      const r = await opsiyonSonuc(birimId, projeId, "vazgecildi", sebep);
      toast.goster(r.mesaj, r.ok ? "basari" : "hata");
      if (r.ok) {
        setVazgecMod(false);
        setSebep("");
      }
    });

  const uzat = () =>
    basla(async () => {
      const r = await opsiyonUzat(birimId, projeId);
      toast.goster(r.mesaj, r.ok ? "basari" : "hata");
    });

  // Vazgeçme sebebi (zorunlu) — iki adımlı inline
  if (vazgecMod) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <input
          value={sebep}
          onChange={(e) => setSebep(e.target.value)}
          placeholder="Vazgeçme sebebi *"
          autoFocus
          className="min-w-[160px] rounded-lg border border-hair bg-soft px-2.5 py-[7px] text-[11px] text-ink outline-none focus:border-red/40"
        />
        <button
          type="button"
          disabled={bekliyor || sebep.trim() === ""}
          onClick={vazgec}
          className="rounded-lg bg-red px-2.5 py-[7px] text-[11px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {bekliyor ? "…" : "Vazgeçmeyi onayla"}
        </button>
        <button
          type="button"
          disabled={bekliyor}
          onClick={() => setVazgecMod(false)}
          className="rounded-lg border border-hair px-2.5 py-[7px] text-[11px] font-bold text-ink-soft transition-all hover:bg-soft disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {kesin && num ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-[#1faa5b] px-2.5 py-[7px] text-[11px] font-bold text-white transition-all hover:bg-[#178c4a]"
          title="Müşteriye WhatsApp'tan teyit gönder"
        >
          <svg className="size-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24z" />
          </svg>
          Teyit
        </a>
      ) : null}
      {kesin && uzatilabilir ? (
        <button
          type="button"
          disabled={bekliyor}
          onClick={uzat}
          className="rounded-lg border border-amber/40 px-2.5 py-[7px] text-[11px] font-bold text-amber transition-all hover:bg-amber-soft disabled:opacity-50"
          title="Opsiyon süresini müteahhit-tanımlı kadar uzat (bir kez)"
        >
          {bekliyor ? "…" : "Uzat"}
        </button>
      ) : null}
      {kesin ? (
        <button
          type="button"
          disabled={bekliyor}
          onClick={satisaDonustur}
          className="rounded-lg bg-green px-2.5 py-[7px] text-[11px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {bekliyor ? "…" : "Satışa dönüştür"}
        </button>
      ) : null}
      <button
        type="button"
        disabled={bekliyor}
        onClick={() => setVazgecMod(true)}
        className="rounded-lg border border-red/30 px-2.5 py-[7px] text-[11px] font-bold text-red transition-all hover:bg-red-soft disabled:opacity-50"
      >
        Vazgeç
      </button>
    </div>
  );
}
