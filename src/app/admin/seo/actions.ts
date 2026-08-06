"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { projeSlug } from "@/lib/seo/slug";
import { indexNowGonder } from "@/lib/seo/indexnow";
import { zUuid } from "@/lib/uuid";

/** Çağıran oturumun admin olduğunu doğrula (service-role işlemi öncesi şart). */
async function adminGuard(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profil } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  if (profil?.rol !== "admin") redirect("/");
  return user.id;
}

/**
 * Eşik geçen bir projeye tek tıkla public_slug ver → SEO sayfası yayınlanır,
 * IndexNow ile bildirilir. Slug ad+ilçe'den (projeSlug); proje/katalog çakışmasında
 * id parçasıyla benzersizleşir. Zaten public_slug'ı varsa dokunmaz.
 */
export async function projeSayfasiUret(formData: FormData) {
  const adminId = await adminGuard();
  const parsed = zUuid.safeParse(formData.get("proje_id"));
  if (!parsed.success) return;
  const projeId = parsed.data;

  const admin = createAdminClient();
  const { data: proje } = await admin
    .from("proje")
    .select("id, ad, il, ilce, public_slug")
    .eq("id", projeId)
    .maybeSingle();
  if (!proje || proje.public_slug) {
    revalidatePath("/admin/seo");
    return;
  }

  let slug = projeSlug(proje.ad, proje.ilce);
  const [{ data: c1 }, { data: c2 }] = await Promise.all([
    admin.from("proje").select("id").eq("public_slug", slug).neq("id", projeId).maybeSingle(),
    admin.from("katalog_proje").select("slug").eq("slug", slug).maybeSingle(),
  ]);
  if (c1 || c2) slug = `${slug}-${projeId.slice(0, 4)}`;

  await admin.from("proje").update({ public_slug: slug }).eq("id", projeId);

  let indexOk = false;
  try {
    const r = await indexNowGonder([`https://projedar.com/proje/${slug}`]);
    indexOk = r.ok;
  } catch {
    indexOk = false;
  }

  await kayitYaz({ tip: "seo_yayin", profileId: adminId, projeId, payload: { slug, indexnow: indexOk } });
  revalidatePath("/admin/seo");
  revalidatePath("/sitemap.xml");
}
