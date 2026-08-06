// Projedar — katalog import: dış kaynaklı OLGUSAL proje verisini katalog_proje'ye yükler.
// Kaynak: scripts/katalog-data/*.json (yalnız telif-dışı alanlar; fiyat/görsel/prose YOK).
// Çalıştır: node scripts/katalog-import.mjs
// ÖN KOŞUL: db/2026-08-06_katalog.sql browser'dan uygulanmış olmalı (MCP read-only).
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERI_DIR = join(KOK, "scripts", "katalog-data");

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

// src/lib/seo/slug.ts ile birebir (Türkçe-duyarlı, idempotent).
function slugify(s) {
  return s
    .replace(/İ/g, "i").replace(/I/g, "i").toLowerCase()
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function projeSlug(ad, ilce) {
  const taban = slugify(ad);
  const bolge = ilce ? slugify(ilce) : "";
  return bolge && !taban.endsWith(bolge) ? `${taban}-${bolge}` : taban;
}

const DURUMLAR = new Set(["lansman", "insaat", "teslim"]);
const temiz = (v) => (typeof v === "string" ? v.trim() || null : v ?? null);
const sayi = (v) => (Number.isFinite(v) ? v : null);

if (!existsSync(VERI_DIR)) { console.error(`HATA: ${VERI_DIR} yok.`); process.exit(1); }
const dosyalar = readdirSync(VERI_DIR).filter((f) => f.endsWith(".json"));
if (!dosyalar.length) { console.error("HATA: katalog-data'da JSON yok."); process.exit(1); }

// Yükle + normalize + slug-bazlı birleştir (partiler-arası mükerrer için).
const bySlug = new Map();
let ham = 0;
for (const f of dosyalar) {
  const arr = JSON.parse(readFileSync(join(VERI_DIR, f), "utf8"));
  for (const r of arr) {
    ham++;
    const ad = temiz(r.ad), il = temiz(r.il), ilce = temiz(r.ilce);
    if (!ad || !il || !ilce) { console.warn(`  atla (ad/il/ilçe eksik): ${ad || "?"}`); continue; }
    const slug = projeSlug(ad, ilce);
    const yeni = {
      slug, ad, il, ilce,
      mahalle: temiz(r.mahalle),
      gelistirici: temiz(r.gelistirici),
      oda_tipleri: Array.isArray(r.oda_tipleri) ? r.oda_tipleri.map(temiz).filter(Boolean) : [],
      m2_min: sayi(r.m2_min),
      m2_max: sayi(r.m2_max),
      daire_sayisi: sayi(r.daire_sayisi),
      durum: DURUMLAR.has(r.durum) ? r.durum : null,
      teslim: temiz(r.teslim),
      proje_web: temiz(r.proje_web),
      kaynak_url: temiz(r.kaynak_url),
    };
    const eski = bySlug.get(slug);
    if (eski) {
      // Alan-bazlı birleştir: mevcut null ise doldur; oda_tipleri en zengini kalsın.
      for (const k of Object.keys(yeni)) {
        if (k === "oda_tipleri") { if (yeni.oda_tipleri.length > eski.oda_tipleri.length) eski.oda_tipleri = yeni.oda_tipleri; continue; }
        if (eski[k] == null && yeni[k] != null) eski[k] = yeni[k];
      }
    } else {
      bySlug.set(slug, yeni);
    }
  }
}

const kayitlar = [...bySlug.values()].map((r) => ({ ...r, updated_at: new Date().toISOString() }));

// İçerik zenginliği heuristiği (kaç sayfa canlı olabilir; gerçek eşik resolver'da).
function zenginlik(r) {
  let s = 2; // il+ilçe (zorunlu)
  if (r.mahalle) s += 1;
  if (r.gelistirici) s += 1;
  if (r.oda_tipleri.length >= 3) s += 2; else if (r.oda_tipleri.length) s += 1;
  if (r.m2_min || r.m2_max) s += 1;
  if (r.daire_sayisi) s += 1;
  if (r.teslim) s += 1;
  if (r.proje_web) s += 1;
  return s;
}
const zengin = kayitlar.filter((r) => zenginlik(r) >= 5).length;
console.log(`Ham kayıt: ${ham} · benzersiz slug: ${kayitlar.length} · içerik-zengin (≥5, ~canlı sayfa): ${zengin}`);

// Upsert. aktif + eslesen_proje_id payload'da YOK → mevcut satırlarda korunur,
// yeni satırlar default alır (aktif=true, eslesen=null). Admin bunları elle yönetir.
const { error } = await sb.from("katalog_proje").upsert(kayitlar, { onConflict: "slug" });
if (error) {
  console.error(`UPSERT HATASI: ${error.message}`);
  if (/katalog_proje/i.test(error.message) && /does not exist|schema cache/i.test(error.message))
    console.error("→ Önce db/2026-08-06_katalog.sql'i Supabase Dashboard SQL Editor'de çalıştır.");
  process.exit(1);
}
console.log(`✓ katalog_proje upsert tamam (${kayitlar.length} kayıt).`);
