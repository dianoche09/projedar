# 08 — BRAND, COPY & DESIGN

Etiketler: KANITLI / ESKİ (doküman↔kod drift).

---

## 1. Marka kimliği (§2)

### İsim
- Ürün adı **Projedar**; domain **projedar.com**. (KANITLI — `layout.tsx`, `manifest.json`, `package.json name:"projedar"`.)
- **Eski ad: ProjePazar** — iç doküman dosya adlarında korunmuş (`ProjePazar-*.md`), repo/marka Projedar. Kodda "ProjePazar/Proje Pazar" kullanıcıya görünür yerde yok. Wordmark: "proje" (navy) + "dar" (teal). Repo: `dianoche09/projedar`.
- **Marka anlamı:** proje + "-dar" (sahiplik/yön eki) + "radar" çağrışımı — logo bir **radar** (sonar halkaları + sinyal blip'leri + yeşil ping). "Canlı, doğru bilgi radarı."
- **Subdomain:** yok (tek domain); panel yolları path-based (`/uretici`, `/havuz`, `/admin`).

### Positioning / slogan adayları (§57 — kodda geçen)
- Site title: **"Projedar — Canlı Konut Stoğu Dağıtım Ağı"**
- Homepage title: "Projedar — Yeni projelerin profesyonel satış ağı"
- Hero H1: **"Bloklar yükselir. Stok erir."**
- `/muteahhit` H1: "Envanter kontrolü sende. Çift satış yapısal olarak imkânsız."
- `/emlakci` title: "Emlakçılar için Projedar: Ücretsiz | Komisyonun %100'ü senin"
- `/guven` H1: "Güven sözle kurulmaz. Mimariyle kurulur."
- OG: "Tek doğru kaynak · Çift satış kalkanı · Komisyon yok"
- Footer tagline: "Proje sahibi ve gayrimenkul danışmanlarını canlı, doğru veriyle buluşturan kapalı konut stoğu ağı."
- Kategori cümlesi: "Yeni konut projeleri için tahsisli canlı satış ağı."
- **En uyumlu (ürünle):** "Bloklar yükselir. Stok erir." (hero) + "Çift satış yapısal olarak imkânsız" (müteahhit) + "Komisyonun %100'ü senin" (emlakçı).

### Marka tonu (metin analizi)
- **Ton:** kurumsal + teknoloji-odaklı + sektör-içi + güven-ağırlıklı. Yatırımcı ve müteahhit diline (kontrol, envanter, çift satış, tahsis) ve emlakçı diline (kazanç, müşteri, paylaş) ayrı seslenir (iki-mod).
- **Sık kelimeler:** canlı, tek doğru kaynak, tahsis, çift satış, kilit, tazelik, komisyon yok, kapalı devre, güven protokolü, kontrol.
- **Kaçınılan (memory kuralları — KANITLI kodda uygulanmış):** çıplak "komisyon yok" yerine "kazancın %100'ü senin / Projedar pay almaz"; "kıtlık/sınırlı kontenjan" vaadi yok ("suni aciliyet, sahte sayaç yok" `/muteahhit`); uzun tire "—" içerikte kullanılmaz (virgül/iki nokta); fiyat için "bayat" değil "eski/güncel değil"; "kapalı" tek başına değil (spesifik/pozitif çerçeve).

## 2. Görsel kimlik / tasarım sistemi

### Sistem adı
**"Spatial Açık"** (kilit 2026-06-28). Kanonik referans dosya: `tasarimlar/v2-emlakci.html`. Tokenlar `src/app/globals.css` `@theme` (Tailwind v4, CSS-first; ayrı tailwind config yok). PostCSS: `@tailwindcss/postcss`.

**ESKİ/DRIFT UYARISI:** Marka dokümanları ("Berrak Güven", `ProjePazar-Tasarim-Ruhu.md`, Marka Panosu) daha eski token seti verir; **canlı kod (`globals.css`) farklıdır.** Aşağıdaki değerler kod-gerçeğidir.

### Renk paleti (KANITLI — `globals.css @theme`)
| Token | Hex | Rol | Doküman değeri (ESKİ) |
|---|---|---|---|
| `--color-ink` | `#10243a` | ana metin | doküman `#0F2638` |
| `--color-ink-soft` | `#46586b` | ikincil metin | `#5E6B78` |
| `--color-navy` | `#13314b` | marka navy | aynı |
| `--color-teal` | `#1e9b8a` | aksiyon/aktif | aynı |
| `--color-teal-d` | `#1a8676` | teal hover | — |
| `--color-green` | `#2fb36b` | **SİNYAL müsait** | aynı |
| `--color-amber` | `#e3a12c` | **SİNYAL opsiyon** | aynı |
| `--color-red` | `#d15a4e` | **SİNYAL satıldı** | aynı |
| `--color-paper` | `#eef1f6` | zemin | doküman `#F4F2EE` (drift) |
| `--color-card` | `#ffffff` | kart | aynı |
| `--color-gray` | `#5e6b78` | muted | aynı |
| `--color-hair` | `rgba(16,36,58,0.08)` | hairline | `#DCE3E8` |

Soft yüzeyler: `--color-soft #f5f8fa`, `--color-navy-soft #eaf0f5`, `--color-green-soft #e5f5ec`, `--color-amber-soft #fbf0da`, `--color-red-soft #f8e7e4`, `--color-teal-soft #e2f3f0`. Body = katmanlı radial+linear aurora gradient (teal+navy glow, `background-attachment:fixed`).

Tokenlanmamış hardcoded hex'ler (worth noting): btn-primary hover `#0d2438`; WhatsApp btn `#1faa5b`/`#178c4a`; durum metinleri `#1f7d4c`/`#9a6a12`/`#a23f34`; hücre gradientleri `#37c178→#2fb36b` vb.; deck teal `#2fd3bc`. `GuvenRozeti`/`Grafik` raw `slate-*` + `#9a6a12` (token değil — minor tutarsızlık).

### Sinyal sistemi (KANITLI, çoklu dosyada tutarlı)
**yeşil `#2fb36b` = müsait · amber `#e3a12c` = opsiyon · kırmızı `#d15a4e` = satıldı.** Tazelik kademeleri `.t-0/.t-7/.t-15/.t-eski` (yeşil→yeşil→amber→gri; 4-kademe: 0-24sa yeşil, 1-7g teal, 7-15g amber, 15g+ gri).

### Tipografi (KANITLI — `next/font/google`)
- **Outfit** → display/başlık/wordmark (`--font-outfit`).
- **Inter** → arayüz/metin (`--font-sans`).
- **Geist Mono** → veri/fiyat/sayaç (`--font-mono`, tabular-nums).
- **ESKİ/DRIFT:** doküman Bricolage Grotesque + Instrument Sans der; kod Outfit + Inter kullanır.
- **Uyarı:** üç font `subsets:["latin"]` (latin-ext YOK) → Türkçe glyph fallback riski.
- `.font-display` letter-spacing -0.018em; mono tnum. Buton 13.5px, input 15px, th 10.5px uppercase.

### Radius / spacing / shadow / border
- Radius: kart 20px, buton 13px, chip 11px, input 12px, nav-item 14px, hücre 9px, pill/rozet 999px.
- Shadow: `--shadow-card`/`--shadow-cardlg` + 3-kademe `--golge-1/2/3` (subtle/default/hover-lift).
- Border 1px `var(--cizgi)`; focus ring 4px teal @12%.
- Butonlar ≥44px min-height; Form h-11 (44px) — dokunma-hedefi uyumlu.

### Dark / light mode
- **Kullanıcı-değiştirilebilir dark mode YOK** (sıfır `dark:` class, `prefers-color-scheme` yok). Sabit light "Spatial Açık".
- Koyu yüzeyler yalnız izole temalar: `.komuta` (Bloomberg-style komuta merkezi), `.deck-*` (sunum), `AuthKabuk` sol panel.
- `prefers-reduced-motion` tam saygı (global kill-switch); focus-visible ring; active scale(0.96) tap.

## 3. PWA / manifest
`public/manifest.json`: name "Projedar — Canlı Konut Stoğu Dağıtım Ağı", short_name "Projedar", start_url "/", display standalone, orientation any, background_color `#eef1f5`, **theme_color `#13314b`** (viewport themeColor `#eef1f6` ile drift), lang tr. İkonlar: icon-192 (any), icon-512 (any+maskable), icon.svg. serwist SW (`src/app/sw.ts`→`public/sw.js`): navigations NetworkFirst (3s timeout), skipWaiting, clientsClaim, navigationPreload.

## 4. Brand asset yolları (public/)
- İkon/favicon: `public/icon-192.png`, `icon-512.png`, `icon.svg`, `apple-touch-icon.png`, `src/app/favicon.ico`.
- OG: `src/app/opengraph-image.tsx` (dinamik).
- Hero/marka: `public/gorseller/hero-arkaplan.jpg`, `hero-bina.jpg`, `danisman-1/2.jpg`, `proje-fallback.jpg`, `render-*.jpg`, `katplan-*.jpg`, `proje/hero-{il}.jpg`, `tema/ankara-cankaya.jpg`.
- Sunum: `public/sunum/*.jpg` (13).
- AI-üretim: `public/generated/mockup-01..10/*` + `shared/*` + `media-manifest.json`.
- Logo adayları: `public/logo-adaylari{,-2..5}.html` (working tree, git-untracked kısmı).
- **Yabancı asset (dikkat):** `public/mockups/assets/kolayimar-logo.png` — kardeş projeden (Projedar markası değil).

## 5. Tasarım laboratuvarı (mockup + tasarim)
- `mockup-01..11` (noindex "Projedar Design Lab"): 01 Architectural Data Twin, 02 Sales Control Room, 03 Living Distribution Network, 04 Cinematic Property Infra, 05 Physical Data System, 06 Senkron İki Telefon, 07 Faz Şeridi (timelapse.mp4), 08 Satış Ofisi Panosu, 09 Galeri Vitrini, 10 Davetiye Baskısı, 11 Sessiz Lüks Hero (Hallmark skill).
- `/tasarim/[yon]` (`yonler.ts`): 4 yön — luks (gold/Playfair r=4), minimal (indigo/Inter r=8), cesur (dark/lime `#C8FF3D`/Space Grotesk r=12), sicak (terracotta/Plus Jakarta r=18) + ortak 8×5 bina durum matrisi.

## 6. UI karakteri (12 madde)
1. "Canlı Proje Satış Komuta Merkezi" — Bloomberg terminali + Linear cilası. 2. Light "Spatial" zemin (aurora gradient + blueprint grid). 3. Trust-sinyal-güdümlü (yeşil/amber/kırmızı her yerde). 4. "Canlılık" motifi (nabız pulse, radar logo, canlı event feed, tarama çizgileri). 5. Radar logo = marka DNA (tek `Logo` bileşeni). 6. Mobil-önce PWA (bottom nav, ≥44px, 16px input). 7. Yuvarlak/ferah kartlar (20px radius, 3-kademe hover-lift). 8. Monospace tabular-nums (fiyat/veri). 9. Güçlü motion ama tam reduced-motion-guarded. 10. İki izole dark tema (komuta/deck), global dark yok. 11. Print-optimize (renk-tam rozet, deck→A4). 12. Self-contained CSS class'lar (`.kart .btn-* .chip .durum .taze .tbl .nav-item .hucre`, `v2-emlakci.html`'den).

