import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { okuOzellikler, ozellikVarMi } from "@/lib/ozellikler";
import { OzellikGoster } from "@/components/OzellikGoster";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { B2BCta } from "@/components/seo/B2BCta";
import { ASAMA_ETIKET, type InsaatAsama } from "@/lib/types";
import { projeIcerikBloklari } from "@/lib/seo/proje-icerik";
import { projeIcerikSkoru, ICERIK_ESIGI, type ProjeIcerikGirdi } from "@/lib/seo/icerik-esigi";
import { slugify } from "@/lib/seo/slug";
import { temaGorsel } from "@/lib/seo/tema-gorsel";
import { MapPin, Building2, CalendarClock, TrendingUp, Layers, ShieldCheck, ChevronRight } from "lucide-react";

export const revalidate = 3600; // proje meta yavaş değişir; canlı stok public'te yok

const SITE = "https://projedar.com";

const NAV = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Güven", href: "/guven" },
];

type TipRow = { oda: string | null; net_m2: number | null };
type BenzerProje = { ad: string; public_slug: string; ilce: string | null; il: string | null; asama: string | null; odaTipleri: string[] };

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    .map((x) => ({ ad: x.ad, public_slug: x.public_slug, ilce: x.ilce, il: x.il, asama: x.insaat_asamasi, odaTipleri: [...(odaMap.get(x.id) ?? [])] }));
}

async function projeGetir(slug: string) {
  const supabase = createAdminClient();
  const { data: proje } = await supabase
    .from("proje")
    .select("*, uretici:uretici_id ( ad, dogrulanmis, profil )")
    .eq("public_slug", slug)
    .maybeSingle();
  if (!proje) return null;
  const [{ data: tipler }, { count: birimSayisi }] = await Promise.all([
    supabase.from("daire_tipi").select("oda, net_m2").eq("proje_id", proje.id),
    supabase.from("birim").select("id", { count: "exact", head: true }).eq("proje_id", proje.id),
  ]);
  const benzer = await benzerProjeler(supabase, proje);
  return { proje, tipListe: (tipler ?? []) as TipRow[], birimSayisi: birimSayisi ?? 0, benzer };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** B2B SSS — hem görünür accordion hem FAQPage JSON-LD (tek kaynak). */
function sssListesi(ad: string): { s: string; c: string }[] {
  return [
    { s: `${ad} projesini Projedar ağında nasıl satarım?`, c: `Gayrimenkul danışmanı olarak Projedar ağına ücretsiz katılır, müteahhidin bu projede size tahsis ettiği daireleri canlı stoktan tek dokunuşla paylaşırsınız. Komisyondan pay alınmaz, kazancın tamamı sizde kalır.` },
    { s: `${ad} sizin projeniz mi? Projedar ağına nasıl eklerim?`, c: `Projeyi yöneten müteahhit iseniz Projedar'a başvurup projeyi ağa ekleyebilir, stoğunuzu ve fiyatınızı tek panelden yönetip yetkili danışmanlara tahsisli olarak açabilirsiniz.` },
    { s: `${ad} projesinin fiyatları bu sayfada var mı?`, c: `Hayır. Projedar bir ilan portalı değildir; fiyat ve güncel stok yalnız ağdaki yetkili gayrimenkul danışmanlarına canlı olarak açılır. Bu sayfa projenin künye ve konum bilgisini içerir.` },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const veri = await projeGetir(slug);
  if (!veri) return {};
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = veri.proje as any;
  const u = p.uretici;
  /* eslint-enable @typescript-eslint/no-explicit-any */
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
function jsonLd(p: any, u: any, birimSayisi: number, odaTipleri: string[]): object {
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
      { "@type": "FAQPage", "@id": `${SITE}/proje/${p.public_slug}#faq`, mainEntity: sssListesi(p.ad).map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })) },
    ],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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

