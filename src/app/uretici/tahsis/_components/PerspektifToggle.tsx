"use client";

import Link from "next/link";

/**
 * Control Center mercek geçişi — Tahsis-merkezli ↔ Stok-merkezli.
 * `?proje=` seçiliyse korunur (stok linki `?proje=X&m=stok`).
 */
export function PerspektifToggle({ aktif, projeId }: { aktif: "tahsis" | "stok"; projeId?: string }) {
  const base = "px-3.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors";
  const tahsisHref = projeId ? `?proje=${projeId}` : "?";
  const stokHref = projeId ? `?proje=${projeId}&m=stok` : "?m=stok";
  return (
    <div className="inline-flex gap-1 rounded-xl border border-[var(--cizgi)] bg-card p-1">
      <Link
        href={tahsisHref}
        className={`${base} ${aktif === "tahsis" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}
      >
        Tahsis merceği
      </Link>
      <Link
        href={stokHref}
        className={`${base} ${aktif === "stok" ? "bg-navy text-white" : "text-ink-soft hover:text-ink"}`}
      >
        Stok merceği
      </Link>
    </div>
  );
}
