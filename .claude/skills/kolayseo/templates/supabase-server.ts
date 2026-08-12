import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client (server-only; bypasses RLS). Zero-arg BY CONVENTION
 * so every cron/admin route calls `createServiceClient()` the same way.
 * Copy to src/lib/supabase/server.ts.
 *
 * NOTE: sitemap.ts and llms.route.ts construct their own inline `createClient(url, key)`
 * on purpose (self-contained route files); that is equivalent. Prefer THIS wrapper for
 * new server files so the import path is uniform (`@/lib/supabase/server`).
 *
 * If you already have auth in this project, ALSO export your `getCurrentUser()` /
 * role helpers here (the admin routes import them). See templates/admin/require-admin.ts.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not set (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
