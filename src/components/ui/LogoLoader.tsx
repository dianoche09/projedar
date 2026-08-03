// Projedar radar loader — sonar halkaları + dönen tarama ışını + yeşil blipte yayılan ping (canlı marka).
export function LogoLoader({ boyut = 13, etiket = "yükleniyor…" }: { boyut?: number; etiket?: string }) {
  const size = Math.round(boyut * 3.4);
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-label="Yükleniyor">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        {/* sabit halkalar */}
        <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(16,36,58,0.13)" strokeWidth="1.6" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(16,36,58,0.22)" strokeWidth="1.6" />
        {/* dönen tarama ışını */}
        <path d="M20 20 L20 3.5 A16.5 16.5 0 0 1 34 11.5 Z" fill="#1E9B8A" opacity="0.25">
          <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1.5s" repeatCount="indefinite" />
        </path>
        {/* merkez + blipler */}
        <circle cx="20" cy="20" r="2" fill="#13314B" />
        <circle cx="11" cy="13.5" r="2.6" fill="#E3A12C" />
        <circle cx="24" cy="29" r="2.6" fill="#D15A4E" />
        <circle cx="29" cy="14" r="3" fill="#2FB36B" />
        {/* yeşil blipte ping halkası */}
        <circle cx="29" cy="14" r="3" fill="none" stroke="#2FB36B" strokeWidth="1.3">
          <animate attributeName="r" values="2;8" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
      {etiket ? <span className="font-mono text-xs text-gray">{etiket}</span> : null}
    </div>
  );
}
