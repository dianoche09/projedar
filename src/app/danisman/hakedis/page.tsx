import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { zamanOnce } from "@/lib/types";

/* =========================================================
   HAKEDİŞ GÖRÜNÜMÜ (danışman) — /uretici/hakedis'in danışman aynası (N4).
   DEĞİŞMEZ: Projedar satışa aracılık ETMEZ, komisyondan pay ALMAZ, ödeme/alacak
   defteri TUTMAZ. SALT BİLGİ, iki durum:
     • Potansiyel  = opsiyonladığın, henüz satılmamış daireler (tahmini, değişebilir)
     • Hesaplanan  = satışı kapanan dairelerde müteahhit tahsisinden hesaplanan hakediş
   "Ödendi" durumu YOKTUR — ödeme müteahhit ile aranızda gerçekleşir. Tutar canlı
   hesaplanır (birim_satici_kazanci, authz p_satici=auth.uid()); saklanmaz. RLS
   opsiyon_select → yalnız kendi opsiyonların (satici_id=auth.uid()).
   ========================================================= */

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

type BirimJoin = {
  id: string;
  daire_no: string | null;
  para_birimi: string | null;
  durum: string | null;
  proje: { ad: string | null } | null;
} | null;
type OpsSatir = { birim_id: string; durum: string; sonuc: string | null; sonuc_at: string | null; birim: BirimJoin };

