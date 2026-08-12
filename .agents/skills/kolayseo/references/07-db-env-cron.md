# Layer 7 — DB · Env · Cron · Full validation

## Prerequisites (fresh project)
- **npm deps** used by templates: `npm i @supabase/supabase-js jose` (+ `@types/node` for `process`).
- **Path alias**: templates import via `@/*` → ensure `tsconfig.json` maps `"@/*": ["./src/*"]`.
- **Glue files** (copy before Layer 5 libs — they import these): `templates/supabase-server.ts` →
  `src/lib/supabase/server.ts`; `templates/email.ts` → `src/lib/email.ts`; `templates/admin/require-admin.ts`
  → `src/lib/admin/require-admin.ts` (**wire to your auth — fails closed at 501**).
- **next.config**: merge `templates/next.config.snippet.js` (canonical redirect + RFC 8288 Link header).

## Migrations (`templates/migrations/`)
Apply in order (Supabase). All are RLS-enabled with NO public policy (service-role only via admin API).
- `arama_istihbarati.sql` — SerpAPI snapshot store.
- `seo_findings.sql` — findings queue + site-health trend (OpenSEO/GSC bridge).
- `cron_heartbeats.sql` — cron liveness.
- Also assumed: a `blog_posts` table (slug, title, category, excerpt, status, published_at, updated_at) for
  the sitemap + llms.txt blog feed. If you don't have blogs, drop those feed sections.

## Environment variables
| Env | Required? | For |
|-----|-----------|-----|
| `NEXT_PUBLIC_SITE_URL` | Yes | `siteConfig.url` (canonical/OG/sitemap root). |
| `NEXT_PUBLIC_SUPABASE_URL` | DB | Supabase client (sitemap/llms.txt blog feed). |
| `SUPABASE_SERVICE_ROLE_KEY` | DB | Service role (intelligence tables + blog). **Secret.** |
| `CRON_SECRET` | Cron | `Bearer` auth for all crons. Must be set in prod. |
| `SERPAPI_API_KEY` | Command Center | Weekly position + AI Overview scan. |
| `GOOGLE_GSC_SA_KEY` | GSC (opt.) | Service account JSON (base64 or raw). Null → SerpAPI fallback. |
| `GSC_SITE_URL` | GSC (opt.) | `sc-domain:example.com`. |
| `INDEXNOW_KEY` | IndexNow (opt.) | Public token; default in code. Must match `public/<key>.txt`. |
| `INDEXNOW_HOST` | IndexNow | Your host (e.g. `www.example.com`). |
| `ADMIN_NOTIFY_EMAIL` | Digest (opt.) | Weekly SEO mail recipient. |
| `RESEND_API_KEY` / SMTP | Digest | Email sender. |

`.env` is never committed. Only the IndexNow key is non-secret; everything else is a secret / server-only.

## Cron (`templates/vercel.crons.json`)
Merge into `vercel.json`:
```
/api/cron/arama-istihbarati   0 4 * * 1     (Mon 04:00 — scan)
/api/cron/seo-weekly-digest   0 7 * * 1     (Mon 07:00 — email, AFTER the scan)
/api/cron/seo-distribution    0 3 */3 * *   (every 3 days 03:00 — IndexNow)
```
Order matters: the digest runs after the scan. Every cron is `dynamic='force-dynamic'`, `Bearer CRON_SECRET`
guarded, and calls `recordCronRun`. **Exclude `/api/cron/*` from any middleware matcher** — a 307 redirect
kills crons silently.

## Full post-install validation
**Layer 1-2:** robots/sitemap 200, no soft-404 slugs; homepage has 6 JSON-LD scripts; a landing passes
Rich Results Test; canonical self-ref; apex→www 301; Link header present.
**Layer 3:** `/llms.txt` + `/llms-full.txt` 200; llms.txt has base + categorized DB blog; geo audit 68+.
**Layer 4:** 5 sample programmatic pages each unique; no empty/fabricated sections; unique FAQPage each.
**Layer 5:** migrations applied (RLS, no public policy); cron auth 401/200; snapshots write;
`submitToIndexNow` 202/200 + `public/<key>.txt` 200; `seo-distribution` submits sitemap URLs; GSC data or
graceful null; digest renders 4 blocks incl. "nothing new"; the 3 admin API routes return data (the admin
panel UI is built per-niche on top of them — §05).
**Layer 6:** CityLinkHub under programmatic pages; footer links all key landings; E-E-A-T block on
informational landings; embed gallery indexed + iframe pages noindex.
