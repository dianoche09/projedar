# Projedar — Görev Takip Panosu (canlı)

> **KURAL (ZORUNLU):** Kullanıcının istediği HER şey buraya task olarak işlenir ve durumu takip edilir.
> Yapılanlar kapatılır (✅ + commit), yapılmayanlar (⏳) kullanıcı sorunca hatırlatılır. Bkz. CLAUDE.md "Görev Takibi".
> Durum kodları: ✅ tamam (canlı) · 🔵 devam ediyor · ⏳ bekliyor · 🧊 ayrı proje/planlama · ❌ iptal.

## Domain Agent Kurulumu (2026-08-14)
| # | Görev | Durum |
|---|-------|-------|
| DA1 | `projedar-real-estate-cdo` domain agent + `projedar-domain` skill + references (20) + domain gate rule + CLAUDE.md pointer + .gitignore un-ignore + ilk full audit | ✅ tamam (yerel; commit bekliyor) |
| DA2 | **Agent discovery için session restart** (`.claude/agents/` ilk kez oluştu) | ⏳ kullanıcı restart etmeli |
| DA3 | İlk audit P0/P1 aksiyonları backlog'a al | ✅ konsolide backlog çıktı |
| DA4 | **FULL PRODUCT AUDIT (4 derin panel geçişi)** → tek konsolide backlog | ✅ `references/audit/2026-08-14-KONSOLIDE-BACKLOG.md` |

### ⏳ Bekleyen — Audit P1 aksiyonları (KONSOLIDE-BACKLOG'dan)
| # | Görev | Not |
|---|-------|-----|
| AU-N1 | `/havuz`→`/danisman` bildirim linkleri (cron) 404 fix | 🔵 kod push (`59250d1`) · SQL uygulanma teyidi bekliyor (Block 1) |
| AU-E1 | Admin opsiyon bypass'ı demo-only + UI gate | ✅ canlı (kod `59250d1` + SQL uygulandı 2026-08-17) |
| AU-A1 | Gizli fiyat 3 yüzey redaksiyon (tek-kaynak) | ✅ canlı (kod `59250d1` + SQL uygulandı 2026-08-17, MODE B P1 dahil) |
| AU-B1 | Tahsis revoke → aktif opsiyon/lead kararı | ✅ karar+kod (`c8647c2`, DDR-008) · SQL uygula (`db/2026-08-17_tahsis-devir-opsiyon-lead.sql`) |
| AU-A2 | Opsiyon fiyat snapshot | ✅ karar+kod (`5604eee`, DDR-009, Option A) · SQL uygula (`db/2026-08-17b_opsiyon-fiyat-snapshot.sql`) |
| AU-N2 | Cross-agent lead çakışma (first-touch) | ✅ karar+kod (`229e286`, DDR-010, Option A) · SQL uygula (`db/2026-08-17c_lead-cakisma.sql`) |
| AU-D1 | Sahte "tutma" vaadi kopyası + geçici-opsiyon köprüsü | ✅ karar+kod (`c5e7165`, DDR-011, Option B) · migration yok · LEGAL: final metin cilası |
| AU-B2 | bulk opsiyon desync (`birimTopluGuncelle` opsiyon senkronu) | ✅ canlı (`fedec6a`, 2026-08-17) |
| AU-B3 | satis_beklemede cron koruması (çift-satış) | ✅ kod · SQL uygula (`db/2026-08-18_satis-beklemede-cron-koru.sql`) |
| AU-C1 | tek satış kapama yolu (ham satildi guard) | ✅ kod (INV-SALE-001) |
| AU-C1b | Excel import `satildi` = doğrudan satış (danışman yok/hakediş yok); tag/provenance istenirse ekle | ⏳ follow-up (bilinçli izin) |

