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
| AU-B1 | Tahsis revoke → aktif opsiyon/lead kararı (MODE A) | PROJECT DECISION |
| AU-A2 | Opsiyon fiyat snapshot (MODE A) | PROJECT DECISION |
| AU-N2 | Cross-agent lead first-touch kararı (MODE A) | moat, PROJECT DECISION |
| AU-D1 | Sahte "tutma" vaadi kopyası + geçici-opsiyon köprüsü | LEGAL |
| AU-B2 | bulk opsiyon desync (`birimTopluGuncelle` opsiyon senkronu) | ✅ canlı (`fedec6a`, 2026-08-17) |
| AU-B3/C1 | satis_beklemede cron koruması · tek satış kapama | lifecycle (bekliyor) |

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
| AU-E2/E3 | admin audit event'leri + gerçek KVKK erasure | governance/LEGAL |
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

### ⏳ Bekleyen — DaireModal & kart durumları (Batch 2)
| # | Görev | Not |
|---|-------|-----|
| T10 | DaireModal: web yatay / cep dikey responsive + fiyat/yazı/yerleşim hizalama | |
| T11 | Kapatma **X** kartın dış sağ-üst köşesinde (dışardan görünür buton) | |
| T12 | "GÜNCELLİK · X gün önce güncellendi" **sağ-üst köşeye** taşı | |
| T13 | Başka danışmanda opsiyonluysa **"opsiyon düşerse haber ver"** butonu | bildirim altyapısı var |
| T14 | Satılan/opsiyonlu dairede **fiyat gizle**, sadece durum göster (müsait-gibi kart olmasın) | |

### ⏳ Bekleyen — Kazanç & keşif (Batch 3)
| # | Görev | Not |
|---|-------|-----|
| T15 | Komisyon kazanç aralığı proje sayfasında görünür + **fiyat/komisyona göre sıralama** | `kazancMap` kısmen hazır (tabloda `+X ₺`) |
| T16 | Favori proje + sol menüde ("Canlı Ağ" altında) alt başlık + favoriler üstte | yeni tablo `favori` |

### ⏳ Bekleyen — Proje detay `/danisman/proje/[id]` (Batch 4)
| # | Görev | Not |
|---|-------|-----|
| T17 | "Müşteri Kataloğu" + "Daire listesi" → **tek tablo**; katalog yalnız müsait dairelerde | |
| T18 | Kat planı: her katta **tüm daireler** görünür (satılan/satılmayan dahil) | |
| T19 | **Firmanın diğer projeleri** + **bölgedeki projeler** (bölge: il → ilçe → 20km, şimdilik il) | |
| T20 | Proje görselleri/video/broşür → **lightbox** (üstüne basınca ekrana çıksın) | |
| T21 | Mahal Listesi/Teslim Standardı elden geçirme: malzeme+marka; ev-geneli ortak markalar (Boya-Marshall, Doğrama-Pimapen) üretici girişinden | |

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

### 🔵 Devam — Sayfa yapısı tutarlılığı (T33) + dil (T34)
| # | Görev | Not |
|---|-------|-----|
| T33 | Tüm danışman sayfalarında ortak `SayfaBaslik` + container `max-w-[1240px]` (pool referans); içerik sağ alanı tam doldursun | |
| T34 | **"—" (uzun tire) hiçbir yerde kullanma** (kullanıcı-görünür içerik); yeni yazımda uygulanır + mevcut görünür metinlerde temizlik | memory `tire-kullanma` ile aynı; kod yorumlarına dokunma |

### ✅ Bu push
| # | Görev | Commit |
|---|-------|--------|
| T35 | Olanaklar & Özellikler (OzellikGoster) "saçma" görünüm → 2-kolon kompakt grid + kategori sayacı | (bu push) |
| T33 (kısmi) | Liste sayfaları 1240'a genişledi (leadler/paylastiklarim/performans) + leadler başlığı ortak `SayfaBaslik`; dar form/detay sayfaları kasıtlı dar bırakıldı ("mantıklı düşün") | (bu push) |

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
