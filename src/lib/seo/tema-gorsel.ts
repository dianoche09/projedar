import { slugify } from "./slug";

/**
 * İl bazlı tematik hero görseli + slot bazlı görsel havuzu.
 * Görseller fal.ai (nano-banana-pro) ile üretilmiş TEMSİLİ atmosfer görselleridir:
 * proje GERÇEK fotoğrafı/render'ı DEĞİL, projenin blok/bina dış cephesini göstermez.
 * Kural (kullanıcı, kilitli): hero = projenin iline göre (genel şehir); iç/amenity/konum/detay
 * = slug-hash ile rotasyon (farklı proje → farklı görsel). Hepsi "Temsili görsel" etiketiyle sunulur.
 * Proje ağa girip geliştirici kendi lisanslı fotoğrafını yüklerse o kullanılır (bu havuz devre dışı kalır).
 */
const HERO_ILLER = new Set(["istanbul", "ankara", "izmir", "bursa", "antalya", "kocaeli", "konya", "adana"]);

export function temaGorsel(il?: string | null): string | null {
  if (il) {
    const k = slugify(il);
    if (HERO_ILLER.has(k)) return `/gorseller/proje/hero-${k}.jpg`;
  }
  return null;
}

/** Deterministik hash (djb2). Aynı slug her zaman aynı görseli seçer (kararlı, resume-güvenli). */
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Havuz slot'ları ve mevcut görsel sayıları (public/gorseller/proje/<slot>-N.jpg). */
const HAVUZ = { ic: 4, amenity: 4, konum: 4, detay: 4 } as const;
export type GorselSlot = keyof typeof HAVUZ;

/** Slug-hash ile havuzdan görsel seç. Slot bazlı offset ile aynı sayfada çeşitlilik sağlanır. */
export function havuzGorsel(slug: string, slot: GorselSlot): string {
  const n = HAVUZ[slot];
  const offset = slot === "amenity" ? 7 : slot === "konum" ? 13 : slot === "detay" ? 19 : 0;
  const idx = ((hash(slug) + offset) % n) + 1;
  return `/gorseller/proje/${slot}-${idx}.jpg`;
}
