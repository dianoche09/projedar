/**
 * Proje öznitelik taksonomisi — sabit, kategorize sözlük.
 * Tek kaynak: üretici formu (checkbox), mikrosite/proje gösterimi, havuz filtresi hepsi buradan beslenir.
 * Serbest metin FİLTRELENEMEZ; bu yüzden sabit vokabüler. Kaynak: sifirkonut paritesi + TR yeni-konut normu.
 */

export const OZELLIK_KATEGORILERI = [
  {
    key: "daire_ici",
    baslik: "Daire İçi",
    secenekler: [
      "Açık mutfak", "Akıllı ev sistemi", "Ankastre set", "Balkon", "Çamaşır odası",
      "Çelik kapı", "Ebeveyn banyosu", "Fiber internet", "Giyinme odası", "Isı yalıtımı",
      "Kiler", "Klima", "Ses yalıtımı", "Teras", "Yerden ısıtma", "Merkezi ısıtma", "Asansör",
    ],
  },
  {
    key: "sosyal",
    baslik: "Sosyal Alanlar",
    secenekler: [
      "Basketbol sahası", "Buhar odası", "Çalışma alanı", "Çocuk oyun alanı", "Futbol sahası",
      "Oyun salonu", "Restoran", "Tenis kortu", "Yürüyüş parkuru", "Yüzme havuzu (Açık)",
      "Yüzme havuzu (Kapalı)", "Çocuk parkı", "Spor salonu", "Sauna", "Sinema", "Kafe",
    ],
  },
  {
    key: "bina",
    baslik: "Bina Özellikleri",
    secenekler: [
      "Apartman görevlisi", "Asansör", "Bahçe", "Engellilere uygun", "Hidrofor",
      "Jeneratör", "Peyzaj alanı", "Resepsiyon", "Su deposu", "Yük asansörü",
    ],
  },
  {
    key: "ulasim",
    baslik: "Ulaşım & Çevre",
    secenekler: [
      "AVM", "Deniz", "Hastane", "Havalimanı", "Marmaray", "Metro",
      "Metrobüs", "Okul", "Tramvay", "Anayola cephe", "Otobüs durağı",
    ],
  },
  {
    key: "guvenlik",
    baslik: "Güvenlik",
    secenekler: [
      "7/24 güvenlik", "Görüntülü diafon", "Kartlı geçiş", "Sığınak",
      "Güvenlik kamerası", "Yangın sistemi",
    ],
  },
  {
    key: "teknik",
    baslik: "Teknik Detay",
    secenekler: [
      "Alüminyum doğrama", "Deprem yönetmeliğine uygun", "Isı cam", "PVC doğrama",
      "Tünel kalıp", "Yalıtım yönetmeliğine uygun", "Zemin etüdü yapılmış",
    ],
  },
  {
    key: "otopark",
    baslik: "Otopark & Depolama",
    secenekler: [
      "Açık otopark", "Elektrikli araç şarj", "Kapalı otopark", "Tahsisli otopark", "Depo alanı",
    ],
  },
  {
    key: "manzara",
    baslik: "Manzara",
    secenekler: ["Deniz manzaralı", "Göl manzaralı", "Orman manzaralı", "Şehir manzarası"],
  },
] as const;

export type OzellikKategoriKey = (typeof OZELLIK_KATEGORILERI)[number]["key"];
export type Ozellikler = Partial<Record<OzellikKategoriKey, string[]>>;

const GECERLI: Record<string, Set<string>> = Object.fromEntries(
  OZELLIK_KATEGORILERI.map((k) => [k.key, new Set<string>(k.secenekler)]),
);

/** Form FormData'sından `ozellik_<key>` çoklu seçimlerini toplayıp taksonomiye göre doğrular. */
export function parseOzellikler(formData: FormData): Ozellikler {
  const cikti: Ozellikler = {};
  for (const { key } of OZELLIK_KATEGORILERI) {
    const secili = formData
      .getAll(`ozellik_${key}`)
      .map((v) => String(v))
      .filter((v) => GECERLI[key].has(v));
    if (secili.length) cikti[key] = secili;
  }
  return cikti;
}

/**
 * kunye'den öznitelikleri okur. Yeni yapı `kunye.ozellikler` (kategori-anahtarlı) önceliklidir;
 * eski serbest-metin alanları (daire_ozellikleri→daire_ici, donati→sosyal, yakin_cevre→ulasim)
 * geri-uyumlu olarak GÖSTERİM/FİLTRE için birleştirilir (data kaybı yok).
 */
export function okuOzellikler(kunye: Record<string, unknown> | null | undefined): Ozellikler {
  const k = kunye ?? {};
  const yapisal = (k.ozellikler ?? {}) as Record<string, unknown>;
  const cikti: Ozellikler = {};
  const ekle = (key: OzellikKategoriKey, liste: unknown) => {
    if (!Array.isArray(liste)) return;
    const mevcut = new Set(cikti[key] ?? []);
    for (const x of liste) if (typeof x === "string" && x.trim()) mevcut.add(x.trim());
    if (mevcut.size) cikti[key] = [...mevcut];
  };
  for (const { key } of OZELLIK_KATEGORILERI) ekle(key, yapisal[key]);
  // eski serbest-metin -> kategori eşlemesi (geri uyum)
  ekle("daire_ici", k.daire_ozellikleri);
  ekle("sosyal", k.donati);
  ekle("ulasim", k.yakin_cevre);
  return cikti;
}

export function ozellikVarMi(o: Ozellikler): boolean {
  return OZELLIK_KATEGORILERI.some((k) => (o[k.key]?.length ?? 0) > 0);
}

/** Tüm seçili öznitelikleri düz bir diziye indirir (havuz filtre eşleştirmesi için). */
export function ozellikDuzList(o: Ozellikler): string[] {
  return OZELLIK_KATEGORILERI.flatMap((k) => o[k.key] ?? []);
}
