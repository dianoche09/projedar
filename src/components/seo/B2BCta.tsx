import Link from "next/link";
import { Share2, Building2, CircleSlash, ShieldCheck, Radio, KeySquare } from "lucide-react";

/**
 * GENEL B2B davet bloğu (proje-spesifik DEĞİL). Bu sayfalar scrape/katalog
 * verisiyle üretilen SEO sayfalarıdır; proje ağda olmayabilir, bu yüzden
 * "bu projeyi sat / senin projen mi" gibi iddialar KULLANILMAZ. Amaç: gelen
 * emlakçıyı Projedar ağına katılmaya, müteahhidi projesini eklemeye davet.
 */
export function B2BCta() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Danışman daveti (genel) */}
      <div className="kart kart-3d signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: "var(--color-teal)" }}>
        <span className="inline-grid size-11 place-items-center rounded-2xl bg-[var(--color-teal-soft)]" aria-hidden>
          <Share2 size={22} strokeWidth={1.75} color="var(--color-teal-d)" />
        </span>
        <p className="mt-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-teal-d">Gayrimenkul danışmanı mısın?</p>
        <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">Yeni projeleri sat, komisyonun tamamı sende</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Projedar ağına ücretsiz katıl; sana tahsis edilen yeni konut projelerini canlı stoktan, güncel fiyatla ve tek dokunuşla müşterine paylaş.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[13px] text-ink">
          {[
            [CircleSlash, "Komisyondan pay alınmaz, kazancın %100'ü sende"],
            [Radio, "Her paylaşımda canlı fiyat, eski fiyatla rezil olmazsın"],
            [KeySquare, "Opsiyon DB seviyesinde kilitlenir, çift satış olmaz"],
          ].map(([Icon, t]) => {
            const I = Icon as typeof CircleSlash;
            return (
              <li key={t as string} className="flex items-start gap-2">
                <I size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-teal-d" />
                <span className="leading-snug">{t as string}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 pt-1">
          <Link href="/kayit?rol=emlakci&kaynak=proje-seo" className="btn-action w-full justify-center hover:-translate-y-0.5">
            Ağa ücretsiz katıl
          </Link>
        </div>
      </div>

      {/* Müteahhit daveti (genel) */}
      <div className="kart kart-3d signal-top flex h-full flex-col p-7" style={{ ["--_sig" as string]: "var(--color-navy)" }}>
        <span className="inline-grid size-11 place-items-center rounded-2xl bg-[rgba(19,49,75,0.08)]" aria-hidden>
          <Building2 size={22} strokeWidth={1.75} color="var(--color-navy)" />
        </span>
        <p className="mt-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-faint)]">Müteahhit veya proje sahibi misin?</p>
        <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">Projeni Projedar ağına ekle</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          Yeni konut projeni ağa ekle; stoğunu, fiyatını ve kimin göreceğini tek panelden yönet, yüzlerce yetkili danışmana tek noktadan ulaş.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-[13px] text-ink">
          {[
            [ShieldCheck, "Tahsis sende: tüm proje, tek blok ya da seçili daireler"],
            [Radio, "Yüzlerce yetkili danışmana tek noktadan ulaş"],
            [CircleSlash, "Komisyon yok, sabit yıllık anlaşma; markan yıpranmaz"],
          ].map(([Icon, t]) => {
            const I = Icon as typeof CircleSlash;
            return (
              <li key={t as string} className="flex items-start gap-2">
                <I size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-navy" />
                <span className="leading-snug">{t as string}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 pt-1">
          <Link href="/kayit?rol=uretici&kaynak=proje-seo" className="btn-primary w-full justify-center hover:-translate-y-0.5">
            Projeni ağa ekle
          </Link>
        </div>
      </div>
    </div>
  );
}
