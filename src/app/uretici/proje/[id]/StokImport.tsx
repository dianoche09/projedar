"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { stokImportOnizle, excelImport } from "@/app/uretici/actions";
import type { ImportOnizleme } from "@/app/uretici/import-types";

type Blok = { id: string; ad: string | null };
type Tip = { id: string; ad: string | null };

const DURUM_ETIKET: Record<string, string> = {
  eklenecek: "✓ Eklenecek",
  eslesmeyen_blok: "⚠ Eşleşmeyen blok",
  mukerrer: "⚠ Mükerrer (atlanır)",
};
const DURUM_RENK: Record<string, string> = {
  eklenecek: "text-green",
  eslesmeyen_blok: "text-amber",
  mukerrer: "text-gray",
};

/**
 * Excel/CSV toplu stok yükleme — ÖNİZLEMELİ (dry-run). Dosya seçilince yüklemeden önce
 * "X eklenecek, Y atlanacak (neden)" tablosu gösterir; onayınca gerçek insert (excelImport).
 * Şablon indir: projenin gerçek blok/tip adlarıyla örnek dosya (doğru format öğretir).
 */
export function StokImport({ projeId, bloklar, tipler }: { projeId: string; bloklar: Blok[]; tipler: Tip[] }) {
  const [dosya, setDosya] = useState<File | null>(null);
  const [onizleme, setOnizleme] = useState<ImportOnizleme | null>(null);
  const [bekliyor, basla] = useTransition();

  const onizle = (file: File) => {
    setDosya(file);
    setOnizleme(null);
    const fd = new FormData();
    fd.set("proje_id", projeId);
    fd.set("dosya", file);
    basla(async () => setOnizleme(await stokImportOnizle(fd)));
  };

  const yukle = () => {
    if (!dosya) return;
    const fd = new FormData();
    fd.set("proje_id", projeId);
    fd.set("dosya", dosya);
    basla(async () => {
      await excelImport(fd); // server redirect → sayfa mesajla yenilenir
    });
  };

  const sablonIndir = () => {
    const ornekBlok = bloklar[0]?.ad ?? "A";
    const ornekTip = tipler[0]?.ad ?? "3+1 Standart";
    const satir = (daire_no: string) => ({
      blok: ornekBlok,
      kat: 1,
      daire_no,
      tip: ornekTip,
      durum: "musait",
      fiyat: 8750000,
      net_m2: 142,
      brut_m2: 165,
      para_birimi: "TRY",
      yon: "Güney",
      manzara: "",
    });
    const ws = XLSX.utils.json_to_sheet([satir("A-11"), satir("A-12")]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stok");
    XLSX.writeFile(wb, "projedar-stok-sablonu.xlsx");
  };

  const btn = "inline-flex items-center gap-1.5 rounded-lg border border-hair bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-soft cursor-pointer";

  return (
    <div className="rounded-2xl border border-hair bg-card p-5">
      <h3 className="font-medium text-ink">Excel/CSV ile toplu yükleme</h3>
      <p className="mt-1 text-xs text-gray">
        Bloklar önce tanımlı olmalı — dosyadaki blok adları mevcut bloklarla eşleşir. Yüklemeden önce önizleme gösterilir, mükerrer daireler atlanır.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={sablonIndir} className={btn}>
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
          </svg>
          Örnek şablon indir
        </button>
        <label className={btn}>
          Dosya seç
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onizle(f);
            }}
          />
        </label>
        {dosya ? <span className="text-xs text-gray">{dosya.name}</span> : null}
      </div>

      {bekliyor && !onizleme ? <p className="mt-3 text-sm text-gray">Önizleniyor…</p> : null}

      {onizleme ? (
        !onizleme.ok ? (
          <p className="mt-3 rounded-lg border border-red/20 bg-red-soft px-3 py-2 text-sm font-medium text-red">{onizleme.hata}</p>
        ) : (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold text-green">{onizleme.eklenecek} eklenecek</span>
              {onizleme.atlanan ? <span className="text-amber">{onizleme.atlanan} eşleşmeyen blok</span> : null}
              {onizleme.mukerrer ? <span className="text-gray">{onizleme.mukerrer} mükerrer</span> : null}
              <span className="mono text-gray">/ {onizleme.toplamSatir} satır</span>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-hair">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-soft">
                  <tr className="text-gray">
                    <th className="px-3 py-2 font-semibold">Satır</th>
                    <th className="px-3 py-2 font-semibold">Blok</th>
                    <th className="px-3 py-2 font-semibold">Daire</th>
                    <th className="px-3 py-2 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {onizleme.satirlar.map((s) => (
                    <tr key={s.no} className="border-t border-hair">
                      <td className="mono px-3 py-1.5 text-gray">{s.no}</td>
                      <td className="px-3 py-1.5 text-ink">{s.blok}</td>
                      <td className="mono px-3 py-1.5 text-ink">{s.daire_no}</td>
                      <td className={`px-3 py-1.5 font-medium ${DURUM_RENK[s.durum]}`}>{DURUM_ETIKET[s.durum]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {onizleme.toplamSatir > onizleme.satirlar.length ? (
              <p className="mt-1.5 text-[11px] text-gray">İlk {onizleme.satirlar.length} satır gösteriliyor.</p>
            ) : null}

            {onizleme.eklenecek > 0 ? (
              <button type="button" onClick={yukle} disabled={bekliyor} className="btn-action mt-4 disabled:opacity-50">
                {bekliyor ? "Yükleniyor…" : `Onayla ve ${onizleme.eklenecek} birim yükle`}
              </button>
            ) : (
              <p className="mt-3 text-sm font-medium text-amber">
                Eklenecek yeni birim yok. Blok adlarının mevcut bloklarla eşleştiğini kontrol et.
              </p>
            )}
          </div>
        )
      ) : null}
    </div>
  );
}
