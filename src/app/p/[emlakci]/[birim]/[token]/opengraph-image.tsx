import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { verifyShareToken } from "@/lib/sharing";
import { createAdminClient } from "@/lib/supabase/admin";
import { projeKapak } from "@/lib/gorsel";

// Node crypto (verifyShareToken) + service-role Supabase gerektiği için edge DEĞİL.
export const runtime = "nodejs";
export const alt = "Projedar — canlı stoktan daire";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ORIGIN = "https://projedar.com";

// ÖNEMLİ: OG görseli WhatsApp/sosyal tarafından URL bazında CACHE'lenir. Bu yüzden
// HIZLI DEĞİŞEN veri (fiyat, tazelik "X gün önce", durum) BURAYA BASILMAZ — cache'de
// donar ve eskir (DEĞİŞMEZ #2 / tek-doğru-kaynak). Kart yalnız SABİT bilgi taşır:
// kapak görseli + proje adı + konum + daire tipi + marka. Fiyat/durum linkin arkasında canlı.
const ALFABE =
  "ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZabcçdefgğhıijklmnoöpqrsştuüvwxyz0123456789 ·.,:/()m²+-→✓ Daire kat oda Doğrulanmış Üretici Projedar projedar.com Canlı konut stoğu dağıtım ağı fiyat ve detay için aç";

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`OG font yüklenemedi: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

async function buildImage(subset: string, node: ReactElement): Promise<ImageResponse> {
  const text = ALFABE + " " + subset;
  const [outfit800, inter600, inter400] = await Promise.all([
    loadFont("Outfit", 800, text),
    loadFont("Inter", 600, text),
    loadFont("Inter", 400, text),
  ]);
  return new ImageResponse(node, {
    ...size,
    fonts: [
      { name: "Outfit", data: outfit800, weight: 800, style: "normal" },
      { name: "Inter", data: inter600, weight: 600, style: "normal" },
      { name: "Inter", data: inter400, weight: 400, style: "normal" },
    ],
  });
}

const ZEMIN = "linear-gradient(135deg, #081422 0%, #10243a 55%, #13314b 100%)";

// Token geçersiz / veri yok → sade marka kartı (kapaksız, fiyatsız).
function genericNode() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "0 84px", background: ZEMIN, fontFamily: "Inter", position: "relative" }}>
      <div style={{ position: "absolute", top: -160, right: -120, width: 620, height: 620, borderRadius: 620, background: "radial-gradient(circle, rgba(30,155,138,0.42) 0%, rgba(30,155,138,0) 70%)", display: "flex" }} />
      <span style={{ fontFamily: "Outfit", fontSize: 108, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>Projedar</span>
      <div style={{ display: "flex", fontSize: 46, fontWeight: 600 }}>
        <span style={{ color: "#34d3bd" }}>Canlı</span>
        <span style={{ color: "#e9eef4" }}>&nbsp;konut stoğu dağıtım ağı</span>
      </div>
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ emlakci: string; birim: string; token: string }>;
}) {
  const { emlakci, birim, token } = await params;

  let gecerli = false;
  try {
    gecerli = verifyShareToken(emlakci, birim, token);
  } catch {
    gecerli = false;
  }
  if (!gecerli) return buildImage("", genericNode());

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return buildImage("", genericNode());
  }

  const { data } = await supabase
    .from("birim")
    .select(`
      daire_no, kat, net_m2,
      proje:proje_id ( id, ad, il, ilce, uretici:uretici_id ( dogrulanmis ) ),
      tip:tip_id ( oda )
    `)
    .eq("id", birim)
    .single();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = (data as any)?.proje;
  const t = (data as any)?.tip;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (!data || !p) return buildImage("", genericNode());

  // Kapak görseli (arka plan) — proje_belge kapak; yoksa deterministik üretilmiş kapak.
  // projeKapak relatif dönebilir (/gorseller/...) → OG için mutlak URL'e çevir.
  const { data: kapakRow } = await supabase
    .from("proje_belge")
    .select("url")
    .eq("proje_id", p.id)
    .eq("tip", "kapak")
    .limit(1)
    .maybeSingle();
  const kapakRaw = projeKapak(kapakRow?.url ?? null, p.id as string);
  const kapak = kapakRaw.startsWith("http") ? kapakRaw : `${ORIGIN}${kapakRaw}`;

  const dogrulanmis = Boolean(p?.uretici?.dogrulanmis);
  const projeAd = (p?.ad as string) ?? "Projedar";
  const konum = [p?.ilce, p?.il].filter(Boolean).join(", ");
  const daireEtiket = data.daire_no ? `Daire ${data.daire_no}` : data.kat != null ? `${data.kat}. kat` : null;
  const daireOzet = [daireEtiket, t?.oda, data.net_m2 ? `${data.net_m2} m²` : null].filter(Boolean).join("  ·  ");
  const subset = [projeAd, konum, daireOzet].join(" ");

  const node = (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: ZEMIN, fontFamily: "Inter" }}>
      {/* Kapak görseli — arka plan (gerçek proje foto veya deterministik üretilmiş kapak) */}
      <img src={kapak} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
      {/* Koyu gradient overlay — alttan koyulaşır, yazı okunur */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "linear-gradient(180deg, rgba(8,20,34,0.28) 0%, rgba(8,20,34,0.52) 48%, rgba(8,20,34,0.94) 100%)", display: "flex" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "56px 64px" }}>
        {/* Üst: wordmark + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Outfit", fontSize: 34, fontWeight: 800, letterSpacing: -0.5, color: "#ffffff" }}>proje<span style={{ color: "#34d3bd" }}>dar</span></span>
          <span style={{ fontSize: 24, fontWeight: 600, color: "#cdd8e4" }}>projedar.com</span>
        </div>

        {/* Alt: proje adı + doğrulanmış + konum + daire tipi + CTA (fiyat/durum/tazelik YOK) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Outfit", fontSize: 66, fontWeight: 800, color: "#ffffff", letterSpacing: -1, lineHeight: 1.02 }}>{projeAd}</span>
            {dogrulanmis ? (
              <div style={{ display: "flex", alignItems: "center", padding: "7px 15px", borderRadius: 999, background: "rgba(30,155,138,0.22)", border: "1px solid rgba(52,211,189,0.5)" }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: "#8ee6d5" }}>✓ Doğrulanmış Üretici</span>
              </div>
            ) : null}
          </div>
          {konum ? <span style={{ fontSize: 30, fontWeight: 400, color: "#cdd8e4", marginTop: 12 }}>{konum}</span> : null}
          {daireOzet ? <span style={{ fontSize: 32, fontWeight: 600, color: "#ffffff", marginTop: 6 }}>{daireOzet}</span> : null}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 26 }}>
            <div style={{ width: 11, height: 11, borderRadius: 6, background: "#2fb36b", display: "flex" }} />
            <span style={{ fontSize: 26, fontWeight: 600, color: "#34d3bd" }}>Canlı fiyat ve detay için aç →</span>
          </div>
        </div>
      </div>
    </div>
  );

  return buildImage(subset, node);
}
