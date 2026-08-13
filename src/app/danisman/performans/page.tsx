import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OranBar } from "@/components/ui/Grafik";

/* =========================================================
   PERFORMANSIM — emlakçının kendi satış hunisi + KPI (son 30 gün).
   Tüm sayı GERÇEK veriden: events (paylasim/goruntuleme, profile_id=uid),
   lead (RLS: atanan/paylaşan), opsiyon (satici_id=uid). Migration yok.
   ========================================================= */

type EventRow = { tip: string; proje_id: string | null };
type LeadRow = { proje_id: string | null };
type OpsRow = { durum: string };

const fmtOran = (pay: number, payda: number): string => (payda > 0 ? `%${Math.round((pay / payda) * 100)}` : "—");

// Date.now() component body'de değil helper'da (React Compiler purity — talep-radari ile aynı desen).
function gunOnce(g: number): string {
  return new Date(Date.now() - g * 86_400_000).toISOString();
}

function Stat({ etiket, deger, renk, alt }: { etiket: string; deger: string; renk: string; alt?: string }) {
  return (
    <div className="kart kart-3d p-4">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{etiket}</span>
      <div className="mono mt-2.5 text-[26px] font-semibold leading-none" style={{ color: renk }}>
        {deger}
      </div>
      {alt ? <p className="mono mt-1 text-[10px] text-gray">{alt}</p> : null}
    </div>
  );
}

