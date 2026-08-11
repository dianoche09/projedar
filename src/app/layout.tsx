import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { PwaKur } from "@/components/ui/PwaKur";
import { LansmanBar } from "@/components/LansmanBar";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

// Spatial tipografi: Outfit (başlık/wordmark) + Inter (arayüz) + Geist Mono (veri/sayı)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://projedar.com"),
  // Sayfalar kendi tam başlığını yönetiyor (bazıları "… | Projedar" ile bitiyor);
  // bu yüzden template kullanmıyoruz — çift "Projedar" olmasın.
  title: "Projedar — Canlı Konut Stoğu Dağıtım Ağı",
  description:
    "Çok-müteahhitli, üretici-kontrollü canlı konut stoğu dağıtım ağı. Tek doğru kaynak, granüler tahsis, çift-satış kalkanı, görünür tazelik.",
  applicationName: "Projedar",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Projedar" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  // Site geneli sosyal paylaşım varsayılanları; sayfalar kendi başlık/açıklamasıyla
  // bunu genişletir. Görsel /opengraph-image (dosya-tabanlı) ile otomatik gelir.
  openGraph: {
    type: "website",
    siteName: "Projedar",
    locale: "tr_TR",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#eef1f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${outfit.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink font-sans">
        <PostHogProvider>
          <NextTopLoader color="#1e9b8a" height={3} shadow="0 0 8px #1e9b8a" showSpinner={false} speed={250} />
          <LansmanBar />
          {children}
          <PwaKur />
        </PostHogProvider>
      </body>
    </html>
  );
}
