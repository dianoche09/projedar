import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Birinci-parti anonim huni sinyali (yalnız Projedar; dış servis/cookie yok, PII yok).
 * Client → bu route → events. Service-role yalnız server'da (DEĞİŞMEZ #1). Middleware /api'yi muaf tutar.
 * Whitelist'li tip + yumuşak same-origin kontrolü (bot/spam gürültüsünü azaltır).
 */
const IZINLI = new Set(["kayit_goruntuleme"]);

export async function POST(request: Request) {
  try {
    const govde = (await request.json()) as { tip?: string; payload?: Record<string, unknown> };
    const tip = govde?.tip ?? "";
    if (!IZINLI.has(tip)) {
      return NextResponse.json({ hata: "Geçersiz tip" }, { status: 400 });
    }

    const kaynak = request.headers.get("origin") || request.headers.get("referer") || "";
    const host = request.headers.get("host") || "";
    if (host && kaynak && !kaynak.includes(host)) {
      return NextResponse.json({ hata: "Origin" }, { status: 400 });
    }

    const p = govde?.payload ?? {};
    const guvenli = {
      kaynak: typeof p.kaynak === "string" && p.kaynak ? p.kaynak.slice(0, 40) : null,
      rol: typeof p.rol === "string" && p.rol ? p.rol.slice(0, 20) : null,
    };

    await createAdminClient().from("events").insert({ tip, payload: guvenli });
    return NextResponse.json({ basarili: true });
  } catch {
    return NextResponse.json({ hata: "Sunucu hatası" }, { status: 500 });
  }
}
