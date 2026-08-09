/**
 * Sektörel içerik katmanı — tip modeli.
 *
 * Projedar'ın public bilgilendirme yüzeyi (/rehber, /araclar, /sozluk,
 * /karsilastirma, /sablonlar). Kapalı-devre B2B ağdan (stok/tahsis/panel)
 * KAVRAMSAL olarak ayrıktır: bu katman yalnız açık, indexlenebilir içeriktir.
 *
 * Tüm meta merkezîdir (registry). Sitemap, internal linking, schema ve CTA
 * bu modelden otomatik türetilir; sayfa component'ine gömülmez.
 */

/** URL üst dizini (Türkçe, slug'larda TR karakter yok). */
export type IcerikKategori = "rehber" | "araclar" | "sozluk" | "karsilastirma" | "sablonlar";

/** İçeriğin biçimsel tipi (aynı kategoride farklı tipler olabilir). */
export type IcerikTipi =
  | "rehber"
  | "how-to"
  | "hesaplayici"
  | "sozluk"
  | "karsilastirma"
  | "sablon";

/** CTA yoğunluğu — sayfa niyetine göre (geniş B2C → light, ürün-lane → strong). */
export type CtaSeviye = "light" | "medium" | "strong";

/** Kaynak önceliği: resmi kamu kaynağı > ikincil (haber/destek). */
export type KaynakTuru = "resmi" | "ikincil";

/**
 * Resmî/otorite kaynak kaydı. İçerikler `sources` içinde id ile referans verir;
 * böylece her mevzuat iddiasının hangi kaynağa dayandığı veri modelinde görünür
 * (dekoratif footer değil).
 */
export type Kaynak = {
  id: string;
  baslik: string;
  kurum: string; // "Ticaret Bakanlığı" · "e-Devlet" · "Resmî Gazete" · ...
  url: string;
  tur: KaynakTuru;
  oncelik: number; // 1 = en yüksek (Ticaret Bakanlığı). Görünür sıralama.
};

/**
 * İçerikler-arası ilişkiler (silo). Hard-code href yerine slug referansı;
 * çözümleme registry üzerinden yapılır. Yayınlanmamış hedefler kullanıcıya
 * link olarak GÖSTERİLMEZ (404 üretme kuralı).
 */
export type IcerikIliskiler = {
  hub?: string | null; // üst/kapsayıcı içerik (kategori/slug)
  siblings?: string[]; // aynı kümedeki kardeş içerikler
  tools?: string[]; // ilgili araçlar
  glossary?: string[]; // ilgili sözlük terimleri
};

/**
 * Tek içerik kaydı. "İleride ek alan" gerekirse buraya eklenir; sayfalar bu
 * sözleşmeye uyar.
 *
 * Tarih ayrımı (önemli): `updatedAt` = içerik metni değişti; `sourceCheckedAt`
 * = kaynak/mevzuat yeniden doğrulandı (metin değişmese de tazelenebilir).
 */
export type IcerikMeta = {
  slug: string; // kategori-içi slug (TR karaktersiz)
  kategori: IcerikKategori;
  contentType: IcerikTipi;

  title: string; // <title> ve H1 kaynağı (H1 ayrı olabilir; bkz. h1)
  h1?: string; // görünen başlık title'dan farklıysa
  description: string; // meta description (120-160)

  publishedAt: string; // ISO — ilk yayın
  updatedAt: string; // ISO — içerik güncellemesi
  sourceCheckedAt: string; // ISO — kaynak doğrulama tarihi (kural: ayrı kavram)

  author: string; // gerçek yazar yoksa kurumsal attribution
  reviewer?: string | null; // YALNIZ gerçek inceleyen varsa (sahte kimlik yok)

  sources: string[]; // Kaynak.id listesi (öncelik sırasına göre çözülür)
  iliskiler: IcerikIliskiler;
  ctaLevel: CtaSeviye;

  heroGorsel?: string; // sayfa başı editoryal görsel (public path)
  heroAlt?: string; // hero görsel alt metni (erişilebilirlik)

  canonical: string; // tam URL (self-referencing)
  index: boolean; // robots index/follow
  published: boolean; // yayında mı (linkleme + sitemap koşulu)
};

/** Kategori → görünen etiket (breadcrumb / listeleme). */
export const KATEGORI_ETIKET: Record<IcerikKategori, string> = {
  rehber: "Rehber",
  araclar: "Araçlar",
  sozluk: "Sözlük",
  karsilastirma: "Karşılaştırma",
  sablonlar: "Şablonlar",
};
