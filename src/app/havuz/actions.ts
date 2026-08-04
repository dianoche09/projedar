"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { bildirimYaz } from "@/lib/bildirim";
import { zUuid } from "@/lib/uuid";
import { belgeleriKaydet } from "@/lib/belge";

const uuid = zUuid;

/**
 * OPSİYON TALEP→ONAY (üretici-kontrollü — DEĞİŞMEZ #3 korunur).
 * Emlakçı DOĞRUDAN opsiyon ALAMAZ (RLS opsiyon_insert artık admin-only).
 * Tahsisli + müsait birime "opsiyon talebi" (beklemede) açar; müteahhit onaylarsa
 * opsiyon doğar (kilit) — çift-satış kalkanı (unique index + trigger) onay anında devreye girer.
 */

/** Emlakçı opsiyon TALEBİ gönderir (beklemede) — doğrudan kilit YOK, müteahhit onayına düşer. */
export async function opsiyonTalepGonder(
  birimId: string,
  projeId: string,
): Promise<{ ok: boolean; mesaj: string }> {
  const b = uuid.safeParse(birimId);
  const p = uuid.safeParse(projeId);
  if (!b.success || !p.success) return { ok: false, mesaj: "Geçersiz istek" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mesaj: "Giriş gerekli" };

  // Aynı birime zaten bekleyen talebin varsa tekrarlama
  const { data: mevcut } = await supabase
    .from("opsiyon_talep")
    .select("id")
    .eq("birim_id", b.data)
    .eq("talep_eden_id", user.id)
    .eq("durum", "beklemede")
    .maybeSingle();
  if (mevcut) return { ok: false, mesaj: "Bu daire için zaten bekleyen talebin var" };

  const { error } = await supabase
    .from("opsiyon_talep")
    .insert({ birim_id: b.data, talep_eden_id: user.id, durum: "beklemede" });

  // TANI (geçici): insert reddedilirse gerçek Postgres hatasını yüzeye çıkar (RLS/constraint kök-neden).
  if (error) {
    console.error("[opsiyonTalepGonder] insert HATASI:", error.code, "|", error.message, "|", error.details, "|", error.hint);
    return { ok: false, mesaj: `Talep gönderilemedi [${error.code ?? "?"}]: ${error.message}` };
  }

  // insert BAŞARILI → kayıt/bildirim best-effort: burada bir throw core aksiyonu ASLA düşürmemeli.
  try {
    await kayitYaz({
      tip: "opsiyon",
      profileId: user.id,
      projeId: p.data,
      birimId: b.data,
      payload: { eylem: "talep" },
    });
    // Müteahhide anlık bildirim (talep bekliyor)
    const admin = createAdminClient();
    const [{ data: proje }, { data: birim }, { data: ben }] = await Promise.all([
      admin.from("proje").select("ad, uretici_id").eq("id", p.data).single(),
      admin.from("birim").select("daire_no").eq("id", b.data).single(),
      admin.from("profiles").select("ad").eq("id", user.id).single(),
    ]);
    if (proje?.uretici_id) {
      await bildirimYaz({
        profile_id: proje.uretici_id as string,
        tip: "talep",
        baslik: "Yeni opsiyon talebi",
        govde: `${ben?.ad ?? "Bir danışman"} · ${proje.ad ?? "Proje"} · Daire ${birim?.daire_no ?? "?"}`,
        link: "/uretici/opsiyonlar",
      });
    }
  } catch (e) {
    // TANI: insert sonrası çökme buraya düşer (createAdminClient env / bildirim tablosu vb.). Talep zaten oluştu.
    console.error("[opsiyonTalepGonder] insert SONRASI bildirim/kayit hatası (yutuldu):", e);
  }

  revalidatePath(`/havuz/proje/${p.data}`);
  revalidatePath("/havuz");
  revalidatePath("/havuz/opsiyonlarim");
  return { ok: true, mesaj: "Opsiyon talebin gönderildi — müteahhit onayına düştü" };
}

/**
 * Emlakçı ANLIK opsiyon alır — yalnız proje yöntemi 'dogrudan' ise (müteahhit seçer).
 * RPC opsiyon_al_dogrudan (SECURITY DEFINER): tahsis + müsait + yöntem kontrolü → kilit.
 * Çift-satış kalkanı (opsiyon_tek_aktif unique index) eş-zamanlı ikinci alanı reddeder.
 */
export async function opsiyonAlDogrudan(
  birimId: string,
  projeId: string,
): Promise<{ ok: boolean; mesaj: string }> {
  const b = uuid.safeParse(birimId);
  const p = uuid.safeParse(projeId);
  if (!b.success || !p.success) return { ok: false, mesaj: "Geçersiz istek" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mesaj: "Giriş gerekli" };

  const { error } = await supabase.rpc("opsiyon_al_dogrudan", { p_birim: b.data });
  if (error) {
    // 23505 = unique_violation → başka danışman az önce kilitledi (çift-satış kalkanı)
    const dup = error.code === "23505" || /opsiyon_tek_aktif|duplicate key/i.test(error.message);
    console.error("[opsiyonAlDogrudan] RPC hatası:", error.code, error.message);
    return { ok: false, mesaj: dup ? "Bu daireyi az önce başka danışman opsiyonladı" : error.message };
  }

  // Bildirim/kayıt best-effort — asla core aksiyonu düşürmez
  try {
    await kayitYaz({ tip: "opsiyon", profileId: user.id, projeId: p.data, birimId: b.data, payload: { eylem: "dogrudan" } });
    const admin = createAdminClient();
    const [{ data: proje }, { data: birim }, { data: ben }] = await Promise.all([
      admin.from("proje").select("ad, uretici_id").eq("id", p.data).single(),
      admin.from("birim").select("daire_no").eq("id", b.data).single(),
      admin.from("profiles").select("ad").eq("id", user.id).single(),
    ]);
    if (proje?.uretici_id) {
      await bildirimYaz({
        profile_id: proje.uretici_id as string,
        tip: "onay",
        baslik: "Daire opsiyonlandı",
        govde: `${ben?.ad ?? "Bir danışman"} · ${proje.ad ?? "Proje"} · Daire ${birim?.daire_no ?? "?"} anlık opsiyona alındı`,
        link: "/uretici/opsiyonlar",
      });
    }
  } catch (e) {
    console.error("[opsiyonAlDogrudan] bildirim/kayit hatası (yutuldu):", e);
  }

  revalidatePath(`/havuz/proje/${p.data}`);
  revalidatePath("/havuz");
  revalidatePath("/havuz/opsiyonlarim");
  return { ok: true, mesaj: "Opsiyon alındı — daire sana kilitlendi" };
}

