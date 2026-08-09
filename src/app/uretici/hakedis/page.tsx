import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HakedisBtn } from "./HakedisBtn";

/* =========================================================
   HAKEDİŞ DEFTERİ (müteahhit) — kazanılan vs ödenen.
   DEĞİŞMEZ: Platform komisyondan pay almaz; bu yalnız müteahhit↔danışman
   mutabakat defteri. Kazanç = satılan birimin satıcı tahsisinden (snapshot).
   SCOPE: yalnız çağıran üreticinin sahip olduğu projeler.
   ========================================================= */

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

type Birim = { id: string; daire_no: string | null; proje_id: string; para_birimi: string | null };
type Hakedis = { birim_id: string; durum: string; tutar: number | null; odenen_at: string | null };

export default async function UreticiHakedis() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Sahip olunan üretici firmalar → projeler
  const { data: firmalar } = await admin.from("uretici").select("id").eq("sahip_id", user.id);
  const ureticiIds = (firmalar ?? []).map((u) => u.id as string);
  const { data: projeRaw } = ureticiIds.length
    ? await admin.from("proje").select("id, ad").in("uretici_id", ureticiIds)
    : { data: [] as { id: string; ad: string }[] };
  const projeAd = new Map((projeRaw ?? []).map((p) => [p.id as string, p.ad as string]));
  const projeIds = [...projeAd.keys()];

  if (!projeIds.length) return <BosDurum />;

  // Satılan birimler + satıcı + hakediş kayıtları (scope: kendi projeleri)
  const [{ data: birimRaw }, { data: opsRaw }, { data: hakRaw }] = await Promise.all([
    admin.from("birim").select("id, daire_no, proje_id, para_birimi").in("proje_id", projeIds).eq("durum", "satildi"),
    admin.from("opsiyon").select("birim_id, satici_id, sonuc_at").eq("sonuc", "satildi").order("sonuc_at", { ascending: false, nullsFirst: false }),
    admin.from("hakedis").select("birim_id, durum, tutar, odenen_at").in("proje_id", projeIds),
  ]);

  const birimler = (birimRaw ?? []) as Birim[];
  const birimIdSet = new Set(birimler.map((b) => b.id));

  // birim → satıcı (en son tamamlanmış satış)
  const saticiMap = new Map<string, string>();
  for (const o of (opsRaw ?? []) as { birim_id: string; satici_id: string }[]) {
    if (birimIdSet.has(o.birim_id) && !saticiMap.has(o.birim_id)) saticiMap.set(o.birim_id, o.satici_id);
  }
  const hakMap = new Map((hakRaw ?? []).map((h) => [(h as Hakedis).birim_id, h as Hakedis]));

  // Satıcı adları
  const saticiIds = [...new Set([...saticiMap.values()])];
  const { data: profRaw } = saticiIds.length
    ? await admin.from("profiles").select("id, ad").in("id", saticiIds)
    : { data: [] as { id: string; ad: string | null }[] };
  const saticiAd = new Map((profRaw ?? []).map((p) => [p.id as string, (p.ad as string | null) ?? null]));

  // Kazanç: hakediş snapshot varsa ondan; yoksa RPC ile hesapla (müteahhit yetkisi)
  const kazancMap = new Map<string, number | null>();
  await Promise.all(
    birimler.map(async (b) => {
      const h = hakMap.get(b.id);
      if (h && h.tutar != null) {
        kazancMap.set(b.id, Number(h.tutar));
        return;
      }
      const satici = saticiMap.get(b.id);
      if (!satici) {
        kazancMap.set(b.id, null);
        return;
      }
      const { data } = await supabase.rpc("birim_satici_kazanci", { p_birim_id: b.id, p_satici: satici });
      kazancMap.set(b.id, typeof data === "number" ? data : null);
    }),
  );

  const toplamSatis = birimler.length;
  const odenenSay = birimler.filter((b) => hakMap.get(b.id)?.durum === "odendi").length;
  const bekleyenTutar = birimler.reduce((t, b) => {
    if (hakMap.get(b.id)?.durum === "odendi") return t;
    const k = kazancMap.get(b.id);
    return t + (k ?? 0);
  }, 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-6">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-navy md:text-[31px]">Hakediş Defteri</h1>
        <p className="mt-2 max-w-[620px] text-[13.5px] text-ink-soft">
          Satışı tamamlanan birimlerde danışmanların hakedişi. Projedar bu ödemeye taraf değildir, komisyondan pay almaz —
          burası yalnız seninle danışman arasındaki mutabakat defteridir. Tutar, tahsis komisyonundan hesaplanır.
        </p>
      </header>

      {/* KPI */}
      <div className="belir belir-1 mb-6 grid grid-cols-3 gap-3.5">
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Tamamlanan Satış</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-navy">{toplamSatis}</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Ödenen Hakediş</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-green">{odenenSay}</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Bekleyen Toplam</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-amber">{fmt(bekleyenTutar)} ₺</div>
        </div>
      </div>

      {toplamSatis === 0 ? (
        <BosDurum />
      ) : (
        <div className="kart belir belir-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Proje</th>
                  <th>Daire</th>
                  <th>Danışman</th>
                  <th>Kazanç (hakediş)</th>
                  <th>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {birimler.map((b) => {
                  const h = hakMap.get(b.id);
                  const k = kazancMap.get(b.id);
                  const ps = PARA_SIMGE[b.para_birimi ?? "TRY"] ?? "₺";
                  const odendi = h?.durum === "odendi";
                  const satici = saticiMap.get(b.id);
                  return (
                    <tr key={b.id}>
                      <td className="font-semibold text-ink">{projeAd.get(b.proje_id) ?? "—"}</td>
                      <td className="mono font-semibold">{b.daire_no ?? "—"}</td>
                      <td className="text-ink-soft">{satici ? saticiAd.get(satici) ?? "Danışman" : "—"}</td>
                      <td className="mono font-semibold text-navy">{k != null ? `${fmt(k)} ${ps}` : "—"}</td>
                      <td>
                        <span
                          className="lead-pill"
                          style={{
                            background: odendi ? "var(--color-green-soft)" : "var(--color-amber-soft)",
                            color: odendi ? "var(--color-green)" : "#9a6a12",
                          }}
                        >
                          <span className="freshdot" style={{ background: odendi ? "var(--color-green)" : "var(--color-amber)" }} />
                          {odendi ? "Ödendi" : "Bekliyor"}
                        </span>
                      </td>
                      <td>
                        <HakedisBtn birimId={b.id} projeId={b.proje_id} odendi={odendi} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[11.5px] text-slate-400">
        Kazanç, satış anındaki liste fiyatı ve tahsis komisyonundan hesaplanır. Ödendi işaretlemesi tutarı kayıt altına alır.
      </p>
    </div>
  );
}

function BosDurum() {
  return (
    <div className="kart belir belir-2 p-14 text-center">
      <p className="text-[14px] font-bold text-ink">Henüz tamamlanan satış yok</p>
      <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-ink-soft">
        Bir birim satıldı olarak kesinleştiğinde, danışman hakedişi burada listelenir ve ödeme durumunu işaretleyebilirsin.
      </p>
      <Link href="/uretici/opsiyonlar" className="mt-5 inline-block text-[13px] font-semibold text-teal hover:underline">
        Opsiyonlara git →
      </Link>
    </div>
  );
}
