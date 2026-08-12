import { MetadataRoute } from 'next'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { siteConfig } from '@/lib/seo'
// import your programmatic param helpers + data:
// import { getAllEntityParams } from '@/constants/entities'

/**
 * Dynamic sitemap: static pages + programmatic pages + DB-published blog.
 *
 * RULE: only include slugs that have a REAL route (src/app/<slug>/page.tsx).
 * Non-existent slugs = soft-404 to Google. Add on landing creation, remove on deletion.
 *
 * DB-fed sections (blog, any live-data axis) are wrapped in try/catch → if the DB is
 * down the static list is still valid (graceful degrade).
 */

// Static tool/landing pages (only ones with a real page.tsx).
const TOOL_PAGES = ['/primary', '/secondary', '/calculator', '/embed']
const INFO_PAGES = ['/about', '/contact', '/blog', '/faq']
const LEGAL_PAGES = ['/privacy', '/terms']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url
  const now = new Date()

  const home: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
  ]

  const toolPages: MetadataRoute.Sitemap = TOOL_PAGES.map((route) => ({
    url: `${baseUrl}${route}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9,
  }))

  const infoPages: MetadataRoute.Sitemap = INFO_PAGES.map((route) => ({
    url: `${baseUrl}${route}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6,
  }))

  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map((route) => ({
    url: `${baseUrl}${route}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.3,
  }))

  // ── Programmatic pages (fill with your axis) ──────────────────────────────
  // const entityParams = getAllEntityParams()
  // const entityPages: MetadataRoute.Sitemap = entityParams.map(({ parent, entity }) => ({
  //   url: `${baseUrl}/category-a/${parent}/${entity}`,
  //   lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
  // }))

  // ── Blog: DB-published + static fallback (slug dedup) ──────────────────────
  const blogPages: MetadataRoute.Sitemap = []
  const blogSlugs = new Set<string>()
  try {
    const sb = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await sb
      .from('blog_posts')
      .select('slug, published_at, updated_at')
      .eq('status', 'published')
      .lte('published_at', now.toISOString())
    for (const p of data || []) {
      if (!p.slug || blogSlugs.has(p.slug)) continue
      blogSlugs.add(p.slug)
      let lastModified: Date = now
      const d = p.updated_at || p.published_at
      if (d) {
        const parsed = new Date(d)
        if (!isNaN(parsed.getTime())) lastModified = parsed
      }
      blogPages.push({ url: `${baseUrl}/blog/${p.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.7 })
    }
  } catch {
    /* DB down → static sections are enough */
  }

  return [
    ...home,
    ...toolPages,
    ...infoPages,
    // ...entityPages,
    ...blogPages,
    ...legalPages,
  ]
}
