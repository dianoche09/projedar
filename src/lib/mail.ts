import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM ?? "Projedar <bildirim@projedar.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projedar.com";

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

/* ── Marka tokenları (email-safe hex; tasarım dili "Spatial Açık") ────────────── */
const RENK = {
  zemin: "#eef1f6",
  kart: "#ffffff",
  ink: "#10243a",
  inkSoft: "#46586b",
  inkFaint: "#8a97a6",
  teal: "#1e9b8a",
  cizgi: "#e4e8ef",
  kutuZemin: "#f6f8fb",
} as const;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const LOGO = "https://projedar.com/icon-192.png";

/** Mini "bina-kesiti" motifi (email-safe: nested table + bgcolor). Bildirim maillerinde
 *  canlı stok imzası — dekoratif değil, statü dilini (müsait/opsiyon/satıldı) görselleştirir. */
function motifKesiti(): string {
  const D: Record<string, string> = { m: "#2fb36b", o: "#e3a12c", s: "#d15a4e" };
  const kat = (dizi: string[]) =>
    `<tr>${dizi.map((c) => `<td style="width:24px;height:11px;background:${D[c]};border-radius:2px;font-size:0;line-height:0;">&nbsp;</td>`).join("")}</tr>`;
  return `<tr><td style="padding:18px 28px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:3px;">
        ${kat(["m", "o", "m", "s", "m", "m"])}
        ${kat(["m", "m", "s", "o", "m", "s"])}
        ${kat(["s", "m", "m", "m", "o", "m"])}
      </table>
      <p style="margin:9px 0 0;font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:.03em;color:${RENK.inkFaint};"><span style="color:#2fb36b;">&#9679;</span> müsait&nbsp;&nbsp;<span style="color:#e3a12c;">&#9679;</span> opsiyon&nbsp;&nbsp;<span style="color:#d15a4e;">&#9679;</span> satıldı</p>
    </td></tr>`;
}

/**
 * Ortak marka kabuğu — tüm işlemsel mailler bunu kullanır.
 * Gradient sinyal şeridi (statü→teal) + logo + "canlı ağ" imzası + sinyalli rozet + başlık +
 * veri kutusu + (opsiyonel bina-kesiti motifi) + teal CTA + footer.
 * Tablo-tabanlı + inline stil (Outlook/Gmail uyumu). SVG YOK (client'lar strip'ler) → hosted PNG logo.
 * motif=true → bildirim maillerinde canlı stok motifi (auth mailleri sade kalır).
 */
