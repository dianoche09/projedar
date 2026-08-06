import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GeriLink, SayfaBaslik } from "../../_ortak";
import { KesifPanel } from "./KesifPanel";

/**
 * Keşif & Davet Motoru — admin çalışma alanı.
 * Kampanya başlat (il + segment) → aday havuzu → Claude zenginleştir → tek-tık davet.
 * Tüm veri işlemleri /api/admin/kesif* route'ları üzerinden (service-role, admin-only).
 */
export default async function KesifSayfasi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profil } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  if (profil?.rol !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-[1100px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin/pazarlama" etiket="Pazarlama Entegrasyonları" />
      <SayfaBaslik
        baslik="Keşif & Davet Motoru"
        altEtiket={
          <>
            <span className="font-medium">müteahhit · proje · emlak ofisi keşfi</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">web → Claude zenginleştir → davet</span>
          </>
        }
        sag={<span className="rozet mono bg-teal/10 text-teal-d">canlı ağ</span>}
      />
      <KesifPanel />
    </div>
  );
}
