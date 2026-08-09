// Projedar — katalog içerik ÜRETİMİ: SerpAPI ile çok-kaynak araştır + Claude ile
// Projedar sesinde ÖZGÜN (kopya olmayan) 5-bölüm metin üret → enrich/<slug>.json yaz.
// Ardından `node scripts/katalog-enrich.mjs <slug>` ile DB'ye basılır.
//
// Akış:  slug → katalog_proje'den tohum (ad/il/ilçe) → SerpAPI araştırma (cache'li)
//        → Claude structured output (tool) → enrich/<slug>.json.
//
// Zero-dep: @anthropic-ai/sdk kurmaz, raw fetch kullanır (@supabase/supabase-js zaten dep).
//
// Anahtarlar (.env.local veya ortam): SERPAPI (adında SERP geçen), ANTHROPIC_API_KEY
// (veya CLAUDE_API_KEY), NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
//
// Kullanım:
//   node scripts/katalog-uret.mjs uplife-kadikoy            # üret + JSON yaz
//   node scripts/katalog-uret.mjs uplife-kadikoy --kuru     # plan + tahmini maliyet, API yok
//   node scripts/katalog-uret.mjs uplife-kadikoy --ara 6    # 6 SerpAPI sorgusu (varsayılan 5)

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const KOK = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENRICH_DIR = join(KOK, "scripts", "katalog-data", "enrich");
const SERP_CACHE = join(KOK, "scripts", "katalog-data", "serp-cache");

const MODEL_VARSAYILAN = "claude-sonnet-5";
const ANTHROPIC_VER = "2023-06-01";

