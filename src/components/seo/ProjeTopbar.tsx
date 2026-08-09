"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { etiket: "Müteahhitler için", href: "/muteahhit" },
  { etiket: "Danışmanlar için", href: "/emlakci" },
  { etiket: "Konut projeleri", href: "/konut-projeleri" },
  { etiket: "Rehber", href: "/rehber" },
  { etiket: "Güven", href: "/guven" },
];

/**
 * /proje topbar: hero üzerinde ŞEFFAF (beyaz metin), scroll başlar başlamaz cam/katı (ink metin).
 * Projedar global nav'ın sinematik-hero uyarlaması. Scroll eşiği = 16px (hemen tetiklenir).
 */
export function ProjeTopbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 16;
      setSolid((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        solid ? "border-[var(--cizgi)] bg-white shadow-[0_6px_20px_rgba(16,36,58,0.08)]" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="/" aria-label="Projedar ana sayfa" className="shrink-0"><Logo size={26} wordmark acik={!solid} /></Link>
        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                solid ? "text-ink-soft hover:bg-[rgba(16,36,58,0.05)] hover:text-ink" : "text-white/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              {n.etiket}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:block">
            <Link
              href="/login"
              className={
                solid
                  ? "btn-ghost"
                  : "inline-flex min-h-[44px] items-center rounded-[13px] border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
              }
            >
              Giriş yap
            </Link>
          </span>
          <Link href="/kayit" className="btn-action whitespace-nowrap hover:-translate-y-0.5">Ağa katıl</Link>
        </div>
      </nav>
    </header>
  );
}
