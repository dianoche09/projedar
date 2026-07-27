"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { MagnetKart, MiniPano, type KartDurum } from "./PanoParcalari";

/**
 * HERO · SATIŞ OFİSİ PANOSU
 * Fotoğraftaki gerçek magnet panonun üzerine kod katmanı biner;
 * 4 karelik koreografi data-adim (0..3) ile CSS'ten sürülür:
 * K1 pano sakin, B-4-2 nabızlı · K2 iki pirinç tutucu aynı karta uzanır ·
 * K3 D1 kartı alır, opsiyon rayına takar (klik), D2 çarpı yiyip çekilir ·
 * K4 mini danışman panoları amber yansır, ağ dışı pano yeşil kalır.
 * Karta tıklanınca koreografi K2'den yeniden başlar.
 */

/* pano alanı koordinat sistemi: % (sol, üst, genişlik, yükseklik) */
const KOL_SOL = [0, 12.5, 25, 37.5, 50, 62.5];
const SIRA_UST = [28, 48.5, 69];
const KART_G = 11.4;
const KART_Y = 18;
const HERO_SOL = KOL_SOL[1];
const HERO_UST = SIRA_UST[1];

type Yuva =
  | { kod: string; tip: string; fiyat: string; durum: KartDurum }
  | { bos: true };

/* temsili stok: 18 yuva, 3'ü boş; B-4-2 koreografinin kahramanı */
const YUVALAR: Yuva[] = [
  { kod: "B-5-1", tip: "4+1 · 212 m²", fiyat: "₺24,8M", durum: "yesil" },
  { kod: "B-5-2", tip: "3+1 · 156 m²", fiyat: "₺18,2M", durum: "kirmizi" },
  { kod: "B-5-3", tip: "4+1 · 214 m²", fiyat: "₺25,4M", durum: "yesil" },
  { kod: "B-5-4", tip: "5+1 · 286 m²", fiyat: "₺33,9M", durum: "amber" },
  { kod: "B-5-5", tip: "3+1 · 158 m²", fiyat: "₺18,9M", durum: "yesil" },
  { bos: true },
  { kod: "B-4-1", tip: "4+1 · 208 m²", fiyat: "₺23,6M", durum: "yesil" },
  { kod: "B-4-2", tip: "4+1 · 210 m²", fiyat: "₺23,9M", durum: "yesil" },
  { kod: "B-4-3", tip: "3+1 · 152 m²", fiyat: "₺17,8M", durum: "yesil" },
  { kod: "B-4-4", tip: "5+1 · 281 m²", fiyat: "₺32,4M", durum: "kirmizi" },
  { kod: "B-4-5", tip: "4+1 · 209 m²", fiyat: "₺24,1M", durum: "amber" },
  { kod: "B-4-6", tip: "3+1 · 150 m²", fiyat: "₺17,5M", durum: "yesil" },
  { bos: true },
  { kod: "B-3-2", tip: "4+1 · 204 m²", fiyat: "₺22,7M", durum: "yesil" },
  { kod: "B-3-3", tip: "3+1 · 149 m²", fiyat: "₺16,9M", durum: "kirmizi" },
  { kod: "B-3-4", tip: "4+1 · 205 m²", fiyat: "₺22,9M", durum: "yesil" },
  { bos: true },
  { kod: "B-3-6", tip: "3+1 · 147 m²", fiyat: "₺16,6M", durum: "yesil" },
];

const HERO_INDEX = 7;

function yuvaStil(index: number): CSSProperties {
  const kol = index % 6;
  const sira = Math.floor(index / 6);
  return {
    position: "absolute",
    left: `${KOL_SOL[kol]}%`,
    top: `${SIRA_UST[sira]}%`,
    width: `${KART_G}%`,
    height: `${KART_Y}%`,
  };
}

