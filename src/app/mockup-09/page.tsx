import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AkisFeed } from "@/components/landing/AkisFeed";
import { GaleriTahsis } from "./GaleriTahsis";
import { HeroGeceSilueti } from "./HeroGeceSilueti";
import "./mockup09.css";

/**
 * Mockup 09 · GALERİ VİTRİNİ · ProjePazar Design Lab (noindex).
 * Konsept: karanlık lüks showroom; inşaat halindeki lüks konut projeleri
 * bir sanat galerisindeki eserler gibi sergilenir. Tahsis = özel davetli
 * sergi, opsiyon = eserin rezerve camekanı. Sinyal renkleri sabittir.
 */

export const metadata: Metadata = {
  title: "Mockup 09 · Galeri Vitrini | ProjePazar Design Lab",
  description:
    "ProjePazar landing konsept çalışması: karanlık lüks showroom, davetli sergi ve rezerve camekanı metaforu.",
  robots: { index: false, follow: false },
};

/* 02 canlı stok: vitrin duvarı (örnek eserler) */
const VITRIN: {
  kod: string;
  tip: string;
  fiyat: string;
  durum: "musait" | "opsiyon" | "satildi";
  durumAd: string;
  taze: string;
  bayat?: boolean;
}[] = [
  { kod: "A-3-1", tip: "3+1 · 148 m²", fiyat: "₺18,9M", durum: "musait", durumAd: "müsait", taze: "az önce" },
  { kod: "B-4-2", tip: "4+1 · 196 m²", fiyat: "₺24,5M", durum: "opsiyon", durumAd: "opsiyon", taze: "12 dk önce" },
  { kod: "B-9-1", tip: "4,5+1 · 214 m²", fiyat: "₺27,2M", durum: "musait", durumAd: "müsait", taze: "1 sa önce" },
  { kod: "C-2-3", tip: "5+1 çatı · 288 m²", fiyat: "₺41,0M", durum: "musait", durumAd: "müsait", taze: "az önce" },
  { kod: "A-11-2", tip: "3,5+1 · 172 m²", fiyat: "₺21,4M", durum: "satildi", durumAd: "satıldı", taze: "3 sa önce" },
  { kod: "C-6-4", tip: "4+1 · 205 m²", fiyat: "₺29,8M", durum: "musait", durumAd: "müsait", taze: "9 gün önce", bayat: true },
];

/* 04 iki taraf: kokpit fiil listeleri */
const TARAFLAR: {
  rol: string;
  baslik: string;
  fiiller: string[];
  cta: { metin: string; href: string; dolu: boolean };
}[] = [
  {
    rol: "Üretici",
    baslik: "Koleksiyon sizin. Işıklar sizde.",
    fiiller: [
      "Fiyatı tek plaketten güncelleyin",
      "Sergiyi davetle açın: blok blok, grup grup",
      "Rezerve ve satışı anlık izleyin",
      "Her hareketi günlükten denetleyin",
    ],
    cta: { metin: "Projemi vitrine aç", href: "/kayit?rol=uretici", dolu: true },
  },
  {
    rol: "Danışman",
    baslik: "Davetli olduğunuz sergi. Hep güncel.",
    fiiller: [
      "Size açılan eserleri tek duvarda görün",
      "Canlı bağlantıyı müşteriyle paylaşın",
      "Müsait esere 48 saatlik rezerve alın",
      "Her zaman güncel fiyatla konuşun",
    ],
    cta: { metin: "Davetli danışman ol", href: "/kayit?rol=emlakci", dolu: false },
  },
];

/* ilan portalında olup bu galeride olmayanlar */
const OLMAYANLAR = ["ilan vitrini", "doping", "komisyon", "acil satılık rozeti", "kopya portföy", "bayat fiyat listesi"];

