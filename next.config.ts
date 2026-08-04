import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// PWA: serwist service worker (Devir Dokümanı DEĞİŞMEZ #6 — mobil-önce + PWA)
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Geliştirmede SW kapalı (HMR ile çakışmasın); prod'da aktif
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Üst dizindeki ilgisiz package-lock.json'ı workspace root sanmasını engelle
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [
      {
        // RFC 8288 Link header: AI/agent keşfi için llms.txt + sitemap işaretçileri (GEO).
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</llms.txt>; rel="alternate"; type="text/markdown"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
            ].join(", "),
          },
        ],
      },
      {
        // Content-Signal (2025 içerik izin standardı): landing içeriği AI arama/eğitim/
        // yanıt için açık. Panel/havuz/mikrosite zaten robots.txt'te Disallow ile korunur.
        source: "/:path*",
        headers: [{ key: "Content-Signal", value: "search=yes, ai-train=yes, ai-input=yes" }],
      },
    ];
  },
};

export default withSerwist(nextConfig);