export default async function DanismanHakedis() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Kendi opsiyonların (RLS): aktif opsiyon (potansiyel) veya kapanmış satış (hesaplanan)
  const { data: opsRaw } = await supabase
    .from("opsiyon")
    .select("birim_id, durum, sonuc, sonuc_at, birim:birim_id(id, daire_no, para_birimi, durum, proje:proje_id(ad))")
    .eq("satici_id", user.id)
    .or("durum.in.(opsiyonlu,satis_beklemede),sonuc.eq.satildi");
  const ops = (opsRaw ?? []) as unknown as OpsSatir[];

  if (ops.length === 0) return <BosDurum />;

  // Kazanç canlı hesap (RPC authz p_satici=auth.uid())
  const birimIds = [...new Set(ops.map((o) => o.birim_id))];
  const kazancMap = new Map<string, number | null>();
  await Promise.all(
    birimIds.map(async (id) => {
      const { data } = await supabase.rpc("birim_satici_kazanci", { p_birim_id: id, p_satici: user.id });
      kazancMap.set(id, typeof data === "number" ? data : null);
    }),
  );

  // Potansiyel = aktif opsiyon, birim satılmamış · Hesaplanan = sonuc='satildi'
  const potansiyel = ops.filter(
    (o) => (o.durum === "opsiyonlu" || o.durum === "satis_beklemede") && o.birim?.durum !== "satildi",
  );
  const hesaplanan = ops.filter((o) => o.sonuc === "satildi");

  const toplam = (rows: OpsSatir[]) => {
    const m = new Map<string, number>();
    const seen = new Set<string>();
    for (const o of rows) {
      if (seen.has(o.birim_id)) continue;
      seen.add(o.birim_id);
      const k = kazancMap.get(o.birim_id);
      if (k == null) continue;
      const p = o.birim?.para_birimi ?? "TRY";
      m.set(p, (m.get(p) ?? 0) + k);
    }
    return m;
  };
  const metin = (m: Map<string, number>) =>
    m.size === 0 ? "—" : [...m.entries()].map(([p, t]) => `${fmt(t)} ${PARA_SIMGE[p] ?? p}`).join(" · ");

  const potMetin = metin(toplam(potansiyel));
  const hesMetin = metin(toplam(hesaplanan));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-6">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Hakedişim</h1>
        <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
          Opsiyonladığın ve sattığın dairelerdeki hakediş. Tutarlar müteahhitin liste fiyatı ve tanımladığı tahsis
          komisyonundan canlı hesaplanır, bilgilendirme amaçlıdır. Projedar satış komisyonundan pay almaz, ödemeye taraf
          değildir ve ödeme takibi tutmaz; ödeme müteahhit ile aranızda gerçekleşir.
        </p>
      </header>

      {/* KPI şerit — potansiyel vs hesaplanan (asla "ödenecek/alacak" değil) */}
      <section className="kart belir belir-1 mb-6 p-1 sm:max-w-[560px]">
        <div className="grid grid-cols-2 divide-x divide-[var(--cizgi)]">
          <div className="px-5 py-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Potansiyel (tahmini)
            </div>
            <div className="mono text-[26px] font-semibold leading-none text-amber">{potMetin}</div>
          </div>
          <div className="px-5 py-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Kapanan satışta hesaplanan
            </div>
            <div className="mono text-[26px] font-semibold leading-none text-teal">{hesMetin}</div>
          </div>
        </div>
      </section>

      {/* Potansiyel: opsiyonladığın, satılmamış */}
      <section className="belir belir-2 mb-6">
        <h2 className="mb-2 text-[13px] font-bold text-ink">Potansiyel hakediş</h2>
        <p className="mb-3 text-[12px] text-ink-soft">
          Opsiyonladığın, henüz satılmamış dairelerde satış kapanırsa hesaplanabilecek tahmini hakediş. Kesinleşmiş
          değildir, satış kapanana kadar değişebilir.
        </p>
        {potansiyel.length === 0 ? (
          <div className="kart p-6 text-center text-[13px] text-ink-soft">Aktif opsiyonun yok.</div>
        ) : (
          <div className="kart overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Proje</th>
                    <th>Daire</th>
                    <th>Durum</th>
                    <th>Tahmini hakediş</th>
                  </tr>
                </thead>
                <tbody>
                  {potansiyel.map((o) => {
                    const k = kazancMap.get(o.birim_id);
                    const ps = PARA_SIMGE[o.birim?.para_birimi ?? "TRY"] ?? "₺";
                    return (
                      <tr key={`p-${o.birim_id}`}>
                        <td className="font-semibold text-ink">{o.birim?.proje?.ad ?? "—"}</td>
                        <td className="mono font-semibold">{o.birim?.daire_no ?? "—"}</td>
                        <td className="text-ink-soft">{o.durum === "satis_beklemede" ? "Satış bekliyor" : "Opsiyonlu"}</td>
                        <td className="mono font-semibold text-navy">{k != null ? `${fmt(k)} ${ps}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Hesaplanan: kapanan satışlar */}
      <section className="belir belir-3">
        <h2 className="mb-2 text-[13px] font-bold text-ink">Kapanan satışlarda hesaplanan hakediş</h2>
        <p className="mb-3 text-[12px] text-ink-soft">
          Satışı kapanan dairelerde müteahhitin tanımladığı tahsis komisyonundan hesaplanan hakediş tutarın. Ödeme,
          müteahhit ile aranızda gerçekleşir.
        </p>
        {hesaplanan.length === 0 ? (
          <div className="kart p-6 text-center text-[13px] text-ink-soft">Henüz kapanan satışın yok.</div>
        ) : (
          <div className="kart overflow-hidden">
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Proje</th>
                    <th>Daire</th>
                    <th>Satış tarihi</th>
                    <th>Hesaplanan hakediş</th>
                  </tr>
                </thead>
                <tbody>
                  {hesaplanan.map((o) => {
                    const k = kazancMap.get(o.birim_id);
                    const ps = PARA_SIMGE[o.birim?.para_birimi ?? "TRY"] ?? "₺";
                    return (
                      <tr key={`h-${o.birim_id}`}>
                        <td className="font-semibold text-ink">{o.birim?.proje?.ad ?? "—"}</td>
                        <td className="mono font-semibold">{o.birim?.daire_no ?? "—"}</td>
                        <td className="mono text-ink-soft">{o.sonuc_at ? zamanOnce(o.sonuc_at) : "—"}</td>
                        <td className="mono font-semibold text-navy">{k != null ? `${fmt(k)} ${ps}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <p className="mt-6 text-center text-[11.5px] text-[var(--ink-faint)]">
        Tutarlar bilgilendirme amaçlıdır; müteahhitin liste fiyatı ve tanımladığı tahsis komisyonundan hesaplanır.
        Projedar bu tutarı tahsil etmez, saklamaz, ödemeye taraf değildir.
      </p>
    </div>
  );
}

function BosDurum() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
      <div className="kart belir belir-2 p-14 text-center">
        <p className="text-[14px] font-bold text-ink">Henüz hakediş yok</p>
        <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-ink-soft">
          Bir daireyi opsiyonladığında tahmini hakedişin, satış kapandığında hesaplanan hakedişin burada listelenir.
        </p>
        <Link href="/danisman/opsiyonlarim" className="mt-5 inline-block text-[13px] font-semibold text-teal hover:underline">
          Opsiyonlarıma git →
        </Link>
      </div>
    </div>
  );
}
