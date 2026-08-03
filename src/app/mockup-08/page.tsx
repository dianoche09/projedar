import type { Metadata } from "next";
import Link from "next/link";
import "./mockup08.css";
import { HeroSatisOfisiCami } from "./_components/HeroSatisOfisiCami";
import { MagnetKart, MiniPano } from "./_components/PanoParcalari";

export const metadata: Metadata = {
  title: "Mockup 08 · Satış Ofisi Panosu | Projedar Design Lab",
  description:
    "Lüks konut projeleri için kapalı satış ağı konsepti: satış ofisindeki fiziksel daire panosunun yaşayan dijital hali. Magnet kartlar, opsiyon rayı, tahsisli görünürlük.",
  robots: { index: false },
};

/**
 * MOCKUP 08 · SATIŞ OFİSİ PANOSU (lüks segment)
 * Metafor: her lüks satış ofisindeki fiziksel daire panosu; ceviz duvar,
 * pirinç detay, magnet kartlar. Hikâye: pano artık yaşıyor; kart raya
 * takılınca bütün ağ aynı anda görür. Sinyal renkleri sabittir.
 */
export default function Mockup08Sayfasi() {
  return (
    <main className="m8-zemin m8-gren min-h-screen overflow-x-clip">
      {/* pirinç üst şerit */}
      <div
        aria-hidden
        className="h-1"
        style={{
          background:
            "linear-gradient(90deg, #8a6a3a 0 72px, transparent 72px 80px, #b08d57 80px 88px, transparent 88px 96px, #2e2314 96px 100%)",
        }}
      />

      {/* ============ ÜST BAR ============ */}
      <header className="border-b border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-3 text-[#261c10]">
            <span className="font-display text-[21px] font-bold tracking-tight">Projedar</span>
            <span className="hidden border-l border-[rgba(58,44,26,0.2)] pl-3 font-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#8a6a3a] sm:inline">
              Satış ofisi panosu · Mockup 08
            </span>
          </Link>
          <Link href="/kayit" className="m8-btn m8-btn-ceviz !min-h-[42px] !px-5 text-[13px]">
            Ücretsiz başla
          </Link>
        </div>
      </header>

      {/* ============ HERO · SATIŞ OFİSİ CAMI (tam ekran) ============ */}
      <HeroSatisOfisiCami />

      {/* ============ 01 · NEDİR ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)] bg-[rgba(58,44,26,0.035)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde">Bölüm 01 · Nedir</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
            Satış ofisinizdeki pano, artık yaşıyor.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5c4f3c]">
            Her lüks projenin satış ofisinde bir daire panosu vardır: kartlar asılır, satılan çekilir,
            opsiyon kenara alınır. Projedar o panonun dijital halidir; fark şudur: bu pano yalnız
            ofiste değil, yetkilendirdiğiniz her danışmanın cebinde aynı anda günceldir.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                baslik: "Tek doğru kaynak",
                metin:
                  "Fiyat ve durum yalnız kartın üzerinde yaşar. Kopya liste, eski tablo, elden ele dosya yoktur; paylaşılan her ekran canlı değeri basar.",
                not: "fiyat tek yerde",
              },
              {
                baslik: "Tahsisli görünürlük",
                metin:
                  "Pano herkese açılmaz. Üretici hangi danışmanın hangi blokları göreceğine karar verir; her danışman yalnız kendi panosunu görür.",
                not: "görünürlük = tahsis",
              },
              {
                baslik: "Opsiyon kilidi",
                metin:
                  "Ciddi alıcı için kart 48 saat raya alınır. Kilit veritabanında kurulur: aynı daireye ikinci söz vermek teknik olarak imkânsızdır.",
                not: "çifte satış kapalı",
              },
            ].map((k) => (
              <div key={k.baslik} className="m8-panel m8-panel-pirinc px-6 pb-6 pt-7">
                <span className="m8-vida" style={{ right: 8, top: 8 }} aria-hidden />
                <h3 className="font-display text-[19px] font-bold text-[#261c10]">{k.baslik}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#5c4f3c]">{k.metin}</p>
                <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a6a3a]">
                  {k.not}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 02 · BOZUK SİSTEM ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde">Bölüm 02 · Bozuk sistem</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
            Ofisteki pano günceldi; sahadaki liste üç günlüktü.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5c4f3c]">
            Pano satış ofisinde asılıdır ve doğrudur. Ama danışman sahada, elindeki çıktıyla çalışır.
            Kart panodan çekileli üç gün olmuştur; liste bunu bilmez. Müşteri karşıdayken telefonlar
            açılır, itibar o masada erir.
          </p>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            {/* ofisteki pano: güncel */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#6d5327]">
                Satış ofisi · pano · şimdi
              </p>
              <div className="m8-ofis-pano mt-3 rounded-sm">
                <div className="flex flex-wrap gap-3">
                  <MagnetKart kod="B-7-1" tip="4+1 · 206 m²" fiyat="₺23,2M" durum="yesil" className="h-[84px] w-[118px]" />
                  <MagnetKart kod="B-7-2" tip="3+1 · 151 m²" fiyat="₺17,4M" durum="kirmizi" className="h-[84px] w-[118px]" />
                  <MagnetKart
                    kod="B-7-3"
                    tip="kilitli · 48 sa"
                    fiyat="₺24,6M"
                    durum="amber"
                    className="m8-celiski h-[84px] w-[118px]"
                  />
                  <MagnetKart kod="B-7-4" tip="5+1 · 284 m²" fiyat="₺33,1M" durum="yesil" className="h-[84px] w-[118px]" />
                </div>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#4d4232]">
                  b blok · 7. kat · temsili örnek
                </p>
              </div>
            </div>

            {/* sahadaki çıktı: eski */}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#a23f34]">
                Saha · yazdırılmış liste · 3 gün önce
              </p>
              <div className="m8-saha-kagit mt-3 px-6 pb-5 pt-5">
                <div className="flex items-baseline justify-between border-b border-[rgba(58,44,26,0.2)] pb-2">
                  <span className="font-display text-[15px] font-bold text-[#261c10]">Fiyat listesi · B blok</span>
                  <span className="font-mono text-[9.5px] text-[#9c8c72]">rev 14 · salı</span>
                </div>
                {[
                  ["B-7-1", "müsait", "₺23,2M", false],
                  ["B-7-2", "müsait", "₺17,1M", false],
                  ["B-7-3", "müsait", "₺24,6M", true],
                  ["B-7-4", "müsait", "₺33,1M", false],
                ].map(([kod, durum, fiyat, celiski]) => (
                  <div key={kod as string} className={`m8-saha-satir ${celiski ? "m8-celiski" : ""}`}>
                    <span className="font-bold text-[#261c10]">{kod}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#1f7d4c]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                      {durum}
                    </span>
                    <span className="text-[#5c4f3c]">{fiyat}</span>
                  </div>
                ))}
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#9c8c72]">
                  çıktı alındığı anda eskimeye başlar · temsili örnek
                </p>
              </div>
              <div className="mt-5 flex justify-center lg:justify-start">
                <span className="m8-celiski-muhur">aynı daire · iki farklı bilgi</span>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-[14.5px] leading-relaxed text-[#5c4f3c]">
            B-7-3 panoda kilitli, sahadaki listede hâlâ müsait. İki danışman aynı daireyi iki ayrı
            aileye anlatıyor. Sorun insanlarda değil; <strong>panonun kopyalanabilir olmasında.</strong>
          </p>
        </div>
      </section>

      {/* ============ 03 · CANLI STOK ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)] bg-[rgba(58,44,26,0.035)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde">Bölüm 03 · Canlı stok</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
            Her kartın üzerinde saat işler.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#5c4f3c]">
            Kart her güncellendiğinde tazelik damgası yenilenir. Yeşil rozet &quot;şimdi&quot; der;
            kayıt eskidikçe rozet sarıya döner ve bunu ağdaki herkes görür. Bayat bilgiyle müşteri
            karşısına çıkmak bu panoda mümkün değildir.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                kod: "A-2-4",
                tip: "4+1 · 198 m²",
                fiyat: "₺21,7M",
                durum: "yesil" as const,
                taze: "şimdi",
                tazeSinif: "m8-taze-simdi",
                aciklama: "Az önce güncellendi; kart yeşil rozetle nabız atar.",
              },
              {
                kod: "A-3-1",
                tip: "3+1 · 149 m²",
                fiyat: "₺16,8M",
                durum: "yesil" as const,
                taze: "2 sa önce",
                tazeSinif: "m8-taze-simdi",
                aciklama: "Gün içinde yazılmış kayıt: hâlâ taze, hâlâ yeşil.",
              },
              {
                kod: "A-5-2",
                tip: "5+1 · 276 m²",
                fiyat: "₺31,2M",
                durum: "yesil" as const,
                taze: "9 gün önce",
                tazeSinif: "m8-taze-eski",
                aciklama: "Eskiyen kayıt sarıya döner; herkes teyit ister, kimse aldanmaz.",
              },
            ].map((k) => (
              <div key={k.kod} className="m8-panel px-6 pb-6 pt-6 text-center">
                <div className="flex justify-center">
                  <MagnetKart
                    kod={k.kod}
                    tip={k.tip}
                    fiyat={k.fiyat}
                    durum={k.durum}
                    nabiz={k.taze === "şimdi"}
                    className="h-[88px] w-[124px] text-left"
                  />
                </div>
                <span className={`m8-taze ${k.tazeSinif} mt-4`}>
                  <i aria-hidden />
                  {k.taze}
                </span>
                <p className="mt-3 text-[13px] leading-relaxed text-[#5c4f3c]">{k.aciklama}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-right font-mono text-[9.5px] uppercase tracking-wider text-[#9c8c72]">temsili veri</p>
        </div>
      </section>

      {/* ============ 04 · TAHSİS ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="m8-madde">Bölüm 04 · Tahsis</p>
              <h2 className="font-display mt-4 text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
                Panonun anahtarı üreticide kalır.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[#5c4f3c]">
                Bu pano bir vitrin değildir; kimin baktığına üretici karar verir. Her danışmana
                kendi anahtarı verilir: biri yalnız B bloku görür, öteki yalnız üst katları.
                Anahtar geri alındığında pano o kişi için kararır; stok asla başıboş dolaşmaz.
              </p>
              <p className="mt-4 font-mono text-[11px] text-[#8a6a3a]">
                Görünürlük = tahsis. Anahtarsız hiç kimse panoya bakamaz.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { ad: "D1 · b blok", hedef: 7, dolu: [6, 8, 9, 10, 11] },
                { ad: "D2 · üst kat", hedef: 2, dolu: [0, 1, 3, 4, 5] },
                { ad: "D3 · teras", hedef: 15, dolu: [12, 13, 14, 16, 17] },
              ].map((p) => (
                <div key={p.ad} className="flex flex-col items-stretch gap-2.5">
                  <span className="m8-anahtar-halka justify-center">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                      <circle cx="9" cy="9" r="5" fill="none" stroke="#b08d57" strokeWidth="2.4" />
                      <path d="M12.5 12.5 L20 20 M17 17 L20 14" stroke="#b08d57" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    {p.ad}
                  </span>
                  <MiniPano ad="tahsisli pano" hedefIndex={p.hedef} doluIndexler={p.dolu} style={{ height: 96 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 05 · İKİ TARAF ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)] bg-[rgba(58,44,26,0.035)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde">Bölüm 05 · İki taraf, tek pano</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
            Aynı panonun iki yakası.
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="m8-panel m8-panel-pirinc px-7 pb-8 pt-8">
              <span className="m8-vida" style={{ left: 9, top: 9 }} aria-hidden />
              <span className="m8-vida" style={{ right: 9, top: 9 }} aria-hidden />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#8a6a3a]">
                Panonun sahibi · Üretici
              </span>
              <h3 className="font-display mt-2 text-[21px] font-bold text-[#261c10]">
                Stok, fiyat ve dağıtım tek elde.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Kartı bir kez güncelle; ağdaki her panoda aynı saniye değişsin.",
                  "Anahtarları sen dağıt: hangi danışman hangi bloku görür, sen seç.",
                  "Opsiyon ve satış anında işlensin; çifte satış veritabanında engellensin.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5c4f3c]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#8a6a3a]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=uretici" className="m8-btn m8-btn-ceviz mt-7 w-full sm:w-auto">
                Projemi panoya as
              </Link>
            </div>

            <div className="m8-panel m8-panel-pirinc px-7 pb-8 pt-8">
              <span className="m8-vida" style={{ left: 9, top: 9 }} aria-hidden />
              <span className="m8-vida" style={{ right: 9, top: 9 }} aria-hidden />
              <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#8a6a3a]">
                Panonun anahtarı · Danışman
              </span>
              <h3 className="font-display mt-2 text-[21px] font-bold text-[#261c10]">
                Sana tahsisli pano, hep cebinde.
              </h3>
              <ul className="mt-5 space-y-3.5">
                {[
                  "Çıktı taşıma, ekran görüntüsü bekleme: panon her an güncel.",
                  "Paylaştığın sayfada fiyat canlı basılır; müşterin bayat rakam görmez.",
                  "Alıcın ciddiyse kartı raya aldır; daire 48 saat yalnız senindir.",
                ].map((m) => (
                  <li key={m} className="flex gap-3 text-[14px] leading-relaxed text-[#5c4f3c]">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#8a6a3a]" aria-hidden />
                    {m}
                  </li>
                ))}
              </ul>
              <Link href="/kayit?rol=emlakci" className="m8-btn m8-btn-pirinc mt-7 w-full sm:w-auto">
                Danışman olarak katıl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 06 · AKIŞ ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde">Bölüm 06 · Akış</p>
          <h2 className="font-display mt-4 max-w-2xl text-[28px] font-bold leading-tight text-[#261c10] sm:text-[38px]">
            Dört hamlede canlı pano.
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                no: "1",
                baslik: "Kartlar asılır",
                metin: "Üretici projeyi yükler: blok, kat, daire, fiyat. Her daire panoda bir magnet karttır.",
              },
              {
                no: "2",
                baslik: "Anahtar dağıtılır",
                metin: "Danışmanlar seçilir; her birine görünürlük anahtarı verilir. Pano kişiye göre şekillenir.",
              },
              {
                no: "3",
                baslik: "Canlı paylaşılır",
                metin: "Danışman kartı müşterisine tek sayfayla açar; fiyat o an panodaki değerden basılır.",
              },
              {
                no: "4",
                baslik: "Kart raya takılır",
                metin: "Ciddi alıcıda kart opsiyon rayına alınır: 48 saat kilit, bütün ağ aynı anda görür.",
              },
            ].map((a) => (
              <div key={a.no} className="relative">
                <span className="m8-adim-no">{a.no}</span>
                <h3 className="font-display mt-4 text-[17px] font-bold text-[#261c10]">{a.baslik}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#5c4f3c]">{a.metin}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 07 · İLAN PORTALI DEĞİL ============ */}
      <section className="m8-ceviz-koyu border-t border-[rgba(58,44,26,0.3)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <p className="m8-madde" style={{ color: "#d6b478" }}>
            Bölüm 07 · Sınır çizgisi
          </p>
          <div className="mt-4 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h2 className="font-display text-[28px] font-bold leading-tight sm:text-[38px]">
                Bu bir ilan panosu değil; satış ofisinin panosu.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[rgba(241,232,214,0.72)]">
                Vitrin yok, ilan yarışı yok, komisyon yok. Pano üreticinin malıdır; anahtarları o
                dağıtır. Danışman gerçek stokla çalışır, alıcı gerçek fiyatı görür; ağ en hızlı
                satışın yapıldığı yer olur.
              </p>
              <p className="mt-8 inline-block rotate-[-2deg] border-2 border-[rgba(214,180,120,0.7)] px-4 py-2 font-mono text-[13px] font-bold uppercase tracking-[0.16em] text-[#d6b478]">
                İlan yok · tahsis var
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(214,180,120,0.28)] bg-[rgba(20,14,6,0.35)] px-6 pb-5 pt-5">
              <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[rgba(214,180,120,0.85)]">
                Karşılaştırma levhası
              </p>
              <div className="mt-2">
                {[
                  ["Herkese açık vitrin", "Anahtarla açılan pano"],
                  ["Bayat ilan fiyatı", "Canlı basılan fiyat"],
                  ["Satış başına komisyon", "Komisyon yok: altyapı"],
                  ["Aynı daireye iki söz", "Rayda tek kilit"],
                ].map(([eski, yeni]) => (
                  <div key={yeni} className="m8-cetvel-satir">
                    <span className="m8-ustu-cizik min-w-0 flex-1 text-[13px]">{eski}</span>
                    <span className="min-w-0 flex-1 text-right text-[13.5px] font-semibold text-[#d6b478]">{yeni}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FİNAL CTA ============ */}
      <section className="border-t border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
          <div className="m8-panel m8-panel-pirinc relative mx-auto max-w-3xl px-6 pb-10 pt-12 text-center sm:px-12">
            <span className="m8-vida" style={{ left: 12, top: 12 }} aria-hidden />
            <span className="m8-vida" style={{ right: 12, top: 12 }} aria-hidden />
            <span className="m8-vida" style={{ left: 12, bottom: 12 }} aria-hidden />
            <span className="m8-vida" style={{ right: 12, bottom: 12 }} aria-hidden />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#8a6a3a]">
              Son levha · Davet
            </p>
            <h2 className="font-display mt-4 text-[26px] font-bold leading-tight text-[#261c10] sm:text-[36px]">
              Panoyu duvardan indirin; ağa asın.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#5c4f3c]">
              İlk günden gerçek stokla çalışın: kartlar tek panoda yaşasın, opsiyon raya
              takılsın, görünürlük anahtarla dağıtılsın.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/kayit?rol=uretici" className="m8-btn m8-btn-ceviz">
                Projemi panoya as
              </Link>
              <Link href="/kayit?rol=emlakci" className="m8-btn m8-btn-pirinc">
                Danışman olarak katıl
              </Link>
            </div>
            <p className="mt-5 font-mono text-[10.5px] text-[#9c8c72]">
              Danışman hesabı ücretsizdir; üretici için kurulumda yanınızdayız.
            </p>
          </div>
        </div>
      </section>

      {/* ============ ALT BİLGİ ============ */}
      <footer className="border-t border-[rgba(58,44,26,0.16)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 font-mono text-[10.5px] text-[#9c8c72] sm:flex-row sm:px-6">
          <span>Projedar · Design Lab · Mockup 08 · Satış Ofisi Panosu</span>
          <Link href="/" className="underline decoration-dotted underline-offset-4 hover:text-[#261c10]">
            ana sayfaya dön
          </Link>
        </div>
      </footer>
    </main>
  );
}
