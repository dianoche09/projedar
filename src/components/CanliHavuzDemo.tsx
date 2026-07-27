"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Clock, Lock } from "lucide-react";

/**
 * Tam genişlik interaktif "Canlı Havuz" demosu.
 * Bina kesiti ↔ tablo görünümü. Daireye tıklayınca gerçek ürün gibi ZENGİN daire detay modalı açılır
 * (tip'e göre gerçek kat planı render'ı + net/brüt + cephe + ödeme planı + canlı fiyat + Paylaş/Opsiyon).
 * Opsiyon al ve Müşteriye paylaş login'e GÖTÜRMEZ (kullanıcı isteği): opsiyon daireyi bileşen içinde
 * amber kilitler, paylaş ise danışman bilgili WhatsApp mesaj kartı animasyonu oynatır.
 * Gri/kilitli hücreler = TAHSİSLİ (size açık değil) — tahsis konseptini görselleştirir. Veriler ÖRNEK.
 */

type Durum = "musait" | "opsiyon" | "satildi" | "tahsisli";

const DURUM_META: Record<Durum, { sinif: string; etiket: string; durum: string; renk: string }> = {
  musait: { sinif: "h-musait", etiket: "Müsait", durum: "d-musait", renk: "#1f7d4c" },
  opsiyon: { sinif: "h-opsiyon", etiket: "Opsiyon", durum: "d-opsiyon", renk: "#9a6a12" },
  satildi: { sinif: "h-satildi", etiket: "Satıldı", durum: "d-satildi", renk: "#a23f34" },
  tahsisli: { sinif: "h-kilit", etiket: "Tahsisli", durum: "", renk: "#7d8da0" },
};

const KATLAR = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const DAIRE_NO = [1, 2, 3, 4, 5];
const CEPHE: Record<number, string> = { 1: "Kuzey", 2: "Güney", 3: "Doğu", 4: "Batı", 5: "Güney-Batı" };

function durumBelirle(kat: number, no: number): Durum {
  // hash tabanlı dengesiz dağılım (düzenli çapraz desen yerine doğal görünüm)
  let h = ((kat * 73856093) ^ (no * 19349663)) % 100;
  if (h < 0) h += 100;
  if (h < 52) return "musait";
  if (h < 70) return "opsiyon";
  if (h < 87) return "satildi";
  return "tahsisli";
}

const TIPLER: Record<number, { tip: string; net: number; fiyat: string }> = {
  1: { tip: "2+1", net: 94, fiyat: "₺5,80M" },
  2: { tip: "3+1", net: 142, fiyat: "₺8,75M" },
  3: { tip: "3+1", net: 138, fiyat: "₺8,40M" },
  4: { tip: "4+1", net: 186, fiyat: "₺12,2M" },
  5: { tip: "2+1", net: 96, fiyat: "₺5,95M" },
};

type Daire = { kod: string; tip: string; net: number; brut: number; cephe: string; kat: number; fiyat: string; durum: Durum; taze: string };

function daireYap(kat: number, no: number, taze = "2 dk"): Daire {
  const t = TIPLER[no];
  return { kod: `A-${kat}-${no}`, tip: t.tip, net: t.net, brut: Math.round(t.net * 1.18), cephe: CEPHE[no], kat, fiyat: t.fiyat, durum: durumBelirle(kat, no), taze };
}

const TABLO: Daire[] = [
  daireYap(7, 2, "2 dk"),
  daireYap(8, 3, "5 dk"),
  daireYap(6, 1, "11 dk"),
  { ...daireYap(9, 4), kod: "B-9-4", taze: "18 dk" },
  { ...daireYap(4, 2), kod: "B-4-2", taze: "1 sa" },
  { ...daireYap(7, 5), kod: "B-7-5", taze: "26 dk" },
  { ...daireYap(5, 3), kod: "C-5-3", taze: "33 dk" },
  { ...daireYap(8, 4), kod: "C-8-4", taze: "2 sa" },
];

const planSrc = (tip: string) => `/gorseller/kat-plani-${tip.replace("+", "-")}.jpg`;