## 7. Copy envanteri (§38 — verbatim seçme)

**Hero/landing:** "Bloklar yükselir. Stok erir." · "Aynı daire. Dört kanal. Dört ayrı fiyat." · "Opsiyon bir söz değil. Kilittir." · "Herkes her şeyi görmek zorunda değil" · "Tek proje aracı değil, ağ" · "Stok sende, fiyat sende, kontrol sende."

**Müteahhit value prop:** "Envanter kontrolü sende. Çift satış yapısal olarak imkânsız." · "Kim neyi görür, sen belirlersin." · "Suni aciliyet, sahte sayaç yok."

**Emlakçı value prop:** "Tamamen ücretsiz, komisyonun %100'ü senin." · "Grup mesajı değil. Canlı havuz." · "Eski fiyatla müşteri karşısında rezil olma." · "Söz değil, mimari." · "İlk bayrağı ben diktim."

**Güven:** "Güven sözle kurulmaz. Mimariyle kurulur." · 6 teminat (Sıfır çift satış / Herkes yalnız kendine açılanı görür / Doğrulanmış ağ / Komisyon yok / Kapalı davetli devre / Tek doğru kaynak) · "İlan değil, tahsis."

**CTA:** "Ücretsiz başla" · "Proje sahibiyim, görüşelim →" · "Danışmanım, ücretsiz katıl →" · "Projenizi konuşalım" · "İncele / WhatsApp Paylaş".

