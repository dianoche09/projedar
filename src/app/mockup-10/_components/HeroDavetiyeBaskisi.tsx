"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { EskiBaskiKarti } from "./BaskiParcalari";

/**
 * HERO · DAVETİYE BASKISI
 * Letterpress atölye fotoğrafı üzerine kod katmanı biner; tek ekranda
 * 4 karelik koreografi oynar (data-adim ile CSS sürülür):
 * K1 masada tek canlı davetiye + kenarda soluk geçersiz baskılar,
 * K2 iki ıstampa iki yandan yaklaşır (D1 teal saplı, D2 gri saplı),
 * K3 D1 gofre "REZERVE · 48 SA" damgasını basar, kâğıt sarsılır;
 *    D2 inmeye kalkınca şeffaf koruma tabakası kapanır, iz tabakada kalır,
 * K4 danışman nüshaları aynı anda mühürlenir, ağ dışı baskıya BAYAT düşer.
 * Kural: sonraki kare öncekini korur. Davetiyeye tıklayınca K2'den başlar.
 */

function Istampa({ sap }: { sap: "teal" | "gri" }) {
  const sapAna = sap === "teal" ? "#177e6f" : "#98a3b2";
  const sapKoyu = sap === "teal" ? "#0f5f54" : "#6b7787";
  return (
    <svg viewBox="0 0 120 150" className="w-full" aria-hidden>
      {/* topuz */}
      <ellipse cx="60" cy="17" rx="21" ry="14" fill={sapKoyu} />
      <ellipse cx="56" cy="13" rx="10" ry="5.5" fill="rgba(255,255,255,0.28)" />
      {/* sap */}
      <rect x="51" y="26" width="18" height="50" rx="8" fill={sapAna} />
      <rect x="55" y="28" width="4" height="46" rx="2" fill="rgba(255,255,255,0.25)" />
      {/* ahşap boyun ve yatak */}
      <rect x="40" y="76" width="40" height="10" rx="4" fill="#8a6746" />
      <path d="M28 86 L92 86 L103 114 L17 114 Z" fill="#a07a50" />
      <path d="M28 86 L92 86 L94 92 L26 92 Z" fill="rgba(255,255,255,0.16)" />
      {/* kauçuk kalıp */}
      <rect x="13" y="114" width="94" height="17" rx="4" fill="#2c3a52" />
      <rect x="13" y="128" width="94" height="7" rx="3" fill="#1b2a41" />
    </svg>
  );
}