export function mailKabuk(o: {
  preheader: string;
  rozet: string;
  renk: string; // statü rengi (üst şerit + veri kutusu sol kenarı + rozet metni)
  tint: string; // rozet arka planı (statü renginin açık tonu)
  baslik: string;
  govde?: string | null;
  ctaLabel: string;
  ctaUrl: string;
  altNot?: string | null;
  motif?: boolean;
  pazarlama?: boolean; // true → ticari-ileti footer'ı (İYS/ETK ret ibaresi + opt-out linki)
  cikisUrl?: string | null; // opt-out (abonelikten çık) linki — pazarlama maillerinde zorunlu
}): string {
  const yil = new Date().getFullYear();
  const govdeBlok = o.govde
    ? `<tr><td style="padding:12px 28px 0;">
        <div style="padding:12px 14px;background:${RENK.kutuZemin};border:1px solid ${RENK.cizgi};border-left:3px solid ${o.renk};border-radius:10px;font-family:${FONT};font-size:13.5px;line-height:1.5;color:${RENK.inkSoft};">${htmlKacir(o.govde)}</div>
      </td></tr>`
    : "";
  const motifBlok = o.motif ? motifKesiti() : "";
  // Footer: işlem bildirimi (default) vs. ticari ileti (pazarlama). Ticari iletide ETK/İYS ret
  // ibaresi + opt-out linki ZORUNLU (soğuk davet = ticari elektronik ileti).
  const footerBlok = o.pazarlama
    ? `<p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:600;color:${RENK.inkSoft};">Projedar &middot; tahsisli canlı satış ağı</p>
      <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.5;color:${RENK.inkFaint};">Bu bir ticari elektronik iletidir. Bu daveti işletmenizle ilgili bir iş birliği önerisi olarak aldınız. Bir daha ileti almak istemezsiniz${o.cikisUrl ? ` <a href="${htmlKacir(o.cikisUrl)}" style="color:${RENK.teal};text-decoration:none;">buradan çıkış yapın</a>` : ""}. İletişim: <a href="mailto:destek@projedar.com" style="color:${RENK.teal};text-decoration:none;">destek@projedar.com</a>.</p>`
    : `<p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:600;color:${RENK.inkSoft};">Projedar &middot; tahsisli canlı satış ağı</p>
      <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.5;color:${RENK.inkFaint};">Bu bir işlem bildirimidir, pazarlama e-postası değildir; bir hesap hareketi olduğu için aldın. Soru için <a href="mailto:destek@projedar.com" style="color:${RENK.teal};text-decoration:none;">destek@projedar.com</a>.</p>`;
  const altNotBlok = o.altNot
    ? `<tr><td style="padding:10px 28px 0;">
        <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.5;color:${RENK.inkFaint};">${htmlKacir(o.altNot)}</p>
      </td></tr>`
    : "";
  return `<!doctype html><html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>Projedar</title></head>
<body style="margin:0;padding:0;background:${RENK.zemin};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${htmlKacir(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${RENK.zemin};padding:28px 16px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${RENK.kart};border:1px solid ${RENK.cizgi};border-radius:20px;overflow:hidden;">
    <tr><td style="height:5px;background:${o.renk};background-image:linear-gradient(90deg,${o.renk} 0%,${RENK.teal} 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:22px 28px 2px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;padding-right:10px;width:34px;"><img src="${LOGO}" width="34" height="34" alt="Projedar" style="display:block;border-radius:9px;"></td>
        <td style="vertical-align:middle;font-family:${FONT};font-size:19px;font-weight:800;letter-spacing:-.02em;color:${RENK.ink};">proje<span style="color:${RENK.teal};">dar</span></td>
        <td style="vertical-align:middle;text-align:right;font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:.04em;color:${RENK.inkFaint};white-space:nowrap;"><span style="color:#2fb36b;">&#9679;</span> canlı ağ</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:16px 28px 0;">
      <span style="display:inline-block;background:${o.tint};color:${o.renk};font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:999px;">&#9679; ${htmlKacir(o.rozet)}</span>
    </td></tr>
    <tr><td style="padding:12px 28px 0;">
      <h1 style="margin:0;font-family:${FONT};font-size:21px;line-height:1.28;font-weight:800;color:${RENK.ink};">${htmlKacir(o.baslik)}</h1>
    </td></tr>
    ${govdeBlok}
    ${motifBlok}
    <tr><td style="padding:22px 28px 4px;">
      <a href="${htmlKacir(o.ctaUrl)}" style="display:inline-block;background:${RENK.teal};color:#ffffff;text-decoration:none;font-family:${FONT};font-size:14px;font-weight:700;padding:13px 26px;border-radius:11px;">${htmlKacir(o.ctaLabel)} &rarr;</a>
    </td></tr>
    ${altNotBlok}
    <tr><td style="padding:24px 28px 26px;">
      <hr style="border:none;border-top:1px solid ${RENK.cizgi};margin:0 0 16px;">
      ${footerBlok}
    </td></tr>
  </table>
  <p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${RENK.inkFaint};">© ${yil} Projedar &middot; projedar.com</p>
</td></tr>
</table></body></html>`;
}

/* ── Bildirim tipi → mail stili (sinyal renk = statü dili; CTA teal = aksiyon) ── */
type MailStil = { renk: string; tint: string; rozet: string; cta: string };
const STIL: Record<string, MailStil> = {
  talep: { renk: "#e3a12c", tint: "#fbf1dd", rozet: "Yeni talep", cta: "Talebi incele" },
  onay: { renk: "#2fb36b", tint: "#e4f5ec", rozet: "Onaylandı", cta: "Opsiyonlarıma git" },
  red: { renk: "#d15a4e", tint: "#f9e7e4", rozet: "Yanıtlandı", cta: "Opsiyonlarıma git" },
  lead: { renk: "#1e9b8a", tint: "#e2f1ef", rozet: "Yeni lead", cta: "Lead'i gör" },
  tahsis: { renk: "#2fb36b", tint: "#e4f5ec", rozet: "Yeni tahsis", cta: "Projeyi gör" },
  sistem: { renk: "#13314b", tint: "#e6ebf1", rozet: "Bilgi", cta: "Panele git" },
};

/** Tip-bazlı işlemsel bildirim maili (opsiyon talep/onay/red, lead, tahsis, sistem). */
export function bildirimMailiTipli(tip: string, baslik: string, govde: string | null, link: string | null): string {
  const s = STIL[tip] ?? STIL.sistem;
  return mailKabuk({
    preheader: govde ? `${baslik} — ${govde}` : baslik,
    rozet: s.rozet,
    renk: s.renk,
    tint: s.tint,
    baslik,
    govde,
    ctaLabel: s.cta,
    ctaUrl: link ? `${SITE_URL}${link}` : SITE_URL,
    motif: true,
  });
}

/** Geriye dönük uyum — tip verilmeyen çağrılar "sistem" stiliyle basılır. */
export function bildirimMaili(baslik: string, govde: string | null, link: string | null): string {
  return bildirimMailiTipli("sistem", baslik, govde, link);
}

