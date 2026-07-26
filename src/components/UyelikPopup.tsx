"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Anasayfada proje/daire etkileşiminde açılan üyelik kapısı (kapalı-devre — DEĞİŞMEZ #4).
 * Canlı stok yalnız üyeye görünür; iki rol yolu + giriş linki.
 */
export function UyelikPopup({ onKapat }: { onKapat: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onKapat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKapat]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onKapat} aria-hidden />
      <div className="sheet-in relative z-10 w-full max-w-md rounded-t-2xl border border-[var(--cizgi)] bg-white p-6 shadow-[var(--golge-3)] sm:rounded-2xl sm:p-7">
        <button
          onClick={onKapat}
          className="absolute right-4 top-3.5 rounded-xl px-2.5 py-1.5 text-sm font-bold text-ink-soft transition-colors hover:bg-[rgba(16,36,58,0.06)] hover:text-ink"
          aria-label="Kapat"
        >
          ✕
        </button>

        <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-teal">Kapalı devre ağ</p>
        <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">Canlı stoğu görmek için üye ol</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          ProjePazar açık ilan yayınlamaz. Canlı fiyat, durum ve tahsisli stok yalnız üyelere görünür. Ücretsiz başla,
          saniyede içeride ol.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/kayit?rol=uretici"
            className="flex items-center justify-between gap-3 rounded-2xl bg-navy px-4 py-3.5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[var(--golge-3)]"
          >
            <span>
              <span className="block font-display text-[15px] font-bold">Proje sahibiyim</span>
              <span className="block text-[12px] text-white/75">Stoğumu ağa açar, tek merkezden yönetirim</span>
            </span>
            <span aria-hidden className="text-lg">→</span>
          </Link>
          <Link
            href="/kayit?rol=emlakci"
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--cizgi-2)] bg-white px-4 py-3.5 text-ink transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-[var(--golge-3)]"
          >
            <span>
              <span className="block font-display text-[15px] font-bold">Danışmanım</span>
              <span className="block text-[12px] text-ink-soft">Tahsisli projeleri canlı görür, paylaşırım · ücretsiz</span>
            </span>
            <span aria-hidden className="text-lg text-teal">→</span>
          </Link>
        </div>

        <p className="mt-5 border-t border-[var(--cizgi)] pt-4 text-center text-sm text-ink-soft">
          Zaten üye misin?{" "}
          <Link href="/login" className="font-bold text-teal hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
