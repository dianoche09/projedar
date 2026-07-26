import { createClient } from "@/lib/supabase/server";

/** KYC belge tipleri — mesleki yeterlilik (barkodlu MYS) + vergi levhası. */
export const BELGE_TIPLERI = ["mesleki_yeterlilik", "vergi_levhasi"] as const;

export type BelgeSonuc = { ok: true; yuklendi: number } | { ok: false; hata: "AUTH" | string };

/**
 * KYC belgelerini `kyc-belge` bucket'a yükler, `kullanici_belge`'ye 'beklemede' yazar ve
 * `profiles.belge_durumu='beklemede'` set eder. REDIRECT ETMEZ — çağıran server action
 * sonucu yorumlayıp yönlendirir. Tek upload kaynağı: hem /havuz/dogrulama hem kayıt wizard'ı kullanır.
 *
 * MYS için opsiyonel beyan edilen barkod/belge no `mys_no` alanından okunur → ai_sonuc.beyan_edilen_no.
 * (Gerçek doğrulama admin/AI tarafında; bu yalnız danışmanın beyanı.)
 */
export async function belgeleriKaydet(formData: FormData): Promise<BelgeSonuc> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, hata: "AUTH" };

  const mysNo = ((formData.get("mys_no") as string | null) ?? "").trim() || null;
  let yuklendi = 0;
  for (const tip of BELGE_TIPLERI) {
    const file = formData.get(tip);
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > 8 * 1024 * 1024) return { ok: false, hata: "Dosya 8MB'tan büyük olamaz" };
    const uzanti = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const yol = `${user.id}/${tip}-${Date.now()}.${uzanti}`;
    const { error: upErr } = await supabase.storage
      .from("kyc-belge")
      .upload(yol, file, { upsert: true, contentType: file.type || undefined });
    if (upErr) return { ok: false, hata: upErr.message };
    const ai_sonuc = tip === "mesleki_yeterlilik" && mysNo ? { beyan_edilen_no: mysNo } : null;
    await supabase.from("kullanici_belge").insert({ profile_id: user.id, tip, url: yol, durum: "beklemede", ai_sonuc });
    yuklendi++;
  }
  // belge_durumu='beklemede' (trigger 'dogrulandi'yi engeller; bunu yalnız admin yapar)
  if (yuklendi > 0) await supabase.from("profiles").update({ belge_durumu: "beklemede" }).eq("id", user.id);
  return { ok: true, yuklendi };
}
