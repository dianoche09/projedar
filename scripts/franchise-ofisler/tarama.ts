/**
 * Franchise emlak ofisi taraması — runner.
 *
 * Çalıştır:  npx tsx scripts/franchise-ofisler/tarama.ts
 * Tek marka: npx tsx scripts/franchise-ofisler/tarama.ts --marka=remax
 *
 * Çıktı: scripts/franchise-ofisler/cikti/ altında CSV + XLSX (Ofisler / Marka Özeti / İl Özeti).
 * Yalnız işletme düzeyi kamuya açık veri toplanır — gerekçe ve sınırlar için README.md.
 */
import fs from "node:fs";
import path from "node:path";
import type { FranchiseOfis, MarkaAdapter } from "./types.ts";
import { csvYaz, kapsamBelirle } from "./yardimcilar.ts";
import { remaxAdapter } from "./adapters/remax.ts";
import { altinEmlakAdapter } from "./adapters/altinemlak.ts";
import { turyapAdapter } from "./adapters/turyap.ts";
import { realtyWorldAdapter } from "./adapters/realtyworld.ts";
import { century21Adapter, coldwellBankerAdapter } from "./adapters/masterturk.ts";

const ADAPTERLER: MarkaAdapter[] = [
  remaxAdapter, altinEmlakAdapter, turyapAdapter, realtyWorldAdapter,
  century21Adapter, coldwellBankerAdapter,
];

const CIKTI = path.join("scripts", "franchise-ofisler", "cikti");

const KOLONLAR: (keyof FranchiseOfis)[] = [
  "marka", "subeAdi", "isletmeAdi", "kapsam", "il", "ilce", "mahalle", "hamBolge",
  "telefon1", "telefon2", "whatsapp", "eposta", "ofisSayfasi",
  "danismanSayisi", "ofisYasiYil", "enlem", "boylam",
  "kaynak", "cekilmeTarihi",
];

type MarkaOzet = {
  marka: string; toplamOfis: number; turkiyeOfis: number; yurtDisiOfis: number;
  il: number; danisman: number | string; telefonlu: number; epostali: number;
};
type IlOzet = { il: string; ofis: number; danisman: number | string; markalar: string };

function markaOzeti(kayitlar: FranchiseOfis[]): MarkaOzet[] {
  const markalar = [...new Set(kayitlar.map((k) => k.marka))].sort();
  return markalar.map((marka) => {
    const g = kayitlar.filter((k) => k.marka === marka);
    const tr = g.filter((k) => k.kapsam === "Türkiye");
    const bilinen = g.filter((k) => k.danismanSayisi !== null);
    return {
      marka,
      toplamOfis: g.length,
      turkiyeOfis: tr.length,
      yurtDisiOfis: g.filter((k) => k.kapsam === "Yurt dışı").length,
      il: new Set(tr.map((k) => k.il)).size,
      danisman: bilinen.length ? bilinen.reduce((t, k) => t + (k.danismanSayisi ?? 0), 0) : "Doğrulanamadı",
      telefonlu: g.filter((k) => k.telefon1).length,
      epostali: g.filter((k) => k.eposta).length,
    };
  });
}

/** Yalnız Türkiye içi kayıtlar — yurt dışı şubeler il istatistiğini bozmasın. */
function ilOzeti(tumKayitlar: FranchiseOfis[]): IlOzet[] {
  const kayitlar = tumKayitlar.filter((k) => k.kapsam === "Türkiye");
  const iller = [...new Set(kayitlar.map((k) => k.il))];
  return iller
    .map((il) => {
      const g = kayitlar.filter((k) => k.il === il);
      const bilinen = g.filter((k) => k.danismanSayisi !== null);
      return {
        il,
        ofis: g.length,
        danisman: bilinen.length ? bilinen.reduce((t, k) => t + (k.danismanSayisi ?? 0), 0) : "Doğrulanamadı",
        markalar: [...new Set(g.map((k) => k.marka))].sort().join(", "),
      };
    })
    .sort((a, b) => b.ofis - a.ofis);
}

/** Aynı fiziksel şubeyi iki kez yazmamak için: marka + ofis sayfası, yoksa marka + şube + ilçe. */
function tekillestir(kayitlar: FranchiseOfis[]): FranchiseOfis[] {
  const gorulen = new Map<string, FranchiseOfis>();
  for (const k of kayitlar) {
    const anahtar = k.ofisSayfasi
      ? `${k.marka}|${k.ofisSayfasi}`
      : `${k.marka}|${k.subeAdi.toLocaleLowerCase("tr-TR")}|${k.ilce.toLocaleLowerCase("tr-TR")}`;
    if (!gorulen.has(anahtar)) gorulen.set(anahtar, k);
  }
  return [...gorulen.values()];
}

