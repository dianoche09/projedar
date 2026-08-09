/**
 * Müteahhit kurumsal SEO sayfası (/firma/[slug]) veri katmanı.
 * Firma adı aramasında çıkmak + o firmanın projelerine iç bağlantı hub'ı.
 * Slug = slugify(uretici.ad) (public_slug kolonu gerektirmez). Yalnız server
 * (createAdminClient); uretici RLS bypass edilir (SEO public), DEĞİŞMEZ #1 korunur.
 * Firma sayfası ancak en az 1 içerik-eşiği geçen projesi varsa açılır (thin-content koruması).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI, type ProjeIcerikGirdi } from "@/lib/seo/icerik-esigi";
import { slugify } from "@/lib/seo/slug";

export type FirmaProfil = {
  logo_url?: string | null;
  kurulus_yili?: string | number | null;
  hakkinda?: string | null;
  web?: string | null;
  il?: string | null;
  ilce?: string | null;
};
export type FirmaProje = { ad: string; slug: string; il: string | null; ilce: string | null; asama: string | null; odaTipleri: string[] };
export type Firma = { id: string; ad: string; slug: string; dogrulanmis: boolean; profil: FirmaProfil; projeler: FirmaProje[] };

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Bir üreticinin eşik geçen, public_slug'lı projeleri (firma sayfası listesi + iç bağlantı). */
async function esikGecenProjeler(supabase: ReturnType<typeof createAdminClient>, ureticiId: string): Promise<FirmaProje[]> {
  const { data } = await supabase
    .from("proje")
    .select("id, ad, public_slug, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )")
    .eq("uretici_id", ureticiId)
    .not("public_slug", "is", null);
  const list = (data ?? []) as any[];
  if (!list.length) return [];
  const { data: tipRaw } = await supabase.from("daire_tipi").select("proje_id, oda").in("proje_id", list.map((x) => x.id));
  const tipSayim = new Map<string, number>();
  const odaMap = new Map<string, Set<string>>();
  for (const t of (tipRaw ?? []) as { proje_id: string; oda: string | null }[]) {
    tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
    if (t.oda) { const s = odaMap.get(t.proje_id) ?? new Set<string>(); s.add(t.oda); odaMap.set(t.proje_id, s); }
  }
  return list
    .filter((x) => {
      const g: ProjeIcerikGirdi = {
        il: x.il, ilce: x.ilce, mahalle: x.mahalle, lat: x.lat, lng: x.lng,
        ada: x.ada, parsel: x.parsel, emsal: x.emsal, taks: x.taks,
        insaat_asamasi: x.insaat_asamasi, teslim_tarihi: x.teslim_tarihi, baslama_tarihi: x.baslama_tarihi,
        kunye: x.kunye ?? {}, daireTipiSayisi: tipSayim.get(x.id) ?? 0,
        dogrulanmis: Boolean(x.uretici?.dogrulanmis), belge_dogrulandi: x.belge_dogrulandi,
      };
      return projeIcerikSkoru(g) >= ICERIK_ESIGI;
    })
    .map((x) => ({ ad: x.ad, slug: x.public_slug, il: x.il, ilce: x.ilce, asama: x.insaat_asamasi ?? null, odaTipleri: [...(odaMap.get(x.id) ?? [])] }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
}

/** Tek firma (slug = slugify(ad)). Eşik-geçen projesi yoksa null (sayfa açılmaz). */
export async function firmaGetir(slug: string): Promise<Firma | null> {
  const supabase = createAdminClient();
  const { data: ureticiler } = await supabase.from("uretici").select("id, ad, dogrulanmis, profil");
  const u = ((ureticiler ?? []) as any[]).find((x) => x.ad && slugify(x.ad) === slug);
  if (!u) return null;
  const projeler = await esikGecenProjeler(supabase, u.id);
  if (!projeler.length) return null;
  return { id: u.id, ad: u.ad, slug, dogrulanmis: Boolean(u.dogrulanmis), profil: (u.profil ?? {}) as FirmaProfil, projeler };
}

/** Sitemap + iç bağlantı: eşik-geçen projesi olan tüm firmaların slug'ları. */
export async function tumFirmaSluglari(): Promise<{ slug: string; ad: string }[]> {
  const supabase = createAdminClient();
  const [{ data: ureticiler }, { data: projeRaw }] = await Promise.all([
    supabase.from("uretici").select("id, ad, dogrulanmis, profil"),
    supabase
      .from("proje")
      .select("id, uretici_id, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )")
      .not("public_slug", "is", null),
  ]);
  const projeler = (projeRaw ?? []) as any[];
  if (!projeler.length) return [];
  const { data: tipRaw } = await supabase.from("daire_tipi").select("proje_id").in("proje_id", projeler.map((x) => x.id));
  const tipSayim = new Map<string, number>();
  for (const t of (tipRaw ?? []) as { proje_id: string }[]) tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);

  const esikliUretici = new Set<string>();
  for (const x of projeler) {
    const g: ProjeIcerikGirdi = {
      il: x.il, ilce: x.ilce, mahalle: x.mahalle, lat: x.lat, lng: x.lng,
      ada: x.ada, parsel: x.parsel, emsal: x.emsal, taks: x.taks,
      insaat_asamasi: x.insaat_asamasi, teslim_tarihi: x.teslim_tarihi, baslama_tarihi: x.baslama_tarihi,
      kunye: x.kunye ?? {}, daireTipiSayisi: tipSayim.get(x.id) ?? 0,
      dogrulanmis: Boolean(x.uretici?.dogrulanmis), belge_dogrulandi: x.belge_dogrulandi,
    };
    if (projeIcerikSkoru(g) >= ICERIK_ESIGI) esikliUretici.add(x.uretici_id);
  }
  const seen = new Set<string>();
  const cikti: { slug: string; ad: string }[] = [];
  for (const u of ((ureticiler ?? []) as any[])) {
    if (!u.ad || !esikliUretici.has(u.id)) continue;
    const slug = slugify(u.ad);
    if (seen.has(slug)) continue; // ad çakışmasında ilk firma
    seen.add(slug);
    cikti.push({ slug, ad: u.ad });
  }
  return cikti;
}
