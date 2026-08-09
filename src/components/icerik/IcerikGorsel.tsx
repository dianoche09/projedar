import Image from "next/image";

/**
 * İçerik görselleri. Hero (sayfa başı, priority) ve bölüm-arası görsel aynı
 * primitive'i paylaşır. Tasarım diline uygun: yumuşak köşe, ince çerçeve,
 * spatial gölge, isteğe bağlı caption.
 */
export function IcerikHero({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="not-prose">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] border border-[var(--cizgi)] shadow-[var(--golge-2)] sm:aspect-[21/9]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          priority
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-[11.5px] text-[var(--ink-faint)]">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function BolumGorsel({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="not-prose">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--cizgi)] shadow-[var(--golge-1)]">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-[11.5px] text-[var(--ink-faint)]">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
