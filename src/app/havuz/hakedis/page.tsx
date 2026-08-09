import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { zamanOnce } from "@/lib/types";

/* =========================================================
   HAKEDİŞLERİM (emlakçı) — satılan birimlerde kazandığım + ödeme durumu.
   Salt görünüm: ödemeyi müteahhit işaretler. Kazanç kendi tahsisimden (RPC).
   ========================================================= */

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

type Birim = {
  id: string;
  daire_no: string | null;
  proje_id: string;
  para_birimi: string | null;
  proje: { ad: string; il: string | null; ilce: string | null } | null;
};
type Hak = { birim_id: string; durum: string; tutar: number | null; odenen_at: string | null };

export default async function HavuzHakedis() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Kendi tamamlanmış satışlarım (RLS: satici_id=auth.uid())
  const { data: opsRaw } = await supabase
    .from("opsiyon")
    .select("id, birim_id, sonuc_at")
    .eq("satici_id", user.id)
    .eq("sonuc", "satildi")
    .order("sonuc_at", { ascending: false });
  const opslar = (opsRaw ?? []) as { id: string; birim_id: string; sonuc_at: string | null }[];
  const birimIds = [...new Set(opslar.map((o) => o.birim_id))];

  if (!birimIds.length) return <BosDurum />;

  const admin = createAdminClient();
  const { data: birimRaw } = await admin
    .from("birim")
    .select("id, daire_no, proje_id, para_birimi, proje:proje_id(ad, il, ilce)")
    .in("id", birimIds);
  const birimMap = new Map((birimRaw ?? []).map((b) => [(b as unknown as Birim).id, b as unknown as Birim]));

  // Ödeme durumu (RLS: emlakci_id=auth.uid())
  const { data: hakRaw } = await supabase.from("hakedis").select("birim_id, durum, tutar, odenen_at").eq("emlakci_id", user.id);
  const hakMap = new Map((hakRaw ?? []).map((h) => [(h as Hak).birim_id, h as Hak]));

  // Kazanç: ödendi ise snapshot (otoriter), değilse güncel RPC (kendi tahsisim)
  const projeIds = [...new Set((birimRaw ?? []).map((b) => (b as unknown as Birim).proje_id))];
  const kazancMap = new Map<string, number>();
  await Promise.all(
    projeIds.map(async (pid) => {
      const { data } = await supabase.rpc("emlakci_birim_kazanci", { p_proje_id: pid });
      for (const k of (data ?? []) as { birim_id: string; kazanc: number | null }[]) {
        if (k.kazanc != null) kazancMap.set(k.birim_id, Number(k.kazanc));
      }
    }),
  );

  const kazanc = (birimId: string): number | null => {
    const h = hakMap.get(birimId);
    if (h?.durum === "odendi" && h.tutar != null) return Number(h.tutar);
    return kazancMap.get(birimId) ?? (h?.tutar != null ? Number(h.tutar) : null);
  };

  const toplamKazanc = birimIds.reduce((t, id) => t + (kazanc(id) ?? 0), 0);
  const odenenKazanc = birimIds.reduce((t, id) => (hakMap.get(id)?.durum === "odendi" ? t + (kazanc(id) ?? 0) : t), 0);
  const bekleyenKazanc = toplamKazanc - odenenKazanc;

  return (
    <div className="mx-auto max-w-[980px] px-4 py-6 text-ink">
      <header className="belir mb-6">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="rozet" style={{ background: "rgba(30,155,138,.12)", color: "var(--color-teal)" }}>
            <span className="freshdot" style={{ background: "var(--color-teal)" }} />
            Hakediş
          </span>
        </div>
        <h1 className="font-display text-[27px] font-bold leading-none tracking-tight text-navy md:text-[31px]">Hakedişlerim</h1>
        <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
          Tamamladığın satışlarda kazandığın hakediş. Ödeme müteahhitle aranda gerçekleşir; Projedar taraf değildir, pay
          almaz. Buradaki kayıt senin takibin için.
        </p>
      </header>

      {/* KPI */}
      <div className="belir belir-1 mb-6 grid grid-cols-3 gap-3.5">
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Toplam Kazanç</span>
          <div className="mono mt-3 text-[26px] font-semibold leading-none text-navy">{fmt(toplamKazanc)} ₺</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Ödenen</span>
          <div className="mono mt-3 text-[26px] font-semibold leading-none text-green">{fmt(odenenKazanc)} ₺</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Bekleyen</span>
          <div className="mono mt-3 text-[26px] font-semibold leading-none text-amber">{fmt(bekleyenKazanc)} ₺</div>
        </div>
      </div>

      <div className="belir belir-2 space-y-3">
        {opslar.map((o) => {
          const b = birimMap.get(o.birim_id);
          if (!b) return null;
          const h = hakMap.get(o.birim_id);
          const k = kazanc(o.birim_id);
          const ps = PARA_SIMGE[b.para_birimi ?? "TRY"] ?? "₺";
          const odendi = h?.durum === "odendi";
          return (
            <article key={o.id} className="kart kart-3d signal-top p-4" style={{ ["--_sig" as string]: odendi ? "var(--color-green)" : "var(--color-amber)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold leading-tight text-ink">
                    {b.proje?.ad ?? "—"}
                    {b.daire_no ? <span className="ml-1.5 text-[13px] font-semibold text-teal">· Daire {b.daire_no}</span> : null}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">
                    {[b.proje?.il, b.proje?.ilce].filter(Boolean).join(" · ") || "—"}
                    {o.sonuc_at ? ` · satış ${zamanOnce(o.sonuc_at)}` : ""}
                  </p>
                </div>
                <div className="flex-none text-right">
                  <span className="mono block text-[15px] font-semibold text-navy">{k != null ? `${fmt(k)} ${ps}` : "—"}</span>
                  <span
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[11px] font-semibold"
                    style={{
                      background: odendi ? "var(--color-green-soft)" : "var(--color-amber-soft)",
                      color: odendi ? "var(--color-green)" : "#9a6a12",
                    }}
                  >
                    <span className="freshdot" style={{ background: odendi ? "var(--color-green)" : "var(--color-amber)" }} />
                    {odendi ? "Ödendi" : "Bekliyor"}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function BosDurum() {
  return (
    <div className="mx-auto max-w-[980px] px-4 py-6">
      <div className="kart belir belir-2 p-14 text-center">
        <p className="text-[14px] font-bold text-ink">Henüz hakedişin yok</p>
        <p className="mx-auto mt-1.5 max-w-[400px] text-[13px] leading-relaxed text-ink-soft">
          Bir satışı tamamladığında kazandığın hakediş burada birikir ve ödeme durumunu takip edebilirsin.
        </p>
        <Link href="/havuz/opsiyonlarim" className="mt-5 inline-block text-[13px] font-semibold text-teal hover:underline">
          Opsiyonlarım →
        </Link>
      </div>
    </div>
  );
}
