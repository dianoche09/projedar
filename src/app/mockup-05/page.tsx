import type { Metadata } from "next";
import Link from "next/link";
import "./mockup05.css";
import {
  Atac,
  Bant,
  ExcelSayfa,
  FiyatListesiSayfa,
  KatPlani,
  Muhur,
  WhatsappDokumu,
  YapiskanNot,
  Zimba,
} from "./_components/KagitParcalari";
import { HeroPlanMasasi } from "./_components/HeroPlanMasasi";
import { Donusum } from "./_components/Donusum";
import { CanliStok } from "./_components/CanliStok";
import { OpsiyonKilidi } from "./_components/OpsiyonKilidi";
import { TahsisZarfi } from "./_components/TahsisZarfi";

export const metadata: Metadata = {
  title: "Mockup 05 · Physical Data System | ProjePazar Design Lab",
  description:
    "Fiziksel satış materyallerinin yaşayan dijital sisteme dönüşümü: kâğıt, mühür, etiket ve zarf dokusuyla canlı konut stoğu dağıtım ağı konsept sayfası.",
  robots: { index: false },
};

/**
 * MOCKUP 05 · PHYSICAL DATA / TACTILE SYSTEM
 * Dokunsal editoryal: kâğıt dokusu, yapışkan not, basılı fiyat etiketi,
 * asetat katmanı, zımba/ataç/bant. Hikâye: masadaki kaos, kâğıtların
 * sıkışıp tek canlı kayda dönüşmesi, mühür gibi basılan tazelik,
 * damga olan opsiyon kilidi, zarflanan tahsis.
 */
