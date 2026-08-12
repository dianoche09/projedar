"use server";

import { revalidatePath } from "next/cache";
import type { ImportSatir, ImportOnizleme } from "./import-types";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kurallariDegerlendir } from "@/lib/fiyat-motor";
import { kayitYaz, kayitlarYaz, durumTip } from "@/lib/events";
import { bildirimYaz, bildirimlerYaz } from "@/lib/bildirim";
import { UUID_RE, zUuid } from "@/lib/uuid";
import { parseOzellikler } from "@/lib/ozellikler";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import * as XLSX from "xlsx";

/** Public medya URL'inden bucket içi yolu çıkar (silme için). */
function medyaYolu(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/proje-medya\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** Giriş yapan kullanıcının üretici (sahip) kaydının id'si. Yoksa null. */
async function ureticiId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("uretici")
    .select("id")
    .eq("sahip_id", user.id)
    .single();
  return data?.id ?? null;
}

function hataya(yol: string, mesaj: string): never {
  redirect(`${yol}?hata=${encodeURIComponent(mesaj)}`);
}

/**
 * Opsiyonel yönlendirme hedefi (wizard akışı için). Form'da `geri_yol` varsa onu
 * doğrular ve döndürür; yoksa null. Açık-yönlendirme (open-redirect) koruması:
 * yalnız uygulama-içi mutlak yol (`/uretici/...`) kabul edilir. Mevcut çağıranlar
 * bu alanı göndermediği için varsayılan davranış birebir korunur (geriye uyumlu).
 */
function geriYol(formData: FormData): string | null {
  const ham = String(formData.get("geri_yol") ?? "").trim();
  if (!ham) return null;
  if (!ham.startsWith("/uretici/")) return null;
  if (ham.includes("//") || ham.includes("..")) return null;
  return ham;
}

/** Başarı sonrası hedef yol + mesaj; geri_yol verilmişse oraya, yoksa varsayılana. */
function basariya(varsayilan: string, formData: FormData, mesaj?: string): never {
  const yol = geriYol(formData) ?? varsayilan;
  const ayrac = yol.includes("?") ? "&" : "?";
  redirect(mesaj ? `${yol}${ayrac}mesaj=${encodeURIComponent(mesaj)}` : yol);
}

/**
 * <input type="datetime-local"> offset'siz "YYYY-MM-DDTHH:mm" verir. Ham olarak timestamptz'e
 * yazılırsa Postgres sunucu TZ'sinde (Supabase=UTC) yorumlar → TR saati 3 saat kayar.
 * TR sabit UTC+3 (DST yok) olduğundan naive değeri +03:00 kabul edip UTC ISO'ya çeviririz.
 * Zaten offset/Z içeren string dokunulmaz. Geçersizde null.
 */
function trTarih(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const norm = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)
    ? `${s}:00+03:00`
    : /([+-]\d{2}:?\d{2}|Z)$/.test(s)
      ? s
      : `${s}+03:00`;
  const d = new Date(norm);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// ---- Proje oluştur ----
const INSAAT_ASAMA = [
  "planlama",
  "temel",
  "kaba_insaat",
  "ince_insaat",
  "cevre_duzenleme",
  "tamamlandi",
] as const;

const projeSemasi = z.object({
  ad: z.string().trim().min(2, "Proje adı en az 2 karakter olmalı"),
  il: z.string().trim().optional(),
  ilce: z.string().trim().optional(),
  mahalle: z.string().trim().optional(),
  ada: z.string().trim().optional(),
  parsel: z.string().trim().optional(),
  baslama_tarihi: z.string().trim().optional(),
  teslim_tarihi: z.string().trim().optional(),
  insaat_asamasi: z.enum(INSAAT_ASAMA).optional(),
});

export async function projeOlustur(formData: FormData) {
  const supabase = await createClient();
  const uid = await ureticiId(supabase);
  if (!uid) {
    hataya("/uretici", "Üretici kaydı bulunamadı — proje oluşturmak için 'uretici' rolüyle giriş yapın.");
  }

  // geri_yol gibi kontrol alanlarını şema dışında tut.
  const sonuc = projeSemasi.safeParse({
    ad: formData.get("ad"),
    il: formData.get("il") ?? undefined,
    ilce: formData.get("ilce") ?? undefined,
    mahalle: formData.get("mahalle") ?? undefined,
    ada: formData.get("ada") ?? undefined,
    parsel: formData.get("parsel") ?? undefined,
    baslama_tarihi: formData.get("baslama_tarihi") ?? undefined,
    teslim_tarihi: formData.get("teslim_tarihi") ?? undefined,
    insaat_asamasi: (formData.get("insaat_asamasi") || undefined) as string | undefined,
  });
  if (!sonuc.success) hataya("/uretici/proje/yeni", sonuc.error.issues[0].message);
  const d = sonuc.data;

  const { data: proje, error } = await supabase
    .from("proje")
    .insert({
      uretici_id: uid,
      ad: d.ad,
      il: d.il || null,
      ilce: d.ilce || null,
      mahalle: d.mahalle || null,
      ada: d.ada || null,
      parsel: d.parsel || null,
      baslama_tarihi: d.baslama_tarihi || null,
      teslim_tarihi: d.teslim_tarihi || null,
      insaat_asamasi: d.insaat_asamasi || "planlama",
    })
    .select("id")
    .single();
  if (error) hataya("/uretici/proje/yeni", error.message);

  revalidatePath("/uretici");
  // Wizard akışı: geri_yol verilmişse oraya (id'yi enjekte ederek) yönlen; yoksa KURULUM'a düş.
  const ham = String(formData.get("geri_yol") ?? "").trim();
  if (ham.startsWith("/uretici/")) {
    const yol = ham.replace(/__ID__/g, proje!.id);
    redirect(yol);
  }
  // Proje açılır açılmaz KURULUM'a düş: künye/imar + kapak + tanıtım envanteri + belgeler.
  redirect(`/uretici/proje/${proje!.id}/kurulum`);
}

// ---- Blok ekle ----
export async function blokEkle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const ad = String(formData.get("ad") ?? "").trim();
  const katSayisiRaw = formData.get("kat_sayisi");
  const kat_sayisi = katSayisiRaw ? Number(katSayisiRaw) : null;
  if (!ad) hataya(`/uretici/proje/${proje_id}`, "Blok adı gerekli");

  const { error } = await supabase.from("blok").insert({ proje_id, ad, kat_sayisi });
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(`/uretici/proje/${proje_id}/kurulum`, formData);
}

// ---- Blok düzelt ----
export async function blokGuncelle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const blok_id = String(formData.get("blok_id"));
  const ad = String(formData.get("ad") ?? "").trim();
  const kat_sayisi = formData.get("kat_sayisi") ? Number(formData.get("kat_sayisi")) : null;
  if (!ad) hataya(`/uretici/proje/${proje_id}`, "Blok adı gerekli");

  const { error } = await supabase.from("blok").update({ ad, kat_sayisi }).eq("id", blok_id);
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
  redirect(`/uretici/proje/${proje_id}/kurulum`);
}

// ---- Blok sil (yalnız müsait/planlı birimler temizlenir; opsiyon/satış varsa reddeder) ----
export async function blokSil(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const blok_id = String(formData.get("blok_id"));

  const { data: birimler } = await supabase.from("birim").select("durum").eq("blok_id", blok_id);
  const kritik = (birimler ?? []).filter((b) => b.durum !== "musait" && b.durum !== "planli");
  if (kritik.length > 0) {
    hataya(
      `/uretici/proje/${proje_id}`,
      `Blok silinemez: ${kritik.length} birim opsiyonlu/satılmış/durdurulmuş. Önce onları çöz.`,
    );
  }

  await supabase.from("birim").delete().eq("blok_id", blok_id);
  const { error } = await supabase.from("blok").delete().eq("id", blok_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(`/uretici/proje/${proje_id}`, formData, "Blok silindi");
}

// ---- Daire tipi ekle ----
/** Form'dan daire tipi alanlarını oku (ekle + düzelt ortak). */
function tipAlanlari(formData: FormData) {
  const tamsayi = (v: FormDataEntryValue | null) => (v && String(v).trim() ? Number(v) : null);
  return {
    ad: String(formData.get("ad") ?? "").trim(),
    oda: String(formData.get("oda") ?? "").trim() || null,
    net_m2: tamsayi(formData.get("net_m2")),
    taban_fiyat: tamsayi(formData.get("taban_fiyat")),
  };
}

export async function daireTipiEkle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const alanlar = tipAlanlari(formData);
  if (!alanlar.ad) hataya(`/uretici/proje/${proje_id}`, "Daire tipi adı gerekli");

  const { error } = await supabase.from("daire_tipi").insert({ proje_id, ...alanlar });
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(`/uretici/proje/${proje_id}/kurulum`, formData);
}

// ---- Daire tipi düzelt ----
export async function tipGuncelle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const tip_id = String(formData.get("tip_id"));
  const alanlar = tipAlanlari(formData);
  if (!alanlar.ad) hataya(`/uretici/proje/${proje_id}`, "Daire tipi adı gerekli");

  const { error } = await supabase.from("daire_tipi").update(alanlar).eq("id", tip_id);
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
  redirect(`/uretici/proje/${proje_id}/kurulum`);
}

