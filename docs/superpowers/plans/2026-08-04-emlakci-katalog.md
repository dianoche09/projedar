# Emlakçı Proje Kataloğu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emlakçı bir projede daireleri checkbox ile seçip, müşteriye gönderilecek kompakt "fiyat-listesi" kataloğunu (print-optimize HTML → `window.print()` PDF) üretebilsin.

**Architecture:** Proje detay sayfasına hafif bir `KatalogSecici` client bileşeni eklenir (seçim + navigasyon). Yeni bir server route `havuz/proje/[id]/katalog` seçilen birimleri RLS ile canlı çeker, kapak + kompakt daire grid + danışman kartını print-optimize basar, `YazdirButonu` ile PDF'e döker. Fiyat `birim` tablosundan canlı basılır (tek-doğru-kaynak). Migration yok.

**Tech Stack:** Next.js App Router (server + client components), Supabase (RLS, server client), Tailwind (`print:` variants + mevcut `@media print`), mevcut `sharing.ts` / `events.ts` / `gorsel.ts` / `types.ts` yardımcıları.

---

## Test Yaklaşımı (ÖNEMLİ — oku)

Bu projede otomatik test altyapısı YOK (`package.json`'da test script yok; jest/vitest kurulu değil). Design doc kararı: unit test eklenmez. Bu plan **TDD yerine** her task'ta şu döngüyü kullanır: **kod → `npx eslint <dosya>` (0 error) → gerekiyorsa `npm run build` → commit.** Print çıktısı deploy sonrası elle doğrulanır (A4). Bu, global CLAUDE.md'nin web tarafı kuralıyla uyumludur ("type-check:changed + lint; full test zorunlu değil").

Her commit sonrası global kural gereği changelog memory güncellenir (son task'ta topluca; ara task'larda zorunlu değil).

---

## Dosya Haritası

- **Create:** `src/components/YazdirButonu.tsx` — genel print butonu (client, `window.print`).
- **Modify:** `src/lib/events.ts` — `OlayTip` union'a `"katalog"` ekle.
- **Create:** `src/app/havuz/proje/[id]/KatalogSecici.tsx` — client seçim bileşeni.
- **Modify:** `src/app/havuz/proje/[id]/page.tsx` — `KatalogSecici`'yi müsait+satılabilir birimlerle render et.
- **Create:** `src/app/havuz/proje/[id]/katalog/page.tsx` — server katalog route (veri + render + event).

globals.css'e DOKUNULMAZ (mevcut `@media print` + Tailwind `break-inside-avoid` yeterli).

---

## Task 1: `OlayTip`'e `katalog` ekle

**Files:**
- Modify: `src/lib/events.ts:8-18`

- [ ] **Step 1: `OlayTip` union'una `katalog` ekle**

`src/lib/events.ts` içinde `favori` satırından önce yeni satır ekle (satır 18 civarı). Sonuç:

```ts
export type OlayTip =
  | "opsiyon"
  | "satis"
  | "durum"
  | "paylasim"
  | "goruntuleme"
  | "lead"
  | "onay" // admin: hesap onay/red/durum
  | "dogrulama" // admin: üretici güven rozeti
  | "abonelik" // admin: paket atama
  | "katalog" // emlakçı: müşteri kataloğu üretti (proje + birim listesi payload)
  | "favori"; // mikrosite: müşteri favoriledi (anonim sinyal)
```

`events.tip` DB'de `text` (CHECK constraint yok, `supabase-schema.sql:209`) → migration gerekmez.

- [ ] **Step 2: Lint**

Run: `npx eslint src/lib/events.ts`
Expected: 0 error.

- [ ] **Step 3: Commit**

```bash
git add src/lib/events.ts
git commit -m "feat(events): katalog olay tipi ekle"
```

---

## Task 2: Genel `YazdirButonu` bileşeni

**Files:**
- Create: `src/components/YazdirButonu.tsx`

Not: Mikrosite'nin kendi lokal `YazdirButonu`'na (`src/app/p/.../YazdirButonu.tsx`) DOKUNULMAZ (riski önlemek için). Bu genel kopya katalog route'u için kullanılır.

- [ ] **Step 1: Bileşeni oluştur**

`src/components/YazdirButonu.tsx`:

```tsx
"use client";

/** Genel "PDF / Yazdır" butonu — print-optimize sayfayı tarayıcı yazdırmasıyla PDF'e döker.
 *  Ayrı PDF motoru yok: canlı veri, tek doğru kaynak. print:hidden ile baskıda görünmez. */
export function YazdirButonu({ etiket = "PDF / Yazdır" }: { etiket?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-1.5 rounded-lg border border-hair bg-card px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-paper"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" rx="1" />
      </svg>
      {etiket}
    </button>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/components/YazdirButonu.tsx`
Expected: 0 error.

- [ ] **Step 3: Commit**

```bash
git add src/components/YazdirButonu.tsx
git commit -m "feat(ui): genel YazdirButonu bileşeni (katalog/print icin)"
```

---

## Task 3: `KatalogSecici` client bileşeni

**Files:**
- Create: `src/app/havuz/proje/[id]/KatalogSecici.tsx`

- [ ] **Step 1: Bileşeni oluştur**

`src/app/havuz/proje/[id]/KatalogSecici.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type SeciBirim = {
  id: string;
  daire_no: string | null;
  oda: string | null;
  kat: number | null;
  net_m2: number | null;
  liste_fiyati: number | null;
  para_birimi: string | null;
};

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

/**
 * Müşteri kataloğu için daire seçimi — proje detay sayfasında. Checkbox ile seç,
 * "Katalog oluştur" → /havuz/proje/[id]/katalog?b=... server route'u açılır (canlı katalog).
 * EmlakciStok'a dokunmaz (izole seçim katmanı).
 */
export function KatalogSecici({ projeId, birimler }: { projeId: string; birimler: SeciBirim[] }) {
  const router = useRouter();
  const [secili, setSecili] = useState<Set<string>>(new Set());

  if (birimler.length === 0) return null;

  const tumu = secili.size === birimler.length;

  const toggle = (id: string) =>
    setSecili((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleTumu = () => setSecili(tumu ? new Set() : new Set(birimler.map((b) => b.id)));

  const olustur = () => {
    if (secili.size === 0) return;
    router.push(`/havuz/proje/${projeId}/katalog?b=${[...secili].join(",")}`);
  };

  return (
    <div className="kart mt-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Müşteri Kataloğu</h2>
          <p className="mt-0.5 text-[13px] text-gray">
            Daire seç, tek sayfa katalog üret, müşterine gönder. Fiyat canlı basılır.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleTumu}
          className="mono flex-none text-[11px] font-bold uppercase tracking-[0.08em] text-teal-d hover:text-teal"
        >
          {tumu ? "Seçimi kaldır" : "Tümünü seç"}
        </button>
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-hair">
        {birimler.map((b) => {
          const psim = PARA_SIMGE[b.para_birimi ?? "TRY"] ?? "₺";
          return (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-3 border-b border-hair px-3.5 py-2.5 last:border-b-0 hover:bg-soft"
            >
              <input
                type="checkbox"
                checked={secili.has(b.id)}
                onChange={() => toggle(b.id)}
                className="size-4 flex-none rounded border-hair text-teal focus:ring-0 focus:ring-offset-0"
              />
              <span className="mono w-14 flex-none font-semibold text-ink">{b.daire_no ?? "—"}</span>
              <span className="flex-1 truncate text-[12.5px] text-ink-soft">
                {b.oda ?? "—"}
                {b.kat != null ? ` · K${b.kat}` : ""}
                {b.net_m2 ? ` · ${b.net_m2}m²` : ""}
              </span>
              <span className="mono flex-none text-[12.5px] font-semibold text-ink">
                {b.liste_fiyati ? `${fmt(Number(b.liste_fiyati))} ${psim}` : "—"}
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={olustur}
        disabled={secili.size === 0}
        className="btn-action mt-4 w-full disabled:opacity-50"
      >
        Katalog oluştur{secili.size > 0 ? ` (${secili.size} daire)` : ""}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint "src/app/havuz/proje/[id]/KatalogSecici.tsx"`
Expected: 0 error.

- [ ] **Step 3: Commit**

```bash
git add "src/app/havuz/proje/[id]/KatalogSecici.tsx"
git commit -m "feat(katalog): KatalogSecici daire secim bileseni"
```

---

## Task 4: Proje detay sayfasına `KatalogSecici` entegrasyonu

**Files:**
- Modify: `src/app/havuz/proje/[id]/page.tsx` (import + türetme + render)

- [ ] **Step 1: Import ekle**

`src/app/havuz/proje/[id]/page.tsx` üstündeki import bloğuna (satır 11 civarı, `okuOzellikler` import'undan sonra) ekle:

```ts
import { KatalogSecici, type SeciBirim } from "./KatalogSecici";
```

- [ ] **Step 2: Katalog birim listesini türet**

Aynı dosyada `shareUrlMap` tanımından sonra (satır 131'den sonra) ekle:

```ts
// Katalog seçimi için müsait + satılabilir ana daireler (eklentiler hariç). Oda tipten çözülür.
const tipOdaMap = new Map(tipListe.map((t) => [t.id, t.oda]));
const katalogBirimler: SeciBirim[] = stok
  .filter((b) => b.durum === "musait" && b.satilabilir && b.ana_birim_id == null)
  .map((b) => ({
    id: b.id as string,
    daire_no: (b.daire_no as string | null) ?? null,
    oda: b.tip_id ? tipOdaMap.get(b.tip_id as string) ?? null : null,
    kat: (b.kat as number | null) ?? null,
    net_m2: (b.net_m2 as number | null) ?? null,
    liste_fiyati: (b.liste_fiyati as number | null) ?? null,
    para_birimi: (b.para_birimi as string | null) ?? null,
  }));
```

- [ ] **Step 3: `KatalogSecici`'yi render et**

Aynı dosyada "FİYAT LİSTESİ · CANLI STOK" bölümünün (`<div className="mt-8">`, satır 472 civarı) HEMEN ÖNCESİNE ekle:

```tsx
{/* ===== MÜŞTERİ KATALOĞU (seçmeli) ===== */}
{katalogBirimler.length > 0 ? <KatalogSecici projeId={id} birimler={katalogBirimler} /> : null}
```

- [ ] **Step 4: Lint**

Run: `npx eslint "src/app/havuz/proje/[id]/page.tsx"`
Expected: 0 error (mevcut `<img>` warning'leri kabul; yeni error yok).

- [ ] **Step 5: Commit**

```bash
git add "src/app/havuz/proje/[id]/page.tsx"
git commit -m "feat(katalog): proje detayda KatalogSecici goster"
```

---

## Task 5: Katalog server route (veri + render + event)

**Files:**
- Create: `src/app/havuz/proje/[id]/katalog/page.tsx`

- [ ] **Step 1: Route'u oluştur**

`src/app/havuz/proje/[id]/katalog/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { generateShareToken } from "@/lib/sharing";
import { kayitYaz } from "@/lib/events";
import { projeKapak } from "@/lib/gorsel";
import { ASAMA_ETIKET, DURUM_ETIKET, DURUM_BG, fmtPara, type InsaatAsama, type BirimDurum } from "@/lib/types";
import { YazdirButonu } from "@/components/YazdirButonu";

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };

type OdemePlani = { pesinat_pct?: number | null; taksit_sayisi?: number | null } | null;

/** Kompakt ödeme özeti: "Peşinat %20 · 36 ay". Yoksa null. */
function odemeOzet(op: OdemePlani): string | null {
  if (!op) return null;
  const par: string[] = [];
  if (op.pesinat_pct != null) par.push(`Peşinat %${op.pesinat_pct}`);
  if (op.taksit_sayisi != null) par.push(`${op.taksit_sayisi} ay`);
  return par.length ? par.join(" · ") : null;
}

export default async function KatalogSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ b?: string }>;
}) {
  const { id } = await params;
  const { b } = await searchParams;
  const ids = (b ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emlakciId = user?.id ?? "";
  if (!emlakciId) notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3535";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const appUrl = `${protocol}://${host}`;

  // Proje (RLS: tahsisli değilse gelmez)
  const { data: proje } = await supabase
    .from("proje")
    .select("id, ad, il, ilce, mahalle, insaat_asamasi, ilerleme_yuzde, teslim_tarihi, belge_dogrulandi, uretici_id")
    .eq("id", id)
    .single();
  if (!proje) notFound();

  // Danışman profili (beyaz-etiket)
  const { data: profile } = await supabase
    .from("profiles")
    .select("ad, telefon, foto_url, logo_url")
    .eq("id", emlakciId)
    .single();

  // Kapak
  const { data: kapakRow } = await supabase
    .from("proje_belge")
    .select("url")
    .eq("proje_id", id)
    .eq("tip", "kapak")
    .limit(1)
    .maybeSingle();
  const kapak = projeKapak(kapakRow?.url ?? null, proje.id);

  // Seçilen birimler — RLS tahsis eler; tek-proje kısıtı proje_id ile. Boşsa katalog boş.
  const { data: birimlerRaw } = ids.length
    ? await supabase
        .from("birim")
        .select("id, daire_no, kat, durum, liste_fiyati, para_birimi, net_m2, brut_m2, yon, satilabilir, odeme_plani, tip:tip_id(oda, plan_url)")
        .in("id", ids)
        .eq("proje_id", id)
    : { data: [] };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const birimler = ((birimlerRaw ?? []) as any[]).map((x) => ({
    id: x.id as string,
    daire_no: (x.daire_no as string | null) ?? null,
    kat: (x.kat as number | null) ?? null,
    durum: x.durum as BirimDurum,
    liste_fiyati: (x.liste_fiyati as number | null) ?? null,
    para_birimi: (x.para_birimi as string | null) ?? "TRY",
    net_m2: (x.net_m2 as number | null) ?? null,
    brut_m2: (x.brut_m2 as number | null) ?? null,
    yon: (x.yon as string | null) ?? null,
    odeme: odemeOzet(x.odeme_plani as OdemePlani),
    oda: (x.tip?.oda as string | null) ?? null,
    plan_url: (x.tip?.plan_url as string | null) ?? null,
    link: `${appUrl}/p/${emlakciId}/${x.id}/${generateShareToken(emlakciId, x.id)}`,
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const konum = [proje.mahalle, proje.ilce, proje.il].filter(Boolean).join(", ") || "—";

  // Veri yerçekimi: katalog üretildi (anonim, PII yok).
  after(() =>
    kayitYaz({ tip: "katalog", profileId: emlakciId, projeId: id, payload: { birimler: birimler.map((x) => x.id) } }),
  );

  return (
    <div className="min-h-screen bg-paper pb-16">
      <header className="border-b border-hair bg-card py-4 shadow-sm print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6">
          <Link href={`/havuz/proje/${id}`} className="mono text-[11px] font-bold uppercase tracking-[0.1em] text-teal-d hover:text-teal">
            ← Projeye Dön
          </Link>
          <YazdirButonu etiket="Katalog PDF / Yazdır" />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-4xl px-6">
        {/* KAPAK */}
        <section className="overflow-hidden rounded-2xl border border-hair bg-card shadow-sm">
          <div className="relative aspect-[16/6] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={kapak} alt={proje.ad} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-white drop-shadow">{proje.ad}</h1>
                {proje.belge_dogrulandi ? <span className="rozet bg-teal-soft text-teal-d">✓ Doğrulanmış</span> : null}
              </div>
              <p className="mt-1 text-[13px] font-medium text-white/85">{konum}</p>
              <p className="mono mt-1 text-[11px] text-white/75">
                İnşaat: {ASAMA_ETIKET[proje.insaat_asamasi as InsaatAsama]} · %{proje.ilerleme_yuzde}
                {proje.teslim_tarihi ? ` · Teslim ${new Date(proje.teslim_tarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "short" })}` : ""}
              </p>
            </div>
          </div>

          {/* Danışman kartı (beyaz-etiket) */}
          <div className="flex items-center gap-4 p-5">
            {profile?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.logo_url} alt={profile.ad ?? "Danışman"} className="size-12 flex-none rounded-xl border border-hair bg-white object-contain p-1" />
            ) : profile?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.foto_url} alt={profile.ad ?? "Danışman"} className="size-12 flex-none rounded-full border border-hair object-cover" />
            ) : (
              <div className="flex size-12 flex-none items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                {profile?.ad?.charAt(0).toUpperCase() ?? "E"}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-display text-[15px] font-bold text-ink">{profile?.ad ?? "Danışman"}</p>
              <p className="text-[12px] text-gray">Gayrimenkul Danışmanı{profile?.telefon ? ` · ${profile.telefon}` : ""}</p>
            </div>
          </div>
        </section>

        {/* DAİRE GRID */}
        {birimler.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-hair bg-card/60 p-10 text-center text-sm text-gray">
            Katalog için daire seçilmedi veya seçilenler erişiminiz dışında.
          </p>
        ) : (
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {birimler.map((x) => {
              const psim = PARA_SIMGE[x.para_birimi] ?? "₺";
              return (
                <article key={x.id} className="break-inside-avoid rounded-2xl border border-hair bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[16px] font-bold text-ink">Daire {x.daire_no ?? "—"}</p>
                      <p className="mt-0.5 text-[12px] text-gray">
                        {[x.oda, x.kat != null ? `${x.kat}. kat` : null, x.net_m2 ? `${x.net_m2} m²` : null, x.yon]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white ${DURUM_BG[x.durum]}`}>
                      {DURUM_ETIKET[x.durum]}
                    </span>
                  </div>

                  {x.plan_url ? (
                    <div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-hair bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.plan_url} alt="Kat planı" className="max-h-full max-w-full object-contain p-2" />
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-end justify-between border-t border-hair pt-3">
                    <div>
                      <span className="mono text-lg font-bold text-ink">
                        {x.liste_fiyati != null ? `${x.liste_fiyati.toLocaleString("tr-TR")} ${psim}` : "—"}
                      </span>
                      {x.odeme ? <p className="mono mt-0.5 text-[11px] text-gray">{x.odeme}</p> : null}
                    </div>
                  </div>

                  <p className="mono mt-2 break-all rounded-md bg-paper px-2 py-1 text-center text-[10px] text-gray">
                    {x.link}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        <p className="mono mt-6 text-center text-[10px] text-gray print:mt-10">
          Projedar · Canlı stoktan üretildi · Fiyatlar paylaşım anındaki değerdir.
        </p>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint "src/app/havuz/proje/[id]/katalog/page.tsx"`
Expected: 0 error (mevcut projedeki gibi `<img>` warning'leri kabul; yeni error yok).

- [ ] **Step 3: Doğrula — `fmtPara` kullanılmıyorsa import'tan çıkar**

Yukarıdaki kodda `fmtPara` import edildi ama fiyat `toLocaleString` ile basıldı. `fmtPara` KULLANILMIYOR → import satırından `fmtPara` kaldır (unused import = lint error, CLAUDE.md zero-tolerance). Düzeltilmiş import:

```ts
import { ASAMA_ETIKET, DURUM_ETIKET, DURUM_BG, type InsaatAsama, type BirimDurum } from "@/lib/types";
```

Sonra tekrar: `npx eslint "src/app/havuz/proje/[id]/katalog/page.tsx"` → 0 error.

- [ ] **Step 4: Commit**

```bash
git add "src/app/havuz/proje/[id]/katalog/page.tsx"
git commit -m "feat(katalog): musteri katalog server route (canli veri + print + event)"
```

---

## Task 6: Bütünsel doğrulama + changelog

**Files:**
- Modify: `~/.claude/projects/-Users-gurkankuzu-GK-MAC-D-GK-Proje-admin-ProjePazar/memory/changelog.md`

- [ ] **Step 1: Build ile tip/derleme doğrula (bir kez)**

Run: `npm run build`
Expected: Başarılı derleme; `havuz/proje/[id]/katalog` route'u çıktıda görünür. Hata varsa ilgili task'a dön.

- [ ] **Step 2: Elle akış doğrulama (deploy sonrası veya `npm run dev`)**

1. Emlakçı olarak `havuz/proje/[tahsisli-proje-id]` aç → "Müşteri Kataloğu" kartı görünür.
2. 2-3 daire seç → "Katalog oluştur (N daire)" → `/katalog?b=...` açılır.
3. Kapak + danışman kartı + kompakt daire grid + canlı fiyat + mikrosite linkleri görünür.
4. "Katalog PDF / Yazdır" → tarayıcı yazdırma; header/butonlar `print:hidden`, kartlar sayfa ortasında kırılmıyor (`break-inside-avoid`).
5. Erişim dışı bir birim id'si elle URL'e eklendiğinde katalogda GÖRÜNMEZ (RLS).

- [ ] **Step 3: Changelog memory güncelle**

`~/.claude/projects/-Users-gurkankuzu-GK-MAC-D-GK-Proje-admin-ProjePazar/memory/changelog.md` en üste (frontmatter'dan sonra) ekle:

```markdown
## 2026-08-04 — Emlakçı müşteri kataloğu (Sprint 1)
- KatalogSecici (proje detayda daire seç) + /havuz/proje/[id]/katalog server route (kompakt fiyat-listesi, kapak + danışman kartı + canlı fiyat + mikrosite linkleri) + genel YazdirButonu + events `katalog` tipi. Print-optimize, migration yok, tek-doğru-kaynak. Beyaz-etiket: profile.logo_url katalogda aktif.
- Kalan (2. sprint): emlakçı analitik/performans ekranı + Lead/Paylaşım CSV export.
```

Ayrıca `tasks.md`'deki "Paylaşım OG kartı ✅" satırına katalog notu eklenebilir.

- [ ] **Step 4: Push (canlıya)**

```bash
git push origin main
```

---

## Self-Review Notları (plan yazarı)

- **Spec coverage:** kapsam (tek proje seçmeli) → Task 3-4; layout (kompakt fiyat-listesi + link) → Task 5; beyaz-etiket (logo_url) → Task 5; event → Task 1+5; print → mevcut `@media print` + Task 5 `break-inside-avoid`/`print:hidden`; migration yok → Task 1 doğrulandı. Kapsam dışı (çok-proje/QR/CSV/analitik) plana alınmadı. ✓
- **Type consistency:** `SeciBirim` Task 3'te tanımlı, Task 4'te import edilip aynı alanlarla dolduruluyor. `DURUM_BG`/`DURUM_ETIKET`/`BirimDurum` `@/lib/types`'tan (mikrosite'de aynı kullanım). `generateShareToken(emlakciId, birimId)` imzası `sharing.ts` ile uyumlu. `kayitYaz({tip, profileId, projeId, payload})` `OlayGirdi` ile uyumlu.
- **Placeholder:** yok; her kod adımı tam. `fmtPara` unused riski Task 5 Step 3'te açıkça giderildi.
