import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { ShieldCheck, Database, BadgeCheck, CircleSlash, Lock, FileCheck, Scale, EyeOff } from "lucide-react";

/**
 * /guven · Güven Protokolü sayfası (public).
 * Amaç: sözleşme öncesi ikna. Her teminatın dayanağı ya veritabanı kuralı
 * ya gelir modelinin kendisi ya da yasal konumlandırmadır; pazarlama cümlesi yok.
 */

const SITE = "https://projedar.com";

export const metadata: Metadata = {
  title: "Güven Protokolü: Çift satış imkânsız, veri tahsisli, komisyon yok | Projedar",
  description:
    "Projedar güven protokolü: aktif opsiyon veritabanı seviyesinde kilitlenir, görünürlük satır seviyesinde tahsisle sınırlıdır, komisyon alınmaz. EİDS ilan rejimi ve KVKK çizgisi dahil tüm teminatların dayanağı.",
  alternates: { canonical: "/guven" },
  openGraph: {
    title: "Projedar Güven Protokolü",
    description:
      "Güven sözle değil, mimariyle: DB seviyesinde opsiyon kilidi, satır seviyesinde görünürlük, doğrulanmış ağ, komisyonsuz model, kapalı devre paylaşım.",
    type: "website",
    siteName: "Projedar",
    url: `${SITE}/guven`,
    locale: "tr_TR",
  },
  twitter: { card: "summary_large_image", title: "Projedar Güven Protokolü" },
};

/** Altı teminat; her birinin dayanağı teknik ya da yapısal. */
const TEMINATLAR = [
  { Icon: ShieldCheck, b: "Sıfır çift satış", a: "Aktif opsiyon, veritabanında tekil kayıt kuralıyla korunur. Aynı daireye ikinci opsiyon açmak uygulama hatasıyla bile mümkün değildir; kural uygulamada değil, veritabanının kendisindedir." },
  { Icon: Database, b: "Satır seviyesinde görünürlük", a: "Kim neyi görür, veritabanı satırı seviyesinde tanımlıdır (RLS). Danışman yalnız kendisine tahsisli birimleri görebilir; gerisi sorgu seviyesinde bile erişilemezdir." },
  { Icon: BadgeCheck, b: "Doğrulanmış ağ", a: "Her üretici doğrulama rozetiyle yayınlanır; danışman yetki belgesi doğrulanmadan stok detayına erişemez. Ağdaki herkesin kim olduğu bellidir." },
  { Icon: CircleSlash, b: "Komisyon yok", a: "Hiçbir satıştan pay alınmaz. Gelir müteahhit tarafındaki sabit anlaşmadan gelir; platformun satışın tarafı olmaması güvenin ön şartıdır." },
  { Icon: Lock, b: "Kapalı, davetli devre", a: "Son kullanıcıya açık ilan yoktur. Stok yalnız tahsisli danışmanların kapalı havuzunda görünür; paylaşım birebir linkle yapılır." },
  { Icon: FileCheck, b: "Tek doğru kaynak", a: "Fiyat ve durum yalnız birim kaydında yaşar, hiçbir yerde kopyalanmaz. Paylaşılan link fiyatı o anki canlı değerden basar; her verinin üstünde tazelik damgası vardır." },
];

