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

export async function anahtarlariOku(): Promise<KesifAnahtarlari> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("pazarlama_entegrasyon")
    .select("claude_key, serpapi_key, serper_key, places_key")
    .eq("id", "default")
    .maybeSingle();
  return {
    claude_key: (data?.claude_key as string | null) ?? null,
    serpapi_key: (data?.serpapi_key as string | null) ?? null,
    serper_key: (data?.serper_key as string | null) ?? null,
    places_key: (data?.places_key as string | null) ?? null,
  };
}
