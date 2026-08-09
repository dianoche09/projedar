// Projedar — katalog içerik BATCH: katalog_proje'de İÇERİĞİ BOŞ satırlar için sırayla
// katalog-uret.mjs (SerpAPI+Claude) çalıştırır. Kaynak = DB (sabit JSON değil), böylece
// hangi import'tan gelmiş olursa olsun tüm projeler tek tip işlenir. enrich/<slug>.json
// varsa atlar (resume). Bitince `node scripts/katalog-enrich.mjs` ile DB'ye basılır.
//
// KREDİ HARCAR: her proje ~5 SERP + 1 Claude. --limit tavan, --kuru önce planla.
//
// Kullanım:
//   node scripts/katalog-batch.mjs --kuru                       # DB durumu + plan + kredi
//   node scripts/katalog-batch.mjs --limit 10                   # en büyük 10 (daire sırası)
//   node scripts/katalog-batch.mjs --iller İstanbul,Ankara,İzmir --min-konut 300 --limit 20

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENRICH_DIR = join(KOK, "scripts", "katalog-data", "enrich");
const URET = join(KOK, "scripts", "katalog-uret.mjs");

function envOku() {
  const yol = join(KOK, ".env.local");
  const o = {};
  if (existsSync(yol)) for (const s of readFileSync(yol, "utf8").split("\n")) {
    const m = s.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return { ...o, ...process.env };
}
const env = envOku();
const URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("HATA: SUPABASE URL/SERVICE_ROLE yok (.env.local)."); process.exit(1); }
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

function arg(ad, varsayilan) {
  const i = process.argv.indexOf(ad);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan;
}
const uyu = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const limit = parseInt(arg("--limit", "10"), 10);
  const gecikme = parseFloat(arg("--gecikme", "2"));
  const araSayisi = arg("--ara", "5");
  const minKonut = parseInt(arg("--min-konut", "0"), 10);
  const iller = arg("--iller", "").trim() ? arg("--iller", "").split(",").map((s) => s.trim()) : null;
  const kuru = process.argv.includes("--kuru");

  // İçeriği boş (icerik null) satırlar, daire sayısına göre büyükten küçüğe.
  let q = sb.from("katalog_proje").select("slug, ad, il, ilce, daire_sayisi, icerik").is("icerik", null);
  if (iller) q = q.in("il", iller);
  if (minKonut) q = q.gte("daire_sayisi", minKonut);
  const { data, error } = await q.order("daire_sayisi", { ascending: false, nullsFirst: false }).limit(limit);
  if (error) { console.error(`DB hatası: ${error.message}`); process.exit(1); }

  const isler = (data ?? []).filter((r) => r.slug);
  const yapilacak = isler.filter((p) => !existsSync(join(ENRICH_DIR, `${p.slug}.json`)));
  const atlanan = isler.length - yapilacak.length;

  if (kuru) {
    const { count: toplam } = await sb.from("katalog_proje").select("*", { count: "exact", head: true });
    const { count: bos } = await sb.from("katalog_proje").select("*", { count: "exact", head: true }).is("icerik", null);
    console.log(`[kuru] katalog_proje: ${toplam ?? "?"} satır, içeriği boş: ${bos ?? "?"}`);
    console.log(`[kuru] filtre: iller=${iller ? iller.join("/") : "hepsi"} min-konut=${minKonut} limit=${limit}`);
    console.log(`[kuru] bu partide: ${yapilacak.length} üretilecek (${atlanan} enrich JSON zaten var)`);
    console.log(`[kuru] tahmini kredi: ~${yapilacak.length * Number(araSayisi)} SERP + ${yapilacak.length} Claude`);
    yapilacak.slice(0, 15).forEach((p) => console.log(`   ${String(p.daire_sayisi ?? "?").padStart(5)} | ${p.slug}  (${p.ad})`));
    if (yapilacak.length > 15) console.log(`   ... +${yapilacak.length - 15} daha`);
    return;
  }

  console.log(`Batch: ${yapilacak.length} proje üretilecek (${atlanan} atlandı), gecikme ${gecikme}sn.`);
  let ok = 0, hata = 0;
  for (let i = 0; i < yapilacak.length; i++) {
    const p = yapilacak[i];
    process.stdout.write(`[${i + 1}/${yapilacak.length}] ${p.slug} ... `);
    try {
      execFileSync("node", [URET, p.slug, "--ara", String(araSayisi)], { stdio: ["ignore", "ignore", "pipe"] });
      console.log("✓");
      ok++;
    } catch (e) {
      console.log(`✗ ${String(e.stderr || e.message).split("\n")[0].slice(0, 120)}`);
      hata++;
    }
    if (i < yapilacak.length - 1) await uyu(gecikme * 1000);
  }
  console.log(`\nBitti: ${ok} üretildi, ${hata} hata, ${atlanan} atlandı.`);
  console.log(`Sıradaki: node scripts/katalog-enrich.mjs   (tüm enrich JSON'ları DB'ye bas)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
