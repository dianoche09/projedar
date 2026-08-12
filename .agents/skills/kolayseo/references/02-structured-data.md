# Layer 2 — Structured Data (JSON-LD)

Files: `templates/StructuredData.tsx`, generators in `templates/seo.ts`.

## StructuredData.tsx (React 19-safe — copy verbatim)
Copy `templates/StructuredData.tsx` to `src/components/seo/StructuredData.tsx`. **Do NOT "simplify" it to a
JSX `<script>` tag.** React 19's resource-hoisting silently DROPS JSX `<script>` tags rendered inside `<div>`
roots in client-component pages. The component emits the `<script>` via `dangerouslySetInnerHTML` on a hidden
`<div>` so React never treats it as a script element — it lands in the SSR HTML verbatim, non-executable by
spec. `<` → `<` escape is XSS-safe.

## Site-wide injection (root layout)
In `src/app/layout.tsx`, inject 6 static schemas:
```tsx
import { organizationSchema, websiteSchema, homeServiceSchema,
         mobileApplicationSchema, localBusinessSchema,
         siteNavigationSchema } from '@/lib/seo'
// inside <body>: (exactly 6 — homeFAQSchema is page-specific, injected on the homepage page.tsx, NOT here)
<StructuredData data={organizationSchema} />
<StructuredData data={websiteSchema} />
<StructuredData data={homeServiceSchema} />
<StructuredData data={mobileApplicationSchema} />
<StructuredData data={localBusinessSchema} />
<StructuredData data={siteNavigationSchema} />
```
Key graph links: `websiteSchema.publisher.@id` → `organizationSchema.@id` (`{url}/#organization`).
`organizationSchema.alternateName` covers brand spelling variants so AI engines recognize the entity.

## Landing-page injection (`<slug>/layout.tsx`)
Each landing has its own `layout.tsx` exporting `metadata` + injecting 5 schemas:
`FAQPage` + `HowTo` + `BreadcrumbList` + `WebApplication` + `Article` (via the generators). `page.tsx` holds
only the visual content + tool. Keep FAQs in a shared `faqs.ts` (client+server). **Tailwind color classes
must be static** — `bg-${x}` template literals are not seen by the JIT and won't compile.

Generators available in seo.ts: `generateMetadata`, `generateFAQSchema`, `generateHowToSchema`,
`generateArticleSchema`, `generateBreadcrumbSchema`, `generateServiceSchema`, `generateWebApplicationSchema`,
`generateSoftwareApplicationSchema`, `generateJsonLd`.

## Validate
- [ ] Homepage source has 6 `application/ld+json` scripts.
- [ ] A landing has FAQPage+HowTo+Breadcrumb+WebApplication+Article; Google Rich Results Test passes.
- [ ] JSON-LD present in SSR HTML (view-source, not just devtools DOM).