/* pirinç tutucu: stilize el imleci (insan eli değil, maşa hissi) */
function PirincTutucu({ yon }: { yon: "sag" | "sol" }) {
  return (
    <svg
      viewBox="0 0 220 40"
      className={`w-full ${yon === "sol" ? "-scale-x-100" : ""}`}
      aria-hidden
    >
      <rect x="2" y="15" width="118" height="10" rx="5" fill="#b08d57" />
      <rect x="2" y="15" width="118" height="4" rx="2" fill="#dcbd85" opacity="0.75" />
      <rect x="0" y="12" width="14" height="16" rx="4" fill="#8a6a3a" />
      <rect x="118" y="11" width="12" height="18" rx="3" fill="#8a6a3a" />
      <path
        d="M130 20 C 156 16, 176 11, 202 7"
        fill="none"
        stroke="#b08d57"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M130 20 C 156 24, 176 29, 202 33"
        fill="none"
        stroke="#b08d57"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="205" cy="7" r="4" fill="#dcbd85" stroke="#8a6a3a" strokeWidth="1.4" />
      <circle cx="205" cy="33" r="4" fill="#dcbd85" stroke="#8a6a3a" strokeWidth="1.4" />
    </svg>
  );
}

export function HeroSatisPanosu() {
  const [adim, setAdim] = useState(0);
  const [azaltilmis, setAzaltilmis] = useState(false);
  const zamanlayicilar = useRef<number[]>([]);
  const donguRef = useRef<(ikinciKareden: boolean) => void>(() => {});

  const temizle = useCallback(() => {
    zamanlayicilar.current.forEach((z) => window.clearTimeout(z));
    zamanlayicilar.current = [];
  }, []);

  /* ~14,6sn döngü: K1 0-3s · K2 3-6,2s · K3 6,2-10,4s · K4 10,4-14,6s */
  const dongu = useCallback(
    (ikinciKareden: boolean) => {
      temizle();
      const ekle = (fn: () => void, ms: number) => {
        zamanlayicilar.current.push(window.setTimeout(fn, ms));
      };
      if (ikinciKareden) {
        setAdim(1);
        ekle(() => setAdim(2), 3200);
        ekle(() => setAdim(3), 7400);
        ekle(() => donguRef.current(false), 11800);
      } else {
        setAdim(0);
        ekle(() => setAdim(1), 3000);
        ekle(() => setAdim(2), 6200);
        ekle(() => setAdim(3), 10400);
        ekle(() => donguRef.current(false), 14600);
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
      {/* mobil ve tablet başlık: lg+ ekranda duvar plaketine taşınır */}
      <div className="max-w-2xl">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#8a6a3a] lg:hidden">
          Lüks konut projeleri için kapalı satış ağı
        </p>
        <h1 className="font-display mt-3 text-[32px] font-extrabold leading-[1.08] tracking-tight text-[#261c10] sm:text-[42px] lg:sr-only">
          Bir daire satıldığında, <span className="text-[#8a6a3a]">bütün ağ aynı anda görür.</span>
        </h1>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-[#6b5b44] lg:hidden">
          Satış ofisindeki pano artık yaşıyor: tek doğru kaynak · tahsisli görünürlük · 48 sa opsiyon kilidi
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:hidden">
          <Link href="/kayit?rol=uretici" className="m8-btn m8-btn-ceviz !min-h-[42px] !px-5 text-[13px]">
            Projemi panoya as
          </Link>
          <Link href="/kayit?rol=emlakci" className="m8-btn m8-btn-acik !min-h-[42px] !px-5 text-[13px]">
            Danışman olarak katıl
          </Link>
        </div>
      </div>

      {/* pano sahnesi */}
      <figure className="m8h-kok mt-8 lg:mt-0" data-adim={adim}>
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(58,44,26,0.2)] shadow-[0_24px_60px_rgba(49,36,15,0.25)]">
          <div className="m8h-kirp">
            <div className="m8h-sahne">
              <div className="m8h-icerik">
                <Image
                  src="/generated/mockup-08/pano-duvar.jpg"
                  alt="Ceviz panelli satış ofisi duvarında alüminyum çerçeveli magnet daire panosu"
                  fill
                  priority
                  sizes="(min-width: 1024px) 1104px, 230vw"
                  className="object-cover"
                />
                <div className="m8h-tint" aria-hidden />

                {/* duvar plaketi: başlık + CTA (yalnız lg+) */}
                <div className="m8h-plaka">
                  {/* metinler mobil h1'in kopyasıdır; ekran okuyucuya bir kez okunur */}
                  <p aria-hidden className="font-mono text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#8a6a3a]">
                    Lüks konut projeleri için kapalı satış ağı
                  </p>
                  <p
                    aria-hidden
                    className="font-display mt-2.5 text-[29px] font-extrabold leading-[1.1] tracking-tight text-[#261c10] xl:text-[32px]"
                  >
                    Bir daire satıldığında,
                    <br />
                    <span className="text-[#8a6a3a]">bütün ağ aynı anda görür.</span>
                  </p>
                  <p aria-hidden className="mt-2 font-mono text-[10.5px] text-[#6b5b44]">
                    tek doğru kaynak · tahsisli görünürlük · 48 sa opsiyon kilidi
                  </p>
                  <div className="mt-3.5 flex justify-center gap-2.5">
                    <Link href="/kayit?rol=uretici" className="m8-btn m8-btn-ceviz !min-h-[38px] !px-4 text-[12.5px]">
                      Projemi panoya as
                    </Link>
                    <Link href="/kayit?rol=emlakci" className="m8-btn m8-btn-acik !min-h-[38px] !px-4 text-[12.5px]">
                      Danışman olarak katıl
                    </Link>
                  </div>
                </div>

                {/* çerçeve üstü canlı lambası */}
                <span className="m8h-lamba" aria-hidden>
                  <i />
                  pano canlı
                </span>

                {/* pano alanı: kartlar + ray + mini panolar + koreografi */}
                <div className="m8h-alan" aria-hidden>
                  {/* yuvalar */}
                  {YUVALAR.map((yuva, i) => {
                    if ("bos" in yuva) {
                      return <span key={`bos-${i}`} className="m8-yuva-bos" style={yuvaStil(i)} />;
                    }
                    if (i === HERO_INDEX) {
                      return (
                        <span key={yuva.kod} className="m8h-yuva-kart" style={yuvaStil(i)}>
                          <MagnetKart
                            kod={yuva.kod}
                            tip={yuva.tip}
                            fiyat={yuva.fiyat}
                            durum={yuva.durum}
                            style={{ position: "absolute", inset: 0 }}
                          />
                        </span>
                      );
                    }
                    return (
                      <MagnetKart
                        key={yuva.kod}
                        kod={yuva.kod}
                        tip={yuva.tip}
                        fiyat={yuva.fiyat}
                        durum={yuva.durum}
                        style={yuvaStil(i)}
                      />
                    );
                  })}

                  {/* boşalan yuvanın izi + kilit rozeti (K3'te belirir) */}
                  <span
                    className="m8h-iz"
                    style={{
                      left: `${HERO_SOL}%`,
                      top: `${HERO_UST}%`,
                      width: `${KART_G}%`,
                      height: `${KART_Y}%`,
                    }}
                  >
                    <span className="m8h-iz-rozet">kilitli · d1</span>
                  </span>

                  {/* opsiyon rayı */}
                  <span className="m8-ray" style={{ left: 0, top: "89%", width: "74%", height: "11%" }}>
                    <span className="m8-ray-etiket">opsiyon rayı · 48 sa</span>
                    {[13, 40.5, 68].map((sol) => (
                      <span key={sol} className="m8-ray-yuva" style={{ left: `${sol}%`, width: "15.4%" }} />
                    ))}
                  </span>

                  {/* mini danışman panoları (K4) */}
                  <MiniPano
                    ad="D2 panosu"
                    className="m8h-mini-1"
                    style={{ position: "absolute", left: "77.5%", top: "28%", width: "22.5%", height: "13%" }}
                  />
                  <MiniPano
                    ad="D3 panosu"
                    doluIndexler={[0, 3, 8, 11, 15]}
                    className="m8h-mini-2"
                    style={{ position: "absolute", left: "77.5%", top: "43.5%", width: "22.5%", height: "13%" }}
                  />
                  <MiniPano
                    ad="D4 panosu"
                    doluIndexler={[2, 5, 10, 13, 17]}
                    className="m8h-mini-3"
                    style={{ position: "absolute", left: "77.5%", top: "59%", width: "22.5%", height: "13%" }}
                  />
                  <MiniPano
                    ad="ağ dışı"
                    agDisi
                    className="m8h-mini-4"
                    style={{ position: "absolute", left: "77.5%", top: "74.5%", width: "22.5%", height: "13%" }}
                  />

                  {/* taşınan kart: yeşil yüz raya kadar, oturunca amber yüz */}
                  <span className="m8h-tasinan">
                    <MagnetKart
                      kod="B-4-2"
                      tip="4+1 · 210 m²"
                      fiyat="₺23,9M"
                      durum="yesil"
                      className="m8h-yuz m8h-yuz-yesil"
                    />
                    <MagnetKart
                      kod="B-4-2"
                      tip="kilitli · d1"
                      fiyat="₺23,9M"
                      durum="amber"
                      className="m8h-yuz m8h-yuz-amber"
                    />
                  </span>

                  {/* pirinç tutucular: D1 teal, D2 gri */}
                  <span className="m8h-tutucu m8h-d1">
                    <span className="m8h-tutucu-tag m8h-tag-teal">D1</span>
                    <PirincTutucu yon="sag" />
                  </span>
                  <span className="m8h-tutucu m8h-d2">
                    <PirincTutucu yon="sol" />
                    <span className="m8h-tutucu-tag m8h-tag-gri">D2</span>
                  </span>

                  {/* kırmızı çarpı: boş yuvaya uzanan D2'ye erişim reddi */}
                  <svg className="m8h-carpi" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="17" fill="rgba(248,231,228,0.85)" stroke="#d15a4e" strokeWidth="2.5" />
                    <path
                      d="M13 13 L27 27 M27 13 L13 27"
                      stroke="#d15a4e"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* etkileşim: karta tıklanınca koreografi K2'den başlar */}
                {azaltilmis ? null : (
                  <button
                    type="button"
                    onClick={yenidenBaslat}
                    className="m8h-yuva-btn"
                    style={{
                      /* alan koordinatı → sahne yüzdesi (alan: sol %16,2 · üst %18,6 · %67,8 x %61,6) */
                      left: `${(16.2 + HERO_SOL * 0.678).toFixed(2)}%`,
                      top: `${(18.6 + HERO_UST * 0.616).toFixed(2)}%`,
                      width: `${(KART_G * 0.678).toFixed(2)}%`,
                      height: `${(KART_Y * 0.616).toFixed(2)}%`,
                    }}
                    aria-label="Koreografiyi B-4-2 kartı üzerinden yeniden başlat"
                  />
                )}
              </div>
            </div>

            {/* K4: kenardan çıkan mono fiş */}
            <div className="m8h-fis" aria-hidden>
              pano canlı · 48 sa kilit
            </div>

            {/* mobil K4 yankısı: mini panolar kadraj dışında kalır */}
            <span className="m8h-yanki m8h-yanki-1 bottom-[52px] lg:hidden" aria-hidden>
              <i />
              D2, D3, D4 panosunda: B-4-2 kilitli
            </span>
            <span className="m8h-yanki m8h-yanki-2 m8h-yanki-kirmizi bottom-[18px] lg:hidden" aria-hidden>
              <i />
              ağ dışı pano: hâlâ müsait sanıyor
            </span>
          </div>

          {/* alt şerit: sinyal lejantı + tekrar */}
          <figcaption className="flex flex-col gap-2 border-t border-[rgba(58,44,26,0.16)] bg-[#fdfaf3] px-4 py-3 font-mono text-[10.5px] text-[#6b5b44] sm:flex-row sm:items-center sm:justify-between sm:px-5">
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
              <span className="text-[#9c8c72]">kart kenarı sinyaldir; herkes aynı panoyu görür</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[#9c8c72]">temsili stok ve fiyat</span>
              {azaltilmis ? null : (
                <button type="button" onClick={yenidenBaslat} className="m8h-tekrar">
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
