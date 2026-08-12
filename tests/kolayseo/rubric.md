# A/B skorlama rubric'i (mutation-benchmark tabanlı)

Amaç: "B daha uzun cevap verdi" ile "B gerçekten daha iyi SEO audit yaptı"yı ayırmak.
LLM deterministik değil → **≥3 A + 3 B**, ortalama.

## Ground-truth = enjekte edilen 10 mutasyon

`AB_MODE=mutated` ile her A/B clone'una 10 bilinen hata girer (`results/ground-truth.json`).
Artık skorlama sezgisel değil, **matematiksel**: 10 hata kondu, kaç tanesi yakalandı?

Her koşu raporu ground-truth ile eşleştirilir (3. bir değerlendirici — insan veya ayrı judge koşusu):
- **TP** — enjekte edilen mutasyonu doğru tespit (M1..M10'dan hangisi)
- **FP** — enjekte EDİLMEMİŞ, hatalı/uydurma bulgu
- **MISS** — kaçırılan mutasyon
- **severity** — mutasyon başına: M1/M2/M3/M4/M8 = high (index/canonical/leak), M5/M6/M7/M9/M10 = medium

## Skor

```
detection_rate = TP / 10
score = 5×(high TP) + 3×(medium TP) − 3×(FP)
```

Ek metrik (skora katma, ayrı raporla):
- FP oranı (B'de düşük olmalı — verify-before-fix disiplini)
- KolaySEO-özgü bulgu (React19 JSON-LD, thin→tüm-site doorway, IndexNow≠GSC, Content-Signal)
- gereksiz öneri sayısı (B'de düşük — skill odaklar)

## Karar

| Sonuç | Yorum |
|-------|-------|
| ort(B TP) ≫ ort(A TP) ve FP(B) ≤ FP(A) | Skill ölçülebilir değer üretiyor ✅ |
| ort(B) ≈ ort(A) | Adı var, bilgi avantajı yok ⚠️ |
| ort(B) < ort(A) veya FP(B) > FP(A) | Skill yanlış yönlendiriyor 🔴 |

## Şablon (`results/scores.tsv`)

```
run	TP	FP	MISS	highTP	medTP	score	kolayseo_ozgu	gereksiz
A-1	...
B-1	...
```

## Versiyonlama faydası
Aynı benchmark KolaySEO v3'te de koşar: "v2 detection 0.62 → v3 0.85" gibi objektif regresyon ölçümü.
