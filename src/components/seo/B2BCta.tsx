import Link from "next/link";

/**
 * Programmatic proje sayfası B2B çağrısı. Son kullanıcıya "satılık daire" DEĞİL;
 * projeyi satmak isteyen danışmana ve projeyi yöneten müteahhide seslenir.
 * Fiyat/lead formu yok (DEĞİŞMEZ: komisyon yok, kapalı-devre, EİDS-safe).
 */
export function B2BCta({ slug, projeAd }: { slug: string; projeAd: string }) {
  return (
    <section className="kart signal-top p-5" style={{ "--_sig": "var(--color-teal)" } as React.CSSProperties}>
      <p className="font-display text-base font-semibold text-ink">{projeAd} projesini ağda değerlendir</p>
      <p className="mt-1 text-sm text-ink-soft">
        Projedar kapalı bir B2B ağdır; fiyat ve güncel stok yalnız yetkili gayrimenkul danışmanlarına canlı açılır.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link href={`/kayit?rol=emlakci&proje=${encodeURIComponent(slug)}`} className="btn-action w-full justify-center">
          Bu projeyi ağda sat (danışman)
        </Link>
        <Link href={`/kayit?rol=uretici&talep=proje&slug=${encodeURIComponent(slug)}`} className="btn-ghost w-full justify-center">
          Bu proje senin mi? Ağa ekle
        </Link>
      </div>
    </section>
  );
}
