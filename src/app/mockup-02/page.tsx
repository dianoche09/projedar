import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AkisFeed } from "@/components/landing/AkisFeed";
import { KuleDemo } from "@/components/landing/KuleDemo";
import { CeliskiSahnesi } from "@/components/landing/CeliskiSahnesi";
import { HeroDevKelime } from "./HeroDevKelime";
import { KilitKoreografi } from "@/components/landing/KilitKoreografi";
import "./mockup02.css";

/**
 * Mockup 02 · SALES CONTROL ROOM · Projedar Design Lab (noindex).
 * Konsept: canlı satış kontrol merkezi; editoryal DEV tipografi görsel nesnedir.
 * Zemin anlatısı: eski dünya (dosya kaosu) = kırık beyaz kağıt bantları,
 * canlı ağ = çok koyu grafit kontrol odası. Sinyal renkleri sabittir.
 */

export const metadata: Metadata = {
  title: "Mockup 02 · Sales Control Room | Projedar Design Lab",
  description:
    "Projedar landing konsept çalışması: canlı satış kontrol merkezi, tipografi görsel nesne olarak.",
  robots: { index: false, follow: false },
};

/* tahsis matrisi (örnek): görünürlük tahsisle belirlenir */
const TAHSIS: { grup: string; bloklar: [boolean, boolean, boolean] }[] = [
  { grup: "Yılmaz Emlak", bloklar: [true, true, false] },
  { grup: "Kaya Emlak", bloklar: [false, true, true] },
  { grup: "Aksoy Gayrimenkul", bloklar: [true, false, false] },
];

/* iki taraf: kokpit fiil listeleri */
const TARAFLAR: {
  rol: string;
  baslik: string;
  fiiller: string[];
  cta: { metin: string; href: string; dolu: boolean };
}[] = [
  {
    rol: "Üretici",
    baslik: "Stok sizin. Kontrol sizde.",
    fiiller: [
      "Fiyatı tek noktadan güncelle",
      "Blok blok, grup grup tahsis et",
      "Opsiyon ve satışı anlık izle",
      "Her hareketi günlükten denetle",
    ],
    cta: { metin: "Projemi canlı ağa aç", href: "/kayit?rol=uretici", dolu: true },
  },
  {
    rol: "Danışman",
    baslik: "Size açılan havuz. Hep güncel.",
    fiiller: [
      "Tahsisli projeleri tek havuzda gör",
      "Canlı bağlantıyı müşteriyle paylaş",
      "Müsait birime opsiyon kilidi al",
      "Her zaman güncel fiyatla konuş",
    ],
    cta: { metin: "Danışman olarak katıl", href: "/kayit?rol=emlakci", dolu: false },
  },
];

/* ilan portalında olup burada olmayanlar */
const OLMAYANLAR = ["ilan sıralaması", "vitrin dopingi", "komisyon", "kopya portföy", "bayat fiyat listesi"];

