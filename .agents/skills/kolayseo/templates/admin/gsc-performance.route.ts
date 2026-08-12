import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { isGscConfigured, fetchSearchAnalytics, gscDateRange } from '@/lib/seo/gsc'

// src/app/api/admin/gsc-performance/route.ts
export const dynamic = 'force-dynamic'

/**
 * GET: real GSC data — top queries by clicks + CTR opportunities (high impressions,
 * decent position, low CTR). Returns configured:false if no GSC credential (the UI
 * shows a setup note and falls back to SerpAPI). ?days=28 optional.
 */
export async function GET(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  if (!isGscConfigured()) {
    return NextResponse.json({ configured: false, top: [], ctr: [] })
  }

  const days = Number(new URL(request.url).searchParams.get('days')) || 28
  const { startDate, endDate } = gscDateRange(days)
  try {
    const rows = (await fetchSearchAnalytics({ startDate, endDate, dimensions: ['query'], rowLimit: 250 })) || []
    return NextResponse.json({
      configured: true,
      top: [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 20),
      ctr: rows.filter((r) => r.impressions >= 50 && r.position <= 20 && r.ctr < 0.03)
        .sort((a, b) => b.impressions - a.impressions).slice(0, 20),
      clicks: rows.reduce((s, r) => s + r.clicks, 0),
      impressions: rows.reduce((s, r) => s + r.impressions, 0),
    })
  } catch (e) {
    return NextResponse.json({ configured: true, error: e instanceof Error ? e.message : 'gsc failed' }, { status: 500 })
  }
}
