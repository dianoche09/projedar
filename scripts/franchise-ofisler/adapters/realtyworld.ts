/**
 * Realty World Türkiye adapter — realtyworld.com.tr/tr/ofisler
 *
 * Ofis listesi POST ile gelir; boş filtre (city/county/office boş) tüm şubeleri döndürür.
 * robots.txt: User-agent: * → Allow: / (2026-08-13 doğrulandı).
 *
 * E-POSTA TOPLANMAZ: adresler Cloudflare e-posta gizlemesiyle korunuyor. Decode etmek
 * sitenin bilinçli koruma tercihini aşmak olur → alan boş bırakılır ("Bulunamadı").
 * İl alanı kartta yayımlanmıyor; adres metninden çıkarılır, çıkarılamazsa boş kalır (tahmin yok).
 */
import type { FranchiseOfis, MarkaAdapter } from "../types.ts";
import { TR_ILLER, anahtar, normalizeIl, normalizeTelefon, temizAd } from "../yardimcilar.ts";

const KOK = "https://www.realtyworld.com.tr";
const LISTE = `${KOK}/tr/ofisler`;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function varlikCoz(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function metin(s: string): string {
  return temizAd(varlikCoz(s.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "));
}

/** Serbest metinde geçen SON il adını döndürür (adreslerde il sona yazılır). Yoksa boş. */
function ildenCikar(serbest: string): string {
  const k = ` ${anahtar(serbest)} `;
  let bulunan = "";
  let enSon = -1;
  for (const il of TR_ILLER) {
    const idx = k.lastIndexOf(` ${anahtar(il)} `);
    if (idx > enSon) { enSon = idx; bulunan = il; }
  }
  return bulunan;
}

/** "Acıbadem Mh. Kadıköy" → { mahalle: "Acıbadem Mh.", ilce: "Kadıköy" } */
function mahalleIlce(h4: string): { mahalle: string; ilce: string } {
  const parca = h4.split(/\s+/);
  if (parca.length < 2) return { mahalle: "", ilce: h4 };
  return { mahalle: parca.slice(0, -1).join(" "), ilce: parca[parca.length - 1] };
}

function kartaAyristir(blok: string, tarih: string): FranchiseOfis | null {
  const ofisSayfasi = blok.match(/<h3><a href="(https?:\/\/[^"]+)"/)?.[1] ?? "";
  const hamAd = metin(blok.match(/<h3><a[^>]*>([\s\S]*?)<\/a><\/h3>/)?.[1] ?? "");
  if (!ofisSayfasi || !hamAd) return null;

  const h4 = metin(blok.match(/<h4>([\s\S]*?)<\/h4>/)?.[1] ?? "");
  const h5 = metin(blok.match(/<h5>([\s\S]*?)<\/h5>/)?.[1] ?? "");
  const acikAdres = metin(blok.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? "").replace(/\s*[\w.-]+\.realtyworld\.com\.tr\s*$/i, "").trim();

  const { mahalle, ilce } = mahalleIlce(h4);
  const hamIl = ildenCikar(`${acikAdres} ${h4}`);
  const tel = h5.match(/(\+?\d[\d\s()-]{9,})/)?.[1] ?? "";
  const sube = hamAd.replace(/^Realty\s*World\s*/i, "").replace(/\s*Gayrimenkul\s*$/i, "").trim();

  return {
    marka: "Realty World",
    subeAdi: sube,
    isletmeAdi: hamAd,
    il: hamIl ? normalizeIl(hamIl) : "",
    ilce,
    mahalle: mahalle || acikAdres,
    hamBolge: h4,
    telefon1: normalizeTelefon(tel),
    telefon2: "",
    eposta: "",
    whatsapp: "",
    ofisSayfasi,
    danismanSayisi: null,
    ofisYasiYil: null,
    enlem: null,
    boylam: null,
    kaynak: LISTE,
    cekilmeTarihi: tarih,
  };
}

async function cek(): Promise<FranchiseOfis[]> {
  const tarih = new Date().toISOString().slice(0, 10);
  const res = await fetch(LISTE, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Language": "tr-TR,tr;q=0.9",
    },
    body: "t=office&city=&county=&office=",
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`Realty World: HTTP ${res.status}`);
  const sayfa = await res.text();

  const bloklar = sayfa.split('class="col-12 officeitem"').slice(1);
  if (bloklar.length === 0) throw new Error("Realty World: ofis kartı bulunamadı (sayfa yapısı değişmiş olabilir)");

  const gorulen = new Map<string, FranchiseOfis>();
  let atlanan = 0;
  for (const blok of bloklar) {
    const kayit = kartaAyristir(blok, tarih);
    if (!kayit) { atlanan++; continue; }
    if (!gorulen.has(kayit.ofisSayfasi)) gorulen.set(kayit.ofisSayfasi, kayit);
  }
  console.error(`  Realty World: ${bloklar.length} kart, ${gorulen.size} ofis (${atlanan} ayrıştırılamadı)`);
  return [...gorulen.values()];
}

export const realtyWorldAdapter: MarkaAdapter = {
  marka: "Realty World",
  kaynakUrl: LISTE,
  cek,
};
