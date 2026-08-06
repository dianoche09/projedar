import { AdayZenginSchema, type AdayHam, type AdayZengin } from "./tipler";

/**
 * Claude ile aday zenginleştirme — ham SERP verisini yapılandırılmış adaya çevirir.
 * Yeni bağımlılık yok: Anthropic Messages API'sine doğrudan fetch + forced tool-use ile
 * garanti yapılandırılmış JSON (halüsinasyon yasağı prompt'ta).
 *
 * BYOK: claude_key pazarlama_entegrasyon'dan gelir (server-only). Model: Sonnet 5 (kalite/hız).
 */
const API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

const SISTEM =
  "Sen Türkiye gayrimenkul pazarı için bir aday (prospect) analiz asistanısın. " +
  "Ham web arama verisinden her firma için yapılandırılmış aday kaydı üretirsin. " +
  "KURALLAR: (1) İletişim bilgisi (email/telefon) yalnız verilen metinde AÇIKÇA geçiyorsa yaz; " +
  "emin değilsen null bırak — ASLA uydurma. (2) segment: yeni konut projesi geliştiren/inşa eden firma " +
  "'muteahhit'; emlak ofisi 'ofis'; bireysel danışman 'emlakci'. Bir proje ilanıysa arkasındaki " +
  "geliştiriciyi 'muteahhit' olarak işaretle. (3) uygunluk_skoru 0-100: firmanın ProjePazar için " +
  "(canlı konut stoğu olan müteahhit / aktif emlak ofisi) ne kadar nitelikli aday olduğu. " +
  "(4) ozet: tek cümle Türkçe. (5) proje_sayisi yalnız müteahhit için tahmin, yoksa null.";

const ARAC = {
  name: "adaylar_kaydet",
  description: "Zenginleştirilmiş aday listesini yapılandırılmış olarak döndür.",
  input_schema: {
    type: "object" as const,
    properties: {
      adaylar: {
        type: "array",
        items: {
          type: "object",
          properties: {
            firma_adi: { type: "string" },
            segment: { type: "string", enum: ["muteahhit", "proje", "ofis", "emlakci"] },
            kisi: { type: ["string", "null"] },
            email: { type: ["string", "null"] },
            telefon: { type: ["string", "null"] },
            proje_sayisi: { type: ["integer", "null"] },
            uygunluk_skoru: { type: "integer", minimum: 0, maximum: 100 },
            ozet: { type: "string" },
          },
          required: ["firma_adi", "segment", "uygunluk_skoru", "ozet"],
        },
      },
    },
    required: ["adaylar"],
  },
};

/** Ham aday listesini Claude'dan geçirip zengin adaylara çevirir. Boş girdide boş döner. */
export async function zenginlestir(hamlar: AdayHam[], claudeKey: string): Promise<AdayZengin[]> {
  if (hamlar.length === 0) return [];

  const girdi = hamlar.map((h, i) => ({
    no: i + 1,
    firma_adi: h.firma_adi,
    website: h.website ?? null,
    telefon: h.telefon ?? null,
    email: h.email ?? null,
    adres: h.adres ?? null,
    snippet: h.ozet ?? null,
  }));

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "x-api-key": claudeKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: [{ type: "text", text: SISTEM, cache_control: { type: "ephemeral" } }],
      tools: [ARAC],
      tool_choice: { type: "tool", name: "adaylar_kaydet" },
      messages: [
        {
          role: "user",
          content: `Aşağıdaki ham adayları zenginleştir. Sıra ve firma adlarını koru.\n\n${JSON.stringify(girdi, null, 2)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const govde = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${govde.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; name?: string; input?: { adaylar?: unknown[] } }>;
  };
  const blok = (data.content ?? []).find((b) => b.type === "tool_use" && b.name === "adaylar_kaydet");
  const ham = (blok?.input?.adaylar ?? []) as unknown[];

  // Şema doğrulama — bozuk kaydı at (motoru durdurma).
  const sonuc: AdayZengin[] = [];
  for (const a of ham) {
    const p = AdayZenginSchema.safeParse(a);
    if (p.success) sonuc.push(p.data);
  }
  return sonuc;
}
