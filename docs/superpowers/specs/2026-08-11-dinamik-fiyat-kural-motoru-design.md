# Dinamik Fiyat Kural Motoru — Tasarım Spec'i

**Tarih:** 2026-08-11
**Durum:** Onay bekliyor (brainstorming çıktısı)
**Bağlam:** Üretici, proje kurulumunda deterministik fiyat değişim kuralları tanımlar; sistem koşul gerçekleşince fiyatı otomatik uygular veya öneri düşürür (proje bazında seçilir). Mevcut `oneriHesapla` (heuristik tavsiye, `src/app/uretici/fiyat-onerisi/page.tsx`) korunur; bu spec deterministik kural motorunu ekler.

## 1. Amaç ve kapsam

Müteahhitin önceden yazdığı, öngörülebilir kuralların icra edilmesi. Tahmin/AI değil; müteahhitin planının otomasyonu.

Örnek kurallar (birebir karşılanmalı):
- "Satış başlangıcından 10 gün sonra tüm müsait birimlere %3 zam."
- "Projede ilk 20 daire satıldıktan sonra kalan müsait birimlere %5 zam."
- "2+1 daire tipinde stoğun %50'si satılınca %4 zam."
- "1 Aralık 2026'da liste %2 güncelle." (mutlak takvim)

Sektör dayanağı: absorption rate (satış hızı) + fazlı çıkış-momentum zam + mevsimsel/zamanlı zam. (Absorption/phasing literatürü; bkz. Sources.)

**Kapsam dışı (Faz-2):** endeks-bağlı zam (malzeme/TÜFE endeksi), AI/heuristik otomatik uygulama, kur (USD) endeksli otomasyon.

## 2. Kullanıcı akışı

1. Müteahhit `/uretici/proje/[id]/kurulum` içinde "Dinamik Fiyat Kuralları" bölümünde kural(lar) ekler.
2. Proje modunu seçer: `otomatik` (sistem uygular + bildirir) veya `oneri` (onay kuyruğuna düşer).
3. Guardrail girer (tavan %, adım max %, taban); ana açma/kapama.
4. Motor (cron + satış-sonrası) koşulları değerlendirir:
   - `otomatik`: `birim.liste_fiyati` güncellenir → bildirim + audit.
   - `oneri`: öneri kaydı oluşur → müteahhit `/uretici/fiyat-onerisi`'de "hepsini/seçerek uygula" der.

## 3. Veri modeli

