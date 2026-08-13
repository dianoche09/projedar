/**
 * MasterTürk grubu adapter — Century 21 Türkiye ve Coldwell Banker Türkiye.
 *
 * İki marka aynı platformu kullanıyor (robots.txt ve şablonlar birebir aynı), tek adapter yeterli.
 * Liste: /tr-TR/Offices/Search?SearchCity=0&pager_p=N — sayfa başına 12 ofis kartı.
 *
 * robots.txt (2026-08-13 doğrulandı): /*?officeid=*, /*?sorting=*, /*?selectedcounties=* ve
 * hesap sayfaları Disallow. Kullanılan SearchCity/pager_p parametreleri yasaklı listede DEĞİL;
 * yasaklı parametreli hiçbir URL çağrılmaz.
 */
import type { FranchiseOfis, MarkaAdapter } from "../types.ts";
import { bekle, html, normalizeIl, normalizeTelefon, temizAd } from "../yardimcilar.ts";

const MAX_SAYFA = 60;
/** Kararsız sayfalama nedeniyle listenin yeniden dolaşılma üst sınırı. */
const MAX_GECIS = 6;

function varlikCoz(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function metin(s: string): string {
  return temizAd(varlikCoz(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " "));
}

function kartaAyristir(blok: string, marka: string, kok: string, kaynak: string, tarih: string): FranchiseOfis | null {
  const bag = blok.match(/<a href="(\/ofisler\/[a-z0-9-]+)"[^>]*>\s*([^<]+?)\s*<\/a>/i);
  if (!bag) return null;
  const yol = bag[1];
  const isletmeAdi = metin(bag[2]);
  if (!isletmeAdi) return null;

  // "İstanbul-Anadolu / Üsküdar / Acıbadem" üçlüsü
  const konum = blok.match(
    /<span[^>]*>([^<]+)<\/span>\s*\/\s*<span[^>]*>([^<]+)<\/span>\s*\/\s*<span[^>]*>([^<]+)<\/span>/,
  );
  const hamBolge = konum ? metin(konum[1]) : "";
  const ilce = konum ? metin(konum[2]) : "";
  const mahalle = konum ? metin(konum[3]) : "";

  const tel = blok.match(/href="tel:([^"]+)"/i)?.[1] ?? "";
  const wa = blok.match(/whatsapp\.com\/send\?phone=(\d+)/i)?.[1] ?? "";
  const acikAdres = metin(blok.match(/<p class="mt-4">([\s\S]*?)<\/p>/i)?.[1] ?? "");

  // "COLDWELL BANKER REAL" / "CENTURY 21 ADK" → şube adı marka ön ekinden arındırılır.
  const sube = isletmeAdi.replace(new RegExp(`^${marka.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*`, "i"), "").trim();

  return {
    marka,
    subeAdi: sube || isletmeAdi,
    isletmeAdi,
    il: normalizeIl(hamBolge),
    ilce,
    mahalle: mahalle || acikAdres,
    hamBolge,
    telefon1: normalizeTelefon(tel),
    telefon2: "",
    eposta: "",
    whatsapp: normalizeTelefon(wa),
    ofisSayfasi: `${kok}${yol}`,
    danismanSayisi: null,
    ofisYasiYil: null,
    enlem: null,
    boylam: null,
    kaynak,
    cekilmeTarihi: tarih,
  };
}

/** Arama formundaki il seçeneklerini ve markanın o il için BEYAN ettiği ofis sayısını okur. */
function illeriOku(sayfa: string): { deger: string; ad: string; beyan: number }[] {
  const select = sayfa.match(/id="SearchCity"[^>]*>([\s\S]*?)<\/select>/)?.[1] ?? "";
  const iller: { deger: string; ad: string; beyan: number }[] = [];
  for (const m of select.matchAll(/<option value="(\d+)"[^>]*>([^<]*)<\/option>/g)) {
    const etiket = varlikCoz(m[2]);
    const sayi = etiket.match(/\((\d+)\s*Ofis\)/);
    if (!sayi) continue; // "Tüm İller" seçeneğinde sayı yok
    iller.push({ deger: m[1], ad: temizAd(etiket.split("(")[0]), beyan: Number(sayi[1]) });
  }
  return iller;
}

/**
 * Tek sayfayı ayrıştırıp haritaya ekler; eklenen yeni kayıt sayısını döndürür.
 * "Tüm İller" sayfalaması bu platformda tutarsız sıralama veriyor (aynı ofis birden çok
 * sayfada, bazıları hiç görünmüyor) → tarama il bazında yapılır.
 */
async function sayfaTopla(
  url: string, marka: string, kok: string, tarih: string, gorulen: Map<string, FranchiseOfis>,
): Promise<{ kart: number; yeni: number }> {
  const icerik = await html(url);
  const bloklar = icerik.split(/<h2 class="title/i).slice(1);
  let yeni = 0;
  for (const blok of bloklar) {
    const kayit = kartaAyristir(blok, marka, kok, url, tarih);
    if (!kayit || gorulen.has(kayit.ofisSayfasi)) continue;
    gorulen.set(kayit.ofisSayfasi, kayit);
    yeni++;
  }
  return { kart: bloklar.length, yeni };
}

function adapterUret(marka: string, kok: string): MarkaAdapter {
  const liste = `${kok}/tr-TR/Offices/Search`;
  return {
    marka,
    kaynakUrl: liste,
    cek: async () => {
      const tarih = new Date().toISOString().slice(0, 10);
      const kok0 = await html(`${liste}?SearchCity=0`);
      const iller = illeriOku(kok0);
      if (iller.length === 0) throw new Error(`${marka}: SearchCity il listesi okunamadı (sayfa yapısı değişmiş olabilir)`);
      const beyanToplam = iller.reduce((t, i) => t + i.beyan, 0);
      console.error(`  ${marka}: ${iller.length} il, site beyanı ${beyanToplam} ofis`);

      // Sunucu sayfalamayı kararlı sıralamayla vermiyor: aynı ofis birden çok sayfada çıkarken
      // bazıları tek geçişte hiç görünmüyor. Beyan sayısına ulaşana kadar sayfalar yeniden dolaşılır.
      const gorulen = new Map<string, FranchiseOfis>();
      for (let gecis = 1; gecis <= MAX_GECIS; gecis++) {
        const oncesi = gorulen.size;
        for (let sayfa = 1; sayfa <= MAX_SAYFA; sayfa++) {
          const url = `${liste}?pager_p=${sayfa}`;
          const { kart } = await sayfaTopla(url, marka, kok, tarih, gorulen);
          if (kart === 0) break;
          await bekle(400);
        }
        const kazanim = gorulen.size - oncesi;
        console.error(`  ${marka} geçiş ${gecis}: +${kazanim} (toplam ${gorulen.size}/${beyanToplam})`);
        if (gorulen.size >= beyanToplam || kazanim === 0) break;
      }

      if (gorulen.size < beyanToplam) {
        console.error(`  ⚠ ${marka}: ${beyanToplam - gorulen.size} ofis kaynaktan alınamadı ` +
          `(tespit ${gorulen.size} / beyan ${beyanToplam}) — eksik kapsam kayda geçti.`);
      } else {
        console.error(`  ${marka}: tespit ${gorulen.size} = beyan ${beyanToplam} ✓`);
      }
      return [...gorulen.values()];
    },
  };
}

export const century21Adapter = adapterUret("CENTURY 21", "https://www.century21.com.tr");
export const coldwellBankerAdapter = adapterUret("COLDWELL BANKER", "https://www.cb.com.tr");
