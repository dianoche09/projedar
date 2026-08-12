# VENDORED — kolayseo

Bu klasör, global kullanıcı skill'inin **repo-içi kopyasıdır** (vendored snapshot).

- **Kaynak (source-of-truth):** `~/.claude/skills/kolayseo/`
- **Vendor tarihi:** 2026-08-12
- **Neden:** Global skill `~/.claude/skills/`'te ve `.gitignore`'lu; fresh clone / CI / başka
  geliştirici onu göremez. Bu kopya, SEO/GEO kalite-politikasının her ortamda keşfedilebilir
  (discoverable) olmasını sağlar. Discovery: repo `.agents/skills/*/SKILL.md` taranır.

## Kural
- **Burayı elle düzenleme.** Skill'i geliştirmek istersen `~/.claude/skills/kolayseo/`'da (source-of-truth)
  düzenle, sonra buraya yeniden vendor et. İki kopya çatışırsa **global esas.**
- Yeniden vendor (özet): `cp SKILL.md README.md` + `cp -R references templates` (global → bu klasör),
  `.git`/`.gitignore` HARİÇ.
- `.git` bu klasöre asla kopyalanmaz (global skill kendi git repo'sudur).

## İçerik
`SKILL.md` + `README.md` + `references/00-10` + `templates/` (Layer 1-6 kopya-yapıştır kod).
Secret yok — tüm anahtarlar `process.env.X` referansı (vendor öncesi tarandı).
