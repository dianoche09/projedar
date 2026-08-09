"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Hakediş ödeme durumu işaretleme (yalnız müteahhit).
 * DEĞİŞMEZ: Platform komisyondan pay almaz; bu yalnız müteahhit↔danışman arası mutabakat.
 * Yetki: çağıran, birimin projesinin üreticisi (uretici.sahip_id=auth.uid()) olmalı.
 * Kazanç tutarı birim_satici_kazanci RPC ile snapshot'lanır (ham komisyon oranı client'a çıkmaz).
 */
export async function hakedisIsaretle(
  birimId: string,
  projeId: string,
  odendi: boolean,
): Promise<{ ok: boolean; mesaj: string }> {
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!uuid.test(birimId) || !uuid.test(projeId)) return { ok: false, mesaj: "Geçersiz kayıt" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, mesaj: "Oturum bulunamadı" };

  const admin = createAdminClient();

  // Yetki: müteahhit bu projenin sahibi mi?
  const { data: proje } = await admin
    .from("proje")
    .select("id, uretici_id, para_birimi, uretici:uretici_id(sahip_id)")
    .eq("id", projeId)
    .maybeSingle();
  const sahip = (proje as { uretici?: { sahip_id?: string } } | null)?.uretici?.sahip_id;
  if (!proje || sahip !== user.id) return { ok: false, mesaj: "Bu proje üzerinde yetkiniz yok" };

  // Satılan birimin satıcısı (en son tamamlanmış satış)
  const { data: ops } = await admin
    .from("opsiyon")
    .select("satici_id, sonuc_at")
    .eq("birim_id", birimId)
    .eq("sonuc", "satildi")
    .order("sonuc_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (!ops?.satici_id) return { ok: false, mesaj: "Bu birimde tamamlanmış satış bulunamadı" };

  // Kazanç snapshot (müteahhit yetkisiyle RPC — RLS'te sahiplik guard'ı var)
  const { data: kazanc } = await supabase.rpc("birim_satici_kazanci", {
    p_birim_id: birimId,
    p_satici: ops.satici_id,
  });

  const { error } = await admin.from("hakedis").upsert(
    {
      birim_id: birimId,
      proje_id: projeId,
      uretici_id: (proje as { uretici_id: string }).uretici_id,
      emlakci_id: ops.satici_id,
      tutar: typeof kazanc === "number" ? kazanc : null,
      para_birimi: (proje as { para_birimi?: string }).para_birimi ?? "TRY",
      durum: odendi ? "odendi" : "bekliyor",
      odenen_at: odendi ? new Date().toISOString() : null,
    },
    { onConflict: "birim_id" },
  );
  if (error) {
    console.error("hakedisIsaretle upsert hatası:", error);
    return { ok: false, mesaj: "Hakediş kaydedilemedi" };
  }

  revalidatePath("/uretici/hakedis");
  revalidatePath("/havuz/hakedis");
  return { ok: true, mesaj: odendi ? "Ödendi olarak işaretlendi" : "Bekliyor olarak güncellendi" };
}