## Panel Kalite Denetimi — kod-turu (2026-08-17)
| # | Görev | Durum |
|---|-------|-------|
| QA1 | 4 paralel kod-denetçisi (danisman/uretici/admin/ortak) → P0 yok, bulgular koda karşı teyit edildi | ✅ tamam |
| QA-#2 | Hayalet opsiyon (= AU-B2) `birimTopluGuncelle` fix | ✅ canlı (`fedec6a`) |
| QA-#3 | Yeni-proje sihirbazı künye özellik silme fix (ozellik koruması + marker) | ✅ canlı (`fedec6a`) |
| QA-#4 | Admin başvuru karar paneli rol düşürme riski (durum=onay_bekliyor gate) | ✅ canlı (`617eba1`) |
| QA-#6 | huni+seo servis anahtarı yoksa çökme → graceful | ✅ canlı (`55f92e5`) |
| QA-#5 | Admin'in üretici/danışman panelini görmesi (DEĞİŞMEZ ihlali mi, view-as mı) | ⏳ PROJECT DECISION |
| QA-P2a | komisyon-yok/komisyonsuz kilitli-kural temizliği (davet WA+mail, SEO, OG, B2B CTA, admin) | ✅ canlı (`5457289`) |
| QA-P2b | sertifika /giris→/login · ofis paket hedef filtresi · hesap-silme adminGuard | ✅ canlı (`ce6c00e`) |
| QA-P2c | middleware rol-kapısı + null-profil · yanlış-role redirect · e-Devlet link · N+1 perf | ⏳ bekliyor (auth-hassas) |
| QA-LIVE | Canlı browser QA turu (runtime/UX kırıkları) — erişim/test hesabı bekliyor | ⏳ bekliyor |
| AU-E2 | admin governance denetim event'leri (INV-AUDIT-001) | ✅ kod (7 aksiyon + hata-yolu + denetim UI) · migration yok |
| AU-E2b | denetim feed'de `yuksek_riskli` kırmızı rozet/filtre (P3) · paket eski snapshot tam (P3) | ⏳ follow-up |
| AU-E3 | gerçek KVKK erasure (silme tiyatro) | ⏳ LEGAL (bekliyor) |
| AU-T1 | Kritik invariant test altyapısı (her P1 testiyle) | P0-adjacent |

## Aktif oturum: emlakçı/danışman paneli elden geçirme (2026-08-13/14)

### ✅ Tamamlanan (canlı)
| # | Görev | Commit |
|---|-------|--------|
| T1 | Emlakçı lead yönetimi analizi + CRM sınırı revizesi (stok-bağlı genişletme kararı) | belge+memory |
| T2 | FAZ 0 lead bug/güvenlik: `niyet` veri kaybı + `lead_insert` RLS açığı + durum→event/tazelik | `be57173` |
| T3 | FAZ 4 lead derinliği: detay sayfası + not/timeline (`lead_not`) + enrichment + kayıp nedeni + takip hatırlatması + cron | `68e555d` |
| T4 | Uçtan uca DB/RLS/güvenlik testi (lead-protection + anon-insert reddi kanıtlandı) | — |
| T5 | URL `/havuz` → `/danisman` + kalıcı redirect (/uretici ile simetri) | `2eba39e` |
| T6 | 🔴 Opsiyon alma hatası: admin RPC bypass (UI-RPC gate tutarsızlığı) | `dbd70b8` |
| T7 | Demo/test projelere özellik seed (havuz filtresi test edilebilir) | `f72b568` |
| T8 | Harita fix: proje koordinat seed + popup "toplam birim" | `4e19a82` |
| T9 | Daire detay birleştirme: blok grid + tablo → tek merkezi DaireModal (kazanç dahil) | `09f6fb5` |

