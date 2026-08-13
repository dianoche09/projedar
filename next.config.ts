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
  // Katalog proje kapak görselleri: kaynak sitenin (og:image) CDN'inden next/image ile
  // optimize edilerek servis edilir (rehost yerine hotlink; "Görsel: <kaynak>" atfı sayfada).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "imaj.emlakjet.com" },
      { protocol: "https", hostname: "files.satisofisi.com" },
      { protocol: "https", hostname: "satisofisi.com" },
      { protocol: "https", hostname: "www.satisofisi.com" },
    ],
  },
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
  async redirects() {
    return [
      {
        // Danışman paneli /havuz → /danisman taşındı (rol öneki, /uretici ile simetri).
        // Eski bildirim linkleri/bookmark'lar kırılmasın diye kalıcı redirect.
        source: "/havuz",
        destination: "/danisman",
        permanent: true,
      },
      {
        source: "/havuz/:path*",
        destination: "/danisman/:path*",
        permanent: true,
      },
      {
        // Geçici köprü: Afet Sempozyumu kampanya maillerindeki "Bilgilerimi Tamamla" linki
        // bir env hatası yüzünden projedar.com'a düşmüştü. Query (id & token) korunarak asıl
        // kayıt sitesine yönlendirilir; böylece gönderilmiş linkler tekrar mail atmadan çalışır.
        source: "/kayit/tamamla",
        destination: "https://kayit.vercel.app/kayit/tamamla",
        permanent: false,
      },
    ];
  },
};

export default withSerwist(nextConfig);
