"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINKLER, Ikon, type NavLink } from "./UreticiNav";

/* Mobil alt sekme (bottom-tab) — 4 birincil sekme + "Daha fazla" sheet (tüm nav).
   Masaüstünde sidebar var; bu yalnız md altında görünür (md:hidden). */

const BIRINCIL = ["/uretici", "/uretici/stok", "/uretici/opsiyonlar", "/uretici/tahsis"];

export function UreticiAltTab({ bildirimSayi = 0 }: { bildirimSayi?: number }) {
  const yol = usePathname();
  const [acik, setAcik] = useState(false);
  const aktif = (l: NavLink) =>
    l.tam ? yol === l.yol : yol.startsWith(l.yol) || (l.ekYol ? yol.startsWith(l.ekYol) : false);
  const birincil = BIRINCIL.map((y) => LINKLER.find((l) => l.yol === y)).filter(Boolean) as NavLink[];

  return (
    <>
      {/* Sabit alt sekme barı — yalnız mobil */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-[var(--cizgi)] bg-paper/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Üretici alt menü"
      >
        {birincil.map((l) => {
          const a = aktif(l);
          return (
            <Link
              key={l.yol}
              href={l.yol}
              aria-current={a ? "page" : undefined}
              className={`flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                a ? "text-teal-d" : "text-ink-soft"
              }`}
            >
              <Ikon ad={l.ikon} />
              {l.etiket}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAcik(true)}
          aria-haspopup="dialog"
          className="relative flex min-h-[54px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-ink-soft"
        >
          <svg className="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
          Daha fazla
          {bildirimSayi > 0 ? <span className="absolute right-[26%] top-2 size-2 rounded-full bg-red" aria-hidden /> : null}
        </button>
      </nav>

      {/* "Daha fazla" sheet — tüm nav item'ları */}
      {acik ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Tüm menü">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAcik(false)} aria-hidden />
          <div className="sheet-in absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-[var(--cizgi)] bg-paper p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-cardlg">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--cizgi-2)]" />
            <div className="grid grid-cols-3 gap-2">
              {LINKLER.map((l) => {
                const a = aktif(l);
                return (
                  <Link
                    key={l.yol}
                    href={l.yol}
                    onClick={() => setAcik(false)}
                    aria-current={a ? "page" : undefined}
                    className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] font-semibold transition-colors ${
                      a ? "border-teal/30 bg-teal-soft text-teal-d" : "border-[var(--cizgi)] bg-card text-ink-soft"
                    }`}
                  >
                    <Ikon ad={l.ikon} />
                    <span className="text-center leading-tight">{l.etiket}</span>
                    {l.yol === "/uretici/bildirimler" && bildirimSayi > 0 ? (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-red px-1.5 text-[9px] font-bold leading-[14px] text-white">
                        {bildirimSayi > 99 ? "99+" : bildirimSayi}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
