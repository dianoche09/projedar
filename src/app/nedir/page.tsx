import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ProjeTopbar } from "@/components/seo/ProjeTopbar";
import { KapanisFooter } from "@/components/KapanisFooter";
import { Reveal } from "@/components/seo/Reveal";
import {
  Users, Building2, Radio, ShieldCheck, Layers, HandCoins, Network,
  ChevronRight, Check, X, Share2, MonitorCog,
} from "lucide-react";

export const revalidate = 3600;
const SITE = "https://projedar.com";

const SSS = [
  { s: "Projedar bir ilan portalı mı?", c: "Hayır. Projedar son kullanıcıya ilan sunmaz; kapalı devre, profesyoneller arası (B2B) bir ağdır. Fiyat ve canlı stok yalnız yetkili gayrimenkul danışmanlarına açılır." },
  { s: "Projedar komisyon alır mı?", c: "Hayır. Projedar satışın komisyonuna ortak olmaz; danışman kendi komisyonunu alır. Gelir modeli müteahhit/geliştirici ile abonelik/anlaşma üzerinedir." },
  { s: "Danışman olarak katılmak ücretli mi?", c: "Temel danışman hesabı ücretsizdir. Katıldığında, müteahhidin sana tahsis ettiği projeleri canlı stoktan görür ve müşterine paylaşırsın." },
  { s: "Müteahhit olarak ne kazanırım?", c: "Stoğunu, fiyatını ve dağıtımını tek panelden yönetirsin; projeni yalnız yetkilendirdiğin danışmanlar satar. Çift satış ve stok karmaşası sistemle engellenir." },
];

// Hero canlı stok paneli — üründen gerçek bir kesit (sinyal: yeşil/amber/kırmızı)
const STOK = [
  { birim: "A-12", tip: "3+1", m2: "142 m²", durum: "musait", etiket: "Müsait", dot: "bg-green" },
  { birim: "B-07", tip: "2+1", m2: "98 m²", durum: "opsiyon", etiket: "Opsiyon", dot: "bg-amber" },
  { birim: "C-21", tip: "4+1", m2: "176 m²", durum: "satildi", etiket: "Satıldı", dot: "bg-red" },
];

// Portal ↔ Projedar kıyas satırları
const KIYAS: { alan: string; portal: string; projedar: string }[] = [
  { alan: "Erişim modeli", portal: "Açık pazar; ilan herkese görünür", projedar: "Geliştirici kontrollü tahsis" },
  { alan: "Fiyat ve stok", portal: "İlanlar eskir, çelişir", projedar: "Tek doğru kaynak, canlı" },
  { alan: "Komisyon", portal: "Aracı zinciri pay alabilir", projedar: "Projedar pay almaz" },
  { alan: "Çift satış", portal: "Elle takip, karışır", projedar: "Sistemle engellenir" },
  { alan: "Kime görünür", portal: "Son kullanıcıya ilan", projedar: "Yalnız yetkili danışman" },
];

