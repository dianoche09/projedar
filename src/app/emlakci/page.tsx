import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { MagneticButton } from "@/components/MagneticButton";
import { HavuzKarti } from "./HavuzKarti";
import { TazelikDemo } from "./TazelikDemo";
import {
  LayoutGrid,
  Share2,
  Lock,
  BadgeCheck,
  CircleSlash,
  Handshake,
  ShieldCheck,
  FileSpreadsheet,
  PhoneMissed,
  Link2,
} from "lucide-react";

/* =========================================================
   /emlakci — gayrimenkul danışmanı için public rol landing'i.
   Rakip Analizi 5-6: NHB/Topli emlakçı vaadi ama KOMİSYONSUZ + tahsisli;
   ikna aracı ikon değil, canlı simülasyon (HavuzKarti + TazelikDemo).
   ========================================================= */

const SITE = "https://projepazar.vercel.app";

export const metadata: Metadata = {
  title: "Emlakçılar için ProjePazar — Ücretsiz | Komisyonun %100'ü senin",
  description:
    "Sana tahsisli müteahhit stoğunu tek canlı havuzda gör, WhatsApp'tan birebir paylaş, opsiyonla kilitle. Tamamen ücretsiz; satışına girmeyiz, komisyonundan pay almayız.",
  alternates: { canonical: "/emlakci" },
  openGraph: {
    title: "Emlakçılar için ProjePazar — Tamamen ücretsiz, komisyonun %100'ü senin",
    description:
      "Tahsisli müteahhit stoğu tek canlı havuzda. Fiyat her zaman güncel, opsiyon veritabanı seviyesinde kilitli, komisyonundan pay alınmaz.",
    type: "website",
    siteName: "ProjePazar",
    url: `${SITE}/emlakci`,
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title: "Emlakçılar için ProjePazar — Komisyonun %100'ü senin" },
};

const NAV = [
  { etiket: "Canlı havuz", href: "#canli-havuz" },
  { etiket: "Nasıl çalışır", href: "#nasil-calisir" },
  { etiket: "Sık sorulanlar", href: "#sss" },
];

/** Dert→çözüm karşılaştırma maddeleri. */
const DERT = [
  "Fiyat listesi kaç sürüm eski, kimse bilmiyor",
  "“Bu daire hâlâ müsait mi?” telefon trafiği gün boyu",
  "Müşteri karşısında yanlış fiyat, kaybedilen güven",
];
const COZUM = [
  "Tek canlı havuz — sürüm yok, tek doğru kaynak",
  "“● X önce” damgası her verinin üstünde",
  "Durum ekranda canlı: telefonla sormak yok",
];

/** 3 adım — havuz → paylaş → opsiyon. */
const ADIMLAR = [
  {
    no: "01",
    Icon: LayoutGrid,
    baslik: "Havuzunu gör",
    metin: "Sadece sana tahsisli müteahhit stoğu tek canlı ekranda. Dağınık Excel, eski PDF, grup mesajı yok — fiyat ve durum her an güncel.",
  },
  {
    no: "02",
    Icon: Share2,
    baslik: "Paylaş",
    metin: "Müşterine tek link gönder; fiyat o anki canlı değerden basılır. WhatsApp'tan birebir — ekran görüntüsü değil, canlı mikrosite.",
  },
  {
    no: "03",
    Icon: Lock,
    baslik: "Opsiyonla kilitle",
    metin: "Müşterin için birimi tut. Aktif opsiyon veritabanı seviyesinde kilitlenir; kimse üstüne satamaz — bu uygulama sözü değil, DB garantisi.",
  },
];

/** Komisyon güvence üçlüsü (anti-“garanti” konumu, isim vermeden). */
const GUVENCE = [
  { Icon: CircleSlash, b: "Satışına hiç girmeyiz", a: "ProjePazar satışa taraf olmaz; sözleşme müteahhitle senin arandadır." },
  { Icon: ShieldCheck, b: "Komisyondan pay almayız", a: "Kazancın %100'ü senin. Platform gelirini müteahhit tarafından kazanır." },
  { Icon: Handshake, b: "Lead'in senindir", a: "Müşterin sende kalır; kimseyle paylaşılmaz, kimseye satılmaz." },
];

