"use client";

/**
 * Sektörel içerik analitiği — hafif köprü.
 *
 * Mevcut PostHog kuruluysa `window.posthog.capture`'a yazar; kurulu değilse
 * sessizce no-op'tur (ikinci bir analytics sistemi kurmaz). Analitik hiçbir
 * zaman kullanıcı akışını bozmaz.
 */

export type IcerikOlay =
  | "content_view"
  | "related_content_click"
  | "source_click"
  | "content_cta_click"
  | "signup_from_content"
  | "calculator_started"
  | "calculator_completed";

export function icerikOlay(ad: IcerikOlay, props?: Record<string, unknown>): void {
  try {
    const ph = (window as unknown as { posthog?: { capture?: (e: string, p?: unknown) => void } }).posthog;
    ph?.capture?.(ad, props);
  } catch {
    /* analitik asla akışı bozmaz */
  }
}
