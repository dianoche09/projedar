#!/usr/bin/env bash
#
# KolaySEO kabul-testi harness v1.2 — kosullar: P1 / N1 / A / B-native / B-forced
# Amac: KolaySEO (1) tasinabilir, (2) native discoverable, (3) faydali mi?
#
# | Kosul     | Global skill | Repo skill | proj pointer | Mutasyon | Amac                       |
# | --------- | ------------ | ---------- | ------------ | -------- | -------------------------- |
# | P1        | yok          | var        | var          | yok      | Tasinabilirlik             |
# | N1        | yok          | var        | yok          | yok      | Native discovery           |
# | A         | yok          | yok        | yok          | var*     | Kontrol grubu              |
# | B-native  | yok          | var        | yok          | var*     | Skill katkisi (oto-kesif)  |
# | B-forced  | yok          | var        | strip+akt.   | var*     | Skill KALITESI (yalniz SKILL.md okut) |
# (*AB_MODE=mutated: her clone'a 10 GIZLI SEO hatasi enjekte. B-native<->B-forced farki = discovery.)
# (B-forced: SEO/GEO CLAUDE.md blogu STRIP edilir + tek satir aktivasyon → CLAUDE.md kurallari karismaz.)
#
# A / B-native / B-forced: AYNI prompt/model/max-turns/mutasyon. --bare YOK.
#
# IZOLASYON (v1.2): clone'dan tests/kolayseo silinir (ground-truth sizmasin); global skill
# ~/.claude DISINA tasinir (find ~/.claude bulamasin); A/B read-only tool whitelist (skip-perms YOK).
# Tam OS-sandbox (temp HOME) ileri is — bkz README.
#
# Varsayilan DRY-RUN. Calistir: --execute   Tek kosul: ONLY=P1|N1|A|BNATIVE|BFORCED
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GLOBAL_SKILL="${GLOBAL_SKILL:-$HOME/.claude/skills/kolayseo}"
GLOBAL_BACKUP="${GLOBAL_BACKUP:-${TMPDIR:-/tmp}/kolayseo_test_backup}"   # ~/.claude DISINDA
GLOBAL_MD="${GLOBAL_MD:-$HOME/.claude/CLAUDE.md}"
GLOBAL_MD_BACKUP="${GLOBAL_MD_BACKUP:-${TMPDIR:-/tmp}/kolayseo_md_backup}"
MODEL="${MODEL:-sonnet}"
MAX_TURNS="${MAX_TURNS:-30}"
AB_REPEATS="${AB_REPEATS:-3}"
ONLY="${ONLY:-ALL}"
AB_MODE="${AB_MODE:-mutated}"
NEUTRALIZE_GLOBAL_MD="${NEUTRALIZE_GLOBAL_MD:-0}"
OUT_DIR="$REPO_ROOT/tests/kolayseo/results"
MUT_SCRIPT="$REPO_ROOT/tests/kolayseo/mutations.mjs"

PROMPT="${PROMPT:-Projedarin teknik SEO yapisini read-only incele; en onemli riskleri kanitlariyla (dosya/route) raporla. Hicbir dosya degistirme, commit/push yapma.}"

# P1/N1: plan (read-only, discovery olcumu). A/B: read-only NATIVE tool whitelist (skip-perms YOK).
DISCO_FLAGS=(--output-format stream-json --verbose --model "$MODEL" --max-turns "$MAX_TURNS" --permission-mode plan)
AB_FLAGS=(--output-format stream-json --verbose --model "$MODEL" --max-turns "$MAX_TURNS" --permission-mode default --allowedTools "Read,Glob,Grep,LS")

EXECUTE=0
[ "${1:-}" = "--execute" ] && EXECUTE=1

log(){ printf '%s\n' "$*"; }
hr(){ printf '%s\n' "--------------------------------------------------------"; }
skill_hash(){ [ -d "$1" ] || { echo "MISSING"; return; }
  find "$1" -type f -exec shasum {} \; 2>/dev/null | awk '{print $1}' | sort | shasum | awk '{print $1}'; }

