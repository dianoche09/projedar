import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { okuOzellikler } from "@/lib/ozellikler";
import { Logo } from "@/components/Logo";
import { ProjedarBanner } from "@/components/seo/ProjedarBanner";
import { DavetPopup } from "@/components/seo/DavetPopup";
import { type ProjeIcerikVeri } from "@/components/seo/ProjeZenginIcerik";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { ASAMA_ETIKET, type InsaatAsama } from "@/lib/types";
import { projeIcerikBloklari } from "@/lib/seo/proje-icerik";
import { projeIcerikSkoru, ICERIK_ESIGI, type ProjeIcerikGirdi } from "@/lib/seo/icerik-esigi";
import { slugify } from "@/lib/seo/slug";
import { temaGorsel, havuzGorsel } from "@/lib/seo/tema-gorsel";
import { MapPin, Building2, CalendarClock, TrendingUp, Layers, ShieldCheck, ChevronRight, Ruler, TreePine, Compass } from "lucide-react";

export const revalidate = 3600; // proje meta yavaş değişir; canlı stok public'te yok

const SITE = "https://projedar.com";

type TipRow = { ad?: string | null; oda: string | null; net_m2: number | null; brut_m2?: number | null; plan_url?: string | null; banyo?: number | null; balkon?: number | null; otopark?: number | null };
type BenzerProje = { ad: string; public_slug: string; ilce: string | null; il: string | null; asama: string | null; odaTipleri: string[]; kapak: string | null };
type Kaynak = "proje" | "katalog";

const DURUM_ETIKET: Record<string, string> = { lansman: "Lansman", insaat: "İnşaat halinde", teslim: "Teslim edildi" };

/** m² bandı metni (min/max'tan). */
function m2Metni(min: number | null, max: number | null): string | null {
  const a = min != null && min > 0 ? min : null;
  const b = max != null && max > 0 ? max : null;
  if (a == null && b == null) return null;
  if (a != null && b != null) return a === b ? `${a} m²` : `${a}–${b} m²`;
  return `${(a ?? b) as number} m²`;
}
/** m² bandı daire_tipi listesinden (kendi DB). */
function m2BandTip(tipListe: TipRow[]): string | null {
  const m2ler = tipListe.map((t) => t.net_m2).filter((x): x is number => x != null && x > 0);
  return m2ler.length ? m2Metni(Math.min(...m2ler), Math.max(...m2ler)) : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** İki kaynağın (kendi DB proje + dış katalog) normalize edilmiş ortak görünümü. */
type Veri = {
  kaynak: Kaynak;
  p: any;
  u: any;
  tipListe: TipRow[];
  birimSayisi: number;
  benzer: BenzerProje[];
  teslimMetin: string | null;
  asamaMetin: string;
  m2Band: string | null;
};

function esigeGirdi(p: any, tipSayisi: number, dogrulanmis: boolean): ProjeIcerikGirdi {
  return {
    il: p.il, ilce: p.ilce, mahalle: p.mahalle, lat: p.lat, lng: p.lng,
    ada: p.ada, parsel: p.parsel, emsal: p.emsal, taks: p.taks,
    insaat_asamasi: p.insaat_asamasi, teslim_tarihi: p.teslim_tarihi, baslama_tarihi: p.baslama_tarihi,
    kunye: p.kunye ?? {}, daireTipiSayisi: tipSayisi, dogrulanmis, belge_dogrulandi: p.belge_dogrulandi,
  };
}

/** Aynı ilçe veya aynı müteahhitten, eşik geçen, public_slug'lı diğer projeler (internal linking). */
async function benzerProjeler(
  supabase: ReturnType<typeof createAdminClient>,
  p: any,
): Promise<BenzerProje[]> {
  const filtre: string[] = [];
  if (p.ilce) filtre.push(`ilce.eq.${p.ilce}`);
  if (p.uretici_id) filtre.push(`uretici_id.eq.${p.uretici_id}`);
  if (!filtre.length) return [];
  const { data } = await supabase
    .from("proje")
    .select("id, ad, public_slug, il, ilce, mahalle, insaat_asamasi, ada, parsel, emsal, taks, lat, lng, teslim_tarihi, baslama_tarihi, kunye, belge_dogrulandi, uretici:uretici_id ( dogrulanmis )")
    .not("public_slug", "is", null)
    .neq("id", p.id)
    .or(filtre.join(","))
    .limit(12);
  const list = (data ?? []) as any[];
  if (!list.length) return [];
  const { data: tipRaw } = await supabase.from("daire_tipi").select("proje_id, oda").in("proje_id", list.map((x) => x.id));
  const tipSayim = new Map<string, number>();
  const odaMap = new Map<string, Set<string>>();
  for (const t of (tipRaw ?? []) as { proje_id: string; oda: string | null }[]) {
    tipSayim.set(t.proje_id, (tipSayim.get(t.proje_id) ?? 0) + 1);
    if (t.oda) { const s = odaMap.get(t.proje_id) ?? new Set(); s.add(t.oda); odaMap.set(t.proje_id, s); }
  }
  return list
    .filter((x) => projeIcerikSkoru(esigeGirdi(x, tipSayim.get(x.id) ?? 0, Boolean(x.uretici?.dogrulanmis))) >= ICERIK_ESIGI)
    .slice(0, 6)
    .map((x) => ({ ad: x.ad, public_slug: x.public_slug, ilce: x.ilce, il: x.il, asama: x.insaat_asamasi, odaTipleri: [...(odaMap.get(x.id) ?? [])], kapak: null }));
}

/** Katalogdan aynı ilçeden eşik geçen diğer projeler (internal linking). */
async function benzerKatalog(
  supabase: ReturnType<typeof createAdminClient>,
  k: any,
): Promise<BenzerProje[]> {
  if (!k.ilce) return [];
  const { data } = await supabase
    .from("katalog_proje")
    .select("slug, ad, il, ilce, mahalle, oda_tipleri, durum, teslim, kapak_url")
    .eq("aktif", true)
    .eq("ilce", k.ilce)
    .neq("slug", k.slug)
    .limit(12);
  const list = (data ?? []) as any[];
  if (!list.length) return [];
  return list
    .filter((x) => projeIcerikSkoru(esigeGirdi(
      { il: x.il, ilce: x.ilce, mahalle: x.mahalle, insaat_asamasi: x.durum, teslim_tarihi: x.teslim, kunye: {} },
      Array.isArray(x.oda_tipleri) ? x.oda_tipleri.length : 0, false,
    )) >= ICERIK_ESIGI)
    .slice(0, 6)
    .map((x) => ({ ad: x.ad, public_slug: x.slug, ilce: x.ilce, il: x.il, asama: null, odaTipleri: Array.isArray(x.oda_tipleri) ? x.oda_tipleri : [], kapak: x.kapak_url ?? null }));
}

async function projeGetir(slug: string): Promise<Veri | null> {
  const supabase = createAdminClient();
  const { data: proje } = await supabase
    .from("proje")
    .select("*, uretici:uretici_id ( ad, dogrulanmis, profil )")
    .eq("public_slug", slug)
    .maybeSingle();
  if (!proje) return null;
  const [{ data: tipler }, { count: birimSayisi }] = await Promise.all([
    supabase.from("daire_tipi").select("ad, oda, net_m2, brut_m2, plan_url, banyo, balkon, otopark").eq("proje_id", proje.id),
    supabase.from("birim").select("id", { count: "exact", head: true }).eq("proje_id", proje.id),
  ]);
  const tipListe = (tipler ?? []) as TipRow[];
  const benzer = await benzerProjeler(supabase, proje);
  const teslimMetin = proje.teslim_tarihi ? new Date(proje.teslim_tarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }) : null;
  const asamaMetin = ASAMA_ETIKET[proje.insaat_asamasi as InsaatAsama] ?? "Planlama";
  return {
    kaynak: "proje", p: proje, u: proje.uretici, tipListe, birimSayisi: birimSayisi ?? 0, benzer,
    teslimMetin, asamaMetin, m2Band: m2BandTip(tipListe),
  };
}

