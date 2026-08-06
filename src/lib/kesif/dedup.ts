import type { AdayHam } from "./tipler";

/**
 * Firma adı normalize — dedup anahtarı (DB uniq index (firma_adi_norm, il) ile uyumlu).
 * Türkçe küçük harf + hukuki ek/noktalama sadeleştirme (a.ş./ltd./şti. vb.).
 */
export function normalize(firma: string): string {
  return firma
    .toLocaleLowerCase("tr-TR")
    .replace(/[.,]/g, " ")
    .replace(/\b(a ?ş|ltd|şti|san|tic|inş|inşaat|gayrimenkul|emlak)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Aynı normalize firma + il ilk-gelen kazanır (kaynak içi dedup; DB katmanı ikinci kalkan). */
export function benzersizle(adaylar: AdayHam[]): AdayHam[] {
  const gorulen = new Set<string>();
  const sonuc: AdayHam[] = [];
  for (const a of adaylar) {
    const anahtar = `${normalize(a.firma_adi)}|${(a.il ?? "").toLocaleLowerCase("tr-TR").trim()}`;
    if (gorulen.has(anahtar)) continue;
    gorulen.add(anahtar);
    sonuc.push(a);
  }
  return sonuc;
}