// ---- Daire tipi sil (birim kullanıyorsa reddeder) ----
export async function tipSil(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const tip_id = String(formData.get("tip_id"));

  const { count } = await supabase
    .from("birim")
    .select("id", { count: "exact", head: true })
    .eq("tip_id", tip_id);
  if ((count ?? 0) > 0) {
    hataya(`/uretici/proje/${proje_id}`, `${count} birim bu tipi kullanıyor — önce onları sil/değiştir.`);
  }

  const { error } = await supabase.from("daire_tipi").delete().eq("id", tip_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(`/uretici/proje/${proje_id}`, formData, "Daire tipi silindi");
}

// ---- Daire tipi plan görseli yükle (daire_tipi.plan_url; daireye basınca modalda görünür) ----
export async function tipGorseliYukle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const tip_id = String(formData.get("tip_id"));
  const geri = `/uretici/proje/${proje_id}/kurulum`;

  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");

  const dosya = formData.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0) hataya(geri, "Görsel seçilmedi");

  const admin = createAdminClient();
  // IDOR kalkanı: tip bu projeye ait mi? Değilse Storage/DB'ye DOKUNMA (başka üreticinin tipi ezilmesin)
  const { data: tip } = await admin
    .from("daire_tipi")
    .select("plan_url")
    .eq("id", tip_id)
    .eq("proje_id", proje_id)
    .single();
  if (!tip) hataya(geri, "Daire tipi bu projede bulunamadı");
  // eski plan görselini sil (varsa) — sahiplik yukarıda doğrulandı
  const eskiYol = medyaYolu(tip.plan_url ?? null);
  if (eskiYol) await admin.storage.from(MEDYA_BUCKET).remove([eskiYol]);

  const uzanti = dosya.name.includes(".") ? dosya.name.split(".").pop()!.toLowerCase() : "png";
  const yol = `${proje_id}/tip/${tip_id}-${randomUUID()}.${uzanti}`;
  const buf = Buffer.from(await dosya.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(MEDYA_BUCKET)
    .upload(yol, buf, { contentType: dosya.type || "image/png", upsert: false });
  if (upErr) hataya(geri, `Yükleme hatası: ${upErr.message}`);

  const { data: pub } = admin.storage.from(MEDYA_BUCKET).getPublicUrl(yol);
  const { data: gnc, error } = await admin
    .from("daire_tipi")
    .update({ plan_url: pub.publicUrl })
    .eq("id", tip_id)
    .eq("proje_id", proje_id)
    .select("id");
  if (error) hataya(geri, error.message);
  if (!gnc || gnc.length === 0) hataya(geri, "Daire tipi bu projede bulunamadı");
  revalidatePath(geri);
  redirect(`${geri}?mesaj=${encodeURIComponent("Tip görseli yüklendi")}`);
}

// ---- Generator: tip × kat → birimler (toplu üretim) ----
export async function birimGenerator(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const blok_id = String(formData.get("blok_id"));
  const tip_id = String(formData.get("tip_id"));
  const kat_bas = Number(formData.get("kat_bas"));
  const kat_son = Number(formData.get("kat_son"));
  const daire_basina = Math.max(1, Number(formData.get("daire_basina")) || 1);
  const taban = Number(formData.get("taban_fiyat")) || 0;
  const kat_artis = (Number(formData.get("kat_artis")) || 0) / 100; // % kat şerefiyesi
  const yon = String(formData.get("yon") ?? "").trim() || null;
  const tur = String(formData.get("tur") ?? "daire");

  if (!blok_id || !tip_id || Number.isNaN(kat_bas) || Number.isNaN(kat_son) || kat_son < kat_bas) {
    hataya(`/uretici/proje/${proje_id}`, "Generator girdileri eksik/hatalı (blok, tip, kat aralığı).");
  }
  if ((kat_son - kat_bas + 1) * daire_basina > 500) {
    hataya(`/uretici/proje/${proje_id}`, "Tek seferde en fazla 500 birim üretilebilir.");
  }

  // blok kodu + tip m² + mevcut daire_no'lar (duplicate atlamak için) — tek turda
  const [{ data: blok }, { data: tip }, { data: mevcutlar }] = await Promise.all([
    supabase.from("blok").select("ad").eq("id", blok_id).single(),
    supabase.from("daire_tipi").select("net_m2, brut_m2").eq("id", tip_id).single(),
    supabase.from("birim").select("daire_no").eq("blok_id", blok_id),
  ]);
  const kod = (blok?.ad ?? "X").trim().charAt(0).toUpperCase();
  const mevcutSet = new Set((mevcutlar ?? []).map((b) => b.daire_no));

  const birimler: Record<string, unknown>[] = [];
  let atlanan = 0;
  for (let kat = kat_bas; kat <= kat_son; kat++) {
    for (let d = 1; d <= daire_basina; d++) {
      const daire_no = `${kod}${String(kat).padStart(2, "0")}${String(d).padStart(2, "0")}`;
      if (mevcutSet.has(daire_no)) {
        atlanan++;
        continue;
      }
      const katYuzde = Math.round((kat - 1) * kat_artis * 100);
      birimler.push({
        proje_id,
        blok_id,
        tip_id,
        tur,
        kat,
        daire_no,
        yon,
        net_m2: tip?.net_m2 ?? null,
        brut_m2: tip?.brut_m2 ?? null,
        durum: "musait",
        liste_fiyati: taban ? Math.round(taban * (1 + (kat - 1) * kat_artis)) : null,
        serefiye: taban && katYuzde ? { kat: katYuzde } : null,
      });
    }
  }

  if (birimler.length === 0) {
    hataya(`/uretici/proje/${proje_id}`, `Üretilecek yeni birim yok — ${atlanan} daire zaten mevcut.`);
  }

  const { error } = await supabase.from("birim").insert(birimler);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  const mesaj = `${birimler.length} birim üretildi${atlanan ? ` · ${atlanan} mevcut atlandı` : ""}`;
  basariya(`/uretici/proje/${proje_id}`, formData, mesaj);
}

// ---- Birim durum güncelle (ızgaradan tek tık) ----
const durumSemasi = z.enum([
  "musait",
  "opsiyonlu",
  "satis_beklemede",
  "satildi",
  "stop",
  "planli",
  "kiralandi",
]);

export async function birimDurumGuncelle(formData: FormData) {
  const supabase = await createClient();
  const birim_id = String(formData.get("birim_id"));
  const proje_id = String(formData.get("proje_id"));
  const durum = durumSemasi.safeParse(formData.get("durum"));
  if (!durum.success) hataya(`/uretici/proje/${proje_id}`, "Geçersiz durum");

  // Duruma göre not (opsiyon: kim/ne zaman; satış: alıcı vb.). Boş = notu temizle.
  const notRaw = formData.get("durum_notu");
  const durum_notu =
    typeof notRaw === "string" && notRaw.trim() ? notRaw.trim().slice(0, 280) : null;

  // birim↔opsiyon desync kalkanı: müteahhit opsiyonlu birimi başka duruma çekerse opsiyon
  //   satırı hayalet kalmasın (emlakçı "Opsiyonlarım"da görür, unique index yeni opsiyonu reddeder).
  //   Aktif→satildi: opsiyon yaşam döngüsünü kapat (cron "süre doldu israf" saymasın); diğer: serbest bırak.
  if (durum.data !== "opsiyonlu" && durum.data !== "satis_beklemede") {
    const { data: aktifOps } = await supabase
      .from("opsiyon")
      .select("id")
      .eq("birim_id", birim_id)
      .in("durum", ["opsiyonlu", "satis_beklemede"]);
    const idler = (aktifOps ?? []).map((o) => o.id as string);
    if (idler.length) {
      if (durum.data === "satildi") {
        await supabase
          .from("opsiyon")
          .update({ durum: "satildi", sonuc: "satildi", sonuc_at: new Date().toISOString() })
          .in("id", idler);
      } else {
        await supabase.from("opsiyon").delete().in("id", idler);
      }
    }
  }

  // Tek doğru kaynak: her yazışta son_guncelleme=now() (DEĞİŞMEZ #5)
  const { error } = await supabase
    .from("birim")
    .update({ durum: durum.data, durum_notu, son_guncelleme: new Date().toISOString() })
    .eq("id", birim_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);

  // Audit (MVP-17): satış/opsiyon/durum olayı
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await kayitYaz({
    tip: durumTip(durum.data),
    profileId: user?.id ?? null,
    projeId: proje_id,
    birimId: birim_id,
    payload: { eylem: "uretici_durum", durum: durum.data, durum_notu },
  });

  // Dinamik fiyat: bu ızgara güncellemesi bir satışsa satış-adet/yüzde kurallarını değerlendir (best-effort)
  if (durum.data === "satildi") {
    try {
      await kurallariDegerlendir(createAdminClient(), proje_id, { tetikTipleri: ["satis_adet", "satis_yuzde"] });
    } catch {
      /* best-effort */
    }
  }

  revalidatePath(`/uretici/proje/${proje_id}`);
  revalidatePath("/uretici/stok");
}

