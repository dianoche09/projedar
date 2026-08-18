"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tahsisGuncelle } from "@/app/uretici/actions";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/ui/SubmitButton";

/* Tahsis düzenle modalı — TahsisForm alan setini (hedef TEK-seçim + kapsam + gelişmiş şartlar)
   prefill değerleriyle `tahsisGuncelle`'ye bağlar. Tek satır = tek alıcı (segment/ofis/danışman/tüm ağ). */

const inp = "rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal";

/** Modül seviyesi sarmalayıcı: render pürlük kuralına takılmadan şimdiki zaman (bitiş → kalan gün). */
function simdiMs(): number {
  return Date.now();
}

const TURLER: [string, string][] = [
  ["daire", "Daire"],
  ["dukkan", "Dükkan"],
  ["ofis", "Ofis"],
  ["villa", "Villa"],
  ["depo", "Depo"],
  ["otopark", "Otopark"],
];

const UZMANLIKLAR: [string, string][] = [
  ["", "Tümü"],
  ["konut", "Konut"],
  ["ticari", "Ticari"],
  ["arsa", "Arsa"],
  ["proje", "Proje"],
];

type Modu = "tum_ag" | "segment" | "ofis" | "danisman";
const MODLAR: { v: Modu; ad: string }[] = [
  { v: "tum_ag", ad: "Tüm ağ" },
  { v: "segment", ad: "Segment" },
  { v: "ofis", ad: "Ofis" },
  { v: "danisman", ad: "Danışman" },
];

export type TahsisPrefill = {
  id: string;
  proje_id: string;
  hedef_tip: "herkes" | "ofis" | "danisman";
  hedef_id: string | null;
  hedef_filtre: { marka?: string; il?: string; ilce?: string; uzmanlik?: string } | null;
  kapsam: {
    bloklar?: string[];
    katlar?: (string | number)[];
    tipler?: string[];
    turler?: string[];
    birimler?: string[];
  } | null;
  komisyon_tip: "yuzde" | "sabit" | "yok";
  komisyon_deger: number | null;
  munhasir: boolean | null;
  kontenjan: number | null;
  fiyat_gorunur: boolean | null;
  bitis: string | null;
};

type Emlakci = { id: string; ad: string | null; ofis: string | null };

function Cip({ name, value, etiket, checked }: { name: string; value: string; etiket: string; checked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="inline-block rounded-lg border border-hair bg-card px-2.5 py-1.5 text-[13px] text-ink transition-colors peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-hover:border-teal">
        {etiket}
      </span>
    </label>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink">{baslik}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function TahsisDuzenleModal({
  tahsis,
  bloklar,
  katlar,
  tipler,
  birimler,
  ofisler,
  secenekler,
  emlakciAd,
}: {
  tahsis: TahsisPrefill;
  bloklar: { id: string; ad: string | null }[];
  katlar: number[];
  tipler: { id: string; ad: string | null; oda: string | null }[];
  birimler: { id: string; daire_no: string | null; blok_id: string | null; kat: number | null }[];
  ofisler: { id: string; ad: string }[];
  secenekler: { markalar: string[]; iller: string[]; ilceler: string[] };
  /** Mevcut danışman adı (hedef_tip='danisman' prefill etiketi). */
  emlakciAd?: string | null;
}) {
  const [acik, setAcik] = useState(false);

  const baslangicModu: Modu =
    tahsis.hedef_tip === "ofis"
      ? "ofis"
      : tahsis.hedef_tip === "danisman"
        ? "danisman"
        : tahsis.hedef_filtre && Object.keys(tahsis.hedef_filtre).length
          ? "segment"
          : "tum_ag";

  const kapsamVar =
    !!tahsis.kapsam &&
    (["bloklar", "katlar", "tipler", "turler", "birimler"] as const).some((k) => (tahsis.kapsam?.[k] ?? []).length);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="btn-action h-auto min-h-0 px-2.5 py-[5px] text-[11px]"
      >
        Düzenle
      </button>
      {acik ? (
        <ModalGovde
          tahsis={tahsis}
          bloklar={bloklar}
          katlar={katlar}
          tipler={tipler}
          birimler={birimler}
          ofisler={ofisler}
          secenekler={secenekler}
          emlakciAd={emlakciAd}
          baslangicModu={baslangicModu}
          kapsamVar={kapsamVar}
          onKapat={() => setAcik(false)}
        />
      ) : null}
    </>
  );
}

