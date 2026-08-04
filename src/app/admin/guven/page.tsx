import { createClient } from "@/lib/supabase/server";
import { GeriLink, SayfaBaslik } from "../_ortak";
import { GuvenRozeti } from "@/components/GuvenRozeti";

/* =========================================================
   GÜVEN SKORLARI — admin komuta tablosu (iki taraflı itibar).
   Kim güvenilir, kim boş opsiyon alıyor. Skorlar SECURITY DEFINER fonksiyonlarla
   events + opsiyon_talep + tazelikten HESAPLANIR (elle state yok, DEĞİŞMEZ #2).
   ========================================================= */

type EmlakciRow = {
  profil_id: string;
  ad: string | null;
  ofis_id: string | null;
  skor: number | null;
  detay: { baslatilan?: number; satis?: number; vazgecme?: number; dusme?: number; sonuclanan?: number } | null;
};
type MuteahhitRow = {
  uretici_id: string;
  ad: string | null;
  skor: number | null;
  detay: { yanit_oran?: number; sla_oran?: number; dogrulama_oran?: number; tazelik_oran?: number; talep_sayisi?: number } | null;
};

/** null skorlar (Yeni) en sona; skorlu olanlar verilen yöne göre sıralanır. */
function sirala<T extends { skor: number | null }>(liste: T[], yon: "asc" | "desc"): T[] {
  return [...liste].sort((a, b) => {
    if (a.skor == null && b.skor == null) return 0;
    if (a.skor == null) return 1;
    if (b.skor == null) return -1;
    return yon === "asc" ? a.skor - b.skor : b.skor - a.skor;
  });
}

