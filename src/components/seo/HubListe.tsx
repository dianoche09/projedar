"use client";

import { useMemo, useState, useCallback } from "react";
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
const yilBul = (s: string | null) => { const m = (s || "").match(/20\d{2}/); return m ? m[0] : null; };

const M2KOVA = [
  { k: "0-75", etiket: "≤ 75 m²", min: 0, max: 75 },
  { k: "75-120", etiket: "75 – 120 m²", min: 75, max: 120 },
  { k: "120-200", etiket: "120 – 200 m²", min: 120, max: 200 },
  { k: "200", etiket: "200 m² +", min: 200, max: 999999 },
];

function teslimKova(p: HubProje): string | null {
  if (teslimMi(p.asama)) return "Teslim edildi";
  const s = (p.teslim || "").toLocaleLowerCase("tr");
  if (s.includes("hemen")) return "Hemen teslim";
  return yilBul(p.teslim);
}
function teslimSira(p: HubProje): number {
  if (teslimMi(p.asama)) return 0;
  if ((p.teslim || "").toLocaleLowerCase("tr").includes("hemen")) return 1;
  const y = yilBul(p.teslim);
  return y ? Number(y) : 9999;
}

/** Görselli proje kartı. Teslim edilenlerde satış vurgusu yok (bilgi amaçlı). */
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
        {p.gelistirici ? <p className="mt-1 truncate text-[12px] text-[var(--ink-faint)]">{p.gelistirici}</p> : null}
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

function Bolum({ baslik, projeler, not: notMetni, bilgiAmacli }: { baslik: string; projeler: HubProje[]; not?: string; bilgiAmacli?: boolean }) {
  if (!projeler.length) return null;
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">{baslik}</h2>
        <span className="font-mono text-xs text-[var(--ink-faint)]">{projeler.length} proje</span>
        {notMetni ? <span className="text-xs text-ink-soft">· {notMetni}</span> : null}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projeler.map((p) => <Kart key={`${p.kaynak}-${p.slug}`} p={p} bilgiAmacli={bilgiAmacli} />)}
      </div>
    </section>
  );
}

