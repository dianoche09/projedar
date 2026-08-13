import { createClient } from "@/lib/supabase/server";

const DURUM_ET: Record<string, string> = { lansman: "Lansman", on_talep: "Ön Talep", satista: "Satışta", etkinlik: "Etkinlik" };
const DURUM_RENK: Record<string, string> = {
  lansman: "bg-teal-soft text-teal-d",
  on_talep: "bg-amber-soft text-[#9a6a12]",
  satista: "bg-green-soft text-[#1f7d4c]",
  etkinlik: "bg-[var(--color-navy-soft)] text-navy",
};

function tarihFmt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Lansman Radarı — emlakçının TAHSİSLİ projelerindeki lansman/kampanya duyuruları (RLS lansman_emlakci_select). */
export default async function HavuzLansman() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lansman")
    .select("id, baslik, aciklama, tarih, konum, durum, proje:proje_id(id, ad, il, ilce)")
    .order("tarih", { ascending: true });
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ll = (data ?? []) as any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6">
      <header className="belir mb-5">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="rozet" style={{ background: "rgba(30,155,138,.12)", color: "var(--color-teal-d)" }}>
            <span className="freshdot nabiz" style={{ background: "var(--color-teal)" }} /> Radar
          </span>
        </div>
        <h1 className="font-display text-[27px] font-bold tracking-tight text-navy">Lansman Radarı</h1>
        <p className="mt-1.5 text-[13px] text-ink-soft">
          Sana tahsisli projelerin ön talep, satış başlangıcı ve etkinlik duyuruları.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {ll.map((l) => (
          <article key={l.id} className="kart kart-3d p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-[16px] font-bold text-ink">{l.baslik}</h3>
              <span className={`rozet flex-none ${DURUM_RENK[l.durum] ?? "bg-soft text-ink-soft"}`}>
                {DURUM_ET[l.durum] ?? l.durum}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] font-medium text-ink-soft">{l.proje?.ad}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-ink-soft">
              {l.tarih ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-teal">◷</span> {tarihFmt(l.tarih)}
                </span>
              ) : null}
              {l.konum || l.proje?.il ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-teal">⚲</span>{" "}
                  {[l.konum, [l.proje?.ilce, l.proje?.il].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                </span>
              ) : null}
            </div>
            {l.aciklama ? (
              <p className="mt-3 border-t border-hair pt-3 text-[13px] leading-relaxed text-ink-soft">{l.aciklama}</p>
            ) : null}
          </article>
        ))}
        {ll.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-[var(--cizgi-2)] bg-white/70 p-16 text-center">
            <p className="text-sm font-bold text-[var(--ink-faint)]">
              Sana tahsisli projelerde şu an duyurulmuş lansman yok.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
