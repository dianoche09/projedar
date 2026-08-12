import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tahsisEmlakcilari, tahsisSecenekleri, tahsisOzetGetir, type TahsisOzet } from "@/lib/tahsis";
import { tahsisDurumGuncelle } from "@/app/uretici/actions";
import { zamanOnce } from "@/lib/types";
import { PerspektifToggle } from "./_components/PerspektifToggle";
import { TopluBar } from "./_components/TopluBar";
import { TahsisDuzenleModal } from "./_components/TahsisDuzenleModal";

/* =========================================================
   TAHSİS — Distribution Control Center (MOAT). Hangi kapsam kime açık, komisyon ne.
   İki mercek: tahsis-merkezli (varsayılan) · stok-merkezli (?m=stok). ?proje= ile tek projeye daralt.
   Yaşam döngüsü: aktif · askıda · kaldırıldı (soft). Toplu + edit-in-place tek yönetim otoritesi.
   ========================================================= */

/** Süresi dolacak eşiği (UI sabiti; RLS/DB'de ayrı). */
const SURE_ESIK_GUN = 7;

/** Modül seviyesi sarmalayıcı: server-component render pürlük kuralına takılmadan şimdiki zaman. */
function simdiMs(): number {
  return Date.now();
}

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
  durum: "aktif" | "askida" | "kaldirildi";
  updated_at: string | null;
  updated_by: string | null;
  created_at: string | null;
};

const TUR_AD: Record<string, string> = {
  daire: "Daire",
  ofis: "Ofis",
  dukkan: "Dükkan",
  villa: "Villa",
  depo: "Depo",
  otopark: "Otopark",
};

const DURUM_ROZET: Record<TahsisRaw["durum"], { sinif: string; etiket: string }> = {
  aktif: { sinif: "bg-teal-soft text-teal", etiket: "Aktif" },
  askida: { sinif: "bg-amber-soft text-[#9a6a12]", etiket: "Askıda" },
  kaldirildi: { sinif: "bg-navy-soft text-ink-soft", etiket: "Kaldırıldı" },
};

function komisyonMetin(t: TahsisRaw): string {
  if (t.komisyon_tip === "yok") return "yok";
  if (t.komisyon_tip === "yuzde") return `%${t.komisyon_deger ?? 0}`;
  return `${Number(t.komisyon_deger ?? 0).toLocaleString("tr-TR")}₺`;
}

