import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { verifyShareToken } from "@/lib/sharing";
import { createAdminClient } from "@/lib/supabase/admin";
import { DURUM_ETIKET, zamanOnce, type BirimDurum } from "@/lib/types";

// Node crypto (verifyShareToken) + service-role Supabase gerektiği için edge DEĞİL.
export const runtime = "nodejs";
export const alt = "Projedar — canlı stoktan paylaşım";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
// Durum → sinyal rengi (tasarım dili): müsait yeşil · opsiyon amber · satıldı kırmızı.
const DURUM_RENK: Record<BirimDurum, string> = {
  musait: "#2fb36b",
  opsiyonlu: "#e3a12c",
  satis_beklemede: "#e3a12c",
  satildi: "#d15a4e",
  stop: "#98a2b3",
  planli: "#7f95ab",
  kiralandi: "#1e9b8a",
};
const fmt = (n: number) => n.toLocaleString("tr-TR");

// Dinamik metin de olsa tüm Türkçe glyph'ler kapsansın diye tam alfabe subset'e dahil.
const ALFABE =
  "ABCÇDEFGĞHIİJKLMNOÖPQRSŞTUÜVWXYZabcçdefgğhıijklmnoöpqrsştuüvwxyz0123456789 ·.,:/%()₺$€£✓+-Daire kat oda Müsait Opsiyonlu Satış bekliyor Satıldı Durduruldu Planlı Kiralandı Doğrulanmış Üretici Projedar Canlı stoktan güncellendi Fiyat için görüşün projedar.com dk saat gün hafta ay yıl önce az şimdi m²";

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

// Token geçersiz / veri yok → kırık önizleme yerine sade marka kartı.
function genericNode() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18,
        padding: "0 84px",
        background: ZEMIN,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {tealGlow()}
      <span style={{ fontFamily: "Outfit", fontSize: 108, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>
        Projedar
      </span>
      <div style={{ display: "flex", fontSize: 46, fontWeight: 600 }}>
        <span style={{ color: "#1e9b8a" }}>Canlı</span>
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
  // Token doğrulama; LEAD_SHARE_SECRET eksik/hata olsa bile 500 yerine marka kartına düş
  // (kırık link önizlemesi WhatsApp/sosyal paylaşımda ürünün kalbini bozar).
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
      daire_no, kat, net_m2, liste_fiyati, para_birimi, satilabilir, durum, son_guncelleme,
      proje:proje_id ( ad, il, ilce, uretici:uretici_id ( dogrulanmis ) ),
      tip:tip_id ( oda )
    `)
    .eq("id", birim)
    .single();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = (data as any)?.proje;
  const t = (data as any)?.tip;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (!data || !p) return buildImage("", genericNode());

  const durum = (data.durum as BirimDurum) ?? "musait";
  const durumRenk = DURUM_RENK[durum] ?? "#98a2b3";
  const durumEtiket = DURUM_ETIKET[durum] ?? "Canlı";
  const dogrulanmis = Boolean(p?.uretici?.dogrulanmis);

  const psim = PARA_SIMGE[(data.para_birimi as string) ?? "TRY"] ?? "₺";
  const fiyat = data.satilabilir && data.liste_fiyati != null ? `${fmt(Number(data.liste_fiyati))} ${psim}` : null;
  const konum = [p?.ilce, p?.il].filter(Boolean).join(", ");
  const daireEtiket = data.daire_no ? `Daire ${data.daire_no}` : data.kat != null ? `${data.kat}. kat` : null;
  const daireOzet = [daireEtiket, t?.oda, data.net_m2 ? `${data.net_m2} m²` : null].filter(Boolean).join("  ·  ");
  const tazelik = data.son_guncelleme ? zamanOnce(data.son_guncelleme as string) : "az önce";
  const projeAd = (p?.ad as string) ?? "Projedar";

  const subset = [projeAd, konum, daireOzet, fiyat ?? ""].join(" ");

  const node = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 72px",
        background: ZEMIN,
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {tealGlow()}

      {/* Üst bar: durum sinyali + alan adı */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${durumRenk}66`,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, background: durumRenk, display: "flex" }} />
          <span style={{ fontSize: 26, fontWeight: 600, color: "#e9eef4" }}>{durumEtiket}</span>
        </div>
        <span style={{ fontSize: 26, fontWeight: 600, color: "#7f95ab", letterSpacing: 0.5 }}>projedar.com</span>
      </div>

      {/* Orta: proje + konum + daire + fiyat */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: 62,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -1,
              lineHeight: 1.02,
            }}
          >
            {projeAd}
          </span>
          {dogrulanmis ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(30,155,138,0.14)",
                border: "1px solid rgba(30,155,138,0.4)",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 600, color: "#5fd3bf" }}>✓ Doğrulanmış Üretici</span>
            </div>
          ) : null}
        </div>

        {konum ? <span style={{ fontSize: 30, fontWeight: 400, color: "#9fb2c4" }}>{konum}</span> : null}

        {daireOzet ? (
          <span style={{ fontSize: 32, fontWeight: 600, color: "#c4d2df", marginTop: 6 }}>{daireOzet}</span>
        ) : null}

        <span
          style={{
            fontFamily: "Outfit",
            fontSize: fiyat ? 76 : 44,
            fontWeight: 800,
            color: fiyat ? "#34d3bd" : "#9fb2c4",
            letterSpacing: -1,
            marginTop: 10,
          }}
        >
          {fiyat ?? "Fiyat için danışmanınıza sorun"}
        </span>
      </div>

      {/* Alt: marka + tazelik */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: "#2fb36b", display: "flex" }} />
        <span style={{ fontSize: 25, fontWeight: 600, color: "#e9eef4" }}>Projedar</span>
        <span style={{ fontSize: 25, fontWeight: 400, color: "#7f95ab" }}>· Canlı stoktan · {tazelik} güncellendi</span>
      </div>
    </div>
  );

  return buildImage(subset, node);
}
