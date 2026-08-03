import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import "./mockup10.css";
import { EskiBaskiKarti, Susleme } from "./_components/BaskiParcalari";
import { HeroSozlesmeGunu } from "./_components/HeroSozlesmeGunu";

/* zarif serif dizgi: davetiye tipografisi (latin-ext: Türkçe karakterler) */
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-m10-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mockup 10 · Davetiye Baskısı | Projedar Design Lab",
  description:
    "Letterpress lüks matbaa konsepti: her paylaşım bir davetiye baskısıdır, matbaa canlıdır. Fiyat değişince eski baskı geçersizleşir; yalnız canlı baskı geçerlidir.",
  robots: { index: false },
};

/**
 * MOCKUP 10 · DAVETİYE BASKISI (letterpress lüks matbaa · LÜKS segment)
 * Metafor: her paylaşım bir lüks davetiye baskısıdır; ama matbaa CANLIDIR.
 * Fiyat değiştiğinde eski baskı geçersizleşir, yalnız canlı baskı geçerlidir.
 * Ton: fildişi kâğıt + mürekkep laciverti + pirinç. Sinyal renkleri sabit.
 */
export default function Mockup10Sayfasi() {
  return (
    <main className={`${playfair.variable} m10-zemin m10-gren min-h-screen overflow-x-clip`}>
      {/* matbaa üst şeridi: mürekkep + pirinç */}
      <div
        aria-hidden
        className="h-1"
        style={{
          background:
            "linear-gradient(90deg, #1b2a41 0 64px, transparent 64px 72px, #a4823f 72px 80px, transparent 80px 88px, #1b2a41 88px 100%)",
        }}
      />

      {/* ============ ÜST BAR ============ */}
      <header className="border-b border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-3 text-[#1b2a41]">
            <span className="m10-serif text-[22px] font-bold tracking-tight">Projedar</span>
            <span className="hidden border-l border-[rgba(164,130,63,0.5)] pl-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#7d6027] sm:inline">
              Davetiye baskısı · Mockup 10
            </span>
          </Link>
          <Link href="/kayit" className="m10-btn m10-btn-ink !min-h-[42px] !px-5 text-[13.5px]">
            Ücretsiz başla
          </Link>
        </div>
      </header>

      {/* ============ HERO · SÖZLEŞME GÜNÜ (tam ekran) ============ */}
      <HeroSozlesmeGunu />

      {/* ============ 01 · NEDİR: MATBAA CANLIDIR ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)] bg-[rgba(27,42,65,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m10-madde">Forma 01 · Nedir</p>
          <h2 className="m10-serif m10-gofre mt-4 max-w-2xl text-[28px] font-bold leading-tight sm:text-[38px]">
            Her paylaşım bir davetiye baskısıdır; matbaa canlıdır.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5c6474]">
            Projedar, inşaat hâlindeki lüks konut projeleri için kapalı bir satış ağıdır.
            Üretici stoğu tek kalıptan basar; davetli danışman yalnız kendisine basılan
            nüshaları görür ve paylaşır. Fiyat değiştiği anda eski baskı geçersizleşir:
            yalnız canlı baskı geçerlidir.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                no: "I",
                baslik: "Tek kalıp",
                metin:
                  "Fiyat ve durum tek kaynakta yaşar. Hiçbir nüshaya elle rakam yazılmaz; her baskı canlı değerden dizilir.",
              },
              {
                no: "II",
                baslik: "Gofre kilit",
                metin:
                  "Opsiyon bir kabartma damgadır ve veritabanında basılır. Aynı daireye ikinci damga teknik olarak inemez.",
              },
              {
                no: "III",
                baslik: "Davet listesi",
                metin:
                  "Baskı herkese dağıtılmaz. Üretici davet listesini yazar; listede olmayan davetiyeyi hiç görmez.",
              },
            ].map((k) => (
              <div key={k.no} className="m10-kagit m10-kalkar px-6 pb-7 pt-6 text-center">
                <span className="m10-serif text-[22px] font-bold text-[#7d6027]">{k.no}</span>
                <Susleme className="mt-3" />
                <h3 className="m10-serif mt-3 text-[19px] font-bold text-[#1b2a41]">{k.baslik}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#5c6474]">{k.metin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 02 · BOZUK SİSTEM: ELDEN ELE ESKİ BASKILAR ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m10-madde">Forma 02 · Bozuk sistem</p>
          <h2 className="m10-serif m10-gofre mt-4 max-w-2xl text-[28px] font-bold leading-tight sm:text-[38px]">
            Bugün piyasada elden ele dolaşan şey: geçersiz baskılar.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5c6474]">
            Fiyat listesi PDF olarak basılır, WhatsApp&apos;ta elden ele gezer. Zam gelir,
            kimse eski nüshaları toplayamaz. Müşteri karşıdayken hangi baskının geçerli
            olduğunu kimse bilemez; söz verilen daire başka masada çoktan satılmıştır.
          </p>

          {/* elden ele zinciri: soluk nüshalar + noktalı aktarım çizgisi */}
          <div className="relative mt-12">
            <span className="absolute right-0 -top-6 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8b8f98]">
              temsili örnek
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-8 lg:flex-nowrap lg:justify-between">
              {[
                { surum: "1. baskı · mart", fiyat: "₺22,9M", don: "-rotate-3" },
                { surum: "3. baskı · mayıs", fiyat: "₺23,4M", don: "rotate-2" },
                { surum: "5. baskı · haziran", fiyat: "₺23,8M", don: "-rotate-1" },
              ].map((b, i) => (
                <div key={b.surum} className="flex items-center gap-4">
                  <div className={`m10-kalkar w-[190px] ${b.don}`}>
                    <EskiBaskiKarti ad="REZİDANS B-4-2" eskiFiyat={b.fiyat} surum={b.surum} />
                  </div>
                  {i < 2 ? (
                    <svg viewBox="0 0 64 20" className="hidden w-14 flex-none text-[#8b8f98] lg:block" aria-hidden>
                      <path
                        d="M2 10 H52"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="3 5"
                        strokeLinecap="round"
                      />
                      <path d="M50 4 L60 10 L50 16 Z" fill="currentColor" />
                    </svg>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 64 20" className="hidden w-14 flex-none text-[#8b8f98] lg:block" aria-hidden>
                  <path d="M2 10 H52" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" />
                  <path d="M50 4 L60 10 L50 16 Z" fill="currentColor" />
                </svg>
                <div className="rotate-2 text-center">
                  <span className="m10-muhur m10-muhur-gecersiz text-[13px]">hangisi geçerli?</span>
                  <p className="mt-3 max-w-[190px] font-mono text-[10px] leading-relaxed text-[#8b8f98]">
                    dördü de dolaşımda · hiçbiri güncel değil
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 03 · CANLI STOK: BASKI PROVASI ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)] bg-[rgba(27,42,65,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="m10-madde">Forma 03 · Canlı stok</p>
              <h2 className="m10-serif m10-gofre mt-4 text-[28px] font-bold leading-tight sm:text-[38px]">
                Matbaa durmaz; her baskının tarihi üstünde yazar.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5c6474]">
                Üretici fiyatı değiştirdiği an ağdaki bütün nüshalar aynı saniyede yeniden
                basılır. Her kaydın üstünde tazelik mührü durur: yeşil mühür &quot;şimdi&quot; der,
                kayıt eskidikçe mühür sarıya döner ve bunu herkes görür. Bayat baskıyla
                müşteri karşısına çıkmak bu ağda mümkün değildir.
              </p>
              <p className="mt-4 font-mono text-[11px] leading-relaxed text-[#7d6027]">
                Paylaştığın bağlantıda fiyat canlı değerden basılır; müşterin asla eski rakam görmez.
              </p>
            </div>

            {/* baskı provası paneli */}
            <div className="m10-kagit px-6 pb-6 pt-5">
              <div className="flex items-center justify-between gap-3 border-b border-[rgba(164,130,63,0.4)] pb-3">
                <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#7d6027]">
                  Baskı provası · Kule B
                </p>
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#1f7d4c]">
                  <span className="m10-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                  canlı
                </span>
              </div>
              <div className="mt-1">
                {[
                  { birim: "B-4-2", fiyat: "₺24,5M", durum: "m10-d-musait", ad: "müsait", taze: "şimdi", nabiz: true },
                  { birim: "B-4-3", fiyat: "₺25,1M", durum: "m10-d-rezerve", ad: "rezerve · 48 sa", taze: "1 sa önce" },
                  { birim: "B-5-1", fiyat: "₺27,9M", durum: "m10-d-satildi", ad: "satıldı", taze: "dün" },
                  { birim: "A-2-6", fiyat: "₺19,4M", durum: "m10-d-bayat", ad: "müsait · bayat", taze: "9 gün önce" },
                ].map((s) => (
                  <div key={s.birim} className="m10-prova-satir">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="mono text-[13.5px] font-bold text-[#1b2a41]">{s.birim}</span>
                      <span className="mono text-[13px] font-semibold text-[#5c6474]">{s.fiyat}</span>
                    </div>
                    <span className={`m10-durum ${s.durum}`}>
                      <i className={s.nabiz ? "m10-nabiz" : undefined} />
                      {s.ad}
                    </span>
                    <span className="justify-self-end font-mono text-[10px] text-[#8b8f98]">{s.taze}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-t border-dashed border-[rgba(27,42,65,0.16)] pt-3 text-right font-mono text-[9.5px] uppercase tracking-wider text-[#8b8f98]">
                temsili veri · mühür sarardıysa yazışma gecikmiştir
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 04 · TAHSİS: DAVET LİSTESİ ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="m10-madde">Forma 04 · Tahsis</p>
              <h2 className="m10-serif m10-gofre mt-4 text-[28px] font-bold leading-tight sm:text-[38px]">
                Baskı herkese dağıtılmaz; davet listesiyle gider.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5c6474]">
                Üretici projeyi vitrine asmaz; blok blok, birim birim seçtiği danışmanları
                davet listesine yazar. Her danışman yalnız kendi adına basılan davetiyeleri
                görür. Görünürlük bir ayar değil, bir davet kararıdır.
              </p>
              <p className="mt-4 font-mono text-[11px] text-[#7d6027]">
                Görünürlük = tahsis. Listede olmayan, davetiyenin varlığından bile habersizdir.
              </p>
            </div>

            {/* davet listesi kartı */}
            <div className="m10-kagit px-6 pb-6 pt-5">
              <p className="text-center font-mono text-[9.5px] font-bold uppercase tracking-[0.26em] text-[#7d6027]">
                Davet listesi · Rezidans Kule B
              </p>
              <Susleme className="mt-3" />
              <div className="mt-2">
                {[
                  { ad: "Aksoy Gayrimenkul", kapsam: "B blok · 12 birim" },
                  { ad: "Meridyen Proje Ofisi", kapsam: "B blok 4. kat · 4 birim" },
                  { ad: "Koru Danışmanlık", kapsam: "A ve B blok · 21 birim" },
                ].map((d) => (
                  <div key={d.ad} className="m10-davet-satir">
                    <span className="m10-davet-onay" aria-hidden>
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.2 L4.8 9 L10 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="m10-serif min-w-0 flex-1 text-[15.5px] font-semibold text-[#1b2a41]">{d.ad}</span>
                    <span className="font-mono text-[10px] text-[#5c6474]">{d.kapsam}</span>
                  </div>
                ))}
                <div className="m10-davet-satir opacity-55">
                  <span className="m10-davet-onay !border-dashed !text-[#8b8f98]" aria-hidden />
                  <span className="m10-serif min-w-0 flex-1 text-[15.5px] font-semibold text-[#8b8f98]">
                    Listede olmayan ofis
                  </span>
                  <span className="font-mono text-[10px] text-[#a23f34]">baskı ulaşmaz</span>
                </div>
              </div>
              <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-wider text-[#8b8f98]">
                temsili örnek
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 05 · İKİ TARAF ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)] bg-[rgba(27,42,65,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m10-madde">Forma 05 · İki taraf, tek matbaa</p>
          <h2 className="m10-serif m10-gofre mt-4 max-w-2xl text-[28px] font-bold leading-tight sm:text-[38px]">
            Kalıbın sahibi ve davetli dağıtıcı.
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* üretici */}
            <div className="m10-kagit px-7 pb-8 pt-7">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#7d6027]">
                Levha A · Üretici
              </span>
              <h3 className="m10-serif mt-2.5 text-[22px] font-bold text-[#1b2a41]">
                Kalıp sizde: stok, fiyat, dağıtım tek elde.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Fiyatı bir kez dizin; ağdaki her davetiye aynı saniyede yeniden basılsın.",
                  "Davet listesini siz yazarsınız: kim hangi bloğu görür, kim paylaşır.",
                  "Opsiyon ve satış anında işlenir; çifte satış veritabanı kilidiyle engellenir.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5c6474]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rotate-45 bg-[#a4823f]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=uretici" className="m10-btn m10-btn-ink mt-7 w-full sm:w-auto">
                Projemi baskıya al
              </Link>
            </div>

            {/* danışman */}
            <div className="m10-kagit px-7 pb-8 pt-7">
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#7d6027]">
                Levha B · Danışman
              </span>
              <h3 className="m10-serif mt-2.5 text-[22px] font-bold text-[#1b2a41]">
                Adınıza basılan stok, tek canlı havuzda.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "PDF istemezsiniz, ekran görüntüsü beklemezsiniz: havuz her an günceldir.",
                  "Paylaştığınız davetiyede fiyat canlı basılır; müşteriniz bayat rakam görmez.",
                  "Alıcınız ciddiyse gofre damgayı isteyin; daire 48 saat yalnız sizindir.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5c6474]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rotate-45 bg-[#a4823f]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=emlakci" className="m10-btn m10-btn-pirinc mt-7 w-full sm:w-auto">
                Davetli danışman ol
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 06 · AKIŞ: BASKI SÜRECİ ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m10-madde">Forma 06 · Baskı süreci</p>
          <h2 className="m10-serif m10-gofre mt-4 max-w-2xl text-[28px] font-bold leading-tight sm:text-[38px]">
            Kalıptan damgaya dört adım.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                no: "01",
                baslik: "Kalıp dizilir",
                metin: "Üretici projeyi, blokları ve birimleri tanımlar. Fiyat tek kalıba yazılır; başka kopya yoktur.",
              },
              {
                no: "02",
                baslik: "Davet listesi yazılır",
                metin: "Hangi danışman hangi birimleri görecek? Tahsis kararı burada verilir; kalanlar davetsizdir.",
              },
              {
                no: "03",
                baslik: "Baskı dağıtılır",
                metin: "Danışman kendi nüshasını tek dokunuşla paylaşır. Bağlantıdaki fiyat her açılışta canlı basılır.",
              },
              {
                no: "04",
                baslik: "Damga iner",
                metin: "Ciddi alıcı için gofre damga: rezerve · 48 sa. Veritabanı kilidi ikinci damgaya izin vermez.",
              },
            ].map((a, i) => (
              <div key={a.no} className="m10-kagit relative px-6 pb-7 pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[13px] font-bold text-[#7d6027]">{a.no}</span>
                  {i === 3 ? (
                    <span className="m10-muhur m10-muhur-rezerve !text-[8.5px]">kilit</span>
                  ) : (
                    <span className="h-1.5 w-1.5 rotate-45 bg-[rgba(164,130,63,0.6)]" aria-hidden />
                  )}
                </div>
                <h3 className="m10-serif mt-3 text-[18px] font-bold text-[#1b2a41]">{a.baslik}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5c6474]">{a.metin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 07 · İLAN PORTALI DEĞİL ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)] bg-[#1b2a41] text-[#f8f4e9]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m10-madde" style={{ color: "#d9c08a" }}>
            Forma 07 · Sınır çizgisi
          </p>
          <div className="mt-4 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h2 className="m10-serif text-[28px] font-bold leading-tight sm:text-[38px]">
                Bu bir ilan portalı değil; kapalı devre bir baskı ağı.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[rgba(248,244,233,0.72)]">
                Vitrin yok, ilan yarışı yok, komisyon yok. Üretici kalıbı elinde tutar,
                danışman davetle çalışır; ağ, en hızlı satışın yapıldığı yer olur.
              </p>
              <div className="mt-8 -rotate-2">
                <span className="m10-muhur text-[16px]" style={{ color: "#d9c08a" }}>
                  İlan yok · davet var
                </span>
              </div>
            </div>

            {/* basılı karşılaştırma cetveli */}
            <div className="m10-kagit px-6 pb-6 pt-5 text-[#1b2a41]">
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#5c6474]">
                Karşılaştırma cetveli
              </p>
              <div className="mt-3">
                {[
                  ["Herkese açık vitrin", "Davetli görünürlük"],
                  ["Elden ele bayat PDF", "Canlı basılan davetiye"],
                  ["Satış başına komisyon", "Komisyon yok: altyapı"],
                  ["Aynı daireye iki söz", "Veritabanında tek damga"],
                ].map(([eski, yeni]) => (
                  <div key={yeni} className="m10-cetvel-satir">
                    <span className="m10-ustu-cizik min-w-0 flex-1 text-[13px]">{eski}</span>
                    <span className="min-w-0 flex-1 text-right font-semibold text-[#7d6027]">{yeni}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-right font-mono text-[9.5px] uppercase tracking-wider text-[#8b8f98]">
                pp/2026-07 · levha 1/1
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FİNAL CTA · DAVETİYE ============ */}
      <section className="border-t border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="m10-davetiye relative mx-auto max-w-3xl px-6 pb-10 pt-11 text-center sm:px-14">
            <div className="absolute right-6 top-6 hidden rotate-6 sm:block" aria-hidden>
              <span className="m10-muhur m10-muhur-canli text-[12px]">canlı baskı</span>
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#7d6027]">
              Son forma · Davet
            </p>
            <Susleme className="mx-auto mt-4 max-w-[240px]" />
            <h2 className="m10-serif m10-gofre mt-5 text-[26px] font-bold leading-tight sm:text-[36px]">
              Davetiyeniz matbaada hazır.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#5c6474]">
              İlk günden gerçek stokla çalışın: fiyat tek kalıptan basılsın, opsiyon gofre
              damgayla kilitlensin, dağıtım davet listesiyle yapılsın.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/kayit?rol=uretici" className="m10-btn m10-btn-ink">
                Projemi baskıya al
              </Link>
              <Link href="/kayit?rol=emlakci" className="m10-btn m10-btn-pirinc">
                Davetli danışman ol
              </Link>
            </div>
            <p className="mt-5 font-mono text-[10.5px] text-[#8b8f98]">
              Danışman daveti ücretsizdir; üretici için kurulumda yanınızdayız.
            </p>
          </div>
        </div>
      </section>

      {/* ============ ALT BİLGİ ============ */}
      <footer className="border-t border-[rgba(27,42,65,0.16)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 font-mono text-[10.5px] text-[#8b8f98] sm:flex-row sm:px-6">
          <span>Projedar · Design Lab · Mockup 10 · Davetiye Baskısı</span>
          <Link href="/" className="underline decoration-dotted underline-offset-4 hover:text-[#1b2a41]">
            ana sayfaya dön
          </Link>
        </div>
      </footer>
    </main>
  );
}
