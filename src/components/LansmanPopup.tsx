"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const ANAHTAR = "projedar_lansman_ts";
const TEKRAR_GUN = 10;
/** Proje sayısını yalnız anlamlı olduğunda göster; az proje sosyal kanıtı zayıflatır (tune edilebilir). */
const PROJE_SAYI_ESIK = 10;

type Proje = { ad: string; sehir: string };

/** Gerçek yayınlı proje yoksa dürüst örnek görünüm (küçük "örnek görünüm" etiketiyle). */
const ORNEK: Proje[] = [
  { ad: "Meridyen Vadi", sehir: "İstanbul" },
  { ad: "Park Yaşam", sehir: "Kadıköy" },
  { ad: "Çankaya Vadi", sehir: "Ankara" },
];

/** Düğüm → kart bağlantı hatları (kart x-merkezleri: 82 / 230 / 378, justify-between ile eşleşir). */
const HAT: Record<number, string> = {
  82: "M230 40 C142 58, 96 60, 82 78",
  230: "M230 40 L230 78",
  378: "M230 40 C318 58, 364 60, 378 78",
};

/**
 * Lansman pop-up'ı — public sayfalarda değer-önce kayıt daveti.
 * Üst: ürün-ağı motifi (Projedar düğümü + bağlı GERÇEK yayınlı proje kartları + canlı sinyal).
 * Veri /api/lansman-havuz'dan canlı gelir; proje eklendikçe büyür. Per-proje stok sayısı GÖSTERİLMEZ.
 * Tek ana CTA = danışman; müteahhit ikincil link. Girişli üyeye gösterilmez. E-posta toplama yok.
 * Kıtlık/süre/"komisyon yok" dili KULLANILMAZ (bkz. dil memory'leri).
 */