export default async function GuvenSkorlariSayfasi() {
  const supabase = await createClient();
  const [{ data: emlakciRaw }, { data: muteahhitRaw }, { data: ofisler }] = await Promise.all([
    supabase.rpc("emlakci_skor_tablo"),
    supabase.rpc("muteahhit_skor_tablo"),
    supabase.from("ofis").select("id, ad, marka"),
  ]);

  const emlakcilar = (emlakciRaw ?? []) as EmlakciRow[];
  const muteahhitler = (muteahhitRaw ?? []) as MuteahhitRow[];
  const ofisAd = new Map((ofisler ?? []).map((o) => [o.id as string, ((o.ad as string | null) ?? (o.marka as string | null)) || "Ofis"]));

  // Emlakçı: en düşük skor önce (kim boş opsiyon alıyor), Yeni'ler sona
  const emlakciSirali = sirala(emlakcilar, "asc");
  const muteahhitSirali = sirala(muteahhitler, "desc");

  // Ofis kırılımı: skorlu danışmanların ofis ortalaması
  const ofisMap = new Map<string, { toplam: number; adet: number; danisman: number }>();
  for (const e of emlakcilar) {
    if (!e.ofis_id) continue;
    const g = ofisMap.get(e.ofis_id) ?? { toplam: 0, adet: 0, danisman: 0 };
    g.danisman += 1;
    if (e.skor != null) {
      g.toplam += e.skor;
      g.adet += 1;
    }
    ofisMap.set(e.ofis_id, g);
  }
  const ofisKirilim = [...ofisMap.entries()]
    .map(([id, g]) => ({ id, ad: ofisAd.get(id) ?? "Ofis", danisman: g.danisman, ort: g.adet > 0 ? Math.round(g.toplam / g.adet) : null }))
    .sort((a, b) => (b.ort ?? -1) - (a.ort ?? -1));

  const skorlu = <T extends { skor: number | null }>(l: T[]) => l.filter((x) => x.skor != null).length;
  const riskli = emlakcilar.filter((e) => e.skor != null && e.skor < 40).length;

  return (
    <div className="mx-auto max-w-[1100px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin" etiket="Genel Bakış" />
      <SayfaBaslik
        baslik="Güven Skorları"
        noktaRenk={riskli > 0 ? "var(--color-red)" : "var(--color-teal)"}
        altEtiket={
          <>
            <span className="font-medium">İki taraflı itibar</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">kim güvenilir, kim boş opsiyon alıyor</span>
          </>
        }
        sag={
          riskli > 0 ? (
            <span className="rozet mono bg-red/12 text-red">{riskli} riskli danışman</span>
          ) : (
            <span className="rozet bg-green-soft text-teal-d">risk yok</span>
          )
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi etiket="Skorlu danışman" deger={`${skorlu(emlakcilar)}/${emlakcilar.length}`} />
        <Kpi etiket="Riskli (<40)" deger={String(riskli)} renk={riskli > 0 ? "text-red" : "text-ink"} />
        <Kpi etiket="Skorlu müteahhit" deger={`${skorlu(muteahhitler)}/${muteahhitler.length}`} />
        <Kpi etiket="Ofis" deger={String(ofisKirilim.length)} />
      </div>

      {/* MÜTEAHHİTLER */}
      <section className="kart belir belir-1 overflow-hidden !p-0">
        <div className="border-b border-hair px-5 py-3.5">
          <h2 className="font-display text-[15px] font-bold text-ink">Müteahhitler</h2>
          <p className="mt-0.5 text-[11.5px] text-gray">yanıt oranı · SLA · doğrulama sorumluluğu · stok tazeliği</p>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Güven</th>
                <th className="text-right">Yanıt</th>
                <th className="text-right">SLA</th>
                <th className="text-right">Doğrulama</th>
                <th className="text-right">Tazelik</th>
                <th className="text-right">Talep</th>
              </tr>
            </thead>
            <tbody>
              {muteahhitSirali.map((m) => (
                <tr key={m.uretici_id}>
                  <td className="font-semibold text-ink">{m.ad ?? "—"}</td>
                  <td><GuvenRozeti skor={m.skor} /></td>
                  <td className="mono text-right text-ink-soft">%{m.detay?.yanit_oran ?? 0}</td>
                  <td className="mono text-right text-ink-soft">%{m.detay?.sla_oran ?? 0}</td>
                  <td className="mono text-right text-ink-soft">%{m.detay?.dogrulama_oran ?? 0}</td>
                  <td className="mono text-right text-ink-soft">%{m.detay?.tazelik_oran ?? 0}</td>
                  <td className="mono text-right text-ink-soft">{m.detay?.talep_sayisi ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* EMLAKÇILAR — en düşük skor önce */}
      <section className="kart belir belir-2 overflow-hidden !p-0">
        <div className="border-b border-hair px-5 py-3.5">
          <h2 className="font-display text-[15px] font-bold text-ink">Danışmanlar</h2>
          <p className="mt-0.5 text-[11.5px] text-gray">dönüşüm vs israf · en düşük skor üstte (boş opsiyon riski)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Danışman</th>
                <th>Ofis</th>
                <th>Güven</th>
                <th className="text-right">Satış</th>
                <th className="text-right">Vazgeçme</th>
                <th className="text-right">Düşme</th>
                <th className="text-right">Başlatılan</th>
              </tr>
            </thead>
            <tbody>
              {emlakciSirali.map((e) => (
                <tr key={e.profil_id} style={e.skor != null && e.skor < 40 ? { background: "rgba(209,90,78,.06)", boxShadow: "inset 3px 0 0 var(--color-red)" } : undefined}>
                  <td className="font-semibold text-ink">{e.ad ?? "—"}</td>
                  <td className="text-ink-soft">{e.ofis_id ? ofisAd.get(e.ofis_id) ?? "—" : "—"}</td>
                  <td><GuvenRozeti skor={e.skor} /></td>
                  <td className="mono text-right text-green">{e.detay?.satis ?? 0}</td>
                  <td className="mono text-right text-ink-soft">{e.detay?.vazgecme ?? 0}</td>
                  <td className="mono text-right text-red">{e.detay?.dusme ?? 0}</td>
                  <td className="mono text-right text-ink-soft">{e.detay?.baslatilan ?? 0}</td>
                </tr>
              ))}
              {emlakcilar.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[13px] text-gray">Henüz danışman yok.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* OFİS KIRILIMI */}
      {ofisKirilim.length > 0 ? (
        <section className="kart belir belir-3 overflow-hidden !p-0">
          <div className="border-b border-hair px-5 py-3.5">
            <h2 className="font-display text-[15px] font-bold text-ink">Ofis Kırılımı</h2>
            <p className="mt-0.5 text-[11.5px] text-gray">danışman güven ortalaması (ofis bazında)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ofis</th>
                  <th className="text-right">Danışman</th>
                  <th>Ortalama güven</th>
                </tr>
              </thead>
              <tbody>
                {ofisKirilim.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold text-ink">{o.ad}</td>
                    <td className="mono text-right text-ink-soft">{o.danisman}</td>
                    <td><GuvenRozeti skor={o.ort} etiket="Ort" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="text-center text-[11px] text-gray">
        Skorlar events + opsiyon geçmişinden anlık hesaplanır · yeterli işlem yoksa &ldquo;Yeni&rdquo; · &lt;3 işlem skorlanmaz.
      </p>
    </div>
  );
}

function Kpi({ etiket, deger, renk = "text-ink" }: { etiket: string; deger: string; renk?: string }) {
  return (
    <div className="kart belir belir-1 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray">{etiket}</div>
      <div className={`mono mt-2 text-[26px] font-semibold leading-none ${renk}`}>{deger}</div>
    </div>
  );
}
