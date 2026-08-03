/** Projedar radar logosu — sonar halkaları + canlı blipler (yeşil müsait / amber opsiyon /
 *  kırmızı satıldı) + yeşil ping halkası. acik=true → koyu zemin (beyaz halka/merkez). */
export function Logo({ size = 28, wordmark = false, acik = false }: { size?: number; wordmark?: boolean; acik?: boolean }) {
  const halka1 = acik ? "rgba(255,255,255,0.34)" : "rgba(16,36,58,0.24)";
  const halka2 = acik ? "rgba(255,255,255,0.18)" : "rgba(16,36,58,0.13)";
  const merkez = acik ? "#ffffff" : "#10243a";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 40 40" className="flex-none" aria-hidden>
        <circle cx="20" cy="20" r="15" fill="none" stroke={halka2} strokeWidth="1.8" />
        <circle cx="20" cy="20" r="8" fill="none" stroke={halka1} strokeWidth="1.8" />
        <circle cx="20" cy="20" r="2" fill={merkez} />
        <circle cx="11" cy="13.5" r="3.4" fill="#d99a1a" />
        <circle cx="24" cy="29" r="3.4" fill="#d15a4e" />
        <circle cx="29" cy="14" r="6.6" fill="none" stroke="#2fb36b" strokeWidth="1.4" opacity="0.5" />
        <circle cx="29" cy="14" r="3.8" fill="#2fb36b" />
      </svg>
      {wordmark ? (
        <span className={`font-display text-2xl font-extrabold tracking-tight ${acik ? "text-white" : "text-navy"}`}>
          proje<span className="text-teal">dar</span>
        </span>
      ) : null}
    </span>
  );
}
