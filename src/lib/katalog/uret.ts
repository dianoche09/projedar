/**
 * Katalog içerik üretimi (server-only): SerpAPI çok-kaynak araştırma + Claude ile
 * Projedar sesinde ÖZGÜN 5-bölüm metin. Kopya değil: olgu al, yeniden yaz; kaynaklarda
 * olmayan iddia ekleme; kaynaklar SERP'ten gelen gerçek URL'ler.
 *
 * scripts/katalog-uret.mjs'in TS karşılığı — günlük cron (api/cron) bunu kullanır.
 * Anahtarlar env'de: SERPAPI (adında SERP geçen), ANTHROPIC_API_KEY.
 */

import "server-only";

const MODEL = process.env.KATALOG_MODEL || "claude-sonnet-5";
const ANTHROPIC_VER = "2023-06-01";

function serpAnahtar(): string | null {
  const dogrudan = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;
  if (dogrudan) return dogrudan;
  for (const [k, v] of Object.entries(process.env)) if (/SERP/i.test(k) && v) return v;
  return null;
}

export type KatalogSeed = {
  ad: string;
  il: string;
  ilce: string;
  gelistirici?: string | null;
  mahalle?: string | null;
};

export type KatalogMetin = {
  ozet: string;
  konum_cevre: string;
  daire_tipleri: string;
  ozellikler_metni: string;
  yatirim_teslim: string;
};

export type UretilenIcerik = {
  mahalle?: string | null;
  gelistirici?: string | null;
  proje_alani_m2?: number | null;
  daire_sayisi?: number | null;
  blok_sayisi?: number | null;
  oda_tipleri?: string[];
  m2_min?: number | null;
  m2_max?: number | null;
  manzara?: string | null;
  otopark?: string | null;
  durum?: "lansman" | "insaat" | "teslim" | null;
  teslim?: string | null;
  ozellikler?: string[];
  cevre_noktalar?: string[];
  metin: KatalogMetin;
};

const ELE = /(facebook|instagram|twitter|x\.com|youtube|linkedin|pinterest|tiktok)\./i;

const ICERIK_TOOL = {
  name: "kaydet_katalog_icerik",
  description: "Üretilen özgün katalog içeriğini ve olgusal alanları kaydet.",
  input_schema: {
    type: "object",
    properties: {
      mahalle: { type: "string" },
      gelistirici: { type: "string" },
      proje_alani_m2: { type: "number" },
      daire_sayisi: { type: "integer" },
      blok_sayisi: { type: "integer" },
      oda_tipleri: { type: "array", items: { type: "string" } },
      m2_min: { type: "number" },
      m2_max: { type: "number" },
      manzara: { type: "string" },
      otopark: { type: "string" },
      durum: { type: "string", enum: ["lansman", "insaat", "teslim"] },
      teslim: { type: "string", description: "SADECE tarih, ör. 'Aralık 2026'. Parantez/ek açıklama yazma." },
      ozellikler: { type: "array", items: { type: "string" } },
      cevre_noktalar: { type: "array", items: { type: "string" } },
      metin: {
        type: "object",
        properties: {
          ozet: { type: "string", description: "~90-140 kelime" },
          konum_cevre: { type: "string", description: "~90-140 kelime" },
          daire_tipleri: { type: "string", description: "~70-120 kelime" },
          ozellikler_metni: { type: "string", description: "~70-120 kelime" },
          yatirim_teslim: { type: "string", description: "~70-120 kelime, sonda teyit uyarısı" },
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
- Ton: profesyonel ve bilgilendirici. Abartılı pazarlama sloganı, klişe kullanma.
- Dil: Türkçe. Fiyat/ödeme vaadi yazma (fiyat panelde canlı tutulur).
- yatirim_teslim bölümünün SONUNA şu anlamda bir cümle ekle: güncel proje ve fiyat verileri doğrudan geliştiriciden teyit edilmelidir.
- Sonucu SADECE kaydet_katalog_icerik aracıyla ver.`;

async function serpAra(sorgu: string, key: string): Promise<Array<{ baslik: string; link: string; ozet: string }>> {
  const u = new URL("https://serpapi.com/search.json");
  u.searchParams.set("q", sorgu);
  u.searchParams.set("hl", "tr");
  u.searchParams.set("gl", "tr");
  u.searchParams.set("google_domain", "google.com.tr");
  u.searchParams.set("num", "10");
  u.searchParams.set("api_key", key);
  const r = await fetch(u, { cache: "no-store" });
  if (!r.ok) throw new Error(`SerpAPI ${r.status}`);
  const j = (await r.json()) as { organic_results?: Array<{ title?: string; link?: string; snippet?: string }> };
  return (j.organic_results ?? [])
    .filter((o) => o.link && !ELE.test(o.link))
    .map((o) => ({ baslik: o.title ?? "", link: o.link as string, ozet: o.snippet ?? "" }));
}

export type UretimSonuc = { veri: UretilenIcerik; kaynaklar: string[]; kullanim: Record<string, number> };

/** Bir proje için içerik üret. Hata fırlatabilir (çağıran yakalar). */
export async function katalogIcerikUret(seed: KatalogSeed, araSayisi = 5): Promise<UretimSonuc> {
  const SERP_KEY = serpAnahtar();
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!SERP_KEY) throw new Error("SERPAPI anahtarı yok");
  if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY yok");

  const konum = [seed.ilce, seed.il].filter(Boolean).join(" ");
  const sorgular = [
    `${seed.ad} projesi ${konum}`,
    `${seed.ad} konum ulaşım metro`,
    `${seed.ad} daire tipleri m2 oda`,
    `${seed.ad} sosyal donatı özellikler`,
    `${seed.ad} teslim tarihi geliştirici`,
    `${seed.ad} ${konum} yatırım`,
  ].slice(0, Math.max(1, araSayisi)).map((s) => s.trim());

  const kaynaklar = new Map<string, { baslik: string; ozet: string }>();
  const notlar: string[] = [];
  for (const q of sorgular) {
    try {
      for (const o of await serpAra(q, SERP_KEY)) {
        if (!kaynaklar.has(o.link)) kaynaklar.set(o.link, { baslik: o.baslik, ozet: o.ozet });
        if (o.ozet) notlar.push(`- ${o.baslik}: ${o.ozet}`);
      }
    } catch {
      /* tek sorgu hatası batch'i bozmaz */
    }
  }
  if (!notlar.length) throw new Error("araştırma sonucu boş");

  const arastirma = [
    `PROJE: ${seed.ad}`,
    konum ? `KONUM: ${konum}` : "",
    seed.gelistirici ? `GELİŞTİRİCİ: ${seed.gelistirici}` : "",
    "",
    "ARAŞTIRMA NOTLARI (KOPYALAMA, olguyu yeniden yaz):",
    ...notlar.slice(0, 40),
  ].filter(Boolean).join("\n");

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": ANTHROPIC_VER, "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      system: SISTEM,
      tools: [ICERIK_TOOL],
      tool_choice: { type: "tool", name: ICERIK_TOOL.name },
      messages: [{ role: "user", content: arastirma }],
    }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const j = (await r.json()) as {
    content?: Array<{ type: string; input?: UretilenIcerik }>;
    usage?: Record<string, number>;
  };
  const tool = (j.content ?? []).find((b) => b.type === "tool_use");
  if (!tool?.input) throw new Error("Anthropic tool_use dönmedi");

  return { veri: tool.input, kaynaklar: [...kaynaklar.keys()].slice(0, 8), kullanim: j.usage ?? {} };
}
