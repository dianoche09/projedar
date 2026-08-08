// Projedar — katalog zenginleştirme: enrich/<slug>.json içeriğini katalog_proje.icerik'e yazar
// + temel alanları (mahalle/daire_sayisi/m2/oda/durum/teslim) enrich verisiyle senkronlar.
// Çalıştır: node scripts/katalog-enrich.mjs [slug]   (slug verilmezse tüm enrich/*.json)
// ÖN KOŞUL: katalog_proje.icerik jsonb kolonu (db) mevcut olmalı.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(KOK, "scripts", "katalog-data", "enrich");

function envOku() {
  const yol = join(KOK, ".env.local");
  if (!existsSync(yol)) return {};
  const o = {};
  for (const s of readFileSync(yol, "utf8").split("\n")) {
    const m = s.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return o;
}
const env = { ...envOku(), ...process.env };
const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("HATA: SUPABASE URL/SERVICE_ROLE yok (.env.local)."); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

const DURUMLAR = new Set(["lansman", "insaat", "teslim"]);
const tam = (v) => (typeof v === "string" ? v.trim() || null : v ?? null);
const sayi = (v) => (Number.isFinite(v) ? Math.round(v) : null);

const arg = process.argv[2];
const dosyalar = existsSync(DIR)
  ? readdirSync(DIR).filter((f) => f.endsWith(".json") && (!arg || f === `${arg}.json`))
  : [];
if (!dosyalar.length) { console.error(`HATA: ${DIR} altında JSON yok (arg: ${arg ?? "hepsi"}).`); process.exit(1); }

let ok = 0;
for (const f of dosyalar) {
  const slug = f.replace(/\.json$/, "");
  const o = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  // Temel alanları enrich verisiyle senkronla (yalnız dolu olanları).
  const guncel = { icerik: o, updated_at: new Date().toISOString() };
  if (tam(o.mahalle)) guncel.mahalle = tam(o.mahalle);
  if (tam(o.gelistirici)) guncel.gelistirici = tam(o.gelistirici);
  if (Number.isFinite(o.daire_sayisi)) guncel.daire_sayisi = o.daire_sayisi;
  if (sayi(o.m2_min) != null) guncel.m2_min = sayi(o.m2_min);
  if (sayi(o.m2_max) != null) guncel.m2_max = sayi(o.m2_max);
  if (Array.isArray(o.oda_tipleri) && o.oda_tipleri.length) guncel.oda_tipleri = o.oda_tipleri;
  if (DURUMLAR.has(o.durum)) guncel.durum = o.durum;
  if (tam(o.teslim)) guncel.teslim = tam(o.teslim);

  const { error, count } = await sb.from("katalog_proje").update(guncel, { count: "exact" }).eq("slug", slug);
  if (error) { console.error(`✗ ${slug}: ${error.message}`); continue; }
  if (!count) { console.warn(`⚠ ${slug}: eşleşen katalog_proje satırı yok (önce import gerekir).`); continue; }
  console.log(`✓ ${slug} zenginleştirildi (icerik + temel alanlar).`);
  ok++;
}
console.log(`Bitti: ${ok}/${dosyalar.length} kayıt.`);
