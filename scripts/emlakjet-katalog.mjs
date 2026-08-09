// Projedar — köprü: emlakjet envanteri CSV → katalog-data JSON (import'un yediği format).
// YALNIZ olgusal alanlar (ad, il, ilçe, geliştirici, oda, m², daire sayısı, teslim/durum,
// kaynak URL). FİYAT/PROSE/GÖRSEL YOK (telif). Ardından katalog-import.mjs bunu okur.
//
// Kapsam = içerik üreteceğimiz set olmalı (import IndexNow ping'ler → boş sayfa ping'lenmesin).
//
// Kullanım:
//   node scripts/emlakjet-katalog.mjs --kuru                    # plan: kaç proje seçilir
//   node scripts/emlakjet-katalog.mjs --limit 50                # en büyük 50 (konut sırası)
//   node scripts/emlakjet-katalog.mjs --iller İstanbul,Ankara,İzmir --min-konut 300 --limit 50

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = join(KOK, "scripts", "emlakjet-envanteri", "cikti", "projeler.csv");
const CIKTI = join(KOK, "scripts", "katalog-data", "emlakjet-buyuk.json");

const AYLAR = { ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5, haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9, ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12 };
const SIMDI = { yil: 2026, ay: 8 }; // referans; teslim geçmiş→teslim, gelecek→insaat

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan;
}

// Basit CSV parse (tırnak-farkında; alanlarda virgül olabilir).
function csvOku(metin) {
  const satirlar = [];
  let alan = "", satir = [], tirnak = false;
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (tirnak) {
      if (c === '"' && metin[i + 1] === '"') { alan += '"'; i++; }
      else if (c === '"') tirnak = false;
      else alan += c;
    } else if (c === '"') tirnak = true;
    else if (c === ",") { satir.push(alan); alan = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && metin[i + 1] === "\n") i++;
      if (alan !== "" || satir.length) { satir.push(alan); satirlar.push(satir); satir = []; alan = ""; }
    } else alan += c;
  }
  if (alan !== "" || satir.length) { satir.push(alan); satirlar.push(satir); }
  const baslik = satirlar.shift();
  return satirlar.map((s) => Object.fromEntries(baslik.map((b, i) => [b, s[i] ?? ""])));
}

function odaParse(s) {
  return s.split(",").map((x) => x.trim()).filter((x) => /^\d\+\d|^\d$|Oda/.test(x) && !/Oda Tipi/.test(x));
}
function m2Parse(s) {
  const n = (s.match(/\d+/g) ?? []).map(Number);
  return { min: n[0] ?? null, max: n[n.length - 1] ?? null };
}
function durumTespit(teslim) {
  if (!teslim) return null;
  const m = teslim.toLowerCase().match(/([a-zçğıöşü]+)\s*(\d{4})/);
  if (!m) return null;
  const ay = AYLAR[m[1]] ?? 6, yil = Number(m[2]);
  const gelecek = yil > SIMDI.yil || (yil === SIMDI.yil && ay >= SIMDI.ay);
  return gelecek ? "insaat" : "teslim";
}

function main() {
  if (!existsSync(CSV)) { console.error(`HATA: ${CSV} yok. Önce emlakjet_envanteri.py koş.`); process.exit(1); }
  const rows = csvOku(readFileSync(CSV, "utf8"));

  const iller = new Set(arg("--iller", "İstanbul,Ankara,İzmir").split(",").map((s) => s.trim()));
  const minKonut = parseInt(arg("--min-konut", "0"), 10);
  const limit = parseInt(arg("--limit", "50"), 10);
  const kuru = process.argv.includes("--kuru");

  const konut = (r) => (/^\d+$/.test(r.konut_sayisi) ? parseInt(r.konut_sayisi, 10) : 0);
  let secilen = rows
    .filter((r) => iller.has(r.il) && konut(r) >= minKonut && r.ad && r.il && r.ilce)
    .sort((a, b) => konut(b) - konut(a))
    .slice(0, limit);

  const cikti = secilen.map((r) => {
    const m2 = m2Parse(r.alan);
    return {
      ad: r.ad, il: r.il, ilce: r.ilce,
      gelistirici: r.muteahhit || null,
      oda_tipleri: odaParse(r.oda_tipi),
      m2_min: m2.min, m2_max: m2.max,
      daire_sayisi: konut(r) || null,
      durum: durumTespit(r.teslim),
      teslim: r.teslim || null,
      kaynak_url: r.url || null,
    };
  });

  if (kuru) {
    console.log(`[kuru] iller: ${[...iller].join(", ")} | min-konut: ${minKonut} | limit: ${limit}`);
    console.log(`[kuru] seçilen: ${cikti.length} proje`);
    cikti.slice(0, 12).forEach((r) => console.log(`   ${String(r.daire_sayisi).padStart(5)} konut | ${r.il}/${r.ilce} | ${r.gelistirici ?? "?"} | ${r.ad}`));
    if (cikti.length > 12) console.log(`   ... +${cikti.length - 12} daha`);
    console.log(`[kuru] yazılacak: ${CIKTI} (yazılmadı)`);
    return;
  }

  writeFileSync(CIKTI, JSON.stringify(cikti, null, 2) + "\n", "utf8");
  console.log(`✓ ${cikti.length} proje → ${CIKTI}`);
  console.log(`  Sıradaki: node scripts/katalog-import.mjs   (katalog_proje'ye yaz)`);
}

main();