export default function Mockup02Sayfasi() {
  return (
    <div className="m2 min-h-screen overflow-x-clip">
      {/* ============ üst bar ============ */}
      <header className="border-b border-[var(--m2-cizgi)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="font-display text-lg font-extrabold tracking-tight">Projedar</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--m2-ink-soft)] md:inline">
              Mockup 02 · Sales Control Room
            </span>
          </div>
          <Link href="/kayit?rol=uretici" className="m2-btn m2-btn-dolu m2-btn-kucuk">
            Projemi canlı ağa aç
          </Link>
        </div>
      </header>

      {/* ============ hero: eriyen sayı (stat-led, tek ekran) ============ */}
      <HeroDevKelime />

      {/* ============ nedir: tanım şeridi ============ */}
      <section className="border-t border-[var(--m2-cizgi)] bg-[var(--m2-zemin-2)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <p className="max-w-2xl text-[16.5px] leading-relaxed">
            Projedar bir ilan sitesi değildir: çok müteahhitli, üretici kontrollü canlı konut
            stoğu dağıtım ağıdır. Fiyat ve durum tek kayıtta yaşar, havuz tahsisle açılır, opsiyon
            veritabanı seviyesinde kilitlenir, tazelik her ekranda görünür.
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-2">
            {(
              [
                ["1", "canlı kayıt, kopya yok"],
                ["48 sa", "opsiyon kilidi"],
                ["%0", "komisyon"],
                ["7/24", "tazelik görünür"],
              ] as const
            ).map(([deger, ad]) => (
              <div key={ad} className="border-l-2 border-[var(--m2-cizgi)] pl-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--m2-ink-soft)]">{ad}</dt>
                <dd className="mono mt-1 text-2xl font-semibold text-[var(--m2-ink)]">{deger}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ 01 bozuk sistem: çelişkili akışlar (kağıt dünyası) ============ */}
      <section className="m2-acik m2-defter">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m2-etiket text-[#a23f34]">01 · Bozuk sistem</p>
          <h2 className="m2-dev mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,4rem)]">
            Aynı daire. Dört kanal. Dört ayrı fiyat.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--m2-kagit-soft)]">
            Excel ekleri, PDF sürümleri, WhatsApp mesajları, telefon notları: her kopya kendi
            gerçeğini anlatır. Kaos aşağıda; izleyin.
          </p>
          <div className="mt-10">
            <CeliskiSahnesi />
          </div>
        </div>
      </section>

      {/* ============ 02 canlı stok: kule demo (kontrol odası) ============ */}
      <section className="relative overflow-hidden border-b border-[var(--m2-cizgi)]">
        <div className="komuta-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m2-etiket text-[var(--m2-teal)]">02 · Canlı stok</p>
          <h2 className="m2-dev mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,4rem)]">
            Stok bir dosya değil. Canlı bir yüzey.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--m2-ink-soft)]">
            Bir daireye dokunun: fiyat, durum, tazelik ve kilit tek ekranda. Yeşil bir daireden
            opsiyonu deneyin; diğer danışmanın ekranında anında kilitlendiğini görün.
          </p>
          <div className="mt-10">
            <KuleDemo />
          </div>
        </div>
      </section>

      {/* ============ 03 çift satış kalkanı: kilit koreografisi ============ */}
      <section className="border-b border-[var(--m2-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m2-etiket text-amber">03 · Çift satış kalkanı</p>
          <h2 className="m2-dev mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,4rem)]">
            Opsiyon bir söz değil. Kilittir.
          </h2>
          <div className="mt-12">
            <KilitKoreografi />
          </div>
        </div>
      </section>

      {/* ============ 04 tahsis (kağıt bandı) ============ */}
      <section className="m2-acik">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="m2-etiket text-[var(--m2-teal-koyu)]">04 · Tahsis</p>
              <h2 className="m2-dev mt-5 text-[clamp(1.9rem,5.2vw,4rem)]">
                Herkes her şeyi <span className="text-red">görmez.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--m2-kagit-soft)]">
                Görünürlük tahsisle belirlenir: hangi grup hangi bloğu görecek, üretici karar verir.
                Tahsis kapanınca birim o ekrandan tamamen kaybolur; kısıt uygulamada değil, satırın
                kendisindedir.
              </p>
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--m2-kagit-cizgi)] bg-white shadow-[0_16px_40px_rgba(25,26,29,0.08)]">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--m2-kagit-cizgi)] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--m2-kagit-soft)]">
                <span>tahsis matrisi · Çankaya Vadi</span>
                <span className="rounded border border-[var(--m2-kagit-cizgi)] px-2 py-0.5 text-[9px]">örnek</span>
              </div>
              <table className="w-full border-collapse font-mono text-[12px]">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--m2-kagit-cizgi)] px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--m2-kagit-soft)]">
                      Grup
                    </th>
                    {["A Blok", "B Blok", "C Blok"].map((b) => (
                      <th
                        key={b}
                        className="border-b border-[var(--m2-kagit-cizgi)] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--m2-kagit-soft)]"
                      >
                        {b}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TAHSIS.map((satir) => (
                    <tr key={satir.grup}>
                      <td className="border-b border-[var(--m2-kagit-cizgi)] px-4 py-3 font-semibold text-[var(--m2-kagit-ink)]">
                        {satir.grup}
                      </td>
                      {satir.bloklar.map((acik, k) => (
                        <td key={k} className="border-b border-[var(--m2-kagit-cizgi)] px-3 py-3">
                          {acik ? (
                            <span className="inline-flex items-center gap-1.5 font-bold text-[#1f7d4c]">
                              <span className="size-1.5 rounded-full bg-green" aria-hidden />
                              AÇIK
                            </span>
                          ) : (
                            <span className="text-[rgba(25,26,29,0.32)]">KAPALI</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 font-mono text-[10px] leading-relaxed text-[var(--m2-kagit-soft)]">
                AÇIK: birim o grubun havuzunda canlı. KAPALI: birim o ekranda hiç yok.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 05 canlı akış (kendi koyu zemini ile) ============ */}
      <AkisFeed />

      {/* ============ 06 iki taraf (kağıt bandı) ============ */}
      <section className="m2-acik border-t border-[var(--m2-kagit-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="m2-etiket text-[var(--m2-teal-koyu)]">05 · İki taraf</p>
          <h2 className="m2-dev mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,4rem)]">Bir ağ. İki kokpit.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {TARAFLAR.map((taraf) => (
              <div
                key={taraf.rol}
                className="flex min-w-0 flex-col rounded-2xl border border-[var(--m2-kagit-cizgi)] bg-white p-6 shadow-[0_16px_40px_rgba(25,26,29,0.07)] sm:p-7"
              >
                <p className="m2-etiket text-[var(--m2-kagit-soft)]">{taraf.rol}</p>
                <h3 className="font-display mt-3 text-[22px] font-extrabold tracking-tight text-[var(--m2-kagit-ink)]">
                  {taraf.baslik}
                </h3>
                <ul className="mt-5 flex-1">
                  {taraf.fiiller.map((fiil, k) => (
                    <li
                      key={fiil}
                      className="flex items-baseline gap-3 border-t border-dashed border-[var(--m2-kagit-cizgi)] py-2.5 text-[14px] text-[var(--m2-kagit-ink)]"
                    >
                      <span className="mono flex-none text-[10.5px] text-[var(--m2-teal-koyu)]">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      {fiil}
                    </li>
                  ))}
                </ul>
                <Link
                  href={taraf.cta.href}
                  className={`m2-btn mt-6 self-start ${taraf.cta.dolu ? "m2-btn-dolu" : "m2-btn-cizgi"}`}
                >
                  {taraf.cta.metin}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ilan portalı değil (grafit bant) ============ */}
      <section className="border-b border-[var(--m2-cizgi)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="m2-dev max-w-3xl text-[clamp(1.7rem,4.6vw,3.4rem)]">
            Burası bir ilan portalı <span className="text-red">değil.</span>
          </h2>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2.5">
            {OLMAYANLAR.map((k) => (
              <span
                key={k}
                className="font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--m2-ink-soft)] line-through decoration-[var(--m2-red)] decoration-2"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-xl font-mono text-[13px] leading-relaxed text-[var(--m2-ink)]">
            <span className="text-[var(--m2-teal)]">Saf altyapı:</span> stok, fiyat, tahsis, kilit.
            Müşteri size gelir; biz yalnız kaydın doğru olmasını sağlarız.
          </p>
        </div>
      </section>

      {/* ============ final CTA: cephe reprise (crop + duotone) ============ */}
      <section className="relative overflow-hidden">
        {/* aynı cephe, sağa kırpılmış ve karartılmış: kontrol odasından son bakış */}
        <Image
          src="/generated/mockup-02/hero-gece-cephe.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="m2-cephe-img object-cover object-[22%_28%] opacity-55"
        />
        <div className="m2-cephe-teal" aria-hidden />
        <div className="m2-cta-ort" aria-hidden />
        <div className="komuta-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:flex lg:justify-end">
          {/* metin, görselin karanlık negatif alanına (sağ gök) oturur */}
          <div className="lg:w-[58%]">
            <p className="m2-etiket text-[var(--m2-teal)]">Kayıt açık</p>
            <h2 className="m2-dev mt-6 text-[clamp(2.2rem,6vw,4.6rem)]">
              <span className="block">Projenizi dosyalardan çıkarın.</span>
              <span className="block text-[var(--m2-teal)]">Canlı satış ağına açın.</span>
            </h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/kayit?rol=uretici" className="m2-btn m2-btn-dolu">
                Projemi canlı ağa aç
              </Link>
              <Link href="/kayit?rol=emlakci" className="m2-btn m2-btn-cizgi">
                Danışman olarak katıl
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--m2-ink-soft)]">
              başvuru birkaç dakika · hesap doğrulama sonrası açılır
            </p>
          </div>
        </div>
      </section>

      {/* ============ alt bilgi ============ */}
      <footer className="border-t border-[var(--m2-cizgi)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--m2-ink-soft)] sm:px-6">
          <span>Projedar · Design Lab · Mockup 02 · Sales Control Room</span>
          <Link href="/" className="transition-colors hover:text-[var(--m2-teal)]">
            canlı anasayfaya dön
          </Link>
        </div>
      </footer>
    </div>
  );
}
