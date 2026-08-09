"use client";

import { useEffect } from "react";
import { icerikOlay } from "@/lib/icerik/analitik";

/** Sayfa görüntüleme olayı (content_view). Görsel çıktı üretmez. */
export function IcerikGoruntuleme({ slug, kategori }: { slug: string; kategori: string }) {
  useEffect(() => {
    icerikOlay("content_view", { slug, kategori });
  }, [slug, kategori]);
  return null;
}
