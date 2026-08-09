// Görselsiz katalog projeleri için SERP (Google Images) ile GERÇEK proje kapağı bul + indir.
// Yalnız kapak_url NULL olanlar. Ad+konum ile arar; emlak portalı / proje-sitesi kaynaklı,
// logo/harita/ikon olmayan gerçek görseli seçer, public/gorseller/katalog/<slug>.jpg'ye indirir,
// kapak_url + kapak_kaynak yazar. Rehost (bizim storage) → next/image lokal optimize eder.
// Çalıştır: node scripts/katalog-kapak-serp.mjs [--limit N]
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";

const env = {};
if (existsSync(".env.local")) for (const s of readFileSync(".env.local", "utf8").split("\n")) { const m = s.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim(); }
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const KEY = env.SERPAPI_API_KEY;
if (!KEY) { console.error("SERPAPI_API_KEY yok"); process.exit(1); }
const LIMIT = (() => { const i = process.argv.indexOf("--limit"); return i > -1 ? Number(process.argv[i + 1]) : 999; })();

const DIR = "public/gorseller/katalog";
mkdirSync(DIR, { recursive: true });
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept-Language": "tr-TR" };

// Gerçek proje görseli olma ihtimali yüksek kaynaklar (skor +).
const PORTAL = ["emlakjet", "satisofisi", "projedefirsat", "guncelprojebilgileri", "sahibinden", "hepsiemlak", "zingat", "konutprojeleri", "yeniemlak", "yeniprojeler", "emlakdream", "projehatti", "enyenikonutprojeleri", "emlakkonut", "hurriyetemlak", "endeksa"];
// Kesin reddedilen host/pattern (logo, harita, sosyal, stok foto vs).
const BLOCK = /google\.|gstatic|ggpht|youtube|ytimg|wikipedia|wikimedia|facebook|fbcdn|instagram|licdn|twimg|pinimg|maps\.|mapbox|openstreetmap|logo|favicon|icon-\d|apple-touch|sprite|placeholder|\.svg(\?|$)/i;

function tokens(s) { return (s || "").toLowerCase().replace(/[^a-z0-9çğıöşü\s]/gi, " ").split(/\s+/).filter((w) => w.length > 2); }

async function serpImages(q) {
  const u = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(q)}&hl=tr&gl=tr&num=20&api_key=${KEY}`;
  const res = await fetch(u);
  if (!res.ok) return [];
  const j = await res.json();
  return Array.isArray(j.images_results) ? j.images_results : [];
}

async function indir(url, dest) {
  const ac = AbortSignal.timeout(15000);
  const res = await fetch(url, { headers: UA, redirect: "follow", signal: ac });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok || !ct.startsWith("image/")) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) return null; // logo/ikon ele
  writeFileSync(dest, buf);
  return { ct, boyut: buf.length };
}

const { data } = await sb.from("katalog_proje").select("slug, ad, il, ilce").eq("aktif", true).is("kapak_url", null);
const hedef = data.slice(0, LIMIT);
console.log(`Görselsiz ${data.length}, denenecek ${hedef.length}`);

let ok = 0, yok = 0;
for (const r of hedef) {
  const nameTok = tokens(r.ad);
  const q = `${r.ad} ${r.ilce ?? ""} ${r.il ?? ""} konut projesi`.trim();
  let secildi = null;
  try {
    const imgs = await serpImages(q);
    const skorlu = imgs.map((im) => {
      const orig = im.original || im.thumbnail || "";
      const src = (im.source || "") + " " + (im.link || "") + " " + orig;
      let host = ""; try { host = new URL(orig).host; } catch { return null; }
      if (BLOCK.test(orig) || BLOCK.test(src)) return null;
      let skor = 0;
      const srcl = src.toLowerCase();
      if (PORTAL.some((p) => srcl.includes(p))) skor += 3;
      const t = tokens((im.title || "") + " " + (im.source || ""));
      const eslesme = nameTok.filter((w) => t.includes(w)).length;
      skor += eslesme;
      if ((im.original_width && im.original_width >= 600) || (im.original_height && im.original_height >= 400)) skor += 1;
      return { orig, host, skor };
    }).filter(Boolean).sort((a, b) => b.skor - a.skor);

    for (const c of skorlu.slice(0, 4)) {
      try {
        const dosya = `${DIR}/${r.slug}.jpg`;
        const res = await indir(c.orig, dosya);
        if (res) { secildi = c; break; }
      } catch { /* sonraki aday */ }
    }
  } catch (e) { /* proje atlanır */ }

  if (secildi) {
    const kaynak = PORTAL.find((p) => (secildi.host || "").includes(p)) ? secildi.host.replace(/^www\./, "") : secildi.host.replace(/^www\./, "");
    await sb.from("katalog_proje").update({ kapak_url: `/gorseller/katalog/${r.slug}.jpg`, kapak_kaynak: kaynak }).eq("slug", r.slug);
    ok++;
    console.log(`  ✓ ${r.slug} ← ${secildi.host} (skor ${secildi.skor})`);
  } else { yok++; console.log(`  · ${r.slug} bulunamadı`); }
  await new Promise((x) => setTimeout(x, 600));
}
console.log(`\nSonuç: indirilen ${ok}, bulunamadı ${yok}`);
