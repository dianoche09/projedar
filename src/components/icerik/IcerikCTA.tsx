"use client";

import Link from "next/link";
import { Radio, ShieldCheck, CircleSlash } from "lucide-react";
import { icerikOlay } from "@/lib/icerik/analitik";
import type { CtaSeviye } from "@/lib/icerik/tipler";

/**
 * İçerik CTA — üç yoğunlukta (light / medium / strong).
 *
 * Ürün gerçeği (bozulmaz):
 *  - Emlak danışmanı basic üyeliği ücretsiz.
 *  - Projedar işlemden komisyon alan yapı olarak anlatılmaz.
 *  - Ana değer: güncel ve kişiye açılmış (tahsisli) proje stoğuna düzenli erişim.
 *  - "Daha fazla komisyon", "kontenjan tükeniyor", "son yerler" gibi ifade yok.
 */
export function IcerikCTA({ seviye, slug }: { seviye: CtaSeviye; slug: string }) {
  const kaynak = `icerik-${slug}`;
  const danismanHref = `/kayit?rol=emlakci&kaynak=${kaynak}`;
  const muteahhitHref = `/kayit?rol=uretici&kaynak=${kaynak}`;

  const tikla = (hedef: "danisman" | "muteahhit") =>
    icerikOlay("content_cta_click", { slug, seviye, hedef });

  if (seviye === "light") {
    return (
      <aside className="rounded-2xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-5 py-4 sm:px-6">
        <p className="text-[13.5px] leading-relaxed text-ink-soft">
          Yeni konut projelerini müşterilerinize güncel bilgiyle sunmak için Projedar’da danışman
          üyeliği ücretsizdir.{" "}
          <Link
            href={danismanHref}
            onClick={() => tikla("danisman")}
            className="font-semibold text-teal-d underline decoration-teal/30 underline-offset-2 hover:decoration-teal"
          >
            Ağa ücretsiz katılın
          </Link>
          .
        </p>
      </aside>
    );
  }

  if (seviye === "medium") {
    return (
      <aside
        className="kart signal-top p-6 sm:p-7"
        style={{ ["--_sig" as string]: "var(--color-teal)" }}
      >
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-teal-d">
          Gayrimenkul danışmanı mısınız?
        </p>
        <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
          Size açılan projeleri tek canlı havuzdan görün
        </h2>
        <ul className="mt-4 flex flex-col gap-2 text-[13.5px] text-ink">
          {[
            [ShieldCheck, "Size tahsis edilen yeni konut projelerine güncel stok ve fiyatla erişin"],
            [Radio, "Paylaştığınız bilgi kaynaktan geldiği için güncel kalır"],
            [CircleSlash, "Danışman üyeliği ücretsizdir"],
          ].map(([Icon, t]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <li key={t as string} className="flex items-start gap-2">
                <I size={15} strokeWidth={1.9} className="mt-0.5 flex-none text-teal-d" />
                <span className="leading-snug">{t as string}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <Link
            href={danismanHref}
            onClick={() => tikla("danisman")}
            className="btn-action w-full justify-center hover:-translate-y-0.5"
          >
            Ağa ücretsiz katılın
          </Link>
        </div>
      </aside>
    );
  }

  // strong — koyu komuta bloğu, danışman + müteahhit
  return (
    <aside className="komuta relative overflow-hidden rounded-[26px]">
      <div className="komuta-grid absolute inset-0" aria-hidden />
      <div className="relative px-6 py-12 text-center sm:px-10">
        <h2 className="mx-auto max-w-2xl font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
          Yeni konut projeleri, doğru satış ağında.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-white/75">
          Gayrimenkul danışmanıysanız Projedar ağına ücretsiz katılın, size açılan projeleri tek
          canlı havuzdan görün. Müteahhitseniz projenizi ekleyin; erişimi ve tahsisi tek panelden
          yönetin.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={danismanHref}
            onClick={() => tikla("danisman")}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-8 text-[15px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--golge-3)] sm:min-h-[44px] sm:w-auto"
          >
            Danışman olarak katılın
          </Link>
          <Link
            href={muteahhitHref}
            onClick={() => tikla("muteahhit")}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[13px] border border-white/25 bg-white/10 px-8 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 sm:min-h-[44px] sm:w-auto"
          >
            Projenizi ağa ekleyin
          </Link>
        </div>
      </div>
    </aside>
  );
}
