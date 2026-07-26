import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { IkizKesit } from "./IkizKesit";
import { CanliStok } from "./CanliStok";
import { OpsiyonKilidi } from "./OpsiyonKilidi";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";
import { IkiTaraf } from "@/components/landing/IkiTaraf";

/**
 * Mockup 01 · "Architectural Data Twin" (Mimari Veri İkizi)
 * Tasarım laboratuvarı rotası: yaşayan dijital bina metaforu.
 * Pafta estetiği: kırık beyaz zemin + ince ızgara + ink çizgi + mono damga.
 * Sinyal renkleri sabit: müsait yeşil, opsiyon amber, satıldı kırmızı.
 */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mockup 01 · Architectural Data Twin | ProjePazar Design Lab",
  description:
    "ProjePazar tasarım laboratuvarı: mimari veri ikizi konsepti, yaşayan dijital bina.",
  robots: { index: false },
};

const SORUN_DAMGALARI = [
  "Kopya sayısı: bilinmiyor",
  "Son güncelleme: belirsiz",
  "Çift satış riski: açık",
] as const;

const KARSILASTIRMA: readonly (readonly [string, string, string])[] = [
  ["Görünürlük", "herkese açık vitrin", "yalnız tahsisli ağ"],
  ["Veri", "kopyalanır, eskir", "tek kayıt, canlı"],
  ["Çift satış", "telefonla önlenmeye çalışılır", "veritabanı reddeder"],
  ["İz", "kim gördü belirsiz", "her hareket defterde"],
  ["Gelir modeli", "ilan ücreti, komisyon", "komisyon yok"],
];

const ANTET: readonly (readonly [string, string])[] = [
  ["Proje", "ProjePazar"],
  ["Pafta", "Mockup 01"],
  ["Konsept", "Mimari Veri İkizi"],
  ["Ölçek", "1:Canlı"],
  ["Revizyon", "Sürekli"],
  ["Tarih", "2026"],
];

function BolumBasi({ no, baslik }: { no: string; baslik: string }) {
  return (
    <div className="relative mb-9 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-[1.5px] border-ink pb-3">
      <span className="font-mono text-[12px] font-semibold tracking-[0.12em] text-[var(--color-teal-d)]">
        {no}
      </span>
      <h2 className="dt-display text-[clamp(21px,3vw,29px)] font-bold uppercase leading-tight text-ink">
        {baslik}
      </h2>
      <span
        aria-hidden
        className="absolute -bottom-[5px] left-0 w-full border-b border-[var(--cizgi)]"
      />
    </div>
  );
}