### 3.1 `fiyat_kurali` (yeni tablo)
| kolon | tip | açıklama |
|---|---|---|
| id | uuid pk | |
| proje_id | uuid not null → proje(cascade) | |
| tip_id | uuid null → daire_tipi | null = projedeki tüm tipler |
| ad | text | müteahhit etiketi ("Erken kuş zammı") |
| tetik | text check in ('sure_gun','satis_adet','satis_yuzde','tarih') | |
| esik | numeric | 10 gün / 20 adet / 25 (%) / (tarih tetikte kullanılmaz) |
| tetik_tarih | date null | yalnız `tarih` tetiğinde |
| aksiyon | text check in ('yuzde','sabit_ekle','sabit_fiyat') | |
| deger | numeric | +3 = %3 / -3 = -%3 / 50000 = +50.000 TL / sabit_fiyat=hedef |
| tekrar | text check in ('tek','periyodik') default 'tek' | periyodik: her `esik` biriminde |
| son_uygulanan_esik | numeric default 0 | idempotency (periyodikte son uygulanan katsayı, tek'te 0/1) |
| aktif | boolean default true | |
| created_at | timestamptz default now() | |

### 3.2 `proje.fiyat_ayar` (jsonb, mevcut proje tablosuna kolon ekle)
```json
{
  "aktif": true,
  "mod": "otomatik",            // 'otomatik' | 'oneri'
  "baz_tarih": "2026-08-11",    // sure_gun/periyodik referansı; default proje.created_at
  "tavan_pct": 20,               // liste_fiyati taban_fiyat'ın en fazla +%20 üstüne çıkabilir
  "adim_max_pct": 5,             // tek uygulamada max ±%5
  "taban_override": null          // null = daire_tipi.taban_fiyat; sayı = mutlak alt sınır
}
```

### 3.3 `fiyat_kural_oneri` (yeni tablo — yalnız `oneri` modu)
| kolon | tip | açıklama |
|---|---|---|
| id | uuid pk | |
| kural_id | uuid → fiyat_kurali(cascade) | |
| birim_id | uuid → birim(cascade) | |
| proje_id | uuid → proje(cascade) | |
| eski_fiyat | numeric | |
| yeni_fiyat | numeric | guardrail uygulanmış |
| durum | text check in ('bekliyor','uygulandi','reddedildi') default 'bekliyor' | |
| created_at | timestamptz default now() | |
| unique (kural_id, birim_id) where durum='bekliyor' | | aynı öneri iki kez düşmesin |

RLS: üç yapı da proje sahipliği (uretici) + is_admin() ile korunur; emlakçı görmez.

## 4. Tetik tipleri ve baz

- **sure_gun:** `now - baz_tarih >= esik gün`. `tekrar='periyodik'` ise `floor((gün)/esik)` katsayısı `son_uygulanan_esik`'ten büyükse tetikler (her esik günde bir).
- **satis_adet:** kapsamdaki (proje veya tip) `satildi` ana birim sayısı >= esik. periyodikte her esik adette.
- **satis_yuzde:** `satildi / satılabilir_ana_birim_toplam` (kapsamda) >= esik%. periyodikte her esik%'te.
- **tarih:** `current_date >= tetik_tarih` ve daha önce uygulanmadıysa (tek).

**baz_tarih:** proje kurulumunda müteahhit belirler; default `proje.created_at`. Konsept: "satış başlangıcı".

## 5. Aksiyon tipleri

Kapsamdaki her uygun birim için:
- **yuzde:** `yeni = liste_fiyati * (1 + deger/100)`
- **sabit_ekle:** `yeni = liste_fiyati + deger`
- **sabit_fiyat:** `yeni = deger` (hedef fiyata çek)

Sonra guardrail + 1000'e yuvarla.

## 6. Motor

### 6.1 Değerlendirme (`fiyatKuraliCalistir` cron işi — mevcut dispatcher'a eklenir)
Her aktif kural için, `proje.fiyat_ayar.aktif` ise:
1. Tetik koşulu + idempotency (`son_uygulanan_esik`) kontrol et.
2. Kapsamdaki **uygun birimleri** seç: `ana_birim_id is null` AND `satilabilir=true` AND `durum in ('musait','planli')` AND (tip_id null OR birim.tip_id=tip_id). **Asla:** opsiyonlu/satis_beklemede/satildi/kiralandi/stop.
3. Her birim için yeni fiyat hesapla + guardrail uygula.
4. Mod:
   - `otomatik`: `birim.liste_fiyati` güncelle (`son_guncelleme=now`), `son_uygulanan_esik` ilerlet, müteahhite bildirim, audit (fiyat trigger otomatik loglar; payload'a `kaynak:'kural', kural_id` eklemek için ayrıca events insert veya trigger'ı genişlet).
   - `oneri`: her birim için `fiyat_kural_oneri` satırı (bekliyor). `son_uygulanan_esik` yine ilerlet (aynı eşik tekrar öneri üretmesin). Bildirim: "N birimde fiyat önerisi hazır."

### 6.2 Satış-sonrası anında değerlendirme
`birimSatisKapat` (ve `birimDurumGuncelle` satildi yolu) sonunda ilgili projenin `satis_adet`/`satis_yuzde` kurallarını re-değerlendir (cron beklemeden anlık tetik). Ortak fonksiyon `kurallariDegerlendir(proje_id, {tetikTipleri})`.

### 6.3 Cadence
Cron gecelik (mevcut `/api/cron` dispatcher, 03:00 UTC). `sure_gun`/`tarih` gün çözünürlüğünde yeterli. `satis_*` zaten satış-sonrası anında tetiklendiğinden cron yedek.

## 7. Guardrail

**Koşulsuz (sistem, kapatılamaz):**
- opsiyonlu/satis_beklemede/satildi birime asla dokunma (madde 6.1/2 filtresi).
- `taban`: `yeni_fiyat < taban` ise `taban`'a çek. taban = `fiyat_ayar.taban_override ?? daire_tipi.taban_fiyat ?? 0`.
- `tavan`: `yeni_fiyat > taban * (1 + tavan_pct/100)` ise tavana çek (taban_fiyat referanslı kümülatif kapak).
- 1000'e yuvarla.

**Müteahhit ayarı:** `tavan_pct`, `adim_max_pct` (tek uygulamada |Δ%| bu sınırı aşarsa sınıra kırp), `taban_override`.

## 8. Arayüz

### 8.1 Kural editörü (proje kurulum)
`/uretici/proje/[id]/kurulum`'a "Dinamik Fiyat Kuralları" bölümü:
- Mod toggle (otomatik / öneri) + ana açma-kapama + guardrail alanları + baz_tarih.
- Kural listesi + ekle formu: ad, kapsam (tüm/tip seç), tetik + eşik (veya tarih), aksiyon + değer, tekrar. Aç/kapa, sil.
- Server action'lar: `fiyatKuraliEkle/Guncelle/Sil`, `projeFiyatAyar`.

### 8.2 Onay kuyruğu (`/uretici/fiyat-onerisi`)
- Üstte: `oneri` modundaki projelerin bekleyen `fiyat_kural_oneri` kayıtları → "Hepsini uygula / seçerek uygula / reddet" (toplu).
- Altta: mevcut heuristik `oneriHesapla` tavsiyeleri (değişmez, ayrı sekme/bölüm).
- Uygula action'ı: seçili önerileri `birim.liste_fiyati`'ye yazar, öneri `durum='uygulandi'`.

## 9. İz ve bildirim

- Audit: `events(tip='fiyat')` trigger zaten eski/yeni/pct logluyor. Kural kaynağını ayırmak için `birim_fiyat_log` trigger'ına `kaynak` eklenemez (trigger değişimi kimin yaptığını bilmez); bunun yerine kural motoru uyguladıktan sonra ek `events` insert'i (`payload.kaynak='kural', kural_id`) yazar. (Çift log riski: trigger + manuel; trigger'ı bu path'te bypass etmek yerine tek kaynak olarak trigger'a güvenip ayrı bir `payload.kaynak` gerekiyorsa trigger'ı genişletmek Faz-2. MVP: trigger logu yeterli, kural izi opsiyonel.)
- Bildirim (`bildirim`): `otomatik` modda "X projede N birim fiyatı kurala göre güncellendi", `oneri` modda "N birimde fiyat önerisi hazır".

## 10. Kenar durumlar

- **liste_fiyati null:** yuzde/sabit_ekle uygulanamaz (atla); sabit_fiyat uygulanabilir.
- **taban_fiyat yok + taban_override yok:** taban=0, yalnız tavan/adım korur (uyarı: kurulumda taban öner).
- **Aynı gün birden çok kural:** sırayla uygulanır (created_at asc); her biri bir öncekinin çıktısı üzerine (guardrail her adımda).
- **periyodik + uzun aralık cron kaçırma:** `floor(gün/esik)` katsayısı ile kaçan aralıklar tek seferde yakalanır (son_uygulanan_esik'e sıçra); tek tek zam yığmaz (adım_max korur).
- **Mod `oneri` iken kural silinir:** bekleyen öneriler cascade ile düşer.
- **Fiyat gizli tahsis (fiyat_gorunur=false):** kural yine uygular (fiyat gerçeği birim tablosunda); emlakçı redaksiyonu ayrı katman (bkz. emlakci_birim_fiyat).

## 11. Test kriterleri

- sure_gun tek: baz+10g'de bir kez %3 uygular, ertesi cron tekrar uygulamaz.
- satis_adet: 20. satışta anında tetiklenir (satış-sonrası), müsait birimlere uygulanır, opsiyonlu/satılan değişmez.
- tavan/taban/adım: sınır aşan öneri sınıra kırpılır; taban_fiyat altına inmez.
- oneri modu: öneri kuyruğu oluşur, uygulanınca liste_fiyati yazılır, tekrar öneri düşmez.
- Guardrail koşulsuzları kapatılamaz.

## Sources
- [Absorption Rate in Real Estate (2026), Thesis Driven](https://thesisdriven.com/guides/absorption-rate)
- [Phasing real estate projects considering profitability and customer satisfaction (ResearchGate)](https://www.researchgate.net/publication/394476696_Phasing_real_estate_projects_considering_profitability_and_customer_satisfaction)
- [Real Estate Development Feasibility Analysis, Ryan O'Connell CFA](https://ryanoconnellfinance.com/cre-development-feasibility/)