// ---- Tek daire tam düzenle (ızgaradan modal) ----
export async function birimGuncelle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const birim_id = String(formData.get("birim_id"));
  const metin = (v: FormDataEntryValue | null) => (String(v ?? "").trim() ? String(v).trim() : null);
  const sayi = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : Number(s);
  };

  const sKat = sayi(formData.get("serefiye_kat"));
  const sManzara = sayi(formData.get("serefiye_manzara"));
  const guncelle: Record<string, unknown> = {
    daire_no: metin(formData.get("daire_no")),
    kat: sayi(formData.get("kat")),
    liste_fiyati: sayi(formData.get("liste_fiyati")),
    yon: metin(formData.get("yon")),
    manzara: metin(formData.get("manzara")),
    net_m2: sayi(formData.get("net_m2")),
    brut_m2: sayi(formData.get("brut_m2")),
    serefiye: sKat != null || sManzara != null ? { kat: sKat ?? undefined, manzara: sManzara ?? undefined } : null,
    satilabilir: formData.get("satilabilir") === "on",
    son_guncelleme: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("birim")
    .update(guncelle)
    .eq("id", birim_id)
    .eq("proje_id", proje_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  revalidatePath("/uretici/stok");
}

// ---- Satışı kapat (durum→satildi) — satıcı atfı SİSTEM kaydından (tartışma-önleyici) ----
// DEĞİŞMEZ: atıf = aktif opsiyon sahibi (danışman kilitlemiş). Müteahhit yeniden atayamaz →
//   "kim sattı" tartışması çıkmaz. Aktif opsiyon yoksa doğrudan satış (danışman yok, hakediş yok).
//   Tutar: müteahhit override veya tahsis komisyonundan (birim_satici_kazanci). Platform pay almaz.
//   Ayrıca opsiyon yaşam döngüsünü kapatır (birim↔opsiyon desync + cron skor kirliliği fix).
export async function birimSatisKapat(formData: FormData) {
  const supabase = await createClient();
  const birim_id = String(formData.get("birim_id"));
  const proje_id = String(formData.get("proje_id"));
  const geri = geriYol(formData) ?? "/uretici/stok";
  if (!UUID_RE.test(birim_id) || !UUID_RE.test(proje_id)) hataya(geri, "Geçersiz birim");

  const uid = await ureticiId(supabase);
  if (!uid || !(await projeSahibiMi(supabase, proje_id))) hataya(geri, "Bu projeye erişim yok");

  const notRaw = formData.get("durum_notu");
  const durum_notu = typeof notRaw === "string" && notRaw.trim() ? notRaw.trim().slice(0, 280) : null;

  // Aktif opsiyon → satıcı (sistem kaydı; client girdisine güvenilmez)
  const { data: ops } = await supabase
    .from("opsiyon")
    .select("id, satici_id")
    .eq("birim_id", birim_id)
    .in("durum", ["opsiyonlu", "satis_beklemede"])
    .maybeSingle();
  const satici_id = (ops?.satici_id as string | undefined) ?? undefined;

  if (satici_id) {
    // Tutar: override varsa onu, yoksa tahsis komisyonundan hesapla (RPC yetki guard'lı)
    const override = String(formData.get("tutar") ?? "").trim();
    let tutar: number | null = override !== "" && Number.isFinite(Number(override)) ? Number(override) : null;
    if (tutar == null) {
      const { data: hesap } = await supabase.rpc("birim_satici_kazanci", { p_birim_id: birim_id, p_satici: satici_id });
      tutar = typeof hesap === "number" ? hesap : null;
    }
    const { data: b } = await supabase.from("birim").select("para_birimi").eq("id", birim_id).single();
    // Hakediş defteri: birim başına tek (unique birim_id) → upsert
    await supabase.from("hakedis").upsert(
      {
        birim_id,
        proje_id,
        uretici_id: uid,
        emlakci_id: satici_id,
        tutar,
        para_birimi: (b?.para_birimi as string | null) ?? "TRY",
      },
      { onConflict: "birim_id" },
    );
    // Opsiyon yaşam döngüsünü kapat (aktif → satildi; cron "süre doldu israf" saymasın)
    await supabase
      .from("opsiyon")
      .update({ durum: "satildi", sonuc: "satildi", sonuc_at: new Date().toISOString() })
      .eq("id", ops!.id);
  }

  const { error } = await supabase
    .from("birim")
    .update({ durum: "satildi", durum_notu, son_guncelleme: new Date().toISOString() })
    .eq("id", birim_id)
    .eq("proje_id", proje_id);
  if (error) hataya(geri, error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await kayitYaz({
    tip: "satis",
    profileId: user?.id ?? null,
    projeId: proje_id,
    birimId: birim_id,
    payload: { eylem: "satis_kapat", satici_id: satici_id ?? null, dogrudan: !satici_id },
  });

  // Dinamik fiyat: satış-adet/yüzde kurallarını anında değerlendir (best-effort, migration yoksa no-op)
  try {
    await kurallariDegerlendir(createAdminClient(), proje_id, { tetikTipleri: ["satis_adet", "satis_yuzde"] });
  } catch {
    /* best-effort */
  }

  revalidatePath("/uretici/stok");
  revalidatePath(`/uretici/proje/${proje_id}`);
  revalidatePath("/uretici/opsiyonlar");
  redirect(`${geri}${geri.includes("?") ? "&" : "?"}mesaj=${encodeURIComponent("Satış kapatıldı")}`);
}

// ---- Per-daire görsel yükle/sil (birim.gorsel_url; tip planının önüne geçer) ----
export async function birimGorselYukle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const birim_id = String(formData.get("birim_id"));
  const geri = geriYol(formData) ?? "/uretici/stok";
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");

  const dosya = formData.get("dosya");
  if (!(dosya instanceof File) || dosya.size === 0) hataya(geri, "Görsel seçilmedi");

  const admin = createAdminClient();
  // IDOR kalkanı: birim bu projeye ait mi? Değilse Storage/DB'ye dokunma.
  const { data: birim } = await admin
    .from("birim")
    .select("gorsel_url")
    .eq("id", birim_id)
    .eq("proje_id", proje_id)
    .single();
  if (!birim) hataya(geri, "Birim bu projede bulunamadı");
  const eskiYol = medyaYolu((birim as { gorsel_url: string | null }).gorsel_url ?? null);
  if (eskiYol) await admin.storage.from(MEDYA_BUCKET).remove([eskiYol]);

  const uzanti = dosya.name.includes(".") ? dosya.name.split(".").pop()!.toLowerCase() : "png";
  const yol = `${proje_id}/birim/${birim_id}-${randomUUID()}.${uzanti}`;
  const buf = Buffer.from(await dosya.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from(MEDYA_BUCKET)
    .upload(yol, buf, { contentType: dosya.type || "image/png", upsert: false });
  if (upErr) hataya(geri, `Yükleme hatası: ${upErr.message}`);

  const { data: pub } = admin.storage.from(MEDYA_BUCKET).getPublicUrl(yol);
  const { data: gnc, error } = await admin
    .from("birim")
    .update({ gorsel_url: pub.publicUrl, son_guncelleme: new Date().toISOString() })
    .eq("id", birim_id)
    .eq("proje_id", proje_id)
    .select("id");
  if (error) hataya(geri, error.message);
  if (!gnc || gnc.length === 0) hataya(geri, "Birim bu projede bulunamadı");
  revalidatePath("/uretici/stok");
  revalidatePath(`/uretici/proje/${proje_id}`);
  redirect(`${geri}${geri.includes("?") ? "&" : "?"}mesaj=${encodeURIComponent("Daire görseli güncellendi")}`);
}

export async function birimGorselSil(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const birim_id = String(formData.get("birim_id"));
  const geri = geriYol(formData) ?? "/uretici/stok";
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");

  const admin = createAdminClient();
  const { data: birim } = await admin
    .from("birim")
    .select("gorsel_url")
    .eq("id", birim_id)
    .eq("proje_id", proje_id)
    .single();
  if (!birim) hataya(geri, "Birim bu projede bulunamadı");
  const eskiYol = medyaYolu((birim as { gorsel_url: string | null }).gorsel_url ?? null);
  if (eskiYol) await admin.storage.from(MEDYA_BUCKET).remove([eskiYol]);
  const { error } = await admin
    .from("birim")
    .update({ gorsel_url: null, son_guncelleme: new Date().toISOString() })
    .eq("id", birim_id)
    .eq("proje_id", proje_id);
  if (error) hataya(geri, error.message);
  revalidatePath("/uretici/stok");
  revalidatePath(`/uretici/proje/${proje_id}`);
  redirect(`${geri}${geri.includes("?") ? "&" : "?"}mesaj=${encodeURIComponent("Daire görseli kaldırıldı")}`);
}

// ── Eklenti birimler (otopark/depo → ana daireye bağlı; daireden doğrudan eklenir/silinir) ──
const EKLENTI_TUR = ["otopark", "depo"] as const;

export async function eklentiEkle(formData: FormData): Promise<void> {
  const proje_id = String(formData.get("proje_id"));
  const ana_birim_id = String(formData.get("ana_birim_id"));
  const tur = String(formData.get("tur"));
  const geri = `/uretici/proje/${proje_id}`;
  if (!UUID_RE.test(proje_id) || !UUID_RE.test(ana_birim_id)) hataya(geri, "Geçersiz birim");
  if (!(EKLENTI_TUR as readonly string[]).includes(tur)) hataya(geri, "Eklenti türü otopark veya depo olmalı");
  const fRaw = String(formData.get("liste_fiyati") ?? "").trim();
  const fiyat = fRaw === "" ? null : Number(fRaw);
  if (fiyat != null && (!Number.isFinite(fiyat) || fiyat < 0)) hataya(geri, "Geçersiz fiyat");
  const etiket = String(formData.get("daire_no") ?? "").trim() || (tur === "otopark" ? "Otopark" : "Depo");

  const supabase = await createClient();
  // RLS: üretici yalnız KENDİ projesinin birimine insert edebilir (birim insert policy proje sahipliğini kontrol eder).
  const { error } = await supabase.from("birim").insert({
    proje_id,
    ana_birim_id,
    tur,
    daire_no: etiket,
    liste_fiyati: fiyat,
    para_birimi: "TRY",
    durum: "musait",
    satilabilir: true,
  });
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  revalidatePath("/uretici/stok");
  basariya(geri, formData, "Eklenti eklendi");
}

export async function eklentiSil(formData: FormData): Promise<void> {
  const proje_id = String(formData.get("proje_id"));
  const birim_id = String(formData.get("birim_id"));
  const geri = `/uretici/proje/${proje_id}`;
  if (!UUID_RE.test(birim_id)) hataya(geri, "Geçersiz birim");
  const supabase = await createClient();
  // Yalnız EKLENTİ silinsin (ana_birim_id dolu) — ana daire bu yolla silinemez.
  const { error } = await supabase.from("birim").delete().eq("id", birim_id).not("ana_birim_id", "is", null);
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  revalidatePath("/uretici/stok");
  basariya(geri, formData, "Eklenti kaldırıldı");
}

// ── Opsiyon TALEBİ: müteahhit kararı. RPC SECURITY DEFINER (yetki + çift-satış fonksiyon içinde). ──

/** Talep sahibi emlakçıya onay/red bildirimi (best-effort, admin client). */
async function talepBildir(talepId: string, karar: "onay" | "red", gun?: number): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: talep } = await admin
      .from("opsiyon_talep")
      .select("talep_eden_id, birim:birim_id(daire_no, proje:proje_id(ad))")
      .eq("id", talepId)
      .single();
    if (!talep?.talep_eden_id) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const birim = talep.birim as any;
    const daire = birim?.daire_no ?? "?";
    const projeAd = birim?.proje?.ad ?? "Proje";
    await bildirimYaz({
      profile_id: talep.talep_eden_id as string,
      tip: karar === "onay" ? "onay" : "red",
      baslik: karar === "onay" ? "Opsiyon talebin onaylandı" : "Opsiyon talebin reddedildi",
      govde:
        karar === "onay"
          ? `${projeAd} · Daire ${daire}${gun ? ` · ${gun} gün opsiyon` : ""}`
          : `${projeAd} · Daire ${daire}`,
      link: "/havuz/opsiyonlarim",
    });
  } catch {
    /* best-effort */
  }
}

