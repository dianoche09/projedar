"use client";

import { useSyncExternalStore } from "react";

/**
 * useAzalt · prefers-reduced-motion aboneliği (Mockup 02).
 * useSyncExternalStore ile lint-güvenli: efekt içinde senkron setState yok,
 * SSR anlık görüntüsü false (sunucuda hareket varsayımı, istemcide düzelir).
 */

const SORGU = "(prefers-reduced-motion: reduce)";

function abone(dinle: () => void): () => void {
  const mq = window.matchMedia(SORGU);
  mq.addEventListener("change", dinle);
  return () => mq.removeEventListener("change", dinle);
}

function oku(): boolean {
  return window.matchMedia(SORGU).matches;
}

function sunucuOku(): boolean {
  return false;
}

export function useAzalt(): boolean {
  return useSyncExternalStore(abone, oku, sunucuOku);
}
