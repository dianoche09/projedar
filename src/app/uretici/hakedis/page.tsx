import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { zamanOnce } from "@/lib/types";

/* =========================================================
   HAKEDİŞ GÖRÜNÜMÜ (müteahhit) — kim ne sattı + hesaplanan danışman komisyonu.
   DEĞİŞMEZ: Projedar satışa aracılık ETMEZ, komisyondan pay ALMAZ, ödeme/alacak
   defteri TUTMAZ. Bu SALT BİLGİ görünümüdür — zaten tuttuğumuz satış verisinin
   (opsiyon.satici_id + birim.durum) sunumu; komisyon müteahhitin kendi tanımladığı
   tahsisten canlı hesaplanır (birim_satici_kazanci). Ödeme takibi taraflar arasıdır.
   SCOPE: yalnız çağıran üreticinin sahip olduğu projeler.
   ========================================================= */

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

type Birim = { id: string; daire_no: string | null; proje_id: string; para_birimi: string | null };

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

  // Satılan birimler + satıcı (scope: kendi projeleri)
  const [{ data: birimRaw }, { data: opsRaw }] = await Promise.all([
    admin.from("birim").select("id, daire_no, proje_id, para_birimi").in("proje_id", projeIds).eq("durum", "satildi"),
    admin.from("opsiyon").select("birim_id, satici_id, sonuc_at").eq("sonuc", "satildi").order("sonuc_at", { ascending: false, nullsFirst: false }),
  ]);

  const birimler = (birimRaw ?? []) as Birim[];
  const birimIdSet = new Set(birimler.map((b) => b.id));

  // birim → satıcı + satış tarihi (en son tamamlanmış satış)
  const saticiMap = new Map<string, string>();
  const satisTarihMap = new Map<string, string | null>();
  for (const o of (opsRaw ?? []) as { birim_id: string; satici_id: string; sonuc_at: string | null }[]) {
    if (birimIdSet.has(o.birim_id) && !saticiMap.has(o.birim_id)) {
      saticiMap.set(o.birim_id, o.satici_id);
      satisTarihMap.set(o.birim_id, o.sonuc_at ?? null);
    }
  }

  // Satıcı adları
  const saticiIds = [...new Set([...saticiMap.values()])];
  const { data: profRaw } = saticiIds.length
    ? await admin.from("profiles").select("id, ad").in("id", saticiIds)
    : { data: [] as { id: string; ad: string | null }[] };
  const saticiAd = new Map((profRaw ?? []).map((p) => [p.id as string, (p.ad as string | null) ?? null]));

  // Hesaplanan komisyon (canlı — saklama yok; müteahhit yetkisiyle RPC)
  const kazancMap = new Map<string, number | null>();
  await Promise.all(
    birimler.map(async (b) => {
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
  // Para birimi karışmasın: hakediş toplamını para_birimi bazında ayrı topla (TRY + USD tek sayıya karışmaz)
  const toplamByPara = new Map<string, number>();
  for (const b of birimler) {
    const k = kazancMap.get(b.id);
    if (k == null) continue;
    const p = b.para_birimi ?? "TRY";
    toplamByPara.set(p, (toplamByPara.get(p) ?? 0) + k);
  }
  const toplamMetin =
    toplamByPara.size === 0
      ? "—"
      : [...toplamByPara.entries()].map(([p, t]) => `${fmt(t)} ${PARA_SIMGE[p] ?? p}`).join(" · ");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-6">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Hakediş Görünümü</h1>
        <p className="mt-2 max-w-[640px] text-[13.5px] text-ink-soft">
          Satışı tamamlanan birimlerde hangi danışmanın sattığı ve tanımladığın tahsis komisyonundan hesaplanan hakediş
          tutarı. Bu yalnız bir bilgi görünümüdür. Projedar ödemeye taraf değildir, komisyondan pay almaz ve ödeme
          takibi tutmaz; ödeme danışmanla aranızda gerçekleşir.
        </p>
      </header>

      {/* KPI — ortak şerit deseni (stok/opsiyonlar ile hizalı) */}
      <section className="kart belir belir-1 mb-6 p-1 sm:max-w-[560px]">
        <div className="grid grid-cols-2 divide-x divide-[var(--cizgi)]">
          <div className="px-5 py-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Tamamlanan Satış</div>
            <div className="mono text-[30px] font-semibold leading-none text-ink">{toplamSatis}</div>
          </div>
          <div className="px-5 py-4">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Toplam Hakediş (hesaplanan)</div>
            <div className="mono text-[26px] font-semibold leading-none text-teal">{toplamMetin}</div>
          </div>
        </div>
      </section>

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
                  <th>Satan Danışman</th>
                  <th>Satış Tarihi</th>
                  <th>Hesaplanan Komisyon</th>
                </tr>
              </thead>
              <tbody>
                {birimler.map((b) => {
                  const k = kazancMap.get(b.id);
                  const ps = PARA_SIMGE[b.para_birimi ?? "TRY"] ?? "₺";
                  const satici = saticiMap.get(b.id);
                  const tarih = satisTarihMap.get(b.id) ?? null;
                  return (
                    <tr key={b.id}>
                      <td className="font-semibold text-ink">{projeAd.get(b.proje_id) ?? "—"}</td>
                      <td className="mono font-semibold">{b.daire_no ?? "—"}</td>
                      <td className="text-ink-soft">{satici ? saticiAd.get(satici) ?? "Danışman" : "—"}</td>
                      <td className="mono text-ink-soft">{tarih ? zamanOnce(tarih) : "—"}</td>
                      <td className="mono font-semibold text-navy">{k != null ? `${fmt(k)} ${ps}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-[11.5px] text-[var(--ink-faint)]">
        Komisyon, satılan birimin liste fiyatı ve senin tanımladığın tahsis komisyonundan canlı hesaplanır. Projedar bu
        tutarı saklamaz, ödeme durumu tutmaz.
      </p>
    </div>
  );
}

function BosDurum() {
  return (
    <div className="kart belir belir-2 p-14 text-center">
      <p className="text-[14px] font-bold text-ink">Henüz tamamlanan satış yok</p>
      <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-ink-soft">
        Bir birim satıldı olarak kesinleştiğinde, satan danışman ve hesaplanan hakediş burada listelenir.
      </p>
      <Link href="/uretici/opsiyonlar" className="mt-5 inline-block text-[13px] font-semibold text-teal hover:underline">
        Opsiyonlara git →
      </Link>
    </div>
  );
}
