import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { KATEGORI_ETIKET, type IcerikKategori } from "@/lib/icerik/tipler";

/**
 * Görsel breadcrumb (Ana / Kategori / içerik). Son öğe geçerli sayfa (link
 * değil). Schema (BreadcrumbList) ayrı üretilir; bu yalnız navigasyondur.
 */
export function Breadcrumb({ kategori, baslik }: { kategori: IcerikKategori; baslik: string }) {
  return (
    <nav aria-label="İçerik konumu" className="text-[12.5px] text-ink-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="transition-colors hover:text-ink hover:underline">
            Ana sayfa
          </Link>
        </li>
        <ChevronRight size={13} className="flex-none text-[var(--ink-faint)]" aria-hidden />
        <li>
          <Link href={`/${kategori}`} className="transition-colors hover:text-ink hover:underline">
            {KATEGORI_ETIKET[kategori]}
          </Link>
        </li>
        <ChevronRight size={13} className="flex-none text-[var(--ink-faint)]" aria-hidden />
        <li className="font-medium text-ink" aria-current="page">
          {baslik}
        </li>
      </ol>
    </nav>
  );
}
