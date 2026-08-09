import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, CalendarClock } from "lucide-react";

/**
 * Ağda (sistemdeki proje) güven şeridi. Canlı stok SAYISI GÖSTERİLMEZ (özel/rekabet bilgisi):
 * yalnız doğrulama + inşaat aşaması + teslim + "canlı stok danışman panelinde" sinyali.
 */
export function AgdaGuvenSeridi({
  dogrulanmis,
  asama,
  ilerleme,
  teslim,
}: {
  dogrulanmis: boolean;
  asama: string;
  ilerleme: number;
  teslim: string | null;
}) {
  return (
    <section className="px-5 sm:px-6">
      <div className="mx-auto -mt-8 w-full max-w-6xl">
        <div className="kart relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3 p-4 sm:px-6">
          {dogrulanmis ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-d">
              <ShieldCheck size={16} strokeWidth={2} /> Doğrulanmış müteahhit
            </span>
          ) : null}
          <span className="text-sm font-medium text-ink">
            {asama}
            {ilerleme > 0 ? ` · %${ilerleme}` : ""}
          </span>
          {teslim ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <CalendarClock size={15} /> Teslim {teslim}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-d">
            <span className="size-2 rounded-full bg-green nabiz" /> Canlı stok danışman panelinde
          </span>
          <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action ml-auto whitespace-nowrap hover:-translate-y-0.5">
            Canlı stoğu gör
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Tam-genişlik görsel bant: temsili foto + okunabilirlik gradyanı + üstte etiket/başlık/çocuklar.
 * /proje sayfasının editoryal görsel zenginliğini sağlar (blok/cephe içermez, "Temsili görsel" etiketli).
 */
export function GorselBant({
  src,
  alt,
  etiket,
  baslik,
  children,
}: {
  src: string;
  alt: string;
  etiket: string;
  baslik: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="px-5 py-8 sm:px-6 sm:py-10">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[26px] shadow-[var(--golge-3)]">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={900}
          sizes="(max-width: 1200px) 100vw, 1152px"
          className="h-[340px] w-full object-cover sm:h-[440px]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(8,20,34,0.12) 0%, rgba(8,20,34,0.22) 42%, rgba(8,20,34,0.85) 100%)" }}
        />
        <span className="absolute right-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] text-white/80">Temsili görsel</span>
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-[#7fd4c4]">{etiket}</p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-white sm:text-[32px]">{baslik}</h2>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
