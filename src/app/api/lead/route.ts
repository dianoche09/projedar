import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeTelefon } from "@/lib/telefon";
import { verifyShareToken } from "@/lib/sharing";
import { bildirimYaz } from "@/lib/bildirim";

// Public endpoint — girdi Zod ile doğrulanır, imzalı paylaşım token'ı zorunludur (forge engeli).
const leadSemasi = z.object({
  projeId: z.string().uuid().nullish(),
  birimId: z.string().uuid("Geçersiz birim"),
  emlakciId: z.string().uuid("Geçersiz danışman"),
  token: z.string().min(1, "Geçersiz istek"),
  ad: z.string().trim().min(2, "Ad-soyad gir").max(80, "Ad-soyad çok uzun"),
  telefon: z.string().trim().min(7, "Geçerli bir telefon gir").max(20, "Geçerli bir telefon gir"),
  kvkk: z.literal(true, { message: "KVKK onayı zorunludur." }),
  niyet: z.enum(["bilgi", "randevu", "on_rezervasyon"]).catch("bilgi"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sonuc = leadSemasi.safeParse(body);
    if (!sonuc.success) {
      return NextResponse.json(
        { hata: sonuc.error.issues[0]?.message ?? "Geçersiz istek" },
        { status: 400 }
      );
    }
    const { projeId, birimId, emlakciId, token, ad, telefon, niyet } = sonuc.data;

    // İmzalı paylaşım token'ı doğrula (/api/etkilesim ile aynı desen) — sahte lead/PII yazımını engeller
    if (!verifyShareToken(emlakciId, birimId, token)) {
      return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
    }

    const telNorm = normalizeTelefon(telefon);
    if (!telNorm) {
      return NextResponse.json({ hata: "Geçerli bir telefon gir" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Hafif throttle: aynı telefon + birim için son 10 dakikada lead varsa tekrar yazma
    const onDakikaOnce = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: mevcutLead } = await supabase
      .from("lead")
      .select("id")
      .eq("telefon_norm", telNorm)
      .eq("birim_id", birimId)
      .gte("created_at", onDakikaOnce)
      .limit(1);

    if (mevcutLead && mevcutLead.length > 0) {
      return NextResponse.json(
        { hata: "Talebiniz zaten alındı. Danışmanınız en kısa sürede dönecektir." },
        { status: 429 }
      );
    }

    // 1. Lead tablosuna kaydet (hangi linkten geldiyse doğrudan o emlakçıya atanır)
    const { data: leadData, error: leadError } = await supabase
      .from("lead")
      .insert({
        proje_id: projeId || null,
        birim_id: birimId,
        kaynak: "paylasim",
        ad,
        telefon,
        telefon_norm: telNorm,
        durum: "yeni",
        atanan_id: emlakciId,
        ilk_paylasan_id: emlakciId,
        kvkk_riza: true,
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead oluşturma hatası:", leadError);
      return NextResponse.json({ hata: "Talep kaydedilemedi." }, { status: 500 });
    }

    // 2. Olay günlüğüne (events) log yaz
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        tip: "lead",
        profile_id: emlakciId,
        proje_id: projeId || null,
        birim_id: birimId,
        payload: {
          lead_id: leadData.id,
          ad,
          telefon: telNorm,
          niyet,
        },
      });

    if (eventError) {
      console.error("Event log yazma hatası:", eventError);
      // Lead kaydedildiği için event log hatası kritik engel teşkil etmez.
    }

    // 3. Lead sahibi emlakçıya anlık bildirim (best-effort; PII yalnız lead sahibine gider)
    const niyetAd: Record<string, string> = {
      bilgi: "Bilgi istedi",
      randevu: "Randevu istedi",
      on_rezervasyon: "Ön rezervasyon",
    };
    await bildirimYaz({
      profile_id: emlakciId,
      tip: "lead",
      baslik: "Yeni müşteri (lead)",
      govde: `${ad} · ${niyetAd[niyet] ?? "İletişim"}`,
      link: "/havuz/leadler",
    });

    return NextResponse.json({ basarili: true, id: leadData.id });
  } catch (err) {
    console.error("API Lead hatası:", err);
    return NextResponse.json({ hata: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
