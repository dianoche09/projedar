"use client";

import { useEffect, useRef, useState } from "react";
import { tahsisTopluAksiyon } from "@/app/uretici/actions";

/**
 * Toplu lifecycle çubuğu — bu projenin tablosundaki `name="tahsis_ids"` checkbox'ları
 * `form="toplu-<projeId>"` ile bu forma bağlanır (iç içe form YOK; HTML-geçerli). Seçim > 0
 * olunca sticky görünür. Her aksiyon submit butonu (`name="aksiyon"`) tek bir değeri gönderir;
 * "Uzat" ayrıca `gun` alanını taşır. Server action atomik RPC'yi çağırır (invariant 2).
 */
export function TopluBar({ projeId }: { projeId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [n, setN] = useState(0);
  const [gun, setGun] = useState("30");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const say = () => setN(new FormData(form).getAll("tahsis_ids").filter(Boolean).length);
    document.addEventListener("change", say);
    say();
    return () => document.removeEventListener("change", say);
  }, []);

  const btn =
    "rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-40";

  return (
    <form
      id={`toplu-${projeId}`}
      action={tahsisTopluAksiyon}
      className={`${n > 0 ? "flex" : "hidden"} sticky bottom-4 z-30 mx-auto mt-3 w-fit max-w-full flex-wrap items-center gap-2 rounded-2xl border border-[var(--cizgi-2)] bg-navy px-4 py-2.5 text-white shadow-[var(--golge-3)]`}
    >
      <input type="hidden" name="proje_id" value={projeId} />
      <span className="mono text-[12.5px] font-semibold">{n} seçili</span>
      <span className="mx-1 h-4 w-px bg-white/20" aria-hidden />
      <button type="submit" name="aksiyon" value="askiya_al" className={`${btn} bg-white/10 hover:bg-white/20`}>
        Askıya al
      </button>
      <button type="submit" name="aksiyon" value="devam" className={`${btn} bg-white/10 hover:bg-white/20`}>
        Devam
      </button>
      <button type="submit" name="aksiyon" value="kaldir" className={`${btn} bg-red/80 hover:bg-red`}>
        Kaldır
      </button>
      <span className="mx-1 h-4 w-px bg-white/20" aria-hidden />
      <label className="flex items-center gap-1.5 text-[12px] text-white/80">
        <input
          name="gun"
          type="number"
          min={1}
          max={3650}
          value={gun}
          onChange={(e) => setGun(e.target.value)}
          className="w-16 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[12px] text-white outline-none focus:border-white/40"
        />
        gün
      </label>
      <button type="submit" name="aksiyon" value="uzat" className={`${btn} bg-teal hover:bg-teal-d`}>
        Uzat
      </button>
    </form>
  );
}
