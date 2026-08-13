/**
 * Turyap adapter — turyap.com.tr/Ofisler_Harita.aspx
 *
 * Harita sayfası tüm şubeleri tek gizli alanda (`txt_sirketkoordibat`) yayımlar:
 * "lat,lon,BAŞLIK,<popup html>" kayıtları `#` ile ayrılır. Tek istekle tam liste.
 * (Ofisler.aspx sayfa başına 20 kayıt + __doPostBack ile sayfalanır; harita kaynağı hem
 *  daha az istek hem koordinat içerdiği için tercih edildi.)
 * robots.txt: kural yok → tam erişim (2026-08-13 doğrulandı).
 */
import type { FranchiseOfis, MarkaAdapter } from "../types.ts";
import { html, normalizeIl, normalizeTelefon, temizAd } from "../yardimcilar.ts";

const KOK = "https://www.turyap.com.tr";
const HARITA = `${KOK}/Ofisler_Harita.aspx`;

/** &amp; &#231; gibi HTML varlıklarını çözer (Türkçe karakterler korunur). */
function varlikCoz(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function kayda(ham: string, tarih: string): FranchiseOfis | null {
  // "lat,lon,BAŞLIK,<span ...>" — adres alanlarında virgül olabildiği için popup sınırından böl.
  const popupBas = ham.indexOf(",<span");
  if (popupBas === -1) return null;
  const koordVeBaslik = ham.slice(0, popupBas).split(",");
  const popup = ham.slice(popupBas + 1);
  if (koordVeBaslik.length < 3) return null;

  const enlem = Number(koordVeBaslik[0]);
  const boylam = Number(koordVeBaslik[1]);
  const sirketId = popup.match(/sirketid=(\d+)/)?.[1] ?? "";
  const ad = temizAd(popup.match(/<strong>([^<]+)<\/strong>/)?.[1] ?? "");
  if (!ad || !sirketId) return null;

  // <strong> içeren başlık p'si hariç kalan alanlar: adres, "İlçe / Mahalle", "İl", tel1, tel2.
  // Bazı kayıtlarda alanlar eksik olduğu için konuma güvenilmez; her alan içeriğinden tanınır.
  const alanlar = [...popup.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => temizAd(m[1].replace(/<[^>]+>/g, " ")))
    .filter(Boolean);
  const strongMetin = temizAd(ad);
  const govde = alanlar.filter((a) => a !== strongMetin);

  const telefonAlanlari: string[] = [];
  const digerler: string[] = [];
  for (const a of govde) {
    // 10+ rakam ve baskın oranda rakam/ayraç → telefon.
    const rakam = a.replace(/\D/g, "");
    if (rakam.length >= 10 && rakam.length / a.replace(/\s/g, "").length > 0.7) telefonAlanlari.push(a);
    else digerler.push(a);
  }

  const ilceMahalle = digerler.find((a) => a.includes("/")) ?? "";
  const [ilce = "", mahalle = ""] = ilceMahalle.split("/").map((p) => temizAd(p));
  const kalan = digerler.filter((a) => a !== ilceMahalle);
  // İl alanı, ilçe/mahalle satırından SONRA gelen kısa alandır; adres genelde daha uzundur.
  const ilAdayi = kalan.find((a) => normalizeIl(a) !== a) ?? kalan[kalan.length - 1] ?? "";
  const hamIl = ilAdayi;
  const acikAdres = kalan.filter((a) => a !== ilAdayi)[0] ?? "";

  return {
    marka: "Turyap",
    subeAdi: ad.replace(/\s*Temsilciliği\s*$/i, "").trim(),
    isletmeAdi: ad,
    il: normalizeIl(hamIl),
    ilce,
    mahalle: mahalle || acikAdres,
    hamBolge: hamIl,
    telefon1: normalizeTelefon(telefonAlanlari[0]),
    telefon2: normalizeTelefon(telefonAlanlari[1]),
    eposta: "",
    whatsapp: "",
    ofisSayfasi: `${KOK}/Ofis_Bilgileri.aspx?sirketid=${sirketId}`,
    danismanSayisi: null,
    ofisYasiYil: null,
    enlem: Number.isFinite(enlem) ? enlem : null,
    boylam: Number.isFinite(boylam) ? boylam : null,
    kaynak: HARITA,
    cekilmeTarihi: tarih,
  };
}

async function cek(): Promise<FranchiseOfis[]> {
  const tarih = new Date().toISOString().slice(0, 10);
  const sayfa = await html(HARITA);
  const alan = sayfa.match(/txt_sirketkoordibat"[^>]*value="([^"]*)"/)?.[1];
  if (!alan) throw new Error("Turyap: txt_sirketkoordibat alanı bulunamadı (sayfa yapısı değişmiş olabilir)");

  const kayitlar = varlikCoz(alan).split("#");
  const gorulen = new Map<string, FranchiseOfis>();
  let atlanan = 0;
  for (const k of kayitlar) {
    const kayit = kayda(k, tarih);
    if (!kayit) { atlanan++; continue; }
    if (!gorulen.has(kayit.ofisSayfasi)) gorulen.set(kayit.ofisSayfasi, kayit);
  }
  console.error(`  Turyap: ${kayitlar.length} kayıt, ${gorulen.size} ofis (${atlanan} ayrıştırılamadı)`);
  return [...gorulen.values()];
}

export const turyapAdapter: MarkaAdapter = {
  marka: "Turyap",
  kaynakUrl: HARITA,
  cek,
};
