import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lansman popup için public-safe canlı havuz özeti.
 * Yalnız yayınlı projeler (public_slug) → ad + şehir + toplam proje sayısı.
 * Per-proje stok/satışa-açık sayısı DÖNMEZ (özel bilgi; kullanıcı kararı: public'te gösterilmez).
 * Service-role yalnız sunucuda; RLS'te anon proje okuyamaz (kapalı-devre).
 */
export const revalidate = 300;

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, count } = await admin
      .from("proje")
      .select("ad, il, ilce", { count: "exact" })
      .not("public_slug", "is", null)
      .order("son_guncelleme", { ascending: false })
      .limit(3);
    const projeler = (data ?? []).map((p) => ({
      ad: String((p as { ad?: string }).ad ?? "").trim(),
      sehir: [(p as { il?: string }).il, (p as { ilce?: string }).ilce].filter(Boolean).join(" · "),
    }));
    return NextResponse.json(
      { projeler, projeSay: count ?? projeler.length },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch {
    return NextResponse.json({ projeler: [], projeSay: 0 });
  }
}
