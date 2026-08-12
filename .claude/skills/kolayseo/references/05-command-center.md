# Layer 5 — Command Center (search intelligence, closed loop)

Files: `templates/collect.ts`, `templates/opportunities.ts`, `templates/indexnow.ts`, `templates/gsc.ts`,
`templates/findings.ts`, `templates/heartbeat.ts`, `templates/crons/*`, `templates/admin/*` (3 API routes +
`require-admin` guard), `templates/supabase-server.ts`, `templates/email.ts`, migrations.

**Glue (copy first — the libs/crons import these):** `templates/supabase-server.ts` → `src/lib/supabase/server.ts`
(zero-arg `createServiceClient`); `templates/email.ts` → `src/lib/email.ts` (returns `{success,error}`);
`templates/admin/require-admin.ts` → `src/lib/admin/require-admin.ts` — **ships failing-closed (501); wire it
to YOUR auth before shipping.** npm deps: `@supabase/supabase-js`, `jose`.

**Goal:** turn a one-way "thermometer" into a closed loop — measure → derive opportunity → surface action.

## 1. Collect (Arama İstihbaratı) — `collect.ts`
Copy to `src/lib/arama-istihbarati/collect.ts`. Fill `SORGULAR` (your niche keywords, split informational
vs commercial-intent), `RAKIP_DOMAINS`, `KENDI_DOMAIN`, `GL`/`HL`. One SerpAPI call per query yields 3
signals with no extra cost: own+competitor positions, advertisers, AI Overview (present? are we a source?).
Writes one `arama_istihbarati` row per query.

## 2. Opportunity engine — `opportunities.ts`
Copy to `src/lib/arama-istihbarati/opportunities.ts`. `deriveOpportunities(rows)` → one highest-priority
opportunity per query from the latest (+previous) snapshot. 4 types: **gap** (not top-10 but commercial
competitor is → open a landing), **drop** (position worsened → check page), **push** (#4-10 → internal
links+FAQ+meta), **ai_overview** (AIO present, not a source → answer-first+FAQPage). Fill
`COMMERCIAL_COMPETITORS`; official/government sources are excluded (being below them is normal). No new
table/cron — derived from existing snapshots.

## 3. IndexNow distribution — `indexnow.ts` + cron
Copy `indexnow.ts` to `src/lib/seo/indexnow.ts`. Set `HOST` + `INDEXNOW_KEY`, publish `public/<key>.txt`
(the key is a public token, not a secret). Copy `crons/seo-distribution.route.ts` to
`src/app/api/cron/seo-distribution/route.ts` — it pulls all sitemap URLs and submits to IndexNow
(Bing/Yandex/Naver; Google does not use IndexNow). Classic sitemap-ping is dead (2023); this is the instant channel.

## 4. GSC client — `gsc.ts`
Copy to `src/lib/seo/gsc.ts`. Service account JSON (`GOOGLE_GSC_SA_KEY`) → `jose` RS256 JWT → OAuth →
Search Analytics. No Google SDK. `isGscConfigured()` / `fetchSearchAnalytics()` / `gscDateRange()`. Returns
null with no credential → system keeps running on SerpAPI (graceful degrade).

**Shortcut when OpenSEO already has GSC connected (no Google key needed):** the service-account path is often
blocked by the `iam.disableServiceAccountKeyCreation` org policy (Google "secure by default" — key download
disabled). Do NOT fight the policy. If GSC is linked to your OpenSEO project, skip the key entirely: pull real
GSC through the OpenSEO MCP `get_search_console_performance` (clicks/impressions/CTR/position) and `inspect_urls`
(index status, both credit-free). For in-app display without a Google key, have the monthly OpenSEO run write a
GSC snapshot into `seo_findings`; panel + digest read it from there. Only chase the SA key if you truly need
real-time in-app GSC. (This also answers "is our long-tail actually indexed?" — inspect a sample; a project on
real proprietary data is usually fully indexed, unlike the "99% unindexed" autopilot-SEO horror stories.)

## 5. Findings queue + OpenSEO bridge — `findings.ts` + `seo_findings`
Copy to `src/lib/seo/findings.ts`. **OpenSEO is an MCP tool (not code).** Its monthly deep audit
(orphan/duplicate/backlink) output is written into `seo_findings` (source='openseo') via an admin API; the
digest + panel consume it. `category='site_health'` rows carry a metric SNAPSHOT for delta/trend;
`healthDelta()` reads ▲▼. GSC CTR opportunities also land here (source='gsc'). To run the audit: call the
OpenSEO MCP tools (`run_site_audit`/`get_audit_issues`/`get_backlinks_overview`), then insert the summarized
findings. If OpenSEO isn't connected, the queue simply stays empty (system still works).

**Closing discipline (measure → verify → act OR close-with-evidence):** before "fixing" a finding, verify it
against fresh data — audits go stale fast. Real cases from the source project: a "duplicate meta" finding whose
pages already had unique metadata (stale audit → real remaining work was just `noindex` on auth/utility pages);
a "slow page" that was already ISR-cached (the audit measured a cold-start regeneration, not a persistent
defect → the fix was lengthening `revalidate`, not a rewrite); a "duplicate content" flag on a page doing
millions of impressions where GSC showed Google already disambiguates the distinct intents (canonical surgery
there is high-risk and unwarranted). So: **not every finding is a code fix** — some resolve to `status='done'`
or `'ignored'` with an evidence note in `resolved_by`. High-risk changes (canonical/redirect/delete on money
pages) stay human-reviewed, never auto-applied. This is the guardrail that keeps the loop from becoming the
"autopilot slop" it's meant to beat.

