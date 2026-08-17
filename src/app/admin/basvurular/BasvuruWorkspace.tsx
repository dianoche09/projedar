"use client";

import { useEffect, useState, useTransition } from "react";
import { getDosya, kullaniciOnayla, kullaniciReddet, belgeKarar, type DosyaVeri } from "../actions";
import { ROL_ETIKET, type Rol } from "@/lib/roller";
import { zamanOnce } from "@/lib/types";
import { Avatar } from "../_ortak";
import {
  profilDetaySatirlar,
  DOGRULANABILIR_ALAN,
  BELGE_TIP_AD,
  aiRozet,
  type AiSonuc,
} from "@/lib/basvuruDetay";

export type KuyrukSatir = {
  id: string;
  ad: string | null;
  telefon: string | null;
  talep_rol: string | null;
  il: string | null;
  ilce: string | null;
  durum: string | null;
  belge_durumu: string | null;
  created_at: string;
};

const ATANABILIR: Rol[] = ["uretici", "emlakci", "ofis_yetkili", "marka_yetkili", "arsa_sahibi"];

const ROL_ROZET: Record<string, string> = {
  uretici: "bg-navy/10 text-navy",
  emlakci: "bg-teal/12 text-teal-d",
  ofis_yetkili: "bg-amber-soft text-amber",
  marka_yetkili: "bg-navy/10 text-navy",
  arsa_sahibi: "bg-gray/12 text-gray",
};

const sel =
  "rounded-lg border border-hair bg-soft px-2.5 py-1.5 text-[13px] text-ink outline-none transition-colors focus:border-teal";

/** hesap durumu → rozet sınıfı + etiket */
function hesapCip(durum: string | null): { cls: string; t: string } {
  if (durum === "onay_bekliyor") return { cls: "bg-amber-soft text-amber", t: "hesap: onay bekliyor" };
  if (durum === "aktif") return { cls: "bg-green-soft text-teal-d", t: "hesap: aktif" };
  return { cls: "bg-gray/12 text-gray", t: `hesap: ${durum ?? "—"}` };
}

/** belge durumu → rozet sınıfı + etiket */
function belgeCip(bd: string | null): { cls: string; t: string } {
  switch (bd) {
    case "beklemede":
      return { cls: "bg-amber-soft text-amber", t: "belge: beklemede" };
    case "dogrulandi":
      return { cls: "bg-green-soft text-teal-d", t: "belge: doğrulandı ✓" };
    case "red":
      return { cls: "bg-red-soft text-red", t: "belge: red" };
    default:
      return { cls: "bg-gray/12 text-gray", t: "belge: yok" };
  }
}

