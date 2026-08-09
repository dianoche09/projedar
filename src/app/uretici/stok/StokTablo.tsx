"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  durumGrup,
  GRUP_AD,
  GRUP_NOKTA,
  GRUP_ROZET,
  paraKisa,
  tazelik,
  type DurumGrup,
  type ProjeOzet,
} from "@/lib/stok";
import { DaireModal, type ModalBirim } from "@/components/DaireModal";
import type { BirimDurum } from "@/lib/types";

export type StokSatir = {
  id: string;
  proje_id: string;
  proje_ad: string;
  blok_ad: string | null;
  kat: number | null;
  daire_no: string | null;
  tip_ad: string | null;
  net_m2: number | null;
  brut_m2: number | null;
  liste_fiyati: number | null;
  kira_bedeli: number | null;
  para_birimi: string | null;
  durum: string;
  /** Opsiyonluysa tutan, satıldıysa satan danışman adı (yoksa null). */
  satici_ad: string | null;
  son_guncelleme: string | null;
  // DaireModal künyesi (üretici modu — "Yönet" popup)
  satilabilir: boolean;
  yon: string | null;
  manzara: string | null;
  serefiye: { kat?: number; manzara?: number } | null;
  odeme_plani: {
    pesinat_pct?: number | null;
    taksit_sayisi?: number | null;
    vade_farki_pct?: number | null;
    ara_odemeler?: { ay: number; pct: number }[] | null;
  } | null;
  durum_notu: string | null;
  taban_fiyat: number | null;
  tip_tam_ad: string | null;
  oda: string | null;
  plan_url: string | null;
  tur: string | null;
  ana_birim_id: string | null;
};

/** Stok satırını DaireModal'ın beklediği künyeye çevirir (üretici modu). */
function satirToModalBirim(s: StokSatir): ModalBirim {
  return {
    id: s.id,
    daire_no: s.daire_no,
    kat: s.kat,
    tur: s.tur ?? "daire",
    durum: s.durum as BirimDurum,
    satilabilir: s.satilabilir,
    liste_fiyati: s.liste_fiyati,
    para_birimi: s.para_birimi ?? "TRY",
    net_m2: s.net_m2,
    brut_m2: s.brut_m2,
    yon: s.yon,
    manzara: s.manzara,
    durum_notu: s.durum_notu,
    son_guncelleme: s.son_guncelleme ?? new Date().toISOString(),
    serefiye: s.serefiye,
    taban_fiyat: s.taban_fiyat,
    tip_ad: s.tip_tam_ad ?? s.tip_ad,
    oda: s.oda,
    plan_url: s.plan_url,
    odeme_plani: s.odeme_plani,
  };
}

const DURUM_FILTRELER: { anahtar: DurumGrup | "tumu"; etiket: string; nokta?: string }[] = [
  { anahtar: "tumu", etiket: "Tüm durum" },
  { anahtar: "acik", etiket: "Satışa açık", nokta: "bg-green" },
  { anahtar: "opsiyon", etiket: "Opsiyon", nokta: "bg-amber" },
  { anahtar: "satildi", etiket: "Satıldı", nokta: "bg-red" },
  { anahtar: "planli", etiket: "Planlı", nokta: "bg-navy" },
  { anahtar: "kapali", etiket: "Kapalı", nokta: "bg-gray" },
];

const SATIR_ZEMIN: Record<DurumGrup, string | undefined> = {
  acik: undefined,
  opsiyon: "rgba(227,161,44,.045)",
  satildi: "rgba(209,90,78,.035)",
  planli: "rgba(16,36,58,.03)",
  kapali: undefined,
};

const SAYFA_SECENEK = [30, 50, 100] as const;
type SayfaBoyut = (typeof SAYFA_SECENEK)[number] | "hepsi";

