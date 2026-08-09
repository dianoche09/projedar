"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { temaGorsel, havuzGorsel } from "@/lib/seo/tema-gorsel";
import type { HubProje } from "@/lib/seo/konut-hub";
import { MapPin, ChevronRight, SlidersHorizontal, X, Search } from "lucide-react";

const ASAMA: Record<string, string> = {
  planlama: "Planlama", temel: "Temel", kaba_insaat: "Kaba inşaat", ince_insaat: "İnce inşaat",
  cevre_duzenleme: "Çevre düzenleme", tamamlandi: "Teslim edildi",
  lansman: "Lansman", insaat: "İnşaat halinde", teslim: "Teslim edildi",
};
const TESLIM = new Set(["teslim", "tamamlandi"]);
const asamaEtiket = (a: string | null) => (a ? ASAMA[a] ?? a : null);
const teslimMi = (a: string | null) => (a ? TESLIM.has(a) : false);

/** Görselli proje kartı. teslim edilenlerde satış vurgusu yok (bilgi amaçlı). */
function Kart({ p, bilgiAmacli }: { p: HubProje; bilgiAmacli?: boolean }) {
  const konum = [p.ilce, p.il].filter(Boolean).join(", ");
  const asama = asamaEtiket(p.asama);
  const kapak = p.kapak ?? temaGorsel(p.il) ?? havuzGorsel(p.slug, "konum");
  const govde = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={kapak} alt="" fill sizes="(max-width: 1024px) 100vw, 360px" className={`object-cover transition-transform duration-500 group-hover:scale-105 ${bilgiAmacli ? "opacity-90 saturate-[0.9]" : ""}`} />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.04) 0%, rgba(8,20,34,0.58) 100%)" }} />
        {asama ? <span className={`absolute left-3 top-3 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm ${bilgiAmacli ? "bg-[rgba(70,88,107,0.7)]" : "bg-black/45"}`}>{asama}</span> : null}
        {p.kapak ? null : <span className="absolute right-3 top-3 rounded bg-black/35 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm">Temsili</span>}
        <h3 className="absolute inset-x-3.5 bottom-3 font-display text-[15px] font-bold leading-snug tracking-tight text-white drop-shadow">{p.ad}</h3>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-1.5 text-[13px] text-ink-soft"><MapPin size={13} className="opacity-60" />{konum || "—"}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          {p.odaTipleri.length ? <div className="flex flex-wrap gap-1">{p.odaTipleri.slice(0, 4).map((o) => <span key={o} className="rounded bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-teal-d">{o}</span>)}</div> : <span />}
          {p.esik ? <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" /> : null}
        </div>
      </div>
    </>
  );
  const cls = `kart kart-3d group flex h-full flex-col overflow-hidden p-0 ${bilgiAmacli ? "opacity-95" : ""}`;
  return p.esik ? <Link href={`/proje/${p.slug}`} className={cls}>{govde}</Link> : <div className={cls}>{govde}</div>;
}

function Bolum({ baslik, adet, not: notMetni, projeler, bilgiAmacli }: { baslik: string; adet: number; not?: string; projeler: HubProje[]; bilgiAmacli?: boolean }) {
  if (!projeler.length) return null;
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">{baslik}</h2>
        <span className="font-mono text-xs text-[var(--ink-faint)]">{adet} proje</span>
        {notMetni ? <span className="text-xs text-ink-soft">· {notMetni}</span> : null}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projeler.map((p) => <Kart key={`${p.kaynak}-${p.slug}`} p={p} bilgiAmacli={bilgiAmacli} />)}
      </div>
    </section>
  );
}

