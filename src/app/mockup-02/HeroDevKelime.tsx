"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAzalt } from "./useAzalt";

/**
 * HeroDevKelime · Mockup 02 hero sahnesi (DEV KELİME SAHNESİ).
 * Tek SVG içinde ~700 <rect> hücre: bitmap glif maskeleriyle MÜSAİT örülür,
 * K3'te hücreler transform akışıyla OPSİYONLANDI'ya TAŞINIR (kaybolup belirme
 * yok; her hücre eski konumundan yeni harf maskesine yolculuk eder).
 * 4 karelik otomatik koreografi (~14sn döngü): K1 nabızlı hücre, K2 imleç
 * yarışı + mercek, K3 amber akış + kırmızı kilit + geri itilen imleç,
 * K4 uç şeritlerine ışık akışı. "tekrar" ve nabızlı hücre K2'den başlatır.
 * Hücre konumları ve tonları modül seviyesinde deterministik üretilir
 * (SSR/istemci aynı çıktı). TÜM VERİLER ÖRNEKTİR.
 */

type Nokta = { x: number; y: number };
type SeritBilgi = { x: number; y: number; ad: string };
type ImlecPoz = { x: number; y: number; o: number };
type HucreVeri = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  ton: number;
  gecikme: number;
  titrek: boolean;
};

const MONO = "var(--font-mono), ui-monospace, monospace";

