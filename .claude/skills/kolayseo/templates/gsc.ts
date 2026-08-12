/**
 * Google Search Console (GSC) client — real search-performance data.
 *
 * Upgrades Command Center Layer 1 from SerpAPI ESTIMATE (position sampling) to
 * GSC TRUTH (your own clicks/impressions/CTR/position). Connects directly to the
 * Search Console API with a service account — no extra Google SDK, only `jose`.
 *
 * SETUP (once, by the operator):
 *  1. Google Cloud project → enable "Search Console API".
 *  2. Create a Service Account → download JSON key.
 *  3. GSC (search.google.com/search-console) → Settings → Users and permissions →
 *     add the service account email with "Full" or "Restricted" access.
 *  4. Env:
 *       GOOGLE_GSC_SA_KEY = <service account JSON, base64 or raw>
 *       GSC_SITE_URL      = sc-domain:example.com
 *
 * With no credential every function returns null/false — the system keeps running
 * on SerpAPI (graceful degrade).
 */
import { SignJWT, importPKCS8 } from 'jose'

interface ServiceAccount {
  client_email: string
  private_key: string
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_GSC_SA_KEY
  if (!raw) return null
  try {
    const json = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8')
    const sa = JSON.parse(json)
    if (!sa.client_email || !sa.private_key) return null
    sa.private_key = String(sa.private_key).replace(/\\n/g, '\n')
    return { client_email: sa.client_email, private_key: sa.private_key }
  } catch {
    return null
  }
}

export function isGscConfigured(): boolean {
  return !!getServiceAccount() && !!process.env.GSC_SITE_URL
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const key = await importPKCS8(sa.private_key, 'RS256')
  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
  })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GSC token HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`)
  }
  const j = await res.json()
  return j.access_token as string
}

export interface GscRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

/**
 * Search Analytics query. Returns null with no credential (fallback).
 * dimensions: ['query'] | ['page'] | ['query','page'] | ['date'] ...
 */
export async function fetchSearchAnalytics(opts: {
  startDate: string
  endDate: string
  dimensions: string[]
  rowLimit?: number
}): Promise<GscRow[] | null> {
  const sa = getServiceAccount()
  const site = process.env.GSC_SITE_URL
  if (!sa || !site) return null

  const token = await getAccessToken(sa)
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 25_000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: opts.startDate,
        endDate: opts.endDate,
        dimensions: opts.dimensions,
        rowLimit: opts.rowLimit ?? 100,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`GSC query HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`)
    }
    const j = await res.json()
    return (j.rows ?? []) as GscRow[]
  } finally {
    clearTimeout(t)
  }
}

/** Last N days date range (YYYY-MM-DD). GSC data lags ~2-3 days. */
export function gscDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date(Date.now() - 3 * 24 * 3600 * 1000)
  const start = new Date(end.getTime() - days * 24 * 3600 * 1000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: fmt(start), endDate: fmt(end) }
}
