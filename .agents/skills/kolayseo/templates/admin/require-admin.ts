import { NextResponse } from 'next/server'

/**
 * Admin-role guard for admin API routes. Copy to src/lib/admin/require-admin.ts.
 *
 * ⚠️ YOU MUST WIRE THIS TO YOUR AUTH. It ships FAILING CLOSED (501) so an
 * unimplemented guard can never accidentally expose admin data. Replace the body
 * with your real session/role check and return `null` when authorized.
 *
 * Returns: null if authorized, or a Response (401/501) to return early if not.
 */
export async function requireAdmin(): Promise<Response | null> {
  // Example (Supabase auth + a `roles` array on the user):
  //   const user = await getCurrentUser()
  //   if (!user || !user.roles?.includes('admin')) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  //   }
  //   return null
  return NextResponse.json(
    { error: 'requireAdmin not implemented — wire it to your auth before shipping' },
    { status: 501 },
  )
}