export function StokTablo({
  satirlar,
  projeOzetler,
  kiraVar,
  baslangicDurum = "tumu",
}: {
  satirlar: StokSatir[];
  projeOzetler: ProjeOzet[];
  kiraVar: boolean;
  baslangicDurum?: DurumGrup | "tumu";
}) {
  const router = useRouter();
  const [projeId, setProjeId] = useState<string>("tumu");
  const [durum, setDurum] = useState<DurumGrup | "tumu">(baslangicDurum);
  // görünüm: tablo (pro liste) | kesit (bina kesiti — imza görünüm, tek proje)
  const [gorunum, setGorunum] = useState<"tablo" | "kesit">("tablo");
  // "Yönet" → açık daire modalı (satır + projesi). null = kapalı.
  const [acikSatir, setAcikSatir] = useState<StokSatir | null>(null);

  /** Kesit tek proje ister: geçişte proje seçili değilse ilk proje seçilir. */
  const kesiteGec = () => {
    if (projeId === "tumu" && projeOzetler[0]) setProjeId(projeOzetler[0].id);
    setGorunum("kesit");
  };
  const kesitProjeId = projeId !== "tumu" ? projeId : projeOzetler[0]?.id ?? null;
  const kesitProje = projeOzetler.find((p) => p.id === kesitProjeId) ?? null;
  const kesitSatirlar = useMemo(
    () => satirlar.filter((s) => s.ana_birim_id == null && s.proje_id === kesitProjeId),
    [satirlar, kesitProjeId],
  );

  const gosterilen = useMemo(() => {
    return satirlar.filter((s) => {
      if (s.ana_birim_id != null) return false; // eklentiler tabloda standalone satır olmaz (parent modalında)
      if (projeId !== "tumu" && s.proje_id !== projeId) return false;
      if (durum !== "tumu" && durumGrup(s.durum, s.satilabilir) !== durum) return false;
      return true;
    });
  }, [satirlar, projeId, durum]);

  // sayfalama — kullanıcı seçebilir (alttaki gösterim)
  const [sayfaBoyut, setSayfaBoyut] = useState<SayfaBoyut>(30);
  const [sayfa, setSayfa] = useState(1);
  const projeSec = (id: string) => {
    setProjeId(id);
    setSayfa(1);
  };
  const durumSec = (d: DurumGrup | "tumu") => {
    setDurum(d);
    setSayfa(1);
  };
  const boyutSec = (b: SayfaBoyut) => {
    setSayfaBoyut(b);
    setSayfa(1);
  };
  const boyut = sayfaBoyut === "hepsi" ? Math.max(1, gosterilen.length) : sayfaBoyut;
  const toplamSayfa = Math.max(1, Math.ceil(gosterilen.length / boyut));
  const aktifSayfa = Math.min(sayfa, toplamSayfa);
  const sayfada = gosterilen.slice((aktifSayfa - 1) * boyut, aktifSayfa * boyut);

  const seciliOzet = projeId === "tumu" ? null : projeOzetler.find((p) => p.id === projeId) ?? null;

  return (
    <>
      {/* KPI — proje seçiliyse o projeye canlı; "Tümü"de proje-proje özet (para birimi karışmaz) */}
      {seciliOzet ? (
        <ProjeKpi ozet={seciliOzet} />
      ) : (
        <TumuOzet ozetler={projeOzetler} onProjeSec={projeSec} />
      )}

      {/* filtre çipleri */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
          Proje
        </span>
        <button
          type="button"
          onClick={() => projeSec("tumu")}
          className={`chip h-8 px-3 text-[12px] ${projeId === "tumu" ? "bg-navy text-white" : ""}`}
        >
          Tümü
        </button>
        {projeOzetler.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => projeSec(p.id)}
            className={`chip h-8 px-3 text-[12px] ${projeId === p.id ? "bg-navy text-white" : ""}`}
          >
            {p.ad}
          </button>
        ))}

        <span className="mx-1.5 h-5 w-px bg-[var(--cizgi-2)]" />

        {DURUM_FILTRELER.map((f) => (
          <button
            key={f.anahtar}
            type="button"
            onClick={() => durumSec(f.anahtar)}
            className={`chip h-8 px-3 text-[12px] ${durum === f.anahtar ? "bg-navy text-white" : ""}`}
          >
            {f.nokta ? <span className={`size-[7px] rounded-full ${f.nokta}`} /> : null}
            {f.etiket}
          </button>
        ))}

        <span className="ml-auto mono text-[12px] text-[var(--ink-faint)]">
          {gorunum === "kesit" ? `${kesitSatirlar.length} birim` : `${gosterilen.length} / ${satirlar.filter((s) => s.ana_birim_id == null).length} birim`}
        </span>

        <div className="flex rounded-[11px] border border-[var(--cizgi-2)] bg-white p-0.5">
          <button
            type="button"
            onClick={kesiteGec}
            className={`rounded-[9px] px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${gorunum === "kesit" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}
          >
            Bina kesiti
          </button>
          <button
            type="button"
            onClick={() => setGorunum("tablo")}
            className={`rounded-[9px] px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${gorunum === "tablo" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}
          >
            Tablo
          </button>
        </div>
      </div>

      {gorunum === "kesit" ? (
        <>
          {/* Bina kesiti proje seçici — tek proje gösterilir, proje-proje gezinilir */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Kesit projesi
            </span>
            {projeOzetler.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProjeId(p.id)}
                className={`chip h-8 px-3 text-[12px] ${kesitProjeId === p.id ? "bg-navy text-white" : ""}`}
              >
                {p.ad}
                <span className={`ml-1.5 text-[10px] ${kesitProjeId === p.id ? "text-white/70" : "text-[var(--ink-faint)]"}`}>
                  {p.toplam}
                </span>
              </button>
            ))}
          </div>
          {kesitProje ? (
            <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-[17px] font-bold text-ink">{kesitProje.ad}</h2>
              <span className="mono text-[12px] text-[var(--ink-faint)]">
                {kesitProje.toplam} birim · <b className="text-green">{kesitProje.acik}</b> açık ·{" "}
                <b className="text-amber">{kesitProje.opsiyon}</b> opsiyon ·{" "}
                <b className="text-red">{kesitProje.satildi}</b> satıldı
                {kesitProje.planli ? <> · <b className="text-navy">{kesitProje.planli}</b> planlı</> : null}
              </span>
            </div>
          ) : null}
          <BinaKesiti satirlar={kesitSatirlar} onSec={(s) => setAcikSatir(s)} />
        </>
      ) : (
      <>
      {/* tablo */}
      <div className="kart belir belir-2 overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: 680, overflowY: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Proje</th>
                <th>Blok</th>
                <th>Kat</th>
                <th>No</th>
                <th>Tip</th>
                <th className="text-right">Net m²</th>
                <th className="text-right">Brüt m²</th>
                <th className="text-right">Fiyat</th>
                {kiraVar ? <th className="text-right">Kira</th> : null}
                <th>Durum</th>
                <th>Kim</th>
                <th>Son Güncelleme</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sayfada.map((s) => {
                const g = durumGrup(s.durum, s.satilabilir);
                const t = tazelik(s.son_guncelleme);
                return (
                  <tr key={s.id} style={SATIR_ZEMIN[g] ? { background: SATIR_ZEMIN[g] } : undefined}>
                    <td>
                      <span className="text-[12px] text-ink-soft">{s.proje_ad}</span>
                    </td>
                    <td className="mono font-medium">{s.blok_ad ?? "—"}</td>
                    <td className="mono">{s.kat ?? "—"}</td>
                    <td className="mono">{s.daire_no ?? "—"}</td>
                    <td>{s.tip_ad ?? "—"}</td>
                    <td className="mono text-right">{s.net_m2 != null ? s.net_m2 : "—"}</td>
                    <td className="mono text-right">{s.brut_m2 != null ? s.brut_m2 : "—"}</td>
                    <td
                      className="mono text-right font-semibold"
                      style={g === "satildi" ? { color: "var(--ink-faint)" } : undefined}
                    >
                      {s.liste_fiyati ? paraKisa(s.liste_fiyati, s.para_birimi) : "—"}
                    </td>
                    {kiraVar ? (
                      <td className="mono text-right text-ink-soft">
                        {s.kira_bedeli ? paraKisa(s.kira_bedeli, s.para_birimi) : "—"}
                      </td>
                    ) : null}
                    <td>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[11px] font-semibold ${GRUP_ROZET[g]}`}>
                        <span className={`size-[6px] rounded-full ${GRUP_NOKTA[g]}`} />
                        {GRUP_AD[g]}
                      </span>
                    </td>
                    <td>
                      {s.satici_ad ? (
                        <span className="text-[12px] font-medium text-ink">{s.satici_ad}</span>
                      ) : (
                        <span className="text-[12px] text-[var(--ink-faint)]">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`taze ${t.sinif}`}>
                        <span className="nokta" />
                        <span className="mono">{t.metin}</span>
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setAcikSatir(s)}
                        className="btn-action h-auto min-h-0 px-2.5 py-[5px] text-[11px]"
                      >
                        Yönet
                      </button>
                    </td>
                  </tr>
                );
              })}
              {gosterilen.length === 0 ? (
                <tr>
                  <td colSpan={kiraVar ? 13 : 12} className="py-10 text-center text-sm text-[var(--ink-faint)]">
                    {satirlar.length === 0
                      ? "Henüz birim yok — proje kurulumundan üret."
                      : "Bu filtreyle birim yok."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt bar: sayfa boyutu (gösterim) + sayfalama */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-[12px] text-ink-soft">
          <span>Sayfada göster</span>
          <select
            value={String(sayfaBoyut)}
            onChange={(e) => boyutSec(e.target.value === "hepsi" ? "hepsi" : (Number(e.target.value) as SayfaBoyut))}
            className="rounded-lg border border-[var(--cizgi-2)] bg-white px-2 py-1 font-mono text-[12px] text-ink outline-none focus:border-teal"
          >
            {SAYFA_SECENEK.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            <option value="hepsi">Tümü ({gosterilen.length})</option>
          </select>
        </label>

        {toplamSayfa > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSayfa((s) => Math.max(1, s - 1))}
              disabled={aktifSayfa <= 1}
              className="btn-ghost h-9 min-h-0 px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹ Önceki
            </button>
            <span className="mono text-[13px] text-ink-soft">
              Sayfa {aktifSayfa} / {toplamSayfa}
            </span>
            <button
              type="button"
              onClick={() => setSayfa((s) => Math.min(toplamSayfa, s + 1))}
              disabled={aktifSayfa >= toplamSayfa}
              className="btn-ghost h-9 min-h-0 px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki ›
            </button>
          </div>
        ) : null}
      </div>
      </>
      )}

      {/* "Yönet" → ilgili dairenin DaireModal'ı (üretici modu): durum/not + bilgi düzenle.
          Tek daireye kilitli; başka satırı etkilemez. */}
      {acikSatir ? (
        <DaireModal
          birim={satirToModalBirim(acikSatir)}
          projeId={acikSatir.proje_id}
          mod="uretici"
          projeAd={acikSatir.proje_ad}
          eklentiler={satirlar
            .filter((e) => e.ana_birim_id === acikSatir.id)
            .map((e) => ({
              id: e.id,
              tur: e.tur ?? "depo",
              daire_no: e.daire_no,
              liste_fiyati: e.liste_fiyati,
              para_birimi: e.para_birimi ?? "TRY",
            }))}
          onKapat={() => {
            setAcikSatir(null);
            // Güncellenen durum/fiyat canlı stok tablosuna yansısın (server action revalidate'i tamamlar).
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

/* ---------- KPI: tek proje (proje seçili) ---------- */
function ProjeKpi({ ozet }: { ozet: ProjeOzet }) {
  const bandVar = ozet.minFiyat > 0 || ozet.maxFiyat > 0;
  return (
    <section className="kart belir belir-1 mb-5 p-1">
      <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cizgi)] sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        <Kpi etiket="Toplam Birim" deger={String(ozet.toplam)} alt={ozet.ad} />
        <Kpi etiket="Satışa Açık" deger={String(ozet.acik)} renk="text-green" alt="satışa hazır" />
        <Kpi etiket="Opsiyon" deger={String(ozet.opsiyon)} renk="text-amber" alt="karar bekliyor" />
        <Kpi etiket="Satıldı" deger={String(ozet.satildi)} renk="text-red" alt={`${ozet.satildi} / ${ozet.toplam}`} />
        <Kpi
          etiket="Planlı / Kapalı"
          deger={`${ozet.planli} / ${ozet.kapali}`}
          alt="açılmamış · satışa kapalı"
        />
        <div className="px-5 py-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
            Liste Aralığı
          </div>
          {bandVar ? (
            <div className="mono text-[19px] font-semibold leading-tight text-ink">
              {paraKisa(ozet.minFiyat, ozet.para)}
              <span className="text-[13px] text-[var(--ink-faint)]">
                –{paraKisa(ozet.maxFiyat, ozet.para).replace(/^[₺$€£]/, "")}
              </span>
            </div>
          ) : (
            <div className="mono text-[19px] font-semibold leading-tight text-[var(--ink-faint)]">—</div>
          )}
          <div className="mt-2 text-[11.5px] text-[var(--ink-faint)]">birim fiyat bandı</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- KPI: tüm projeler (proje-proje özet; para birimi karışmaz) ---------- */
function TumuOzet({ ozetler, onProjeSec }: { ozetler: ProjeOzet[]; onProjeSec: (id: string) => void }) {
  const toplam = ozetler.reduce((n, o) => n + o.toplam, 0);
  const acik = ozetler.reduce((n, o) => n + o.acik, 0);
  const opsiyon = ozetler.reduce((n, o) => n + o.opsiyon, 0);
  const satildi = ozetler.reduce((n, o) => n + o.satildi, 0);
  const planli = ozetler.reduce((n, o) => n + o.planli, 0);
  return (
    <section className="mb-5">
      {/* Toplam şerit (para birimi bağımsız sayımlar) */}
      <div className="kart belir belir-1 mb-3 p-1">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cizgi)] sm:grid-cols-5 sm:divide-y-0">
          <Kpi etiket="Toplam Birim" deger={String(toplam)} alt={`${ozetler.length} proje`} />
          <Kpi etiket="Satışa Açık" deger={String(acik)} renk="text-green" alt="satışa hazır" />
          <Kpi etiket="Opsiyon" deger={String(opsiyon)} renk="text-amber" alt="karar bekliyor" />
          <Kpi etiket="Satıldı" deger={String(satildi)} renk="text-red" alt={`${satildi} / ${toplam}`} />
          <Kpi etiket="Planlı" deger={String(planli)} renk="text-navy" alt="henüz açılmamış" />
        </div>
      </div>
      {/* Proje-proje mini özet — her projenin kendi para birimiyle fiyat bandı */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ozetler.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onProjeSec(o.id)}
            className="kart belir belir-2 group p-4 text-left transition-shadow hover:shadow-cardlg"
          >
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="font-display text-[14px] font-bold text-ink group-hover:text-teal-d">{o.ad}</span>
              <span className="mono text-[11px] text-[var(--ink-faint)]">{o.toplam} birim</span>
            </div>
            <div className="mb-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11.5px]">
              <span className="text-green">{o.acik} açık</span>
              <span className="text-amber">{o.opsiyon} opsiyon</span>
              <span className="text-red">{o.satildi} satıldı</span>
              {o.planli ? <span className="text-navy">{o.planli} planlı</span> : null}
              {o.kapali ? <span className="text-[var(--ink-faint)]">{o.kapali} kapalı</span> : null}
            </div>
            {/* Doluluk çubuğu (açık/opsiyon/satıldı oranı) */}
            <div className="flex h-1.5 overflow-hidden rounded-full bg-[var(--cizgi)]">
              {o.toplam > 0 ? (
                <>
                  <span className="bg-green" style={{ width: `${(o.acik / o.toplam) * 100}%` }} />
                  <span className="bg-amber" style={{ width: `${(o.opsiyon / o.toplam) * 100}%` }} />
                  <span className="bg-red" style={{ width: `${(o.satildi / o.toplam) * 100}%` }} />
                  <span className="bg-navy" style={{ width: `${(o.planli / o.toplam) * 100}%` }} />
                </>
              ) : null}
            </div>
            <div className="mt-2.5 mono text-[12px] font-semibold text-ink">
              {o.minFiyat > 0 || o.maxFiyat > 0 ? (
                <>
                  {paraKisa(o.minFiyat, o.para)}
                  <span className="text-[11px] font-normal text-[var(--ink-faint)]">
                    {" – "}
                    {paraKisa(o.maxFiyat, o.para)}
                  </span>
                </>
              ) : (
                <span className="text-[var(--ink-faint)]">fiyat girilmedi</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Kpi({
  etiket,
  deger,
  alt,
  renk = "text-ink",
}: {
  etiket: string;
  deger: string;
  alt?: string;
  renk?: string;
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">{etiket}</div>
      <div className={`mono text-[26px] font-semibold leading-none ${renk}`}>{deger}</div>
      {alt ? <div className="mono mt-2 text-[11.5px] text-[var(--ink-faint)]">{alt}</div> : null}
    </div>
  );
}

/* ---------- BİNA KESİTİ (imza görünüm): blok/kat/daire, durum renkli, tıkla → Yönet ---------- */

const KESIT_RENK: Record<DurumGrup, string> = {
  acik: "var(--color-green)",
  opsiyon: "var(--color-amber)",
  satildi: "var(--color-red)",
  planli: "var(--color-navy)",
  kapali: "rgba(16,36,58,0.35)",
};

function daireNoSirala(a: StokSatir, b: StokSatir): number {
  return (a.daire_no ?? "").localeCompare(b.daire_no ?? "", "tr", { numeric: true });
}

function BinaKesiti({ satirlar, onSec }: { satirlar: StokSatir[]; onSec: (s: StokSatir) => void }) {
  // blok → kat (yukarıdan aşağı) → daireler
  const bloklar = useMemo(() => {
    const m = new Map<string, Map<number, StokSatir[]>>();
    for (const s of satirlar) {
      const bAd = s.blok_ad ?? "Blok";
      const kat = s.kat ?? 0;
      const katlar = m.get(bAd) ?? new Map<number, StokSatir[]>();
      const arr = katlar.get(kat) ?? [];
      arr.push(s);
      katlar.set(kat, arr);
      m.set(bAd, katlar);
    }
    return [...m.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "tr"))
      .map(([ad, katlar]) => ({
        ad,
        katlar: [...katlar.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([kat, dsRaw]) => ({ kat, daireler: [...dsRaw].sort(daireNoSirala) })),
      }));
  }, [satirlar]);

  if (satirlar.length === 0) {
    return (
      <div className="kart belir belir-2 p-10 text-center text-sm text-[var(--ink-faint)]">
        Bu projede birim yok, proje kurulumundan üret.
      </div>
    );
  }

  return (
    <div className="kart belir belir-2 p-4 sm:p-5">
      <div className="flex gap-8 overflow-x-auto pb-2">
        {bloklar.map((blok) => {
          const toplamMusait = blok.katlar.reduce(
            (n, k) => n + k.daireler.filter((d) => durumGrup(d.durum, d.satilabilir) === "acik").length,
            0,
          );
          return (
            <div key={blok.ad} className="min-w-[280px] flex-1">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <span className="font-display text-[14px] font-bold text-ink">{blok.ad}</span>
                <span className="mono text-[11px] text-[var(--ink-faint)]">
                  <b className="text-green">{toplamMusait}</b> açık
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {blok.katlar.map(({ kat, daireler }) => (
                  <div key={kat} className="flex items-center gap-2">
                    <span className="w-7 flex-none text-right font-mono text-[10px] text-[var(--ink-faint)]">
                      K{kat}
                    </span>
                    <div className="flex min-w-0 flex-1 gap-1.5">
                      {daireler.map((s) => {
                        const g = durumGrup(s.durum, s.satilabilir);
                        const kapali = g === "kapali";
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onSec(s)}
                            style={kapali ? undefined : { background: KESIT_RENK[g] }}
                            className={`flex h-12 min-w-[64px] flex-1 flex-col items-center justify-center rounded-lg font-mono leading-tight transition-transform duration-150 ${
                              kapali
                                ? "border border-dashed border-[rgba(16,36,58,0.3)] bg-[rgba(16,36,58,0.05)] text-ink-soft"
                                : "text-white hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(16,36,58,0.22)]"
                            }`}
                            title={`${s.daire_no ?? "—"} · ${GRUP_AD[g]}${s.liste_fiyati ? ` · ${paraKisa(s.liste_fiyati, s.para_birimi)}` : ""}${s.satici_ad ? ` · ${s.satici_ad}` : ""} · yönetmek için tıkla`}
                          >
                            <span className="text-[10.5px] font-bold">{s.daire_no ?? "—"}</span>
                            <span className={`text-[9px] ${kapali ? "" : "opacity-85"}`}>
                              {kapali ? "kapalı" : s.liste_fiyati ? paraKisa(s.liste_fiyati, s.para_birimi) : s.tip_ad ?? ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10.5px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-green" /> açık</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-amber" /> opsiyon</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-red" /> satıldı</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded bg-navy" /> planlı</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded border border-dashed border-[rgba(16,36,58,0.35)] bg-[rgba(16,36,58,0.06)]" /> kapalı</span>
        <span className="font-semibold text-teal">daireye tıkla → yönet</span>
      </p>
    </div>
  );
}
