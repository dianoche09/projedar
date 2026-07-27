"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * HERO · MASADA İKİ KALEM
 * Tepeden kat planı fotoğrafı üzerine kod katmanı biner; tek ekranda
 * 4 karelik otomatik koreografi oynar (data-adim ile CSS sürülür):
 * K1 plan + yeşil etiket, K2 iki kalem süzülür, K3 teal kalem işaretler,
 * KİLİTLİ damgası iner, gri kalemin önüne asetat kayar, K4 ağ yansır.
 * Fotoğraftaki plan çizgileri dekor; konturlar % hizalı kod katmanıdır.
 */

/* sahne koordinatları: 1920x1080 fotoğraf üzerinde birim kutuları */
const UST_SIRA = [
  { kod: "B-4-5", x: 470, y: 320, w: 190, h: 185 },
  { kod: "B-4-6", x: 680, y: 320, w: 190, h: 185 },
  { kod: "B-4-7", x: 890, y: 320, w: 190, h: 185 },
  { kod: "B-4-8", x: 1100, y: 320, w: 190, h: 185 },
];
const ALT_SIRA = [
  { kod: "B-4-1", x: 470, y: 620, w: 210, h: 240 },
  { kod: "B-4-2", x: 700, y: 620, w: 230, h: 240 },
  { kod: "B-4-3", x: 950, y: 620, w: 210, h: 240 },
  { kod: "B-4-4", x: 1180, y: 620, w: 210, h: 240 },
];
const HEDEF = ALT_SIRA[1];

function KalemTeal() {
  /* ucu sağda: soldan süzülüp daireye yönelir */
  return (
    <svg viewBox="0 0 240 26" className="w-full" aria-hidden>
      <rect x="0" y="5" width="10" height="16" rx="3" fill="#0f5f54" />
      <rect x="10" y="4" width="184" height="18" fill="#177e6f" />
      <path d="M10 9.5h184M10 16.5h184" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
      <polygon points="194,4 216,9 216,17 194,22" fill="#e7c79a" />
      <polygon points="216,9 229,13 216,17" fill="#17293d" />
    </svg>
  );
}

function KalemGri() {
  /* ucu solda: sağdan süzülür, asetata takılır */
  return (
    <svg viewBox="0 0 240 26" className="w-full" aria-hidden>
      <polygon points="11,13 24,9 24,17" fill="#43536a" />
      <polygon points="24,9 46,4 46,22 24,17" fill="#e7c79a" />
      <rect x="46" y="4" width="184" height="18" fill="#98a3b2" />
      <path d="M46 9.5h184M46 16.5h184" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
      <rect x="230" y="5" width="10" height="16" rx="3" fill="#6b7787" />
    </svg>
  );
}

