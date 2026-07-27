import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { AgDiyagrami } from "@/components/landing/AgDiyagrami";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";
import { IkiTaraf } from "@/components/landing/IkiTaraf";
import { KapiHaritasi } from "./KapiHaritasi";
import { HeroYetkiKapisi } from "./HeroYetkiKapisi";
import { SizintiSahnesi } from "./SizintiSahnesi";
import { CanliStok } from "./CanliStok";
import { OpsiyonKilidi } from "./OpsiyonKilidi";

/**
 * Mockup 03 · Living Distribution Network
 * Konsept: kontrollü satış ağı kartografisi. Hero = "Yetki Kapılı Şantiye
 * Haritası": fazlı şantiye hava çekimi üzerinde 4 karelik otomatik koreografi;
 * veri kapıdan geçerken süzülür, geçemeyen akış kapıda görünür şekilde durur.
 * Ana mesaj: herkes her şeyi görmek zorunda değil.
 */

export const metadata: Metadata = {
  title: "Mockup 03 · Living Distribution Network | ProjePazar Design Lab",
  description:
    "ProjePazar tasarım laboratuvarı: kontrollü satış ağı kartografisi konsepti. Veri tek kayıtta doğar, yetki kapılarından geçer, yalnız izinli danışmanlara ulaşır.",
  robots: { index: false },
};

/** Konum karşıtlığı: portal mantığı ve dağıtım ağı mantığı. */
const PORTAL = [
  "İlan girilir, girildiği gün yaşlanmaya başlar",
  "Aynı daire beş ayrı ilanda beş ayrı fiyatla durur",
  "Herkes her şeyi görür, üreticinin kontrolü yoktur",
  "Vitrin için ödenir, veri sahipsizdir",
];
const AG = [
  "Kayıt canlıdır: fiyat ve durum tek kaynaktan okunur",
  "Bir dairenin tek gerçeği vardır, kopyası olmaz",
  "Kim neyi görür, üretici kapı kapı tanımlar",
  "Komisyon yok: satıştan pay alınmaz, danışmana ücretsiz",
];

