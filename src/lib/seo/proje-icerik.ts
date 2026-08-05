/**
 * Proje sayfası varyant-havuz motoru (doorway-safe). Kaynak deseni:
 * kolayseo/templates/district-content.ts. Her projeye, adının kararlı hash'inden
 * seçilen benzersiz çevre metni üretir; böylece yüzlerce sayfa aynı şablonla
 * ama farklı metinle çıkar (thin-content cezası önlenir).
 *
 * Havuzlar GENEL-DOĞRU B2B cümleleridir: Projedar'ın kapalı-devre dağıtım
 * mekaniğini anlatır, projeye özel OLGU UYDURMAZ. Spesifik olgular (ad, konum,
 * özellik, daire tipi) yalnız gerçek DB verisinden gelir. Ton B2B: sayfalar
 * son kullanıcıya "satılık daire" sunmaz; danışman ve müteahhide seslenir.
 */
import { slugify } from "./slug";

const stableHash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const GIRIS_VARYANTLARI: string[] = [
  "Projedar bu projeyi bir ilan olarak yayınlamaz; künye ve konum bilgisini yetkili gayrimenkul danışmanları ve müteahhitler için derler.",
  "Bu sayfa daire satın almak isteyen son kullanıcıya değil, projeyi ağda satmak isteyen gayrimenkul danışmanlarına ve projeyi yöneten müteahhide yöneliktir.",
  "Projedar, yeni konut projelerini yetkili danışmanların canlı ve doğru veriyle çalıştığı kapalı bir dağıtım ağında buluşturur.",
  "Bu projenin güncel stok ve fiyat bilgisi yalnız müteahhidin ağa dahil ettiği yetkili danışmanlara açılır; kamuya açık ilan yayını yoktur.",
  "Bir müteahhit projesini Projedar ağına eklediğinde, seçtiği danışmanlar daireleri canlı fiyatla ve çift satış riski olmadan paylaşabilir.",
  "Projedar bir ilan portalı değil, müteahhit kontrollü bir konut stoğu dağıtım ağıdır; bu sayfa projenin ağdaki B2B görünürlüğüdür.",
  "Projeyi tanıyan gayrimenkul danışmanları, Projedar üzerinden müteahhidin tahsis ettiği daireleri tek doğru kaynaktan takip edebilir.",
  "Bu proje için Projedar, fiyatı ve stoğu tek noktada tutan, komisyonsuz ve tahsisli bir satış altyapısı sunar.",
];

const SUREC_VARYANTLARI: string[] = [
  "Bu projeyi müşterilerine sunmak isteyen gayrimenkul danışmanları Projedar ağına katılıp müteahhidin tahsis ettiği daireleri canlı stoktan paylaşabilir. Fiyat her paylaşımda o anki güncel değerden basılır.",
  "Projeyi yöneten müteahhit, hangi danışmanın hangi daireyi hangi fiyatla göreceğini tek panelden belirler; aktif opsiyon veritabanı seviyesinde kilitlendiği için çift satış yapısal olarak engellenir.",
  "Projedar ağında bu projenin stoğu tek doğru kaynakta tutulur: bir daire opsiyonlandığında veya satıldığında ağdaki herkes aynı anda görür, eski fiyat dolaşıma giremez.",
  "Danışman bu projeyi Projedar üzerinden tek dokunuşla paylaşır; komisyondan pay alınmaz, kazancın tamamı danışmanda kalır. Müteahhit ise stoğunu ve dağıtımını tek noktadan yönetir.",
  "Müteahhit projeyi ağa ekledikten sonra tahsisi daire seviyesinde yönetir: tüm proje, tek blok ya da seçili daireler belirlediği danışman ve ofislere açılır.",
  "Bu proje ağa dahil edildiğinde, güncelleme her yazışta zaman damgalanır; danışmanlar müşterisine daima canlı fiyatla çıkar, eski bilgiyle karşılaşma riski ortadan kalkar.",
];

const ETIKET_VARYANTLARI: string[] = [
  "Canlı stok, komisyon yok",
  "Tahsisli satış ağı",
  "Müteahhit kontrollü dağıtım",
  "Tek doğru kaynak",
  "Çift satış kalkanı",
  "Kapalı devre B2B ağ",
  "Yetkili danışman ağı",
  "Doğrulanmış proje verisi",
];

export interface ProjeIcerikBloklari {
  giris: string;
  surec: string;
  etiket: string;
}

/** Adın kararlı hash'inden benzersiz metin blokları seçer; gerçek konumu cümleye işler. */
export function projeIcerikBloklari(input: {
  ad: string;
  il?: string | null;
  ilce?: string | null;
  mahalle?: string | null;
  slug?: string;
}): ProjeIcerikBloklari {
  const anahtar = input.slug ?? slugify(input.ad);
  const h = stableHash(anahtar);
  const girisV = GIRIS_VARYANTLARI[h % GIRIS_VARYANTLARI.length];
  const surecV = SUREC_VARYANTLARI[(h >>> 3) % SUREC_VARYANTLARI.length];
  const etiket = ETIKET_VARYANTLARI[(h >>> 5) % ETIKET_VARYANTLARI.length];

  const konum = [input.mahalle, input.ilce, input.il].filter(Boolean).join(", ");
  const konumCumle = konum
    ? `${input.ad}, ${konum} konumunda yer alan bir konut projesidir.`
    : `${input.ad} bir konut projesidir.`;

  return { giris: `${konumCumle} ${girisV}`, surec: surecV, etiket };
}
