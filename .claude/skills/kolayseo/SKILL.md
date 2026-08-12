---
name: kolayseo
description: Use when setting up or auditing SEO/GEO on any Next.js (App Router) web project — installing robots/sitemap/llms.txt, JSON-LD schema, programmatic SEO pages, AI-search (GEO) optimization, or a search-intelligence command center (SerpAPI/GSC/IndexNow/OpenSEO). Replicates the Kolayimar Google Search success as a niche-agnostic engine.
---

# KolaySEO — Portable SEO + GEO Engine

## Overview

A battle-tested, niche-agnostic SEO/GEO system extracted from Kolayimar (which reached millions of
Google impressions). Installs as **5 layers** into any Next.js App Router project. The engine is
`siteConfig`-driven: fill one config object and the whole system re-brands.

**Core thesis (why this architecture):** modern search has three surfaces that must be served at once —
classic SEO (Google/Bing), GEO (ChatGPT/Perplexity/Gemini/AI Overviews), and a closed-loop intelligence
layer that measures → derives opportunities → acts. On-page perfection alone does NOT win; **domain
authority (backlinks) is the ceiling.** So the ROI order is baked in: programmatic scale + easy-win
landings first (no backlinks needed), then authority levers, then intelligence automation.

**Honest scope:** this engine replicates the *machinery and process* (~70% of the win). It does NOT
manufacture *authority* (backlinks, domain age) or *niche keyword data* — those need per-project human
work (widget distribution, directory registration, real content). Do not promise "install → instant #1."

## Two modes

- **Builder** (Layers 1-6) — install machinery into a project. Most of this skill.
- **Diagnostician** (`references/10-audit.md`) — point at a *live, shipped* site and produce a prioritized,
  verify-before-fix findings report. Use after an install (deep validation), on an inherited codebase, or
  when traffic drops. Findings map back to the layer/template to change — audit with mode 2, fix with mode 1.

## When to use

- Starting SEO/GEO on a new Next.js project, or auditing an existing one.
- Diagnosing a live site: "why am I not ranking," traffic drop, SEO health check → **Audit mode** (`references/10-audit.md`).
- User wants "the Kolayimar SEO system" / "same search success" on another project.
- Building: robots.txt, sitemap.xml, llms.txt, JSON-LD schema, programmatic city/category pages,
  AI-crawler access, a search-intelligence panel (SerpAPI + GSC + IndexNow + OpenSEO bridge).

**Prerequisites:** Next.js App Router + TypeScript. Optional per-layer: Tailwind (landings), Supabase
(intelligence tables + dynamic blog feed), Vercel (crons). External services (Layer 5): SerpAPI key,
Google Search Console service account, IndexNow (free), OpenSEO/DataForSEO MCP, an email sender.
**Templates need:** `npm i @supabase/supabase-js jose` + `@types/node`; the `@/* → src/*` tsconfig alias;
and the Layer 5 `requireAdmin` guard wired to your auth (it ships failing-closed at 501).

## The 5 layers

| Layer | What | Reference | Needs |
|-------|------|-----------|-------|
| 1 · Technical SEO | siteConfig, metadata, robots, sitemap, next.config | `references/01-technical-seo.md` | — |
| 2 · Structured Data | StructuredData component + all JSON-LD generators | `references/02-structured-data.md` | — |
| 3 · GEO / AI-search | llms.txt, AI-crawler allow-list, Link headers, answer-first | `references/03-geo-ai.md` | — |
| 4 · Programmatic SEO | dynamic `[city]/[category]` routes, deterministic content engine | `references/04-programmatic.md` | Tailwind |
| 5 · Command Center | SerpAPI collect, opportunity engine, IndexNow, GSC, OpenSEO bridge, digest | `references/05-command-center.md` | Supabase + services |
| + Authority | CityLinkHub mesh, footer links, E-E-A-T, embed widgets | `references/06-authority-playbook.md` | — |
| + Infra | migrations, env, vercel.json crons | `references/07-db-env-cron.md` | Supabase + Vercel |
| + Audit | **diagnostician mode** — scan a live site, prioritized findings, verify-before-fix | `references/10-audit.md` | — |

