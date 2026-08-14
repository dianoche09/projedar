# Projedar Domain Gate

Projedar'da gayrimenkul iş mantığını etkileyen değişiklikleri yalnız yazılım problemi olarak ele alma.
Aşağıdaki alanlardan biri etkileniyorsa **`projedar-real-estate-cdo` agent'ını proaktif kullan**
(`@projedar-real-estate-cdo` veya Agent tool ile). Agent domain otoritesidir; ana Claude implementasyonu sahiplenir.

## Kapsam (biri etkileniyorsa gate aktif)
- project / phase(etap) / block(blok) / unit(birim) / daire_tipi
- inventory / availability / freshness (tazelik, stale, `son_guncelleme`)
- pricing / campaigns / payment plans (`fiyat_gecmisi`, `dinamik-fiyat`, `odeme-plani`)
- allocation / tahsis / distribution / visibility (`tahsis`, `tahsis_toplu`, kapsam/durum)
- organization / office(ofis) / advisor(danışman) roles
- authorization / RLS / tenant boundaries / SECURITY DEFINER fonksiyonları
- buyer / customer / lead registration / lead protection (`ilk_paylasan_id`, `kim-getirdi`)
- conflict / dispute / override
- option / reservation / sale / cancellation / expiry (`opsiyon`, `opsiyon_talep`, cron)
- commission semantics (`komisyon_tip/deger`)
- documents / verification / KYC / EİDS-related behavior
- audit / events / history / provenance (`events` append-only)
- public/shareable links & information exposure (`/p/{kod}`, mikrosite, katalog, OG)
- integrations / import / export (Excel import, WhatsApp, Keşif, gelecekteki CRM/ERP)
- bulk operations · cross-panel workflows/navigation (`/uretici` · `/danisman` · `/admin`)
- operational UX / dashboard/workbench behavior · exceptions / recovery / abuse controls

## Akış (anlamlı değişiklikte)
1. **DOMAIN DESIGN REVIEW** — implementasyondan ÖNCE (MODE A). Sonucu bekle; kritik side-task değil.
2. **DOMAIN IMPLEMENTATION REVIEW** — kod değişiminden SONRA (MODE B, `git diff` + schema/RLS/API/UI/test).
3. **P0/P1 bulguları çözülmeden iş "tamam" sayılmaz.**
4. Kritik kabul edilen invariant'ları uygun katmanda **teste** çevir (`.claude/skills/projedar-domain/references/25`).
5. Yalnız kabul edilip doğrulanan kalıcı kararı domain knowledge'a işle (MODE C).

## Sınırlar
- Agent ürün kaynak kodunu YAZMAZ/DÜZENLEMEZ; yalnız domain review + kendi memory/knowledge bakımı.
- Trivial işler (typo, tek-satır, import) + "sadece yap"/"tartışma" kaçış kelimeleri gate'i kapatır.
- **Project-only (INV-SCOPE-001):** agent/skill/rules/knowledge yalnız Projedar reposunda geçerli; global `~/.claude` (agents/skills/rules/CLAUDE.md/settings/memory) veya başka repo dokunulmaz; `memory: project` dışında memory yok.
- Detay yöntem: `Skill(projedar-domain)` → `references/00-reference-index.md`.
