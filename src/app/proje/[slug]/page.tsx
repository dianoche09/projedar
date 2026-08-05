import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { okuOzellikler, ozellikVarMi } from "@/lib/ozellikler";
import { OzellikGoster } from "@/components/OzellikGoster";
import { ASAMA_ETIKET, type InsaatAsama } from "@/lib/types";
import { projeIcerikBloklari } from "@/lib/seo/proje-icerik";
import { projeIcerikSkoru, ICERIK_ESIGI } from "@/lib/seo/icerik-esigi";
import { slugify } from "@/lib/seo/slug";
import { B2BCta } from "@/components/seo/B2BCta";
import { temaGorsel } from "@/lib/seo/tema-gorsel";

export const revalidate = 3600; // 1 saat ISR (proje meta yavaş değişir; canlı stok public'te yok)

const SITE = "https://projedar.com";

/** public_slug ile proje + müteahhit çeker (admin-client, RLS bypass, server-only). */
async function projeGetir(slug: string) {
  const supabase = createAdminClient();
  const { data: proje } = await supabase
    .from("proje")
    .select("*, uretici:uretici_id ( ad, dogrulanmis, profil )")
    .eq("public_slug", slug)
    .maybeSingle();
  if (!proje) return null;

  const { data: tipler } = await supabase
    .from("daire_tipi")
    .select("oda, net_m2")
    .eq("proje_id", proje.id);
  const { count: birimSayisi } = await supabase
    .from("birim")
    .select("id", { count: "exact", head: true })
    .eq("proje_id", proje.id);

  const tipListe = (tipler ?? []) as { oda: string | null; net_m2: number | null }[];
  return { proje, tipListe, birimSayisi: birimSayisi ?? 0 };
}

