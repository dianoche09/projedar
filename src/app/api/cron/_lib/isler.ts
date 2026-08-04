import { createAdminClient } from "@/lib/supabase/admin";
import { kayitlarYaz } from "@/lib/events";

/**
 * Cron işlerinin çekirdek mantığı — hem tekil route'lardan (elle tetikleme)
 * hem de günlük dispatcher'dan (/api/cron) çağrılır. Kod kopyalama yok.
 */
export type CronSonuc = {
  status: number;
  govde: Record<string, unknown>;
};

/**
 * Freshness (DEĞİŞMEZ #5): 15 günden uzun süredir güncellenmeyen birimleri
 * 'stale' (eskimiş) işaretler.
 */
export async function freshnessCalistir(): Promise<CronSonuc> {
  const supabase = createAdminClient();

  // 15 gün öncesinin tarihi
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - 15);

  const { error } = await supabase
    .from("birim")
    .update({ stale: true })
    .lt("son_guncelleme", dateLimit.toISOString())
    .eq("stale", false);

  if (error) {
    console.error("Freshness cron hatası:", error);
    return { status: 500, govde: { hata: error.message } };
  }

  return {
    status: 200,
    govde: {
      basarili: true,
      mesaj: "15 günden uzun süredir güncellenmeyen birimler 'stale' (eskimiş) olarak işaretlendi.",
    },
  };
}

/**
 * Kademeli/planlı açılım (MVP-1): açılış tarihi (satisa_acilis) gelmiş
 * `planli` birimleri `musait` yapar.
 * - Yalnız satilabilir=true birimler açılır (arsa sahibi payı kalıcı kapalı kalır).
 * - DEĞİŞMEZ #5: yazışta son_guncelleme=now() + stale temizlenir (taze, canlı stok).
 */
export async function stokAcilisCalistir(): Promise<CronSonuc> {
  const supabase = createAdminClient();
  const simdi = new Date().toISOString();

  const { data, error } = await supabase
    .from("birim")
    .update({ durum: "musait", son_guncelleme: simdi, stale: false })
    .eq("durum", "planli")
    .eq("satilabilir", true)
    .not("satisa_acilis", "is", null)
    .lte("satisa_acilis", simdi)
    .select("id");

  if (error) {
    console.error("Stok açılış cron hatası:", error);
    return { status: 500, govde: { hata: error.message } };
  }

  const acilan = data?.length ?? 0;
  return {
    status: 200,
    govde: {
      basarili: true,
      acilan,
      mesaj: `Açılış tarihi gelen ${acilan} planlı birim 'müsait' durumuna alındı.`,
    },
  };
}

type DolanOpsiyon = {
  id: string;
  birim_id: string;
  satici_id: string;
  birim: { proje_id: string } | { proje_id: string }[] | null;
};

function projeIdCoz(b: DolanOpsiyon["birim"]): string | null {
  if (!b) return null;
  return Array.isArray(b) ? b[0]?.proje_id ?? null : b.proje_id ?? null;
}

/**
 * Opsiyon süre aşımı: süresi dolan aktif opsiyonları temizler
 * (trigger birimleri otomatik 'musait' yapar) ve audit kaydı yazar (MVP-17).
 */
export async function opsiyonSuresiCalistir(): Promise<CronSonuc> {
  const supabase = createAdminClient();
  const simdi = new Date().toISOString();

  // Süresi dolan opsiyonlar: (a) kesin opsiyon kilit_bitis geçti, VEYA (b) geçici kilit doğrulama
  // penceresi doldu (dogrulandi=false + dogrulama_bitis geçti). İkisi de serbest bırakılır.
  const { data: dolanlar, error: secErr } = await supabase
    .from("opsiyon")
    .select("id, birim_id, satici_id, birim:birim_id(proje_id)")
    .in("durum", ["opsiyonlu", "satis_beklemede"])
    .or(`kilit_bitis.lt.${simdi},and(dogrulandi.is.false,dogrulama_bitis.lt.${simdi})`);

  if (secErr) {
    console.error("Opsiyon süre aşımı (seçim) cron hatası:", secErr);
    return { status: 500, govde: { hata: secErr.message } };
  }

  const liste = (dolanlar ?? []) as DolanOpsiyon[];
  if (liste.length === 0) {
    return {
      status: 200,
      govde: { basarili: true, temizlenen: 0, mesaj: "Süresi dolan opsiyon yok." },
    };
  }

  // Sil (Trigger otomatik olarak birimleri 'musait' yapar ve son_guncelleme yeniler).
  const { error } = await supabase
    .from("opsiyon")
    .delete()
    .in(
      "id",
      liste.map((o) => o.id),
    );

  if (error) {
    console.error("Opsiyon zaman aşımı cron hatası:", error);
    return { status: 500, govde: { hata: error.message } };
  }

  // Audit (MVP-17): süre dolması = otomatik iptal
  await kayitlarYaz(
    liste.map((o) => ({
      tip: "opsiyon" as const,
      profileId: o.satici_id,
      projeId: projeIdCoz(o.birim),
      birimId: o.birim_id,
      payload: { eylem: "sure_doldu" },
    })),
  );

  return {
    status: 200,
    govde: {
      basarili: true,
      temizlenen: liste.length,
      mesaj: `Süresi dolan ${liste.length} opsiyon temizlendi; birimler otomatik 'müsait' (trigger).`,
    },
  };
}
