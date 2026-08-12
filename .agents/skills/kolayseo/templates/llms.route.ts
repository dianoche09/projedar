import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 3600 // hourly — new blog posts appear automatically

/**
 * GET /llms.txt — hand-written base + categorized list of published blog_posts.
 * AI/panel-generated blog posts appear here automatically (GEO: source map for AI engines).
 *
 * NFT LITERAL-PATH RULE: readFileSync path MUST be a literal string. A dynamic path
 * makes Vercel bundle ALL of public/ (>250MB → deploy error). Keep it literal.
 */
function loadBase(): string {
  try {
    return readFileSync(join(process.cwd(), 'src/data/llms-base.txt'), 'utf8')
  } catch {
    return '# YourBrand\n> One-line summary of the product.\n'
  }
}

export async function GET() {
  const base = loadBase()
  let blogSection = ''

  try {
    const sb = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await sb
      .from('blog_posts')
      .select('slug, title, category, excerpt')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(500)

    const posts = data || []
    if (posts.length) {
      const byCat = new Map<string, Array<{ slug: string; title: string; excerpt: string | null }>>()
      for (const p of posts) {
        if (!p.slug || !p.title) continue
        const cat = String(p.category || 'General').trim() || 'General'
        if (!byCat.has(cat)) byCat.set(cat, [])
        byCat.get(cat)!.push({ slug: p.slug, title: p.title, excerpt: p.excerpt })
      }
      const base2 = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'
      const lines: string[] = ['', '## Blog / Knowledge Base', '']
      for (const [cat, arr] of byCat) {
        lines.push(`### ${cat}`)
        for (const p of arr) {
          const ex = p.excerpt ? ` — ${String(p.excerpt).replace(/\s+/g, ' ').trim().slice(0, 160)}` : ''
          lines.push(`- [${p.title}](${base2}/blog/${p.slug})${ex}`)
        }
        lines.push('')
      }
      blogSection = lines.join('\n')
    }
  } catch {
    /* DB down → base is enough */
  }

  const body = blogSection ? `${base.trimEnd()}\n${blogSection}\n` : base
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
