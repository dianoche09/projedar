/**
 * SEO finding queue — types + helpers (seo_findings table).
 *
 * OpenSEO monthly deep audit (orphan / duplicate / backlink) and GSC weekly CTR
 * opportunities land in one queue; the admin "Site Health & Findings" card + the
 * weekly email digest read it. A category='site_health' row carries a metric
 * SNAPSHOT (for trend/delta); the others are actions.
 *
 * No server dependency → both the admin API/cron and the client admin page can import it.
 *
 * OPENSEO BRIDGE: OpenSEO is an MCP tool (not code). Its audit output is written
 * into seo_findings via the admin API (source='openseo'); the digest + panel consume it.
 */

export type SeoFindingCategory =
  | 'orphan'
  | 'duplicate_content'
  | 'duplicate_meta'
  | 'backlink'
  | 'ctr'
  | 'perf'
  | 'site_health'

export type SeoSeverity = 'yuksek' | 'orta' | 'dusuk' // high | medium | low
export type SeoStatus = 'open' | 'done' | 'ignored'

export interface SeoFinding {
  id: string
  created_at: string
  source: string
  category: SeoFindingCategory
  severity: SeoSeverity
  baslik: string        // title
  aksiyon: string | null // action
  url: string | null
  metrik: Record<string, number | string | null>
  status: SeoStatus
  resolved_at: string | null
  resolved_by: string | null
}

/** Site health snapshot metrics (metric of the category='site_health' row). */
export interface SiteHealthMetrics {
  orphans?: number
  duplicateContent?: number
  duplicateMeta?: number
  backlinkDomains?: number
  backlinkTotal?: number
  slowPages?: number
  [k: string]: number | string | null | undefined
}

export const CATEGORY_LABEL: Record<string, string> = {
  orphan: 'Orphan Page',
  duplicate_content: 'Duplicate Content',
  duplicate_meta: 'Duplicate Meta',
  backlink: 'Backlink',
  ctr: 'CTR Opportunity',
  perf: 'Performance',
  site_health: 'Site Health',
}

const SEV_ORDER: Record<SeoSeverity, number> = { yuksek: 0, orta: 1, dusuk: 2 }

/** Sorts findings by priority + freshness (queue display). */
export function sortFindings(list: SeoFinding[]): SeoFinding[] {
  return [...list].sort((a, b) => {
    const s = (SEV_ORDER[a.severity] ?? 1) - (SEV_ORDER[b.severity] ?? 1)
    if (s !== 0) return s
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/**
 * Latest↔previous snapshot delta for a metric key.
 * Returns number (latest - prev) or null (insufficient data). Interpretation is
 * the caller's (orphan: negative=good, backlink: positive=good).
 */
export function healthDelta(
  latest: SiteHealthMetrics | null,
  prev: SiteHealthMetrics | null,
  key: keyof SiteHealthMetrics,
): number | null {
  const l = latest?.[key]
  const p = prev?.[key]
  if (typeof l !== 'number' || typeof p !== 'number') return null
  return l - p
}
