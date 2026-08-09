# 10 — TODO, ROADMAP SIGNALS & TECH DEBT

Etiketler: KANITLI / ÇIKARIM / MOCK / TODO.

---

## 1. Feature flag / gizli / gelişmekte olan (§35)

Kodda formal feature-flag sistemi **yok**. "Gelecek" işaretleri şöyle görünür:
- **`demo` bayrağı:** `proje.demo=true` — doğrulanmamış emlakçının görebildiği tek proje (KYC-öncesi tanıtım). Feature-flag benzeri.
- **"Sonraki faz" etiketli (kodda alan var, akış yok):** `pazarlama_entegrasyon` içinde ElevenLabs/Publer/render anahtarları ("Sesli Reel / Otomatik Yayın" — sonraki faz); içerik motoru (kart/karusel) anahtarları mevcut.
- **Şema iskeleti (dormant):** `fiyat_kurali` (dinamik fiyat, iş mantığı yok), `opsiyon_talep.kod/kod_son`, `proje` yurtdışı kolonları (para_birimi≠TRY, oturum_uygun, golden_visa_esik, diller).
- **Rol iskeleti:** `arsa_sahibi`, `marka_yetkili` (panel yok, `/havuz`'a düşer).
- **Mockup/tasarim sayfaları:** `mockup-01..11`, `/tasarim/[yon]` (design-lab, noindex — ürün değil).
- **Spec/plan dosyaları (`docs/superpowers/`):** admin başvurular, emlakçı katalog, sunum deckleri, emlakçı performans, keşif davet motoru — bunların çoğu **uygulanmış** (kod mevcut).

## 2. Roadmap sinyalleri (§35 — plan vs deneme ayrımı)

**Kesin plan (doküman + kod iskeleti destekli):**
- WhatsApp Cloud API (giden mesaj otomasyonu) — MVP deep-link.
- WhatsApp serbest-metin AI parse ile stoğa yazma (DEĞİŞMEZ #4 → Faz-2; "yanlış parse = yanlış stok = ölümcül").
- Dinamik fiyat otomasyonu (`fiyat_kurali` hazır: kat katsayısı + fiyat geçmişi).
- Paylaşım Stüdyosu premium (emlakçı gelir kademesi).
- Ofis/franchise SaaS abonelik konsolu (`abonelik` altyapısı hazır).
- Arsa sahibi paneli + pay bildirimi; marka konsolu.
- Yurtdışı projeler (döviz/golden-visa/oturum/çok-dil — şema kolonları boş).
- AI hibrit search (pgvector) + semantik eşleştirme (`/havuz/eslestir` NLP).
- Kolayimar video motoru entegrasyonu; Identity Graph (KVKK kapısı, kullanıcı kararı bekliyor).
- Finansal katman (Bloomberg vizyonu: fiyat/talep endeksi → yatırım platformu).
- Sydney→Frankfurt region migration.

**Backlog (§ `ProjePazar-Gelistirme-Duzeltme-Backlog.md` + Sentez):**
- Hakediş defteri (kazanılan-vs-ödenen; platform pay ALMAZ, sadece takip).
- Zaman-damgalı müşteri-claim sertifikası (PDF/QR, hukuki ispat).
- Dijital aracılık sözleşmesi şablonu (Taşınmaz Tic. Yön. m.20).
- EOI / pre-launch ön-talep yönetimi.
- Link-teklif + görüntülenme analitiği (DomusHub deseni).
- `/firma/[slug]` müteahhit kurumsal SEO sayfası + `uretici.public_slug`.
- Performans skoru → iyi emlakçıya öncelikli tahsis.
- **Sektörel bilgilendirme SEO/GEO sayfaları** (emlakçı arama-niyeti hedefli — en son kullanıcı oturumunun konusu; blog/içerik altyapısı gerekir).

**Vizyon aşamaları:** bugün canlı stok ağı → +12ay proje veri altyapısı → +24ay fiyat/talep endeksi → +36ay yatırım platformu.

## 3. Backlog P0/P1/P2 (KANITLI — repo backlog dosyası, 2026-08)

**P0 (güven-kritik, çoğu metin):**
- ✅ (yapıldı — commit'lerde görülüyor) `/muteahhit` "Bölge başına sınırlı kurucu kontenjanı" kaldır (kıtlık-vaadi-yok ihlali).
- ✅ "Komisyona ortak olmaz" wording (ProjedarBanner/B2BCta/DavetPopup/proje/emlakci) — "kazancın %100'ü senin".
- M4 SSS "rakip müteahhit fiyatımı görebilir mi?" (RLS izolasyonu) — `/muteahhit`+`/guven` (kısmen eklendi).
- E7 EİDS + sosyal-medya paylaşım politikası `/emlakci` (eklendi).
- ✅ 🔴 CANLI BUG `/konut-projeleri` hub 404 → route oluşturuldu (commit `fbb4223`).

**P1 (içerik + deck):** `/proje` iki-mod içerik (katalog vs ağdaki proje), "Bu sayfa nedir" tekrar kaldırma, `/firma/[slug]`, deck rekabet/finansal slaytlar, konum cümlesi hizalama.

**P2 (Faz-2 ürün):** hakediş defteri, claim sertifikası, aracılık sözleşmesi, EOI, link-teklif analitiği, WhatsApp Cloud API.

**Almayacaklarımız (DEĞİŞMEZ):** boost/vitrin geliri, komisyon escrow/işlem-başı ücret (sadece takip), serbest-metin AI stok yazma (MVP yasak).

## 4. TODO / FIXME / teknik borç (§36)

- **Formal TODO/FIXME: yok** (grep temiz tüm slice'larda).
- **Geçici debug (kaldırılmalı — TODO):** `src/app/havuz/actions.ts:91-95` `opsiyonTalepGonder` ham Postgres hata metnini (`code`+`message`) kullanıcıya döndürüyor ("TANI (geçici)"). Bilgi ifşası riski.
- **Migration-gated:** ödeme planı (`db/2026-06-28_odeme-plani.sql` uygulanmazsa graceful hata) — `kurulum/page.tsx:350`, `actions.ts:1219`, `ProjeWizard.tsx:410`.
- **Ölçek borcu:** `talep-radari` events 20.000 satır limit → SQL agregasyona taşı.
- **Tasarım borcu:** `Grafik.tsx`/`GuvenRozeti.tsx` raw `slate-*` + hardcoded `#9a6a12`/`#f1f5f9` (token değil); manifest `theme_color #13314b` vs viewport `#eef1f6` drift; 3 Google font `latin-ext` yok (Türkçe glyph fallback).
- **Güvenlik borcu (sertleştirme):** dağıtık rate-limit, `/api/etkilesim` throttle + log, `pazarlama_entegrasyon` plaintext→Vault, HMAC token uzunluğu, secret rotate.
- **Test borcu:** sıfır otomatik test (kritik opsiyon/RLS flow'ları).
- **Hukuki borç:** 3 hukuki sayfa TASLAK (avukat), public `/hesap-silme` yok, EİDS "ilan mahiyeti" hukuk kontrolü, dijital aracılık sözleşmesi.
- **SEO borcu:** noindex hukuki sayfalar sitemap'te; blog/içerik altyapısı yok (sektörel SEO için gerekli).

## 5. Kategori dışı — NE YAPMAYIZ (§35 tersi)
3D/immersive stüdyo motoru · tam CRM/muhasebe/ERP/post-sales evrak · online ödeme/escrow + otomatik sözleşme üretimi · fuar/phygital · B2C açık ilan portalı · boost/vitrin geliri · komisyon escrow.

## 6. Kapsam disiplini testi (her yeni özellik için)
"Canlı stok + üretici-kontrolü + güven protokolü + dağıtımı mı güçlendiriyor; yoksa beni Sales OS / CRM / ERP / 3D stüdyo mu yapıyor?" + REFRAME: "Veri yerçekimini artırıyor mu?"
