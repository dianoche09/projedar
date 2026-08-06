import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adayDavetGecerli } from "@/lib/davet";

/**
 * Ticari ileti opt-out (public, token'lı) — davet mailindeki "çıkış yap" linki.
 * İYS/ETK ret hakkı. Aday opt_out=true + durum=reddedildi → bir daha davet/follow-up almaz.
 */
function sayfa(baslik: string, mesaj: string): NextResponse {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${baslik}</title></head>
<body style="margin:0;background:#eef1f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:64px auto;background:#fff;border:1px solid #e4e8ef;border-radius:20px;padding:32px 28px;">
<h1 style="margin:0 0 10px;font-size:20px;color:#10243a;">${baslik}</h1>
<p style="margin:0;font-size:14px;line-height:1.6;color:#46586b;">${mesaj}</p>
</div></body></html>`;
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const adayId = (sp.get("aday") ?? "").trim();
  const t = (sp.get("t") ?? "").trim();

  if (!adayDavetGecerli(adayId, "cikis", t)) {
    return sayfa("Geçersiz bağlantı", "Bu çıkış bağlantısı geçerli değil. Sorunuz için destek@projedar.com.");
  }

  const admin = createAdminClient();
  await admin.from("aday").update({ opt_out: true, durum: "reddedildi" }).eq("id", adayId);
  await admin.from("aday_temas").insert({ aday_id: adayId, kanal: "email", yon: "gelen", durum: "opt_out", konu: "Opt-out" });

  return sayfa(
    "Çıkışınız alındı",
    "Bir daha Projedar davet e-postası almayacaksınız. Fikrinizi değiştirirseniz destek@projedar.com üzerinden bize ulaşabilirsiniz.",
  );
}
