import { createAdminClient } from "@/lib/supabase/admin";

/**
 * BYOK entegrasyon anahtarları — pazarlama_entegrasyon singleton'ından okur.
 * DEĞİŞMEZ #1: yalnız service-role erişir (server route / cron içinde çağrılır).
 * Anahtar tanımlı değilse ilgili motor bilgilendirici hata döndürür (akış bozulmaz).
 */
export type KesifAnahtarlari = {
  claude_key: string | null;
  serpapi_key: string | null;
  serper_key: string | null;
  places_key: string | null;
};

/** Boş/whitespace değeri null'a indir — env fallback tetiklensin. */
function bos(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

export async function anahtarlariOku(): Promise<KesifAnahtarlari> {
  let data: Record<string, unknown> | null = null;
  try {
    const admin = createAdminClient();
    const r = await admin
      .from("pazarlama_entegrasyon")
      .select("claude_key, serpapi_key, serper_key, places_key")
      .eq("id", "default")
      .maybeSingle();
    data = (r.data as Record<string, unknown> | null) ?? null;
  } catch {
    /* tablo/anahtar yoksa yalnız env fallback kullanılır */
  }

  const env = process.env;
  // Öncelik: BYOK tablo (panelden) → env değişkeni (Vercel/.env). İkisi de dolu değilse null.
  return {
    claude_key: bos(data?.claude_key) ?? bos(env.ANTHROPIC_API_KEY) ?? bos(env.CLAUDE_API_KEY),
    serpapi_key: bos(data?.serpapi_key) ?? bos(env.SERPAPI_API_KEY) ?? bos(env.SERPAPI_KEY),
    serper_key: bos(data?.serper_key) ?? bos(env.SERPER_API_KEY) ?? bos(env.SERPER_KEY),
    places_key: bos(data?.places_key) ?? bos(env.GOOGLE_PLACES_API_KEY) ?? bos(env.PLACES_API_KEY),
  };
}
