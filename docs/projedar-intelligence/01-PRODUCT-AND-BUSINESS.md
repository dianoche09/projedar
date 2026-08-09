# 01 — PRODUCT & BUSINESS

Etiketler: KANITLI / ÇIKARIM / MOCK / TODO / ESKİ.

---

## 1. Ürün özü

Çok-müteahhitli, üretici-kontrollü, **canlı konut stoğu dağıtım ağı**. Kategori cümlesi (kalıcı): "Yeni konut projeleri için tahsisli canlı satış ağı." Emlak yazılımı değil; sektörün güven protokolü.

- **Çekirdek değer:** "Bu daire hâlâ satılık mı, fiyatı ne?" → her an %100 doğru cevap.
- **Ne DEĞİL:** tekil CRM · açık pazaryeri · ilan portalı · 3D stüdyo · broker. Saf satış altyapısı, komisyona dokunmaz, sözleşmeye taraf olmaz.
- **Moat:** kombinasyon = çok-müteahhit ağ + granüler tahsis + DB çift-satış kalkanı + komisyonsuz + veri yerçekimi (events) + WhatsApp/concierge + Türkiye'ye özel.

## 2. İş modeli (fazlı; KANITLI kod + doküman)

**İlke:** komisyona dokunmadan yazılım/erişim/veriden gelir. **KOMİSYON YOK = DEĞİŞMEZ.**

**ERKEN AŞAMA (MVP / şu an):**
- **Ana gelir = MÜTEAHHİT ANLAŞMASI** — birebir B2B deal, Admin panelinde manuel yönetilir (sabit SaaS paketi şart değil). (KANITLI — `/admin/ureticiler` "abonelik ata (ana gelir)".)
- **Emlakçı = BEDAVA (basic)** — benimseme kaldıracı. "Kazancın %100'ü senin."

**SONRAKİ AŞAMA (değer kanıtlanınca):**
- Emlakçı premium (Paylaşım Stüdyosu / içerik / katalog-rapor export).
- Ofis / franchise abonelik (SaaS) — bütçe sahibi + ekip + havuz.
- İşlem ücreti — satış başı küçük opsiyonel pay (yalnız iz zinciri olgunlaşınca; komisyon değil).

**Kodda mevcut altyapı:** `abonelik_paketi` (hedef ofis/uretici/emlakci, `fiyat_aylik`, `kota_proje/koltuk/ai`, `gelismis_rapor`) + `abonelik` (ofis XOR uretici, tek-aktif partial unique index) + admin CRUD (`/admin/uyelik` `PaketYonetimi`) + MRR hesabı (admin dashboard, aktif/deneme abonelik `fiyat_aylik` toplamı). "Sabit/varsayılan fiyat yok — %100 admin-kontrollü." (KANITLI.)

