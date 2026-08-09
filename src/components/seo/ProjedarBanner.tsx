import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * Projedar edinim banner'ı — her SEO/scrape sayfasında (sinematik hero'nun altında).
 * Amaç: proje aramasıyla gelen trafiği "Projedar nedir + neden katıl" ile karşılayıp
 * emlakçı/müteahhit kaydına dönüştürmek. Koyu komuta zemini + canlı sinyal + güçlü CTA.
 */
const CIPLER = ["Projedar komisyon almaz", "Canlı stok", "Tek panelden yönetim"];

export function ProjedarBanner() {
  return (
    <section className="relative overflow-hidden border-y border-white/10" style={{ background: "linear-gradient(115deg, #071522 0%, #0d2942 52%, #12564d 132%)" }}>
      <div aria-hidden className="komuta-grid absolute inset-0 opacity-70" />
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(52% 130% at 88% 0%, rgba(47,211,188,0.22) 0%, transparent 60%)" }} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex items-start gap-4">
          <div className="hidden shrink-0 sm:block"><Logo size={34} acik /></div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2fd3bc]/35 bg-[#2fd3bc]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7fd4c4] backdrop-blur-sm">
              <span className="size-2 rounded-full bg-green nabiz" /> Canlı ağ
            </span>
            <p className="mt-2.5 font-display text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
              Yeni konut projelerinin <span className="text-[#7fd4c4]">tahsisli canlı satış ağı</span>
            </p>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-white/70">
              Projedar bir ilan portalı değildir: kapalı devre B2B. Danışman komisyonunun tamamını alır (Projedar pay almaz), müteahhit stoğunu ve fiyatını tek panelden yönetir.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CIPLER.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-white/80">
                  <span className="size-1.5 rounded-full bg-[#2fd3bc]" />{c}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-none flex-col items-stretch gap-2.5">
          <Link
            href="/kayit?rol=emlakci&kaynak=banner"
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-[14px] bg-[#1e9b8a] px-6 text-[14.5px] font-bold text-white shadow-[0_10px_26px_rgba(30,155,138,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#25b3a0] hover:shadow-[0_14px_32px_rgba(47,211,188,0.45)]"
          >
            Danışman olarak ücretsiz katıl →
          </Link>
          <div className="flex items-center gap-2.5">
            <Link href="/kayit?rol=uretici&kaynak=banner" className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-4 text-[13.5px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20">
              Müteahhitsen projeni ekle
            </Link>
            <Link href="/nedir" className="whitespace-nowrap px-2 text-[13px] font-semibold text-[#7fd4c4] transition-colors hover:text-white">Nedir?</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
