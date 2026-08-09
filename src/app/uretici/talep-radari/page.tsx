import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tazelik } from "@/lib/stok";
import { zamanOnce } from "@/lib/types";

/* =========================================================
   TALEP RADARI / SATIŞ ZEKÂSI — veri-moat (üretici).
   Rakipler stok gösterir; biz emlakçı AĞINDAKİ davranışı ölçeriz.
   Tüm sayı GERÇEK events'ten. SCOPE: kodda üreticinin kendi proje id'leri
   (events RLS'e güvenmeden) → çapraz-üretici sızıntı imkânsız.
   ========================================================= */

type EventRaw = {
  tip: string;
  proje_id: string | null;
  birim_id: string | null;
  profile_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};
type BirimRaw = { proje_id: string; durum: string; son_guncelleme: string | null };

const OLAY_ETIKET: Record<string, string> = {
  paylasim: "Paylaşım", goruntuleme: "Görüntüleme", lead: "Lead", favori: "Favori",
  satis: "Satış", opsiyon: "Opsiyon talebi", durum: "Durum değişimi", fiyat: "Fiyat değişimi",
  ilgi: "Ön-talep", acilis: "Stok açılışı", dalga: "Dalga planı",
};
const OLAY_RENK: Record<string, string> = {
  satis: "var(--color-red)", opsiyon: "var(--color-amber)", lead: "var(--color-green)", favori: "var(--color-red)",
  paylasim: "var(--color-navy)", goruntuleme: "var(--color-ink-soft)", durum: "var(--color-ink-soft)",
  fiyat: "var(--color-teal)", ilgi: "var(--color-teal)", acilis: "var(--color-green)", dalga: "var(--color-navy)",
};
const KANAL_ETIKET: Record<string, string> = {
  mikrosite: "Mikrosite", "proje karti": "Proje kartı", manuel: "Manuel", diğer: "Diğer",
};

function gunOnce(g: number): string {
  return new Date(Date.now() - g * 86_400_000).toISOString();
}

