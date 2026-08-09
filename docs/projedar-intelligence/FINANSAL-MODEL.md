# PROJEDAR — FİNANSAL MODEL (24 aylık bottom-up simülasyon)

> Amaç: "ne kazanırız"ın kesin, kaldıraçları görünür cevabı. **Tüm sayılar varsayımdır ve ayarlanabilir** — model bir tahmin değil, bir mantık iskeletidir. Tarih: 2026-08-10.
> Not: gelir **tahakkuk** (recognized MRR = yıllık ARPU/12) bazında modellenmiştir. Nakit tahsilat **peşin yıllık** olduğu için tahakkuktan **öne yüklüdür** (runway lehine).

---

## 1. Varsayımlar (tunable)

### Fiyat (yıllık ARPU, yerli çapa-altı — bkz. fiyat çapası)
- **Müteahhit anlaşması:** ~250.000 ₺/yıl (band 40K-600K; 100 proje ≈ ~55 ödeyen anlaşma).
- **Emlakçı Pro (bireysel):** ~9.000 ₺/yıl (750 ₺/ay). RE-OS 13-14K, Novo 24-36K altı.
- **Ofis / franchise:** ~55.000 ₺/yıl (band 25-95K, danışman-kademeli).

### Erken aşama (ücretsiz destekçi)
- İlk ~10 müteahhit **kurucu** (ücretsiz, Yıl 1) → ödeyen müteahhit ~Ay 3'te başlar.
- İlk ~750-1.000 danışman **kurucu** (ücretsiz, Yıl 1) → bireysel Pro ödeme **Yıl 2 (Ay 13)** başlar.
- Ofis aboneliği ~Ay 6'da başlar, Yıl 2'de hızlanır.

### Gider (ekip büyütme — turun ana kullanımı)
- Ay 1-6: kurucu + altyapı → ~200K ₺/ay.
- Ay 7-12: +saha/concierge (3 kişi) → ~550K ₺/ay.
- Ay 13-18: +ürün/pazarlama/destek → ~900K ₺/ay.
- Ay 19-24: 2. şehir + kadro → ~1.200K ₺/ay.

### Kur
- $150K primary ≈ ~6.000K ₺ (~40 ₺/$). $50K secondary kurucuya (şirket nakdi değil).

---

## 2. Aylık simülasyon (24 satır)

Sütunlar: ödeyen **Müt**eahhit anlaşması · bireysel **Pro** danışman · **Ofis** abonesi · **MRR** (tahakkuk, K₺) · **Küm.Gelir** (tahakkuk, K₺) · **Burn** (K₺) · **Net** (K₺) · **Küm.Net** (K₺).

| Ay | Müt | Pro | Ofis | MRR | Küm.Gelir | Burn | Net | Küm.Net |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 0 | 0 | 200 | -200 | -200 |
| 2 | 1 | 0 | 0 | 21 | 21 | 200 | -179 | -379 |
| 3 | 2 | 0 | 0 | 42 | 63 | 200 | -158 | -538 |
| 4 | 4 | 0 | 0 | 83 | 146 | 200 | -117 | -654 |
| 5 | 6 | 0 | 0 | 125 | 271 | 200 | -75 | -729 |
| 6 | 9 | 0 | 1 | 192 | 463 | 200 | -8 | -737 |
| 7 | 12 | 0 | 3 | 264 | 727 | 550 | -286 | -1.023 |
| 8 | 15 | 0 | 6 | 340 | 1.067 | 550 | -210 | -1.233 |
| 9 | 18 | 0 | 10 | 421 | 1.488 | 550 | -129 | -1.363 |
| 10 | 22 | 0 | 16 | 532 | 2.019 | 550 | -18 | **-1.381** |
| 11 | 26 | 0 | 24 | 652 | 2.671 | 550 | +102 | -1.279 |
| 12 | 30 | 0 | 34 | 781 | 3.452 | 550 | +231 | -1.048 |
| 13 | 33 | 100 | 45 | 969 | 4.420 | 900 | +69 | -980 |
| 14 | 36 | 250 | 58 | 1.203 | 5.624 | 900 | +303 | -676 |
| 15 | 39 | 450 | 72 | 1.480 | 7.104 | 900 | +580 | -96 |
| 16 | 42 | 700 | 86 | 1.794 | 8.898 | 900 | +894 | **+798** |
| 17 | 44 | 1.000 | 98 | 2.116 | 11.014 | 900 | +1.216 | +2.014 |
| 18 | 46 | 1.250 | 108 | 2.391 | 13.405 | 900 | +1.491 | +3.505 |
| 19 | 48 | 1.450 | 118 | 2.628 | 16.033 | 1.200 | +1.428 | +4.933 |
| 20 | 50 | 1.600 | 126 | 2.819 | 18.852 | 1.200 | +1.619 | +6.552 |
| 21 | 52 | 1.720 | 134 | 2.988 | 21.840 | 1.200 | +1.788 | +8.340 |
| 22 | 53 | 1.820 | 140 | 3.111 | 24.950 | 1.200 | +1.911 | +10.250 |
| 23 | 54 | 1.920 | 146 | 3.234 | 28.185 | 1.200 | +2.034 | +12.285 |
| 24 | 55 | 2.000 | 150 | 3.333 | 31.518 | 1.200 | +2.133 | +14.418 |