## 6. Weekly digest — `crons/seo-weekly-digest.route.ts`
Copy to `src/app/api/cron/seo-weekly-digest/route.ts`. One email, 4 blocks: site-health delta, open
findings, opportunity queue, GSC real data (if set). Replace the email renderer with yours; the DATA
fetching is the reusable part. Keeps a "nothing new this week" line so the cadence holds.

## 7. Collect cron + admin (all templated in `templates/admin/`)
- `crons/arama-istihbarati.route.ts` → `src/app/api/cron/arama-istihbarati/route.ts` (Monday 04:00).
- `admin/arama-istihbarati.route.ts` → `src/app/api/admin/arama-istihbarati/route.ts`: GET (last 90d
  snapshots + `deriveOpportunities` + summary), POST (manual scan). Guarded by `requireAdmin`.
- `admin/gsc-performance.route.ts` → `.../gsc-performance/route.ts`: top queries + CTR opportunity.
- `admin/seo-findings.route.ts` → `.../seo-findings/route.ts`: **the OpenSEO/GSC bridge WRITE path** —
  GET queue+health, POST insert audit findings (`source='openseo'|'gsc'|'manual'`), PATCH resolve-with-evidence.
- **Admin panel** `src/app/dashboard/admin/arama-istihbarati/page.tsx`: **build the UI per-niche** on top of
  these 3 APIs — 4 cards: Intelligence, Opportunity Queue, Site Health & Findings, GSC Real Data. (This React
  page is the ONE piece not templated — it follows your design system.) **Do not add a new menu item** —
  fold into one page (north-star: low clutter, high value).

## Heartbeat
Copy `heartbeat.ts` to `src/lib/cron/heartbeat.ts` + `migrations/cron_heartbeats.sql`. Every cron calls
`recordCronRun(name)` right after auth. A stale cron (no run in 2× its interval) is flagged in the admin.

## Validate
- [ ] cron auth: 401 without / 200 with `Bearer CRON_SECRET`.
- [ ] `arama-istihbarati` writes snapshots; `deriveOpportunities` returns items.
- [ ] `submitToIndexNow` returns 202/200; `public/<key>.txt` 200.
- [ ] GSC connected → data; not connected → null (fallback intact).
- [ ] digest email renders 4 blocks; "nothing new" on a quiet week.

## Autonomous-loop lessons (2026-08-09, source project)

Turning the panel from a "dashboard you only look at" into an autonomous, zero-touch SEO tool surfaced
these. Obey them when building the autonomous loop:

- **Panel must be action, not a gauge.** Every opportunity/finding row needs a concrete button: "generate
  content" (automatic) + "open dev request" (code-fix → `dev_requests`). A bare "resolve/ignore" is not
  enough — the user will say "I don't want a flat dashboard."
- **Shift automation from code-fix to content/data.** In an autonomous system the risky thing is mutating
  existing code. Most SEO leverage is NOT code anyway: generate+publish content, internal links
  (data-driven), meta (programmatic), re-crawl — these are zero-touch safe. The rare code-fix goes to a
  human/dev agent, never silently to prod.
- **No zero-review content on a sensitive domain.** Zoning/legal/health etc.: auto-generated content =
  wrong-info → reputation/legal risk. Safety valve: auto-publish + `noindex` → auto-index after N days or a
  spot-check. This balances "don't make me lift a finger" against legal exposure.
- **OpenSEO is NOT fit for a fully-autonomous cron.** It's an MCP tool (Claude-side) with interactive auth;
  a headless/cron Claude may not reach the connector. For autonomy either DataForSEO REST (extra cost) or a
  `ScheduleWakeup` timed-Claude (MCP-auth is fragile). SerpAPI is already autonomous; bridge OpenSEO as
  timed-Claude PLUS a guaranteed manual "Pull from OpenSEO" button in the panel.
- **Credits deplete silently.** OpenSEO ~10k credits/mo; `research_keywords` + `run_site_audit` burn them.
  Refresh only stale data (`volume_updated_at` > 30d), not everything; add a budget threshold + a
  `skipped_budget` log row. Silent depletion = the loop stops and nobody notices.
- **Auto-close is a false-positive trap.** "Finding absent in the new audit = resolved" is dangerous (a
  crawl limit may have skipped the page). Do NOT close without (a) the audit succeeding with crawl coverage
  ≥ ~80% of the prior run, AND (b) the finding absent across 2 consecutive successful audits.
- **Finding dedup is mandatory.** Upsert by `(source, category, url)`; otherwise every audit re-creates the
  same finding and the queue bloats.
- **Keep every module wizard-installable.** Each module = generic (config-driven) + a Claude-driven install
  step, so `/kolayseo` can set it up step-by-step in another project.

Full design rationale for the autonomous loop lives in the source project's
`docs/superpowers/specs/2026-08-09-openseo-koprusu-design.md` (Module 1: OpenSEO Bridge).