`templates/` holds copy-paste, niche-agnostic code for the reusable core: Layers 1-3, 5 (libs + crons +
3 admin API routes + `supabase-server` + `require-admin` guard + `email` + `next.config`) + CityLinkHub.
Only the **admin panel UI** (the visual React page) and Layer 4 niche data are built per-project — the
reference docs specify them.

## Strategy & productization references (optional — read when relevant)

Not needed for a plain install, but read these when the goal is understanding *why* or selling KolaySEO:

| Reference | Read when |
|-----------|-----------|
| `references/00-strategy-blueprint.md` | Full narrative/rationale, 5-layer deep dive, anti-pattern table, Kolayimar case study. The "why" behind every design choice. |
| `references/08-go-to-market.md` | Turning KolaySEO into a sellable product: positioning (niche programmatic + GEO-first, NOT a generic SEO tool), ICP (A: end-businesses, B: agencies/white-label), 3-tier packaging, pricing, first-90-days. |
| `references/09-multi-tenant-saas.md` | Turning the single-tenant engine into a multi-tenant SaaS. Key insight: the **Command Center is agentless** (works on any domain via SerpAPI/GSC/sitemap, no client-side code) → sellable without an install. Tenant data model, per-tenant credentials, cron fan-out + cost, onboarding, billing, phased plan. |

## Install process (phased — put each phase in TodoWrite)

Read the layer reference before building it; copy from `templates/` and fill `siteConfig` + config points.

1. **Faz 0 — Skeleton + single source.** Copy `templates/seo.ts`, fill `siteConfig` (name/title/description/
   url/keywords/sameAs/address/contactPoint) for THIS brand. Copy `templates/StructuredData.tsx` verbatim
   (React 19-safe — do not "simplify" it, see `references/02`).
2. **Faz 1 — Technical (Layer 1).** `templates/robots.route.ts`, `templates/sitemap.ts` (static pages
   first), `next.config` redirects + RFC 8288 Link header. Inject 6 site-wide schema in root `layout.tsx`.
3. **Faz 2 — GEO (Layer 3).** `templates/llms.route.ts` + `templates/llms-base.txt` (fill the standard
   structure), `public/llms-full.txt`. AI-crawler allow-list already in robots.
