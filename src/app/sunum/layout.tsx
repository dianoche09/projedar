import type { Metadata } from "next";

/** Sunum deck'leri: gizli link, arama motorlarına kapalı (sitemap dışı). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SunumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
