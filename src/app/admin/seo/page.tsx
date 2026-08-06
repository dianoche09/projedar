import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI } from "@/lib/seo/icerik-esigi";
import { SayfaBaslik } from "../_ortak";
import { projeSayfasiUret } from "./actions";
import { UretButon } from "./UretButon";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Admin · SEO Sayfaları. Eşik geçen ama public_slug'ı olmayan projeler tek tıkla
 * yayınlanır (public_slug + IndexNow). Eşik-altı projeler "eksik veri" olarak
 * listelenir (thin-content koruması: sayfa açılmaz). Katalog (dış) projeler ayrı
 * akışta (scripts/katalog-import.mjs).
 */
export default async function AdminSeoSayfa() {
  const admin = createAdminClient();
  const [{ data: projeRaw }, { data: tipRaw }] = await Promise.all([
    admin
      .from("proje")
      .select(
        "id, ad, il, ilce, mahalle, public_slug, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, son_guncelleme, uretici:uretici_id ( ad, dogrulanmis )",
      )
      .order("son_guncelleme", { ascending: false }),
    admin.from("daire_tipi").select("proje_id"),
  ]);

  const tipSayim = new Map<string, number>();
  for (const t of (tipRaw ?? []) as { proje_id: string }[]) tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);

  const skor = (p: any) =>
    projeIcerikSkoru({
      il: p.il, ilce: p.ilce, mahalle: p.mahalle, lat: p.lat, lng: p.lng,
      ada: p.ada, parsel: p.parsel, emsal: p.emsal, taks: p.taks,
      insaat_asamasi: p.insaat_asamasi, teslim_tarihi: p.teslim_tarihi, baslama_tarihi: p.baslama_tarihi,
      kunye: p.kunye ?? {}, daireTipiSayisi: tipSayim.get(p.id) ?? 0,
      dogrulanmis: Boolean(p.uretici?.dogrulanmis), belge_dogrulandi: p.belge_dogrulandi,
    });

  const list = (projeRaw ?? []) as any[];
  const yayinda = list.filter((p) => p.public_slug);
  const hazir = list.filter((p) => !p.public_slug && skor(p) >= ICERIK_ESIGI);
  const eksik = list.filter((p) => !p.public_slug && skor(p) < ICERIK_ESIGI);
  const konum = (p: any) => [p.ilce, p.il].filter(Boolean).join(", ") || "—";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <SayfaBaslik
        baslik="SEO Sayfaları"
        altEtiket={<span>{yayinda.length} yayında · {hazir.length} yayına hazır · {eksik.length} eksik veri</span>}
      />

      <section className="belir mt-7">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Yayına hazır ({hazir.length})</h2>
        {hazir.length ? (
          <div className="overflow-hidden rounded-2xl border border-hair bg-card">
            {hazir.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-hair px-4 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.ad}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {konum(p)}{p.uretici?.ad ? ` · ${p.uretici.ad}` : ""} · içerik {skor(p)}
                  </p>
                </div>
                <form action={projeSayfasiUret}>
                  <input type="hidden" name="proje_id" value={p.id} />
                  <UretButon />
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-hair bg-card px-4 py-3 text-sm text-ink-soft">Yayına hazır bekleyen proje yok.</p>
        )}
      </section>

      <section className="belir mt-8">
        <h2 className="mb-3 font-display text-base font-bold text-ink">Yayında ({yayinda.length})</h2>
        {yayinda.length ? (
          <div className="flex flex-wrap gap-2">
            {yayinda.map((p) => (
              <a
                key={p.id}
                href={`/proje/${p.public_slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-card px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-teal/50 hover:text-teal-d"
              >
                {p.ad} ↗
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-hair bg-card px-4 py-3 text-sm text-ink-soft">Henüz yayınlanmış SEO sayfası yok.</p>
        )}
      </section>

      {eksik.length ? (
        <section className="belir mt-8">
          <h2 className="mb-2 font-display text-base font-bold text-ink">Eksik veri ({eksik.length})</h2>
          <p className="mb-3 text-xs text-ink-soft">
            İçerik eşiğinin (≥{ICERIK_ESIGI}) altında; sayfa açılmaz (thin-content koruması). Künye, konum veya daire tipi eklendikçe listeye çıkar.
          </p>
          <div className="flex flex-wrap gap-2">
            {eksik.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-soft px-3 py-1.5 text-[13px] text-ink-soft">
                {p.ad} <span className="font-mono text-[11px] text-gray">{skor(p)}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