async function xlsxYaz(dosya: string, sayfalar: { ad: string; satirlar: Record<string, unknown>[] }[]): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sayfalar) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(s.satirlar), s.ad);
  }
  XLSX.writeFile(wb, dosya);
}

async function main(): Promise<void> {
  const filtre = process.argv.find((a) => a.startsWith("--marka="))?.split("=")[1]?.toLowerCase();
  const secili = filtre
    ? ADAPTERLER.filter((a) => a.marka.toLowerCase().replace(/[^a-z]/g, "").includes(filtre.replace(/[^a-z]/g, "")))
    : ADAPTERLER;

  if (secili.length === 0) {
    console.error(`Eşleşen marka yok: "${filtre}". Mevcut: ${ADAPTERLER.map((a) => a.marka).join(", ")}`);
    process.exit(2);
  }

  const tumu: FranchiseOfis[] = [];
  const hatalar: string[] = [];

  for (const adapter of secili) {
    console.error(`\n▸ ${adapter.marka} — ${adapter.kaynakUrl}`);
    try {
      const kayitlar = await adapter.cek();
      tumu.push(...kayitlar);
      console.error(`  ✓ ${kayitlar.length} ofis`);
    } catch (err) {
      const mesaj = `${adapter.marka}: ${err instanceof Error ? err.message : String(err)}`;
      hatalar.push(mesaj);
      console.error(`  ✗ ${mesaj}`);
    }
  }

  const kayitlar = tekillestir(tumu)
    .map((k) => ({ ...k, kapsam: kapsamBelirle(k.il) }))
    .sort((a, b) => a.marka.localeCompare(b.marka, "tr") || a.il.localeCompare(b.il, "tr") || a.ilce.localeCompare(b.ilce, "tr"));

  if (kayitlar.length === 0) {
    console.error("\nHiç kayıt toplanamadı — çıktı yazılmadı.");
    process.exit(1);
  }

  fs.mkdirSync(CIKTI, { recursive: true });
  const marka = markaOzeti(kayitlar);
  const il = ilOzeti(kayitlar);

  fs.writeFileSync(path.join(CIKTI, "franchise-ofisler.csv"), csvYaz(kayitlar, KOLONLAR), "utf8");
  await xlsxYaz(path.join(CIKTI, "franchise-ofisler.xlsx"), [
    { ad: "Ofisler", satirlar: kayitlar as unknown as Record<string, unknown>[] },
    { ad: "Marka Ozeti", satirlar: marka as unknown as Record<string, unknown>[] },
    { ad: "Il Ozeti", satirlar: il as unknown as Record<string, unknown>[] },
  ]);

  const trSayi = kayitlar.filter((k) => k.kapsam === "Türkiye").length;
  const yurtDisi = kayitlar.filter((k) => k.kapsam === "Yurt dışı").length;
  const belirsiz = kayitlar.filter((k) => k.kapsam === "Doğrulanamadı").length;

  console.error(`\n═══ ÖZET ═══`);
  console.error(`Toplam kayıt: ${kayitlar.length}  |  Türkiye: ${trSayi}, yurt dışı: ${yurtDisi}, il doğrulanamadı: ${belirsiz}`);
  console.error(`Kapsanan il: ${il.length}/81  |  marka: ${marka.length}`);
  for (const m of marka) {
    console.error(`  ${m.marka}: ${m.turkiyeOfis} TR ofis (+${m.yurtDisiOfis} yurt dışı), ${m.il} il, ${m.danisman} danışman, telefon ${m.telefonlu}, e-posta ${m.epostali}`);
  }
  console.error(`\nEn yoğun 10 il:`);
  for (const r of il.slice(0, 10)) console.error(`  ${r.il}: ${r.ofis} ofis, ${r.danisman} danışman`);
  if (hatalar.length) console.error(`\nBaşarısız marka(lar): ${hatalar.join(" | ")}`);
  console.error(`\nÇıktı: ${CIKTI}/franchise-ofisler.{csv,xlsx}`);
}

main().catch((err) => {
  console.error("Tarama hatası:", err);
  process.exit(1);
});
