# PROJEDAR — KONSOLİDE ÜRÜN AUDIT BACKLOG (2026-08-14)

> 4 derin CDO geçişinin (uretici · danisman · admin · cross-panel) **dedupe edilmiş** birleşik önceliklendirmesi.
> Kaynak raporlar: `2026-08-14-panel-{uretici,danisman,admin}.md` + `2026-08-14-cross-panel.md` + ilk audit.
> Her madde kod-kanıtlı (`file:line`). **Audit ≠ feature emri;** öncelik + en küçük domain-doğru çözüm.
> Gerçek P0 (cross-tenant sızıntı / geri-alınamaz bozulma) YOK — çekirdek dağıtım (çift-satış kalkanı, RLS, opsiyon senkron) sağlam. Sorunlar **lifecycle geçişleri, ticari-bütünlük ve kırık/yanıltıcı UX**'te.

## Genel değerlendirme
Ürün **okuma-modeli olarak tek sistem** (tahsis=tek görünürlük anahtarı, tek `birim` referansı, paylaşılan auth). **Yazma-sonucu olarak üç uygulama** kenarlardan dikilmiş: üretici-tarafı yazımlar danışman-tarafı ticari nesnelere tam cascade etmiyor, bildirim→navigation köprüsü kırık. Deneyimli bir operatör "hayır" dediği yerler = **istisna/lifecycle/tutarlılık**, çekirdek mekanik değil.

---

## 🔴 NOW — P1 (domain-complete sayılmadan çözülmeli)

### TEMA A — Fiyat görünürlük & snapshot
- **A1 · Gizli fiyat 3 yüzeyden sızıyor** (P1). Müteahhit `fiyat_gorunur=false` ile fiyatı danışmandan gizlemiş; ama **mikrosite** (`p/[...slug]/page.tsx:138-153`), **katalog PDF** (`danisman/katalog/page.tsx:74-101`) ve **eşleştir** (`danisman/eslestir/page.tsx:13-21`, bütçe filtresi ham fiyatla) redaksiyonu atlıyor → müşteri canlı gerçek fiyatı görüyor. Takım bunu `db/2026-08-10_emlakci-birim-fiyat.sql`'de "HIGH leak fix" ilan etmiş ama 3 yüzeyi atlamış. **Fix:** `emlakci_birim_fiyat` redaksiyonunu paylaşımlı helper'a çıkar, 3 yüzeye de uygula.
- **A2 · Opsiyon fiyat snapshot taşımıyor** (P1). Opsiyon = TR'de fiyat+birim kilidi; `opsiyon` satırı fiyat tutmuyor, mikrosite canlı basıyor → orta-opsiyon fiyat değişimi müşteriye gösterileni sessizce değiştiriyor. Aktif opsiyonlu/satılmış birimde fiyat serbest düzenlenebiliyor (`uretici/actions.ts:461-494,825-846` durum guard yok). **Fix (kademeli):** (a) opsiyonlu/satildi birimde fiyat düzenleme uyarı+onay; (b) opsiyon kilidinde `liste_fiyati_snapshot` (+bağlayıcılık `opsiyon_ayar.fiyat_kilidi` config). *(U-05 = XP-02 = RISK-PRICE-001)*

