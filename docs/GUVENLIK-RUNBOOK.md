# Güvenlik Runbook — Projedar

Sır (secret) sızıntısı / açığa çıkma durumunda hızlı müdahale. Solo-operatör için kısa ve uygulanabilir.

## 1. BYOK entegrasyon anahtarları (`pazarlama_entegrasyon`)

**Ne:** Anthropic/Claude, SerpAPI, Serper, Google Places, fal, ElevenLabs, Publer, Render token vb. üçüncü-taraf API anahtarları. Panelden (`/admin/pazarlama`) girilir, `pazarlama_entegrasyon` singleton satırında saklanır.

**Koruma durumu (2026-08-20 doğrulandı):**
- RLS **açık + SIFIR policy** → `authenticated`/`anon` okuyamaz; yalnız `service-role` (server/cron) erişir. Uygulama kullanıcılarına asla sızmaz.
- Hiçbir yerde **log'lanmaz** (denetlendi: `anahtarlariOku()` çıktısı `console.*`/`JSON.stringify`'a gitmiyor). Test: `tests/domain/db-invariants.test.ts` RLS deny-all'ı doğrular.
- **Saklama plaintext** — kalan tek risk: DB dump / backup / replica / Supabase-taraf erişim. (Vault ile at-rest şifreleme opsiyonel, ertelendi.)

**Sızıntı olursa (backup/dump/service-role-key ele geçti):**
1. İlgili vendor panelinden anahtarı **iptal + yeniden üret** (bu anahtarlar rotate-edilebilir; asıl kurtarma budur).
2. `/admin/pazarlama`'dan yeni anahtarı gir (veya Vercel env güncelle).
3. Service-role key sızdıysa: Supabase → Project Settings → API → **service_role key'i rotate et** + Vercel env güncelle + redeploy.
4. `events` / erişim loglarında anormal kullanım var mı bak.

## 2. Paylaşım linki sırrı (`LEAD_SHARE_SECRET`)

**Ne:** Eski uzun paylaşım linklerinin (`/p/{emlakci}/{birim}/{token}`) imza anahtarı. Yeni kısa kodlar (`/p/{kod}`) bu sırra bağlı DEĞİL (DB'de rastgele, `paylasim_kod.aktif` ile iptal edilebilir).

**Break-glass (bir uzun link sızdı / kötüye kullanılıyor):**
- Tek bir uzun link iptal edilemez (deterministik). Toplu geçersizleştirme = **`LEAD_SHARE_SECRET`'i rotate et** (Vercel env) → tüm eski uzun linkler anında geçersiz. Kısa kodlar etkilenmez (DB-tabanlı), çalışmaya devam eder.
- Rotate sonrası dolaşımdaki eski uzun linkler 404/generic'e düşer; müşteriye yeni **kısa link** paylaş.

**Not:** Yeni paylaşımlar daima iptal-edilebilir kısa kod üretir; uzun link artık emisyon EDİLMEZ (fail-closed). `aktif=false` yapmak render + lead + etkileşimi birlikte durdurur (OQ-SHARE-001 kapandı).

## 3. Genel ilkeler
- Sır asla commit'lenmez (`.env`, `.gitignore`). Anahtarlar log'lanmaz.
- Service-role yalnız server/cron; client'tan asla (DEĞİŞMEZ #1).
- Şüpheli erişimde önce rotate, sonra kök-neden.