**Çelişen/eski fiyat metinleri:** Sentez raporunda öneri fiyat bandları (emlakçı Pro 750/ay; müteahhit yıllık 150-600K; enterprise 650K+; küçük proje 40-85K yumuşak giriş; Nogbase ~685K/yıl, Novo 2-5K TL/user-ay çapaları) — bunlar **karar/öneri**, kodda paket olarak seed edilmemiş (admin elle tanımlar). (KANITLI — `scripts/` seed'lerinde hardcoded paket YOK.)

## 3. Müteahhit (üretici) tarafı — nasıl çalışır (KANITLI)

- **Kayıt:** self-registration (`/kayit?rol=uretici`) veya admin hesap açar (`/admin/ureticiler` → `ureticiEkle`, sahip owner + `uretici` firma) veya davet/keşif ile.
- **Ücret:** müteahhit anlaşması (manuel); erken aşamada kurucu müteahhit ücretsiz olabilir (karar).
- **Proje ekleme:** `/uretici/proje/yeni` 7-adım sihirbaz veya `/kurulum`: künye/imar → blok/tip → birim üretimi (`birimGenerator` tip×kat, cap 500) veya Excel import → fiyat/ödeme planı → medya → tahsis → yayınla.
- **Stok/fiyat:** birim tek doğru kaynak; toplu güncelle/sil, durum yönetimi, bina kesiti.
- **Tahsis (yetki verme):** `/uretici/proje/[id]` veya sihirbaz adım 6 → `tahsisEkle` (mod: tüm ağ / segment / ofis / danışman; kapsam blok/kat/tip/tür/birim; komisyon/münhasır/kontenjan/fiyat görünürlüğü). Geri çekme = tahsis silme.
- **Emlakçı-bazlı farklı stok:** evet — her tahsis farklı hedef+kapsam; segment tahsisinde sonradan eşleşen danışman da görür (canlı).
- **Satış bildirimi:** emlakçı "sattım" → `satis_beklemede` → müteahhit `/uretici/opsiyonlar`'da onaylar → `satildi`.
- **Komisyon/hakediş takibi:** komisyon **oranı/sabit** tanımlanır ve gösterilir; **kazanılan-vs-ödenen defteri YOK** (Faz-2). Platform işlemden **komisyon almaz**.
- **Abonelik altyapısı:** var (yukarıda); erken aşamada müteahhit anlaşması Admin'de manuel.
- **Concierge:** Ü2 (geleneksel) müteahhit için admin stok girer.

## 4. Emlak danışmanı / ofis tarafı (KANITLI)

- **Ücretsiz hesap:** evet (basic bedava). Premium/pro ayrımı gelir modelinde var, kodda emlakçı için paket zorunlu değil.
- **Hangi projeleri görür:** yalnız kendine **tahsisli** + KYC doğrulanmışsa; doğrulanmamış yalnız `demo` proje.
- **Stok/fiyat:** `/havuz` liste + `/havuz/proje/[id]` Realtime canlı fiyat listesi.
- **Fiyat güncellemesi:** Supabase Realtime + canlı basım (kopya yok).
- **Paylaşım:** WhatsApp deep-link (proje-genel kart metni + birim imzalı mikrosite linki). Fiyat metne/OG'ye basılmaz; canlı mikrositede.
- **Müşteri linki:** `/p/[emlakci]/[birim]/[token]` (HMAC).
- **PDF/sunum:** müşteri kataloğu (`/havuz/proje/[id]/katalog`, print/PDF, ayrı motor yok).
- **Rezervasyon/opsiyon:** `DaireModal` → dogrudan/geçici/talep; 48s kilit; `/havuz/opsiyonlarim`.
- **Lead:** mikrositeden gelen lead `/havuz/leadler`'e düşer; durum ilerletme, ara/WhatsApp, Excel export.
- **Favori/listeler:** mikrositede localStorage favori (anonim müşteri tarafı); danışman tarafında paylaştıklarım + eşleştir listesi.

## 5. Projedar gelir modeli — hangileri gerçekten mevcut

| Model | Durum |
|---|---|
| Müteahhit anlaşması (manuel B2B) | KANITLI — ana gelir, admin |
| Ofis/uretici abonelik (SaaS) | KANITLI altyapı — `abonelik`/`abonelik_paketi` + admin CRUD + MRR |
| Emlakçı premium | Planlı (gelir modeli), kodda zorunlu değil |
| Komisyon / işlem ücreti / lead fee | YOK (bilinçli — DEĞİŞMEZ komisyonsuz); işlem ücreti yalnız Faz-2 opsiyonel |
| Boost/vitrin/ilan geliri | ALINMAYACAK (konum bozar) |

## 6. Canlı stok mantığı (§6 detay — KANITLI)

- **Stok entity = `birim`** (bağımsız bölüm). Hiyerarşi: `proje → blok → daire_tipi` (şablon) → `birim` (blok_id, tip_id, kat, daire_no). Eklenti: `birim.ana_birim_id` (otopark/depo → ana daire).
- **Durum (`birim_durum` enum):** `musait, opsiyonlu, satis_beklemede, satildi, stop, planli, kiralandi`.
- **Fiyat:** `birim.liste_fiyati` (tek yer). `kira_bedeli`, `para_birimi` (MVP TRY), `usd_endeksli` (Faz-2 alan). Şerefiye `serefiye jsonb` (taban + kat/manzara %). Ödeme planı `odeme_plani jsonb` (peşinat/taksit/ara ödeme/vade farkı).
- **Fiyat geçmişi:** VAR — trigger `birim_fiyat_log` `liste_fiyati` değişince `events tip='fiyat'` (eski/yeni/pct); mikrosite `FiyatTrend` sparkline.
- **Alanlar:** net/brüt m², yön, manzara, oda tipi (daire_tipi), kat, tapu_durumu, teslim (proje seviyesi), kampanya (lansman), ödeme planı.
- **Güncelleme:** manuel (panel) + Excel/CSV import (`xlsx`, esnek TR/EN başlık, dry-run önizleme, mükerrer skip). API/webhook/entegrasyon YOK (MVP; Faz-2 WhatsApp).
- **"Canlı" ne kadar gerçek-zamanlı:** Supabase Realtime `birim` publication → emlakçı proje detayında saniyeler içinde. Cron saat/gün granülü (tazelik, açılış, opsiyon süresi). "Gerçek-zaman nice-to-have; gayrimenkul temposu saat/gün, DB kilidi + cron yeterli."

## 7. Tahsis ve yetki mekanizması (§7 — çekirdek, KANITLI)

**Nasıl açılır:** üretici `tahsisEkle` ile. Boyutlar:
- **hedef_tip:** `herkes` (tüm ağ; `hedef_filtre` ile segment: marka/il/ilçe/uzmanlık) · `ofis` (hedef_id=ofis) · `danisman` (hedef_id=profiles.id).
- **kapsam jsonb:** `bloklar[], katlar[], tipler[], turler[], birimler[]` (boş boyut = sınırsız; `birimler` = daire-seviyesi tahsis).
- **şartlar:** `komisyon_tip (yuzde/sabit/yok)` + `komisyon_deger`, `munhasir`, `kontenjan`, `fiyat_gorunur`, `bitis`.
- **Süreli:** `baslangic` + `bitis` (null = süresiz).

**Görünürlük zinciri (adım adım):**
```
Üretici → tahsisEkle → tahsis satırı
   ↓ (emlakçı tahsis satırını OKUMAZ)
RLS: proje/blok/daire_tipi/birim/mahal/proje_belge/lansman SELECT
   → SECURITY DEFINER emlakci_proje_tahsisli / emlakci_birim_gorebilir(6-arg)
   → demo VEYA (KYC dogrulandi AND eşleşen aktif tahsis AND kapsam boyutları)
Emlakçı → /havuz (yalnız tahsisli) → /havuz/proje/[id] → generateShareToken
   ↓ PaylasWhatsApp (deep-link, imzalı mikrosite linki)
Müşteri → /p/{emlakci}/{birim}/{token} → LeadForm → /api/lead
   ↓
Emlakçı → /havuz/leadler   +   Üretici → /uretici/lead-sorgu (yalnız sorgu)
```

**Diyagram:** Müteahhit → Proje → Stok(birim) → Tahsis → (Ofis/Segment/)Danışman → Müşteri(mikrosite) → Lead/Opsiyon → Satış onayı.

Kod bu yapıyı **tam destekliyor** (KANITLI). Not: emlakçı-bazlı komisyon görünürlüğü RLS ile izole (kendi kazancını görür).

## 8. Müşteri çakışması ve güven mekanizması (§8 — KANITLI)

- **Müşteri kaydı:** lead olarak; `telefon_norm` (normalize) + `birim_id`.
- **Duplicate/throttle:** aynı `telefon_norm + birim_id` son 10 dk → 429 (mükerrer koruma). Bu **çakışma çözümü değil**; lead her zaman link sahibi emlakçıya atanır.
- **TC kimlik:** lead'de yok; KYC'de TCKN (profil_detay, maskeli `maskeTckn`).
- **Aynı müşteri farklı emlakçı / sahiplik:** platform **sahiplik garanti etmez**. Model: "kim-getirdi GÖRÜNÜRLÜĞÜ" — danışman lead kaydeder; müteahhit `/uretici/lead-sorgu`'da ad/telefon birebir sorgulayınca "ilk kaydeden danışman"ı görür. Toplu listeleme yok; müteahhit lead feed'i görmez.
- **Koruma süresi (protection period):** açık bir süre-tabanlı lock YOK; "ilk bayrağı ben diktim" = `ilk_paylasan_id` kaydı (ilk paylaşan/kaydeden). Uyuşmazlık çözümü taraflar arası (platform arbitraj yapmaz).
- **Audit:** `events` (lead/paylaşım/görüntüleme) + `lead.created_at` + `ilk_paylasan_id`. Zaman-damgalı ihraç sertifikası YOK (Faz-2).

## 9. Regülasyon ve hukuki konumlanma (§27 — KANITLI landing/copy)

- **EİDS:** 1 Şubat 2026'dan beri satılık ilanlarda zorunlu; sosyal medyada yalnız EİDS linki (ceza 286.206 TL/paylaşım). Projedar konumu: **"İlan değil, tahsis"** — kapalı devre, açık ilan yok, birebir/WhatsApp paylaşım; kat irtifakı olmayan off-plan muaf. Landing'de EİDS şeritleri (`/muteahhit`, `/emlakci`, `/guven`). Bu bir **pazarlama+konumlanma iddiası**; teknik olarak kapalı-devre (panel/mikrosite noindex, robots disallow) ile desteklenir. Gri alan: `public_slug` mikrosite/`/proje` sayfalarının "ilan mahiyeti" sınırı (hukuk kontrolü gerektiği dokümanda not).
- **KVKK:** açık rıza (lead formunda ayrı boş checkbox, `kvkk: z.literal(true)`, İlke Kararı 2026/347 referansı), aydınlatma ≠ rıza ayrımı, veri minimizasyonu (anonim sinyaller, IP/PII yok), veri sorumlusu=danışman / veri işleyen=Projedar çerçevesi. `hesap_silme_talebi` (KVKK md.7/11). Çizgi: "piyasa/üretici zekâsı evet, müşteri profili hayır."
- **Taşınmaz Ticareti / yetki belgesi:** KYC (mesleki yeterlilik + taşınmaz ticareti yetki belgesi + vergi levhası). Dijital aracılık sözleşmesi şablonu (Taşınmaz Tic. Yön. m.20) YOK (Faz-2 backlog).
- **Hukuki sayfalar:** `/gizlilik`, `/kullanim-kosullari`, `/kvkk-aydinlatma` — **TASLAK**, noindex, avukat incelemesi gerekli. (KANITLI dosya-başı uyarı.)
- **"Kapalı sistem / özel ağ / tahsis / ilan değil" iddiaları:** landing pazarlama dili + teknik gerçek karışımı — kapalı-devre teknik olarak var (robots/noindex/RLS); "ilan değil" hukuki nitelemesi iddia (avukat onayı bekliyor).

## 10. Güven ve doğrulama (§28 — KANITLI)

- **Üretici doğrulama:** `uretici.dogrulanmis` (admin `ureticiDogrula`) → "Doğrulanmış Üretici" rozeti; vergi_no.
- **Proje doğrulama:** `proje.belge_dogrulandi` + `proje_belge` (ruhsat/iskan/yapı denetim).
- **Emlakçı KYC:** `kullanici_belge` (mesleki_yeterlilik/vergi_levhasi) → `kyc-belge` private bucket → admin `/admin/basvurular` (imzalı URL 1sa) → `belge_durumu=dogrulandi/red`. `ai_sonuc` AI ön-tarama (veri başka yerden gelir; admin okur). e-Devlet manuel doğrulama linki.
- **E-posta doğrulama:** Supabase (`email_confirm`), auth callback PKCE.
- **Telefon doğrulama:** OTP YOK; telefon normalize var (lead eşleştirme).
- **Vergi no / MERSİS / TCKN / MYS / TTBS:** `profiles.profil_detay jsonb` (rol bazlı: üretici YAMBİS/MERSİS/ticaret sicil, ofis TTBS/MYS, emlakçı TCKN/MYS). Belge no beyanı + belge upload; otomatik resmi API doğrulama YOK (manuel/AI ön-tarama).
- **Admin approval:** kayıt onayı (`profiles.durum`) + üretici rozeti + KYC — üç ayrı akış.
- **Güven skoru:** DB RPC (çift taraflı itibar).

## 11. Rakip haritası (özet — doküman; landing "isim vermeden" kıyas)

- **TR:** Novo CRM (tek müteahhit CRM, komisyonlu), Topli (çok-müteahhit, komisyonlu, kontrol yok), Konutmatik (tek müteahhit, kotalı tahsis), Tapuva (İstanbul, model benzeri, erken), EDAP (Ankara, belge-doğrulama, kademeli üyelik — pilot saha çakışması), RE-OS, Connject (KKTC, komisyonsuz köprü, statik).
- **Global:** DomusHub (en olgun off-plan Sales OS, tek geliştirici), Alnair (Dubai), Nogbase (UAE, komisyonsuz — modelin uluslararası doğrulaması), Kords/Nexprop/Relata/Flatter/UnitAtlas.
- **White-space:** dört mekanizmanın hepsini birleştiren yok — çok-müteahhit + daire-seviye tahsis (RLS) + DB ödemesiz çift-satış kalkanı + komisyonsuz.
- **Konum:** "geliştirici Sales OS değil, ağın kendisi + güven protokolü." "TR'de/dünyada ilk DEME" (Tapuva/EDAP/Topli erken de olsa var; kategori 2-5 yaş).

## 12. Hedef kitle pain→çözüm (özet)

**Müteahhit:** dağınık/eski stok → tek canlı kayıt; kontrol kaybı korkusu → granüler tahsis; çift satış → DB kilidi; kim sattı belirsiz → iz zinciri; emlakçı terörü (20 fiyat) → syndication; küçük müteahhit panel öğrenmez → concierge/WhatsApp.

**Emlakçı:** 5-10 dağınık kaynak → tek ekran; eski bilgiyle rezil olma → tazelik damgası; jenerik paylaşım → imzalı mikrosite; müşteri kapılma korkusu → ilk-paylaşan + lead protection; saha → PWA; teknolojiden uzak → basit mod (3 dokunuş).
