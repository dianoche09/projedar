"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/**
 * Bozuk sistem karşıtlığı: solda kontrolsüz dağılım (eski fiyat listesi kopyala
 * kopyala her yere sızar, sürümler çelişir, hiçbir akış canlı değildir), sağda
 * kontrollü ağ (tek kayıt, tek yetki kapısı, her uçta aynı canlı değer).
 * Sol sahne kasıtlı olarak hareketsizdir: ölü veri akmaz. Veriler örnektir.
 */

const SIZINTILAR = [
  { x: 250, y: 26, ad: "WhatsApp grubu", deger: "₺9,1M · 34 gün önce", renk: "#d15a4e" },
  { x: 322, y: 92, ad: "E-posta eki", deger: "₺8,9M · 3 ay önce", renk: "#d15a4e" },
  { x: 214, y: 152, ad: "Ekran görüntüsü", deger: "₺9,4M · dün", renk: "#e3a12c" },
  { x: 330, y: 208, ad: "Kopyalanan Excel", deger: "₺9,1M · 34 gün önce", renk: "#d15a4e" },
  { x: 238, y: 266, ad: "Yazdırılmış liste", deger: "₺8,9M · 3 ay önce", renk: "#d15a4e" },
];

const UCLAR = [64, 160, 256];

export function SizintiSahnesi() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className={`grid gap-4 md:grid-cols-2 ${inView ? "sz-canli" : ""}`}>
      <style>{`
        @keyframes szAkis { to { stroke-dashoffset: -26; } }
        .sz-akis { stroke-dasharray: 5 8; }
        .sz-canli .sz-akis { animation: szAkis 1.3s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sz-canli .sz-akis { animation: none !important; }
        }
      `}</style>

      {/* ---- SOL: kontrolsüz dağılım ---- */}
      <div className="kart signal-top overflow-hidden p-0" style={{ "--_sig": "var(--color-red)" } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-2 border-b border-[var(--cizgi)] bg-[var(--color-red-soft)]/50 px-5 py-3.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#a23f34]">
            Bugün: kontrolsüz dağılım
          </p>
          <span className="rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <svg
            viewBox="0 0 460 320"
            className="h-auto w-full"
            role="img"
            aria-label="Kontrolsüz dağılım şeması: fiyat listesi bir kez dışarı çıkınca WhatsApp, e-posta ve ekran görüntüsü kopyalarında farklı ve eski sürümler dolaşır"
          >
            {/* kaynaktan kopan doküman */}
            <rect x="20" y="128" width="126" height="62" rx="8" fill="#ffffff" stroke="rgba(209,90,78,0.5)" strokeWidth="1.3" strokeDasharray="5 4" />
            <text x="34" y="152" fill="#10243a" fontSize="11.5" fontWeight="600">fiyat_listesi.pdf</text>
            <text x="34" y="170" fill="#a23f34" fontSize="9.5" fontFamily="var(--font-mono), monospace">v1 · kaynaktan koptu</text>

            {/* dağınık, çelişen kopya uçları */}
            {SIZINTILAR.map((s) => (
              <g key={s.ad}>
                <path
                  d={`M146 159 C ${s.x - 60} 159, ${s.x - 58} ${s.y + 22}, ${s.x} ${s.y + 22}`}
                  fill="none"
                  stroke="rgba(209,90,78,0.28)"
                  strokeWidth="1.3"
                  strokeDasharray="3 6"
                />
                <rect x={s.x} y={s.y} width="122" height="44" rx="8" fill="#ffffff" stroke="rgba(16,36,58,0.14)" />
                <text x={s.x + 11} y={s.y + 17} fill="#10243a" fontSize="10" fontWeight="600">{s.ad}</text>
                <circle cx={s.x + 15} cy={s.y + 31} r="3" fill={s.renk} />
                <text x={s.x + 23} y={s.y + 34} fill="#46586b" fontSize="8.5" fontFamily="var(--font-mono), monospace">
                  {s.deger}
                </text>
              </g>
            ))}

            {/* kopyanın kopyası: uçlar arası çapraz sızıntı */}
            <path d="M372 114 C 400 130, 396 176, 372 196" fill="none" stroke="rgba(209,90,78,0.22)" strokeWidth="1.2" strokeDasharray="3 6" />
            <path d="M276 70 C 210 96, 200 118, 214 148" fill="none" stroke="rgba(209,90,78,0.22)" strokeWidth="1.2" strokeDasharray="3 6" />
            <text x="20" y="308" fill="#7d8da0" fontSize="9" fontFamily="var(--font-mono), monospace">
              3 farklı fiyat dolaşımda · hangisi doğru, kimse bilmiyor
            </text>
          </svg>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Liste kaynağından koptuğu an yaşlanmaya başlar. Kopyanın kopyası dolaşır; müşteri karşısında
            <strong className="font-semibold text-ink"> eski fiyat</strong> konuşulur, üreticinin markası yıpranır.
          </p>
        </div>
      </div>

      {/* ---- SAĞ: kontrollü ağ ---- */}
      <div className="kart signal-top overflow-hidden p-0" style={{ "--_sig": "var(--color-teal)" } as React.CSSProperties}>
        <div className="flex items-center justify-between gap-2 border-b border-[var(--cizgi)] bg-[var(--color-teal-soft)]/60 px-5 py-3.5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--color-teal-d)]">
            ProjePazar: kontrollü ağ
          </p>
          <span className="rounded-md border border-[var(--cizgi-2)] bg-white/90 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
            örnek
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <svg
            viewBox="0 0 460 320"
            className="h-auto w-full"
            role="img"
            aria-label="Kontrollü ağ şeması: fiyat tek canlı kayıtta durur, tek yetki kapısından geçer ve her danışman linkinde aynı canlı değer basılır"
          >
            {/* tek canlı kayıt */}
            <rect x="20" y="128" width="126" height="62" rx="8" fill="#ffffff" stroke="rgba(30,155,138,0.55)" strokeWidth="1.4" />
            <text x="34" y="150" fill="#10243a" fontSize="11.5" fontWeight="600">Birim kaydı B-4-2</text>
            <circle cx="38" cy="168" r="3" fill="#2fb36b" className={inView ? "nabiz" : undefined} />
            <text x="46" y="171" fill="#1f7d4c" fontSize="9.5" fontFamily="var(--font-mono), monospace">₺9,52M · şimdi</text>

            {/* tek yetki kapısı */}
            <rect x="206" y="96" width="14" height="44" fill="rgba(19,49,75,0.09)" stroke="rgba(19,49,75,0.20)" />
            <rect x="206" y="180" width="14" height="44" fill="rgba(19,49,75,0.09)" stroke="rgba(19,49,75,0.20)" />
            <line x1="206" y1="140" x2="220" y2="140" stroke="#1e9b8a" strokeWidth="2" />
            <line x1="206" y1="180" x2="220" y2="180" stroke="#1e9b8a" strokeWidth="2" />
            <text x="213" y="86" textAnchor="middle" fill="#7d8da0" fontSize="7.5" fontWeight="700" letterSpacing="0.06em" fontFamily="var(--font-mono), monospace">
              YETKİ
            </text>

            {/* akış: kayıttan kapıya, kapıdan yalnız yetkili uçlara */}
            <path className="sz-akis" d="M146 159 H206" fill="none" stroke="#1e9b8a" strokeWidth="2" />
            {UCLAR.map((y) => (
              <g key={y}>
                <path
                  className="sz-akis"
                  d={`M220 160 C 260 160, 262 ${y + 22}, 300 ${y + 22}`}
                  fill="none"
                  stroke="#1e9b8a"
                  strokeWidth="1.8"
                />
                <rect x="300" y={y} width="138" height="44" rx="8" fill="#ffffff" stroke="rgba(30,155,138,0.4)" />
                <text x="312" y={y + 17} fill="#10243a" fontSize="10" fontWeight="600">Danışman linki</text>
                <circle cx="316" cy={y + 31} r="3" fill="#2fb36b" />
                <text x="324" y={y + 34} fill="#1f7d4c" fontSize="8.5" fontFamily="var(--font-mono), monospace">
                  ₺9,52M · canlı basıldı
                </text>
              </g>
            ))}
            <text x="20" y="308" fill="#7d8da0" fontSize="9" fontFamily="var(--font-mono), monospace">
              tek değer · her uçta aynı · açılışta kayıttan okunur
            </text>
          </svg>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Fiyat hiçbir yere kopyalanmaz. Paylaşılan link bir <strong className="font-semibold text-ink">pencere</strong>dir:
            her açılışta canlı kayıttan okur. Eski fiyat dolaşıma girecek bir kopya bulamaz.
          </p>
        </div>
      </div>
    </div>
  );
}
