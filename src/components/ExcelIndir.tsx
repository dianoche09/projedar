"use client";

import * as XLSX from "xlsx";

/**
 * Genel Excel (.xlsx) indirme butonu — client-side. Satırlar (düz obje dizisi; anahtarlar
 * kolon başlığı olur) tarayıcıda xlsx'e dökülür. Veri RLS ile server'da zaten filtrelendi
 * (emlakçı yalnız kendi lead/paylaşımı). Ayrı export motoru/sunucu yok.
 */
export function ExcelIndir({
  satirlar,
  dosyaAd,
  sheetAd = "Veri",
  etiket = "Excel indir",
}: {
  satirlar: Record<string, string | number>[];
  dosyaAd: string;
  sheetAd?: string;
  etiket?: string;
}) {
  const indir = () => {
    if (satirlar.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(satirlar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetAd);
    XLSX.writeFile(wb, dosyaAd);
  };

  return (
    <button
      type="button"
      onClick={indir}
      disabled={satirlar.length === 0}
      className="inline-flex items-center gap-1.5 rounded-lg border border-hair bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper disabled:opacity-50"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
      {etiket}
    </button>
  );
}