### TEMA B — Tahsis ↔ opsiyon/lead lifecycle tutarlılığı
- **B1 · Tahsis revoke/suspend aktif opsiyon/lead'i orphan bırakıyor** (P1, KARAR gerekli). `tahsis_toplu` yalnız `tahsis.durum` çeviriyor (`db/2026-08-12:169-197`); danışman görünürlüğü anında gidiyor ama opsiyon `opsiyonlu` kilitli kalıyor, birim yeniden dağıtılamıyor, lead'ler de-alloc danışmanda. **Fix:** aynı transaction'da etkilenen aktif opsiyonu ya serbest bırak+audit+bildir ya da "orphan opsiyon" exception kuyruğuna düşür. **PROJECT DECISION** (serbest mi, grandfather mı — Projedar hakem değil, kaydeder). *(U-03 = XP-01 = RISK-TAHSIS-001)*
- **B2 · Toplu birim güncelleme opsiyon kalkanını atlıyor** (P1). Tekli `birimDurumGuncelle` opsiyonu temizliyor (`uretici/actions.ts:409-426`), `birimTopluGuncelle` temizlemiyor (`:825-846`) → hayalet opsiyon; unique index yeni meşru opsiyonu reddediyor. **Fix:** reconcile bloğunu topluya da uygula (ideali: `birim.durum` transition trigger'ı → hiçbir path atlayamaz).
- **B3 · `satis_beklemede` birim cron'la serbest kalıyor** (P1, çift-satış açığı). `satis_beklemede`'ye geçişte opsiyon `opsiyonlu` + eski `kilit_bitis` kalıyor; her iki expiry path (`isler.ts:159-182`, `db/2026-08-05:22-29`) siliyor → trigger birimi `musait`'e döndürüyor. Sözleşme imzalanırken birim tekrar opsiyonlanabilir. **Fix:** `satis_beklemede`'de opsiyonu cron'dan dondur; DB testi: hiçbir cron `satis_beklemede` birimi serbest bırakamaz. *(XP-03 · yeni RISK-STATE-001)*
- **B4 · Münhasırlık dekoratif** (P1). "Münhasır · tek-kanal" rozeti (`uretici/tahsis/page.tsx:418-424`) ama hiçbir şey zorlamıyor; paralel "Tüm ağ" tahsisi sessizce bozuyor (`db/2026-08-12:123-126` sadece veri). TR'de münhasır = sözleşme. **Fix:** `tahsisEkle/Guncelle`'de kapsam çakışması tespit → blokla veya açık override+uyarı. *(U-01)*

### TEMA C — Satış kapama & hakediş bütünlüğü
- **C1 · İki "satıldı" kapısı, farklı defter** (P1). `birimSatisKapat` hakediş defteri+satıcı attribution yazıyor (`uretici/actions.ts:501-580`); grid çipi `birimDurumGuncelle(satildi)` (`:417-421`) opsiyonu kapatıyor ama hakediş **yazmıyor** → aynı terminal durum, tutarsız attribution. **Fix:** tüm "→satıldı" geçişleri tek satış-kapama fonksiyonundan; grid'de ham `durum=satildi` yasak.

### TEMA D — Lead / rezervasyon / abuse
- **D1 · Buyer'a olmayan "tutma" vaadi** (P1, LEGAL). LeadForm "Bu daireyi sizin için tutmamızı talep edin" / "Ön Rezervasyon Talep Et" (`p/[...slug]/LeadForm.tsx:98-99,175`) ama `/api/lead` yalnız `lead` yazıyor, **hiçbir kilit yok**, birim `musait` kalıyor. Klasik dispute üreteci (opsiyon ≠ rezervasyon ≠ lead). **Fix:** kopyayı "talebiniz danışmana iletildi" yap; gerçek tutma isteniyorsa geçici-opsiyon akışına köprü. *(D-04)*
- **D2 · Lead spam / PII kirliliği** (P1). Tek koruma `telefon_norm+birim`/10dk (`api/lead:44-59`); IP/captcha/global limit yok; `/api/etkilesim` throttle **yok**. Forward edilen linkle sınırsız sahte lead + bildirim floodu + audit kirlenmesi. **Fix:** IP rate-limit + tekrar POST'ta captcha + birim/gün tavanı + etkilesim throttle.

### TEMA E — Admin governance & sınır
- **E1 · Admin canlı stoğa satıcı olarak opsiyon alabiliyor** (P1, INV-ADMIN-001 ihlali). `db/2026-08-13_opsiyon-admin-bypass.sql:14,30` opsiyon RPC'lerini `is_admin() OR ...` ile açmış; admin herhangi müteahhidin herhangi `musait` dairesine tahsisi baypas edip opsiyon alıyor, `satici_id=admin`. Canlı stoğu kilitler; satışa giderse platform işletmecisi hayalet satıcı, komisyon anlamsız. **Fix:** bypass'ı **yalnız demo projelere** kısıtla veya `kaynak='admin_concierge'` + override event ile işaretle. *(F1a · yeni INV-ADMIN-002)*
- **E2 · Denetim en kritik admin aksiyonlarına kör + izsiz admin üretimi** (P1). `events` UI'da "denetim/iz zinciri" diye sunuluyor ama hesap açma/rol değiştirme/paket fiyatı/üretici rozeti **hiç event yazmıyor** (`admin/actions.ts:402,465,564,628,283`); `kullaniciGuncelle` `rol:"admin"` kabul ediyor, izsiz → false-confidence audit + sessiz privilege escalation. **Fix:** her state-değiştiren admin mutasyonuna `kayitYaz` (before/after); `→admin` ayrı yüksek-şiddet audit + 2. onay. *(F1+F2 · yeni INV-AUDIT-001)*
- **E3 · KVKK silme tiyatro** (P1, LEGAL). Silme ekranı "İşlendi" işaretletiyor ama **gerçek hard-delete yok** (`grep deleteUser` = sadece yorum); Kullanıcılar yalnız `pasif/askida/arsivli`. Talep karşılandı sayılıyor ama veri duruyor → belgelenmiş yanlış-uyum (KVKK m.7/11). **Fix:** gerçek erasure (auth `deleteUser` + PII cascade/anonimleştir, yasal minimum sakla) gated+audited; olana dek "talep alındı — manuel" etiketle. *(F7)*

---

## 🟡 NEXT — P2

- **N1 · Bayat `/havuz/...` bildirim linkleri → 404** (P2 ama **ACİL, ~sıfır maliyet**). En yüksek-frekans 2 pg_cron bildirimi: opsiyon-hatırlatma (`db/2026-08-05:50`) + fiyat-düşüşü (`db/2026-08-10:72`) → `/havuz` (route artık `/danisman`). Emlakçı tıklıyor → 404, başucu engagement döngüsü kırık. **Fix:** iki literal'i `/danisman/...` yap + CI grep guard (`db/` ve `src/`'te `/havuz` yasak). *(XP-04 = D-08)*
- **N2 · Cross-agent müşteri-claim yok** (P2, KARAR — moat). Aynı müşteri iki danışman linkinden → iki bağımsız lead, first-touch yok (`api/lead:73-76`). Platformun ana vaadi "lead koruma" ama kapıda çakışma tespiti yok. **Fix:** yakalama anında platform-tarafı `telefon_norm` çakışma tespiti → conflict/exception kaydı (hard-block değil; Projedar kaydeder+önerir, arbitraj etmez). **PROJECT DECISION** (first-touch politikası). *(D-06 = XP-07 = RISK-LEAD-001)*
- **N3 · `ofis_yetkili` yanıltıcı tek-danışman demo görünümü** (P2). Admin canlı/aktif oluşturuyor (`admin/actions.ts:672`) ama `/danisman`'da "doğrulanmadı, demo" + çelişkili "Onaylı Danışman" etiketi, ofis roll-up yok. Çalışan ama yanlış workflow. **Fix (dürüstlük):** minimal read-only ofis roll-up landing VEYA açık "Ofis konsolu yakında" + doğrulama gate'ini düzelt. *(XP-08)*
- **N4 · Realized hakediş ekranı yok** (P2). Danışman yalnız projekte "senin payın" görüyor; kapanan satış Opsiyonlarım'dan düşüyor; `db/2026-08-09_hakedis-defteri.sql` var ama navda ekran yok → projected/earned/paid konflasyonu. **Fix:** okunur hakediş ledger ekranı. *(D-07)*
- **N5 · Havuz "Canlı" rozeti realtime değil** (P2). `HavuzListe.tsx:161-169` statik snapshot; realtime yalnız proje detayda → false confidence. **Fix:** rozeti "son güncelleme" yap veya listeyi poll/realtime'a bağla. *(D-09)*
- **N6 · KYC onayı belge varlığını kontrol etmiyor** (P2). `belgeKarar('onay')` (`admin/actions.ts:146-160`) belge yokken bile `belge_durumu='dogrulandi'` yazabiliyor → canlı-stok gate'i boş dosyaya tıkla açılabiliyor. **Fix:** onaydan önce zorunlu belge tiplerinin varlığı + `ai_sonuc.gecerli=false` hard-confirm. *(F6)*
- **N7 · Koltuk kotası gösteriliyor ama zorlanmıyor** (P2). `ofisler/page.tsx:101` "aşım" kırmızı ama atama bloklamıyor → gelir kaldıracı için sahte kontrol. **Fix:** atamada enforce veya bilgilendirme olarak etiketle. *(F9)*
- **N8 · MRR para birimi karışık + deneme sayılıyor** (P2). `admin/page.tsx:100,141` `deneme` dahil + `para_birimi` toplamıyor → USD 100 deneme TRY MRR'ı şişiriyor. **Fix:** MRR = yalnız aktif, para birimine göre grupla/etiketle. *(F5-admin)*
- **N9 · Migration-gated özellikler canlı gibi + dev notu müşteriye sızıyor** (P2). Ödeme planı/dinamik fiyat/per-birim görsel best-effort; UI'da `... migration'ı çalıştır` dev notu müşteriye görünüyor (`kurulum/page.tsx:360-370`). **Fix:** migration'ları prod'da uygula + notları kaldır + capability check. *(U-07)*
- **N10 · Dup opsiyon-expiry scheduler, audit farklı** (P2). pg_cron (15dk) + Vercel (günlük) ikisi de siliyor+event yazıyor; etiket farklı (`dogrulama_sure_doldu` vs hep `sure_doldu`) → "neden serbest kaldı" belirsiz. **Fix:** tek sahip seç (pg_cron), Vercel'i monitor'a indir; audit payload hizala. *(XP-05 · yeni RISK-CRON-001)*
- **N11 · Satılan birim paylaşım linki hâlâ lead yakalıyor** (P2). `/p` satılan birimi render ediyor + LeadForm gösteriyor (`p/page.tsx:655`), lead API `birim.durum` kontrol etmiyor; uzun-token link `paylasim_kod.aktif`'i baypas ediyor. **Fix:** satıldıysa read-only + LeadForm gizle + lead API `satildi` reddet. *(XP-06)*
- **N12 · Üretici doğrulama rozeti izsiz otomatik** (P2). `ureticiEkle` `dogrulanmis:true` (`admin/actions.ts:601`) izsiz → güven sinyali kayıt olmadan veriliyor. **Fix:** `dogrulanmis:false` başlat (açık `ureticiDogrula`) veya oluşturmada `dogrulama` event. *(F4)*
- **N13 · Tahsis oluşturmada akıbet önizlemesi yok** (P2). `tahsisEkle` kaç birim/kime açılacağını göstermiyor (`TahsisHedef.tsx:141-152`) → destructive-scope onaysız. **Fix:** kapsamdan etkilenen birim sayısı + B4 çakışma uyarısı. *(U-10)*

---

## 🟢 LATER — P2-scale / P3

- **Ölçek:** unbounded inventory load + JS aggregation (`uretici` kokpit/stok/projeler, `danisman/page.tsx:9-22`, `eslestir`), N+1 RPC (hakediş/fiyat-önerisi/opsiyonlar), admin pagination yok (Kullanıcılar 20k auth, huni full-table). → SQL rollup/view + pagination. *(U-08/09, D-13, F8-admin)*
- **Güvenlik-sertleştirme:** HMAC token 64-bit + non-constant-time compare + uzun link iptal edilemez/süresiz (`sharing.ts:22-35`); BYOK anahtarlar plaintext (`pazarlama_entegrasyon`); `pazarlama_entegrasyon` RLS'ini doğrula (authenticated SELECT reddi). *(D-14/RISK-SHARE-001, F13/RISK-SECRET-001)*
- **Abuse:** moat metrikleri self-inflatable (görüntüleme her yükleme, etkilesim throttle yok) → birim+gün dedup + kendi emlakçısını düş. *(D-10)*
- **KVKK/legal:** geçici-opsiyon müşteri PII rıza kaydı yok (LEGAL); Keşif scraped PII yasal dayanak + ilk temasta aydınlatma (LEGAL). *(D-11, F14)*
- **UX netliği:** rakip opsiyonunda ETA/notify yok (D-12); DaireModal "boşalınca haber ver"; admin "view-as" ölü dead-end (XP-09); "Onaylı Danışman" yanlış etiket (XP-10); `kiralandi` durum konflasyonu (U-11); paket hard-delete geçmiş orphan (F11); `/admin/dogrulama` ölü stub (F12); `arsa_sahibi/marka_yetkili` yanlış mental model (XP-11).

---

## ⚙️ CROSS-CUTTING — P0-adjacent

- **T1 · Kritik invariant'larda otomatik test yok** (ürünün tüm güven iddiasının altını oyuyor). Öncelik testleri: çift-satış concurrency (T-OPT-001/002), RLS görünürlük (T-RLS-001/002), `satis_beklemede` cron-koruması (B3), tahsis-revoke opsiyon çözümü (B1), fiyat redaksiyon paritesi (A1), `/havuz` grep guard (N1). Katalog: `references/25-domain-test-catalog.md`. *(ilk audit F-P0-1)*

---

## Önerilen sıra (kullanıcı onayına tabi)
1. **Hızlı kazanım:** N1 (dead links, ~dakikalar) + E1 (admin bypass demo-scope) + A1 (fiyat redaksiyon helper — tek fix 3 yüzey).
2. **Karar bekleyenler (MODE A tasarım):** B1 (tahsis-revoke), A2 (fiyat snapshot bağlayıcılık), N2 (cross-agent lead), D1 (rezervasyon vaadi).
3. **Lifecycle bütünlüğü:** B2, B3, C1.
4. **Governance:** E2, E3.
5. **Test altyapısı (T1)** paralel başlasın — her P1 fix'i testiyle gelsin.
