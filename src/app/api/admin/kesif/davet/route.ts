import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminIdVeya } from "@/lib/kesif/guard";
import { adayDavetToken } from "@/lib/davet";
import { davetMaili, mailGonder } from "@/lib/mail";
import { SEGMENT_ROL, type Segment } from "@/lib/kesif/tipler";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projedar.com";
const TAKIP_GUN = 3;

/** Segmente göre WhatsApp davet cümlesi (müteahhit ≠ ofis/emlakçı pitch'i). */
const WA_PITCH: Record<string, string> = {
  muteahhit: "Projenizi bağımsız emlakçı ağına canlı dağıtın, tek noktadan stok/fiyat kontrolü; Projedar satış komisyonundan pay almaz.",
  proje: "Projenizi bağımsız emlakçı ağına canlı dağıtın; Projedar satış komisyonundan pay almaz.",
  ofis: "Size tahsisli konut projelerini tek canlı havuzdan görüp ekibinizle paylaşın; satış komisyonunun tamamı sizde kalır.",
  emlakci: "Size tahsisli konut projelerini tek canlı havuzdan görüp müşterinizle paylaşın; kazancınızın tamamı sizde, Projedar komisyondan pay almaz.",
};

/**
 * Adaya davet gönder (admin onaylı tek-tık). İki kanal:
 *  - email: token'lı kayıt linki + opt-out'lu mail (Resend).
 *  - whatsapp: wa.me deep-link üretir (DEĞİŞMEZ #4: giden deep-link). Sunucu göndermez;
 *    admin WhatsApp'ta gönderir. Veri telefon-ağırlıklı olduğu için ASIL kanal budur.
 * Her iki kanalda: aday_temas log + durum ilerlet (davet_edildi) + sonraki_takip = +3 gün.
 */
const Schema = z.object({
  adayId: z.string().uuid(),
  kanal: z.enum(["email", "whatsapp"]).default("email"),
  ekMesaj: z.string().trim().max(600).optional(),
});

/** TR telefonu wa.me formatına indir (yalnız rakam; 0/+90 → 90 ülke kodu). */
function waNumara(tel: string): string | null {
  const d = tel.replace(/\D/g, "");
  if (d.startsWith("90") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 11) return `90${d.slice(1)}`;
  if (d.length === 10) return `90${d}`;
  return d.length >= 10 ? d : null;
}

export async function POST(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ hata: "Geçersiz giriş" }, { status: 400 });
  const { adayId, kanal, ekMesaj } = parsed.data;

  const admin = createAdminClient();
  const { data: aday } = await admin
    .from("aday")
    .select("id, firma_adi, segment, email, telefon, il, opt_out, temas_sayisi, ilk_temas")
    .eq("id", adayId)
    .single();
  if (!aday) return NextResponse.json({ hata: "Aday bulunamadı" }, { status: 404 });
  if (aday.opt_out) return NextResponse.json({ hata: "Aday ileti almayı reddetti (opt-out)" }, { status: 409 });

  const rol = SEGMENT_ROL[(aday.segment as Segment) ?? "muteahhit"];
  if (!rol) {
    return NextResponse.json({ hata: "Proje adayı doğrudan davet edilemez; önce müteahhide çözün." }, { status: 400 });
  }

  const firma = aday.firma_adi as string;
  const token = adayDavetToken(adayId, rol);
  const kayitUrl = `${SITE}/kayit?rol=${rol}&aday=${adayId}&n=${encodeURIComponent(firma)}&t=${token}`;

  let waUrl: string | undefined;
  if (kanal === "whatsapp") {
    const num = aday.telefon ? waNumara(aday.telefon as string) : null;
    if (!num) return NextResponse.json({ hata: "Adayın geçerli telefonu yok" }, { status: 400 });
    const pitch = WA_PITCH[(aday.segment as string) ?? "muteahhit"] ?? WA_PITCH.muteahhit;
    const metin =
      `Merhaba, ${firma} için Projedar davetimiz. ${pitch} ` +
      `Hesabınızı buradan oluşturabilirsiniz: ${kayitUrl}` +
      (ekMesaj ? `\n\n${ekMesaj}` : "");
    waUrl = `https://wa.me/${num}?text=${encodeURIComponent(metin)}`;
  } else {
    if (!aday.email) return NextResponse.json({ hata: "Adayın e-postası yok (WhatsApp deneyin)" }, { status: 400 });
    const cikisUrl = `${SITE}/api/kesif/cikis?aday=${adayId}&t=${adayDavetToken(adayId, "cikis")}`;
    const html = davetMaili({
      firma,
      segment: (aday.segment as string) ?? "muteahhit",
      il: (aday.il as string) ?? null,
      kayitUrl,
      cikisUrl,
      ekMesaj: ekMesaj ?? null,
    });
    await mailGonder({ to: aday.email as string, konu: `${firma} · Projedar'a davetlisiniz`, html });
  }

  const simdi = new Date().toISOString();
  const sonraki = new Date(Date.now() + TAKIP_GUN * 86400_000).toISOString();
  await admin.from("aday_temas").insert({
    aday_id: adayId,
    kanal,
    yon: "giden",
    konu: "Projedar davet",
    durum: "gonderildi",
    gonderen: adminId,
  });
  await admin
    .from("aday")
    .update({
      durum: "davet_edildi",
      son_temas: simdi,
      ilk_temas: aday.ilk_temas ?? simdi,
      temas_sayisi: ((aday.temas_sayisi as number) ?? 0) + 1,
      sonraki_takip: sonraki,
    })
    .eq("id", adayId);

  return NextResponse.json({ ok: true, waUrl });
}