4. **Faz 3 — Programmatic (Layer 4).** Niche data files + `templates/district-content.ts` engine
   (replace content pools with YOUR niche's true statements) + dynamic routes + FAQ generators. Add
   programmatic sections to sitemap. **Doorway-safe: every page needs real unique content.**
5. **Faz 4 — Command Center (Layer 5).** Migrations (`templates/migrations/*`), `templates/collect.ts`
   (fill SORGULAR + competitor domains), `opportunities.ts`, `indexnow.ts` + `public/<key>.txt`, `gsc.ts`,
   `findings.ts` (OpenSEO bridge), crons, admin panel, `vercel.json`, env.
6. **Faz 5 — Authority (code + human).** CityLinkHub mesh + footer links + E-E-A-T + embed widgets
   (code); directory registration + widget distribution + content (human — `references/06`).

## Generic-mode config points (what to fill per project)

- `seo.ts` → `siteConfig` + static schema objects (legalName/address/contactPoint/sameAs/knowsAbout/geo).
- `collect.ts` → `SORGULAR` (your niche keywords), `RAKIP_DOMAINS` (competitors), `KENDI_DOMAIN`.
- `indexnow.ts` → `HOST` + `INDEXNOW_KEY` + `public/<key>.txt`.
- `district-content.ts` → curated entries + variant pools (niche-true statements) + your axis data
  (`CITY_DISTRICTS` or your category matrix).
- `CityLinkHub.tsx` → your entity list (cities/categories) instead of `TURKISH_CITIES`.
- `next.config` → canonical domain redirect host; `llms-base.txt` → full brand content.

## Anti-patterns (baked into the code — never undo)

Full table in `references/06`. Top ones: sitemap-ping is dead (2023) → use IndexNow (Bing/Yandex, not
Google); llms.txt ≠ GSC (different channels); meta keywords dead since 2009; JSON-LD as JSX `<script>`
gets dropped by React 19 → use `dangerouslySetInnerHTML` (see `templates/StructuredData.tsx`); dynamic
`readFile` path bundles all of `public/` (>250MB deploy error) → literal paths; thin programmatic pages
trigger doorway penalty across the whole site; `/api/cron/*` blocked by middleware 307 kills crons silently.

**Field lessons (2026-08, from the source project):**
- GSC service-account key is often blocked by the `iam.disableServiceAccountKeyCreation` org policy. Don't
  fight it — pull GSC via the OpenSEO MCP (`get_search_console_performance` / `inspect_urls`, credit-free)
  and snapshot into `seo_findings`. Chase the key only for real-time in-app GSC. (§05)
- Never bulk-add programmatic entities from memory. Query your data source's per-entity coverage first;
  expand only where real data exists (≥ threshold), defer the rest, verify one page live before the batch. (§04)
- Never blindly "fix" an audit finding. Verify against fresh GSC/`inspect_urls` first — audits go stale, and
  some findings resolve to no-action-with-evidence (already-ISR perf, self-canonical money page, stale meta). (§05)
- **An SEO endpoint is not "missing" just because a static `public/` file is absent.** On Next.js App Router,
  `robots.txt` / `sitemap.xml` / `llms.txt` are usually served by route handlers (`src/app/<name>/route.ts`)
  or metadata files (`app/robots.ts`, `app/sitemap.ts`). Grep `app/**/route.ts` + `app/{robots,sitemap}.ts`
  before ever reporting "no llms.txt/robots/sitemap." (§01/§03)
- **Private-route audit must be auth-aware.** Auth-gating (login redirect / enforced middleware) is itself a
  Google-sanctioned index block — do NOT auto-flag "no page-level noindex" on auth-gated routes as HIGH.
  Verify first: (a) anonymous Googlebot HTTP result, (b) login redirect?, (c) middleware actually enforced?,
  (d) robots disallow present? Reserve the "crawl-allow + noindex" fix for PUBLIC-but-noindex routes (e.g.
  token share pages), NOT auth-gated panels. (§01)
- **"competition: LOW" (Google-Ads-derived) is ADVERTISER bid competition, NOT organic SEO difficulty.** Never
  call a keyword "winnable" from it. Use real Keyword Difficulty (KD) AND read the actual top-10 SERP: who
  ranks (GİB/gov, banks, DA-90 portals like sahibinden/hepsiemlak, established calculator/finance domains
  like hesapkurdu/hangikredi vs weak blogs?). A zero-authority new site does not instantly take even a KD-0
  term if strong domains hold the SERP. (§04/§10)
- **2026 Google rich-result reality — do NOT build schema for dead features.** HowTo rich result was
  deprecated (2023); **FAQ rich result was fully removed (May 2026, docs gone June 2026).** Keep
  BreadcrumbList; use WebApplication/WebPage semantic markup where apt; write FAQ/steps content when it helps
  the USER — but never add FAQPage/HowTo expecting a Google rich result. **`llms.txt` is NOT needed for Google
  Search** (no ranking effect) — it's an AI-distribution channel, classify RECOMMENDED not CORE. **IndexNow =
  Bing/Yandex/Naver/Seznam/Yep, NOT Google** — never report it as a Google SEO mechanism. (§02/§03/§10)

## Validation

After each layer, run the matching checklist in the layer's reference. Full post-install checklist in
`references/07-db-env-cron.md`. Minimum: robots/sitemap/llms.txt return 200 and reference each other;
Rich Results Test passes on a landing; cron auth returns 401 without / 200 with `Bearer CRON_SECRET`.
