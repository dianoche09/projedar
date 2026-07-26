import type { Metadata } from "next";
import Link from "next/link";
import { AkisFeed } from "@/components/landing/AkisFeed";
import { HeroSinematik } from "./HeroSinematik";
import { CepheSahne } from "./CepheSahne";
import {
  NedirSeridi,
  BozukSistem,
  OpsiyonKoreografisi,
  TahsisBolumu,
  IkiTarafBolumu,
  PortalDegil,
} from "./Bolumler";
import { FinalCta } from "./FinalCta";

/**
 * /mockup-04 · KONSEPT: CINEMATIC PROPERTY INFRASTRUCTURE
 * Gerçek sinematik bina fotoğrafı üzerine canlı veri katmanı bindirmesi.
 * Signature moment: scroll ile kamera cepheye yaklaşır, pencereler veri
 * hücresine dönüşür (CepheSahne). Tüm veriler örnektir. Design Lab çalışması.
 */

export const metadata: Metadata = {
  title: "Mockup 04 · Cinematic Property Infrastructure | ProjePazar Design Lab",
  description:
    "Sinematik mimari görüntü üzerine canlı veri katmanı: ProjePazar landing konsept çalışması. Tüm veriler örnektir.",
  robots: { index: false, follow: false },
};

export default function Mockup04Sayfa() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#081220] text-[#ece9e2]">
      <HeroSinematik />
      <NedirSeridi />
      <BozukSistem />
      <CepheSahne />
      <OpsiyonKoreografisi />
      <TahsisBolumu />
      <IkiTarafBolumu />
      <AkisFeed />
      <PortalDegil />
      <FinalCta />
      <footer className="border-t border-white/[0.06] bg-[#060e1a]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 sm:flex-row sm:items-center">
          <p className="mono text-[11px] text-white/40">
            ProjePazar Design Lab · Mockup 04 · Cinematic Property Infrastructure · tüm veriler örnektir
          </p>
          <Link
            href="/"
            className="mono text-[11px] font-semibold text-[#3fbfae] transition-colors hover:text-[#6ad3c5]"
          >
            Gerçek ana sayfaya dön
          </Link>
        </div>
      </footer>
    </main>
  );
}
