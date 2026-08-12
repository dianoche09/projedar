#!/usr/bin/env bash
#
# KolaySEO kabul-testi harness — 4 kosul: P1 / N1 / A / B
# Amac: KolaySEO gercekten (1) tasinabilir, (2) native discoverable, (3) faydali mi?
#
# | Kosul | Global skill | Repo skill | CLAUDE.md pointer | Tekrar | Amac             |
# | ----- | ------------ | ---------- | ----------------- | ------ | ---------------- |
# | P1    | yok          | var        | var               | 1      | Tasinabilirlik   |
# | N1    | yok          | var        | yok               | 1      | Native discovery |
# | A     | yok          | yok        | yok               | 3      | Kontrol grubu    |
# | B     | yok          | var        | yok               | 3      | Skill katkisi    |
#
# A ve B: AYNI prompt / model / max-turns / commit state — tek degisken = repo skill.
# --bare KULLANILMAZ (o CLAUDE.md+hooks+MCP+memory'yi de kapatir -> tek degisken kalmaz).
#
# GUVENLIK: global skill gecici disable edilir (rename); trap EXIT/INT/TERM ile restore,
# pre/post integrity-hash karsilastirmasi. Backup hedefi doluysa test BASLAMAZ.
#
# Varsayilan: DRY-RUN (hicbir sey degistirmez, plani basar). Calistirmak: --execute
#
set -euo pipefail

# -- Config (env ile override edilebilir) -------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GLOBAL_SKILL="${GLOBAL_SKILL:-$HOME/.claude/skills/kolayseo}"
GLOBAL_BACKUP="${GLOBAL_BACKUP:-$HOME/.claude/skills/.kolayseo.__test_disabled__}"
MODEL="${MODEL:-sonnet}"
MAX_TURNS="${MAX_TURNS:-30}"
AB_REPEATS="${AB_REPEATS:-3}"
OUT_DIR="$REPO_ROOT/tests/kolayseo/results"

# Native-discovery icin NOTR prompt — "skill" kelimesi BILEREK yok (kesfe tesvik etmesin).
PROMPT="${PROMPT:-Projedarin teknik SEO yapisini read-only incele; en onemli riskleri kanitlariyla (dosya/route) raporla. Hicbir dosya degistirme, commit/push yapma.}"

# claude flag'leri — dry-run'da aynen basilir ki onaydan once gorulsun.
# Not: flag adlari claude surumune gore degisebilir; dry-run ciktisinda dogrula.
CLAUDE_FLAGS="${CLAUDE_FLAGS:---output-format stream-json --verbose --model $MODEL --max-turns $MAX_TURNS --permission-mode plan}"

EXECUTE=0
[ "${1:-}" = "--execute" ] && EXECUTE=1

log(){ printf '%s\n' "$*"; }
hr(){ printf '%s\n' "--------------------------------------------------------"; }

skill_hash(){ # bir dizinin icerik-hash'i (integrity icin)
  [ -d "$1" ] || { echo "MISSING"; return; }
  find "$1" -type f -exec shasum {} \; 2>/dev/null | awk '{print $1}' | sort | shasum | awk '{print $1}'
}

# -- On kosullar --------------------------------------------------------------
command -v git >/dev/null 2>&1 || { echo "HATA: git yok."; exit 1; }
CLAUDE_WARN=""
if ! command -v claude >/dev/null 2>&1; then
  if [ "$EXECUTE" -eq 1 ]; then echo "HATA: claude CLI PATH'te yok (--execute icin gerekli)."; exit 1; fi
  CLAUDE_WARN="UYARI: claude CLI su an PATH'te yok — --execute'ten once gerekli."
fi
if [ -e "$GLOBAL_BACKUP" ]; then
  echo "HATA: backup hedefi zaten var: $GLOBAL_BACKUP"
  echo "      Onceki bir test yarida kalmis olabilir. Elle kontrol et, sonra tekrar dene."
  exit 1
fi
GLOBAL_PRESENT=0; [ -d "$GLOBAL_SKILL" ] && GLOBAL_PRESENT=1
HASH_BEFORE="$(skill_hash "$GLOBAL_SKILL")"
TOTAL_RUNS=$((2 + 2 * AB_REPEATS))

# -- DRY-RUN: plan + dokunulacak yollar ---------------------------------------
if [ "$EXECUTE" -eq 0 ]; then
  cat <<EOF
--------------------------------------------------------
KolaySEO harness — DRY-RUN (hicbir sey degistirilmedi)
--------------------------------------------------------
${CLAUDE_WARN}
REPO_ROOT        : $REPO_ROOT
Global skill     : $GLOBAL_SKILL   (mevcut: $([ $GLOBAL_PRESENT -eq 1 ] && echo EVET || echo HAYIR))
  -> gecici tasinir: $GLOBAL_BACKUP   (trap ile geri alinir)
  -> integrity hash (oncesi): ${HASH_BEFORE:-<yok>}
Cikti dizini     : $OUT_DIR/   (*.jsonl + *.err + evidence.tsv)
Model / max-turns: $MODEL / $MAX_TURNS      A/B tekrar: $AB_REPEATS
claude flags     : $CLAUDE_FLAGS

PROMPT (tum kosullarda AYNI, "skill" kelimesi YOK):
  "$PROMPT"

