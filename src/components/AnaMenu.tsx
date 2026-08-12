import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cikisYap } from "@/app/(auth)/login/actions";

/**
 * Site geneli ORTAK ana menü. Tüm public sayfalarda AYNI kalır (sayfadan sayfaya
 * değişmez). Sayfaya özel gezinme (anchor'lar) ayrı `IkincilNav` alt-şeridinde
 * gösterilir; buraya karışmaz.
 *
 * `aktif` ilgili menü öğesini vurgular. `panelHref` verilirse (yalnız oturum
 * çözen dinamik sayfalar) sağda "Panele git" gösterilir; verilmezse (statik
 * sayfalar, SSG'yi korumak için) "Giriş yap + Ağa katıl".
 */
const ANA_MENU: { etiket: string; href: string; key: string }[] = [
  { etiket: "Konut projeleri", href: "/konut-projeleri", key: "konut-projeleri" },
  { etiket: "Müteahhitler için", href: "/muteahhit", key: "muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci", key: "emlakci" },
  { etiket: "Nedir", href: "/nedir", key: "nedir" },
  { etiket: "Rehber", href: "/rehber", key: "rehber" },
];

export function AnaMenu({ aktif, panelHref }: { aktif?: string; panelHref?: string | null }) {
  return (
    <header className="sticky top-[var(--lansman-bar-h,0px)] z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="Projedar ana sayfa" className="shrink-0">
          <Logo size={26} wordmark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {ANA_MENU.map((n) => {
            const a = n.key === aktif;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={a ? "page" : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[rgba(16,36,58,0.05)] hover:text-ink ${
                  a ? "text-ink" : "text-ink-soft"
                }`}
              >
                {n.etiket}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          {panelHref ? (
            <>
              <span className="hidden sm:block">
                <form action={cikisYap}>
                  <button type="submit" className="btn-ghost">
                    Çıkış
                  </button>
                </form>
              </span>
              <Link href={panelHref} className="btn-action hover:-translate-y-0.5">
                Panele git
              </Link>
            </>
          ) : (
            <>
              <span className="hidden sm:block">
                <Link href="/login" className="btn-ghost">
                  Giriş yap
                </Link>
              </span>
              <Link href="/kayit" className="btn-action whitespace-nowrap hover:-translate-y-0.5">
                Ağa katıl
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
