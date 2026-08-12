# KolaySEO kabul-testi harness v1.2

KolaySEO'nun gerçekten **(1) taşınabilir, (2) native discoverable, (3) faydalı** olduğunu
kontrollü kanıtlar. "Skill'i kullandım" beyanı kanıt SAYILMAZ.

## 5 koşul (skill kalitesi ≠ discovery ayrımı)

| Koşul | Global skill | Repo skill | proj pointer | Mutasyon | Tekrar | Ölçtüğü |
|-------|------|------|------|------|--------|---------|
| **P1** | yok | var | **var** | yok | 1 | Taşınabilirlik |
| **N1** | yok | var | yok | yok | 1 | Native discovery |
| **A** | yok | **yok** | yok | var* | ≥3 | Kontrol grubu |
| **B-native** | yok | var | yok | var* | ≥3 | Skill katkısı (oto-keşif) |
| **B-forced** | yok | var | **var** | var* | ≥3 | Skill **kalitesi** (zorla çağır) |

`*AB_MODE=mutated` (varsayılan): her A/B clone'una **10 gizli SEO hatası** enjekte.

**B-native ↔ B-forced farkı = discovery kalitesi.** Örnek: `A=5.3, B-native=5.4, B-forced=8.9`
→ *skill güçlü ama Claude otomatik çağırmıyor* (discovery zayıf). `A=5.3, B-native=5.4, B-forced=5.6`
→ *skill'in içerik avantajı zayıf*. Bu ayrım tek B ile yapılamaz.

- A / B-native / B-forced: AYNI prompt / model / max-turns / mutasyon. **`--bare` yok.**
- Native/A prompt'unda **"skill" kelimesi yok** (keşfe teşvik = kirli deney).

## Çalıştırma

```bash
bash tests/kolayseo/run-tests.sh                         # DRY-RUN
ONLY=P1 bash tests/kolayseo/run-tests.sh --execute       # smoke (tek koşu)
bash tests/kolayseo/run-tests.sh --execute               # tam set (11 koşu)
```
Override: `MODEL MAX_TURNS AB_REPEATS ONLY AB_MODE NEUTRALIZE_GLOBAL_MD`.
`ONLY ∈ {P1,N1,A,BNATIVE,BFORCED,ALL}`.

## Mutation benchmark — GİZLİ ground-truth (ceiling-effect'i yener)

Temiz repo'da "hata bul" demek skill'i ölçmez. `mutations.mjs` her A/B clone'una **10 bilinen SEO
hatası** enjekte eder (literal-replace, **fail-closed**). Ground-truth `results/ground-truth.json`.

**Hatalar tamamen DOĞAL görünür — hiçbir MUT/yanlis/broken marker'ı yok.** (M6 `d.length>2`→`>3`,
M7/M8 eşik→`0`, M2 canonical→`/konut-projeleri`, M10 `sitemap.xml`→`sitemap-index.xml`, ...). Aksi
halde agent KolaySEO'ya gerek kalmadan "test hatası" yakalar. mutations.mjs uygulama sonrası src'de
kontaminasyon marker'ı kalırsa **fail-closed durur**. Mutasyonlu clone tsc'den geçer.

## İzolasyon (v1.2 — ground-truth agent'a görünmez)

1. **Clone'dan `tests/kolayseo/` silinir** → mutations.mjs + ground-truth.json + rubric agent'a görünmez.
2. **Global skill `~/.claude` DIŞINA** taşınır (`$TMPDIR`) → `find ~/.claude` backup'ı bulamaz.
3. **A/B read-only native tool whitelist** (`Read,Glob,Grep,LS`) — **`--dangerously-skip-permissions` YOK**
   (efemer clone OS-sandbox değildir). `Edit/Write/Bash` kapalı.
4. Ekstra: clone'da `ground-truth|mutations.mjs` izi kalırsa fail-closed.

> Tam OS-sandbox (temp `HOME` / container) ileri iş — auth/config'i kırmadan önce küçük PoC gerekir.

## PASS kanıtı — 3 seviye (jq ile)
1. **[strong-1]** tool_use event'inde `Skill`/`kolayseo`. 2. **[strong-2]** `Read` file_path `.claude/skills/kolayseo`.
3. **[weak]** yalnız çıktı-benzerliği (tek başına yetmez). Harness distinct tool_use adlarını döker (şema öğrenme).

## Fail-closed / güvenlik
Global md kirli + N1/A/Bnative + `NEUTRALIZE_GLOBAL_MD!=1` → başlamaz · pointer sonrası kolayseo kalırsa
FATAL (diff artefakt) · mutasyon anchor/kontaminasyon → FATAL · backup dolu → başlamaz · `mv`+trap
EXIT/INT/TERM+pre/post integrity-hash · `DISABLE_AUTOUPDATER=1` · claude version + resolved-model log.

Skorlama: `rubric.md`.
