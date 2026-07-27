"use client";

import Link from "next/link";

/**
 * SonMesajCta · m4 saha-whatsapp kapanışı (kullanıcı seçimi).
 * Gece yarısı gelen tek soru balonu + "Yarın sabahki ilk mesajın bu olmasın."
 * Balon hafifçe yüzer (sürekli), reduced-motion'da durur.
 */

export function SonMesajCta() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <style>{`
        @keyframes ppSonMesajYuz { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .pp-son-mesaj { animation: ppSonMesajYuz 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pp-son-mesaj { animation: none; } }
      `}</style>

      <div className="pp-son-mesaj mx-auto inline-flex items-baseline gap-3 rounded-2xl rounded-bl-md border border-[var(--cizgi)] bg-white px-5 py-3 shadow-[var(--golge-2)]">
        <span className="text-[15px] font-medium text-ink">Hâlâ müsait mi?</span>
        <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">Dün 23:58</span>
      </div>

      <h2 className="mt-8 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Yarın sabahki ilk mesajın bu olmasın.
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
        Canlı havuzuna gir, tahsisli stoğunu gör, ilk linkini bugün paylaş. Kurulum yok, eğitim yok,
        ücret yok.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/kayit?rol=emlakci" className="btn-action h-12 px-7 text-[15px]">
          Emlakçıyım, ücretsiz başla →
        </Link>
        <Link
          href="/kayit?rol=uretici"
          className="inline-flex h-12 items-center justify-center rounded-full border-2 border-ink px-7 text-[15px] font-bold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Proje sahibiyim
        </Link>
      </div>
    </div>
  );
}
