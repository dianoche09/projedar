import { createAdminClient } from "@/lib/supabase/admin";
import { kayitlarYaz } from "@/lib/events";
import { davetMaili, mailGonder } from "@/lib/mail";
import { adayDavetToken } from "@/lib/davet";
import { SEGMENT_ROL, type Segment } from "@/lib/kesif/tipler";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projedar.com";
const TAKIP_GUN = 3;
const MAKS_TEMAS = 3; // ilk davet + 2 hatırlatma → sonra 'soguk'

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
    .select("id, proje_id");

  if (error) {
    console.error("Stok açılış cron hatası:", error);
    return { status: 500, govde: { hata: error.message } };
  }

  const acilan = data?.length ?? 0;

  // Açılış = talep spike sinyali: her açılan birim için 'acilis' event yaz
  // (Talep Radarı bu spike'ı gösterir; dalga öncesi 'ilgi' sinyalleriyle eşleşir).
  if (acilan > 0) {
    await kayitlarYaz(
      (data ?? []).map((b) => ({
        tip: "acilis" as const,
        projeId: (b as { proje_id: string }).proje_id,
        birimId: (b as { id: string }).id,
        payload: { eylem: "stok_acilis", acilis: simdi },
      })),
    );
  }
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

/**
 * Keşif motoru follow-up: davet edilmiş ama yanıt vermemiş adaylara otomatik hatırlatma maili.
 * Sorgu: durum='davet_edildi' + sonraki_takip<=now + opt_out=false + temas_sayisi<MAKS_TEMAS.
 * Her hatırlatma temas_sayisi++ ve sonraki_takip'i ileri alır; sınıra ulaşan aday 'soguk' olur.
 * Opt-out edilenler doğal olarak dışarıda (index koşulu). İYS/ETK: opt-out linki mailde.
 */
export async function kesifFollowupCalistir(): Promise<CronSonuc> {
  const supabase = createAdminClient();
  const simdi = new Date().toISOString();

  const { data: adaylar, error } = await supabase
    .from("aday")
    .select("id, firma_adi, segment, email, il, temas_sayisi")
    .eq("durum", "davet_edildi")
    .eq("opt_out", false)
    .lte("sonraki_takip", simdi)
    .lt("temas_sayisi", MAKS_TEMAS)
    .not("email", "is", null)
    .limit(100);

  if (error) {
    console.error("Keşif follow-up cron hatası:", error);
    return { status: 500, govde: { hata: error.message } };
  }
  const liste = adaylar ?? [];
  if (liste.length === 0) {
    return { status: 200, govde: { basarili: true, hatirlatilan: 0, mesaj: "Takip bekleyen aday yok." } };
  }

  let hatirlatilan = 0;
  let soguyan = 0;
  const sonraki = new Date(Date.now() + TAKIP_GUN * 86400_000).toISOString();

  for (const a of liste) {
    const rol = SEGMENT_ROL[(a.segment as Segment) ?? "muteahhit"];
    if (!rol) continue; // proje adayı davet edilmez
    const id = a.id as string;
    const firma = a.firma_adi as string;
    const token = adayDavetToken(id, rol);
    const kayitUrl = `${SITE}/kayit?rol=${rol}&aday=${id}&n=${encodeURIComponent(firma)}&t=${token}`;
    const cikisUrl = `${SITE}/api/kesif/cikis?aday=${id}&t=${adayDavetToken(id, "cikis")}`;
    const html = davetMaili({
      firma,
      segment: (a.segment as string) ?? "muteahhit",
      il: (a.il as string) ?? null,
      kayitUrl,
      cikisUrl,
      ekMesaj: "Bu bir hatırlatmadır — davetiniz hâlâ geçerli.",
    });
    await mailGonder({ to: a.email as string, konu: `${firma} · Projedar davetiniz hâlâ açık`, html });
    await supabase.from("aday_temas").insert({ aday_id: id, kanal: "email", yon: "giden", konu: "Davet hatırlatma", durum: "gonderildi" });

    const yeniSayi = ((a.temas_sayisi as number) ?? 0) + 1;
    await supabase
      .from("aday")
      .update({
        temas_sayisi: yeniSayi,
        son_temas: simdi,
        sonraki_takip: yeniSayi >= MAKS_TEMAS ? null : sonraki,
        durum: yeniSayi >= MAKS_TEMAS ? "soguk" : "davet_edildi",
      })
      .eq("id", id);
    hatirlatilan++;
    if (yeniSayi >= MAKS_TEMAS) soguyan++;
  }

  return {
    status: 200,
    govde: { basarili: true, hatirlatilan, soguyan, mesaj: `${hatirlatilan} adaya hatırlatma; ${soguyan} aday 'soğuk'.` },
  };
}
