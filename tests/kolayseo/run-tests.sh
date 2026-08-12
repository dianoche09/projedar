#!/usr/bin/env bash
#
# KolaySEO kabul-testi harness v1.1 — 4 kosul: P1 / N1 / A / B
# Amac: KolaySEO gercekten (1) tasinabilir, (2) native discoverable, (3) faydali mi?
#
# | Kosul | Global skill | Repo skill | proj CLAUDE.md pointer | Mutasyon | Amac             |
# | ----- | ------------ | ---------- | ---------------------- | -------- | ---------------- |
# | P1    | yok          | var        | var                    | yok      | Tasinabilirlik   |
# | N1    | yok          | var        | yok                    | yok      | Native discovery |
# | A     | yok          | yok        | yok                    | var*     | Kontrol grubu    |
# | B     | yok          | var        | yok                    | var*     | Skill katkisi    |
# (*A/B AB_MODE=mutated ise her clone'a 10 bilinen SEO hatasi enjekte edilir → ground-truth)
#
# A ve B: AYNI prompt/model/max-turns/mutasyon/commit state — TEK degisken = repo skill.
# --bare KULLANILMAZ (CLAUDE.md+hooks+MCP+memory'yi de kapatir → tek degisken kalmaz).
#
# GUVENLIK: global skill + (kirliyse) global CLAUDE.md gecici disable; trap EXIT/INT/TERM
# restore + pre/post integrity-hash. Backup hedefi doluysa BASLAMAZ. Fail-closed.
#
# Varsayilan: DRY-RUN. Calistir: --execute
# Tek kosul (smoke): ONLY=P1|N1|A|B (varsayilan ALL)
#
set -euo pipefail

# -- Config (env override) ----------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GLOBAL_SKILL="${GLOBAL_SKILL:-$HOME/.claude/skills/kolayseo}"
GLOBAL_BACKUP="${GLOBAL_BACKUP:-$HOME/.claude/skills/.kolayseo.__test_disabled__}"
GLOBAL_MD="${GLOBAL_MD:-$HOME/.claude/CLAUDE.md}"
GLOBAL_MD_BACKUP="${GLOBAL_MD_BACKUP:-$HOME/.claude/CLAUDE.md.__test_backup__}"
MODEL="${MODEL:-sonnet}"
MAX_TURNS="${MAX_TURNS:-30}"
AB_REPEATS="${AB_REPEATS:-3}"
ONLY="${ONLY:-ALL}"                 # P1|N1|A|B|ALL
AB_MODE="${AB_MODE:-mutated}"       # mutated|clean
NEUTRALIZE_GLOBAL_MD="${NEUTRALIZE_GLOBAL_MD:-0}"
OUT_DIR="$REPO_ROOT/tests/kolayseo/results"
MUT_SCRIPT="$REPO_ROOT/tests/kolayseo/mutations.mjs"

# Notr prompt — "skill" kelimesi BILEREK yok (native kesfe tesvik etmesin).
PROMPT="${PROMPT:-Projedarin teknik SEO yapisini read-only incele; en onemli riskleri kanitlariyla (dosya/route) raporla. Hicbir dosya degistirme, commit/push yapma.}"

# Iki flag profili (array — eval YOK):
#  DISCO (P1/N1): plan mode = read-only, discovery olcumu icin yeterli, guvenli.
#  AB          : disposable clone icinde tam yetenek (grep/find/bash) — skill'i kisitlama.
#                Clone atilir; --dangerously-skip-permissions yalniz o efemer clone'da gecerli.
DISCO_FLAGS=(--output-format stream-json --verbose --model "$MODEL" --max-turns "$MAX_TURNS" --permission-mode plan)
AB_FLAGS=(--output-format stream-json --verbose --model "$MODEL" --max-turns "$MAX_TURNS" --dangerously-skip-permissions)

EXECUTE=0
[ "${1:-}" = "--execute" ] && EXECUTE=1

log(){ printf '%s\n' "$*"; }
hr(){ printf '%s\n' "--------------------------------------------------------"; }
skill_hash(){ [ -d "$1" ] || { echo "MISSING"; return; }
  find "$1" -type f -exec shasum {} \; 2>/dev/null | awk '{print $1}' | sort | shasum | awk '{print $1}'; }

# -- On kosullar --------------------------------------------------------------
command -v git >/dev/null 2>&1 || { echo "HATA: git yok."; exit 1; }
command -v jq  >/dev/null 2>&1 || { echo "HATA: jq yok (kanit parser icin gerekli)."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "HATA: node yok (mutations icin gerekli)."; exit 1; }
CLAUDE_WARN=""; CLAUDE_VER="(bilinmiyor)"
if command -v claude >/dev/null 2>&1; then CLAUDE_VER="$(claude --version 2>/dev/null || echo '?')"
else
  [ "$EXECUTE" -eq 1 ] && { echo "HATA: claude CLI PATH'te yok (--execute icin gerekli)."; exit 1; }
  CLAUDE_WARN="UYARI: claude CLI su an PATH'te yok — --execute'ten once gerekli."
