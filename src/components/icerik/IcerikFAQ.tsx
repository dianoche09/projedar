/**
 * Görünür FAQ (details/summary). YALNIZ gerçek kullanıcı sorusu varsa kullanılır
 * (SEO için yapay soru üretilmez). FAQPage schema BİLİNÇLİ olarak eklenmez —
 * Google rich-result beklentisi üzerine kurgulanmaz; değeri kullanıcı ve
 * AI'ın açık soru-cevap parçalarını okuyabilmesidir.
 */
export function IcerikFAQ({ sorular }: { sorular: { s: string; c: React.ReactNode }[] }) {
  if (!sorular.length) return null;
  return (
    <section aria-labelledby="sss-baslik">
      <h2
        id="sss-baslik"
        className="font-display text-[1.35rem] font-bold leading-snug tracking-tight text-ink sm:text-2xl"
      >
        Sık sorulan sorular
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        {sorular.map((q) => (
          <details key={q.s} className="sss-item kart p-0">
            <summary className="flex items-center justify-between gap-4 px-5 py-4 font-display text-[15px] font-semibold text-ink">
              {q.s}
              <span className="ok flex-none text-teal" aria-hidden>
                ▾
              </span>
            </summary>
            <div className="icerik-govde px-5 pb-5 text-[14px]">{q.c}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