const SSS: { s: string; c: string }[] = [
  {
    s: "Çift satış nasıl imkânsız oluyor?",
    c: "Aktif opsiyon veritabanı seviyesinde tekil kayıt kuralıyla (unique kilit) korunur. İkinci bir opsiyon talebi uygulamaya değil, doğrudan veritabanı kuralına çarpar ve reddedilir. Bu bir operasyon sözü değil, teknik imkânsızlıktır.",
  },
  {
    s: "Projedar bir ilan sitesi mi? EİDS'e tabi mi?",
    c: "Değildir. Son kullanıcıya açık ilan yayını yoktur; stok yalnız müteahhidin tahsis ettiği doğrulanmış danışmanların kapalı havuzunda görünür ve paylaşım birebir linkle yapılır. Model ilan değil, tahsistir.",
  },
  {
    s: "Müşteri verilerine ne oluyor?",
    c: "Çizgi nettir: piyasa ve üretici zekâsı evet, müşteri profili hayır. Danışmanın lead'i danışmanda kalır; müteahhit lead akışı görmez, yalnız kendi satış sürecindeki kaydı sorgulayabilir. Anonim kullanım sinyalleri dışında kişisel veri işlenmez.",
  },
  {
    s: "Fiyatın güncel olduğunu nereden bileceğim?",
    c: "Fiyat yalnız birim kaydında tutulur ve paylaşılan her link o anki canlı değeri basar. Her kaydın üstünde son güncelleme damgası görünür; veri eskidiğinde rozet rengi değişir ve herkes bunu görür.",
  },
  {
    s: "Ağa kimler girebiliyor?",
    c: "Ağ davetli ve doğrulanmıştır. Üretici doğrulama rozetiyle yayınlanır; danışman mesleki yetki belgesi doğrulanana kadar yalnız demo içerik görür. Doğrulama, ağdaki herkesin işini ve itibarını korur.",
  },
];

function jsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE}/guven#sayfa`,
        url: `${SITE}/guven`,
        name: "Projedar Güven Protokolü",
        inLanguage: "tr-TR",
        isPartOf: { "@id": `${SITE}/#website` },
        description:
          "Çift satış veritabanı seviyesinde imkânsız, görünürlük satır seviyesinde tahsisli, komisyon yok, kapalı devre paylaşım. Projedar güven protokolünün teknik ve yapısal dayanakları.",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE}/guven#sss`,
        mainEntity: SSS.map((q) => ({
          "@type": "Question",
          name: q.s,
          acceptedAnswer: { "@type": "Answer", text: q.c },
        })),
      },
    ],
  };
}

