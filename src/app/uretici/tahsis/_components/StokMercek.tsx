import Link from "next/link";
import { stokDagitimGetir, type StokDagitimSatir } from "@/lib/tahsis";

/* =========================================================
   STOK MERCEĞİ — ters görünüm (birim → onu satabilen aktif tahsisler).
   Tahsis merceğinin aynası: orada "kural → kim/ne", burada "birim → satabilenler + şart".
   Sinyal renkleri: yeşil=müsait, amber=opsiyon, kırmızı=satıldı (proje kuralı).
   ========================================================= */

const BIRIM_DURUM_ROZET: Record<string, { sinif: string; etiket: string }> = {
  musait: { sinif: "bg-green-soft text-[#1f7d4c]", etiket: "Müsait" },
  opsiyonlu: { sinif: "bg-amber-soft text-[#9a6a12]", etiket: "Opsiyonlu" },
  satis_beklemede: { sinif: "bg-amber-soft text-[#9a6a12]", etiket: "Satış bekliyor" },
  satildi: { sinif: "bg-red-soft text-red", etiket: "Satıldı" },
  stop: { sinif: "bg-navy-soft text-ink-soft", etiket: "Stop" },
  planli: { sinif: "bg-navy-soft text-ink-soft", etiket: "Planlı" },
  kiralandi: { sinif: "bg-navy-soft text-ink-soft", etiket: "Kiralandı" },
};

type BirimGrup = {
  birim_id: string;
  daire_no: string | null;
  blok_id: string | null;
  kat: number | null;
  birim_durum: string;
  /** Bu birimi satabilen AKTİF tahsisler (tahsis_id dolu satırlar). */
  satabilenler: StokDagitimSatir[];
};

function segmentMetin(f: Record<string, string> | null): string {
  if (!f) return "";
  return [f.marka, f.ilce, f.il, f.uzmanlik].filter(Boolean).join(" · ");
}

