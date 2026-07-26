import Image from "next/image";
import { Muhur } from "./KagitParcalari";

/**
 * Hero masa sahnesi: gerçek fotoğraf (mimar masası, maket + plan kağıtları)
 * üzerine canlı veri katmanı biner. Fotoğraf dekor değil, ürün anlatımı:
 * masadaki fiziksel dünya ile ekrandaki canlı kayıt aynı karede buluşur.
 * Fotoğrafın orta-sağ boş kâğıt alanı canlı kart için ayrılmıştır.
 */
export function MasaSahnesi() {
  return (
    <figure className="relative">
      <div className="m5-foto-cerceve relative overflow-hidden">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[1920/1088]">
          <Image
            src="/generated/mockup-05/hero-maket-masa.jpg"
            alt="Mimar masası üstten: konut projesi maketi, plan kağıtları, asetat ve teal etiket"
            fill
            priority
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="object-cover object-left"
          />
          {/* sıcak tint + gren: fotoğraf, CSS kâğıt dünyasıyla aynı ışığa girer */}
          <div className="m5-foto-tint absolute inset-0" aria-hidden />

          {/* canlı veri katmanı: makete iğnelenmiş fiyat etiketleri */}
          <div className="absolute left-[30%] top-[16%] sm:left-[33%] sm:top-[18%]" aria-hidden>
            <span className="m5-etiket m5-etiket-igne shadow-[0_4px_12px_rgba(23,41,61,0.25)]">B-4-2 · ₺9,4M</span>
          </div>
          <div className="absolute bottom-[30%] left-[14%] hidden sm:block" aria-hidden>
            <span className="m5-etiket m5-etiket-igne m5-etiket-amber shadow-[0_4px_12px_rgba(23,41,61,0.25)]">
              A-3-4 · kilitli · 46s
            </span>
          </div>

          {/* canlı mühür: kâğıt fişin üstüne basılmış */}
          <div
            className="absolute right-[4%] top-[6%] rotate-3 rounded-[4px] bg-[#fdfbf4] px-2.5 py-2 shadow-[0_3px_10px_rgba(23,41,61,0.3)]"
            aria-hidden
          >
            <Muhur tur="canli">canlı</Muhur>
          </div>

          {/* boş kâğıt alanına basılan canlı kayıt ekranı */}
          <div className="absolute right-[5%] top-1/2 hidden w-[300px] -translate-y-1/2 rotate-1 sm:block lg:right-[9%]">
            <div className="m5-dijital px-5 pb-4 pt-5" style={{ ["--m5-sinyal" as string]: "#2fb36b" }}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[13.5px] font-semibold text-[#10243a]">B-4-2 · 3+1</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f5ec] px-2.5 py-1 text-[11px] font-semibold text-[#1f7d4c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                  Müsait
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="font-mono text-[26px] font-semibold leading-none text-[#10243a]">₺9,4M</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium text-[#1f7d4c]">
                  <span className="m5-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" aria-hidden />
                  şimdi
                </span>
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-dashed border-[rgba(16,36,58,0.12)] pt-2.5">
                <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#7d8da0]">canlı kayıt</span>
                <span className="font-mono text-[9.5px] text-[#7d8da0]">tek doğru kaynak</span>
              </div>
            </div>
            {/* karttan makete uzanan bağ çizgisi */}
            <svg
              viewBox="0 0 120 40"
              className="absolute -left-[104px] top-8 hidden w-[104px] lg:block"
              aria-hidden
            >
              <path d="M118 8C84 4 44 10 4 32" fill="none" stroke="#177e6f" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.7" />
              <circle cx="4" cy="32" r="3" fill="#177e6f" />
            </svg>
          </div>
        </div>

        {/* alt şerit: sahnenin ürün cümlesi */}
        <figcaption className="flex flex-col gap-1 border-t border-[rgba(23,41,61,0.14)] bg-[#fdfbf4] px-4 py-3 font-mono text-[10.5px] text-[#5a6577] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>Masadaki her kâğıt, ekrandaki tek canlı kayda bağlanır.</span>
          <span className="text-[#8b97a8]">maket: temsili proje · veriler: canlı katman</span>
        </figcaption>
      </div>

      {/* mobil: kart fotoğrafın altında (küçük ekranda overlay okunmaz) */}
      <div className="relative z-10 -mt-7 flex justify-center sm:hidden" aria-hidden>
        <div className="m5-dijital w-64 px-4 pb-3 pt-4 shadow-[0_14px_32px_rgba(16,36,58,0.2)]" style={{ ["--m5-sinyal" as string]: "#2fb36b" }}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[12.5px] font-semibold text-[#10243a]">B-4-2 · 3+1</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5f5ec] px-2 py-0.5 text-[10.5px] font-semibold text-[#1f7d4c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2fb36b]" />
              Müsait
            </span>
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <span className="font-mono text-[22px] font-semibold leading-none text-[#10243a]">₺9,4M</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#1f7d4c]">
              <span className="m5-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" />
              şimdi
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
