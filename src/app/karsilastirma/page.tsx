import type { Metadata } from "next";
import { KategoriHub } from "@/components/icerik/KategoriHub";

export const revalidate = 86400;

const SITE = "https://projedar.com";

export const metadata: Metadata = {
  title: "Karşılaştırmalar: Konut Satış Modelleri | Projedar",
  description:
    "Konut ve proje satışında modellerin karşılaştırması: açık ilan portalı ile tahsisli profesyonel ağ. Hangi model hangi ihtiyaca uygun? Dengeli, kaynaklı analiz.",
  alternates: { canonical: `${SITE}/karsilastirma` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Karşılaştırmalar: Konut Satış Modelleri",
    description: "Açık ilan portalı ile tahsisli profesyonel ağ modeli — hangisi hangi ihtiyaca uygun?",
    url: `${SITE}/karsilastirma`,
    type: "website",
  },
};

export default function KarsilastirmaIndex() {
  return (
    <KategoriHub
      kategori="karsilastirma"
      baslik="Karşılaştırmalar"
      aciklama="Konut ve proje satışında yaklaşımların dengeli karşılaştırması. Hangi model hangi ihtiyaca uygun, karar vermeden önce net görün."
    />
  );
}
