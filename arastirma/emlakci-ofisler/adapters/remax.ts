/**
 * RE/MAX Türkiye adapter — remax.com.tr/tr/ofisler
 *
 * Sayfa Next.js App Router; ofis listesi RSC flight payload'ında (self.__next_f) tam obje olarak gelir.
 * robots.txt: User-agent: * → Allow: / (2026-08-13 doğrulandı). Kişisel veri çekilmez; danışman
 * sayısı yalnız agrege (employeeCount) olarak alınır.
 */
import type { FranchiseOfis, MarkaAdapter } from "../types.ts";
import { bekle, html, normalizeEposta, normalizeIl, normalizeTelefon, temizAd } from "../yardimcilar.ts";

const KOK = "https://www.remax.com.tr";
const LISTE = `${KOK}/tr/ofisler`;
const MAX_SAYFA = 40;

/** RE/MAX ofis objesinin payload'daki ham hâli. */
type HamOfis = {
  id: number;
  officeName?: string;
  urlName?: string;
  cityName?: string;
  townName?: string;
  neighborhoodName?: string;
  phoneNo1?: string;
  phoneNo2?: string;
  email?: string;
  employeeCount?: number;
  age?: number;
  lat?: number;
  lon?: number;
};

/** self.__next_f chunk'larını tek bir metne birleştirir. */
function rscPayload(sayfa: string): string {
  const chunks = sayfa.match(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\[\s\S])*")\]\)/g) ?? [];
  let buf = "";
  for (const c of chunks) {
    const m = c.match(/\[1,("(?:[^"\\]|\\[\s\S])*")\]/);
    if (!m) continue;
    try {
      buf += JSON.parse(m[1]) as string;
    } catch {
      // Bozuk chunk atlanır; kalanı yine de işlenir.
    }
  }
  return buf;
}

/** `baslangic` indeksindeki `{` karakterinden dengeli JSON objesini keser (string-aware). */
function objeKes(metin: string, baslangic: number): string | null {
  let derinlik = 0;
  let stringIci = false;
  let kacis = false;
  for (let i = baslangic; i < metin.length; i++) {
    const ch = metin[i];
    if (kacis) { kacis = false; continue; }
    if (ch === "\\") { kacis = true; continue; }
    if (ch === '"') { stringIci = !stringIci; continue; }
    if (stringIci) continue;
    if (ch === "{") derinlik++;
    else if (ch === "}") {
      derinlik--;
      if (derinlik === 0) return metin.slice(baslangic, i + 1);
    }
  }
  return null;
}

/** Payload içindeki tüm ofis objelerini çıkarır. */
function ofisleriAyikla(payload: string): HamOfis[] {
  const bulunan: HamOfis[] = [];
  const isaret = '"officeName":';
  let i = payload.indexOf(isaret);
  while (i !== -1) {
    // officeName'den geriye doğru objenin açılış parantezini bul.
    const ac = payload.lastIndexOf("{", i);
    if (ac !== -1) {
      const ham = objeKes(payload, ac);
      if (ham) {
        try {
          const o = JSON.parse(ham) as HamOfis;
          if (typeof o.id === "number" && o.urlName) bulunan.push(o);
        } catch {
          // Parse edilemeyen parça atlanır; sayım sonunda uyarı verilir.
        }
      }
    }
    i = payload.indexOf(isaret, i + isaret.length);
  }
  return bulunan;
}

function kayda(o: HamOfis, kaynak: string, tarih: string): FranchiseOfis {
  const hamBolge = temizAd(o.cityName);
  const sube = temizAd(o.officeName);
  return {
    marka: "RE/MAX",
    subeAdi: sube,
    isletmeAdi: sube ? `RE/MAX ${sube}` : "",
    il: normalizeIl(hamBolge),
    ilce: temizAd(o.townName),
    mahalle: temizAd(o.neighborhoodName),
    hamBolge,
    telefon1: normalizeTelefon(o.phoneNo1),
    telefon2: normalizeTelefon(o.phoneNo2),
    eposta: normalizeEposta(o.email),
    whatsapp: "",
    ofisSayfasi: o.urlName ? `${KOK}/tr/ofis/detay/${o.urlName}` : "",
    danismanSayisi: typeof o.employeeCount === "number" ? o.employeeCount : null,
    ofisYasiYil: typeof o.age === "number" ? o.age : null,
    enlem: typeof o.lat === "number" ? o.lat : null,
    boylam: typeof o.lon === "number" ? o.lon : null,
    kaynak,
    cekilmeTarihi: tarih,
  };
}

async function cek(): Promise<FranchiseOfis[]> {
  const tarih = new Date().toISOString().slice(0, 10);
  const gorulen = new Map<number, FranchiseOfis>();

  for (let sayfa = 1; sayfa <= MAX_SAYFA; sayfa++) {
    const url = `${LISTE}?page=${sayfa}`;
    const icerik = await html(url);
    const hamlar = ofisleriAyikla(rscPayload(icerik));
    if (hamlar.length === 0) {
      console.error(`  RE/MAX sayfa ${sayfa}: ofis yok, tarama bitti.`);
      break;
    }
    let yeni = 0;
    for (const o of hamlar) {
      if (gorulen.has(o.id)) continue;
      gorulen.set(o.id, kayda(o, url, tarih));
      yeni++;
    }
    console.error(`  RE/MAX sayfa ${sayfa}: ${hamlar.length} obje, ${yeni} yeni (toplam ${gorulen.size})`);
    // Yeni kayıt gelmiyorsa sayfalama tükenmiştir.
    if (yeni === 0) break;
    await bekle(700);
  }

  return [...gorulen.values()];
}

export const remaxAdapter: MarkaAdapter = {
  marka: "RE/MAX",
  kaynakUrl: LISTE,
  cek,
};
