import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DURUM_ETIKET, zamanOnce, type BirimDurum } from "@/lib/types";
import { TalepGeriCekBtn } from "./TalepGeriCekBtn";
import { OpsiyonSonucBtn } from "./OpsiyonSonucBtn";

type TalepSatir = {
  id: string;
  created_at: string;
  birim: {
    id: string;
    daire_no: string | null;
    kat: number | null;
    liste_fiyati: number | null;
    para_birimi: string | null;
    proje: { id: string; ad: string } | null;
    tip: { ad: string | null; oda: string | null } | null;
  } | null;
};

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

/** Opsiyon kilit bitişine kalan süreyi insan-okur biçimde döndürür. */
function kalanSure(iso: string | null): { metin: string; bitti: boolean; acil: boolean } {
  if (!iso) return { metin: "süresiz", bitti: false, acil: false };
  const fark = new Date(iso).getTime() - Date.now();
  if (fark <= 0) return { metin: "süre doldu", bitti: true, acil: true };
  const saat = Math.floor(fark / 3_600_000);
  if (saat < 1) return { metin: `${Math.max(1, Math.floor(fark / 60_000))} dk kaldı`, bitti: false, acil: true };
  if (saat < 24) return { metin: `${saat} saat kaldı`, bitti: false, acil: saat < 6 };
  return { metin: `${Math.floor(saat / 24)} gün ${saat % 24} saat`, bitti: false, acil: false };
}

type OpsiyonSatir = {
  id: string;
  durum: BirimDurum;
  kilit_bitis: string | null;
  created_at: string;
  dogrulandi: boolean | null;
  dogrulama_bitis: string | null;
  musteri_ad: string | null;
  musteri_tel: string | null;
  uzatildi: boolean | null;
  birim: {
    id: string;
    daire_no: string | null;
    kat: number | null;
    liste_fiyati: number | null;
    para_birimi: string | null;
    durum: BirimDurum;
    proje: { id: string; ad: string; il: string | null; ilce: string | null; opsiyon_ayar: { uzatma_hakki?: boolean } | null } | null;
    tip: { ad: string | null; oda: string | null } | null;
  } | null;
};