/** Stok merceği: bir projenin birimlerini blok bazında listeler, her birinin satabilenlerini gösterir. */
export async function StokMercek({
  projeId,
  ofisAd,
  danismanAd,
  blokAd,
}: {
  projeId: string;
  ofisAd: Map<string, string>;
  danismanAd: Map<string, string | null>;
  blokAd: Map<string, string | null>;
}) {
  const satirlar = await stokDagitimGetir(projeId);

  // birim_id → grup (satabilen tahsisleri topla)
  const birimMap = new Map<string, BirimGrup>();
  for (const r of satirlar) {
    let g = birimMap.get(r.birim_id);
    if (!g) {
      g = {
        birim_id: r.birim_id,
        daire_no: r.daire_no,
        blok_id: r.blok_id,
        kat: r.kat,
        birim_durum: r.birim_durum,
        satabilenler: [],
      };
      birimMap.set(r.birim_id, g);
    }
    if (r.tahsis_id) g.satabilenler.push(r);
  }
  const birimler = [...birimMap.values()];

  // blok bazında grupla
  const blokGrup = new Map<string, BirimGrup[]>();
  for (const g of birimler) {
    const anahtar = g.blok_id ?? "_";
    const arr = blokGrup.get(anahtar) ?? [];
    arr.push(g);
    blokGrup.set(anahtar, arr);
  }
  const bloklar = [...blokGrup.entries()]
    .map(([blok_id, liste]) => ({
      blok_id,
      ad: (blok_id === "_" ? null : blokAd.get(blok_id)) ?? "Bloksuz",
      liste: [...liste].sort(
        (a, b) => (a.kat ?? 0) - (b.kat ?? 0) || (a.daire_no ?? "").localeCompare(b.daire_no ?? "", "tr"),
      ),
    }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));

  // özet sayaçları
  const toplamBirim = birimler.length;
  const dagitimda = birimler.filter((g) => g.satabilenler.length > 0).length;
  const kimsesiz = toplamBirim - dagitimda;
  const satildiSay = birimler.filter((g) => g.birim_durum === "satildi").length;

  const hedefMetin = (r: StokDagitimSatir): string => {
    if (r.hedef_tip === "ofis") return ofisAd.get(r.hedef_id ?? "") ?? "Ofis";
    if (r.hedef_tip === "danisman") return danismanAd.get(r.hedef_id ?? "") ?? "Danışman";
    const seg = segmentMetin(r.hedef_filtre);
    return seg ? `Segment: ${seg}` : "Tüm ağa açık";
  };
  const hedefTeal = (r: StokDagitimSatir): boolean =>
    !(r.hedef_tip === "herkes" && segmentMetin(r.hedef_filtre) === "");
  const komisyonMetin = (r: StokDagitimSatir): string => {
    if (r.komisyon_tip === "yuzde") return `%${r.komisyon_deger ?? 0}`;
    if (r.komisyon_tip === "sabit") return `${Number(r.komisyon_deger ?? 0).toLocaleString("tr-TR")}₺`;
    return "belirtilmemiş";
  };

  if (toplamBirim === 0) {
    return (
      <section className="kart p-8 text-center">
        <p className="text-[13px] font-semibold text-ink">Bu projede birim yok</p>
        <p className="mt-1 text-[12.5px] text-gray">
          Önce projeye birim ekle; sonra hangi birimin kime açık olduğunu buradan görürsün.
        </p>
        <Link href={`/uretici/proje/${projeId}`} className="mt-4 inline-block text-[12.5px] font-semibold text-teal hover:underline">
          Projeye git →
        </Link>
      </section>
    );
  }

  return (
    <>
      {/* ÖZET ŞERİT */}
      <section className="kart belir belir-1 mb-5 p-1">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cizgi)] sm:grid-cols-4 sm:divide-y-0">
          <Ozet etiket="Toplam Birim" deger={String(toplamBirim)} alt="ana stok" />
          <Ozet etiket="Dağıtımda" deger={String(dagitimda)} renk="text-teal" alt="en az bir kanal satabiliyor" />
          <Ozet
            etiket="Satılamıyor"
            deger={String(kimsesiz)}
            renk={kimsesiz > 0 ? "text-amber" : "text-ink"}
            alt={kimsesiz > 0 ? "hiçbir tahsis kapsamıyor" : "tüm birimler bir kanalda"}
          />
          <Ozet etiket="Satıldı" deger={String(satildiSay)} renk={satildiSay > 0 ? "text-red" : "text-ink"} alt="kapanan birim" />
        </div>
      </section>

      {/* BLOK BAZINDA BİRİMLER */}
      <div className="belir belir-2 flex flex-col gap-3">
        {bloklar.map((blok) => {
          const blokKimsesiz = blok.liste.filter((g) => g.satabilenler.length === 0).length;
          return (
            <details key={blok.blok_id} className="kart overflow-hidden">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-3">
                <span className="select-none text-gray" aria-hidden>
                  ▸
                </span>
                <span className="font-display text-[15px] font-bold text-ink">{blok.ad}</span>
                <span className="mono rounded-md bg-navy-soft px-2 py-[2px] text-[11px] text-ink-soft">
                  {blok.liste.length} birim
                </span>
                {blokKimsesiz > 0 ? (
                  <span className="rozet bg-amber-soft text-[#9a6a12]">{blokKimsesiz} satılamıyor</span>
                ) : null}
              </summary>

              <div className="border-t border-[var(--cizgi)]">
                {blok.liste.map((g) => {
                  const rozet = BIRIM_DURUM_ROZET[g.birim_durum] ?? {
                    sinif: "bg-navy-soft text-ink-soft",
                    etiket: g.birim_durum,
                  };
                  const konum = [blok.ad, g.kat != null ? `${g.kat}. kat` : null].filter(Boolean).join(" · ");
                  return (
                    <div key={g.birim_id} className="flex flex-col gap-2 border-t border-[var(--cizgi)] px-4 py-3 first:border-t-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-bold text-ink">{g.daire_no ?? "—"}</span>
                        {konum ? <span className="text-[11.5px] text-[var(--ink-faint)]">{konum}</span> : null}
                        <span className={`rozet ${rozet.sinif}`}>{rozet.etiket}</span>
                      </div>

                      {g.satabilenler.length ? (
                        <div className="flex flex-col gap-1.5">
                          {g.satabilenler.map((r) => (
                            <div
                              key={r.tahsis_id}
                              className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--cizgi)] bg-card px-3 py-2"
                            >
                              <span className={`rozet ${hedefTeal(r) ? "bg-teal-soft text-teal" : "bg-navy-soft text-ink-soft"}`}>
                                {hedefMetin(r)}
                              </span>
                              {r.munhasir ? <span className="rozet bg-amber-soft text-[#9a6a12]">Münhasır</span> : null}
                              <span className="mono text-[11.5px] text-ink-soft">Komisyon {komisyonMetin(r)}</span>
                              <Link
                                href={`?proje=${projeId}`}
                                className="ml-auto text-[11.5px] font-semibold text-teal hover:underline"
                              >
                                Düzenle →
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-soft/60 px-3 py-2">
                          <span
                            className="inline-grid size-6 flex-none place-items-center rounded-md bg-amber-soft text-[#9a6a12]"
                            aria-hidden
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <path d="M12 9v4M12 17h.01" />
                            </svg>
                          </span>
                          <span className="text-[12px] text-ink">
                            <b className="font-semibold">Kimse satamıyor.</b>{" "}
                            <span className="text-ink-soft">Bu birimi kapsayan aktif tahsis yok; ağda görünmüyor.</span>
                          </span>
                          <Link
                            href={`?proje=${projeId}`}
                            className="ml-auto text-[11.5px] font-semibold text-teal hover:underline"
                          >
                            Tahsis ekle →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

function Ozet({
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
      <div className={`mono text-[30px] font-semibold leading-none ${renk}`}>{deger}</div>
      {alt ? <div className="mono mt-2 text-[11.5px] text-[var(--ink-faint)]">{alt}</div> : null}
    </div>
  );
}
