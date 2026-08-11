/**
 * Merkezî resmî/otorite kaynak kayıtları.
 *
 * Her mevzuat iddiası bir kaynağa bağlanır (içerik meta `sources` → id).
 * Öncelik: 1) Ticaret Bakanlığı 2) e-Devlet 3) Resmî Gazete 4) diğer kamu.
 * İkincil (haber) kaynaklar yalnız destekleyici olarak eklenir (tur: "ikincil").
 *
 * URL doğrulaması: WebSearch ile 2026-08-09 tarihinde resmî ticaret.gov.tr
 * içeriği teyit edildi (EİDS zorunluluk tarihi 1 Şubat 2026, sosyal medya
 * cezası her ihlal için 286.206 TL'ye kadar, yetki süresi en az 3 ay).
 */
import type { Kaynak } from "./tipler";

export const KAYNAKLAR: Record<string, Kaynak> = {
  "ticaret-eids-yetki": {
    id: "ticaret-eids-yetki",
    baslik: "Elektronik İlan Doğrulama Sistemi (EİDS) Yetki Doğrulama Uygulaması Hayata Geçirildi",
    kurum: "Ticaret Bakanlığı",
    url: "https://ticaret.gov.tr/kurumsal-haberler/elektronik-ilan-dogrulama-sistemi-eids-yetki-dogrulama-uygulamasi-hayata-gecirildi",
    tur: "resmi",
    oncelik: 1,
  },
  "ticaret-eids-basin": {
    id: "ticaret-eids-basin",
    baslik: "Yetkisiz İşletme İhbar Modülü ve EİDS Yetki Doğrulamasına İlişkin Basın Açıklaması",
    kurum: "Ticaret Bakanlığı",
    url: "https://ticaret.gov.tr/haberler/yetkisiz-isletme-ihbar-modulu-ve-eids-yetki-dogrulamasina-iliskin-basin-aciklamasi",
    tur: "resmi",
    oncelik: 1,
  },
  "edevlet-tasinmaz-izin": {
    id: "edevlet-tasinmaz-izin",
    baslik: "Taşınmaz İlanı Yayınlama İzni (Yetkilendirme) Hizmeti",
    kurum: "e-Devlet",
    url: "https://www.turkiye.gov.tr/",
    tur: "resmi",
    oncelik: 2,
  },
  "ticaret-tasinmaz-yonetmelik": {
    id: "ticaret-tasinmaz-yonetmelik",
    baslik: "Taşınmaz Ticareti Hakkında Yönetmelik (ve güncel değişiklikleri)",
    kurum: "Ticaret Bakanlığı",
    url: "https://www.mevzuat.gov.tr/",
    tur: "resmi",
    oncelik: 1,
  },
  "ttbs-yetki-belgesi": {
    id: "ttbs-yetki-belgesi",
    baslik: "Taşınmaz Ticareti Bilgi Sistemi (TTBS) — Yetki Belgesi Başvuru ve Sorgulama",
    kurum: "Ticaret Bakanlığı",
    url: "https://ttbs.gtb.gov.tr/",
    tur: "resmi",
    oncelik: 1,
  },
};

/** id listesini kayda çözer, öncelik + kuruma göre sıralar. Tanımsız id atlanır. */
export function kaynaklariCoz(ids: string[]): Kaynak[] {
  return ids
    .map((id) => KAYNAKLAR[id])
    .filter((k): k is Kaynak => Boolean(k))
    .sort((a, b) => a.oncelik - b.oncelik || a.kurum.localeCompare(b.kurum, "tr"));
}
