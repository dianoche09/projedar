"use client";

export type KurucuSatir = { email: string; rol: string | null; kaynak: string | null; tarih: string };

function kac(v: string): string {
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Kurucu kayıtlarını CSV olarak indir (Excel-TR uyumu için BOM + CRLF). Veri zaten sayfada. */
export function CsvIndir({ satirlar }: { satirlar: KurucuSatir[] }) {
  const indir = () => {
    const bas = ["E-posta", "İlgi", "Kaynak", "Tarih"];
    const govde = satirlar.map((s) => [s.email, s.rol ?? "", s.kaynak ?? "", s.tarih].map(kac).join(","));
    const csv = "﻿" + [bas.join(","), ...govde].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kurucu-kayitlar.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={indir}
      disabled={satirlar.length === 0}
      className="rounded-xl border border-hair bg-card px-3.5 py-2 text-[13px] font-semibold text-ink shadow-card transition-colors hover:bg-soft disabled:opacity-50"
    >
      CSV indir
    </button>
  );
}
