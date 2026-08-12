import { NextResponse } from 'next/server'
import { recordCronRun } from '@/lib/cron/heartbeat'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'                 // your email sender
import { deriveOpportunities, firsatOzet } from '@/lib/arama-istihbarati/opportunities'
import { isGscConfigured, fetchSearchAnalytics, gscDateRange, type GscRow } from '@/lib/seo/gsc'
import { sortFindings, healthDelta, CATEGORY_LABEL, type SeoFinding, type SiteHealthMetrics } from '@/lib/seo/findings'

// src/app/api/cron/seo-weekly-digest/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 120

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'info@example.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'

/**
 * Weekly SEO digest cron (Monday 07:00 UTC — after arama-istihbarati scans at 04:00).
 * One email puts the SEO state in front of the admin: (1) site-health delta from the
 * OpenSEO snapshot, (2) open findings queue, (3) opportunity queue (SerpAPI-derived),
 * (4) GSC real data (if credential set). Auth: Bearer CRON_SECRET.
 *
 * NOTE: replace the email body building with your own renderer; the DATA fetching
 * (opportunities + findings + health delta + GSC) is the reusable part.
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
  await recordCronRun('seo-weekly-digest')

  try {
    const svc = createServiceClient() as any

    // 1) Opportunity queue — last 90d SerpAPI snapshots → derived opportunities.
    const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()
    const aramaQ = await svc
      .from('arama_istihbarati')
      .select('sorgu, checked_at, kolayimar_pozisyon, kolayimar_url, rakipler, ai_overview_var, ai_overview_kolayimar')
      .gte('checked_at', since)
      .order('checked_at', { ascending: false })
    const firsatlar = aramaQ.error ? [] : deriveOpportunities((aramaQ.data || []) as any)
    const ozet = firsatOzet(firsatlar)

    // 2) Open findings + 3) site-health delta (seo_findings).
    let findings: SeoFinding[] = []
    let latestHealth: SiteHealthMetrics | null = null
    let prevHealth: SiteHealthMetrics | null = null

    const openQ = await svc.from('seo_findings').select('*')
      .eq('status', 'open').neq('category', 'site_health')
      .order('created_at', { ascending: false }).limit(50)
    if (!openQ.error) findings = sortFindings((openQ.data || []) as SeoFinding[])

    const healthQ = await svc.from('seo_findings').select('metrik, created_at')
      .eq('category', 'site_health').order('created_at', { ascending: false }).limit(2)
    if (!healthQ.error && healthQ.data?.length) {
      latestHealth = (healthQ.data[0]?.metrik ?? null) as SiteHealthMetrics | null
      prevHealth = (healthQ.data[1]?.metrik ?? null) as SiteHealthMetrics | null
    }

    // 4) GSC real data (if credential set; else skip — graceful degrade).
    let gscBlock: { top: GscRow[]; ctr: GscRow[]; clicks: number; impressions: number } | null = null
    if (isGscConfigured()) {
      try {
        const { startDate, endDate } = gscDateRange(7)
        const rows = (await fetchSearchAnalytics({ startDate, endDate, dimensions: ['query'], rowLimit: 200 })) || []
        gscBlock = {
          top: [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 6),
          ctr: rows.filter((r) => r.impressions >= 50 && r.position <= 20 && r.ctr < 0.03)
            .sort((a, b) => b.impressions - a.impressions).slice(0, 6),
          clicks: rows.reduce((s, r) => s + r.clicks, 0),
          impressions: rows.reduce((s, r) => s + r.impressions, 0),
        }
      } catch (e) {
        console.error('seo-weekly-digest gsc failed', e)
      }
    }

    // ── Build the email (replace with your renderer). Keep the "nothing new" line
    //    so the cadence holds even on a quiet week. ──
    const lines: string[] = [`SEO weekly — ${ozet.yuksek} high opportunities · ${findings.length} open findings`]
    if (latestHealth) {
      const fmt = (k: keyof SiteHealthMetrics) => {
        const cur = latestHealth?.[k]; if (typeof cur !== 'number') return '-'
        const d = healthDelta(latestHealth, prevHealth, k)
        return d === null || d === 0 ? String(cur) : `${cur} (${d < 0 ? '▼' : '▲'}${Math.abs(d)})`
      }
      lines.push(`Health — orphans ${fmt('orphans')} · dupContent ${fmt('duplicateContent')} · refDomains ${fmt('backlinkDomains')}`)
    }
    for (const f of findings.slice(0, 8)) lines.push(`[${CATEGORY_LABEL[f.category] || f.category}] ${f.baslik}${f.aksiyon ? ` → ${f.aksiyon}` : ''}`)
    for (const f of firsatlar.slice(0, 8)) lines.push(`${f.sorgu}: ${f.baslik} → ${f.aksiyon}`)
    if (gscBlock) {
      lines.push(`GSC 7d — ${gscBlock.clicks} clicks / ${gscBlock.impressions} impressions`)
      for (const q of gscBlock.ctr.slice(0, 5)) lines.push(`  ${q.keys?.[0] || '-'}: ${q.impressions} imp · ${(q.ctr * 100).toFixed(1)}% · #${q.position.toFixed(1)}`)
    }
    if (!latestHealth && findings.length === 0 && firsatlar.length === 0 && !gscBlock) {
      lines.push('No new findings or opportunities this week.')
    }
    lines.push(`Open panel: ${SITE}/dashboard/admin/arama-istihbarati`)

    const text = lines.join('\n')
    const res = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `SEO weekly: ${ozet.yuksek} high opportunities · ${findings.length} open findings`,
      html: `<pre style="font:14px/1.5 monospace">${text.replace(/</g, '&lt;')}</pre>`,
      text,
    })

    const durationMs = Date.now() - startedAt
    await recordCronRun('seo-weekly-digest', { status: res.success ? 'ok' : 'error', durationMs, error: res.error ?? null })
    return NextResponse.json({ ok: res.success, firsat: ozet.toplam, bulgu: findings.length, gsc: !!gscBlock, durationMs })
  } catch (e) {
    const durationMs = Date.now() - startedAt
    const error = e instanceof Error ? e.message : 'seo-weekly-digest failed'
    await recordCronRun('seo-weekly-digest', { status: 'error', error, durationMs })
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }
}
