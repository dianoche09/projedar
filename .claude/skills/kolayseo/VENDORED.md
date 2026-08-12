# VENDORED — kolayseo (Claude Code native skill path)

Bu klasör, SEO/GEO kalite-politikasının **repo-içi, Claude Code native discovery kopyasıdır**.

## Source of truth
- **Kanonik kaynak:** `github.com/kolayimar/kolayseo-skill` (kendi git repo'su).
- **Pin (vendor edilen commit):** `5da65e2` (4 field lesson: route-handler farkındalığı, auth-aware
  private audit, LOW-competition≠SEO/gerçek-SERP-oku, 2026 schema gerçeği [HowTo/FAQ rich result ölü,
  llms.txt Google-CORE değil, IndexNow Google değil]).
- **Vendor tarihi:** 2026-08-12.
- **Not:** global source-of-truth `310c1ea`'da commit'li ama `github.com/kolayimar/kolayseo-skill`'e
  push edilemedi (https "repository not found" — private/auth veya taşınmış). Push kullanıcının ssh/creds'iyle.
- Global `~/.claude/skills/kolayseo/` = o repo'nun yerel bir **install**'ı, source-of-truth DEĞİL.
  Bu repo kopyası da o github repo'sundan türer.

## Neden burada (`.claude/skills/`)
Claude Code proje-level skill'leri **`.claude/skills/`**'ten yükler (dokümante native path;
mevcut skill'ler de buraya symlink'lenmiş). Global skill `~/.claude/skills/`'te + `.gitignore`'lu
olduğu için fresh clone / CI / başka geliştirici onu göremez. Bu **gerçek-dosya** kopya (symlink
değil, OS-bağımsız) her ortamda keşfedilebilirliği hedefler. `.gitignore`'da `!.claude/skills/kolayseo/`
ile track'lenir; `tsconfig` `exclude`'unda `.claude` var (template `.ts`'leri app build'ine girmesin).

## Kurallar
- **Burayı elle düzenleme.** Skill'i geliştirmek → `github.com/kolayimar/kolayseo-skill`'te (source-of-truth)
  düzenle, sonra buraya yeniden vendor et ve pin commit'i güncelle. İki kopya çatışırsa **github repo esas.**
- **Drift kontrolü:** repo kopyası ile source-of-truth HEAD'i periyodik karşılaştır (pin commit ≠ HEAD → güncelle).
- `.git`/`.gitignore` asla kopyalanmaz (kaynak kendi git repo'sudur).

## ⚠️ Portability henüz EMPİRİK kanıtlanmadı
"Fresh clone Claude Code bunu otomatik yükler" iddiası; temiz bir `git clone` + global kolayseo
erişilemez halde yeni oturum testiyle **doğrulanana kadar varsayımdır.** Native discovery'ye ek
güvence: `CLAUDE.md`'deki açık pointer ("SEO işinde `.claude/skills/kolayseo/SKILL.md` oku") her
koşulda çalışır — bu yüzden ikisi birlikte tutulur.

## İçerik
`SKILL.md` + `README.md` + `references/00-10` + `templates/` (Layer 1-6 kopya-yapıştır kod).
Secret yok — tüm anahtarlar `process.env.X` referansı (vendor öncesi tarandı).
