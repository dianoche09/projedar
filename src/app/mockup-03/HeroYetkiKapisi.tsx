import Image from "next/image";
import Link from "next/link";

/* Hallmark · hero: Tek Akış (sadeleşmiş kartografi) · tone: restraint
 * Üç kuleli şantiye hava çekimi full-bleed sahnedir. Üzerinde yalnız ÜÇ öğe:
 * bitmiş kuledeki tek yeşil nokta, sağa akan TEK kesikli çizgi ucunda
 * "yetkili danışman" çipi (teal) ve KAPI glifinde durmuş gri "yetkisiz" çipi
 * (statik, kırmızı mühür). Dram statik anlatılır; animasyon yalnız akış
 * çizgisindeki yavaş dash kaymasıdır. prefers-reduced-motion: tamamen statik.
 * Sahne katmanı dekoratiftir (aria-hidden); bilgi başlıkta ve künyededir.
 */

export function HeroYetkiKapisi() {
  return (
    <section
      className="relative h-svh min-h-[640px] overflow-hidden bg-navy text-white"
      aria-label="Tek akış: stok yalnız yetkili danışmana akar, yetkisiz akış kapıda durur"
    >
      <style>{`
        @keyframes m3hAkis {
          to { stroke-dashoffset: -10.8; }
        }
        .m3h-akis { animation: m3hAkis 2.8s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .m3h-akis { animation: none; }
        }
      `}</style>

      {/* full-bleed şantiye hava çekimi */}
      <Image
        src="/generated/shared/buyuk-uc-kule-santiye.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[44%_38%] sm:object-[50%_40%]"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,20,32,0.6) 0%, rgba(11,20,32,0.14) 34%, rgba(11,20,32,0.1) 58%, rgba(11,20,32,0.72) 100%)",
        }}
      />

      {/* sahne: tek yeşil nokta + tek akış çizgisi + kapıda duran akış */}
      <div className="absolute inset-0 hidden sm:block" aria-hidden>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* yetkili akış: kuleden sağa, yavaş dash kayması */}
          <path
            d="M 47 42 C 60 40 72 46 84 52"
            pathLength={100}
            stroke="var(--color-teal, #1e9b8a)"
            strokeWidth={2}
            strokeDasharray="3.6 1.8"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="m3h-akis"
            opacity={0.95}
          />
          {/* yetkisiz akış: kapıda biter, statik ve soluk */}
          <path
            d="M 47 44 C 53 54 58 62 62 68"
            pathLength={100}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1.5}
            strokeDasharray="2.4 2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.7}
          />
        </svg>

        {/* bitmiş kuledeki tek yeşil nokta */}
        <span
          className="absolute left-[47%] top-[42%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/80"
          style={{
            background: "var(--color-green, #2fb36b)",
            boxShadow: "0 1px 8px rgba(8,16,28,0.55)",
          }}
        />

        {/* akışın ucu: yetkili danışman çipi */}
        <div className="absolute left-[85%] top-[52%] -translate-y-1/2">
          <div
            className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm"
            style={{
              background: "rgba(11,20,32,0.72)",
              borderColor: "var(--color-teal, #1e9b8a)",
            }}
          >
            <span
              className="size-2 flex-none rounded-full"
              style={{ background: "var(--color-teal, #1e9b8a)" }}
            />
            yetkili danışman
          </div>
        </div>

        {/* kapı glifi: ikinci akış burada durur */}
        <div className="absolute left-[62%] top-[68%] -translate-x-1/2">
          <div className="relative h-7 w-6 rounded-t-full border-2 border-white/75 bg-[rgba(11,20,32,0.45)]">
            <span
              className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full ring-2 ring-white/85"
              style={{ background: "var(--color-red, #d15a4e)" }}
            />
          </div>
          {/* kapıda durmuş gri çip */}
          <div
            className="mt-2 flex -translate-x-[30%] items-center gap-2 whitespace-nowrap rounded-full border border-white/25 px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-white/60 backdrop-blur-sm"
            style={{ background: "rgba(11,20,32,0.6)" }}
          >
            <span
              className="size-2 flex-none rounded-full"
              style={{ background: "var(--color-red, #d15a4e)" }}
            />
            yetkisiz · kapıda
          </div>
        </div>
      </div>

      {/* başlık: sabit tek hiyerarşi, sol üst */}
      <div className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto w-full max-w-7xl px-6 pt-20 sm:px-10 sm:pt-24">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.22em] text-white/75">
            Büyük konut projeleri için
          </p>
          <h1 className="mt-3 max-w-[13ch] font-display text-[11vw] font-extrabold leading-[1.02] tracking-tight sm:text-[60px] lg:text-[76px]">
            Herkes her şeyi görmez.
          </h1>
          <p className="mt-4 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-white/85 sm:text-[16.5px]">
            Stok yalnız yetkili danışmana akar. Gerisi kapıda durur.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href="/kayit?rol=uretici"
              className="inline-flex min-h-12 items-center rounded-full bg-white px-7 text-[15px] font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5"
            >
              Projenizi ağa açın
            </Link>
            <Link
              href="/kayit?rol=emlakci"
              className="group inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-white/90 hover:text-white"
            >
              Danışman olarak katılın
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* alt künye bandı */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/15 bg-[rgba(11,20,32,0.5)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1.5 px-6 py-4 sm:px-10">
          <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/85">
            <span
              aria-hidden
              className="mr-2 inline-block size-2 rounded-full align-middle"
              style={{ background: "var(--color-green, #2fb36b)" }}
            />
            Tek canlı kayıt · tahsisle akış
          </p>
          <p className="font-mono text-[11.5px] tracking-wide text-white/85">
            3 kule · örnek görünüm
          </p>
        </div>
      </div>
    </section>
  );
}
