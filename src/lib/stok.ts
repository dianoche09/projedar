// Üretici ekranları — paylaşılan stok/durum/tazelik yardımcıları.
// Tek doğru kaynak: durum kovalama, para biçimi ve tazelik mantığı burada toplanır
// (kokpit ile birebir aynı sinyal renkleri / eşikler). Sinyal: yeşil=müsait, amber=opsiyon, kırmızı=satıldı.

import { zamanOnce } from "@/lib/types";

export type DurumKova = "musait" | "opsiyon" | "satildi" | "diger";

/** birim.durum → kokpit kovası (opsiyonlu + satis_beklemede = opsiyon). */
export function kova(d: string): DurumKova {
  if (d === "musait") return "musait";
  if (d === "opsiyonlu" || d === "satis_beklemede") return "opsiyon";
  if (d === "satildi") return "satildi";
  return "diger";
}

export const DURUM_SINIF: Record<DurumKova, string> = {
  musait: "d-musait",
  opsiyon: "d-opsiyon",
  satildi: "d-satildi",
  diger: "d-musait",
};

export const DURUM_AD: Record<DurumKova, string> = {
  musait: "Müsait",
  opsiyon: "Opsiyon",
  satildi: "Satıldı",
  diger: "—",
};

/** durum kovası → durum rozeti zemin sınıfı (kokpit dışı ekranlarda inline rozet için). */
export const DURUM_ROZET: Record<DurumKova, string> = {
  musait: "bg-green-soft text-green",
  opsiyon: "bg-amber-soft text-amber",
  satildi: "bg-red-soft text-red",
  diger: "bg-navy-soft text-ink-soft",
};

/* ---------------------------------------------------------------------------
   Müteahhit stok görünümü — 5 grup. "toplam daire" doğru okunsun diye
   satışa AÇIK / OPSİYON / SATILDI / PLANLI (hiç satışa açılmamış) / KAPALI
   (satılamaz arsa payı, stop, kiralandı) ayrı sayılır. Böylece müteahhit
   "toplam" ile "satışa açık" arasındaki farkı görür, eksik açılmış stoğu fark eder.
   --------------------------------------------------------------------------- */
export type DurumGrup = "acik" | "opsiyon" | "satildi" | "planli" | "kapali";

/** birim.durum (+ satilabilir) → müteahhit stok grubu. */
export function durumGrup(d: string, satilabilir: boolean = true): DurumGrup {
  if (!satilabilir) return "kapali"; // arsa payı / mal sahibi payı — kalıcı satılamaz
  if (d === "musait") return "acik";
  if (d === "opsiyonlu" || d === "satis_beklemede") return "opsiyon";
  if (d === "satildi") return "satildi";
  if (d === "planli") return "planli"; // henüz satışa açılmamış (dalga bekliyor)
  return "kapali"; // stop / kiralandi / diğer
}

export const GRUP_AD: Record<DurumGrup, string> = {
  acik: "Satışa açık",
  opsiyon: "Opsiyon",
  satildi: "Satıldı",
  planli: "Planlı",
  kapali: "Kapalı",
};

/** Grup nokta/rozet renk sınıfı (sinyal dili + planlı=navy bilgi, kapalı=gri). */
export const GRUP_NOKTA: Record<DurumGrup, string> = {
  acik: "bg-green",
  opsiyon: "bg-amber",
  satildi: "bg-red",
  planli: "bg-navy",
  kapali: "bg-gray",
};

export const GRUP_ROZET: Record<DurumGrup, string> = {
  acik: "bg-green-soft text-green",
  opsiyon: "bg-amber-soft text-amber",
  satildi: "bg-red-soft text-red",
  planli: "bg-navy-soft text-ink-soft",
  kapali: "bg-soft text-[var(--ink-faint)]",
};

/** Proje bazlı stok özeti — para birimi projeye özgü (karışım yok). */
export type ProjeOzet = {
  id: string;
  ad: string;
  para: string;
  toplam: number;
  acik: number;
  opsiyon: number;
  satildi: number;
  planli: number;
  kapali: number;
  minFiyat: number;
  maxFiyat: number;
};

/** Para simgesi — para_birimi alanından. */
export function sembol(birim: string | null): string {
  return birim === "USD" ? "$" : birim === "EUR" ? "€" : birim === "GBP" ? "£" : "₺";
}

/** Para — kısa biçim (₺8.75M / ₺720K). */
export function paraKisa(n: number, birim: string | null = "TRY"): string {
  const s = sembol(birim);
  if (n >= 1_000_000) return `${s}${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${s}${Math.round(n / 1_000)}K`;
  return `${s}${n.toLocaleString("tr-TR")}`;
}

/** Tazelik → v2 `taze tX` sınıfı + insan-okunur metin + gün farkı. */
export function tazelik(iso: string | null): { sinif: string; metin: string; gun: number } {
  if (!iso) return { sinif: "t-eski", metin: "—", gun: 999 };
  const fark = Date.now() - new Date(iso).getTime();
  const gun = Math.floor(fark / 86_400_000);
  const sinif = gun <= 0 ? "t-0" : gun <= 7 ? "t-7" : gun <= 15 ? "t-15" : "t-eski";
  return { sinif, metin: zamanOnce(iso), gun };
}

export type Ozet = { toplam: number; musait: number; opsiyon: number; satildi: number };

/** Boş özet üretir. */
export function bosOzet(): Ozet {
  return { toplam: 0, musait: 0, opsiyon: 0, satildi: 0 };
}

/** Bir birim dizisini durum kovalarına göre toplar. */
export function ozetle(birimler: { durum: string }[]): Ozet {
  const o = bosOzet();
  for (const b of birimler) {
    o.toplam++;
    const k = kova(b.durum);
    if (k === "musait") o.musait++;
    else if (k === "opsiyon") o.opsiyon++;
    else if (k === "satildi") o.satildi++;
  }
  return o;
}
