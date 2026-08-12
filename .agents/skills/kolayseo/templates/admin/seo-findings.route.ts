import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { sortFindings, type SeoFinding } from '@/lib/seo/findings'

// src/app/api/admin/seo-findings/route.ts
// THE OpenSEO/GSC bridge WRITE path + the findings queue read/resolve.
export const dynamic = 'force-dynamic'

/** GET: open findings queue + latest two site_health snapshots (for delta). */
export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied
  const svc = createServiceClient() as any

  const openQ = await svc.from('seo_findings').select('*')
    .eq('status', 'open').neq('category', 'site_health')
    .order('created_at', { ascending: false }).limit(100)
  const healthQ = await svc.from('seo_findings').select('metrik, created_at')
    .eq('category', 'site_health').order('created_at', { ascending: false }).limit(2)

  return NextResponse.json({
    findings: openQ.error ? [] : sortFindings((openQ.data || []) as SeoFinding[]),
    health: healthQ.error ? [] : (healthQ.data || []).map((r: any) => r.metrik),
  })
}

/**
 * POST: insert findings. THIS is the OpenSEO bridge — run the OpenSEO MCP audit
 * (run_site_audit / get_audit_issues / get_backlinks_overview / get_search_console_performance),
 * summarize, and POST rows here with source='openseo' | 'gsc' | 'manual'.
 * A site_health row carries the metric snapshot in `metrik`.
 * Body: { findings: Array<Partial<SeoFinding>> }
 */
export async function POST(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  const svc = createServiceClient() as any
  const body = await request.json().catch(() => ({}))
  const rows = Array.isArray(body?.findings) ? body.findings : []
  if (!rows.length) return NextResponse.json({ error: 'no findings' }, { status: 400 })

  const clean = rows.map((r: any) => ({
    source: r.source || 'openseo',
    category: r.category,             // required
    severity: r.severity || 'orta',
    baslik: r.baslik,                 // required
    aksiyon: r.aksiyon ?? null,
    url: r.url ?? null,
    metrik: r.metrik ?? {},
    status: 'open',
  }))
  const { error } = await svc.from('seo_findings').insert(clean)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, inserted: clean.length })
}

/**
 * PATCH: resolve/close a finding with evidence. Body: { id, status, resolved_by }.
 * Not every finding is a code fix — some close as 'done'/'ignored' with an evidence note.
 */
export async function PATCH(request: Request) {
  const denied = await requireAdmin()
  if (denied) return denied
  const svc = createServiceClient() as any
  const { id, status, resolved_by } = await request.json().catch(() => ({}))
  if (!id || !['open', 'done', 'ignored'].includes(status)) {
    return NextResponse.json({ error: 'id + valid status required' }, { status: 400 })
  }
  const { error } = await svc.from('seo_findings')
    .update({ status, resolved_at: status === 'open' ? null : new Date().toISOString(), resolved_by: resolved_by ?? null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
