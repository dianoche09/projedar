import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { IcerikKategori } from "@/lib/icerik/tipler";

/** Public üst bar navigasyonu (mevcut site yüzeyiyle tutarlı). */
const NAV: { etiket: string; href: string; kategori?: IcerikKategori }[] = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Rehber", href: "/rehber", kategori: "rehber" },
  { etiket: "Güven", href: "/guven" },
];

/**
 * İçerik yüzeyi üst barı. `aktif` ilgili menü öğesini vurgular.
 * (Footer ortak `KapanisFooter` component'inden gelir.)
 */
export function SiteHeader({ aktif }: { aktif?: IcerikKategori }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--cizgi)] bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <Link href="/" aria-label="Projedar ana sayfa">
          <Logo size={22} wordmark />
        </Link>
        <nav aria-label="Ana menü" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => {
            const secili = Boolean(n.kategori && n.kategori === aktif);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`text-[13px] font-medium transition-colors hover:text-ink ${
                  secili ? "text-ink" : "text-ink-soft"
                }`}
                aria-current={secili ? "page" : undefined}
              >
                {n.etiket}
              </Link>
            );
          })}
        </nav>
        <Link href="/kayit?rol=emlakci&kaynak=icerik-nav" className="btn-primary hover:-translate-y-0.5">
          Ağa katıl
        </Link>
      </div>
    </header>
  );
}