/** Dış kaynaklı katalog projesi. Ağa girmişse ({eslesen_proje_id}) forward; yoksa normalize Veri. */
async function katalogGetir(slug: string): Promise<Veri | { forward: string } | null> {
  const supabase = createAdminClient();
  const { data: k } = await supabase
    .from("katalog_proje")
    .select("*")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();
  if (!k) return null;
  if (k.eslesen_proje_id) {
    const { data: eslesen } = await supabase.from("proje").select("public_slug").eq("id", k.eslesen_proje_id).maybeSingle();
    if (eslesen?.public_slug) return { forward: eslesen.public_slug };
  }
  const oda: string[] = Array.isArray(k.oda_tipleri) ? k.oda_tipleri : [];
  const tipListe: TipRow[] = oda.map((o) => ({ oda: o, net_m2: null }));
  // p-benzeri nesne: render + eşik fonksiyonları proje şemasını bekler (eksik alanlar null).
  const p = {
    id: k.id, public_slug: k.slug, ad: k.ad, il: k.il, ilce: k.ilce, mahalle: k.mahalle,
    lat: null, lng: null, ada: null, parsel: null, emsal: null, taks: null,
    insaat_asamasi: k.durum, teslim_tarihi: k.teslim, baslama_tarihi: null,
    ilerleme_yuzde: null, kira_getirisi_pct: null, kunye: {}, belge_dogrulandi: false,
    proje_web: k.proje_web, icerik: k.icerik ?? null,
    kapak_url: k.kapak_url ?? null, kapak_kaynak: k.kapak_kaynak ?? null,
  };
  const u = k.gelistirici ? { ad: k.gelistirici, dogrulanmis: false, profil: {} } : null;
  const benzer = await benzerKatalog(supabase, k);
  return {
    kaynak: "katalog", p, u, tipListe, birimSayisi: k.daire_sayisi ?? 0, benzer,
    teslimMetin: k.teslim ?? null, asamaMetin: DURUM_ETIKET[k.durum as string] ?? "Proje", m2Band: m2Metni(k.m2_min, k.m2_max),
  };
}

/** Birleşik resolver: önce kendi DB (opt-in public_slug), sonra dış katalog (fallback/forward). */
async function veriGetir(slug: string): Promise<Veri | { forward: string } | null> {
  const kendi = await projeGetir(slug);
  if (kendi) return kendi;
  return katalogGetir(slug);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Slug'dan deterministik varyant indeksi (thin-content: sabit cevaplar sayfadan sayfaya çeşitlensin). */
function varyant(slug: string, n: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) & 0xffff;
  return h % n;
}