const SSS: { s: string; c: string }[] = [
  {
    s: "Emlakçı için gerçekten ücretsiz mi? Gizli bir ücret var mı?",
    c: "Evet, tamamen ücretsizdir. Üyelik ücreti, aidat veya kullanım bedeli yoktur; hiçbir satıştan komisyon ya da pay alınmaz. Platform gelirini müteahhit tarafındaki anlaşmalardan kazanır — emlakçıdan değil.",
  },
  {
    s: "Tahsis nasıl çalışır, hangi projeleri görürüm?",
    c: "Müteahhit stoğunu kime açacağını kendisi belirler; buna tahsis denir. Sen yalnız sana tahsisli projeleri ve daireleri görürsün. Tahsis sana açıldığı anda havuzunda belirir ve içindeki her veri canlıdır.",
  },
  {
    s: "Lead'im ve müşterim kimin olur?",
    c: "Senin. Paylaşım birebir yapılır, satış müteahhitle aranda gerçekleşir. ProjePazar satışa taraf olmaz, komisyonundan pay almaz ve müşterini kimseyle paylaşmaz.",
  },
  {
    s: "Opsiyon nasıl çalışır?",
    c: "Beğendiğin daireyi müşterin için opsiyonla kilitlersin. Aktif opsiyon veritabanı seviyesinde tekildir: aynı daire üzerinde ikinci bir opsiyon sistemsel olarak açılamaz, kimse üstüne satamaz. Kilit uygulama katmanına değil, veritabanına dayanır.",
  },
  {
    s: "Fiyatlar gerçekten güncel mi?",
    c: "Evet. Fiyat yalnız birim kaydında tutulur, hiçbir yerde kopyalanmaz. Paylaştığın link fiyatı o anki canlı değerden basar; her veride “● X önce” tazelik damgası görünür, bayatlayan veri rozet rengiyle uyarır.",
  },
  {
    s: "KYC / belge doğrulaması neden var?",
    c: "ProjePazar doğrulanmış danışman ağıdır. Yetki belgeni yüklersin, doğrulanınca rozetini alırsın. Müteahhitler stoklarını doğrulanmış danışmanlara gönül rahatlığıyla açar — bu gate ağdaki herkesin işini ve itibarını korur.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE}/emlakci#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: SITE },
          { "@type": "ListItem", position: 2, name: "Emlakçılar için", item: `${SITE}/emlakci` },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}/emlakci#faq`,
        mainEntity: SSS.map((q) => ({
          "@type": "Question",
          name: q.s,
          acceptedAnswer: { "@type": "Answer", text: q.c },
        })),
      },
    ],
  };
}

