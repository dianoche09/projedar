import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";

/* Hallmark · macrostructure: tek-fold hero · H6 Photographic Fold (full-bleed · caption alt-sol · metin bindirmeli)
 * nav: N9 Edge-aligned minimal · tone: luxury/restraint · genre: modern-minimal
 * pre-emit critique: P5 H5 E4 S4 R5 V5 · canlılık = tek sakin etiket, koreografi yok
 */

export const metadata: Metadata = {
  title: "Mockup 11 · Sessiz Lüks Hero | Projedar Design Lab",
  description: "Hallmark + copywriting skill disipliniyle tek ekranlık hero: lüks konut projeleri için canlı satış ağı.",
  robots: { index: false },
};

export default function Mockup11() {
  return (
    <main className="relative h-svh min-h-[640px] overflow-hidden bg-ink text-white">
      {/* H6: full-bleed lüks proje fotoğrafı (teslim öncesi, oturum yok) */}
      <Image
        src="/generated/mockup-07/luks-bitmis-rezidans.jpg"
        alt="Teslim öncesi lüks konut projesi, altın saat ışığında boş rezidans cephesi"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_40%]"
      />
      {/* okunurluk: alt-sol yumuşak karartma, tek katman */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(200deg, rgba(11,20,32,0) 34%, rgba(11,20,32,0.38) 62%, rgba(11,20,32,0.78) 100%)" }}
      />

      {/* N9: uçlara hizalı minimal nav; arada geniş boşluk tasarımın kendisi */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" aria-label="Projedar ana sayfa" className="opacity-95"><Logo size={26} wordmark /></Link>
          <Link
            href="/kayit?rol=uretici"
            className="inline-flex min-h-11 items-center rounded-full border border-white/35 px-6 text-[14px] font-semibold text-white transition-colors duration-200 hover:border-white/70 hover:bg-white/10"
          >
            Projenizi ağa açın
          </Link>
        </nav>
      </header>

      {/* fotoğrafta TEK canlı kanıt: sakin nabızlı fiyat etiketi (koreografi yok) */}
      <div className="absolute right-[16%] top-[34%] z-10 hidden md:block" aria-hidden>
        <div className="flex items-center gap-2.5 rounded-full border border-white/25 bg-[rgba(11,20,32,0.55)] py-2 pl-3.5 pr-4 backdrop-blur-sm">
          <span className="size-2 rounded-full bg-green nabiz" />
          <span className="font-mono text-[12.5px] font-medium tracking-tight text-white">B-4-2 · ₺24,5M · şimdi</span>
        </div>
        <div className="ml-[13px] h-14 w-px bg-white/30" />
      </div>

      {/* başlık: sol-alt, tek hiyerarşi, ≤7 kelime */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10 sm:pb-16">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Lüks konut projeleri için
          </p>
          <h1 className="mt-4 max-w-[13ch] font-display text-[13vw] font-extrabold leading-[0.98] tracking-tight sm:text-[76px] lg:text-[92px]">
            Canlı satış ağı.
          </h1>
          <p className="mt-5 max-w-[46ch] text-pretty text-[15.5px] leading-relaxed text-white/85 sm:text-[17px]">
            Stok, fiyat ve opsiyon tek canlı kayıtta yaşar. Paylaştığınız her linkte fiyat o anki
            değerden basılır; opsiyonlanan daire bir daha kimseye satılmaz.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-8 text-[15px] font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi ağa açın
            </Link>
            <Link
              href="/kayit?rol=emlakci"
              className="group inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white/90 transition-colors duration-200 hover:text-white"
            >
              Danışman olarak katılın
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* H6 caption: alt-sol köşe künyesi */}
        <div className="border-t border-white/15 bg-[rgba(11,20,32,0.45)] backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-6 py-3.5 sm:px-10">
            <p className="font-mono text-[11px] tracking-wide text-white/60">
              Örnek proje · teslim öncesi · fotoğraftaki fiyat canlı kayıttan basılır
            </p>
            <p className="hidden font-mono text-[11px] tracking-wide text-white/60 sm:block">
              Komisyonsuz · tahsisli görünürlük · çift satış imkânsız
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