/* ── Hesap güvenliği: şifre sıfırlama + hesap kurulumu (admin tetikli, link'li) ── */

/**
 * Admin tetikli şifre sıfırlama maili — güvenli tek-kullanımlık kurtarma bağlantısı.
 * Link /auth/callback → /sifre-yenile'ye düşer; kullanıcı KENDİ parolasını belirler.
 * Düz-metin parola yok. Best-effort (mailGonder).
 */
export function parolaSifirlamaMaili(o: { ad: string | null; link: string }): string {
  return mailKabuk({
    preheader: "Şifre sıfırlama bağlantın hazır",
    rozet: "Güvenlik",
    renk: "#1e9b8a",
    tint: "#e2f1ef",
    baslik: o.ad ? `${o.ad}, şifreni yeniden belirle` : "Şifreni yeniden belirle",
    govde:
      "Projedar hesabın için şifre sıfırlama talebi alındı. Aşağıdaki butonla yeni şifreni sen belirle. " +
      "Bağlantı tek kullanımlıktır ve kısa süre sonra geçersiz olur. Bu talebi sen yapmadıysan bu e-postayı yok say; şifren değişmez.",
    ctaLabel: "Yeni şifre belirle",
    ctaUrl: o.link,
    altNot: "Buton çalışmazsa bağlantıyı kopyalayıp tarayıcına yapıştır.",
  });
}

/**
 * Admin tarafından açılan yeni hesap için kurulum maili — kullanıcı ilk girişte
 * KENDİ parolasını belirler (aynı güvenli kurtarma bağlantısı akışı). Best-effort.
 */
export function hesapKurulumMaili(o: { ad: string | null; link: string }): string {
  return mailKabuk({
    preheader: "Projedar hesabın hazır — şifreni belirle",
    rozet: "Hesap kurulumu",
    renk: "#2fb36b",
    tint: "#e4f5ec",
    baslik: o.ad ? `${o.ad}, Projedar hesabın hazır` : "Projedar hesabın hazır",
    govde:
      "Senin için bir Projedar hesabı oluşturuldu. Başlamak için aşağıdaki butonla kendi şifreni belirle. " +
      "Bağlantı tek kullanımlıktır ve kısa süre sonra geçersiz olur.",
    ctaLabel: "Şifreni belirle ve başla",
    ctaUrl: o.link,
    altNot: "Buton çalışmazsa bağlantıyı kopyalayıp tarayıcına yapıştır.",
  });
}

/* ── Keşif motoru: aday davet maili (ticari elektronik ileti) ───────────────── */
const SEGMENT_METIN: Record<string, { rol: string; fayda: string }> = {
  muteahhit: { rol: "müteahhit/geliştirici", fayda: "konut stoğunuzu tek noktadan yönetip bağımsız emlakçı ağına canlı dağıtın" },
  ofis: { rol: "emlak ofisi", fayda: "size tahsisli projeleri tek canlı havuzdan görüp ekibinizle paylaşın" },
  emlakci: { rol: "gayrimenkul danışmanı", fayda: "size tahsisli projeleri tek canlı havuzdan görüp müşterinizle paylaşın" },
  proje: { rol: "geliştirici", fayda: "projenizi bağımsız emlakçı ağına canlı dağıtın" },
};

/**
 * Aday davet maili — admin keşif motorunun gönderdiği soğuk davet.
 * Pazarlama footer'ı (opt-out + İYS/ETK ret) + davet-token'lı kayıt CTA'sı. Best-effort.
 */
export function davetMaili(o: {
  firma: string;
  segment: string;
  il: string | null;
  kayitUrl: string;
  cikisUrl: string;
  ekMesaj?: string | null;
}): string {
  const s = SEGMENT_METIN[o.segment] ?? SEGMENT_METIN.muteahhit;
  const konum = o.il ? `${o.il} bölgesinde ` : "";
  const govde =
    `Merhaba, ${konum}${s.rol} olarak ${o.firma} ekibini Projedar ağına davet ediyoruz. ` +
    `Projedar ile ${s.fayda}. Komisyon yok; çift satış yapısal olarak engelli.` +
    (o.ekMesaj ? `\n\n${o.ekMesaj}` : "");
  return mailKabuk({
    preheader: `${o.firma} — Projedar davet`,
    rozet: "Davet",
    renk: "#1e9b8a",
    tint: "#e2f1ef",
    baslik: `${o.firma} · Projedar'a davetlisiniz`,
    govde,
    ctaLabel: "Hesabını oluştur",
    ctaUrl: o.kayitUrl,
    pazarlama: true,
    cikisUrl: o.cikisUrl,
  });
}
