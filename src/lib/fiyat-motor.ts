// Dinamik Fiyat Kural Motoru — SUNUCU değerlendirme (admin/service-role client).
// Cron (fiyatKuraliCalistir) ve satış-sonrası (birimSatisKapat) buradan çağırır.
// Graceful: tablo/kolon yoksa (migration bekliyor) sessizce {0,0} döner, hiçbir şey kırılmaz.

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ayarCoz,
  hamYeniFiyat,
  guardrailUygula,
  tetikDoldu,
  kapsamEsler,
  type FiyatKurali,
  type KuralTetik,
} from "@/lib/fiyat-kurali";
import { bildirimYaz } from "@/lib/bildirim";

type BirimRow = {
  id: string;
  tip_id: string | null;
  durum: string;
  satilabilir: boolean | null;
  ana_birim_id: string | null;
  liste_fiyati: number | null;
};

/**
 * Bir projenin aktif dinamik fiyat kurallarını değerlendirir.
 * mod='otomatik' → birim.liste_fiyati güncellenir (fiyat trigger loglar).
 * mod='oneri'    → fiyat_kural_oneri kuyruğuna 'bekliyor' öneri eklenir.
 * opts.tetikTipleri verilmezse tüm tetikler; verilirse yalnız o tipler (ör satış-sonrası: satis_*).
 */
export async function kurallariDegerlendir(
  admin: SupabaseClient,
  proje_id: string,
  opts?: { tetikTipleri?: KuralTetik[] },
): Promise<{ uygulanan: number; oneri: number }> {
  const simdiISO = new Date().toISOString();
  try {
    const { data: projeRow } = await admin
      .from("proje")
      .select("fiyat_ayar, uretici_id")
      .eq("id", proje_id)
      .single();
    if (!projeRow) return { uygulanan: 0, oneri: 0 };
    const ayar = ayarCoz((projeRow as { fiyat_ayar?: unknown }).fiyat_ayar);
    if (!ayar.aktif) return { uygulanan: 0, oneri: 0 };

    let kq = admin
      .from("fiyat_kurali")
      .select("*")
      .eq("proje_id", proje_id)
      .eq("aktif", true)
      .order("created_at", { ascending: true });
    if (opts?.tetikTipleri?.length) kq = kq.in("tetik", opts.tetikTipleri);
    const { data: kurallarRaw, error: kErr } = await kq;
    if (kErr || !kurallarRaw?.length) return { uygulanan: 0, oneri: 0 };
    const kurallar = kurallarRaw as FiyatKurali[];

    const [{ data: birimRaw }, { data: tipRaw }] = await Promise.all([
      admin
        .from("birim")
        .select("id, tip_id, durum, satilabilir, ana_birim_id, liste_fiyati")
        .eq("proje_id", proje_id),
      admin.from("daire_tipi").select("id, taban_fiyat").eq("proje_id", proje_id),
    ]);
    const birimler = ((birimRaw ?? []) as BirimRow[]).filter((b) => b.ana_birim_id == null);
    const tabanByTip = new Map((tipRaw ?? []).map((t) => [t.id as string, (t.taban_fiyat as number | null) ?? null]));

    // Durum özeti (satilabilir ana birimler): overall veya tip bazlı
    const ozetFor = (tip_id: string | null) => {
      const kapsam = birimler.filter((b) => b.satilabilir && (tip_id == null || b.tip_id === tip_id));
      return {
        satildi: kapsam.filter((b) => b.durum === "satildi").length,
        toplamSatilabilir: kapsam.length,
      };
    };

    // oneri modda dup engelle: mevcut bekleyen (kural|birim) seti
    let bekleyen = new Set<string>();
    if (ayar.mod === "oneri") {
      const { data: obk } = await admin
        .from("fiyat_kural_oneri")
        .select("kural_id, birim_id")
        .eq("proje_id", proje_id)
        .eq("durum", "bekliyor");
      bekleyen = new Set((obk ?? []).map((o) => `${o.kural_id}|${o.birim_id}`));
    }

    let uygulanan = 0;
    let oneriSay = 0;
    const oneriRows: {
      kural_id: string;
      birim_id: string;
      proje_id: string;
      eski_fiyat: number | null;
      yeni_fiyat: number;
    }[] = [];

    for (const k of kurallar) {
      const { tetik, yeniEsik } = tetikDoldu(k, ozetFor(k.tip_id), ayar.baz_tarih, simdiISO);
      if (!tetik) continue;
      const uygun = birimler.filter(
        (b) => b.satilabilir && (b.durum === "musait" || b.durum === "planli") && kapsamEsler(k, b),
      );
      for (const b of uygun) {
        const taban = ayar.taban_override ?? tabanByTip.get(b.tip_id ?? "") ?? null;
        const ham = hamYeniFiyat(k.aksiyon, k.deger, b.liste_fiyati);
        if (ham == null) continue;
        const yeni = guardrailUygula(ham, b.liste_fiyati, {
          taban,
          tavanPct: ayar.tavan_pct,
          adimMaxPct: ayar.adim_max_pct,
        });
        if (b.liste_fiyati != null && yeni === b.liste_fiyati) continue; // değişim yok
        if (ayar.mod === "otomatik") {
          const { error } = await admin
            .from("birim")
            .update({ liste_fiyati: yeni, son_guncelleme: simdiISO })
            .eq("id", b.id);
          if (!error) uygulanan++;
        } else if (!bekleyen.has(`${k.id}|${b.id}`)) {
          oneriRows.push({ kural_id: k.id, birim_id: b.id, proje_id, eski_fiyat: b.liste_fiyati, yeni_fiyat: yeni });
          oneriSay++;
        }
      }
      // Eşiği ilerlet: aynı eşik tekrar tetiklemesin (idempotent)
      await admin.from("fiyat_kurali").update({ son_uygulanan_esik: yeniEsik }).eq("id", k.id);
    }

    if (oneriRows.length) await admin.from("fiyat_kural_oneri").insert(oneriRows);

    // Bildirim (best-effort, tek özet): proje sahibine
    if (uygulanan > 0 || oneriSay > 0) {
      try {
        const { data: uretici } = await admin
          .from("uretici")
          .select("sahip_id")
          .eq("id", (projeRow as { uretici_id: string }).uretici_id)
          .single();
        const sahip = uretici?.sahip_id as string | undefined;
        if (sahip) {
          await bildirimYaz({
            profile_id: sahip,
            tip: "sistem",
            baslik: ayar.mod === "otomatik" ? "Fiyat kuralı uygulandı" : "Fiyat önerin hazır",
            govde:
              ayar.mod === "otomatik"
                ? `${uygulanan} birim fiyatı kurala göre güncellendi`
                : `${oneriSay} birimde fiyat önerisi onayını bekliyor`,
            link: ayar.mod === "otomatik" ? "/uretici/stok" : "/uretici/fiyat-onerisi",
          });
        }
      } catch {
        /* bildirim best-effort */
      }
    }

    return { uygulanan, oneri: oneriSay };
  } catch {
    return { uygulanan: 0, oneri: 0 }; // migration bekliyor / tablo yok → graceful
  }
}
