/**
 * N1 — bayat /havuz route linki hiçbir yerde kalmasın (route /danisman'a taşındı; /havuz → 404).
 * src/ ve db/ altında string-literal "/havuz" (route referansı) yasak. Yorumdaki tarihçe metni
 * değil, YALNIZ tırnak içindeki route literal'i yakalar. Çalıştır:
 *   npx tsx tests/domain/no-dead-links.test.ts
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { dogru, ozet } from "./_assert.ts";

function* dosyalar(dir: string): Generator<string> {
  for (const ad of readdirSync(dir)) {
    if (ad === "node_modules" || ad === ".next") continue;
    const yol = join(dir, ad);
    if (statSync(yol).isDirectory()) yield* dosyalar(yol);
    else if (/\.(ts|tsx|sql)$/.test(ad)) yield yol;
  }
}

const bulgular: string[] = [];
for (const kok of ["src", "db"]) {
  for (const dosya of dosyalar(kok)) {
    const eslesme = readFileSync(dosya, "utf8").match(/["'`]\/havuz(?:\/[^"'`]*)?["'`]/g);
    if (eslesme) bulgular.push(`${dosya}: ${[...new Set(eslesme)].join(", ")}`);
  }
}

dogru(bulgular.length === 0, `Bayat /havuz route linki yok${bulgular.length ? " — BULUNDU: " + bulgular.join(" | ") : ""}`);
ozet("N1 no-dead-links");
