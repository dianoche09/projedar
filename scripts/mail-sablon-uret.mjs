/**
 * Projedar auth mail şablonu üreteci.
 * Tek kaynaktan (kabuk) hem Supabase Dashboard'a yapıştırılacak 6 HTML üretir
 * hem de tarayıcıda görsel inceleme için birleşik önizleme sayfası.
 *
 * Placeholder token'lar iki moda açılır:
 *   %%URL%% → Supabase: {{ .ConfirmationURL }}   · önizleme: #
 *   %%TOKEN%% → {{ .Token }} · 839 204
 *   %%EMAIL%% → {{ .Email }} · eski@ornek.com
 *   %%NEWEMAIL%% → {{ .NewEmail }} · yeni@ornek.com
 *
 * Çalıştır: node scripts/mail-sablon-uret.mjs
 * Görsel dil `src/lib/mail.ts` mailKabuk ile birebir aynı (Spatial Açık paleti).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RENK = { zemin: "#eef1f6", kart: "#ffffff", ink: "#10243a", inkSoft: "#46586b", inkFaint: "#8a97a6", teal: "#1e9b8a", cizgi: "#e4e8ef", kutuZemin: "#f6f8fb" };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const LOGO = "https://projedar.com/icon-192.png";
const YIL = new Date().getFullYear();

/** Kart gövdesi (parça) — önizlemede istiflenir, dosyada tam HTML'e sarılır. */
function kart({ renk, tint, rozet, baslik, govde, cta, kod, altNot }) {
  const govdeBlok = govde
    ? `<tr><td style="padding:12px 28px 0;"><div style="padding:12px 14px;background:${RENK.kutuZemin};border:1px solid ${RENK.cizgi};border-left:3px solid ${renk};border-radius:10px;font-family:${FONT};font-size:13.5px;line-height:1.5;color:${RENK.inkSoft};">${govde}</div></td></tr>`
    : "";
  const kodBlok = kod
    ? `<tr><td style="padding:18px 28px 0;"><div style="text-align:center;padding:18px;background:${RENK.kutuZemin};border:1px solid ${RENK.cizgi};border-radius:12px;font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:.28em;color:${RENK.ink};">${kod}</div></td></tr>`
    : "";
  const ctaBlok = cta
    ? `<tr><td style="padding:22px 28px 4px;"><a href="${cta.href}" style="display:inline-block;background:${RENK.teal};color:#ffffff;text-decoration:none;font-family:${FONT};font-size:14px;font-weight:700;padding:13px 26px;border-radius:11px;">${cta.label} &rarr;</a></td></tr>`
    : "";
  const altNotBlok = altNot
    ? `<tr><td style="padding:12px 28px 0;"><p style="margin:0;font-family:${FONT};font-size:11.5px;line-height:1.5;color:${RENK.inkFaint};word-break:break-all;">${altNot}</p></td></tr>`
    : "";
  return `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${RENK.kart};border:1px solid ${RENK.cizgi};border-radius:20px;overflow:hidden;">
    <tr><td style="height:4px;background:${renk};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="padding:22px 28px 2px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;padding-right:10px;"><img src="${LOGO}" width="34" height="34" alt="Projedar" style="display:block;border-radius:9px;"></td>
      <td style="vertical-align:middle;font-family:${FONT};font-size:19px;font-weight:800;letter-spacing:-.02em;color:${RENK.ink};">proje<span style="color:${RENK.teal};">dar</span></td>
    </tr></table></td></tr>
    <tr><td style="padding:16px 28px 0;"><span style="display:inline-block;background:${tint};color:${renk};font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 11px;border-radius:999px;">${rozet}</span></td></tr>
    <tr><td style="padding:12px 28px 0;"><h1 style="margin:0;font-family:${FONT};font-size:21px;line-height:1.28;font-weight:800;color:${RENK.ink};">${baslik}</h1></td></tr>
    ${govdeBlok}${kodBlok}${ctaBlok}${altNotBlok}
    <tr><td style="padding:24px 28px 26px;"><hr style="border:none;border-top:1px solid ${RENK.cizgi};margin:0 0 16px;">
      <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:600;color:${RENK.inkSoft};">Projedar &middot; tahsisli canlı satış ağı</p>
      <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.5;color:${RENK.inkFaint};">Bu bir güvenlik / hesap e-postasıdır. Bu işlemi sen başlatmadıysan e-postayı yok sayabilirsin. Soru için <a href="mailto:destek@projedar.com" style="color:${RENK.teal};text-decoration:none;">destek@projedar.com</a>.</p>
    </td></tr>
  </table>`;
}