export function HeroDavetiyeBaskisi() {
  const [adim, setAdim] = useState(0);
  const [azaltilmis, setAzaltilmis] = useState(false);
  const zamanlayicilar = useRef<number[]>([]);
  /* döngünün kendini yeniden kurabilmesi için ref üzerinden çağrı */
  const donguRef = useRef<(ikinciKareden: boolean) => void>(() => {});

  const temizle = useCallback(() => {
    zamanlayicilar.current.forEach((z) => window.clearTimeout(z));
    zamanlayicilar.current = [];
  }, []);

  /* ~17sn döngü: K1 0-3.5s, K2 3.5-7.2s, K3 7.2-11.6s, K4 11.6-17.4s */
  const dongu = useCallback(
    (ikinciKareden: boolean) => {
      temizle();
      const ekle = (fn: () => void, ms: number) => {
        zamanlayicilar.current.push(window.setTimeout(fn, ms));
      };
      if (ikinciKareden) {
        setAdim(1);
        ekle(() => setAdim(2), 3400);
        ekle(() => setAdim(3), 7800);
        ekle(() => donguRef.current(false), 13600);
      } else {
        setAdim(0);
        ekle(() => setAdim(1), 3500);
        ekle(() => setAdim(2), 7200);
        ekle(() => setAdim(3), 11600);
        ekle(() => donguRef.current(false), 17400);
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
      {/* mobil ve tablet: başlık üstte; lg+ ekranda başlık kâğıdın üst şeridine taşınır */}
      <div className="max-w-2xl">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#7d6027] lg:hidden">
          Lüks konut projeleri için kapalı satış ağı
        </p>
        <h1 className="m10-serif m10-gofre mt-3 text-[32px] font-bold leading-[1.12] sm:text-[42px] lg:sr-only">
          Proje satışının dağınık dünyasını <span className="text-[#7d6027]">tek ekrana</span> topladık.
        </h1>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-[#5c6474] lg:hidden">
          Her paylaşım bir davetiye baskısıdır · yalnız canlı baskı geçerlidir
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:hidden">
          <Link href="/kayit?rol=uretici" className="m10-btn m10-btn-ink !min-h-[42px] !px-5 text-[13.5px]">
            Projemi baskıya al
          </Link>
          <Link href="/kayit?rol=emlakci" className="m10-btn m10-btn-pirinc !min-h-[42px] !px-5 text-[13.5px]">
            Davetli danışman ol
          </Link>
        </div>
      </div>

      {/* matbaa masası sahnesi: fotoğraf + kod katmanı + koreografi */}
      <figure className="m10h-kok mt-8 lg:mt-0" data-adim={adim}>
        <div className="m10h-cerceve relative overflow-hidden">
          <div className="m10h-kirp">
            <div className="m10h-sahne">
              <div className="m10h-icerik">
                <Image
                  src="/generated/mockup-10/matbaa-masa.jpg"
                  alt="Letterpress atölye masası: boş fildişi kâğıtlar, metal hurufat harfleri, ıstampa ve mürekkep tamponu"
                  fill
                  priority
                  sizes="(min-width: 1024px) 1104px, 220vw"
                  className="object-cover"
                />
                <div className="m10h-tint absolute inset-0" aria-hidden />

                {/* K1 · kenarda soluk eski baskılar */}
                <div
                  className="m10h-eski"
                  style={{ left: "2.5%", top: "27%", "--m10h-don": "-7deg" } as CSSProperties}
                  aria-hidden
                >
                  <EskiBaskiKarti ad="REZİDANS B-4-2" eskiFiyat="₺23,8M" surum="eski baskı · geçen ay" />
                </div>
                <div
                  className="m10h-eski"
                  style={{ left: "66.5%", top: "68%", "--m10h-don": "4deg" } as CSSProperties}
                  aria-hidden
                >
                  <EskiBaskiKarti
                    ad="REZİDANS B-4-2"
                    eskiFiyat="₺23,8M"
                    surum="ağ dışı nüsha"
                    muhur={<span className="m10-muhur m10-muhur-gecersiz text-[9px]">geçersiz baskı</span>}
                  />
                  {/* K4: ağ dışı baskı güncellenmez, üstüne BAYAT filigranı düşer */}
                  <span className="m10h-bayat">bayat</span>
                </div>

                {/* davetiye: kod ile dizilmiş canlı baskı */}
                <div className="m10h-davetiye m10-davetiye">
                  <div className="m10h-dav-ic">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[#7d6027]">
                      ProjePazar ağı · canlı baskı
                    </p>
                    <div className="m10-susleme mt-3" aria-hidden>
                      <i />
                    </div>
                    <p className="m10-serif m10-gofre mt-3 text-[22px] font-bold tracking-[0.06em] xl:text-[26px]">
                      REZİDANS B-4-2
                    </p>
                    <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#5c6474]">
                      3+1 · 142 m² · kule B · 4. kat
                    </p>
                    <p className="mono m10-gofre mt-3 text-[24px] font-bold xl:text-[28px]">₺24,5M</p>
                    <p className="m10h-dav-durum-musait m10-durum m10-d-musait mt-2 justify-center">
                      <i className="m10-nabiz" />
                      müsait · şimdi
                    </p>
                    <div className="m10-susleme mt-3" aria-hidden>
                      <i />
                    </div>
                    <p className="mt-2.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-[#8b8f98]">
                      12. baskı · bugün · tek geçerli nüsha
                    </p>

                    {/* K3: gofre REZERVE damgası */}
                    <span className="m10h-rezerve m10-muhur-gofre" aria-hidden>
                      rezerve · 48 sa
                    </span>
                  </div>
                </div>

                {/* K2 · baskı kolları: D1 teal, D2 gri */}
                <div className="m10h-istampa m10h-istampa-teal" aria-hidden>
                  <Istampa sap="teal" />
                </div>
                <div className="m10h-istampa m10h-istampa-gri" aria-hidden>
                  <Istampa sap="gri" />
                </div>

                {/* K3 · şeffaf koruma tabakası: D2'nin izi kâğıda geçmez */}
                <div className="m10h-tabaka" aria-hidden>
                  <span className="m10h-erisim">erişim kapalı</span>
                  <span className="m10h-tabaka-iz">iz tabakada kaldı</span>
                </div>

                {/* K4 · danışman nüshaları: aynı anda mühürlenir */}
                {[
                  { sol: "74.5%", ust: "34%", don: "5deg", no: "04", sira: 1 },
                  { sol: "26%", ust: "62%", don: "-6deg", no: "11", sira: 2 },
                  { sol: "40%", ust: "80%", don: "2deg", no: "17", sira: 3 },
                ].map((n) => (
                  <div
                    key={n.no}
                    className={`m10h-nusha m10h-nusha-${n.sira} m10-eski-baski`}
                    style={{ left: n.sol, top: n.ust, "--m10h-don": n.don } as CSSProperties}
                    aria-hidden
                  >
                    <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#6d7683]">
                      danışman nüshası · {n.no}
                    </p>
                    <p className="m10-serif mt-0.5 text-[12px] font-semibold text-[#4a5261]">B-4-2 · ₺24,5M</p>
                    <span className="m10h-nusha-muhur">rezerve · 48 sa</span>
                  </div>
                ))}

                {/* lg+: başlık, kâğıdın üst boş şeridinde dizgi gibi */}
                <div className="m10h-baslik">
                  <div className="m10h-baslik-ic">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#7d6027]" aria-hidden>
                      Lüks konut projeleri için kapalı satış ağı
                    </p>
                    <p
                      className="m10-serif m10-gofre mt-2.5 text-[30px] font-bold leading-[1.12] xl:text-[34px]"
                      aria-hidden
                    >
                      Proje satışının dağınık dünyasını
                      <br />
                      <span className="text-[#7d6027]">tek ekrana</span> topladık.
                    </p>
                    <p className="mt-2 font-mono text-[10.5px] text-[#5c6474]" aria-hidden>
                      Her paylaşım bir davetiye baskısıdır · yalnız canlı baskı geçerlidir
                    </p>
                    <div className="mt-3.5 flex justify-center gap-2.5">
                      <Link href="/kayit?rol=uretici" className="m10-btn m10-btn-ink !min-h-[38px] !px-4 text-[12.5px]">
                        Projemi baskıya al
                      </Link>
                      <Link href="/kayit?rol=emlakci" className="m10-btn m10-btn-pirinc !min-h-[38px] !px-4 text-[12.5px]">
                        Davetli danışman ol
                      </Link>
                    </div>
                  </div>
                </div>

                {/* etkileşim: davetiyeye tıklayınca koreografi K2'den başlar */}
                {azaltilmis ? null : (
                  <button
                    type="button"
                    onClick={yenidenBaslat}
                    className="m10h-davetiye-btn"
                    aria-label="Koreografiyi davetiye baskısı üzerinden yeniden başlat"
                  />
                )}
              </div>
            </div>

            {/* K4: kenardan çıkan mono fiş (kırpım içinde, mobilde de görünür) */}
            <div className="m10h-fis" aria-hidden>
              tek baskı geçerli · ağ güncel
            </div>
          </div>

          {/* alt şerit: sinyal lejantı + tekrar */}
          <figcaption className="flex flex-col gap-2 border-t border-[rgba(27,42,65,0.16)] bg-[#fbf7ec] px-4 py-3 font-mono text-[10.5px] text-[#5c6474] sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                ["#2fb36b", "müsait"],
                ["#e3a12c", "rezerve"],
                ["#d15a4e", "satıldı"],
              ].map(([renk, ad]) => (
                <span key={ad} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: renk }} aria-hidden />
                  {ad}
                </span>
              ))}
              <span className="text-[#8b8f98]">mühür renkleri sabittir; herkes aynı baskıyı görür</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[#8b8f98]">temsili baskı · veriler canlı katman</span>
              {azaltilmis ? null : (
                <button type="button" onClick={yenidenBaslat} className="m10h-tekrar">
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
