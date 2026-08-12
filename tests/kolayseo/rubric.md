# A/B skorlama rubric'i

Amaç: "B daha uzun cevap verdi" ile "B gerçekten daha iyi SEO audit yaptı"yı ayırmak.
LLM çıktısı deterministik değil → **en az 3 A + 3 B** koşusu, ortalama.

## Her koşu için işaretle

Üçüncü bir değerlendirici (insan veya ayrı judge koşusu) her raporu ground-truth ile karşılaştırır.
Ground-truth = Projedar'ın bilinen SEO gerçekleri (bu repoda doğrulanmış bulgular: `/p/` indexation,
thin-content eşiği, canonical, private-leak, `[[...dilim]]` derinlik-guard, gradual-index, robots AI-list).

Her bulgu için sınıfla:
- **TP (true positive)** — gerçek + doğru; severity: critical / high / medium
- **FP (false positive)** — hatalı/uydurma bulgu (yanlış-pozitif)
- **MISS** — kaçırılan önemli gerçek sorun; severity: critical / high / medium
- **KolaySEO-özgü** — yalnız skill kuralı sayesinde çıkabilecek bulgu (React19 JSON-LD paterni,
  thin→tüm-site doorway, IndexNow≠GSC, answer-first/FAQ, Content-Signal, verify-before-fix)
- **Gereksiz öneri** — düşük değerli / genel laf

## Skor formülü

```
score = 5×(critical TP) + 3×(high TP) + 1×(medium TP)
        − 3×(FP)
        − 5×(critical MISS) − 3×(high MISS)
```

Ek metrikler (ayrı raporla, skora katma):
- KolaySEO-özgü bulgu sayısı (B'de A'dan belirgin fazla olmalı)
- Gereksiz öneri sayısı (B'de düşük olmalı — skill odaklar)
- FP oranı (B'de düşük olmalı — verify-before-fix disiplini)

## Karar

| Sonuç | Yorum |
|-------|-------|
| ort(B) − ort(A) belirgin pozitif **ve** KolaySEO-özgü bulgu B≫A | Skill değer üretiyor ✅ |
| ort(B) ≈ ort(A), KolaySEO-özgü bulgu farkı yok | Skill'in adı var, bilgi avantajı yok ⚠️ |
| ort(B) < ort(A) veya B'de FP artışı | Skill zarar veriyor / yanlış yönlendiriyor 🔴 |

## Şablon (results/scores.tsv olarak doldur)

```
run	critTP	highTP	medTP	FP	critMISS	highMISS	kolayseo_ozgu	gereksiz	score
A-1	...
B-1	...
```
