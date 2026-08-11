# Dinamik Fiyat Kural Motoru — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. Bu repo test-runner kullanmaz; doğrulama `npx tsc --noEmit` + `npx eslint <dosya>`. Migration'lar browser SQL Editor'den uygulanır (MCP read-only). Saf mantık `src/lib/fiyat-kurali.ts`'te izole ve tsc ile doğrulanır.

**Goal:** Müteahhitin proje kurulumunda yazdığı deterministik kuralları (süre/satış-adet/satış-yüzde/tarih → yüzde/sabit-ekle/sabit-fiyat) sistemin otomatik uygulaması veya öneri kuyruğuna düşürmesi.

**Architecture:** Saf hesap (`fiyat-kurali.ts`) + sunucu motoru (`fiyat-motor.ts`, admin client) + gecelik cron + satış-sonrası anlık tetik + kurulum kural editörü + fiyat-önerisi onay kuyruğu. Guardrail koşulsuz (opsiyonlu/satılana dokunma + taban_fiyat) + müteahhit (tavan/adım/taban).

**Tech Stack:** Next.js App Router (server actions), Supabase (Postgres + RLS), TypeScript strict, Zod, mevcut cron dispatcher (`src/app/api/cron`).

Spec: `docs/superpowers/specs/2026-08-11-dinamik-fiyat-kural-motoru-design.md`.

---

## Dosya yapısı

- Create `db/2026-08-11_dinamik-fiyat.sql` — fiyat_kurali + fiyat_kural_oneri tabloları + proje.fiyat_ayar kolonu + RLS.
- Create `src/lib/fiyat-kurali.ts` — saf tipler + `yeniFiyatHesapla` + `guardrailUygula` + `tetikDoldu` + `kapsamEsler`.
- Create `src/lib/fiyat-motor.ts` — `kurallariDegerlendir(admin, proje_id, tetikTipleri?)` (uygula/öneri).
- Modify `src/app/api/cron/_lib/isler.ts` — `fiyatKuraliCalistir()` + dispatcher kaydı (`src/app/api/cron/route.ts`).
- Modify `src/app/uretici/actions.ts` — kural CRUD + projeFiyatAyar + fiyatOneriUygula/Reddet + birimSatisKapat/birimDurumGuncelle satış-sonrası hook.
- Create `src/app/uretici/proje/[id]/FiyatKurallari.tsx` — kurulum kural editörü (client).
- Modify `src/app/uretici/proje/[id]/kurulum/page.tsx` — bölümü göster.
- Modify `src/app/uretici/fiyat-onerisi/page.tsx` — kural-öneri onay kuyruğu bölümü.
- Create `src/app/uretici/fiyat-onerisi/OneriKuyrugu.tsx` — client onay UI.

---

## Task 1: Migration

**Files:** Create `db/2026-08-11_dinamik-fiyat.sql`

