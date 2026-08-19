/**
 * Minimal test koşucusu — repo'nun mevcut tsx-script deseni (framework yok, FAIL'de exit(1)).
 * Her test dosyası bunu import eder, assert'leri çalıştırır, sonda ozet() çağırır.
 * Sayaçlar süreç-başına (her tsx çağrısı ayrı süreç) → dosyalar arası karışmaz.
 */
let gecti = 0;
let kaldi = 0;
const hatalar: string[] = [];

export function esit<T>(bulunan: T, beklenen: T, ad: string): void {
  if (Object.is(bulunan, beklenen)) {
    gecti++;
    return;
  }
  kaldi++;
  hatalar.push(`  ✗ ${ad}: beklenen ${JSON.stringify(beklenen)}, bulunan ${JSON.stringify(bulunan)}`);
}

export function dogru(kosul: boolean, ad: string): void {
  esit(kosul === true, true, ad);
}

/** Sonuç özeti; en az bir assert kaldıysa exit(1) → `verify`/CI push'u engeller. */
export function ozet(baslik: string): void {
  if (kaldi > 0) {
    console.error(`\n${baslik}: ${gecti} geçti, ${kaldi} KALDI`);
    for (const h of hatalar) console.error(h);
    process.exit(1);
  }
  console.log(`${baslik}: ${gecti} test geçti ✓`);
}