function ModalGovde({
  tahsis,
  bloklar,
  katlar,
  tipler,
  birimler,
  ofisler,
  secenekler,
  emlakciAd,
  baslangicModu,
  kapsamVar,
  onKapat,
}: {
  tahsis: TahsisPrefill;
  bloklar: { id: string; ad: string | null }[];
  katlar: number[];
  tipler: { id: string; ad: string | null; oda: string | null }[];
  birimler: { id: string; daire_no: string | null; blok_id: string | null; kat: number | null }[];
  ofisler: { id: string; ad: string }[];
  secenekler: { markalar: string[]; iller: string[]; ilceler: string[] };
  emlakciAd?: string | null;
  baslangicModu: Modu;
  kapsamVar: boolean;
  onKapat: () => void;
}) {
  const [modu, setModu] = useState<Modu>(baslangicModu);
  const [kapsamTip, setKapsamTip] = useState<"tum" | "belirli">(kapsamVar ? "belirli" : "tum");
  const [komisyon, setKomisyon] = useState<"yuzde" | "sabit" | "yok">(tahsis.komisyon_tip);
  const overrideRef = useRef<HTMLInputElement>(null);
  const gectiRef = useRef(false);

  // B4/U-01: kaydetmede münhasır kapsam çakışmasını ön-kontrol (kendini hariç tut); çakışmada müteahhit
  // onaylarsa munhasir_override=1 ile geçir (server enforcement ayrıca doğrular).
  async function kontrolluGonder(e: React.FormEvent<HTMLFormElement>) {
    if (gectiRef.current) { gectiRef.current = false; return; }
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const munhasir = fd.get("munhasir") === "on";
    const kapsam: Record<string, string[]> = {};
    if (fd.get("kapsam_tip") === "belirli") {
      for (const k of ["bloklar", "katlar", "tipler", "turler", "birimler"]) {
        const v = fd.getAll(k).map(String).filter(Boolean);
        if (v.length) kapsam[k] = v;
      }
    }
    let cakisma = false;
    let ornek: string | null | undefined;
    try {
      const { data } = await createClient().rpc("tahsis_munhasir_cakisma", {
        p_proje_id: tahsis.proje_id, p_kapsam: kapsam, p_munhasir: munhasir, p_haric_id: tahsis.id,
      });
      const list = (data ?? []) as { ornek_daire?: string | null }[];
      cakisma = list.length > 0;
      ornek = list[0]?.ornek_daire;
    } catch {
      /* RPC yok/hata → server enforcement yakalar */
    }
    if (cakisma) {
      const ok = window.confirm(
        `Bu kapsam başka bir aktif tahsisle çakışıyor — münhasırlık geçersiz olur${ornek ? ` (örn. Daire ${ornek})` : ""}. Yine de kaydedilsin mi?`,
      );
      if (!ok) return;
      if (overrideRef.current) overrideRef.current.value = "1";
    }
    gectiRef.current = true;
    form.requestSubmit();
  }

  // bitis → kalan gün (edit süreyi şimdiden yeniden başlatır; add-form ile aynı semantik)
  const bitisGun = useMemo(() => {
    if (!tahsis.bitis) return "";
    const g = Math.ceil((new Date(tahsis.bitis).getTime() - simdiMs()) / 86_400_000);
    return g > 0 ? String(g) : "";
  }, [tahsis.bitis]);

  const secili = (k: "bloklar" | "katlar" | "tipler" | "turler" | "birimler", v: string) =>
    (tahsis.kapsam?.[k] ?? []).map(String).includes(v);

  const blokAd = useMemo(() => new Map(bloklar.map((b) => [b.id, b.ad])), [bloklar]);
  const bloklaGruplu = useMemo(() => {
    const gruplar = new Map<string, { id: string; daire_no: string | null; kat: number | null }[]>();
    for (const b of birimler) {
      const anahtar = b.blok_id ?? "_";
      if (!gruplar.has(anahtar)) gruplar.set(anahtar, []);
      gruplar.get(anahtar)!.push({ id: b.id, daire_no: b.daire_no, kat: b.kat });
    }
    return [...gruplar.entries()].map(([blokId, liste]) => ({
      blokId,
      ad: blokAd.get(blokId) ?? "Blok",
      liste: [...liste].sort(
        (a, c) => (a.kat ?? 0) - (c.kat ?? 0) || (a.daire_no ?? "").localeCompare(c.daire_no ?? "", "tr"),
      ),
    }));
  }, [birimler, blokAd]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onKapat} aria-hidden />
      <div
        role="dialog"
        aria-label="Tahsis düzenle"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 shadow-[var(--golge-3)] sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">Tahsisi düzenle</h3>
            <p className="mt-0.5 text-[12px] text-gray">Hedef, kapsam ve şartları değiştir. Kaydınca erişim anında güncellenir.</p>
          </div>
          <button
            type="button"
            onClick={onKapat}
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray transition-colors hover:bg-soft hover:text-ink"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        <form action={tahsisGuncelle} onSubmit={kontrolluGonder} className="grid gap-4">
          <input type="hidden" name="tahsis_id" value={tahsis.id} />
          <input type="hidden" name="proje_id" value={tahsis.proje_id} />
          <input ref={overrideRef} type="hidden" name="munhasir_override" defaultValue="" />
          <input type="hidden" name="hedef_modu" value={modu} />

          {/* 1 — HEDEF (tek) */}
          <div>
            <p className="text-[13px] font-bold text-ink">Kime açık?</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODLAR.map((m) => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setModu(m.v)}
                  className={`rounded-xl border p-2.5 text-center text-[13px] font-bold transition-all ${
                    modu === m.v ? "border-teal bg-teal/5 text-teal-d shadow-sm" : "border-hair bg-card text-ink hover:border-teal/30"
                  }`}
                >
                  {m.ad}
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              {modu === "tum_ag" ? (
                <p className="rounded-xl border border-hair bg-card px-3 py-2.5 text-[12.5px] text-gray">
                  Tüm doğrulanmış danışman ağına açık. En geniş erişim.
                </p>
              ) : null}
              {modu === "segment" ? (
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-hair bg-card p-3 sm:grid-cols-4">
                  <Drop ad="Marka" name="f_marka" deger={tahsis.hedef_filtre?.marka ?? ""} secenekler={secenekler.markalar} />
                  <Drop ad="Şehir" name="f_il" deger={tahsis.hedef_filtre?.il ?? ""} secenekler={secenekler.iller} />
                  <Drop ad="İlçe" name="f_ilce" deger={tahsis.hedef_filtre?.ilce ?? ""} secenekler={secenekler.ilceler} />
                  <label className="flex flex-col gap-1 text-[11px] font-medium text-gray">
                    Uzmanlık
                    <select name="f_uzmanlik" defaultValue={tahsis.hedef_filtre?.uzmanlik ?? ""} className={inp}>
                      {UZMANLIKLAR.map(([v, a]) => (
                        <option key={v} value={v}>{a}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
              {modu === "ofis" ? (
                <label className="flex flex-col gap-1 text-[11px] font-medium text-gray">
                  Ofis
                  <select name="ofis_id" defaultValue={tahsis.hedef_tip === "ofis" ? tahsis.hedef_id ?? "" : ""} className={inp}>
                    <option value="">Ofis seç…</option>
                    {ofisler.map((o) => (
                      <option key={o.id} value={o.id}>{o.ad}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {modu === "danisman" ? (
                <DanismanTekSecim
                  mevcutId={tahsis.hedef_tip === "danisman" ? tahsis.hedef_id : null}
                  mevcutAd={emlakciAd ?? null}
                />
              ) : null}
            </div>
          </div>

          {/* 2 — KAPSAM */}
          <div className="space-y-3 rounded-xl border border-hair bg-card p-3">
            <p className="text-[13px] font-bold text-ink">Ne kadarı?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                ["tum", "Tüm proje"],
                ["belirli", "Belirli kapsam"],
              ] as const).map(([v, et]) => (
                <label
                  key={v}
                  className={`cursor-pointer rounded-xl border p-2.5 text-[13px] font-bold transition-all ${
                    kapsamTip === v ? "border-teal bg-teal/5 text-teal-d shadow-sm" : "border-hair bg-card text-ink hover:border-teal/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="kapsam_tip"
                    value={v}
                    checked={kapsamTip === v}
                    onChange={() => setKapsamTip(v)}
                    className="sr-only"
                  />
                  {et}
                </label>
              ))}
            </div>

            {kapsamTip === "belirli" ? (
              <div className="space-y-3 border-t border-hair pt-3">
                {bloklar.length ? (
                  <Bolum baslik="Bloklar">
                    {bloklar.map((b) => (
                      <Cip key={b.id} name="bloklar" value={b.id} etiket={b.ad ?? "Blok"} checked={secili("bloklar", b.id)} />
                    ))}
                  </Bolum>
                ) : null}
                {katlar.length ? (
                  <Bolum baslik="Katlar">
                    {katlar.map((k) => (
                      <Cip key={k} name="katlar" value={String(k)} etiket={`${k}. kat`} checked={secili("katlar", String(k))} />
                    ))}
                  </Bolum>
                ) : null}
                {tipler.length ? (
                  <Bolum baslik="Daire tipleri">
                    {tipler.map((t) => (
                      <Cip key={t.id} name="tipler" value={t.id} etiket={t.oda ?? t.ad ?? "Tip"} checked={secili("tipler", t.id)} />
                    ))}
                  </Bolum>
                ) : null}
                <Bolum baslik="Birim türleri">
                  {TURLER.map(([v, et]) => (
                    <Cip key={v} name="turler" value={v} etiket={et} checked={secili("turler", v)} />
                  ))}
                </Bolum>

                {bloklaGruplu.length ? (
                  <div>
                    <p className="text-xs font-semibold text-ink">Belirli daireler</p>
                    <div className="mt-1.5 space-y-1.5">
                      {bloklaGruplu.map((g) => (
                        <details key={g.blokId} className="rounded-lg border border-hair bg-card">
                          <summary className="cursor-pointer list-none px-3 py-2 text-[13px] font-medium text-ink">
                            <span className="select-none">▸ </span>
                            {g.ad}
                            <span className="ml-1 font-normal text-gray">({g.liste.length} daire)</span>
                          </summary>
                          <div className="flex flex-wrap gap-1.5 border-t border-hair px-3 py-2.5">
                            {g.liste.map((bi) => (
                              <Cip
                                key={bi.id}
                                name="birimler"
                                value={bi.id}
                                etiket={bi.daire_no ?? "—"}
                                checked={secili("birimler", bi.id)}
                              />
                            ))}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* 3 — ŞARTLAR */}
          <details className="rounded-xl border border-hair bg-card" open={komisyon !== "yuzde" || tahsis.komisyon_deger != null || !!tahsis.munhasir || tahsis.kontenjan != null}>
            <summary className="cursor-pointer list-none px-3 py-2.5 text-[13px] font-semibold text-ink">
              <span className="select-none text-gray">▸ </span>
              Gelişmiş ayarlar
              <span className="ml-1 font-normal text-gray">komisyon · süre · münhasır</span>
            </summary>
            <div className="space-y-3 border-t border-hair p-3">
              <div className="flex flex-wrap items-end gap-2">
                <label className="flex flex-col gap-1 text-xs text-gray">
                  Komisyon
                  <select
                    name="komisyon_tip"
                    value={komisyon}
                    onChange={(e) => setKomisyon(e.target.value as "yuzde" | "sabit" | "yok")}
                    className={inp}
                  >
                    <option value="yuzde">% Yüzde</option>
                    <option value="sabit">Sabit ₺</option>
                    <option value="yok">Belirtme</option>
                  </select>
                </label>
                {komisyon !== "yok" ? (
                  <label className="flex flex-col gap-1 text-xs text-gray">
                    {komisyon === "yuzde" ? "Yüzde (%)" : "Tutar (₺)"}
                    <input
                      name="komisyon_deger"
                      type="number"
                      min={0}
                      step={komisyon === "yuzde" ? 0.5 : 1000}
                      defaultValue={tahsis.komisyon_deger ?? ""}
                      className={`${inp} w-28`}
                    />
                  </label>
                ) : null}
                <label className="flex flex-col gap-1 text-xs text-gray">
                  Kontenjan <span className="font-normal">(birim)</span>
                  <input
                    name="kontenjan"
                    type="number"
                    min={1}
                    placeholder="sınırsız"
                    defaultValue={tahsis.kontenjan ?? ""}
                    className={`${inp} w-28`}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex items-center gap-2 pb-1 text-sm text-ink">
                  <input type="checkbox" name="munhasir" defaultChecked={!!tahsis.munhasir} className="size-4 accent-teal" />
                  Münhasır
                </label>
                <label className="flex flex-col gap-1 text-xs text-gray">
                  Erişim süresi <span className="font-normal">(gün)</span>
                  <input name="bitis_gun" type="number" min={1} placeholder="süresiz" defaultValue={bitisGun} className={`${inp} w-28`} />
                </label>
                <label className="flex items-center gap-2 pb-1 text-sm text-ink">
                  <input type="checkbox" name="fiyat_gorunur" defaultChecked={tahsis.fiyat_gorunur ?? true} className="size-4 accent-teal" />
                  Fiyat görünür
                </label>
              </div>
            </div>
          </details>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onKapat}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray transition-colors hover:text-ink"
            >
              Vazgeç
            </button>
            <SubmitButton varyant="teal">Kaydet</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function Drop({ ad, name, deger, secenekler }: { ad: string; name: string; deger: string; secenekler: string[] }) {
  // Prefill değeri seçenek listesinde yoksa da korunur (ekstra option).
  const liste = deger && !secenekler.includes(deger) ? [deger, ...secenekler] : secenekler;
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-gray">
      {ad}
      <select name={name} defaultValue={deger} className={inp}>
        <option value="">Tümü</option>
        {liste.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </label>
  );
}

/* Belirli danışman TEK seçim — isimle ara (mevcut seçili prefill korunur). emlakci_id gönderir. */
function DanismanTekSecim({ mevcutId, mevcutAd }: { mevcutId: string | null; mevcutAd: string | null }) {
  const [secili, setSecili] = useState<Emlakci | null>(mevcutId ? { id: mevcutId, ad: mevcutAd, ofis: null } : null);
  const [q, setQ] = useState("");
  const [sonuc, setSonuc] = useState<Emlakci[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [acik, setAcik] = useState(false);
  const sarmal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ara = q.trim();
    let iptal = false;
    const t = setTimeout(async () => {
      if (ara.length < 2) {
        if (!iptal) setSonuc([]);
        return;
      }
      if (!iptal) setYukleniyor(true);
      try {
        const r = await fetch(`/api/uretici/emlakci-ara?q=${encodeURIComponent(ara)}`);
        const j = (await r.json()) as { sonuc?: Emlakci[] };
        if (!iptal) setSonuc(j.sonuc ?? []);
      } catch {
        if (!iptal) setSonuc([]);
      } finally {
        if (!iptal) setYukleniyor(false);
      }
    }, ara.length < 2 ? 0 : 250);
    return () => {
      iptal = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    function disari(e: MouseEvent) {
      if (sarmal.current && !sarmal.current.contains(e.target as Node)) setAcik(false);
    }
    document.addEventListener("mousedown", disari);
    return () => document.removeEventListener("mousedown", disari);
  }, []);

  return (
    <div ref={sarmal}>
      {secili ? (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal bg-teal/5 px-2.5 py-1.5 text-[13px] text-ink">
            <input type="hidden" name="emlakci_id" value={secili.id} />
            <span className="font-medium">{secili.ad ?? "Danışman"}</span>
            {secili.ofis ? <span className="text-[11px] text-gray">· {secili.ofis}</span> : null}
            <button type="button" onClick={() => setSecili(null)} className="ml-0.5 text-gray transition-colors hover:text-red" aria-label="Kaldır">
              ✕
            </button>
          </span>
        </div>
      ) : null}
      {!secili ? (
        <div className="relative">
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setAcik(true);
            }}
            onFocus={() => setAcik(true)}
            placeholder="Danışman ara (isimle)…"
            className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
            autoComplete="off"
          />
          {acik && q.trim().length >= 2 ? (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-hair bg-card shadow-lg">
              {yukleniyor ? (
                <p className="px-3 py-2 text-[13px] text-gray">Aranıyor…</p>
              ) : sonuc.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-gray">Sonuç yok</p>
              ) : (
                sonuc.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      setSecili(e);
                      setQ("");
                      setSonuc([]);
                      setAcik(false);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-teal/5"
                  >
                    <span className="truncate text-ink">{e.ad ?? "Danışman"}</span>
                    {e.ofis ? <span className="shrink-0 text-[11px] text-gray">{e.ofis}</span> : null}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
