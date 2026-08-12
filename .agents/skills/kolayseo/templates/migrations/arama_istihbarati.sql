-- Search Intelligence: weekly SerpAPI scan — for each target query, own organic
-- position, competitor positions, advertisers, and Google AI Overview visibility (GEO).
-- Cron: /api/cron/arama-istihbarati (Monday 04:00 UTC).
CREATE TABLE IF NOT EXISTS public.arama_istihbarati (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sorgu text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  kolayimar_pozisyon integer,                              -- own position; NULL = not in top 20
  kolayimar_url text,
  rakipler jsonb NOT NULL DEFAULT '[]'::jsonb,             -- [{domain, pozisyon}]
  reklamlar jsonb NOT NULL DEFAULT '[]'::jsonb,            -- [{domain, baslik}]
  ai_overview_var boolean NOT NULL DEFAULT false,
  ai_overview_kolayimar boolean NOT NULL DEFAULT false,    -- did AI Overview cite us
  ai_overview_kaynaklar jsonb NOT NULL DEFAULT '[]'::jsonb, -- [domain]
  organik_ozet jsonb NOT NULL DEFAULT '[]'::jsonb,         -- top10 [{pozisyon, domain, baslik}]
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS arama_istihbarati_sorgu_idx
  ON public.arama_istihbarati (sorgu, checked_at DESC);
CREATE INDEX IF NOT EXISTS arama_istihbarati_checked_idx
  ON public.arama_istihbarati (checked_at DESC);

-- Service-role only (admin API); no public policy.
ALTER TABLE public.arama_istihbarati ENABLE ROW LEVEL SECURITY;
