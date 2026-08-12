import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { collectAramaIstihbarati } from '@/lib/arama-istihbarati/collect'
import { deriveOpportunities, firsatOzet } from '@/lib/arama-istihbarati/opportunities'

// src/app/api/admin/arama-istihbarati/route.ts
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/** GET: last 90 days of snapshots + derived opportunities (admin view). */
export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const svc = createServiceClient() as any

  const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString()
  const { data, error } = await svc
    .from('arama_istihbarati')
    .select('id, sorgu, checked_at, kolayimar_pozisyon, kolayimar_url, rakipler, reklamlar, ai_overview_var, ai_overview_kolayimar, ai_overview_kaynaklar, organik_ozet')
    .gte('checked_at', since)
    .order('checked_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const firsatlar = deriveOpportunities((data || []) as any)
  return NextResponse.json({ rows: data || [], firsatlar, firsatOzet: firsatOzet(firsatlar) })
}

/** POST: trigger a manual scan (one SerpAPI query per keyword). */
export async function POST() {
  const denied = await requireAdmin()
  if (denied) return denied
  try {
    const svc = createServiceClient()
    const summary = await collectAramaIstihbarati(svc)
    return NextResponse.json({ ok: true, ...summary })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'collect failed' }, { status: 500 })
  }
}