### Batch 2 — DaireModal & kart durumları (2026-08-20)
| # | Görev | Durum |
|---|-------|-------|
| T10 | Web yatay / cep dikey responsive | ✅ mevcut (`lg:grid-cols-2`) |
| T11 | Kapatma X kartın dış sağ-üst köşesinde | ✅ `e0ad711` |
| T12 | "X önce güncellendi" sağ-üst köşeye | ✅ `e0ad711` |
| T13 | Başka danışmanda opsiyonluysa "opsiyon düşerse haber ver" | ⏳ proper feature (subscription+cron), ayrı ele alınacak |
| T14 | Satılan/opsiyonlu dairede fiyat gizle, sadece durum | ✅ `61e7ac7` |

### Batch 3 — Kazanç & keşif (2026-08-20 kısmi)
| # | Görev | Durum |
|---|-------|-------|
| T15 | Kazanç aralığı görünür + komisyona göre sıralama | ✅ `1f52e19` (havuz "En çok kazandıran" sort; aralık zaten kart+detayda) |
| T16 | Danışman havuz-favorisi (kart yıldızı + favoriler üstte) | ✅ `987bd90` (proje_favori tablo+RLS; /p buyer-favori ayrı kaldı; sol-nav girişi minor follow-up) |

### Batch 4 — Proje detay `/danisman/proje/[id]` (2026-08-20 kısmi)
| # | Görev | Durum |
|---|-------|-------|
| T17 | "Müşteri Kataloğu" + "Daire listesi" → tek tablo; katalog yalnız müsait | ⏳ (daha büyük refactor) |
| T18 | Kat planı: her katta tüm daireler (satılan dahil) | ⏳ (floor-map, ayrı feature) |
| T19 | Firmanın diğer projeleri + bölgedeki projeler (il) | ✅ `f094edb` (RLS tahsis-scoped) |
| T20 | Görseller → lightbox | ✅ `2e1fc8b` (Galeri paylaşımlı) |
| T21 | Mahal Listesi/Teslim marka (üretici girişi) | ✅ zaten mevcut (mahal.marka kolonu + kurulum input + detay tablosu) |

### ⏳ Bekleyen — Paylaşım `/p` (Batch 5)
| # | Görev | Not |
|---|-------|-----|
| T22 | `/p` paylaşım sayfası tepesine **proje hero** + **üretici firma bilgisi** + media lightbox | |

### ⏳ Bekleyen — Opsiyon akışı yeniden tasarım (KİLİT KONU)
| # | Görev | Not |
|---|-------|-----|
| T23 | Opsiyon almadan önce **opsiyon detayları** bilgisi | |
| T24 | **Onam/rıza formu** (müteahhit-ayarlı şartlar) + **proje iletişim kontağı** (müteahhit girer) | |
| T25 | **Müşteri kaydı (buyer registration)** modeli: opsiyon kime alındı, lead projeye işlenir; çok-danışmanlı lineage müteahhide görünür | tasarım hazır (§ aşağı) |
| T26 | **Zaman penceresi**: 60 gün aktivite-yenilemeli aktif pencere + 6 aya kadar geçmiş-temas + 6 ay sonrası illiyet kopuk | procuring-cause + TR yönetmelik |
| T27 | Opsiyon müşterisi otomatik **lead** olur; etiketlenir; emlakçı ek data girebilir (CRM-lite) | T3 ile bağla |
| T28 | Opsiyon sayfasını elden geçir (mantıksızlıklar) | |
| T29 | Anti-abuse: kimliksiz kilit hak doğurmaz + kota + müşteri teyidi + register-expire tespiti | |

### ⏳ Bekleyen — Paylaşım analitiği (T31)
| # | Görev | Not |
|---|-------|-----|
| T31a | `/p` açılışında **anonim ziyaretçi id (first-party cookie)** + **geo (Vercel header → il/ilçe)** yakala → goruntuleme event payload | KVKK-safe: PII yok, anonim; Katman A |
| T31b | `paylastiklarim`: link başına açılış **sayısı + tarih dökümü + tekil ziyaretçi + il/ilçe kırılımı** | açılış sayısı zaten var |
| T31c | Müteahhit tarafı: proje bazında **her danışmanın paylaşım+açılış+tekil-ziyaretçi** toplu görünümü | RLS: müteahhit kendi projesi |
| T31d | Hacim büyürse events yerine ayrı `goruntuleme` tablosu (performans) | sonra |

