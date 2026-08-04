import { createClient } from "@/lib/supabase/server";
import { YiginBar } from "@/components/ui/Grafik";
import { paraKisa } from "@/lib/stok";
import { zamanOnce } from "@/lib/types";

const C = { green: "#2FB36B", amber: "#E3A12C", red: "#D15A4E" };

/** Modül-kapsam yardımcı: g gün önce (ISO). Render gövdesinde Date.now yok (react-hooks/purity). */
function gunOnce(g: number): string {
  return new Date(Date.now() - g * 86_400_000).toISOString();
}

type OdaOzet = { toplam: number; musait: number; opsiyon: number; satildi: number };

function Stat({ etiket, deger, alt }: { etiket: string; deger: string; alt?: string }) {
  return (
    <div className="rounded-xl border border-hair bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-gray">{etiket}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums leading-none text-ink">{deger}</p>
      {alt ? <p className="mt-1 text-xs text-gray">{alt}</p> : null}
    </div>
  );
}

export default async function Raporlar() {
  const supabase = await createClient();
  // YALNIZ stok verisi. Lead verisi raporlanmaz (sorgu-only model: müteahhit emlakçının
  // lead havuzunu toplu göremez — tek görünüm /uretici/lead-sorgu bireysel sorgusudur).
  const [{ data: birimler }, { data: tipler }, { data: projeler }, { data: fiyatRaw }] = await Promise.all([
    supabase.from("birim").select("proje_id, tip_id, durum, satilabilir, son_guncelleme"),
    supabase.from("daire_tipi").select("id, oda, ad"),
    supabase.from("proje").select("id, ad"),
    supabase
      .from("events")
      .select("proje_id, payload, created_at")
      .eq("tip", "fiyat")
      .gte("created_at", gunOnce(90))
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const B = birimler ?? [];
  const projeAd = new Map((projeler ?? []).map((p) => [p.id, p.ad as string]));
  const projeIds = new Set(projeAd.keys()); // kod-scope: events RLS'e güvenme (talep-radari deseni)
  const toplam = B.length;
  const say = (d: string[]) => B.filter((b) => d.includes(b.durum)).length;
  const musait = say(["musait"]);
  const opsiyon = say(["opsiyonlu", "satis_beklemede"]);
  const satildi = say(["satildi"]);
  const satisOrani = toplam ? Math.round((satildi / toplam) * 100) : 0;

  // — ABSORPSİYON (satış temposu → tükeniş projeksiyonu) —
  // Satış tarihi vekili: durum='satildi' birimin son_guncelleme'i (trigger her durum
  // değişiminde now() yazar; satılan birim sonrasında ~düzenlenmez). Yalnız satılabilir birim.
  const g30 = gunOnce(30);
  const g90 = gunOnce(90);
  const satilabilirB = B.filter((b) => b.satilabilir !== false);
  const kalanMusait = satilabilirB.filter((b) => b.durum === "musait").length;
  const satilanB = satilabilirB.filter((b) => b.durum === "satildi");
  const satilan30 = satilanB.filter((b) => b.son_guncelleme && b.son_guncelleme >= g30).length;
  const satilan90 = satilanB.filter((b) => b.son_guncelleme && b.son_guncelleme >= g90).length;
  const aylikHiz = satilan90 / 3; // son 90 gün ortalaması (gürültüyü yumuşatır)
  const tukenisAy = aylikHiz > 0 ? Math.ceil(kalanMusait / aylikHiz) : null;
  const absorpsiyonOran = satilabilirB.length ? Math.round((satilan30 / satilabilirB.length) * 100) : 0;

  // Proje bazında absorpsiyon (birden çok proje varsa kırılım)
  type ProjeAbs = { kalan: number; satilan90: number };
  const projeAbs = new Map<string, ProjeAbs>();
  for (const b of satilabilirB) {
    if (!b.proje_id) continue;
    const a = projeAbs.get(b.proje_id) ?? { kalan: 0, satilan90: 0 };
    if (b.durum === "musait") a.kalan++;
    else if (b.durum === "satildi" && b.son_guncelleme && b.son_guncelleme >= g90) a.satilan90++;
    projeAbs.set(b.proje_id, a);
  }
  const projeAbsListe = [...projeAbs.entries()]
    .map(([id, a]) => {
      const hiz = a.satilan90 / 3;
      return { id, kalan: a.kalan, hiz, ay: hiz > 0 ? Math.ceil(a.kalan / hiz) : null };
    })
    .filter((p) => p.kalan > 0 || p.hiz > 0)
    .sort((x, y) => {
      // tükenişi yaklaşan (ay küçük) önce; hız yoksa (ay null) en sona, kalan çoktan aza
      if (x.ay == null && y.ay == null) return y.kalan - x.kalan;
      if (x.ay == null) return 1;
      if (y.ay == null) return -1;
      return x.ay - y.ay;
    });

  // — FİYAT HAREKETLERİ (90g) — DB trigger 'fiyat' event'lerinden (birim_fiyat_log) —
  type FiyatPayload = { eski?: number; yeni?: number; pct?: number; daire_no?: string | null; para_birimi?: string | null };
  type FiyatRaw = { proje_id: string | null; payload: FiyatPayload | null; created_at: string };
  const fiyatlar = ((fiyatRaw ?? []) as FiyatRaw[])
    .filter((f) => f.proje_id && projeIds.has(f.proje_id) && f.payload && typeof f.payload.pct === "number")
    .map((f) => ({
      proje_id: f.proje_id,
      pct: f.payload!.pct as number,
      eski: typeof f.payload!.eski === "number" ? (f.payload!.eski as number) : null,
      yeni: typeof f.payload!.yeni === "number" ? (f.payload!.yeni as number) : null,
      daire_no: f.payload!.daire_no ?? null,
      para: f.payload!.para_birimi ?? "TRY",
      created_at: f.created_at,
    }));
  const zamSay = fiyatlar.filter((f) => f.pct > 0).length;
  const indirimSay = fiyatlar.filter((f) => f.pct < 0).length;
  const ortPct = fiyatlar.length ? fiyatlar.reduce((t, f) => t + f.pct, 0) / fiyatlar.length : 0;

  // Oda (tip) bazlı performans — tüm projeler
  const tipMap = new Map((tipler ?? []).map((t) => [t.id, t]));
  const odalar = new Map<string, OdaOzet>();
  for (const b of B) {
    const tip = b.tip_id ? tipMap.get(b.tip_id) : null;
    const oda = tip?.oda ?? tip?.ad ?? "Diğer";
    const o = odalar.get(oda) ?? { toplam: 0, musait: 0, opsiyon: 0, satildi: 0 };
    o.toplam++;
    if (b.durum === "musait") o.musait++;
    else if (b.durum === "opsiyonlu" || b.durum === "satis_beklemede") o.opsiyon++;
    else if (b.durum === "satildi") o.satildi++;
    odalar.set(oda, o);
  }
  const odaListe = [...odalar.entries()].sort((a, b) => b[1].satildi - a[1].satildi);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Raporlar</h1>
        <p className="mt-1 text-sm text-gray">Stok ve satış performansı — hangi tip satıyor, hangisi bekliyor.</p>
      </div>

      {/* STOK ÖZETİ */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat etiket="Toplam birim" deger={String(toplam)} alt="tüm projeler" />
        <Stat etiket="Satış oranı" deger={`%${satisOrani}`} alt={`${satildi} / ${toplam}`} />
        <Stat etiket="Müsait" deger={String(musait)} alt="satışa hazır" />
        <Stat etiket="Opsiyonda" deger={String(opsiyon)} alt="kilitli, karar bekliyor" />
      </section>

      {/* ABSORPSİYON */}
      <section className="rounded-2xl border border-hair bg-card p-5 shadow-card sm:p-6">
        <h2 className="font-display text-sm font-semibold text-ink">Absorpsiyon · Satış temposu</h2>
        <p className="mt-0.5 text-xs text-gray">Son 90 günün hızıyla kalan müsait stok ne kadar sürede tükenir.</p>

        {satilanB.length === 0 ? (
          <p className="mt-4 text-sm text-gray">Henüz satış yok — tempo oluşunca burada görünecek.</p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline gap-2">
              {kalanMusait === 0 ? (
                <span className="font-display text-2xl font-semibold text-ink">Müsait stok tükendi</span>
              ) : tukenisAy != null ? (
                <>
                  <span className="font-mono text-4xl font-semibold tabular-nums leading-none text-ink">≈ {tukenisAy}</span>
                  <span className="text-sm text-gray">ayda tükenir</span>
                </>
              ) : (
                <span className="font-display text-lg font-semibold text-ink">Tempo hesaplanamıyor</span>
              )}
            </div>
            {kalanMusait > 0 && tukenisAy != null ? (
              <p className="mt-1 text-xs text-gray">
                {kalanMusait} satılabilir müsait birim · aylık {aylikHiz.toFixed(1)} birim hız
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat etiket="Aylık hız" deger={aylikHiz.toFixed(1)} alt="birim/ay · 90g ort." />
              <Stat etiket="Son 30 gün" deger={String(satilan30)} alt="satış" />
              <Stat etiket="Son 90 gün" deger={String(satilan90)} alt="satış" />
              <Stat etiket="Aylık absorpsiyon" deger={`%${absorpsiyonOran}`} alt="satılabilir stoğun" />
            </div>

            {projeAbsListe.length > 1 ? (
              <div className="mt-5 border-t border-hair pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray">Proje bazında</p>
                <ul className="mt-2 divide-y divide-hair">
                  {projeAbsListe.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-ink">{projeAd.get(p.id) ?? "—"}</span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-gray">
                        {p.kalan} müsait · {p.hiz.toFixed(1)}/ay
                      </span>
                      <span className="w-20 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-ink">
                        {p.kalan === 0 ? "tükendi" : p.ay != null ? `≈ ${p.ay} ay` : "veri yok"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* DAİRE TİPİ PERFORMANSI */}
      <section className="rounded-2xl border border-hair bg-card p-5 shadow-card sm:p-6">
        <h2 className="font-display text-sm font-semibold text-ink">Daire tipi performansı</h2>
        <p className="mt-0.5 text-xs text-gray">Tüm projeler · hangi tip satıyor, hangisi bekliyor.</p>
        {odaListe.length === 0 ? (
          <p className="mt-4 text-sm text-gray">Henüz birim yok.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {odaListe.map(([oda, o]) => {
              const par = [
                { etiket: "Müsait", deger: o.musait, renk: C.green },
                { etiket: "Opsiyon", deger: o.opsiyon, renk: C.amber },
                { etiket: "Satıldı", deger: o.satildi, renk: C.red },
              ];
              const oran = o.toplam ? Math.round((o.satildi / o.toplam) * 100) : 0;
              return (
                <div key={oda}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink">{oda}</span>
                    <span className="font-mono text-xs tabular-nums text-gray">
                      {o.satildi}/{o.toplam} satıldı · %{oran}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <YiginBar parcalar={par} yukseklik={9} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FİYAT HAREKETLERİ */}
      {fiyatlar.length > 0 ? (
        <section className="rounded-2xl border border-hair bg-card p-5 shadow-card sm:p-6">
          <h2 className="font-display text-sm font-semibold text-ink">Fiyat Hareketleri · 90g</h2>
          <p className="mt-0.5 text-xs text-gray">Son 90 günde fiyat değişimleri · zam, indirim ve ortalama yön.</p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat etiket="Değişim" deger={String(fiyatlar.length)} alt="90 günde" />
            <Stat etiket="Zam" deger={String(zamSay)} alt="artış" />
            <Stat etiket="İndirim" deger={String(indirimSay)} alt="düşüş" />
          </div>
          <p className="mt-2 text-xs text-gray">
            Ortalama yön:{" "}
            <span className={`font-mono font-semibold ${ortPct >= 0 ? "text-teal-d" : "text-red"}`}>
              {ortPct >= 0 ? "+" : ""}%{ortPct.toFixed(1)}
            </span>
          </p>

          <ul className="mt-4 divide-y divide-hair">
            {fiyatlar.slice(0, 6).map((f, i) => {
              const up = f.pct >= 0;
              return (
                <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ background: up ? "var(--color-teal)" : "var(--color-red)" }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {projeAd.get(f.proje_id ?? "") ?? "—"}
                    {f.daire_no ? <span className="text-gray"> · {f.daire_no}</span> : null}
                  </span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-gray">
                    {f.eski != null ? paraKisa(f.eski, f.para) : "—"} → {f.yeni != null ? paraKisa(f.yeni, f.para) : "—"}
                  </span>
                  <span
                    className={`w-16 shrink-0 text-right font-mono text-xs font-semibold tabular-nums ${up ? "text-teal-d" : "text-red"}`}
                  >
                    {up ? "+" : ""}%{f.pct}
                  </span>
                  <span className="hidden w-20 shrink-0 text-right text-xs text-gray sm:block">{zamanOnce(f.created_at)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
