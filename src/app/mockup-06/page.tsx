import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { HeroSenkronMasa } from "./HeroSenkronMasa";
import { LuksStok } from "./LuksStok";
import { TahsisPaneli } from "@/components/landing/TahsisPaneli";
import { IkiTaraf } from "@/components/landing/IkiTaraf";
import { AkisFeed } from "@/components/landing/AkisFeed";

/**
 * Mockup 06 · "Senkron İki Telefon" (lüks segment)
 * Tasarım laboratuvarı rotası: yeşil mermer + pirinç masa üzerinde iki telefon,
 * aynı kaydın aynı saniye kilitlenişini metinsiz anlatan hero koreografisi.
 * Lüks ton: bol boşluk, fildişi zemin, pirinç aksan; sinyal renkleri sabittir
 * (yeşil müsait, amber opsiyon, kırmızı satıldı).
 */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mockup 06 · Senkron İki Telefon | ProjePazar Design Lab",
  description:
    "ProjePazar tasarım laboratuvarı: lüks segment konsepti, iki telefonda aynı kayıt, aynı saniye, tek gerçek.",
  robots: { index: false },
};

const ILKELER: readonly (readonly [string, string, string])[] = [
  [
    "01",
    "Tek doğru kaynak",
    "Fiyat ve durum yalnız bir kayıtta yaşar. Paylaşılan her bağlantı o kaydı canlı okur; eski liste diye bir şey kalmaz.",
  ],
  [
    "02",
    "Tahsisli görünürlük",
    "Stok herkese açılmaz. Hangi danışman hangi bloğu görür, üretici belirler; ağın dışında kalan hiçbir şey görmez.",
  ],
  [
    "03",
    "Kilit veritabanında",
    "Opsiyon sözle değil, kayıt seviyesinde tutulur. Aynı daireye ikinci el, aynı saniye kapanır; komisyon alınmaz.",
  ],
];

const KAOS_NOTLARI = [
  "Liste yaşı: 41 gün",
  "Kopya sayısı: bilinmiyor",
  "Çift satış riski: açık",
] as const;

const KARSILASTIRMA: readonly (readonly [string, string, string])[] = [
  ["Vitrin", "herkese açık ilan", "davetli kapalı ağ"],
  ["Fiyat", "kopyalanmış liste", "tek canlı kayıt"],
  ["Opsiyon", "sözle tutulur", "veritabanında kilitlenir"],
  ["İz", "kim gördü belirsiz", "her hareket defterde"],
  ["Gelir", "ilan ücreti, komisyon", "komisyon yok"],
];

const ANTET: readonly (readonly [string, string])[] = [
  ["Proje", "ProjePazar"],
  ["Pafta", "Mockup 06"],
  ["Konsept", "Senkron İki Telefon"],
  ["Segment", "Lüks konut"],
  ["Revizyon", "Sürekli"],
  ["Tarih", "2026"],
];

function BolumBasi({ no, ustlik, baslik }: { no: string; ustlik: string; baslik: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="m6-damga">
        <span className="mr-3 text-[#b08d4a]">{no}</span>
        {ustlik}
      </p>
      <h2 className="m6-display mt-3 text-[clamp(24px,3.2vw,34px)] font-bold leading-[1.12] text-ink">
        {baslik}
      </h2>
      <span aria-hidden className="mt-5 block h-px w-16 bg-[#b08d4a]" />
    </div>
  );
}

