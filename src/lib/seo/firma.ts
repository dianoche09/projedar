/**
 * Müteahhit / geliştirici kurumsal SEO sayfası (/firma/[slug]) veri katmanı.
 * Firma adı aramasında çıkmak + o firmanın projelerine iç bağlantı hub'ı.
 * İki kaynak: kendi DB `uretici` (ağda) + dış `katalog_proje.gelistirici` (ağa girmemiş).
 * Slug = slugify(ad). Yalnız server (createAdminClient); DEĞİŞMEZ #1 korunur.
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
export type FirmaProje = { ad: string; slug: string; il: string | null; ilce: string | null; asama: string | null; odaTipleri: string[]; kapak: string | null };
export type Firma = { id: string; ad: string; slug: string; dogrulanmis: boolean; kaynak: "proje" | "katalog"; profil: FirmaProfil; projeler: FirmaProje[] };

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Bir üreticinin eşik geçen, public_slug'lı projeleri (ağda firma). */
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
    .map((x) => ({ ad: x.ad, slug: x.public_slug, il: x.il, ilce: x.ilce, asama: x.insaat_asamasi ?? null, odaTipleri: [...(odaMap.get(x.id) ?? [])], kapak: null }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
}

/** Katalog geliştiricisi (ağa girmemiş): gelistirici adı slug'a eşleşen aktif+eşik projeleri. */
async function katalogFirmaGetir(supabase: ReturnType<typeof createAdminClient>, slug: string): Promise<Firma | null> {
  const { data } = await supabase
    .from("katalog_proje")
    .select("slug, ad, il, ilce, mahalle, oda_tipleri, m2_min, m2_max, durum, teslim, gelistirici, kapak_url")
    .eq("aktif", true)
    .not("gelistirici", "is", null);
  const rows = ((data ?? []) as any[]).filter((x) => x.gelistirici && slugify(x.gelistirici) === slug);
  if (!rows.length) return null;
  const ad = rows[0].gelistirici as string;
  const projeler = rows
    .filter((x) => {
      const g: ProjeIcerikGirdi = {
        il: x.il, ilce: x.ilce, mahalle: x.mahalle, insaat_asamasi: x.durum, teslim_tarihi: x.teslim,
        kunye: {}, daireTipiSayisi: Array.isArray(x.oda_tipleri) ? x.oda_tipleri.length : 0, dogrulanmis: false,
      };
      return projeIcerikSkoru(g) >= ICERIK_ESIGI;
    })
    .map((x) => ({ ad: x.ad, slug: x.slug, il: x.il, ilce: x.ilce, asama: x.durum ?? null, odaTipleri: Array.isArray(x.oda_tipleri) ? x.oda_tipleri : [], kapak: x.kapak_url ?? null }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr"));
  if (!projeler.length) return null;
  return { id: `katalog:${slug}`, ad, slug, dogrulanmis: false, kaynak: "katalog", profil: {}, projeler };
}

/** Tek firma (slug = slugify(ad)). Önce ağda üretici, sonra katalog geliştirici. Yoksa null. */
export async function firmaGetir(slug: string): Promise<Firma | null> {
  const supabase = createAdminClient();
  const { data: ureticiler } = await supabase.from("uretici").select("id, ad, dogrulanmis, profil");
  const u = ((ureticiler ?? []) as any[]).find((x) => x.ad && slugify(x.ad) === slug);
  if (u) {
    const projeler = await esikGecenProjeler(supabase, u.id);
    if (projeler.length) return { id: u.id, ad: u.ad, slug, dogrulanmis: Boolean(u.dogrulanmis), kaynak: "proje", profil: (u.profil ?? {}) as FirmaProfil, projeler };
  }
  return katalogFirmaGetir(supabase, slug);
}

/** Sitemap + iç bağlantı: eşik-geçen projesi olan tüm firma slug'ları (uretici + katalog gelistirici). */
export async function tumFirmaSluglari(): Promise<{ slug: string; ad: string }[]> {
  const supabase = createAdminClient();
  const [{ data: ureticiler }, { data: projeRaw }, { data: katRaw }] = await Promise.all([
    supabase.from("uretici").select("id, ad, dogrulanmis, profil"),
    supabase
      .from("proje")
      .select("id, uretici_id, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )")
      .not("public_slug", "is", null),
    supabase.from("katalog_proje").select("il, ilce, mahalle, oda_tipleri, durum, teslim, gelistirici").eq("aktif", true).not("gelistirici", "is", null),
  ]);
  const seen = new Set<string>();
  const cikti: { slug: string; ad: string }[] = [];

  // 1) Ağdaki üreticiler
  const projeler = (projeRaw ?? []) as any[];
  const tipSayim = new Map<string, number>();
  if (projeler.length) {
    const { data: tipRaw } = await supabase.from("daire_tipi").select("proje_id").in("proje_id", projeler.map((x) => x.id));
    for (const t of (tipRaw ?? []) as { proje_id: string }[]) tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
  }
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
  for (const u of ((ureticiler ?? []) as any[])) {
    if (!u.ad || !esikliUretici.has(u.id)) continue;
    const s = slugify(u.ad);
    if (seen.has(s)) continue;
    seen.add(s);
    cikti.push({ slug: s, ad: u.ad });
  }

  // 2) Katalog geliştiricileri (eşik geçen ≥1 projesi olan)
  const katSayim = new Map<string, { ad: string; esik: boolean }>();
  for (const k of ((katRaw ?? []) as any[])) {
    if (!k.gelistirici) continue;
    const s = slugify(k.gelistirici);
    const g: ProjeIcerikGirdi = { il: k.il, ilce: k.ilce, mahalle: k.mahalle, insaat_asamasi: k.durum, teslim_tarihi: k.teslim, kunye: {}, daireTipiSayisi: Array.isArray(k.oda_tipleri) ? k.oda_tipleri.length : 0, dogrulanmis: false };
    const cur = katSayim.get(s) ?? { ad: k.gelistirici, esik: false };
    if (projeIcerikSkoru(g) >= ICERIK_ESIGI) cur.esik = true;
    katSayim.set(s, cur);
  }
  for (const [s, v] of katSayim) {
    if (!v.esik || seen.has(s)) continue;
    seen.add(s);
    cikti.push({ slug: s, ad: v.ad });
  }

  return cikti;
}