export default function Mockup09Sayfasi() {
  return (
    <div className="m9 min-h-screen overflow-x-clip">
      {/* ============ üst bar ============ */}
      <header className="border-b border-[var(--m9-cizgi)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="font-display text-lg font-bold tracking-tight">ProjePazar</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--m9-ink-soft)] md:inline">
              Mockup 09 · Galeri Vitrini
            </span>
          </div>
          <Link href="/kayit?rol=uretici" className="m9-btn m9-btn-dolu m9-btn-kucuk">
            Projemi vitrine aç
          </Link>
        </div>
      </header>

      {/* ============ hero: gece silüeti (tam ekran) ============ */}
      <HeroGeceSilueti />

      {/* ============ nedir: tanım şeridi ============ */}
      <section className="border-y border-[var(--m9-cizgi)] bg-[var(--m9-zemin-2)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <p className="max-w-2xl text-[16px] leading-relaxed text-[var(--m9-ink)]">
            ProjePazar bir ilan sitesi değildir: çok müteahhitli, üretici kontrollü canlı konut
            stoğu dağıtım ağıdır. Her daire tek plakette yaşar, sergi davetle açılır, rezerve
            veritabanı seviyesinde kilitlenir, tazelik her ekranda görünür.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-2">
            {(
              [
                ["1", "canlı plaket, kopya yok"],
                ["48 sa", "rezerve kilidi"],
                ["%0", "komisyon"],
                ["7/24", "tazelik görünür"],
              ] as const
            ).map(([deger, ad]) => (
              <div key={ad} className="border-l border-[rgba(201,163,90,0.4)] pl-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--m9-ink-soft)]">{ad}</dt>
                <dd className="mono mt-1 text-2xl font-semibold text-[var(--m9-pirinc-acik)]">{deger}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ 01 bozuk sistem: herkese açık ilan = değer kaybı ============ */}
      <section className="m9-ceviz-bant">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m9-etiket text-[#e08a7f]">01 · Bozuk sistem</p>
          <h2 className="m9-baslik mt-5 max-w-2xl text-[clamp(1.8rem,4.4vw,3.2rem)]">
            Lüks eser sokakta sergilenmez.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--m9-ink-soft)]">
            Aynı daire herkese açık portalda üç ilana bölünür: her kopyada fiyat biraz düşer,
            aciliyet rozeti büyür, prestij erir. Kapalı devrede ise tek plaket vardır ve değer korunur.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* sol: açık portal, değer kaybı sahnesi */}
            <div className="rounded-2xl border border-[var(--m9-cizgi)] bg-[rgba(11,11,13,0.5)] p-5 sm:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#e08a7f]">
                Herkese açık portal
              </p>
              <div className="mt-4 space-y-3">
                <div className="m9-ilan -rotate-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">Rezidans 4+1, boğaz manzara</span>
                    <span className="m9-ilan-acil">acil</span>
                  </div>
                  <p className="mono mt-1.5 text-[12px]">
                    <span className="m9-fiyat-eski">₺24,5M</span> <span className="font-bold">₺23,9M</span>
                    <span className="ml-2 text-[10px] text-[#8b8578]">3 hafta önce güncellendi</span>
                  </p>
                </div>
                <div className="m9-ilan ml-6 rotate-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">Aynı daire, farklı ofis ilanı</span>
                    <span className="m9-ilan-acil">acil</span>
                  </div>
                  <p className="mono mt-1.5 text-[12px]">
                    <span className="m9-fiyat-eski">₺23,9M</span> <span className="font-bold">₺23,2M</span>
                    <span className="ml-2 text-[10px] text-[#8b8578]">fiyatı düşen ilan</span>
                  </p>
                </div>
                <div className="m9-ilan ml-2 -rotate-1 opacity-80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold">Yine aynı daire, üçüncü kopya</span>
                    <span className="m9-ilan-acil">pazarlıklı</span>
                  </div>
                  <p className="mono mt-1.5 text-[12px]">
                    <span className="font-bold">arayınız</span>
                    <span className="ml-2 text-[10px] text-[#8b8578]">hangi fiyat doğru, belirsiz</span>
                  </p>
                </div>
              </div>
              <p className="mt-4 font-mono text-[10.5px] leading-relaxed text-[var(--m9-ink-soft)]">
                Üç kopya, üç fiyat: her tekrar eserin değerinden bir parça götürür.
              </p>
            </div>

            {/* sağ: kapalı devre, tek plaket */}
            <div className="flex flex-col rounded-2xl border border-[rgba(201,163,90,0.3)] bg-[rgba(11,11,13,0.5)] p-5 sm:p-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--m9-pirinc)]">
                Kapalı devre galeri
              </p>
              <div className="flex flex-1 items-center justify-center py-8">
                <div className="m9-plaket m9-plaket-statik max-w-[220px]">
                  <span className="m9-plaket-ic">
                    <span className="m9-plaket-kod">
                      <span className="m9-nokta" data-renk="green" aria-hidden />
                      B-4-2
                    </span>
                    <span className="m9-plaket-alt">4+1 · ₺24,5M · şimdi güncellendi</span>
                  </span>
                </div>
              </div>
              <p className="font-mono text-[10.5px] leading-relaxed text-[var(--m9-ink-soft)]">
                Tek plaket, tek fiyat, davetli erişim: pazarlık ilanla değil, masada yapılır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 02 canlı stok: vitrin duvarı ============ */}
      <section className="border-y border-[var(--m9-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m9-etiket">02 · Canlı stok</p>
          <h2 className="m9-baslik mt-5 max-w-2xl text-[clamp(1.8rem,4.4vw,3.2rem)]">
            Stok bir dosya değil. Işığı yanan bir duvar.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--m9-ink-soft)]">
            Her plaket canlı kayıttan basılır: fiyat, durum ve tazelik tek kaynaktan gelir.
            Yeşil müsait, amber rezerve, kırmızı satıldı; eskiyen kayıt sararır.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VITRIN.map((eser) => (
              <div key={eser.kod} className="m9-plaket m9-plaket-statik m9-vitrin-kart">
                <span className="m9-plaket-ic !gap-2 !p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="m9-plaket-kod !text-[13px]">{eser.kod}</span>
                    <span className={`m9-durum m9-du-${eser.durum}`}>{eser.durumAd}</span>
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--m9-ink-soft)]">{eser.tip}</span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="mono text-[17px] font-semibold text-[var(--m9-pirinc-acik)]">{eser.fiyat}</span>
                    <span className={`m9-taze ${eser.bayat ? "m9-taze-bayat" : "m9-taze-canli"}`}>{eser.taze}</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--m9-ink-soft)]">
            örnek vitrin · paylaşımda fiyat her zaman canlı değerden basılır
          </p>
        </div>
      </section>

      {/* ============ 03 tahsis: özel davetli sergi ============ */}
      <section className="m9-ceviz-bant">
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center">
            <div>
              <p className="m9-etiket">03 · Tahsis</p>
              <h2 className="m9-baslik mt-5 text-[clamp(1.8rem,4.4vw,3.2rem)]">
                Sergi herkese açık değil. Davetlidir.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--m9-ink-soft)]">
                Hangi danışman hangi eseri görecek, üretici karar verir. Davet kapanınca eserin
                spotu söner ve birim o ekrandan tamamen kaybolur; kısıt uygulamada değil, satırın
                kendisindedir.
              </p>
            </div>
            <GaleriTahsis />
          </div>
        </div>
      </section>

      {/* ============ 04 iki taraf ============ */}
      <section className="border-y border-[var(--m9-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m9-etiket">04 · İki taraf</p>
          <h2 className="m9-baslik mt-5 max-w-2xl text-[clamp(1.8rem,4.4vw,3.2rem)]">Bir galeri. İki kokpit.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {TARAFLAR.map((taraf) => (
              <div
                key={taraf.rol}
                className="flex min-w-0 flex-col rounded-2xl border border-[var(--m9-cizgi)] bg-[var(--m9-zemin-2)] p-6 sm:p-7"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--m9-pirinc)]">
                  {taraf.rol}
                </p>
                <h3 className="m9-baslik mt-3 text-[21px]">{taraf.baslik}</h3>
                <ul className="mt-5 flex-1">
                  {taraf.fiiller.map((fiil, k) => (
                    <li
                      key={fiil}
                      className="flex items-baseline gap-3 border-t border-dashed border-[var(--m9-cizgi)] py-2.5 text-[14px] text-[var(--m9-ink)]"
                    >
                      <span className="mono flex-none text-[10.5px] text-[var(--m9-pirinc)]">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      {fiil}
                    </li>
                  ))}
                </ul>
                <Link
                  href={taraf.cta.href}
                  className={`m9-btn mt-6 self-start ${taraf.cta.dolu ? "m9-btn-dolu" : "m9-btn-cizgi"}`}
                >
                  {taraf.cta.metin}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 05 canlı akış (kendi koyu zemini ile) ============ */}
      <AkisFeed />

      {/* ============ ilan portalı değil ============ */}
      <section className="border-y border-[var(--m9-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="m9-baslik max-w-2xl text-[clamp(1.6rem,4vw,2.8rem)]">
            Burası bir ilan portalı <span className="text-[#e08a7f]">değil.</span>
          </h2>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {OLMAYANLAR.map((k) => (
              <span
                key={k}
                className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m9-ink-soft)] line-through decoration-[var(--m9-red)] decoration-2"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-xl font-mono text-[13px] leading-relaxed text-[var(--m9-ink)]">
            <span className="text-[var(--m9-pirinc)]">Saf altyapı:</span> stok, fiyat, tahsis, kilit.
            Müşteri size gelir; biz yalnız kaydın doğru olmasını sağlarız.
          </p>
        </div>
      </section>

      {/* ============ final CTA: galeri duvarı reprise ============ */}
      <section className="relative overflow-hidden">
        <Image
          src="/generated/mockup-09/galeri-duvar.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover object-[72%_45%] opacity-40"
        />
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(90deg, rgba(11,11,13,0.95) 0%, rgba(11,11,13,0.8) 45%, rgba(11,11,13,0.45) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-xl">
            <p className="m9-etiket">Kayıt açık</p>
            <h2 className="m9-baslik mt-6 text-[clamp(2rem,5vw,3.8rem)]">
              <span className="block">Projenizi ilanlardan çıkarın.</span>
              <span className="block text-[var(--m9-pirinc-acik)]">Davetli vitrine taşıyın.</span>
            </h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/kayit?rol=uretici" className="m9-btn m9-btn-dolu">
                Projemi vitrine aç
              </Link>
              <Link href="/kayit?rol=emlakci" className="m9-btn m9-btn-cizgi">
                Davetli danışman ol
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--m9-ink-soft)]">
              başvuru birkaç dakika · hesap doğrulama sonrası açılır
            </p>
          </div>
        </div>
      </section>

      {/* ============ alt bilgi ============ */}
      <footer className="border-t border-[var(--m9-cizgi)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--m9-ink-soft)] sm:px-6">
          <span>ProjePazar · Design Lab · Mockup 09 · Galeri Vitrini</span>
          <Link href="/" className="transition-colors hover:text-[var(--m9-pirinc)]">
            canlı anasayfaya dön
          </Link>
        </div>
      </footer>
    </div>
  );
}