export default function MockupBirSayfa() {
  return (
    <div className={`${bricolage.variable} dt-zemin min-h-screen text-ink`}>
      <style>{`
        .dt-zemin {
          background-color: #f7f5ef;
          background-image:
            linear-gradient(rgba(16, 36, 58, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 36, 58, 0.055) 1px, transparent 1px),
            linear-gradient(rgba(16, 36, 58, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 36, 58, 0.028) 1px, transparent 1px);
          background-size: 112px 112px, 112px 112px, 28px 28px, 28px 28px;
        }
        .dt-display {
          font-family: var(--font-bricolage), var(--font-outfit), sans-serif;
          letter-spacing: -0.015em;
        }
        .dt-damga {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
        }
        .dt-cerceve {
          background: #fff;
          border: 1.5px solid var(--color-ink);
          border-radius: 2px;
          box-shadow: 8px 8px 0 rgba(16, 36, 58, 0.07);
        }
        .dt-tus {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 0 22px;
          border-radius: 2px;
          border: 1.5px solid var(--color-ink);
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }
        .dt-tus-dolu { background: var(--color-ink); color: #fff; }
        .dt-tus-dolu:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(16, 36, 58, 0.3); }
        .dt-tus-cizgi { background: #fff; color: var(--color-ink); }
        .dt-tus-cizgi:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(16, 36, 58, 0.18); }
        .dt-koyu .dt-tus-dolu { background: #fff; color: var(--color-ink); border-color: #fff; }
        .dt-koyu .dt-tus-dolu:hover { box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.22); }
        .dt-koyu .dt-tus-cizgi { background: transparent; color: #fff; border-color: rgba(255, 255, 255, 0.6); }
        .dt-koyu .dt-tus-cizgi:hover { background: rgba(255, 255, 255, 0.08); box-shadow: 4px 4px 0 rgba(255, 255, 255, 0.14); }
        @keyframes dtBelir {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        .dt-belir { animation: dtBelir 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes dtPing {
          0% { opacity: 0.95; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(1.24); }
        }
        .dt-ping {
          transform-box: fill-box;
          transform-origin: center;
          animation: dtPing 1.4s ease-out both;
        }
        @keyframes dtTarama {
          from { top: -10%; }
          to { top: 104%; }
        }
        .dt-tarama {
          position: absolute;
          left: 0;
          right: 0;
          height: 28px;
          pointer-events: none;
          background: linear-gradient(180deg, transparent, rgba(30, 155, 138, 0.22), transparent);
          animation: dtTarama 0.9s linear both;
        }
        @keyframes dtKilitDus {
          0% { opacity: 0; transform: translateY(-10px) scale(0.6); }
          60% { opacity: 1; transform: translateY(1px) scale(1.1); }
          100% { opacity: 1; transform: none; }
        }
        .dt-kilit-dus { animation: dtKilitDus 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes dtHalka {
          0% { box-shadow: 0 0 0 0 rgba(227, 161, 44, 0.5); }
          100% { box-shadow: 0 0 0 12px rgba(227, 161, 44, 0); }
        }
        .dt-halka { animation: dtHalka 0.9s ease-out both; }
        @keyframes dtAgNabiz {
          0% { box-shadow: 0 0 0 0 rgba(30, 155, 138, 0.4); }
          100% { box-shadow: 0 0 0 10px rgba(30, 155, 138, 0); }
        }
        .dt-ag-nabiz { animation: dtAgNabiz 1s ease-out both; }
        @media (min-width: 1024px) {
          .dt-perspektif { transform: perspective(1200px) rotateX(1.6deg) rotateY(-3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dt-belir, .dt-ping, .dt-tarama, .dt-kilit-dus, .dt-halka, .dt-ag-nabiz { animation: none; }
          .dt-ping { opacity: 0; }
          .dt-tarama { display: none; }
          .dt-tus:hover { transform: none; }
        }
      `}</style>

      {/* ============ ÜST BAR ============ */}
      <header className="sticky top-0 z-30 border-b-[1.5px] border-ink bg-[#f7f5ef]">
        <div className="mx-auto flex h-[62px] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ProjePazar ana sayfa">
            <svg viewBox="0 0 22 22" className="size-[22px] flex-none" aria-hidden>
              <rect x="1" y="1" width="20" height="20" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
              <rect x="4.5" y="11" width="5" height="6.5" fill="var(--color-green)" />
              <rect x="12.5" y="7" width="5" height="10.5" fill="var(--color-amber)" />
              <line x1="1" y1="17.5" x2="21" y2="17.5" stroke="var(--color-ink)" strokeWidth="1.5" />
            </svg>
            <span className="dt-display text-[16px] font-extrabold uppercase tracking-[0.1em] text-ink">
              ProjePazar
            </span>
          </Link>
          <span className="dt-damga hidden md:inline">
            Tasarım Lab · Mockup 01 · Mimari Veri İkizi
          </span>
          <Link href="/kayit?rol=uretici" className="dt-tus dt-tus-dolu !min-h-[44px] !px-4 !text-[12px]">
            Başla
          </Link>
        </div>
      </header>

      {/* ============ HERO: NEDİR ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div className="dt-damga mb-6 flex flex-wrap gap-x-5 gap-y-1.5">
              <span>Pafta No: PP-DT-01</span>
              <span>Rev: Sürekli</span>
              <span className="flex items-center gap-1.5 text-[#1f7d4c]">
                <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
                senkron: canlı
              </span>
            </div>
            <p className="mb-4 border-l-[3px] border-teal pl-3 font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-[var(--color-teal-d)]">
              Gayrimenkul projelerinin canlı satış ağı
            </p>
            <h1 className="dt-display text-[clamp(33px,5.4vw,58px)] font-extrabold leading-[1.05] text-ink">
              Bir daire satıldığında, bütün ağ aynı anda görür.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-ink-soft">
              ProjePazar, projenizin <strong className="font-semibold text-ink">dijital ikizini</strong> kurar.
              Her daire canlı bir veri hücresidir: fiyat, durum ve opsiyon tek kayıttan yönetilir,
              yalnız tahsis ettiğiniz danışman ağına yayılır. Kopya liste yok, eski fiyat yok.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/kayit?rol=uretici" className="dt-tus dt-tus-dolu">
                Projemi canlı ağa aç
              </Link>
              <Link href="/kayit?rol=emlakci" className="dt-tus dt-tus-cizgi">
                Danışman olarak katıl
              </Link>
            </div>
            <a
              href="#sistem"
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 font-mono text-[12.5px] font-semibold text-ink-soft underline decoration-[var(--cizgi-2)] underline-offset-4 transition-colors hover:text-ink"
            >
              Sistemin nasıl çalıştığını gör
              <span aria-hidden>↓</span>
            </a>
          </div>
          <IkizKesit />
        </div>
      </section>

      {/* ============ 01 · BUGÜNKÜ SİSTEM NEDEN BOZUK ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <BolumBasi no="01" baslik="Bugünkü sistem neden bozuk" />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* kâğıt kopyalar yığını */}
          <div className="relative mx-auto grid w-full max-w-[420px] px-2 py-12" aria-label="Aynı dairenin üç farklı ve eski kopyası: tablo dosyası, PDF ve mesaj">
            <div className="col-start-1 row-start-1 -translate-x-[5%] -translate-y-6 -rotate-3">
              <div className="rounded-[2px] border border-[var(--cizgi-2)] bg-white p-4 shadow-[var(--golge-1)]">
                <p className="truncate font-mono text-[11px] font-semibold text-ink">fiyat_listesi_SON_v7.xlsx</p>
                <p className="mt-2 flex items-center justify-between gap-3 font-mono text-[12.5px] text-ink-soft">
                  <span>A-14 · 3+1</span>
                  <span className="font-semibold text-ink">₺9.450.000</span>
                </p>
                <p className="mt-2 inline-flex rounded-[3px] bg-[var(--color-amber-soft)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#9a6a12]">
                  12 gün önce
                </p>
              </div>
            </div>
            <div className="col-start-1 row-start-1 translate-x-[7%] translate-y-5 rotate-2">
              <div className="rounded-[2px] border border-[var(--cizgi-2)] bg-white p-4 shadow-[var(--golge-1)]">
                <p className="truncate font-mono text-[11px] font-semibold text-ink">BlokA_subat_guncel.pdf</p>
                <p className="mt-2 flex items-center justify-between gap-3 font-mono text-[12.5px] text-ink-soft">
                  <span>A-14 · 3+1</span>
                  <span className="font-semibold text-ink">₺9.200.000</span>
                </p>
                <p className="mt-2 inline-flex rounded-[3px] bg-[var(--color-amber-soft)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#9a6a12]">
                  3 hafta önce
                </p>
              </div>
            </div>
            <div className="col-start-1 row-start-1 -translate-x-[2%] translate-y-[104px] -rotate-1">
              <div className="rounded-[2px] border border-[var(--cizgi-2)] bg-white p-4 shadow-[var(--golge-1)]">
                <p className="text-[13px] leading-snug text-ink">A-14 hâlâ müsait mi? Müşterim bekliyor.</p>
                <p className="mt-1.5 font-mono text-[10px] text-[var(--ink-faint)]">Mesaj · dün 21:47 · yanıt yok</p>
              </div>
            </div>
            <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 -rotate-2 whitespace-nowrap rounded-[2px] border-[1.5px] border-red bg-[var(--color-red-soft)] px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#a23f34]">
              Aynı daire · üç farklı bilgi
            </span>
          </div>
          {/* metin */}
          <div>
            <h3 className="dt-display text-[clamp(21px,2.6vw,27px)] font-bold leading-snug text-ink">
              Binanızın üç kopyası dolaşıyor; hiçbiri bina değil.
            </h3>
            <p className="mt-4 max-w-[54ch] text-[15.5px] leading-relaxed text-ink-soft">
              Stok bugün tablolarda, PDF listelerde ve mesaj yazışmalarında yaşıyor. Her kopya
              çekildiği gün doğru, ertesi gün şüpheli. Danışman emin olamıyor, üretici telefona
              dönüyor, müşteri beklerken daire satılıyor. Sorun insan değil,
              mimari: <strong className="font-semibold text-ink">binanın tek ikizi yok.</strong>
            </p>
            <ul className="mt-6 space-y-2.5">
              {SORUN_DAMGALARI.map((d) => (
                <li key={d} className="flex items-center gap-3 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  <span className="size-2 flex-none rounded-[2px] border border-red bg-[var(--color-red-soft)]" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ 02 · CANLI STOK ============ */}
      <section id="sistem" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <BolumBasi no="02" baslik="Canlı stok: fiyat tek satırda yaşar" />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h3 className="dt-display text-[clamp(21px,2.6vw,27px)] font-bold leading-snug text-ink">
              Verinin yaşı, üstünde yazar.
            </h3>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-soft">
              İkizde her dairenin fiyatı ve durumu yalnız bir satırda tutulur; paylaşılan her sayfa,
              her danışman ekranı o satırı canlı okur. Her birimin yanında son güncelleme saati
              durur: veri tazeyse rozet yeşildir, bayatlarsa sarıya döner ve bunu herkes görür.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(47,179,107,0.5)] bg-white px-3.5 py-1.5 font-mono text-[12px] font-medium text-[#1f7d4c]">
                <span className="size-2 rounded-full bg-green" aria-hidden />2 dk önce
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(227,161,44,0.55)] bg-white px-3.5 py-1.5 font-mono text-[12px] font-medium text-[#9a6a12]">
                <span className="size-2 rounded-full bg-amber" aria-hidden />9 gün önce · bayat
              </span>
            </div>
            <p className="mt-6 max-w-[52ch] border-l-2 border-[var(--cizgi-2)] pl-3 font-mono text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
              Kural: fiyat hiçbir yere kopyalanmaz. Üretici bir kez günceller, bütün ağ yeni değeri okur.
            </p>
          </div>
          <CanliStok />
        </div>
      </section>

      {/* ============ 03 · OPSİYON KİLİDİ (SIGNATURE) ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <BolumBasi no="03" baslik="Opsiyon kilidi: söz değil, veritabanı" />
        <p className="-mt-4 mb-8 max-w-[64ch] text-[15.5px] leading-relaxed text-ink-soft">
          Bir daire opsiyonlandığında ikizde <strong className="font-semibold text-ink">fiziksel olarak kilitlenir</strong>:
          aynı birime ikinci aktif opsiyon, uygulamada değil veritabanı seviyesinde reddedilir.
          Aşağıda protokolün tamamı elinizin altında: yeşil bir daireye dokunun, altı adımı izleyin.
        </p>
        <OpsiyonKilidi />
      </section>

      {/* ============ 04 · TAHSİS VE YETKİ ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <BolumBasi no="04" baslik="Tahsis: herkes her şeyi görmez" />
        <p className="-mt-4 mb-8 max-w-[64ch] text-[15.5px] leading-relaxed text-ink-soft">
          İkiz herkese açılmaz. Hangi danışman hangi bloğu, hangi daireyi görür: üretici belirler.
          Kapsamı değiştirin, ağın gördüğü stok anında daralsın.
        </p>
        <TahsisPaneli />
      </section>

      {/* ============ 05 · İKİ TARAFIN KAZANCI ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <BolumBasi no="05" baslik="İki taraf, aynı gerçek" />
        <p className="-mt-4 mb-8 max-w-[64ch] text-[15.5px] leading-relaxed text-ink-soft">
          Üretici kontrolü elinde tutar, danışman güncel veriyle satar. Soldaki satıra dokunun:
          tek kayıt değişsin, iki ekran birden güncellensin.
        </p>
        <IkiTaraf />
      </section>

      {/* ============ İLAN PORTALI DEĞİL (KOYU ŞERİT) ============ */}
      <div className="dt-koyu relative overflow-hidden border-y-[1.5px] border-ink bg-[#0d2438]">
        {/* maket fotoğrafının navy duotone varyantı: doku, dekor değil bağlam */}
        <div aria-hidden className="absolute inset-0">
          <Image
            src="/generated/mockup-01/hero-kesit-maket.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[62%_30%] opacity-[0.16] mix-blend-luminosity grayscale"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,#0d2438_0%,rgba(13,36,56,0.72)_52%,rgba(13,36,56,0.4)_100%)]" />
        </div>
        <div className="komuta-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <p className="dt-damga !text-white/50">Detay 06 · Konum</p>
              <h2 className="dt-display mt-3 text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.1] text-white">
                Bu bir ilan portalı{" "}
                <span className="relative inline-block text-white/55">
                  değil
                  <span aria-hidden className="absolute inset-x-[-2%] top-[52%] h-[3px] -rotate-3 bg-red" />
                </span>
                ; binanızın ikizi.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-white/70">
                Vitrin yok, ilan yok, komisyon yok. ProjePazar üreticinin kontrolündeki kapalı bir
                dağıtım altyapısıdır: stok yalnız yetkili ağda dolaşır, satış bedeline hiçbir zaman
                dokunulmaz.
              </p>
            </div>
            <div className="overflow-hidden rounded-[2px] border-[1.5px] border-white/25 bg-white/[0.04]">
              <div className="grid grid-cols-[minmax(76px,0.7fr)_1fr_1fr] border-b border-white/15 bg-white/[0.05] font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                <span className="px-3 py-2.5 sm:px-4">Alan</span>
                <span className="px-3 py-2.5 sm:px-4">İlan portalı</span>
                <span className="px-3 py-2.5 text-[#53c8b8] sm:px-4">Canlı satış ağı</span>
              </div>
              {KARSILASTIRMA.map(([alan, portal, ag]) => (
                <div
                  key={alan}
                  className="grid grid-cols-[minmax(76px,0.7fr)_1fr_1fr] border-b border-white/[0.08] font-mono text-[11.5px] last:border-b-0"
                >
                  <span className="px-3 py-3 font-semibold text-white/80 sm:px-4">{alan}</span>
                  <span className="px-3 py-3 text-white/50 sm:px-4">{portal}</span>
                  <span className="px-3 py-3 font-medium text-white sm:px-4">{ag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ FİNAL CTA ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="dt-damga">Pafta kapanışı</p>
        <h2 className="dt-display mx-auto mt-4 max-w-[22ch] text-[clamp(28px,4.6vw,46px)] font-extrabold leading-[1.1] text-ink">
          Binanızın ikizini kurun, ağı canlıya alın.
        </h2>
        <p className="mx-auto mt-4 max-w-[48ch] text-[15.5px] leading-relaxed text-ink-soft">
          İlk projenin yüklenmesi dakikalar sürer. Yarın sahada kimse size müsait mi diye sormaz:
          ikize bakar.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/kayit?rol=uretici" className="dt-tus dt-tus-dolu">
            Projemi canlı ağa aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="dt-tus dt-tus-cizgi">
            Danışman olarak katıl
          </Link>
        </div>
        <p className="mt-5 font-mono text-[11.5px] text-[var(--ink-faint)]">
          Danışman hesabı ücretsizdir. Satıştan komisyon alınmaz.
        </p>
      </section>

      {/* ============ ANTET (FOOTER) ============ */}
      <footer className="border-t-[1.5px] border-ink bg-white/60">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {ANTET.map(([k, v]) => (
              <div key={k} className="border-b border-r border-[var(--cizgi)] px-4 py-3 last:border-r-0">
                <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  {k}
                </span>
                <span className="mt-0.5 block font-mono text-[12px] font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 font-mono text-[10.5px] text-[var(--ink-faint)]">
            <span>Bu sayfa tasarım laboratuvarı çalışmasıdır; tüm veriler örnektir.</span>
            <span>© 2026 ProjePazar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