export function LansmanPopup({ varsayilanRol }: { varsayilanRol?: "uretici" | "emlakci" }) {
  const [acik, setAcik] = useState(false);
  const [veri, setVeri] = useState<{ projeler: Proje[]; projeSay: number } | null>(null);
  const kapat = useCallback(() => setAcik(false), []);

  // Tetik: 10sn / %40 scroll / desktop çıkış-niyeti. 10 günde bir tekrar. Girişli üyeye gösterme.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const son = Number(localStorage.getItem(ANAHTAR) || 0);
    if (son && Date.now() - son < TEKRAR_GUN * 86400000) return;

    let iptal = false;
    let tetiklendi = false;
    let zaman = 0;
    const goster = () => {
      if (tetiklendi || iptal) return;
      tetiklendi = true;
      localStorage.setItem(ANAHTAR, String(Date.now()));
      setAcik(true);
      temizle();
    };
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0 && window.scrollY / h > 0.4) goster();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) goster();
    };
    const temizle = () => {
      window.clearTimeout(zaman);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onLeave);
    };
    createClient()
      .auth.getSession()
      .then(async ({ data }) => {
        if (iptal || data.session) return;
        try {
          const r = await fetch("/api/lansman-havuz");
          if (r.ok) {
            const j = (await r.json()) as { projeler: Proje[]; projeSay: number };
            if (!iptal) setVeri(j);
          }
        } catch {
          /* sessiz: örnek görünüme düşer */
        }
        if (iptal) return;
        zaman = window.setTimeout(goster, 10000);
        window.addEventListener("scroll", onScroll, { passive: true });
        if (window.matchMedia("(pointer:fine)").matches) document.addEventListener("mouseleave", onLeave);
      });
    return () => {
      iptal = true;
      temizle();
    };
  }, []);

  // Esc + arka plan scroll kilidi
  useEffect(() => {
    if (!acik) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") kapat();
    };
    document.addEventListener("keydown", onKey);
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = eski;
    };
  }, [acik, kapat]);

  if (!acik) return null;

  const gercek = (veri?.projeler.length ?? 0) > 0;
  const kartlar = gercek ? veri!.projeler.slice(0, 3) : ORNEK;
  const projeSay = gercek ? veri!.projeSay : ORNEK.length;
  const sayiGoster = projeSay >= PROJE_SAYI_ESIK;
  const kaynak = varsayilanRol ? `lansman-${varsayilanRol}` : "lansman-popup";
  const uclar = kartlar.length <= 1 ? [230] : kartlar.length === 2 ? [82, 378] : [82, 230, 378];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Projedar"
      onClick={(e) => {
        if (e.target === e.currentTarget) kapat();
      }}
      className="fixed inset-0 z-[65] flex items-end justify-center bg-[rgba(8,20,34,0.55)] p-3 backdrop-blur-md sm:items-center sm:p-4"
    >
      <div className="relative w-full max-w-[460px] overflow-hidden rounded-t-[26px] border border-[var(--cizgi)] bg-white shadow-[var(--golge-3)] sm:rounded-[26px]">
        <button
          onClick={kapat}
          aria-label="Kapat"
          className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-full bg-white/80 text-ink-soft shadow-card backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
        >
          <X size={15} />
        </button>

        {/* ===== ürün-ağı motifi ===== */}
        <div className="relative h-[150px] border-b border-[var(--cizgi)] bg-soft sm:h-[166px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 460 166" preserveAspectRatio="none" fill="none" aria-hidden>
            {uclar.map((x) => (
              <path key={`h${x}`} d={HAT[x]} stroke={x === 230 ? "rgba(30,155,138,.6)" : "rgba(19,49,75,.30)"} strokeWidth={x === 230 ? 1.8 : 1.7} />
            ))}
            {uclar.map((x) => (
              <circle key={`d${x}`} cx={x} cy="79" r={x === 230 ? 2.8 : 2.6} fill={x === 230 ? "var(--color-teal)" : "rgba(19,49,75,.45)"} />
            ))}
          </svg>

          {!gercek ? (
            <span className="mono absolute right-11 top-3 z-[3] rounded-md bg-[rgba(16,36,58,0.05)] px-1.5 py-0.5 text-[9px] tracking-tight text-ink-faint">
              örnek görünüm
            </span>
          ) : null}

          {/* Projedar düğümü (gerçek radar logosu) */}
          <div className="absolute left-1/2 top-2.5 z-[2] -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-navy py-1.5 pl-2.5 pr-3 shadow-[0_6px_15px_rgba(19,49,75,0.30)]">
              <Logo size={15} acik />
              <span className="font-display text-[13px] font-extrabold tracking-tight text-white">
                proje<span className="text-teal">dar</span>
              </span>
              <span className="nabiz relative ml-0.5 size-1.5 rounded-full bg-green" aria-hidden />
            </span>
          </div>

          {/* proje kartları (ad + şehir; per-proje stok sayısı yok) */}
          <div className={`absolute inset-x-3 bottom-[30px] z-[2] flex gap-1.5 ${kartlar.length === 1 ? "justify-center" : "justify-between"}`}>
            {kartlar.map((p, i) => (
              <div
                key={`${p.ad}-${i}`}
                className={`rounded-xl border border-hair bg-white px-2.5 py-2 shadow-card ${kartlar.length === 1 ? "w-[180px]" : "min-w-0 flex-1"}`}
              >
                <div className="truncate text-[11.5px] font-bold leading-none text-ink">{p.ad || "Proje"}</div>
                {p.sehir ? <div className="mono mt-1 truncate text-[10px] text-gray">{p.sehir}</div> : null}
              </div>
            ))}
          </div>

          <div className="mono absolute inset-x-0 bottom-2 z-[2] text-center text-[10px] tracking-tight text-teal-d">
            <span className="mr-1.5 inline-block size-[5px] rounded-full bg-green align-middle" />
            Canlı stok ağı{sayiGoster ? ` · ${projeSay} proje` : ""}
          </div>
        </div>

        {/* ===== gövde ===== */}
        <div className="px-6 pb-5 pt-4 sm:px-7">
          <h2 className="font-display text-[23px] font-extrabold leading-[1.12] tracking-tight text-ink">
            Size açılan projeleri tek yerde görün.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Güncel stok, fiyat ve proje bilgilerine tek havuzdan erişin. Müşterinize doğru projeyi, doğru bilgiyle sunun.
          </p>

          <Link
            href={`/kayit?rol=emlakci&kaynak=${kaynak}`}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-navy px-4 py-3.5 text-[14.5px] font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-[#0e2740]"
          >
            Ücretsiz danışman hesabı oluştur
          </Link>
          <Link
            href={`/kayit?rol=uretici&kaynak=${kaynak}`}
            className="mt-3 block text-center text-[13px] font-semibold text-ink-soft transition-colors hover:text-teal-d"
          >
            Müteahhit / proje geliştiricisiyim →
          </Link>

          <p className="mt-4 border-t border-hair pt-3 text-center text-[11.5px] leading-relaxed text-gray">
            <span className="mr-1.5 inline-block size-[5px] rounded-full bg-teal align-middle" />
            Projedar komisyonunuza ortak olmaz
          </p>
        </div>
      </div>
    </div>
  );
}