export const metadata: Metadata = {
  title: "Projedar nedir? Tahsisli canlı konut satış ağı | Projedar",
  description: "Projedar; yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, geliştirici kontrollü tahsisle yönetilen nötr bir B2B ağdır. İlan portalı değildir; komisyona ortak olmaz.",
  alternates: { canonical: `${SITE}/nedir` },
  openGraph: { title: "Projedar nedir?", description: "Tahsisli canlı konut projesi satış ağı. İlan portalı değil, kapalı devre B2B.", url: `${SITE}/nedir`, type: "website", siteName: "Projedar" },
};

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}/nedir#sayfa`, url: `${SITE}/nedir`, name: "Projedar nedir?", inLanguage: "tr-TR", isPartOf: { "@id": `${SITE}/#website` } },
      { "@type": "FAQPage", "@id": `${SITE}/nedir#faq`, mainEntity: SSS.map((q) => ({ "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.c } })) },
    ],
  };
}

/** Hero'da yüzen canlı stok kartı — "bu ne?" sorusunu görselle anında yanıtlar. */
function CanliStokKart() {
  return (
    <div className="w-full max-w-sm rounded-[20px] border border-white/12 bg-white/[0.06] p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="rounded-[15px] bg-[#0c2137]/70 ring-1 ring-white/8">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <span className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-wider text-[#7fd4c4]">
            <span className="size-1.5 rounded-full bg-green nabiz" /> Canlı stok
          </span>
          <span className="font-mono text-[10.5px] text-white/45">3 sn önce güncellendi</span>
        </div>
        <div className="divide-y divide-white/6">
          {STOK.map((u) => (
            <div key={u.birim} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-[13px] font-bold text-white">{u.birim}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-white/50">{u.tip} · {u.m2}</p>
              </div>
              <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                <span className={`size-2 rounded-full ${u.dot}`} /> {u.etiket}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border-t border-white/8 px-4 py-2.5 font-mono text-[10.5px] text-white/40">
          <ShieldCheck size={13} className="text-[#7fd4c4]" /> Fiyat yalnız yetkili danışmana açık
        </div>
      </div>
    </div>
  );
}

/** Nötr ağ diyagramı — 1 müteahhit, tek panelden yalnız yetkilendirdiği danışmanlara tahsis. */
function AgDiyagram() {
  const danisman = [
    { y: 60, ad: "Danışman A", dot: "var(--color-green)" },
    { y: 150, ad: "Danışman B", dot: "var(--color-amber)" },
    { y: 240, ad: "Danışman C", dot: "var(--color-green)" },
  ];
  const yollar = ["M170,150 C300,150 320,60 452,60", "M170,150 C300,150 300,150 452,150", "M170,150 C300,150 320,240 452,240"];
  return (
    <svg viewBox="0 0 660 300" className="h-auto w-full" role="img" aria-label="Müteahhit tek panelden yetkili danışmanlara tahsis eder">
      {/* bağlantı çizgileri: solda faint sabit, üstte akan kesikli (teal) */}
      {yollar.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="var(--color-teal)" strokeOpacity="0.18" strokeWidth="2.5" />
          <path d={d} fill="none" stroke="var(--color-teal)" strokeWidth="2.5" className="ag-cizgi" strokeLinecap="round" />
        </g>
      ))}
      {/* müteahhit düğümü */}
      <g>
        <rect x="22" y="112" width="148" height="76" rx="16" fill="var(--color-navy)" />
        <text x="96" y="146" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="var(--font-display)">Müteahhit</text>
        <text x="96" y="166" textAnchor="middle" fill="#9fc7d8" fontSize="11.5" fontFamily="var(--font-mono)">tek panel · tek kaynak</text>
      </g>
      {/* tahsis etiketi */}
      <text x="310" y="140" textAnchor="middle" fill="var(--color-teal-d)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" letterSpacing="0.5">TAHSİS</text>
      {/* danışman düğümleri */}
      {danisman.map((k) => (
        <g key={k.ad}>
          <rect x="452" y={k.y - 26} width="186" height="52" rx="14" fill="#fff" stroke="var(--color-teal)" strokeOpacity="0.35" />
          <circle cx="474" cy={k.y} r="5" fill={k.dot} />
          <text x="492" y={k.y + 5} fill="var(--color-ink)" fontSize="14" fontWeight="600" fontFamily="var(--font-display)">{k.ad}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      <ProjeTopbar />

      {/* HERO — koyu komuta + canlı stok paneli */}
      <section className="komuta relative isolate overflow-hidden text-white">
        <div className="komuta-grid absolute inset-0" aria-hidden />
        <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 60% at 82% 6%, rgba(47,211,188,0.20), transparent 60%)" }} />
        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7fd4c4] backdrop-blur-md"><span className="size-2 rounded-full bg-green nabiz" /> Canlı ağ</span>
            <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,4.4rem)] font-black leading-[0.98] tracking-tight">Projedar nedir?</h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/85">
              Yeni konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturan, <span className="font-semibold text-white">geliştirici kontrollü tahsisle</span> yönetilen <span className="text-[#7fd4c4]">nötr bir B2B ağ</span>. İlan portalı değil; bir satış altyapısı.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kayit?rol=emlakci&kaynak=nedir" className="btn-action active:scale-[0.98] hover:-translate-y-0.5">Danışman olarak ücretsiz katıl</Link>
              <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[44px] items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition-all active:scale-[0.98] hover:bg-white/15">Projeni ağa ekle</Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CanliStokKart />
          </div>
        </div>
      </section>

      {/* NÖTR AĞ tanımı + DİYAGRAM */}
      <section className="px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tek cümlede</p>
            <p className="mt-4 text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-ink sm:text-[2rem]">
              Bağımsız danışmanın <span className="text-teal">tek hesapla</span> birçok geliştiricinin stoğuna eriştiği; ama erişimin açık pazar değil, <span className="text-teal">geliştirici kontrollü tahsisle</span> yönetildiği ağ.
            </p>
          </Reveal>
          <Reveal delay={90} className="mt-14">
            <div className="kart overflow-hidden p-6 sm:p-10">
              <AgDiyagram />
              <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-ink-soft">
                Bir müteahhit stoğunu <span className="font-semibold text-ink">tek panelden</span> yönetir; yalnız yetkilendirdiği danışmanlara tahsis eder. Açık pazar yok, çift satış yok, eski fiyat yok.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* KİME GÖRE — zengin rol kartları */}
      <section className="border-y border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Kime göre</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Projedar kimin için?</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="kart signal-top flex h-full flex-col overflow-hidden p-0" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                <div className="p-7">
                  <span className="inline-grid size-12 place-items-center rounded-2xl bg-[var(--color-teal-soft)]"><Users size={24} className="text-teal-d" /></span>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Gayrimenkul danışmanı</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Tek hesapla birçok geliştiricinin sana tahsisli projelerini canlı stoktan gör, müşterine tek dokunuşla paylaş. Komisyonun sende kalır; Projedar pay almaz.</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {["Canlı fiyat ve durum (müsait/opsiyon/satıldı)", "Çift satış koruması", "Ücretsiz temel hesap"].map((t) => (
                      <li key={t} className="flex items-start gap-2"><ChevronRight size={15} className="mt-0.5 flex-none text-teal" />{t}</li>
                    ))}
                  </ul>
                </div>
                {/* mini paylaşım şeridi */}
                <div className="mt-auto flex items-center gap-3 border-t border-[var(--cizgi)] bg-[var(--color-soft)] px-7 py-4">
                  <span className="inline-grid size-9 flex-none place-items-center rounded-xl bg-white ring-1 ring-[var(--cizgi)]"><Share2 size={16} className="text-teal-d" /></span>
                  <p className="text-[13px] leading-snug text-ink-soft"><span className="font-semibold text-ink">Tek dokunuş paylaşım.</span> Müşterine giden bağlantı canlı fiyatı gösterir, eskimez.</p>
                </div>
                <Link href="/emlakci" className="flex items-center justify-between px-7 py-4 text-sm font-semibold text-teal-d transition-colors hover:bg-[var(--color-teal-soft)]">Danışmanlar için detay <ChevronRight size={16} /></Link>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="kart signal-top flex h-full flex-col overflow-hidden p-0" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
                <div className="p-7">
                  <span className="inline-grid size-12 place-items-center rounded-2xl bg-[rgba(19,49,75,0.08)]"><Building2 size={24} strokeWidth={1.7} color="var(--color-navy)" /></span>
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">Müteahhit / geliştirici</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">Stoğunu, fiyatını ve dağıtımını tek panelden yönet. Projeni yalnız yetkilendirdiğin danışmanlar satsın; kim, neyi, hangi fiyata satıyor tek noktadan kontrol et.</p>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {["Tahsisli, kontrollü dağıtım", "Tek doğru kaynak: fiyat/stok tek yerde", "Doğrulanmış geliştirici rozeti"].map((t) => (
                      <li key={t} className="flex items-start gap-2"><ChevronRight size={15} className="mt-0.5 flex-none text-teal" />{t}</li>
                    ))}
                  </ul>
                </div>
                {/* mini komuta sinyal şeridi */}
                <div className="mt-auto flex items-center gap-3 border-t border-[var(--cizgi)] bg-[var(--color-soft)] px-7 py-4">
                  <span className="inline-grid size-9 flex-none place-items-center rounded-xl bg-white ring-1 ring-[var(--cizgi)]"><MonitorCog size={16} className="text-teal-d" /></span>
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-green" /> 24</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber" /> 6</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-red" /> 12</span>
                    <span className="ml-1 font-mono text-[11px] font-normal text-[var(--ink-faint)]">tek panelde</span>
                  </div>
                </div>
                <Link href="/muteahhit" className="flex items-center justify-between px-7 py-4 text-sm font-semibold text-teal-d transition-colors hover:bg-[var(--color-teal-soft)]">Müteahhitler için detay <ChevronRight size={16} /></Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR — bağlı akış */}
      <section className="px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Nasıl çalışır</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Üç adımda tahsisli satış</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-5 sm:grid-cols-3">
            {/* adımları birleştiren çizgi (masaüstü) */}
            <div aria-hidden className="absolute inset-x-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-teal/35 to-transparent sm:block" />
            {[
              { ik: Network, b: "Geliştirici projeyi ağa ekler", a: "Müteahhit stoğunu, fiyatını ve daire tiplerini tek panelden tanımlar." },
              { ik: Layers, b: "Danışmanlara tahsis eder", a: "Hangi danışmanın hangi birimleri satacağını geliştirici belirler; erişim kontrollüdür." },
              { ik: Radio, b: "Danışman canlı satar", a: "Tahsisli daireleri canlı fiyat ve durumla görür, müşterine paylaşır; stok tek kaynaktan güncel kalır." },
            ].map((x, i) => (
              <Reveal key={x.b} delay={i * 90}>
                <div className="kart relative h-full p-6 text-center sm:pt-8">
                  <span className="relative z-10 mx-auto inline-grid size-[72px] place-items-center rounded-2xl border border-[var(--cizgi)] bg-white shadow-sm">
                    <x.ik size={26} className="text-teal-d" />
                    <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-navy font-mono text-[11px] font-bold text-white">{i + 1}</span>
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-ink">{x.b}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{x.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ATMOSFER BANDI — gerçek şehir görseli + citability cümlesi */}
      <section className="relative isolate min-h-[320px] overflow-hidden">
        <Image src="/gorseller/proje/hero-istanbul.jpg" alt="Türkiye'de yeni konut projelerinin yükseldiği şehir silüeti" fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-tr from-ink/90 via-ink/75 to-navy/60" />
        <div className="komuta-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[320px] max-w-4xl flex-col justify-center px-5 py-16 text-center sm:px-6">
          <Reveal>
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#7fd4c4]">Neden var?</p>
            <p className="mx-auto mt-4 max-w-3xl text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-[1.9rem]">
              Türkiye&apos;de her yıl on binlerce yeni konut, dağınık ilanlar ve eskiyen fiyatlarla satılıyor. Projedar; müteahhidin stoğunu tek doğru kaynakta canlı tutar, doğru danışmanla eşler.
            </p>
          </Reveal>
        </div>
      </section>

      {/* NEDEN FARKLI — Portal ↔ Projedar kıyas */}
      <section className="px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Neden farklı</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">İlan portalı değil, satış ağı</h2>
          </Reveal>
          <Reveal delay={80} className="mt-12">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Portal */}
              <div className="rounded-[20px] border border-[var(--cizgi)] bg-white/55 p-6 sm:p-7">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-[var(--ink-faint)]">İlan portalı</p>
                <ul className="mt-5 space-y-3.5">
                  {KIYAS.map((r) => (
                    <li key={r.alan} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-red-soft"><X size={13} className="text-red" strokeWidth={2.6} /></span>
                      <span className="text-[14px] leading-snug text-ink-soft"><span className="font-semibold text-ink">{r.alan}:</span> {r.portal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Projedar */}
              <div className="signal-top relative overflow-hidden rounded-[20px] border border-teal/30 bg-[var(--color-teal-soft)] p-6 shadow-sm sm:p-7" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                <p className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-teal-d"><span className="size-1.5 rounded-full bg-green nabiz" /> Projedar</p>
                <ul className="mt-5 space-y-3.5">
                  {KIYAS.map((r) => (
                    <li key={r.alan} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-green-soft"><Check size={13} className="text-green" strokeWidth={2.8} /></span>
                      <span className="text-[14px] leading-snug text-ink"><span className="font-semibold">{r.alan}:</span> {r.projedar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
          <Reveal delay={140} className="mt-6 flex flex-wrap justify-center gap-2.5">
            {[
              { ik: HandCoins, t: "Komisyona ortak olmaz" },
              { ik: Radio, t: "Canlı, tek doğru kaynak" },
              { ik: ShieldCheck, t: "İlan değil, tahsis" },
            ].map((c) => (
              <span key={c.t} className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-white px-4 py-2 text-[13px] font-semibold text-ink"><c.ik size={15} className="text-teal-d" /> {c.t}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* SSS */}
      <section className="border-t border-[var(--cizgi)] bg-white/55 px-5 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mx-auto max-w-2xl text-center"><p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Projedar hakkında</h2></Reveal>
          <div className="mt-10 flex flex-col gap-3">
            {SSS.map((q, i) => (
              <Reveal key={q.s} delay={i * 60}>
                <details className="sss-item kart p-0">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">{q.s}<span className="ok flex-none text-teal" aria-hidden>▾</span></summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* KAPANIŞ CTA */}
      <section className="px-5 pb-24 pt-16 sm:px-6">
        <div className="komuta relative mx-auto w-full max-w-5xl overflow-hidden rounded-[26px]">
          <div className="komuta-grid absolute inset-0" aria-hidden />
          <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(50% 70% at 50% 0%, rgba(47,211,188,0.18), transparent 60%)" }} />
          <div className="relative px-6 py-14 text-center sm:px-10">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">Yeni konut projeleri, doğru satış ağında.</h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75">Danışmansan ücretsiz katıl, komisyonun sende; müteahhitsen projeni ekle, tek panelden yönet.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/kayit?rol=emlakci&kaynak=nedir" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-8 text-[15px] font-bold text-ink transition-all active:scale-[0.98] hover:-translate-y-0.5 sm:w-auto">Danışman olarak katıl</Link>
              <Link href="/kayit?rol=uretici&kaynak=nedir" className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all active:scale-[0.98] hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto">Projeni ağa ekle</Link>
            </div>
          </div>
        </div>
      </section>

      <KapanisFooter />
    </main>
  );
}
