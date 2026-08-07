"use client";

import { useCallback, useEffect, useState } from "react";

type Aday = {
  id: string;
  firma_adi: string;
  segment: string;
  kisi: string | null;
  email: string | null;
  telefon: string | null;
  website: string | null;
  il: string | null;
  ilce: string | null;
  ozet: string | null;
  kaynak: string | null;
  durum: string;
  temas_sayisi: number;
  opt_out: boolean;
};

const SEGMENTLER = [
  { key: "muteahhit", etiket: "Müteahhit" },
  { key: "proje", etiket: "Proje" },
  { key: "ofis", etiket: "Emlak ofisi" },
  { key: "emlakci", etiket: "Emlakçı" },
] as const;

const SEGMENT_RENK: Record<string, string> = {
  muteahhit: "bg-teal/10 text-teal-d",
  proje: "bg-navy/10 text-navy",
  ofis: "bg-soft text-gray",
  emlakci: "bg-amber/10 text-amber-d",
};

const DURUM_ETIKET: Record<string, string> = {
  yeni: "Yeni",
  davet_edildi: "Davet edildi",
  acildi: "Açıldı",
  kayit_oldu: "Kayıt oldu",
  reddedildi: "Reddedildi",
  soguk: "Soğuk",
};

const HUNI_SIRA = ["yeni", "davet_edildi", "kayit_oldu"];

const btnBirincil =
  "rounded-xl px-3.5 py-2 text-sm font-semibold text-white shadow-card transition-opacity hover:opacity-90 disabled:opacity-50";
const btnIkincil =
  "rounded-xl border border-hair bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-teal disabled:opacity-40";
const inp = "rounded-xl border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal";

