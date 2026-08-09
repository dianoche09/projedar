import benchmark from "@/data/bolge-benchmark.json";

/**
 * Bölge fiyat benchmark'ı — emlakjet proje envanterinden türetilmiş il/ilçe
 * ₺/m² medyanı. Dış (rakip) veridir; yaklaşıktır, satış değil liste fiyatından
 * hesaplanır. Yalnız müteahhide iç fiyatlama çıpası olarak gösterilir (DEĞİŞMEZ #2:
 * Projedar fiyatını değiştirmez, tek doğru kaynak birim tablosudur).
 *
 * Veri: scripts/emlakjet-envanteri/benchmark.py --json ile üretilir.
 */

type Kayit = { m2: number; proje: number };
type Benchmark = {
  kaynak: string;
  olcu: string;
  not: string;
  proje_toplam: number;
  min_proje: number;
  il: Record<string, Kayit>;
  ilce: Record<string, Kayit>;
};

const B = benchmark as Benchmark;

export type BolgeMedyan = {
  m2: number;
  proje: number;
  seviye: "ilce" | "il";
  etiket: string;
};

/** İlçe-öncelikli, il-fallback ₺/m² medyanı. Bulunamazsa null. */
export function bolgeMedyani(il?: string | null, ilce?: string | null): BolgeMedyan | null {
  if (il && ilce) {
    const k = B.ilce[`${il}/${ilce}`];
    if (k) return { m2: k.m2, proje: k.proje, seviye: "ilce", etiket: `${ilce} medyanı` };
  }
  if (il) {
    const k = B.il[il];
    if (k) return { m2: k.m2, proje: k.proje, seviye: "il", etiket: `${il} medyanı` };
  }
  return null;
}

/**
 * Birimin kendi ₺/m²'sini bölge medyanıyla kıyasla.
 * Dönen `pct`: birim medyanın yüzde kaç üstünde(+)/altında(-).
 */
export function benchmarkKiyas(
  listeFiyati: number | null,
  m2: number | null,
  bolge: BolgeMedyan | null,
): { birimM2: number; pct: number } | null {
  if (!listeFiyati || !m2 || m2 <= 0 || !bolge || bolge.m2 <= 0) return null;
  const birimM2 = listeFiyati / m2;
  const pct = Math.round(((birimM2 - bolge.m2) / bolge.m2) * 100);
  return { birimM2: Math.round(birimM2), pct };
}

export const BENCHMARK_META = { kaynak: B.kaynak, projeToplam: B.proje_toplam };