command -v git  >/dev/null 2>&1 || { echo "HATA: git yok."; exit 1; }
command -v jq   >/dev/null 2>&1 || { echo "HATA: jq yok."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "HATA: node yok."; exit 1; }
CLAUDE_WARN=""; CLAUDE_VER="(bilinmiyor)"
if command -v claude >/dev/null 2>&1; then CLAUDE_VER="$(claude --version 2>/dev/null || echo '?')"
else [ "$EXECUTE" -eq 1 ] && { echo "HATA: claude CLI yok (--execute icin gerekli)."; exit 1; }
     CLAUDE_WARN="UYARI: claude CLI su an PATH'te yok — --execute'ten once gerekli."; fi
export DISABLE_AUTOUPDATER=1

[ -e "$GLOBAL_BACKUP" ]    && { echo "HATA: skill backup dolu: $GLOBAL_BACKUP — onceki test yarim. Elle geri tasi."; exit 1; }
[ -e "$GLOBAL_MD_BACKUP" ] && { echo "HATA: md backup dolu: $GLOBAL_MD_BACKUP — elle kontrol."; exit 1; }

GLOBAL_PRESENT=0; [ -d "$GLOBAL_SKILL" ] && GLOBAL_PRESENT=1
HASH_BEFORE="$(skill_hash "$GLOBAL_SKILL")"
GLOBAL_MD_DIRTY=0
if [ -f "$GLOBAL_MD" ] && grep -qi "kolayseo" "$GLOBAL_MD"; then GLOBAL_MD_DIRTY=1; fi

case "$ONLY" in P1|N1|A|BNATIVE|BFORCED|ALL) ;; *) echo "HATA: ONLY gecersiz ($ONLY)"; exit 1;; esac
RP1=0 RN1=0 RA=0 RBN=0 RBF=0
[ "$ONLY" = "ALL" ] && { RP1=1 RN1=1 RA=1 RBN=1 RBF=1; }
[ "$ONLY" = "P1" ] && RP1=1; [ "$ONLY" = "N1" ] && RN1=1; [ "$ONLY" = "A" ] && RA=1
[ "$ONLY" = "BNATIVE" ] && RBN=1; [ "$ONLY" = "BFORCED" ] && RBF=1
NEED_POINTER_OFF=$(( RN1 + RA + RBN ))   # B-forced pointer'i KORUR

if [ "$EXECUTE" -eq 0 ]; then
  ar=0; bn=0; bf=0
  [ "$RA" -eq 1 ] && ar=$AB_REPEATS; [ "$RBN" -eq 1 ] && bn=$AB_REPEATS; [ "$RBF" -eq 1 ] && bf=$AB_REPEATS
  total=$(( RP1 + RN1 + ar + bn + bf ))
  cat <<EOF
--------------------------------------------------------
KolaySEO harness v1.2 — DRY-RUN (hicbir sey degistirilmedi)
--------------------------------------------------------
${CLAUDE_WARN}
REPO_ROOT      : $REPO_ROOT
claude version : $CLAUDE_VER   (DISABLE_AUTOUPDATER=1)
ONLY / AB_MODE : $ONLY / $AB_MODE      A/B tekrar: $AB_REPEATS
Kosacak        : P1=$RP1 N1=$RN1 A=$RA Bnative=$RBN Bforced=$RBF  → toplam $total claude kosusu
Global skill   : $GLOBAL_SKILL  (mevcut: $([ $GLOBAL_PRESENT -eq 1 ] && echo EVET || echo HAYIR))
  → tasinir    : $GLOBAL_BACKUP   (~/.claude DISINDA — find ~/.claude bulamaz)
  → hash       : ${HASH_BEFORE:-<yok>}
Global CLAUDE.md kolayseo iceriyor mu: $([ $GLOBAL_MD_DIRTY -eq 1 ] && echo 'EVET → KIRLI' || echo 'hayir → temiz')
Cikti          : $OUT_DIR/
Mutasyon suite : $MUT_SCRIPT  (10 GIZLI hata, marker YOK, fail-closed + kontaminasyon-tarama)
DISCO (P1/N1)  : ${DISCO_FLAGS[*]}
A/B flags      : ${AB_FLAGS[*]}     ← skip-permissions YOK; read-only native whitelist