export default async function UreticiTahsis({
  searchParams,
}: {
  searchParams: Promise<{ proje?: string; m?: string }>;
}) {
  const { proje, m } = await searchParams;
  const mercek: "tahsis" | "stok" = m === "stok" ? "stok" : "tahsis";
  const supabase = await createClient();

  // Proje listesi (filtreliyse tek proje) — her iki mercek de kullanır.
  let projeQ = supabase.from("proje").select("id, ad, il, ilce").order("created_at", { ascending: false });
  if (proje) projeQ = projeQ.eq("id", proje);
  const { data: projeler } = await projeQ;
  const projeAd = new Map((projeler ?? []).map((p) => [p.id, p.ad as string]));

  // ===== STOK MERCEĞİ (ters görünüm — asıl uygulama bir sonraki adımda) =====
  if (mercek === "stok") {
    return (
      <div className="mx-auto max-w-[1640px] px-4 py-6 text-ink sm:px-6">
        <Baslik mercek="stok" proje={proje} projeAdi={proje ? projeAd.get(proje) ?? null : null} />
        {!proje ? (
          <section className="kart p-5">
            <p className="text-[13px] font-semibold text-ink">Ters görünüm için önce bir proje seç</p>
            <p className="mt-1 text-[12.5px] text-gray">
              Stok merceği bir projenin birimlerini tek tek listeler ve her birini kimin satabildiğini gösterir.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {(projeler ?? []).map((p) => (
                <Link
                  key={p.id}
                  href={`?proje=${p.id}&m=stok`}
                  className="flex items-center justify-between rounded-xl border border-[var(--cizgi)] bg-card px-4 py-3 text-[13px] font-semibold text-ink transition-colors hover:border-teal/40"
                >
                  <span>{p.ad}</span>
                  <span className="text-[11.5px] font-normal text-[var(--ink-faint)]">
                    {[p.il, p.ilce].filter(Boolean).join(" · ") || "—"}
                  </span>
                </Link>
              ))}
              {(projeler?.length ?? 0) === 0 ? <p className="text-sm text-[var(--ink-faint)]">Henüz proje yok.</p> : null}
            </div>
          </section>
        ) : (
          <section className="kart p-8 text-center">
            <p className="text-[13px] font-semibold text-ink">Stok merceği bir sonraki adımda</p>
            <p className="mt-1 text-[12.5px] text-gray">
              {projeAd.get(proje) ?? "Proje"} birimleri ters indekste (birim → satabilenler) burada listelenecek.
            </p>
            <Link href={`?proje=${proje}`} className="mt-4 inline-block text-[12.5px] font-semibold text-teal hover:underline">
              Tahsis merceğine dön →
            </Link>
          </section>
        )}
      </div>
    );
  }

  // ===== TAHSİS MERCEĞİ =====
  let tahsisQ = supabase
    .from("tahsis")
    .select(
      "id, proje_id, kapsam, hedef_tip, hedef_id, hedef_filtre, munhasir, kontenjan, fiyat_gorunur, komisyon_tip, komisyon_deger, bitis, durum, updated_at, updated_by, created_at",
    );
  if (proje) tahsisQ = tahsisQ.eq("proje_id", proje);

  // Modal kapsam seçenekleri (proje filtresi varsa daraltılır).
  let blokQ = supabase.from("blok").select("id, ad, proje_id");
  let tipQ = supabase.from("daire_tipi").select("id, ad, oda, proje_id");
  let birimQ = supabase.from("birim").select("id, daire_no, blok_id, kat, proje_id").is("ana_birim_id", null);
  if (proje) {
    blokQ = blokQ.eq("proje_id", proje);
    tipQ = tipQ.eq("proje_id", proje);
    birimQ = birimQ.eq("proje_id", proje);
  }

  const [{ data: tahsisRaw }, { data: ofisler }, { data: bloklar }, { data: tipler }, { data: birimler }, emlakcilar, secenekler] =
    await Promise.all([
      tahsisQ,
      supabase.from("ofis").select("id, ad"),
      blokQ,
      tipQ,
      birimQ,
      tahsisEmlakcilari(),
      tahsisSecenekleri(),
    ]);

  const tahsisler = (tahsisRaw ?? []) as TahsisRaw[];
  const ofisAd = new Map((ofisler ?? []).map((o) => [o.id, o.ad as string]));
  const blokAd = new Map((bloklar ?? []).map((b) => [b.id, b.ad as string | null]));
  const tipAd = new Map((tipler ?? []).map((t) => [t.id, ((t.oda as string | null) ?? (t.ad as string | null)) ?? "Tip"]));
  const danismanAd = new Map(emlakcilar.map((e) => [e.id, e.ad]));

  // Modal için proje-bazlı kapsam seçenekleri.
  const projeBloklar = new Map<string, { id: string; ad: string | null }[]>();
  for (const b of bloklar ?? []) {
    const arr = projeBloklar.get(b.proje_id as string) ?? [];
    arr.push({ id: b.id as string, ad: b.ad as string | null });
    projeBloklar.set(b.proje_id as string, arr);
  }
  const projeTipler = new Map<string, { id: string; ad: string | null; oda: string | null }[]>();
  for (const t of tipler ?? []) {
    const arr = projeTipler.get(t.proje_id as string) ?? [];
    arr.push({ id: t.id as string, ad: t.ad as string | null, oda: t.oda as string | null });
    projeTipler.set(t.proje_id as string, arr);
  }
  const projeBirimler = new Map<string, { id: string; daire_no: string | null; blok_id: string | null; kat: number | null }[]>();
  const projeKatSet = new Map<string, Set<number>>();
  for (const b of birimler ?? []) {
    const pid = b.proje_id as string;
    const arr = projeBirimler.get(pid) ?? [];
    arr.push({ id: b.id as string, daire_no: b.daire_no as string | null, blok_id: b.blok_id as string | null, kat: b.kat as number | null });
    projeBirimler.set(pid, arr);
    if (b.kat != null) {
      const s = projeKatSet.get(pid) ?? new Set<number>();
      s.add(b.kat as number);
      projeKatSet.set(pid, s);
    }
  }

  // Stok sayaç + değişiklik (RPC) — görünen her proje için.
  const ozetPar = await Promise.all((projeler ?? []).map((p) => tahsisOzetGetir(p.id)));
  const projeOzet = new Map<string, Map<string, TahsisOzet>>();
  (projeler ?? []).forEach((p, i) => projeOzet.set(p.id, ozetPar[i]));

  const now = simdiMs();
  const suresiDolduMu = (t: TahsisRaw) => !!t.bitis && new Date(t.bitis).getTime() <= now;
  const gorunurMu = (t: TahsisRaw) => t.durum === "aktif" && !suresiDolduMu(t);
  const kalanGun = (t: TahsisRaw) => (t.bitis ? Math.ceil((new Date(t.bitis).getTime() - now) / 86_400_000) : null);
  const suresiDolacakMi = (t: TahsisRaw) => {
    const g = kalanGun(t);
    return gorunurMu(t) && g !== null && g > 0 && g <= SURE_ESIK_GUN;
  };

  // proje_id → tahsis listesi
  const projeTahsis = new Map<string, TahsisRaw[]>();
  for (const t of tahsisler) {
    const arr = projeTahsis.get(t.proje_id) ?? [];
    arr.push(t);
    projeTahsis.set(t.proje_id, arr);
  }

  const segmentMetin = (f: TahsisRaw["hedef_filtre"]): string => {
    if (!f) return "";
    return [f.marka, f.ilce, f.il, f.uzmanlik].filter(Boolean).join(" · ");
  };
  const segmentMi = (t: TahsisRaw): boolean => t.hedef_tip === "herkes" && segmentMetin(t.hedef_filtre) !== "";
  const hedefMetin = (t: TahsisRaw): string => {
    if (t.hedef_tip === "herkes") {
      const seg = segmentMetin(t.hedef_filtre);
      return seg ? `Segment: ${seg}` : "Tüm ağa açık";
    }
    if (t.hedef_tip === "ofis") return ofisAd.get(t.hedef_id ?? "") ?? "Ofis";
    return danismanAd.get(t.hedef_id ?? "") ?? "Danışman";
  };
  const kapsamMetin = (t: TahsisRaw): string => {
    const parcalar: string[] = [];
    const bloklarAd = (t.kapsam?.bloklar ?? []).map((bid) => blokAd.get(bid) ?? "?").filter(Boolean);
    if (bloklarAd.length) parcalar.push(`${bloklarAd.join(", ")} blok`);
    const katlar = t.kapsam?.katlar ?? [];
    if (katlar.length) parcalar.push(`Kat ${katlar.join(", ")}`);
    const tiplerK = t.kapsam?.tipler ?? [];
    if (tiplerK.length) parcalar.push(`${tiplerK.map((id) => tipAd.get(id) ?? "Tip").join(", ")}`);
    const turler = t.kapsam?.turler ?? [];
    if (turler.length) parcalar.push(`${turler.map((tr) => TUR_AD[tr] ?? tr).join(", ")}`);
    const birimlerK = t.kapsam?.birimler ?? [];
    if (birimlerK.length) parcalar.push(`${birimlerK.length} daire (seçili)`);
    return parcalar.length ? parcalar.join(" · ") : "Tüm proje";
  };
  const erisimOzet = (liste: TahsisRaw[]): string => {
    const aktif = liste.filter(gorunurMu);
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

  // KPI'lar
  const toplamTahsis = tahsisler.filter((t) => t.durum !== "kaldirildi").length;
  const tahsisliProje = new Set(tahsisler.filter(gorunurMu).map((t) => t.proje_id)).size;
  const askidaSay = tahsisler.filter((t) => t.durum === "askida").length;
  const suresiDolacakSay = tahsisler.filter(suresiDolacakMi).length;
  const munhasirSay = tahsisler.filter((t) => gorunurMu(t) && t.munhasir).length;
  const kapsamDisi = (projeler?.length ?? 0) - tahsisliProje;

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-6 text-ink sm:px-6">
      <Baslik mercek="tahsis" proje={proje} projeAdi={proje ? projeAd.get(proje) ?? null : null} />

      {/* KPI ŞERİDİ */}
      <section className="kart belir belir-1 mb-5 p-1">
        <div className="grid grid-cols-2 divide-x divide-y divide-[var(--cizgi)] sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
          <Kpi etiket="Toplam Tahsis" deger={String(toplamTahsis)} alt="dağıtım kuralı" />
          <Kpi etiket="Dağıtımda" deger={String(tahsisliProje)} alt="proje paylaşımda" />
          <Kpi
            etiket="Askıda"
            deger={String(askidaSay)}
            renk={askidaSay > 0 ? "text-amber" : "text-ink"}
            alt={askidaSay > 0 ? "geçici durduruldu" : "askıda tahsis yok"}
          />
          <Kpi
            etiket="Süresi Dolacak"
            deger={String(suresiDolacakSay)}
            renk={suresiDolacakSay > 0 ? "text-amber" : "text-ink"}
            alt={`${SURE_ESIK_GUN} gün içinde biter`}
          />
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
          const aktifListe = liste.filter(gorunurMu);
          const ozet = projeOzet.get(p.id);
          const kapsamOfis = projeBloklar.get(p.id) ?? [];
          const kapsamTip = projeTipler.get(p.id) ?? [];
          const kapsamBirim = projeBirimler.get(p.id) ?? [];
          const kapsamKat = [...(projeKatSet.get(p.id) ?? new Set<number>())].sort((a, b) => a - b);
          return (
            <section key={p.id} className="kart overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cizgi)] px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-[16px] font-bold text-ink">{p.ad}</h2>
                  <span className="text-[11.5px] text-[var(--ink-faint)]">
                    {[p.il, p.ilce].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="mono rounded-md bg-navy-soft px-2 py-[2px] text-[11px] text-ink-soft">
                    {liste.length} tahsis
                  </span>
                  <span className={`rozet ${aktifListe.length ? "bg-teal-soft text-teal" : "bg-amber-soft text-[#9a6a12]"}`}>
                    {erisimOzet(liste)}
                  </span>
                </div>
                <Link href={`/uretici/proje/${p.id}`} className="text-[12px] font-semibold text-teal hover:underline">
                  Projeye git →
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
                <>
                  <div className="overflow-x-auto">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="w-8" />
                          <th>Durum</th>
                          <th>Hedef</th>
                          <th>Kapsam</th>
                          <th>Stok</th>
                          <th>Komisyon</th>
                          <th>Münhasır</th>
                          <th className="text-right">Kontenjan</th>
                          <th>Fiyat</th>
                          <th>Son yönetim</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {liste.map((t) => {
                          const kaldirildi = t.durum === "kaldirildi";
                          const suresiDoldu = t.durum === "aktif" && suresiDolduMu(t);
                          const dolacak = suresiDolacakMi(t);
                          const o = ozet?.get(t.id);
                          const rozet = DURUM_ROZET[t.durum];
                          const gun = kalanGun(t);
                          return (
                            <tr key={t.id} className={kaldirildi ? "opacity-45" : undefined}>
                              <td>
                                {kaldirildi ? null : (
                                  <input
                                    type="checkbox"
                                    name="tahsis_ids"
                                    value={t.id}
                                    form={`toplu-${p.id}`}
                                    className="size-4 accent-teal"
                                    aria-label="Tahsisi seç"
                                  />
                                )}
                              </td>
                              <td>
                                <span className={`rozet ${rozet.sinif}`}>{rozet.etiket}</span>
                                {suresiDoldu ? <span className="rozet ml-1.5 bg-red-soft text-red">Süresi doldu</span> : null}
                                {dolacak && gun !== null ? (
                                  <span className="rozet ml-1.5 bg-amber-soft text-[#9a6a12]">{gun} gün kaldı</span>
                                ) : null}
                              </td>
                              <td>
                                <span
                                  className={`rozet ${
                                    t.hedef_tip === "herkes" && !segmentMi(t) ? "bg-navy-soft text-ink-soft" : "bg-teal-soft text-teal"
                                  }`}
                                >
                                  {hedefMetin(t)}
                                </span>
                              </td>
                              <td className="text-[12.5px] text-ink-soft">{kapsamMetin(t)}</td>
                              <td>
                                {o && o.toplam > 0 ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="mono text-[12.5px]" title="müsait · opsiyonlu · satıldı">
                                      {o.musait} · {o.opsiyonlu} · {o.satildi}
                                    </span>
                                    {o.degisiklik > 0 ? (
                                      <span className="rozet w-fit bg-amber-soft text-[11px] text-[#9a6a12]" title="son yönetimden beri">
                                        ↑{o.degisiklik} değişti
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-[12.5px] text-[var(--ink-faint)]">—</span>
                                )}
                              </td>
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
                              <td className="text-[12px] text-[var(--ink-faint)]">
                                {t.updated_at ? zamanOnce(t.updated_at) : "—"}
                              </td>
                              <td>
                                {kaldirildi ? (
                                  <span className="text-[11.5px] font-medium text-[var(--ink-faint)]">Kaldırıldı</span>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <TahsisDuzenleModal
                                      tahsis={{
                                        id: t.id,
                                        proje_id: t.proje_id,
                                        hedef_tip: t.hedef_tip,
                                        hedef_id: t.hedef_id,
                                        hedef_filtre: t.hedef_filtre,
                                        kapsam: t.kapsam,
                                        komisyon_tip: t.komisyon_tip,
                                        komisyon_deger: t.komisyon_deger,
                                        munhasir: t.munhasir,
                                        kontenjan: t.kontenjan,
                                        fiyat_gorunur: t.fiyat_gorunur,
                                        bitis: t.bitis,
                                      }}
                                      bloklar={kapsamOfis}
                                      katlar={kapsamKat}
                                      tipler={kapsamTip}
                                      birimler={kapsamBirim}
                                      ofisler={(ofisler ?? []).map((o2) => ({ id: o2.id as string, ad: o2.ad as string }))}
                                      secenekler={secenekler}
                                      emlakciAd={t.hedef_tip === "danisman" ? danismanAd.get(t.hedef_id ?? "") ?? null : null}
                                    />
                                    {t.durum === "aktif" ? (
                                      <DurumButon tahsisId={t.id} projeId={t.proje_id} hedef="askida" etiket="Askıya al" />
                                    ) : (
                                      <DurumButon tahsisId={t.id} projeId={t.proje_id} hedef="aktif" etiket="Devam" />
                                    )}
                                    <DurumButon tahsisId={t.id} projeId={t.proje_id} hedef="kaldirildi" etiket="Kaldır" tehlike />
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <TopluBar projeId={p.id} />
                </>
              )}
            </section>
          );
        })}

        {(projeler?.length ?? 0) === 0 ? (
          <div className="kart p-10 text-center">
            <p className="text-sm font-bold text-[var(--ink-faint)]">
              {proje ? "Bu filtreye uygun proje yok." : "Henüz proje yok."}
            </p>
            <Link
              href={proje ? "?" : "/uretici/proje/yeni"}
              className="mt-3 inline-block text-sm font-bold text-teal hover:underline"
            >
              {proje ? "Filtreyi temizle →" : "İlk projeni oluştur →"}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Küçük durum-geçiş formu (askıya al / devam / kaldır). Ayrı form = iç içe form YOK. */
function DurumButon({
  tahsisId,
  projeId,
  hedef,
  etiket,
  tehlike = false,
}: {
  tahsisId: string;
  projeId: string;
  hedef: "aktif" | "askida" | "kaldirildi";
  etiket: string;
  tehlike?: boolean;
}) {
  return (
    <form action={tahsisDurumGuncelle}>
      <input type="hidden" name="tahsis_id" value={tahsisId} />
      <input type="hidden" name="proje_id" value={projeId} />
      <input type="hidden" name="yeni_durum" value={hedef} />
      <button
        type="submit"
        className={`rounded-lg border px-2.5 py-[5px] text-[11px] font-semibold transition-colors ${
          tehlike
            ? "border-[var(--cizgi-2)] text-gray hover:border-red hover:bg-red-soft hover:text-red"
            : "border-[var(--cizgi-2)] text-ink-soft hover:border-teal hover:bg-teal-soft hover:text-teal"
        }`}
      >
        {etiket}
      </button>
    </form>
  );
}

function Baslik({
  mercek,
  proje,
  projeAdi,
}: {
  mercek: "tahsis" | "stok";
  proje?: string;
  projeAdi: string | null;
}) {
  return (
    <header className="belir mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Tahsis</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-2.5 py-[5px] text-[11.5px] font-semibold text-teal">
            <span className="inline-block size-[7px] rounded-full bg-teal" aria-hidden />
            Dağıtım ağı
          </span>
        </div>
        <PerspektifToggle aktif={mercek} projeId={proje} />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-[12.5px] text-[var(--ink-faint)]">
          Kim neyi görür, burada belirlenir. Danışman yalnız kendisine tahsisli birimleri görür; tahsissiz proje ağda kimseye görünmez.
        </p>
        {proje ? (
          <Link
            href={mercek === "stok" ? "?m=stok" : "?"}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-soft px-2.5 py-[3px] text-[11.5px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            {projeAdi ?? "Proje"} · filtreyi temizle ✕
          </Link>
        ) : null}
      </div>
    </header>
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
