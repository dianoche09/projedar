import { Layers, MapPin, Ruler, Sparkles, TreePine, Compass } from "lucide-react";

/** katalog_proje.icerik jsonb yapısı (enrichment ajanı üretir). Tüm alanlar opsiyonel. */
export type ProjeIcerikVeri = {
  proje_alani_m2?: number | null;
  daire_sayisi?: number | null;
  blok_sayisi?: number | null;
  oda_tipleri?: string[] | null;
  m2_min?: number | null;
  m2_max?: number | null;
  magaza?: boolean | null;
  yesil_alan?: boolean | null;
  sosyal_alan?: boolean | null;
  manzara?: string | null;
  otopark?: string | null;
  ozellikler?: string[] | null;
  cevre_noktalar?: string[] | null;
  ekstra?: Record<string, unknown> | null;
  metin?: {
    ozet?: string | null;
    konum_cevre?: string | null;
    daire_tipleri?: string | null;
    ozellikler_metni?: string | null;
    yatirim_teslim?: string | null;
  } | null;
};

const sayi = (n: number) => n.toLocaleString("tr-TR");

/** ekstra jsonb'den gösterilecek olgusal alanlar (not/çelişki anahtarları atlanır). */
const EKSTRA_ETIKET: Record<string, string> = {
  kullanim: "Kullanım",
  toplam_insaat_alani_m2: "Toplam inşaat",
  yesil_alan_m2: "Yeşil alan",
  mimar: "Mimar",
  ticari_birim_sayisi: "Ticari birim",
  ticari_aks: "Ticari aks",
  on_satis_tarihi: "Ön satış",
  lansman_tarihi: "Lansman",
};

function ekstraSatirlari(ekstra: Record<string, unknown> | null | undefined): [string, string][] {
  if (!ekstra) return [];
  const out: [string, string][] = [];
  for (const [k, etiket] of Object.entries(EKSTRA_ETIKET)) {
    const v = ekstra[k];
    if (v == null || v === "") continue;
    const metin = typeof v === "number" ? (k.endsWith("_m2") ? `${sayi(v)} m²` : sayi(v)) : String(v);
    out.push([etiket, metin]);
  }
  return out;
}

function m2Band(min?: number | null, max?: number | null): string | null {
  const a = min != null && min > 0 ? min : null;
  const b = max != null && max > 0 ? max : null;
  if (a == null && b == null) return null;
  if (a != null && b != null) return a === b ? `${a} m²` : `${a}–${b} m²`;
  return `${(a ?? b) as number} m²`;
}

function Ozet({ ozet }: { ozet: string }) {
  return (
    <section className="relative px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <div className="kart signal-top p-7 sm:p-9" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Genel bakış</p>
          <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">{ozet}</p>
        </div>
      </div>
    </section>
  );
}

/** Zengin proje içeriği: genel bakış, proje özeti, daire tipleri, konum ve çevre, özellikler, yatırım. */
export function ProjeZenginIcerik({ icerik, ad }: { icerik: ProjeIcerikVeri; ad: string }) {
  const t = icerik.metin ?? {};
  const oda = Array.isArray(icerik.oda_tipleri) ? icerik.oda_tipleri : [];
  const band = m2Band(icerik.m2_min, icerik.m2_max);

  // Proje Özeti grid
  const ozet: [string, string][] = [];
  if (icerik.proje_alani_m2) ozet.push(["Proje alanı", `${sayi(icerik.proje_alani_m2)} m²`]);
  if (icerik.daire_sayisi) ozet.push(["Daire sayısı", sayi(icerik.daire_sayisi)]);
  if (icerik.blok_sayisi) ozet.push(["Blok / kule", sayi(icerik.blok_sayisi)]);
  if (band) ozet.push(["Daire büyüklüğü", band]);
  if (icerik.manzara) ozet.push(["Manzara", icerik.manzara]);
  if (icerik.otopark) ozet.push(["Otopark", icerik.otopark]);
  if (icerik.magaza) ozet.push(["Mağaza / ticari", "Var"]);
  if (icerik.yesil_alan) ozet.push(["Yeşil alan", "Var"]);
  if (icerik.sosyal_alan) ozet.push(["Sosyal alanlar", "Var"]);
  ozet.push(...ekstraSatirlari(icerik.ekstra));

  const donati = Array.isArray(icerik.ozellikler) ? icerik.ozellikler : [];
  const cevre = Array.isArray(icerik.cevre_noktalar) ? icerik.cevre_noktalar : [];
  const dagilim = (icerik.ekstra?.daire_dagilimi ?? null) as Record<string, number> | null;

  return (
    <>
      {t.ozet ? <Ozet ozet={t.ozet} /> : null}

      {/* Proje Özeti grid */}
      {ozet.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-teal-d" />
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">{ad} proje özeti</h2>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ozet.map(([k, v]) => (
                <div key={k} className="kart p-4">
                  <p className="text-xs text-ink-soft">{k}</p>
                  <p className="mt-1 font-display font-bold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Daire tipleri */}
      {t.daire_tipleri || oda.length ? (
        <section className="px-5 py-16 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-teal-d" />
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">Daire tipleri ve büyüklükler</h2>
            </div>
            {oda.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {oda.map((o) => <span key={o} className="rounded-lg bg-[var(--color-teal-soft)] px-3 py-1.5 font-mono text-[13px] font-semibold text-teal-d">{o}</span>)}
                {band ? <span className="rounded-lg bg-paper px-3 py-1.5 font-mono text-[13px] text-ink-soft">{band}</span> : null}
              </div>
            ) : null}
            {dagilim && Object.keys(dagilim).length ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-soft">
                {Object.entries(dagilim).map(([tip, adet]) => <span key={tip}>{tip}: {sayi(adet)} adet</span>)}
              </div>
            ) : null}
            {t.daire_tipleri ? <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">{t.daire_tipleri}</p> : null}
          </div>
        </section>
      ) : null}

      {/* Konum ve Çevre */}
      {t.konum_cevre || cevre.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-4xl">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-teal-d" />
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">Konum ve çevre</h2>
            </div>
            {t.konum_cevre ? <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">{t.konum_cevre}</p> : null}
            {cevre.length ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {cevre.map((c) => (
                  <div key={c} className="flex items-start gap-2 rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink">
                    <Compass size={15} className="mt-0.5 flex-none text-teal-d" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Özellikler / donatı */}
      {t.ozellikler_metni || donati.length ? (
        <section className="px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-teal-d" />
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">Proje özellikleri ve sosyal donatı</h2>
            </div>
            {t.ozellikler_metni ? <p className="mt-4 max-w-3xl text-pretty text-[15px] leading-relaxed text-ink-soft">{t.ozellikler_metni}</p> : null}
            {donati.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {donati.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-paper px-3 py-1.5 text-[13px] text-ink">
                    <TreePine size={13} className="text-teal-d" />{d}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Yatırım ve teslim */}
      {t.yatirim_teslim ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Yatırım ve teslim</h2>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-soft">{t.yatirim_teslim}</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
