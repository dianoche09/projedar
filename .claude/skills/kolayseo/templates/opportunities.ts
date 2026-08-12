/**
 * SEO Opportunity/Action Engine (Command Center — Module 3).
 *
 * Turns arama_istihbarati (SerpAPI: own + competitor positions, AI Overview)
 * snapshots from a one-way "thermometer" into a closed loop: for each query it
 * analyzes the latest (and previous, if any) snapshot and emits a concrete,
 * prioritized opportunity/warning. So "Competitor #1, we have no page" no longer
 * waits to be noticed by hand — it surfaces in the admin panel.
 *
 * Needs no new data, table or cron — derived from existing snapshots.
 *
 * CONFIG PER PROJECT: fill COMMERCIAL_COMPETITORS with your niche's commercial
 * competitors (exclude official/government sources — being below them is normal).
 */

// Snapshot row from the admin API (arama_istihbarati columns).
export interface SnapshotRow {
  sorgu: string            // query
  checked_at: string
  // Internal column convention (kept consistent across migration + collect + digest).
  // Do NOT half-rename: renaming here alone breaks the SQL insert + digest select.
  kolayimar_pozisyon: number | null // own organic position; NULL = not in top N
  kolayimar_url: string | null
  rakipler: { domain: string; pozisyon: number }[] // competitors
  ai_overview_var: boolean
  ai_overview_kolayimar: boolean
}

export type FirsatTipi = 'bosluk' | 'ai_overview' | 'dusus' | 'itme' // gap | ai_overview | drop | push
export type Oncelik = 'yuksek' | 'orta' | 'dusuk' // high | medium | low

export interface Firsat {
  sorgu: string
  tip: FirsatTipi
  oncelik: Oncelik
  baslik: string
  aksiyon: string
  kolayimarPozisyon: number | null
  rakip: { domain: string; pozisyon: number } | null
  checkedAt: string
}

// Commercial competitors (their organic position is recorded). Official/government
// sources are NOT competition — being below them is normal.  ← FILL FOR YOUR NICHE
const COMMERCIAL_COMPETITORS = [
  'competitor-a.com', 'competitor-b.com', 'competitor-c.com',
]

const ONCELIK_SIRA: Record<Oncelik, number> = { yuksek: 0, orta: 1, dusuk: 2 }

function enIyiRakip(rakipler: SnapshotRow['rakipler']): { domain: string; pozisyon: number } | null {
  const commercial = (rakipler || [])
    .filter((r) => COMMERCIAL_COMPETITORS.includes(r.domain))
    .sort((a, b) => a.pozisyon - b.pozisyon)
  return commercial[0] ?? null
}

/**
 * From a snapshot list (checked_at DESC, admin API format) derives the single
 * highest-priority opportunity per query. One query = at most one opportunity.
 */
export function deriveOpportunities(rows: SnapshotRow[]): Firsat[] {
  // Guard the silent no-op: unfilled placeholder competitors never match, so no
  // "gap" opportunity would ever fire (the highest-value signal), silently.
  if (COMMERCIAL_COMPETITORS.every((d) => d.startsWith('competitor-'))) {
    console.warn('[opportunities] COMMERCIAL_COMPETITORS still has placeholders — "gap" opportunities will never fire until filled')
  }
  const bySorgu = new Map<string, SnapshotRow[]>()
  for (const r of rows) {
    const arr = bySorgu.get(r.sorgu) ?? []
    arr.push(r)
    bySorgu.set(r.sorgu, arr)
  }

  const firsatlar: Firsat[] = []

  for (const [sorgu, snaps] of bySorgu) {
    const son = snaps[0]       // latest (rows are DESC)
    const onceki = snaps[1]    // previous
    if (!son) continue

    const poz = son.kolayimar_pozisyon
    const rakip = enIyiRakip(son.rakipler)
    const adaylar: Firsat[] = []

    // 1) GAP — we're not in top 10 but a commercial competitor is. Highest loss.
    if ((poz === null || poz > 10) && rakip && rakip.pozisyon <= 10) {
      adaylar.push({
        sorgu, tip: 'bosluk', oncelik: 'yuksek',
        baslik: `Not in top 10; ${rakip.domain} #${rakip.pozisyon}`,
        aksiyon: `Open a strong, public, schema'd landing for "${sorgu}" or optimize an existing page to it.`,
        kolayimarPozisyon: poz, rakip, checkedAt: son.checked_at,
      })
    }

    // 2) DROP — position worsened vs the previous snapshot.
    if (onceki && poz !== null && onceki.kolayimar_pozisyon !== null && poz > onceki.kolayimar_pozisyon) {
      adaylar.push({
        sorgu, tip: 'dusus', oncelik: 'yuksek',
        baslik: `Position dropped: #${onceki.kolayimar_pozisyon} → #${poz}`,
        aksiyon: `Check the "${sorgu}" page: content freshness, technical error (noindex/redirect), competitor move.`,
        kolayimarPozisyon: poz, rakip, checkedAt: son.checked_at,
      })
    }

    // 3) PUSH — below page one (4-10), one nudge away. Low-cost win.
    if (poz !== null && poz >= 4 && poz <= 10) {
      adaylar.push({
        sorgu, tip: 'itme', oncelik: 'orta',
        baslik: `Within push distance: #${poz}`,
        aksiyon: `Move "${sorgu}" into the top 3 with internal links, deeper FAQ, and title/meta tuning.`,
        kolayimarPozisyon: poz, rakip, checkedAt: son.checked_at,
      })
    }

    // 4) AI OVERVIEW — Google AI Overview shows but we're not a source (GEO loss).
    if (son.ai_overview_var && !son.ai_overview_kolayimar) {
      adaylar.push({
        sorgu, tip: 'ai_overview', oncelik: poz !== null && poz <= 10 ? 'orta' : 'dusuk',
        baslik: 'AI Overview present, not a source',
        aksiyon: `Add/strengthen an answer-first paragraph (clear answer in first 150 chars) + FAQPage schema for "${sorgu}".`,
        kolayimarPozisyon: poz, rakip, checkedAt: son.checked_at,
      })
    }

    if (adaylar.length === 0) continue
    adaylar.sort((a, b) => ONCELIK_SIRA[a.oncelik] - ONCELIK_SIRA[b.oncelik])
    firsatlar.push(adaylar[0])
  }

  firsatlar.sort((a, b) => {
    const o = ONCELIK_SIRA[a.oncelik] - ONCELIK_SIRA[b.oncelik]
    if (o !== 0) return o
    return (a.rakip?.pozisyon ?? 99) - (b.rakip?.pozisyon ?? 99)
  })

  return firsatlar
}

/** Opportunity summary counter (admin card header). */
export function firsatOzet(firsatlar: Firsat[]) {
  return {
    toplam: firsatlar.length,
    yuksek: firsatlar.filter((f) => f.oncelik === 'yuksek').length,
    bosluk: firsatlar.filter((f) => f.tip === 'bosluk').length,
    aiOverview: firsatlar.filter((f) => f.tip === 'ai_overview').length,
  }
}