export function KesifPanel() {
  const [il, setIl] = useState("");
  const [segSecim, setSegSecim] = useState<Set<string>>(new Set(["muteahhit", "proje"]));
  const [adaylar, setAdaylar] = useState<Aday[]>([]);
  const [huni, setHuni] = useState<Record<string, number>>({});
  const [filtreDurum, setFiltreDurum] = useState("");
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [kesfediliyor, setKesfediliyor] = useState(false);
  const [davetEdilen, setDavetEdilen] = useState<string | null>(null);

  const yukle = useCallback(async (durum = "") => {
    const q = durum ? `?durum=${encodeURIComponent(durum)}` : "";
    const res = await fetch(`/api/admin/kesif${q}`);
    if (!res.ok) return;
    const d = (await res.json()) as { adaylar: Aday[]; huni: Record<string, number> };
    setAdaylar(d.adaylar);
    setHuni(d.huni);
  }, []);

  useEffect(() => {
    // Mount'ta aday havuzunu çek (setState await sonrası — mount-fetch deseni).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void yukle();
  }, [yukle]);

  const segAç = (k: string) =>
    setSegSecim((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  async function kesfet() {
    setHata(null);
    setMesaj(null);
    if (il.trim().length < 2 || segSecim.size === 0) {
      setHata("İl ve en az bir segment seç.");
      return;
    }
    setKesfediliyor(true);
    try {
      const res = await fetch("/api/admin/kesif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ il: il.trim(), segmentler: [...segSecim] }),
      });
      const d = await res.json();
      if (!res.ok) setHata(d.hata ?? "Keşif hatası");
      else {
        setMesaj(`${d.eklenen} yeni aday eklendi (${d.bulunan} bulundu · ${d.mailBulunan ?? 0} e-posta çıkarıldı).`);
        await yukle(filtreDurum);
      }
    } catch (e) {
      setHata((e as Error).message);
    } finally {
      setKesfediliyor(false);
    }
  }

  async function davet(aday: Aday, kanal: "email" | "whatsapp") {
    setHata(null);
    setMesaj(null);
    setDavetEdilen(aday.id);
    try {
      const res = await fetch("/api/admin/kesif/davet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adayId: aday.id, kanal }),
      });
      const d = await res.json();
      if (!res.ok) setHata(d.hata ?? "Davet hatası");
      else {
        // WhatsApp: sunucu göndermez → deep-link'i yeni sekmede aç (admin gönderir).
        if (d.waUrl) window.open(d.waUrl, "_blank", "noopener");
        setMesaj(kanal === "whatsapp" ? `${aday.firma_adi} — WhatsApp açıldı, gönder.` : `${aday.firma_adi} davet edildi.`);
        await yukle(filtreDurum);
      }
    } catch (e) {
      setHata((e as Error).message);
    } finally {
      setDavetEdilen(null);
    }
  }

  async function segmentDegistir(id: string, segment: string) {
    setHata(null);
    const res = await fetch("/api/admin/kesif", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, segment }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setHata(d.hata ?? "Segment güncellenemedi");
      return;
    }
    await yukle(filtreDurum);
  }

  function filtrele(durum: string) {
    setFiltreDurum(durum);
    void yukle(durum);
  }

  return (
    <div className="space-y-4">
      {/* Kampanya başlatıcı */}
      <section className="belir belir-1 rounded-2xl border border-hair bg-card p-5">
        <h2 className="mb-3 font-display text-[16px] font-bold text-ink">Yeni keşif kampanyası</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[13px] font-semibold text-ink">
            İl
            <input value={il} onChange={(e) => setIl(e.target.value)} placeholder="ör. Ankara" className={inp} style={{ width: 180 }} />
          </label>
          <div className="flex flex-col gap-1 text-[13px] font-semibold text-ink">
            Segmentler
            <div className="flex flex-wrap gap-1.5">
              {SEGMENTLER.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => segAç(s.key)}
                  className={`rozet mono px-2.5 py-1.5 text-[12px] transition-colors ${
                    segSecim.has(s.key) ? "bg-teal/15 text-teal-d" : "bg-soft text-gray"
                  }`}
                >
                  {segSecim.has(s.key) ? "● " : ""}
                  {s.etiket}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={kesfet}
            disabled={kesfediliyor}
            className={btnBirincil}
            style={{ background: "linear-gradient(150deg,#1b5e6e,#1e9b8a)" }}
          >
            {kesfediliyor ? "Keşfediliyor…" : "Keşfet"}
          </button>
        </div>
        <p className="mt-2.5 text-[12px] text-gray">
          Yeni/aktif proje niyetli sorgular (lansman · inşaat · satışta) + son 1 yıl tazelik. SerpAPI/Serper/Places.
        </p>
      </section>

      {/* Huni */}
      <section className="flex flex-wrap gap-2">
        {HUNI_SIRA.map((k) => (
          <div key={k} className="belir belir-1 flex-1 rounded-xl border border-hair bg-card px-3.5 py-2.5">
            <div className="mono text-[20px] font-bold text-ink">{huni[k] ?? 0}</div>
            <div className="text-[12px] text-ink-soft">{DURUM_ETIKET[k]}</div>
          </div>
        ))}
      </section>

      {(hata || mesaj) && (
        <div>
          {hata ? (
            <p role="alert" className="rounded-xl border border-red/30 bg-red-soft px-3.5 py-2.5 text-sm font-medium text-red">
              {hata}
            </p>
          ) : null}
          {mesaj ? (
            <p className="rounded-xl border border-green/30 bg-green-soft px-3.5 py-2.5 text-sm font-medium text-teal-d">
              {mesaj}
            </p>
          ) : null}
        </div>
      )}

      {/* Filtre */}
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <span className="text-[12px] text-gray">Filtre:</span>
        {["", "yeni", "davet_edildi", "kayit_oldu"].map((d) => (
          <button
            key={d || "hepsi"}
            type="button"
            onClick={() => filtrele(d)}
            className={`rozet mono px-2 py-1 text-[11.5px] transition-colors ${
              filtreDurum === d ? "bg-navy/10 text-navy" : "bg-soft text-gray"
            }`}
          >
            {d ? DURUM_ETIKET[d] : "Hepsi"}
          </button>
        ))}
      </div>

      {/* Aday listesi */}
      <section className="space-y-2">
        {adaylar.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hair bg-card px-5 py-8 text-center text-sm text-ink-soft">
            Henüz aday yok. Yukarıdan bir keşif kampanyası başlat.
          </p>
        ) : (
          adaylar.map((a) => {
            const rolDavet = a.segment !== "proje";
            const davetlenebilir =
              rolDavet && !a.opt_out && (!!a.email || !!a.telefon) && !["kayit_oldu", "reddedildi"].includes(a.durum);
            return (
              <article key={a.id} className="belir belir-1 rounded-2xl border border-hair bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[15px] font-bold text-ink">{a.firma_adi}</span>
                      <select
                        value={a.segment}
                        onChange={(e) => segmentDegistir(a.id, e.target.value)}
                        title="Segment yanlışsa düzelt (davet rolü + pitch buna göre)"
                        className={`rozet mono cursor-pointer border-0 text-[11px] outline-none ${SEGMENT_RENK[a.segment] ?? "bg-soft text-gray"}`}
                      >
                        {SEGMENTLER.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.etiket}
                          </option>
                        ))}
                      </select>
                      <span className="rozet mono bg-soft text-[11px] text-gray">{DURUM_ETIKET[a.durum] ?? a.durum}</span>
                      {a.opt_out ? <span className="rozet mono bg-red-soft text-[11px] text-red">opt-out</span> : null}
                    </div>
                    {a.ozet ? <p className="mt-1 text-[13px] text-ink-soft">{a.ozet}</p> : null}
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-gray">
                      {a.il ? <span>{a.il}{a.ilce ? ` · ${a.ilce}` : ""}</span> : null}
                      {a.telefon ? <span className="mono">☎ {a.telefon}</span> : null}
                      {a.email ? <span className="mono">✉ {a.email}</span> : null}
                      {a.website ? (
                        <a href={a.website} target="_blank" rel="noreferrer" className="text-teal-d hover:underline">
                          web
                        </a>
                      ) : null}
                      {a.kaynak ? <span className="text-gray/70">{a.kaynak}</span> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => davet(a, "whatsapp")}
                      disabled={!davetlenebilir || !a.telefon || davetEdilen === a.id}
                      className="rounded-xl px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: "#25D366" }}
                      title={!rolDavet ? "Proje adayı doğrudan davet edilemez" : a.opt_out ? "Opt-out" : !a.telefon ? "Telefon yok" : "WhatsApp'ta davet mesajı aç"}
                    >
                      {davetEdilen === a.id ? "…" : "WhatsApp davet"}
                    </button>
                    <button
                      type="button"
                      onClick={() => davet(a, "email")}
                      disabled={!davetlenebilir || !a.email || davetEdilen === a.id}
                      className={btnIkincil}
                      title={!a.email ? "E-posta yok (WhatsApp kullan)" : "E-posta davet gönder"}
                    >
                      E-posta davet
                    </button>
                    {a.durum === "davet_edildi" ? <span className="text-[11px] text-teal-d">✓ davet edildi</span> : null}
                    {a.temas_sayisi > 0 ? <span className="text-[11px] text-gray">{a.temas_sayisi} temas</span> : null}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
