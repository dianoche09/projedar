"use client";

import { useState } from "react";
import { fiyatKuraliEkle, fiyatKuraliSil, fiyatKuraliAcKapa, projeFiyatAyar } from "@/app/uretici/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { FiyatKurali, FiyatAyar, KuralTetik, KuralAksiyon } from "@/lib/fiyat-kurali";

const inp =
  "w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-teal";

const TETIK_ET: Record<KuralTetik, string> = {
  sure_gun: "Süre (gün)",
  satis_adet: "Satış adedi",
  satis_yuzde: "Satış yüzdesi",
  tarih: "Takvim tarihi",
};
const AKSIYON_ET: Record<KuralAksiyon, string> = {
  yuzde: "Yüzde (±%)",
  sabit_ekle: "Sabit ekle (±TL)",
  sabit_fiyat: "Sabit fiyata çek (TL)",
};

/** Kuralı okunur cümleye çevir (ör. "Tüm tipler: 10. günde → +%3"). */
function kuralOzet(k: FiyatKurali, tipAd: (id: string | null) => string): string {
  const kap = k.tip_id ? tipAd(k.tip_id) : "Tüm tipler";
  let kosul: string;
  if (k.tetik === "sure_gun") kosul = `${k.esik}. günde`;
  else if (k.tetik === "satis_adet") kosul = `${k.esik} satış sonrası`;
  else if (k.tetik === "satis_yuzde") kosul = `%${k.esik} satılınca`;
  else kosul = k.tetik_tarih ? `${k.tetik_tarih} tarihinde` : "belirtilen tarihte";
  const tk = k.tekrar === "periyodik" ? " (her seferinde)" : "";
  let aks: string;
  if (k.aksiyon === "yuzde") aks = `${k.deger > 0 ? "+" : ""}%${k.deger}`;
  else if (k.aksiyon === "sabit_ekle") aks = `${k.deger > 0 ? "+" : ""}${k.deger.toLocaleString("tr-TR")} TL`;
  else aks = `${k.deger.toLocaleString("tr-TR")} TL'ye çek`;
  return `${kap}: ${kosul}${tk} → ${aks}`;
}