PROMPT (tum kosullarda AYNI, "skill" kelimesi YOK):
  "$PROMPT"

Her kosul (efemer snapshot):
  1) git archive HEAD | tar -x   → committed HEAD, .git YOK (ana repo yolu .git/config'ten sizmaz)
  2) rm -rf <tmp>/tests/kolayseo   ← IZOLASYON (ground-truth/mutations/rubric agent'a gorunmez)
  3) pointer=off  : SEO/GEO blogu silinir + ASSERT (kolayseo kalirsa FATAL)
     pointer=forced: SEO/GEO blogu silinir + tek satir "read .claude/skills/kolayseo/SKILL.md" eklenir
  4) skill off ise (A): rm -rf <tmp>/.claude/skills/kolayseo
  5) A/B + mutated: node mutations.mjs <tmp>  → 10 gizli hata + ground-truth (marker-tarama fail-closed)
  6) SNAPSHOT-CLEAN ASSERT: .git / tests/kolayseo / ground-truth / mutations izi varsa FATAL
  7) run: (cd <tmp> && claude -p PROMPT FLAGS) > results/<tag>.jsonl ; jq kanit ; <tmp> silinir

Kosul adlari:  P1 = explicit portability (snapshot+pointer erisim)   N1 = native discovery (oto-kesif)
A/B matrisi (skill KALITESI vs DISCOVERY ayrimi):
  A        = skill yok                              (kontrol)
  B-native = skill var, pointer YOK                 (oto-kesif; discovery'ye bagli)
  B-forced = skill var, SEO/GEO blok STRIP + minimal activation (yalniz SKILL.md okut → saf skill KALITESI)
  Teshis:  B-forced−A = KolaySEO icerik degeri ; B-forced−B-native = discovery kaybi.
  Ornek: A=4.7 Bnative=7.0 Bforced=8.6 → skill degerli + ~%70-80'i oto-discovery ile tasiniyor.

FAIL-CLOSED: global md kirli+N1/A/Bnative + NEUTRALIZE!=1 → BASLAMAZ · pointer sonrasi kolayseo kalirsa
FATAL · mutasyon anchor/kontaminasyon → FATAL · backup hedefi dolu → BASLAMAZ.
GUVENLIK: trap EXIT/INT/TERM → restore; post-run skill-hash == pre-run.
--------------------------------------------------------
Calistir:  bash tests/kolayseo/run-tests.sh --execute
Smoke   :  ONLY=P1 bash tests/kolayseo/run-tests.sh --execute
EOF
  exit 0
fi

mkdir -p "$OUT_DIR"
{ echo "claude_version: $CLAUDE_VER"; echo "node: $(node --version)"; echo "git_head: $(git -C "$REPO_ROOT" rev-parse --short HEAD)";
  echo "model_alias: $MODEL"; echo "only: $ONLY"; echo "ab_mode: $AB_MODE"; echo "ab_repeats: $AB_REPEATS"; } > "$OUT_DIR/env.txt"

MD_NEUTRALIZED=0
restore_all(){
  local rc=$?
  [ "$MD_NEUTRALIZED" -eq 1 ] && [ -f "$GLOBAL_MD_BACKUP" ] && mv "$GLOBAL_MD_BACKUP" "$GLOBAL_MD" && log "[restore] global CLAUDE.md geri."
  if [ -d "$GLOBAL_BACKUP" ] && [ ! -e "$GLOBAL_SKILL" ]; then mv "$GLOBAL_BACKUP" "$GLOBAL_SKILL" && log "[restore] global skill geri."; fi
  local h; h="$(skill_hash "$GLOBAL_SKILL")"
  [ "$h" = "$HASH_BEFORE" ] && log "[integrity] OK ($h)" || log "[integrity] !!! UYARI hash DEGISTI (oncesi=$HASH_BEFORE sonrasi=$h) — ELLE KONTROL."
  exit $rc
}
trap restore_all EXIT INT TERM

if [ "$GLOBAL_MD_DIRTY" -eq 1 ] && [ "$NEED_POINTER_OFF" -ge 1 ]; then
  if [ "$NEUTRALIZE_GLOBAL_MD" -eq 1 ]; then
    cp "$GLOBAL_MD" "$GLOBAL_MD_BACKUP"; grep -vi "kolayseo" "$GLOBAL_MD_BACKUP" > "$GLOBAL_MD"; MD_NEUTRALIZED=1
    log "[setup] global CLAUDE.md neutralize (trap ile geri)."
  else echo "FAIL-CLOSED: $GLOBAL_MD 'kolayseo' iceriyor → N1/A/Bnative kirlenir. ONLY=P1/BFORCED kosun ya NEUTRALIZE_GLOBAL_MD=1."; exit 1; fi
fi

if [ "$GLOBAL_PRESENT" -eq 1 ]; then mv "$GLOBAL_SKILL" "$GLOBAL_BACKUP"; log "[setup] global kolayseo → $GLOBAL_BACKUP (~/.claude disi)"; fi

strip_pointer(){ local f="$1" tag="$2"
  cp "$f" "$OUT_DIR/$tag.claudemd.before"
  awk 'BEGIN{skip=0} /^## SEO \/ GEO politika/{skip=1;next} skip==1 && /^## /{skip=0} skip==0{print}' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  diff "$OUT_DIR/$tag.claudemd.before" "$f" > "$OUT_DIR/$tag.claudemd.diff" || true; rm -f "$OUT_DIR/$tag.claudemd.before"
  grep -qi "kolayseo" "$f" && { echo "FATAL ($tag): CLAUDE.md'de hala 'kolayseo' — deney kirli."; exit 1; } || true
}

evidence(){ local j="$1" tag="$2" model tools nse sfr sem
  model="$(jq -rs '[.[] | (.model // .message.model // .session.model // empty)] | first // "?"' "$j" 2>/dev/null || echo '?')"
  tools="$(jq -rc '.message.content[]? | select(.type=="tool_use") | .name' "$j" 2>/dev/null | sort -u | paste -sd, - 2>/dev/null || echo '')"
  # native_skill_event: YALNIZ kolayseo Skill-invocation (rakip skill'ler SAYILMAZ — geo-technical vb.).
  local skills_seen
  skills_seen="$(jq -rc '.message.content[]? | select(.type=="tool_use" and (.name|ascii_downcase=="skill")) | (.input.skill? // (.input|tostring))' "$j" 2>/dev/null | sort -u | paste -sd, - 2>/dev/null || echo '')"
  nse="$(jq -rc '.message.content[]? | select(.type=="tool_use" and (.name|ascii_downcase=="skill")) | (.input.skill? // (.input|tostring))' "$j" 2>/dev/null | grep -ic kolayseo || true)"
  # skill_file_read: .claude/skills/kolayseo/... Read (bu surumde GERCEK sinyal). nse ile ayni Read'i CIFT saymaz.
  sfr="$(jq -rc '.message.content[]? | select(.type=="tool_use" and .name=="Read") | .input.file_path? // empty' "$j" 2>/dev/null | grep -c 'kolayseo' || true)"
  # semantic_match: final metin kolayseo davranisi/adi gosteriyor mu (zayif, teyit).
  sem="$(jq -rs '[.[] | select(.type=="result") | .result] | last // ""' "$j" 2>/dev/null | grep -ciE 'kolayseo|llms\.txt|answer-first|IndexNow' || true)"
  printf '%s\tmodel=%s\tkolayseo_evt=%s\tkolayseo_read=%s\tsemantic=%s\tskills_invoked=[%s]\n' "$tag" "$model" "${nse:-0}" "${sfr:-0}" "${sem:-0}" "$skills_seen" >> "$OUT_DIR/evidence.tsv"
}

run_one(){ # tag pointer(on|off|forced) repo_skill(on|off) mutate(0|1) profile(disco|ab)
  local tag="$1" pointer="$2" repo_skill="$3" mutate="$4" profile="$5"
  local base clone; base="$(mktemp -d)"; clone="$base/projedar"; mkdir -p "$clone"
  # git archive = committed HEAD, .git YOK → clone origin path'i (.git/config) test agent'ina sizmaz.
  git -C "$REPO_ROOT" archive HEAD | tar -x -C "$clone"
  rm -rf "$clone/tests/kolayseo"                                  # IZOLASYON: ground-truth/mutations gizle
  case "$pointer" in
    off)    strip_pointer "$clone/CLAUDE.md" "$tag" ;;
    forced) strip_pointer "$clone/CLAUDE.md" "$tag"   # once SEO/GEO blogunu KALDIR (CLAUDE.md kurallari karismasin)
            printf '\n## SEO gorevi aktivasyonu\nFor this SEO task, read and apply .claude/skills/kolayseo/SKILL.md before auditing.\n' >> "$clone/CLAUDE.md" ;;
  esac
  [ "$repo_skill" = "off" ] && rm -rf "$clone/.claude/skills/kolayseo"
  if [ "$mutate" -eq 1 ]; then
    node "$MUT_SCRIPT" "$clone" > "$OUT_DIR/ground-truth.json" 2> "$OUT_DIR/$tag.mut.err" \
      || { echo "FATAL ($tag): mutations basarisiz (bkz $tag.mut.err)"; exit 1; }
  fi
  # snapshot-clean assert: .git / tests/kolayseo dizini / leak DOSYASI olmamali.
  # (Not: icerik-grep DEGIL dosya-adi — skill'in 10-audit.md'si "GSC ground-truth" ibaresini
  #  legit tasir; asil risk mutations.mjs/ground-truth.json DOSYALARININ sizmasidir.)
  if [ -d "$clone/.git" ] || [ -e "$clone/tests/kolayseo" ] \
     || [ -n "$(find "$clone" \( -name 'mutations.mjs' -o -name 'ground-truth.json' \) -print -quit 2>/dev/null)" ]; then
    echo "FATAL ($tag): snapshot kirli (.git / tests/kolayseo / leak dosyasi)."; exit 1
  fi

  local jsonl="$OUT_DIR/$tag.jsonl"
  log "[run] $tag (pointer=$pointer skill=$repo_skill mutate=$mutate profile=$profile) → $jsonl"
  if [ "$profile" = "ab" ]; then
    ( cd "$clone" && claude -p "$PROMPT" "${AB_FLAGS[@]}" )    > "$jsonl" 2> "$OUT_DIR/$tag.err" || log "[run] $tag NON-ZERO"
  else
    ( cd "$clone" && claude -p "$PROMPT" "${DISCO_FLAGS[@]}" ) > "$jsonl" 2> "$OUT_DIR/$tag.err" || log "[run] $tag NON-ZERO"
  fi
  evidence "$jsonl" "$tag"; rm -rf "$base"
}

: > "$OUT_DIR/evidence.tsv"
MUT=0; [ "$AB_MODE" = "mutated" ] && MUT=1
[ "$RP1" -eq 1 ] && run_one "P1" on  on  0    disco
[ "$RN1" -eq 1 ] && run_one "N1" off on  0    disco
if [ "$RA"  -eq 1 ]; then i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "A-$i"  off off "$MUT" ab; i=$((i+1)); done; fi
if [ "$RBN" -eq 1 ]; then i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "BN-$i" off on  "$MUT" ab; i=$((i+1)); done; fi
if [ "$RBF" -eq 1 ]; then i=1; while [ "$i" -le "$AB_REPEATS" ]; do run_one "BF-$i" forced on "$MUT" ab; i=$((i+1)); done; fi

hr; log "Bitti. Kanit:"; column -t -s "$(printf '\t')" "$OUT_DIR/evidence.tsv" 2>/dev/null || cat "$OUT_DIR/evidence.tsv"
hr; log "Skorlama: ground-truth.json + rubric.md. env: $OUT_DIR/env.txt"