export async function talepOnayla(talepId: string, gun?: number): Promise<{ ok: boolean; mesaj: string }> {
  if (!UUID_RE.test(talepId)) return { ok: false, mesaj: "Geçersiz talep" };
  const supabase = await createClient();
  // p_gun null → RPC proje.opsiyon_ayar.onay_gun'dan (yoksa 7) çözer (tek doğru kaynak: config)
  const { error } = await supabase.rpc("opsiyon_talep_onayla", { p_talep: talepId, p_gun: gun ?? null });
  if (!error) await talepBildir(talepId, "onay", gun);
  revalidatePath("/uretici/opsiyonlar");
  revalidatePath("/uretici/stok");
  revalidatePath("/uretici");
  return error ? { ok: false, mesaj: error.message } : { ok: true, mesaj: "Talep onaylandı — opsiyon açıldı" };
}

export async function talepReddet(talepId: string): Promise<{ ok: boolean; mesaj: string }> {
  if (!UUID_RE.test(talepId)) return { ok: false, mesaj: "Geçersiz talep" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("opsiyon_talep_reddet", { p_talep: talepId });
  if (!error) await talepBildir(talepId, "red");
  revalidatePath("/uretici/opsiyonlar");
  return error ? { ok: false, mesaj: error.message } : { ok: true, mesaj: "Talep reddedildi" };
}

// ── GEÇİCİ opsiyon (yöntem 'gecici'): emlakçı anında kilitledi (dogrulandi=false); müteahhit KESİNLEŞTİRİR/REDDEDER. ──

/** Geçici opsiyon sahibi emlakçıya doğrulama/red bildirimi (best-effort). birim/proje id döner (skor izi için). */
async function opsiyonBildir(opsiyonId: string, karar: "dogrula" | "reddet"): Promise<{ birim_id: string; proje_id: string } | null> {
  try {
    const admin = createAdminClient();
    const { data: ops } = await admin
      .from("opsiyon")
      .select("satici_id, birim_id, birim:birim_id(daire_no, proje:proje_id(id, ad))")
      .eq("id", opsiyonId)
      .single();
    if (!ops?.satici_id) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const birim = ops.birim as any;
    const daire = birim?.daire_no ?? "?";
    const projeAd = birim?.proje?.ad ?? "Proje";
    await bildirimYaz({
      profile_id: ops.satici_id as string,
      tip: karar === "dogrula" ? "onay" : "red",
      baslik: karar === "dogrula" ? "Opsiyonun doğrulandı" : "Opsiyonun reddedildi",
      govde: karar === "dogrula" ? `${projeAd} · Daire ${daire} · kesin opsiyon` : `${projeAd} · Daire ${daire} · daire serbest`,
      link: "/havuz/opsiyonlarim",
    });
    return birim?.proje?.id ? { birim_id: ops.birim_id as string, proje_id: birim.proje.id as string } : null;
  } catch {
    return null;
  }
}

export async function opsiyonDogrula(opsiyonId: string): Promise<{ ok: boolean; mesaj: string }> {
  if (!UUID_RE.test(opsiyonId)) return { ok: false, mesaj: "Geçersiz opsiyon" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.rpc("opsiyon_dogrula", { p_ops: opsiyonId });
  if (!error) {
    const iz = await opsiyonBildir(opsiyonId, "dogrula");
    // Skor izi: müteahhit doğrulama sorumluluğu (muteahhit_skor bu event'i proje bazında kullanır)
    if (iz && user) await kayitYaz({ tip: "opsiyon", profileId: user.id, projeId: iz.proje_id, birimId: iz.birim_id, payload: { eylem: "dogrulandi" } });
  }
  revalidatePath("/uretici/opsiyonlar");
  revalidatePath("/uretici/stok");
  revalidatePath("/uretici");
  return error ? { ok: false, mesaj: error.message.replace(/^.*?:\s*/, "") } : { ok: true, mesaj: "Opsiyon doğrulandı — kesin kilit" };
}

export async function opsiyonReddet(opsiyonId: string): Promise<{ ok: boolean; mesaj: string }> {
  if (!UUID_RE.test(opsiyonId)) return { ok: false, mesaj: "Geçersiz opsiyon" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Bildirim + iz reddetmeden ÖNCE (silinince satici_id/birim okunamaz)
  const iz = await opsiyonBildir(opsiyonId, "reddet");
  const { error } = await supabase.rpc("opsiyon_reddet", { p_ops: opsiyonId });
  if (!error && iz && user) await kayitYaz({ tip: "opsiyon", profileId: user.id, projeId: iz.proje_id, birimId: iz.birim_id, payload: { eylem: "reddedildi" } });
  revalidatePath("/uretici/opsiyonlar");
  revalidatePath("/uretici/stok");
  revalidatePath("/uretici");
  return error ? { ok: false, mesaj: error.message.replace(/^.*?:\s*/, "") } : { ok: true, mesaj: "Opsiyon reddedildi — daire serbest" };
}

// ---- Çoklu seçim: toplu durum/fiyat güncelle ----
function idListesi(formData: FormData): string[] {
  return String(formData.get("birim_idler") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => zUuid.safeParse(s).success);
}

export async function birimTopluGuncelle(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const idler = idListesi(formData);
  if (idler.length === 0) hataya(`/uretici/proje/${proje_id}`, "Birim seçilmedi.");

  const guncelle: Record<string, unknown> = { son_guncelleme: new Date().toISOString() };
  const durum = durumSemasi.safeParse(formData.get("durum"));
  if (durum.success) guncelle.durum = durum.data;
  const fiyatRaw = String(formData.get("liste_fiyati") ?? "").trim();
  if (fiyatRaw) guncelle.liste_fiyati = Number(fiyatRaw);

  if (Object.keys(guncelle).length === 1) {
    hataya(`/uretici/proje/${proje_id}`, "Durum veya fiyat gir (en az biri).");
  }

  const { error } = await supabase
    .from("birim")
    .update(guncelle)
    .in("id", idler)
    .eq("proje_id", proje_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);

  // Audit (MVP-17): toplu durum değişimini birim başına logla (yalnız durum değiştiyse)
  if (durum.success) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await kayitlarYaz(
      idler.map((bid) => ({
        tip: durumTip(durum.data),
        profileId: user?.id ?? null,
        projeId: proje_id,
        birimId: bid,
        payload: { eylem: "uretici_durum_toplu", durum: durum.data },
      })),
    );
  }

  revalidatePath(`/uretici/proje/${proje_id}`);
  redirect(`/uretici/proje/${proje_id}?mesaj=${encodeURIComponent(`${idler.length} birim güncellendi`)}`);
}

// ---- Dalga açılışı: seçili birimleri planlı + açılış tarihiyle programla ----
// Cron (stokAcilisCalistir) tarih gelince planli→musait yapar + 'acilis' event yazar.
// Böylece stok partiler halinde ağa açılır (kıtlık + senkron talep = veri yerçekimi).
export async function dalgaPlanla(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const idler = idListesi(formData);
  if (idler.length === 0) hataya(`/uretici/proje/${proje_id}`, "Birim seçilmedi.");

  // datetime-local → TR (UTC+3) → UTC ISO (timezone kayması fix)
  const acilisIso = trTarih(formData.get("satisa_acilis"));
  if (!acilisIso) {
    hataya(`/uretici/proje/${proje_id}`, "Geçerli bir açılış tarihi seç.");
  }
  if (new Date(acilisIso).getTime() <= Date.now()) {
    hataya(`/uretici/proje/${proje_id}`, "Açılış tarihi gelecekte olmalı.");
  }

  // Yalnız müsait/planlı birimler dalgaya alınır (opsiyon/satış korunur).
  const { data: uygun } = await supabase
    .from("birim")
    .select("id")
    .in("id", idler)
    .eq("proje_id", proje_id)
    .in("durum", ["musait", "planli"]);
  const hedef = (uygun ?? []).map((b) => b.id as string);
  const korunan = idler.length - hedef.length;
  if (hedef.length === 0) {
    hataya(`/uretici/proje/${proje_id}`, "Seçili birimlerin hiçbiri planlanabilir değil (opsiyon/satış korunur).");
  }

  const { error } = await supabase
    .from("birim")
    .update({ durum: "planli", satisa_acilis: acilisIso, son_guncelleme: new Date().toISOString() })
    .in("id", hedef)
    .eq("proje_id", proje_id);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await kayitlarYaz(
    hedef.map((bid) => ({
      tip: "dalga" as const,
      profileId: user?.id ?? null,
      projeId: proje_id,
      birimId: bid,
      payload: { eylem: "dalga_planla", satisa_acilis: acilisIso },
    })),
  );

  revalidatePath(`/uretici/proje/${proje_id}`);
  const mesaj =
    `${hedef.length} birim dalgaya alındı · ${new Date(acilisIso).toLocaleString("tr-TR")} açılış` +
    (korunan ? ` · ${korunan} birim korundu` : "");
  redirect(`/uretici/proje/${proje_id}?mesaj=${encodeURIComponent(mesaj)}`);
}

// ---- Çoklu seçim: toplu sil (opsiyon/satış korunur) ----
export async function birimTopluSil(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const idler = idListesi(formData);
  if (idler.length === 0) hataya(`/uretici/proje/${proje_id}`, "Birim seçilmedi.");

  const { data } = await supabase
    .from("birim")
    .select("id, durum")
    .in("id", idler)
    .eq("proje_id", proje_id);
  const silinebilir = (data ?? [])
    .filter((b) => b.durum === "musait" || b.durum === "planli")
    .map((b) => b.id);
  const korunan = (data ?? []).length - silinebilir.length;

  if (silinebilir.length > 0) {
    const { error } = await supabase.from("birim").delete().in("id", silinebilir);
    if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  }
  revalidatePath(`/uretici/proje/${proje_id}`);
  const mesaj =
    `${silinebilir.length} birim silindi` +
    (korunan ? ` · ${korunan} opsiyon/satış korundu` : "");
  redirect(`/uretici/proje/${proje_id}?mesaj=${encodeURIComponent(mesaj)}`);
}

// ---- Excel/CSV import (toplu birim) ----
const GECERLI_DURUM = [
  "musait",
  "opsiyonlu",
  "satis_beklemede",
  "satildi",
  "stop",
  "planli",
  "kiralandi",
];

/** Satırdan esnek sütun okuma (Türkçe/İngilizce başlık varyasyonları). */
function hucre(r: Record<string, unknown>, ...anahtarlar: string[]): unknown {
  for (const k of Object.keys(r)) {
    if (anahtarlar.includes(k.toLowerCase().trim())) return r[k];
  }
  return undefined;
}

/** Dosyayı oku + eşle + çöz (INSERT ETMEZ). Hem önizleme hem gerçek import bunu kullanır (DRY). */
async function stokDosyaCoz(
  supabase: Awaited<ReturnType<typeof createClient>>,
  proje_id: string,
  file: File,
): Promise<{ birimler: Record<string, unknown>[]; atlanan: number; mukerrer: number; toplamSatir: number; satirlar: ImportSatir[] }> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  const [{ data: bloklar }, { data: tipler }, { data: mevcutlar }] = await Promise.all([
    supabase.from("blok").select("id, ad").eq("proje_id", proje_id),
    supabase.from("daire_tipi").select("id, ad").eq("proje_id", proje_id),
    supabase.from("birim").select("blok_id, daire_no").eq("proje_id", proje_id),
  ]);
  const blokMap = new Map((bloklar ?? []).map((b) => [String(b.ad).toLowerCase().trim(), b.id]));
  const tipMap = new Map((tipler ?? []).map((t) => [String(t.ad).toLowerCase().trim(), t.id]));
  // Mükerrer koruma: aynı blok+daire_no zaten varsa atla (re-import güvenli; birimGenerator ile aynı disiplin).
  const dupSet = new Set(
    (mevcutlar ?? []).map((b) => `${b.blok_id}|${String(b.daire_no ?? "").toLowerCase().trim()}`),
  );

  const birimler: Record<string, unknown>[] = [];
  const satirlar: ImportSatir[] = [];
  let atlanan = 0;
  let mukerrer = 0;
  rows.forEach((r, i) => {
    const blokAdRaw = String(hucre(r, "blok", "blok adı", "block") ?? "").trim();
    const blokAd = blokAdRaw.toLowerCase();
    const daire_no = String(hucre(r, "daire_no", "daire no", "daire", "no") ?? "").trim() || null;
    const blok_id = blokMap.get(blokAd);
    if (!blok_id) {
      atlanan++;
      satirlar.push({ no: i + 2, blok: blokAdRaw || "—", daire_no: daire_no ?? "—", durum: "eslesmeyen_blok" });
      return;
    }
    const dupAnahtar = `${blok_id}|${(daire_no ?? "").toLowerCase().trim()}`;
    if (daire_no && dupSet.has(dupAnahtar)) {
      mukerrer++;
      satirlar.push({ no: i + 2, blok: blokAdRaw, daire_no: daire_no ?? "—", durum: "mukerrer" });
      return;
    }
    if (daire_no) dupSet.add(dupAnahtar); // aynı dosya içi tekrarları da yakala
    const tipAd = String(hucre(r, "tip", "daire tipi", "tip adı") ?? "").toLowerCase().trim();
    const durumRaw = String(hucre(r, "durum", "status") ?? "musait").toLowerCase().trim();
    const paraRaw = String(hucre(r, "para_birimi", "para", "currency") ?? "").toUpperCase().trim();
    const yon = String(hucre(r, "yon", "yön", "cephe", "direction") ?? "").trim() || null;
    const manzara = String(hucre(r, "manzara", "view") ?? "").trim() || null;
    birimler.push({
      proje_id,
      blok_id,
      tip_id: tipMap.get(tipAd) ?? null,
      kat: Number(hucre(r, "kat", "floor")) || null,
      daire_no,
      durum: GECERLI_DURUM.includes(durumRaw) ? durumRaw : "musait",
      liste_fiyati: Number(hucre(r, "fiyat", "liste_fiyati", "price")) || null,
      net_m2: Number(hucre(r, "net_m2", "net m2", "m2", "metrekare")) || null,
      brut_m2: Number(hucre(r, "brut_m2", "brut m2", "brut", "gross")) || null,
      para_birimi: paraRaw || "TRY",
      yon,
      manzara,
    });
    satirlar.push({ no: i + 2, blok: blokAdRaw, daire_no: daire_no ?? "—", durum: "eklenecek" });
  });

  return { birimler, atlanan, mukerrer, toplamSatir: rows.length, satirlar };
}

/** Dry-run önizleme — INSERT ETMEZ, akıbet özetini + ilk 50 satırı döndürür (client tablo). */
export async function stokImportOnizle(formData: FormData): Promise<ImportOnizleme> {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const file = formData.get("dosya") as File | null;
  if (!file || file.size === 0) return { ok: false, hata: "Excel/CSV dosyası seçilmedi" };
  try {
    const s = await stokDosyaCoz(supabase, proje_id, file);
    return {
      ok: true,
      eklenecek: s.birimler.length,
      atlanan: s.atlanan,
      mukerrer: s.mukerrer,
      toplamSatir: s.toplamSatir,
      satirlar: s.satirlar.slice(0, 50),
    };
  } catch {
    return { ok: false, hata: "Dosya okunamadı (xlsx/xls/csv olmalı)" };
  }
}

export async function excelImport(formData: FormData) {
  const supabase = await createClient();
  const proje_id = String(formData.get("proje_id"));
  const file = formData.get("dosya") as File | null;
  if (!file || file.size === 0) hataya(`/uretici/proje/${proje_id}`, "Excel/CSV dosyası seçilmedi");

  let sonuc: Awaited<ReturnType<typeof stokDosyaCoz>>;
  try {
    sonuc = await stokDosyaCoz(supabase, proje_id, file!);
  } catch {
    hataya(`/uretici/proje/${proje_id}`, "Dosya okunamadı (xlsx/xls/csv olmalı)");
  }

  if (sonuc!.birimler.length === 0) {
    hataya(
      `/uretici/proje/${proje_id}`,
      `Eklenecek yeni birim yok (${sonuc!.atlanan} eşleşmeyen blok, ${sonuc!.mukerrer} mükerrer atlandı). Blok adları mevcut bloklarla eşleşmeli. Sütunlar: blok, kat, daire_no, tip, durum, fiyat, net_m2, brut_m2, para_birimi, yon, manzara`,
    );
  }
  const { error } = await supabase.from("birim").insert(sonuc!.birimler);
  if (error) hataya(`/uretici/proje/${proje_id}`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  const uyari =
    (sonuc!.atlanan ? `, ${sonuc!.atlanan} eşleşmeyen blok` : "") +
    (sonuc!.mukerrer ? `, ${sonuc!.mukerrer} mükerrer atlandı` : "");
  redirect(
    `/uretici/proje/${proje_id}?mesaj=${encodeURIComponent(`${sonuc!.birimler.length} birim eklendi${uyari}`)}`,
  );
}

// ── Tahsis (MOAT — granüler dağıtım) — ÇOKLU ALICI + daire-bazlı kapsam ──
const TerimSemasi = z.object({
  komisyon_tip: z.enum(["yuzde", "sabit", "yok"]),
  komisyon_deger: z.coerce.number().nonnegative().nullable(),
  munhasir: z.boolean(),
  kontenjan: z.coerce.number().int().positive().nullable(),
  fiyat_gorunur: z.boolean(),
});

export async function tahsisEkle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  if (!UUID_RE.test(proje_id)) hataya("/uretici", "Geçersiz proje");
  const geri = `/uretici/proje/${proje_id}`;

  // ALICILAR — mod: tum_ag | segment | ofis | danisman. UUID_RE (lenient) ŞART (demo id'leri RFC-uyumsuz).
  const uuidler = (k: string) =>
    formData.getAll(k).map(String).filter((s) => UUID_RE.test(s));
  type Alici = {
    hedef_tip: "danisman" | "ofis" | "herkes";
    hedef_id: string | null;
    hedef_filtre: Record<string, string> | null;
  };
  const modu = String(formData.get("hedef_modu") ?? "tum_ag");
  let alicilar: Alici[] = [];
  if (modu === "segment") {
    // Segment = hedef_tip 'herkes' + filtre (canlı: sonradan katılan eşleşen de görür). RLS hedef_filtre eşler.
    const f: Record<string, string> = {};
    for (const k of ["marka", "il", "ilce", "uzmanlik"]) {
      const v = String(formData.get(`f_${k}`) ?? "").trim();
      if (v) f[k] = v;
    }
    if (Object.keys(f).length === 0) hataya(geri, "Segment için en az bir filtre seç (marka/şehir/ilçe/uzmanlık)");
    alicilar = [{ hedef_tip: "herkes", hedef_id: null, hedef_filtre: f }];
  } else if (modu === "ofis") {
    alicilar = uuidler("ofis_ids").map((id) => ({ hedef_tip: "ofis" as const, hedef_id: id, hedef_filtre: null }));
  } else if (modu === "danisman") {
    alicilar = uuidler("emlakci_ids").map((id) => ({ hedef_tip: "danisman" as const, hedef_id: id, hedef_filtre: null }));
  } else {
    alicilar = [{ hedef_tip: "herkes", hedef_id: null, hedef_filtre: null }]; // tum_ag
  }
  if (alicilar.length === 0) hataya(geri, "Alıcı seç: Tüm ağ / Segment / Ofis / Belirli danışman");

  // ŞARTLAR (seçili tüm alıcılara aynı; farklı şart için ayrı kayıt yap)
  const komRaw = String(formData.get("komisyon_deger") ?? "").trim();
  const kotRaw = String(formData.get("kontenjan") ?? "").trim();
  const t = TerimSemasi.safeParse({
    komisyon_tip: formData.get("komisyon_tip") ?? "yuzde",
    komisyon_deger: komRaw === "" ? null : komRaw,
    munhasir: formData.get("munhasir") === "on",
    kontenjan: kotRaw === "" ? null : kotRaw,
    fiyat_gorunur: formData.get("fiyat_gorunur") === "on",
  });
  if (!t.success) hataya(geri, "Geçersiz şart bilgisi");
  const terim = t.data;

  // KAPSAM — kapsam_tip="belirli" ise blok/kat/tip/tür/DAİRE; "tum" ise boş = tüm proje
  const kapsam: Record<string, string[]> = {};
  if (String(formData.get("kapsam_tip")) === "belirli") {
    const al = (k: string) => formData.getAll(k).map(String).filter(Boolean);
    const bloklar = al("bloklar"), katlar = al("katlar"), tipler = al("tipler"), turler = al("turler"), birimler = al("birimler");
    if (bloklar.length) kapsam.bloklar = bloklar;
    if (katlar.length) kapsam.katlar = katlar;
    if (tipler.length) kapsam.tipler = tipler;
    if (turler.length) kapsam.turler = turler;
    if (birimler.length) kapsam.birimler = birimler; // daire-bazlı (RLS emlakci_birim_gorebilir 2026-06-29d)
  }

  // Süre (gün) — geçersiz/negatif/aşırı değerde çök(me)mesin: sanitize et (crafted POST kalkanı)
  const sureRaw = String(formData.get("bitis_gun") ?? "").trim();
  const sureNum = sureRaw ? Number(sureRaw) : NaN;
  const bitis =
    Number.isFinite(sureNum) && sureNum > 0 && sureNum <= 3650
      ? new Date(Date.now() + sureNum * 86_400_000).toISOString()
      : null;

  const supabase = await createClient();
  const actorId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const { error } = await supabase.from("tahsis").insert(
    alicilar.map((a) => ({
      proje_id,
      created_by: actorId, // ← EKLE (yeni kayıtlar dolu; mevcut kayıtlar NULL kalır = doğru)
      hedef_tip: a.hedef_tip,
      hedef_id: a.hedef_id,
      hedef_filtre: a.hedef_filtre,
      kapsam,
      komisyon_tip: terim.komisyon_tip,
      komisyon_deger: terim.komisyon_deger,
      munhasir: terim.munhasir,
      kontenjan: terim.kontenjan,
      fiyat_gorunur: terim.fiyat_gorunur,
      bitis,
    })),
  );
  if (error) hataya(geri, error.message);

  // Bildirim: danışman + ofis üyeleri + segment/herkes fan-out (yalnız DOĞRULANMIŞ; in-app, cap 500)
  try {
    const admin = createAdminClient();
    const { data: proje } = await admin.from("proje").select("ad").eq("id", proje_id).single();
    const hedefler = new Set<string>();
    for (const id of alicilar.filter((a) => a.hedef_tip === "danisman" && a.hedef_id).map((a) => a.hedef_id as string)) hedefler.add(id);

    const ofisIds = alicilar.filter((a) => a.hedef_tip === "ofis" && a.hedef_id).map((a) => a.hedef_id as string);
    if (ofisIds.length) {
      const { data } = await admin.from("profiles").select("id").eq("rol", "emlakci").eq("durum", "aktif").in("ofis_id", ofisIds).limit(500);
      (data ?? []).forEach((p) => hedefler.add(p.id as string));
    }

    // herkes / segment → eşleşen doğrulanmış danışmanlar (görüntüleyebilecekler)
    const herkes = alicilar.find((a) => a.hedef_tip === "herkes");
    if (herkes) {
      let q = admin.from("profiles").select("id").eq("rol", "emlakci").eq("durum", "aktif").eq("belge_durumu", "dogrulandi").limit(500);
      const f = herkes.hedef_filtre;
      if (f?.marka) q = q.eq("marka", f.marka);
      if (f?.il) q = q.eq("il", f.il);
      if (f?.ilce) q = q.eq("ilce", f.ilce);
      if (f?.uzmanlik) q = q.eq("uzmanlik", f.uzmanlik);
      const { data } = await q;
      (data ?? []).forEach((p) => hedefler.add(p.id as string));
    }

    await bildirimlerYaz([...hedefler], {
      tip: "tahsis",
      baslik: "Yeni proje sana açıldı",
      govde: (proje?.ad as string | null) ?? "Proje",
      link: "/havuz",
    });
  } catch {
    /* bildirim best-effort */
  }

  revalidatePath(geri);
  basariya(geri, formData, `${alicilar.length} tahsis eklendi`);
}

// ── Tahsis düzenle (edit-in-place; hedef dahil). Tek satır = tek alıcı. ──
export async function tahsisGuncelle(formData: FormData) {
  const tahsis_id = String(formData.get("tahsis_id"));
  const proje_id = String(formData.get("proje_id"));
  if (!UUID_RE.test(tahsis_id) || !UUID_RE.test(proje_id)) hataya("/uretici", "Geçersiz kayıt");
  const geri = `/uretici/tahsis?proje=${proje_id}`;

  const supabase = await createClient();
  const { data: eski } = await supabase.from("tahsis")
    .select("hedef_tip, hedef_id, hedef_filtre, kapsam, komisyon_tip, komisyon_deger, munhasir, kontenjan, fiyat_gorunur, bitis")
    .eq("id", tahsis_id).single();
  if (!eski) hataya(geri, "Tahsis bulunamadı");

  // HEDEF (tek): tum_ag | segment | ofis(tek) | danisman(tek)
  const modu = String(formData.get("hedef_modu") ?? "tum_ag");
  let hedef_tip: "herkes" | "ofis" | "danisman" = "herkes";
  let hedef_id: string | null = null;
  let hedef_filtre: Record<string, string> | null = null;
  if (modu === "segment") {
    const f: Record<string, string> = {};
    for (const k of ["marka", "il", "ilce", "uzmanlik"]) {
      const v = String(formData.get(`f_${k}`) ?? "").trim();
      if (v) f[k] = v;
    }
    if (Object.keys(f).length === 0) hataya(geri, "Segment için en az bir filtre seç");
    hedef_filtre = f;
  } else if (modu === "ofis") {
    const id = String(formData.get("ofis_id") ?? "");
    if (!UUID_RE.test(id)) hataya(geri, "Ofis seç");
    hedef_tip = "ofis"; hedef_id = id;
  } else if (modu === "danisman") {
    const id = String(formData.get("emlakci_id") ?? "");
    if (!UUID_RE.test(id)) hataya(geri, "Danışman seç");
    hedef_tip = "danisman"; hedef_id = id;
  }

  // KAPSAM
  const kapsam: Record<string, string[]> = {};
  if (String(formData.get("kapsam_tip")) === "belirli") {
    const al = (k: string) => formData.getAll(k).map(String).filter(Boolean);
    for (const k of ["bloklar", "katlar", "tipler", "turler", "birimler"]) {
      const v = al(k); if (v.length) kapsam[k] = v;
    }
  }

  // ŞARTLAR
  const kom = String(formData.get("komisyon_deger") ?? "").trim();
  const kot = String(formData.get("kontenjan") ?? "").trim();
  const komisyon_tip = String(formData.get("komisyon_tip") ?? "yuzde") as "yuzde" | "sabit" | "yok";
  const sureRaw = String(formData.get("bitis_gun") ?? "").trim();
  const sureNum = sureRaw ? Number(sureRaw) : NaN;
  const bitis = Number.isFinite(sureNum) && sureNum > 0 && sureNum <= 3650
    ? new Date(Date.now() + sureNum * 86_400_000).toISOString() : null;

  const yeni = {
    hedef_tip, hedef_id, hedef_filtre, kapsam,
    komisyon_tip,
    komisyon_deger: kom === "" ? null : Number(kom),
    munhasir: formData.get("munhasir") === "on",
    kontenjan: kot === "" ? null : Number(kot),
    fiyat_gorunur: formData.get("fiyat_gorunur") === "on",
    bitis,
    updated_at: new Date().toISOString(),
    updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  };

  const { error } = await supabase.from("tahsis").update(yeni).eq("id", tahsis_id);
  if (error) hataya(geri, error.message);

  await kayitYaz({ tip: "tahsis", projeId: proje_id, payload: { aksiyon: "guncelle", tahsis_id, eski, yeni } });
  revalidatePath(geri);
  basariya(geri, formData, "Tahsis güncellendi");
}

// ── Tek tahsis durum geçişi. kaldirildi TERMINAL (devam ile dirilmez). ──
export async function tahsisDurumGuncelle(formData: FormData) {
  const tahsis_id = String(formData.get("tahsis_id"));
  const proje_id = String(formData.get("proje_id"));
  const yeni_durum = String(formData.get("yeni_durum")) as "aktif" | "askida" | "kaldirildi";
  if (!UUID_RE.test(tahsis_id) || !["aktif", "askida", "kaldirildi"].includes(yeni_durum)) return;
  const geri = `/uretici/tahsis?proje=${proje_id}`;
  const supabase = await createClient();

  const { data: mevcut } = await supabase.from("tahsis").select("durum").eq("id", tahsis_id).single();
  if (!mevcut) return;
  if (mevcut.durum === "kaldirildi") hataya(geri, "Kaldırılmış tahsis yeniden aktifleştirilemez; yeni tahsis oluştur.");

  const { error } = await supabase.from("tahsis")
    .update({ durum: yeni_durum, updated_at: new Date().toISOString(), updated_by: (await supabase.auth.getUser()).data.user?.id ?? null })
    .eq("id", tahsis_id);
  if (error) hataya(geri, error.message);

  await kayitYaz({ tip: "tahsis", projeId: proje_id, payload: {
    aksiyon: yeni_durum === "askida" ? "askiya_al" : yeni_durum === "aktif" ? "devam" : "kaldir",
    tahsis_id, eski: { durum: mevcut.durum }, yeni: { durum: yeni_durum },
  } });
  revalidatePath(geri);
  basariya(geri, formData, yeni_durum === "askida" ? "Askıya alındı" : yeni_durum === "kaldirildi" ? "Kaldırıldı" : "Yeniden aktif");
}

// ── Toplu lifecycle — ATOMİK (DB RPC tahsis_toplu; update+audit tek transaction). Invariant 2. ──
export async function tahsisTopluAksiyon(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const aksiyon = String(formData.get("aksiyon")); // askiya_al|devam|kaldir|uzat
  const ids = formData.getAll("tahsis_ids").map(String).filter((s) => UUID_RE.test(s));
  const gunRaw = String(formData.get("gun") ?? "").trim();
  const geri = `/uretici/tahsis?proje=${proje_id}`;
  if (!UUID_RE.test(proje_id) || ids.length === 0) hataya(geri, "Seçim yok");
  if (!["askiya_al", "devam", "kaldir", "uzat"].includes(aksiyon)) hataya(geri, "Geçersiz aksiyon");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tahsis_toplu", {
    p_proje_id: proje_id, p_ids: ids, p_aksiyon: aksiyon, p_gun: gunRaw ? Number(gunRaw) : null,
  });
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  basariya(geri, formData, `${data ?? 0} tahsis güncellendi`);
}