export default async function Opsiyonlarim() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // RLS opsiyon_select → yalnız satici_id = auth.uid() (kendi opsiyonların)
  const { data } = await supabase
    .from("opsiyon")
    .select(
      "id, durum, kilit_bitis, created_at, dogrulandi, dogrulama_bitis, musteri_ad, musteri_tel, uzatildi, birim:birim_id(id, daire_no, kat, liste_fiyati, para_birimi, durum, proje:proje_id(id, ad, il, ilce, opsiyon_ayar), tip:tip_id(ad, oda))",
    )
    .eq("satici_id", user?.id ?? "")
    .in("durum", ["opsiyonlu", "satis_beklemede"])
    .order("kilit_bitis", { ascending: true });

  // Bekleyen opsiyon taleplerim (müteahhit onayında)
  const { data: talepData } = await supabase
    .from("opsiyon_talep")
    .select(
      "id, created_at, birim:birim_id(id, daire_no, kat, liste_fiyati, para_birimi, proje:proje_id(id, ad), tip:tip_id(ad, oda))",
    )
    .eq("talep_eden_id", user?.id ?? "")
    .eq("durum", "beklemede")
    .order("created_at", { ascending: false });
  const talepler = (talepData ?? []) as unknown as TalepSatir[];

  const liste = (data ?? []) as unknown as OpsiyonSatir[];
  const aktif = liste.length;
  const acilSayi = liste.filter((o) => kalanSure(o.kilit_bitis).acil && !kalanSure(o.kilit_bitis).bitti).length;

  return (
    <div className="mx-auto max-w-[1240px] text-ink">
      <header className="belir mb-6">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="rozet" style={{ background: "var(--color-amber-soft)", color: "#9a6a12" }}>
            <span className="freshdot nabiz" style={{ background: "var(--color-amber)" }} />
            48 saat kilit
          </span>
        </div>
        <h1 className="font-display text-[27px] font-bold leading-none tracking-tight text-navy md:text-[31px]">
          Opsiyonlarım
        </h1>
        <p className="mt-2 max-w-[560px] text-[13.5px] text-ink-soft">
          Senin için kilitli birimler. Süre dolmadan satışı tamamla — kilit bitince birim otomatik müsait olur ve başkası alabilir.
        </p>
      </header>

      {/* KPI */}
      <div className="belir belir-1 mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Aktif Opsiyon</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-amber">{aktif}</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Süresi Yakın</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-red">{acilSayi}</div>
          <div className="mt-1.5 text-[11.5px] text-slate-400">6 saatten az kalan</div>
        </div>
        <div className="kart kart-3d p-4">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">Projeler</span>
          <div className="mono mt-3 text-[30px] font-semibold leading-none text-navy">
            {new Set(liste.map((o) => o.birim?.proje?.id).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* BEKLEYEN TALEPLERİM — müteahhit onayında */}
      {talepler.length > 0 ? (
        <section className="kart belir belir-2 mb-6 overflow-hidden" style={{ borderLeft: "3px solid var(--color-teal)" }}>
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--cizgi)" }}>
            <h2 className="font-display text-[15px] font-bold text-ink">Bekleyen Taleplerim</h2>
            <span className="rozet" style={{ background: "var(--color-teal-soft)", color: "var(--color-teal-d)" }}>
              {talepler.length} onayda
            </span>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--cizgi)" }}>
            {talepler.map((t) => {
              const b = t.birim;
              const ps = PARA_SIMGE[b?.para_birimi ?? "TRY"] ?? "₺";
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink">
                      {b?.proje?.ad ?? "—"} · <span className="mono">{b?.daire_no ?? "—"}</span>
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-soft">
                      {b?.tip?.oda ?? b?.tip?.ad ?? "—"}
                      {b?.liste_fiyati != null ? ` · ${fmt(Number(b.liste_fiyati))} ${ps}` : ""}
                      {` · ${zamanOnce(t.created_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="lead-pill" style={{ background: "var(--color-teal-soft)", color: "var(--color-teal-d)" }}>
                      <span className="freshdot" style={{ background: "var(--color-teal)" }} />
                      Müteahhit onayında
                    </span>
                    {b?.proje ? <TalepGeriCekBtn talepId={t.id} projeId={b.proje.id} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {aktif === 0 ? (
        <div className="kart belir belir-2 p-14 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl" style={{ background: "rgba(227,161,44,.1)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 2" />
              <path d="M3.05 11a9 9 0 1 1 .5 4" />
              <path d="M3 4v4h4" />
            </svg>
          </div>
          <p className="text-[14px] font-bold text-ink">Aktif opsiyonun yok</p>
          <p className="mx-auto mt-1.5 max-w-[400px] text-[13px] leading-relaxed text-ink-soft">
            Havuzdan bir birimi 48 saatliğine opsiyonladığında burada listelenir. Müsait bir daire bul, detayından opsiyon al.
          </p>
          <Link href="/danisman" className="btn-action mt-5 inline-flex">
            Havuza Git
          </Link>
        </div>
      ) : (
        <>
          {/* Masaüstü tablo */}
          <div className="kart belir belir-2 hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Proje</th>
                    <th>Daire</th>
                    <th>Tip</th>
                    <th>Fiyat</th>
                    <th>Kalan Süre</th>
                    <th>Durum</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {liste.map((o) => {
                    const b = o.birim;
                    const gecici = o.dogrulandi === false;
                    const k = kalanSure(gecici ? o.dogrulama_bitis : o.kilit_bitis);
                    const ps = PARA_SIMGE[b?.para_birimi ?? "TRY"] ?? "₺";
                    const renk = k.bitti ? "var(--color-red)" : k.acil ? "var(--color-amber)" : "var(--color-green)";
                    return (
                      <tr key={o.id}>
                        <td>
                          {b?.proje ? (
                            <Link href={`/danisman/proje/${b.proje.id}`} className="font-semibold text-ink hover:text-teal">
                              {b.proje.ad}
                              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                                {[b.proje.il, b.proje.ilce].filter(Boolean).join(" · ")}
                              </span>
                            </Link>
                          ) : (
                            "—"
                          )}
                          {o.musteri_ad ? (
                            <span className="mt-0.5 block text-[11px] text-slate-400">Müşteri: {o.musteri_ad}</span>
                          ) : null}
                        </td>
                        <td className="mono font-semibold">{b?.daire_no ?? "—"}{b?.kat != null ? ` · ${b.kat}. kat` : ""}</td>
                        <td className="text-ink-soft">{b?.tip?.oda ?? b?.tip?.ad ?? "—"}</td>
                        <td className="mono font-semibold text-navy">
                          {b?.liste_fiyati != null ? `${fmt(Number(b.liste_fiyati))} ${ps}` : "—"}
                        </td>
                        <td>
                          <span className="lead-pill" style={{ background: "var(--color-navy-soft)", color: renk }}>
                            <span className="freshdot" style={{ background: renk }} />
                            {gecici ? `doğrulama · ${k.metin}` : k.metin}
                          </span>
                        </td>
                        <td>
                          <span className="durum d-opsiyon">
                            <span className="nokta" />
                            {gecici ? "Doğrulama bekliyor" : DURUM_ETIKET[o.durum]}
                          </span>
                        </td>
                        <td>
                          {b?.proje ? (
                            <div className="flex flex-col items-start gap-1.5">
                              <OpsiyonSonucBtn
                                birimId={b.id}
                                projeId={b.proje.id}
                                projeAd={b.proje.ad}
                                daireNo={b.daire_no}
                                musteriTel={o.musteri_tel}
                                kesin={!gecici}
                                uzatilabilir={b.proje.opsiyon_ayar?.uzatma_hakki !== false && o.uzatildi !== true}
                              />
                              <Link href={`/danisman/opsiyonlarim/sertifika/${o.id}`} className="text-[11px] font-semibold text-teal hover:underline">
                                Sertifika →
                              </Link>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobil kart */}
          <div className="belir belir-2 space-y-3 md:hidden">
            {liste.map((o) => {
              const b = o.birim;
              const gecici = o.dogrulandi === false;
              const k = kalanSure(gecici ? o.dogrulama_bitis : o.kilit_bitis);
              const ps = PARA_SIMGE[b?.para_birimi ?? "TRY"] ?? "₺";
              const renk = k.bitti ? "var(--color-red)" : k.acil ? "var(--color-amber)" : "var(--color-green)";
              const ust = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-bold leading-tight text-ink">{b?.proje?.ad ?? "—"}</p>
                      <p className="mt-0.5 text-[12px] text-ink-soft">
                        {[b?.proje?.il, b?.proje?.ilce].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="lead-pill flex-none" style={{ background: "var(--color-navy-soft)", color: renk }}>
                      <span className="freshdot" style={{ background: renk }} />
                      {gecici ? `doğrulama · ${k.metin}` : k.metin}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-[12px]" style={{ borderColor: "var(--cizgi)" }}>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Daire</span>
                      <span className="mono font-semibold text-ink">{b?.daire_no ?? "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tip</span>
                      <span className="font-semibold text-ink">{b?.tip?.oda ?? b?.tip?.ad ?? "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Fiyat</span>
                      <span className="mono font-semibold text-navy">
                        {b?.liste_fiyati != null ? `${fmt(Number(b.liste_fiyati))} ${ps}` : "—"}
                      </span>
                    </div>
                  </div>
                  {o.musteri_ad ? (
                    <p className="mt-2 text-[11.5px] text-ink-soft">
                      <span className="text-slate-400">Müşteri:</span> {o.musteri_ad}
                      {gecici ? <span className="text-slate-400"> · müteahhit doğrulaması bekliyor</span> : null}
                    </p>
                  ) : null}
                </>
              );
              return (
                <article key={o.id} className="kart kart-3d signal-top p-4" style={{ ["--_sig" as string]: "var(--color-amber)" }}>
                  {b?.proje ? (
                    <Link href={`/danisman/proje/${b.proje.id}`} className="block">
                      {ust}
                    </Link>
                  ) : (
                    ust
                  )}
                  {b?.proje ? (
                    <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--cizgi)" }}>
                      <OpsiyonSonucBtn
                        birimId={b.id}
                        projeId={b.proje.id}
                        projeAd={b.proje.ad}
                        daireNo={b.daire_no}
                        musteriTel={o.musteri_tel}
                        kesin={!gecici}
                        uzatilabilir={b.proje.opsiyon_ayar?.uzatma_hakki !== false && o.uzatildi !== true}
                      />
                      <Link href={`/danisman/opsiyonlarim/sertifika/${o.id}`} className="mt-2 inline-block text-[12px] font-semibold text-teal hover:underline">
                        Talep sertifikası →
                      </Link>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-[11.5px] text-slate-400">
        Opsiyon süresi dolduğunda birim otomatik müsait olur. Tazelik &amp; çift-satış kalkanı DB&apos;de — {zamanOnce(new Date().toISOString())} senkron.
      </p>
    </div>
  );
}
