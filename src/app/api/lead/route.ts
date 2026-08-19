import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeTelefon } from "@/lib/telefon";
import { verifyShareToken } from "@/lib/sharing";
import { bildirimYaz } from "@/lib/bildirim";
import { birimLeadKabulEdilebilir, type BirimDurum } from "@/lib/types";

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

    // Birimin CANLI durumunu oku — lead kabulü için TEK yetki kapısı (N11/INV-N11-A).
    // Paylaşım token'ı sabit/taklit-edilebilir; UI'nın formu gizlemesi yetki DEĞİLDİR.
    const { data: birimRow } = await supabase
      .from("birim")
      .select("proje_id, durum, satilabilir")
      .eq("id", birimId)
      .single();
    if (!birimRow) {
      return NextResponse.json({ hata: "Daire bulunamadı." }, { status: 404 });
    }
    if (!birimLeadKabulEdilebilir(birimRow.durum as BirimDurum, birimRow.satilabilir as boolean)) {
      // Satıldı/kiralandı/stop/planlı/paylaşıma-kapalı → lead/event/bildirim/N2 YAZILMAZ.
      // Yarış hâli (form dolarken satıldı) da 500 değil, sıcak yönlendirmeli 409 verir.
      return NextResponse.json(
        { hata: "Bu daire artık müsait değil. Danışmanınız sizi benzer dairelerle arayabilir." },
        { status: 409 }
      );
    }

    // Etkin proje: form projeId'si yoksa birimden çöz (çakışma scope'u PROJE bazlı — N2).
    const effProje: string | null = projeId ?? ((birimRow.proje_id as string | null) ?? null);

    // Dedupe: yalnız AYNI danışmanın aynı birime son 10dk'daki tekrar gönderimi (çift-tık) yutulur.
    // P2 fix (N2): farklı danışman ARTIK yutulmuyor — meşru ikinci danışman lead'i oluşur + çakışma işaretlenir.
    const onDakikaOnce = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: mevcutLead } = await supabase
      .from("lead")
      .select("id")
      .eq("telefon_norm", telNorm)
      .eq("birim_id", birimId)
      .eq("ilk_paylasan_id", emlakciId)
      .gte("created_at", onDakikaOnce)
      .limit(1);

    if (mevcutLead && mevcutLead.length > 0) {
      return NextResponse.json(
        { hata: "Talebiniz zaten alındı. Danışmanınız en kısa sürede dönecektir." },
        { status: 429 }
      );
    }

    // N2 çakışma tespiti: aynı telefon + aynı PROJE + FARKLI danışman → OLASI çakışma (blok yok,
    // reassign yok — "arbitraj yapmaz"). İki lead iki satır kalır; yalnız bayrak + ilk-temas kaydı.
    let cakisma: { lead_id: string; at: string } | null = null;
    if (effProje) {
      const { data: onceki } = await supabase
        .from("lead")
        .select("id, created_at")
        .eq("telefon_norm", telNorm)
        .eq("proje_id", effProje)
        .neq("ilk_paylasan_id", emlakciId)
        .order("created_at", { ascending: true })
        .limit(1);
      if (onceki && onceki.length > 0) {
        cakisma = { lead_id: onceki[0].id as string, at: onceki[0].created_at as string };
      }
    }

    // 1. Lead tablosuna kaydet (hangi linkten geldiyse doğrudan o emlakçıya atanır)
    const { data: leadData, error: leadError } = await supabase
      .from("lead")
      .insert({
        proje_id: effProje,
        birim_id: birimId,
        kaynak: "paylasim",
        ad,
        telefon,
        telefon_norm: telNorm,
        durum: "yeni",
        niyet,                       // L0.1: ziyaretçinin satın-alma sinyali (artık lead satırında kalıcı)
        atanan_id: emlakciId,
        ilk_paylasan_id: emlakciId,
        kvkk_riza: true,
        olasi_cakisma: cakisma != null,       // N2: ağda daha önce (farklı danışman) kaydedilmiş mi
        ilk_temas_lead_id: cakisma?.lead_id ?? null,
        ilk_temas_at: cakisma?.at ?? null,
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
        proje_id: effProje,
        birim_id: birimId,
        payload: {
          lead_id: leadData.id,
          ad,
          telefon: telNorm,
          niyet,
          ...(cakisma ? { cakisma: true, ilk_temas_lead_id: cakisma.lead_id } : {}),
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
      link: "/danisman/leadler",
    });

    // N2: çakışmada MÜTEAHHİDE push (system-of-record = müşteri ilişkisi onda). PII YOK —
    // yalnız "incele" yönlendirmesi; ilk-kaydeden danışman detayı /uretici/lead-sorgu'da.
    if (cakisma && effProje) {
      const { data: sahipRow } = await supabase
        .from("proje")
        .select("ad, uretici:uretici_id(sahip_id)")
        .eq("id", effProje)
        .single();
      const sahipId = (sahipRow as { uretici?: { sahip_id?: string | null } | null } | null)?.uretici?.sahip_id;
      const projeAd = (sahipRow as { ad?: string | null } | null)?.ad;
      if (sahipId) {
        await bildirimYaz({
          profile_id: sahipId,
          tip: "lead",
          baslik: "Olası müşteri çakışması",
          govde: `${projeAd ?? "Bir proje"} · bir müşteri birden fazla danışmana kaydedildi — lead sorgudan inceleyebilirsin`,
          link: "/uretici/lead-sorgu",
        });
      }
    }

    return NextResponse.json({ basarili: true, id: leadData.id });
  } catch (err) {
    console.error("API Lead hatası:", err);
    return NextResponse.json({ hata: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
