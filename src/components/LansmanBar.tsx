"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PUBLIK = ["/", "/muteahhit", "/emlakci", "/guven"];
const ANAHTAR = "projedar_bar_kapali";

/**
 * Launch top-bar — public marketing sayfalarında sürekli görünür, değer-önce danışman daveti.
 * Header'lar `top-[var(--lansman-bar-h,0px)]` ile ötelenir; bar yokken 0 (davranış değişmez).
 * Girişli üyeye ve kapatılınca gösterilmez. Kıtlık/süre dili YOK.
 */
export function LansmanBar() {
  const yol = usePathname();
  const yolPublik = PUBLIK.includes(yol);
  const [uygun, setUygun] = useState(false);
  const [kapatildi, setKapatildi] = useState(false);

  // Oturum + kapatma kontrolü (senkron setState yok → asenkron .then içinde)
  useEffect(() => {
    if (!yolPublik) return;
    if (typeof window !== "undefined" && localStorage.getItem(ANAHTAR)) return;
    let iptal = false;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!iptal && !data.session) setUygun(true);
      });
    return () => {
      iptal = true;
    };
  }, [yolPublik]);

  const goster = yolPublik && uygun && !kapatildi;

  // Header ötelemesi (CSS değişkeni)
  useEffect(() => {
    document.documentElement.style.setProperty("--lansman-bar-h", goster ? "40px" : "0px");
    return () => {
      document.documentElement.style.setProperty("--lansman-bar-h", "0px");
    };
  }, [goster]);

  if (!goster) return null;

  const kapat = () => {
    localStorage.setItem(ANAHTAR, "1");
    setKapatildi(true);
  };

  return (
    <div className="sticky top-0 z-[55] flex h-10 items-center justify-center gap-3 bg-navy px-9 text-white">
      <p className="flex items-center gap-2 truncate text-[12.5px] font-medium sm:text-[13px]">
        <span className="nabiz relative inline-block size-1.5 shrink-0 rounded-full bg-green" aria-hidden />
        <span className="truncate">
          Danışman hesabı ücretsiz
          <span className="hidden text-white/70 sm:inline"> · size açılan projelere tek havuzdan erişin</span>
        </span>
      </p>
      <Link
        href="/kayit?rol=emlakci&kaynak=launch-bar"
        className="shrink-0 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-navy transition-colors hover:bg-white/90"
      >
        Ücretsiz katıl →
      </Link>
      <button
        onClick={kapat}
        aria-label="Kapat"
        className="absolute right-2.5 grid size-6 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={14} />
      </button>
    </div>
  );
}
