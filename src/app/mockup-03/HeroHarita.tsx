import Image from "next/image";

/**
 * Hero arka katmanı: gerçek hava çekimi (alacakaranlık mahalle dokusu) üzerine
 * navy duotone işleme + tahsis kartografisi bindirmesi. Şehir dokusundaki gerçek
 * bina kümeleri erişim alanı (sektör) olarak taranır: iki sektör canlı akış alır,
 * biri kilit desenli "erişim yok" olarak kapalıdır; proje işaretinden çıkan akış
 * kapalı sektörün sınırında durur. Dekor değil ürün anlatımı: tahsis, gerçek
 * mahallenin üstünde okunur. Katman dekoratiftir (aria-hidden), bilgi metinde var.
 */
export function HeroHarita() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <style>{`
        @keyframes hhAkis { to { stroke-dashoffset: -30; } }
        .hh-akis { stroke-dasharray: 7 9; animation: hhAkis 1.5s linear infinite; }
        @keyframes hhHalka {
          0% { opacity: 0.8; transform: scale(0.5); }
          80% { opacity: 0; transform: scale(1.7); }
          100% { opacity: 0; }
        }
        .hh-halka { transform-box: fill-box; transform-origin: center; animation: hhHalka 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hh-akis, .hh-halka { animation: none !important; }
        }
      `}</style>

      {/* gerçek doku: hava çekimi */}
      <Image
        src="/generated/mockup-03/hero-hava-mahalle.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover saturate-[0.55]"
      />

      {/* navy duotone işleme: mürekkep katmanı + okunabilirlik gradyanı */}
      <div className="absolute inset-0 bg-[#13314b]/50 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,44,0.86)_0%,rgba(10,27,44,0.38)_44%,rgba(10,27,44,0.78)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(52%_44%_at_16%_22%,rgba(10,27,44,0.55),transparent_70%)]" />

      {/* tahsis kartografisi: sektör taramaları + akış + kapalı yol */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1088"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="hhKilit" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill="rgba(255,255,255,0.02)" />
            <rect width="5" height="14" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>

        {/* ince koordinat dokusu */}
        {[272, 544, 816].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1920" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {[480, 960, 1440].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="1088" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        <text x="1848" y="1064" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="15" letterSpacing="0.1em" fontFamily="var(--font-mono), monospace">
          HAVA · 240M · CANLI KATMAN
        </text>

        {/* SEKTÖR K1: sol-alt bina kümesi, açık (etiket tarama içinde, CTA'larla çakışmaz) */}
        <rect x="150" y="730" width="400" height="250" rx="10" fill="rgba(30,155,138,0.07)" stroke="rgba(127,217,200,0.75)" strokeWidth="2" strokeDasharray="10 8" />
        <rect x="162" y="744" width="322" height="34" rx="8" fill="rgba(10,27,44,0.8)" stroke="rgba(127,217,200,0.35)" />
        <text x="178" y="766" fill="#cfe6e1" fontSize="14" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
          SEKTÖR K1 · KUZEY OFİS · 4 DANIŞMAN
        </text>
        <rect x="162" y="936" width="122" height="30" rx="7" fill="rgba(10,27,44,0.8)" />
        <circle cx="180" cy="951" r="4" fill="#2fb36b" />
        <text x="191" y="956" fill="#7fd9c8" fontSize="13" fontWeight="700" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
          CANLI
        </text>

        {/* SEKTÖR D4: sağ alt küme, kapalı (kilit deseni) */}
        <rect x="1580" y="760" width="290" height="260" rx="10" fill="url(#hhKilit)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeDasharray="6 6" />
        <rect x="1592" y="948" width="252" height="34" rx="8" fill="rgba(10,27,44,0.8)" stroke="rgba(255,255,255,0.18)" />
        <path d="M1610 966 v-4.5 a5.5 5.5 0 0 1 11 0 v4.5" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2" />
        <rect x="1608" y="966" width="15" height="11" rx="2.5" fill="rgba(255,255,255,0.75)" />
        <text x="1633" y="970" fill="rgba(255,255,255,0.8)" fontSize="14" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
          SEKTÖR D4 · ERİŞİM YOK
        </text>

        {/* proje işareti: orta kümede veri doğar */}
        <circle className="hh-halka" cx="870" cy="780" r="22" fill="none" stroke="#7fd9c8" strokeWidth="2.5" />
        <circle cx="870" cy="780" r="10" fill="#1e9b8a" stroke="#eef1f6" strokeWidth="2.5" />
        <rect x="898" y="742" width="238" height="52" rx="8" fill="rgba(10,27,44,0.8)" stroke="rgba(127,217,200,0.35)" />
        <text x="914" y="764" fill="#ffffff" fontSize="14" fontWeight="600" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
          PROJE · ÇANKAYA VADİ
        </text>
        <text x="914" y="784" fill="#7fd9c8" fontSize="12.5" letterSpacing="0.04em" fontFamily="var(--font-mono), monospace">
          36 birim · veri burada doğar
        </text>

        {/* akışlar: açık sektöre ve canlı künyeye doğru akar, kapalı sektör sınırında durur */}
        <path className="hh-akis" d="M848 788 C 740 830, 660 810, 556 810" fill="none" stroke="#7fd9c8" strokeWidth="2.5" />
        <path className="hh-akis" d="M892 772 C 1000 740, 1080 700, 1180 650" fill="none" stroke="#7fd9c8" strokeWidth="2.5" />
        <path d="M888 796 C 1140 920, 1380 910, 1566 886" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="4 8" />
        <circle cx="1570" cy="886" r="6" fill="rgba(255,255,255,0.75)" />
      </svg>
    </div>
  );
}