export default async function ProjeSeoSayfa({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const veri = await projeGetir(slug);
  if (!veri) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = veri.proje as any;
  const u = p.uretici as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const dogrulanmis = Boolean(u?.dogrulanmis);
  if (projeIcerikSkoru(esigeGirdi(p, veri.tipListe.length, dogrulanmis)) < ICERIK_ESIGI) notFound();

  const kunye = (p.kunye ?? {}) as Record<string, unknown>;
  const ozellikler = okuOzellikler(kunye);
  const malzeme = Array.isArray(kunye.malzeme) ? (kunye.malzeme as string[]) : [];
  const aciklama = typeof kunye.aciklama === "string" ? (kunye.aciklama as string).trim() : "";
  const konum = [p.mahalle, p.ilce, p.il].filter(Boolean).join(", ");
  const bloklar = projeIcerikBloklari({ ad: p.ad, il: p.il, ilce: p.ilce, mahalle: p.mahalle, slug });
  const sss = sssListesi(p.ad);

  const odaTipleri = [...new Set(veri.tipListe.map((t) => t.oda).filter(Boolean) as string[])];
  const m2ler = veri.tipListe.map((t) => t.net_m2).filter((x): x is number => x != null && x > 0);
  const m2Band = m2ler.length ? (Math.min(...m2ler) === Math.max(...m2ler) ? `${Math.min(...m2ler)} m²` : `${Math.min(...m2ler)}–${Math.max(...m2ler)} m²`) : null;

  const kunyeSatir: [string, string][] = [];
  if (p.ada || p.parsel) kunyeSatir.push(["Ada / Parsel", [p.ada, p.parsel].filter(Boolean).join(" / ")]);
  if (p.emsal) kunyeSatir.push(["Emsal (KAKS)", String(p.emsal)]);
  if (p.taks) kunyeSatir.push(["TAKS", String(p.taks)]);
  if (kunye.imar_durumu) kunyeSatir.push(["İmar Durumu", String(kunye.imar_durumu)]);
  if (kunye.arsa_alani) kunyeSatir.push(["Arsa Alanı", `${kunye.arsa_alani} m²`]);
  if (kunye.otopark) kunyeSatir.push(["Otopark", String(kunye.otopark)]);

  const asama = ASAMA_ETIKET[p.insaat_asamasi as InsaatAsama] ?? "Planlama";
  const ilerleme = Number(p.ilerleme_yuzde ?? 0);
  const teslim = p.teslim_tarihi ? new Date(p.teslim_tarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "long" }) : null;
  const kiraGetirisi = p.kira_getirisi_pct != null ? Number(p.kira_getirisi_pct) : null;
  const gorsel = temaGorsel(p.il, p.ilce);
  const up = (u?.profil ?? {}) as Record<string, string | null>;

  after(() => kayitYaz({ tip: "goruntuleme", projeId: p.id, payload: { kaynak: "proje_seo", slug } }));

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, u, veri.birimSayisi, odaTipleri)) }} />

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa" className="shrink-0"><Logo size={26} wordmark /></Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">{n.etiket}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:block"><Link href="/login" className="btn-ghost">Giriş yap</Link></span>
            <Link href="/kayit" className="btn-action whitespace-nowrap hover:-translate-y-0.5">Ücretsiz başla</Link>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {gorsel ? (
          <Image src={gorsel} alt="" fill priority sizes="100vw" className="object-cover object-[50%_45%]" aria-hidden />
        ) : null}
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.72) 0%, rgba(8,20,34,0.45) 42%, rgba(8,20,34,0.86) 100%)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(58% 68% at 22% 38%, rgba(30,155,138,0.28) 0%, transparent 62%)" }} />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:pb-20">
          {/* Breadcrumb (görünür) */}
          <nav aria-label="Konum yolu" className="flex flex-wrap items-center gap-1.5 font-mono text-[11.5px] text-white/55">
            <Link href="/" className="hover:text-white">Ana sayfa</Link>
            <ChevronRight size={12} className="opacity-50" />
            <Link href="/konut-projeleri" className="hover:text-white">Konut projeleri</Link>
            {p.il ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${slugify(p.il)}`} className="hover:text-white">{p.il}</Link></>) : null}
            {p.ilce ? (<><ChevronRight size={12} className="opacity-50" /><Link href={`/konut-projeleri/${slugify(p.il)}/${slugify(p.ilce)}`} className="hover:text-white">{p.ilce}</Link></>) : null}
          </nav>

          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[#7fd4c4]"><span className="size-2 rounded-full bg-green nabiz" />{bloklar.etiket}</span>
              {dogrulanmis ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90"><ShieldCheck size={13} strokeWidth={2} /> Doğrulanmış müteahhit</span> : null}
              {gorsel ? <span className="rounded-full bg-black/25 px-3 py-1 text-white/50">Temsili görsel</span> : null}
            </div>
            <h1 className="mt-5 font-display text-[38px] font-extrabold leading-[1.04] tracking-tight sm:text-[54px]">{p.ad}</h1>
            {konum ? <p className="mt-3 flex items-center gap-1.5 text-lg text-white/75"><MapPin size={17} className="opacity-70" />{konum}</p> : null}
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[12.5px]">
              {veri.birimSayisi > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-[rgba(8,20,34,0.45)] px-3 py-1.5 text-white/85 backdrop-blur-sm"><Layers size={13} className="text-[#7fd4c4]" />{veri.birimSayisi} bağımsız bölüm</span> : null}
              {odaTipleri.length ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-[rgba(8,20,34,0.45)] px-3 py-1.5 text-white/85 backdrop-blur-sm">{odaTipleri.join(" · ")}</span> : null}
              {m2Band ? <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-[rgba(8,20,34,0.45)] px-3 py-1.5 text-white/85 backdrop-blur-sm">{m2Band}</span> : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-[rgba(8,20,34,0.45)] px-3 py-1.5 text-white/85 backdrop-blur-sm"><CalendarClock size={13} className="text-[#7fd4c4]" />{asama}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEDİR (varyant giriş) ============ */}
      <section className="relative px-5 py-16 sm:px-6 sm:py-20">
        <Reveal className="mx-auto w-full max-w-3xl">
          <div className="kart signal-top p-7 sm:p-9" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Bu sayfa nedir</p>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">{bloklar.giris}</p>
            <p className="mt-3 text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">{bloklar.surec}</p>
          </div>
        </Reveal>
      </section>

      {/* ============ KÜNYE + İNŞAAT + YATIRIM ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal><BolumBaslik etiket="Proje bilgisi" baslik="Künye, inşaat ve daire yapısı" alt="Fiyat ve canlı stok bu sayfada gösterilmez; onlar yalnız ağdaki yetkili danışmanlara açılır." /></Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {/* İnşaat durumu */}
            <Reveal className="lg:col-span-1">
              <div className="kart kart-3d flex h-full flex-col p-6">
                <h3 className="font-display text-base font-bold text-ink">İnşaat durumu</h3>
                <div className="mt-4 flex items-center justify-between text-sm"><span className="font-medium text-ink">{asama}</span><span className="font-mono font-semibold text-teal-d">%{ilerleme}</span></div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-hair"><div className="h-full bg-teal transition-all" style={{ width: `${ilerleme}%` }} /></div>
                {teslim ? <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-ink-soft"><CalendarClock size={13} /> Tahmini teslim: <span className="text-ink">{teslim}</span></p> : null}
                {kiraGetirisi != null ? <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-teal-d"><TrendingUp size={13} /> %{kiraGetirisi} yıllık kira getirisi</p> : null}
              </div>
            </Reveal>
            {/* Künye */}
            <Reveal delay={80} className="lg:col-span-2">
              <div className="kart kart-3d h-full p-6">
                <h3 className="font-display text-base font-bold text-ink">Proje künyesi</h3>
                {kunyeSatir.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    {kunyeSatir.map(([k, v]) => (<div key={k} className="rounded-xl bg-paper p-3"><p className="text-xs text-ink-soft">{k}</p><p className="mt-1 font-semibold text-ink">{v}</p></div>))}
                    {odaTipleri.length ? <div className="rounded-xl bg-paper p-3"><p className="text-xs text-ink-soft">Daire tipleri</p><p className="mt-1 font-semibold text-ink">{odaTipleri.join(", ")}</p></div> : null}
                    {m2Band ? <div className="rounded-xl bg-paper p-3"><p className="text-xs text-ink-soft">Net alan</p><p className="mt-1 font-semibold text-ink">{m2Band}</p></div> : null}
                  </div>
                ) : <p className="mt-4 text-sm text-ink-soft">Künye bilgisi ağa eklendikçe zenginleşir.</p>}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ PROJE HAKKINDA (kunye.aciklama, varsa) ============ */}
      {aciklama ? (
        <section className="px-5 py-16 sm:px-6">
          <Reveal className="mx-auto w-full max-w-3xl">
            <div className="kart p-7 sm:p-9">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">Proje hakkında</h2>
              <p className="mt-4 whitespace-pre-line text-pretty text-[15px] leading-relaxed text-ink-soft">{aciklama}</p>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* ============ ÖZELLİKLER (varsa) ============ */}
      {ozellikVarMi(ozellikler) || malzeme.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <Reveal><BolumBaslik etiket="Olanaklar" baslik="Proje özellikleri" /></Reveal>
            <Reveal delay={80} className="mt-10">
              <div className="kart p-7">
                <OzellikGoster ozellikler={ozellikler} />
                {malzeme.length ? (
                  <div className="mt-6 border-t border-hair pt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Yapı malzemeleri ve standartlar</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">{malzeme.map((m) => <span key={m} className="rounded-md bg-paper px-2.5 py-1 text-xs text-ink">{m}</span>)}</div>
                  </div>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ============ KONUM (OSM, varsa) ============ */}
      {p.lat != null && p.lng != null ? (
        <section className="px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <Reveal><BolumBaslik etiket="Konum" baslik={konum || "Proje konumu"} /></Reveal>
            <Reveal delay={80} className="mt-10">
              <div className="kart overflow-hidden p-0">
                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(p.lng) - 0.008}%2C${Number(p.lat) - 0.005}%2C${Number(p.lng) + 0.008}%2C${Number(p.lat) + 0.005}&layer=mapnik&marker=${p.lat}%2C${p.lng}`} title={`${p.ad} konumu`} className="h-72 w-full" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ============ B2B SÜREÇ (danışman / müteahhit) ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal><BolumBaslik etiket="Bu projeyle çalış" baslik="Danışman mısın, müteahhit mi?" alt="Projedar kapalı bir B2B ağdır. Fiyat ve stok yalnız yetkili danışmanlara canlı açılır; bu sayfa son kullanıcıya ilan sunmaz." /></Reveal>
          <Reveal delay={80} className="mt-12"><B2BCta slug={slug} projeAd={p.ad} /></Reveal>
        </div>
      </section>

      {/* ============ MÜTEAHHİT KARTI (varsa) ============ */}
      {u?.ad ? (
        <section className="px-5 py-16 sm:px-6">
          <Reveal className="mx-auto w-full max-w-3xl">
            <div className="kart signal-top p-7" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
              <div className="flex items-start gap-4">
                <span className="inline-grid size-12 flex-none place-items-center rounded-2xl bg-[rgba(19,49,75,0.08)]" aria-hidden><Building2 size={24} strokeWidth={1.6} color="var(--color-navy)" /></span>
                <div>
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Projeyi yöneten müteahhit</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="font-display text-xl font-bold tracking-tight text-ink">{u.ad}</h2>{dogrulanmis ? <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal"><ShieldCheck size={11} /> Doğrulanmış</span> : null}</div>
                  {up.hakkinda ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{up.hakkinda}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-soft">{up.kurulus_yili ? <span>Kuruluş {up.kurulus_yili}</span> : null}{(up.il || up.ilce) ? <span>{[up.ilce, up.il].filter(Boolean).join(", ")}</span> : null}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* ============ İLGİLİ PROJELER (internal linking) ============ */}
      {veri.benzer.length ? (
        <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <Reveal><BolumBaslik etiket="Ağdaki diğer projeler" baslik={p.ilce ? `${p.ilce} ve çevresinden` : "İlgili projeler"} /></Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {veri.benzer.map((b, i) => (
                <Reveal key={b.public_slug} delay={i * 60}>
                  <Link href={`/proje/${b.public_slug}`} className="kart kart-3d group flex h-full flex-col p-5">
                    <div className="flex items-center justify-between"><span className="rounded-md bg-[var(--color-teal-soft)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-teal-d">{ASAMA_ETIKET[b.asama as InsaatAsama] ?? "Proje"}</span><ChevronRight size={16} className="text-ink-soft transition-transform group-hover:translate-x-0.5" /></div>
                    <h3 className="mt-3 font-display text-base font-bold tracking-tight text-ink">{b.ad}</h3>
                    <p className="mt-1 text-xs text-ink-soft">{[b.ilce, b.il].filter(Boolean).join(", ")}</p>
                    {b.odaTipleri.length ? <p className="mt-3 font-mono text-[11px] text-ink-soft">{b.odaTipleri.join(" · ")}</p> : null}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ GÖRÜNÜR FAQ ============ */}
      <section className="px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <Reveal><BolumBaslik etiket="Sık sorulanlar" baslik="Bu proje ve Projedar hakkında" /></Reveal>
          <div className="mt-10 flex flex-col gap-3">
            {sss.map((q, i) => (
              <Reveal key={q.s} delay={i * 50}>
                <details className="sss-item kart p-0 hover:-translate-y-0.5">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KAPANIŞ CTA (komuta) ============ */}
      <section className="px-5 pb-24 pt-4 sm:px-6">
        <Reveal>
          <div className="komuta relative mx-auto w-full max-w-5xl overflow-hidden rounded-[26px]">
            <div className="komuta-grid absolute inset-0" aria-hidden />
            <div className="relative px-6 py-14 text-center sm:px-10">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs">
                {["Komisyon yok", "Tahsisli görünürlük", "Canlı fiyat"].map((t) => (<span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-white/90 backdrop-blur-md">{t}</span>))}
              </div>
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{p.ad}, doğru satış ağında.</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75">Bu projeyi ağda satmak istiyorsan danışman olarak katıl; projeyi sen yönetiyorsan ağa ekle.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={`/kayit?rol=emlakci&proje=${encodeURIComponent(slug)}`} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-8 text-[15px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--golge-3)] sm:min-h-[44px] sm:w-auto">Danışman olarak katıl</Link>
                <Link href={`/kayit?rol=uretici&talep=proje&slug=${encodeURIComponent(slug)}`} className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 sm:min-h-[44px] sm:w-auto">Projeni ağa ekle</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
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
    </main>
  );
}
