"use client";

import { useEffect, useState } from "react";
import { Clock, Lock, X } from "lucide-react";

/**
 * KuleDemo · landing Bölüm 3: "Bir daireye dokun. Bütün satış akışını gör."
 * CanliHavuzDemo'nun büyütülmüş, tam interaktif sürümü (tek bileşen):
 * 3 blok sekmesi (farklı örnek stok dağılımı), kesit/tablo görünümü, detay paneli,
 * deneme opsiyon kilidi (yeşil -> amber + kilit animasyonu), "başka danışmanın ekranı"
 * aynası ve bileşen içi mini akış. TÜM VERİLER ÖRNEKTİR; state bileşen içindedir,
 * sayfa yenilenince sıfırlanır. Sadece CSS + React state, ağır kütüphane yok.
 */

type Durum = "musait" | "opsiyon" | "satildi" | "tahsisli";
type BlokAd = "A" | "B" | "C";
type GorunumTipi = "kesit" | "tablo";

type Daire = {
  kod: string;
  blok: BlokAd;
  kat: number;
  no: number;
  tip: string;
  net: number;
  brut: number;
  cephe: string;
  fiyat: string;
  pesinat: number;
  taksit: number;
  durum: Durum;
  taze: string;
};

type MiniFeedSatir = { id: number; renk: "amber" | "red" | "teal"; metin: string; zaman: string };

/* sinyal renkleri SABİT: müsait/opsiyon/satıldı */
const RENK: Record<Exclude<Durum, "tahsisli">, string> = {
  musait: "#2fb36b",
  opsiyon: "#e3a12c",
  satildi: "#d15a4e",
};

const FEED_RENK: Record<MiniFeedSatir["renk"], string> = {
  amber: "#e3a12c",
  red: "#d15a4e",
  teal: "#1e9b8a",
};

const DURUM_ETIKET: Record<Durum, { ad: string; rozet: string }> = {
  musait: { ad: "Müsait", rozet: "d-musait" },
  opsiyon: { ad: "Opsiyon", rozet: "d-opsiyon" },
  satildi: { ad: "Satıldı", rozet: "d-satildi" },
  tahsisli: { ad: "Tahsisli", rozet: "" },
};

/* Her blok farklı kat sayısı + farklı örnek stok dağılımı (eşikler) üretir */
const BLOKLAR: Record<BlokAd, { katSayisi: number; daireSayisi: number; seed: number; esik: [number, number, number] }> = {
  A: { katSayisi: 10, daireSayisi: 5, seed: 7, esik: [50, 68, 86] },
  B: { katSayisi: 8, daireSayisi: 5, seed: 31, esik: [38, 60, 84] },
  C: { katSayisi: 9, daireSayisi: 4, seed: 53, esik: [62, 74, 90] },
};

const TIPLER: Record<number, { tip: string; net: number; taban: number; pesinat: number; taksit: number }> = {
  1: { tip: "2+1", net: 94, taban: 5.4, pesinat: 30, taksit: 24 },
  2: { tip: "3+1", net: 142, taban: 8.2, pesinat: 25, taksit: 36 },
  3: { tip: "3+1", net: 138, taban: 7.9, pesinat: 30, taksit: 24 },
  4: { tip: "4+1", net: 186, taban: 11.6, pesinat: 35, taksit: 18 },
  5: { tip: "2+1", net: 96, taban: 5.6, pesinat: 30, taksit: 24 },
};

const CEPHELER = ["Kuzey", "Güney", "Doğu", "Batı", "Güney-Batı"];
const TAZELER = ["şimdi", "2 dk", "6 dk", "14 dk", "31 dk", "1 sa"];

function hashYuzde(seed: number, kat: number, no: number): number {
  let h = ((kat * 73856093) ^ (no * 19349663) ^ (seed * 83492791)) % 100;
  if (h < 0) h += 100;
  return h;
}

function temelDurum(blok: BlokAd, kat: number, no: number): Durum {
  const { seed, esik } = BLOKLAR[blok];
  const h = hashYuzde(seed, kat, no);
  if (h < esik[0]) return "musait";
  if (h < esik[1]) return "opsiyon";
  if (h < esik[2]) return "satildi";
  return "tahsisli";
}