/** Parçayı tam gönderilebilir HTML dokümanına sarar (Supabase'e yapıştırılacak). */
function belge(parca, preheader) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>Projedar</title></head>
<body style="margin:0;padding:0;background:${RENK.zemin};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${RENK.zemin};padding:28px 16px;"><tr><td align="center">
${parca}
<p style="margin:16px 0 0;font-family:${FONT};font-size:11px;color:${RENK.inkFaint};">© ${YIL} Projedar &middot; projedar.com</p>
</td></tr></table></body></html>`;
}

// ── 6 auth şablonu (placeholder token'larla) ─────────────────────────────────
const SABLONLAR = [
  {
    dosya: "kayit-onay.html", supabase: "Confirm signup", konu: "Projedar hesabını doğrula",
    renk: "#1e9b8a", tint: "#e2f1ef", rozet: "Hesap doğrulama", baslik: "E-posta adresini doğrula",
    govde: "Projedar hesabını etkinleştirmek için e-posta adresini doğrula. Doğrulama sonrası belge adımınla kimliğini teyit ederiz.",
    cta: { label: "E-postamı doğrula", href: "%%URL%%" },
    altNot: "Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır: %%URL%%",
  },
  {
    dosya: "davet.html", supabase: "Invite user", konu: "Projedar ağına davet edildin",
    renk: "#2fb36b", tint: "#e4f5ec", rozet: "Davet", baslik: "Projedar ağına davet edildin",
    govde: "Bir proje sahibi seni Projedar'a davet etti. Daveti kabul edip hesabını oluştur. Belge doğrulaman tamamlanınca sana tahsisli projeler canlı görünür.",
    cta: { label: "Daveti kabul et", href: "%%URL%%" },
  },
  {
    dosya: "magic-link.html", supabase: "Magic Link", konu: "Projedar giriş bağlantın",
    renk: "#13314b", tint: "#e6ebf1", rozet: "Giriş", baslik: "Tek dokunuşla giriş yap",
    govde: "Bu bağlantı seni Projedar'a şifresiz giriş yapar. İsteği sen yapmadıysan bu e-postayı yok say; hesabın güvendedir.",
    cta: { label: "Giriş yap", href: "%%URL%%" },
  },
  {
    dosya: "eposta-degisikligi.html", supabase: "Change Email Address", konu: "Projedar e-posta değişikliğini onayla",
    renk: "#e3a12c", tint: "#fbf1dd", rozet: "E-posta değişikliği", baslik: "Yeni e-posta adresini onayla",
    govde: "Hesap e-postan <b style=\"color:#10243a\">%%EMAIL%%</b> adresinden <b style=\"color:#10243a\">%%NEWEMAIL%%</b> adresine değişecek. Onaylamazsan mevcut adresin kalır.",
    cta: { label: "Değişikliği onayla", href: "%%URL%%" },
  },
  {
    dosya: "sifre-sifirlama.html", supabase: "Reset Password", konu: "Projedar şifreni sıfırla",
    renk: "#d15a4e", tint: "#f9e7e4", rozet: "Şifre sıfırlama", baslik: "Şifreni sıfırla",
    govde: "Şifreni sıfırlamak için tıkla. Bu isteği sen yapmadıysan hesabın güvendedir, bu e-postayı yok sayabilirsin.",
    cta: { label: "Şifremi sıfırla", href: "%%URL%%" },
  },
  {
    dosya: "reauth.html", supabase: "Reauthentication", konu: "Projedar doğrulama kodun",
    renk: "#13314b", tint: "#e6ebf1", rozet: "Doğrulama", baslik: "Doğrulama kodun",
    govde: "Bu işlemi tamamlamak için aşağıdaki kodu ekrana gir. Kod kısa süre geçerlidir; kimseyle paylaşma.",
    kod: "%%TOKEN%%",
  },
];

function coz(str, mod) {
  if (str == null) return str;
  const map = mod === "supabase"
    ? { "%%URL%%": "{{ .ConfirmationURL }}", "%%TOKEN%%": "{{ .Token }}", "%%EMAIL%%": "{{ .Email }}", "%%NEWEMAIL%%": "{{ .NewEmail }}" }
    : { "%%URL%%": "#", "%%TOKEN%%": "839 204", "%%EMAIL%%": "eski@ornek.com", "%%NEWEMAIL%%": "yeni@ornek.com" };
  return Object.entries(map).reduce((s, [k, v]) => s.split(k).join(v), str);
}
function render(t, mod) {
  return kart({
    renk: t.renk, tint: t.tint, rozet: t.rozet, baslik: t.baslik,
    govde: coz(t.govde, mod), cta: t.cta ? { label: t.cta.label, href: coz(t.cta.href, mod) } : null,
    kod: coz(t.kod, mod), altNot: coz(t.altNot, mod),
  });
}

// ── app işlemsel mail örnekleri (önizleme için; mail.ts STIL ile aynı) ────────
const APP_ORNEK = [
  { renk: "#e3a12c", tint: "#fbf1dd", rozet: "Yeni talep", baslik: "Yeni opsiyon talebi", govde: "Kaya Emlak · Meram Panorama · Daire A-12", cta: { label: "Talebi incele", href: "#" } },
  { renk: "#2fb36b", tint: "#e4f5ec", rozet: "Onaylandı", baslik: "Opsiyon talebin onaylandı", govde: "Meram Panorama · Daire A-12 · 3 gün opsiyon", cta: { label: "Opsiyonlarıma git", href: "#" } },
  { renk: "#d15a4e", tint: "#f9e7e4", rozet: "Yanıtlandı", baslik: "Opsiyon talebin reddedildi", govde: "Meram Panorama · Daire A-12", cta: { label: "Opsiyonlarıma git", href: "#" } },
  { renk: "#1e9b8a", tint: "#e2f1ef", rozet: "Yeni lead", baslik: "Yeni müşteri (lead)", govde: "Ahmet Y. · Randevu istedi", cta: { label: "Lead'i gör", href: "#" } },
];

// ── yaz ───────────────────────────────────────────────────────────────────────
const OUT = join(ROOT, "mail-sablonlari");
mkdirSync(OUT, { recursive: true });
for (const t of SABLONLAR) writeFileSync(join(OUT, t.dosya), belge(render(t, "supabase"), t.konu));

// README (Supabase Dashboard eşlemesi + konu satırları)
const readme = `# Projedar — Auth mail şablonları