fi
export DISABLE_AUTOUPDATER=1   # deney boyunca claude oto-guncelleme kapali

[ -e "$GLOBAL_BACKUP" ]    && { echo "HATA: skill backup hedefi dolu: $GLOBAL_BACKUP — onceki test yarim kalmis olabilir."; exit 1; }
[ -e "$GLOBAL_MD_BACKUP" ] && { echo "HATA: CLAUDE.md backup hedefi dolu: $GLOBAL_MD_BACKUP — elle kontrol et."; exit 1; }

GLOBAL_PRESENT=0; [ -d "$GLOBAL_SKILL" ] && GLOBAL_PRESENT=1
HASH_BEFORE="$(skill_hash "$GLOBAL_SKILL")"

# user-level CLAUDE.md kontaminasyonu (N1/A/B'yi kirletir)
GLOBAL_MD_DIRTY=0
if [ -f "$GLOBAL_MD" ] && grep -qi "kolayseo" "$GLOBAL_MD"; then GLOBAL_MD_DIRTY=1; fi

# hangi kosullar
case "$ONLY" in
  P1|N1|A|B|ALL) ;;
  *) echo "HATA: ONLY gecersiz ($ONLY) — P1|N1|A|B|ALL"; exit 1;;
esac
RUN_P1=0; RUN_N1=0; RUN_A=0; RUN_B=0
[ "$ONLY" = "ALL" ] && { RUN_P1=1; RUN_N1=1; RUN_A=1; RUN_B=1; }
[ "$ONLY" = "P1" ] && RUN_P1=1
[ "$ONLY" = "N1" ] && RUN_N1=1
[ "$ONLY" = "A" ]  && RUN_A=1
[ "$ONLY" = "B" ]  && RUN_B=1
NEED_POINTER_OFF=$(( RUN_N1 + RUN_A + RUN_B ))

# -- DRY-RUN ------------------------------------------------------------------
if [ "$EXECUTE" -eq 0 ]; then
  a_runs=0; b_runs=0
  [ "$RUN_A" -eq 1 ] && a_runs=$AB_REPEATS
  [ "$RUN_B" -eq 1 ] && b_runs=$AB_REPEATS
  total=$(( RUN_P1 + RUN_N1 + a_runs + b_runs ))
  cat <<EOF
--------------------------------------------------------
KolaySEO harness v1.1 — DRY-RUN (hicbir sey degistirilmedi)
--------------------------------------------------------
${CLAUDE_WARN}
REPO_ROOT        : $REPO_ROOT
claude version   : $CLAUDE_VER   (DISABLE_AUTOUPDATER=1)
ONLY / AB_MODE   : $ONLY / $AB_MODE      A/B tekrar: $AB_REPEATS
Kosacak          : P1=$RUN_P1 N1=$RUN_N1 A=$RUN_A B=$RUN_B  → toplam $total claude kosusu
Global skill     : $GLOBAL_SKILL  (mevcut: $([ $GLOBAL_PRESENT -eq 1 ] && echo EVET || echo HAYIR))
  → gecici tasinir: $GLOBAL_BACKUP
  → integrity hash : ${HASH_BEFORE:-<yok>}
Global CLAUDE.md : $GLOBAL_MD  (kolayseo iceriyor mu: $([ $GLOBAL_MD_DIRTY -eq 1 ] && echo 'EVET → KIRLI' || echo 'hayir → temiz'))
Cikti dizini     : $OUT_DIR/  (*.jsonl, *.err, *.claudemd.diff, evidence.tsv, env.txt, ground-truth.json)
Mutasyon suite   : $MUT_SCRIPT  (10 hata, fail-closed)
DISCO flags P1/N1: ${DISCO_FLAGS[*]}
AB flags    A/B  : ${AB_FLAGS[*]}

PROMPT (tum kosullarda AYNI, "skill" kelimesi YOK):
  "$PROMPT"

Her kosul (efemer clone icinde):
  1) git clone --quiet <repo> <tmp>       (yalniz committed HEAD)
  2) pointer OFF ise: clone CLAUDE.md'den SEO/GEO blogu silinir + ASSERT (kolayseo kalirsa FATAL)
  3) repo skill OFF ise (A): rm -rf <tmp>/.claude/skills/kolayseo
  4) A/B + AB_MODE=mutated: node mutations.mjs <tmp>  → 10 bilinen SEO hatasi + ground-truth
  5) run: (cd <tmp> && claude -p PROMPT FLAGS) > results/<tag>.jsonl
  6) kanit (jq ile, 3 seviye) + resolved-model cikarilir; <tmp> silinir

