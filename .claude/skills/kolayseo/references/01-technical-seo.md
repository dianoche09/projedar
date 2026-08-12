# Layer 1 — Technical SEO

Files: `templates/seo.ts`, `templates/robots.route.ts`, `templates/sitemap.ts`, `next.config`.

## seo.ts (the single source)
Copy `templates/seo.ts`. Fill `siteConfig` (name/title/description/url/keywords/twitterHandle/locale) and
the static schema objects (legalName/address/contactPoint/sameAs/knowsAbout/geo). Everything else derives
from these. `generateMetadata()` adds `| Brand` to titles, self-referencing canonical, OG + Twitter card,
robots directives; `noIndex: true` for legal pages.

- Title: keyword-first, ≤60 chars. Description: 120-160 chars with a soft CTA.
- `keywords` field is dead for Google ranking (since 2009) but kept for OG/AI — do not invest effort there.

## robots.txt (dynamic Route Handler)
Copy `templates/robots.route.ts` to `src/app/robots.txt/route.ts` (a directory with `route.ts`, NOT a
static file). It: allows 27 AI crawlers explicitly; blocks private paths for generic bots (incl. `/_next/`);
does NOT block `/_next/` for Googlebot/Bingbot (blocking it breaks rendering, hurts CWV, triggers "indexed
despite blocked"); appends Sitemap/Host/llms.txt pointers + `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.

## sitemap.ts (dynamic)
Copy `templates/sitemap.ts` to `src/app/sitemap.ts`. Start with static pages; add programmatic sections
(Layer 4) and the DB blog feed. **Only include slugs with a real `page.tsx`** — non-existent slugs are
soft-404s. DB-fed sections wrapped in try/catch (graceful degrade if DB is down). Priorities: home 1.0,
tools 0.9, programmatic 0.7-0.8, info 0.6, legal 0.3.

## next.config (canonical + Link header)
Add to `next.config.js`:
- **Canonical-domain 301**: apex → www (or your choice). One domain = consistent session/cookies; prevents
  OAuth session splitting. Redirect only when host ≠ target (no loop).
- **301 merges**: old/variant paths → real route (kills soft-404 + preserves link equity).
- **RFC 8288 `Link` header on `/`**: `</.well-known/api-catalog>; rel="api-catalog"`, `</llms.txt>; rel="alternate"; type="text/markdown"`, `</sitemap.xml>; rel="sitemap"`.
- `images.formats: ['image/avif','image/webp']`, `output: 'standalone'`.

## Validate
- [ ] `/robots.txt` 200; 27 AI crawlers `Allow: /`; Sitemap+Host+Content-Signal present.
- [ ] `/sitemap.xml` 200; no 404 slugs; DB blog appears.
- [ ] apex→www 301; old paths 301; canonical self-referencing on pages.
- [ ] Homepage response has the `Link` header.
