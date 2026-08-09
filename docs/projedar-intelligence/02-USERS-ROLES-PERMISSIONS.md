# 02 — USERS, ROLES & PERMISSIONS

Etiketler: KANITLI / ÇIKARIM.

---

## 1. Rol enum'u (DB gerçeği, KANITLI)

`rol` enum (`supabase-schema.sql`): `'uretici', 'emlakci', 'ofis_yetkili', 'arsa_sahibi', 'marka_yetkili', 'admin'`.

Rol → panel eşlemesi (`src/lib/roller.ts` `panelYolu`):
| Rol kodu | ROL_PANEL | ROL_ETIKET | Faz-1 gerçeği |
|---|---|---|---|
| `admin` | `/admin` | "Yönetim" | Ayrı tam panel |
| `uretici` | `/uretici` | "Üretici kokpiti" | Ayrı tam panel |
| `emlakci` | `/havuz` | "Emlakçı havuzu" | Ayrı tam panel |
| `ofis_yetkili` | `/havuz` | "Ofis konsolu" | **`/havuz`'a düşer** (ayrı konsol Faz-2) |
| `marka_yetkili` | `/havuz` | "Marka konsolu" | `/havuz` (Faz-2) |
| `arsa_sahibi` | `/havuz` | "Arsa sahibi" | `/havuz` (salt-okunur panel Faz-2) |
| bilinmeyen/null | `/` | — | — |

**KRİTİK AYRIM (KANITLI):** `admin` = platform işletmecisi (BİZ), asla üretici değildir. Üretici/ofis/emlakçı = müşteri. Admin paneli stok/birim/fiyat düzenlemez.

## 2. Rol yetki tablosu

| Rol | Kimdir | Görebildiği | Yapabildiği | Yapamadığı |
|---|---|---|---|---|
| `admin` | Platform işletmecisi (biz) | Tüm hesaplar, gelir/MRR, başvurular, KYC belge, denetim (events), aday/keşif, güven skorları | Hesap aç/düzenle/rol&durum ata, parola sıfırla, üretici/proje doğrula, abonelik ata, paket CRUD, KYC onay/red, keşif kampanya+davet, SEO yayın, KVKK silme işaretle | Kendi hesabını demote/pasifleştir; stok/birim/fiyat/bina kesiti düzenle (panelde yok) |
| `uretici` | Müteahhit firma sahibi | Kendi projeleri/blok/tip/birim/tahsis/opsiyon/lead-sorgu/lansman/events (yalnız kendi) | Proje/stok kurulum, fiyat/ödeme, medya, granüler tahsis CRUD, opsiyon onay/doğrula, dalga planla, Excel import, davet, firma profili | Başka üreticinin verisi (RLS izolasyon); komisyon alma; emlakçı lead feed'i toplu görme (yalnız sorgu) |
| `emlakci` | Bağımsız danışman | Yalnız kendine tahsisli + satılabilir + (KYC dogrulandi) birimler; kendi opsiyon/lead/paylaşım | Havuz gör/filtre, imzalı paylaş, opsiyon al (dogrudan/geçici/talep), katalog üret, lead durum ilerlet, eşleştir, KYC belge yükle | Tahsis satırını okuma; başka danışmanın kazancı/lead'i; opsiyonu doğrudan INSERT (RPC üzerinden); doğrulanmadan tahsisli detay (yalnız demo) |
| `ofis_yetkili` | Ofis/franchise yetkilisi | Faz-1: `/havuz` (emlakçı gibi) | Havuz işlemleri | Ayrı ofis konsolu (Faz-2); iç dağıtım/ekip performansı henüz yok |
| `marka_yetkili` | Remax/C21 marka | `/havuz` | — | Marka konsolu Faz-2 |
| `arsa_sahibi` | Kat karşılığı arsa sahibi | `/havuz` | — | Salt-okunur pay paneli + pay bildirimi Faz-2 |

## 3. RBAC / permission sistemi (KANITLI)

- **İki-katman + DB:** (a) route/layout guard, (b) server-action guard, (c) Postgres RLS (asıl kapı).
- **Layout guard'lar:**
  - `/admin/layout.tsx`: `getUser()` yoksa `/login`; `profiles.rol !== 'admin'` → `/`.
  - `/uretici/layout.tsx`: `rol` `uretici`|`admin` değilse `/`; admin ise amber "Admin olarak görüntülüyorsun" bandı.
  - `/havuz/layout.tsx`: izinli roller `HAVUZ_ROL = [emlakci, admin, ofis_yetkili, marka_yetkili, arsa_sahibi]`; değilse `panelYolu(rol)`; doğrulanmamış emlakçı → sarı "yalnız demo" bandı + `/havuz/dogrulama`.
- **Server-action guard'lar:** admin `adminGuard()` (her mutasyondan önce rol=admin doğrular, audit için user.id döner); üretici action'ları `projeSahibiMi()`/`geriYol()` open-redirect guard; havuz action'ları `zUuid` + `getUser()` + sahiplik RLS-select.
- **API guard'lar:** cron `cronYetkiKontrol` (Bearer CRON_SECRET, fail-closed); admin API `adminIdVeya()` (403); üretici arama `["uretici","admin"]` guard.
- **RLS (asıl):** her tabloda açık; SECURITY DEFINER fonksiyonlar (`is_admin`, `current_ofis`, `emlakci_proje_tahsisli`, `emlakci_birim_gorebilir`) recursion'ı kırar ve görünürlüğü belirler.

## 4. Organization / team / company mantığı

