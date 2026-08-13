import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { generateShareToken, slugCoz, paylasimKodlariAl } from "@/lib/sharing";
import { createAdminClient } from "@/lib/supabase/admin";
import { kayitYaz } from "@/lib/events";
import { DURUM_BG, DURUM_ETIKET, ASAMA_ETIKET, zamanOnce, type BirimDurum, type InsaatAsama } from "@/lib/types";
import LeadForm from "./LeadForm";
import { Logo } from "@/components/Logo";
import { YazdirButonu } from "./YazdirButonu";
import { FavoriButton } from "./FavoriButton";
import { OdemeSlider } from "./OdemeSlider";
import { Galeri } from "./Galeri";
import { FiyatTrend, type FiyatNokta } from "@/components/FiyatTrend";
import { OzellikGoster } from "@/components/OzellikGoster";
import { okuOzellikler, ozellikVarMi } from "@/lib/ozellikler";

/** Video URL'sini gömülebilir kaynağa çevirir (YouTube/Vimeo iframe, aksi halde doğrudan video). */
function videoEmbed(url: string): { tip: "iframe" | "video"; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { tip: "iframe", src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` };
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null);
      return id ? { tip: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (host === "vimeo.com") return { tip: "iframe", src: `https://player.vimeo.com/video/${u.pathname.slice(1)}` };
    if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { tip: "video", src: url };
    return null;
  } catch {
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("tr-TR");
const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
/** Tazelik renk tier'ları (tasarım dili): 0-24sa yeşil · 1-7g teal · 7-15g amber · 15g+ gri. */
function tazelikRenk(iso: string): { dot: string; text: string } {
  const gun = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (gun <= 1) return { dot: "bg-green", text: "text-green" };
  if (gun <= 7) return { dot: "bg-teal", text: "text-teal-d" };
  if (gun <= 15) return { dot: "bg-amber", text: "text-amber" };
  return { dot: "bg-gray", text: "text-gray" };
}

/**
 * WhatsApp / link önizlemesi (OG kartı) — birebir paylaşımın kalbi. Başlık ve görsel
 * daireye özel olmazsa alıcı, linke tıklamadan hangi proje/daire/fiyat olduğunu göremez.
 * Fiyat CANLI değerden basılır (DEĞİŞMEZ #2). Geçersiz token → generic OG'ye düşer
 * (root layout + dosya-tabanlı opengraph-image). Kapak yoksa images verilmez → yine generic kart.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Her dönüşte noindex,nofollow garantile: /p/ artık crawl'a açık (robots'ta değil),
  // bu yüzden edge-case metadata fallback'leri de indexlenebilir 200 sızdırmamalı.
  const NOINDEX = { robots: { index: false, follow: false } as const };
  // slug ya [emlakçı, birim, token] (eski uzun link) ya [kod] (yeni kısa link).
  const coz = await slugCoz(slug);
  if (!coz) return NOINDEX;
  const birim = coz.birimId;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("birim")
    .select(`
      daire_no, net_m2, liste_fiyati, para_birimi, satilabilir,
      proje:proje_id ( id, ad, il, ilce ),
      tip:tip_id ( oda )
    `)
    .eq("id", birim)
    .single();
  if (!data) return NOINDEX;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = (data as any).proje;
  const t = (data as any).tip;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  if (!p) return NOINDEX;

  const konum = [p?.ilce, p?.il].filter(Boolean).join(", ");
  // Fiyat OG başlığına/açıklamasına BASILMAZ: WhatsApp/sosyal og:title'ı URL bazında cache'ler,
  // canlı fiyat orada donar ve eskir (DEĞİŞMEZ #2 tek-doğru-kaynak / #5 tazelik). Fiyat yalnız
  // linkin arkasındaki canlı mikrositede görünür — "linke basınca fiyat gelir".
  const baslik =
    [p?.ad, data.daire_no ? `Daire ${data.daire_no}` : null].filter(Boolean).join(" · ") || "Projedar";
  const aciklama =
    [t?.oda, data.net_m2 ? `${data.net_m2} m²` : null, konum, "Canlı fiyat ve detay için aç"]
      .filter(Boolean)
      .join(" · ");

  // Görsel: og:image / twitter:image burada VERİLMEZ — kardeş opengraph-image.tsx
  // (dosya-tabanlı dinamik kart) devreye girer ve daireye özel proje+daire+fiyat+durum
  // kartını üretir. Böylece her paylaşımda alıcı, linke tıklamadan ne olduğunu görür.
  return {
    title: baslik,
    description: aciklama,
    openGraph: { title: baslik, description: aciklama },
    twitter: { card: "summary_large_image", title: baslik, description: aciklama },
    // Birebir paylaşım mikrositesi kamuya açık ilan değil; arama motorunda listelenmesin.
    robots: { index: false, follow: false },
  };
}

export default async function PublicBirimPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // 1. slug'ı çöz: [emlakçı, birim, token] (imza doğrula) VEYA [kod] (DB'den çöz)
  const coz = await slugCoz(slug);
  if (!coz) {
    notFound();
  }
  const { emlakciId: emlakci, birimId: birim } = coz;
  // Etkileşim API'leri (favori/lead/ödeme sinyali) imzalı token bekler → türet (URL'de olmasa da).
  const token = generateShareToken(emlakci, birim);

  // 2. RLS bypass eden admin client'ı ile veriyi çek (public ziyaretçiler RLS'e takılmamalı)
  const supabase = createAdminClient();

  // Danışman profili
  const { data: profile } = await supabase
    .from("profiles")
    .select("ad, telefon, foto_url, logo_url")
    .eq("id", emlakci)
    .single();

  if (!profile) notFound();

  // Birim detayları + Proje + Üretici + Daire Tipi
  const { data: birimData } = await supabase
    .from("birim")
    .select(`
      id, daire_no, kat, durum, liste_fiyati, para_birimi, net_m2, brut_m2, yon, manzara, satilabilir, son_guncelleme, odeme_plani, satisa_acilis,
      proje:proje_id (
        id, ad, il, ilce, mahalle, insaat_asamasi, ilerleme_yuzde, teslim_tarihi, sorumlu_ad, sorumlu_tel, lat, lng, video_url, kira_getirisi_pct, amortisman_yil, oturum_uygun, golden_visa_esik, kunye, ada, parsel, emsal, taks,
        uretici:uretici_id (
          id, ad, dogrulanmis
        )
      ),
      tip:tip_id (
        ad, oda, net_m2, brut_m2, plan_url
      )
    `)
    .eq("id", birim)
    .single();

  if (!birimData) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const p = birimData.proje as any;
  const u = p?.uretici as any;
  const t = birimData.tip as any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const b = birimData;

  // Proje künye / donatı / açıklama — kunye jsonb (üretici formundan; havuz/proje ile aynı kaynak)
  const kunye = (p?.kunye ?? {}) as Record<string, unknown>;
  const aciklama = typeof kunye.aciklama === "string" ? (kunye.aciklama as string).trim() : "";
  const malzeme = Array.isArray(kunye.malzeme) ? (kunye.malzeme as string[]) : [];
  const ozellikler = okuOzellikler(kunye);
  const kunyeSatir: [string, string][] = [];
  if (p?.ada || p?.parsel) kunyeSatir.push(["Ada / Parsel", [p?.ada, p?.parsel].filter(Boolean).join(" / ")]);
  if (p?.emsal) kunyeSatir.push(["Emsal (KAKS)", String(p.emsal)]);
  if (p?.taks) kunyeSatir.push(["TAKS", String(p.taks)]);
  if (kunye.imar_durumu) kunyeSatir.push(["İmar Durumu", String(kunye.imar_durumu)]);
  if (kunye.arsa_alani) kunyeSatir.push(["Arsa Alanı", `${kunye.arsa_alani} m²`]);
  if (kunye.otopark) kunyeSatir.push(["Otopark", String(kunye.otopark)]);
  const kunyeVar = kunyeSatir.length > 0;

  // Benzer birimler — aynı projede müsait diğer daireler (imzalı link ile funnel'da tut + görüntüleme üret)
  const { data: benzerRaw } = await supabase
    .from("birim")
    .select("id, daire_no, kat, liste_fiyati, para_birimi, tip:tip_id(oda, plan_url)")
    .eq("proje_id", p?.id)
    .eq("durum", "musait")
    .eq("satilabilir", true)
    .neq("id", birim)
    .limit(3);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const benzerIds = ((benzerRaw ?? []) as any[]).map((x) => x.id as string);
  const benzerKodlar = await paylasimKodlariAl(emlakci, benzerIds);
  const benzer = ((benzerRaw ?? []) as any[]).map((x) => ({
    id: x.id as string,
    daire_no: x.daire_no as string | null,
    kat: x.kat as number | null,
    liste_fiyati: x.liste_fiyati as number | null,
    para_birimi: x.para_birimi as string | null,
    oda: (x.tip?.oda as string | null) ?? null,
    plan_url: (x.tip?.plan_url as string | null) ?? null,
    // Kısa kod varsa /p/{kod}; yoksa (tablo yok/hata) imzalı uzun linke düş.
    link: benzerKodlar.get(x.id as string)
      ? `/p/${benzerKodlar.get(x.id as string)}`
      : `/p/${emlakci}/${x.id}/${generateShareToken(emlakci, x.id)}`,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Eklenti birimler (otopark/depo) — bu daireye bağlı; satış argümanı olarak fiyatla göster
  const { data: eklentiRaw } = await supabase
    .from("birim")
    .select("id, tur, daire_no, liste_fiyati, para_birimi")
    .eq("ana_birim_id", birim);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const eklentiler = ((eklentiRaw ?? []) as any[]).map((x) => ({
    id: x.id as string,
    tur: (x.tur as string | null) ?? "depo",
    daire_no: x.daire_no as string | null,
    liste_fiyati: x.liste_fiyati as number | null,
    para_birimi: (x.para_birimi as string | null) ?? "TRY",
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
  // Toplam: yalnız ana daireyle aynı para birimindeki eklentiler eklenir (farklı kur Faz-2)
  const eklentiToplam = eklentiler.reduce(
    (acc, e) => acc + (e.liste_fiyati != null && e.para_birimi === (b.para_birimi ?? "TRY") ? e.liste_fiyati : 0),
    0,
  );
  const genelToplam = b.liste_fiyati != null ? b.liste_fiyati + eklentiToplam : null;

  // Fiyat geçmişi (events tip='fiyat', append-only trigger) — müşteriye olgusal fiyat trendi.
  const { data: fiyatOlaylar } = await supabase
    .from("events")
    .select("payload, created_at")
    .eq("birim_id", birim)
    .eq("tip", "fiyat")
    .order("created_at", { ascending: true });
  const fiyatNoktalar: FiyatNokta[] = [];
  for (const o of fiyatOlaylar ?? []) {
    const pl = (o.payload ?? {}) as { eski?: number | null; yeni?: number | null };
    if (fiyatNoktalar.length === 0 && pl.eski != null) {
      fiyatNoktalar.push({ t: o.created_at as string, fiyat: Number(pl.eski) });
    }
    if (pl.yeni != null) fiyatNoktalar.push({ t: o.created_at as string, fiyat: Number(pl.yeni) });
  }

  const { data: belgelerRaw } = await supabase
    .from("proje_belge")
    .select("tip, url")
    .eq("proje_id", p?.id)
    .in("tip", ["kapak", "foto"])
    .order("created_at", { ascending: true });
  const belgeler = (belgelerRaw ?? []) as { tip: string; url: string | null }[];
  const kapak = belgeler.find((x) => x.tip === "kapak")?.url ?? null;
  const fotolar = belgeler.filter((x) => x.tip === "foto" && x.url).map((x) => x.url as string);

  const bDurum = b.durum as BirimDurum;
  const liste = b.liste_fiyati;
  const psim = PARA_SIMGE[b.para_birimi as string] ?? "₺";
  const tazelik = tazelikRenk(b.son_guncelleme);
  const op = b.odeme_plani as {
    pesinat_pct?: number | null;
    taksit_sayisi?: number | null;
    vade_farki_pct?: number | null;
    ara_odemeler?: { ay: number; pct: number }[] | null;
  } | null;
  let odeme: { pesinat: number; ay: number; aylik: number; vade: number } | null = null;
  if (liste != null && op && (op.pesinat_pct != null || op.taksit_sayisi != null)) {
    const araPct = (op.ara_odemeler ?? []).reduce((s, a) => s + (a?.pct ?? 0), 0);
    const pesinat = Math.round((liste * (op.pesinat_pct ?? 0)) / 100);
    const kalan = Math.max(0, liste - pesinat - Math.round((liste * araPct) / 100));
    const ay = op.taksit_sayisi ?? 0;
    const vade = op.vade_farki_pct ?? 0;
    odeme = { pesinat, ay, aylik: ay > 0 ? Math.round((kalan * (1 + vade / 100)) / ay) : 0, vade };
  }

  // Katman A — ANONİM görüntüleme sinyali (veri yerçekimi; backfill edilemez = moat).
  // Müşteri kimliği/IP/telefon YOK → yalnız "bu birim bu danışman linkinden görüntülendi". KVKK-safe.
  after(() =>
    kayitYaz({
      tip: "goruntuleme",
      profileId: emlakci,
      projeId: p?.id ?? null,
      birimId: b.id,
      payload: { kaynak: "mikrosite" },
    }),
  );

  return (
    <div className="min-h-screen bg-paper pb-16">
      {/* Üst bar — marka (radar logo) + tazelik + yazdır; kaydırınca sabit */}
      <header className="sticky top-0 z-30 border-b border-hair bg-card/85 shadow-sm backdrop-blur-md print:static print:bg-card print:backdrop-blur-none">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2.5">
          <Logo size={22} wordmark />
          <div className="flex items-center gap-4">
            <YazdirButonu />
            <div className={`hidden items-center gap-1.5 font-mono text-xs sm:flex ${tazelik.text}`}>
              <span className="relative flex size-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${tazelik.dot} opacity-75 print:hidden`}></span>
                <span className={`relative inline-flex size-2 rounded-full ${tazelik.dot}`}></span>
              </span>
              {zamanOnce(b.son_guncelleme)} güncellendi
            </div>
          </div>
        </div>
      </header>

      {/* HERO — kapak görseli + proje/daire kimliği + CANLI fiyat.
          OG kartıyla aynı dil (kart→sayfa tutarlılığı); fiyat linkin arkasında olduğu için burada gösterilir. */}
      <section className="relative isolate overflow-hidden">
        {kapak ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kapak} alt={p?.ad} className="absolute inset-0 -z-10 size-full object-cover" />
            <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.32) 0%, rgba(8,20,34,0.62) 46%, rgba(8,20,34,0.94) 100%)" }} />
          </>
        ) : (
          <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg,#081422 0%,#10243a 55%,#13314b 100%)" }} />
        )}
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-10 sm:pb-10 sm:pt-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${DURUM_BG[bDurum]}`}>
              {DURUM_ETIKET[bDurum]}
            </span>
            {u?.dogrulanmis ? (
              <span className="inline-flex items-center rounded-full border border-teal/50 bg-teal/20 px-3 py-1 text-xs font-semibold text-[#8ee6d5]">
                ✓ Doğrulanmış Üretici
              </span>
            ) : null}
            {p?.kira_getirisi_pct != null ? (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                %{p.kira_getirisi_pct} yıllık kira getirisi
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-[2.6rem] sm:leading-[1.05]">{p?.ad}</h1>
          <p className="mt-1.5 text-sm text-white/75">{[p?.mahalle, p?.ilce, p?.il].filter(Boolean).join(", ") || "—"}</p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-white/90">
              {[b.daire_no ? `Daire ${b.daire_no}` : null, b.kat != null ? `${b.kat}. kat` : null, t?.oda, (b.net_m2 || t?.net_m2) ? `${b.net_m2 || t?.net_m2} m²` : null]
                .filter(Boolean)
                .map((x, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    {x}
                    {i < arr.length - 1 ? <span className="text-white/40">·</span> : null}
                  </span>
                ))}
            </div>
            {liste != null && b.satilabilir ? (
              <div className="text-right">
                <p className="font-mono text-3xl font-bold leading-none text-white sm:text-4xl">
                  {fmt(liste)} <span className="text-2xl text-white/80">{psim}</span>
                </p>
                {eklentiToplam > 0 && genelToplam != null ? (
                  <p className="mt-1 font-mono text-xs text-white/60">eklentilerle {fmt(genelToplam)} {psim}</p>
                ) : null}
              </div>
            ) : (
              <span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/85">Paylaşıma kapalı</span>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto mt-8 max-w-5xl px-6">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          {/* Sol Kolon: Proje & Daire Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daire Kat Planı ve Özellikleri */}
            <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm space-y-6">
              <h2 className="font-display text-xl font-semibold text-ink">Daire Detayları</h2>

              {/* Daire Kat Planı Görseli */}
              {t?.plan_url ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hair bg-paper flex items-center justify-center">
                  <img
                    src={t.plan_url}
                    alt="Daire Kat Planı"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                </div>
              ) : null}

              {/* Özellikler Tablosu */}
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Daire No</p>
                  <p className="mt-1 font-mono text-base font-semibold text-ink">{b.daire_no || "—"}</p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Kat</p>
                  <p className="mt-1 font-mono text-base font-semibold text-ink">{b.kat != null ? `${b.kat}. Kat` : "—"}</p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Oda Sayısı</p>
                  <p className="mt-1 text-base font-semibold text-ink">{t?.oda || "—"}</p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Net Alan</p>
                  <p className="mt-1 font-mono text-base font-semibold text-ink">{b.net_m2 || t?.net_m2 || "—"} m²</p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Brüt Alan</p>
                  <p className="mt-1 font-mono text-base font-semibold text-ink">{b.brut_m2 || t?.brut_m2 || "—"} m²</p>
                </div>
                <div className="rounded-xl bg-paper p-3">
                  <p className="text-xs text-gray">Yön / Manzara</p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {[b.yon, b.manzara].filter(Boolean).join(" - ") || "—"}
                  </p>
                </div>
              </div>

              {!b.satilabilir ? (
                <div className="rounded-xl border border-red/10 bg-red/5 p-4">
                  <p className="text-sm font-medium text-red">Bu birim satışa veya paylaşıma kapalıdır.</p>
                </div>
              ) : null}
            </div>

            {/* Ödeme Planı — fiyat geçmişi + interaktif simülasyon + eklentiler (fiyat başlığı hero'da) */}
            {liste != null && b.satilabilir ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">Ödeme Planı</h2>
                  <div className="text-right font-mono leading-tight">
                    <span className="block text-[11px] text-gray">Liste Fiyatı</span>
                    <span className="text-lg font-bold text-ink">{fmt(liste)} {psim}</span>
                  </div>
                </div>
                <FiyatTrend noktalar={fiyatNoktalar} paraBirimi={(b.para_birimi as string) ?? "TRY"} />
                {odeme ? (
                  <div className="mt-3 hidden space-y-1 border-t border-hair pt-3 text-sm print:block">
                    {odeme.pesinat ? (
                      <div className="flex justify-between"><span className="text-gray">Peşinat</span><span className="text-ink">{fmt(odeme.pesinat)} {psim}</span></div>
                    ) : null}
                    {odeme.aylik ? (
                      <div className="flex justify-between"><span className="text-gray">{odeme.ay} ay taksit</span><span className="font-semibold text-ink">{fmt(odeme.aylik)} {psim}/ay</span></div>
                    ) : null}
                    {odeme.vade === 0 ? <p className="text-[11px] font-medium text-teal-d">Vade farksız</p> : null}
                  </div>
                ) : null}
                {/* interaktif ödeme simülasyonu: peşinat kaydır → taksit değişsin; baskıda statik özet basılır */}
                <OdemeSlider
                  liste={liste}
                  psim={psim}
                  varsayilanPesinat={op?.pesinat_pct ?? null}
                  varsayilanTaksit={op?.taksit_sayisi ?? null}
                  vadeFarkiPct={op?.vade_farki_pct ?? 0}
                  araOdemePct={(op?.ara_odemeler ?? []).reduce((s, a) => s + (a?.pct ?? 0), 0)}
                  emlakci={emlakci}
                  birim={b.id}
                  proje={p?.id ?? ""}
                  token={token}
                />
                {eklentiler.length > 0 ? (
                  <div className="mt-4 space-y-1 border-t border-hair pt-3 text-sm">
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-gray">Eklentiler</p>
                    {eklentiler.map((e) => (
                      <div key={e.id} className="flex justify-between">
                        <span className="text-gray">
                          {e.tur === "otopark" ? "Otopark" : "Depo"}
                          {e.daire_no ? ` · ${e.daire_no}` : ""}
                        </span>
                        <span className="font-mono text-ink">
                          {e.liste_fiyati != null ? `${fmt(e.liste_fiyati)} ${PARA_SIMGE[e.para_birimi] ?? "₺"}` : "—"}
                        </span>
                      </div>
                    ))}
                    {genelToplam != null && eklentiToplam > 0 ? (
                      <div className="mt-1.5 flex justify-between border-t border-hair pt-1.5 font-semibold">
                        <span className="text-ink">Toplam (daire + eklenti)</span>
                        <span className="font-mono text-teal-d">{fmt(genelToplam)} {psim}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Proje Durumu — inşaat aşaması + teslim */}
            <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-ink">Proje Durumu</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">İnşaat: {ASAMA_ETIKET[p?.insaat_asamasi as InsaatAsama] || "Planlama"}</span>
                <span className="font-mono font-medium text-teal">%{p?.ilerleme_yuzde ?? 0}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-hair">
                <div className="h-full bg-teal transition-all duration-500" style={{ width: `${p?.ilerleme_yuzde ?? 0}%` }} />
              </div>
              {p?.teslim_tarihi ? (
                <p className="mt-3 text-xs text-gray">
                  Tahmini Teslim: <span className="font-mono text-ink">{new Date(p.teslim_tarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}</span>
                </p>
              ) : null}
            </div>

            {/* Proje Görselleri (üretici yüklediği foto galeri) */}
            {fotolar.length > 0 ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm print:hidden">
                <h2 className="font-display text-xl font-semibold text-ink">Proje Görselleri</h2>
                <Galeri fotolar={fotolar} ad={p?.ad ?? ""} />
              </div>
            ) : null}

            {/* Proje Hakkında (kunye.aciklama) */}
            {aciklama ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-ink">Proje Hakkında</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray">{aciklama}</p>
              </div>
            ) : null}

            {/* Olanaklar & Özellikler (yapılandırılmış taksonomi: daire içi/sosyal/bina/ulaşım/güvenlik/teknik/otopark/manzara) + malzeme */}
            {ozellikVarMi(ozellikler) || malzeme.length > 0 ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-ink">Olanaklar &amp; Özellikler</h2>
                <OzellikGoster ozellikler={ozellikler} className="mt-4" />
                {malzeme.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Yapı Malzemeleri &amp; Standartlar</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {malzeme.map((m) => (
                        <span key={m} className="rounded-md bg-paper px-2.5 py-1 text-xs text-ink">{m}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Proje Künyesi (ada/parsel/emsal/taks/imar/arsa/otopark) */}
            {kunyeVar ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-ink">Proje Künyesi</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  {kunyeSatir.map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-paper p-3">
                      <p className="text-xs text-gray">{k}</p>
                      <p className="mt-1 font-semibold text-ink">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Proje Tanıtım Videosu (varsa) */}
            {(() => {
              const video = p?.video_url ? videoEmbed(p.video_url as string) : null;
              if (!video) return null;
              return (
                <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm print:hidden">
                  <h2 className="font-display text-xl font-semibold text-ink">Proje Tanıtımı</h2>
                  <div className="mt-4 overflow-hidden rounded-xl border border-hair bg-paper">
                    {video.tip === "iframe" ? (
                      <iframe
                        src={video.src}
                        title={`${p?.ad} tanıtım videosu`}
                        className="aspect-video w-full"
                        allow="accelerometer; encrypted-media; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/media-has-caption
                      <video src={video.src} controls preload="metadata" className="aspect-video w-full" />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Konum (koordinat varsa: OpenStreetMap gömme, anahtar gerektirmez) */}
            {p?.lat != null && p?.lng != null ? (
              <div className="rounded-2xl border border-hair bg-card p-6 shadow-sm print:hidden">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-ink">Konum</h2>
                  <a
                    href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-d hover:underline"
                  >
                    Haritada aç →
                  </a>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-hair">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(p.lng) - 0.008}%2C${Number(p.lat) - 0.005}%2C${Number(p.lng) + 0.008}%2C${Number(p.lat) + 0.005}&layer=mapnik&marker=${p.lat}%2C${p.lng}`}
                    title={`${p?.ad} konumu`}
                    className="h-64 w-full"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-xs text-gray">
                  {[p?.mahalle, p?.ilce, p?.il].filter(Boolean).join(", ")}
                </p>
              </div>
            ) : null}
          </div>

          {/* Sağ Kolon: İletişim / Danışman & Lead Formu (masaüstünde sticky) */}
          <div className="space-y-6 lg:sticky lg:top-20">
            {/* Emlakçı Profil Kartı */}
            <div className="rounded-2xl border border-hair bg-card p-5 shadow-sm text-center">
              <p className="text-xs text-gray font-medium uppercase tracking-wider">Yetkili Danışman</p>
              
              <div className="mt-4 flex flex-col items-center">
                {profile.foto_url ? (
                  <div className="relative size-20 overflow-hidden rounded-full border border-hair flex items-center justify-center">
                    <img
                      src={profile.foto_url}
                      alt={profile.ad || "Danışman"}
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-navy text-2xl font-bold text-white font-display">
                    {profile.ad?.charAt(0).toUpperCase() || "E"}
                  </div>
                )}
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{profile.ad || "—"}</h3>
                <p className="text-xs text-gray mt-0.5">Gayrimenkul Danışmanı</p>
                <div className="mt-4 flex w-full flex-col gap-2">
                  <a
                    href={`tel:${profile.telefon}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-hair px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {profile.telefon || "Ara"}
                  </a>
                  {profile.telefon ? (
                    <a
                      href={`https://wa.me/${profile.telefon.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      WhatsApp ile yaz
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Favori — anonim sinyal (PDF'te gizli) */}
            {b.satilabilir ? (
              <div className="print:hidden">
                <FavoriButton emlakci={emlakci} birim={birim} proje={p?.id ?? ""} token={token} />
              </div>
            ) : null}

            {/* Lead Formu — baskıda gizli (müşteriye PDF'te gerekmez) */}
            <div className="print:hidden">
              {b.satilabilir && bDurum === "musait" ? (
                <LeadForm projeId={p?.id} birimId={b.id} emlakciId={emlakci} token={token} />
              ) : bDurum === "planli" && b.satisa_acilis ? (
                <div className="rounded-2xl border border-navy/20 bg-navy/[0.03] p-5 text-center">
                  <p className="text-sm font-semibold text-navy">
                    Bu daire{" "}
                    {new Date(b.satisa_acilis).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    tarihinde satışa açılıyor.
                  </p>
                  <p className="mt-1 text-xs text-gray">Açılışta güncel fiyat ve müsaitlik burada görünür.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-hair bg-paper p-5 text-center">
                  <p className="text-sm text-gray font-medium">
                    Bu daire {DURUM_ETIKET[bDurum]} olduğu için talep alımına kapalıdır.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {benzer.length > 0 ? (
          <section className="mt-8 print:hidden">
            <h2 className="font-display text-lg font-semibold text-ink">Bu projede benzer daireler</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {benzer.map((x) => (
                <a key={x.id} href={x.link} className="kart group block overflow-hidden">
                  <div className="flex aspect-video items-center justify-center overflow-hidden bg-paper">
                    {x.plan_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={x.plan_url} alt="Daire planı" className="max-h-full max-w-full object-contain p-3 transition-transform group-hover:scale-105" />
                    ) : (
                      <span className="text-xs text-gray">Plan yok</span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-ink">Daire {x.daire_no ?? "—"}</span>
                      <span className="rounded-md bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">Müsait</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray">{x.oda ?? "—"}{x.kat != null ? ` · ${x.kat}. kat` : ""}</p>
                    {x.liste_fiyati != null ? (
                      <p className="mt-2 font-mono text-sm font-bold text-teal-d">{Number(x.liste_fiyati).toLocaleString("tr-TR")} {PARA_SIMGE[x.para_birimi ?? "TRY"] ?? "₺"}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
