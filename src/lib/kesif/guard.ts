import { createClient } from "@/lib/supabase/server";

/**
 * API route'ları için admin doğrulama — oturum admin ise id, değilse null döner.
 * Çağıran route null'da 401/403 verir. (Sayfa server action'ları redirect'li adminGuard kullanır.)
 */
export async function adminIdVeya(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profil } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  return profil?.rol === "admin" ? user.id : null;
}