- [ ] **Step 1: SQL yaz** (spec §3). `fiyat_kurali`, `fiyat_kural_oneri` tabloları + `alter table proje add column if not exists fiyat_ayar jsonb default '{}'::jsonb;` + RLS (proje sahibi uretici + is_admin; emlakçı yok). CHECK'ler: tetik/aksiyon/tekrar/durum enum'ları.
- [ ] **Step 2:** Kullanıcıya hazır blok sun (browser'dan uygula). Kod migration olmadan graceful olacak (tablo yoksa motor no-op, UI "kurallar yakında" göstermez → guard).

## Task 2: Saf hesap modülü `src/lib/fiyat-kurali.ts`

**Files:** Create `src/lib/fiyat-kurali.ts`

- [ ] **Step 1: Tipler + hesap yaz**

```ts
export type KuralTetik = "sure_gun" | "satis_adet" | "satis_yuzde" | "tarih";
export type KuralAksiyon = "yuzde" | "sabit_ekle" | "sabit_fiyat";
export type KuralTekrar = "tek" | "periyodik";

export type FiyatKurali = {
  id: string; proje_id: string; tip_id: string | null; ad: string;
  tetik: KuralTetik; esik: number; tetik_tarih: string | null;
  aksiyon: KuralAksiyon; deger: number; tekrar: KuralTekrar;
  son_uygulanan_esik: number; aktif: boolean;
};

export type FiyatAyar = {
  aktif: boolean; mod: "otomatik" | "oneri"; baz_tarih: string | null;
  tavan_pct: number | null; adim_max_pct: number | null; taban_override: number | null;
};

export const VARSAYILAN_AYAR: FiyatAyar = {
  aktif: false, mod: "oneri", baz_tarih: null,
  tavan_pct: 20, adim_max_pct: 5, taban_override: null,
};

/** Ham yeni fiyat (guardrail ÖNCESİ). liste null + yuzde/sabit_ekle → null (uygulanamaz). */
export function hamYeniFiyat(aksiyon: KuralAksiyon, deger: number, mevcut: number | null): number | null {
  if (aksiyon === "sabit_fiyat") return deger;
  if (mevcut == null) return null;
  if (aksiyon === "yuzde") return mevcut * (1 + deger / 100);
  return mevcut + deger; // sabit_ekle
}

/** Guardrail + 1000 yuvarla. taban koşulsuz alt; tavan = taban*(1+tavan_pct); adim_max tek adım |Δ%|. */
export function guardrailUygula(
  ham: number, mevcut: number | null,
  g: { taban: number | null; tavanPct: number | null; adimMaxPct: number | null },
): number {
  let y = ham;
  if (mevcut != null && g.adimMaxPct != null && mevcut > 0) {
    const dPct = ((y - mevcut) / mevcut) * 100;
    const sinir = g.adimMaxPct;
    if (dPct > sinir) y = mevcut * (1 + sinir / 100);
    if (dPct < -sinir) y = mevcut * (1 - sinir / 100);
  }
  if (g.taban != null && g.tavanPct != null) {
    const tavan = g.taban * (1 + g.tavanPct / 100);
    if (y > tavan) y = tavan;
  }
  if (g.taban != null && y < g.taban) y = g.taban;
  return Math.round(y / 1000) * 1000;
}

/** Tetik doldu mu + yeni son_uygulanan_esik. durumOzet: {satildi, toplamSatilabilir}. */
export function tetikDoldu(
  k: Pick<FiyatKurali, "tetik" | "esik" | "tetik_tarih" | "tekrar" | "son_uygulanan_esik">,
  durumOzet: { satildi: number; toplamSatilabilir: number },
  bazTarihISO: string | null, simdiISO: string,
): { tetik: boolean; yeniEsik: number } {
  const simdi = new Date(simdiISO).getTime();
  if (k.tetik === "tarih") {
    const ok = !!k.tetik_tarih && new Date(k.tetik_tarih).getTime() <= simdi && k.son_uygulanan_esik < 1;
    return { tetik: ok, yeniEsik: 1 };
  }
  let olcu = 0;
  if (k.tetik === "sure_gun") {
    const baz = bazTarihISO ? new Date(bazTarihISO).getTime() : simdi;
    olcu = Math.floor((simdi - baz) / 86_400_000);
  } else if (k.tetik === "satis_adet") {
    olcu = durumOzet.satildi;
  } else {
    olcu = durumOzet.toplamSatilabilir > 0 ? (durumOzet.satildi / durumOzet.toplamSatilabilir) * 100 : 0;
  }
  if (k.esik <= 0) return { tetik: false, yeniEsik: k.son_uygulanan_esik };
  const kat = k.tekrar === "periyodik" ? Math.floor(olcu / k.esik) : olcu >= k.esik ? 1 : 0;
  const oncekiKat = k.tekrar === "periyodik" ? Math.floor(k.son_uygulanan_esik / k.esik) : k.son_uygulanan_esik >= 1 ? 1 : 0;
  return { tetik: kat > oncekiKat, yeniEsik: k.tekrar === "periyodik" ? kat * k.esik : 1 };
}
```

- [ ] **Step 2: Doğrula** `npx tsc --noEmit` (0 hata) + `npx eslint src/lib/fiyat-kurali.ts`.
- [ ] **Step 3: Commit** `feat(fiyat-kurali): saf hesap+guardrail+tetik modulu`.

## Task 3: Motor `src/lib/fiyat-motor.ts`

**Files:** Create `src/lib/fiyat-motor.ts`

- [ ] **Step 1:** `kurallariDegerlendir(admin: SupabaseClient, proje_id: string, opts?: {tetikTipleri?: KuralTetik[]}): Promise<{uygulanan: number; oneri: number}>`.
  Akış: proje.fiyat_ayar oku (yoksa VARSAYILAN, aktif=false → çık). Aktif kuralları çek (opsiyonel tetik filtresi). Proje birimlerini çek (durum, tip_id, satilabilir, ana_birim_id, liste_fiyati, daire_tipi.taban_fiyat). durumOzet hesapla (proje geneli + tip bazlı). Her kural için `tetikDoldu`; dolduysa kapsam birimlerini (`ana_birim_id null, satilabilir, durum in musait/planli, tip eşleş`) seç, her birim için `hamYeniFiyat`→`guardrailUygula`. Mod otomatik → `birim.update(liste_fiyati, son_guncelleme)` + events(kaynak:'kural') + bildirim; mod oneri → `fiyat_kural_oneri` upsert (bekliyor) + bildirim. Kural `son_uygulanan_esik=yeniEsik`. Tablo yoksa (hata) → sessiz no-op (graceful).
- [ ] **Step 2:** tsc + eslint. **Step 3:** Commit `feat(fiyat-motor): kurallariDegerlendir uygula/oneri`.

## Task 4: Cron

**Files:** Modify `src/app/api/cron/_lib/isler.ts`, `src/app/api/cron/route.ts`

- [ ] **Step 1:** `export async function fiyatKuraliCalistir(): Promise<CronSonuc>` — admin client, aktif fiyat_ayar'lı projeleri bul, her biri için `kurallariDegerlendir` (tüm tetikler). Toplam uygulanan/öneri döndür. Hata/tablo-yok → 200 + {atlandi:true}.
- [ ] **Step 2:** Dispatcher'a ekle (freshness/stok-acilis sırasına). **Step 3:** tsc+eslint. **Step 4:** Commit `feat(cron): fiyatKuraliCalistir`.

## Task 5: Server action'lar

**Files:** Modify `src/app/uretici/actions.ts`

- [ ] **Step 1:** Zod şemalı `fiyatKuraliEkle/Guncelle/Sil(formData)` (proje sahipliği: projeSahibiMi), `projeFiyatAyar(formData)` (mod/guardrail/baz_tarih/aktif → proje.fiyat_ayar jsonb merge). `fiyatOneriUygula(formData)` (seçili `fiyat_kural_oneri` id'leri → birim.liste_fiyati yaz, durum='uygulandi'), `fiyatOneriReddet`. Tümü revalidate stok/proje/fiyat-onerisi.
- [ ] **Step 2:** `birimSatisKapat` ve `birimDurumGuncelle` (satildi yolu) sonuna: `await kurallariDegerlendir(admin, proje_id, {tetikTipleri:["satis_adet","satis_yuzde"]})` (best-effort try/catch).
- [ ] **Step 3:** tsc+eslint. **Step 4:** Commit `feat(fiyat-kurali): server actions + satis-sonrasi tetik`.

## Task 6: UI — kurulum kural editörü

**Files:** Create `src/app/uretici/proje/[id]/FiyatKurallari.tsx`; Modify `.../kurulum/page.tsx`

- [ ] **Step 1:** Client bileşen: mod toggle + guardrail alanları + baz_tarih (projeFiyatAyar form) + kural listesi + ekle formu (ad, kapsam tümü/tip, tetik+eşik/tarih, aksiyon+değer, tekrar). Aç/kapa/sil. Berrak Güven tokenları.
- [ ] **Step 2:** kurulum sayfası: fiyat_ayar + kurallar + tipler çek, bileşene ver (tablo yoksa graceful: bölüm gizli/uyarı). **Step 3:** tsc+eslint. **Step 4:** Commit `feat(kurulum): dinamik fiyat kural editoru`.

## Task 7: UI — onay kuyruğu

**Files:** Create `src/app/uretici/fiyat-onerisi/OneriKuyrugu.tsx`; Modify `fiyat-onerisi/page.tsx`

- [ ] **Step 1:** page: bekleyen `fiyat_kural_oneri` (proje+birim+eski/yeni) çek → OneriKuyrugu (toplu seç, hepsini/seçerek uygula/reddet → fiyatOneriUygula/Reddet). Mevcut heuristik bölüm altta kalır.
- [ ] **Step 2:** tsc+eslint. **Step 3:** Commit `feat(fiyat-onerisi): kural-oneri onay kuyrugu`.

## Task 8: Kapanış

- [ ] Changelog + memory güncelle. Bekleyen SQL bloklarını (bu + önceki) kullanıcıya topluca sun.

---

## Self-review
- Spec kapsamı: §3 tablolar→T1; §4-5-7 hesap/guardrail→T2; §6 motor→T3-4; §8 UI→T6-7; §9 iz/bildirim→T3; §2 akış→T5-7. Kapsandı.
- Placeholder yok (çekirdek kod T2'de tam). Tip tutarlılığı: FiyatKurali/FiyatAyar/KuralTetik her yerde aynı.
- Guardrail sırası (adım→tavan→taban→yuvarla) T2'de sabit.
