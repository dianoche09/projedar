# kolayseo — Portable SEO + GEO Engine (Claude Code Skill)

Kolayimar'dan çıkarılmış, niche-agnostic bir SEO/GEO skill'i. Next.js App Router
projelerine 5 katman kurar: teknik SEO, structured data, GEO (AI-search), programatik
SEO ve bir arama-istihbaratı komuta merkezi (SerpAPI + GSC + IndexNow + OpenSEO köprüsü).

## Kurulum

Başka bir makinede/ortamda gerektiğinde:

```bash
git clone git@github.com:talyaglobal/kolayseo-skill.git ~/.claude/skills/kolayseo
```

Sonra Claude Code'da `/kolayseo` yaz ya da Skill tool ile çağır.

## İçerik

- `SKILL.md` — skill tanımı, 5 katman, kurulum fazları, anti-pattern'ler
- `references/` — katman-katman uygulama rehberleri + strateji/go-to-market notları
- `templates/` — kopyala-yapıştır, niche-agnostic kod (Layer 1-3, 5 + CityLinkHub)

Detay için `SKILL.md`.

## Not

`siteConfig`-driven: tek config objesini doldurunca tüm sistem yeni markaya göre yeniden
şekillenir. Anti-pattern'ler koda gömülü (README ve `references/06`'daki uyarılara uy).
