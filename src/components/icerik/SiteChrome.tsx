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

/** İçerik yüzeyi üst barı. `aktif` ilgili menü öğesini vurgular. */
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

/**
 * Footer menü grupları. "Kaynaklar" sütunu sektörel içerik yüzeyine açılan
 * menüdür; yalnız yayında olan kategoriler listelenir (yeni kategori yayına
 * girdikçe buraya eklenir; yayınlanmamış hedefe link verilmez).
 */
const FOOTER_MENU: { baslik: string; linkler: [string, string][] }[] = [
  {
    baslik: "Projedar",
    linkler: [
      ["Müteahhitler için", "/muteahhit"],
      ["Danışmanlar için", "/emlakci"],
      ["Konut projeleri", "/konut-projeleri"],
      ["Güven", "/guven"],
    ],
  },
  {
    baslik: "Kaynaklar",
    linkler: [["Rehberler", "/rehber"]],
  },
  {
    baslik: "Yasal",
    linkler: [
      ["Kullanım Koşulları", "/kullanim-kosullari"],
      ["Gizlilik", "/gizlilik"],
      ["KVKK Aydınlatma", "/kvkk-aydinlatma"],
    ],
  },
];

/** İçerik yüzeyi footer'ı (site geneliyle tutarlı, çok sütunlu menü). */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--cizgi)] bg-white/60 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-6 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo size={24} wordmark />
          <p className="max-w-xs text-xs leading-relaxed text-ink-soft">
            Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan konut stoğu
            dağıtım ağı.
          </p>
        </div>
        {FOOTER_MENU.map((grup) => (
          <nav key={grup.baslik} aria-label={grup.baslik} className="flex flex-col gap-3">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
              {grup.baslik}
            </p>
            <ul className="flex flex-col gap-2 text-[13px] font-medium text-ink-soft">
              {grup.linkler.map(([etiket, href]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-ink hover:underline">
                    {etiket}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--cizgi)] px-5 py-5 text-center text-[11px] text-[var(--ink-faint)] sm:px-6">
        © 2026 Projedar, Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
