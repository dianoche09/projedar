import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnaMenu } from "@/components/AnaMenu";
import { KapanisFooter } from "@/components/KapanisFooter";
import { IcerikDamgasi } from "@/components/icerik/IcerikDamgasi";
import { kategoriIcerikleri } from "@/lib/icerik/kayit";
import { KATEGORI_ETIKET, type IcerikKategori } from "@/lib/icerik/tipler";

/**
 * Kategori listeleme (hub) — tüm içerik kategorileri (rehber/sozluk/karsilastirma/…)
 * bu tek bileşeni paylaşır. Kartlar registry'den (yalnız yayında) otomatik gelir;
 * yeni içerik = yeni kart, hub'a dokunmaya gerek yok.
 */
export function KategoriHub({
  kategori,
  baslik,
  aciklama,
}: {
  kategori: IcerikKategori;
  baslik: string;
  aciklama: string;
}) {
  const icerikler = kategoriIcerikleri(kategori);
  const etiket = KATEGORI_ETIKET[kategori];

  return (
    <main className="flex min-h-full flex-col">
      <AnaMenu aktif={kategori} />

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <nav aria-label="İçerik konumu" className="text-[12.5px] text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-ink hover:underline">
                Ana sayfa
              </Link>
            </li>
            <ChevronRight size={13} className="flex-none text-[var(--ink-faint)]" aria-hidden />
            <li className="font-medium text-ink" aria-current="page">
              {etiket}
            </li>
          </ol>
        </nav>

        <header className="mt-6 max-w-2xl">
          <h1 className="font-display text-[2rem] font-extrabold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
            {baslik}
          </h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{aciklama}</p>
        </header>

        {icerikler.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {icerikler.map((m) => (
              <Link
                key={m.slug}
                href={`/${kategori}/${m.slug}`}
                className="kart kart-3d group flex h-full flex-col p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal-d">
                    {etiket}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-ink-soft transition-transform group-hover:translate-x-0.5"
                  />
                </div>
                <h2 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight text-ink">
                  {m.h1 ?? m.title}
                </h2>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-soft">{m.description}</p>
                <div className="mt-4">
                  <IcerikDamgasi updatedAt={m.updatedAt} sourceCheckedAt={m.sourceCheckedAt} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-2xl border border-hair bg-card px-5 py-6 text-sm text-ink-soft">
            Bu kategoride içerik yakında yayınlanacak.
          </p>
        )}
      </div>

      <KapanisFooter />
    </main>
  );
}
