/**
 * Search Intelligence collector (Command Center — Module 1).
 *
 * Scans a target query set via SerpAPI (Google, gl=<country>) and writes one
 * snapshot row per query (arama_istihbarati). Three signals come from the SAME
 * response — no extra query cost:
 *   1. SEO tracking  — own organic position + tracked competitor positions
 *   2. Ad intelligence — advertising domains + titles for the query
 *   3. GEO tracking  — is there a Google AI Overview, and is the brand a source?
 *
 * Cost: SORGULAR.length queries per run.
 *
 * CONFIG PER PROJECT: fill SORGULAR (your niche keywords, split informational vs
 * commercial-intent), RAKIP_DOMAINS (competitors), KENDI_DOMAIN, and gl/hl.
 */

export const SORGULAR = [
  // Informational — search/definition/calculation intent
  'your informational keyword 1',
  'your informational keyword 2',
  // Commercial intent — feeds the transactional product
  'your commercial keyword 1',
  'your commercial keyword 2',
] as const

/** Tracked competitor/alternative domains (their organic positions are recorded). */
const RAKIP_DOMAINS = [
  'competitor-a.com',
  'competitor-b.com',
  'competitor-c.com',
]

const KENDI_DOMAIN = 'example.com' // ← your bare domain (no www)
const GL = 'us' // country
const HL = 'en' // language
const SERP_BASE = 'https://serpapi.com/search'

interface SnapshotRow {
  sorgu: string
  kolayimar_pozisyon: number | null
  kolayimar_url: string | null
  rakipler: { domain: string; pozisyon: number }[]
  reklamlar: { domain: string; baslik: string }[]
  ai_overview_var: boolean
  ai_overview_kolayimar: boolean
  ai_overview_kaynaklar: string[]
  organik_ozet: { pozisyon: number; domain: string; baslik: string }[]
}

export interface CollectSummary {
  sorguSayisi: number
  basarili: number
  hata: number
  ilk10: number
  aiOverviewAtif: number
}

function domainOf(link: string | undefined): string {
  try {
    return new URL(link || '').hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function matchesDomain(host: string, target: string): boolean {
  return host === target || host.endsWith(`.${target}`)
}

async function fetchSerp(sorgu: string, apiKey: string): Promise<SnapshotRow | null> {
  const url = new URL(SERP_BASE)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', sorgu)
  url.searchParams.set('gl', GL)
  url.searchParams.set('hl', HL)
  url.searchParams.set('num', '20')

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 25_000)
  let json: any
  try {
    const r = await fetch(url.toString(), { signal: ctrl.signal })
    if (!r.ok) throw new Error(`serpapi HTTP ${r.status}`)
    json = await r.json()
  } finally {
    clearTimeout(t)
  }

  const organic: any[] = Array.isArray(json.organic_results) ? json.organic_results : []
  const ads: any[] = Array.isArray(json.ads) ? json.ads : []

  let kolayimarPoz: number | null = null
  let kolayimarUrl: string | null = null
  const rakipler: SnapshotRow['rakipler'] = []
  const organikOzet: SnapshotRow['organik_ozet'] = []

  for (const o of organic) {
    const host = domainOf(o.link)
    const poz = typeof o.position === 'number' ? o.position : organic.indexOf(o) + 1
    if (!host) continue
    if (kolayimarPoz === null && matchesDomain(host, KENDI_DOMAIN)) {
      kolayimarPoz = poz
      kolayimarUrl = o.link ?? null
    }
    const rakip = RAKIP_DOMAINS.find((d) => matchesDomain(host, d))
    if (rakip && !rakipler.some((r) => r.domain === rakip)) {
      rakipler.push({ domain: rakip, pozisyon: poz })
    }
    if (poz <= 10) {
      organikOzet.push({ pozisyon: poz, domain: host, baslik: String(o.title ?? '').slice(0, 120) })
    }
  }

  const reklamlar: SnapshotRow['reklamlar'] = []
  for (const a of ads) {
    const host = domainOf(a.link || a.tracking_link || a.displayed_link)
    const shown = host || String(a.displayed_link ?? '').replace(/^www\./, '').split('/')[0]
    if (!shown) continue
    if (!reklamlar.some((r) => r.domain === shown)) {
      reklamlar.push({ domain: shown, baslik: String(a.title ?? '').slice(0, 120) })
    }
  }

  // AI Overview: SerpAPI `ai_overview` block; sources in `references[].link`.
  const aio = json.ai_overview
  const aiVar = !!aio && (Array.isArray(aio.text_blocks) ? aio.text_blocks.length > 0 : true)
  const refs: any[] = Array.isArray(aio?.references) ? aio.references : []
  const aiKaynaklar = [...new Set(refs.map((r) => domainOf(r.link)).filter(Boolean))]
  const aiKolayimar = aiKaynaklar.some((d) => matchesDomain(d, KENDI_DOMAIN))

  return {
    sorgu,
    kolayimar_pozisyon: kolayimarPoz,
    kolayimar_url: kolayimarUrl,
    rakipler,
    reklamlar,
    ai_overview_var: aiVar,
    ai_overview_kolayimar: aiKolayimar,
    ai_overview_kaynaklar: aiKaynaklar,
    organik_ozet: organikOzet,
  }
}

/** Scans the whole query set and writes snapshots to the DB. */
export async function collectAramaIstihbarati(svc: any): Promise<CollectSummary> {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) throw new Error('SERPAPI_API_KEY is not set')

  if ((SORGULAR as readonly string[]).every((q) => q.startsWith('your '))) {
    console.warn('[collect] SORGULAR still has placeholder keywords — fill with your niche queries')
  }

  const summary: CollectSummary = {
    sorguSayisi: SORGULAR.length, basarili: 0, hata: 0, ilk10: 0, aiOverviewAtif: 0,
  }

  for (const sorgu of SORGULAR) {
    try {
      const row = await fetchSerp(sorgu, apiKey)
      if (!row) { summary.hata++; continue }
      const { error } = await svc.from('arama_istihbarati').insert(row)
      if (error) throw new Error(error.message)
      summary.basarili++
      if (row.kolayimar_pozisyon !== null && row.kolayimar_pozisyon <= 10) summary.ilk10++
      if (row.ai_overview_kolayimar) summary.aiOverviewAtif++
    } catch (e) {
      console.error(`arama-istihbarati "${sorgu}" failed:`, e)
      summary.hata++
    }
  }

  return summary
}