export function FiyatKurallari({
  projeId,
  ayar,
  kurallar,
  tipler,
}: {
  projeId: string;
  ayar: FiyatAyar;
  kurallar: FiyatKurali[];
  tipler: { id: string; ad: string | null; oda: string | null }[];
}) {
  const [tetik, setTetik] = useState<KuralTetik>("sure_gun");
  const tipAdMap = new Map(tipler.map((t) => [t.id, (t.oda ?? t.ad) ?? "Tip"]));
  const tipAd = (id: string | null) => (id ? tipAdMap.get(id) ?? "Tip" : "Tüm tipler");

  return (
    <div className="space-y-5">
      {/* AYAR: mod + guardrail + baz */}
      <form action={projeFiyatAyar} className="space-y-3 rounded-xl border border-hair bg-soft p-4">
        <input type="hidden" name="proje_id" value={projeId} />
        <label className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <input type="checkbox" name="aktif" defaultChecked={ayar.aktif} className="size-4" />
          Dinamik fiyat motoru açık
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="block text-[12px] font-bold text-ink-soft">
            Uygulama modu
            <select name="mod" defaultValue={ayar.mod} className={`${inp} mt-1`}>
              <option value="oneri">Önce bana sor (öneri)</option>
              <option value="otomatik">Otomatik uygula</option>
            </select>
          </label>
          <label className="block text-[12px] font-bold text-ink-soft">
            Baz tarih (süre için)
            <input type="date" name="baz_tarih" defaultValue={ayar.baz_tarih ?? ""} className={`${inp} mt-1`} />
          </label>
          <label className="block text-[12px] font-bold text-ink-soft">
            Tavan (taban üstü max %)
            <input type="number" name="tavan_pct" defaultValue={ayar.tavan_pct ?? ""} placeholder="20" className={`${inp} mt-1`} />
          </label>
          <label className="block text-[12px] font-bold text-ink-soft">
            Tek adım max %
            <input type="number" name="adim_max_pct" defaultValue={ayar.adim_max_pct ?? ""} placeholder="5" className={`${inp} mt-1`} />
          </label>
          <label className="block text-[12px] font-bold text-ink-soft sm:col-span-2">
            Taban fiyat (alt sınır, opsiyonel)
            <input type="number" name="taban_override" defaultValue={ayar.taban_override ?? ""} placeholder="boş = daire tipi taban fiyatı" className={`${inp} mt-1`} />
          </label>
        </div>
        <p className="text-[11px] text-gray">
          Koşulsuz güvenlik: opsiyonlu/satılan birime dokunulmaz, taban fiyatın altına inilmez, tavanı aşmaz.
        </p>
        <SubmitButton>Fiyat ayarını kaydet</SubmitButton>
      </form>

      {/* KURAL LİSTESİ */}
      {kurallar.length > 0 ? (
        <div className="space-y-2">
          {kurallar.map((k) => (
            <div
              key={k.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                k.aktif ? "border-hair bg-card" : "border-hair bg-soft opacity-60"
              }`}
            >
              <span className="font-semibold text-ink">{k.ad}</span>
              <span className="text-[12px] text-gray">{kuralOzet(k, tipAd)}</span>
              <div className="ml-auto flex items-center gap-3">
                <form action={fiyatKuraliAcKapa}>
                  <input type="hidden" name="proje_id" value={projeId} />
                  <input type="hidden" name="kural_id" value={k.id} />
                  <input type="hidden" name="aktif" value={k.aktif ? "false" : "true"} />
                  <button className="text-[12px] font-medium text-teal-d hover:underline">
                    {k.aktif ? "Duraklat" : "Etkinleştir"}
                  </button>
                </form>
                <form action={fiyatKuraliSil}>
                  <input type="hidden" name="proje_id" value={projeId} />
                  <input type="hidden" name="kural_id" value={k.id} />
                  <button className="text-[12px] font-medium text-red hover:underline">Sil</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray">
          Henüz kural yok. Aşağıdan ekle — ör. &quot;10. günde %3&quot;, &quot;20 satış sonrası %5&quot;, &quot;%50 satılınca %4&quot;.
        </p>
      )}

      {/* EKLE */}
      <form action={fiyatKuraliEkle} className="grid gap-2 rounded-xl border border-hair bg-soft p-4 sm:grid-cols-2">
        <input type="hidden" name="proje_id" value={projeId} />
        <input name="ad" required placeholder="Kural adı (ör. Erken kuş zammı)" className={`${inp} sm:col-span-2`} />
        <label className="block text-[12px] font-bold text-ink-soft">
          Kapsam
          <select name="tip_id" className={`${inp} mt-1`} defaultValue="">
            <option value="">Tüm daire tipleri</option>
            {tipler.map((t) => (
              <option key={t.id} value={t.id}>
                {(t.oda ?? t.ad) ?? "Tip"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] font-bold text-ink-soft">
          Tetik
          <select name="tetik" value={tetik} onChange={(e) => setTetik(e.target.value as KuralTetik)} className={`${inp} mt-1`}>
            {(Object.keys(TETIK_ET) as KuralTetik[]).map((t) => (
              <option key={t} value={t}>
                {TETIK_ET[t]}
              </option>
            ))}
          </select>
        </label>
        {tetik === "tarih" ? (
          <label className="block text-[12px] font-bold text-ink-soft">
            Tarih
            <input type="date" name="tetik_tarih" required className={`${inp} mt-1`} />
          </label>
        ) : (
          <label className="block text-[12px] font-bold text-ink-soft">
            Eşik ({tetik === "sure_gun" ? "gün" : tetik === "satis_adet" ? "adet" : "%"})
            <input type="number" name="esik" required min={1} className={`${inp} mt-1`} />
          </label>
        )}
        <label className="block text-[12px] font-bold text-ink-soft">
          Aksiyon
          <select name="aksiyon" className={`${inp} mt-1`} defaultValue="yuzde">
            {(Object.keys(AKSIYON_ET) as KuralAksiyon[]).map((a) => (
              <option key={a} value={a}>
                {AKSIYON_ET[a]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] font-bold text-ink-soft">
          Değer (3 = %3 · 50000 = +TL · sabit fiyat = hedef)
          <input type="number" name="deger" required step="any" className={`${inp} mt-1`} />
        </label>
        <label className="block text-[12px] font-bold text-ink-soft">
          Tekrar
          <select name="tekrar" className={`${inp} mt-1`} defaultValue="tek">
            <option value="tek">Tek sefer (eşik dolunca bir kez)</option>
            <option value="periyodik">Periyodik (her eşikte tekrar)</option>
          </select>
        </label>
        <div className="sm:col-span-2">
          <SubmitButton>Kural ekle</SubmitButton>
        </div>
      </form>
    </div>
  );
}
