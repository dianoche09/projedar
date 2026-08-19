import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { paylasimKodlariAl } from "@/lib/sharing";
import { kayitYaz } from "@/lib/events";
import { projeKapak } from "@/lib/gorsel";
import { ASAMA_ETIKET, DURUM_ETIKET, DURUM_BG, type InsaatAsama, type BirimDurum } from "@/lib/types";
import { YazdirButonu } from "@/components/YazdirButonu";

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };

type OdemePlani = { pesinat_pct?: number | null; taksit_sayisi?: number | null } | null;

/** Kompakt ödeme özeti: "Peşinat %20 · 36 ay". Yoksa null. */
function odemeOzet(op: OdemePlani): string | null {
  if (!op) return null;
  const par: string[] = [];
  if (op.pesinat_pct != null) par.push(`Peşinat %${op.pesinat_pct}`);
  if (op.taksit_sayisi != null) par.push(`${op.taksit_sayisi} ay`);
  return par.length ? par.join(" · ") : null;
}

export default async function KatalogSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ b?: string }>;
}) {
  const { id } = await params;
  const { b } = await searchParams;
  const ids = (b ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emlakciId = user?.id ?? "";
  if (!emlakciId) notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3535";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const appUrl = `${protocol}://${host}`;

  // Proje (RLS: tahsisli değilse gelmez)
  const { data: proje } = await supabase
    .from("proje")
    .select("id, ad, il, ilce, mahalle, insaat_asamasi, ilerleme_yuzde, teslim_tarihi, belge_dogrulandi, uretici_id")
    .eq("id", id)
    .single();
  if (!proje) notFound();

  // Danışman profili (beyaz-etiket)
  const { data: profile } = await supabase
    .from("profiles")
    .select("ad, telefon, foto_url, logo_url")
    .eq("id", emlakciId)
    .single();

  // Kapak
  const { data: kapakRow } = await supabase
    .from("proje_belge")
    .select("url")
    .eq("proje_id", id)
    .eq("tip", "kapak")
    .limit(1)
    .maybeSingle();
  const kapak = projeKapak(kapakRow?.url ?? null, proje.id);

  // Seçilen birimler — RLS tahsis eler; tek-proje kısıtı proje_id ile. Boşsa katalog boş.
  const { data: birimlerRaw } = ids.length
    ? await supabase
        .from("birim")
        .select("id, daire_no, kat, durum, liste_fiyati, para_birimi, net_m2, brut_m2, yon, satilabilir, odeme_plani, tip:tip_id(oda, plan_url)")
        .in("id", ids)
        .eq("proje_id", id)
    : { data: [] };

  // Fiyat redaksiyonu (audit A1): yöneten tahsisin fiyat_gorunur'una göre. Gizliyse fiyat null
  // → katalog PDF'e ham fiyat basılmaz. Proje-detay ile aynı tek-kaynak RPC.
  const { data: fiyatRows } = await supabase.rpc("emlakci_birim_fiyat", { p_proje_id: id });
  const fiyatMap = new Map<string, number | null>(
    ((fiyatRows ?? []) as { birim_id: string; fiyat: number | null }[]).map((r) => [r.birim_id, r.fiyat]),
  );

  // Kısa paylaşım kodları (toplu); yoksa imzalı uzun linke düş.
  const katalogKodlar = await paylasimKodlariAl(emlakciId, ((birimlerRaw ?? []) as { id: string }[]).map((x) => x.id));
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const birimler = ((birimlerRaw ?? []) as any[]).map((x) => ({
    id: x.id as string,
    daire_no: (x.daire_no as string | null) ?? null,
    kat: (x.kat as number | null) ?? null,
    durum: x.durum as BirimDurum,
    liste_fiyati: fiyatMap.has(x.id as string) ? fiyatMap.get(x.id as string) ?? null : null,
    para_birimi: (x.para_birimi as string | null) ?? "TRY",
    net_m2: (x.net_m2 as number | null) ?? null,
    brut_m2: (x.brut_m2 as number | null) ?? null,
    yon: (x.yon as string | null) ?? null,
    odeme: odemeOzet(x.odeme_plani as OdemePlani),
    oda: (x.tip?.oda as string | null) ?? null,
    plan_url: (x.tip?.plan_url as string | null) ?? null,
    // Fail-closed (güvenlik): kod yoksa (nadir DB hatası) iptal-EDİLEMEZ uzun link BASMA → boş bırak.
    link: katalogKodlar.get(x.id as string) ? `${appUrl}/p/${katalogKodlar.get(x.id as string)}` : "",
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const konum = [proje.mahalle, proje.ilce, proje.il].filter(Boolean).join(", ") || "—";

  // Veri yerçekimi: katalog üretildi (anonim, PII yok).
  after(() =>
    kayitYaz({ tip: "katalog", profileId: emlakciId, projeId: id, payload: { birimler: birimler.map((x) => x.id) } }),
  );

  return (
    <div className="min-h-screen bg-paper pb-16">
      <header className="border-b border-hair bg-card py-4 shadow-sm print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6">
          <Link href={`/danisman/proje/${id}`} className="mono text-[11px] font-bold uppercase tracking-[0.1em] text-teal-d hover:text-teal">
            ← Projeye Dön
          </Link>
          <YazdirButonu etiket="Katalog PDF / Yazdır" />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-4xl px-6">
        {/* KAPAK */}
        <section className="overflow-hidden rounded-2xl border border-hair bg-card shadow-sm">
          <div className="relative aspect-[16/6] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kapak} alt={proje.ad} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-white drop-shadow">{proje.ad}</h1>
                {proje.belge_dogrulandi ? <span className="rozet bg-teal-soft text-teal-d">✓ Doğrulanmış</span> : null}
              </div>
              <p className="mt-1 text-[13px] font-medium text-white/85">{konum}</p>
              <p className="mono mt-1 text-[11px] text-white/75">
                İnşaat: {ASAMA_ETIKET[proje.insaat_asamasi as InsaatAsama]} · %{proje.ilerleme_yuzde}
                {proje.teslim_tarihi ? ` · Teslim ${new Date(proje.teslim_tarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "short" })}` : ""}
              </p>
            </div>
          </div>

          {/* Danışman kartı (beyaz-etiket) */}
          <div className="flex items-center gap-4 p-5">
            {profile?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt={profile.ad ?? "Danışman"} className="size-12 flex-none rounded-xl border border-hair bg-white object-contain p-1" />
            ) : profile?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.foto_url} alt={profile.ad ?? "Danışman"} className="size-12 flex-none rounded-full border border-hair object-cover" />
            ) : (
              <div className="flex size-12 flex-none items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                {profile?.ad?.charAt(0).toUpperCase() ?? "E"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold text-ink">{profile?.ad ?? "Danışman"}</p>
              <p className="text-[12px] text-gray">Gayrimenkul Danışmanı{profile?.telefon ? ` · ${profile.telefon}` : ""}</p>
            </div>
          </div>
        </section>

        {/* DAİRE GRID */}
        {birimler.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-hair bg-card/60 p-10 text-center text-sm text-gray">
            Katalog için daire seçilmedi veya seçilenler erişiminiz dışında.
          </p>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {birimler.map((x) => {
              const psim = PARA_SIMGE[x.para_birimi] ?? "₺";
              return (
                <article key={x.id} className="break-inside-avoid rounded-2xl border border-hair bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[16px] font-bold text-ink">Daire {x.daire_no ?? "—"}</p>
                      <p className="mt-0.5 text-[12px] text-gray">
                        {[x.oda, x.kat != null ? `${x.kat}. kat` : null, x.net_m2 ? `${x.net_m2} m²` : null, x.yon]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white ${DURUM_BG[x.durum]}`}>
                      {DURUM_ETIKET[x.durum]}
                    </span>
                  </div>

                  {x.plan_url ? (
                    <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-hair bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.plan_url} alt="Kat planı" className="max-h-full max-w-full object-contain p-2" />
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-end justify-between border-t border-hair pt-3">
                    <div>
                      <span className="mono text-lg font-bold text-ink">
                        {x.liste_fiyati != null ? `${x.liste_fiyati.toLocaleString("tr-TR")} ${psim}` : "Fiyat gizli"}
                      </span>
                      {x.odeme ? <p className="mono mt-0.5 text-[11px] text-gray">{x.odeme}</p> : null}
                    </div>
                  </div>

                  <p className="mono mt-2 break-all rounded-md bg-paper px-2 py-1 text-center text-[10px] text-gray">
                    {x.link}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        <p className="mono mt-6 text-center text-[10px] text-gray print:mt-10">
          Projedar · Canlı stoktan üretildi · Fiyatlar paylaşım anındaki değerdir.
        </p>
      </main>
    </div>
  );
}
