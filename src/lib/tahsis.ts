import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type TahsisEmlakci = { id: string; ad: string | null; ofis: string | null };

/**
 * Üreticinin tahsis edebileceği danışmanlar (özel tahsis için).
 * profiles_self RLS üreticinin emlakçı profillerini listelemesini engellediğinden
 * admin client (service-role, server-only — DEĞİŞMEZ #1) ile çekilir.
 * Faz-2: davet/bağlantı katmanı (şimdilik tüm aktif emlakçılar listelenir).
 */
export async function tahsisEmlakcilari(): Promise<TahsisEmlakci[]> {
  const admin = createAdminClient();
  const [{ data: prof }, { data: ofisler }] = await Promise.all([
    admin.from("profiles").select("id, ad, ofis_id").eq("rol", "emlakci").eq("durum", "aktif").order("ad"),
    admin.from("ofis").select("id, ad"),
  ]);
  const ofisAd = new Map((ofisler ?? []).map((o) => [o.id as string, o.ad as string]));
  return (prof ?? []).map((p) => ({
    id: p.id as string,
    ad: (p.ad as string | null) ?? "Danışman",
    ofis: p.ofis_id ? ofisAd.get(p.ofis_id as string) ?? null : null,
  }));
}

export type TahsisSecenekler = { markalar: string[]; iller: string[]; ilceler: string[] };

/** Segment filtre seçenekleri — aktif emlakçılardan distinct marka/şehir/ilçe (admin client, server-only). */
export async function tahsisSecenekleri(): Promise<TahsisSecenekler> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("marka, il, ilce")
    .eq("rol", "emlakci")
    .eq("durum", "aktif");
  const uniq = (k: "marka" | "il" | "ilce") =>
    [
      ...new Set(
        (data ?? [])
          .map((r) => (r[k] as string | null)?.trim())
          .filter((v): v is string => !!v),
      ),
    ].sort((a, b) => a.localeCompare(b, "tr"));
  return { markalar: uniq("marka"), iller: uniq("il"), ilceler: uniq("ilce") };
}

export type TahsisOzet = { tahsis_id: string; musait: number; opsiyonlu: number; satildi: number; toplam: number; degisiklik: number };
export type StokDagitimSatir = {
  birim_id: string; daire_no: string | null; blok_id: string | null; kat: number | null; birim_durum: string;
  tahsis_id: string | null; hedef_tip: "herkes" | "ofis" | "danisman" | null; hedef_id: string | null;
  hedef_filtre: Record<string, string> | null; komisyon_tip: string | null; komisyon_deger: number | null; munhasir: boolean | null;
};

/** tahsis-merkezli stok sayacı + değişiklik (RPC tahsis_ozet). tahsis_id → özet map. */
export async function tahsisOzetGetir(projeId: string): Promise<Map<string, TahsisOzet>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("tahsis_ozet", { p_proje_id: projeId });
  return new Map(((data ?? []) as TahsisOzet[]).map((r) => [r.tahsis_id, r]));
}

/** stok-merkezli ters indeks (RPC stok_dagitim). Ham satırlar (UI birim'e göre gruplar). */
export async function stokDagitimGetir(projeId: string): Promise<StokDagitimSatir[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("stok_dagitim", { p_proje_id: projeId });
  return (data ?? []) as StokDagitimSatir[];
}
