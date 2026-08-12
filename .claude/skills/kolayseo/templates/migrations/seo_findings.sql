-- SEO finding/action queue + site-health trend (Command Center — OpenSEO audit bridge).
-- OpenSEO monthly deep audit (orphan/duplicate/backlink) + GSC weekly CTR opportunities
-- land in one queue; the admin "Site Health & Findings" card + the weekly email digest read it.
-- category='site_health' rows carry a metric SNAPSHOT (for delta/trend); others are actions.
CREATE TABLE IF NOT EXISTS public.seo_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'openseo',      -- openseo | gsc | manual
  category text NOT NULL,                       -- orphan | duplicate_content | duplicate_meta | backlink | ctr | perf | site_health
  severity text NOT NULL DEFAULT 'orta',        -- yuksek | orta | dusuk  (high | medium | low)
  baslik text NOT NULL,                         -- title
  aksiyon text,                                 -- action
  url text,
  metrik jsonb NOT NULL DEFAULT '{}'::jsonb,    -- site_health: {orphans, duplicateContent, duplicateMeta, backlinkDomains, backlinkTotal, slowPages}
  status text NOT NULL DEFAULT 'open',          -- open | done | ignored
  resolved_at timestamptz,
  resolved_by text
);

CREATE INDEX IF NOT EXISTS seo_findings_status_idx ON public.seo_findings (status, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS seo_findings_category_idx ON public.seo_findings (category, created_at DESC);

-- Service-role only (admin API); no public policy.
ALTER TABLE public.seo_findings ENABLE ROW LEVEL SECURITY;
