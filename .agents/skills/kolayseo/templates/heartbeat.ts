import { createServiceClient } from '@/lib/supabase/server'

/**
 * Cron heartbeat — records the "did it run" signal for scheduled jobs.
 *
 * Each cron handler calls `recordCronRun(name)` right AFTER auth passes. An admin
 * health card compares records against the expected interval; if a cron hasn't run
 * for more than 2× its interval it flags STALE. (In the source project all crons
 * once died silently for days behind a middleware block — this makes it visible.)
 *
 * Requires a `cron_heartbeats` table (see migrations/cron_heartbeats.sql).
 */

/**
 * MONITORED scheduled crons and expected intervals (minutes). Source: vercel.json.
 * Only these are watched for staleness. Add your other crons as needed.
 */
export const CRON_SCHEDULES: Record<string, { intervalMin: number; label: string }> = {
  'arama-istihbarati':  { intervalMin: 10080, label: 'Search intelligence (weekly)' },
  'seo-distribution':   { intervalMin: 4320,  label: 'SEO distribution (IndexNow, every 3 days)' },
  'seo-weekly-digest':  { intervalMin: 10080, label: 'SEO weekly digest (Monday)' },
}

/**
 * Marks a cron as run. Called at the START of each cron handler (after auth).
 * NEVER throws — a heartbeat failure must not break the cron job.
 */
export async function recordCronRun(
  cronName: string,
  meta?: { status?: 'ok' | 'error'; error?: string | null; durationMs?: number | null },
): Promise<void> {
  try {
    const svc = createServiceClient()
    await svc.from('cron_heartbeats').upsert(
      {
        cron_name: cronName,
        last_run_at: new Date().toISOString(),
        last_status: meta?.status ?? 'ok',
        last_error: meta?.error ?? null,
        last_duration_ms: meta?.durationMs ?? null,
      },
      { onConflict: 'cron_name' },
    )
  } catch (e) {
    console.error('[cron-heartbeat] record failed', cronName, e)
  }
}

export type CronHealthStatus = 'ok' | 'stale' | 'never'

export interface CronHealth {
  cronName: string
  label: string
  intervalMin: number
  lastRunAt: string | null
  minutesSince: number | null
  status: CronHealthStatus
  lastStatus: string | null
  lastError: string | null
}

/** Health status for all monitored crons. Needs a service-role client. */
export async function getCronHealth(svc: any): Promise<CronHealth[]> {
  const { data } = await svc
    .from('cron_heartbeats')
    .select('cron_name, last_run_at, last_status, last_error')

  const byName = new Map<string, any>((data || []).map((r: any) => [r.cron_name, r]))
  const now = Date.now()

  return Object.entries(CRON_SCHEDULES).map(([cronName, cfg]) => {
    const row = byName.get(cronName)
    const lastRunAt: string | null = row?.last_run_at ?? null

    if (!lastRunAt) {
      return {
        cronName, label: cfg.label, intervalMin: cfg.intervalMin,
        lastRunAt: null, minutesSince: null, status: 'never' as const,
        lastStatus: row?.last_status ?? null, lastError: row?.last_error ?? null,
      }
    }

    const minutesSince = Math.round((now - new Date(lastRunAt).getTime()) / 60000)
    const status: CronHealthStatus = minutesSince > cfg.intervalMin * 2 ? 'stale' : 'ok'

    return {
      cronName, label: cfg.label, intervalMin: cfg.intervalMin,
      lastRunAt, minutesSince, status,
      lastStatus: row?.last_status ?? null, lastError: row?.last_error ?? null,
    }
  })
}
