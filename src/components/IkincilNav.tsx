/**
 * Sayfaya özel ikincil gezinme (alt-şerit). Ana menünün hemen altında, ince ve
 * ondan görsel olarak ayrık. Sayfa-içi anchor bağlantılarını (Nasıl çalışır,
 * SSS, Canlı havuz, ...) taşır; ana menüyü kirletmez. Öğe yoksa render edilmez.
 */
export function IkincilNav({ ogeler }: { ogeler: { etiket: string; href: string }[] }) {
  if (!ogeler.length) return null;
  return (
    <div className="sticky top-[calc(var(--lansman-bar-h,0px)+4rem)] z-40 border-b border-[var(--cizgi)] bg-[var(--color-soft)]/85 backdrop-blur-md">
      <nav
        aria-label="Sayfa içi gezinme"
        className="mx-auto flex h-11 w-full max-w-6xl items-center gap-1 overflow-x-auto px-5 sm:px-6"
      >
        {ogeler.map((o) => (
          <a
            key={o.href}
            href={o.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink"
          >
            {o.etiket}
          </a>
        ))}
      </nav>
    </div>
  );
}
