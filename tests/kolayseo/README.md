# KolaySEO kabul-testi harness v1.1

KolaySEO'nun gerçekten **(1) taşınabilir, (2) native discoverable, (3) faydalı** olduğunu
kontrollü kanıtlar. "Skill'i kullandım" beyanı kanıt SAYILMAZ.

## 4 koşul

| Koşul | Global skill | Repo skill | proj CLAUDE.md pointer | Mutasyon | Tekrar | Ölçtüğü |
|-------|------|------|------|------|--------|---------|
| **P1** | yok | var | **var** | yok | 1 | Taşınabilirlik (fresh clone kurallara erişebiliyor mu?) |
| **N1** | yok | var | yok | yok | 1 | Native discovery (Claude `description`'dan kendiliğinden çağırıyor mu?) |
| **A**  | yok | **yok** | yok | var* | ≥3 | Kontrol grubu (skill'siz Claude) |
| **B**  | yok | var | yok | var* | ≥3 | Skill katkısı |

`*AB_MODE=mutated` (varsayılan): her A/B clone'una **10 bilinen SEO hatası** enjekte edilir → matematiksel ground-truth.

- **A ve B tek değişken: repo skill.** Aynı prompt / model / max-turns / mutasyon / commit state.
- Global skill TÜM koşullarda kapalı (harness geçici rename + trap restore).
- **`--bare` yok** (CLAUDE.md+hooks+MCP+memory'yi de kapatır → tek değişken kalmaz).
- Native-discovery prompt'unda **"skill" kelimesi yok** (keşfe teşvik = kirli deney).

## Çalıştırma

```bash
bash tests/kolayseo/run-tests.sh                       # DRY-RUN (plan + dokunulacak yollar)
ONLY=P1 bash tests/kolayseo/run-tests.sh --execute     # SMOKE: yalnız 1 koşu (şema öğren)
ONLY=N1 bash tests/kolayseo/run-tests.sh --execute     # native discovery tek koşu
bash tests/kolayseo/run-tests.sh --execute             # tam set (P1,N1,A×3,B×3)
AB_MODE=clean bash tests/kolayseo/run-tests.sh --execute   # mutasyonsuz A/B (ceiling-effect riski)
```

Override: `MODEL`, `MAX_TURNS`, `AB_REPEATS`, `ONLY`, `AB_MODE`, `NEUTRALIZE_GLOBAL_MD`.

## Mutation benchmark (A/B'nin kalbi — ceiling-effect'i yener)

Projedar zaten büyük ölçüde temiz (kolayseo sayesinde). Temiz repo'da "hata bul" demek skill'in
değerini ölçmez. Çözüm: `mutations.mjs` her A/B clone'una **10 bilinen SEO hatası** enjekte eder
(literal-replace, **fail-closed**: anchor kayarsa DURUR). Ground-truth `results/ground-truth.json`.

10 mutasyon: M1 konut noindex · M2 proje yanlış canonical · M3 sitemap private leak ·
M4 /p/ robots-disallow (noindex çelişkisi) · M5 duplicate title · M6 derinlik-guard kaldırma ·
M7 sitemap thin-eşik kaldırma · M8 proje thin-guard kaldırma · M9 anasayfa self-canonical kaldırma ·
M10 robots sitemap-pointer 404. (Mutasyonlu clone tsc'den geçer → agent "çalışan ama bozuk" site görür.)

Ölçüm: A ort kaç/10 buldu, B ort kaç/10, FP oranları. Gerçek laboratuvar testi.

## PASS kanıtı — 3 seviye (jq ile, ayrı raporlanır)

1. **[strong-1]** jsonl tool_use event'inde `Skill`/`kolayseo` → en güçlü.
2. **[strong-2]** `Read` tool_use `file_path` içinde `.claude/skills/kolayseo` → güçlü.
3. **[weak]** yalnız final metnin KolaySEO kurallarına benzemesi → tek başına yetmez.

Harness ayrıca **görülen distinct tool_use adlarını** döker (skill invocation'ın JSON'da hangi
şema ile çıktığını öğrenmek için — smoke'un asıl amacı). `grep` değil `jq` kullanılır.

## Fail-closed / güvenlik

- **Global `~/.claude/CLAUDE.md` kolayseo içeriyorsa** + N1/A/B koşacaksa → BAŞLAMAZ
  (`NEUTRALIZE_GLOBAL_MD=1`: yedekle + kolayseo satırlarını çıkar + trap restore).
- pointer silme sonrası clone CLAUDE.md'de hâlâ `kolayseo` varsa → FATAL (before/after diff artefakt).
- mutasyon anchor'ı beklenen sayıda değilse → FATAL.
- global skill: `mv` + `trap EXIT/INT/TERM` + backup-dolu koruması + pre/post integrity-hash.
- `DISABLE_AUTOUPDATER=1`; `claude --version` + resolved-model her koşuda `env.txt`/`evidence.tsv`'ye.

## Flag profilleri

- **P1/N1 (DISCO):** `--permission-mode plan` — read-only, discovery için yeterli + güvenli.
- **A/B:** `--dangerously-skip-permissions` — **yalnız efemer clone'da** (atılıyor), skill'in tam
  grep/find/bash yeteneğini kısıtlamamak için. Clone disposable olduğu için güvenli.

Skorlama: `rubric.md`.