- **`ofis`** (emlak ofisi/franchise) → `profiles.ofis_id`. Ofis koltuk kapasitesi (`abonelik_paketi.kota_koltuk`), koltuk aşımı admin'de kırmızı rozet. Tahsis `hedef_tip='ofis'` ile ofise açılabilir; `current_ofis()` RLS'te kullanılır.
- **`uretici`** (müteahhit firma) → `sahip_id` (owner profil). Multi-tenant izolasyon `uretici_id`.
- **`marka`** (RE/MAX, C21…) → `profiles.marka` + `ofis.marka` (segment/datalist); ayrı marka konsolu Faz-2.
- **Bir kullanıcı birden fazla şirkete/projeye bağlı mı:** profil tek `ofis_id`'ye bağlı (1 ofis). Emlakçı çok projeye tahsisle bağlanır (many). Üretici sahip olduğu çok projeye. (ÇIKARIM: çoklu-ofis üyeliği modeli yok.)

## 5. Kayıt, login ve auth (§13 — KANITLI)

- **Provider:** Supabase Auth. **E-posta/parola** (birincil). Magic link/Google/Apple/SMS/OTP **yok** (mail şablonlarında magic-link/reauth şablonu var ama akış parola-merkezli).
- **Session:** `@supabase/ssr` cookie; `src/proxy.ts` (Next 16 middleware) her istekte `getUser()` ile server-side doğrular (getSession'a güvenmez), oturumu tazeler.
- **Protected routes:** `proxy.ts` `herkeseAcik()` whitelist dışı + oturumsuz → `/login`; oturumlu ama `durum!=='aktif'` → `/hesap-bekliyor`. `/api` proxy'den muaf (her route kendi auth'u).
- **Email verification:** Supabase `email_confirm`; admin `createUser` `email_confirm:true`.
- **Password reset:** `/sifremi-unuttum` (kullanıcı-enumerasyon koruması: her zaman aynı mesaj) → `/auth/callback?next=/sifre-yenile` → `/sifre-yenile` (recovery session zorunlu).
- **Invitation:** üretici davet (`davetToken` HMAC → `/kayit?rol=emlakci&d=...`), admin keşif daveti (`adayDavetToken` → `/kayit?rol=&aday=...`). Davet KYC'yi atlamaz.
- **Company invite:** üretici danışman davet eder (`/uretici/davet` `DavetPanel`).
- **Role-based redirect:** login sonrası `panelYolu(rol)`.
- **Kayıt trigger:** `handle_new_user()` (auth.users INSERT) → `profiles` satırı `durum='onay_bekliyor'`, `talep_rol` map (yalnız uretici/emlakci/ofis_yetkili kabul).
- **Auth kabuk UI:** `AuthKabuk.tsx` split layout (koyu marka paneli + form).

## 6. Onboarding akışları (§12 — KANITLI)

**Genel:**
```
/ (landing) → /kayit?rol=X → kayitOl → (emlakci) /kayit/belge → /hesap-bekliyor
                                     → (uretici/ofis) /hesap-bekliyor
admin onaylar (/admin/basvurular veya /admin/onay→basvurular) → durum=aktif → login → panelYolu(rol)
```

**Emlak danışmanı:**
signup (`/kayit?rol=emlakci`, `KayitForm` 3-adım: hesap türü → bilgiler → belgeler) → KYC belge (`/kayit/belge`: Mesleki Yeterlilik/Taşınmaz Ticareti Yetki Belgesi + barkod no opsiyonel + Vergi Levhası, PDF/image ≤8MB; "şimdilik atla" mümkün) → `/hesap-bekliyor` → admin onay + KYC doğrulama → `durum=aktif`, `belge_durumu=dogrulandi` → `/havuz`. Doğrulanmadan yalnız demo proje.

**Müteahhit:**
signup (`/kayit?rol=uretici`, rol bazlı alanlar: YAMBİS/MERSİS/ticaret sicil) → `/hesap-bekliyor` → admin onay + `uretici` firma bağla + (gerekirse) doğrula + abonelik ata → `/uretici` → proje kurulum zinciri (kendi kurar / concierge / WhatsApp).

**Kayıt form alanları (rol bazlı — `src/lib/kayitAlanlar.ts` taksonomisi):**
- Ortak: ad, telefon, e-posta, parola (min 8), rol seçimi.
- Üretici: firma adı, vergi no, YAMBİS/MERSİS/ticaret sicil no (profil_detay).
- Ofis: TTBS/MYS.
- Emlakçı: TCKN, MYS, mesleki yeterlilik seviyesi + KYC belgeler.
- Zorunlu/opsiyonel: ad/telefon/parola zorunlu; belge no'ları opsiyonel beyan; KYC belge yükleme onay için gerekli (atlanabilir ama doğrulanmadan kısıtlı).

## 7. Hesap durumu yaşam döngüsü

`hesap_durum` enum: `onay_bekliyor → aktif` (admin onay) / `pasif` (red/soft-delete) / `askida` / `arsivli`. `belge_durumu` (text): `yok → beklemede → dogrulandi | red`. Admin `hesapDurumDegistir` (kendi hesabını değiştiremez). `/hesap-bekliyor` durum-özel mesaj + WhatsApp hızlı aktivasyon CTA (`wa.me/905444790787`).

## 8. Güven/doğrulama akışları özeti

Üç ayrı akış: (a) kayıt onayı `profiles.durum`, (b) üretici güven rozeti `uretici.dogrulanmis`, (c) KYC belge `kullanici_belge.durum` + `profiles.belge_durumu`. Trigger `belge_durumu_guard` non-admin'in kendini "dogrulandi" yapmasını engeller (KYC-gate bypass kalkanı).
