import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM ?? "ProjePazar <bildirim@projepazar.com>";

/**
 * Transactional mail — BEST-EFFORT. RESEND_API_KEY yoksa sessiz atlar (akışı bozmaz).
 * Kurulum: RESEND_API_KEY + doğrulanmış domain (MAIL_FROM) env'e ekle.
 */
export async function mailGonder(opts: { to: string; konu: string; html: string }): Promise<void> {
  if (!KEY || !opts.to) return;
  try {
    const resend = new Resend(KEY);
    await resend.emails.send({ from: FROM, to: opts.to, subject: opts.konu, html: opts.html });
  } catch {
    /* best-effort */
  }
}

/** HTML injection engeli — kullanıcı kaynaklı metinler (ör. public lead'deki ad) şablona escape'lenerek girer. */
function htmlKacir(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projepazar.vercel.app";

/** Basit bildirim maili şablonu (tasarım tokenlarıyla uyumlu inline stil). */
export function bildirimMaili(baslik: string, govde: string | null, link: string | null): string {
  const url = link ? `${SITE_URL}${link}` : SITE_URL;
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#f5f5f4;margin:0;padding:24px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;padding:26px;border:1px solid #e7e5e4">
    <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a">${htmlKacir(baslik)}</h2>
    ${govde ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.5;color:#475569">${htmlKacir(govde)}</p>` : ""}
    <a href="${htmlKacir(url)}" style="display:inline-block;background:#1e9b8a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:9px;font-size:14px;font-weight:600">Panele git</a>
    <p style="margin:22px 0 0;font-size:12px;color:#94a3b8">ProjePazar · tahsisli canlı satış ağı</p>
  </div></body></html>`;
}