export default async function Performans() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emlakciId = user?.id ?? "";
  if (!emlakciId) notFound();

  const otuzGunOnce = gunOnce(30);

  const [{ data: eventRaw }, { data: leadRaw }, { data: opsRaw }] = await Promise.all([
    supabase
      .from("events")
      .select("tip, proje_id")
      .eq("profile_id", emlakciId)
      .in("tip", ["paylasim", "goruntuleme"])
      .gte("created_at", otuzGunOnce),
    supabase.from("lead").select("proje_id").gte("created_at", otuzGunOnce),
    supabase.from("opsiyon").select("durum").eq("satici_id", emlakciId).gte("created_at", otuzGunOnce),
  ]);

  const events = (eventRaw ?? []) as EventRow[];
  const leadler = (leadRaw ?? []) as LeadRow[];
  const opsiyonlar = (opsRaw ?? []) as OpsRow[];

  const paylasim = events.filter((e) => e.tip === "paylasim").length;
  const goruntuleme = events.filter((e) => e.tip === "goruntuleme").length;
  const lead = leadler.length;
  const opsiyon = opsiyonlar.length;
  const satis = opsiyonlar.filter((o) => o.durum === "satildi").length;

  const bosVeri = paylasim === 0 && goruntuleme === 0 && lead === 0 && opsiyon === 0;

  // Dönüşüm hunisi — her aşama bir önceki aşamaya göre oran + bara normalize.
  const maksAsama = Math.max(paylasim, goruntuleme, lead, opsiyon, satis, 1);
  const yayilma = paylasim > 0 ? `${(goruntuleme / paylasim).toFixed(1)}×` : "—";
  const asamalar: { etiket: string; deger: number; renk: string; oranEtiket: string; oran: string }[] = [
    { etiket: "Paylaşım", deger: paylasim, renk: "var(--color-navy)", oranEtiket: "başlangıç", oran: "" },
    { etiket: "Görüntüleme", deger: goruntuleme, renk: "var(--color-teal)", oranEtiket: "paylaşım başına yayılma", oran: yayilma },
    { etiket: "Lead", deger: lead, renk: "var(--color-green)", oranEtiket: "görüntülemeden ilgi", oran: fmtOran(lead, goruntuleme) },
    { etiket: "Opsiyon", deger: opsiyon, renk: "var(--color-amber)", oranEtiket: "lead'den ciddiyet", oran: fmtOran(opsiyon, lead) },
    { etiket: "Satış", deger: satis, renk: "var(--color-teal-d)", oranEtiket: "opsiyondan kapanış", oran: fmtOran(satis, opsiyon) },
  ];

  // En çok dönüşen projeler — proje bazında aktivite (görüntüleme + lead ağırlıklı).
  const projeAktivite = new Map<string, { goruntuleme: number; lead: number; paylasim: number }>();
  const artir = (id: string | null, alan: "goruntuleme" | "lead" | "paylasim") => {
    if (!id) return;
    const a = projeAktivite.get(id) ?? { goruntuleme: 0, lead: 0, paylasim: 0 };
    a[alan]++;
    projeAktivite.set(id, a);
  };
  for (const e of events) artir(e.proje_id, e.tip === "paylasim" ? "paylasim" : "goruntuleme");
  for (const l of leadler) artir(l.proje_id, "lead");

  const topProjeler = [...projeAktivite.entries()]
    .sort((a, b) => b[1].lead * 5 + b[1].goruntuleme - (a[1].lead * 5 + a[1].goruntuleme))
    .slice(0, 5);
  const projeIdler = topProjeler.map(([id]) => id);
  const { data: projeler } = projeIdler.length
    ? await supabase.from("proje").select("id, ad").in("id", projeIdler)
    : { data: [] as { id: string; ad: string }[] };
  const projeAdMap = new Map((projeler ?? []).map((p) => [p.id, p.ad]));
  const maksProjeGor = Math.max(...topProjeler.map(([, a]) => a.goruntuleme), 1);

  return (
    <div className="mx-auto max-w-[1240px] text-ink">
      <header className="belir mb-6">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="rozet" style={{ background: "rgba(30,155,138,.12)", color: "var(--color-teal)" }}>
            <span className="freshdot" style={{ background: "var(--color-teal)" }} />
            Son 30 gün
          </span>
        </div>
        <h1 className="font-display text-[27px] font-bold leading-none tracking-tight text-navy md:text-[31px]">Performansım</h1>
        <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
          Kendi satış hunin. Paylaşımlarından gelen görüntüleme, lead ve opsiyona dönüşümü tek bakışta gör, hangi projelerin sana kazandırdığını anla.
        </p>
      </header>

      {bosVeri ? (
        <div className="kart belir belir-1 p-14 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(30,155,138,.08)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 3 3 5-6" />
            </svg>
          </div>
          <p className="text-[14px] font-bold text-ink">Henüz veri yok</p>
          <p className="mx-auto mt-1.5 max-w-[400px] text-[13px] leading-relaxed text-ink-soft">
            Son 30 günde paylaşım/lead aktiviten yok. Havuzdan bir daire paylaş, performansın burada birikmeye başlasın.
          </p>
          <Link href="/danisman" className="btn-action mt-5 inline-flex">
            Havuza Git
          </Link>
        </div>
      ) : (
        <>
          {/* KPI şeridi */}
          <div className="belir belir-1 mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            <Stat etiket="Paylaşım" deger={String(paylasim)} renk="var(--color-navy)" />
            <Stat etiket="Görüntüleme" deger={String(goruntuleme)} renk="var(--color-teal)" alt={paylasim > 0 ? `${yayilma} yayılma` : undefined} />
            <Stat etiket="Lead" deger={String(lead)} renk="var(--color-green)" alt={fmtOran(lead, goruntuleme) !== "—" ? `${fmtOran(lead, goruntuleme)} ilgi` : undefined} />
            <Stat etiket="Opsiyon" deger={String(opsiyon)} renk="var(--color-amber)" />
            <Stat etiket="Satış" deger={String(satis)} renk="var(--color-teal-d)" alt={fmtOran(satis, opsiyon) !== "—" ? `${fmtOran(satis, opsiyon)} kapanış` : undefined} />
          </div>

          {/* Dönüşüm hunisi */}
          <div className="kart kart-3d belir belir-2 mb-6 p-5 sm:p-6">
            <h2 className="font-display text-[15px] font-bold text-ink">Dönüşüm hunisi</h2>
            <p className="mt-0.5 text-[12px] text-ink-soft">Her aşama bir öncekine göre — bir paylaşım çok görüntüleme üretebilir.</p>
            <div className="mt-5 space-y-4">
              {asamalar.map((a) => (
                <div key={a.etiket}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-semibold text-ink">{a.etiket}</span>
                    <span className="mono tabular-nums text-ink">
                      {a.deger}
                      {a.oran ? <span className="ml-2 text-[11px] font-semibold text-gray">{a.oran} · {a.oranEtiket}</span> : null}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <OranBar deger={a.deger} maks={maksAsama} renk={a.renk} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* En çok dönüşen projeler */}
          {topProjeler.length > 0 ? (
            <div className="kart kart-3d belir belir-2 p-5 sm:p-6">
              <h2 className="font-display text-[15px] font-bold text-ink">En çok dönüşen projelerim</h2>
              <p className="mt-0.5 text-[12px] text-ink-soft">Görüntüleme ve lead ağırlığına göre ilk 5.</p>
              <div className="mt-4 space-y-3.5">
                {topProjeler.map(([id, a]) => (
                  <Link key={id} href={`/danisman/proje/${id}`} className="block">
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="font-semibold text-ink">{projeAdMap.get(id) ?? "Proje"}</span>
                      <span className="mono tabular-nums text-gray">
                        {a.goruntuleme} görüntüleme · {a.lead} lead
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <OranBar deger={a.goruntuleme} maks={maksProjeGor} renk="var(--color-teal)" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
