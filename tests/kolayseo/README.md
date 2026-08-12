# KolaySEO kabul-testi harness

KolaySEO skill'inin gerçekten **(1) taşınabilir, (2) native discoverable, (3) faydalı** olduğunu
kontrollü biçimde kanıtlar. "Skill'i kullandım" beyanı kanıt SAYILMAZ.

## 4 koşul

| Koşul | Global skill | Repo skill (`.claude/skills/kolayseo`) | CLAUDE.md pointer | Tekrar | Ölçtüğü |
|-------|------|------|------|--------|---------|
| **P1** | yok | var | **var** | 1 | Taşınabilirlik (fresh clone kurallara erişebiliyor mu?) |
| **N1** | yok | var | yok | 1 | Native discovery (Claude `description`'dan kendiliğinden çağırıyor mu?) |
| **A**  | yok | **yok** | yok | ≥3 | Kontrol grubu (skill'siz normal Claude) |
| **B**  | yok | var | yok | ≥3 | Skill katkısı |

- **A ve B tek değişkenle ayrılır: repo skill.** Aynı prompt / model / max-turns / commit state.
- Global skill TÜM koşullarda kapalı (harness geçici rename eder, sonra geri alır).
- **`--bare` kullanılmaz** — o CLAUDE.md + hooks + MCP + memory'yi de kapatır, tek değişken kalmaz.
- Native-discovery prompt'unda **"skill" kelimesi bilerek yok** (aksi halde keşfe teşvik = kirli deney).

## Çalıştırma

```bash
# 1) Önce DRY-RUN (hiçbir şey değiştirmez, planı + dokunulacak yolları basar)
bash tests/kolayseo/run-tests.sh

# 2) Onaydan sonra gerçek koşu
bash tests/kolayseo/run-tests.sh --execute

# override örnekleri
MODEL=sonnet MAX_TURNS=40 AB_REPEATS=3 bash tests/kolayseo/run-tests.sh --execute
```

Çıktı: `tests/kolayseo/results/<tag>.jsonl` (stream-json), `<tag>.err`, `evidence.tsv`.

## PASS kanıtı — 3 seviye (ayrı raporlanır)

1. **[strong-1]** jsonl'de skill/tool invocation event + `kolayseo` → en güçlü.
2. **[strong-2]** jsonl'de `.claude/skills/kolayseo/...` dosya-okuma izi (Read) → güçlü.
3. **[weak]** yalnız final metnin KolaySEO kurallarına benzemesi → zayıf, tek başına yetmez.

> `stream-json --verbose` sürüme göre event adlarını değiştirebilir; bu yüzden tek bir event
> adına PASS bağlanmaz — üç sinyal ayrı ayrı toplanır.

- **P1 PASS**: strong-1 veya strong-2 sinyali var (pointer yolu çalışıyor).
- **N1 PASS**: pointer YOKken strong-1/strong-2 var → native discovery kanıtlandı.
- **N1 FAIL ama P1 PASS**: taşınabilir ama native değil → güvence CLAUDE.md pointer'ında (kabul edilebilir).

## Güvenlik (global skill rename)

Harness yalnız `~/.claude/skills/kolayseo`'yu taşır (auth ve diğer skill'ler dokunulmaz):
- backup hedefi doluysa **başlamaz** (yarım kalmış önceki test koruması).
- başlangıçta içerik-hash kaydeder.
- `trap EXIT/INT/TERM` → yarıda kesilse bile restore.
- koşu sonunda hash == başlangıç doğrulanır; farklıysa UYARI basar.

## Skorlama

A/B çıktıları `rubric.md`'deki severity-weighted formülle puanlanır (manuel veya ayrı judge koşusu).
Tek A + tek B "ölçülebilir katkı" için zayıf; **≥3+3 koşu** + ortalama alınır.
