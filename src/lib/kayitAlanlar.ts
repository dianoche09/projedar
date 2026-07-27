/**
 * Kayıt wizard'ının role-özel profil adımı (adım 3) alan tanımları.
 * KayitForm bunları render eder; kayitOl bunlardan profil_detay toplar → tek kaynak.
 * KVKK-yalın: doğum tarihi / adli sicil / tüm ortak TCKN YOK. Belge NO alınır (kamu doğrulama),
 * ham belge yalnız emlakçıda kanıt olarak (mevcut /kayit/belge).
 */

export type AlanTip = "text" | "tel" | "number" | "select";
export type Alan = {
  key: string;
  etiket: string;
  tip: AlanTip;
  secenekler?: string[];
  zorunlu?: boolean;
  ipucu?: string;
  yarim?: boolean; // grid'de yarım genişlik
};
export type RolAnahtar = "uretici" | "ofis_yetkili" | "emlakci";

const UZMANLIK = ["Konut", "Ticari", "Karma", "Arsa", "Lüks", "Kentsel dönüşüm", "Yeni proje satışı"];

/** profil_detay'a ek olarak KENDİ profiles kolonuna da yazılacak segmentasyon alanları. */
export const KOLON_ALANLARI = ["il", "ilce", "uzmanlik", "marka"] as const;

export const PROFIL_ALANLARI: Record<RolAnahtar, { adimEtiketi: string; alanlar: Alan[] }> = {
  uretici: {
    adimEtiketi: "Firma & Yetki",
    alanlar: [
      { key: "muteahhit_tipi", etiket: "Müteahhit tipi", tip: "select", secenekler: ["Tüzel kişi (şirket)", "Gerçek kişi"], zorunlu: true, yarim: true },
      { key: "kurulus_yili", etiket: "Kuruluş yılı", tip: "number", yarim: true },
      { key: "firma_unvani", etiket: "Firma unvanı", tip: "text", zorunlu: true },
      { key: "vergi_no", etiket: "Vergi kimlik no (VKN)", tip: "text", zorunlu: true, yarim: true },
      { key: "vergi_dairesi", etiket: "Vergi dairesi", tip: "text", yarim: true },
      { key: "mersis_no", etiket: "MERSİS no", tip: "text", ipucu: "16 hane (tüzel kişi)", yarim: true },
      { key: "ticaret_sicil_no", etiket: "Ticaret sicil no", tip: "text", yarim: true },
      { key: "yetki_belge_no", etiket: "Yapı Müteahhitliği Yetki Belge No", tip: "text", zorunlu: true, ipucu: "YAMBİS / ŞANTİYE-M'den doğrulanır" },
      { key: "belge_grubu", etiket: "Belge grubu", tip: "select", secenekler: ["A", "B", "B1", "C", "C1", "D", "D1", "E", "E1", "F", "F1", "G", "G1", "H", "Geçici"], yarim: true },
      { key: "marka", etiket: "Proje markası", tip: "text", yarim: true },
      { key: "il", etiket: "İl (merkez)", tip: "text", zorunlu: true, yarim: true },
      { key: "ilce", etiket: "İlçe", tip: "text", yarim: true },
      { key: "faaliyet_bolgeleri", etiket: "Faaliyet bölgeleri", tip: "text", ipucu: "İl/ilçe, virgülle ayır" },
      { key: "uzmanlik", etiket: "Uzmanlık", tip: "select", secenekler: UZMANLIK },
    ],
  },
  ofis_yetkili: {
    adimEtiketi: "İşletme & Yetki",
    alanlar: [
      { key: "isletme_tipi", etiket: "İşletme tipi", tip: "select", secenekler: ["Tüzel kişi (şirket)", "Gerçek kişi (esnaf)"], zorunlu: true, yarim: true },
      { key: "kurulus_yili", etiket: "Kuruluş yılı", tip: "number", yarim: true },
      { key: "firma_unvani", etiket: "İşletme adı / unvan", tip: "text", zorunlu: true },
      { key: "vergi_no", etiket: "Vergi kimlik no", tip: "text", zorunlu: true, yarim: true },
      { key: "vergi_dairesi", etiket: "Vergi dairesi", tip: "text", yarim: true },
      { key: "tasinmaz_yetki_belge_no", etiket: "Taşınmaz Ticareti Yetki Belge No", tip: "text", zorunlu: true, ipucu: "TTBS'den doğrulanır" },
      { key: "sorumlu_danisman", etiket: "Sorumlu emlak danışmanı", tip: "text", zorunlu: true, yarim: true },
      { key: "sorumlu_mys_no", etiket: "Sorumlu danışman MYS no (Seviye 5)", tip: "text", yarim: true },
      { key: "danisman_sayisi", etiket: "Danışman sayısı", tip: "number", yarim: true },
      { key: "marka", etiket: "Marka / franchise", tip: "text", ipucu: "Bağımsız ya da ağ markası", yarim: true },
      { key: "il", etiket: "İl", tip: "text", zorunlu: true, yarim: true },
      { key: "ilce", etiket: "İlçe", tip: "text", yarim: true },
      { key: "faaliyet_bolgeleri", etiket: "Faaliyet bölgeleri", tip: "text", ipucu: "İl/ilçe, virgülle ayır" },
      { key: "uzmanlik", etiket: "Uzmanlık", tip: "select", secenekler: UZMANLIK },
    ],
  },
  emlakci: {
    adimEtiketi: "Yetki & Faaliyet",
    alanlar: [
      { key: "tckn", etiket: "T.C. Kimlik No", tip: "text", zorunlu: true, ipucu: "MYS doğrulaması için", yarim: true },
      { key: "deneyim_yili", etiket: "Deneyim (yıl)", tip: "number", yarim: true },
      { key: "mys_belge_no", etiket: "MYS belge no (barkodlu)", tip: "text", zorunlu: true, ipucu: "Emlak Danışmanı, MYK / e-Devlet'ten doğrulanır" },
      { key: "mys_seviye", etiket: "MYS seviye", tip: "select", secenekler: ["Seviye 4", "Seviye 5"], zorunlu: true, yarim: true },
      { key: "bagli_isletme", etiket: "Bağlı emlak ofisi", tip: "text", ipucu: "Çalıştığın yetkili ofis", yarim: true },
      { key: "marka", etiket: "Bağlı marka", tip: "text", yarim: true },
      { key: "il", etiket: "İl", tip: "text", zorunlu: true, yarim: true },
      { key: "ilce", etiket: "İlçe", tip: "text", yarim: true },
      { key: "faaliyet_bolgeleri", etiket: "Faaliyet bölgeleri", tip: "text", ipucu: "İl/ilçe, virgülle ayır" },
      { key: "uzmanlik", etiket: "Uzmanlık", tip: "select", secenekler: UZMANLIK },
    ],
  },
};

/** FormData'dan verilen rolün alanlarını profil_detay objesine toplar (boşları atar). */
export function profilDetayTopla(rol: string, get: (k: string) => string | null): Record<string, string> {
  const cfg = PROFIL_ALANLARI[rol as RolAnahtar];
  const detay: Record<string, string> = {};
  if (!cfg) return detay;
  for (const a of cfg.alanlar) {
    const v = (get(a.key) ?? "").trim();
    if (v) detay[a.key] = v;
  }
  return detay;
}
