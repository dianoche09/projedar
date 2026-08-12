/**
 * Minimal email sender — the weekly digest needs the return contract
 * `{ success: boolean; error?: string }`. Copy to src/lib/email.ts and replace
 * with your provider if you already have one. This default uses Resend.
 */
export async function sendEmail(opts: {
  to: string; subject: string; html: string; text?: string
}): Promise<{ success: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'noreply@example.com'
  if (!key) {
    console.error('[email] RESEND_API_KEY not set — logging instead of sending:', opts.subject)
    return { success: false, error: 'RESEND_API_KEY not set' }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { success: false, error: `Resend HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}` }
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'send failed' }
  }
}
