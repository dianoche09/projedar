import { createClient } from "@/lib/supabase/server";
import { lansmanEkle, lansmanSil } from "@/app/uretici/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

const DURUM: [string, string][] = [
  ["lansman", "Lansman"],
  ["on_talep", "Ön Talep"],
  ["satista", "Satışta"],
  ["etkinlik", "Etkinlik"],
];
const DURUM_ET: Record<string, string> = Object.fromEntries(DURUM);
const DURUM_RENK: Record<string, string> = {
  lansman: "bg-teal-soft text-teal-d",
  on_talep: "bg-amber-soft text-[#9a6a12]",
  satista: "bg-green-soft text-[#1f7d4c]",
  etkinlik: "bg-[var(--color-navy-soft)] text-navy",
};
const inpCls =
  "w-full rounded-lg border border-[var(--cizgi)] bg-soft px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-teal";

/** Yaklaşan (yakın→uzak) → tarihsiz → geçmiş (yeni→eski). Modül seviyesi: render pürlük kuralı. */
function lansmanSirala<T extends { tarih: string | null }>(list: T[]): T[] {
  const now = Date.now();
  const faz = (iso: string | null): number => (iso == null ? 1 : new Date(iso).getTime() >= now ? 0 : 2);
  return [...list].sort((a, b) => {
    const fa = faz(a.tarih);
    const fb = faz(b.tarih);
    if (fa !== fb) return fa - fb;
    if (fa === 0) return new Date(a.tarih!).getTime() - new Date(b.tarih!).getTime();
    if (fa === 2) return new Date(b.tarih!).getTime() - new Date(a.tarih!).getTime();
    return 0;
  });
}

function tarihFmt(iso: string | null): string {
  if (!iso) return "";
  // Sunucu UTC'de render eder → timeZone sabitle (TR), aksi halde 3 saat kayar gösterilir
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  });
}

export default async function UreticiLansman() {
  const supabase = await createClient();
  const [{ data: projeler }, { data: lansmanlar }] = await Promise.all([
    supabase.from("proje").select("id, ad").order("ad"),
    supabase
      .from("lansman")
      .select("id, baslik, aciklama, tarih, konum, durum, proje:proje_id(ad)")
      .order("tarih", { ascending: true }),
  ]);
  const pl = (projeler ?? []) as { id: string; ad: string }[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ll = lansmanSirala((lansmanlar ?? []) as any[]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <header className="belir mb-5">
        <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Lansman &amp; Kampanya</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
          Ön talep, satış başlangıcı ve etkinlik duyuruları. Tahsis ettiğin emlakçılar Lansman Radarı&apos;nda görür.
        </p>
      </header>

      {pl.length > 0 ? (
        <section className="kart mb-5 p-5">
          <h2 className="mb-3 font-display text-[15px] font-bold text-ink">Yeni lansman</h2>
          <form action={lansmanEkle} className="grid gap-2.5 sm:grid-cols-2">
            <select name="proje_id" required defaultValue="" className={inpCls}>
              <option value="" disabled>
                Proje seç
              </option>
              {pl.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ad}
                </option>
              ))}
            </select>
            <select name="durum" defaultValue="lansman" className={inpCls}>
              {DURUM.map(([v, et]) => (
                <option key={v} value={v}>
                  {et}
                </option>
              ))}
            </select>
            <input name="baslik" required placeholder="Başlık (ör. Ön Talep Toplantısı)" className={`${inpCls} sm:col-span-2`} />
            <input name="tarih" type="datetime-local" className={inpCls} />
            <input name="konum" placeholder="Konum (ör. Satış Ofisi, Çankaya)" className={inpCls} />
            <textarea name="aciklama" rows={3} placeholder="Açıklama" className={`${inpCls} sm:col-span-2`} />
            <div className="sm:col-span-2">
              <SubmitButton>Lansman ekle</SubmitButton>
            </div>
          </form>
        </section>
      ) : (
        <p className="kart mb-5 p-5 text-[13px] text-[var(--ink-faint)]">Önce bir proje oluştur, sonra lansman ekleyebilirsin.</p>
      )}

      <div className="flex flex-col gap-3">
        {ll.map((l) => (
          <div key={l.id} className="kart p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[15px] font-bold text-ink">{l.baslik}</h3>
                  <span className={`rozet ${DURUM_RENK[l.durum] ?? "bg-soft text-ink-soft"}`}>{DURUM_ET[l.durum] ?? l.durum}</span>
                </div>
                <p className="mt-0.5 text-[12.5px] text-[var(--ink-faint)]">
                  {[l.proje?.ad, l.konum, tarihFmt(l.tarih)].filter(Boolean).join(" · ")}
                </p>
                {l.aciklama ? <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{l.aciklama}</p> : null}
              </div>
              <form action={lansmanSil}>
                <input type="hidden" name="id" value={l.id} />
                <button
                  type="submit"
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--ink-faint)] transition-colors hover:bg-red-soft hover:text-red"
                >
                  Sil
                </button>
              </form>
            </div>
          </div>
        ))}
        {ll.length === 0 ? <p className="py-8 text-center text-[13px] text-[var(--ink-faint)]">Henüz lansman yok.</p> : null}
      </div>
    </div>
  );
}
