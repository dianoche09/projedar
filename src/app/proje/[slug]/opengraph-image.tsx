import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikBloklari } from "@/lib/seo/proje-icerik";

// Node runtime: service-role Supabase + Vercel Hobby 1MB edge limiti (next/og WASM).
export const runtime = "nodejs";
export const alt = "Projedar proje sayfası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ALFABE =
  "ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZabcçdefgğhıijklmnoöpqrsştuüvwxyz0123456789 ·.,:/()Projedar projedar.com konut projesi bağımsız bölüm Canlı stok komisyon yok Tahsisli satış ağı Müteahhit kontrollü dağıtım Tek doğru kaynak Çift satış kalkanı Kapalı devre B2B Yetkili danışman Doğrulanmış proje verisi";

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`OG font yüklenemedi: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

const ZEMIN = "linear-gradient(135deg, #081422 0%, #10243a 55%, #13314b 100%)";

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

function tealGlow() {
  return (
    <div
      style={{
        position: "absolute",
        top: -160,
        right: -120,
        width: 620,
        height: 620,
        borderRadius: 620,
        background: "radial-gradient(circle, rgba(30,155,138,0.42) 0%, rgba(30,155,138,0) 70%)",
        display: "flex",
      }}
    />
  );
}

function genericNode() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, padding: "0 84px", background: ZEMIN, fontFamily: "Inter", position: "relative" }}>
      {tealGlow()}
      <span style={{ fontFamily: "Outfit", fontSize: 104, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>Projedar</span>
      <div style={{ display: "flex", fontSize: 44, fontWeight: 600 }}>
        <span style={{ color: "#1e9b8a" }}>Canlı</span>
        <span style={{ color: "#e9eef4" }}>&nbsp;konut stoğu dağıtım ağı</span>
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let proje: { ad: string; il: string | null; ilce: string | null; mahalle: string | null } | null = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("proje").select("ad, il, ilce, mahalle").eq("public_slug", slug).maybeSingle();
    proje = data as typeof proje;
  } catch {
    proje = null;
  }
  if (!proje?.ad) return buildImage("", genericNode());

  const konum = [proje.mahalle, proje.ilce, proje.il].filter(Boolean).join(", ");
  const etiket = projeIcerikBloklari({ ad: proje.ad, il: proje.il, ilce: proje.ilce, slug }).etiket;

  const node = (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", background: ZEMIN, fontFamily: "Inter", position: "relative" }}>
      {tealGlow()}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 999, background: "rgba(30,155,138,0.12)", border: "1px solid rgba(30,155,138,0.4)" }}>
          <div style={{ width: 13, height: 13, borderRadius: 7, background: "#2fb36b", display: "flex" }} />
          <span style={{ fontSize: 25, fontWeight: 600, color: "#bfe6d3" }}>{etiket}</span>
        </div>
        <span style={{ fontSize: 26, fontWeight: 600, color: "#7f95ab" }}>projedar.com</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontFamily: "Outfit", fontSize: 68, fontWeight: 800, color: "#ffffff", letterSpacing: -1, lineHeight: 1.05 }}>{proje.ad}</span>
        {konum ? <span style={{ fontSize: 34, fontWeight: 400, color: "#9fb2c4" }}>{konum}</span> : null}
        <span style={{ fontSize: 26, fontWeight: 400, color: "#7f95ab", marginTop: 6 }}>konut projesi</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#2fb36b", display: "flex" }} />
        <span style={{ fontSize: 25, fontWeight: 600, color: "#e9eef4" }}>Projedar</span>
        <span style={{ fontSize: 25, fontWeight: 400, color: "#7f95ab" }}>· müteahhit kontrollü satış ağı</span>
      </div>
    </div>
  );

  return buildImage(proje.ad + " " + konum + " " + etiket, node);
}