### ⏳ Bekleyen — Danışman profil sayfası (T32)
| # | Görev | Not |
|---|-------|-----|
| T32a | `/danisman/profil` düzenlenebilir tam profil (şu an salt-okunur) + düzenle modu | |
| T32b | Kişi fotosu + ofis/şirket logosu yükleme | `foto_url`/`logo_url` kolonları var, Storage |
| T32c | Bio/hakkında, çalışma alanları (uzmanlık çoklu), hizmet bölgeleri, deneyim, diller, sosyal/web | `profil_detay jsonb` |
| T32d | **E-posta/telefon değiştirme + ONAY/DOĞRULAMA sistemi** (email confirm + telefon OTP/admin onay) | kullanıcı özel istedi |
| T32e | UYARI: `il/ilce/uzmanlik/marka` segment-tahsis RLS'ini besliyor → serbest düzenleme kimin hangi projeyi gördüğünü değiştirir; "hizmet bölgesi (pazarlama)" ile "tahsis-anahtarı" ayrılmalı | mimari karar |

### Sayfa yapısı (T33) + dil (T34) — durum tespiti (2026-08-20)
| # | Görev | Durum |
|---|-------|-------|
| T33 | Ortak başlık + 1240 container | 🔵 büyük ölçüde met: liste sayfaları (leadler/performans/paylastiklarim/hakedis) 1240+navy-h1 var; profil/dogrulama KASITLI dar (form); yalnız bildirimler/eslestir başlık eksik → görsel-feedback ile bitir (blind sweep intentional layout bozar) |
| T34 | Uzun-tire temizliği (prose) | 🔵 yeni yazımda uygulanıyor (bu oturum hepsi tiresiz); mevcut prose sweep = fuzzy+büyük, ayrı geçiş. NOT: `?? "—"` boş-hücre marker'ı prose değil, kalır |

### ✅ Bu push
| # | Görev | Commit |
|---|-------|--------|
| T35 | Olanaklar & Özellikler (OzellikGoster) "saçma" görünüm → 2-kolon kompakt grid + kategori sayacı | (bu push) |
| T33 (kısmi) | Liste sayfaları 1240'a genişledi (leadler/paylastiklarim/performans) + leadler başlığı ortak `SayfaBaslik`; dar form/detay sayfaları kasıtlı dar bırakıldı ("mantıklı düşün") | (bu push) |

