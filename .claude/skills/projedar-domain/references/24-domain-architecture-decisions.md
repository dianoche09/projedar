# 24 — Domain Architecture Decisions (ADR, living)

> Status: CURRENT · Last verified: 2026-08-14
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

## Bekleyen kararlar → `references/23-open-questions-validation.md`
