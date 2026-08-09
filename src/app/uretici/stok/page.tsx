import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { durumGrup, type ProjeOzet } from "@/lib/stok";
import { StokTablo, type StokSatir } from "./StokTablo";

/* =========================================================
   STOK / FİYAT LİSTESİ — tüm birimlerin tek canlı tablosu (üretici).
   Çoklu proje: KPI'lar proje-duyarlı (client), "Tümü"de proje-proje özet.
   Fiyat/durum yalnız birim tablosundan (DEĞİŞMEZ #2). Her satır → "Yönet" → DaireModal.
   Opsiyon/satılan satırlarda "kim tuttu/kim sattı" görünür (opsiyon.satici_id / hakedis.emlakci_id;
   isim profiles_self RLS'i nedeniyle admin client ile çözülür — yalnız bu üreticinin satırları).
   ========================================================= */

type BirimRaw = {
  id: string;
  proje_id: string;
  blok_id: string | null;
  tip_id: string | null;
  tur: string | null;
  ana_birim_id: string | null;
  kat: number | null;
  daire_no: string | null;
  durum: string;
  liste_fiyati: number | null;
  kira_bedeli: number | null;
  para_birimi: string | null;
  net_m2: number | null;
  brut_m2: number | null;
  satilabilir: boolean | null;
  yon: string | null;
  manzara: string | null;
  serefiye: unknown;
  odeme_plani: unknown;
  durum_notu: string | null;
  son_guncelleme: string | null;
};

