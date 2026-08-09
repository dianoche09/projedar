/**
 * Konut projeleri hub veri katmanı (/konut-projeleri[/il[/ilce]]).
 * İki kaynağı (kendi DB `proje` + dış `katalog_proje`) birleştirir, il/ilçe
 * kırılımı üretir. Eşik geçen projeler /proje/[slug]'a linklenir; eşik-altı
 * projeler yalnız satır olarak listelenir (doorway-safe, thin-content koruması).
 * Yalnız server (createAdminClient); DEĞİŞMEZ #1 saldırı yüzeyi artmaz.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { projeIcerikSkoru, ICERIK_ESIGI, type ProjeIcerikGirdi } from "@/lib/seo/icerik-esigi";
import { slugify } from "@/lib/seo/slug";

export type HubProje = {
  ad: string;
  slug: string; // /proje/[slug] hedefi
  il: string;
  ilce: string | null;
  ilSlug: string;
  ilceSlug: string | null;
  asama: string | null; // insaat_asamasi | katalog durum
  odaTipleri: string[];
  m2: string | null;
  esik: boolean; // standalone sayfası açılıyor mu (link ver)
  kaynak: "proje" | "katalog";
};

export type IlOzet = { il: string; ilSlug: string; sayi: number };
export type IlceOzet = { ilce: string; ilceSlug: string; sayi: number };

function m2Metni(min: number | null, max: number | null): string | null {
  const a = min != null && min > 0 ? min : null;
  const b = max != null && max > 0 ? max : null;
  if (a == null && b == null) return null;
  if (a != null && b != null) return a === b ? `${a} m²` : `${a}–${b} m²`;
  return `${(a ?? b) as number} m²`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Tüm hub projelerini (proje + katalog) birleşik, eşik hesaplı döndürür. ISR cache'lenir. */
export async function tumHubProjeleri(): Promise<HubProje[]> {
  const supabase = createAdminClient();
  const cikti: HubProje[] = [];

  // 1) Kendi DB projeleri (public_slug'lı, konumu olan)
  const { data: projeRaw } = await supabase
    .from("proje")
    .select(
      "id, ad, public_slug, il, ilce, mahalle, lat, lng, ada, parsel, emsal, taks, insaat_asamasi, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )",
    )
    .not("public_slug", "is", null)
    .not("il", "is", null)
    .not("ilce", "is", null);
  const projeler = (projeRaw ?? []) as any[];

  if (projeler.length) {
    const { data: tipRaw } = await supabase
      .from("daire_tipi")
      .select("proje_id, oda, net_m2")
      .in("proje_id", projeler.map((x) => x.id));
    const tipSayim = new Map<string, number>();
    const odaMap = new Map<string, Set<string>>();
    const m2Map = new Map<string, number[]>();
    for (const t of (tipRaw ?? []) as { proje_id: string; oda: string | null; net_m2: number | null }[]) {
      tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
      if (t.oda) {
        const s = odaMap.get(t.proje_id) ?? new Set<string>();
        s.add(t.oda);
        odaMap.set(t.proje_id, s);
      }
      if (t.net_m2 != null && t.net_m2 > 0) {
        const arr = m2Map.get(t.proje_id) ?? [];
        arr.push(t.net_m2);
        m2Map.set(t.proje_id, arr);
      }
    }
    for (const p of projeler) {
      const girdi: ProjeIcerikGirdi = {
        il: p.il, ilce: p.ilce, mahalle: p.mahalle, lat: p.lat, lng: p.lng,
        ada: p.ada, parsel: p.parsel, emsal: p.emsal, taks: p.taks,
        insaat_asamasi: p.insaat_asamasi, teslim_tarihi: p.teslim_tarihi, baslama_tarihi: p.baslama_tarihi,
        kunye: p.kunye ?? {}, daireTipiSayisi: tipSayim.get(p.id) ?? 0,
        dogrulanmis: Boolean(p.uretici?.dogrulanmis), belge_dogrulandi: p.belge_dogrulandi,
      };
      const m2ler = m2Map.get(p.id) ?? [];
      cikti.push({
        ad: p.ad,
        slug: p.public_slug,
        il: p.il,
        ilce: p.ilce,
        ilSlug: slugify(p.il),
        ilceSlug: p.ilce ? slugify(p.ilce) : null,
        asama: p.insaat_asamasi ?? null,
        odaTipleri: [...(odaMap.get(p.id) ?? [])],
        m2: m2ler.length ? m2Metni(Math.min(...m2ler), Math.max(...m2ler)) : null,
        esik: projeIcerikSkoru(girdi) >= ICERIK_ESIGI,
        kaynak: "proje",
      });
    }
  }

  // 2) Katalog projeleri (aktif, konumu olan)
  const { data: katRaw } = await supabase
    .from("katalog_proje")
    .select("slug, ad, il, ilce, mahalle, oda_tipleri, m2_min, m2_max, durum, teslim")
    .eq("aktif", true)
    .not("il", "is", null)
    .not("ilce", "is", null);
  for (const k of (katRaw ?? []) as any[]) {
    const girdi: ProjeIcerikGirdi = {
      il: k.il, ilce: k.ilce, mahalle: k.mahalle, insaat_asamasi: k.durum, teslim_tarihi: k.teslim,
      kunye: {}, daireTipiSayisi: Array.isArray(k.oda_tipleri) ? k.oda_tipleri.length : 0, dogrulanmis: false,
    };
    cikti.push({
      ad: k.ad,
      slug: k.slug,
      il: k.il,
      ilce: k.ilce,
      ilSlug: slugify(k.il),
      ilceSlug: k.ilce ? slugify(k.ilce) : null,
      asama: k.durum ?? null,
      odaTipleri: Array.isArray(k.oda_tipleri) ? k.oda_tipleri : [],
      m2: m2Metni(k.m2_min ?? null, k.m2_max ?? null),
      esik: projeIcerikSkoru(girdi) >= ICERIK_ESIGI,
      kaynak: "katalog",
    });
  }

  return cikti;
}

/** İl özetleri (proje sayısıyla, alfabetik). */
export function illerOzet(hepsi: HubProje[]): IlOzet[] {
  const m = new Map<string, IlOzet>();
  for (const p of hepsi) {
    const cur = m.get(p.ilSlug) ?? { il: p.il, ilSlug: p.ilSlug, sayi: 0 };
    cur.sayi += 1;
    m.set(p.ilSlug, cur);
  }
  return [...m.values()].sort((a, b) => b.sayi - a.sayi || a.il.localeCompare(b.il, "tr"));
}

/** Bir ildeki ilçe özetleri. */
export function ilcelerOzet(hepsi: HubProje[], ilSlug: string): IlceOzet[] {
  const m = new Map<string, IlceOzet>();
  for (const p of hepsi) {
    if (p.ilSlug !== ilSlug || !p.ilce || !p.ilceSlug) continue;
    const cur = m.get(p.ilceSlug) ?? { ilce: p.ilce, ilceSlug: p.ilceSlug, sayi: 0 };
    cur.sayi += 1;
    m.set(p.ilceSlug, cur);
  }
  return [...m.values()].sort((a, b) => b.sayi - a.sayi || a.ilce.localeCompare(b.ilce, "tr"));
}
