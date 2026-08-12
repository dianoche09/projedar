import { NextResponse } from 'next/server'
import { recordCronRun } from '@/lib/cron/heartbeat'
import sitemap from '@/app/sitemap'
import { submitToIndexNow } from '@/lib/seo/indexnow'

// src/app/api/cron/seo-distribution/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * SEO distribution cron (every 3 days, 03:00 UTC). Auth: Bearer CRON_SECRET.
 *
 * Submits ALL public sitemap URLs (dynamic: entities/blog/etc. included) to
 * IndexNow → Bing/Yandex/Naver index new/changed pages within hours. Google does
 * not use IndexNow (it crawls the dynamic sitemap anyway; the classic sitemap ping
 * was retired in 2023, so there is no extra Google push).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const startedAt = Date.now()
  await recordCronRun('seo-distribution')

  try {
    const entries = await sitemap()
    const urls = entries.map((e) => (typeof e.url === 'string' ? e.url : String(e.url))).filter(Boolean)
    const indexnow = await submitToIndexNow(urls)
    const durationMs = Date.now() - startedAt
    await recordCronRun('seo-distribution', { status: indexnow.ok ? 'ok' : 'error', durationMs, error: indexnow.error })
    return NextResponse.json({ ok: indexnow.ok, durationMs, sitemapUrls: urls.length, indexnow })
  } catch (e) {
    const durationMs = Date.now() - startedAt
    const error = e instanceof Error ? e.message : 'seo-distribution failed'
    await recordCronRun('seo-distribution', { status: 'error', error, durationMs })
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}
