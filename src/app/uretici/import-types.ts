// Stok import önizleme tipleri. "use server" (actions.ts) dosyasında type export edilemez
// (Next.js: yalnız async fonksiyon export'una izin verir) → ayrı dosya. Hem server action
// (stokImportOnizle) hem client bileşen (StokImport) buradan import eder.

export type ImportSatir = {
  no: number;
  blok: string;
  daire_no: string;
  durum: "eklenecek" | "eslesmeyen_blok" | "mukerrer";
};

export type ImportOnizleme =
  | { ok: false; hata: string }
  | {
      ok: true;
      eklenecek: number;
      atlanan: number;
      mukerrer: number;
      toplamSatir: number;
      satirlar: ImportSatir[]; // ilk N satır (tablo)
    };
