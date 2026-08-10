import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tahsisEmlakcilari } from "@/lib/tahsis";

/* =========================================================
   TAHSİS — dağıtım ağı (MOAT). Hangi kapsam kime açık, komisyon ne.
   Emlakçı yalnız tahsisli + satılabilir birimi görür/satar.
   Proje bazlı gruplu tablo. Her satır → /uretici/proje/[id].
   ========================================================= */

type TahsisRaw = {
  id: string;
  proje_id: string;
  kapsam: {
    bloklar?: string[];
    katlar?: (string | number)[];
    tipler?: string[];
    turler?: string[];
    birimler?: string[];
  } | null;
  hedef_tip: "herkes" | "ofis" | "danisman";
  hedef_id: string | null;
  hedef_filtre: { marka?: string; il?: string; ilce?: string; uzmanlik?: string } | null;
  munhasir: boolean | null;
  kontenjan: number | null;
  fiyat_gorunur: boolean | null;
  komisyon_tip: "yuzde" | "sabit" | "yok";
  komisyon_deger: number | null;
  bitis: string | null;
};

const TUR_AD: Record<string, string> = {
  daire: "Daire",
  ofis: "Ofis",
  dukkan: "Dükkan",
  villa: "Villa",
  depo: "Depo",
  otopark: "Otopark",
};

/** Süresi dolmuş tahsis emlakçıya (RLS) görünmez → müteahhit panelinde de "aktif" sayılmamalı.
    Modül seviyesinde: server-component render pürlük kuralına takılmadan Date.now kullanılır. */
function tahsisAktifMi(t: TahsisRaw): boolean {
  return !t.bitis || new Date(t.bitis).getTime() > Date.now();
}

function komisyonMetin(t: TahsisRaw): string {
  if (t.komisyon_tip === "yok") return "yok";
  if (t.komisyon_tip === "yuzde") return `%${t.komisyon_deger ?? 0}`;
  return `${Number(t.komisyon_deger ?? 0).toLocaleString("tr-TR")}₺`;
}