FAIL-CLOSED noktalari:
  • Global CLAUDE.md KIRLI + (N1/A/B kosacak) + NEUTRALIZE_GLOBAL_MD!=1  → BASLAMAZ
    (NEUTRALIZE_GLOBAL_MD=1: global CLAUDE.md yedeklenir, kolayseo satirlari cikarilir, trap ile geri alinir)
  • pointer silme sonrasi clone CLAUDE.md'de hala 'kolayseo' varsa            → FATAL
  • mutasyon anchor'i beklenen sayida degilse (repo degismis)                 → FATAL

Kanit (jq — 'kullandim' demesi TEK BASINA yetmez):
  [strong-1] tool_use event: name/input icinde Skill veya kolayseo
  [strong-2] Read tool_use file_path icinde .claude/skills/kolayseo
  [weak]     final metin KolaySEO kural-terimlerine benziyor
  (harness ayrica gorulen DISTINCT tool_use adlarini dokum eder → invocation semasi ogrenilir)

GUVENLIK: yalniz $GLOBAL_SKILL (+ kirliyse $GLOBAL_MD) tasinir. Auth/diger skill'ler dokunulmaz.
          trap EXIT/INT/TERM → restore; post-run skill-hash == pre-run dogrulanir.
--------------------------------------------------------
Calistir:  bash tests/kolayseo/run-tests.sh --execute
Smoke   :  ONLY=P1 bash tests/kolayseo/run-tests.sh --execute
Kirli md :  NEUTRALIZE_GLOBAL_MD=1 ONLY=N1 bash tests/kolayseo/run-tests.sh --execute
EOF
  exit 0
fi

# -- EXECUTE ------------------------------------------------------------------
mkdir -p "$OUT_DIR"
{ echo "claude_version: $CLAUDE_VER"; echo "node: $(node --version)"; echo "git_head: $(git -C "$REPO_ROOT" rev-parse --short HEAD)";
  echo "model_alias: $MODEL"; echo "only: $ONLY"; echo "ab_mode: $AB_MODE"; echo "ab_repeats: $AB_REPEATS"; } > "$OUT_DIR/env.txt"

MD_NEUTRALIZED=0
restore_all(){
  local rc=$?
  [ "$MD_NEUTRALIZED" -eq 1 ] && [ -f "$GLOBAL_MD_BACKUP" ] && mv "$GLOBAL_MD_BACKUP" "$GLOBAL_MD" && log "[restore] global CLAUDE.md geri alindi."
  if [ -d "$GLOBAL_BACKUP" ] && [ ! -e "$GLOBAL_SKILL" ]; then mv "$GLOBAL_BACKUP" "$GLOBAL_SKILL" && log "[restore] global skill geri alindi."; fi
  local h; h="$(skill_hash "$GLOBAL_SKILL")"
  [ "$h" = "$HASH_BEFORE" ] && log "[integrity] OK — global skill AYNI ($h)" \
                            || log "[integrity] !!! UYARI — global skill hash DEGISTI (oncesi=$HASH_BEFORE sonrasi=$h). ELLE KONTROL ET."
  exit $rc
}
trap restore_all EXIT INT TERM

# global CLAUDE.md kontaminasyonu
if [ "$GLOBAL_MD_DIRTY" -eq 1 ] && [ "$NEED_POINTER_OFF" -ge 1 ]; then
  if [ "$NEUTRALIZE_GLOBAL_MD" -eq 1 ]; then
    cp "$GLOBAL_MD" "$GLOBAL_MD_BACKUP"
    grep -vi "kolayseo" "$GLOBAL_MD_BACKUP" > "$GLOBAL_MD"
    MD_NEUTRALIZED=1
    log "[setup] global CLAUDE.md neutralize edildi (kolayseo satirlari cikarildi; trap ile geri)."
  else
    echo "FAIL-CLOSED: $GLOBAL_MD 'kolayseo' iceriyor → N1/A/B kirlenir."
    echo "  Ya ONLY=P1 kosun, ya NEUTRALIZE_GLOBAL_MD=1 verin."
    exit 1
  fi
fi

if [ "$GLOBAL_PRESENT" -eq 1 ]; then
  mv "$GLOBAL_SKILL" "$GLOBAL_BACKUP"; log "[setup] global kolayseo devre disi: $GLOBAL_SKILL → $GLOBAL_BACKUP"
fi

