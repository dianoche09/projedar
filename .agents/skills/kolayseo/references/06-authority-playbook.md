# Layer 6 — Authority Playbook + Anti-patterns

On-page perfection does NOT win high-volume keywords — **domain authority (backlinks/age) is the ceiling.**
These are the levers that move authority. Some are code; some are human work no code replaces.

## Code levers

### CityLinkHub — internal-link mesh (biggest code lever)
Copy `templates/CityLinkHub.tsx` to `src/components/seo/CityLinkHub.tsx`. Drop it under every programmatic
`[entity]` page. It cross-links the full entity set (internal links = authority flow + crawl path) and can
`sibling`-link two programmatic networks together. In the source project this single mesh rescued 114
orphaned pages. Replace `ENTITIES` with your axis list.

### Footer site-wide link block
Add a footer section linking your ~15 highest-value landings from EVERY page. Landings that receive no
internal links get no authority; this is the cheapest fix.

### E-E-A-T block (`SourcesBlock`)
On informational landings, add a sources/references block: cited regulations/standards + "last updated"
date + a link to your principles page, plus `Article` schema. Do NOT fabricate a named author — use
Organization authorship unless you have a real person. This is Google's trust signal.

### Embed widgets (backlink engine)
Registry `src/lib/embed/tools.ts` (`EMBED_TOOLS[]` = slug/name/landingPath/anchor/height) +
`buildEmbedSnippet(tool)` = `<iframe src="/embed/<slug>">` + a **visible attribution `<a>` link** (the
dofollow backlink). Partners paste the snippet into their sites; the attribution link carries the backlink.
`/embed` gallery is indexed; `/embed/[tool]` iframe pages are `noindex`. This is how big competitors get
millions of backlinks (widget embedded in others' pages).

## Human levers (no code replaces these)
- **Directory registration** — register the brand in relevant directories/indices (raises referring domains).
- **Widget distribution** — actually send the embed snippet to partners (email campaign).
- **Data-PR** — publish a periodic data report from your own usage stats; pitch to press for citations.
- **Content depth** — real, unique, current content on the pages that matter.

> Honest expectation: the engine replicates machinery + process (~70%). Authority (~30%) is per-project
> human work. "Install → instant #1" is false; official/government sites cap some keywords permanently.

## Anti-patterns (baked into the code — never undo)

| Mistake | Reality |
|---------|---------|
| Sitemap ping for instant indexing | Dead (2023). Instant channel = IndexNow (Bing/Yandex; not Google). |
| llms.txt affects GSC | Unrelated. llms.txt = AI channel; GSC = classic search. |
| meta keywords help SEO | Dead since 2009. Effort → title/desc/canonical/JSON-LD. |
| JSON-LD as JSX `<script>` | React 19 drops it → `dangerouslySetInnerHTML` hidden div. |
| Dynamic `readFile` path | Bundles all of `public/` → >250MB deploy error. Literal paths only. |
| Thin programmatic pages | Doorway penalty hits the WHOLE site. Unique content per page (curated+hash-variant). |
| Submit Google to IndexNow | Google doesn't use IndexNow; it crawls the sitemap. |
| Block `/_next/` for Googlebot | Breaks rendering, hurts CWV, "indexed despite blocked". Only for generic bots. |
| Non-existent slug in sitemap | Soft-404. Only real `page.tsx` routes. |
| On-page fixes → #1 | High-volume keywords are capped by domain authority. Go programmatic + easy-win + widgets. |
| Government sites as competitors | Not competition (exclude in opportunity engine); being below them is normal. |
| Tailwind template-literal class (`bg-${x}`) | JIT won't compile it. Use static classes. |
| `/api/cron/*` blocked by middleware | 307 → cron dies silently. Exclude cron paths from the matcher. |
