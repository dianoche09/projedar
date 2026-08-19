# 24 — Domain Architecture Decisions (ADR, living)

> Status: CURRENT · Last verified: 2026-08-20
> DEĞİŞMEZLER (CLAUDE.md) = kabul edilmiş ADR'ler olarak kaydedildi. Yeni karar buraya; çelişen eski kararı supersede et.

## DDR-001 — RLS-önce görünürlük, tahsis üzerinden
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Görünürlük tamamen Postgres RLS + `tahsis` + SECURITY DEFINER fonksiyonlarında. Client'tan service-role yok (yalnız server/cron). Neden: kapalı-devre B2B, çok-tenant izolasyon. Enforcement: `emlakci_birim_gorebilir`/`emlakci_proje_tahsisli`.

## DDR-002 — Tek referans kaynak (birim)
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Fiyat/durum yalnız `birim`; paylaşım canlı basar, kopyalamaz. Neden: stale/çelişki önleme. Tradeoff: aktif opsiyon fiyat snapshot taşımıyor (RISK-PRICE-001 → gelecekte snapshot kararı gerekebilir, DDR-002'yi ezmeden).

## DDR-003 — Çift-satış kalkanı DB'de
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: Aktif opsiyon çakışması `opsiyon_tek_aktif` partial unique index + FOR UPDATE. Uygulama katmanına güvenilmez. Enforcement: `db/2026-08-05_opsiyon-yasam-dongusu.sql`.

## DDR-004 — WhatsApp MVP = yalnız giden deep-link
Date: (kuruluş) · Status: Accepted · Class: Product decision
Karar: Serbest-metin AI parse ile stoğa yazma YOK (Faz-2). Fiyat panel/concierge ile güncellenir.

## DDR-005 — Komisyondan pay alınmaz
Date: 2026-06-18 · Status: Accepted · Class: Product decision
Karar: Müteahhidin danışmana tanımladığı satış komisyonundan Projedar pay almaz. DB'de `komisyon_tip/deger` var (danışmanın kazancı). İşlem ücreti karara bağlı değil → truth'a girmez. Kaynak: V2 Bölüm C.

## DDR-006 — admin = platform işletmecisi, üretici değil
Date: (kuruluş) · Status: Accepted · Class: Platform invariant
Karar: admin panelinde stok/birim/fiyat CRUD yok; admin gelir/hesap/doğrulama/denetim/büyüme yapar. Roller ayrı panel görür.

## DDR-007 — Emlakçı paneli route = /danisman
Date: (drift düzeltmesi, 2026-08-14 doğrulandı) · Status: Accepted · Class: Product decision
Karar: Emlakçı paneli `/danisman` (kod). Dokümanlarda geçen `/havuz` ESKİ. `HAVUZ_ROL` sabiti kod-içi ad olarak kalmış olabilir ama route `/danisman`. Not: doc 02/04 güncellenmeli (drift).

## DDR-008 — Tahsis de-allocation → aktif opsiyon/lead cascade (B1)
Date: 2026-08-17 · Status: Accepted (kullanıcı kararı) · Class: Commercial rule + Platform invariant
Karar (OQ-TAHSIS-001 çözümü):
- **Askıya alma (askida, geçici):** aktif opsiyon **grandfather** (doğal süresine yaşar; yeni işlem zaten görünürlük gittiği için bloke). Lead danışmanda **kalır** + işaretlenir + müteahhit bilgilendirilir.
- **Kaldırma (kaldirildi, kalıcı):** müteahhit **açık karar verir** (aktif opsiyonu serbest bırak / süresine bırak); seçmezse **varsayılan = grandfather** (yıkıcı değil). Lead aynı (kalır + işaret + bildirim). Projedar hakem DEĞİL (Sistem-Kuralları "arbitraj yapmaz").
- **Zorunlu companion (P1):** (1) aktif opsiyon sahibi danışman, tahsisi olmasa da o **birimi görebilir** (görünürlük çatlağı fix); (2) de-alloc danışman opsiyonu **uzatamaz** (`opsiyon_uzat`'a tahsis/guard). DEĞİŞMEZ #3 (tek aktif opsiyon) korunur → grandfather birim ayağın altından satılamaz.
Neden: askıya alma idari duraklama; canlı müşteriyi öldürmek orantısız. Kaldırma ilişkiyi bitirir ama canlı opsiyon çoğu zaman süren-satış → feda kararı müteahhidin. Detay brif: MODE A (2026-08-17). Supersedes INV-CANDIDATE-003 gap.

## DDR-009 — Opsiyon fiyat snapshot: NON-BINDING + sapma rozeti (A2)
Date: 2026-08-17 · Status: Accepted (kullanıcı) · Class: Product decision + Platform invariant + Commercial rule
Karar (RISK-PRICE-001 çözümü, OQ-PRICE-001):
- Opsiyon anındaki `liste_fiyati`+`para_birimi` opsiyona yazılır (3 RPC'de atomik). **İşlem-anı OLGU, bağlayıcı değil** — Projedar taahhüt icra etmez (bağlayıcı kilit TR'de satış-vaadi sözleşmesidir, opsiyon değil → hukuki risk alınmadı).
- DEĞİŞMEZ #2 korunur: `birim` tek CANLI kaynak; snapshot ayrı olgu, hiçbir yüzey snapshot'ı "fiyat" olarak servis etmez.
- Sapma rozeti YALNIZ danışman (`opsiyonlarim`): "opsiyon anı: X · güncel: Y (↑kırmızı/↓yeşil)". Müşteri `/p`'de yalnız canlı fiyat.
- Edit-guard: satılmış birimde liste fiyatı DB trigger'ıyla korunur (admin hariç); opsiyonlu birimde fiyat değişince opsiyon sahibine DB trigger bildirim.
- İleri-uyumlu: aynı kolon üstüne Option B (bağlayıcı kilit + config + min(snapshot,canlı) + hukuk onayı) sonradan eklenebilir. Kod `db/2026-08-17b_opsiyon-fiyat-snapshot.sql` · rozet `opsiyonlarim/page.tsx`.

## DDR-010 — Cross-agent lead çakışma: kaydet+işaretle (N2)
Date: 2026-08-17 · Status: Accepted (kullanıcı) · Class: Product decision + Platform invariant (audit) + Configurable policy (ileride)
Karar (RISK-LEAD-001/OQ-LEAD-001 çözümü, Option A):
- Aynı telefon + aynı PROJE + FARKLI danışman → yeni lead normal oluşur (`atanan=ilk_paylasan=gönderen`, DEĞİŞMEZ), yalnız `olasi_cakisma`+`ilk_temas_lead_id`+`ilk_temas_at` işaretlenir. **Blok yok, auto-reassign yok, merge yok → "arbitraj yapmaz" korunur.** Projedar tespit+kayıt+yüzeye çıkarır, kimin haklı olduğuna KARAR VERMEZ (müteahhit off-system).
- Scope = müşteri × proje (TR sektör normu). Kimlik T1: telefon exact = **OLASI** eşleşme (aile tek telefon → "aynı müşteri" değil).
- Görünürlük: müteahhide push (PII YOK, "lead-sorgu'dan incele") + ikinci danışmana bayrak (karşı PII maskeli — `ilk_temas_lead_id` RLS'le çözülemez, UI'a bile çekilmez).
- P2 fix: 10dk throttle artık danışman-farkında (`ilk_paylasan_id` scope) → meşru ikinci danışman lead'i yutulmuyor.
- Anti-abuse: bayrak non-authoritative → squatting getirisi yok (müteahhit dismiss eder); unique index EKLENMEDİ. Şema B (koruma penceresi) / C (çakışma kuyruğu) için ileri-uyumlu.
- Kabul edilen minor: TOCTOU race (eşzamanlı iki gönderim bayrağı kaçırabilir; advisory olduğu için soft). Kod `db/2026-08-17c_lead-cakisma.sql` · `api/lead/route.ts` · `danisman/leadler/page.tsx`.

## DDR-011 — Rezervasyon vaadi: dürüst kopya + danışman-opsiyon köprüsü (D1)
Date: 2026-08-17 · Status: Accepted (kullanıcı) · Class: Legal/consumer + Product decision · LEGAL: final metin hukuk cilası isteyebilir
Karar (audit F-D1, Option B):
- `/p` LeadForm "sizin için tutmamızı talep edin / Ön Rezervasyon Talep Et" **kaldırıldı** (yanıltıcı vaat — birim `musait` kalıyordu, hiçbir kilit yoktu → TR tüketici mevzuatı riski). Dürüst kopya: "almak istiyorum / danışmana ilet". `on_rezervasyon` niyet DB değeri KORUNDU (yalnız müşteri+danışman görünür etiket değişti → "Almak istiyor").
- **Köprü (Option B):** yüksek-niyet lead detayında tek-tık "Geçici opsiyon al · müşteri ön-dolu" → gerçek `opsiyonAlGecici` (danışman-başlatır, tahsis+kota+müteahhit doğrulaması gate'leri aynen; `dogrulandi=false`). **Müşteri asla kendi kilitlemez** (Option C reddedildi — DEĞİŞMEZ #3 + kontrollü dağıtım + anti-abuse). Buton yalnız birim `musait`+`satilabilir` iken; değilse "artık müsait değil" notu.
- Conflation guard: lead durumunu 'opsiyon' etiketlemek kilit yaratmaz; yalnız RPC yaratır. Kod: `LeadForm.tsx` · `leadler/[id]/page.tsx` + `TutTalebiOpsiyon.tsx`. Migration YOK (pür app).
- **Yöntem davranışı (MODE B P2 → bilinçli karar):** köprü daima `opsiyon_al_gecici` çağırır (müşteri ekli + müteahhit doğrulama checkpoint'i = lead→hold için tutarlı semantik). **onay** yöntemli projede buton YERİNE "daire detayından talep oluştur" notu (dead-end önlendi). **dogrudan** yöntemli projede köprü geçici-checkpoint verir (2sa doğrulama; days-lock yerine bilinçli olarak müteahhide görünürlük/onay noktası). Açık backlog: LEGAL "öncelikli/hızla" copy cilası; ileride köprünün proje yöntemini birebir aynalaması istenirse per-method routing.

## DDR-012 — Münhasır tahsis çakışması: uyar + açık override (B4)
Date: 2026-08-18 · Status: Accepted (kullanıcı) · Class: Commercial rule (enforcement: server RPC + action guard, UI-only değil)
Karar (U-01/INV-EXCL-001):
- Münhasır tahsis kapsamı başka aktif tahsisle (aynı birimleri paylaşarak) çakışırsa **BLOK değil, UYAR + açık override**. Müteahhit bilinçli onaylarsa geçer, override audit'e yazılır (`tip=tahsis, eylem=munhasir_override`). Projedar münhasırlığı icra etmez ama sessiz bozulmayı önler + kaydeder.
- Çakışma = yeni kapsam ile mevcut aktif tahsis kapsamı ≥1 birim paylaşır VE taraflardan biri münhasır (`tahsis_munhasir_cakisma` RPC, `birim_kapsaminda` kesişimi; boş kapsam=tüm proje). Düzenlemede `p_haric_id` ile kendini hariç tutar. Owner-guard'lı.
- Katman: server enforcement (`tahsisEkle`+`tahsisGuncelle`) = teeth; client confirm (create + edit form) = smooth override UX (imperative hidden `munhasir_override`, re-entry guard). RPC yoksa graceful (server yakalar). Override server-side DOĞRULANIR (RPC daima çalışır; çakışma yoksa override etiketlenmez) + audit çakışan tahsis/daire içerir (forensik). Kod: `db/2026-08-18b_munhasir-cakisma.sql`.
- **Kabul edilen limitasyon (MODE B P2c):** check-then-insert concurrency race — eşzamanlı iki çakışan münhasır tahsis ikisi de geçebilir (hard lock EKLENMEDİ; lock "block"a kayardı, karara aykırı). Münhasır SOFT commercial rule; çift-satış kalkanı DEĞİL (o `opsiyon`'da kalır). P3: RPC `baslangic`'i yok sayar → future-dated tahsis de çakışmada sayılır (bilinçli, daha doğru).

## DDR-012b — Tahsis kapsam akıbet önizlemesi (N13, read-model)
Date: 2026-08-19 · Status: Accepted (MODE B, `0e8ef7d`) · Class: Platform invariant (read model) · bkz. INV-TAHSIS-004
Karar (N13):
- Sorun: müteahhit kapsam seçerken kaç birim açılacağını göremiyordu (destructive-scope onaysız) + B4 çakışma yalnız submit'te görünüyordu. Fix = **salt-okunur canlı önizleme** RPC `tahsis_kapsam_ozet(p_proje_id, p_kapsam, p_munhasir default false) returns jsonb` (`{yetki, birim_sayi, cakisma, ornek_daire}`), security definer, `_tahsis_proje_sahibi` gate (non-owner/postgres/başka üretici → `{yetki:false}`, sayı/örnek daire SIZMAZ), `revoke public / grant authenticated`. Kod: `db/2026-08-19_tahsis-kapsam-ozet.sql`.
- **Fonksiyon envanteri:** `tahsis_kapsam_ozet` = tahsis okuma-modeli ailesine katılır (`tahsis_ozet` stok sayacı · `stok_dagitim` ters indeks · `tahsis_munhasir_cakisma` çakışma · `tahsis_aktif_opsiyonlar`/`tahsis_kapsami_lead_ozet` de-alloc önizleme). Hepsi `_tahsis_proje_sahibi` owner-guard'lı + `birim_kapsaminda` tek kaynak kesişimi kullanır (drift kalkanı).
- **Parity garantisi:** sayım denominatörü `satilabilir=true AND ana_birim_id is null AND birim_kapsaminda(...)` = danışmanın satılabilir yüzeyleriyle (eslestir `.eq('satilabilir',true)`+`ana_birim_id==null`; dalga/müsait/katalog grid aynı filtre) birebir. Çakışma = server enforce ile aynı `tahsis_munhasir_cakisma`. Server enforcement (`tahsisEkle`) DEĞİŞMEDİ; önizleme yalnız bilgilendirir (advisory).
- **Kabul edilen limitasyonlar (MODE B):** (a) P2 stale-preview async race — 300ms debounce timer her çağrıda temiz'lenir ama out-of-order RPC çözümü hâlâ superseded kapsamın sayısını gösterebilir (advisory + submit'i gate'lemez + sonraki değişimde düzelir; monotonic sequence guard önerildi, ship'te yok). (b) P2 kozmetik: `tahsis_ozet.toplam` satilabilir filtresi YOK → yaratımdan sonra kontrol merkezi toplam'ı önizleme N'inden büyük olabilir (non-satilabilir ana birim varsa); önizleme "satılabilir" sayısı daha dürüst. (c) Demo proje bypass: demo'da danışman kapsamdan bağımsız tüm birimi görür ama önizleme yalnız kapsamı sayar (demo bilinçli bypass; gerçek dağıtım değil).

## DDR-013 — KVKK erasure: dürüst etiket şimdi, gerçek erasure hukuk-gated (E3)
Date: 2026-08-19 · Status: Accepted (Option A) · Class: Legal/compliance + Product decision · Gerçek erasure LEGAL VALIDATION REQUIRED
Karar (audit F7):
- **Option A ship edildi:** `hesap_silme_talebi` "İşlendi" yeşil rozeti (imha yapıldı iddiası) → dürüst "Alındı · manuel işlenecek" (amber); buton "Alındı işaretle"; yanıltıcı "Kullanıcılar'dan sil" kopyası → "otomatik erasure yok, bu işaret İMHA DEĞİL" uyarısı. `talebiIsle`'ye E2 audit (`tip=hesap, eylem=kvkk_talep_isaret`). **Yalan-uyum (admin-imzalı false erasure beyanı) kaldırıldı** — hukuki bağımlılık yok.
- **Option B (gerçek erasure) ERTELENDİ, hukuk onayına bağlı:** `hesabiImhaEt` = auth silme + PII anonimleştirme (RESTRICT FK'ye saygılı — opsiyon/satis geçmişi olan kullanıcı SİLİNEMEZ, anonimleştirilir) + KYC bucket temizle + events payload PII scrub + audit; terminal `imha_edildi` yalnız gerçek operasyon set eder.
- **P1 şema bulgusu:** `opsiyon.satici_id`/`satis.talep_eden_id → profiles` RESTRICT → "sadece deleteUser" imkânsız; anonymize-in-place zorunlu. Buyer PII (lead/opsiyon) ayrı data-subject → user erasure'ı sessizce buyer kaydını silmez.
- Hukuk açık soruları: `references/23` OQ-KVKK-*.

## DDR-014 — Hakediş = canlı-hesap ayna (Option L), ödeme-defteri REDDEDİLDİ (N4)
Date: 2026-08-19 · Status: Accepted (owner, `37baf38`) · Class: Platform invariant + Product decision
Karar (N4 · MODE A→L): Danışman hakediş ekranı **canlı-hesaplanan salt-bilgi görünümü** olarak ship edildi; kalıcı `hakedis` tablosu **uygulanmadı**.
- **Reddedilen (payment-ledger):** `db/2026-08-09_hakedis-defteri.sql`'in `durum ('bekliyor','odendi')`+`odenen_at` alanları = Projedar'ı **ödeme/alacak defteri** yapardı → DEĞİŞMEZ "Projedar ödemeye taraf değil, tahsilat/takip tutmaz" ile ÇELİŞİR. Ayrıca `odendi` **ulaşılamaz durum** (müteahhit tarafında işaretleyecek UI yok → danışman kalıcı "ödeme bekliyor" görürdü = sahte alacak) + ihtilaf yüzeyi (müteahhit-öder vs danışman-almadı → Projedar hakemliği, kapsam dışı). Bu yüzden 3-durum (projected/earned/**paid**) → **2-durum** (Potansiyel/Hesaplanan); "paid" YOK.
- **Option L (seçildi):** saf canlı görünüm, tablo/backfill yok. Neden: geçmiş satışlar otomatik görünür (backfill sorunu yok); `/uretici` (müteahhit) ile `/danisman` (danışman) **aynı RPC** (`birim_satici_kazanci`) → cross-panel sayı tutarlı. Enforcement: INV-COMM-002. Kod: `src/app/danisman/hakedis/page.tsx`, `EmlakciNav.tsx`; `birimSatisKapat`'tan ölü hakediş upsert kaldırıldı.
- **Kabul edilen limitasyonlar (Option L tradeoff, MODE A'da belgeliydi):** (1) müteahhit override tutarı hiçbir yerde saklanmaz → yalnız liste-fiyatı tahmini gösterilir; (2) satış sonrası liste fiyatı düzenlenirse hesaplanan hakediş **kayar** (işlem-anı dondurulmaz); (3) satış sonrası tahsis çekilirse danışman kendi kapanan satışının **daire meta**'sını (proje/daire adı) kaybedebilir (tutar RPC'den gelir, meta RLS-gated). İleride "durable earned snapshot" istenirse: ödeme alanları OLMADAN reduced tablo + iki paneli de snapshot'a çevir (ayrı karar; bu ADR'yi ezmeden).
- İleri-uyumlu: payment-tracking asla eklenmez (INV-COMM-002 bağlar); yalnız earned-snapshot (accuracy) yeniden açılabilir.

## DDR-015 — Kısa kod (`paylasim_kod`) = kanonik paylaşım YETKİ kimliği; uzun link emisyonu deprecate (güvenlik-sertleştirme bloğu)
Date: 2026-08-20 · Status: Accepted (owner) · Class: Platform invariant + Product decision · MODE A→C
Karar (OQ-SHARE-001 çözümü + RISK-SHARE-001/RISK-SECRET-001 · commits `5e038f2`,`c9f39c0`,`9532bda`,`a167339`):
- **Tespit (MODE A):** deterministik `HMAC-SHA256(secret,"emlakci:birim").slice(0,16)` (64-bit) token yalnız render değil, **her yolun tek yetki kimliğiydi** — kısa kod ile gelen mikrosite bile `p/[...slug]/page.tsx:124`'te token'ı türetip `/api/lead`+`/api/etkilesim`'e veriyordu; iki API **yalnız** `verifyShareToken` ile yetkilendiriyordu. Sonuç: `paylasim_kod.aktif=false` **yalnız render'ı** iptal ediyordu; lead-capture + etkileşim (asıl hassas aksiyon) iptal EDİLEMEZ kalıyordu. Yani "kısa kod iptal edilebilir" yarı-doğruydu.
- **Threat honesty:** token guessing NON-ISSUE (64-bit online-only ≈ 18M yıl, + lead ayrıca canlı-durum gate'li `api/lead:45-62`/N11). Gerçek boşluk = **iptal edilebilirlik + leak kalıcılığı**, guessing değil. Bu yüzden P2 (zayıf lifecycle + recovery yok), P1 değil.
- **Kabul edilen tasarım:**
  1. **Constant-time compare** (`5e038f2`): `verifyShareToken` `timingSafeEqual` (uzunluk sabit 16 hex, gizli değil → önce length, sonra sabit-zaman byte). Timing oracle kapandı.
  2. **kod = uçtan-uca yetki kimliği** (`c9f39c0`, OQ-SHARE-001 GERÇEK closure): `slugCoz` artık `{emlakciId, birimId, kod|null}` döner. Mikrosite kod'u LeadForm/FavoriButton/OdemeSlider'a geçirir; client kod varken `{kod}` POST eder; `/api/lead`+`/api/etkilesim` `paylasimKoduCoz(kod)` (**`aktif=true` kontrolü içinde**) ile çözer ve **(emlakci,birim)'i KOD'DAN türetir — client id'lerine güvenmez** (`api/lead/route.ts:40-45`, `api/etkilesim/route.ts:17-24`). Kod varken deterministik token **client'a türetilmez/gönderilmez** (`p/[...slug]/page.tsx:126` `kod ? "" : generateShareToken`). Böylece `aktif=false` **render + lead + etkileşim'i TUTARLI** iptal eder.
  3. **Uzun link emisyonu deprecate + fail-closed** (`9532bda`): 3 emisyon sitesi (katalog/proje/benzer) kod yoksa **kalıcı uzun link BASMAZ** → boş bırakır (paylaşım o birim için graceful degrade), kullanılmayan `generateShareToken` import'ları temizlendi. **PRODUCT DECISION:** nadir "paylaşım geçici yok, tekrar dene" > sessizce iptal-edilemez kalıcı capability basmak.
  4. **Legacy 3-parça link:** `verifyShareToken` yalnız **render backward-compat** için korunur (zaten dağıtılmış WhatsApp linkleri ölmesin). Bu linkler **iptal edilemez** (durumsuz). **Break-glass recovery = `LEAD_SHARE_SECRET` rotasyonu** (tüm legacy linkleri topluca geçersizler; kısa kodlar DB-backed olduğu için rotasyondan sağ çıkar → kod'u primary yapmanın bir nedeni daha). Runbook: `docs/GUVENLIK-RUNBOOK.md`.
- **Neden blocklist YOK:** guessing infeasible + leaked link'i bilmeden bloke edilemez; secret rotation daha ucuz break-glass. Gold-plating reddedildi.
- **Konum tutarlılığı (NEVER CONFLATE):** public paylaşım izni ≠ private B2B stok erişimi; UI-disabled ≠ server authz — yetki server-side kod-çözümünde, client id'leri authoritative değil.
- **BYOK (a167339):** RISK-SECRET-001 → **accepted-with-runbook** (Vault ERTELENDİ). RLS deny-all doğrulandı (rls on + 0 policy → yalnız service-role okur); **no-key-logging audit TEMİZ** (hiçbir `anahtarlariOku` çıktısı console/stringify'a ulaşmıyor); **hiçbir SECURITY DEFINER anahtarları expose etmiyor** (tüm `db/*.sql` tarandı). **`force=true` burada güvenlik kontrolü DEĞİL** (`service_role` bypassrls; residual tehditler dump/backup/log RLS'ten geçmez). Anahtarlar **rotatable 3.-parti secret** → at-rest exposure blast-radius = "vendor'da yenile" (runbook), bu yüzden encryption'ın marjinal değeri düşük; solo-operatör için runbook+no-log > encryption. Regresyon: db-invariants testi RLS deny-all assert eder.
- **Açık kalan (ayrı):** OQ-PRICEVIS-001 — tahsis revoke/expire olunca dolaşımdaki `/p/{kod}` **otomatik** deaktive olmuyor (`aktif` manuel); kod-yolu artık iptal-yeteneğini VERİR ama tahsis-cascade'e bağlı DEĞİL. Ayrı PRODUCT DECISION.

## Bekleyen kararlar → `references/23-open-questions-validation.md`