strip_pointer(){ # SEO/GEO blogunu sil (sonraki '## ' basligina kadar) + FAIL-CLOSED assert
  local f="$1" tag="$2"
  cp "$f" "$OUT_DIR/$tag.claudemd.before"
  awk 'BEGIN{skip=0}
       /^## SEO \/ GEO politika/{skip=1; next}
       skip==1 && /^## /{skip=0}
       skip==0{print}' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  diff "$OUT_DIR/$tag.claudemd.before" "$f" > "$OUT_DIR/$tag.claudemd.diff" || true
  rm -f "$OUT_DIR/$tag.claudemd.before"
  if grep -qi "kolayseo" "$f"; then
    echo "FATAL ($tag): pointer silindi ama CLAUDE.md'de hala 'kolayseo' var — deney kirli, DURDU."; exit 1
  fi
}

evidence(){ # $1=jsonl $2=tag → kanit satiri + model
  local j="$1" tag="$2"
  local model tools skillhit readhit
  model="$(jq -rs '[.[] | (.model // .message.model // .session.model // empty)] | first // "?"' "$j" 2>/dev/null || echo '?')"
  # distinct tool_use adlari (invocation semasi ogrenme)
  tools="$(jq -rc '.message.content[]? | select(.type=="tool_use") | .name' "$j" 2>/dev/null | sort -u | paste -sd, - 2>/dev/null || echo '')"
  # strong-1: tool_use name/input icinde Skill|kolayseo
  skillhit="$(jq -rc '.message.content[]? | select(.type=="tool_use") | [.name, (.input|tostring)] | @tsv' "$j" 2>/dev/null | grep -ciE 'skill|kolayseo' || true)"
  # strong-2: Read file_path icinde kolayseo
  readhit="$(jq -rc '.message.content[]? | select(.type=="tool_use" and .name=="Read") | .input.file_path? // empty' "$j" 2>/dev/null | grep -c 'kolayseo' || true)"
  printf '%s\tmodel=%s\ttools=[%s]\tstrong1=%s\tstrong2=%s\n' "$tag" "$model" "$tools" "${skillhit:-0}" "${readhit:-0}" >> "$OUT_DIR/evidence.tsv"
}

run_one(){ # $1=tag $2=pointer(on|off) $3=repo_skill(on|off) $4=mutate(0|1) $5=profile(disco|ab)
  local tag="$1" pointer="$2" repo_skill="$3" mutate="$4" profile="$5"
  local base clone; base="$(mktemp -d)"; clone="$base/projedar"
  git clone --quiet "$REPO_ROOT" "$clone"
  [ "$pointer" = "off" ] && strip_pointer "$clone/CLAUDE.md" "$tag"
  [ "$repo_skill" = "off" ] && rm -rf "$clone/.claude/skills/kolayseo"
  if [ "$mutate" -eq 1 ]; then
    node "$MUT_SCRIPT" "$clone" > "$OUT_DIR/ground-truth.json" 2> "$OUT_DIR/$tag.mut.err" \
      || { echo "FATAL ($tag): mutations.mjs basarisiz (bkz $OUT_DIR/$tag.mut.err)"; exit 1; }
  fi
  local jsonl="$OUT_DIR/$tag.jsonl"
  log "[run] $tag (pointer=$pointer skill=$repo_skill mutate=$mutate profile=$profile) → $jsonl"
  if [ "$profile" = "ab" ]; then
    ( cd "$clone" && claude -p "$PROMPT" "${AB_FLAGS[@]}" )    > "$jsonl" 2> "$OUT_DIR/$tag.err" || log "[run] $tag NON-ZERO (bkz $tag.err)"
  else
    ( cd "$clone" && claude -p "$PROMPT" "${DISCO_FLAGS[@]}" ) > "$jsonl" 2> "$OUT_DIR/$tag.err" || log "[run] $tag NON-ZERO (bkz $tag.err)"
  fi
  evidence "$jsonl" "$tag"
  rm -rf "$base"
}

: > "$OUT_DIR/evidence.tsv"
AB_MUT=0; [ "$AB_MODE" = "mutated" ] && AB_MUT=1
[ "$RUN_P1" -eq 1 ] && run_one "P1" on  on  0 disco
[ "$RUN_N1" -eq 1 ] && run_one "N1" off on  0 disco
if [ "$RUN_A" -eq 1 ]; then i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "A-$i" off off "$AB_MUT" ab; i=$((i+1)); done; fi
if [ "$RUN_B" -eq 1 ]; then i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "B-$i" off on  "$AB_MUT" ab; i=$((i+1)); done; fi

hr; log "Bitti. Kanit ozeti:"; column -t -s "$(printf '\t')" "$OUT_DIR/evidence.tsv" 2>/dev/null || cat "$OUT_DIR/evidence.tsv"
hr; log "A/B skorlama: ground-truth.json + rubric.md (manuel/judge). env: $OUT_DIR/env.txt"