export default function Mockup03() {
  return (
    <main className="flex flex-1 flex-col bg-paper text-ink">
      {/* ============ ÜST MENÜ ============ */}
      <header className="sticky top-0 z-50 border-b border-[var(--cizgi)] bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
          <Link href="/" aria-label="ProjePazar ana sayfa" className="shrink-0">
            <Logo size={26} wordmark />
          </Link>
          <span className="hidden font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)] sm:block">
            Mockup 03 · Tasarım laboratuvarı
          </span>
          <Link href="/kayit" className="btn-action">
            Ağa katıl
          </Link>
        </nav>
      </header>

      {/* ============ HERO: yetki kapılı şantiye haritası ============ */}
      <section className="relative isolate overflow-hidden bg-navy">
        <HeroYetkiKapisi />
        {/* başlık üst gökte; sahnenin kendisi alttaki boşlukta oynar */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-[320px] pt-12 text-center sm:px-6 sm:pb-[380px] lg:pb-[440px] lg:pt-16">
          <h1 className="font-display text-[38px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[54px]">
            Her proje. Her danışman.
            <br />
            <span className="text-[#5ecfba]">Tek canlı gerçek.</span>
          </h1>
          <p className="mt-4 max-w-md text-pretty text-[13.5px] leading-relaxed text-white/80 sm:text-sm">
            Veri tek kayıtta doğar; yetki kapısından geçemeyen akış kapıda durur.
          </p>
          <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-2.5">
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
      </section>

      {/* ============ NEDİR ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Nedir</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  İlan sitesi değil, dağıtım altyapısı
                </h2>
                <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft sm:text-[15px]">
                  Proje verisi tek kayıtta tutulur: üretici fiyatı, durumu ve kimin göreceğini tek noktadan yönetir.
                  Danışman yalnız kendisine tahsisli stoğu görür ve müşterisine her zaman canlı değerle paylaşır.
                  Ağdaki her akışın nereden çıktığı, hangi kapıdan geçtiği ve kime ulaştığı bellidir.
                </p>
              </div>
              <div className="grid content-center gap-3 sm:grid-cols-3 lg:gap-4">
                {[
                  ["TEK KAYIT", "Fiyat ve durum yalnız birim kaydında yaşar; kopyası olmaz."],
                  ["YETKİ KAPISI", "Görünürlük tahsisle tanımlanır; tahmine bırakılmaz."],
                  ["CANLI TAZELİK", "Her veri son güncelleme damgası taşır; bayatlayan görünür."],
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

      {/* ============ BOZUK SİSTEM ============ */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Bozuk sistem</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Eski fiyat her yere sızar
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Bugün bir fiyat listesi ağa PDF, Excel ve ekran görüntüsüyle dağılır. Kaynağından koptuğu an
                yaşlanır; kimin elinde hangi sürümün olduğunu kimse bilmez. Aynı harita, iki düzen:
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <SizintiSahnesi />
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
                Stok tablosu bir liste değil, canlı kayıttır. Üretici fiyatı burada değiştirir; dolaşımdaki her
                paylaşım linki bir sonraki açılışta bu değeri basar. Eski sürüm diye bir şey üretilmez, çünkü
                kopya diye bir şey yoktur.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Her yazış tazelik damgasını yeniler: bayatlayan veri rozetle görünür",
                  "Durum sinyalleri sabittir: yeşil müsait, amber opsiyon, kırmızı satıldı",
                  "Paylaşım linki pencere gibidir: veriyi taşımaz, canlı kayıttan okur",
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
            <CanliStok />
          </Reveal>
        </div>
      </section>

      {/* ============ OPSİYON KİLİDİ ============ */}
      <section>
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Opsiyon kilidi</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Aynı daire iki kez satılamaz
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Opsiyon alınan birim veritabanı seviyesinde kilitlenir. İkinci deneme uygulamada değil,
                verinin kendisinde durdurulur: iyi niyete ve dikkate bırakılan hiçbir şey kalmaz.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <OpsiyonKilidi />
          </Reveal>
        </div>
      </section>

      {/* ============ TAHSİS: yıldız bölüm ============ */}
      <section className="izgara-doku border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Tahsis</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Herkes her şeyi görmek zorunda değil
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Yetki bu ağda bir ayar değil, fiziksel bir kapıdır. Aşağıda bir yetki profili seç: verinin hangi
                kapılardan geçtiğini, hangi kapıda durduğunu ve kime ulaştığını haritada izle.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <KapiHaritasi />
          </Reveal>
          <Reveal delay={100} className="mt-14">
            <p className="mb-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              Aynı kural, üretici panelinde böyle görünür
            </p>
            <TahsisPaneli />
          </Reveal>
        </div>
      </section>

      {/* ============ İKİ TARAF ============ */}
      <section>
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

      {/* ============ AĞ ETKİSİ ============ */}
      <section className="border-y border-[var(--cizgi)] bg-white/55">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Ağ etkisi</p>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                Tek proje aracı değil, ağ
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
                Tek proje yazılımları her firmayı kendi adasında tutar. Burada her yeni proje haritaya bir kütle,
                her yeni danışman bir erişim noktası ekler: bir danışman onlarca üreticinin kendisine açık
                stoğunu tek ekrandan görür.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <AgDiyagrami />
          </Reveal>
        </div>
      </section>

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
                paylaşım birebirdir, ağ kapalı ve davetlidir.
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
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7fd9c8]">
              Kapalı ağ · davetli üyelik
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Haritada yerini al: ağı ilk kuranlar belirler
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
              Üreticiysen stoğunu kontrolü bırakmadan yüzlerce danışmana aç. Danışmansan sana tahsisli
              projeleri canlı gör, doğru fiyatla sat.
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
              komisyonsuz · tahsisli · kapalı devre
            </p>
          </div>
        </Reveal>
      </section>

      {/* ============ ALT BİLGİ ============ */}
      <footer className="border-t border-[var(--cizgi)] bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-6">
          <Logo size={22} wordmark />
          <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            Mockup 03 · Yaşayan dağıtım ağı · dizine kapalı taslak
          </p>
        </div>
      </footer>
    </main>
  );
}
