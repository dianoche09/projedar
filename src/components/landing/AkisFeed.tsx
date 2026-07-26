"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AkisFeed · landing Bölüm 7: "Projenizde ne olduğunu, olduğu anda görün."
 * Tam genişlik koyu grafit bant (zemin bileşenin İÇİNDE): üstten yumuşak akan
 * canlı hareket satırları. Satır: zaman (mono) · durum-renkli olay noktası ·
 * metin · proje/kullanıcı mono etiketi. Hover'da akış duraklar; en fazla 7 satır
 * görünür, eskiler solarak düşer. prefers-reduced-motion: statik 6 satır.
 * TÜM VERİLER ÖRNEKTİR. Sadece CSS + React state, ağır kütüphane yok.
 */

type OlayRenk = "green" | "amber" | "red" | "teal";
type Olay = { id: number; renk: OlayRenk; metin: string; etiket: string; zaman: string };

/* sinyal renkleri SABİT: müsait/opsiyon/satıldı + teal (sistem/fiyat) */
const RENKLER: Record<OlayRenk, string> = {
  green: "#2fb36b",
  amber: "#e3a12c",
  red: "#d15a4e",
  teal: "#1e9b8a",
};

const OLAY_HAVUZU: { renk: OlayRenk; metin: string; etiket: string }[] = [
  { renk: "amber", metin: "A-7-3 opsiyonlandı", etiket: "Çankaya Vadi · Yılmaz Emlak" },
  { renk: "teal", metin: "B-12-2 fiyatı güncellendi ₺7,2M → ₺7,4M", etiket: "Çankaya Vadi · üretici" },
  { renk: "green", metin: "C Blok, Yılmaz Emlak grubuna açıldı", etiket: "Çankaya Vadi · tahsis" },
  { renk: "teal", metin: "Yeni paylaşım bağlantısı oluşturuldu", etiket: "Meram Panorama · Aksoy Gyd." },
  { renk: "red", metin: "D-4-1 satıldı", etiket: "Meram Panorama · üretici" },
  { renk: "amber", metin: "Tahsis süresi doldu: B-3-2", etiket: "Çankaya Vadi · sistem" },
  { renk: "green", metin: "A-2-4 yeniden müsait", etiket: "Çankaya Vadi · üretici" },
  { renk: "amber", metin: "C-9-1 opsiyonlandı", etiket: "Meram Panorama · Kaya Emlak" },
  { renk: "teal", metin: "A Blok fiyat listesi güncellendi", etiket: "Çankaya Vadi · üretici" },
  { renk: "red", metin: "B-6-3 satıldı", etiket: "Çankaya Vadi · Yılmaz Emlak" },
  { renk: "amber", metin: "Opsiyon süresi doldu: A-5-2", etiket: "Meram Panorama · sistem" },
  { renk: "green", metin: "Kaya Emlak havuza katıldı", etiket: "Meram Panorama · tahsis" },
];

const BASLANGIC_DAKIKA = 842; // 14:02

function saatYaz(dakika: number): string {
  const t = ((dakika % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/* reduced-motion'da da gösterilen statik başlangıç seti (6 satır) */
const BASLANGIC: Olay[] = OLAY_HAVUZU.slice(0, 6).map((o, i) => ({
  ...o,
  id: i,
  zaman: saatYaz(BASLANGIC_DAKIKA - i * 3),
}));

/* satır yaşlandıkça solar */
const OPAKLIK = [1, 0.95, 0.85, 0.72, 0.6, 0.47, 0.32];

export function AkisFeed() {
  const [olaylar, setOlaylar] = useState<Olay[]>(BASLANGIC);
  const [canli, setCanli] = useState(false);
  const [durdu, setDurdu] = useState(false);
  const duraklat = useRef(false);
  const sayac = useRef(BASLANGIC.length);
  const dakika = useRef(BASLANGIC_DAKIKA);

  useEffect(() => {
    // hareketi azalt isteği: akış çalışmaz, statik 6 satır kalır
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // hydration uyumu için canlı moda ilk boyamadan sonra geç (senkron setState yok)
    const kare = requestAnimationFrame(() => setCanli(true));
    const zamanlayici = setInterval(() => {
      if (duraklat.current) return;
      dakika.current += 1 + (sayac.current % 3);
      const kaynak = OLAY_HAVUZU[sayac.current % OLAY_HAVUZU.length];
      const yeni: Olay = { ...kaynak, id: sayac.current, zaman: saatYaz(dakika.current) };
      sayac.current += 1;
      setOlaylar((mevcut) => [yeni, ...mevcut].slice(0, 7));
    }, 2700);
    return () => {
      cancelAnimationFrame(kare);
      clearInterval(zamanlayici);
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(900px 460px at 85% -12%, rgba(30, 155, 138, 0.14), transparent 60%), radial-gradient(720px 400px at -5% 110%, rgba(47, 179, 107, 0.08), transparent 55%), linear-gradient(165deg, #10141a 0%, #0b1c2e 55%, #0e2334 100%)",
      }}
    >
      {/* ince grid dokusu (terminal hissi, abartısız) */}
      <div className="komuta-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53c8b8]">Canlı akış</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Projenizde ne olduğunu, olduğu anda görün.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            Opsiyon, satış, fiyat güncellemesi, tahsis: her hareket tek akışa düşer. Kim neyi ne zaman yaptı, saniyesiyle kayıtta.
          </p>
        </div>

        <div
          className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.4)]"
          onMouseEnter={() => {
            duraklat.current = true;
            setDurdu(true);
          }}
          onMouseLeave={() => {
            duraklat.current = false;
            setDurdu(false);
          }}
        >
          {/* canlı veri tarama çizgisi */}
          <div
            aria-hidden
            className="tarama-cizgi pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent"
          />

          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.03] px-4 py-3 sm:px-5">
            <span className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <span className={`size-1.5 rounded-full ${canli && !durdu ? "bg-green nabiz" : "bg-white/40"}`} />
              {canli ? (durdu ? "akış duraklatıldı" : "canlı hareket akışı") : "hareket akışı"}
            </span>
            <span className="rounded-md border border-white/15 bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-white/50">
              örnek akış
            </span>
          </div>

          <ul aria-label="Örnek canlı hareket akışı">
            {olaylar.map((o, i) => (
              <li
                key={o.id}
                className={`flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 last:border-b-0 sm:px-5 ${i === 0 && canli ? "olay-gir" : ""}`}
                style={{ opacity: OPAKLIK[i] ?? 0.3, transition: "opacity 0.5s ease" }}
              >
                <span className="mono w-11 flex-none text-[11px] text-white/45">{canli && i === 0 ? "şimdi" : o.zaman}</span>
                <span
                  className="size-2 flex-none rounded-full"
                  style={{ background: RENKLER[o.renk], boxShadow: `0 0 8px ${RENKLER[o.renk]}55` }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[13px] text-white/85">{o.metin}</span>
                <span className="mono hidden flex-none text-[10.5px] text-white/35 sm:inline">{o.etiket}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
