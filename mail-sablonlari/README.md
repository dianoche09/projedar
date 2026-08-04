# Projedar — Auth mail şablonları

Supabase Dashboard → **Authentication → Emails → Templates** altında her şablonun
**Subject** ve **Message body (HTML)** alanına aşağıdaki eşlemeye göre yapıştır.
Görsel dil app işlemsel mailleriyle (`src/lib/mail.ts`) birebir aynıdır.

| Dosya | Supabase şablonu | Konu (Subject) |
|---|---|---|
| `kayit-onay.html` | Confirm signup | Projedar hesabını doğrula |
| `davet.html` | Invite user | Projedar ağına davet edildin |
| `magic-link.html` | Magic Link | Projedar giriş bağlantın |
| `eposta-degisikligi.html` | Change Email Address | Projedar e-posta değişikliğini onayla |
| `sifre-sifirlama.html` | Reset Password | Projedar şifreni sıfırla |
| `reauth.html` | Reauthentication | Projedar doğrulama kodun |

## Notlar
- `bildirim@projedar.com` gönderici için Supabase **Custom SMTP** (Resend) açık olmalı; yoksa mailler rate-limitli default göndericiden gider.
- Şablon değişkenleri Supabase'e özeldir: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}`, `{{ .NewEmail }}`. **Escape etme, olduğu gibi bırak.**
- Bu dosyalar üretilmiştir: kaynak `scripts/mail-sablon-uret.mjs`. Değişiklik için scripti düzenleyip `node scripts/mail-sablon-uret.mjs` çalıştır.
- Görsel inceleme: `public/mail-onizleme.html` (canlıda `projedar.com/mail-onizleme.html`).
