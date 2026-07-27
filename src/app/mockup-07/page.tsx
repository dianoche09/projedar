import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";
import { IkiTaraf } from "@/components/landing/IkiTaraf";
import { AkisFeed } from "@/components/landing/AkisFeed";
import { HeroFazSeridi } from "./HeroFazSeridi";
import { EskiyenPdf } from "./EskiyenPdf";
import { LuksStok } from "./LuksStok";

/**
 * Mockup 07 · Faz Şeridi
 * Konsept: inşaat zaman aksı, LÜKS segment. Hero = "İnşaat Zamanla Yarış":
 * temelden teslime 3 karelik film şeridi; fazlar ilerledikçe stok erir,
 * daire ağ üzerinde kilitlenir, kilit bilgisi geçmiş-gelecek karelerine
 * dalga ile yayılır. Ana mesaj: erken alan kazanır, ağ hep senkron kalır.
 */

export const metadata: Metadata = {
  title: "Mockup 07 · Faz Şeridi | ProjePazar Design Lab",
  description:
    "ProjePazar tasarım laboratuvarı: inşaat zaman aksı konsepti. Lüks konut projesinin stoğu temelden teslime tek canlı kayıtta yaşar; fazlar ilerledikçe erken alan kazanır.",
  robots: { index: false },
};

/** Konum karşıtlığı: ilan portalı mantığı ve kapalı dağıtım ağı mantığı. */
const PORTAL = [
  "Lüks proje herkese açık vitrinde sıradanlaşır",
  "Aynı rezidans beş ilanda beş ayrı fiyatla dolaşır",
  "Şubat listesi teslim gününe kadar elden ele gezer",
  "Vitrin için ödenir, veri sahipsizdir",
];
const AG = [
  "Kapalı devre: projeyi yalnız yetkili danışman görür",
  "Bir birimin tek gerçeği vardır, kopyası olmaz",
  "Opsiyon kilidi veritabanında: aynı daire iki kez satılmaz",
  "Komisyon yok: satıştan pay alınmaz, danışmana ücretsiz",
];

