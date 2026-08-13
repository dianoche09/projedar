# Projedar — Görev Takip Panosu (canlı)

> **KURAL (ZORUNLU):** Kullanıcının istediği HER şey buraya task olarak işlenir ve durumu takip edilir.
> Yapılanlar kapatılır (✅ + commit), yapılmayanlar (⏳) kullanıcı sorunca hatırlatılır. Bkz. CLAUDE.md "Görev Takibi".
> Durum kodları: ✅ tamam (canlı) · 🔵 devam ediyor · ⏳ bekliyor · 🧊 ayrı proje/planlama · ❌ iptal.

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

### 🧊 Ayrı proje (kendi planlaması)
| # | Görev | Not |
|---|-------|-----|
| T30 | KolayIMAR parsel/imar/bölge analiz entegrasyonu (emlakjet benzeri parsel zekâsı) | veri kaynağı+KVKK+maliyet planı gerekir |