export default function EmlakciLanding() {
  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      {/* ============ ÜST MENÜ ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="ProjePazar ana sayfa" className="shrink-0"><Logo size={26} wordmark /></Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">{n.etiket}</a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">Giriş yap</Link>
            <MagneticButton href="/kayit?rol=emlakci" className="btn-action">Ücretsiz başla</MagneticButton>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-aurora" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:px-6 lg:pb-24 lg:pt-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(30,155,138,0.22)] bg-[var(--color-teal-soft)] px-3.5 py-1.5 font-mono text-[11.5px] font-semibold text-[var(--color-teal-d)]">
              <span className="size-2 rounded-full bg-green nabiz" /> GAYRİMENKUL DANIŞMANI İÇİN
            </span>
            <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-[56px]">
              Tamamen ücretsiz.
              <br />
              <span className="text-teal">Komisyonun %100&rsquo;ü senin.</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Sana tahsisli müteahhit stoğunu <strong className="font-semibold text-ink">tek canlı havuzda</strong> gör, WhatsApp&rsquo;tan{" "}
              <strong className="font-semibold text-ink">birebir paylaş</strong>, <strong className="font-semibold text-ink">opsiyonla kilitle</strong> — fiyat her zaman güncel.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <MagneticButton href="/kayit?rol=emlakci" className="btn-action h-[52px] px-8 text-[15px] font-bold">
                Ücretsiz Başla
              </MagneticButton>
              <a href="#canli-havuz" className="btn-ghost h-[52px] px-7 text-[15px]">Canlı havuzu gör ↓</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Komisyon paylaşımı yok", "Sadece sana tahsisli stok", "Fiyat her zaman canlı"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi-2)] bg-white/70 px-3 py-1.5 text-xs font-medium text-ink-soft backdrop-blur-sm">
                  <span className="size-[5px] rounded-full bg-teal" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ DERT → ÇÖZÜM (kaos vs canlı havuz) ============ */}
      <section id="canli-havuz" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Dert → çözüm</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Grup mesajı değil.<br className="hidden sm:block" /> Canlı havuz.</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                WhatsApp gruplarında dolaşan bayat fiyat listeleri, Drive linkleri, &ldquo;bu daire hâlâ müsait mi?&rdquo; telefonları — hepsi tek canlı ekrana iner.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid items-start gap-5 md:grid-cols-2">
            {/* SOL — kaos temsili (grup mockup'ı) */}
            <Reveal>
              <div className="h-full rounded-[20px] border border-[var(--cizgi)] bg-[var(--color-red-soft)] p-6">
                <p className="flex items-center gap-2 font-display text-base font-bold text-red">⚠ Bugünkü düzen: dağınık gruplar</p>
                <div className="mt-4 rounded-2xl border border-[var(--cizgi)] bg-white p-4 shadow-[var(--golge-1)]">
                  <div className="mb-3 flex items-center justify-between border-b border-[var(--cizgi)] pb-2.5">
                    <span className="font-display text-[13px] font-bold text-ink">Proje Fırsatları 2026</span>
                    <span className="font-mono text-[10px] text-[var(--ink-faint)]">248 üye</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-soft)] px-3 py-2.5">
                      <FileSpreadsheet size={16} strokeWidth={1.75} className="flex-none text-ink-soft" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink">Fiyat_Listesi_SON_v3.xlsx</span>
                      <span className="taze t-eski"><span className="nokta" /> 3 hafta önce</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-soft)] px-3 py-2.5">
                      <Link2 size={16} strokeWidth={1.75} className="flex-none text-ink-soft" aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">Drive linkindeki liste güncel mi bilen var mı?</span>
                    </div>
                    <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-[var(--color-soft)] px-3 py-2.5 text-[12px] text-ink">Bu daire hâlâ müsait mi?</div>
                    <div className="max-w-[85%] self-end rounded-xl rounded-br-sm bg-[var(--color-amber-soft)] px-3 py-2.5 text-[12px] text-ink">Dün kapora alındı diye duydum, emin değilim…</div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[var(--color-soft)] px-3 py-2.5">
                      <PhoneMissed size={16} strokeWidth={1.75} className="flex-none text-red" aria-hidden />
                      <span className="text-[12px] text-ink-soft">Cevapsız arama — satış ofisi (3)</span>
                    </div>
                  </div>
                </div>
                <ul className="mt-4 flex flex-col">
                  {DERT.map((t) => (
                    <li key={t} className="flex gap-2.5 border-t border-dashed border-[rgba(16,36,58,0.1)] py-2 text-[13.5px] text-ink first:border-t-0">
                      <span className="font-bold text-red">✕</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            {/* SAĞ — canlı havuz kartı */}
            <Reveal delay={120}>
              <div className="flex h-full flex-col">
                <HavuzKarti />
                <ul className="mt-4 flex flex-col rounded-[20px] border border-[var(--cizgi)] bg-white px-6 py-2 shadow-[var(--golge-1)]">
                  {COZUM.map((t) => (
                    <li key={t} className="flex gap-2.5 border-t border-dashed border-[rgba(16,36,58,0.1)] py-2 text-[13.5px] text-ink first:border-t-0">
                      <span className="font-bold text-green">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 3 ADIM ============ */}
      <section id="nasil-calisir" className="relative scroll-mt-20">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Akış</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Üç adımda satışa hazır</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">Havuzunu gör, paylaş, kilitle. Aradaki her adımda veri tek doğru kaynaktan gelir.</p>
            </div>
          </Reveal>
          <ol className="mt-14 grid gap-5 sm:grid-cols-3">
            {ADIMLAR.map((a, i) => (
              <Reveal key={a.no} delay={i * 90}>
                <li className="kart kart-3d relative flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-extrabold tracking-tight text-teal/30">{a.no}</span>
                    <span className="inline-grid size-10 place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                      <a.Icon size={19} strokeWidth={1.75} color="var(--color-teal-d)" />
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold tracking-tight text-ink">{a.baslik}</h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">{a.metin}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          {/* KYC / doğrulama — olumlu gate */}
          <Reveal delay={120}>
            <div className="kart signal-top mx-auto mt-8 flex max-w-3xl items-start gap-4 p-6" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
              <span className="inline-grid size-11 flex-none place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                <BadgeCheck size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
              </span>
              <div>
                <h3 className="font-display text-[15px] font-bold tracking-tight text-ink">Doğrulanmış danışman ağı — belgeni yükle, rozetini al</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                  ProjePazar kapalı ve doğrulanmış bir ağdır. Yetki belgen doğrulanınca rozetini alırsın; müteahhitler stoklarını rozetli danışmanlara gönül rahatlığıyla açar. Doğrulama seni yavaşlatmaz — seni ağın güvenilir yüzü yapar.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ KOMİSYON GÜVENCESİ ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Komisyon güvencesi</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Söz değil, mimari</h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Bazı platformlar komisyon &ldquo;garantisi&rdquo; söz verir. Biz söze gerek bırakmayız: satışına hiç girmeyiz, komisyonundan pay almayız — kazancın %100&rsquo;ü senin. Lead&rsquo;in senindir, müteahhitle aranda kalır.
              </p>
            </div>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
            {GUVENCE.map((g, i) => (
              <Reveal key={g.b} delay={i * 90}>
                <div className="kart kart-3d flex h-full flex-col p-6">
                  <span className="inline-grid size-11 flex-none place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                    <g.Icon size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-bold tracking-tight text-ink">{g.b}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{g.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TAZELİK / GÜVEN ŞERİDİ ============ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div className="max-w-xl">
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tazelik görünür</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Bayat fiyatla müşteri karşısında rezil olma</h2>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                  Her verinin üstünde &ldquo;● X önce&rdquo; canlılık damgası var. Veri bayatladıkça rozet renk değiştirir: yeşilse gönül rahatlığıyla paylaş, sarıysa teyit et. Fiyat zaten paylaşımda canlı değerden basıldığı için müşterine eski rakam gitmez.
                </p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {[
                    ["Yeşil", "veri taze — paylaşıma hazır"],
                    ["Sarı", "bayatlıyor — havuzdan canlı değeri teyit et"],
                    ["Kırmızı", "eski — canlı havuz zaten doğrusunu gösteriyor"],
                  ].map(([r, t]) => (
                    <li key={r} className="flex gap-2.5 text-[13.5px] leading-snug text-ink">
                      <span className={`mt-1 size-2.5 flex-none rounded-full ${r === "Yeşil" ? "bg-green" : r === "Sarı" ? "bg-amber" : "bg-red"}`} aria-hidden />
                      <span><strong className="font-semibold">{r}</strong> — {t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}><TazelikDemo /></Reveal>
          </div>
        </div>
      </section>

      {/* ============ SSS ============ */}
      <section id="sss" className="relative scroll-mt-20 border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Aklındakiler</h2>
            </div>
          </Reveal>
          <div className="mt-12 flex flex-col gap-3">
            {SSS.map((q, i) => (
              <Reveal key={q.s} delay={i * 50}>
                <details className="sss-item kart p-0">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">
                    {q.s}
                    <span className="ok flex-none text-teal" aria-hidden>▾</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{q.c}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ KAPANIŞ CTA ============ */}
      <section className="relative px-5 pb-24 pt-20 sm:px-6">
        <Reveal>
          <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[28px]">
            <div
              className="relative overflow-hidden rounded-[26px]"
              style={{ background: "linear-gradient(140deg, var(--color-navy) 0%, var(--color-teal-d) 100%)" }}
            >
              <div className="izgara-doku absolute inset-0 opacity-[0.1]" aria-hidden />
              <div className="relative px-6 py-14 text-center sm:px-10 lg:py-16">
                <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs">
                  {["Ücret yok", "Komisyon paylaşımı yok", "Sadece sana tahsisli stok"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-white/90 backdrop-blur-md">{t}</span>
                  ))}
                </div>
                <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                  Komisyonun %100&rsquo;ü sende kalsın
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75">
                  Sana tahsisli canlı havuz seni bekliyor: doğru fiyat, tek link, opsiyon kilidi. Kayıt ücretsiz, belgen doğrulanınca rozetinle ağa katılırsın.
                </p>
                <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/kayit?rol=emlakci" className="inline-flex h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-9 text-[15px] font-bold text-ink transition-all hover:bg-white/90 sm:w-auto">
                    Ücretsiz Başla
                  </Link>
                  <Link href="/login" className="inline-flex h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:bg-white/15 sm:w-auto">
                    Zaten üyeyim — giriş yap
                  </Link>
                </div>
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
          <nav aria-label="Yasal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink-soft">
            <Link href="/kullanim-kosullari" className="transition-colors hover:text-ink hover:underline">Kullanım Koşulları</Link>
            <Link href="/gizlilik" className="transition-colors hover:text-ink hover:underline">Gizlilik</Link>
            <Link href="/kvkk-aydinlatma" className="transition-colors hover:text-ink hover:underline">KVKK Aydınlatma</Link>
          </nav>
        </div>
        <div className="border-t border-[var(--cizgi)] px-5 py-5 text-center text-[11px] text-[var(--ink-faint)] sm:px-6">© 2026 ProjePazar — Tüm hakları saklıdır.</div>
      </footer>
    </main>
  );
}
