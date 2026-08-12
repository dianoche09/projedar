-- Cron heartbeat store — one row per cron, upserted on each run. An admin health
-- card flags STALE when now - last_run_at > 2× the expected interval.
CREATE TABLE IF NOT EXISTS public.cron_heartbeats (
  cron_name text PRIMARY KEY,
  last_run_at timestamptz NOT NULL DEFAULT now(),
  last_status text,
  last_error text,
  last_duration_ms integer
);

-- Service-role only.
ALTER TABLE public.cron_heartbeats ENABLE ROW LEVEL SECURITY;
