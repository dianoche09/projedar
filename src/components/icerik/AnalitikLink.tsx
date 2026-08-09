"use client";

import Link from "next/link";
import { icerikOlay, type IcerikOlay } from "@/lib/icerik/analitik";

/**
 * Analitik olayı yayan bağlantı. Dahili linkler için next/link, dış (resmî
 * kaynak) linkler için yeni sekmede <a>. Resmî kaynaklara nofollow verilmez
 * (otorite sinyali korunur), yalnız güvenli rel eklenir.
 */
export function AnalitikLink({
  href,
  olay,
  olayProps,
  external = false,
  className,
  children,
}: {
  href: string;
  olay: IcerikOlay;
  olayProps?: Record<string, unknown>;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const tikla = () => icerikOlay(olay, olayProps);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={tikla}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={tikla}>
      {children}
    </Link>
  );
}
