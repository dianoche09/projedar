# Layer 10 · Audit Mode (the diagnostician)

KolaySEO Layers 1-5 are a **builder** — they install machinery. This layer is the **diagnostician** —
it points at a *live, already-shipped* site and answers "what is broken, what is missing, and in what
order do I fix it." Use it after an install (validation gone deep), on an inherited project, or when
traffic drops.

> Distilled from the standalone `seo-audit` skill and fused with KolaySEO's own field lessons. Where a
> finding maps to a KolaySEO layer, fix it *there* (don't hand-patch) — cross-refs are inline.

## The one rule that overrides everything

**Never blindly "fix" an audit finding.** Audits go stale. Verify every finding against *fresh* GSC /
`inspect_urls` (OpenSEO MCP, credit-free) before acting. Many findings resolve to **no-action-with-evidence**:
already-ISR performance, a self-canonical money page flagged as "duplicate," stale meta that GSC already
re-crawled. This is the same discipline baked into Layer 5 (§05) — an audit is a *hypothesis list*, not a
work order. (See KolaySEO field lessons in `SKILL.md`.)

## Tooling limits — read before you report anything

- **`web_fetch` / `curl` cannot see JSON-LD schema.** They strip `<script>` tags on conversion, and most
  schema is JS-injected (or, in KolaySEO's case, rendered via `dangerouslySetInnerHTML` — see
  `templates/StructuredData.tsx`). Reporting "no schema" from `web_fetch` is a **false finding**.
  Verify with: browser tool → `document.querySelectorAll('script[type="application/ld+json"]')`, the
  [Rich Results Test](https://search.google.com/test/rich-results), or a Screaming Frog export.
- **Googlebot crawls from US IPs with no `Accept-Language` header.** Don't audit locale behavior through a
  Turkish IP and assume Google sees the same.
- Prefer GSC ground-truth (Coverage, CWV report, `inspect_urls`) over any third-party crawler's guess.

## Priority order (fix top-down — a lower item can't rank if a higher one blocks it)

1. **Crawlability & indexation** — can Google find and index it at all?
2. **Technical foundations** — is it fast and functional (Core Web Vitals)?
3. **On-page** — is each page optimized for its target?
4. **Content quality** — does it *deserve* to rank (E-E-A-T)?
5. **Authority & links** — the ceiling; KolaySEO can't manufacture this (see honest-scope note in `SKILL.md`).

---

## 1 · Crawlability & Indexation → fix in Layer 1

- **robots.txt**: no unintentional blocks; AI-crawler allow-list present (Layer 3); sitemap referenced.
- **Sitemap**: 200, only canonical + indexable URLs, programmatic sections included (Layer 4), updated.
- **Index status**: `site:domain` vs expected; GSC Coverage report. Compare indexed count to intent.
- **Indexation blockers**: stray `noindex` on money pages, canonicals pointing the wrong way, redirect
  chains/loops, soft 404s, duplicate content without canonicals.
- **Canonicalization**: self-referencing canonical on every unique page; HTTP→HTTPS; www consistency;
  trailing-slash consistency. (KolaySEO `next.config` handles the canonical host redirect — verify it fired.)
- **Middleware trap** (KolaySEO-specific): `/api/cron/*` or route groups silently 307'd by middleware kill
  crawling *and* crons. Confirm cron auth returns 401 without / 200 with `Bearer CRON_SECRET`.

## 2 · Technical Foundations → Layer 1 + gstack `benchmark`

- **Core Web Vitals** (field data, GSC report, not just lab): LCP < 2.5s · INP < 200ms · CLS < 0.1.
  (INP replaced FID — anything citing FID is stale.)
- Speed factors: TTFB, image optimization + modern formats (WebP/AVIF), JS execution, caching headers,
  CDN, font loading. Next.js: confirm ISR/streaming actually engaged before flagging perf.
- **Mobile-first**: responsive (not an `m.` site), tap targets, viewport, same content as desktop.
- **Security**: HTTPS site-wide, valid cert, no mixed content, HSTS (bonus).
- **URL structure**: readable, lowercase, hyphen-separated, no junk params.

## 3 · On-Page → Layer 1 (metadata) + Layer 4 (programmatic)

- **Titles**: unique per page, primary keyword near front, 50-60 chars, brand at end. Flag duplicates
  (the classic programmatic failure — Layer 4 content engine must vary them).
- **Meta descriptions**: unique, 150-160 chars, keyword + value prop + CTA. No auto-generated garbage.
- **Headings**: exactly one H1 containing the primary keyword; logical H1→H2→H3, no skipped levels.
- **Content**: keyword in first 100 words; satisfies intent; **thin programmatic pages = doorway penalty
  across the whole site** (KolaySEO's #1 anti-pattern — every `[city]/[category]` page needs real unique
  content, `references/04`).
- **Images**: descriptive filenames, alt text, compression, lazy loading.
- **Internal linking**: no orphan pages, descriptive anchors, money pages well-linked (this is what the
  Layer 6 CityLinkHub mesh exists to guarantee — audit whether the mesh actually reaches every entity).
- **Keyword cannibalization**: two pages targeting the same term split equity — check title/H1/URL alignment
  and a keyword-mapping doc.

## 4 · Content Quality (E-E-A-T)

- **Experience/Expertise**: first-hand insight, original data, visible author credentials, sourced claims.
- **Authoritativeness/Trust**: contact info, privacy/terms, HTTPS, transparent business identity.
- **Depth**: comprehensive vs top-ranking competitors, answers follow-up questions, kept current.

## 5 · GEO / AI-search (KolaySEO-specific, absent from generic audits) → Layer 3

Generic SEO audits stop at Google. KolaySEO serves three surfaces — audit the AI surface too:

- `llms.txt` + `public/llms-full.txt` return 200 and are self-consistent (all listed URLs live).
- AI-crawler allow-list present in robots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.).
- RFC 8288 `Link` headers present. Answer-first content structure (first 150 chars answer the H2).
- Per-page FAQ schema for citability. Remember: `llms.txt` ≠ GSC — different channels, don't conflate.

## International SEO (only if multi-locale)

- **Hreflang**: self-referencing entry on every page; reciprocal (A→B needs B→A or both dropped); valid
  codes (`en-GB`, never `en-UK`); `x-default` present; all targets 200 + indexable + self-canonical.
- **Never cross-locale canonical** (e.g. `/tr/` → `/en/`) — it suppresses the non-canonical locale entirely.
- **Next.js caveat**: `alternates.languages` does NOT auto-add a self-referencing `<xhtml:link>` — add the
  current locale explicitly or the whole hreflang cluster is ignored.
- Translate *all* visible content (title/description/headings/body), not just chrome — boilerplate-only
  translation creates duplicates and can trip scaled-content-abuse.

---

## Output format — the audit report

**Executive summary**: overall health, top 3-5 priority issues, quick wins.

**Findings** (group by Technical / On-Page / Content / GEO), each as:
- **Issue** — what's wrong
- **Impact** — High / Medium / Low
- **Evidence** — how you found it (and which tool; note if it needs browser-render verification)
- **Fix** — specific recommendation, **naming the KolaySEO layer/template to change**
- **Priority** — 1-5

**Prioritized action plan**: (1) critical blockers → (2) high-impact → (3) quick wins → (4) long-term.

Then, before shipping any fix: re-verify each against fresh GSC / `inspect_urls`. Only act on findings that
survive verification; record the rest as *no-action-with-evidence*.
