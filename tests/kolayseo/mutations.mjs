// KolaySEO A/B benchmark — SEO mutation suite (fail-closed, literal replace).
//
// Amaç: A/B testinde ceiling-effect'i yok etmek. Temizlenmiş Projedar'da "hata bul"
// demek yerine, her A/B clone'una AYNI 10 bilinçli SEO hatasını enjekte ederiz →
// matematiksel ground-truth: "10 hata koyduk, A ort X buldu, B ort Y buldu".
//
// Fail-closed: bir anchor beklenen sayıda bulunmazsa DURUR (sessizce yanlış mutasyon yok).
// Repo değişip anchor kayarsa benchmark çalışmayı reddeder → önce burayı güncelle.
//
// Kullanım: node tests/kolayseo/mutations.mjs <cloneDir>
//   • clone dosyalarını yerinde değiştirir
//   • ground-truth JSON'u STDOUT'a basar (caller results/ground-truth.json'a kaydeder)
//   • exit 1 = anchor uyuşmazlığı (fail-closed), exit 2 = kullanım hatası

import fs from "node:fs";
import path from "node:path";

const clone = process.argv[2];
if (!clone) {
  console.error("usage: node mutations.mjs <cloneDir>");
  process.exit(2);
}

// Her mutasyon: bilinen bir SEO gerçeğini bozar. `find` = dosyadaki BİREBİR metin.
// `all:true` → tüm eşleşmeler (aksi halde tam 1 eşleşme beklenir).
const MUT = [
  { id: "M1", surface: "index/noindex", file: "src/app/konut-projeleri/[[...dilim]]/page.tsx",
    find: 'alternates: { canonical: `${SITE}${yol}` },',
    replace: 'alternates: { canonical: `${SITE}${yol}` },\n    robots: { index: false, follow: false }, // MUT1',
    expect: "/konut-projeleri il/ilçe sayfaları yanlışlıkla noindex (money page)" },

  { id: "M2", surface: "canonical", file: "src/app/proje/[slug]/page.tsx",
    find: 'canonical: `/proje/${slug}`',
    replace: 'canonical: `/proje/yanlis-canonical-mut2`',
    expect: "/proje/[slug] canonical sabit yanlış URL'e gidiyor (cross-URL)" },

  { id: "M3", surface: "public/private leak", file: "src/app/sitemap.ts",
    find: 'const statik: MetadataRoute.Sitemap = [',
    replace: 'const statik: MetadataRoute.Sitemap = [\n    { url: `${SITE}/uretici/stok`, lastModified: now, changeFrequency: "weekly", priority: 0.8 }, // MUT3',
    expect: "sitemap'e private /uretici/stok URL'i sızdırıldı" },

  { id: "M4", surface: "robots/noindex çakışması", file: "src/app/robots.ts",
    find: 'const gizli = ["/havuz"',
    replace: 'const gizli = ["/p/", "/havuz"',
    expect: "/p/ tekrar robots-disallow (noindex ile çelişki — Google noindex'i göremez)" },

  { id: "M5", surface: "duplicate title", file: "src/app/emlakci/page.tsx",
    find: `title: "Emlakçılar için Projedar: Ücretsiz | Komisyonun %100'ü senin",`,
    replace: `title: "Müteahhit için Tahsisli Canlı Proje Satış Ağı | Projedar",`,
    expect: "/emlakci title'ı /muteahhit ile birebir aynı (duplicate title)" },

  { id: "M6", surface: "programmatic thin/derinlik", file: "src/app/konut-projeleri/[[...dilim]]/page.tsx",
    find: 'if (d.length > 2) notFound();',
    replace: '// MUT6 depth guard removed',
    expect: "programmatic derinlik guard kaldırıldı (keyfi derin URL 200 döner)" },

  { id: "M7", surface: "thin-content", file: "src/app/sitemap.ts",
    find: ') >= ICERIK_ESIGI,', all: true,
    replace: ') >= -1,',
    expect: "sitemap thin-content eşiği etkisiz (eşik-altı thin projeler sitemap'te)" },

  { id: "M8", surface: "soft-404 / thin", file: "src/app/proje/[slug]/page.tsx",
    find: '< ICERIK_ESIGI) notFound();',
    replace: '< -1) notFound(); // MUT8',
    expect: "/proje/[slug] thin guard etkisiz (thin proje 404 yerine 200)" },

  { id: "M9", surface: "canonical", file: "src/app/page.tsx",
    find: 'alternates: { canonical: "/" },',
    replace: '// MUT9 homepage self-canonical removed',
    expect: "anasayfa self-canonical kaldırıldı" },

  { id: "M10", surface: "sitemap/robots", file: "src/app/robots.ts",
    find: 'sitemap: `${SITE}/sitemap.xml`',
    replace: 'sitemap: `${SITE}/yok-sitemap-404.xml`',
    expect: "robots.txt sitemap pointer 404 URL'e işaret ediyor" },
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
  gt.push({ id: m.id, surface: m.surface, file: m.file, expect: m.expect });
}

process.stdout.write(JSON.stringify({ count: gt.length, mutations: gt }, null, 2) + "\n");
