/**
 * IndexNow client — notifies instant search engines of new/changed URLs.
 *
 * IndexNow triggers Bing, Yandex, Seznam, Naver and Yep with a single POST
 * (Google does NOT support IndexNow; Google comes via sitemap + crawl). Since
 * the classic "sitemap ping" endpoint was retired in 2023, this is in practice
 * the only instant indexing channel for new pages.
 *
 * Verification: publish `key` at the host root as `${key}.txt` (public/<key>.txt).
 * Because the file lives at the root, ALL site URLs can be submitted (IndexNow
 * rule: the key file's directory bounds submission scope). The key is NOT secret
 * — it is a public "I own this host" token.
 *
 * CONFIG PER PROJECT: set HOST + INDEXNOW_KEY (and create public/<key>.txt).
 */

import { siteConfig } from '@/lib/seo'

// Public verification token (NOT a secret; must match public/<key>.txt).
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || 'REPLACE_WITH_32_HEX_CHARS_AND_PUBLISH_public_<key>.txt'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'
// Derive HOST from siteConfig so it cannot silently diverge — a wrong HOST filters
// out EVERY URL and returns a "successful" no-op. Override with INDEXNOW_HOST only if needed.
const HOST = process.env.INDEXNOW_HOST
  || (() => { try { return new URL(siteConfig.url).hostname } catch { return 'www.example.com' } })()
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`

// IndexNow accepts at most 10,000 URLs per request.
const MAX_URLS_PER_REQUEST = 10_000

export interface IndexNowResult {
  submitted: number
  batches: number
  status: number | null
  ok: boolean
  error?: string
}

/**
 * Submits the given URL list to IndexNow. Drops URLs not on HOST (wrong domain).
 * Splits into 10,000-URL batches.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const clean = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).hostname === HOST
    } catch {
      return false
    }
  })

  if (clean.length === 0) {
    if (urls.length > 0) {
      console.error(`[indexnow] 0 of ${urls.length} URLs matched HOST="${HOST}" — check INDEXNOW_HOST / siteConfig.url`)
    }
    return { submitted: 0, batches: 0, status: null, ok: true }
  }

  let batches = 0
  let lastStatus: number | null = null
  for (let i = 0; i < clean.length; i += MAX_URLS_PER_REQUEST) {
    const urlList = clean.slice(i, i + MAX_URLS_PER_REQUEST)
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 20_000)
    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList }),
        signal: ctrl.signal,
      })
      lastStatus = res.status
      batches++
      // 200 OK / 202 Accepted = accepted; 4xx = verification/format error.
      if (res.status !== 200 && res.status !== 202) {
        const body = await res.text().catch(() => '')
        return {
          submitted: i,
          batches,
          status: res.status,
          ok: false,
          error: `IndexNow HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`,
        }
      }
    } catch (e) {
      return {
        submitted: i,
        batches,
        status: lastStatus,
        ok: false,
        error: e instanceof Error ? e.message : 'IndexNow request failed',
      }
    } finally {
      clearTimeout(t)
    }
  }

  return { submitted: clean.length, batches, status: lastStatus, ok: true }
}
