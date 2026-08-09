/**
 * Dağıtım ağı topolojisi (statik SVG).
 * Üretici → Canlı Stok Havuzu (tek doğru kaynak) → Tahsis kapısı → tahsisli emlakçılar.
 * diagram-design skill grameri + Projedar "Spatial Açık" paleti (teal focal, statü renkleri semantic).
 * Mobilde yatay kaydırılır (mevcut karşılaştırma tablosu deseniyle tutarlı).
 */
export function DagitimAgi() {
  return (
    <figure className="m-0">
      <div className="overflow-x-auto rounded-2xl border border-[var(--cizgi)] bg-[var(--zemin)]">
        <div className="min-w-[820px] p-4 sm:p-6">
          <svg
            viewBox="0 128 960 408"
            className="h-auto w-full"
            role="img"
            aria-label="Dağıtım ağı topolojisi: üretici, canlı stok havuzu, tahsis kapısı ve tahsisli emlakçılar"
          >
            <defs>
              <marker id="da-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#46586b" />
              </marker>
              <marker id="da-arrow-navy" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#13314b" />
              </marker>
            </defs>

            {/* ---- ARROWS (draw before boxes) ---- */}
            {/* üretici -> havuz */}
            <line x1="216" y1="300" x2="300" y2="300" stroke="#13314b" strokeWidth="1.2" markerEnd="url(#da-arrow-navy)" />
            <rect x="234" y="280" width="48" height="12" rx="2" fill="#eef1f6" />
            <text x="258" y="289" fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.06em">YÖNETİR</text>

            {/* havuz -> tahsis */}
            <line x1="512" y1="300" x2="556" y2="300" stroke="#46586b" strokeWidth="1.2" markerEnd="url(#da-arrow)" />

            {/* tahsis -> emlakçı A / B / C */}
            <path d="M696,288 H712 Q720,288 720,280 V196 Q720,188 728,188 H740" fill="none" stroke="#46586b" strokeWidth="1.2" markerEnd="url(#da-arrow)" />
            <line x1="696" y1="300" x2="740" y2="300" stroke="#46586b" strokeWidth="1.2" markerEnd="url(#da-arrow)" />
            <path d="M696,312 H712 Q720,312 720,320 V404 Q720,412 728,412 H740" fill="none" stroke="#46586b" strokeWidth="1.2" markerEnd="url(#da-arrow)" />

            {/* group label */}
            <text x="832" y="140" fill="#7d8da0" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.14em">TAHSİSLİ GÖRÜNÜM</text>

            {/* ---- NODES ---- */}
            {/* ÜRETİCİ */}
            <rect x="48" y="252" width="168" height="96" rx="8" fill="#eef1f6" />
            <rect x="48" y="252" width="168" height="96" rx="8" fill="#ffffff" stroke="#10243a" strokeWidth="1" />
            <rect x="64" y="268" width="40" height="14" rx="2" fill="transparent" stroke="rgba(16,36,58,0.35)" strokeWidth="0.8" />
            <text x="84" y="278" fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.1em">ROL</text>
            <text x="132" y="308" fill="#10243a" fontSize="16" fontWeight="600" className="font-sans" textAnchor="middle">Üretici</text>
            <text x="132" y="328" fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.04em">stok · fiyat · tahsis</text>

            {/* CANLI STOK HAVUZU (focal) */}
            <rect x="304" y="224" width="208" height="152" rx="8" fill="#eef1f6" />
            <rect x="304" y="224" width="208" height="152" rx="8" fill="rgba(30,155,138,0.10)" stroke="#1e9b8a" strokeWidth="1.2" />
            <rect x="320" y="240" width="72" height="14" rx="2" fill="transparent" stroke="rgba(30,155,138,0.55)" strokeWidth="0.8" />
            <text x="356" y="250" fill="#1a8676" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.1em">VERİ · BİRİM</text>
            <text x="408" y="296" fill="#10243a" fontSize="16" fontWeight="600" className="font-sans" textAnchor="middle">Canlı Stok Havuzu</text>
            <text x="408" y="316" fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.04em">tek doğru kaynak</text>
            <rect x="356" y="336" width="104" height="20" rx="10" fill="#ffffff" stroke="rgba(47,179,107,0.4)" strokeWidth="0.8" />
            <circle cx="374" cy="346" r="3.5" fill="#2fb36b" />
            <text x="384" y="349" fill="#1f7a4a" fontSize="8" className="font-mono" letterSpacing="0.04em">canlı · az önce</text>

            {/* TAHSİS (focal / gate) */}
            <rect x="560" y="272" width="136" height="56" rx="8" fill="#eef1f6" />
            <rect x="560" y="272" width="136" height="56" rx="8" fill="rgba(30,155,138,0.05)" stroke="rgba(30,155,138,0.5)" strokeWidth="1.2" strokeDasharray="4,4" />
            <text x="628" y="298" fill="#10243a" fontSize="12" fontWeight="600" className="font-sans" textAnchor="middle">Tahsis</text>
            <text x="628" y="314" fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.04em">görünürlük kapısı</text>

            {/* EMLAKÇI A / B / C */}
            {[
              { y: 156, ad: "Emlakçı A" },
              { y: 268, ad: "Emlakçı B" },
              { y: 380, ad: "Emlakçı C" },
            ].map((e) => (
              <g key={e.ad}>
                <rect x="744" y={e.y} width="176" height="64" rx="8" fill="#eef1f6" />
                <rect x="744" y={e.y} width="176" height="64" rx="8" fill="rgba(16,36,58,0.05)" stroke="#46586b" strokeWidth="1" />
                <text x="832" y={e.y + 28} fill="#10243a" fontSize="12" fontWeight="600" className="font-sans" textAnchor="middle">{e.ad}</text>
                <text x="832" y={e.y + 44} fill="#46586b" fontSize="8" className="font-mono" textAnchor="middle" letterSpacing="0.04em">yalnız tahsisli</text>
              </g>
            ))}

            {/* ---- LEGEND ---- */}
            <line x1="48" y1="492" x2="912" y2="492" stroke="rgba(16,36,58,0.10)" strokeWidth="0.8" />
            <text x="48" y="512" fill="#7d8da0" fontSize="8" className="font-mono" letterSpacing="0.14em">LEJANT</text>
            <rect x="132" y="504" width="14" height="12" rx="3" fill="rgba(30,155,138,0.10)" stroke="#1e9b8a" strokeWidth="1" />
            <text x="152" y="513" fill="#46586b" fontSize="8" className="font-mono">canlı · tek doğru kaynak</text>
            <rect x="336" y="504" width="14" height="12" rx="3" fill="rgba(30,155,138,0.05)" stroke="rgba(30,155,138,0.5)" strokeWidth="1" strokeDasharray="3,3" />
            <text x="356" y="513" fill="#46586b" fontSize="8" className="font-mono">tahsis kapısı</text>
            <rect x="484" y="504" width="14" height="12" rx="3" fill="rgba(16,36,58,0.05)" stroke="#46586b" strokeWidth="1" />
            <text x="504" y="513" fill="#46586b" fontSize="8" className="font-mono">tahsisli emlakçı</text>
            <rect x="632" y="504" width="14" height="12" rx="3" fill="#ffffff" stroke="#10243a" strokeWidth="1" />
            <text x="652" y="513" fill="#46586b" fontSize="8" className="font-mono">üretici · komuta</text>
          </svg>
        </div>
      </div>
      <figcaption className="mt-4 border-t border-[var(--cizgi)] pt-4 font-mono text-[11px] leading-relaxed text-[var(--ink-faint)]">
        <span className="text-ink-soft">Çift-satış kalkanı:</span> aktif opsiyon veritabanında benzersiz kilitle korunur; aynı daireye ikinci opsiyon yapısal olarak imkânsızdır.
        <br />
        <span className="text-ink-soft">Tazelik:</span> her yazışta son güncelleme damgalanır; paylaşımda fiyat o anki canlı değerden basılır.
      </figcaption>
    </figure>
  );
}
