// Dinamik Fiyat Kural Motoru — SAF hesap (yan etkisiz, izole, tsc ile doğrulanır).
// Motor (fiyat-motor.ts) ve UI bunları kullanır. Spec: docs/superpowers/specs/2026-08-11-*.

export type KuralTetik = "sure_gun" | "satis_adet" | "satis_yuzde" | "tarih";
export type KuralAksiyon = "yuzde" | "sabit_ekle" | "sabit_fiyat";
export type KuralTekrar = "tek" | "periyodik";

export type FiyatKurali = {
  id: string;
  proje_id: string;
  tip_id: string | null;
  ad: string;
  tetik: KuralTetik;
  esik: number;
  tetik_tarih: string | null;
  aksiyon: KuralAksiyon;
  deger: number;
  tekrar: KuralTekrar;
  son_uygulanan_esik: number;
  aktif: boolean;
};

export type FiyatAyar = {
  aktif: boolean;
  mod: "otomatik" | "oneri";
  baz_tarih: string | null;
  tavan_pct: number | null;
  adim_max_pct: number | null;
  taban_override: number | null;
};

export const VARSAYILAN_AYAR: FiyatAyar = {
  aktif: false,
  mod: "oneri",
  baz_tarih: null,
  tavan_pct: 20,
  adim_max_pct: 5,
  taban_override: null,
};

/** proje.fiyat_ayar jsonb → tip güvenli FiyatAyar (eksik alan varsayılandan). */
export function ayarCoz(ham: unknown): FiyatAyar {
  const o = (ham ?? {}) as Partial<FiyatAyar>;
  return {
    aktif: o.aktif ?? VARSAYILAN_AYAR.aktif,
    mod: o.mod === "otomatik" ? "otomatik" : "oneri",
    baz_tarih: o.baz_tarih ?? null,
    tavan_pct: o.tavan_pct ?? VARSAYILAN_AYAR.tavan_pct,
    adim_max_pct: o.adim_max_pct ?? VARSAYILAN_AYAR.adim_max_pct,
    taban_override: o.taban_override ?? null,
  };
}

/** Ham yeni fiyat (guardrail ÖNCESİ). liste null + yuzde/sabit_ekle → null (uygulanamaz). */
export function hamYeniFiyat(aksiyon: KuralAksiyon, deger: number, mevcut: number | null): number | null {
  if (aksiyon === "sabit_fiyat") return deger;
  if (mevcut == null) return null;
  if (aksiyon === "yuzde") return mevcut * (1 + deger / 100);
  return mevcut + deger; // sabit_ekle
}

/** Guardrail + 1000 yuvarla. Sıra: adım limiti → tavan (taban*(1+tavan_pct)) → taban → yuvarla. */
export function guardrailUygula(
  ham: number,
  mevcut: number | null,
  g: { taban: number | null; tavanPct: number | null; adimMaxPct: number | null },
): number {
  let y = ham;
  if (mevcut != null && g.adimMaxPct != null && mevcut > 0) {
    const dPct = ((y - mevcut) / mevcut) * 100;
    if (dPct > g.adimMaxPct) y = mevcut * (1 + g.adimMaxPct / 100);
    if (dPct < -g.adimMaxPct) y = mevcut * (1 - g.adimMaxPct / 100);
  }
  if (g.taban != null && g.tavanPct != null) {
    const tavan = g.taban * (1 + g.tavanPct / 100);
    if (y > tavan) y = tavan;
  }
  if (g.taban != null && y < g.taban) y = g.taban;
  return Math.round(y / 1000) * 1000;
}

/** Tetik doldu mu + yeni son_uygulanan_esik. durumOzet: {satildi, toplamSatilabilir}. */
export function tetikDoldu(
  k: Pick<FiyatKurali, "tetik" | "esik" | "tetik_tarih" | "tekrar" | "son_uygulanan_esik">,
  durumOzet: { satildi: number; toplamSatilabilir: number },
  bazTarihISO: string | null,
  simdiISO: string,
): { tetik: boolean; yeniEsik: number } {
  const simdi = new Date(simdiISO).getTime();
  if (k.tetik === "tarih") {
    const ok = !!k.tetik_tarih && new Date(k.tetik_tarih).getTime() <= simdi && k.son_uygulanan_esik < 1;
    return { tetik: ok, yeniEsik: 1 };
  }
  let olcu = 0;
  if (k.tetik === "sure_gun") {
    const baz = bazTarihISO ? new Date(bazTarihISO).getTime() : simdi;
    olcu = Math.floor((simdi - baz) / 86_400_000);
  } else if (k.tetik === "satis_adet") {
    olcu = durumOzet.satildi;
  } else {
    olcu = durumOzet.toplamSatilabilir > 0 ? (durumOzet.satildi / durumOzet.toplamSatilabilir) * 100 : 0;
  }
  if (k.esik <= 0) return { tetik: false, yeniEsik: k.son_uygulanan_esik };
  const kat = k.tekrar === "periyodik" ? Math.floor(olcu / k.esik) : olcu >= k.esik ? 1 : 0;
  const oncekiKat =
    k.tekrar === "periyodik" ? Math.floor(k.son_uygulanan_esik / k.esik) : k.son_uygulanan_esik >= 1 ? 1 : 0;
  return { tetik: kat > oncekiKat, yeniEsik: k.tekrar === "periyodik" ? kat * k.esik : 1 };
}

/** Birim kural kapsamında mı: tip eşleşmesi (tip_id null = tüm tipler). Durum/satilabilir filtresi motor'da. */
export function kapsamEsler(kural: Pick<FiyatKurali, "tip_id">, birim: { tip_id: string | null }): boolean {
  return kural.tip_id == null || kural.tip_id === birim.tip_id;
}
