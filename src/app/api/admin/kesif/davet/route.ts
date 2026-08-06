import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminIdVeya } from "@/lib/kesif/guard";
import { adayDavetToken } from "@/lib/davet";
import { davetMaili, mailGonder } from "@/lib/mail";
import { SEGMENT_ROL, type Segment } from "@/lib/kesif/tipler";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projedar.com";
const TAKIP_GUN = 3;

/**
 * Adaya davet e-postası gönder (admin onaylı tek-tık). Token'lı kayıt linki + opt-out.
 * aday_temas log + durum ilerlet (davet_edildi) + sonraki_takip = +3 gün.
 */
const Schema = z.object({ adayId: z.string().uuid(), ekMesaj: z.string().trim().max(600).optional() });

export async function POST(req: NextRequest) {
  const adminId = await adminIdVeya();
  if (!adminId) return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ hata: "Geçersiz giriş" }, { status: 400 });
  const { adayId, ekMesaj } = parsed.data;

  const admin = createAdminClient();
  const { data: aday } = await admin
    .from("aday")
    .select("id, firma_adi, segment, email, il, opt_out, temas_sayisi, ilk_temas")
    .eq("id", adayId)
    .single();
  if (!aday) return NextResponse.json({ hata: "Aday bulunamadı" }, { status: 404 });
  if (aday.opt_out) return NextResponse.json({ hata: "Aday ileti almayı reddetti (opt-out)" }, { status: 409 });
  if (!aday.email) return NextResponse.json({ hata: "Adayın e-postası yok" }, { status: 400 });

  const rol = SEGMENT_ROL[(aday.segment as Segment) ?? "muteahhit"];
  if (!rol) {
    return NextResponse.json({ hata: "Proje adayı doğrudan davet edilemez; önce müteahhide çözün." }, { status: 400 });
  }

  const firma = aday.firma_adi as string;
  const token = adayDavetToken(adayId, rol);
  const kayitUrl = `${SITE}/kayit?rol=${rol}&aday=${adayId}&n=${encodeURIComponent(firma)}&t=${token}`;
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

  const simdi = new Date().toISOString();
  const sonraki = new Date(Date.now() + TAKIP_GUN * 86400_000).toISOString();
  await admin.from("aday_temas").insert({
    aday_id: adayId,
    kanal: "email",
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

  return NextResponse.json({ ok: true });
}