// ── KYC belge yükleme (mesleki yeterlilik + vergi levhası) → lib/belge (tek upload kaynağı) ──
export async function belgeYukle(formData: FormData): Promise<void> {
  const r = await belgeleriKaydet(formData);
  if (!r.ok && r.hata === "AUTH") redirect("/login");
  if (!r.ok) redirect(`/havuz/dogrulama?hata=${encodeURIComponent(r.hata)}`);
  revalidatePath("/havuz/dogrulama");
  revalidatePath("/havuz");
  redirect(`/havuz/dogrulama?mesaj=${encodeURIComponent(r.yuklendi > 0 ? "Belgeler yüklendi — doğrulama bekleniyor" : "Dosya seçilmedi")}`);
}

/** Emlakçı kendi BEKLEYEN talebini geri çeker. */
export async function talepGeriCek(
  talepId: string,
  projeId: string,
): Promise<{ ok: boolean; mesaj: string }> {
  const t = uuid.safeParse(talepId);
  const p = uuid.safeParse(projeId);
  if (!t.success || !p.success) return { ok: false, mesaj: "Geçersiz istek" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mesaj: "Giriş gerekli" };

  const { error } = await supabase
    .from("opsiyon_talep")
    .delete()
    .eq("id", t.data)
    .eq("talep_eden_id", user.id)
    .eq("durum", "beklemede");
  revalidatePath(`/havuz/proje/${p.data}`);
  revalidatePath("/havuz/opsiyonlarim");
  return error ? { ok: false, mesaj: "Geri çekilemedi" } : { ok: true, mesaj: "Talep geri çekildi" };
}

export async function opsiyonBirakSessiz(
  birimId: string,
  projeId: string,
): Promise<{ ok: boolean; mesaj: string }> {
  const b = uuid.safeParse(birimId);
  const p = uuid.safeParse(projeId);
  if (!b.success || !p.success) return { ok: false, mesaj: "Geçersiz istek" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mesaj: "Giriş gerekli" };

  const { error } = await supabase
    .from("opsiyon")
    .delete()
    .eq("birim_id", b.data)
    .eq("satici_id", user.id)
    .in("durum", ["opsiyonlu", "satis_beklemede"]);
  if (!error) {
    await kayitYaz({
      tip: "opsiyon",
      profileId: user.id,
      projeId: p.data,
      birimId: b.data,
      payload: { eylem: "iptal" },
    });
  }
  revalidatePath(`/havuz/proje/${p.data}`);
  revalidatePath("/havuz");
  return error ? { ok: false, mesaj: "Bırakılamadı" } : { ok: true, mesaj: "Opsiyon bırakıldı" };
}

/** WhatsApp paylaşımı tıklanınca ANONİM paylaşım sinyali (Paylaştıklarım sayfası + Talep Radarı moat). */
export async function paylasimKaydet(projeId: string, birimId?: string | null): Promise<void> {
  const p = uuid.safeParse(projeId);
  if (!p.success) return;
  const b = birimId ? uuid.safeParse(birimId) : null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await kayitYaz({
    tip: "paylasim",
    profileId: user.id,
    projeId: p.data,
    birimId: b && b.success ? b.data : null,
    payload: {},
  });
  revalidatePath("/havuz/paylastiklarim");
}

/**
 * Lead durumunu ilerlet (yeni→arandı→görüşme→opsiyon→kazanıldı/kaybedildi).
 * lead_update RLS politikası yok → sahiplik RLS-select ile doğrulanır, sonra
 * service-role ile yazılır (DEĞİŞMEZ #1: yalnız server).
 */
const LEAD_DURUM = z.enum(["yeni", "arandi", "gorusme", "opsiyon", "kazanildi", "kaybedildi"]);

export async function leadDurumGuncelle(leadId: string, yeniDurum: string): Promise<{ ok: boolean }> {
  const id = uuid.safeParse(leadId);
  const durum = LEAD_DURUM.safeParse(yeniDurum);
  if (!id.success || !durum.success) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // Yetki: bu lead'i görebiliyor muyum? (RLS lead_select = atanan/ilk_paylasan/proje sahibi/admin)
  const { data: lead } = await supabase.from("lead").select("id").eq("id", id.data).single();
  if (!lead) return { ok: false };

  const admin = createAdminClient();
  const { error } = await admin.from("lead").update({ durum: durum.data }).eq("id", id.data);
  if (error) return { ok: false };

  revalidatePath("/havuz/leadler");
  revalidatePath("/uretici");
  return { ok: true };
}
