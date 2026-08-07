/**
 * Web sitesinden iletişim e-postası çıkarımı — LLM YOK, HTTP fetch + regex (sade).
 * Ana sayfa + /iletisim + /contact denenir; kurumsal mail (info@/iletisim@) tercih edilir.
 * Best-effort: site yoksa/erişilemezse/mail yoksa null → aday WhatsApp'a düşer.
 */

const MAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Gerçek iletişim olmayan sık yanlış-pozitifler (analytics/örnek/asset domainleri).
const COP = /(example|sentry|wixpress|\.png|\.jpg|\.gif|\.webp|godaddy|cloudflare|schema\.org|w3\.org|yourdomain|domain\.com|email@)/i;
const TERCIH = /^(info|iletisim|bilgi|satis|kurumsal|destek|contact|hello)@/i;

function temizle(mailler: string[]): string | null {
  const aday = [...new Set(mailler.map((m) => m.toLowerCase()))].filter((m) => !COP.test(m));
  if (aday.length === 0) return null;
  return aday.find((m) => TERCIH.test(m)) ?? aday[0]; // kurumsal öncelik, yoksa ilki
}

async function sayfaCek(url: string, signal: AbortSignal): Promise<string> {
  try {
    const res = await fetch(url, {
      signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (compatible; ProjedarBot/1.0)" },
    });
    if (!res.ok) return "";
    return (await res.text()).slice(0, 400_000); // ilk ~400KB yeter
  } catch {
    return "";
  }
}

/** Bir web sitesinden iletişim maili bul. website boşsa/mail yoksa null. */
export async function mailBul(website: string | null | undefined): Promise<string | null> {
  if (!website) return null;
  let taban: string;
  try {
    taban = new URL(website.startsWith("http") ? website : `https://${website}`).origin;
  } catch {
    return null;
  }

  const ctrl = new AbortController();
  const zaman = setTimeout(() => ctrl.abort(), 9000);
  try {
    // Ana sayfa önce; mail yoksa iletişim sayfaları.
    for (const yol of ["", "/iletisim", "/iletisim.html", "/contact", "/bize-ulasin"]) {
      const html = await sayfaCek(taban + yol, ctrl.signal);
      if (!html) continue;
      const bulunan = temizle(html.match(MAIL_RE) ?? []);
      if (bulunan) return bulunan;
    }
    return null;
  } finally {
    clearTimeout(zaman);
  }
}

/** Eşzamanlılık sınırlı çalıştırıcı — N site aynı anda (kütüphanesiz worker havuzu). */
export async function havuzda<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const sonuc: R[] = new Array(items.length);
  let i = 0;
  async function isci() {
    while (i < items.length) {
      const idx = i++;
      sonuc[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, isci));
  return sonuc;
}
