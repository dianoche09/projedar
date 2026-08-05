import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Projedar tanıtım banner'ı — her SEO/scrape sayfasının EN BAŞINDA (header altı).
 * Amaç: proje aramasıyla gelen trafiği "Projedar nedir, ne yapar" ile karşılayıp
 * emlakçı/müteahhit edinimine dönüştürmek. Marka koyu komuta gradyanı.
 */
export function ProjedarBanner() {
  return (
    <section className="relative overflow-hidden border-b border-white/10" style={{ background: "linear-gradient(115deg, #0a1728 0%, #13314b 55%, #14584e 130%)" }}>
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(50% 120% at 85% 0%, rgba(30,155,138,0.25) 0%, transparent 60%)" }} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="hidden shrink-0 sm:block"><Logo size={30} acik /></div>
          <div>
            <p className="font-display text-sm font-bold text-white sm:text-[15px]">
              Yeni konut projelerinin <span className="text-[#7fd4c4]">tahsisli canlı satış ağı</span>
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/72 sm:text-[13px]">
              Projedar, konut projelerini yetkili gayrimenkul danışmanlarıyla buluşturur. İlan portalı değildir; komisyonsuz, kapalı devre B2B. Emlakçı komisyonsuz satar, müteahhit stoğunu ve fiyatını tek panelden yönetir.
            </p>
          </div>
        </div>
        <div className="flex flex-none flex-wrap items-center gap-2">
          <Link href="/emlakci" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink transition-transform hover:-translate-y-0.5">Danışmanlar için</Link>
          <Link href="/muteahhit" className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/15">Müteahhitler için</Link>
          <Link href="/" className="rounded-full px-3 py-2 text-xs font-semibold text-[#7fd4c4] hover:text-white">Projedar nedir?</Link>
        </div>
      </div>
    </section>
  );
}