export default function Mockup05Sayfasi() {
  return (
    <main className="m5-zemin m5-gren min-h-screen overflow-x-clip">
      {/* belge üst şeridi */}
      <div
        aria-hidden
        className="h-1"
        style={{
          background:
            "linear-gradient(90deg, #177e6f 0 64px, transparent 64px 72px, #177e6f 72px 80px, transparent 80px 88px, #17293d 88px 100%)",
        }}
      />

      {/* ============ ÜST BAR ============ */}
      <header className="border-b border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-3 text-[#17293d]">
            <span className="font-display text-[21px] font-bold tracking-tight">ProjePazar</span>
            <span className="hidden border-l border-[rgba(23,41,61,0.16)] pl-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#177e6f] sm:inline">
              Fiziksel veri sistemi · Mockup 05
            </span>
          </Link>
          <Link href="/kayit" className="m5-btn m5-btn-ink !min-h-[42px] !px-5 text-[13.5px]">
            Ücretsiz başla
          </Link>
        </div>
      </header>

      {/* ============ HERO · VAZİYET PLANI ============ */}
      <HeroPlanMasasi />

      {/* ============ 01 · MASADAKİ KAOS ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)] bg-[rgba(23,41,61,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m5-madde">Bölüm 01 · Masadaki kaos</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
            Satış ofisinin masası: herkeste bir kopya, hiçbirinde gerçek.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5a6577]">
            Fiyat listesi üç kez basılır, WhatsApp&apos;ta dördüncü sürüm dolaşır, kat planına elle not düşülür.
            Hangisi güncel? Kimse bilmez; müşteri karşıdayken telefon açılır.
          </p>

          {/* desktop: dağınık masa sahnesi */}
          <div className="relative mt-12 hidden h-[440px] lg:block">
            <span className="absolute right-0 top-0 z-10 rounded-[4px] border border-[rgba(23,41,61,0.18)] bg-[#fdfbf4] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8b97a8]">
              temsili örnek
            </span>
            <div className="m5-kalkar absolute left-0 top-4 -rotate-3">
              <FiyatListesiSayfa />
            </div>
            <div className="m5-kalkar absolute left-[27%] top-24 rotate-2">
              <ExcelSayfa />
            </div>
            <div className="m5-kalkar absolute right-[22%] top-2 rotate-3">
              <WhatsappDokumu />
            </div>
            <div className="m5-kalkar absolute bottom-4 right-0 -rotate-2">
              <KatPlani />
            </div>
            <div className="m5-kalkar absolute bottom-10 left-[16%] -rotate-6">
              <YapiskanNot metin="Hangisi güncel?" altMetin="v2 mi v3 mü, arayan olursa sor" />
            </div>
            <div className="absolute bottom-24 right-[30%] rotate-2">
              <span className="m5-muhur m5-muhur-eski text-[13px]">iki danışman aynı daireyi satıyor</span>
            </div>
          </div>

          {/* mobil: eğik kart yığını */}
          <div className="mt-10 flex flex-wrap items-start justify-center gap-4 lg:hidden">
            <span className="w-full text-right font-mono text-[9px] font-semibold uppercase tracking-wider text-[#8b97a8]">
              temsili örnek
            </span>
            <div className="-rotate-2"><FiyatListesiSayfa /></div>
            <div className="rotate-2"><WhatsappDokumu /></div>
            <div className="rotate-1"><ExcelSayfa /></div>
            <div className="-rotate-3"><YapiskanNot metin="Hangisi güncel?" altMetin="v2 mi v3 mü?" /></div>
            <div className="rotate-1 pb-2">
              <span className="m5-muhur m5-muhur-eski">çifte satış riski</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 02 · DÖNÜŞÜM (SIGNATURE) ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-6 lg:pt-24">
          <p className="m5-madde">Bölüm 02 · Dönüşüm</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
            Kâğıtlar sıkışır, tek canlı kayıt kalır.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5a6577]">
            Excel satırı, basılı liste, yazışma dökümü ve kat planı aynı dairenin dört ayrı kopyasıdır.
            ProjePazar bu katmanları tek kayda sıkıştırır: fiyat ve durum yalnız bir yerde yaşar.
          </p>
        </div>
        <Donusum className="mx-auto max-w-6xl px-5 pb-16 pt-4 sm:px-6 lg:pb-0 lg:pt-0" />
      </section>

      {/* ============ 03 · CANLI STOK ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)] bg-[rgba(23,41,61,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m5-madde">Bölüm 03 · Canlı stok</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
            Tazelik, mühür gibi basılır.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5a6577]">
            Her yazış kaydın damgasını tazeler. Yeşil mühür &quot;şimdi&quot; der; kayıt eskidikçe rozet sarıya döner
            ve herkes görür. Bayat listeyle müşteri karşısına çıkmak bu ağda mümkün değildir.
          </p>
          <div className="mt-12">
            <CanliStok />
          </div>
          <p className="mt-6 text-right font-mono text-[9.5px] uppercase tracking-wider text-[#8b97a8]">temsili veri</p>
        </div>
      </section>

      {/* ============ 04 · OPSİYON KİLİDİ ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m5-madde">Bölüm 04 · Opsiyon kilidi</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
            Opsiyon bir damgadır: basıldığı anda kart kapanır.
          </h2>
          <div className="mt-12">
            <OpsiyonKilidi />
          </div>
        </div>
      </section>

      {/* ============ 05 · TAHSİS ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)] bg-[rgba(23,41,61,0.03)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="m5-madde">Bölüm 05 · Tahsis</p>
              <h2 className="font-display mt-4 text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
                İlan asılmaz, zarflanır.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5a6577]">
                Üretici stoğunu vitrine dökmez; blok blok, birim birim seçtiği danışmanlara zarflar.
                Her danışman yalnız kendi zarfındakini görür ve paylaşır. Görünürlük bir ayar değil,
                bir tahsis kararıdır.
              </p>
              <p className="mt-4 font-mono text-[11px] text-[#177e6f]">
                Görünürlük = tahsis. Zarfın dışındaki hiç kimse bu stoğu göremez.
              </p>
            </div>
            <TahsisZarfi />
          </div>
        </div>
      </section>

      {/* ============ 06 · İKİ TARAF ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m5-madde">Bölüm 06 · İki taraf, tek dosya</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#17293d] sm:text-[38px]">
            Aynı kaydın iki kapağı.
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* üretici dosyası */}
            <div className="m5-kagit m5-delikli relative px-6 pb-7 pt-6 pl-9">
              <Zimba style={{ top: -3, left: 28, transform: "rotate(-14deg)" }} />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#177e6f]">
                Dosya A · Üretici
              </span>
              <h3 className="font-display mt-2 text-[21px] font-bold text-[#17293d]">
                Stok, fiyat, dağıtım tek noktadan.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Fiyatı bir kez yaz; ağdaki her ekranda aynı anda değişsin.",
                  "Kim neyi görüyor, kim neyi paylaşıyor: dağıtımın komutası sende.",
                  "Opsiyon ve satış anında işlensin; çifte satış veritabanında engellensin.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5a6577]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#177e6f]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=uretici" className="m5-btn m5-btn-ink mt-7 w-full sm:w-auto">
                Projemi canlı ağa aç
              </Link>
            </div>

            {/* danışman dosyası */}
            <div className="m5-kagit m5-delikli relative px-6 pb-7 pt-6 pl-9">
              <Atac style={{ top: -14, right: 26 }} />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#177e6f]">
                Dosya B · Danışman
              </span>
              <h3 className="font-display mt-2 text-[21px] font-bold text-[#17293d]">
                Sana zarflanan stok, tek canlı havuzda.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "PDF isteme, ekran görüntüsü bekleme: havuz her an günceldir.",
                  "Paylaştığın linkte fiyat canlı basılır; müşterin bayat rakam görmez.",
                  "Alıcın ciddiyse opsiyon kilidini iste; daire 48 saat yalnız senindir.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5a6577]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#177e6f]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=emlakci" className="m5-btn m5-btn-teal mt-7 w-full sm:w-auto">
                Danışman olarak katıl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 07 · İLAN PORTALI DEĞİL ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)] bg-[#17293d] text-[#f6f2e7]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m5-madde" style={{ color: "#7fd4c6" }}>Bölüm 07 · Sınır çizgisi</p>
          <div className="mt-4 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[28px] font-bold leading-tight sm:text-[38px]">
                Bu bir ilan portalı değil; kapalı devre bir satış altyapısı.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[rgba(246,242,231,0.72)]">
                Vitrin yok, ilan yarışı yok, komisyon yok. Üretici kontrolü elinde tutar,
                danışman gerçek stokla çalışır; ağ en hızlı satışın yapıldığı yer olur.
              </p>
              <div className="mt-8 rotate-[-2deg]">
                <span className="m5-muhur text-[16px]" style={{ color: "#7fd4c6" }}>İlan yok · tahsis var</span>
              </div>
            </div>

            {/* basılı karşılaştırma cetveli */}
            <div className="m5-kagit px-6 pb-6 pt-5 text-[#17293d]">
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#5a6577]">
                Karşılaştırma cetveli
              </p>
              <div className="mt-3">
                {[
                  ["Herkese açık vitrin", "Tahsisli görünürlük"],
                  ["Bayat ilan fiyatı", "Canlı basılan fiyat"],
                  ["Satış başına komisyon", "Komisyon yok: altyapı"],
                  ["Aynı daireye iki söz", "Veritabanında tek kilit"],
                ].map(([eski, yeni]) => (
                  <div key={yeni} className="m5-cetvel-satir">
                    <span className="m5-ustu-cizik min-w-0 flex-1 text-[13px]">{eski}</span>
                    <span className="min-w-0 flex-1 text-right font-semibold text-[#177e6f]">{yeni}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-right font-mono text-[9.5px] uppercase tracking-wider text-[#8b97a8]">
                pp/2026-05 · sayfa 1/1
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FİNAL CTA ============ */}
      <section className="border-t border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="m5-kagit m5-kivrik relative mx-auto max-w-3xl px-6 pb-10 pt-12 text-center sm:px-12">
            <Bant style={{ top: -11, left: "50%", transform: "translateX(-50%) rotate(-1deg)", width: 96 }} />
            <div className="absolute right-5 top-5 hidden rotate-6 sm:block" aria-hidden>
              <Muhur tur="onay">Ağa katıl</Muhur>
            </div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#177e6f]">
              Son sayfa · Davet
            </p>
            <h2 className="font-display mt-4 text-[26px] font-bold leading-tight text-[#17293d] sm:text-[36px]">
              Kâğıdı masada bırak; kaydı canlı tut.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#5a6577]">
              İlk günden gerçek stokla çalış: fiyatın tek yerde yaşasın,
              opsiyon damgayla kilitlensin, dağıtım zarfla yapılsın.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/kayit?rol=uretici" className="m5-btn m5-btn-ink">Projemi canlı ağa aç</Link>
              <Link href="/kayit?rol=emlakci" className="m5-btn m5-btn-kagit">Danışman olarak katıl</Link>
            </div>
            <p className="mt-5 font-mono text-[10.5px] text-[#8b97a8]">
              Danışman hesabı ücretsizdir; üretici için kurulumda yanınızdayız.
            </p>
          </div>
        </div>
      </section>

      {/* ============ ALT BİLGİ ============ */}
      <footer className="border-t border-[rgba(23,41,61,0.14)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 font-mono text-[10.5px] text-[#8b97a8] sm:flex-row sm:px-6">
          <span>ProjePazar · Design Lab · Mockup 05 · Physical Data System</span>
          <Link href="/" className="underline decoration-dotted underline-offset-4 hover:text-[#17293d]">
            ana sayfaya dön
          </Link>
        </div>
      </footer>
    </main>
  );
}
