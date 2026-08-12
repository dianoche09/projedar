// KolaySEO A/B benchmark — SEO mutation suite (fail-closed, literal replace, HIDDEN ground-truth).
//
// Amaç: A/B'de ceiling-effect'i yenmek. Her clone'a AYNI 10 bilinen SEO hatasi enjekte edilir →
// matematiksel ground-truth. GROUND-TRUTH GIZLI: enjekte edilen kod TAMAMEN DOGAL gorunur
// (MUT/yanlis/broken gibi hicbir marker yok). Cozum yalniz ground-truth.json'da bilinir; bozuk
// kod kendini ele vermez — aksi halde agent KolaySEO'ya ihtiyac duymadan "test hatasi" yakalar.
//
// Fail-closed: bir anchor beklenen sayida bulunmazsa DURUR. Ayrica uygulama sonrasi src'de
// kontaminasyon marker'i (MUT|yanlis|yok-sitemap|__test|ground-truth) kalirsa DURUR.
//
// Kullanim: node mutations.mjs <cloneDir>
//   -> clone src dosyalarini yerinde degistirir; ground-truth JSON'u STDOUT'a basar.
//   exit 1 = fail-closed (anchor/kontaminasyon), exit 2 = kullanim.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const clone = process.argv[2];
if (!clone) { console.error("usage: node mutations.mjs <cloneDir>"); process.exit(2); }

// find = dosyadaki BIREBIR metin. replace = DOGAL gorunecek bozuk kod (marker YOK).
const MUT = [
  { id: "M1", surface: "index/noindex", sev: "high", file: "src/app/konut-projeleri/[[...dilim]]/page.tsx",
    find: 'alternates: { canonical: `${SITE}${yol}` },',
    replace: 'alternates: { canonical: `${SITE}${yol}` },\n    robots: { index: false, follow: false },',
    expect: "/konut-projeleri il/ilçe sayfaları noindex (money page)" },

  { id: "M2", surface: "canonical", sev: "high", file: "src/app/proje/[slug]/page.tsx",
    find: 'canonical: `/proje/${slug}`',
    replace: 'canonical: `/konut-projeleri`',
    expect: "/proje/[slug] canonical başka sayfaya (cross-URL) işaret ediyor" },

  { id: "M3", surface: "public/private leak", sev: "high", file: "src/app/sitemap.ts",
    find: 'const statik: MetadataRoute.Sitemap = [',
    replace: 'const statik: MetadataRoute.Sitemap = [\n    { url: `${SITE}/uretici/stok`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },',
    expect: "sitemap'te private /uretici/stok URL'i" },

  { id: "M4", surface: "robots/noindex çakışması", sev: "high", file: "src/app/robots.ts",
    find: 'const gizli = ["/havuz"',
    replace: 'const gizli = ["/p/", "/havuz"',
    expect: "/p/ robots-disallow (noindex ile çelişki — Google noindex'i göremez)" },

  { id: "M5", surface: "duplicate title", sev: "medium", file: "src/app/emlakci/page.tsx",
    find: `title: "Emlakçılar için Projedar: Ücretsiz | Komisyonun %100'ü senin",`,
    replace: `title: "Müteahhit için Tahsisli Canlı Proje Satış Ağı | Projedar",`,
    expect: "/emlakci title'ı /muteahhit ile aynı (duplicate title)" },

  { id: "M6", surface: "programmatic derinlik", sev: "medium", file: "src/app/konut-projeleri/[[...dilim]]/page.tsx",
    find: 'if (d.length > 2) notFound();',
    replace: 'if (d.length > 3) notFound();',
    expect: "derinlik guard gevşetildi (3-segment thin/keyfi URL indexlenebilir)" },

  { id: "M7", surface: "thin-content", sev: "medium", file: "src/app/sitemap.ts",
    find: ') >= ICERIK_ESIGI,', all: true,
    replace: ') >= 0,',
    expect: "sitemap thin-content eşiği 0 (eşik-altı thin projeler sitemap'te)" },

  { id: "M8", surface: "soft-404 / thin", sev: "high", file: "src/app/proje/[slug]/page.tsx",
    find: '< ICERIK_ESIGI) notFound();',
    replace: '< 0) notFound();',
    expect: "/proje/[slug] thin guard etkisiz (thin proje 404 yerine 200)" },

  { id: "M9", surface: "canonical", sev: "medium", file: "src/app/page.tsx",
    find: '  alternates: { canonical: "/" },\n',
    replace: '',
    expect: "anasayfa self-canonical kaldırıldı" },

  { id: "M10", surface: "sitemap/robots", sev: "medium", file: "src/app/robots.ts",
    find: 'sitemap: `${SITE}/sitemap.xml`',
    replace: 'sitemap: `${SITE}/sitemap-index.xml`',
    expect: "robots sitemap pointer var olmayan /sitemap-index.xml'e işaret ediyor" },
];

const gt = [];
for (const m of MUT) {
  const fp = path.join(clone, m.file);
  let s;
  try { s = fs.readFileSync(fp, "utf8"); }
  catch { console.error(`FAIL-CLOSED ${m.id}: dosya yok — ${m.file}`); process.exit(1); }
  const count = s.split(m.find).length - 1;
  if (m.all ? count < 1 : count !== 1) {
    console.error(`FAIL-CLOSED ${m.id}: anchor sayısı ${count} (beklenen ${m.all ? ">=1" : "1"}) — ${m.file}`);
    console.error(`  anchor: ${JSON.stringify(m.find)}`);
    process.exit(1);
  }
  s = m.all ? s.split(m.find).join(m.replace) : s.replace(m.find, m.replace);
  fs.writeFileSync(fp, s);
  gt.push({ id: m.id, surface: m.surface, sev: m.sev, file: m.file, expect: m.expect });
}

// Kontaminasyon taramasi: src'de test-ipucu marker'i KALMAMALI (hidden ground-truth ilkesi).
try {
  const hit = execSync(
    `grep -rilE 'MUT[0-9]|yanlis-canonical|yok-sitemap|__test_disabled|ground-truth' ${JSON.stringify(path.join(clone, "src"))} || true`,
    { encoding: "utf8" }
  ).trim();
  if (hit) {
    console.error("FAIL-CLOSED: src'de kontaminasyon marker'i bulundu (ground-truth sizabilir):");
    console.error(hit);
    process.exit(1);
  }
} catch { /* grep yoksa taramayi atla ama uyar */ console.error("WARN: kontaminasyon taramasi yapilamadi (grep?)"); }

process.stdout.write(JSON.stringify({ count: gt.length, mutations: gt }, null, 2) + "\n");
