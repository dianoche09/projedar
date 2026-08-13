/**
 * Franchise emlak ofisi tarama — ortak kayıt şeması.
 *
 * KAPSAM KARARI (2026-08-13): yalnız TÜZEL KİŞİ / işletme düzeyi veri toplanır.
 * Gerçek kişi danışman adı / cep telefonu / kişisel e-posta TOPLANMAZ (KVKK).
 * Danışman bilgisi yalnız AGREGE sayı olarak tutulur (danismanSayisi).
 */

/** Tek bir franchise şubesinin kaydı. Bulunamayan alan boş string / null. */
export type FranchiseOfis = {
  /** Üst marka, ör. "RE/MAX" */
  marka: string;
  /** Şube adı, ör. "Ahenk" */
  subeAdi: string;
  /** Markanın kendi kayıtlarındaki tam işletme adı */
  isletmeAdi: string;
  il: string;
  ilce: string;
  mahalle: string;
  /** Markanın bildirdiği ham bölge adı (ör. "İstanbul Avrupa") — normalize öncesi iz */
  hamBolge: string;
  /** E.164 formatına normalize edilmiş kurumsal telefon */
  telefon1: string;
  telefon2: string;
  /** Kurumsal e-posta (info@/bilgi@ gibi). Kişisel adres toplanmaz. */
  eposta: string;
  /** Ofisin kendi sitesinde yayımladığı WhatsApp hattı. Yoksa boş. */
  whatsapp: string;
  /** Markanın sitesindeki ofis detay sayfası — her satırın doğrulanabilir kaynağı */
  ofisSayfasi: string;
  /** Ofisteki danışman sayısı, markanın kendi kaydından. Bilinmiyorsa null. */
  danismanSayisi: number | null;
  /** Ofisin ağdaki yaşı (yıl). Bilinmiyorsa null. */
  ofisYasiYil: number | null;
  enlem: number | null;
  boylam: number | null;
  /** Verinin çekildiği kaynak URL */
  kaynak: string;
  /** ISO tarih — ilan/danışman sayıları değişken olduğu için zorunlu */
  cekilmeTarihi: string;
  /** Kayıt Türkiye içi mi? Runner tarafından il alanından türetilir. */
  kapsam?: Kapsam;
};

/** Türkiye içi / yurt dışı ayrımı. Belirsizde "Doğrulanamadı" — tahmin edilmez. */
export type Kapsam = "Türkiye" | "Yurt dışı" | "Doğrulanamadı";

/** Bir markanın ofis listesini döndüren adapter. */
export type MarkaAdapter = {
  marka: string;
  /** Ofis listesinin yayımlandığı kök URL (README ve kaynak izi için) */
  kaynakUrl: string;
  cek: () => Promise<FranchiseOfis[]>;
};
