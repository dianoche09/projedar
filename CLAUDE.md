# CLAUDE.md — Projedar repo kuralları

Bu dosya Claude Code'un her oturumda okuduğu kalıcı kurallardır.

## ⚠️ BAĞLAYICI YAPI — HER GELİŞTİRMEDEN ÖNCE OKU
**`ProjePazar-Sistem-Kurallari.md`** = tüm dokümanların (35 sayfalık ürün analizi, Ekranlar.html, Marka Panosu, gelir modeli, roller) damıtılmış **DEĞİŞMEZ** özüdür. Her geliştirme bu yapıyı **bozmadan, farklı yöne sapmadan** yapılır; bir özellik/karar onunla çelişiyorsa **YAPILMAZ** (önce orada güncellenir). Build sırası planı: `ProjePazar-Devir-Dokumani.md`.

**Kanonik ürün/teknik gerçeği:** `docs/projedar-intelligence/MASTER-PROJEDAR-IDENTITY-V2.md` (kod-doğrulanmış; **26 tablo/13 enum**). Sayı/özellik/claim çelişkisinde **V2 esas.** **Claim politikası:** "ürün gerçeği" (koddan) ↔ "konumlandırma/pazarlama" ↔ "hukuki iddia" ayrı; truth'ta absolutist ifadeler (`%100 doğru`, `imkânsız`, `garanti`, `muaf`, `ilan değildir`) koşulsuz kullanılmaz.

**Roller AYRI panel görür** (Sistem Kuralları B.1-2): `admin` = **BİZ/platform işletmecisi** (üyelik/abonelik/hesap tanımlama/kapasite-kota/doğrulama-güven rozeti/concierge/denetim/gelir) — **asla üretici değildir, üretici ekranı görmez**. `uretici`/`ofis`/`emlakci` = müşteri. **Gelir modeli (fazlı — 2026-06-18):** ERKEN = **müteahhit anlaşması** (ana gelir) + **emlakçı bedava** (basic); SONRA = emlakçı premium → ofis/franchise abonelik. **Komisyon:** müteahhidin emlak danışmanına tanımladığı satış komisyonundan **Projedar pay almaz** (DB'de `komisyon_tip/deger` var); çıplak "komisyon yok" kullanma. İşlem ücreti KARARA BAĞLI DEĞİL. Detay: Sistem Kuralları Bölüm 3.

## Ürün (tek cümle)
Çok-müteahhitli, üretici-kontrollü, **canlı konut stoğu dağıtım ağı**. Üretici stoğu/fiyatı/dağıtımı tek noktadan yönetir; emlakçı yalnız kendisine tahsisli projeleri tek canlı havuzdan görür ve paylaşır. Konum: "en hızlı satış yapılan ağ" / güven protokolü. Tekil CRM/portal/broker değil — saf altyapı.

## Stack
Next.js (App Router, TypeScript, strict) + Tailwind · Supabase (Postgres + Auth + Realtime + Storage + **RLS**) · Vercel (serverless + cron) · PWA (mobil-önce). AI (Claude) ve WhatsApp Cloud API = Faz 2.

## DEĞİŞMEZLER (asla bozma)
1. **RLS-önce.** Her tabloda RLS açık. Görünürlük = `tahsis`. Client'tan **service-role kullanma** (yalnız server/cron). Emlakçı yalnız tahsisli birimleri görebilir.
2. **Tek doğru kaynak.** Fiyat/durum yalnız `birim` tablosunda. Hiçbir yerde kopyalama; paylaşımda fiyat canlı değerden basılır.
3. **Çift-satış kalkanı DB'de.** Aktif opsiyon için `opsiyon` üzerinde unique partial index. Uygulama katmanına güvenme.
4. **WhatsApp MVP = sadece deep-link (giden) + butonlu teyit şablonu.** **Serbest-metin AI parse ile stoğa YAZMA — Faz 2.** MVP'de fiyat panel/concierge ile güncellenir.
5. **Tazelik görünür.** Her yazışta `son_guncelleme=now()`. UI'da "X önce" + N günden eski → stale (yeşil rozet sarıya).
6. **Mobil-önce + PWA.** Her ekran telefonda çalışır, çevrimdışı graceful.

## Kapsam disiplini
- MVP kapsamı: Devir Dokümanı Bölüm 2 (✅ liste). 
- Bölüm 2'deki ⛔ ve Bölüm 15 (Faz 2) işlerini **yazma**. Yeni özellik talebinde "MVP'ye katkısı ne?" diye sor.

## Kod kuralları
- TypeScript strict; input doğrulama Zod ile; server actions/route handlers tip güvenli.
- Para: her zaman `para_birimi` ile. MVP'de TRY; `usd_endeksli` alanı dursun, hesaplama Faz 2.
- Tasarım sistemi: Berrak Güven tokenları (Devir Dokümanı Bölüm 8). Sinyal renkleri: yeşil=müsait, amber=opsiyon, kırmızı=satıldı.
- Migration'lar `db/` altında; şema kaynağı `supabase-schema.sql`.
- Gizli anahtarlar `.env` (örnek: `.env.example`); commit etme.

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`
- **Supabase migration/SQL/RLS = HER ZAMAN browser Dashboard → SQL Editor.** MCP `apply_migration`/`execute_sql` bu projede `Unauthorized` (access token yok, non-interactive OAuth yok); `supabase db push` de yok. Migration dosyasını `db/` altına yaz, sonra kullanıcıya SQL'i **hazır kopyalanır blok** olarak ver — "browser'dan uygula" diye ayrıca uzun uzun anlatma, sadece bloğu sun. Detay: memory `supabase-apply-browser.md`.

## SEO / GEO politikası (skill discovery)
- **SEO/GEO işlerinin kalite kaynağı = `kolayseo` skill.** Repo-içi vendored kopya:
  `.agents/skills/kolayseo/` (fresh clone / CI / her oturum bunu keşfeder). Source-of-truth
  global `~/.claude/skills/kolayseo/`; repo kopyası snapshot — düzenleme kuralları için
  `.agents/skills/kolayseo/VENDORED.md`.
- Yeni public sayfa / route / şehir-ilçe / rehber eklerken **önce** kolayseo kurallarına bak
  (canonical, index/noindex, sitemap, thin-content eşiği, FAQ+schema, answer-first, private-leak).
- Projedar özel kuralı: **kapalı-devre B2B → private-by-default.** Her yeni route için doğrula:
  panel/havuz/opsiyon/paylaşım/`/api` sitemap'e SIZMASIN + robots disallow + gerekli yerde `noindex`.

## Changelog / Memory (bu projeye özel)
Her projenin **kendi** changelog'u vardır. Bu repoda anlamlı her değişiklikten sonra **yalnız bu projenin** changelog'unu güncelle; başka projenin (ör. KolayIMAR) changelog'una **yazma**.
- Changelog: `~/.claude/projects/-Users-gurkankuzu-GK-MAC-D-GK-Proje-admin-ProjePazar/memory/projedar_changelog.md`
- Index: aynı dizindeki `MEMORY.md` (yeni memory eklersen tek satır pointer ekle).
- Format: dosyanın en üstüne `## YYYY-MM-DD HH:MM — [kısa başlık]` + madde. Aynı gün ise mevcut günün altına satır ekle, yeni tarih bloğu açma.
- Trivial işleri (typo, import) yazma.

## Build sırası
Devir Dokümanı Bölüm 16 (PR-1 → PR-10). Sırayla; her PR'da kabul kriterini doğrula (Bölüm 13).