export default function MockupAltiSayfa() {
  return (
    <div className={`${bricolage.variable} m6-zemin min-h-screen text-ink`}>
      <style>{`
        .m6-zemin {
          background:
            radial-gradient(900px 480px at 88% -6%, rgba(201, 162, 94, 0.10), transparent 60%),
            radial-gradient(760px 420px at -8% 20%, rgba(33, 26, 14, 0.045), transparent 55%),
            linear-gradient(180deg, #f8f5ee 0%, #f4efe4 100%);
        }
        .m6-display {
          font-family: var(--font-bricolage), var(--font-outfit), sans-serif;
          letter-spacing: -0.02em;
        }
        .m6-damga {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a6d33;
        }
        .m6-tus {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 999px;
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
        }
        .m6-tus-dolu {
          background: #211a10;
          color: #f3ead8;
          border: 1px solid #211a10;
        }
        .m6-tus-dolu:hover {
          background: #362b18;
          box-shadow: 0 10px 26px rgba(33, 26, 14, 0.28);
        }
        .m6-tus-cizgi {
          background: transparent;
          color: #211a10;
          border: 1px solid rgba(168, 130, 63, 0.55);
        }
        .m6-tus-cizgi:hover {
          border-color: #8a6d33;
          background: rgba(201, 162, 94, 0.1);
        }
        .m6-tus-fildisi {
          background: #f3ead8;
          color: #211a10;
          border: 1px solid #f3ead8;
        }
        .m6-tus-fildisi:hover {
          background: #fff;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.35);
        }
        .m6-tus-seffaf {
          background: rgba(21, 18, 13, 0.32);
          color: #f3ead8;
          border: 1px solid rgba(243, 227, 192, 0.5);
        }
        .m6-tus-seffaf:hover {
          background: rgba(21, 18, 13, 0.55);
        }
        .m6-kart {
          background: #fff;
          border: 1px solid rgba(168, 130, 63, 0.24);
          border-radius: 18px;
          box-shadow: 0 2px 6px rgba(33, 26, 14, 0.04), 0 18px 44px rgba(33, 26, 14, 0.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .m6-tus:hover { transform: none; }
        }
      `}</style>

      {/* ============ ÜST BAR ============ */}
      <header className="sticky top-0 z-30 border-b border-[rgba(168,130,63,0.25)] bg-[rgba(248,245,238,0.92)] backdrop-blur-sm">
        <div className="mx-auto flex h-[66px] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ProjePazar ana sayfa">
            <svg viewBox="0 0 22 22" className="size-[22px] flex-none" aria-hidden>
              <rect x="1" y="1" width="20" height="20" rx="4" fill="none" stroke="#b08d4a" strokeWidth="1.5" />
              <rect x="5" y="10.5" width="4.5" height="7" rx="1" fill="var(--color-green)" />
              <rect x="12.5" y="6.5" width="4.5" height="11" rx="1" fill="var(--color-amber)" />
            </svg>
            <span className="m6-display text-[17px] font-bold tracking-[0.02em] text-ink">
              ProjePazar
            </span>
          </Link>
          <span className="m6-damga hidden !tracking-[0.16em] md:inline">
            Tasarım Lab · Mockup 06 · Senkron İki Telefon
          </span>
          <Link href="/kayit?rol=uretici" className="m6-tus m6-tus-dolu !min-h-[42px] !px-5 !text-[11.5px]">
            Başla
          </Link>
        </div>
      </header>

      {/* ============ HERO: SENKRON İKİ TELEFON ============ */}
      <HeroSenkronMasa />

      {/* ============ 01 · NEDİR ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <BolumBasi
          no="01"
          ustlik="Nedir"
          baslik="Vitrin değil, protokol: lüks konut stoğu için kapalı devre satış ağı."
        />
        <p className="-mt-4 mb-10 max-w-[62ch] text-[15.5px] leading-relaxed text-ink-soft">
          ProjePazar, inşaat halindeki seçkin projelerin stoğunu üreticinin kontrolünde tutar ve
          yalnız davet edilen danışman ağına dağıtır. İlan yok, vitrin yok, komisyon yok: yalnız
          canlı kayıt ve tanımlı yetki.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {ILKELER.map(([no, baslik, metin]) => (
            <div key={no} className="m6-kart p-6 sm:p-7">
              <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-[#b08d4a]">{no}</span>
              <h3 className="m6-display mt-3 text-[19px] font-bold leading-snug text-ink">{baslik}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{metin}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ 02 · BOZUK SİSTEM ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <BolumBasi
          no="02"
          ustlik="Bugünkü düzen"
          baslik="Mesaj gruplarında dolaşan eski fiyat listesi, lüks projeye yakışmaz."
        />
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* iletilen dosya kaosu */}
          <div
            className="relative mx-auto w-full max-w-[420px] rounded-[18px] border border-[rgba(168,130,63,0.24)] bg-[#efe9db] p-5 sm:p-6"
            aria-label="Örnek mesajlaşma ekranı: 41 gün önceki fiyat listesi defalarca iletilmiş"
          >
            <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              Satış grubu · 6 katılımcı
            </p>
            <div className="space-y-3">
              <div className="max-w-[86%] rounded-[12px] rounded-tl-[4px] border border-[rgba(33,26,14,0.08)] bg-white p-3 shadow-[0_2px_8px_rgba(33,26,14,0.06)]">
                <p className="flex items-center gap-2 truncate font-mono text-[11px] font-semibold text-ink">
                  <span className="flex size-6 flex-none items-center justify-center rounded-[6px] bg-[var(--color-red-soft)] font-mono text-[7px] font-bold text-[#a23f34]" aria-hidden>
                    PDF
                  </span>
                  MarinaRidge_fiyat_OCAK.pdf
                </p>
                <p className="mt-1.5 font-mono text-[9.5px] text-[var(--ink-faint)]">iletildi · 47 kez · kaynak belirsiz</p>
              </div>
              <div className="max-w-[86%] rounded-[12px] rounded-tl-[4px] border border-[rgba(33,26,14,0.08)] bg-white p-3 shadow-[0_2px_8px_rgba(33,26,14,0.06)]">
                <p className="text-[13px] leading-snug text-ink">B-4-2 hâlâ 21,9 mu? Müşterim yarın uçakla geliyor.</p>
                <p className="mt-1 font-mono text-[9.5px] text-[var(--ink-faint)]">dün 21:47 · yanıt yok</p>
              </div>
              <div className="ml-auto max-w-[86%] rounded-[12px] rounded-tr-[4px] border border-[rgba(168,130,63,0.28)] bg-[#f6efdd] p-3">
                <p className="text-[13px] leading-snug text-ink">Bendeki listede öyle görünüyor, emin değilim.</p>
                <p className="mt-1 text-right font-mono text-[9.5px] text-[var(--ink-faint)]">bugün 09:12</p>
              </div>
            </div>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 -rotate-2 whitespace-nowrap rounded-[4px] border border-red bg-[var(--color-red-soft)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#a23f34]">
              Gerçek fiyat: ₺24,5M · listede: ₺21,9M
            </span>
          </div>
          {/* metin */}
          <div>
            <h3 className="m6-display text-[clamp(20px,2.4vw,26px)] font-bold leading-snug text-ink">
              Alıcı milyonluk daireye bakıyor; danışman 41 günlük dosyaya.
            </h3>
            <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-soft">
              Lüks segmentte güven, kelimeden önce veriyle kurulur. Eski fiyat söyleyen danışman
              yalnız satışı değil, projenin itibarını da riske atar. Sorun kişiler değil,
              mimari: <strong className="font-semibold text-ink">stok tek kaynaktan akmıyor.</strong>
            </p>
            <ul className="mt-6 space-y-2.5">
              {KAOS_NOTLARI.map((n) => (
                <li key={n} className="flex items-center gap-3 font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  <span className="size-2 flex-none rounded-full border border-red bg-[var(--color-red-soft)]" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ 03 · CANLI STOK ============ */}
      <section id="sistem" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <BolumBasi no="03" ustlik="Canlı stok" baslik="Fiyat tek satırda yaşar; ağ o satırı okur." />
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h3 className="m6-display text-[clamp(20px,2.4vw,26px)] font-bold leading-snug text-ink">
              Verinin yaşı, üstünde yazar.
            </h3>
            <p className="mt-4 max-w-[50ch] text-[15px] leading-relaxed text-ink-soft">
              Her birimin fiyatı ve durumu yalnız bir kayıtta tutulur. Üretici değeri değiştirir,
              tahsisli her ekran aynı saniye yeni değeri okur. Tazelik görünürdür: kayıt bayatlarsa
              bunu herkes görür, kimse eski dosyaya güvenmek zorunda kalmaz.
            </p>
            <p className="mt-6 max-w-[50ch] border-l-2 border-[rgba(168,130,63,0.4)] pl-4 font-mono text-[11.5px] leading-relaxed text-[var(--ink-faint)]">
              Kural: fiyat hiçbir yere kopyalanmaz. Paylaşım bağlantısı her açılışta canlı değeri basar.
            </p>
          </div>
          <LuksStok />
        </div>
      </section>

      {/* ============ 04 · TAHSİS ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <BolumBasi no="04" ustlik="Tahsis" baslik="Seçkin stok, seçili ağ: herkes her şeyi görmez." />
        <p className="-mt-4 mb-10 max-w-[62ch] text-[15.5px] leading-relaxed text-ink-soft">
          Lüks projede gizlilik özelliktir. Hangi ofis hangi bloğu, hangi danışman hangi daireyi
          görür: üretici belirler. Kapsamı değiştirin, ağın gördüğü stok anında daralsın.
        </p>
        <TahsisPaneli />
      </section>

      {/* ============ 05 · İKİ TARAF ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <BolumBasi no="05" ustlik="İki taraf" baslik="Üretici kontrolü tutar, danışman güncel satar." />
        <p className="-mt-4 mb-10 max-w-[62ch] text-[15.5px] leading-relaxed text-ink-soft">
          Aynı kayıt, iki yetki. Soldaki satıra dokunun: tek kayıt değişsin, iki ekran birden
          güncellensin.
        </p>
        <IkiTaraf />
      </section>

      {/* ============ 06 · CANLI AKIŞ (koyu bant) ============ */}
      <AkisFeed />

      {/* ============ 07 · İLAN PORTALI DEĞİL ============ */}
      <div className="relative overflow-hidden border-y border-[rgba(201,162,94,0.35)] bg-[#191510]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(760px 420px at 85% -10%, rgba(201, 162, 94, 0.14), transparent 60%), radial-gradient(620px 380px at -5% 110%, rgba(201, 162, 94, 0.07), transparent 55%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <p className="m6-damga !text-[rgba(233,214,175,0.6)]">
                <span className="mr-3 text-[#dcae5f]">07</span>
                Konum
              </p>
              <h2 className="m6-display mt-4 text-[clamp(26px,3.8vw,38px)] font-bold leading-[1.1] text-[#f3ead8]">
                Bu bir ilan portalı{" "}
                <span className="relative inline-block text-[rgba(243,234,216,0.5)]">
                  değil
                  <span aria-hidden className="absolute inset-x-[-2%] top-[52%] h-[3px] -rotate-3 bg-red" />
                </span>
                ; projenizin özel ağı.
              </h2>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-[rgba(243,234,216,0.7)]">
                Stok sokağa çıkmaz, davetli ağda dolaşır. Satış bedeline hiçbir zaman dokunulmaz:
                gelir modelinde komisyon yoktur.
              </p>
            </div>
            <div className="overflow-hidden rounded-[16px] border border-[rgba(243,227,192,0.22)] bg-white/[0.03]">
              <div className="grid grid-cols-[minmax(70px,0.65fr)_1fr_1fr] border-b border-[rgba(243,227,192,0.16)] bg-white/[0.04] font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[rgba(243,234,216,0.5)]">
                <span className="px-3 py-2.5 sm:px-4">Alan</span>
                <span className="px-3 py-2.5 sm:px-4">İlan portalı</span>
                <span className="px-3 py-2.5 text-[#dcae5f] sm:px-4">Kapalı canlı ağ</span>
              </div>
              {KARSILASTIRMA.map(([alan, portal, ag]) => (
                <div
                  key={alan}
                  className="grid grid-cols-[minmax(70px,0.65fr)_1fr_1fr] border-b border-[rgba(243,227,192,0.08)] font-mono text-[11.5px] last:border-b-0"
                >
                  <span className="px-3 py-3 font-semibold text-[rgba(243,234,216,0.8)] sm:px-4">{alan}</span>
                  <span className="px-3 py-3 text-[rgba(243,234,216,0.45)] sm:px-4">{portal}</span>
                  <span className="px-3 py-3 font-medium text-[#f3ead8] sm:px-4">{ag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ FİNAL CTA ============ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
        <p className="m6-damga">Kapanış</p>
        <h2 className="m6-display mx-auto mt-5 max-w-[20ch] text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.1] text-ink">
          Projenizi sessizce, kontrollü satışa açın.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-ink-soft">
          İlk projenin ağa alınması dakikalar sürer. Yarın sahada kimse size müsait mi diye sormaz:
          kayda bakar.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/kayit?rol=uretici" className="m6-tus m6-tus-dolu">
            Projemi ağa aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="m6-tus m6-tus-cizgi">
            Danışman olarak katıl
          </Link>
        </div>
        <p className="mt-6 font-mono text-[11.5px] text-[var(--ink-faint)]">
          Danışman hesabı ücretsizdir. Satıştan komisyon alınmaz.
        </p>
      </section>

      {/* ============ ANTET (FOOTER) ============ */}
      <footer className="border-t border-[rgba(168,130,63,0.3)] bg-[rgba(255,255,255,0.5)]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {ANTET.map(([k, v]) => (
              <div key={k} className="border-b border-r border-[rgba(168,130,63,0.16)] px-4 py-3.5 last:border-r-0">
                <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a6d33]">
                  {k}
                </span>
                <span className="mt-0.5 block font-mono text-[12px] font-semibold text-ink">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[10.5px] text-[var(--ink-faint)]">
            <span>Bu sayfa tasarım laboratuvarı çalışmasıdır; tüm veriler örnektir.</span>
            <span>© 2026 ProjePazar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