Supabase Dashboard → **Authentication → Emails → Templates** altında her şablonun
**Subject** ve **Message body (HTML)** alanına aşağıdaki eşlemeye göre yapıştır.
Görsel dil app işlemsel mailleriyle (\`src/lib/mail.ts\`) birebir aynıdır.

| Dosya | Supabase şablonu | Konu (Subject) |
|---|---|---|
${SABLONLAR.map((t) => `| \`${t.dosya}\` | ${t.supabase} | ${t.konu} |`).join("\n")}

## Notlar
- \`bildirim@projedar.com\` gönderici için Supabase **Custom SMTP** (Resend) açık olmalı; yoksa mailler rate-limitli default göndericiden gider.
- Şablon değişkenleri Supabase'e özeldir: \`{{ .ConfirmationURL }}\`, \`{{ .Token }}\`, \`{{ .Email }}\`, \`{{ .NewEmail }}\`. **Escape etme, olduğu gibi bırak.**
- Bu dosyalar üretilmiştir: kaynak \`scripts/mail-sablon-uret.mjs\`. Değişiklik için scripti düzenleyip \`node scripts/mail-sablon-uret.mjs\` çalıştır.
- Görsel inceleme: \`public/mail-onizleme.html\` (canlıda \`projedar.com/mail-onizleme.html\`).
`;
writeFileSync(join(OUT, "README.md"), readme);

// Önizleme (tüm şablonlar tek sayfada, örnek verilerle)
const blok = (etiket, alt, parca) => `<section style="margin:0 auto 30px;max-width:640px;">
  <div style="font-family:${FONT};margin:0 0 8px;padding:0 4px;"><span style="font-size:13px;font-weight:700;color:${RENK.ink};">${etiket}</span> <span style="font-size:12px;color:${RENK.inkFaint};">${alt}</span></div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">${parca}</td></tr></table>
</section>`;
const preview = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Projedar mail önizleme</title></head>
<body style="margin:0;padding:32px 12px;background:${RENK.zemin};">
<div style="max-width:640px;margin:0 auto 24px;font-family:${FONT};">
  <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:${RENK.ink};">Projedar mail sistemi — önizleme</h1>
  <p style="margin:0;font-size:13px;color:${RENK.inkSoft};">Örnek verilerle. Auth mailleri Supabase'e, işlemsel mailler Resend'e gider. Sinyal renk = statü dili.</p>
</div>
<div style="max-width:660px;margin:0 auto 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${RENK.inkFaint};padding:0 8px;">Auth (Supabase)</div>
${SABLONLAR.map((t) => blok(t.konu, t.supabase, render(t, "onizleme"))).join("\n")}
<div style="max-width:660px;margin:26px auto 10px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${RENK.inkFaint};padding:0 8px;">İşlemsel (Resend · app)</div>
${APP_ORNEK.map((t) => blok(t.baslik, t.rozet, kart(t))).join("\n")}
</body></html>`;
writeFileSync(join(ROOT, "public", "mail-onizleme.html"), preview);

console.log(`✓ ${SABLONLAR.length} auth şablonu + README → mail-sablonlari/`);
console.log(`✓ önizleme → public/mail-onizleme.html`);