// ⚠️ HARD DELETE — normal kullanıcı akışından ÇIKARILDI (kullanıcıya görünen "Kaldır" = tahsisDurumGuncelle('kaldirildi')).
// Yalnız administrative cleanup / veri bütünlüğü istisnası. UI'da buton bağlanmaz.
export async function tahsisSil(formData: FormData) {
  const id = zUuid.safeParse(formData.get("tahsis_id"));
  const proje_id = String(formData.get("proje_id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("tahsis").delete().eq("id", id.data);
  revalidatePath(`/uretici/proje/${proje_id}`);
}

export async function projeTazele(formData: FormData) {
  const id = String(formData.get("proje_id"));
  if (!id) return;

  const supabase = await createClient();
  const simdi = new Date().toISOString();

  // 1. Proje son güncelleme zamanını yenile
  await supabase
    .from("proje")
    .update({ son_guncelleme: simdi })
    .eq("id", id);

  // 2. Tüm birimleri 'stale=false' yap ve son_guncelleme güncelle
  await supabase
    .from("birim")
    .update({ son_guncelleme: simdi, stale: false })
    .eq("proje_id", id);

  revalidatePath(`/uretici/proje/${id}`);
}

// ── Proje medyası: kapak foto · tanıtım envanteri (foto/video/broşür) · resmi belgeler ──
// Yükleme service-role ile (DEĞİŞMEZ #1: yalnız server). Sahiplik RLS select ile doğrulanır.
const MEDYA_BUCKET = "proje-medya";

async function projeSahibiMi(supabase: SupabaseClient, proje_id: string): Promise<boolean> {
  const uid = await ureticiId(supabase);
  if (!uid) return false;
  const { data } = await supabase
    .from("proje")
    .select("id, uretici_id")
    .eq("id", proje_id)
    .single();
  return !!data && data.uretici_id === uid;
}

/**
 * Kapak/galeri/broşür/belge yükle (dosya) ya da tanıtım videosu/dış belge ekle (link).
 * tip ∈ { kapak, foto, video, brosur, ruhsat, iskan, yapi_denetim, otopark, diger }.
 */
export async function medyaYukle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const tip = String(formData.get("tip") ?? "foto");
  const geri = `/uretici/proje/${proje_id}/kurulum`;

  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");

  const admin = createAdminClient();
  const dosyalar = formData
    .getAll("dosya")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const url = String(formData.get("url") ?? "").trim();
  const ad0 = String(formData.get("ad") ?? "").trim();

  // Salt link (tanıtım videosu / dış belge)
  if (dosyalar.length === 0) {
    if (!url) hataya(geri, "Dosya veya link gerekli");
    const { error } = await admin.from("proje_belge").insert({ proje_id, tip, ad: ad0 || url, url });
    if (error) hataya(geri, error.message);
    revalidatePath(geri);
    basariya(geri, formData, "Eklendi");
  }

  // Kapak tekildir → eski kapağı (dosya + kayıt) temizle
  if (tip === "kapak") {
    const { data: eski } = await admin
      .from("proje_belge")
      .select("id, url")
      .eq("proje_id", proje_id)
      .eq("tip", "kapak");
    for (const e of eski ?? []) {
      const yol = medyaYolu(e.url);
      if (yol) await admin.storage.from(MEDYA_BUCKET).remove([yol]);
      await admin.from("proje_belge").delete().eq("id", e.id);
    }
  }

  for (const f of dosyalar) {
    const uzanti = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "bin";
    const yol = `${proje_id}/${tip}/${randomUUID()}.${uzanti}`;
    const buf = Buffer.from(await f.arrayBuffer());
    const { error: upErr } = await admin.storage
      .from(MEDYA_BUCKET)
      .upload(yol, buf, { contentType: f.type || "application/octet-stream", upsert: false });
    if (upErr) hataya(geri, `Yükleme hatası: ${upErr.message}`);
    const { data: pub } = admin.storage.from(MEDYA_BUCKET).getPublicUrl(yol);
    const { error: insErr } = await admin
      .from("proje_belge")
      .insert({ proje_id, tip, ad: ad0 || f.name, url: pub.publicUrl });
    if (insErr) hataya(geri, insErr.message);
  }

  revalidatePath(geri);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(geri, formData, "Yüklendi");
}

export async function medyaSil(formData: FormData) {
  const id = zUuid.safeParse(formData.get("belge_id"));
  const proje_id = String(formData.get("proje_id"));
  if (!id.success) return;

  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) return;

  const admin = createAdminClient();
  // IDOR kalkanı: belge bu projeye ait değilse hiçbir şey silme
  const { data: belge } = await admin
    .from("proje_belge")
    .select("id, url")
    .eq("id", id.data)
    .eq("proje_id", proje_id)
    .single();
  if (belge) {
    const yol = medyaYolu(belge.url);
    if (yol) await admin.storage.from(MEDYA_BUCKET).remove([yol]);
    await admin.from("proje_belge").delete().eq("id", belge.id).eq("proje_id", proje_id);
  }
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
}

