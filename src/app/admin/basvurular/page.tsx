import { createClient } from "@/lib/supabase/server";
import { SayfaBaslik, Uyari } from "../_ortak";
import BasvuruWorkspace, { type KuyrukSatir } from "./BasvuruWorkspace";

/**
 * Başvurular — hesap onayı + KYC belge doğrulama tek çalışma alanında.
 * Kuyruk = onay bekleyen VEYA belgesi beklemede olan profiller.
 * Dosya detayı (service-role) BasvuruWorkspace içinden getDosya action ile çekilir.
 */
export default async function BasvurularSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; mesaj?: string }>;
}) {
  const { hata, mesaj } = await searchParams;
  const supabase = await createClient();
  const [{ data: kuyrukRaw }, { data: ofisler }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, ad, telefon, talep_rol, il, ilce, durum, belge_durumu, created_at")
      .or("durum.eq.onay_bekliyor,belge_durumu.eq.beklemede")
      .order("created_at", { ascending: false }),
    supabase.from("ofis").select("id, ad").order("ad"),
  ]);
  const kuyruk = (kuyrukRaw ?? []) as KuyrukSatir[];

  return (
    <div className="mx-auto max-w-[1560px] space-y-4 px-4 py-6 sm:px-6">
      <SayfaBaslik
        baslik="Başvurular"
        noktaRenk={kuyruk.length > 0 ? "var(--color-amber)" : "var(--color-green)"}
        altEtiket={
          <>
            <span className="font-medium">
              {kuyruk.length > 0 ? `${kuyruk.length} başvuru işlem bekliyor` : "Kuyruk temiz"}
            </span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">kayıt · yetki · KYC tek dosyada</span>
          </>
        }
        sag={
          kuyruk.length > 0 ? (
            <span className="rozet mono bg-amber-soft text-amber">{kuyruk.length} bekleyen</span>
          ) : (
            <span className="rozet bg-green-soft text-teal-d">temiz ✓</span>
          )
        }
      />
      <Uyari hata={hata} mesaj={mesaj} />
      {kuyruk.length === 0 ? (
        <div className="kart px-5 py-16 text-center">
          <p className="text-sm font-semibold text-ink">Bekleyen başvuru yok</p>
          <p className="mt-1 text-xs text-gray">Yeni kayıt ve belge yüklemeleri burada birleşik görünür.</p>
        </div>
      ) : (
        <BasvuruWorkspace kuyruk={kuyruk} ofisler={ofisler ?? []} />
      )}
    </div>
  );
}