export default async function UreticiTahsis() {
  const supabase = await createClient();

  const [{ data: projeler }, { data: tahsisRaw }, { data: ofisler }, { data: bloklar }, { data: tipler }] =
    await Promise.all([
      supabase.from("proje").select("id, ad, il, ilce").order("created_at", { ascending: false }),
      supabase
        .from("tahsis")
        .select(
          "id, proje_id, kapsam, hedef_tip, hedef_id, hedef_filtre, munhasir, kontenjan, fiyat_gorunur, komisyon_tip, komisyon_deger, bitis",
        ),
      supabase.from("ofis").select("id, ad"),
      supabase.from("blok").select("id, ad"),
      supabase.from("daire_tipi").select("id, ad, oda"),
    ]);
  // Danışman adları: profiles_self RLS engeli → admin client (server-only)
  const emlakcilar = await tahsisEmlakcilari();

  const tahsisler = (tahsisRaw ?? []) as TahsisRaw[];
  const ofisAd = new Map((ofisler ?? []).map((o) => [o.id, o.ad as string]));
  const blokAd = new Map((bloklar ?? []).map((b) => [b.id, b.ad as string | null]));
  const tipAd = new Map((tipler ?? []).map((t) => [t.id, ((t.oda as string | null) ?? (t.ad as string | null)) ?? "Tip"]));
  const danismanAd = new Map(emlakcilar.map((e) => [e.id, e.ad]));
  const aktifMi = tahsisAktifMi;

  // proje_id → tahsis listesi
  const projeTahsis = new Map<string, TahsisRaw[]>();
  for (const t of tahsisler) {
    const arr = projeTahsis.get(t.proje_id) ?? [];
    arr.push(t);
    projeTahsis.set(t.proje_id, arr);
  }

  /** hedef_filtre → okunur segment metni (marka/il/ilçe/uzmanlık). */
  const segmentMetin = (f: TahsisRaw["hedef_filtre"]): string => {
    if (!f) return "";
    return [f.marka, f.ilce, f.il, f.uzmanlik].filter(Boolean).join(" · ");
  };

  const hedefMetin = (t: TahsisRaw): string => {
    if (t.hedef_tip === "herkes") {
      const seg = segmentMetin(t.hedef_filtre);
      return seg ? `Segment: ${seg}` : "Tüm ağa açık";
    }
    if (t.hedef_tip === "ofis") return ofisAd.get(t.hedef_id ?? "") ?? "Ofis";
    return danismanAd.get(t.hedef_id ?? "") ?? "Danışman";
  };
  /** Segment (kısıtlı herkes) mü — rozet rengi/beyan için. */
  const segmentMi = (t: TahsisRaw): boolean =>
    t.hedef_tip === "herkes" && segmentMetin(t.hedef_filtre) !== "";

  const kapsamMetin = (t: TahsisRaw): string => {
    const parcalar: string[] = [];
    const bloklarAd = (t.kapsam?.bloklar ?? []).map((bid) => blokAd.get(bid) ?? "?").filter(Boolean);
    if (bloklarAd.length) parcalar.push(`${bloklarAd.join(", ")} blok`);
    const katlar = t.kapsam?.katlar ?? [];
    if (katlar.length) parcalar.push(`Kat ${katlar.join(", ")}`);
    const tipler = t.kapsam?.tipler ?? [];
    if (tipler.length) parcalar.push(`${tipler.map((id) => tipAd.get(id) ?? "Tip").join(", ")}`);
    const turler = t.kapsam?.turler ?? [];
    if (turler.length) parcalar.push(`${turler.map((tr) => TUR_AD[tr] ?? tr).join(", ")}`);
    const birimler = t.kapsam?.birimler ?? [];
    if (birimler.length) parcalar.push(`${birimler.length} daire (seçili)`);
    return parcalar.length ? parcalar.join(" · ") : "Tüm proje";
  };

  /** Proje başına erişim özeti: kim görüyor? (yalnız AKTİF tahsisler) */
  const erisimOzet = (liste: TahsisRaw[]): string => {
    const aktif = liste.filter(aktifMi);
    // "Tüm ağa açık" yalnız FİLTRESİZ herkes tahsisi varsa (segment değil)
    if (aktif.some((t) => t.hedef_tip === "herkes" && !segmentMi(t))) return "Tüm ağa açık";
    const segSay = aktif.filter(segmentMi).length;
    const ofisSay = new Set(aktif.filter((t) => t.hedef_tip === "ofis").map((t) => t.hedef_id)).size;
    const danSay = new Set(aktif.filter((t) => t.hedef_tip === "danisman").map((t) => t.hedef_id)).size;
    const p: string[] = [];
    if (segSay) p.push(`${segSay} segment`);
    if (ofisSay) p.push(`${ofisSay} ofis`);
    if (danSay) p.push(`${danSay} danışman`);
    return p.length ? `${p.join(" · ")} görüyor` : "Kimse görmüyor";
  };

  const aktifTahsisler = tahsisler.filter(aktifMi);
  const toplamTahsis = aktifTahsisler.length;
  // Dağıtımda = en az bir AKTİF tahsisi olan proje
  const tahsisliProje = new Set(aktifTahsisler.map((t) => t.proje_id)).size;
  const munhasirSay = aktifTahsisler.filter((t) => t.munhasir).length;
  const kapsamDisi = (projeler?.length ?? 0) - tahsisliProje;

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Tahsis</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-2.5 py-[5px] text-[11.5px] font-semibold text-teal">
            <span className="inline-block size-[7px] rounded-full bg-teal" aria-hidden />
            Dağıtım ağı
          </span>
        </div>
        <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
          Kim neyi görür, burada belirlenir. Danışman yalnız kendisine tahsisli birimleri görür;
          tahsissiz proje ağda kimseye görünmez.
        </p>
      </header>

      {/* KPI ŞERİDİ */}
      <section className="kart belir belir-1 mb-5 p-1">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cizgi)] sm:grid-cols-4 sm:divide-y-0">
          <Kpi etiket="Toplam Tahsis" deger={String(toplamTahsis)} alt="dağıtım kuralı" />
          <Kpi etiket="Dağıtımda" deger={String(tahsisliProje)} alt="proje paylaşımda" />
          <Kpi etiket="Münhasır" deger={String(munhasirSay)} renk="text-teal" alt="tek-kanal tahsis" />
          <Kpi
            etiket="Kapsam Dışı"
            deger={String(Math.max(0, kapsamDisi))}
            renk={kapsamDisi > 0 ? "text-amber" : "text-ink"}
            alt={kapsamDisi > 0 ? "proje kimseye görünmüyor" : "tüm projeler dağıtımda"}
          />
        </div>
      </section>

      <div className="belir belir-2 flex flex-col gap-5">
        {(projeler ?? []).map((p) => {
          const liste = projeTahsis.get(p.id) ?? [];
          const aktifListe = liste.filter(aktifMi);
          return (
            <section key={p.id} className="kart overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cizgi)] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-[16px] font-bold text-ink">{p.ad}</h2>
                  <span className="text-[11.5px] text-[var(--ink-faint)]">
                    {[p.il, p.ilce].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="mono rounded-md bg-navy-soft px-2 py-[2px] text-[11px] text-ink-soft">
                    {liste.length} tahsis
                  </span>
                  <span
                    className={`rozet ${aktifListe.length ? "bg-teal-soft text-teal" : "bg-amber-soft text-[#9a6a12]"}`}
                  >
                    {erisimOzet(liste)}
                  </span>
                </div>
                <Link
                  href={`/uretici/proje/${p.id}`}
                  className="text-[12px] font-semibold text-teal hover:underline"
                >
                  Tahsis yönet →
                </Link>
              </div>

              {liste.length === 0 ? (
                <div className="flex flex-wrap items-center gap-3 bg-[var(--color-amber-soft)]/50 px-5 py-5">
                  <span className="inline-grid size-8 flex-none place-items-center rounded-lg bg-amber-soft text-[#9a6a12]" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                  </span>
                  <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink">
                    <b className="font-semibold">Bu proje henüz kimseye tahsisli değil.</b>{" "}
                    <span className="text-ink-soft">Ağda hiçbir danışman göremiyor; stok satışa kapalı bekliyor.</span>
                  </p>
                  <Link href={`/uretici/proje/${p.id}`} className="btn-action h-9 flex-none px-3.5 text-[12px]">
                    Tahsis ekle →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Hedef</th>
                        <th>Kapsam</th>
                        <th>Komisyon</th>
                        <th>Münhasır</th>
                        <th className="text-right">Kontenjan</th>
                        <th>Fiyat</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {liste.map((t) => {
                        const suresiDoldu = !aktifMi(t);
                        return (
                        <tr key={t.id} className={suresiDoldu ? "opacity-45" : undefined}>
                          <td>
                            <span
                              className={`rozet ${
                                t.hedef_tip === "herkes" && !segmentMi(t)
                                  ? "bg-navy-soft text-ink-soft"
                                  : "bg-teal-soft text-teal"
                              }`}
                            >
                              {hedefMetin(t)}
                            </span>
                            {suresiDoldu ? (
                              <span className="rozet ml-1.5 bg-red-soft text-red">Süresi doldu</span>
                            ) : null}
                          </td>
                          <td className="text-[12.5px] text-ink-soft">{kapsamMetin(t)}</td>
                          <td className="mono">{komisyonMetin(t)}</td>
                          <td>
                            {t.munhasir ? (
                              <span className="rozet bg-amber-soft text-[#9a6a12]">Münhasır</span>
                            ) : (
                              <span className="rozet bg-navy-soft text-ink-soft">Paylaşımlı</span>
                            )}
                          </td>
                          <td className="mono text-right">{t.kontenjan ?? "—"}</td>
                          <td>
                            {t.fiyat_gorunur ? (
                              <span className="rozet bg-green-soft text-[#1f7d4c]">Görünür</span>
                            ) : (
                              <span className="rozet bg-navy-soft text-ink-soft">Gizli</span>
                            )}
                          </td>
                          <td>
                            <Link
                              href={`/uretici/proje/${t.proje_id}`}
                              className="btn-action h-auto min-h-0 px-2.5 py-[5px] text-[11px]"
                            >
                              Düzenle
                            </Link>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}

        {(projeler?.length ?? 0) === 0 ? (
          <div className="kart p-10 text-center">
            <p className="text-sm font-bold text-[var(--ink-faint)]">Henüz proje yok.</p>
            <Link href="/uretici/proje/yeni" className="mt-3 inline-block text-sm font-bold text-teal hover:underline">
              İlk projeni oluştur →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
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
      <div className={`mono text-[30px] font-semibold leading-none ${renk}`}>{deger}</div>
      {alt ? <div className="mono mt-2 text-[11.5px] text-[var(--ink-faint)]">{alt}</div> : null}
    </div>
  );
}
