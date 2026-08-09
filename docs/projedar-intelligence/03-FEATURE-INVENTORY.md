# 03 — FEATURE INVENTORY (modül modül)

Tümü KANITLI (real Supabase, RLS-aware) — aksi belirtilmedikçe. Mock/TODO ayrıca işaretli.

---

## A. ÜRETİCİ PANELİ (`/uretici`) — 17 sayfa + child bileşenler

| Modül | Rota | İşlev | Tablolar | Durum |
|---|---|---|---|---|
| Kokpit | `/uretici` | Dashboard: 6 KPI + stok dağılım barı + proje kartları + Talep Radarı rail + stok tablosu (top-20) | proje, birim, blok, daire_tipi, proje_belge(kapak) | production |
| Projeler | `/uretici/projeler` | Kapaklı kart grid (stok/tazelik/fiyat aralığı) | proje, birim, proje_belge | production |
| Proje detay | `/uretici/proje/[id]` | Günlük operasyon: `BinaKesiti` birim durum yönetimi + **TAHSİS CRUD (MOAT)** + medya | proje, blok, daire_tipi, birim, tahsis, ofis, proje_belge | production |
| Kurulum | `/uretici/proje/[id]/kurulum` | Bir kez kimlik: künye/imar/yatırım/ödeme/mahal/stok/tanıtım/belge/öznitelik/**opsiyon disiplini** | proje, proje_belge, blok, daire_tipi, mahal | production (ödeme planı migration-gated) |
| Yeni proje | `/uretici/proje/yeni` | `ProjeWizard` 7 adım: künye→blok/tip→birim üretimi→fiyat/ödeme→medya→tahsis→yayınla | (tüm kurulum action'ları) | production |
| Stok | `/uretici/stok` | Tek canlı fiyat listesi: `StokTablo` (Tablo/Bina Kesiti görünüm) + `DaireModal` (üretici) + `?durum=` filtre | proje, birim, blok, daire_tipi | production |
| Tahsis | `/uretici/tahsis` | Dağıtım genel bakış: proje-bazlı tahsis tablosu + "Kapsam Dışı" amber uyarı | proje, tahsis, ofis, blok | production (view; CRUD proje detayda) |
| Opsiyonlar | `/uretici/opsiyonlar` | Onay kuyruğu: bekleyen talepler + geçici opsiyon doğrulama + aktif kilit tablosu + aciliyet sinyalleri | birim, blok, daire_tipi, proje, opsiyon, opsiyon_talep, profiles(admin) | production |
| Talep Radarı | `/uretici/talep-radari` | Satış Zekâsı (veri moat): events dönüşüm hunisi + trend + kanal + tahsis performansı + fiyat-etki | proje, birim, events(≤20k/60g), tahsis | production (ölçek uyarısı) |
| Fiyat Önerisi | `/uretici/fiyat-onerisi` | Talep skoru → fiyat nudge (**yalnız öneri, fiyatı değiştirmez** DEĞİŞMEZ #2) | uretici→proje, birim, daire_tipi, events(30g), bolge-benchmark | production |
| Raporlar | `/uretici/raporlar` | Absorpsiyon + tip performansı + fiyat hareketleri (events tip=fiyat) | birim, daire_tipi, proje, events | production |
| Lead Sorgu | `/uretici/lead-sorgu` | Müşteri birebir sorgu (ad/telefon exact) → "ilk kaydeden danışman"; toplu liste YOK | proje, lead(admin), profiles, birim | production |
| Lansman | `/uretici/lansman` | Lansman/kampanya oluştur/sil (durum: lansman/on_talep/satista/etkinlik) | proje, lansman | production |
| Davet | `/uretici/davet` | Danışman davet (imzalı `davetToken` link + kopya/WhatsApp/mail) | (token) | production |
| Bildirimler | `/uretici/bildirimler` | Son 100 → `BildirimListe` | bildirim | production |
| Ayarlar | `/uretici/ayarlar` | Profil + kurumsal firma profili (`uretici.profil jsonb`) + KVKK export/sil | profiles, uretici | production |

**Çekirdek üretici mekanizmaları (KANITLI, `src/app/uretici/actions.ts` 1382 satır):**
- `birimGenerator` (tip×kat toplu üretim, cap 500, şerefiye kat %, `liste_fiyati=taban×(1+(kat-1)×kat_artis)`).
- `dalgaPlanla` (planlı stok açılış: `durum='planli', satisa_acilis=ISO`; cron açar → `acilis` event).
- `excelImport`/`stokDosyaCoz`/`stokImportOnizle` (xlsx, esnek başlık, dry-run 50 satır, mükerrer skip).
- `medyaYukle`/`medyaSil`/`tipGorseliYukle` (service-role, `proje-medya` bucket, IDOR sahiplik kontrolü, kapak singleton).
- `projeOpsiyonAyar` (opsiyon disiplini: yöntem + doğrulama_saat/kilit_gun/kota/onay_gun/yanit_sla/hatirlatma/uzatma/düşük-skor eşik → `proje.opsiyon_ayar jsonb`).
- `tahsisEkle` (Zod `TerimSemasi`, mod tum_ag/segment/ofis/danisman, kapsam boyutları, doğrulanmış emlakçılara bildirim cap 500).
- `talepOnayla/talepReddet/opsiyonDogrula/opsiyonReddet` (RPC'ler, en fazla-effort bildirim).

## B. EMLAKÇI HAVUZU (`/havuz`) — 12 sayfa + mikrosite

| Modül | Rota | İşlev | Durum |
|---|---|---|---|
| Havuz (Canlı Ağ) | `/havuz` | `HavuzListe`: filtre (ülke›il›ilçe + tip + durum + 8-kategori öznitelik facet) + 4 KPI + proje kartları (stok bar, 4-kademe tazelik) + Liste/Harita (Leaflet, sinyal-renkli pin) + WhatsApp paylaş | production |
| Proje detay | `/havuz/proje/[id]` | Hero/galeri/künye/kat planı/mahal + üretici kartı + `EmlakciStok` (Realtime) + `/p/` mikrosite link map + `KatalogSecici` | production |
| Opsiyonlarım | `/havuz/opsiyonlarim` | Aktif kilitler (48s geri sayım) + bekleyen talepler (geri çek) + sonuç (satıldı/vazgeç/uzat) | production |
| Paylaştıklarım | `/havuz/paylastiklarim` | events(paylasim) listesi, canlı fiyatla, Excel export | production |
| Leadler | `/havuz/leadler` | Lead kartları + durum ilerletme (optimistic) + ara/WhatsApp + Excel export (PII) | production |
| Eşleştir | `/havuz/eslestir` | Kriter fit-skor sıralaması (bütçe/oda/il/m²/kat); NLP Faz-2 | production (çekirdek) |
| Lansman | `/havuz/lansman` | Tahsisli projelerin lansman radarı (salt okunur) | production |
| Bildirimler | `/havuz/bildirimler` | Son 100 | production |
| Doğrulama | `/havuz/dogrulama` | KYC belge yükleme + durum kartı | production |
| Profil | `/havuz/profil` | Salt-okunur kimlik + bağlı ofis + KVKK | production |
| Katalog | `/havuz/proje/[id]/katalog` | Beyaz-etiket müşteri kataloğu (print/PDF, imzalı link/daire, canlı fiyat, `events tip='katalog'`) | production |

**Opsiyon akışı kalbi — `DaireModal.tsx` (emlakçı modu, KANITLI):**
- `gecici` → müşteri ad/tel/gerekçe zorunlu → `opsiyonAlGecici` (anında kilit, `dogrulandi=false`, kota).
- `dogrudan` → `opsiyonAlDogrudan` (anında kilit).
- `onay`/`talep_kod` → `opsiyonTalepGonder` (müteahhit onayına düşer).
- Çakışma görünümü: satılmış → kapalı; benim opsiyonum → bırak; başkasında → "işlem yapamazsın".
- Birim paylaşım metnine fiyat basılmaz (canlı mikrositede).

**`EmlakciStok.tsx`:** Supabase Realtime `channel("emlakci-birim-${projeId}")` postgres_changes `birim` filter proje_id → optimistic merge; "canlı" rozeti SUBSCRIBED.

**Havuz server actions (`src/app/havuz/actions.ts`):** `ilgiBildir`, `opsiyonTalepGonder`, `opsiyonAlDogrudan`, `opsiyonAlGecici`, `talepGeriCek`, `opsiyonBirakSessiz`, `opsiyonSonuc(satildi/vazgecildi)`, `opsiyonUzat`, `paylasimKaydet`, `leadDurumGuncelle`, `belgeYukle`. (TODO: `actions.ts:91-95` geçici debug ham Postgres hata metnini UI'a döndürüyor — kaldırılmalı.)

## C. MİKROSİTE (`/p/[emlakci]/[birim]/[token]`) — en olgun sayfa

Token doğrulama (`verifyShareToken`) → geçersizse `notFound()` → `createAdminClient` (RLS-bypass, tek kapı token). Canlı fiyat (DEĞİŞMEZ #2), galeri (lightbox), video (YouTube/Vimeo), proje hakkında, olanaklar (8 kategori), künye, kat planı, daire içi + yakın çevre, **etkileşimli ödeme slider** (`OdemeSlider`), **fiyat trendi** (`FiyatTrend`), benzer birimler (imzalı link), eklenti toplamı, harita (OSM), danışman kartı (tel+WhatsApp), durum-bağlı sağ kolon (`LeadForm` yalnız müsait+satılabilir). Anonim sinyaller: görüntüleme (`after()`, `events tip='goruntuleme'`), favori/ödeme (`/api/etkilesim`), hepsi PII/IP'siz. Dinamik OG (`opengraph-image.tsx`, fiyat basmaz), `robots: index:false`.

## D. ADMIN PANELİ (`/admin`) — platform işletmecisi

| Modül | Rota | İşlev | Durum |
|---|---|---|---|
| Dashboard | `/admin` | MRR + kullanıcı dağılımı + onay kuyruğu + üretici doğrulama + ofis abonelik + denetim son-5 + satış deck linkleri | production |
| Başvurular | `/admin/basvurular` | Onay + KYC birleşik workspace (`BasvuruWorkspace`, kayan detay, imzalı belge URL, AI ön-tarama rozeti, e-Devlet manuel doğrulama linki) | production |
| Kullanıcılar | `/admin/kullanicilar` + `/[id]` | Liste + yeni kullanıcı oluştur (service-role) + rol/ofis/durum/segment düzenle + parola sıfırla | production |
| Üreticiler | `/admin/ureticiler` | Firma+owner oluştur + güven rozeti doğrula + **abonelik ata (ana gelir)** | production |
| Ofisler | `/admin/ofisler` | Ofis+yetkili oluştur + koltuk kapasitesi + paket ata (aşım rozeti) | production |
| Üyelik | `/admin/uyelik` | `PaketYonetimi` CRUD (fiyat/kota/hedef; soft-disable if referenced) | production |
| Onay | `/admin/onay` | → `/admin/basvurular` redirect stub | — |
| Doğrulama | `/admin/dogrulama` | → `/admin/basvurular` redirect stub | — |
| Güven | `/admin/guven` | RPC `emlakci_skor_tablo`/`muteahhit_skor_tablo`; risk sıralı (düşük önce), <40 kırmızı | production |
| Denetim | `/admin/denetim` | events son 100, `?tip=` filtre, isim-join | production |
| Hesap-silme | `/admin/hesap-silme` | KVKK silme talepleri işaretle (gerçek silme manuel) | production (tracking) |
| Kurucu | `/admin/kurucu` | Lansman popup e-posta yakalamaları (events tip='kurucu' dedup) + CSV export | production |
| SEO | `/admin/seo` | Proje SEO sayfası yayınla (ince-içerik eşiği + slug + IndexNow + revalidate) | production |
| Pazarlama | `/admin/pazarlama` | BYOK API anahtar kasası (`pazarlama_entegrasyon` singleton, last-4 maskeli) | production |
| Keşif | `/admin/pazarlama/kesif` | `KesifPanel`: il+segment → kampanya → aday keşfi + davet | production |

## E. KEŞİF (BÜYÜME) MOTORU — `src/lib/kesif` + `/api/admin/kesif`

Admin BYOK anahtarlarıyla aday keşfi (bir web-scraping/lead-gen motoru):
1. `/admin/pazarlama/kesif` → il + segment (muteahhit/proje/ofis/emlakci) → `POST /api/admin/kesif`.
2. `kesfet()`: segment×sorgu için katmanlı kaynaklar — **SerpAPI Google Maps** (birincil), **Serper web** (fallback, muteahhit/proje'de her zaman, `tbs:qdr:y` tazelik), **Google Places Text Search v1** (çapraz).
3. Sorgu üretimi (`sorgular.ts`): Türkçe niyet + yıl (yeni/aktif projeli müteahhite süz).
4. İletişim çıkarımı (`cikar.ts`): SERP snippet'lerinden regex e-posta/telefon (LLM yok).
5. Site e-posta kazıma (`site-mail.ts`): website var e-posta yoksa `/iletisim`, `/contact` vb. doğrudan fetch (UA `ProjedarBot/1.0`, 9s, ~400KB, kurumsal e-posta tercih). **Gerçek scraping** ama nazik/sınırlı.
6. Dedup (`dedup.ts`): `normalize()` + DB `upsert onConflict:"firma_adi_norm,il" ignoreDuplicates`.
7. `aday` tablosuna yaz; `kesif_kampanya` sayaç güncelle.
8. Davet (`/api/admin/kesif/davet`): imzalı `/kayit` link (KYC atlamaz); email (Resend + opt-out) veya WhatsApp deep-link (server göndermez, admin açar). `aday_temas` log + `sonraki_takip=+3g`.
9. Takip cron (`kesifFollowupCalistir`): davet_edildi + opt_out=false + temas<3 → hatırlatma mail; `>=3` → soguk.

**KVKK/etik notu (ÇIKARIM):** iş-iletişim verisi rıza öncesi `aday`'a yazılır; opt-out reaktif; robots.txt kontrolü yok (yalnız UA). KVKK incelemesi önerilir.

## F. BİLDİRİM SİSTEMİ

`bildirim` tablosu (in-app; tip talep/onay/red/tahsis/lead/sistem). `src/lib/bildirim.ts` `bildirimYaz`/`bildirimlerYaz` (service-role, INSERT RLS yok) + best-effort mail (Resend). Okuma: `_bildirim/actions.ts` `bildirimOku`/`bildirimHepsiOku` (RLS self). UI `BildirimListe` + nav badge. Push/SMS yok.

## G. E-POSTA VE BİLDİRİMLER (§18)

- **Kanallar:** in-app bildirim + Resend e-posta (best-effort). SMS/push yok.
- **Türler:** kayıt onay, davet (üretici+keşif), yeni tahsis (emlakçıya), opsiyon talep (üreticiye), opsiyon doğrulama/sonuç, lead (emlakçıya), keşif takip.
- **Şablonlar:** `mail-sablonlari/` (davet, eposta-degisikligi, kayit-onay, magic-link, reauth, sifre-sifirlama) + `src/lib/mail.ts` markalı kabuk (`htmlKacir` XSS escape, İYS/ETK opt-out footer for marketing).

## H. ARAMA, FİLTRE, SIRALAMA (§19)

- **Havuz filtreleri (`HavuzFiltreler`):** il/ilçe (data'dan türetilir), Daire Tipi (1+1..Dubleks), Birim Türü (daire/villa/ofis/dükkan/depo/otopark), Durum (müsait/opsiyonlu), Fiyat min/max, Min kira getirisi %, 8-kategori öznitelik facet (AND). Sıralama: taze/ucuz/müsait. (Faz-1 yurtiçi: döviz/golden-visa/oturum filtreleri yok.)
- **Stok filtreleri (üretici):** proje + durum-bucket.
- **Eşleştir:** bütçe/oda/il/ilçe/m²/kat → fit-skor.
- **Backend arama:** danışman arama `/api/uretici/emlakci-ara` (server + service-role, ILIKE wildcard escape). Full-text search **yok** (pgvector/embedding Faz-2). Filtreleme çoğunlukla server-fetch + client-filter.

## I. DASHBOARD'LAR VE KPI'LAR (§20)

- **Üretici kokpit:** taze stok, satış hızı, açık lead, stok dağılımı (müsait/opsiyon/satıldı), proje kartları, talep radarı, tazelik uyarısı.
- **Emlakçı havuz:** toplam birim, müsait, opsiyon, proje sayısı (gerçek tahsisli havuzdan).
- **Emlakçı performans:** dönüşüm hunisi (paylaşım→görüntüleme→lead→opsiyon→satış), en çok dönüşen projeler.
- **Admin:** MRR, kullanıcı dağılımı, onay kuyruğu, üretici doğrulama, ofis abonelik, denetim.
- Tüm KPI'lar gerçek veriden (kod yorumları "uydurma sayı YOK"); istisna landing sayaçları (MOCK).

## J. RAPORLAMA & ANALİTİK

Üretici raporlar (absorpsiyon, tip performansı, fiyat hareketleri), talep radarı (dönüşüm hunisi, trend, kanal, tahsis performansı, fiyat-etki), fiyat önerisi (talep skoru → nudge). Emlakçı performans. Admin güven skoru tabloları + denetim. Hepsi `events` + `birim` + `opsiyon` + `lead`'den.
