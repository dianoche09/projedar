/** Projedar radar logosu — sonar halkaları + canlı blipler (yeşil müsait / amber opsiyon /
 *  kırmızı satıldı) + yeşil ping halkası. acik=true → koyu zemin (beyaz halka/merkez). */
export function Logo({ size = 28, wordmark = false, acik = false }: { size?: number; wordmark?: boolean; acik?: boolean }) {
  const halka1 = acik ? "rgba(255,255,255,0.36)" : "rgba(16,36,58,0.26)";
  const halka2 = acik ? "rgba(255,255,255,0.20)" : "rgba(16,36,58,0.14)";
  const merkez = acik ? "#ffffff" : "#10243a";
  // İkon, wordmark yanında küçük kalmasın diye viewBox'ı doldurur + size'ın ~1.3 katı render edilir.
  const ikon = Math.round(size * 1.3);
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={ikon} height={ikon} viewBox="0 0 40 40" className="flex-none" aria-hidden>
        <circle cx="20" cy="20" r="17" fill="none" stroke={halka2} strokeWidth="2.2" />
        <circle cx="20" cy="20" r="9.5" fill="none" stroke={halka1} strokeWidth="2.2" />
        <circle cx="20" cy="20" r="2.4" fill={merkez} />
        <circle cx="10.5" cy="14" r="4.2" fill="#d99a1a" />
        <circle cx="25.5" cy="29.5" r="4.2" fill="#d15a4e" />
        <circle cx="29.5" cy="13" r="8" fill="none" stroke="#2fb36b" strokeWidth="1.6" opacity="0.5" />
        <circle cx="29.5" cy="13" r="4.6" fill="#2fb36b" />
      </svg>
      {wordmark ? (
        <span className={`font-display text-2xl font-extrabold tracking-tight ${acik ? "text-white" : "text-navy"}`}>
          proje<span className="text-teal">dar</span>
        </span>
      ) : null}
    </span>
  );
}