export default async function UreticiTalepRadari() {
  const supabase = await createClient();
  const otuzGunOnce = gunOnce(30);
  const altmisGunOnce = gunOnce(60);
  const yediGunOnce = gunOnce(7);

  const [{ data: projeler }, { data: birimRaw }, { data: eventRaw }, { data: tahsisRaw }] = await Promise.all([
    supabase.from("proje").select("id, ad").order("created_at", { ascending: false }),
    supabase.from("birim").select("proje_id, durum, son_guncelleme"),
    supabase
      .from("events")
      .select("tip, proje_id, birim_id, profile_id, payload, created_at")
      .gte("created_at", altmisGunOnce)
      .order("created_at", { ascending: false })
      // desc+limit en YENİ satırları verir → kesilirse EN ESKİ haftalar düşer, trend/delta
      // büyüme yönünde yanlı görünür. Sınır güvenli üst değerde; hacim büyürse SQL agregasyona geç.
      .limit(20000),
    supabase.from("tahsis").select("proje_id, hedef_tip, hedef_id, munhasir, bitis"),
  ]);

  const projeAd = new Map((projeler ?? []).map((p) => [p.id, p.ad as string]));
  const projeIds = new Set(projeAd.keys());
  // SCOPE: yalnız üreticinin kendi projeleri (events RLS'e güvenme)
  const events = ((eventRaw ?? []) as EventRaw[]).filter((e) => e.proje_id && projeIds.has(e.proje_id));
  const birimler = ((birimRaw ?? []) as BirimRaw[]).filter((b) => projeIds.has(b.proje_id));
  const son7 = events.filter((e) => e.created_at >= yediGunOnce);
  const say = (tip: string) => son7.filter((e) => e.tip === tip).length;

  // — AKTİVİTE TRENDİ (8 hafta) + son 30g / önceki 30g delta —
  // Talep sinyalleri (durum değişimi hariç): ağdaki gerçek ilgi ritmi.
  // ISO-string sınırlarıyla kovala (render'da Date.now() yok; dosyanın mevcut deseni).
  const AKTIF_TIP = new Set(["goruntuleme", "paylasim", "lead", "opsiyon", "favori", "satis"]);
  const haftaSinir = Array.from({ length: 9 }, (_, i) => gunOnce(i * 7)); // [şimdi, -7g, … -56g]
  const haftaKova = Array<number>(8).fill(0); // 0 = 8 hafta önce … 7 = bu hafta
  for (const e of events) {
    if (!AKTIF_TIP.has(e.tip) || e.created_at < haftaSinir[8]) continue;
    for (let k = 0; k < 8; k++) {
      if (e.created_at >= haftaSinir[k + 1] && e.created_at < haftaSinir[k]) {
        haftaKova[7 - k]++;
        break;
      }
    }
  }
  const haftaMax = Math.max(1, ...haftaKova);
  const son30Aktif = events.filter((e) => AKTIF_TIP.has(e.tip) && e.created_at >= otuzGunOnce).length;
  const onceki30Aktif = events.filter(
    (e) => AKTIF_TIP.has(e.tip) && e.created_at >= altmisGunOnce && e.created_at < otuzGunOnce,
  ).length;
  const aktifDelta = onceki30Aktif > 0 ? Math.round(((son30Aktif - onceki30Aktif) / onceki30Aktif) * 100) : null;

  // — DÖNÜŞÜM HUNİSİ (7g) —
  const funnel = [
    { ad: "Paylaşım", n: say("paylasim"), renk: "var(--color-navy)" },
    { ad: "Görüntüleme", n: say("goruntuleme"), renk: "var(--color-teal)" },
    { ad: "Lead", n: say("lead"), renk: "var(--color-green)" },
    { ad: "Opsiyon talebi", n: say("opsiyon"), renk: "var(--color-amber)" },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n));
  const funnelToplam = funnel.reduce((t, f) => t + f.n, 0);

  // — KANAL dağılımı (paylaşım+görüntüleme kaynak) —
  const kanal = new Map<string, number>();
  for (const e of son7)
    if (e.tip === "paylasim" || e.tip === "goruntuleme") {
      const k = ((e.payload?.kaynak as string) || "diğer").toLowerCase();
      kanal.set(k, (kanal.get(k) ?? 0) + 1);
    }
  const kanalListe = [...kanal.entries()].sort((a, b) => b[1] - a[1]);
  const kanalToplam = Math.max(1, kanalListe.reduce((t, [, n]) => t + n, 0));

  // — DANIŞMAN aktivite (7g) → admin client ile ad —
  const danAkt = new Map<string, number>();
  for (const e of son7)
    if (e.profile_id && (e.tip === "paylasim" || e.tip === "goruntuleme"))
      danAkt.set(e.profile_id, (danAkt.get(e.profile_id) ?? 0) + 1);
  const danTop = [...danAkt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  let danAd = new Map<string, string | null>();
  if (danTop.length) {
    try {
      const admin = createAdminClient();
      const { data: prof } = await admin.from("profiles").select("id, ad").in("id", danTop.map((d) => d[0]));
      danAd = new Map((prof ?? []).map((p) => [p.id as string, p.ad as string | null]));
    } catch (e) {
      console.error("Danışman isim çözümü hatası:", e);
      danAd = new Map();
    }
  }

  // — Proje özetleri (müsait/opsiyon/satıldı) —
  type Ozet = { toplam: number; musait: number; opsiyon: number; satildi: number };
  const ozet = new Map<string, Ozet>();
  for (const b of birimler) {
    const o = ozet.get(b.proje_id) ?? { toplam: 0, musait: 0, opsiyon: 0, satildi: 0 };
    o.toplam++;
    if (b.durum === "musait") o.musait++;
    else if (b.durum === "opsiyonlu" || b.durum === "satis_beklemede") o.opsiyon++;
    else if (b.durum === "satildi") o.satildi++;
    ozet.set(b.proje_id, o);
  }
  const toplam = birimler.length;
  const opsiyon = birimler.filter((b) => b.durum === "opsiyonlu" || b.durum === "satis_beklemede").length;
  const eskiBirimSay = birimler.filter((b) => tazelik(b.son_guncelleme).gun > 15).length;

  // — İLGİ VAR, OPSİYON YOK (7g görüntüleme yüksek + 0 opsiyon) —
  const projGor = new Map<string, number>();
  for (const e of son7) if (e.tip === "goruntuleme" && e.proje_id) projGor.set(e.proje_id, (projGor.get(e.proje_id) ?? 0) + 1);
  const ilgiOpsYok =
    [...projGor.entries()]
      .filter(([id, g]) => g >= 5 && (ozet.get(id)?.opsiyon ?? 0) === 0)
      .sort((a, b) => b[1] - a[1])[0] ?? null;

  // — ÖN-TALEP (EOI) · "açılınca haber ver" ilgi sinyalleri (60g) —
  // Planlı/dalga stoğuna açılış öncesi biriken talep. ilgiBildir mükerrer-korumalı
  // (profil+birim tek kez) → adet = benzersiz kişi-birim ilgisi. Açılış zamanlaması +
  // fiyat gücü kararı için erken sinyal; rakip veremez (verisi yok).
  const eoiProje = new Map<string, { adet: number; son: string }>();
  for (const e of events)
    if (e.tip === "ilgi" && e.proje_id) {
      const m = eoiProje.get(e.proje_id) ?? { adet: 0, son: e.created_at };
      m.adet++;
      if (e.created_at > m.son) m.son = e.created_at;
      eoiProje.set(e.proje_id, m);
    }
  const eoiListe = [...eoiProje.entries()].sort((a, b) => b[1].adet - a[1].adet);
  const eoiToplam = eoiListe.reduce((t, [, m]) => t + m.adet, 0);

  const enCokGor = [...projGor.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  const enCokMusait = [...ozet.entries()].sort((a, b) => b[1].musait - a[1].musait)[0] ?? null;
  const oranliste = [...ozet.entries()]
    .filter(([, o]) => o.toplam > 0 && o.satildi > 0)
    .map(([id, o]) => ({ id, oran: Math.round((o.satildi / o.toplam) * 100), o }))
    .sort((a, b) => b.oran - a.oran);
  const enHizli = oranliste[0] ?? null;
  const feed = events.slice(0, 18);

  // — TAHSİS PERFORMANSI (yalnız isimli 'danisman' tahsisleri → net atıf) —
  // Tahsis MOAT'ını sonuca bağlar: kime açtın, o kişi 30g'de dokundu mu?
  type TahsisRow = { proje_id: string; hedef_tip: string; hedef_id: string | null; munhasir: boolean | null; bitis: string | null };
  const tahsisler = ((tahsisRaw ?? []) as TahsisRow[]).filter(
    (t) => t.hedef_tip === "danisman" && t.hedef_id && projeIds.has(t.proje_id) && (!t.bitis || t.bitis > haftaSinir[0]),
  );
  const tKey = (p: string, h: string) => `${p}|${h}`;
  const tahsisGrup = new Map<string, { proje_id: string; hedef_id: string; munhasir: boolean }>();
  for (const t of tahsisler) {
    const k = tKey(t.proje_id, t.hedef_id as string);
    const mev = tahsisGrup.get(k);
    if (!mev) tahsisGrup.set(k, { proje_id: t.proje_id, hedef_id: t.hedef_id as string, munhasir: !!t.munhasir });
    else if (t.munhasir) mev.munhasir = true;
  }
  const grupAkt = new Map<string, { aktif: number; lead: number; opsiyon: number; son: string | null }>();
  for (const e of events) {
    if (!e.profile_id || !e.proje_id || e.created_at < otuzGunOnce) continue;
    const k = tKey(e.proje_id, e.profile_id);
    if (!tahsisGrup.has(k)) continue;
    const g = grupAkt.get(k) ?? { aktif: 0, lead: 0, opsiyon: 0, son: null };
    if (e.tip === "paylasim" || e.tip === "goruntuleme") g.aktif++;
    else if (e.tip === "lead") g.lead++;
    else if (e.tip === "opsiyon") g.opsiyon++;
    if (!g.son || e.created_at > g.son) g.son = e.created_at;
    grupAkt.set(k, g);
  }
  const tPuan = (a: { aktif: number; lead: number; opsiyon: number }) => a.aktif + a.lead * 3 + a.opsiyon * 5;
  const tahsisPerf = [...tahsisGrup.entries()]
    .map(([k, g]) => ({ key: k, ...g, ...(grupAkt.get(k) ?? { aktif: 0, lead: 0, opsiyon: 0, son: null }) }))
    .sort((x, y) => tPuan(y) - tPuan(x));
  const pasifTahsis = tahsisPerf.filter((t) => t.aktif === 0 && t.lead === 0 && t.opsiyon === 0).length;
  let tahsisAd = new Map<string, string | null>();
  if (tahsisPerf.length) {
    try {
      const admin = createAdminClient();
      const { data: prof } = await admin.from("profiles").select("id, ad").in("id", tahsisPerf.map((t) => t.hedef_id));
      tahsisAd = new Map((prof ?? []).map((p) => [p.id as string, p.ad as string | null]));
    } catch (e) {
      console.error("Tahsis isim çözümü hatası:", e);
      tahsisAd = new Map();
    }
  }

  // — FİYAT KARARININ ETKİSİ (ilgi sinyali, nedensellik DEĞİL) —
  // Her fiyat değişiminin ±7 gününde aynı projedeki görüntüleme toplamı. Yalnız 7-53 gün
  // önceki değişimler (her iki 7g pencere de 60g fetch içinde tam). new Date(iso) argümanlı = pure.
  const YEDI_MS = 7 * 86_400_000;
  const g53 = gunOnce(53);
  const gorMs = new Map<string, number[]>();
  for (const e of events)
    if (e.tip === "goruntuleme" && e.proje_id) {
      const arr = gorMs.get(e.proje_id) ?? [];
      arr.push(new Date(e.created_at).getTime());
      gorMs.set(e.proje_id, arr);
    }
  let fiyatOnce = 0;
  let fiyatSonra = 0;
  let fiyatDegisimSay = 0;
  for (const e of events) {
    if (e.tip !== "fiyat" || !e.proje_id || e.created_at < g53 || e.created_at > yediGunOnce) continue;
    const t = new Date(e.created_at).getTime();
    for (const g of gorMs.get(e.proje_id) ?? []) {
      if (g >= t - YEDI_MS && g < t) fiyatOnce++;
      else if (g >= t && g < t + YEDI_MS) fiyatSonra++;
    }
    fiyatDegisimSay++;
  }
  const fiyatEtkiPct =
    fiyatDegisimSay > 0 && fiyatOnce > 0 ? Math.round(((fiyatSonra - fiyatOnce) / fiyatOnce) * 100) : null;

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Talep Radarı · Satış Zekâsı</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-2.5 py-[5px] text-[11.5px] font-semibold text-teal">
            <span className="nabiz inline-block size-[7px] rounded-full bg-teal" aria-hidden />
            son 7 gün
          </span>
        </div>
        <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
          Danışman ağındaki gerçek davranış: paylaşım, görüntüleme, lead, talep. Şişirilmiş veri yok; her sinyal canlı akıştan gelir.
        </p>
      </header>

      {toplam === 0 ? (
        <div className="kart belir belir-1 p-12 text-center">
          <p className="text-[15px] font-bold text-ink">Radar için stok yok</p>
          <Link href="/uretici/proje/yeni" className="mt-3 inline-block text-[13px] font-semibold text-teal hover:underline">Proje oluştur →</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="belir belir-1 space-y-5">
            {/* DÖNÜŞÜM HUNİSİ */}
            <section className="kart p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[15px] font-bold text-ink">Dönüşüm Hunisi · 7g</h2>
                <span className="mono text-[11px] text-[var(--ink-faint)]">{funnelToplam} olay</span>
              </div>
              {funnelToplam === 0 ? (
                <p className="mt-3 text-[12.5px] text-[var(--ink-faint)]">
                  Henüz hareket yok. Emlakçılar paylaştıkça/müşteri görüntüledikçe huni burada dolar.
                </p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {funnel.map((f, i) => {
                    const onceki = i > 0 ? funnel[i - 1].n : null;
                    const oran = onceki && onceki > 0 ? Math.round((f.n / onceki) * 100) : null;
                    return (
                      <div key={f.ad} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 text-[12.5px] font-medium text-ink-soft">{f.ad}</span>
                        <div className="flex-1 overflow-hidden rounded-lg bg-soft">
                          <div
                            className="flex h-7 items-center justify-end rounded-lg px-2.5 transition-all"
                            style={{ width: `${Math.max(8, (f.n / funnelMax) * 100)}%`, background: f.renk }}
                          >
                            <span className="mono text-[12px] font-bold text-white">{f.n}</span>
                          </div>
                        </div>
                        <span className="w-12 shrink-0 text-right mono text-[11px] text-[var(--ink-faint)]">
                          {oran != null ? `${oran}%` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* AKTİVİTE TRENDİ */}
            {events.length > 0 ? (
              <section className="kart p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-bold text-ink">Aktivite Trendi · 8 hafta</h2>
                  {aktifDelta != null ? (
                    <span className={`mono text-[12px] font-semibold ${aktifDelta >= 0 ? "text-teal-d" : "text-red"}`}>
                      {aktifDelta >= 0 ? "▲" : "▼"} %{Math.abs(aktifDelta)}
                      <span className="ml-1 font-normal text-[var(--ink-faint)]">son 30g / önceki 30g</span>
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex items-end gap-1.5">
                  {haftaKova.map((n, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full items-end justify-center" style={{ height: 56 }}>
                        <div
                          className="w-full max-w-[26px] rounded-t"
                          style={{
                            height: `${Math.max(4, Math.round((n / haftaMax) * 56))}px`,
                            background: i === 7 ? "var(--color-teal)" : "var(--color-navy)",
                          }}
                          title={`${n} hareket`}
                        />
                      </div>
                      <span className="mono text-[10px] text-[var(--ink-faint)]">{n}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-[var(--ink-faint)]">
                  <span>8 hafta önce</span>
                  <span>bu hafta</span>
                </div>
              </section>
            ) : null}

            {/* İÇGÖRÜ KARTLARI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ilgiOpsYok ? (
                <Insight sig="var(--color-amber)" ust="İlgi var, opsiyon yok ⚠" deger={String(ilgiOpsYok[1])}
                  renk="text-amber" metin={`${projeAd.get(ilgiOpsYok[0]) ?? "—"} — 7g'de ${ilgiOpsYok[1]} görüntüleme ama hiç opsiyon talebi yok. Fiyat/tahsis gözden geçir.`}
                  href={`/uretici/proje/${ilgiOpsYok[0]}`} hrefMetin="Projeyi aç →" />
              ) : null}
              {enCokGor ? (
                <Insight sig="var(--color-teal)" ust="En çok ilgi gören · 7g" deger={String(enCokGor[1])}
                  renk="text-teal-d" metin={`${projeAd.get(enCokGor[0]) ?? "—"} — son 7 günde en çok görüntülenen proje.`}
                  href={`/uretici/proje/${enCokGor[0]}`} hrefMetin="Projeyi aç →" />
              ) : null}
              {eoiToplam > 0 ? (
                <Insight sig="var(--color-teal)" ust="Ön-talep · açılınca haber ver" deger={String(eoiToplam)}
                  renk="text-teal-d" metin={`${eoiListe.length} projede açılış öncesi talep birikti. Açılış zamanlaması ve fiyat için erken sinyal.`}
                  href="#on-talep" hrefMetin="Aşağıda detay →" />
              ) : null}
              {opsiyon > 0 ? (
                <Insight sig="var(--color-amber)" ust="Aktif opsiyon" deger={String(opsiyon)}
                  renk="text-amber" metin="birim karar bekliyor — teyit veya serbest bırak." href="/uretici/opsiyonlar" hrefMetin="Opsiyonları gör →" />
              ) : null}
              {enCokMusait ? (
                <Insight sig="var(--color-green)" ust="En çok müsait stok" deger={String(enCokMusait[1].musait)}
                  renk="text-green" metin={`${projeAd.get(enCokMusait[0]) ?? "—"} — paylaşıma en hazır proje.`}
                  href={`/uretici/proje/${enCokMusait[0]}`} hrefMetin="Projeyi aç →" />
              ) : null}
              {enHizli ? (
                <Insight sig="var(--color-red)" ust="En hızlı satan" deger={`%${enHizli.oran}`}
                  renk="text-ink" metin={`${projeAd.get(enHizli.id) ?? "—"} — ${enHizli.o.satildi}/${enHizli.o.toplam} satıldı.`}
                  href={`/uretici/proje/${enHizli.id}`} hrefMetin="Projeyi aç →" />
              ) : null}
              {eskiBirimSay > 0 ? (
                <Insight sig="var(--color-red)" ust="Eskiyen stok" deger={String(eskiBirimSay)}
                  renk="text-red" metin="birim 15 günden eski — fiyat/durum tazele (stale rozeti)." href="/uretici/stok" hrefMetin="Stoğu tazele →" />
              ) : null}
            </div>

            {/* ÖN-TALEP (EOI) · açılınca haber ver */}
            {eoiListe.length > 0 ? (
              <section id="on-talep" className="kart p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-bold text-ink">Ön-Talep · Açılınca Haber Ver</h2>
                  <span className="mono text-[11px] text-[var(--ink-faint)]">{eoiToplam} talep · 60g</span>
                </div>
                <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
                  Planlı/dalga stoğuna açılış öncesi biriken talep. Yüksek ilgi → daha erken açılış ya da fiyat gücü. Rakip veremez; verisi yok.
                </p>
                <ul className="mt-3 divide-y divide-[var(--cizgi)]">
                  {eoiListe.slice(0, 8).map(([id, m]) => (
                    <li key={id} className="flex items-center gap-3 py-2.5">
                      <span className="size-[7px] shrink-0 rounded-full bg-teal" aria-hidden />
                      <Link href={`/uretici/proje/${id}`} className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink hover:text-teal">
                        {projeAd.get(id) ?? "—"}
                      </Link>
                      <span className="mono shrink-0 text-[11px] text-[var(--ink-faint)]">son {zamanOnce(m.son)}</span>
                      <span className="mono w-8 shrink-0 text-right text-[13px] font-semibold text-teal-d">{m.adet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* KANAL DAĞILIMI */}
            {kanalListe.length > 0 ? (
              <section className="kart p-5">
                <h2 className="font-display text-[15px] font-bold text-ink">Kanal Dağılımı · 7g</h2>
                <div className="mt-3 space-y-2">
                  {kanalListe.map(([k, n]) => (
                    <div key={k} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-[12.5px] text-ink-soft">{KANAL_ETIKET[k] ?? k}</span>
                      <div className="flex-1 overflow-hidden rounded-md bg-soft">
                        <div className="h-2.5 rounded-md bg-teal" style={{ width: `${(n / kanalToplam) * 100}%` }} />
                      </div>
                      <span className="w-16 shrink-0 text-right mono text-[11.5px] text-ink-soft">{n} · %{Math.round((n / kanalToplam) * 100)}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* FİYAT KARARININ ETKİSİ */}
            {fiyatDegisimSay > 0 ? (
              <section className="kart p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-[15px] font-bold text-ink">Fiyat Kararının Etkisi</h2>
                  <span className="mono text-[11px] text-[var(--ink-faint)]">{fiyatDegisimSay} değişim</span>
                </div>
                <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
                  Fiyat değişimlerinin ±7 gününde proje görüntülenmesi. İlgi sinyali, kesin neden değil.
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  {fiyatEtkiPct != null ? (
                    <>
                      <span className={`mono text-[30px] font-semibold leading-none ${fiyatEtkiPct >= 0 ? "text-teal-d" : "text-red"}`}>
                        {fiyatEtkiPct >= 0 ? "+" : ""}%{Math.abs(fiyatEtkiPct)}
                      </span>
                      <span className="text-[12.5px] text-ink-soft">değişim sonrası ilgi (7g önce → 7g sonra)</span>
                    </>
                  ) : (
                    <span className="text-[13px] font-semibold text-ink-soft">Veri yetersiz (değişim öncesi görüntüleme yok)</span>
                  )}
                </div>
                <div className="mt-3 flex gap-6 text-[12px] text-ink-soft">
                  <span className="mono">önce: {fiyatOnce}</span>
                  <span className="mono">sonra: {fiyatSonra}</span>
                </div>
              </section>
            ) : null}

            {/* TAHSİS PERFORMANSI */}
            {tahsisPerf.length > 0 ? (
              <section className="kart overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--cizgi)] px-5 py-3.5">
                  <h2 className="font-display text-[15px] font-bold text-ink">Tahsis Performansı · 30g</h2>
                  {pasifTahsis > 0 ? (
                    <span className="mono rounded-full bg-amber-soft px-2 py-[3px] text-[11px] font-semibold text-amber">
                      {pasifTahsis} pasif
                    </span>
                  ) : null}
                </div>
                <p className="px-5 pt-2.5 text-[11.5px] text-[var(--ink-faint)]">
                  İsimli danışman tahsisleri. Sayılar: paylaşım+görüntüleme · lead · opsiyon.
                </p>
                <ul className="mt-1 divide-y divide-[var(--cizgi)]">
                  {tahsisPerf.slice(0, 8).map((t) => {
                    const pasif = t.aktif === 0 && t.lead === 0 && t.opsiyon === 0;
                    return (
                      <li key={t.key} className="flex items-center gap-3 px-5 py-2.5">
                        <span
                          className="size-[7px] shrink-0 rounded-full"
                          style={{ background: pasif ? "var(--color-red)" : "var(--color-green)" }}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ink">
                            <span className="truncate">{tahsisAd.get(t.hedef_id) ?? "Danışman"}</span>
                            {t.munhasir ? (
                              <span className="shrink-0 rounded bg-navy-soft px-1.5 py-[1px] text-[10px] font-semibold text-ink-soft">
                                münhasır
                              </span>
                            ) : null}
                          </div>
                          <div className="truncate text-[11px] text-[var(--ink-faint)]">
                            {projeAd.get(t.proje_id) ?? "—"}
                            {t.son ? ` · son ${zamanOnce(t.son)}` : " · hiç hareket yok"}
                          </div>
                        </div>
                        <div className="mono flex shrink-0 items-center gap-3 text-[11.5px]">
                          <span className="text-ink-soft" title="paylaşım+görüntüleme">{t.aktif}</span>
                          <span className="text-green" title="lead">{t.lead}</span>
                          <span className="text-amber" title="opsiyon">{t.opsiyon}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>

          {/* SAĞ RAY: danışman aktivite + son hareketler */}
          <div className="belir belir-2 space-y-5">
            {danTop.length > 0 ? (
              <section className="kart overflow-hidden">
                <div className="border-b border-[var(--cizgi)] px-5 py-3.5">
                  <h2 className="font-display text-[15px] font-bold text-ink">En Aktif Danışmanlar · 7g</h2>
                </div>
                <ul className="divide-y divide-[var(--cizgi)]">
                  {danTop.map(([id, n], i) => (
                    <li key={id} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="mono w-5 shrink-0 text-[12px] font-bold text-[var(--ink-faint)]">{i + 1}</span>
                      <span className="flex-1 truncate text-[13px] font-medium text-ink">{danAd.get(id) ?? "Danışman"}</span>
                      <span className="mono shrink-0 text-[12px] font-semibold text-teal-d">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="kart overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--cizgi)] px-5 py-3.5">
                <svg width="16" height="16" className="text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                <h2 className="font-display text-[15px] font-bold text-ink">Son Hareketler</h2>
              </div>
              {feed.length === 0 ? (
                <p className="px-5 py-8 text-center text-[12.5px] text-[var(--ink-faint)]">Henüz hareket yok.</p>
              ) : (
                <ul className="divide-y divide-[var(--cizgi)]">
                  {feed.map((e, i) => (
                    <li key={`${e.created_at}-${i}`} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="size-[7px] shrink-0 rounded-full" style={{ background: OLAY_RENK[e.tip] ?? "var(--color-ink-soft)" }} />
                      <span className="text-[12.5px] font-medium text-ink">{OLAY_ETIKET[e.tip] ?? e.tip}</span>
                      <span className="truncate text-[11.5px] text-[var(--ink-faint)]">{e.proje_id ? projeAd.get(e.proje_id) ?? "—" : "—"}</span>
                      <span className="mono ml-auto shrink-0 text-[11px] text-[var(--ink-faint)]">{zamanOnce(e.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function Insight({ sig, ust, deger, renk, metin, href, hrefMetin }: {
  sig: string; ust: string; deger: string; renk: string; metin: string; href: string; hrefMetin: string;
}) {
  return (
    <Link href={href} className="kart kart-3d signal-top group block p-5" style={{ ["--_sig" as string]: sig }}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">{ust}</div>
      <div className={`mono mt-1 text-[30px] font-semibold leading-none ${renk}`}>{deger}</div>
      <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">{metin}</p>
      <span className="mt-3 inline-block text-[11.5px] font-semibold text-teal group-hover:underline">{hrefMetin}</span>
    </Link>
  );
}