/** İki-mod SSS (arama niyeti + Projedar B2B). Görünür accordion + FAQPage JSON-LD tek kaynak. */
function sssListesi(args: { ad: string; konum: string; gelistirici: string | null; teslim: string | null; odaTipleri: string[]; m2Band: string | null; kaynak: Kaynak; slug: string }): { s: string; c: string }[] {
  const { ad, konum, gelistirici, teslim, odaTipleri, m2Band, kaynak, slug } = args;
  const list: { s: string; c: string }[] = [];
  if (konum) list.push({ s: `${ad} nerede, hangi ilçede yer alıyor?`, c: `${ad}, ${konum} konumunda yer alan bir yeni konut projesidir.` });
  if (gelistirici) list.push({ s: `${ad} hangi firma tarafından yapılıyor?`, c: `${ad} projesi ${gelistirici} tarafından geliştirilmektedir.` });
  if (odaTipleri.length) list.push({ s: `${ad} projesinde hangi daire tipleri var?`, c: `${ad} projesinde ${odaTipleri.join(", ")} tiplerinde daireler bulunmaktadır${m2Band ? `; büyüklükler ${m2Band} aralığındadır` : ""}.` });
  if (teslim) list.push({ s: `${ad} ne zaman teslim edilecek?`, c: `${ad} projesinin tahmini teslim dönemi ${teslim} olarak belirtilmektedir; güncel bilgi geliştiriciden teyit edilmelidir.` });
  if (kaynak === "katalog") {
    // Ağda-değil: satış iddiası YOK; arama-niyeti + nötr bilgilendirme.
    const c = [
      `${ad} bu bilgi sayfasında künye, konum ve daire yapısıyla derlenmiştir. Güncel fiyat ve stok için projenin geliştiricisiyle ya da yetkili bir gayrimenkul danışmanıyla iletişime geçilmelidir.`,
      `${ad} hakkındaki bu sayfa olgusal proje bilgisini toplar; fiyat ve müsaitlik zamanla değiştiğinden güncel durumu geliştiriciden ya da yetkili danışmandan teyit etmek gerekir.`,
    ][varyant(slug, 2)];
    list.push({ s: `${ad} hakkında güncel bilgiyi nereden alabilirim?`, c });
  } else {
    list.push({ s: `${ad} projesini Projedar ağında nasıl satarım?`, c: `Gayrimenkul danışmanı olarak Projedar ağına ücretsiz katılır, müteahhidin size tahsis ettiği daireleri canlı stoktan paylaşırsınız. Projedar satış komisyonuna ortak olmaz; kazancınız tamamen sizde kalır.` });
  }
  const fiyatC = [
    `Projedar bir ilan portalı değildir; fiyat ve güncel stok yalnız ağdaki yetkili gayrimenkul danışmanlarına canlı açılır. Bu sayfa projenin künye, konum ve daire yapısı bilgisini içerir.`,
    `Bu sayfada fiyat listesi gösterilmez. ${ad} için güncel fiyat ve müsait stok, yalnız ağdaki yetkili danışmanlara canlı olarak açılır; sayfa konum, künye ve daire tiplerini kapsar.`,
  ][varyant(slug, 2)];
  list.push({ s: `${ad} fiyatları ne kadar, bu sayfada var mı?`, c: fiyatC });
  return list;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const veri = await veriGetir(slug);
  if (!veri || "forward" in veri) return {};
  const p = veri.p;
  const u = veri.u;
  if (projeIcerikSkoru(esigeGirdi(p, veri.tipListe.length, Boolean(u?.dogrulanmis))) < ICERIK_ESIGI) return {};
  const konum = [p.mahalle, p.ilce, p.il].filter(Boolean).join(", ");
  const baslik = `${p.ad}${konum ? ` · ${konum}` : ""} | Projedar`;
  const aciklama = `${p.ad} konut projesi künyesi, konumu ve özellikleri.${u?.ad ? ` ${u.ad} projesi.` : ""} Bu projeyi Projedar ağında satmak isteyen gayrimenkul danışmanları ve projeyi yöneten müteahhitler için.`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: `/proje/${slug}` },
    openGraph: { title: baslik, description: aciklama, type: "website", siteName: "Projedar", url: `${SITE}/proje/${slug}`, locale: "tr_TR" },
    twitter: { card: "summary_large_image", title: baslik },
    robots: { index: true, follow: true },
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function jsonLd(p: any, u: any, birimSayisi: number, odaTipleri: string[], sss: { s: string; c: string }[]): object {
  const ozellikler = okuOzellikler((p.kunye ?? {}) as Record<string, unknown>);
  const amenity = Object.values(ozellikler).flat().filter(Boolean).map((ad) => ({ "@type": "LocationFeatureSpecification", name: ad, value: true }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}/proje/${p.public_slug}#sayfa`, url: `${SITE}/proje/${p.public_slug}`, name: `${p.ad} — ${[p.ilce, p.il].filter(Boolean).join(", ")}`, inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}/#website` } },
      {
        "@type": "ApartmentComplex",
        "@id": `${SITE}/proje/${p.public_slug}#proje`,
        name: p.ad,
        address: { "@type": "PostalAddress", addressCountry: "TR", addressRegion: p.il ?? undefined, addressLocality: p.ilce ?? undefined, streetAddress: p.mahalle ?? undefined },
        ...(p.lat != null && p.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
        ...(birimSayisi > 0 ? { numberOfAccommodationUnits: birimSayisi } : {}),
        ...(odaTipleri.length ? { accommodationCategory: odaTipleri.join(", ") } : {}),
        ...(amenity.length ? { amenityFeature: amenity } : {}),
        ...(u?.ad ? { developer: { "@type": "Organization", name: u.ad } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE}/proje/${p.public_slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE },
          { "@type": "ListItem", position: 2, name: "Konut projeleri", item: `${SITE}/konut-projeleri` },
          ...(p.il ? [{ "@type": "ListItem", position: 3, name: p.il, item: `${SITE}/konut-projeleri/${slugify(p.il)}` }] : []),
          { "@type": "ListItem", position: 4, name: p.ad, item: `${SITE}/proje/${p.public_slug}` },
        ],
      },
      { "@type": "FAQPage", "@id": `${SITE}/proje/${p.public_slug}#faq`, mainEntity: sss.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })) },
    ],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default async function ProjeSeoSayfa({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const veri = await veriGetir(slug);
  if (!veri) notFound();
  if ("forward" in veri) redirect(`/proje/${veri.forward}`);

  const p = veri.p;
  const u = veri.u;
  const kaynak = veri.kaynak;
  const dogrulanmis = Boolean(u?.dogrulanmis);
  if (projeIcerikSkoru(esigeGirdi(p, veri.tipListe.length, dogrulanmis)) < ICERIK_ESIGI) notFound();

  const kunye = (p.kunye ?? {}) as Record<string, unknown>;
  const ozellikler = okuOzellikler(kunye);
  const malzeme = Array.isArray(kunye.malzeme) ? (kunye.malzeme as string[]) : [];
  const aciklama = typeof kunye.aciklama === "string" ? (kunye.aciklama as string).trim() : "";
  const konum = [p.mahalle, p.ilce, p.il].filter(Boolean).join(", ");
  const icerik = (p.icerik ?? null) as ProjeIcerikVeri | null;
  const bloklar = projeIcerikBloklari({ ad: p.ad, il: p.il, ilce: p.ilce, mahalle: p.mahalle, slug });

  const odaTipleri = [...new Set(veri.tipListe.map((t) => t.oda).filter(Boolean) as string[])];
  const m2Band = veri.m2Band;
  const sss = sssListesi({ ad: p.ad, konum, gelistirici: u?.ad ?? null, teslim: veri.teslimMetin, odaTipleri, m2Band, kaynak, slug });

  const kunyeSatir: [string, string][] = [];
  if (p.ada || p.parsel) kunyeSatir.push(["Ada / Parsel", [p.ada, p.parsel].filter(Boolean).join(" / ")]);
  if (p.emsal) kunyeSatir.push(["Emsal (KAKS)", String(p.emsal)]);
  if (p.taks) kunyeSatir.push(["TAKS", String(p.taks)]);
  if (kunye.imar_durumu) kunyeSatir.push(["İmar Durumu", String(kunye.imar_durumu)]);
  if (kunye.arsa_alani) kunyeSatir.push(["Arsa Alanı", `${kunye.arsa_alani} m²`]);
  if (kunye.otopark) kunyeSatir.push(["Otopark", String(kunye.otopark)]);

  const asama = veri.asamaMetin;
  const ilerleme = Number(p.ilerleme_yuzde ?? 0);
  const teslim = veri.teslimMetin;
  const kiraGetirisi = p.kira_getirisi_pct != null ? Number(p.kira_getirisi_pct) : null;

  // ---- Görsel havuzu (temsili; il-bazlı hero + slug-hash rotasyon) ----
  const heroCity = temaGorsel(p.il);
  const kapak = (p.kapak_url ?? null) as string | null; // katalog: kaynak sitenin GERÇEK og:image kapağı
  const gorsel = kapak ?? heroCity ?? havuzGorsel(slug, "konum"); // gerçek kapak > il-hero > havuz
  const detayGorsel = havuzGorsel(slug, "detay");
  const interiorGorsel = havuzGorsel(slug, "ic");
  const amenityGorsel = havuzGorsel(slug, "amenity");
  const cevreGorsel = havuzGorsel(slug, "konum");
  const planlar = kaynak === "proje" ? veri.tipListe.filter((tp) => tp.plan_url) : []; // Ağda: gerçek daire/kat planları

  // ---- Zengin içerik metinleri (varsa) ----
  const t = (icerik?.metin ?? {}) as { ozet?: string | null; konum_cevre?: string | null; daire_tipleri?: string | null; ozellikler_metni?: string | null; yatirim_teslim?: string | null };
  const ozetMetin = (t.ozet ?? (aciklama || [bloklar.giris, bloklar.surec].filter(Boolean).join(" "))) as string;
  const konumMetin = t.konum_cevre ?? null;
  const daireMetin = t.daire_tipleri ?? null;
  const donatiMetin = t.ozellikler_metni ?? null;
  const yatirimMetin = t.yatirim_teslim ?? null;
  const dagilim = (icerik?.ekstra?.daire_dagilimi ?? null) as Record<string, number> | null;
  const dagilimMax = dagilim ? Math.max(...Object.values(dagilim)) : 0;
  const cevre = (Array.isArray(icerik?.cevre_noktalar) ? icerik!.cevre_noktalar : []) as string[];
  const donatiListe = (
    Array.isArray(icerik?.ozellikler) && (icerik!.ozellikler as string[]).length
      ? (icerik!.ozellikler as string[])
      : (Object.values(ozellikler).flat().filter(Boolean) as string[])
  ).slice(0, 14);

  // ---- Hero istatistikleri + koyu rakam bandı ----
  const heroStats: [string, string][] = [];
  if (veri.birimSayisi > 0) heroStats.push([String(veri.birimSayisi), "konut birimi"]);
  if (odaTipleri.length) heroStats.push([odaTipleri.join(" · "), "daire tipleri"]);
  if (m2Band) heroStats.push([m2Band, "büyüklük"]);
  heroStats.push([teslim ?? asama, teslim ? "teslim" : "durum"]);

  const projeAlani = icerik?.proje_alani_m2 ?? (typeof kunye.arsa_alani === "number" ? (kunye.arsa_alani as number) : null);
  const figuresBand: [string, string][] = [];
  if (projeAlani) figuresBand.push([`${projeAlani.toLocaleString("tr-TR")} m²`, "proje alanı"]);
  if (icerik?.blok_sayisi) figuresBand.push([String(icerik.blok_sayisi), "blok / kule"]);
  if (veri.birimSayisi > 0) figuresBand.push([String(veri.birimSayisi), "konut birimi"]);
  if (m2Band) figuresBand.push([m2Band, "daire büyüklüğü"]);
  const showFigures = Boolean(projeAlani || icerik?.blok_sayisi) && figuresBand.length >= 2;

  const up = (u?.profil ?? {}) as Record<string, string | null>;

  after(() => kayitYaz({ tip: "goruntuleme", ...(kaynak === "proje" ? { projeId: p.id } : {}), payload: { kaynak: kaynak === "proje" ? "proje_seo" : "katalog_seo", slug } }));

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, u, veri.birimSayisi, odaTipleri, sss)) }} />

      {/* ============ TOPBAR (şeffaf → scroll'da katı; hero üstüne biner) ============ */}
      <ProjeTopbar />

      {/* ============ SİNEMATİK HERO ============ */}
      <section className="relative isolate flex min-h-[86svh] flex-col justify-end overflow-hidden bg-ink text-white">
        <Image src={gorsel} alt="" fill priority sizes="100vw" className="scale-105 object-cover object-[50%_45%]" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,16,28,0.55) 0%, rgba(6,16,28,0.12) 30%, rgba(6,16,28,0.5) 64%, rgba(6,16,28,0.94) 100%)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 20% 32%, rgba(30,155,138,0.22) 0%, transparent 60%)" }} />
        <span className="absolute bottom-4 right-4 z-10 rounded-md border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] text-white/70">{kapak ? `Görsel: ${p.kapak_kaynak ?? "kaynak"}` : "Temsili görsel"}</span>
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-24 sm:px-6">
          <nav aria-label="Konum yolu" className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Ana sayfa</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/konut-projeleri" className="hover:text-white">Konut projeleri</Link>
            {p.il ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${slugify(p.il)}`} className="hover:text-white">{p.il}</Link></>) : null}
            {p.ilce ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${slugify(p.il)}/${slugify(p.ilce)}`} className="hover:text-white">{p.ilce}</Link></>) : null}
          </nav>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
            {kaynak === "proje" ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[#7fd4c4]"><span className="size-2 rounded-full bg-green nabiz" />Projedar ağında · canlı stok</span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/80">Konut projesi dosyası</span>
            )}
            {dogrulanmis ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90"><ShieldCheck size={13} strokeWidth={2} /> Doğrulanmış müteahhit</span> : null}
            {kaynak === "proje" && ilerleme > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/85">{asama} · %{ilerleme}</span> : null}
          </div>

          <h1 className="mt-5 font-display font-black leading-[0.94] tracking-tight [text-shadow:0_2px_30px_rgba(0,0,0,0.35)] text-[clamp(2.6rem,8vw,5rem)]">{p.ad}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-white/80">
            {konum ? <span className="inline-flex items-center gap-1.5 text-lg"><MapPin size={17} className="opacity-70" />{konum}</span> : null}
            {u?.ad ? <span className="inline-flex items-center gap-1.5 text-sm text-white/65"><Building2 size={14} className="opacity-70" />{u.ad}</span> : null}
            {kiraGetirisi != null ? <span className="inline-flex items-center gap-1.5 text-sm text-[#7fd4c4]"><TrendingUp size={14} />%{kiraGetirisi} kira getirisi</span> : null}
          </div>

          {heroStats.length ? (
            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.slice(0, 4).map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <p className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">{v}</p>
                  <p className="mt-1 text-[11.5px] text-white/70">{l}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {kaynak === "proje" ? (
              <>
                <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action hover:-translate-y-0.5">Canlı stoğu gör</Link>
                <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/75"><span className="size-2 rounded-full bg-green nabiz" />Canlı stok danışman panelinde</span>
              </>
            ) : (
              <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action hover:-translate-y-0.5">Bu projeyi ağda sat</Link>
            )}
          </div>
        </div>
      </section>

      {/* ============ PROJEDAR TANITIM BANNER (hero altı) ============ */}
      <ProjedarBanner />

      {/* ============ GENEL BAKIŞ (editoryal split + görsel) ============ */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.3fr_.9fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Genel bakış</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{p.ad}</h2>
            <p className="mt-5 text-pretty text-[15.5px] leading-relaxed text-ink-soft sm:text-base">{ozetMetin}</p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-ink-soft">
              {veri.birimSayisi > 0 ? <span className="inline-flex items-center gap-1.5"><Layers size={13} className="text-teal-d" />{veri.birimSayisi} bağımsız bölüm</span> : null}
              {teslim ? <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} className="text-teal-d" />Teslim {teslim}</span> : null}
              {p.proje_web ? <a href={p.proje_web} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1 font-semibold text-teal-d hover:underline">Resmi proje sitesi ↗</a> : null}
            </div>
          </div>
          <figure className="relative overflow-hidden rounded-[22px] shadow-[var(--golge-3)]">
            <Image src={detayGorsel} alt={`${p.ad} (temsili görsel)`} width={900} height={1200} sizes="(max-width: 1024px) 100vw, 420px" className="aspect-[3/4] w-full object-cover" />
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/80">Temsili görsel</span>
          </figure>
        </div>
      </section>

      {/* ============ KOYU RAKAM BANDI (zengin veri varsa) ============ */}
      {showFigures ? (
        <section className="px-5 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="komuta relative overflow-hidden rounded-[26px] px-7 py-10 sm:px-10">
              <div className="komuta-grid absolute inset-0" aria-hidden />
              <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
                {figuresBand.slice(0, 4).map(([v, l]) => (
                  <div key={l}>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-[40px]">{v}</p>
                    <p className="mt-2 text-[12.5px] text-white/65">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ DAİRE PLANLARI (Ağda: gerçek kat/daire planları) ============ */}
      {planlar.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <BolumBaslik etiket="Daire tipleri" baslik="Daire tipleri ve kat planları" alt="Fiyat ve müsaitlik bu sayfada gösterilmez; canlı stok yalnız yetkili danışmana açılır." />
            <div className={`mx-auto mt-10 grid grid-cols-1 gap-5 ${planlar.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : planlar.length === 2 ? "max-w-3xl sm:grid-cols-2" : "max-w-sm"}`}>
              {planlar.map((tp) => (
                <div key={`${tp.ad ?? tp.oda ?? ""}-${tp.net_m2 ?? ""}`} className="kart kart-3d flex flex-col overflow-hidden p-0">
                  <div className="relative aspect-[4/3] border-b border-hair bg-soft">
                    <Image src={tp.plan_url as string} alt={`${p.ad} ${tp.oda ?? ""} daire planı`} width={520} height={390} sizes="(max-width: 1024px) 100vw, 380px" className="h-full w-full object-contain p-5" />
                    <span className="absolute left-3 top-3 rounded-md bg-navy px-2.5 py-1 font-mono text-[11px] font-semibold text-white">{tp.oda}</span>
                    <span className="absolute right-3 top-3 rounded bg-white/75 px-2 py-0.5 font-mono text-[10px] font-medium text-ink-soft backdrop-blur-sm">Kat planı</span>
                  </div>
                  <div className="p-4">
                    <p className="font-display font-bold text-ink">{tp.ad ?? `${tp.oda} daire`}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      {tp.net_m2 ? <span className="rounded-md bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[11px] font-semibold text-teal-d">{tp.net_m2} m² net</span> : null}
                      {tp.brut_m2 ? <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft">{tp.brut_m2} m² brüt</span> : null}
                      {tp.banyo ? <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft">{tp.banyo} banyo</span> : null}
                      {tp.balkon ? <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft">balkon</span> : null}
                      {tp.otopark ? <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-soft">otopark</span> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {daireMetin ? <p className="mx-auto mt-6 max-w-3xl text-pretty text-center text-[15px] leading-relaxed text-ink-soft">{daireMetin}</p> : null}
          </div>
        </section>
      ) : (daireMetin || odaTipleri.length || dagilim) ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
            <figure className="relative overflow-hidden rounded-[22px] shadow-[var(--golge-3)]">
              <Image src={interiorGorsel} alt={`${p.ad} iç mekan (temsili görsel)`} width={1200} height={900} sizes="(max-width: 1024px) 100vw, 560px" className="aspect-[4/3] w-full object-cover" />
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/80">Temsili görsel</span>
            </figure>
            <div>
              <div className="flex items-center gap-2"><Ruler size={18} className="text-teal-d" /><p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Daire tipleri</p></div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Daire tipleri ve büyüklükler</h2>
              {odaTipleri.length ? (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {odaTipleri.map((o) => <span key={o} className="rounded-lg bg-[var(--color-teal-soft)] px-3 py-1.5 font-mono text-[13px] font-semibold text-teal-d">{o}</span>)}
                  {m2Band ? <span className="rounded-lg bg-paper px-3 py-1.5 font-mono text-[13px] text-ink-soft">{m2Band}</span> : null}
                </div>
              ) : null}
              {dagilim && dagilimMax > 0 ? (
                <div className="mt-5 grid max-w-md gap-3">
                  {Object.entries(dagilim).map(([tip, adet]) => (
                    <div key={tip} className="grid grid-cols-[56px_1fr_auto] items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-ink">{tip}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-hair"><span className="block h-full rounded-full bg-gradient-to-r from-teal to-green" style={{ width: `${Math.round((adet / dagilimMax) * 100)}%` }} /></span>
                      <span className="font-mono text-xs text-ink-soft">{adet.toLocaleString("tr-TR")} adet</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {daireMetin ? <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink-soft">{daireMetin}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ YAŞAM & SOSYAL DONATI (görsel bant + içerik) ============ */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[26px] shadow-[var(--golge-3)]">
            <Image src={amenityGorsel} alt={`${p.ad} sosyal yaşam alanları (temsili görsel)`} width={1600} height={900} sizes="(max-width: 1200px) 100vw, 1152px" className="h-[300px] w-full object-cover sm:h-[400px]" />
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,16,28,0.12) 0%, rgba(6,16,28,0.2) 42%, rgba(6,16,28,0.85) 100%)" }} />
            <span className="absolute right-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/80">Temsili görsel</span>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#7fd4c4]">Yaşam</p>
              <h2 className="mt-2 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white sm:text-[32px]">Sosyal alanlar ve yaşam kalitesi</h2>
            </div>
          </div>
          {donatiMetin || donatiListe.length || malzeme.length ? (
            <div className="mt-6">
              {donatiMetin ? <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-ink-soft">{donatiMetin}</p> : null}
              {donatiListe.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {donatiListe.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-paper px-3 py-1.5 text-[13px] text-ink"><TreePine size={13} className="text-teal-d" />{d}</span>
                  ))}
                </div>
              ) : null}
              {malzeme.length ? (
                <div className="mt-5 border-t border-hair pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Yapı malzemeleri ve standartlar</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{malzeme.map((m) => <span key={m} className="rounded-md bg-paper px-2.5 py-1 text-xs text-ink">{m}</span>)}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* ============ KONUM & ÇEVRE (görsel bant + metin + POI + OSM) ============ */}
      {konum ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[26px] shadow-[var(--golge-3)]">
              <Image src={cevreGorsel} alt={`${p.ad} çevresi ve ulaşım (temsili görsel)`} width={1600} height={900} sizes="(max-width: 1200px) 100vw, 1152px" className="h-[300px] w-full object-cover sm:h-[400px]" />
              <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(6,16,28,0.88) 0%, rgba(6,16,28,0.5) 48%, rgba(6,16,28,0.22) 100%)" }} />
              <span className="absolute right-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/80">Temsili görsel</span>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#7fd4c4]">Konum &amp; çevre</p>
                <h2 className="mt-2 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white sm:text-[32px]">{konum}</h2>
              </div>
            </div>
            {konumMetin ? <p className="mt-6 max-w-3xl text-pretty text-[15px] leading-relaxed text-ink-soft">{konumMetin}</p> : null}
            {cevre.length ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {cevre.map((c) => (
                  <div key={c} className="flex items-start gap-2 rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink"><Compass size={15} className="mt-0.5 flex-none text-teal-d" /><span>{c}</span></div>
                ))}
              </div>
            ) : null}
            {p.lat != null && p.lng != null ? (
              <div className="mt-6 kart overflow-hidden p-0">
                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(p.lng) - 0.008}%2C${Number(p.lat) - 0.005}%2C${Number(p.lng) + 0.008}%2C${Number(p.lat) + 0.005}&layer=mapnik&marker=${p.lat}%2C${p.lng}`} title={`${p.ad} konumu`} className="h-72 w-full" loading="lazy" />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ============ YATIRIM & TESLİM (icerik varsa) ============ */}
      {yatirimMetin ? (
        <section className="px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="kart signal-top p-7 sm:p-9" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Yatırım &amp; teslim</p>
              <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">{yatirimMetin}</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ KÜNYE (imar/parsel, varsa) ============ */}
      {kunyeSatir.length ? (
        <section className="px-5 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Künye</p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink">Proje künyesi</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {kunyeSatir.map(([k, v]) => (<div key={k} className="kart p-4"><p className="text-xs text-ink-soft">{k}</p><p className="mt-1 font-display font-bold text-ink">{v}</p></div>))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ MÜTEAHHİT KARTI (yalnız anlamlı bilgi varsa; boş/yarım kart gösterme) ============ */}
      {u?.ad && (kaynak === "proje" || up.hakkinda || up.kurulus_yili || up.il || up.ilce) ? (
        <section className="px-5 py-14 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="kart signal-top p-7" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
              <div className="flex items-start gap-4">
                <span className="inline-grid size-12 flex-none place-items-center rounded-2xl bg-[rgba(19,49,75,0.08)]" aria-hidden><Building2 size={24} strokeWidth={1.6} color="var(--color-navy)" /></span>
                <div>
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Projeyi yöneten müteahhit</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="font-display text-xl font-bold tracking-tight text-ink">{u.ad}</h2>{dogrulanmis ? <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal"><ShieldCheck size={11} /> Doğrulanmış</span> : null}</div>
                  {up.hakkinda ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{up.hakkinda}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-soft">{up.kurulus_yili ? <span>Kuruluş {up.kurulus_yili}</span> : null}{(up.il || up.ilce) ? <span>{[up.ilce, up.il].filter(Boolean).join(", ")}</span> : null}</div>
                  {kaynak === "proje" ? (
                    <Link href={`/firma/${slugify(u.ad)}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal transition-colors hover:underline">{u.ad} firmasının tüm projeleri <ChevronRight size={14} /></Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ İKİ-MOD CTA (koyu komuta; dikkat çekici para bölümü) ============ */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="komuta relative overflow-hidden rounded-[28px] p-8 shadow-[var(--golge-3)] sm:p-12">
            <div className="komuta-grid absolute inset-0" aria-hidden />
            <div className="relative text-white">
              {kaynak === "proje" ? (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold text-[#7fd4c4] backdrop-blur-md"><span className="size-2 rounded-full bg-green nabiz" />Bu proje Projedar ağında · canlı stok danışman panelinde</span>
                  <h2 className="mt-4 max-w-[24ch] font-display text-3xl font-extrabold tracking-tight sm:text-[40px]">Bu proje Projedar ağında. Stok canlı.</h2>
                  <p className="mt-3 max-w-[62ch] text-pretty text-[15.5px] leading-relaxed text-white/75 sm:text-base">Tahsisli birimleri canlı fiyat ve durumla görür, müşterine tek dokunuşla paylaşırsın. Müsaitlik ve fiyat tek doğru kaynaktan anlık güncellenir; birim sayıları herkese açık gösterilmez.</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="kart signal-top p-6" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Gayrimenkul danışmanı · sana tahsisli</p>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">Canlı daire stoğunu gör</h3>
                      <p className="mt-2 text-sm text-ink-soft">Sana tahsisli birimlerin daire, fiyat ve durumunu panelde canlı gör, müşterine paylaş.</p>
                      <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action mt-4 hover:-translate-y-0.5">Canlı daireleri gör</Link>
                    </div>
                    <div className="kart signal-top p-6" style={{ ["--_sig" as string]: "var(--color-amber)" }}>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Henüz tahsisli değil misin?</p>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">Tahsis talep et</h3>
                      <p className="mt-2 text-sm text-ink-soft">Geliştiriciden bu projeye tahsis iste; onaylanınca canlı stok erişimin açılır.</p>
                      <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-ghost mt-4">Tahsis talep et</Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[12px] text-white/70 backdrop-blur-md">Bu proje henüz Projedar ağında değil</span>
                  <h2 className="mt-4 max-w-[24ch] font-display text-3xl font-extrabold tracking-tight sm:text-[40px]">Bu projeyi Projedar ağında sat.</h2>
                  <p className="mt-3 max-w-[62ch] text-pretty text-[15.5px] leading-relaxed text-white/75 sm:text-base">Projedar açık pazar değil: erişim geliştirici kontrollü tahsisle yönetilen nötr bir ağdır. Proje ağa girdiğinde tahsisli birimler tek canlı havuzdan yönetilir.</p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="kart signal-top p-6" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Gayrimenkul danışmanı</p>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">Bu projeyi ağda sat</h3>
                      <p className="mt-2 text-sm text-ink-soft">Ücretsiz katıl; proje ağa girince tahsis önceliği ve canlı stok erişimi sende olsun.</p>
                      <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action mt-4 hover:-translate-y-0.5">Danışman olarak katıl</Link>
                    </div>
                    <div className="kart signal-top p-6" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Geliştirici / müteahhit</p>
                      <h3 className="mt-2 font-display text-lg font-bold text-ink">Bu proje senin mi? Ağa ekle</h3>
                      <p className="mt-2 text-sm text-ink-soft">Stoğunu, fiyatını ve dağıtımını tek noktadan yönet; yalnız yetkili danışmanlar satsın.</p>
                      <Link href="/kayit?rol=uretici&kaynak=proje-seo" className="btn-ghost mt-4">Projeni ağa ekle</Link>
                    </div>
                  </div>
                </>
              )}
              <p className="mt-7 border-t border-white/15 pt-5 text-center text-sm text-white/70"><span className="font-semibold text-[#7fd4c4]">Projedar satış komisyonuna ortak olmaz.</span> Kazancınız tamamen sizde kalır.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ İLGİLİ PROJELER (internal linking) ============ */}
      {veri.benzer.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <div><BolumBaslik etiket="Ağdaki diğer projeler" baslik={p.ilce ? `${p.ilce} ve çevresinden` : "İlgili projeler"} /></div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {veri.benzer.map((b) => {
                const kapak = b.kapak ?? temaGorsel(b.il) ?? havuzGorsel(b.public_slug, "konum");
                return (
                  <Link key={b.public_slug} href={`/proje/${b.public_slug}`} className="kart kart-3d group flex h-full flex-col overflow-hidden p-0">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={kapak} alt="" fill sizes="(max-width: 1024px) 100vw, 380px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.04) 0%, rgba(8,20,34,0.58) 100%)" }} />
                      <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{ASAMA_ETIKET[b.asama as InsaatAsama] ?? "Proje"}</span>
                      {b.kapak ? null : <span className="absolute right-3 top-3 rounded bg-black/35 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm">Temsili</span>}
                      <h3 className="absolute inset-x-3 bottom-2.5 font-display text-base font-bold tracking-tight text-white drop-shadow">{b.ad}</h3>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="flex items-center gap-1 text-xs text-ink-soft"><MapPin size={12} className="opacity-70" />{[b.ilce, b.il].filter(Boolean).join(", ")}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {b.odaTipleri.length ? <div className="flex flex-wrap gap-1">{b.odaTipleri.slice(0, 4).map((o) => <span key={o} className="rounded bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10.5px] font-semibold text-teal-d">{o}</span>)}</div> : <span />}
                        <ChevronRight size={16} className="flex-none text-ink-soft transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ GÖRÜNÜR FAQ ============ */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <div><BolumBaslik etiket="Sık sorulanlar" baslik="Bu proje ve Projedar hakkında" /></div>
          <div className="mt-10 flex flex-col gap-3">
            {sss.map((q) => (
              <div key={q.s}>
                <details className="sss-item kart p-0 hover:-translate-y-0.5">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER (global) ============ */}
      <footer className="mt-auto border-t border-[var(--cizgi)] bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-5 py-12 sm:px-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo size={24} wordmark />
            <p className="max-w-xs text-center text-xs leading-relaxed text-ink-soft md:text-left">Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan kapalı konut stoğu ağı.</p>
          </div>
          <nav aria-label="Bağlantılar" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink-soft">
            <Link href="/muteahhit" className="transition-colors hover:text-ink hover:underline">Müteahhitler için</Link>
            <Link href="/emlakci" className="transition-colors hover:text-ink hover:underline">Danışmanlar için</Link>
            <Link href="/konut-projeleri" className="transition-colors hover:text-ink hover:underline">Konut projeleri</Link>
            <Link href="/kullanim-kosullari" className="transition-colors hover:text-ink hover:underline">Kullanım Koşulları</Link>
            <Link href="/gizlilik" className="transition-colors hover:text-ink hover:underline">Gizlilik</Link>
            <Link href="/kvkk-aydinlatma" className="transition-colors hover:text-ink hover:underline">KVKK</Link>
          </nav>
        </div>
        <div className="border-t border-[var(--cizgi)] px-5 py-5 text-center text-[11px] text-[var(--ink-faint)] sm:px-6">© 2026 Projedar, Tüm hakları saklıdır.</div>
      </footer>

      <DavetPopup slug={slug} projeAd={p.ad} />
    </main>
  );
}

/** Bölüm başlığı ritmi (landing deseni: teal etiket + büyük başlık + açıklama). */
function BolumBaslik({ etiket, baslik, alt }: { etiket: string; baslik: string; alt?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">{etiket}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{baslik}</h2>
      {alt ? <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">{alt}</p> : null}
    </div>
  );
}