// ── Proje künyesi / imar (ada/parsel/emsal/taks + kunye jsonb) ──
export async function projeKunyeGuncelle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const sayi = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : Number(s);
  };
  const metin = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  };

  const kunye = {
    ruhsat_tarihi: metin(formData.get("ruhsat_tarihi")),
    yapi_denetim: metin(formData.get("yapi_denetim")),
    arsa_alani: sayi(formData.get("arsa_alani")),
    toplam_insaat: sayi(formData.get("toplam_insaat")),
    imar_durumu: metin(formData.get("imar_durumu")),
    kat_karsiligi: formData.get("kat_karsiligi") === "on",
    otopark: metin(formData.get("otopark")), // proje geneli otopark kuralı (ör. "Her daireye 1 kapalı")
    malzeme: String(formData.get("malzeme") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    // Yapılandırılmış öznitelikler (sabit sözlük, filtrelenebilir). Eski serbest-metin
    // donati/daire_ozellikleri/yakin_cevre okuOzellikler() ile geri-uyumlu okunur.
    ozellikler: parseOzellikler(formData),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("proje")
    .update({
      ada: metin(formData.get("ada")),
      parsel: metin(formData.get("parsel")),
      emsal: sayi(formData.get("emsal")),
      taks: sayi(formData.get("taks")),
      kunye,
      son_guncelleme: new Date().toISOString(),
    })
    .eq("id", proje_id);
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}`);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  basariya(`/uretici/proje/${proje_id}/kurulum`, formData, "Künye güncellendi");
}

// ── Yatırım (Faz-1 yurtiçi: kira getirisi + geri dönüş süresi; para_birimi TRY sabit) ──
// golden_visa_esik / oturum_uygun = Faz-2 (yurtdışı) → bu kolonlara DOKUNMA (sessiz ezme yok).
export async function projeYatirimGuncelle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const sayi = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : Number(s);
  };
  const supabase = await createClient();
  const { error } = await supabase
    .from("proje")
    .update({
      para_birimi: "TRY",
      kira_getirisi_pct: sayi(formData.get("kira_getirisi_pct")),
      amortisman_yil: sayi(formData.get("amortisman_yil")),
      son_guncelleme: new Date().toISOString(),
    })
    .eq("id", proje_id);
  if (error) hataya(`/uretici/proje/${proje_id}/kurulum`, error.message);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(`/uretici/proje/${proje_id}/kurulum`, formData, "Yatırım bilgileri kaydedildi");
}

// ── Ödeme Planı (proje şablonu → tüm birimlere uygulanır; aylık taksit UI'da fiyattan hesaplanır) ──
// Şema: birim.odeme_plani jsonb {pesinat_pct, taksit_sayisi, vade_farki_pct, ara_odemeler:[{ay,pct}]}.
// NOT: db/2026-06-28_odeme-plani.sql migration'ı çalışmadan UPDATE hata verir (graceful).
export async function projeOdemePlaniGuncelle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const sayi = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : Number(s);
  };
  const geri = `/uretici/proje/${proje_id}/kurulum`;
  const pesinat_pct = sayi(formData.get("pesinat_pct"));
  const taksit_sayisi = sayi(formData.get("taksit_sayisi"));
  const vade_farki_pct = sayi(formData.get("vade_farki_pct")) ?? 0;

  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");
  // Boş submit = kazara tüm planları silme; no-op uyarısı.
  if (pesinat_pct == null && taksit_sayisi == null) {
    basariya(geri, formData, "Ödeme planı için en az peşinat % veya taksit sayısı girin");
  }

  const plan = { pesinat_pct, taksit_sayisi, vade_farki_pct, ara_odemeler: [] as { ay: number; pct: number }[] };
  const { error } = await supabase
    .from("birim")
    .update({ odeme_plani: plan, son_guncelleme: new Date().toISOString() })
    .eq("proje_id", proje_id);
  if (error) hataya(geri, `Ödeme planı kaydedilemedi (migration çalıştı mı?): ${error.message}`);
  revalidatePath(geri);
  revalidatePath(`/uretici/proje/${proje_id}`);
  basariya(geri, formData, "Ödeme planı tüm birimlere uygulandı");
}

// ── Mahal Listesi (proje teslim standardı: her mahal için zemin/duvar/tavan) ──
export async function mahalEkle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const geri = `/uretici/proje/${proje_id}/kurulum`;
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");

  const mahal = String(formData.get("mahal") ?? "").trim();
  if (!mahal) hataya(geri, "Mahal adı gerekli");
  const al = (k: string) => String(formData.get(k) ?? "").trim() || null;

  const { error } = await supabase.from("mahal").insert({
    proje_id,
    mahal,
    zemin: al("zemin"),
    duvar: al("duvar"),
    tavan: al("tavan"),
    marka: al("marka"),
    aciklama: al("aciklama"),
  });
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  redirect(`${geri}?mesaj=${encodeURIComponent("Mahal eklendi")}`);
}

export async function mahalSil(formData: FormData) {
  const id = zUuid.safeParse(formData.get("mahal_id"));
  const proje_id = String(formData.get("proje_id"));
  if (!id.success) return;
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) return;
  await supabase.from("mahal").delete().eq("id", id.data);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
}

/** Üretici kurumsal profili (şirket sayfası). Owner RLS: sahip_id = auth.uid(). uretici.profil jsonb. */
export async function ureticiProfilGuncelle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const metin = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  };
  const profil = {
    logo_url: metin(formData.get("logo_url")),
    kurulus_yili: metin(formData.get("kurulus_yili")),
    hakkinda: metin(formData.get("hakkinda")),
    web: metin(formData.get("web")),
    il: metin(formData.get("il")),
    ilce: metin(formData.get("ilce")),
    telefon: metin(formData.get("telefon")),
  };
  const { error } = await supabase.from("uretici").update({ profil }).eq("sahip_id", user.id);
  if (error) hataya("/uretici/ayarlar", error.message);
  revalidatePath("/uretici/ayarlar");
  basariya("/uretici/ayarlar", formData, "Firma profili güncellendi");
}

/** Üretici lansman/kampanya oluşturur (kendi projesine). RLS lansman_owner sahipliği doğrular. */
export async function lansmanEkle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const proje_id = String(formData.get("proje_id") ?? "");
  const baslik = String(formData.get("baslik") ?? "").trim();
  if (!UUID_RE.test(proje_id) || !baslik) hataya("/uretici/lansman", "Proje ve başlık zorunlu");
  const metin = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" ? null : s;
  };
  // durum allow-list (kolon serbest text, CHECK yok → crafted POST kalkanı)
  const LANSMAN_DURUM = ["lansman", "on_talep", "satista", "etkinlik"];
  const durumRaw = metin(formData.get("durum")) ?? "lansman";
  const { error } = await supabase.from("lansman").insert({
    proje_id,
    baslik,
    aciklama: metin(formData.get("aciklama")),
    tarih: trTarih(formData.get("tarih")), // datetime-local → TR (UTC+3) → UTC ISO
    konum: metin(formData.get("konum")),
    durum: LANSMAN_DURUM.includes(durumRaw) ? durumRaw : "lansman",
  });
  if (error) hataya("/uretici/lansman", error.message);
  revalidatePath("/uretici/lansman");
  basariya("/uretici/lansman", formData, "Lansman eklendi");
}

/**
 * Proje opsiyon disiplini ayarı (müteahhit tanımlar — DEĞİŞMEZ #3 güçlendirmesi).
 * yontem: 'gecici' (geçici kilit + müteahhit doğrulaması — ÖNERİLEN) | 'onay' (talep→onay) | 'dogrudan' (anlık, güvenilen).
 * proje.opsiyon_ayar jsonb: { yontem, dogrulama_saat, kilit_gun, kota, musteri_zorunlu }.
 */
export async function projeOpsiyonAyar(formData: FormData) {
  const proje_id = String(formData.get("proje_id") ?? "");
  const yontem = String(formData.get("yontem") ?? "");
  if (!UUID_RE.test(proje_id) || !["gecici", "onay", "dogrudan"].includes(yontem)) return;
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) return;
  // Sayısal sınırlar: doğrulama penceresi 1-72sa, kesin kilit 1-30g, kota 1-20
  const sinir = (v: FormDataEntryValue | null, min: number, max: number, def: number) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };
  const opsiyon_ayar = {
    yontem,
    dogrulama_saat: sinir(formData.get("dogrulama_saat"), 1, 72, 2),
    kilit_gun: sinir(formData.get("kilit_gun"), 1, 30, 3),
    onay_gun: sinir(formData.get("onay_gun"), 1, 30, 7),
    yanit_sla_saat: sinir(formData.get("yanit_sla_saat"), 6, 168, 48),
    kota: sinir(formData.get("kota"), 1, 20, 3),
    musteri_zorunlu: String(formData.get("musteri_zorunlu") ?? "") === "on",
    hatirlatma_saat: sinir(formData.get("hatirlatma_saat"), 1, 48, 12),
    uzatma_hakki: String(formData.get("uzatma_hakki") ?? "") === "on",
    uzatma_gun: sinir(formData.get("uzatma_gun"), 1, 15, 2),
    dusuk_skor_kota: String(formData.get("dusuk_skor_kota") ?? "") === "on",
    dusuk_skor_esik: sinir(formData.get("dusuk_skor_esik"), 10, 70, 40),
  };
  // Legacy opsiyon_yontemi kolonu senkron (eski okuyucular için): 'gecici'/'dogrudan'→'dogrudan', 'onay'→'talep_kod'.
  const legacy = yontem === "onay" ? "talep_kod" : "dogrudan";
  await supabase.from("proje").update({ opsiyon_ayar, opsiyon_yontemi: legacy }).eq("id", proje_id);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
  revalidatePath(`/uretici/proje/${proje_id}`);
}

/** Üretici kendi lansmanını siler (RLS lansman_owner). */
export async function lansmanSil(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return;
  await supabase.from("lansman").delete().eq("id", id);
  revalidatePath("/uretici/lansman");
}

// ══════════════════════════════════════════════════════════════════════════
// DİNAMİK FİYAT KURALLARI (2026-08-11) — kural CRUD + proje ayarı + öneri onay
// ══════════════════════════════════════════════════════════════════════════
const KURAL_TETIK = ["sure_gun", "satis_adet", "satis_yuzde", "tarih"] as const;
const KURAL_AKSIYON = ["yuzde", "sabit_ekle", "sabit_fiyat"] as const;
const KURAL_TEKRAR = ["tek", "periyodik"] as const;

const kuralSemasi = z.object({
  ad: z.string().trim().min(1, "Kural adı gerekli").max(80),
  tip_id: z.string().trim().optional().nullable(),
  tetik: z.enum(KURAL_TETIK),
  esik: z.coerce.number().nonnegative().default(0),
  tetik_tarih: z.string().trim().optional().nullable(),
  aksiyon: z.enum(KURAL_AKSIYON),
  deger: z.coerce.number(),
  tekrar: z.enum(KURAL_TEKRAR).default("tek"),
});

/** Yeni fiyat kuralı ekle (proje kurulum). Düzenleme = sil + yeniden ekle (son_uygulanan_esik sıfırlanır). */
export async function fiyatKuraliEkle(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const geri = `/uretici/proje/${proje_id}/kurulum`;
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");
  const s = kuralSemasi.safeParse({
    ad: formData.get("ad"),
    tip_id: formData.get("tip_id") || null,
    tetik: formData.get("tetik"),
    esik: formData.get("esik") ?? 0,
    tetik_tarih: formData.get("tetik_tarih") || null,
    aksiyon: formData.get("aksiyon"),
    deger: formData.get("deger"),
    tekrar: formData.get("tekrar") ?? "tek",
  });
  if (!s.success) hataya(geri, s.error.issues[0].message);
  const d = s.data;
  const tip_id = d.tip_id && UUID_RE.test(d.tip_id) ? d.tip_id : null;
  const { error } = await supabase.from("fiyat_kurali").insert({
    proje_id,
    tip_id,
    ad: d.ad,
    tetik: d.tetik,
    esik: d.esik,
    tetik_tarih: d.tetik === "tarih" ? d.tetik_tarih || null : null,
    aksiyon: d.aksiyon,
    deger: d.deger,
    tekrar: d.tekrar,
  });
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  basariya(geri, formData, "Kural eklendi");
}

export async function fiyatKuraliSil(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const id = zUuid.safeParse(formData.get("kural_id"));
  if (!id.success) return;
  const supabase = await createClient(); // RLS fiyat_kurali_owner sahipliği zorlar
  await supabase.from("fiyat_kurali").delete().eq("id", id.data);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
}

export async function fiyatKuraliAcKapa(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const id = zUuid.safeParse(formData.get("kural_id"));
  const aktif = String(formData.get("aktif")) === "true";
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("fiyat_kurali").update({ aktif }).eq("id", id.data);
  revalidatePath(`/uretici/proje/${proje_id}/kurulum`);
}

/** Proje fiyat ayarı (mod + guardrail + baz). fiyat_ayar jsonb'yi komple yazar. */
export async function projeFiyatAyar(formData: FormData) {
  const proje_id = String(formData.get("proje_id"));
  const geri = `/uretici/proje/${proje_id}/kurulum`;
  const supabase = await createClient();
  if (!(await projeSahibiMi(supabase, proje_id))) hataya("/uretici", "Bu projeye erişim yok");
  const sayiOrNull = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s === "" || !Number.isFinite(Number(s)) ? null : Number(s);
  };
  const fiyat_ayar = {
    aktif: String(formData.get("aktif") ?? "") === "on",
    mod: String(formData.get("mod")) === "otomatik" ? "otomatik" : "oneri",
    baz_tarih: String(formData.get("baz_tarih") ?? "").trim() || null,
    tavan_pct: sayiOrNull(formData.get("tavan_pct")),
    adim_max_pct: sayiOrNull(formData.get("adim_max_pct")),
    taban_override: sayiOrNull(formData.get("taban_override")),
  };
  const { error } = await supabase.from("proje").update({ fiyat_ayar }).eq("id", proje_id);
  if (error) hataya(geri, error.message);
  revalidatePath(geri);
  basariya(geri, formData, "Fiyat ayarı kaydedildi");
}

/** Öneri kuyruğu (mod='oneri'): seçili önerileri birim fiyatına uygula. */
export async function fiyatOneriUygula(formData: FormData) {
  const supabase = await createClient();
  const geri = "/uretici/fiyat-onerisi";
  const idler = String(formData.get("oneri_idler") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => zUuid.safeParse(s).success);
  if (idler.length === 0) hataya(geri, "Öneri seçilmedi");
  const { data: oneriler } = await supabase
    .from("fiyat_kural_oneri")
    .select("id, birim_id, yeni_fiyat")
    .in("id", idler)
    .eq("durum", "bekliyor");
  let uyg = 0;
  for (const o of oneriler ?? []) {
    const { error } = await supabase
      .from("birim")
      .update({ liste_fiyati: o.yeni_fiyat, son_guncelleme: new Date().toISOString() })
      .eq("id", o.birim_id as string);
    if (!error) {
      await supabase.from("fiyat_kural_oneri").update({ durum: "uygulandi" }).eq("id", o.id as string);
      uyg++;
    }
  }
  revalidatePath(geri);
  revalidatePath("/uretici/stok");
  redirect(`${geri}?mesaj=${encodeURIComponent(`${uyg} öneri uygulandı`)}`);
}

export async function fiyatOneriReddet(formData: FormData) {
  const supabase = await createClient();
  const geri = "/uretici/fiyat-onerisi";
  const idler = String(formData.get("oneri_idler") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => zUuid.safeParse(s).success);
  if (idler.length === 0) return;
  await supabase.from("fiyat_kural_oneri").update({ durum: "reddedildi" }).in("id", idler).eq("durum", "bekliyor");
  revalidatePath(geri);
  redirect(`${geri}?mesaj=${encodeURIComponent(`${idler.length} öneri reddedildi`)}`);
}
