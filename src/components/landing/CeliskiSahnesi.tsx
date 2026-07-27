"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAzalt } from "./useAzalt";

/**
 * CeliskiSahnesi · Mockup 02 signature moment (bozuk sistem).
 * Dört kanal (WhatsApp, Excel, PDF, telefon notu) ekranda ÇELİŞKİLİ veri
 * akışları olarak satır satır belirir: aynı daire için dört ayrı fiyat.
 * Ardından dev soru düşer: HANGİSİ GÜNCEL? Son fazda tek canlı kayıt
 * hepsini kontrol altına alır: kanallar soluklaşır, fiyatların üstü çizilir,
 * koyu "canlı kayıt" barı damgalanır. Mesaj: on kopya değil, tek canlı gerçek.
 * Görünüme girince başlar; "Yeniden oynat" ile tekrar izlenir.
 * Reduced-motion: doğrudan son kare. TÜM VERİLER ÖRNEKTİR.
 */

type Satir = { m: string; fiyat?: boolean; eski?: boolean };
type Kanal = { ad: string; kaynak: string; satirlar: Satir[] };
type Faz = "bos" | "akis" | "celiski" | "kontrol";

const KANALLAR: Kanal[] = [
  {
    ad: "WhatsApp",
    kaynak: "3 grup · 41 okunmamış",
    satirlar: [
      { m: "B-4-2 hâlâ müsait mi?" },
      { m: "B-4-2 · ₺8,9M?", fiyat: true },
      { m: "hangi liste güncel?" },
    ],
  },
  {
    ad: "Excel",
    kaynak: "fiyat_listesi_SON_v3.xlsx",
    satirlar: [
      { m: "son kayıt: 18 gün önce", eski: true },
      { m: "B-4-2 · ₺9,1M?", fiyat: true },
      { m: "SON_v2 ile çelişiyor" },
    ],
  },
  {
    ad: "PDF",
    kaynak: "A_blok_fiyat(2).pdf",
    satirlar: [
      { m: "sürüm tarihi belirsiz", eski: true },
      { m: "B-4-2 · ₺8,6M?", fiyat: true },
      { m: "kim paylaştı, bilinmiyor" },
    ],
  },
  {
    ad: "Telefon notu",
    kaynak: "ajanda sayfası",
    satirlar: [
      { m: "müşteri 9,4 dedi galiba" },
      { m: "B-4-2 · ₺9,4M?", fiyat: true },
      { m: "teyit edilecek (edilmedi)", eski: true },
    ],
  },
];

const TOPLAM = KANALLAR.length * 3; // 12 satır, kanallar arası sırayla düşer
const SATIR_ARALIK = 420;

export function CeliskiSahnesi() {
  const kok = useRef<HTMLDivElement>(null);
  const zamanlayicilar = useRef<number[]>([]);
  const azalt = useAzalt();
  const [gorunen, setGorunen] = useState(0);
  const [faz, setFaz] = useState<Faz>("bos");

  const temizle = useCallback(() => {
    zamanlayicilar.current.forEach((z) => window.clearTimeout(z));
    zamanlayicilar.current = [];
  }, []);

  /* sahneyi baştan oynatır; yalnız olay callback'lerinden çağrılır */
  const oynat = useCallback(() => {
    temizle();
    if (azalt) {
      setGorunen(TOPLAM);
      setFaz("kontrol");
      return;
    }
    setGorunen(0);
    setFaz("akis");
    for (let n = 1; n <= TOPLAM; n++) {
      zamanlayicilar.current.push(window.setTimeout(() => setGorunen(n), n * SATIR_ARALIK));
    }
    zamanlayicilar.current.push(window.setTimeout(() => setFaz("celiski"), TOPLAM * SATIR_ARALIK + 700));
    zamanlayicilar.current.push(window.setTimeout(() => setFaz("kontrol"), TOPLAM * SATIR_ARALIK + 2500));
  }, [azalt, temizle]);

  /* görünüme girince sahne bir kez başlar */
  useEffect(() => {
    const el = kok.current;
    if (!el) return;
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          gozlemci.disconnect();
          oynat();
        }
      },
      { threshold: 0.25 },
    );
    gozlemci.observe(el);
    return () => {
      gozlemci.disconnect();
      temizle();
    };
  }, [oynat, temizle]);

  const kontrolde = faz === "kontrol";

  return (
    <div ref={kok}>
      {/* dört çelişkili kanal */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--m2-kagit-cizgi)] bg-[var(--m2-kagit-cizgi)] lg:grid-cols-4">
        {KANALLAR.map((kanal, k) => (
          <div key={kanal.ad} className={`m2-kanal min-w-0 bg-white p-4 ${kontrolde ? "m2-soluk" : ""}`}>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--m2-kagit-ink)]">
              {kanal.ad}
            </p>
            <p className="mt-0.5 truncate font-mono text-[9.5px] text-[var(--m2-kagit-soft)]">{kanal.kaynak}</p>
            <ul className="mt-3 space-y-2">
              {kanal.satirlar.map((satir, s) => {
                const sira = s * KANALLAR.length + k;
                const acik = sira < gorunen;
                return (
                  <li
                    key={satir.m}
                    className={`m2-akis-satir font-mono text-[11.5px] leading-snug ${acik ? "m2-gorunur" : ""} ${
                      satir.fiyat
                        ? `font-bold ${faz === "celiski" || kontrolde ? "text-red" : "text-[var(--m2-kagit-ink)]"} ${kontrolde ? "line-through decoration-[0.09em]" : ""}`
                        : satir.eski
                          ? "text-red/80"
                          : "text-[var(--m2-kagit-soft)]"
                    }`}
                  >
                    {satir.m}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* sonuç sahnesi: soru -> kontrol (yükseklik ayrılmış, sayfa zıplamaz) */}
      <div className="mt-10 min-h-[220px] sm:min-h-[200px]">
        {faz === "celiski" || kontrolde ? (
          <p
            className={`m2-dev m2-kelime text-[clamp(1.9rem,6.4vw,4.6rem)] transition-opacity duration-500 ${
              kontrolde ? "opacity-45" : ""
            }`}
            style={{ color: "#d15a4e" }}
          >
            Hangisi güncel?
          </p>
        ) : null}

        {kontrolde ? (
          <div className="m2-damga mt-5">
            <p className="m2-dev text-[clamp(2.1rem,7vw,5rem)] text-[var(--m2-kagit-ink)]">
              Tek canlı <span className="text-[#1f7d4c]">gerçek.</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