export default async function UreticiStok({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const sp = await searchParams;
  const baslangicDurum = (["acik", "opsiyon", "satildi", "planli", "kapali"].includes(sp.durum ?? "")
    ? sp.durum
    : "tumu") as "acik" | "opsiyon" | "satildi" | "planli" | "kapali" | "tumu";
  const supabase = await createClient();

  const [{ data: projeler }, { data: birimRaw }, { data: bloklar }, { data: tipler }, { data: opsiyonRaw }, { data: hakedisRaw }] =
    await Promise.all([
      supabase.from("proje").select("id, ad, para_birimi").order("created_at", { ascending: false }),
      supabase
        .from("birim")
        .select(
          "id, proje_id, blok_id, tip_id, tur, ana_birim_id, kat, daire_no, durum, liste_fiyati, kira_bedeli, para_birimi, net_m2, brut_m2, satilabilir, yon, manzara, serefiye, odeme_plani, gorsel_url, durum_notu, son_guncelleme",
        ),
      supabase.from("blok").select("id, ad"),
      supabase.from("daire_tipi").select("id, ad, oda, net_m2, taban_fiyat, plan_url"),
      // Aktif opsiyonlar → "kim tuttu" (RLS: üretici kendi projesinin opsiyonunu görür)
      supabase.from("opsiyon").select("birim_id, satici_id, durum").in("durum", ["opsiyonlu", "satis_beklemede"]),
      // Satışlar → "kim sattı" (hakedis tablosu; migration yoksa data null → graceful)
      supabase.from("hakedis").select("birim_id, emlakci_id"),
    ]);

  const birimler = (birimRaw ?? []) as BirimRaw[];
  const blokAd = new Map((bloklar ?? []).map((b) => [b.id, b.ad as string | null]));
  const tipAd = new Map(
    (tipler ?? []).map((t) => [t.id, (t.oda as string | null) ?? (t.ad as string | null)]),
  );
  const tipNet = new Map((tipler ?? []).map((t) => [t.id, t.net_m2 as number | null]));
  // Modal künyesi için tip lookup'ları (taban fiyat / oda / ad / plan görseli)
  const tipTaban = new Map((tipler ?? []).map((t) => [t.id, (t.taban_fiyat as number | null) ?? null]));
  const tipOda = new Map((tipler ?? []).map((t) => [t.id, (t.oda as string | null) ?? null]));
  const tipTamAd = new Map((tipler ?? []).map((t) => [t.id, (t.ad as string | null) ?? null]));
  const tipPlan = new Map((tipler ?? []).map((t) => [t.id, (t.plan_url as string | null) ?? null]));
  const projeAd = new Map((projeler ?? []).map((p) => [p.id, p.ad as string]));

  // "Kim tuttu / kim sattı" — satici/emlakci id → ad (admin client; profiles_self RLS bypass, yalnız bu üreticinin satırlarındaki id'ler)
  const opsBirimSatici = new Map((opsiyonRaw ?? []).map((o) => [o.birim_id as string, o.satici_id as string]));
  const hakedisBirimEmlakci = new Map((hakedisRaw ?? []).map((h) => [h.birim_id as string, h.emlakci_id as string]));
  const kisiIds = [...new Set([...opsBirimSatici.values(), ...hakedisBirimEmlakci.values()].filter(Boolean))];
  let adById = new Map<string, string | null>();
  if (kisiIds.length) {
    const admin = createAdminClient();
    const { data: prof } = await admin.from("profiles").select("id, ad").in("id", kisiIds);
    adById = new Map((prof ?? []).map((p) => [p.id as string, (p.ad as string | null) ?? null]));
  }
  /** Bir birimin "kim" bilgisi: opsiyonluysa tutan danışman, satıldıysa satan danışman. */
  const saticiAd = (b: BirimRaw): string | null => {
    if (b.durum === "opsiyonlu" || b.durum === "satis_beklemede") {
      const id = opsBirimSatici.get(b.id);
      return id ? adById.get(id) ?? "Danışman" : null;
    }
    if (b.durum === "satildi") {
      const id = hakedisBirimEmlakci.get(b.id);
      return id ? adById.get(id) ?? "Danışman" : null;
    }
    return null;
  };

  // ── Proje bazlı özet (para birimi karışımı YOK; her proje kendi bandı) ──
  const anaBirimler = birimler.filter((b) => b.ana_birim_id == null);
  const ozetMap = new Map<string, ProjeOzet>();
  for (const p of projeler ?? []) {
    ozetMap.set(p.id, {
      id: p.id,
      ad: p.ad as string,
      para: (p.para_birimi as string | null) ?? "TRY",
      toplam: 0,
      acik: 0,
      opsiyon: 0,
      satildi: 0,
      planli: 0,
      kapali: 0,
      minFiyat: 0,
      maxFiyat: 0,
    });
  }
  const projeFiyat = new Map<string, number[]>();
  for (const b of anaBirimler) {
    const o = ozetMap.get(b.proje_id);
    if (!o) continue;
    o.toplam++;
    o[durumGrup(b.durum, b.satilabilir ?? true)]++;
    if (b.liste_fiyati != null && b.liste_fiyati > 0) {
      const arr = projeFiyat.get(b.proje_id) ?? [];
      arr.push(b.liste_fiyati);
      projeFiyat.set(b.proje_id, arr);
    }
  }
  for (const [pid, fiyatlar] of projeFiyat) {
    const o = ozetMap.get(pid);
    if (o && fiyatlar.length) {
      o.minFiyat = Math.min(...fiyatlar);
      o.maxFiyat = Math.max(...fiyatlar);
    }
  }
  // Yalnız birimi olan projeler önde; tablo/kesit için sıra proje listesiyle aynı
  const projeOzetler: ProjeOzet[] = (projeler ?? []).map((p) => ozetMap.get(p.id)!).filter(Boolean);

  const kiraVar = birimler.some((b) => b.kira_bedeli != null && b.kira_bedeli > 0);

  // Tablo satırları — son güncellemeye göre yeni → eski
  const satirlar: StokSatir[] = [...birimler]
    .sort((a, b) => (b.son_guncelleme ?? "").localeCompare(a.son_guncelleme ?? ""))
    .map((b) => ({
      id: b.id,
      proje_id: b.proje_id,
      proje_ad: projeAd.get(b.proje_id) ?? "—",
      blok_ad: blokAd.get(b.blok_id ?? "") ?? null,
      kat: b.kat,
      daire_no: b.daire_no,
      tip_ad: tipAd.get(b.tip_id ?? "") ?? null,
      net_m2: b.net_m2 ?? tipNet.get(b.tip_id ?? "") ?? null,
      brut_m2: b.brut_m2,
      liste_fiyati: b.liste_fiyati,
      kira_bedeli: b.kira_bedeli,
      para_birimi: b.para_birimi,
      durum: b.durum,
      satici_ad: saticiAd(b),
      son_guncelleme: b.son_guncelleme,
      // DaireModal künyesi (üretici modu — popup ile tek tek yönet)
      satilabilir: b.satilabilir ?? true,
      yon: b.yon,
      manzara: b.manzara,
      serefiye: (b.serefiye as { kat?: number; manzara?: number } | null) ?? null,
      odeme_plani: (b.odeme_plani as StokSatir["odeme_plani"]) ?? null,
      durum_notu: b.durum_notu,
      taban_fiyat: tipTaban.get(b.tip_id ?? "") ?? null,
      tip_tam_ad: tipTamAd.get(b.tip_id ?? "") ?? null,
      oda: tipOda.get(b.tip_id ?? "") ?? null,
      plan_url: tipPlan.get(b.tip_id ?? "") ?? null,
      tur: b.tur,
      ana_birim_id: b.ana_birim_id,
    }));

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-6 text-ink sm:px-6">
      <header className="belir mb-5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[27px] font-bold tracking-tight text-ink">Stok / Fiyat Listesi</h1>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-soft px-2.5 py-[5px] text-[11.5px] font-semibold text-[#1f7d4c]">
            <span className="nabiz inline-block size-[7px] rounded-full bg-green" aria-hidden />
            Canlı
          </span>
        </div>
        <p className="mt-1 text-[12.5px] text-[var(--ink-faint)]">
          Tüm projelerin tek canlı stok tablosu — fiyat/durum yalnız birim tablosundan, anlık.
        </p>
      </header>

      <StokTablo
        satirlar={satirlar}
        projeOzetler={projeOzetler}
        kiraVar={kiraVar}
        baslangicDurum={baslangicDurum}
      />
    </div>
  );
}
