import { createClient } from "@/lib/supabase/server";
import { YiginBar } from "@/components/ui/Grafik";

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
  const [{ data: birimler }, { data: tipler }] = await Promise.all([
    supabase.from("birim").select("tip_id, durum, satilabilir, son_guncelleme"),
    supabase.from("daire_tipi").select("id, oda, ad"),
  ]);

  const B = birimler ?? [];
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
                {kalanMusait} müsait birim · aylık {aylikHiz.toFixed(1)} birim hız
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat etiket="Aylık hız" deger={aylikHiz.toFixed(1)} alt="birim/ay · 90g ort." />
              <Stat etiket="Son 30 gün" deger={String(satilan30)} alt="satış" />
              <Stat etiket="Son 90 gün" deger={String(satilan90)} alt="satış" />
              <Stat etiket="Aylık absorpsiyon" deger={`%${absorpsiyonOran}`} alt="satılabilir stoğun" />
            </div>
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
    </div>
  );
}
