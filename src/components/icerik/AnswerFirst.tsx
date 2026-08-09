/**
 * Answer-first bloğu. H1'in hemen ardından, sorunun doğrudan ve kısa cevabı
 * (40-80 kelime). SEO metni değil; gerçek cevap. Kaynaklı iddialar için
 * içeride küçük referans (ör. [1]) kullanılabilir.
 */
export function AnswerFirst({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="signal-top rounded-2xl border border-[var(--cizgi)] bg-white/70 p-5 sm:p-6"
      style={{ ["--_sig" as string]: "var(--color-teal)" }}
    >
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-teal-d">
        Kısa cevap
      </p>
      <div className="mt-2 text-[15px] leading-relaxed text-ink [&_a]:font-medium [&_a]:text-teal-d [&_a]:underline [&_a]:decoration-teal/30 [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