export function HeroPlanMasasi() {
  const [adim, setAdim] = useState(0);
  const [azaltilmis, setAzaltilmis] = useState(false);
  const zamanlayicilar = useRef<number[]>([]);
  /* döngünün kendini yeniden kurabilmesi için ref üzerinden çağrı */
  const donguRef = useRef<(ikinciKareden: boolean) => void>(() => {});

  const temizle = useCallback(() => {
    zamanlayicilar.current.forEach((z) => window.clearTimeout(z));
    zamanlayicilar.current = [];
  }, []);

  /* ~15sn döngü: K1 0-2s, K2 2-5.2s, K3 5.2-8.8s, K4 8.8-15s */
  const dongu = useCallback(
    (ikinciKareden: boolean) => {
      temizle();
      const ekle = (fn: () => void, ms: number) => {
        zamanlayicilar.current.push(window.setTimeout(fn, ms));
      };
      if (ikinciKareden) {
        setAdim(1);
        ekle(() => setAdim(2), 3200);
        ekle(() => setAdim(3), 6800);
        ekle(() => donguRef.current(false), 13000);
      } else {
        setAdim(0);
        ekle(() => setAdim(1), 2000);
        ekle(() => setAdim(2), 5200);
        ekle(() => setAdim(3), 8800);
        ekle(() => donguRef.current(false), 15000);
      }
    },
    [temizle]
  );

  useEffect(() => {
    donguRef.current = dongu;
  }, [dongu]);

  useEffect(() => {
    const sorgu = window.matchMedia("(prefers-reduced-motion: reduce)");
    const uygula = (azalt: boolean) => {
      if (azalt) {
        temizle();
        setAzaltilmis(true);
        setAdim(3); /* K4 statik */
      } else {
        setAzaltilmis(false);
        dongu(false);
      }
    };
    uygula(sorgu.matches);
    const dinle = (e: MediaQueryListEvent) => uygula(e.matches);
    sorgu.addEventListener("change", dinle);
    return () => {
      sorgu.removeEventListener("change", dinle);
      temizle();
    };
  }, [dongu, temizle]);

  const yenidenBaslat = useCallback(() => {
    if (azaltilmis) return;
    dongu(true); /* K2'den başlar */
  }, [azaltilmis, dongu]);

  return (
    <div>
      {/* mobil ve tablet: başlık üstte; lg+ ekranda başlık antete taşınır */}
      <div className="max-w-2xl">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#177e6f] lg:hidden">
          Geliştirici firmalar için canlı proje satış ağı
        </p>
        <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.08] tracking-tight text-[#17293d] sm:text-[42px] lg:sr-only">
          Proje satışının dağınık dünyasını <span className="text-[#177e6f]">tek ekrana</span> topladık.
        </h1>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-[#5a6577] lg:hidden">
          Fiyat tek yerde yaşar · opsiyon damgayla kilitlenir · dağıtım tahsisle yapılır
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:hidden">
          <Link href="/kayit?rol=uretici" className="m5-btn m5-btn-ink !min-h-[42px] !px-5 text-[13.5px]">
            Projemi canlı ağa aç
          </Link>
          <Link href="/kayit?rol=emlakci" className="m5-btn m5-btn-kagit !min-h-[42px] !px-5 text-[13.5px]">
            Danışman olarak katıl
          </Link>
        </div>
      </div>

      {/* masa sahnesi: fotoğraf + kod katmanı + koreografi */}
      <figure className="m5h-kok mt-8 lg:mt-0" data-adim={adim}>
        <div className="m5-foto-cerceve relative overflow-hidden">
          <div className="m5h-kirp">
            <div className="m5h-sahne">
              <div className="m5h-icerik">
                <Image
                  src="/generated/mockup-05/plan-masa-topdown.jpg"
                  alt="Ahşap masada tepeden kat planı paftası; kenarlarda rulo plan ve ahşap maket parçaları"
                  fill
                  priority
                  sizes="(min-width: 1024px) 1104px, 200vw"
                  className="object-cover"
                />
                <div className="m5-foto-tint absolute inset-0" aria-hidden />

                {/* kod katmanı: kâğıt-yama zemin + daire konturları + çizik */}
                <svg
                  viewBox="0 0 1920 1080"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden
                >
                  {/* hafif beyaz yama: navy konturlar fotoğraf çizgileriyle yarışmasın */}
                  <rect x="450" y="298" width="960" height="228" rx="8" fill="#fdfbf4" opacity="0.5" />
                  <rect x="450" y="598" width="960" height="284" rx="8" fill="#fdfbf4" opacity="0.5" />

                  {[...UST_SIRA, ...ALT_SIRA].map((d) => (
                    <g key={d.kod}>
                      <rect
                        x={d.x}
                        y={d.y}
                        width={d.w}
                        height={d.h}
                        rx="3"
                        fill="none"
                        stroke="#17293d"
                        strokeWidth="2.5"
                        strokeOpacity="0.68"
                      />
                      <text
                        x={d.x + 14}
                        y={d.y + 36}
                        fontSize="21"
                        fontFamily="var(--font-mono), ui-monospace, monospace"
                        fontWeight="600"
                        fill="rgba(23,41,61,0.72)"
                      >
                        {d.kod}
                      </text>
                    </g>
                  ))}

                  <text
                    x="460"
                    y="912"
                    fontSize="20"
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    fill="rgba(23,41,61,0.55)"
                    letterSpacing="3"
                  >
                    B BLOK · 4. KAT
                  </text>

                  {/* K2: hedef dairenin çevresi vurgulanır */}
                  <rect
                    className="m5h-vurgu"
                    x={HEDEF.x - 5}
                    y={HEDEF.y - 5}
                    width={HEDEF.w + 10}
                    height={HEDEF.h + 10}
                    rx="6"
                    fill="rgba(23,126,111,0.07)"
                    stroke="#177e6f"
                    strokeWidth="5"
                  />

                  {/* K3: teal kalemin kısa çiziği */}
                  <path
                    className="m5h-cizik"
                    d="M726 782 L800 668 L836 776 L902 654"
                    fill="none"
                    stroke="#177e6f"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                </svg>

                {/* K1: yeşil kâğıt etiketi + tazelik mührü (K3'te amber olur) */}
                <div className="m5h-etiket" aria-hidden>
                  <span className="m5h-etiket-yuz m5h-etiket-yesil m5-etiket-igne">
                    B-4-2 · müsait
                    <span className="m5h-simdi">
                      <span className="m5-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" />
                      şimdi
                    </span>
                  </span>
                  <span className="m5h-etiket-yuz m5h-etiket-amber">B-4-2 · kilitli · 48s</span>
                </div>

                {/* K2: kalemler */}
                <div className="m5h-kalem m5h-kalem-teal" aria-hidden>
                  <KalemTeal />
                </div>
                <div className="m5h-kalem m5h-kalem-gri" aria-hidden>
                  <KalemGri />
                </div>

                {/* K3: kauçuk damga */}
                <div className="m5h-damga" aria-hidden>
                  <span className="m5-muhur m5-muhur-kilit m5h-damga-ic">kilitli</span>
                </div>

                {/* K3: gri kalemin önüne kayan şeffaf asetat */}
                <div className="m5h-asetat m5-asetat" aria-hidden>
                  <span className="m5h-erisim">erişim yok</span>
                  {/* gri iz asetat üstünde kalır, kâğıda geçemez */}
                  <svg viewBox="0 0 100 60" className="absolute left-[4%] top-[32%] w-[34%]">
                    <path
                      className="m5h-asetat-cizik"
                      d="M8 42 q14 -26 30 -9 t36 -7"
                      fill="none"
                      stroke="#5f6b7a"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                  </svg>
                </div>

                {/* K4: ağ yansıması, yan kâğıtlarda amber kopyalar (stagger) */}
                <span
                  className="m5h-yansima m5h-yansima-1"
                  style={{ left: "1.5%", top: "15%", "--m5h-don": "-8deg" } as CSSProperties}
                  aria-hidden
                >
                  B-4-2 · kilitli
                </span>
                <span
                  className="m5h-yansima m5h-yansima-2"
                  style={{ left: "2.2%", top: "36%", "--m5h-don": "-6deg" } as CSSProperties}
                  aria-hidden
                >
                  B-4-2 · kilitli
                </span>
                <span
                  className="m5h-yansima m5h-yansima-3"
                  style={{ left: "54%", top: "87%", "--m5h-don": "-1deg" } as CSSProperties}
                  aria-hidden
                >
                  saha kopyası · B-4-2 kilitli
                </span>

                {/* ağ dışı kâğıt köşesi: soluk kalır, güncellenmez */}
                <span
                  className="m5h-agdisi"
                  style={{ left: "1.8%", top: "55%", "--m5h-don": "-7deg" } as CSSProperties}
                  aria-hidden
                >
                  ağ dışı kopya · güncellenmedi
                </span>

                {/* K4: köşedeki telefon ekranı (CSS çizim) */}
                <div className="m5h-telefon" aria-hidden>
                  <div className="m5h-tel-govde">
                    <div className="m5h-tel-ekran">
                      <div className="flex items-center justify-between px-1 pb-1.5">
                        <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#5a6577]">
                          Canlı havuz
                        </span>
                        <span className="m5-nabiz h-1.5 w-1.5 rounded-full bg-[#2fb36b]" />
                      </div>
                      <div className="m5h-tel-satir">
                        <span className="font-mono text-[9.5px] font-semibold text-[#10243a]">A-3-4</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[8.5px] text-[#1f7d4c]">
                          <span className="h-1 w-1 rounded-full bg-[#2fb36b]" />
                          müsait
                        </span>
                      </div>
                      <div className="m5h-tel-satir m5h-tel-satir-hedef">
                        <span className="font-mono text-[9.5px] font-semibold text-[#10243a]">B-4-2</span>
                        <span className="m5h-tel-durum font-mono text-[8.5px]">
                          <span className="m5h-tel-durum-m text-[#1f7d4c]">
                            <span className="h-1 w-1 rounded-full bg-[#2fb36b]" />
                            müsait
                          </span>
                          <span className="m5h-tel-durum-k text-[#9a6a12]">
                            <span className="h-1 w-1 rounded-full bg-[#e3a12c]" />
                            kilitli
                          </span>
                        </span>
                      </div>
                      <div className="m5h-tel-satir">
                        <span className="font-mono text-[9.5px] font-semibold text-[#10243a]">C-1-2</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[8.5px] text-[#1f7d4c]">
                          <span className="h-1 w-1 rounded-full bg-[#2fb36b]" />
                          müsait
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* lg+: başlık, fotoğrafın antet alanında teknik yazı gibi */}
                <div className="m5h-antet">
                  <div className="m5h-antet-kutu">
                    <div className="flex items-center justify-between border-b border-dashed border-[rgba(23,41,61,0.25)] pb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5a6577]">
                      <span>pafta B-04</span>
                      <span className="text-[#177e6f]">canlı proje satış ağı</span>
                      <span>rev · şimdi</span>
                    </div>
                    <p
                      className="font-display mt-3 text-[30px] font-extrabold leading-[1.08] tracking-tight text-[#17293d] xl:text-[33px]"
                      aria-hidden
                    >
                      Proje satışının dağınık dünyasını
                      <br />
                      <span className="text-[#177e6f]">tek ekrana</span> topladık.
                    </p>
                    <p className="mt-2 font-mono text-[10.5px] text-[#5a6577]" aria-hidden>
                      Fiyat tek yerde yaşar · opsiyon damgayla kilitlenir · dağıtım tahsisle yapılır
                    </p>
                    <div className="mt-3.5 flex justify-center gap-2.5">
                      <Link href="/kayit?rol=uretici" className="m5-btn m5-btn-ink !min-h-[38px] !px-4 text-[12.5px]">
                        Projemi canlı ağa aç
                      </Link>
                      <Link href="/kayit?rol=emlakci" className="m5-btn m5-btn-kagit !min-h-[38px] !px-4 text-[12.5px]">
                        Danışman olarak katıl
                      </Link>
                    </div>
                  </div>
                </div>

                {/* etkileşim: daireye tıklayınca koreografi K2'den başlar */}
                {azaltilmis ? null : (
                  <button
                    type="button"
                    onClick={yenidenBaslat}
                    className="m5h-daire-btn"
                    aria-label="Koreografiyi B-4-2 dairesi üzerinden yeniden başlat"
                  />
                )}
              </div>
            </div>

            {/* K4: kenardan çıkan mono fiş (kırpım içinde, mobilde de görünür) */}
            <div className="m5h-fis" aria-hidden>
              ağ güncellendi · şimdi
            </div>
          </div>

          {/* alt şerit: sinyal lejantı + tekrar */}
          <figcaption className="flex flex-col gap-2 border-t border-[rgba(23,41,61,0.14)] bg-[#fdfbf4] px-4 py-3 font-mono text-[10.5px] text-[#5a6577] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                ["#2fb36b", "müsait"],
                ["#e3a12c", "opsiyonda"],
                ["#d15a4e", "satıldı"],
              ].map(([renk, ad]) => (
                <span key={ad} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: renk }} aria-hidden />
                  {ad}
                </span>
              ))}
              <span className="text-[#8b97a8]">renkler mühürdür; herkes aynı anda görür</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[#8b97a8]">temsili plan · veriler canlı katman</span>
              {azaltilmis ? null : (
                <button type="button" onClick={yenidenBaslat} className="m5h-tekrar">
                  tekrar
                </button>
              )}
            </span>
          </figcaption>
        </div>
      </figure>
    </div>
  );
}
