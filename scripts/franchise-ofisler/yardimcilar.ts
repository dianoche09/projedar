/** Franchise ofis tarama — normalizasyon ve çıktı yardımcıları. */

export const TR_ILLER = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya",
  "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik",
  "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum",
  "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale",
  "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa",
  "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye",
  "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak",
] as const;

/** Marka içi bölge adlarının resmî il adına eşlenmesi (RE/MAX "İstanbul Avrupa" gibi). */
const IL_ESLEME: Record<string, string> = {
  "istanbul avrupa": "İstanbul",
  "istanbul anadolu": "İstanbul",
  "kktc": "KKTC",
  "kibris": "KKTC",
  "icel": "Mersin",
  "afyon": "Afyonkarahisar",
  "maras": "Kahramanmaraş",
  "urfa": "Şanlıurfa",
  "antep": "Gaziantep",
};

/** Türkçe karakterleri sadeleştirip küçük harfe indirger (yalnız eşleştirme için). */
export function anahtar(s: string): string {
  return s
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/â/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Markanın bildirdiği bölge adını resmî il adına çevirir.
 * Eşleşme bulunamazsa TAHMİN ETMEZ, ham değeri döndürür (kaynak izi korunur).
 */
export function normalizeIl(ham: string): string {
  const k = anahtar(ham);
  if (!k) return "";
  if (IL_ESLEME[k]) return IL_ESLEME[k];
  const tam = TR_ILLER.find((il) => anahtar(il) === k);
  if (tam) return tam;
  // "İstanbul Avrupa" gibi bileşik adlarda ilk kelime il olabilir.
  const ilk = k.split(" ")[0];
  if (IL_ESLEME[ilk]) return IL_ESLEME[ilk];
  const onEk = TR_ILLER.find((il) => anahtar(il) === ilk);
  return onEk ?? ham.trim();
}

/**
 * Türkiye telefon numarasını E.164'e çevirir (+90XXXXXXXXXX).
 * 444'lü kısa servis numaraları E.164'e çevrilemez; "444 XXXX" olarak korunur.
 * Belirsiz/eksik numarada TAHMİN ETMEZ, boş string döner.
 */
export function normalizeTelefon(ham: string | null | undefined): string {
  if (!ham) return "";
  let d = ham.replace(/\D/g, "");
  // 444'lü kurumsal kısa hat (7 hane). Ofisin gerçek iletişim numarası, atılmaz.
  if (d.length === 7 && d.startsWith("444")) return `444 ${d.slice(3)}`;
  if (d.startsWith("0090")) d = d.slice(4);
  else if (d.startsWith("90") && d.length >= 12) d = d.slice(2);
  else if (d.startsWith("0") && d.length >= 11) d = d.slice(1);
  if (d.length !== 10) return "";
  if (d.startsWith("0")) return "";
  return `+90${d}`;
}

/** Belirsiz bırakılan il değerleri — yurt dışı sayılmaz, "Doğrulanamadı" olur. */
const BELIRSIZ_IL = new Set(["diger", "diger sehirler", "merkez", ""]);

/**
 * İl alanından Türkiye içi / yurt dışı ayrımı türetir.
 * KKTC ayrı devlet olduğu için "Yurt dışı" sayılır; il boş/belirsizse tahmin edilmez.
 */
export function kapsamBelirle(il: string): "Türkiye" | "Yurt dışı" | "Doğrulanamadı" {
  const k = anahtar(il);
  if (BELIRSIZ_IL.has(k)) return "Doğrulanamadı";
  if (TR_ILLER.some((i) => anahtar(i) === k)) return "Türkiye";
  return "Yurt dışı";
}

/** Kurumsal e-posta doğrulaması. Geçersizse boş string. */
export function normalizeEposta(ham: string | null | undefined): string {
  const e = (ham ?? "").trim().toLocaleLowerCase("tr-TR");
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : "";
}

/** Ofis adı başındaki/sonundaki fazlalıkları temizler (RE/MAX " Ahenk" gibi). */
export function temizAd(ham: string | null | undefined): string {
  return (ham ?? "").replace(/\s+/g, " ").trim();
}

/** Tek bir CSV hücresini kaçışlar. */
function csvHucre(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Satır dizisini CSV metnine çevirir. Excel'in UTF-8 tanıması için BOM ekler. */
export function csvYaz<T extends Record<string, unknown>>(satirlar: T[], kolonlar: (keyof T)[]): string {
  const basliklar = kolonlar.map((k) => csvHucre(String(k))).join(",");
  const govde = satirlar.map((r) => kolonlar.map((k) => csvHucre(r[k])).join(",")).join("\n");
  return `﻿${basliklar}\n${govde}\n`;
}

/** Nazik tarama: istekler arası bekleme. */
export function bekle(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Yeniden denemeli HTML çekme. Başarısızsa hata fırlatır (sessiz yutmaz). */
export async function html(url: string, deneme = 3): Promise<string> {
  let sonHata: unknown;
  for (let i = 0; i < deneme; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept-Language": "tr-TR,tr;q=0.9" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
      return await res.text();
    } catch (err) {
      sonHata = err;
      await bekle(1200 * (i + 1));
    }
  }
  throw new Error(`Çekilemedi (${deneme} deneme): ${url} — ${String(sonHata)}`);
}