Her kosul icin (gecici, temp clone icinde):
  - Fresh clone       : git clone --quiet REPO_ROOT <tmp>   (yalniz committed HEAD)
  - pointer OFF N1/A/B : clone CLAUDE.md'den SEO/GEO politikasi blogu silinir
  - repo skill OFF A   : rm -rf <tmp>/.claude/skills/kolayseo
  - run               : cd <tmp> && claude -p PROMPT FLAGS > results/<tag>.jsonl
  - <tmp> silinir

Kosullar: P1 x1, N1 x1, A x$AB_REPEATS, B x$AB_REPEATS  = toplam $TOTAL_RUNS claude kosusu

Kanit (3 seviye, ayri raporlanir — "kullandim" demesi TEK BASINA yetmez):
  [strong-1] tool/skill invocation event + kolayseo   -> jsonl'de Skill/tool_use
  [strong-2] .claude/skills/kolayseo/... dosya-okuma  -> jsonl'de Read file_path
  [weak]     cikti KolaySEO kurallarina benziyor        -> final metinde rule-terimleri

GUVENLIK: yalniz $GLOBAL_SKILL tasinir (auth ve diger skill'ler dokunulmaz).
          trap EXIT/INT/TERM -> restore; post-run hash == pre-run hash dogrulanir.
--------------------------------------------------------
Onaylarsan calistir:  bash tests/kolayseo/run-tests.sh --execute
Override:              MODEL=... MAX_TURNS=... AB_REPEATS=... bash tests/kolayseo/run-tests.sh --execute
EOF
  exit 0
fi

# -- EXECUTE ------------------------------------------------------------------
mkdir -p "$OUT_DIR"

restore_global(){
  local rc=$?
  if [ -d "$GLOBAL_BACKUP" ] && [ ! -e "$GLOBAL_SKILL" ]; then
    mv "$GLOBAL_BACKUP" "$GLOBAL_SKILL" && log "[restore] global skill geri alindi."
  fi
  local hash_after; hash_after="$(skill_hash "$GLOBAL_SKILL")"
  if [ "$hash_after" = "$HASH_BEFORE" ]; then
    log "[integrity] OK — global skill baslangicla AYNI ($hash_after)"
  else
    log "[integrity] !!! UYARI — global skill hash DEGISTI (oncesi=$HASH_BEFORE sonrasi=$hash_after). ELLE KONTROL ET."
  fi
  exit $rc
}
trap restore_global EXIT INT TERM

if [ "$GLOBAL_PRESENT" -eq 1 ]; then
  mv "$GLOBAL_SKILL" "$GLOBAL_BACKUP"
  log "[setup] global kolayseo gecici devre disi: $GLOBAL_SKILL -> $GLOBAL_BACKUP"
fi

strip_pointer(){ # CLAUDE.md'den SEO/GEO politikasi blogunu sil (sonraki '## ' basligina kadar)
  local f="$1"
  awk 'BEGIN{skip=0}
       /^## SEO \/ GEO politikasi/{skip=1; next}
       skip==1 && /^## /{skip=0}
       skip==0{print}' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
}

run_one(){ # $1=tag  $2=pointer(on|off)  $3=repo_skill(on|off)
  local tag="$1" pointer="$2" repo_skill="$3"
  local base clone
  base="$(mktemp -d)"; clone="$base/projedar"
  git clone --quiet "$REPO_ROOT" "$clone"
  [ "$pointer" = "off" ] && strip_pointer "$clone/CLAUDE.md"
  [ "$repo_skill" = "off" ] && rm -rf "$clone/.claude/skills/kolayseo"

  local jsonl="$OUT_DIR/$tag.jsonl"
  log "[run] $tag (pointer=$pointer repo_skill=$repo_skill) -> $jsonl"
  ( cd "$clone" && eval "claude -p \"\$PROMPT\" $CLAUDE_FLAGS" ) > "$jsonl" 2> "$OUT_DIR/$tag.err" \
    || log "[run] $tag NON-ZERO exit (bkz $OUT_DIR/$tag.err)"

  local ev_skill ev_file
  ev_skill=$(grep -c -iE 'skill|kolayseo' "$jsonl" 2>/dev/null || true)
  ev_file=$(grep -oE '"file_path":"[^"]*kolayseo[^"]*"' "$jsonl" 2>/dev/null | wc -l | tr -d ' ')
  printf '%s\t%s\t%s\tskill_evt=%s\tfile_read=%s\n' "$tag" "$pointer" "$repo_skill" "${ev_skill:-0}" "${ev_file:-0}" >> "$OUT_DIR/evidence.tsv"
  rm -rf "$base"
}

: > "$OUT_DIR/evidence.tsv"
run_one "P1" on  on
run_one "N1" off on
i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "A-$i" off off; i=$((i+1)); done
i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "B-$i" off on;  i=$((i+1)); done

hr; log "Bitti. Kanit ozeti ($OUT_DIR/evidence.tsv):"
column -t -s "$(printf '\t')" "$OUT_DIR/evidence.tsv" 2>/dev/null || cat "$OUT_DIR/evidence.tsv"
hr; log "Rubric skorlamasi: tests/kolayseo/rubric.md (manuel veya ayri judge kosusu)"
# trap restore_global otomatik calisir
