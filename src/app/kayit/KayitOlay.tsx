"use client";

import { useEffect } from "react";

/**
 * Kayıt sayfası görüntüleme beacon'ı → events(kayit_goruntuleme). Session'da bir kez.
 * Birinci-parti (kendi /api/olay), PII yok, cookie yok. Terk oranı paydası bu.
 */
export function KayitOlay({ rol, kaynak }: { rol?: string | null; kaynak?: string | null }) {
  useEffect(() => {
    try {
      const anahtar = "projedar_kayit_gor";
      if (sessionStorage.getItem(anahtar)) return;
      sessionStorage.setItem(anahtar, "1");
      fetch("/api/olay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip: "kayit_goruntuleme", payload: { rol: rol ?? null, kaynak: kaynak ?? null } }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* sessizce geç */
    }
  }, [rol, kaynak]);

  return null;
}