export default function BasvuruWorkspace({
  kuyruk,
  ofisler,
}: {
  kuyruk: KuyrukSatir[];
  ofisler: { id: string; ad: string }[];
}) {
  const [seciliId, setSeciliId] = useState<string | null>(kuyruk[0]?.id ?? null);
  const [dosya, setDosya] = useState<DosyaVeri | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, basla] = useTransition();

  const [q, setQ] = useState("");
  const [fRol, setFRol] = useState("");
  const [fBelge, setFBelge] = useState("");

  function yukleDosya(id: string) {
    basla(async () => {
      const r = await getDosya(id);
      if (r.ok) {
        setDosya(r.veri);
        setHata(null);
      } else {
        setDosya(null);
        setHata(r.hata);
      }
    });
  }

  function sec(id: string) {
    setSeciliId(id);
    yukleDosya(id);
  }

  // ilk yüklemede seçili başvuranı çek (transition içinde → senkron setState yok)
  useEffect(() => {
    if (seciliId) yukleDosya(seciliId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suzulmus = kuyruk.filter((k) => {
    if (fRol && k.talep_rol !== fRol) return false;
    if (fBelge && (k.belge_durumu ?? "yok") !== fBelge) return false;
    if (q) {
      const h = `${k.ad ?? ""} ${k.telefon ?? ""}`.toLowerCase();
      if (!h.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[390px_1fr]">
      {/* ---------- SOL: KUYRUK ---------- */}
      <div className="kart flex flex-col gap-3 p-3.5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-150px)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-hair bg-card px-3 py-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray)" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ad veya telefon ara…"
              className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-gray"
            />
          </div>
          <div className="flex gap-2">
            <select value={fRol} onChange={(e) => setFRol(e.target.value)} className={`${sel} flex-1`}>
              <option value="">Rol: tümü</option>
              <option value="uretici">Üretici</option>
              <option value="emlakci">Emlakçı</option>
              <option value="ofis_yetkili">Ofis</option>
            </select>
            <select value={fBelge} onChange={(e) => setFBelge(e.target.value)} className={`${sel} flex-1`}>
              <option value="">Belge: tümü</option>
              <option value="beklemede">Beklemede</option>
              <option value="dogrulandi">Doğrulandı</option>
              <option value="red">Red</option>
              <option value="yok">Yok</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between px-0.5">
          <span className="mono text-[11px] tracking-wide text-gray">KUYRUK · {suzulmus.length} başvuru</span>
          <span className="text-[11px] text-gray">yeni → eski</span>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {suzulmus.length === 0 ? (
            <p className="px-1 py-8 text-center text-xs text-gray">Eşleşen başvuru yok.</p>
          ) : (
            suzulmus.map((k) => {
              const aktif = k.id === seciliId;
              const rol = k.talep_rol ?? "emlakci";
              const hc = hesapCip(k.durum);
              const bc = belgeCip(k.belge_durumu);
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => sec(k.id)}
                  className={`rounded-2xl border bg-card p-3 text-left transition-all hover:-translate-y-px ${
                    aktif ? "border-teal/45 ring-1 ring-teal/30" : "border-hair"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar ad={k.ad} id={k.id} boyut={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-ink">{k.ad ?? "—"}</span>
                        <span className={`rozet ${ROL_ROZET[rol] ?? "bg-gray/12 text-gray"}`}>{ROL_ETIKET[rol as Rol]}</span>
                      </div>
                      <div className="mono mt-0.5 truncate text-[11px] text-gray">
                        {[k.il, k.ilce].filter(Boolean).join(" · ") || "konum —"} · {zamanOnce(k.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rozet ${hc.cls}`}>{hc.t}</span>
                    <span className={`rozet ${bc.cls}`}>{bc.t}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ---------- SAĞ: DOSYA ---------- */}
      <div>
        {yukleniyor && !dosya ? (
          <div className="kart p-10 text-center text-sm text-gray">Dosya yükleniyor…</div>
        ) : hata ? (
          <div className="kart p-8 text-center text-sm text-red">{hata}</div>
        ) : !dosya ? (
          <div className="kart px-5 py-16 text-center">
            <p className="text-sm font-semibold text-ink">Bir başvuru seç</p>
            <p className="mt-1 text-xs text-gray">Soldan bir başvuru seçince tüm dosyası burada açılır.</p>
          </div>
        ) : (
          <Dosya key={dosya.id} veri={dosya} ofisler={ofisler} />
        )}
      </div>
    </div>
  );
}

const KESIT = "flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-wider text-gray";
const TIP_AD: Record<string, string> = {
  onay: "Hesap onayı",
  dogrulama: "Belge doğrulama",
  abonelik: "Abonelik",
  opsiyon: "Opsiyon",
  satis: "Satış",
  durum: "Durum değişimi",
  lead: "Lead",
  paylasim: "Paylaşım",
};

function Dosya({ veri, ofisler }: { veri: DosyaVeri; ofisler: { id: string; ad: string }[] }) {
  const rol = veri.talep_rol ?? "emlakci";
  const hc = hesapCip(veri.durum);
  const bc = belgeCip(veri.belge_durumu);
  const dog = DOGRULANABILIR_ALAN[rol];
  const dogDeger = dog ? veri.profil_detay?.[dog.key] : null;
  const satirlar = profilDetaySatirlar(rol, veri.profil_detay).filter((s) => s.key !== dog?.key);
  const davet = (veri.kayit_meta?.davet_eden as string | undefined) ?? null;

  return (
    <div className="kart signal-top overflow-hidden" style={{ ["--_sig" as string]: "var(--color-amber)" }}>
      {/* başlık */}
      <div className="flex flex-wrap items-start gap-4 px-6 pb-4 pt-5">
        <Avatar ad={veri.ad} id={veri.id} boyut={52} />
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-bold text-ink">{veri.ad ?? "—"}</h2>
            <span className={`rozet ${ROL_ROZET[rol] ?? "bg-gray/12 text-gray"}`}>{ROL_ETIKET[rol as Rol]} başvurusu</span>
          </div>
          <div className="mono mt-1.5 text-[12.5px] text-ink-soft">
            {veri.telefon ?? "tel —"} · başvuru {zamanOnce(veri.created_at)}
            {davet ? ` · davet: ${davet}` : ""}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rozet ${hc.cls}`}>● {hc.t}</span>
          <span className={`rozet ${bc.cls}`}>● {bc.t}</span>
        </div>
      </div>

      <div className="space-y-6 px-6 pb-5">
        {/* KİMLİK & YETKİ */}
        <section>
          <div className={`${KESIT} mb-2`}>
            <span>Kimlik &amp; Yetki</span>
            <span className="h-px flex-1 bg-hair" />
          </div>

          {dog && dogDeger ? (
            <div className="mb-2.5 flex flex-wrap items-center gap-3 rounded-xl border border-teal/20 bg-teal-soft/60 px-3.5 py-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-gray">{DOGRULANABILIR_ALAN[rol]?.kaynak}&apos;den doğrulanabilir belge no</div>
                <div className="mono mt-0.5 text-[15px] font-semibold text-navy">{String(dogDeger)}</div>
              </div>
              <a
                href={`https://www.turkiye.gov.tr/`}
                target="_blank"
                rel="noopener noreferrer"
                title="Kamu doğrulama servisi"
                className="rounded-lg border border-hair bg-card px-3 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:bg-soft"
              >
                {DOGRULANABILIR_ALAN[rol]?.kaynak}&apos;de doğrula ↗
              </a>
            </div>
          ) : null}

          {satirlar.length === 0 && !dogDeger ? (
            <p className="text-[13px] text-gray">Kayıt detayı girilmemiş.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {satirlar.map((s) => (
                <div key={s.key} className="flex items-baseline justify-between gap-3 border-b border-dashed border-hair py-2">
                  <span className="text-[12px] text-gray">{s.etiket}</span>
                  <span className={`text-[13px] font-medium text-ink ${s.maskeli ? "mono" : ""}`}>
                    {s.deger}
                    {s.maskeli ? <span className="ml-1 text-[11px] font-normal text-gray">(KVKK · maskeli)</span> : null}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* KYC BELGELER */}
        {veri.belgeler.length > 0 ? (
          <section>
            <div className={`${KESIT} mb-2.5`}>
              <span>KYC Belgeleri</span>
              <span className="rozet bg-teal/12 text-teal-d">AI ön-tarama</span>
              <span className="h-px flex-1 bg-hair" />
            </div>
            <div className="flex flex-col gap-2.5">
              {veri.belgeler.map((b, i) => {
                const ai = (b.ai_sonuc ?? null) as AiSonuc;
                const rz = aiRozet(ai);
                const ozet = ai?.ozet;
                const aiCls =
                  rz.ton === "ok"
                    ? "border-green/25 bg-green-soft text-teal-d"
                    : rz.ton === "dikkat"
                      ? "border-amber/30 bg-amber-soft text-[#8a5e11]"
                      : "border-hair bg-soft text-gray";
                return (
                  <div key={i} className="rounded-2xl border border-hair bg-soft p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-ink">{BELGE_TIP_AD[b.tip] ?? b.tip}</span>
                      {b.imzali ? (
                        <a href={b.imzali} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-teal-d hover:underline">
                          Görüntüle →
                        </a>
                      ) : (
                        <span className="text-[12px] text-gray">açılamadı</span>
                      )}
                    </div>
                    <div className="mono mb-2 mt-1 text-[11px] text-gray">{zamanOnce(b.created_at)} yüklendi</div>
                    <div className={`rounded-lg border px-2.5 py-2 text-[11.5px] leading-relaxed ${aiCls}`}>
                      <b>{rz.etiket}</b>
                      {ozet ? <div className="mt-0.5">{ozet}</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* BAŞVURU İZİ */}
        {veri.olaylar.length > 0 ? (
          <section>
            <div className={`${KESIT} mb-3`}>
              <span>Başvuru İzi</span>
              <span className="h-px flex-1 bg-hair" />
            </div>
            <ul className="space-y-0">
              {veri.olaylar.map((o) => {
                const pl = (o.payload ?? {}) as Record<string, unknown>;
                const ek = (pl.eylem ?? pl.karar) as string | undefined;
                return (
                  <li key={o.id} className="relative border-l border-hair pb-3 pl-4 last:border-l-transparent last:pb-0">
                    <span className="absolute -left-[5px] top-1 size-2.5 rounded-full border-2 border-card bg-teal" />
                    <div className="text-[13px] font-semibold text-ink">
                      {TIP_AD[o.tip] ?? o.tip}
                      {ek ? <span className="ml-1.5 font-normal text-gray">· {ek}</span> : null}
                    </div>
                    <div className="mono mt-0.5 text-[11px] text-gray">{zamanOnce(o.created_at)}</div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      {/* KARAR PANELİ */}
      <div className="border-t border-hair bg-soft/60 px-6 py-4">
        <div className="flex flex-wrap items-end gap-3.5">
          {/* Rol/onay kararı YALNIZ yeni hesap onayında (durum=onay_bekliyor). Zaten aktif hesap
              sadece KYC belgesi için kuyruğa girmişse rol butonu gösterme → yanlış tıkla rol düşmesin. */}
          {veri.durum === "onay_bekliyor" ? (
          <form action={kullaniciOnayla} className="flex flex-wrap items-end gap-3.5">
            <input type="hidden" name="kullanici_id" value={veri.id} />
            <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-gray">
              Rol ata
              <select name="rol" defaultValue={rol} className={sel}>
                {ATANABILIR.map((r) => (
                  <option key={r} value={r}>
                    {ROL_ETIKET[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] font-semibold text-gray">
              Ofis
              <select name="ofis_id" defaultValue={veri.ofis_id ?? ""} className={sel}>
                <option value="">(yok)</option>
                {ofisler.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.ad}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-navy px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#0e2740]">
                Onayla &amp; Aktifleştir
              </button>
              <button
                formAction={kullaniciReddet}
                className="rounded-xl border border-red/30 bg-card px-3.5 py-2.5 text-[13px] font-semibold text-red transition-colors hover:bg-red-soft"
              >
                Reddet
              </button>
            </div>
          </form>
          ) : null}

          {veri.belge_durumu === "beklemede" ? (
            <div className="flex items-center gap-2">
              <form action={belgeKarar}>
                <input type="hidden" name="profile_id" value={veri.id} />
                <input type="hidden" name="karar" value="onay" />
                <button className="rounded-xl border border-green/35 bg-green/12 px-3.5 py-2.5 text-[13px] font-semibold text-teal-d transition-colors hover:bg-green/20">
                  Belge Doğrula ✓
                </button>
              </form>
              <form action={belgeKarar}>
                <input type="hidden" name="profile_id" value={veri.id} />
                <input type="hidden" name="karar" value="red" />
                <button className="rounded-xl border border-red/30 bg-card px-3.5 py-2.5 text-[13px] font-semibold text-red transition-colors hover:bg-red-soft">
                  Belge Reddet
                </button>
              </form>
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Hassas veri (TCKN, belge no) yalnız admin görür · her karar denetim iz zincirine yazılır.
        </div>
      </div>
    </div>
  );
}