type Sec = { deger: string; etiket: string; adet: number };
function FiltreGrup({ baslik, secenekler, secili, degistir, kaydir }: { baslik: string; secenekler: Sec[]; secili: Set<string>; degistir: (d: string) => void; kaydir?: boolean }) {
  if (!secenekler.length) return null;
  return (
    <div className="border-t border-[var(--cizgi)] py-4 first:border-t-0 first:pt-0">
      <p className="font-display text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">{baslik}</p>
      <div className={`mt-3 flex flex-col gap-1.5 ${kaydir ? "max-h-52 overflow-y-auto pr-1" : ""}`}>
        {secenekler.map((o) => (
          <label key={o.deger} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={secili.has(o.deger)} onChange={() => degistir(o.deger)} className="size-4 flex-none accent-[var(--color-teal)]" />
            <span className="flex-1 truncate" title={o.etiket}>{o.etiket}</span>
            <span className="font-mono text-[11px] text-[var(--ink-faint)]">{o.adet}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function HubListe({ projeler, ilFiltre }: { projeler: HubProje[]; ilFiltre?: boolean }) {
  const [durum, setDurum] = useState<Set<string>>(new Set());
  const [gel, setGel] = useState<Set<string>>(new Set());
  const [oda, setOda] = useState<Set<string>>(new Set());
  const [il, setIl] = useState<Set<string>>(new Set());
  const [ilce, setIlce] = useState<Set<string>>(new Set());
  const [m2, setM2] = useState<Set<string>>(new Set());
  const [teslim, setTeslim] = useState<Set<string>>(new Set());
  const [arama, setArama] = useState("");
  const [teslimGizle, setTeslimGizle] = useState(false);
  const [sirala, setSirala] = useState("onerilen");
  const [acik, setAcik] = useState(false);

  const tog = (set: Set<string>, setState: (s: Set<string>) => void) => (d: string) => {
    const y = new Set(set); if (y.has(d)) y.delete(d); else y.add(d); setState(y);
  };
  const sayacli = useCallback((fn: (p: HubProje) => string | null | undefined, sort?: (a: Sec, b: Sec) => number) => {
    const m = new Map<string, number>();
    for (const p of projeler) { const v = fn(p); if (v) m.set(v, (m.get(v) ?? 0) + 1); }
    const arr = [...m.entries()].map(([deger, adet]) => ({ deger, etiket: deger, adet }));
    return sort ? arr.sort(sort) : arr.sort((a, b) => b.adet - a.adet || a.deger.localeCompare(b.deger, "tr"));
  }, [projeler]);

  const durumSec = useMemo(() => sayacli((p) => p.asama ?? "diger", (a, b) => Number(teslimMi(a.deger)) - Number(teslimMi(b.deger)) || b.adet - a.adet).map((o) => ({ ...o, etiket: asamaEtiket(o.deger) ?? "Diğer" })), [sayacli]);
  const gelSec = useMemo(() => sayacli((p) => p.gelistirici), [sayacli]);
  const odaSec = useMemo(() => { const m = new Map<string, number>(); for (const p of projeler) for (const o of p.odaTipleri) m.set(o, (m.get(o) ?? 0) + 1); return [...m.entries()].map(([deger, adet]) => ({ deger, etiket: deger, adet })).sort((a, b) => a.deger.localeCompare(b.deger, "tr")); }, [projeler]);
  const ilSec = useMemo(() => (ilFiltre ? sayacli((p) => p.il) : []), [ilFiltre, sayacli]);
  const ilceSec = useMemo(() => sayacli((p) => (il.size === 0 || (p.il && il.has(p.il)) ? p.ilce : null)), [il, sayacli]);
  const m2Sec = useMemo(() => M2KOVA.map((b) => ({ deger: b.k, etiket: b.etiket, adet: projeler.filter((p) => { const lo = p.m2min ?? p.m2max, hi = p.m2max ?? p.m2min; return lo != null && hi != null && lo <= b.max && hi >= b.min; }).length })).filter((o) => o.adet > 0), [projeler]);
  const teslimSec = useMemo(() => sayacli(teslimKova, (a, b) => teslimSira({ asama: null, teslim: a.deger } as HubProje) - teslimSira({ asama: null, teslim: b.deger } as HubProje)), [sayacli]);

  const suzulmus = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr");
    return projeler.filter((p) => {
      if (teslimGizle && teslimMi(p.asama)) return false;
      if (durum.size && !durum.has(p.asama ?? "diger")) return false;
      if (gel.size && !(p.gelistirici && gel.has(p.gelistirici))) return false;
      if (oda.size && !p.odaTipleri.some((o) => oda.has(o))) return false;
      if (il.size && !(p.il && il.has(p.il))) return false;
      if (ilce.size && !(p.ilce && ilce.has(p.ilce))) return false;
      if (teslim.size && !teslim.has(teslimKova(p) ?? "")) return false;
      if (m2.size) { const lo = p.m2min ?? p.m2max, hi = p.m2max ?? p.m2min; if (lo == null || hi == null || !M2KOVA.some((b) => m2.has(b.k) && lo <= b.max && hi >= b.min)) return false; }
      if (q && !`${p.ad} ${p.ilce ?? ""} ${p.il ?? ""} ${p.gelistirici ?? ""}`.toLocaleLowerCase("tr").includes(q)) return false;
      return true;
    });
  }, [projeler, durum, gel, oda, il, ilce, m2, teslim, arama, teslimGizle]);

  const varsayilan = (a: HubProje, b: HubProje) => Number(b.esik) - Number(a.esik) || a.ad.localeCompare(b.ad, "tr");
  const sirali = (arr: HubProje[]) => {
    if (sirala === "yakin") return [...arr].sort((a, b) => teslimSira(a) - teslimSira(b) || varsayilan(a, b));
    if (sirala === "uzak") return [...arr].sort((a, b) => teslimSira(b) - teslimSira(a) || varsayilan(a, b));
    return [...arr].sort(varsayilan);
  };
  const aktif = sirali(suzulmus.filter((p) => !teslimMi(p.asama)));
  const teslimList = sirali(suzulmus.filter((p) => teslimMi(p.asama)));
  const secimSayi = durum.size + gel.size + oda.size + il.size + ilce.size + m2.size + teslim.size + (arama.trim() ? 1 : 0);

  const temizle = () => { setDurum(new Set()); setGel(new Set()); setOda(new Set()); setIl(new Set()); setIlce(new Set()); setM2(new Set()); setTeslim(new Set()); setArama(""); };

  const panel = (
    <>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Proje veya geliştirici ara" className="w-full rounded-xl border border-[var(--cizgi)] bg-white py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-[var(--ink-faint)] focus:border-teal/50" />
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
        <input type="checkbox" checked={teslimGizle} onChange={(e) => setTeslimGizle(e.target.checked)} className="size-4 accent-[var(--color-teal)]" />
        Teslim edilenleri gizle
      </label>
      <div className="mt-4">
        <FiltreGrup baslik="Durum" secenekler={durumSec} secili={durum} degistir={tog(durum, setDurum)} />
        <FiltreGrup baslik="Teslim" secenekler={teslimSec} secili={teslim} degistir={tog(teslim, setTeslim)} />
        <FiltreGrup baslik="Daire tipi" secenekler={odaSec} secili={oda} degistir={tog(oda, setOda)} />
        <FiltreGrup baslik="Büyüklük (m²)" secenekler={m2Sec} secili={m2} degistir={tog(m2, setM2)} />
        {ilFiltre ? <FiltreGrup baslik="İl" secenekler={ilSec} secili={il} degistir={tog(il, setIl)} kaydir /> : null}
        <FiltreGrup baslik="İlçe" secenekler={ilceSec} secili={ilce} degistir={tog(ilce, setIlce)} kaydir />
        <FiltreGrup baslik="Geliştirici" secenekler={gelSec} secili={gel} degistir={tog(gel, setGel)} kaydir />
      </div>
      {secimSayi ? <button onClick={temizle} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-d hover:underline"><X size={14} /> Filtreleri temizle</button> : null}
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[var(--cizgi)] bg-white/70 p-5">
          <p className="mb-3 font-display text-sm font-bold text-ink">Filtrele</p>
          {panel}
        </div>
      </aside>

      <div>
        {/* Üst çubuk: mobil filtre + sonuç + sıralama */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => setAcik((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--cizgi)] bg-white px-4 py-2.5 text-sm font-semibold text-ink lg:hidden">
            <SlidersHorizontal size={16} /> Filtrele {secimSayi ? <span className="rounded-full bg-teal px-1.5 text-[11px] font-bold text-white">{secimSayi}</span> : null}
          </button>
          <span className="font-mono text-xs text-ink-soft">{suzulmus.length} sonuç</span>
          <label className="ml-auto flex items-center gap-2 text-sm text-ink-soft">
            Sırala
            <select value={sirala} onChange={(e) => setSirala(e.target.value)} className="rounded-lg border border-[var(--cizgi)] bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-teal/50">
              <option value="onerilen">Önerilen</option>
              <option value="yakin">Teslim (yakın)</option>
              <option value="uzak">Teslim (uzak)</option>
            </select>
          </label>
        </div>
        {acik ? <div className="mb-5 rounded-2xl border border-[var(--cizgi)] bg-white/80 p-5 lg:hidden">{panel}</div> : null}

        {suzulmus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--cizgi)] p-10 text-center">
            <p className="text-sm text-ink-soft">Seçili filtrelerle proje bulunamadı.</p>
            <button onClick={temizle} className="mt-3 text-sm font-semibold text-teal-d hover:underline">Filtreleri temizle</button>
          </div>
        ) : (
          <>
            <Bolum baslik="Satıştaki ve devam eden projeler" projeler={aktif} />
            <Bolum baslik="Teslim edilen projeler" not="bilgi amaçlı listelenir; satış/ağa ekleme yoktur" projeler={teslimList} bilgiAmacli />
          </>
        )}
      </div>
    </div>
  );
}