function esigeGirdi(proje: Record<string, unknown>, tipSayisi: number, dogrulanmis: boolean) {
  return {
    il: proje.il as string | null,
    ilce: proje.ilce as string | null,
    mahalle: proje.mahalle as string | null,
    lat: proje.lat as number | null,
    lng: proje.lng as number | null,
    ada: proje.ada as string | null,
    parsel: proje.parsel as string | null,
    emsal: proje.emsal as number | null,
    taks: proje.taks as number | null,
    insaat_asamasi: proje.insaat_asamasi as string | null,
    teslim_tarihi: proje.teslim_tarihi as string | null,
    baslama_tarihi: proje.baslama_tarihi as string | null,
    kunye: (proje.kunye ?? {}) as Record<string, unknown>,
    daireTipiSayisi: tipSayisi,
    dogrulanmis,
    belge_dogrulandi: proje.belge_dogrulandi as boolean,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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
  const aciklama = `${p.ad} konut projesi künyesi, konumu ve özellikleri. ${u?.ad ? `${u.ad} projesi. ` : ""}Bu projeyi Projedar ağında satmak isteyen gayrimenkul danışmanları ve projeyi yöneten müteahhitler için.`;
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
  const konumAdres = {
    "@type": "PostalAddress",
    addressCountry: "TR",
    addressRegion: p.il ?? undefined,
    addressLocality: p.ilce ?? undefined,
    streetAddress: p.mahalle ?? undefined,
  };
  const ozellikler = okuOzellikler((p.kunye ?? {}) as Record<string, unknown>);
  const amenity = Object.values(ozellikler)
    .flat()
    .filter(Boolean)
    .map((ad) => ({ "@type": "LocationFeatureSpecification", name: ad, value: true }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}/proje/${p.public_slug}#sayfa`,
        url: `${SITE}/proje/${p.public_slug}`,
        name: `${p.ad} — ${[p.ilce, p.il].filter(Boolean).join(", ")}`,
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${SITE}/#website` },
      },
      {
        // Konut kompleksi — İLAN/FİYAT semantiği YOK (Offer/price kullanılmaz), EİDS-safe.
        "@type": "ApartmentComplex",
        "@id": `${SITE}/proje/${p.public_slug}#proje`,
        name: p.ad,
        address: konumAdres,
        ...(p.lat != null && p.lng != null
          ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } }
          : {}),
        ...(birimSayisi > 0 ? { numberOfAccommodationUnits: birimSayisi } : {}),
        ...(odaTipleri.length ? { accommodationCategory: odaTipleri.join(", ") } : {}),
        ...(amenity.length ? { amenityFeature: amenity } : {}),
        ...(u?.ad
          ? { developer: { "@type": "Organization", name: u.ad } }
          : {}),
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
      {
        "@type": "FAQPage",
        "@id": `${SITE}/proje/${p.public_slug}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `${p.ad} projesini Projedar ağında nasıl satarım?`,
            acceptedAnswer: { "@type": "Answer", text: `Gayrimenkul danışmanı olarak Projedar ağına ücretsiz katılır, müteahhidin bu projede size tahsis ettiği daireleri canlı stoktan tek dokunuşla paylaşırsınız. Komisyondan pay alınmaz, kazancın tamamı sizde kalır.` },
          },
          {
            "@type": "Question",
            name: `${p.ad} sizin projeniz mi? Projedar ağına nasıl eklerim?`,
            acceptedAnswer: { "@type": "Answer", text: `Projeyi yöneten müteahhit iseniz Projedar'a başvurup projeyi ağa ekleyebilir, stoğunuzu ve fiyatınızı tek panelden yönetip yetkili danışmanlara tahsisli olarak açabilirsiniz.` },
          },
          {
            "@type": "Question",
            name: `${p.ad} projesinin fiyatları bu sayfada var mı?`,
            acceptedAnswer: { "@type": "Answer", text: `Hayır. Projedar bir ilan portalı değildir; fiyat ve güncel stok yalnız ağdaki yetkili gayrimenkul danışmanlarına canlı olarak açılır. Bu sayfa projenin künye ve konum bilgisini içerir.` },
          },
        ],
      },
    ],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  const konum = [p.mahalle, p.ilce, p.il].filter(Boolean).join(", ");
  const bloklar = projeIcerikBloklari({ ad: p.ad, il: p.il, ilce: p.ilce, mahalle: p.mahalle, slug });

  // Fiyatsız, tahsissiz meta: yalnız daire sayısı + oda tipleri + m² bandı (DEĞİŞMEZ #1/#2).
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
  const gorsel = temaGorsel(p.il, p.ilce);

  const up = (u?.profil ?? {}) as Record<string, string | null>;

  // Anonim görüntüleme sinyali (PII yok) — veri yerçekimi.
  after(() => kayitYaz({ tip: "goruntuleme", projeId: p.id, payload: { kaynak: "proje_seo", slug } }));

  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p, u, veri.birimSayisi, odaTipleri)) }} />

      {/* Üst bar */}
      <header className="border-b border-hair bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
            Proje<span className="text-teal">dar</span>
          </Link>
          <Link href="/konut-projeleri" className="text-sm font-medium text-ink-soft hover:text-ink">Konut projeleri</Link>
        </nav>
      </header>

      {/* Hero: tema görseli (varsa) veya koyu komuta gradyanı; proje GERÇEK fotoğrafı DEĞİL */}
      <section
        className="relative overflow-hidden border-b border-hair"
        style={gorsel ? { backgroundImage: `linear-gradient(135deg, rgba(8,20,34,.82), rgba(19,49,75,.72)), url(${gorsel})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, #081422 0%, #10243a 55%, #13314b 100%)" }}
      >
        <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:py-20">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full border border-teal/40 bg-teal/10 px-3 py-1 text-[#5fd3bf]">{bloklar.etiket}</span>
            {dogrulanmis ? <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/90">✓ Doğrulanmış müteahhit</span> : null}
            {gorsel ? <span className="rounded-full bg-black/20 px-3 py-1 text-white/50">Temsili görsel</span> : null}
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{p.ad}</h1>
          {konum ? <p className="mt-2 text-lg text-white/70">{konum}</p> : null}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-white/80">
            {veri.birimSayisi > 0 ? <span>{veri.birimSayisi} bağımsız bölüm</span> : null}
            {odaTipleri.length ? <span>{odaTipleri.join(" · ")}</span> : null}
            {m2Band ? <span>{m2Band}</span> : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl gap-8 px-5 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Giriş (varyant motoru + gerçek konum) */}
          <section className="kart p-6">
            <p className="text-pretty leading-relaxed text-ink-soft">{bloklar.giris}</p>
            <p className="mt-3 text-pretty leading-relaxed text-ink-soft">{bloklar.surec}</p>
          </section>

          {/* İnşaat durumu */}
          <section className="kart p-6">
            <h2 className="font-display text-lg font-semibold text-ink">İnşaat durumu</h2>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{asama}</span>
              <span className="font-mono text-teal-d">%{ilerleme}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-hair">
              <div className="h-full bg-teal transition-all" style={{ width: `${ilerleme}%` }} />
            </div>
            {teslim ? <p className="mt-3 font-mono text-xs text-ink-soft">Tahmini teslim: {teslim}</p> : null}
          </section>

          {/* Künye */}
          {kunyeSatir.length ? (
            <section className="kart p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Proje künyesi</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {kunyeSatir.map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-paper p-3">
                    <p className="text-xs text-ink-soft">{k}</p>
                    <p className="mt-1 font-semibold text-ink">{v}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Özellikler */}
          {ozellikVarMi(ozellikler) || malzeme.length ? (
            <section className="kart p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Olanaklar ve özellikler</h2>
              <OzellikGoster ozellikler={ozellikler} className="mt-4" />
              {malzeme.length ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Yapı malzemeleri ve standartlar</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {malzeme.map((m) => <span key={m} className="rounded-md bg-paper px-2.5 py-1 text-xs text-ink">{m}</span>)}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Konum (OSM embed, görselsiz, API-key'siz) */}
          {p.lat != null && p.lng != null ? (
            <section className="kart p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Konum</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-hair">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(p.lng) - 0.008}%2C${Number(p.lat) - 0.005}%2C${Number(p.lng) + 0.008}%2C${Number(p.lat) + 0.005}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
                  title={`${p.ad} konumu`}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
              {konum ? <p className="mt-2 text-xs text-ink-soft">{konum}</p> : null}
            </section>
          ) : null}
        </div>

        {/* Sağ kolon: müteahhit + B2B CTA */}
        <aside className="space-y-6">
          <B2BCta slug={slug} projeAd={p.ad} />

          {u?.ad ? (
            <section className="kart p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">Projeyi yöneten müteahhit</p>
              <div className="mt-2 flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-ink">{u.ad}</h3>
                {dogrulanmis ? <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">✓ Doğrulanmış</span> : null}
              </div>
              {up.hakkinda ? <p className="mt-2 text-sm leading-relaxed text-ink-soft">{up.hakkinda}</p> : null}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                {up.kurulus_yili ? <span>Kuruluş: {up.kurulus_yili}</span> : null}
                {(up.il || up.ilce) ? <span>{[up.ilce, up.il].filter(Boolean).join(", ")}</span> : null}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
