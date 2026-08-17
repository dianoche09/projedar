import { ImageResponse } from "next/og";

// Dosya-tabanlı OG görseli: tüm route'lara otomatik uygulanır (sayfalar kendi
// openGraph.images'ini tanımlamadığı sürece). Twitter kartı da og:image'e düşer.
// Node runtime: next/og edge bundle'ı (satori + resvg WASM) Vercel Hobby'nin
// 1 MB Edge Function limitini aşıp build'i kırıyordu. Mikrosite OG de node.
export const runtime = "nodejs";
export const alt = "Projedar — Canlı Konut Stoğu Dağıtım Ağı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG kartında görünen tüm karakterler — Google Fonts subset (yalnız bu glyph'ler indirilir).
const GLYPHS =
  "Projedar Canlı konut stoğu dağıtım ağı projedar.com Tek doğru kaynak · Çift satış kalkanı Komisyondan pay almaz müsait opsiyon satıldı 2 dk önce";

async function loadFont(family: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(GLYPHS)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`OG font yüklenemedi: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

const SINYALLER = [
  { renk: "#2fb36b", ad: "müsait" },
  { renk: "#e3a12c", ad: "opsiyon" },
  { renk: "#d15a4e", ad: "satıldı" },
];

export default async function OgImage() {
  const [outfit800, inter600, inter400] = await Promise.all([
    loadFont("Outfit", 800),
    loadFont("Inter", 600),
    loadFont("Inter", 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          background: "linear-gradient(135deg, #081422 0%, #10243a 55%, #13314b 100%)",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        {/* Teal komuta ışıması (marka canlılık aksanı) */}
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

        {/* Üst bar: canlılık rozeti + alan adı */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(47,179,107,0.12)",
              border: "1px solid rgba(47,179,107,0.35)",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, background: "#2fb36b", display: "flex" }} />
            <span style={{ fontSize: 24, fontWeight: 600, color: "#bfe6d3" }}>Canlı · 2 dk önce</span>
          </div>
          <span style={{ fontSize: 26, fontWeight: 600, color: "#7f95ab", letterSpacing: 0.5 }}>projedar.com</span>
        </div>

        {/* Ana blok: wordmark + değer önermesi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: 116,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            Projedar
          </span>
          <div style={{ display: "flex", fontSize: 50, fontWeight: 600, lineHeight: 1.15 }}>
            <span style={{ color: "#1e9b8a" }}>Canlı</span>
            <span style={{ color: "#e9eef4" }}>&nbsp;konut stoğu dağıtım ağı</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 400, color: "#9fb2c4", marginTop: 8 }}>
            Tek doğru kaynak · Çift satış kalkanı · Komisyondan pay almaz
          </span>
        </div>

        {/* Alt: sinyal imzası (müsait / opsiyon / satıldı) */}
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          {SINYALLER.map((s) => (
            <div key={s.ad} style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: s.renk, display: "flex" }} />
              <span style={{ fontSize: 26, fontWeight: 600, color: "#c4d2df" }}>{s.ad}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: outfit800, weight: 800, style: "normal" },
        { name: "Inter", data: inter600, weight: 600, style: "normal" },
        { name: "Inter", data: inter400, weight: 400, style: "normal" },
      ],
    },
  );
}
