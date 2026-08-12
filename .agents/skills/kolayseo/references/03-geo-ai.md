# Layer 3 — GEO / AI-Search

Files: `templates/llms.route.ts`, `templates/llms-base.txt`, robots AI-crawler list (Layer 1),
Link header (Layer 1).

## /llms.txt (dynamic — base + DB blog)
Copy `templates/llms.route.ts` to `src/app/llms.txt/route.ts` and `templates/llms-base.txt` to
`src/data/llms-base.txt`. The route reads the hand-written base with `readFileSync(join(process.cwd(),
'src/data/llms-base.txt'))` and appends published `blog_posts` categorized. **NFT literal-path rule:** the
path must be a literal string — a dynamic path makes Vercel bundle all of `public/` (>250MB → deploy error).

`llms-base.txt` required structure (order matters): `# Brand` → `> summary` → `## About` (with company fact
block) → `## Key Pages` → `## Features` (specific numbers, never "many") → `## Who It Helps` → `## Evidence/
Research` (Author (Year), Journal) → `## Key Differentiators` → `## Blog/Knowledge Base` (auto-appended) →
`## Disclaimer`. Minimum ~150 lines.

Also ship `public/llms-full.txt` (a full static content dump; referenced in robots). It's a plain static file.

## GEO content rules (baked into landings + programmatic pages)
- **Answer-first**: after each H2, the first ~150 chars give the clear answer/result.
- **Passage density**: 50-150 word paragraphs, each with ≥1 data point.
- **FAQPage schema** on every landing (highest GEO impact). When the opportunity engine reports an
  AI-Overview loss, the fix is "add/strengthen answer-first + FAQPage" — this is why every page has it.
- **AI-crawler allow-list** (27 bots) + **Content-Signal** header live in robots (Layer 1).
- **RFC 8288 Link header** + `/.well-known/api-catalog` (agent-readiness) live in next.config (Layer 1).

## Important distinctions (do not confuse)
- llms.txt is the **AI channel**; GSC is **classic search**. They are unrelated.
- IndexNow (Layer 5) is the instant channel for classic search (Bing/Yandex), not an AI thing.

## Validate
- [ ] `/llms.txt` 200; base + categorized DB blog; `/llms-full.txt` 200.
- [ ] `geo audit --url <site>` (if the geo tool is installed) scores in the Good band (68+).