function fiyatYaz(no: number, kat: number): string {
  const deger = TIPLER[no].taban * (1 + (kat - 1) * 0.012);
  return `₺${deger.toFixed(2).replace(".", ",")}M`;
}

function tazeYaz(taze: string): string {
  return taze === "şimdi" ? "şimdi" : `${taze} önce`;
}

function daireYap(blok: BlokAd, kat: number, no: number, durum: Durum): Daire {
  const t = TIPLER[no];
  const { seed } = BLOKLAR[blok];
  return {
    kod: `${blok}-${kat}-${no}`,
    blok,
    kat,
    no,
    tip: t.tip,
    net: t.net,
    brut: Math.round(t.net * 1.18),
    cephe: CEPHELER[(no - 1) % CEPHELER.length],
    fiyat: fiyatYaz(no, kat),
    pesinat: t.pesinat,
    taksit: t.taksit,
    durum,
    taze: TAZELER[hashYuzde(seed, kat * 3 + 1, no * 5 + 2) % TAZELER.length],
  };
}

export function KuleDemo() {
  const [blok, setBlok] = useState<BlokAd>("A");
  const [gorunum, setGorunum] = useState<GorunumTipi>("kesit");
  const [secili, setSecili] = useState<Daire | null>(null);
  const [benimOpsiyonlar, setBenimOpsiyonlar] = useState<string[]>([]);
  const [sonKilit, setSonKilit] = useState<string | null>(null);
  const [feed, setFeed] = useState<MiniFeedSatir[]>([
    { id: 1, renk: "teal", metin: "B-4-2 fiyatı güncellendi", zaman: "9 dk" },
    { id: 2, renk: "red", metin: "C-6-1 satıldı", zaman: "22 dk" },
  ]);

  useEffect(() => {
    if (!secili) return;
    const tusla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSecili(null);
    };
    window.addEventListener("keydown", tusla);
    return () => window.removeEventListener("keydown", tusla);
  }, [secili]);

  const durumBul = (b: BlokAd, kat: number, no: number): Durum =>
    benimOpsiyonlar.includes(`${b}-${kat}-${no}`) ? "opsiyon" : temelDurum(b, kat, no);

  const cfg = BLOKLAR[blok];
  const katlar = Array.from({ length: cfg.katSayisi }, (_, i) => cfg.katSayisi - i);
  const nolar = Array.from({ length: cfg.daireSayisi }, (_, i) => i + 1);

  const blokMusait = (b: BlokAd): number => {
    const c = BLOKLAR[b];
    let m = 0;
    for (let kat = 1; kat <= c.katSayisi; kat++)
      for (let no = 1; no <= c.daireSayisi; no++) if (durumBul(b, kat, no) === "musait") m++;
    return m;
  };

  const sayilar = { musait: 0, opsiyon: 0, satildi: 0 };
  for (const kat of katlar)
    for (const no of nolar) {
      const d = durumBul(blok, kat, no);
      if (d === "musait") sayilar.musait++;
      else if (d === "opsiyon") sayilar.opsiyon++;
      else if (d === "satildi") sayilar.satildi++;
    }

  const tabloSatirlari: Daire[] = [];
  for (const kat of katlar) {
    if (tabloSatirlari.length >= 8) break;
    for (const no of nolar) {
      if (tabloSatirlari.length >= 8) break;
      const d = durumBul(blok, kat, no);
      if (d === "tahsisli") continue;
      tabloSatirlari.push(daireYap(blok, kat, no, d));
    }
  }

  const ac = (d: Daire) => {
    if (d.durum !== "tahsisli") setSecili(d);
  };

  const opsiyonAl = (d: Daire) => {
    if (d.durum !== "musait" || benimOpsiyonlar.includes(d.kod)) return;
    setBenimOpsiyonlar((p) => [...p, d.kod]);
    setSonKilit(d.kod);
    setFeed((p) =>
      [{ id: Date.now(), renk: "amber" as const, metin: `${d.kod} opsiyonlandı`, zaman: "şimdi" }, ...p].slice(0, 5),
    );
  };

  return (
    <div className="kart relative overflow-hidden p-0">
      <style>{`
        @keyframes ppKilitDus {
          0% { opacity: 0; transform: translateY(-14px) scale(0.6); }
          60% { opacity: 1; transform: translateY(2px) scale(1.08); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pp-kilit-dus { animation: ppKilitDus 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes ppKilitHalka {
          0% { box-shadow: 0 0 0 0 rgba(227, 161, 44, 0.55); }
          100% { box-shadow: 0 0 0 12px rgba(227, 161, 44, 0); }
        }
        .pp-kilit-halka { animation: ppKilitHalka 0.9s ease-out; }
      `}</style>

      {/* başlık şeridi */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-display text-base font-bold text-ink">Çankaya Vadi</span>
          <span className="rounded-full bg-[var(--color-teal-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-teal-d)]">Doğrulanmış üretici</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#1f7d4c]">
            <span className="size-1.5 rounded-full bg-green nabiz" /> canlı · 2 dk önce
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3.5 font-mono text-[11px] text-ink-soft md:flex">
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-green" /> <b className="font-semibold text-ink">{sayilar.musait}</b></span>
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-amber" /> <b className="font-semibold text-ink">{sayilar.opsiyon}</b></span>
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-red" /> <b className="font-semibold text-ink">{sayilar.satildi}</b></span>
          </div>
          <span className="rounded-md border border-[var(--cizgi-2)] bg-white px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">örnek görünüm</span>
          <div className="flex rounded-[13px] border border-[var(--cizgi-2)] bg-white p-0.5">
            {(["kesit", "tablo"] as GorunumTipi[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGorunum(g)}
                className={`min-h-[44px] rounded-[11px] px-3.5 font-mono text-[11px] font-semibold transition-colors ${gorunum === g ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}
              >
                {g === "kesit" ? "Bina kesiti" : "Tablo"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* ana alan: kesit veya tablo */}
        <div className="min-w-0 p-4 sm:p-6">
          {/* blok sekmeleri: gerçekten değişir, her blokta farklı örnek dağılım */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {(Object.keys(BLOKLAR) as BlokAd[]).map((b) => {
              const secildiMi = b === blok;
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlok(b)}
                  className={`min-h-[44px] flex-none rounded-[11px] border px-4 font-mono text-[12px] font-semibold transition-colors ${
                    secildiMi ? "border-navy bg-navy text-white" : "border-[var(--cizgi-2)] bg-white text-ink-soft hover:border-[rgba(16,36,58,0.25)] hover:text-ink"
                  }`}
                >
                  {b} Blok
                  <span className={`ml-1.5 font-mono text-[11px] ${secildiMi ? "text-white/80" : "text-[#1f7d4c]"}`}>{blokMusait(b)}</span>
                </button>
              );
            })}
          </div>

          {gorunum === "kesit" ? (
            <>
              <div className="min-w-0">
                {katlar.map((kat) => (
                  <div key={kat} className="mb-1.5 flex items-center gap-2">
                    <span className="w-7 flex-none text-right font-mono text-[10px] text-[var(--ink-faint)]">K{kat}</span>
                    <div className="flex min-w-0 flex-1 gap-1.5">
                      {nolar.map((no) => {
                        const durum = durumBul(blok, kat, no);
                        const kod = `${blok}-${kat}-${no}`;
                        const tahsis = durum === "tahsisli";
                        const benim = benimOpsiyonlar.includes(kod);
                        return (
                          <button
                            key={no}
                            type="button"
                            disabled={tahsis}
                            onClick={() => ac(daireYap(blok, kat, no, durum))}
                            style={tahsis ? undefined : { background: RENK[durum] }}
                            className={`relative flex h-12 min-w-0 flex-1 items-center justify-center rounded-lg font-mono text-[10px] font-semibold leading-none text-white transition-[background-color,transform,box-shadow] duration-500 ${
                              tahsis
                                ? "h-kilit cursor-not-allowed"
                                : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(16,36,58,0.2)]"
                            } ${sonKilit === kod ? "pp-kilit-halka" : ""}`}
                            aria-label={tahsis ? `${kod}, özel tahsis, size kapalı` : `${kod}, ${DURUM_ETIKET[durum].ad}, detay için dokun`}
                            title={tahsis ? `${kod} · Özel tahsis (size kapalı)` : `${kod} · ${DURUM_ETIKET[durum].ad} · detay için dokun`}
                          >
                            {tahsis ? (
                              <span className="text-[8px] font-semibold leading-[1.05] tracking-tight">özel<br />tahsis</span>
                            ) : (
                              `${kat}-${no}`
                            )}
                            {benim ? (
                              <Lock size={10} strokeWidth={2.5} className={`absolute right-1 top-1 ${sonKilit === kod ? "pp-kilit-dus" : ""}`} />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-soft">
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-green" /> müsait</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-amber" /> opsiyon</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-red" /> satıldı</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded border border-dashed border-[rgba(16,36,58,0.35)] bg-[rgba(16,36,58,0.06)]" /> özel tahsis (size kapalı)</span>
                <span className="font-semibold text-teal">yeşil bir daireye dokun, opsiyonu dene</span>
              </p>
            </>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)]">Daire</th>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)] max-sm:hidden">Tip</th>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)] max-sm:hidden">Net</th>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)]">Fiyat</th>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)]">Durum</th>
                  <th className="border-b border-[var(--cizgi)] px-3 py-2.5 text-left font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-[var(--ink-faint)] max-sm:hidden">Tazelik</th>
                </tr>
              </thead>
              <tbody>
                {tabloSatirlari.map((r) => (
                  <tr key={r.kod} onClick={() => ac(r)} className="cursor-pointer transition-colors hover:bg-[rgba(16,36,58,0.025)]">
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5 font-mono font-semibold text-ink">{r.kod}</td>
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5 font-mono text-ink max-sm:hidden">{r.tip}</td>
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5 font-mono text-ink max-sm:hidden">{r.net} m²</td>
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5 font-mono font-semibold text-ink">{r.fiyat}</td>
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5">
                      <span className={`durum ${DURUM_ETIKET[r.durum].rozet}`}><span className="nokta" />{DURUM_ETIKET[r.durum].ad}</span>
                    </td>
                    <td className="border-b border-[var(--cizgi)] px-3 py-3.5 max-sm:hidden">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#1f7d4c]"><span className="size-1.5 rounded-full bg-green" /> {tazeYaz(r.taze)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* yan panel: danışman aynası + mini akış */}
        <div className="flex min-w-0 flex-col gap-4 border-t border-[var(--cizgi)] p-4 sm:flex-row sm:p-5 lg:flex-col lg:border-l lg:border-t-0">
          {/* başka danışmanın ekranı: aynı havuz, sizin kilidiniz ona kapalı */}
          <div className="min-w-0 flex-1 rounded-2xl border border-[var(--cizgi)] bg-[var(--color-soft)] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-ink">Başka danışmanın ekranı</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)]">aynı havuz</span>
            </div>
            <div className="mt-3 space-y-1">
              {katlar.map((kat) => (
                <div key={kat} className="flex gap-1">
                  {nolar.map((no) => {
                    const kod = `${blok}-${kat}-${no}`;
                    const durum = durumBul(blok, kat, no);
                    const benim = benimOpsiyonlar.includes(kod);
                    return (
                      <span
                        key={no}
                        className={`h-2.5 min-w-0 flex-1 rounded-[3px] transition-all duration-500 ${benim ? "ring-1 ring-amber" : ""}`}
                        style={{
                          background: durum === "tahsisli" ? "rgba(16,36,58,0.1)" : RENK[durum],
                          opacity: benim ? 0.4 : durum === "tahsisli" ? 1 : 0.9,
                        }}
                        aria-hidden
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-3 font-mono text-[10.5px] leading-relaxed text-ink-soft">
              {sonKilit ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-amber-soft)] px-2 py-1 font-semibold text-[#9a6a12]">
                  <Lock size={11} strokeWidth={2.5} /> {sonKilit} kilitli · size kapalı
                </span>
              ) : (
                <span>Opsiyon aldığınız daire bu ekranda anında kilitli ve soluk görünür.</span>
              )}
            </div>
          </div>

          {/* bileşen içi mini akış */}
          <div className="min-w-0 flex-1 rounded-2xl border border-[var(--cizgi)] bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-ink">Havuz hareketi</span>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[#1f7d4c]">
                <span className="size-1.5 rounded-full bg-green nabiz" /> canlı
              </span>
            </div>
            <ul className="mt-3 space-y-2.5">
              {feed.map((f) => (
                <li key={f.id} className="olay-gir flex items-center gap-2 font-mono text-[11px] text-ink-soft">
                  <span className="size-1.5 flex-none rounded-full" style={{ background: FEED_RENK[f.renk] }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{f.metin}</span>
                  <span className="flex-none text-[10px] text-[var(--ink-faint)]">{f.zaman}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {secili ? (
        <DetayPanel
          daire={secili}
          benim={benimOpsiyonlar.includes(secili.kod)}
          onOpsiyon={() => opsiyonAl(secili)}
          onKapat={() => setSecili(null)}
        />
      ) : null}
    </div>
  );
}

function DetayPanel({
  daire,
  benim,
  onOpsiyon,
  onKapat,
}: {
  daire: Daire;
  benim: boolean;
  onOpsiyon: () => void;
  onKapat: () => void;
}) {
  const durum: Durum = benim ? "opsiyon" : daire.durum;
  const meta = DURUM_ETIKET[durum];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onKapat} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Daire ${daire.kod} detayı`}
        className="sheet-in relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[var(--cizgi)] bg-white p-5 shadow-[var(--golge-3)] sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">Daire {daire.kod}</h3>
            <p className="mt-0.5 font-mono text-xs text-ink-soft">{daire.tip} · {daire.kat}. kat · {daire.cephe} cephe</p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <span className="rounded-md border border-[var(--cizgi-2)] bg-white px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">örnek</span>
            <button
              type="button"
              onClick={onKapat}
              aria-label="Kapat"
              className="flex size-11 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-5">
          {(
            [
              ["Net alan", `${daire.net} m²`],
              ["Brüt alan", `${daire.brut} m²`],
              ["Cephe", daire.cephe],
              ["Kat", `${daire.kat}. kat`],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-dashed border-[rgba(16,36,58,0.1)] py-2 font-mono text-[12px]">
              <span className="text-[var(--ink-faint)]">{k}</span>
              <span className="font-medium text-ink">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[28px] font-semibold leading-none tracking-tight text-ink">{daire.fiyat}</div>
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[#1f7d4c]">
              <span className="size-1.5 rounded-full bg-green nabiz" /> canlı · {tazeYaz(daire.taze)}
            </div>
          </div>
          <span className={`durum ${meta.rozet}`}><span className="nokta" />{meta.ad}</span>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-3.5 py-2.5">
          <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Ödeme planı</div>
          <div className="flex items-center justify-between font-mono text-[12px] text-ink">
            <span>%{daire.pesinat} peşinat</span>
            <span className="text-[var(--ink-faint)]">·</span>
            <span>{daire.taksit} taksit</span>
            <span className="text-[var(--ink-faint)]">·</span>
            <span>vade farksız</span>
          </div>
        </div>

        {benim ? (
          <div className="mt-4 rounded-xl border border-amber bg-[var(--color-amber-soft)] p-4">
            <div className="flex items-start gap-3">
              <span className="pp-kilit-dus flex size-9 flex-none items-center justify-center rounded-full bg-amber text-white">
                <Lock size={16} strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold leading-snug text-[#9a6a12]">Bu daire 48 saat size kilitlendi (örnek)</div>
                <div className="mt-1 text-[11.5px] leading-relaxed text-[#9a6a12]/80">Diğer danışmanların ekranında bu daire artık kilitli görünür. Çift satış DB seviyesinde imkansız.</div>
              </div>
            </div>
            <button type="button" onClick={onKapat} className="mt-3.5 flex h-11 w-full items-center justify-center rounded-[13px] bg-navy text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0d2438]">
              Tamam, havuza dön
            </button>
          </div>
        ) : durum === "musait" ? (
          <>
            <button
              type="button"
              onClick={onOpsiyon}
              className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-[13px] border border-amber bg-white text-[14px] font-semibold text-[#9a6a12] transition-colors hover:bg-[var(--color-amber-soft)]"
            >
              <Clock size={15} strokeWidth={2} /> Opsiyon al (dene)
            </button>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--ink-faint)]">Deneme kilidi: sayfa yenilenince sıfırlanır. Gerçek üründe opsiyon 48 saat DB kilidiyle korunur.</p>
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3.5 text-[12.5px] text-ink-soft">
            <span className={`durum ${meta.rozet}`}><span className="nokta" />{meta.ad}</span>
            {durum === "opsiyon" ? "Bu daire başka bir danışman tarafından opsiyonlanmış. Şu anda işlem yapılamaz." : "Bu daire satıldı. İşlem yapılamaz."}
          </div>
        )}
      </div>
    </div>
  );
}
