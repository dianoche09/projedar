import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { icerikBul, kategoriIcerikleri } from "@/lib/icerik/kayit";
import { IcerikLayout } from "@/components/icerik/IcerikLayout";
import { REHBER_GOVDE } from "@/content/rehber";

// İçerik yavaş değişir; günlük ISR. İlk HTML server-rendered (kural: ana metin
// client fetch sonrası ortaya çıkmaz).
export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return kategoriIcerikleri("rehber").map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = icerikBul("rehber", slug);
  if (!meta) return {};
  return {
    title: `${meta.title} | Projedar`,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    robots: meta.index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: meta.canonical,
      type: "article",
    },
  };
}

export default async function RehberSayfa({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = icerikBul("rehber", slug);
  const modul = REHBER_GOVDE[slug];
  if (!meta || !modul) notFound();

  const { Govde, toc } = modul;
  return (
    <IcerikLayout meta={meta} toc={toc}>
      <Govde />
    </IcerikLayout>
  );
}
