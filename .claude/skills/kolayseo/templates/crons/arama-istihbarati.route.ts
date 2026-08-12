import { NextResponse } from 'next/server'
import { recordCronRun } from '@/lib/cron/heartbeat'
import { createServiceClient } from '@/lib/supabase/server'
import { collectAramaIstihbarati } from '@/lib/arama-istihbarati/collect'

// src/app/api/cron/arama-istihbarati/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Weekly (Monday 04:00 UTC) search-intelligence cron.
 * Collects own organic position + competitors + advertisers + AI Overview
 * visibility from SerpAPI over the target query set. Auth: Bearer CRON_SECRET.
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
  await recordCronRun('arama-istihbarati')

  try {
    const svc = createServiceClient()
    const summary = await collectAramaIstihbarati(svc)
    const durationMs = Date.now() - startedAt
    await recordCronRun('arama-istihbarati', { status: 'ok', durationMs })
    return NextResponse.json({ ok: true, durationMs, ...summary })
  } catch (e) {
    const durationMs = Date.now() - startedAt
    const error = e instanceof Error ? e.message : 'collect failed'
    await recordCronRun('arama-istihbarati', { status: 'error', error, durationMs })
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}
