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
  "Sen Türkiye gayrimenkul pazarı için aday (prospect) analiz asistanısın. HEDEF: YENİ/AKTİF konut " +
  "projesi olan MÜTEAHHİTLER. Ham web verisinden her kayıt için yapılandırılmış aday üretirsin.\n" +
  "KURALLAR:\n" +
  "(1) İki ayrı taraf çıkar: MÜTEAHHİT (geliştirici firma) → firma_adi + email/telefon/(müteahhit) ; " +
  "PROJE → proje_adi + proje_website + proje_telefon (satış ofisi). Bir proje ilanıysa arkasındaki " +
  "geliştiriciyi firma_adi yap.\n" +
  "(2) İletişim (email/telefon/website) yalnız verilen metinde/web sitesinde AÇIKÇA varsa yaz; emin " +
  "değilsen null. ASLA uydurma. Web sitesi domaini varsa email için 'info@domain' MAKUL bir tahmindir, " +
  "kurumsal kurumsal görünüyorsa yazabilirsin, aksi halde null.\n" +
  "(3) proje_durumu: lansman | on_satis (satışta) | insaat (inşaat devam) | tamamlandi (teslim/bitmiş/" +
  "satıldı) | belirsiz.\n" +
  "(4) uygunluk_skoru 0-100 TAZELİK ODAKLI: lansman/on_satis/insaat = YÜKSEK (70-100). tamamlandi/teslim " +
  "edilmiş/sold-out = DÜŞÜK (<30). Projesi belirsiz salt-firma = orta (30-55). Eski projeyi ELE.\n" +
  "(5) segment: geliştirici 'muteahhit'; emlak ofisi 'ofis'; bireysel danışman 'emlakci'.\n" +
  "(6) ozet: tek cümle Türkçe (proje adı + durum + neden nitelikli). proje_sayisi müteahhit için tahmin.";

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
            firma_adi: { type: "string", description: "müteahhit (geliştirici) firma" },
            segment: { type: "string", enum: ["muteahhit", "proje", "ofis", "emlakci"] },
            kisi: { type: ["string", "null"] },
            email: { type: ["string", "null"], description: "müteahhit e-postası" },
            telefon: { type: ["string", "null"], description: "müteahhit telefonu" },
            proje_adi: { type: ["string", "null"] },
            proje_durumu: { type: ["string", "null"], enum: ["lansman", "on_satis", "insaat", "tamamlandi", "belirsiz", null] },
            proje_website: { type: ["string", "null"] },
            proje_telefon: { type: ["string", "null"], description: "proje satış ofisi telefonu" },
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