### ✅ 2026-08-19 — P2 Audit-Fix Batch (CDO domain gate ile, "sıradan devam et")
| # | Görev | Commit |
|---|-------|--------|
| WhatsApp OG | Paylaşımda kart gelmiyordu (OG üretimi ~6s, cache yok) → font memoize + force-cache + CDN cache (HIT ~0.33s) | 75e2dd3, 251c93b |
| N11 | Satılan/çekilmiş dairede paylaşım-linki lead reddi (server-side guard, `birimLeadKabulEdilebilir`) | 366cf43 |
| N6 | KYC onayı zorunlu belge (MYS) kontrolü + gerekçeli manuel override + audit | 4e3d734 |
| N9 | Kurulum sayfasındaki bayat "migration çalıştır" dev notları kaldırıldı (prod'da uygulu doğrulandı) | 21a2fb5 |
| N12 | RESOLVED-BY-E2 (kod yok; izli audit zaten var, OQ-UR-001 açıldı) | — |
| N7 | Koltuk kotası "sahte kontrol" → dürüst amber sinyal (enforce değil; ileri-faz lever) | 60a65ee |
| N8 | MRR yalnız aktif + para birimine göre gruplu (deneme hariç) | cb27b1a |
| N10 | Opsiyon-expiry tek yetkili fonksiyon (delete-returning, idempotent) + Vercel failsafe, audit hizalı | 666675c |
| N3 | Org rolleri (ofis/marka/arsa) için dürüst /danisman durumu + rol etiketi | e1d4cc1 |
| N4 | Danışman hakediş görünümü (canlı ayna, tablo yok, ödeme-defteri bloklandı) + DEBT-009 | 37baf38, e35cf08 |
| N5 | Havuz header'ında dürüst tazelik rozeti (sahte "Canlı" pulsu yerine) | cee72dc |
| N13 | Tahsis akıbet önizlemesi (kaç birim + proaktif münhasır çakışma, owner-guard'lı RPC) | 0e8ef7d |

**Kalan (P3/LATER, bu batch dışı):** ölçek (pagination/N+1), güvenlik-sertleştirme (HMAC 64-bit token + non-constant-time, BYOK plaintext), abuse metrik self-inflate, KVKK erasure Option B (hukuk), + küçük UX (E2b yuksek_riskli rozet, D-12 rakip opsiyon ETA vs).

### ✅ 2026-08-19/20 — Test altyapısı + Güvenlik-sertleştirme
| # | Görev | Commit |
|---|-------|--------|
| T1 | Domain test katmanı (`npm test`/`verify`): N11 lead doğruluk tablosu + N1 no-dead-links guard + DB yapısal invariant'lar (çift-satış index, cron, trigger, RLS deny-all). Guard eski `/havuz`'u yakaladı → düzeltildi | bb55ba3 |
| SEC-token | Constant-time compare (timingSafeEqual) | 5e038f2 |
| SEC-revoke | kod-as-authz: paylaşım iptali artık render+lead+etkileşimde gerçek (OQ-SHARE-001) | c9f39c0 |
| SEC-emit | Uzun-link emisyonu fail-closed (iptal-edilemez link basılmaz) | 9532bda |
| SEC-byok | BYOK: RLS deny-all doğrulandı + no-log denetimi temiz + rotate runbook | a167339 |

| SEC-etkilesim | `/api/etkilesim` durum-gate (INV-SHARE-003) — satılan dairede favori/ödeme sinyali reddedilir | 0593733 |
| SHARE-lifecycle | Karar: degrade-not-kill (CDO REVISE). Satış `aktif`'e dokunmaz; satılan link "Satıldı + benzer" gösterir; `aktif=false` yalnız revoke. OQ-SHARE-001 KAPANDI | (karar) |

**Güvenlik kalan (opsiyonel/ertelendi):** BYOK Vault at-rest şifreleme (owner kararı, DB-dump tehdidi önceliklenirse); behavioral concurrency test harness (çift-satış runtime yarışı T-OPT-001/002); premature (mevcut hacim 10 kullanıcı): pagination/N+1.

### ⏳ Düzeltme/açıklama (kullanıcı geri bildirimi)
| # | Görev | Not |
|---|-------|-----|
| T16↺ | **Favori YANLIŞ yerde:** `/p` paylaşım katalogunda (müşteri favorisi) DEĞİL; emlakçı **havuzdaki projeleri** favori yapsın (proje kartı + sol menü). Doğru yere kur. | düzeltme |
| T22↺ | `/p` sayfasında istenen değişiklikler (proje hero + üretici firma bilgisi + media lightbox) HENÜZ yapılmadı, bekliyor | kullanıcı "değişiklik göremedim" dedi |
| T33 (kalan) | Diğer sayfaların başlıklarını da `SayfaBaslik`'e taşı (bildirimler/opsiyonlarim/dogrulama/lansman) | |

### 🧊 Ayrı proje (kendi planlaması)
| # | Görev | Not |
|---|-------|-----|
| T30 | KolayIMAR parsel/imar/bölge analiz entegrasyonu (emlakjet benzeri parsel zekâsı) | veri kaynağı+KVKK+maliyet planı gerekir |
