import type { Metadata } from "next";
import { KategoriHub } from "@/components/icerik/KategoriHub";

export const revalidate = 86400;

const SITE = "https://projedar.com";

export const metadata: Metadata = {
  title: "Emlak ve Proje Satış Sözlüğü | Projedar",
  description:
    "Proje ve konut satışında kullanılan terimler: opsiyon, tahsis, kapora, şerefiye, kat irtifakı, hizmet bedeli ve ön ödemeli konut satışı. Emlak danışmanları için net tanımlar.",
  alternates: { canonical: `${SITE}/sozluk` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Emlak ve Proje Satış Sözlüğü",
    description: "Opsiyon, tahsis, kapora, şerefiye ve daha fazlası — danışmanlar için net tanımlar.",
    url: `${SITE}/sozluk`,
    type: "website",
  },
};

export default function SozlukIndex() {
  return (
    <KategoriHub
      kategori="sozluk"
      baslik="Emlak ve Proje Satış Sözlüğü"
      aciklama="Proje ve konut satışında sık kullanılan terimlerin net tanımları. Sahada doğru kelimeyi doğru anlamda kullanmak için."
    />
  );
}