**Empty states:** "Sana tahsisli proje bulunmuyor…" · "Henüz tahsis yok — kimse göremez." · "Aktif opsiyonun yok…" · "Henüz lead yok…" · "Stok eklendikçe içgörüler burada belirir."

**Notification/bildirim:** "Yeni müşteri (lead)" · "opsiyonunuz müteahhit onayıyla kesinleşti" · tahsis/talep/onay/red bildirimleri.

**Error/uyarı:** "Bu daireyi az önce başka danışman opsiyonladı" · "Talebiniz zaten alındı" (429) · "Davet linki şu an üretilemiyor (sistem yapılandırması eksik)" · "Yetkisiz ilan yasal risk taşımaktadır."

## 8. Terminoloji sözlüğü (§39)

| TR (UI) | Kod (EN/TR) | Anlam |
|---|---|---|
| Üretici / Müteahhit | `uretici` | Proje/stok sahibi inşaat firması |
| Emlakçı / Danışman | `emlakci` | Bağımsız satış danışmanı |
| Ofis | `ofis` / `ofis_yetkili` | Emlak ofisi/franchise |
| Marka | `marka_yetkili` | Remax/C21 marka |
| Arsa sahibi | `arsa_sahibi` | Kat karşılığı arsa sahibi |
| Admin / Yönetim | `admin` | Platform işletmecisi (biz) |
| Proje | `proje` | Konut projesi |
| Blok | `blok` | Proje bloğu |
| Daire tipi | `daire_tipi` | Tip şablonu (3+1 vb.) |
| Birim / Bağımsız bölüm | `birim` | Tek satılabilir ünite (tek doğru kaynak) |
| Stok | `birim` küme | Satılabilir birim havuzu |
| Tahsis | `tahsis` | Kime/neyi/hangi şartla görünür kılma (allocation) |
| Opsiyon | `opsiyon` | Birim kilidi (hold/option) |
| Talep | `opsiyon_talep` | Opsiyon onay isteği |
| Lead / Müşteri adayı | `lead` | Müşteri talebi |
| Lansman | `lansman` | Kampanya/duyuru |
| Şerefiye | `serefiye` | Kat/manzara fiyat farkı |
| Tazelik | `son_guncelleme`/`stale` | Verinin ne kadar güncel olduğu |
| Kim getirdi | `ilk_paylasan_id` | Lead'i ilk paylaşan/kaydeden |
| Aday | `aday` | Keşif motoru prospect'i |
| Kapsam | `tahsis.kapsam` | Tahsisin blok/kat/tip/tür/birim boyutu |

**Terminoloji tutarsızlığı:** "üretici" ↔ "müteahhit" (kod `uretici`, UI ikisi de); "emlakçı" ↔ "danışman" (kod `emlakci`, UI ikisi de) — bilinçli iki dil. `opsiyon_yontem` enum'da `talep_kod` var ama UI'da yöntem "onay" olarak geçer; `proje.opsiyon_ayar.yontem` `gecici/onay/dogrudan` string'i legacy `opsiyon_yontemi` enum'la senkron tutulur (drift noktası).
