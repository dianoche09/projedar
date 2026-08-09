// Katalog proje kapak görseli: kaynak sayfanın (kaynak_url) og:image'ını çeker,
// yalnız whitelisted CDN host'larını (next.config remotePatterns) kabul eder ve
// katalog_proje.kapak_url + kapak_kaynak (atıf) olarak yazar. Rehost YOK (hotlink).
// Görsel yoksa/uygun değilse dokunmaz → sayfa temsili havuza düşer.
// Çalıştır: node scripts/katalog-kapak.mjs [--force]
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

const env = {};
if (existsSync(".env.local")) for (const s of readFileSync(".env.local", "utf8").split("\n")) { const m = s.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim(); }
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const FORCE = process.argv.includes("--force");

// next.config.ts images.remotePatterns ile senkron: yalnız bu host'lar next/image ile optimize edilir.
const IZINLI = new Map([
  ["imaj.emlakjet.com", "emlakjet.com"],
  ["files.satisofisi.com", "satisofisi.com"],
  ["satisofisi.com", "satisofisi.com"],
  ["www.satisofisi.com", "satisofisi.com"],
]);
// Junk kapak filtresi: default og, logo, site ikonu (icon-512/apple-touch), placeholder, svg.
const KOTU = /og-default|default\.|logo|placeholder|favicon|icon-\d|apple-touch|\/icon|\.svg(\?|$)/i;
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "Accept-Language": "tr-TR" };

function meta(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i");
  const m = html.match(re); if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
  const m2 = html.match(re2); return m2 ? m2[1] : null;
}

let q = sb.from("katalog_proje").select("slug, kaynak_url, kapak_url").eq("aktif", true).not("kaynak_url", "is", null);
const { data, error } = await q;
if (error) { console.error(error.message); process.exit(1); }
const hedef = FORCE ? data : data.filter((r) => !r.kapak_url);
console.log(`Toplam ${data.length}, işlenecek ${hedef.length}${FORCE ? " (force)" : ""}`);

let yazildi = 0, atlandi = 0, hata = 0;
for (const r of hedef) {
  try {
    const res = await fetch(r.kaynak_url, { headers: UA, redirect: "follow" });
    const html = await res.text();
    let og = meta(html, "og:image") || meta(html, "twitter:image");
    if (og && og.startsWith("//")) og = "https:" + og;
    if (!og || KOTU.test(og)) { atlandi++; continue; }
    let host; try { host = new URL(og).host; } catch { atlandi++; continue; }
    const kaynak = IZINLI.get(host);
    if (!kaynak) { atlandi++; continue; } // next/image optimize edemez → atla
    const { error: e2 } = await sb.from("katalog_proje").update({ kapak_url: og, kapak_kaynak: kaynak }).eq("slug", r.slug);
    if (e2) { hata++; console.warn(`  hata ${r.slug}: ${e2.message}`); } else { yazildi++; }
  } catch (e) { hata++; console.warn(`  fetch hata ${r.slug}: ${String(e).slice(0, 60)}`); }
  await new Promise((x) => setTimeout(x, 250));
}
console.log(`✓ kapak yazıldı: ${yazildi} · atlandı: ${atlandi} · hata: ${hata}`);