export function CanliHavuzDemo() {
  const [gorunum, setGorunum] = useState<"kesit" | "tablo">("kesit");
  const [modal, setModal] = useState<Daire | null>(null);
  const [benimOpsiyonlar, setBenimOpsiyonlar] = useState<string[]>([]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const ac = (d: Daire) => { if (d.durum !== "tahsisli") setModal(d); };

  /* deneme opsiyonu: durum bileşen içinde amber'e döner, login yok */
  const benimMi = (kod: string) => benimOpsiyonlar.includes(kod);
  const durumGoster = (d: Daire): Durum => (benimMi(d.kod) ? "opsiyon" : d.durum);

  return (
    <div className="kart relative overflow-hidden p-0">
      <span className="absolute right-4 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">örnek görünüm</span>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-display text-base font-bold text-ink">
            Çankaya Vadi
            <span className="rounded-full bg-[var(--color-teal-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-teal-d)]">✓ Doğrulanmış</span>
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#1f7d4c]"><span className="size-1.5 rounded-full bg-green nabiz" /> 2 dk önce</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3.5 font-mono text-[11px] text-ink-soft sm:flex">
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-green" /> <b className="font-semibold text-ink">58</b></span>
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-amber" /> <b className="font-semibold text-ink">22</b></span>
            <span className="inline-flex items-center gap-1.5"><span className="size-[7px] rounded-full bg-red" /> <b className="font-semibold text-ink">20</b></span>
          </div>
          <div className="flex rounded-[11px] border border-[var(--cizgi-2)] bg-white p-0.5">
            {(["kesit", "tablo"] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGorunum(g)} className={`rounded-[9px] px-3.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${gorunum === g ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}>
                {g === "kesit" ? "Bina kesiti" : "Tablo"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {gorunum === "kesit" ? (
        <div className="p-5 sm:p-6">
          <div className="mb-3 flex gap-1.5">
            <span className="rounded-[9px] border border-navy bg-navy px-3 py-1.5 font-mono text-[11px] font-semibold text-white">A Blok</span>
            <span className="rounded-[9px] border border-[var(--cizgi-2)] px-3 py-1.5 font-mono text-[11px] font-semibold text-ink-soft">B Blok</span>
            <span className="rounded-[9px] border border-[var(--cizgi-2)] px-3 py-1.5 font-mono text-[11px] font-semibold text-ink-soft">C Blok</span>
          </div>
          <div>
            <div className="min-w-0">
              {KATLAR.map((kat) => (
                <div key={kat} className="mb-1.5 flex items-center gap-2">
                  <span className="w-8 flex-none font-mono text-[10px] text-[var(--ink-faint)]">K{kat}</span>
                  <div className="flex flex-1 gap-1.5">
                    {DAIRE_NO.map((no) => {
                      const kod = `A-${kat}-${no}`;
                      const durum = benimMi(kod) ? "opsiyon" : durumBelirle(kat, no);
                      const kilit = durum === "tahsisli";
                      return (
                        <button
                          key={no}
                          type="button"
                          disabled={kilit}
                          onClick={() => ac(daireYap(kat, no))}
                          className={`relative flex h-12 flex-1 items-center justify-center rounded-lg font-mono text-[10px] font-semibold leading-none text-white transition-[background-color,transform] duration-500 ${DURUM_META[durum].sinif} ${kilit ? "cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_14px_rgba(16,36,58,0.2)]"}`}
                          title={kilit ? `${kod} · Tahsisli — size açık değil` : `${kod} · ${DURUM_META[durum].etiket} · detay için tıkla`}
                        >
                          {kilit ? <span className="text-[8px] font-semibold leading-[1.05] tracking-tight">özel<br />tahsis</span> : `${kat}-${no}`}
                          {benimMi(kod) ? <Lock size={10} strokeWidth={2.5} className="absolute right-1 top-1" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-green" /> müsait</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-amber" /> opsiyon</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-red" /> satıldı</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded border border-dashed border-[rgba(16,36,58,0.35)] bg-[rgba(16,36,58,0.06)]" /> özel tahsis (size kapalı)</span>
            <span className="font-semibold text-teal">↑ müsait/opsiyon daireye tıkla → detay</span>
          </p>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <table className="tbl w-full sm:min-w-[640px]">
            <thead><tr><th>Daire</th><th className="max-sm:hidden">Tip</th><th className="max-sm:hidden">Net</th><th className="max-sm:hidden">Cephe</th><th>Fiyat</th><th>Durum</th><th>Tazelik</th><th className="max-sm:hidden"></th></tr></thead>
            <tbody>
              {TABLO.map((r) => (
                <tr key={r.kod} onClick={() => ac(r)} className="cursor-pointer">
                  <td className="mono font-semibold">{r.kod}</td>
                  <td className="mono max-sm:hidden">{r.tip}</td>
                  <td className="mono max-sm:hidden">{r.net} m²</td>
                  <td className="mono max-sm:hidden">{r.cephe}</td>
                  <td className="mono font-semibold">{r.fiyat}</td>
                  <td><span className={`durum ${DURUM_META[durumGoster(r)].durum}`}><span className="nokta" />{DURUM_META[durumGoster(r)].etiket}</span></td>
                  <td><span className="flex items-center gap-1.5 font-mono text-[11px] text-[#1f7d4c]"><span className="size-1.5 rounded-full bg-green" /> {r.taze} önce</span></td>
                  <td className="max-sm:hidden"><span className="font-mono text-[11px] font-semibold text-teal">Detay →</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal ? (
        <DaireDetay
          key={modal.kod}
          daire={modal}
          benim={benimMi(modal.kod)}
          onOpsiyon={() => setBenimOpsiyonlar((p) => (p.includes(modal.kod) ? p : [...p, modal.kod]))}
          onKapat={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}

function DaireDetay({
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
  const [sahne, setSahne] = useState<"detay" | "paylasim">("detay");
  const [iletildi, setIletildi] = useState(false);

  // paylaşım sahnesi: balon düşer, kısa "gönderiliyor" anından sonra çift tik
  useEffect(() => {
    if (sahne !== "paylasim") return;
    const z = setTimeout(() => setIletildi(true), 1100);
    return () => clearTimeout(z);
  }, [sahne]);

  const paylasimAc = () => {
    setIletildi(false);
    setSahne("paylasim");
  };

  const durum: Durum = benim ? "opsiyon" : daire.durum;
  const meta = DURUM_META[durum];
  const musait = daire.durum === "musait";
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onKapat} aria-hidden />
      <div className="sheet-in relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-[var(--cizgi)] bg-white shadow-[var(--golge-3)] sm:rounded-2xl">
        <span className="absolute right-14 top-4 z-10 rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">örnek</span>
        <button onClick={onKapat} className="absolute right-4 top-3.5 z-10 rounded-xl px-2.5 py-1.5 text-sm font-bold text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink" aria-label="Kapat">✕</button>

        <div className="grid sm:grid-cols-2">
          {/* SOL — kat planı */}
          <div className="flex items-center justify-center border-b border-[var(--cizgi)] bg-[var(--color-soft)] p-5 sm:border-b-0 sm:border-r sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={planSrc(daire.tip)} alt={`${daire.tip} örnek kat planı`} loading="lazy" className="w-full rounded-xl border border-[var(--cizgi)] bg-white" />
          </div>

          {/* SAĞ — bilgi veya WhatsApp paylaşım sahnesi */}
          {sahne === "paylasim" ? (
            <div className="p-6">
              <style>{`
                @keyframes ppWaBalon { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @media (prefers-reduced-motion: reduce) { .pp-wa-balon { animation: none !important; } }
              `}</style>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">WhatsApp önizleme · örnek</p>
                <button
                  type="button"
                  onClick={() => setSahne("detay")}
                  className="rounded-lg px-2 py-1 font-mono text-[11px] font-semibold text-teal transition-colors hover:bg-[var(--color-teal-soft)]"
                >
                  ← detaya dön
                </button>
              </div>

              <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--cizgi)] bg-[#e5ddd5]">
                {/* danışman üst bilgisi */}
                <div className="flex items-center gap-2.5 bg-[#075e54] px-3.5 py-2.5 text-white">
                  <span className="grid size-8 flex-none place-items-center rounded-full bg-white/20 font-display text-[12px] font-bold">AY</span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold leading-tight">Ayşe Yılmaz (örnek)</p>
                    <p className="truncate text-[10px] text-white/75">Yılmaz Gayrimenkul · yetkili danışman</p>
                  </div>
                  <span className="ml-auto flex-none font-mono text-[9.5px] text-white/70">çevrimiçi</span>
                </div>

                {/* mesaj balonu */}
                <div className="p-3.5">
                  <div
                    className="pp-wa-balon ml-auto max-w-[94%] rounded-xl rounded-tr-sm bg-[#dcf8c6] p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                    style={{ animation: "ppWaBalon 480ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={planSrc(daire.tip)} alt={`${daire.tip} örnek kat planı`} loading="lazy" className="w-full rounded-lg border border-black/5 bg-white" />
                    <p className="mt-2 text-[12.5px] font-bold leading-snug text-[#111b21]">Çankaya Vadi · Daire {daire.kod}</p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-[#3b4a54]">{daire.tip} · net {daire.net} m² · brüt {daire.brut} m² · {daire.kat}. kat · {daire.cephe} cephe</p>
                    <p className="mt-1.5 text-[15px] font-bold text-[#111b21]">
                      {daire.fiyat}
                      <span className="ml-2 align-middle font-mono text-[9.5px] font-semibold text-[#1f7d4c]">● canlı fiyat · %30 peşin + 24 ay</span>
                    </p>
                    <p className="mt-1 truncate font-mono text-[10.5px] text-[#027eb5] underline">projepazar.app/d/{daire.kod.toLowerCase()}</p>
                    <p className="mt-1.5 flex items-center justify-end gap-1 font-mono text-[9.5px] text-[#3b4a54]/70">
                      14:02
                      {iletildi ? <span className="font-bold text-[#34b7f1]">✓✓</span> : <span aria-hidden>…</span>}
                    </p>
                  </div>
                  <p className="mt-2.5 text-right font-mono text-[10px] font-semibold text-[#1f7d4c]" aria-live="polite">
                    {iletildi ? "iletildi · fiyat canlı değerden basıldı" : "gönderiliyor…"}
                  </p>
                </div>
              </div>

              <p className="mt-3 font-mono text-[10px] leading-relaxed text-[var(--ink-faint)]">
                Örnek sahne. Gerçek üründe link müşteriye WhatsApp ile gider; fiyat her açılışta canlı değerden okunur.
              </p>
              <Link href="/kayit?rol=emlakci" className="mt-2 inline-block font-mono text-[11px] font-semibold text-teal hover:underline">
                Gerçekte paylaşmak için ücretsiz başla →
              </Link>
            </div>
          ) : (
          <div className="p-6">
            <h3 className="font-display text-xl font-extrabold tracking-tight text-ink">Daire {daire.kod}</h3>
            <p className="mt-0.5 font-mono text-xs text-ink-soft">{daire.tip} · {daire.kat}. kat · {daire.cephe} cephe</p>

            <div className="mt-4 grid grid-cols-2 gap-x-5">
              {[["Net alan", `${daire.net} m²`], ["Brüt alan", `${daire.brut} m²`], ["Cephe", daire.cephe], ["Kat", `${daire.kat}. kat`]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-dashed border-[rgba(16,36,58,0.1)] py-2 font-mono text-[12px]">
                  <span className="text-[var(--ink-faint)]">{k}</span><span className="font-medium text-ink">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="font-mono text-[28px] font-semibold leading-none text-ink">{daire.fiyat}</div>
                <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10.5px] text-[#1f7d4c]"><span className="size-1.5 rounded-full bg-green nabiz" /> canlı · {daire.taze} önce</div>
              </div>
              <span className={`durum ${meta.durum}`}><span className="nokta" />{meta.etiket}</span>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-3.5 py-2.5">
              <div className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Ödeme planı</div>
              <div className="flex items-center justify-between font-mono text-[12px] text-ink"><span>%30 peşinat</span><span className="text-[var(--ink-faint)]">·</span><span>24 taksit</span><span className="text-[var(--ink-faint)]">·</span><span>vade farksız</span></div>
            </div>

            {benim ? (
              <>
                <div className="mt-4 rounded-xl border border-amber bg-[var(--color-amber-soft)] p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-8 flex-none items-center justify-center rounded-full bg-amber text-white">
                      <Lock size={14} strokeWidth={2.5} />
                    </span>
                    <p className="min-w-0 text-[12px] font-semibold leading-snug text-[#9a6a12]">
                      Bu daireyi opsiyonladınız: 48 saat size kilitli (örnek). Diğer danışmanların ekranında artık amber görünür.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={paylasimAc} className="btn-action mt-3 h-11 w-full text-[14px]">
                  <Share2 size={15} strokeWidth={2} /> Müşteriye paylaş
                </button>
              </>
            ) : musait ? (
              <>
                <div className="mt-4 flex gap-2.5">
                  <button type="button" onClick={paylasimAc} className="btn-action h-11 flex-1 text-[14px]"><Share2 size={15} strokeWidth={2} /> Müşteriye paylaş</button>
                  <button type="button" onClick={onOpsiyon} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-amber bg-white text-[14px] font-semibold text-[#9a6a12] transition-colors hover:bg-amber-soft"><Clock size={15} strokeWidth={2} /> Opsiyon al</button>
                </div>
                <p className="mt-3 font-mono text-[10px] text-[var(--ink-faint)]">Örnek görünüm · gerçek üründe fiyat paylaşımda canlı değerden basılır</p>
              </>
            ) : (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3.5 text-[12.5px] text-ink-soft">
                <span className={`durum ${meta.durum}`}><span className="nokta" />{meta.etiket}</span>
                {daire.durum === "opsiyon" ? "Bu daire opsiyonlanmış durumda. Şu anda işlem yapılamaz." : "Bu daire satıldı. İşlem yapılamaz."}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