// ---------------------------------------------------------------------------
// Ortam / anahtar bulma
// ---------------------------------------------------------------------------
function envOku() {
  const yol = join(KOK, ".env.local");
  const o = {};
  if (existsSync(yol)) {
    for (const s of readFileSync(yol, "utf8").split("\n")) {
      const m = s.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return { ...o, ...process.env };
}
const env = envOku();

function serpAnahtar() {
  for (const [k, v] of Object.entries(env)) {
    if (/SERP/i.test(k) && v) return v;
  }
  return null;
}
const SERP_KEY = serpAnahtar();
const ANTHROPIC_KEY = env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY || null;
const SB_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || null;
const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SERVICE_ROLE_KEY || null;

// ---------------------------------------------------------------------------
// SerpAPI (cache'li) — her sorgu 1 kredi, cache tekrar koşuda API'ye gitmez
// ---------------------------------------------------------------------------
async function serpAra(sorgu) {
  mkdirSync(SERP_CACHE, { recursive: true });
  const anahtar = createHash("sha1").update(sorgu).digest("hex").slice(0, 16);
  const dosya = join(SERP_CACHE, `${anahtar}.json`);
  if (existsSync(dosya)) return JSON.parse(readFileSync(dosya, "utf8"));

  const u = new URL("https://serpapi.com/search.json");
  u.searchParams.set("q", sorgu);
  u.searchParams.set("hl", "tr");
  u.searchParams.set("gl", "tr");
  u.searchParams.set("google_domain", "google.com.tr");
  u.searchParams.set("num", "10");
  u.searchParams.set("api_key", SERP_KEY);
  const r = await fetch(u);
  if (!r.ok) throw new Error(`SerpAPI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  writeFileSync(dosya, JSON.stringify(j));
  return j;
}

// Gürültü domainleri (kaynak olarak değersiz)
const ELE = /(facebook|instagram|twitter|x\.com|youtube|linkedin|pinterest|tiktok)\./i;

function organikTopla(serpJson) {
  const cikan = [];
  for (const o of serpJson.organic_results ?? []) {
    if (!o.link || ELE.test(o.link)) continue;
    cikan.push({ baslik: o.title ?? "", link: o.link, ozet: o.snippet ?? "" });
  }
  return cikan;
}

// ---------------------------------------------------------------------------
// Anthropic — structured output (tool zorlaması)
// ---------------------------------------------------------------------------
const ICERIK_TOOL = {
  name: "kaydet_katalog_icerik",
  description: "Üretilen özgün katalog içeriğini ve olgusal alanları kaydet.",
  input_schema: {
    type: "object",
    properties: {
      mahalle: { type: "string", description: "Mahalle/semt (biliniyorsa)" },
      gelistirici: { type: "string", description: "Geliştirici/müteahhit firma" },
      proje_alani_m2: { type: "number" },
      daire_sayisi: { type: "integer" },
      blok_sayisi: { type: "integer" },
      oda_tipleri: { type: "array", items: { type: "string" }, description: "ör. ['1+1','2+1','3+1']" },
      m2_min: { type: "number" },
      m2_max: { type: "number" },
      manzara: { type: "string" },
      otopark: { type: "string" },
      durum: { type: "string", enum: ["lansman", "insaat", "teslim"] },
      teslim: { type: "string", description: "SADECE tarih, ör. 'Aralık 2026'. Parantez/ek açıklama yazma." },
      ozellikler: { type: "array", items: { type: "string" }, description: "Sosyal donatı/özellik listesi" },
      cevre_noktalar: { type: "array", items: { type: "string" }, description: "Yakın ulaşım/AVM/okul vb." },
      metin: {
        type: "object",
        description: "5 bölüm ÖZGÜN Türkçe prose (kaynaklardan kopya DEĞİL, yeniden yazılmış)",
        properties: {
          ozet: { type: "string", description: "Genel özet, ~90-140 kelime" },
          konum_cevre: { type: "string", description: "Konum ve çevre, ~90-140 kelime" },
          daire_tipleri: { type: "string", description: "Daire tipleri, ~70-120 kelime" },
          ozellikler_metni: { type: "string", description: "Sosyal donatı/özellikler, ~70-120 kelime" },
          yatirim_teslim: { type: "string", description: "Yatırım/teslim + sonda teyit uyarısı, ~70-120 kelime" },
        },
        required: ["ozet", "konum_cevre", "daire_tipleri", "ozellikler_metni", "yatirim_teslim"],
      },
    },
    required: ["metin"],
  },
};

const SISTEM = `Sen Projedar için Türkçe emlak katalog editörüsün. Görevin: verilen araştırma
notlarından bir konut projesi için ÖZGÜN, bilgilendirici katalog metni üretmek.

KURALLAR (kesin):
- KOPYALAMA: kaynaklardaki cümleleri asla birebir alma; olguyu al, kendi cümlelerinle yeniden yaz.
- UYDURMA: araştırma notlarında geçmeyen sayısal/olgusal iddia ekleme. Emin değilsen alanı boş bırak.
- Uzun tire "—" KULLANMA; onun yerine virgül veya iki nokta kullan.
- "bayat" kelimesini kullanma; "güncel değil / eskiyen" de.
- Kıtlık/kontenjan vaadi verme ("sınırlı daire" gibi). "kapalı" kelimesini tek başına olumsuz çerçevede kullanma.
- Ton: profesyonel ve bilgilendirici. Abartılı pazarlama sloganı, klişe ("hayalinizdeki ev") kullanma.
- Dil: Türkçe. Fiyat/ödeme vaadi yazma (fiyat panelde canlı tutulur).
- yatirim_teslim bölümünün SONUNA şu anlamda bir cümle ekle: güncel proje ve fiyat verileri doğrudan geliştiriciden teyit edilmelidir.
- Sonucu SADECE kaydet_katalog_icerik aracıyla ver.`;

async function anthropicUret({ model, sistem, kullanici }) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": ANTHROPIC_VER,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 3000,
      system: sistem,
      tools: [ICERIK_TOOL],
      tool_choice: { type: "tool", name: ICERIK_TOOL.name },
      messages: [{ role: "user", content: kullanici }],
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const tool = (j.content ?? []).find((b) => b.type === "tool_use");
  if (!tool) throw new Error("Anthropic tool_use bloğu dönmedi.");
  return { veri: tool.input, kullanim: j.usage };
}

// ---------------------------------------------------------------------------
// Ana akış
// ---------------------------------------------------------------------------
function argCek(ad, varsayilan) {
  const i = process.argv.indexOf(ad);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : varsayilan;
}

async function main() {
  const slug = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
  const kuru = process.argv.includes("--kuru");
  const araSayisi = parseInt(argCek("--ara", "5"), 10);
  const model = argCek("--model", MODEL_VARSAYILAN);
  if (!slug) {
    console.error("HATA: slug gerekli. Örnek: node scripts/katalog-uret.mjs uplife-kadikoy");
    process.exit(1);
  }

  // Tohum: katalog_proje'den ad/il/ilçe
  let tohum = { ad: slug, il: null, ilce: null, gelistirici: null };
  if (SB_URL && SB_KEY) {
    const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
    const { data } = await sb.from("katalog_proje").select("ad, il, ilce, gelistirici, mahalle").eq("slug", slug).single();
    if (data) tohum = { ...tohum, ...data };
  }

  const konum = [tohum.ilce, tohum.il].filter(Boolean).join(" ");
  const sorgular = [
    `${tohum.ad} projesi ${konum}`.trim(),
    `${tohum.ad} konum ulaşım metro`.trim(),
    `${tohum.ad} daire tipleri m2 oda`.trim(),
    `${tohum.ad} sosyal donatı özellikler`.trim(),
    `${tohum.ad} teslim tarihi geliştirici`.trim(),
    `${tohum.ad} ${konum} yatırım`.trim(),
  ].slice(0, Math.max(1, araSayisi));

  if (kuru) {
    console.log(`[kuru] slug: ${slug} | tohum: ${JSON.stringify(tohum)}`);
    console.log(`[kuru] ${sorgular.length} SerpAPI sorgusu (~${sorgular.length} kredi, cache'liler hariç):`);
    sorgular.forEach((s) => console.log(`   - ${s}`));
    console.log(`[kuru] 1 Anthropic çağrısı (${model}). API çağrısı yapılmadı.`);
    console.log(`[kuru] anahtarlar: SERP=${SERP_KEY ? "var" : "YOK"} ANTHROPIC=${ANTHROPIC_KEY ? "var" : "YOK"} SUPABASE=${SB_URL && SB_KEY ? "var" : "yok"}`);
    return;
  }
  if (!SERP_KEY) { console.error("HATA: SerpAPI anahtarı yok (.env.local, adında SERP geçen)."); process.exit(1); }
  if (!ANTHROPIC_KEY) { console.error("HATA: ANTHROPIC_API_KEY yok (.env.local)."); process.exit(1); }

  // Araştırma topla
  const kaynaklar = new Map(); // link -> {baslik, ozet}
  const notlar = [];
  for (const q of sorgular) {
    try {
      const j = await serpAra(q);
      for (const o of organikTopla(j)) {
        if (!kaynaklar.has(o.link)) kaynaklar.set(o.link, o);
        if (o.ozet) notlar.push(`- ${o.baslik}: ${o.ozet}`);
      }
    } catch (e) {
      console.warn(`⚠ sorgu atlandı (${q}): ${e.message}`);
    }
  }
  if (!notlar.length) { console.error("HATA: araştırma sonucu boş, içerik üretilemedi."); process.exit(1); }

  const kaynakUrller = [...kaynaklar.keys()].slice(0, 8);
  const arastirma = [
    `PROJE: ${tohum.ad}`,
    konum ? `KONUM: ${konum}` : null,
    tohum.gelistirici ? `GELİŞTİRİCİ: ${tohum.gelistirici}` : null,
    "",
    "ARAŞTIRMA NOTLARI (kaynak özetleri, bunları KOPYALAMA, olguyu yeniden yaz):",
    ...notlar.slice(0, 40),
  ].filter((x) => x !== null).join("\n");

  console.log(`Araştırma: ${sorgular.length} sorgu, ${kaynaklar.size} kaynak, ${notlar.length} not. Üretiliyor (${model})...`);
  const { veri, kullanim } = await anthropicUret({ model, sistem: SISTEM, kullanici: arastirma });

  // kaynaklar = GERÇEK toplanan URL'ler (Claude'un uydurması değil)
  const cikti = {
    ad: tohum.ad,
    il: tohum.il ?? undefined,
    ilce: tohum.ilce ?? undefined,
    ...veri,
    kaynaklar: kaynakUrller,
    uretim: { model, tarih: new Date().toISOString(), kaynak: "serpapi+claude", token: kullanim },
  };

  mkdirSync(ENRICH_DIR, { recursive: true });
  const yol = join(ENRICH_DIR, `${slug}.json`);
  writeFileSync(yol, JSON.stringify(cikti, null, 2) + "\n", "utf8");
  console.log(`✓ Yazıldı: ${yol}`);
  console.log(`  Token: giriş ${kullanim?.input_tokens} / çıkış ${kullanim?.output_tokens}`);
  console.log(`  Sıradaki: node scripts/katalog-enrich.mjs ${slug}   (DB'ye bas)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
