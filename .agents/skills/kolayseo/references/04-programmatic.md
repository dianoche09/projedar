# Layer 4 — Programmatic SEO (the traffic machine)

Files: `templates/district-content.ts`, `templates/slug.ts`, `templates/CityLinkHub.tsx` (Layer 6),
your niche data files, dynamic routes.

**Proven model:** `[parent]/[entity]` pages ranked #4-6 with 4-22% CTR and hundreds of clicks each in the
source project. Must be **doorway-safe** — every page needs REAL unique content or a thin-content penalty
hits the WHOLE site.

## The deterministic content engine (`district-content.ts`)
Copy `templates/district-content.ts`. Two layers:
1. `CURATED` — real characteristics for well-known entities (fabricate nothing; broadly-true facts).
2. Variant pools (`INTRO_VARIANTS`, `CONTENT_VARIANTS`, `CTA_TAG_VARIANTS`, `CHARACTER_DESCRIPTORS`) picked
   by a **stable hash** of the entity name with different bit-shifts → combinatorial uniqueness. Uncurated
   entities still get a unique-looking, true page.
```ts
const h = stableHash(slugify(entity))
INTRO_VARIANTS[h % n] · CONTENT_VARIANTS[(h>>>3) % n] · CTA_TAG_VARIANTS[(h>>>5) % n]
```
**Replace the pools with YOUR niche's generally-true statements.** Keep the mechanism.

## Dynamic routes
`src/app/<axis>/[parent]/[entity]/page.tsx` with: `generateStaticParams()` (SSG), `generateMetadata()`
(unique title/description/keywords/canonical/OG per entity), `revalidate` (e.g. 21600 for 6h data), a
`notFound()` guard. Compose the page from `getEntityContent()` blocks + real data (if any). **Render a
data-driven section ONLY when data exists** — never show empty/fabricated sections.

Add a dynamic `opengraph-image.tsx` per axis for unique social cards (optional but strong).

## Niche data files (customize)
- `src/constants/entities.ts` — your primary axis list + `getAllEntityParams()`, `findByParams()`.
- Secondary axes as needed (category × entity matrices).
- `src/lib/faqs/service-faqs.ts` — per-page FAQ sets + parametric generators (e.g.
  `entityFAQs(parent, entity)`) so each programmatic page emits a unique FAQPage schema.
- Optional **topic system** (like imar-hukuku): one dynamic route + a typed content-block model
  (`p/ul/callout/warn/steps/cmp/table` + faqs + howTo + answerFirst) + `topics/<slug>.ts` files +
  `topics/index.ts` (`BUILT[]` — only fully-written topics produce routes). Targets zero-difficulty,
  high-volume informational keywords.

## Data-driven expansion (anti-thin discipline)
Do NOT bulk-add entities from memory — that is exactly how the thin-content penalty hits. Before extending
`entities.ts`:
1. **Query your data source's coverage first** (e.g. `SELECT city, count(*), count(distinct district) FROM
   listings WHERE active GROUP BY city`). Fully-expand only entities with REAL data above a threshold (the
   source project used ≥150 rows/province); **defer data-sparse entities** — their data-driven section renders
   empty, leaving only spun boilerplate = thin. Log what you deferred and why.
2. **Match entity names to the EXACT values in your data** (query `distinct district`) so the data-driven
   section actually renders — especially the "center" entity (is it `Merkez`, or the province name?). A
   name mismatch = the real-data band silently never shows.
3. **Verify one new page live** (`200` + a unique title reflecting that entity) BEFORE the bulk add.
4. **Prioritize by proven demand:** if GSC shows sibling entities of the same parent ranking well (high CTR at
   position 3-5), that parent's remaining entities will rank too — expand those first. Demand + data, not guesses.

## Add to sitemap
Map `getAllEntityParams()` into sitemap sections (priority 0.7-0.8).

## Validate
- [ ] 5 sample `[parent]/[entity]` pages — each has genuinely unique intro/content (hash-variant works).
- [ ] No fabricated/empty data sections rendered.
- [ ] Each programmatic page emits a unique FAQPage + Breadcrumb.
