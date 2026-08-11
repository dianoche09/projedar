"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// Projedar'ın KENDİ PostHog projesi (EU / KVKK). KolayIMAR'la ayrı; anahtar public (client) tiptir.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_vsFn4E3LSFZdAnFvnFjHu2fG2Km6NJuMdHtnZuPmESTp";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

/**
 * PostHog istemci sağlayıcı. Session Replay input maskeli (KVKK: e-posta/parola sızmaz),
 * pageview'ler SPA rota değişiminde elle yakalanır, anonim profil oluşturulmaz (identified_only).
 * Ürün-gerçeği kayıt hunisi zaten kendi `events` tablomuzda; bu katman replay + web trafiği için.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !KEY) return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
    posthog.init(KEY, {
      api_host: HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // rota değişimini elle yakalıyoruz (App Router SPA)
      capture_pageleave: true,
      autocapture: true,
      session_recording: { maskAllInputs: true }, // KVKK: tüm input'lar (e-posta/parola) maskeli
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewIzle />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/** SPA rota değişiminde $pageview gönderir (capture_pageview:false olduğu için). */
function PageViewIzle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  useEffect(() => {
    if (!pathname || !posthog) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);
  return null;
}
