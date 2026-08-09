/**
 * İçerik bölümü (H2 + gövde). `id` TOC ve derin bağlantı için; `scroll-mt`
 * sabit üst bara denk gelmez. Gövde metni `.icerik-govde` tipografisini alır.
 */
export function Bolum({
  id,
  baslik,
  children,
}: {
  id: string;
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2
        id={id}
        className="font-display text-[1.35rem] font-bold leading-snug tracking-tight text-ink sm:text-2xl"
      >
        {baslik}
      </h2>
      <div className="icerik-govde mt-4">{children}</div>
    </section>
  );
}