export default function Mockup07() {
  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      {/* ============ ÜST MENÜ ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
          <Link href="/" aria-label="ProjePazar ana sayfa" className="shrink-0">
            <Logo size={26} wordmark />
          </Link>
          <span className="hidden font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)] sm:block">
            Mockup 07 · Tasarım laboratuvarı
          </span>
          <Link href="/kayit" className="btn-action">
            Ağa katıl
          </Link>
        </nav>
      </header>

      {/* ============ HERO: inşaat zamanla yarış / faz şeridi ============ */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          background:
            "radial-gradient(1100px 560px at 82% -12%, rgba(201, 163, 95, 0.15), transparent 60%), radial-gradient(820px 480px at -6% 34%, rgba(30, 155, 138, 0.1), transparent 55%), linear-gradient(170deg, #081420 0%, #0b1c2e 55%, #0d2334 100%)",
        }}
      >
        <div className="komuta-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-12 text-center sm:px-6 lg:pt-16">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#dcc08c]">
            Lüks konut · temelden teslime tek kayıt
          </p>
          <h1 className="mt-4 font-display text-[38px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[54px]">
            Projenizin stoğu
            <br />
            <span className="text-[#dcc08c]">artık yaşayan bir ağ.</span>
          </h1>
          <p className="mt-4 max-w-md text-pretty text-[13.5px] leading-relaxed text-white/80 sm:text-sm">
            İnşaat zamanla yarışır; fiyat, durum ve yetki şerit boyunca senkron ilerler. Fazlar
            ilerledikçe stok erir: erken alan kazanır.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href="/kayit" className="btn-action">
              Projemi canlı ağa aç
            </Link>
            <Link
              href="/kayit"
              className="inline-flex min-h-11 items-center justify-center rounded-[13px] border border-white/30 bg-white/10 px-4 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
            >
              Danışman olarak katıl
            </Link>
          </div>
        </div>
        <div className="relative pb-10 pt-9 sm:pb-14">
          <HeroFazSeridi />
        </div>
      </section>

      {/* ============ NEDİR ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Nedir</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Satış ofisi yazılımı değil, dağıtım altyapısı
                </h2>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                  İnşaat halindeki lüks projenin verisi tek kayıtta tutulur: üretici fiyatı, durumu ve
                  kimin göreceğini tek noktadan yönetir. Danışman yalnız kendisine tahsisli birimleri
                  görür ve müşterisine her zaman canlı değerle paylaşır. Faz ilerledikçe değişen tek
                  şey fiyattır; kaydın adresi hiç değişmez.
                </p>
              </div>
              <div className="grid content-center gap-3 sm:grid-cols-3 lg:gap-4">
                {[
                  ["TEK KAYIT", "Fiyat ve durum yalnız birim kaydında yaşar; kopyası olmaz."],
                  ["FAZ SENKRONU", "Temel, kaba yapı, teslim: her karede aynı canlı değer okunur."],
                  ["YETKİ KAPISI", "Kim hangi kuleyi görür, üretici tahsisle tanımlar."],
                ].map(([b, a]) => (
                  <div key={b} className="rounded-2xl border border-[var(--cizgi)] bg-white p-4 shadow-[var(--golge-1)]">
                    <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--color-teal-d)]">{b}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ BOZUK SİSTEM: şantiye ilerler, PDF yaşlanır ============ */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Bozuk sistem</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Şantiye ilerler, PDF yaşlanır
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Temelde dağıtılan fiyat listesi kaba yapıda çoktan eskimiştir. Danışman Şubat sürümünü
                anlatırken şantiye iki faz ileridedir; müşteriye söylenen rakam çağın gerisinde kalır.
                Fazı ilerlet, farkın nasıl açıldığını izle:
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <EskiyenPdf />
          </Reveal>
        </div>
      </section>

      {/* ============ CANLI STOK ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 sm:px-6 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal>
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Canlı stok</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Fiyat tek yerde yaşar
              </h2>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Kule stoğu bir liste değil, canlı kayıttır. Üretici fiyatı burada değiştirir; dolaşımdaki
                her paylaşım bağlantısı bir sonraki açılışta bu değeri basar. Faz atlandığında liste
                yeniden dağıtılmaz, çünkü dağıtılan şey liste değil eriştir.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Her yazış tazelik damgasını yeniler: bayatlayan veri rozetle görünür",
                  "Durum sinyalleri sabittir: yeşil müsait, amber opsiyon, kırmızı satıldı",
                  "Opsiyon kilidi veritabanı seviyesindedir: çift satış fiziken imkansız",
                ].map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <span className="mt-[7px] size-1.5 flex-none rounded-full bg-teal" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <LuksStok />
          </Reveal>
        </div>
      </section>

      {/* ============ TAHSİS ============ */}
      <section className="izgara-doku">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tahsis</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Her danışman her kuleyi görmez
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Lüks stokta görünürlük bir ayar değil, karardır. Üretici hangi bloğu, hangi katı, hangi
                daireyi kime açacağını tek panelden tanımlar; tahsisin dışındaki her şey ağda görünmezdir.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <TahsisPaneli />
          </Reveal>
        </div>
      </section>

      {/* ============ İKİ TARAF ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">İki taraf</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Aynı gerçek, iki yetki
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Üretici yönetir, danışman satar; ikisi de aynı canlı kayda bakar. Soldaki satıra dokun,
                fiyatın tek hamlede her uca nasıl yayıldığını gör.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <IkiTaraf />
          </Reveal>
        </div>
      </section>

      {/* ============ CANLI AKIŞ ============ */}
      <AkisFeed />

      {/* ============ İLAN PORTALI DEĞİL ============ */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Konum</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                İlan portalı değil
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Portal vitrin satar; burada vitrin yok, altyapı var. Son kullanıcıya açık ilan yoktur:
                paylaşım birebirdir, ağ kapalı ve davetlidir. Lüks stok değerini kapalı devrede korur.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--cizgi)] bg-white p-5 shadow-[var(--golge-1)] sm:p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                  Portal mantığı
                </p>
                <ul className="mt-4 space-y-3">
                  {PORTAL.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                      <span className="mt-[7px] size-1.5 flex-none rounded-full bg-[var(--color-red)]" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="kart signal-top p-5 sm:p-6" style={{ "--_sig": "var(--color-teal)" } as React.CSSProperties}>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-teal-d)]">
                  Dağıtım ağı mantığı
                </p>
                <ul className="mt-4 space-y-3">
                  {AG.map((m) => (
                    <li key={m} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink">
                      <span className="mt-[7px] size-1.5 flex-none rounded-full bg-teal" aria-hidden />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FİNAL CTA ============ */}
      <section className="px-5 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="komuta komuta-grid mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] px-6 py-14 text-center sm:px-10 sm:py-16">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#dcc08c]">
              Kapalı ağ · davetli üyelik · komisyonsuz
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Şerit ilerliyor: yerinizi temel fazında alın
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
              Üreticiyseniz kule stoğunu kontrolü bırakmadan seçili danışmanlara açın. Danışmansanız
              size tahsisli lüks projeleri canlı görün, her zaman doğru fiyatla satın.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/kayit" className="btn-action">
                Projemi canlı ağa aç
              </Link>
              <Link
                href="/kayit"
                className="inline-flex min-h-11 items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-4 text-[13.5px] font-semibold text-white transition-all duration-200 hover:bg-white/20"
              >
                Danışman olarak katıl
              </Link>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
              temelden teslime · tek canlı kayıt · çift satış imkansız
            </p>
          </div>
        </Reveal>
      </section>

      {/* ============ ALT BİLGİ ============ */}
      <footer className="border-t border-[var(--cizgi)] bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-6">
          <Logo size={22} wordmark />
          <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            Mockup 07 · Faz Şeridi · dizine kapalı taslak
          </p>
        </div>
      </footer>
    </main>
  );
}