export default function GuvenSayfasi() {
  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />

      {/* ============ ÜST MENÜ ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" aria-label="Projedar ana sayfa" className="shrink-0"><Logo size={26} wordmark /></Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link href="/muteahhit" className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">Müteahhitler için</Link>
            <Link href="/emlakci" className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-[rgba(16,36,58,0.05)] hover:text-ink">Danışmanlar için</Link>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:block"><Link href="/login" className="btn-ghost">Giriş yap</Link></span>
            <Link href="/kayit" className="btn-action">Ücretsiz başla</Link>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative isolate overflow-hidden">
        <div className="hero-aurora" aria-hidden />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-16 text-center sm:px-6 lg:pb-20 lg:pt-24">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Güven protokolü</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-[38px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-[54px]">
            Güven sözle kurulmaz.
            <br />
            <span className="text-teal">Mimariyle kurulur.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Bu sayfadaki her teminatın dayanağı ya bir veritabanı kuralı ya gelir modelinin kendisi
            ya da yasal konumlandırmadır. Hiçbiri pazarlama cümlesi değildir.
          </p>
        </div>
      </section>

      {/* ============ ALTI TEMİNAT ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEMINATLAR.map((g, i) => (
              <Reveal key={g.b} delay={(i % 3) * 90}>
                <div className="kart kart-3d flex h-full flex-col p-7">
                  <span className="inline-grid size-11 flex-none place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                    <g.Icon size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
                  </span>
                  <h2 className="mt-4 font-display text-[16px] font-bold tracking-tight text-ink">{g.b}</h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{g.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EİDS / YASAL KONUMLANDIRMA ============ */}
      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div className="kart signal-top flex h-full flex-col p-8" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
                <span className="inline-grid size-11 place-items-center rounded-2xl bg-[var(--color-navy-soft)]" aria-hidden>
                  <Scale size={22} strokeWidth={1.75} color="var(--color-navy)" />
                </span>
                <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">İlan değil, tahsis</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Türkiye&apos;de satılık konut ilanları EİDS ilan rejimine tabidir ve kurallara aykırı
                  paylaşımın yaptırımı ağırdır. Projedar bu rejimin kapsadığı işi hiç yapmaz: son
                  kullanıcıya açık ilan yayını yoktur. Stok yalnız müteahhidin tahsis ettiği doğrulanmış
                  danışmanların kapalı havuzunda görünür; müşteriye ulaşan tek şey danışmanın birebir
                  paylaştığı canlı linktir.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Kapalı devre model bu yüzden yalnız bir tercih değil, aynı zamanda yapısal bir uyumluluk
                  kalkanıdır: ilan yok, tahsis var.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="kart signal-top flex h-full flex-col p-8" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
                <span className="inline-grid size-11 place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
                  <EyeOff size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
                </span>
                <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">KVKK çizgimiz nettir</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Piyasa ve üretici zekâsı evet, müşteri profili hayır. Platform anonim kullanım
                  sinyalleriyle (görüntüleme, paylaşım, opsiyon hareketi) üreticiye talep zekâsı üretir;
                  son alıcıya ait kişisel veri profillemez.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Danışmanın müşterisi danışmanda kalır: lead hiçbir havuzda akmaz, kimseyle
                  paylaşılmaz, satılmaz. Müteahhit lead akışı görmez; yalnız kendi satış sürecindeki
                  kaydı ad ve telefonla sorgulayabilir.
                </p>
                <p className="mt-4 font-mono text-[11px] text-[var(--ink-faint)]">
                  Detay: <Link href="/kvkk-aydinlatma" className="underline hover:text-ink">KVKK Aydınlatma Metni</Link> · <Link href="/gizlilik" className="underline hover:text-ink">Gizlilik</Link>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ SSS ============ */}
      <section className="relative border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Sık sorulanlar</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Güven üzerine</h2>
            </div>
          </Reveal>
          <div className="mt-12 flex flex-col gap-3">
            {SSS.map((q, i) => (
              <Reveal key={q.s} delay={i * 50}>
                <details className="sss-item kart p-0 hover:-translate-y-0.5">
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

      {/* ============ ÇİFT KAPILI CTA ============ */}
      <section className="relative px-5 pb-24 pt-20 sm:px-6">
        <Reveal>
          <div className="mx-auto grid w-full max-w-4xl gap-5 sm:grid-cols-2">
            <Link href="/muteahhit" className="group kart signal-top flex flex-col p-7 transition-transform duration-200 hover:-translate-y-1" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Müteahhit · Proje sahibi</p>
              <p className="mt-2 font-display text-xl font-extrabold tracking-tight text-ink">Bu protokolle projenizi ağa açın</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">Stok, fiyat ve tahsis tek noktadan sizde; çift satış yapısal olarak imkânsız.</p>
              <p className="mt-4 text-[14px] font-semibold text-teal">Müteahhitler için <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span></p>
            </Link>
            <Link href="/emlakci" className="group kart signal-top flex flex-col p-7 transition-transform duration-200 hover:-translate-y-1" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Gayrimenkul danışmanı</p>
              <p className="mt-2 font-display text-xl font-extrabold tracking-tight text-ink">Doğrulanmış ağa ücretsiz katılın</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">Tahsisli canlı havuz, her zaman güncel fiyat, komisyonun tamamı sizde.</p>
              <p className="mt-4 text-[14px] font-semibold text-teal">Danışmanlar için <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span></p>
            </Link>
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
            <Link href="/kullanim-kosullari" className="transition-colors duration-200 hover:text-ink hover:underline">Kullanım Koşulları</Link>
            <Link href="/gizlilik" className="transition-colors duration-200 hover:text-ink hover:underline">Gizlilik</Link>
            <Link href="/kvkk-aydinlatma" className="transition-colors duration-200 hover:text-ink hover:underline">KVKK Aydınlatma</Link>
          </nav>
        </div>
        <div className="border-t border-[var(--cizgi)] px-5 py-5 text-center text-[11px] text-[var(--ink-faint)] sm:px-6">© 2026 Projedar, Tüm hakları saklıdır.</div>
      </footer>
    </main>
  );
}
