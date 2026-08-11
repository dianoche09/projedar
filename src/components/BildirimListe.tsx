"use client";

import Link from "next/link";
import { useTransition } from "react";
import { bildirimOku, bildirimHepsiOku } from "@/app/_bildirim/actions";
import { zamanOnce } from "@/lib/types";

export type Bildirim = {
  id: string;
  tip: string;
  baslik: string;
  govde: string | null;
  link: string | null;
  okundu: boolean;
  created_at: string;
};

const TIP_RENK: Record<string, string> = {
  talep: "bg-amber",
  onay: "bg-green",
  red: "bg-red",
  tahsis: "bg-teal",
  lead: "bg-navy",
  sistem: "bg-gray",
};

export function BildirimListe({ bildirimler }: { bildirimler: Bildirim[] }) {
  const [bekliyor, basla] = useTransition();
  const okunmamis = bildirimler.filter((b) => !b.okundu).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Bildirimler</h1>
        {okunmamis > 0 ? (
          <button
            type="button"
            disabled={bekliyor}
            onClick={() => basla(() => bildirimHepsiOku())}
            className="text-[13px] font-medium text-teal-d hover:underline disabled:opacity-50"
          >
            Tümünü okundu işaretle ({okunmamis})
          </button>
        ) : null}
      </div>

      {bildirimler.length === 0 ? (
        <div className="kart p-12 text-center">
          <svg width="40" height="40" className="mx-auto text-[var(--ink-faint)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <p className="mt-4 text-[15px] font-bold text-ink">Henüz bildirim yok</p>
          <p className="mt-1 text-[13px] text-[var(--ink-faint)]">
            Opsiyon talebi, tahsis, onay ve fiyat olayları burada anlık görünür.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bildirimler.map((b) => {
            const govde = (
              <div
                className={`rounded-xl border p-3.5 transition-colors ${
                  b.okundu ? "border-hair bg-card hover:bg-soft" : "border-teal/30 bg-teal/5"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 size-2 flex-none rounded-full ${TIP_RENK[b.tip] ?? "bg-gray"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-ink">{b.baslik}</p>
                    {b.govde ? <p className="mt-0.5 text-[12.5px] text-ink-soft">{b.govde}</p> : null}
                    <p className="mt-1 font-mono text-[11px] text-gray">{zamanOnce(b.created_at)}</p>
                  </div>
                  {!b.okundu ? <span className="mt-1.5 size-2 flex-none rounded-full bg-teal" aria-label="okunmadı" /> : null}
                </div>
              </div>
            );
            const tikla = () => {
              if (!b.okundu) basla(() => bildirimOku(b.id));
            };
            return b.link ? (
              <Link key={b.id} href={b.link} onClick={tikla} className="block">
                {govde}
              </Link>
            ) : (
              <button key={b.id} type="button" onClick={tikla} className="block w-full text-left">
                {govde}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
