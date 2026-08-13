/**
 * Altın Emlak adapter — altinemlak.com.tr/ofisler
 *
 * Klasik SSR HTML, sayfa başına 12 ofis kartı (`agencies-item`), `?page=N` ile sayfalama.
 * robots.txt: User-agent: * → Allow: / (yalnız /administration/ kapalı) — 2026-08-13 doğrulandı.
 * Danışman sayısı liste kartında yayımlanmıyor → null ("Doğrulanamadı").
 */
import type { FranchiseOfis, MarkaAdapter } from "../types.ts";
import { bekle, html, normalizeEposta, normalizeIl, normalizeTelefon, temizAd } from "../yardimcilar.ts";

const KOK = "https://altinemlak.com.tr";
const LISTE = `${KOK}/ofisler`;
const MAX_SAYFA = 40;

function ilkEslesme(blok: string, desen: RegExp): string {
  return temizAd(blok.match(desen)?.[1] ?? "");
}

/** "Acıbadem, Üsküdar, İstanbul" → { mahalle, ilce, il }. Beklenmeyen biçimde tahmin etmez. */
function konumAyir(ham: string): { mahalle: string; ilce: string; il: string } {
  const parcalar = ham.split(",").map((p) => temizAd(p)).filter(Boolean);
  if (parcalar.length >= 3) {
    return { mahalle: parcalar[0], ilce: parcalar[1], il: parcalar[parcalar.length - 1] };
  }
  if (parcalar.length === 2) return { mahalle: "", ilce: parcalar[0], il: parcalar[1] };
  return { mahalle: "", ilce: "", il: parcalar[0] ?? "" };
}

function kartaAyristir(blok: string, kaynak: string, tarih: string): FranchiseOfis | null {
  const ofisSayfasi = ilkEslesme(blok, /href="(https:\/\/altinemlak\.com\.tr\/[a-z0-9-]+)"\s+class="agency-link"/i);
  const ad = ilkEslesme(blok, /<h6 class="name">\s*<a[^>]*>([^<]+)<\/a>/i);
  if (!ofisSayfasi || !ad) return null;

  const hamKonum = ilkEslesme(blok, /icon-location"><\/i>\s*<\/span><span>([\s\S]*?)<\/span>/i).replace(/\s+/g, " ");
  const { mahalle, ilce, il } = konumAyir(hamKonum);
  const hamTel = ilkEslesme(blok, /icon-phone-3"><\/i><\/span><span>([^<]+)<\/span>/i);
  const hamMail = ilkEslesme(blok, /icon-letter-1"><\/i><\/span><span>([^<]+)<\/span>/i);
  const acikAdres = ilkEslesme(blok, /title="Yol Tarifi Al"[\s\S]*?<span>([^<]+)<\/span>/i);

  return {
    marka: "Altın Emlak",
    subeAdi: ad.replace(/\s*Temsilciliği\s*$/i, "").trim(),
    isletmeAdi: `Altın Emlak ${ad}`,
    il: normalizeIl(il),
    ilce,
    mahalle: mahalle || acikAdres,
    hamBolge: hamKonum,
    telefon1: normalizeTelefon(hamTel),
    telefon2: "",
    eposta: normalizeEposta(hamMail),
    whatsapp: "",
    ofisSayfasi,
    danismanSayisi: null,
    ofisYasiYil: null,
    enlem: null,
    boylam: null,
    kaynak,
    cekilmeTarihi: tarih,
  };
}

async function cek(): Promise<FranchiseOfis[]> {
  const tarih = new Date().toISOString().slice(0, 10);
  const gorulen = new Map<string, FranchiseOfis>();

  for (let sayfa = 1; sayfa <= MAX_SAYFA; sayfa++) {
    const url = `${LISTE}?page=${sayfa}`;
    const icerik = await html(url);
    const bloklar = icerik.split('class="agencies-item').slice(1);
    if (bloklar.length === 0) {
      console.error(`  Altın Emlak sayfa ${sayfa}: kart yok, tarama bitti.`);
      break;
    }
    let yeni = 0;
    for (const blok of bloklar) {
      const kayit = kartaAyristir(blok, url, tarih);
      if (!kayit || gorulen.has(kayit.ofisSayfasi)) continue;
      gorulen.set(kayit.ofisSayfasi, kayit);
      yeni++;
    }
    console.error(`  Altın Emlak sayfa ${sayfa}: ${bloklar.length} kart, ${yeni} yeni (toplam ${gorulen.size})`);
    if (yeni === 0) break;
    await bekle(700);
  }

  return [...gorulen.values()];
}

export const altinEmlakAdapter: MarkaAdapter = {
  marka: "Altın Emlak",
  kaynakUrl: LISTE,
  cek,
};