/* ---- bitmap glifler (5x7 / 3x7): harf maskelerinin kaynağı ---- */
const GLIFLER: Record<string, string[]> = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  D: ["XXXX.", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXX."],
  I: ["XXX", ".X.", ".X.", ".X.", ".X.", ".X.", "XXX"],
  İ: [".X.", "...", "XXX", ".X.", ".X.", ".X.", "XXX"],
  L: ["X....", "X....", "X....", "X....", "X....", "X....", "XXXXX"],
  M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X", "X...X", "X...X"],
  N: ["X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X..", "..X..", "..X.."],
  Ü: [".X.X.", ".....", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  Y: ["X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
};

/* her glif pikseli ALT_BOLME x ALT_BOLME mini hücreye bölünür (doku) */
const ALT_BOLME = 2;

const GENISLIK = 1200;
const YUKSEKLIK = 560;
const ADIM = 8; // hücre aralığı (viewBox birimi)
const KUTU = 6.4; // hücre kenarı
const OLCEK_A = 2; // MÜSAİT, OPSİYONLANDI ile aynı genişliğe ölçeklenir
const DIKEY_MERKEZ = 282;

function kelimeKolon(kelime: string): number {
  let kolon = 0;
  for (const harf of kelime) {
    const g = GLIFLER[harf];
    if (!g) continue;
    kolon += g[0].length + 1;
  }
  return (kolon - 1) * ALT_BOLME;
}

function kelimeHucreleri(kelime: string): Nokta[] {
  const hucreler: Nokta[] = [];
  let kolon = 0;
  for (const harf of kelime) {
    const g = GLIFLER[harf];
    if (!g) continue;
    g.forEach((satir, sy) => {
      for (let sx = 0; sx < satir.length; sx++) {
        if (satir[sx] !== "X") continue;
        for (let ay = 0; ay < ALT_BOLME; ay++) {
          for (let ax = 0; ax < ALT_BOLME; ax++) {
            hucreler.push({ x: (kolon + sx) * ALT_BOLME + ax, y: sy * ALT_BOLME + ay });
          }
        }
      }
    });
    kolon += g[0].length + 1;
  }
  /* x'e göre sıralama: K3 akışı soldan sağa dalga olarak okunur */
  return hucreler.sort((a, b) => a.x - b.x || a.y - b.y);
}

/* deterministik sözde-rasgele (mulberry32): SSR ve istemci aynı doku */
function rasgele(tohum: number): () => number {
  let t = tohum >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let s = Math.imul(t ^ (t >>> 15), t | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

/* çoğunluk koyu ton, azınlık parlak: canlı doku */
function tonSec(r: number): number {
  if (r < 0.34) return 0;
  if (r < 0.58) return 1;
  if (r < 0.76) return 2;
  if (r < 0.9) return 3;
  return 4;
}

const YESIL_TON = ["#173a26", "#1b4a2f", "#1f5c39", "#256e44", "#2fb36b"];
const AMBER_TON = ["#3a2d10", "#4a3914", "#5c4517", "#77591c", "#e3a12c"];

const HUCRE_A = kelimeHucreleri("MÜSAİT");
const HUCRE_B = kelimeHucreleri("OPSİYONLANDI");
const KOLON_A = kelimeKolon("MÜSAİT");
const KOLON_B = kelimeKolon("OPSİYONLANDI");

const OFX_A = (GENISLIK - KOLON_A * ADIM * OLCEK_A) / 2;
const OFX_B = (GENISLIK - KOLON_B * ADIM) / 2;
const OFY_A = DIKEY_MERKEZ - (7 * ALT_BOLME * ADIM * OLCEK_A) / 2;
const OFY_B = DIKEY_MERKEZ - (7 * ALT_BOLME * ADIM) / 2;

/* nabızlı hücre: MÜSAİT içinde sağ-orta bölgeye en yakın hücre */
function ildizSec(): number {
  const hedefX = Math.round(KOLON_A * 0.62);
  const hedefY = 7;
  let secilen = 0;
  let enYakin = Infinity;
  HUCRE_A.forEach((h, k) => {
    const d = (h.x - hedefX) ** 2 + (h.y - hedefY) ** 2;
    if (d < enYakin) {
      enYakin = d;
      secilen = k;
    }
  });
  return secilen;
}

const ILDIZ_A = ildizSec();

/* iki kelimenin hücrelerini eşle: rect sayısı = büyük kelimenin hücre sayısı.
   MÜSAİT durumunda fazla rect'ler aynı konuma binişir (görünmez), akışta ayrışır. */
function hucreleriEsle(): { liste: HucreVeri[]; yildiz: number } {
  const nA = HUCRE_A.length;
  const nB = HUCRE_B.length;
  const liste: HucreVeri[] = [];
  let yildiz = -1;
  for (let i = 0; i < nB; i++) {
    let ai = Math.min(nA - 1, Math.floor((i * nA) / nB));
    if (ai === ILDIZ_A) {
      if (yildiz === -1) yildiz = i;
      else ai = (ai + 1) % nA; // nabızlı hücrenin üstüne başka rect binmesin
    }
    const a = HUCRE_A[ai];
    const b = HUCRE_B[i];
    const r = rasgele(i * 2654435761 + 97);
    liste.push({
      ax: OFX_A + a.x * ADIM * OLCEK_A,
      ay: OFY_A + a.y * ADIM * OLCEK_A,
      bx: OFX_B + b.x * ADIM,
      by: OFY_B + b.y * ADIM,
      ton: tonSec(r()),
      gecikme: r() * 0.45,
      titrek: r() < 0.09,
    });
  }
  return { liste, yildiz: Math.max(yildiz, 0) };
}

const { liste: HUCRELER, yildiz: ILDIZ } = hucreleriEsle();
const ILDIZ_H = HUCRELER[ILDIZ];
const ILDIZ_AM: Nokta = {
  x: ILDIZ_H.ax + (KUTU * OLCEK_A) / 2,
  y: ILDIZ_H.ay + (KUTU * OLCEK_A) / 2,
};
const ILDIZ_BM: Nokta = { x: ILDIZ_H.bx + KUTU / 2, y: ILDIZ_H.by + KUTU / 2 };

/* uç şeritleri: 4 aktif terminal + 1 ağ dışı (gri) */
const SERITLER: SeritBilgi[] = [
  { x: 16, y: 64, ad: "uç 01" },
  { x: 16, y: 428, ad: "uç 02" },
  { x: GENISLIK - 112, y: 64, ad: "uç 03" },
  { x: GENISLIK - 112, y: 428, ad: "uç 04" },
];
const SERIT_DISI: SeritBilgi = { x: GENISLIK / 2 - 48, y: 494, ad: "ağ dışı" };

/* imleç konumları kare kare (kart kenardan süzülür, D2 K3'te geri itilir) */
const D1_POZLAR: ImlecPoz[] = [
  { x: -180, y: 168, o: 0 },
  { x: ILDIZ_AM.x - 30, y: ILDIZ_AM.y - 28, o: 1 },
  { x: ILDIZ_BM.x - 16, y: ILDIZ_BM.y - 14, o: 1 },
  { x: ILDIZ_BM.x - 16, y: ILDIZ_BM.y - 14, o: 0.55 },
];
const D2_POZLAR: ImlecPoz[] = [
  { x: GENISLIK + 60, y: 430, o: 0 },
  { x: ILDIZ_AM.x + 22, y: ILDIZ_AM.y + 18, o: 1 },
  { x: ILDIZ_BM.x + 156, y: ILDIZ_BM.y + 86, o: 1 },
  { x: ILDIZ_BM.x + 156, y: ILDIZ_BM.y + 86, o: 0.45 },
];

/* kare süreleri: K1 4.2s (giriş nefesi dahil) · toplam ~14s */
const SURELER = [4200, 3400, 3600, 2800];

function Serit({ bilgi, aktif }: { bilgi: SeritBilgi; aktif: boolean }) {
  return (
    <g
      transform={`translate(${bilgi.x} ${bilgi.y})`}
      className="m2h-gecis"
      style={{ opacity: aktif ? 1 : 0.55 }}
    >
      <rect
        width={96}
        height={46}
        rx={6}
        fill="#17181d"
        stroke={aktif ? "rgba(227, 161, 44, 0.55)" : "rgba(255, 255, 255, 0.12)"}
      />
      <rect x={10} y={10} width={58} height={4} rx={2} fill="rgba(255, 255, 255, 0.16)" />
      <rect x={10} y={19} width={42} height={4} rx={2} fill="rgba(255, 255, 255, 0.11)" />
      <rect x={10} y={28} width={50} height={4} rx={2} fill="rgba(255, 255, 255, 0.13)" />
      {/* aynı birimin bu uçtaki hücresi: K4'te amber işaretlenir */}
      <rect
        x={78}
        y={10}
        width={8}
        height={8}
        rx={1.5}
        fill={aktif ? "#e3a12c" : "rgba(255, 255, 255, 0.2)"}
      />
      <text
        x={10}
        y={40.5}
        fontSize={8}
        letterSpacing={1.2}
        fill="rgba(255, 255, 255, 0.42)"
        fontFamily={MONO}
      >
        {bilgi.ad}
      </text>
    </g>
  );
}

function Imlec({
  poz,
  renk,
  ad,
  itildi,
  sinif,
}: {
  poz: ImlecPoz;
  renk: string;
  ad: string;
  itildi: boolean;
  sinif: string;
}) {
  return (
    <g
      className={sinif}
      style={{ transform: `translate(${poz.x}px, ${poz.y}px)`, opacity: poz.o }}
      aria-hidden
    >
      <path d="M0 0 L8 22 L11.4 12.8 L21 9.6 Z" fill={renk} stroke="#121316" strokeWidth={1} />
      <g transform="translate(13 24)">
        <rect width={96} height={22} rx={5} fill="#1c1e24" stroke="rgba(255, 255, 255, 0.16)" />
        <circle cx={11} cy={11} r={3} fill={renk} />
        <text x={20} y={14.5} fontSize={10.5} fill="#d7dbe1" fontFamily={MONO}>
          {ad}
        </text>
        <g className="m2h-gecis" style={{ opacity: itildi ? 1 : 0 }}>
          <rect
            y={27}
            width={96}
            height={20}
            rx={5}
            fill="rgba(209, 90, 78, 0.14)"
            stroke="rgba(209, 90, 78, 0.6)"
          />
          <text x={10} y={40.5} fontSize={9.5} fill="#e08579" fontFamily={MONO}>
            erişim kapalı
          </text>
        </g>
      </g>
    </g>
  );
}

export function HeroDevKelime() {
  const azalt = useAzalt();
  const [kare, setKare] = useState(0);
  const [tur, setTur] = useState(0); // tekrar tetiklendiğinde zamanlayıcıyı sıfırlar

  useEffect(() => {
    if (azalt) return;
    const zamanlayici = setTimeout(() => setKare((k) => (k + 1) % SURELER.length), SURELER[kare]);
    return () => clearTimeout(zamanlayici);
  }, [kare, tur, azalt]);

  const tekrarla = useCallback(() => {
    setKare(1); // K2'den başla
    setTur((t) => t + 1);
  }, []);

  /* hareketi azalt: OPSİYONLANDI son karesi statik durur */
  const kEf = azalt ? 2 : kare;
  const sonKelime = kEf >= 2; // K3 + K4: kelime OPSİYONLANDI dizilimi

  /* nabızlı hücrenin anlık konumu ve ölçeği (K2: 2.5x mercek) */
  let yildizX: number;
  let yildizY: number;
  let yildizOlcek: number;
  if (sonKelime) {
    yildizX = ILDIZ_H.bx;
    yildizY = ILDIZ_H.by;
    yildizOlcek = 1;
  } else if (kEf === 1) {
    yildizOlcek = OLCEK_A * 2.5;
    const kayma = (KUTU * (yildizOlcek - OLCEK_A)) / 2;
    yildizX = ILDIZ_H.ax - kayma;
    yildizY = ILDIZ_H.ay - kayma;
  } else {
    yildizX = ILDIZ_H.ax;
    yildizY = ILDIZ_H.ay;
    yildizOlcek = OLCEK_A;
  }
  const yildizMerkez: Nokta = {
    x: yildizX + (KUTU * yildizOlcek) / 2,
    y: yildizY + (KUTU * yildizOlcek) / 2,
  };

  return (
    <div>
      <h1 className="sr-only">
        ProjePazar: canlı konut stoğu dağıtım ağı. Bir daire opsiyonlandığında bütün ağ aynı anda
        görür.
      </h1>

      <p className="m2-etiket text-[var(--m2-teal)]">Gayrimenkul projelerinin canlı satış ağı</p>

      {/* yayın başlığı */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-y border-[var(--m2-cizgi-soft)] py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--m2-ink-soft)]">
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-green nabiz" aria-hidden />
          dev kelime sahnesi · birim B-4-2
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded border border-[var(--m2-cizgi)] px-2 py-0.5 text-[9px]">
            örnek veri
          </span>
          {azalt ? null : (
            <button
              type="button"
              onClick={tekrarla}
              className="min-h-[28px] rounded border border-[var(--m2-cizgi)] px-2.5 text-[9px] uppercase tracking-[0.16em] transition-colors hover:border-[var(--m2-teal)] hover:text-[var(--m2-teal)]"
            >
              tekrar
            </button>
          )}
        </span>
      </div>

      {/* tek SVG hücre sahnesi */}
      <svg
        viewBox={`0 0 ${GENISLIK} ${YUKSEKLIK}`}
        className="m2h-sahne mt-2"
        role="img"
        aria-labelledby="m2h-sahne-baslik"
      >
        <title id="m2h-sahne-baslik">
          Hücrelerden örülü MÜSAİT kelimesi, iki danışman imleci aynı daireye yönelince
          OPSİYONLANDI dizilimine akar; ikinci imleç kırmızı kilitle geri itilir ve güncel durum
          ağdaki tüm uçlara yayılır. Örnek veri.
        </title>

        {/* K4: kelimeden uç şeritlerine ışık akışı */}
        {SERITLER.map((s) => (
          <line
            key={s.ad}
            x1={ILDIZ_BM.x}
            y1={ILDIZ_BM.y}
            x2={s.x < GENISLIK / 2 ? s.x + 96 : s.x}
            y2={s.y + 23}
            stroke="#e3a12c"
            strokeWidth={1.4}
            className="m2h-akis"
            style={{ opacity: kEf === 3 ? 0.75 : 0 }}
          />
        ))}

        {SERITLER.map((s) => (
          <Serit key={s.ad} bilgi={s} aktif={kEf === 3} />
        ))}
        <Serit bilgi={SERIT_DISI} aktif={false} />

        {/* hücre dokusu: MÜSAİT <-> OPSİYONLANDI arası taşınan rect'ler */}
        {HUCRELER.map((h, i) => {
          if (i === ILDIZ) return null;
          return (
            <rect
              key={i}
              className={`m2h-hucre${h.titrek ? " m2h-titre" : ""}`}
              width={KUTU}
              height={KUTU}
              rx={1.2}
              fill={sonKelime ? AMBER_TON[h.ton] : YESIL_TON[h.ton]}
              style={{
                transform: sonKelime
                  ? `translate(${h.bx}px, ${h.by}px) scale(1)`
                  : `translate(${h.ax}px, ${h.ay}px) scale(${OLCEK_A})`,
                transitionDelay: `${h.gecikme}s`,
                animationDelay: h.titrek ? `${h.gecikme * 5}s` : undefined,
              }}
            />
          );
        })}

        {/* nabızlı hücre: dokunma K2'den başlatır */}
        <g
          onClick={azalt ? undefined : tekrarla}
          style={azalt ? undefined : { cursor: "pointer" }}
          aria-hidden
        >
          <circle cx={yildizMerkez.x} cy={yildizMerkez.y} r={34} fill="transparent" />
          {kEf === 0 ? (
            <circle
              cx={yildizMerkez.x}
              cy={yildizMerkez.y}
              r={14}
              fill="none"
              stroke="#5ee39a"
              strokeWidth={1.5}
              className="m2h-halka"
            />
          ) : null}
          <rect
            className={`m2h-hucre${kEf === 0 ? " m2h-nabiz" : ""}`}
            width={KUTU}
            height={KUTU}
            rx={1.2}
            fill={sonKelime ? "#f2b83d" : "#5ee39a"}
            style={{ transform: `translate(${yildizX}px, ${yildizY}px) scale(${yildizOlcek})` }}
          />
        </g>

        {/* K2: mercek çerçevesi + birim kimliği */}
        <circle
          cx={yildizMerkez.x}
          cy={yildizMerkez.y}
          r={24}
          fill="none"
          stroke="rgba(94, 227, 154, 0.5)"
          strokeWidth={1}
          className="m2h-gecis"
          style={{ opacity: kEf === 1 ? 1 : 0 }}
          aria-hidden
        />
        <text
          className="m2h-gecis"
          style={{ opacity: kEf === 1 ? 1 : 0 }}
          x={ILDIZ_AM.x + 38}
          y={ILDIZ_AM.y - 26}
          fontSize={17}
          fontFamily={MONO}
          fill="#d9f5e6"
          stroke="#121316"
          strokeWidth={4}
          paintOrder="stroke"
          aria-hidden
        >
          B-4-2 · ₺9,4M
        </text>

        {/* K3: kırmızı kilit halkası */}
        <g className="m2h-gecis" style={{ opacity: kEf === 2 ? 1 : 0 }} aria-hidden>
          <circle cx={ILDIZ_BM.x} cy={ILDIZ_BM.y} r={15} fill="none" stroke="#d15a4e" strokeWidth={2} />
          {kEf === 2 ? (
            <circle
              cx={ILDIZ_BM.x}
              cy={ILDIZ_BM.y}
              r={15}
              fill="none"
              stroke="#d15a4e"
              strokeWidth={1.5}
              className="m2h-halka"
            />
          ) : null}
        </g>

        {/* imleç-kartlar */}
        <Imlec poz={D1_POZLAR[kEf]} renk="#3cc7b2" ad="D1 · danışman" itildi={false} sinif="m2h-imlec" />
        <Imlec
          poz={D2_POZLAR[kEf]}
          renk="#8b93a0"
          ad="D2 · danışman"
          itildi={kEf >= 2}
          sinif={kEf >= 2 ? "m2h-itilmis" : "m2h-imlec"}
        />
      </svg>

      {/* mikro satır + ağ durumu */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-[var(--m2-cizgi-soft)] pt-4">
        <p className="text-[14px] leading-relaxed text-[var(--m2-ink-soft)] sm:text-[15.5px]">
          Bir daire satıldığında, bütün ağ aynı anda görür.
        </p>
        <p
          className="m2h-gecis flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--m2-green)]"
          style={{ opacity: kEf === 3 ? 1 : 0 }}
          aria-hidden={kEf !== 3}
        >
          <span className="size-1.5 rounded-full bg-green" aria-hidden />
          ağ güncel · şimdi
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/kayit?rol=uretici" className="m2-btn m2-btn-dolu m2-btn-kucuk">
          Projemi canlı ağa aç
        </Link>
        <Link href="/kayit?rol=emlakci" className="m2-btn m2-btn-cizgi m2-btn-kucuk">
          Danışman olarak katıl
        </Link>
      </div>
    </div>
  );
}