/** Filtre grubu (checkbox listesi). */
function FiltreGrup({ baslik, secenekler, secili, degistir }: { baslik: string; secenekler: { deger: string; etiket: string; adet: number }[]; secili: Set<string>; degistir: (d: string) => void }) {
  if (!secenekler.length) return null;
  return (
    <div className="border-t border-[var(--cizgi)] py-4 first:border-t-0 first:pt-0">
      <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">{baslik}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {secenekler.map((o) => (
          <label key={o.deger} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={secili.has(o.deger)} onChange={() => degistir(o.deger)} className="size-4 accent-[var(--color-teal)]" />
            <span className="flex-1">{o.etiket}</span>
            <span className="font-mono text-[11px] text-[var(--ink-faint)]">{o.adet}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function HubListe({ projeler, ilFiltre }: { projeler: HubProje[]; ilFiltre?: boolean }) {
  const [durum, setDurum] = useState<Set<string>>(new Set());
  const [oda, setOda] = useState<Set<string>>(new Set());
  const [il, setIl] = useState<Set<string>>(new Set());
  const [arama, setArama] = useState("");
  const [acik, setAcik] = useState(false); // mobil filtre paneli

  const toggle = (set: Set<string>, setState: (s: Set<string>) => void) => (d: string) => {
    const y = new Set(set);
    if (y.has(d)) y.delete(d); else y.add(d);
    setState(y);
  };

  // filtre seçenekleri (sayaçlı)
  const durumSec = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projeler) { const a = p.asama ?? "diger"; m.set(a, (m.get(a) ?? 0) + 1); }
    return [...m.entries()].map(([deger, adet]) => ({ deger, etiket: asamaEtiket(deger) ?? "Diğer", adet }))
      .sort((a, b) => Number(teslimMi(a.deger)) - Number(teslimMi(b.deger)) || b.adet - a.adet);
  }, [projeler]);
  const odaSec = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projeler) for (const o of p.odaTipleri) m.set(o, (m.get(o) ?? 0) + 1);
    return [...m.entries()].map(([deger, adet]) => ({ deger, etiket: deger, adet })).sort((a, b) => a.deger.localeCompare(b.deger, "tr"));
  }, [projeler]);
  const ilSec = useMemo(() => {
    if (!ilFiltre) return [];
    const m = new Map<string, number>();
    for (const p of projeler) if (p.il) m.set(p.il, (m.get(p.il) ?? 0) + 1);
    return [...m.entries()].map(([deger, adet]) => ({ deger, etiket: deger, adet })).sort((a, b) => b.adet - a.adet || a.deger.localeCompare(b.deger, "tr"));
  }, [projeler, ilFiltre]);

  const suzulmus = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    return projeler.filter((p) => {
      if (durum.size && !durum.has(p.asama ?? "diger")) return false;
      if (oda.size && !p.odaTipleri.some((o) => oda.has(o))) return false;
      if (il.size && !(p.il && il.has(p.il))) return false;
      if (q && !(`${p.ad} ${p.ilce ?? ""} ${p.il ?? ""}`.toLocaleLowerCase("tr").includes(q))) return false;
      return true;
    });
  }, [projeler, durum, oda, il, arama]);

  const sirala = (a: HubProje, b: HubProje) => Number(b.esik) - Number(a.esik) || a.ad.localeCompare(b.ad, "tr");
  const aktif = suzulmus.filter((p) => !teslimMi(p.asama)).sort(sirala);
  const teslim = suzulmus.filter((p) => teslimMi(p.asama)).sort(sirala);
  const secimVar = durum.size || oda.size || il.size || arama.trim();

  const filtreler = (
    <>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Proje ara" className="w-full rounded-xl border border-[var(--cizgi)] bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-[var(--ink-faint)] focus:border-teal/50" />
      </div>
      <div className="mt-4">
        <FiltreGrup baslik="Durum" secenekler={durumSec} secili={durum} degistir={toggle(durum, setDurum)} />
        <FiltreGrup baslik="Daire tipi" secenekler={odaSec} secili={oda} degistir={toggle(oda, setOda)} />
        {ilFiltre ? <FiltreGrup baslik="İl" secenekler={ilSec} secili={il} degistir={toggle(il, setIl)} /> : null}
      </div>
      {secimVar ? (
        <button onClick={() => { setDurum(new Set()); setOda(new Set()); setIl(new Set()); setArama(""); }} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-d hover:underline">
          <X size={14} /> Filtreleri temizle
        </button>
      ) : null}
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Sol filtre (masaüstü) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-[var(--cizgi)] bg-white/70 p-5">
          <p className="mb-3 font-display text-sm font-bold text-ink">Filtrele</p>
          {filtreler}
        </div>
      </aside>

      {/* Mobil filtre butonu + panel */}
      <div className="mb-5 lg:hidden">
        <button onClick={() => setAcik((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--cizgi)] bg-white px-4 py-2.5 text-sm font-semibold text-ink">
          <SlidersHorizontal size={16} /> Filtrele {secimVar ? <span className="rounded-full bg-teal px-1.5 text-[11px] font-bold text-white">{durum.size + oda.size + il.size + (arama.trim() ? 1 : 0)}</span> : null}
        </button>
        {acik ? <div className="mt-3 rounded-2xl border border-[var(--cizgi)] bg-white/80 p-5">{filtreler}</div> : null}
      </div>

      {/* Sonuçlar */}
      <div>
        {suzulmus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--cizgi)] p-10 text-center">
            <p className="text-sm text-ink-soft">Seçili filtrelerle proje bulunamadı.</p>
          </div>
        ) : (
          <>
            <Bolum baslik="Satıştaki ve devam eden projeler" adet={aktif.length} projeler={aktif} />
            <Bolum baslik="Teslim edilen projeler" adet={teslim.length} not="bilgi amaçlı listelenir; satış/ağa ekleme yoktur" projeler={teslim} bilgiAmacli />
          </>
        )}
      </div>
    </div>
  );
}
