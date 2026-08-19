import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyShareToken, paylasimKoduCoz } from "@/lib/sharing";

/**
 * Mikrosite anonim etkileşim sinyali (favori vb.) → events.
 * Müşteri kimliği/PII YOK; yalnız "bu birim bu danışman linkinden favorilendi" (KVKK-safe, Katman A).
 * Yetki İKİ biçimde (/api/lead ile aynı): `kod` (iptal edilebilir, aktif=true kontrolü) öncelikli,
 * yoksa emlakci+birim+imzalı token (eski uzun link, geriye-uyum). Kod varsa id'ler ONDAN türetilir.
 */
export async function POST(request: Request) {
  try {
    const { kod, emlakci: bodyEmlakci, birim: bodyBirim, proje, token, tip } = await request.json();

    let emlakci: string;
    let birim: string;
    if (kod && typeof kod === "string") {
      const coz = await paylasimKoduCoz(kod); // iptal edilmişse (aktif=false) null → reddedilir
      if (!coz) {
        return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
      }
      emlakci = coz.emlakciId;
      birim = coz.birimId;
    } else if (bodyEmlakci && bodyBirim && token && verifyShareToken(bodyEmlakci, bodyBirim, token)) {
      emlakci = bodyEmlakci;
      birim = bodyBirim;
    } else {
      return NextResponse.json({ hata: "Geçersiz istek" }, { status: 400 });
    }

    const izinli = ["favori", "odeme_hesap"];
    if (!izinli.includes(tip)) {
      return NextResponse.json({ hata: "Geçersiz tip" }, { status: 400 });
    }
    const supabase = createAdminClient();
    await supabase.from("events").insert({
      tip,
      profile_id: emlakci,
      proje_id: proje || null,
      birim_id: birim,
      payload: { kaynak: "mikrosite" },
    });
    return NextResponse.json({ basarili: true });
  } catch {
    return NextResponse.json({ hata: "Sunucu hatası" }, { status: 500 });
  }
}