---

## 3. Çıktılar (baz senaryo)

- **Ay-24 çıkış ARR (MRR×12):** ~**40,0M ₺** (~$1,0-1,2M).
  - Müteahhit 13,75M + Emlakçı Pro 18,0M + Ofis 8,25M.
- **24-ay tahakkuk gelir:** ~**31,5M ₺**.
- **Toplam burn (24 ay):** ~**17,1M ₺**.
- **Küm. net (tahakkuk, Ay 24):** ~**+14,4M ₺**.
- **Max küm. açık (J-eğrisi dibi):** ~**-1,38M ₺** (~Ay 10). → $150K (~6M ₺) bunu **~4× karşılar** + tampon + hızlandırma.
- **Küm. net pozitife dönüş:** ~**Ay 16** (tahakkuk bazında). **Nakit bazında daha erken** (peşin yıllık tahsilat).
- **Nakit tahsilat (peşin yıllık):** tahakkuktan öne yüklü; 24-ay nakit girişi ~40M+ ₺ (imzalanan yıllık sözleşmeler + erken kohort yenilemeleri).

**Ana okuma:** Model, $150K'lık primary'nin J-eğrisi dibini (~1,4M ₺) rahatça geçtiğini ve işin ~Ay 11'den itibaren aylık nakit-pozitif, ~Ay 16'da kümülatif-pozitif olduğunu gösteriyor. Yani sermaye **runway değil, ateşleme + tampon**; iş kendini besliyor.

---

## 4. Birim ekonomisi

| | ARPU/yıl | CAC (mantık) | Payback | LTV (3 yıl, düşük churn) |
|---|---|---|---|---|
| Müteahhit | ~250K | düşük (referans/el-satış, tek karar verici) | <1 yıl | ~750K+ |
| Emlakçı Pro | ~9K | çok düşük (müteahhit-davet zinciri = viral) | hızlı | ~27K |
| Ofis | ~55K | orta (saha satışı) | <1 yıl | ~165K |

- **Burn multiple** (net yakılan / net yeni ARR) 24 ay: ~17M burn / ~40M ARR ≈ **~0,43** (mükemmel; <1 sağlıklı).
- Peşin yıllık + referans-CAC → nakit-verimli büyüme.

---

## 5. Yatırım mantığı ($200K / %25)

- Post-money **$800K**; Ay-24 ARR ~$1,0-1,2M → şirket **kendi çıkış-ARR'ının altında** fiyatlanıyor (SaaS 3-8× forward ARR).
- $150K primary (~6M ₺) model max açığını (~1,4M ₺) **~4×** karşılar → düşük risk + hızlandırma + tampon.
- **Ankor + traction tetikleyici:** $800K cirosuz aşama fiyatı; ilk ödeyen müteahhitle ~$1,2M+'a revize.
- Getiri potansiyeli: baz tutarsa Ay-24 makul değerleme ~$3-6M → yatırımcı için ~4-8× kağıt getiri.

---

## 6. Duyarlılık (en kritik kaldıraçlar → çıkış ARR etkisi)

| Kaldıraç | Değişim | Çıkış ARR etkisi |
|---|---|---|
| Bireysel Pro sayısı | 2.000 → 3.000 (@9K) | +9,0M → ~49M |
| Pro ARPU | 9K → 7,5K | -3,6M → ~36M |
| Ofis sayısı | 150 → 250 (@55K) | +5,5M → ~45M |
| Müteahhit ort. anlaşma | 250K → 350K | +5,5M → ~45M |
| Yıl-2 monetizasyon | 3 ay gecikme | ~-6-8M çıkış ARR |
| Müteahhit sayısı | 55 → 80 | +6,25M → ~46M |

**En büyük swing:** emlakçı monetizasyonu (ödeyen sayısı × ARPU) + Yıl-2 zamanlaması. Model buna en duyarlı; GTM'in "kurucu → ödeyen" dönüşümü ana yürütme riski.

---

## 7. Riskler / gerçeklik kontrolü

- **En iddialı varsayım:** 5.000 ödeyen danışman (2.000 bireysel + ~3.000 ofis-koltuğu) / 24 ay = MYK'nın ~%8'i, hepsi ödeyen. 100 → 5.000 eğrisi ana risk.
- **Cold-start #1 risk:** arz (müteahhit) dolmadan emlakçı tarafı boş kalır → müteahhit-önce + concierge sıralaması bu yüzden.
- **Yıl-2 monetizasyon zamanlaması:** kurucu-ücretsiz danışmanın ödemeye dönmesi gecikirse çıkış ARR düşer.
- **Kur/enflasyon:** ₺ ARPU'lar enflasyona endeksli güncellenmeli (yıllık zam).
- Model **tahakkuk** bazlı; nakit **daha iyi** (peşin yıllık). Vergi/KDV modele dahil değil (net gelir görünümü).

---

*Bu dosya deck'in (`/sunum/v2/finansal`) arkasındaki gerekçedir. Rakamlar iş geliştikçe saha verisiyle güncellenir. Kaynak fiyat çapaları: yerli CRM sayfaları + iç rakip analizi (`rakip-analizi` memory, `ProjePazar-Rakip-Analizi.md`).*
