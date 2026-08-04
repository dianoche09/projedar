# Admin "Başvurular" Birleşik Dosyası — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panelinde hesap onayı (`/admin/onay`) ve KYC belge doğrulama (`/admin/dogrulama`) ekranlarını tek `/admin/basvurular` çalışma alanında birleştirmek: solda filtreli başvuru kuyruğu, sağda seçilen başvuranın tam dosyası (`profil_detay` + KYC belgeler + `ai_sonuc` + iz), kararlar dosyadan verilir.

**Architecture:** `page.tsx` (Server Component) kuyruk listesini + ofis listesini çeker, `BasvuruWorkspace` (client) bileşenine props geçer. Seçim ve filtre client state; seçilen başvuranın dosyası bir **server action** (`getDosya`) ile çekilir (service-role yalnız sunucuda; DEĞİŞMEZ #1). Kararlar mevcut server action'larla (`kullaniciOnayla`/`kullaniciReddet`/`belgeKarar`) verilir, redirect hedefleri yeni sayfaya çevrilir. Şema değişikliği yok.

**Tech Stack:** Next.js App Router (RSC + server actions), Supabase (server client + service-role admin client + Storage signed URL), Tailwind + projenin globals sınıfları (`kart`, `rozet`, `mono`, `signal-top`, `pill`...). Test runner yok → doğrulama `npm run lint` + `next build` (tip) + tarayıcı dogfood.

**Test notu:** Bu repoda vitest/jest yok (`package.json` yalnız `lint`). writing-plans'in "failing test önce" döngüsü burada **lint + build + tarayıcı** ile ikame edilir. Saf yardımcılar (`maskeTckn`) küçük olduğundan gözle doğrulanır.

---

## Dosya Yapısı

**Yeni:**
- `src/app/admin/basvurular/page.tsx` — Server Component; kuyruk + ofis fetch; workspace'i render eder.
- `src/app/admin/basvurular/BasvuruWorkspace.tsx` — Client Component; iki-pane (kuyruk + dosya), filtre/seçim state, karar formları.
- `src/lib/basvuruDetay.ts` — saf yardımcılar: `maskeTckn`, `profilDetaySatirlar` (rol → etiketli key/value), `belgeTipAd`, `aiRozet`.

**Değişecek:**
- `src/app/admin/actions.ts` — `getDosya` server action eklenir; `kullaniciOnayla`/`kullaniciReddet`/`belgeKarar` redirect/revalidate hedefleri `/admin/basvurular`.
- `src/app/admin/AdminNav.tsx` — "Onay Kuyruğu" + "Belge Doğrulama" → tek "Başvurular" girişi (badge = onayBekleyen + belgeBekleyen).
- `src/app/admin/onay/page.tsx` — gövde `redirect("/admin/basvurular")`.
- `src/app/admin/dogrulama/page.tsx` — gövde `redirect("/admin/basvurular")`.
- `src/app/admin/page.tsx` — 3 adet `/admin/onay` linki → `/admin/basvurular`.

**Dokunulmaz:** `kullanicilar/*`, `ureticiler`, `ofisler`, `uyelik`, `denetim`, `layout.tsx` (badge sorguları zaten var), şema.

---

## Task 1: Saf yardımcılar (`basvuruDetay.ts`)

**Files:**
- Create: `src/lib/basvuruDetay.ts`

- [ ] **Step 1: Yardımcıları yaz**

```ts
import { PROFIL_ALANLARI, type RolAnahtar } from "@/lib/kayitAlanlar";

/** TCKN'yi KVKK-yalın maskele: ilk 3 + son 2 görünür. */
export function maskeTckn(v: string | null | undefined): string {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length !== 11) return v ?? "—";
  return `${s.slice(0, 3)}••••••${s.slice(9)}`;
}

/** Kamu doğrulaması yapılabilen belge no alanları (rol bazında) → vurgulanır. */
export const DOGRULANABILIR_ALAN: Record<string, { key: string; kaynak: string }> = {
  uretici: { key: "yetki_belge_no", kaynak: "YAMBİS / ŞANTİYE-M" },
  ofis_yetkili: { key: "tasinmaz_yetki_belge_no", kaynak: "TTBS" },
  emlakci: { key: "mys_belge_no", kaynak: "MYK / e-Devlet" },
};

export type DetaySatir = { key: string; etiket: string; deger: string; maskeli?: boolean };

/**
 * profil_detay'ı ilgili rolün alan sırası + etiketleriyle key/value satırlara çevirir.
 * kayitAlanlar.ts tek kaynak; boş alanlar atlanır; tckn maskelenir.
 */
export function profilDetaySatirlar(rol: string, detay: Record<string, unknown> | null): DetaySatir[] {
  const cfg = PROFIL_ALANLARI[rol as RolAnahtar];
  if (!cfg || !detay) return [];
  const out: DetaySatir[] = [];
  for (const a of cfg.alanlar) {
    const ham = detay[a.key];
    if (ham == null || `${ham}`.trim() === "") continue;
    const maskeli = a.key === "tckn";
    out.push({ key: a.key, etiket: a.etiket, deger: maskeli ? maskeTckn(`${ham}`) : `${ham}`, maskeli });
  }
  return out;
}

export const BELGE_TIP_AD: Record<string, string> = {
  mesleki_yeterlilik: "Mesleki Yeterlilik / Yetki Belgesi",
  vergi_levhasi: "Vergi Levhası",
};

export type AiSonuc = { gecerli?: boolean; skor?: number; ozet?: string } | null;

/** ai_sonuc → rozet tonu + kısa etiket. */
export function aiRozet(ai: AiSonuc): { ton: "ok" | "dikkat" | "yok"; etiket: string } {
  if (!ai || (ai.gecerli == null && ai.skor == null)) return { ton: "yok", etiket: "AI taraması yok" };
  const skor = typeof ai.skor === "number" ? ai.skor.toFixed(2) : "—";
  if (ai.gecerli) return { ton: "ok", etiket: `AI · geçerli ✓ · skor ${skor}` };
  return { ton: "dikkat", etiket: `AI · dikkat · skor ${skor}` };
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: 0 error (yeni dosya).

- [ ] **Step 3: Commit**

```bash
git add src/lib/basvuruDetay.ts
git commit -m "feat(admin): başvuru dosyası saf yardımcıları (maske/profil_detay/ai rozet)"
```

---

## Task 2: `getDosya` server action + karar redirect hedefleri

**Files:**
- Modify: `src/app/admin/actions.ts`

Referans (mevcut): `adminGuard()` her action başında; `createAdminClient` `@/lib/supabase/admin`'den; `kayitYaz()` event yazar; `belgeKarar` şu an `redirect("/admin/dogrulama?...")` (satır ~106/115); `kullaniciOnayla`/`kullaniciReddet` yalnız `revalidatePath("/admin")` yapıyor.

- [ ] **Step 1: `DosyaVeri` tipi + `getDosya` action ekle** (dosyanın uygun yerine, importlar mevcut)

```ts
export type DosyaBelge = { tip: string; imzali: string | null; durum: string; ai_sonuc: unknown; created_at: string };
export type DosyaOlay = { id: string; tip: string; payload: unknown; created_at: string };
export type DosyaVeri = {
  id: string; ad: string | null; telefon: string | null;
  talep_rol: string | null; rol: string | null; durum: string | null; belge_durumu: string | null;
  ofis_id: string | null; il: string | null; ilce: string | null;
  kayit_meta: Record<string, unknown> | null; profil_detay: Record<string, unknown> | null;
  created_at: string; belgeler: DosyaBelge[]; olaylar: DosyaOlay[];
};

/** Tek başvuranın tam dosyasını çeker (service-role yalnız sunucuda). */
export async function getDosya(id: string): Promise<{ ok: true; veri: DosyaVeri } | { ok: false; hata: string }> {
  await adminGuard();
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, hata: "Service-role anahtarı tanımlı değil" };
  }

  const { data: p, error } = await admin
    .from("profiles")
    .select("id, ad, telefon, talep_rol, rol, durum, belge_durumu, ofis_id, il, ilce, kayit_meta, profil_detay, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error || !p) return { ok: false, hata: "Başvuru bulunamadı" };

  const { data: belgeRaw } = await admin
    .from("kullanici_belge")
    .select("tip, url, durum, ai_sonuc, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: true });

  const belgeler: DosyaBelge[] = [];
  for (const b of belgeRaw ?? []) {
    const { data: signed } = await admin.storage.from("kyc-belge").createSignedUrl(b.url as string, 3600);
    belgeler.push({ tip: b.tip as string, imzali: signed?.signedUrl ?? null, durum: b.durum as string, ai_sonuc: b.ai_sonuc, created_at: b.created_at as string });
  }

  const { data: olayRaw } = await admin
    .from("events")
    .select("id, tip, payload, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(12);

  return {
    ok: true,
    veri: {
      id: p.id as string, ad: p.ad as string | null, telefon: p.telefon as string | null,
      talep_rol: p.talep_rol as string | null, rol: p.rol as string | null,
      durum: p.durum as string | null, belge_durumu: p.belge_durumu as string | null,
      ofis_id: p.ofis_id as string | null, il: p.il as string | null, ilce: p.ilce as string | null,
      kayit_meta: (p.kayit_meta ?? null) as Record<string, unknown> | null,
      profil_detay: (p.profil_detay ?? null) as Record<string, unknown> | null,
      created_at: p.created_at as string,
      belgeler,
      olaylar: (olayRaw ?? []) as DosyaOlay[],
    },
  };
}
```

- [ ] **Step 2: Karar action'larının redirect/revalidate hedeflerini `/admin/basvurular`'a çevir**

`belgeKarar` içinde:
- `redirect("/admin/dogrulama?hata=...")` → `redirect("/admin/basvurular?hata=...")`
- `revalidatePath("/admin/dogrulama")` → ek olarak `revalidatePath("/admin/basvurular")`
- son `redirect(\`/admin/dogrulama?mesaj=...\`)` → `redirect(\`/admin/basvurular?mesaj=...\`)`

`kullaniciOnayla` ve `kullaniciReddet` sonuna ekle: `revalidatePath("/admin/basvurular");`

- [ ] **Step 3: Lint + tip**

Run: `npm run lint`
Expected: 0 error.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/actions.ts
git commit -m "feat(admin): getDosya action + karar redirect hedefleri /admin/basvurular"
```

---

## Task 3: `BasvuruWorkspace` client bileşeni

**Files:**
- Create: `src/app/admin/basvurular/BasvuruWorkspace.tsx`

Bu bileşen, onaylanmış mockup'ın (`tasarimlar/v2-admin-basvurular.html`) uygulama sınıflarıyla (Tailwind + globals: `kart`, `signal-top`, `rozet`, `mono`, `pill`, `btn`...) yeniden yazımıdır. Mevcut onay/dogrulama sayfalarındaki sınıf sözlüğü kullanılır.

**Props:** `kuyruk: KuyrukSatir[]`, `ofisler: {id,ad}[]`.
`type KuyrukSatir = { id; ad; telefon; talep_rol; il; ilce; durum; belge_durumu; created_at }` (page'de tanımlanır, buraya import).

- [ ] **Step 1: İskelet + state + seçim**

```tsx
"use client";
import { useState, useTransition } from "react";
import { getDosya, kullaniciOnayla, kullaniciReddet, belgeKarar, type DosyaVeri } from "../actions";
import { ROL_ETIKET, type Rol } from "@/lib/roller";
import { zamanOnce } from "@/lib/types";
import { Avatar } from "../_ortak";
import { profilDetaySatirlar, DOGRULANABILIR_ALAN, BELGE_TIP_AD, aiRozet } from "@/lib/basvuruDetay";

export type KuyrukSatir = {
  id: string; ad: string | null; telefon: string | null; talep_rol: string | null;
  il: string | null; ilce: string | null; durum: string | null; belge_durumu: string | null; created_at: string;
};
const ATANABILIR: Rol[] = ["uretici", "emlakci", "ofis_yetkili", "marka_yetkili", "arsa_sahibi"];

export default function BasvuruWorkspace({ kuyruk, ofisler }: { kuyruk: KuyrukSatir[]; ofisler: { id: string; ad: string }[] }) {
  const [seciliId, setSeciliId] = useState<string | null>(kuyruk[0]?.id ?? null);
  const [dosya, setDosya] = useState<DosyaVeri | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, basla] = useTransition();
  const [q, setQ] = useState(""); const [fRol, setFRol] = useState(""); const [fBelge, setFBelge] = useState("");

  function sec(id: string) {
    setSeciliId(id); setHata(null);
    basla(async () => {
      const r = await getDosya(id);
      if (r.ok) setDosya(r.veri); else { setDosya(null); setHata(r.hata); }
    });
  }
  // ilk yüklemede seçili varsa çek
  // (useEffect ile: seciliId set ama dosya yoksa)
  // ... (Step 2'de listelenen filtre + render)
}
```

- [ ] **Step 2: İlk seçimi yükle (useEffect), filtreyi uygula**

`useState` importuna `useEffect` ekle. Bileşen gövdesine:

```tsx
useEffect(() => { if (seciliId && !dosya) sec(seciliId); /* eslint-disable-next-line */ }, []);

const suzulmus = kuyruk.filter((k) => {
  if (fRol && k.talep_rol !== fRol) return false;
  if (fBelge && (k.belge_durumu ?? "yok") !== fBelge) return false;
  if (q) {
    const h = `${k.ad ?? ""} ${k.telefon ?? ""}`.toLowerCase();
    if (!h.includes(q.toLowerCase())) return false;
  }
  return true;
});
```

- [ ] **Step 3: İki-pane render (kuyruk + dosya)**

Layout: `grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-4 items-start`. Sol `kart` sticky (`lg:sticky lg:top-4`), içinde arama input + 3 select (durum/rol/belge) + `suzulmus.map` satırları. Her satır buton, `onClick={() => sec(k.id)}`, aktifse `ring-1 ring-teal`. Satır içeriği: `Avatar`, ad, `rozet` talep_rol, `mono` il/ilçe + `zamanOnce(created_at)`, iki durum çipi:
- hesap: `durum==="onay_bekliyor"` → `rozet bg-amber-soft text-amber` "hesap: onay bekliyor".
- belge: `belge_durumu` → yok `bg-gray/12 text-gray` · beklemede `bg-amber-soft text-amber` · dogrulandi `bg-green-soft text-teal-d` · red `bg-red/10 text-red`.

Sağ pane (`#dosya`): `yukleniyor` → iskelet; `hata` → `kart` uyarı; `dosya` yoksa → boş-durum ("Bir başvuru seç"); `dosya` varsa `<Dosya veri={dosya} ofisler={ofisler} />` (Step 4).

- [ ] **Step 4: `Dosya` alt bileşeni (aynı dosyada) — 5 bölüm**

`function Dosya({ veri, ofisler })`:
1. **Başlık kartı** (`kart signal-top`, `--_sig` amber): büyük Avatar, ad, `rozet` talep_rol, `mono` telefon + `zamanOnce(created_at)` + `kayit_meta.davet_eden`; sağda hesap + belge durum rozetleri.
2. **Kimlik & Yetki:** `profilDetaySatirlar(veri.talep_rol, veri.profil_detay)` → 2 kolonlu key/value. `DOGRULANABILIR_ALAN[veri.talep_rol]` varsa o alanı üstte vurgulu kutuda göster + `kaynak` etiketi + dış link (statik `#`, `title="kamu doğrulama"`). Satır yoksa "Kayıt detayı girilmemiş".
3. **KYC Belgeleri:** `veri.belgeler.length` ise her belge: `BELGE_TIP_AD[tip]`, `zamanOnce`, `imzali` varsa `<a target="_blank">Görüntüle →</a>`, `aiRozet(ai_sonuc)` ton'a göre yeşil/amber kutu + `ozet`. Belge yoksa bölümü gizle.
4. **Başvuru izi:** `veri.olaylar` timeline (tl-item deseni denetim/page.tsx'teki gibi) veya boşsa "iz yok".
5. **Karar paneli** (kartın altı, `border-t`): `<form action={kullaniciOnayla}>` hidden `kullanici_id=veri.id`, select `rol` (ATANABILIR, default talep_rol), select `ofis_id` (ofisler), buton **Onayla**; ayrı `<button formAction={kullaniciReddet}>` **Reddet**. `veri.belge_durumu==="beklemede"` ise ayrı `<form action={belgeKarar}>` hidden `profile_id` + `karar` ("onay"/"red") ile **Belge Doğrula** / **Belge Reddet**. Altında KVKK notu satırı.

Sınıf sözlüğü onay/dogrulama sayfalarından bire bir alınır (`sel`, `btn ...`, `rozet`, `pill`, `kart`, `signal-top`, `mono`, `text-ink/-gray`, `bg-amber-soft` vb.).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: 0 error.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/basvurular/BasvuruWorkspace.tsx
git commit -m "feat(admin): BasvuruWorkspace — kuyruk + rol-duyarlı başvuru dosyası"
```

---

## Task 4: `basvurular/page.tsx` (Server Component)

**Files:**
- Create: `src/app/admin/basvurular/page.tsx`

- [ ] **Step 1: Sayfayı yaz**

```tsx
import { createClient } from "@/lib/supabase/server";
import { SayfaBaslik, Uyari } from "../_ortak";
import BasvuruWorkspace, { type KuyrukSatir } from "./BasvuruWorkspace";

export default async function BasvurularSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string; mesaj?: string }>;
}) {
  const { hata, mesaj } = await searchParams;
  const supabase = await createClient();
  const [{ data: kuyrukRaw }, { data: ofisler }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, ad, telefon, talep_rol, il, ilce, durum, belge_durumu, created_at")
      .or("durum.eq.onay_bekliyor,belge_durumu.eq.beklemede")
      .order("created_at", { ascending: false }),
    supabase.from("ofis").select("id, ad").order("ad"),
  ]);
  const kuyruk = (kuyrukRaw ?? []) as KuyrukSatir[];

  return (
    <div className="mx-auto max-w-[1560px] space-y-4 px-4 py-6 sm:px-6">
      <SayfaBaslik
        baslik="Başvurular"
        noktaRenk={kuyruk.length > 0 ? "var(--color-amber)" : "var(--color-green)"}
        altEtiket={
          <>
            <span className="font-medium">{kuyruk.length > 0 ? `${kuyruk.length} başvuru işlem bekliyor` : "Kuyruk temiz"}</span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">kayıt · yetki · KYC tek dosyada</span>
          </>
        }
      />
      <Uyari hata={hata} mesaj={mesaj} />
      {kuyruk.length === 0 ? (
        <div className="kart px-5 py-16 text-center">
          <p className="text-sm font-semibold text-ink">Bekleyen başvuru yok</p>
          <p className="mt-1 text-xs text-gray">Yeni kayıt ve belge yüklemeleri burada birleşik görünür.</p>
        </div>
      ) : (
        <BasvuruWorkspace kuyruk={kuyruk} ofisler={ofisler ?? []} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint + build tip kontrolü**

Run: `npm run lint`
Expected: 0 error.
(İsteğe bağlı derin kontrol: `npx tsc --noEmit -p tsconfig.json` uzun sürebilir; `next build` ile birlikte doğrulanır.)

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/basvurular/page.tsx
git commit -m "feat(admin): /admin/basvurular sayfası — kuyruk + ofis fetch"
```

---

## Task 5: Nav birleştirme + eski rota redirect + dashboard linkleri

**Files:**
- Modify: `src/app/admin/AdminNav.tsx`
- Modify: `src/app/admin/onay/page.tsx`
- Modify: `src/app/admin/dogrulama/page.tsx`
- Modify: `src/app/admin/page.tsx`

- [ ] **Step 1: AdminNav — iki giriş → tek "Başvurular"**

`YONETIM` dizisinde `/admin/onay` ve `/admin/dogrulama` girişlerini kaldır; yerine tek giriş ekle (mevcut prop `onayBekleyen`, `belgeBekleyen` korunur):

```tsx
{ href: "/admin/basvurular", etiket: "Başvurular", ic: "dosya", rozetSay: (onayBekleyen ?? 0) + (belgeBekleyen ?? 0) },
```

Badge render bloğu tek girişe indirilir (mevcut iki ayrı badge bloğu yerine `rozetSay > 0` koşulu). İkon `dosya` yoksa mevcut onay ikonu kullanılabilir.

- [ ] **Step 2: onay/page.tsx ve dogrulama/page.tsx → redirect**

Her iki dosyanın tüm gövdesini şununla değiştir:

```tsx
import { redirect } from "next/navigation";
export default function Yonlendir() {
  redirect("/admin/basvurular");
}
```

- [ ] **Step 3: Dashboard linkleri**

`src/app/admin/page.tsx` içinde 3 yerdeki `href="/admin/onay"` → `href="/admin/basvurular"` (satır ~197, ~234, ~306).

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: 0 error.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/AdminNav.tsx src/app/admin/onay/page.tsx src/app/admin/dogrulama/page.tsx src/app/admin/page.tsx
git commit -m "feat(admin): nav Başvurular birleşik; eski onay/dogrulama redirect; dashboard link"
```

---

## Task 6: Doğrulama (build + tarayıcı dogfood)

**Files:** yok (doğrulama).

- [ ] **Step 1: Prod build (tip + derleme)**

Run: `npm run build`
Expected: derleme başarılı; `/admin/basvurular` route listede; tip hatası yok.

- [ ] **Step 2: Tarayıcı dogfood** (dev'de `npm run dev`, admin ile giriş; ya da gstack `/browse`)

Kontrol listesi:
- `/admin/basvurular` açılır; sol kuyrukta bekleyen başvurular; filtre (rol/belge/arama) çalışır.
- Bir başvuran seçince sağ dosya yüklenir: profil_detay tüm alanlar + doğrulanabilir belge no vurgusu; KYC belge + AI rozeti (varsa); iz.
- Onayla → hesap aktifleşir, kuyruktan düşer; Reddet → düşer; Belge Doğrula/Reddet → belge durumu değişir.
- `/admin/onay` ve `/admin/dogrulama` → `/admin/basvurular`'a yönlenir.
- Nav'da tek "Başvurular" + doğru badge; dashboard linkleri yeni sayfaya gider.
- Mobil genişlikte (<1024px) tek kolon; dosya alta iner, okunur.
- Service-role yoksa: `getDosya` "anahtar yok" hatası → sağ pane graceful uyarı.

- [ ] **Step 3: PII/servis-rol kontrolü**

Run: `grep -rn "createAdminClient\|SERVICE_ROLE" src/app/admin/basvurular`
Expected: `BasvuruWorkspace.tsx` (client) içinde **YOK**; yalnız server (`page.tsx` dolaylı, action `getDosya`) tarafında. Service-role client'a sızmıyor.

- [ ] **Step 4: Değişiklikleri push (direkt-canliya-at)**

```bash
git push
```
(Kullanıcı onayıyla; Vercel otomatik deploy.)

---

## Self-Review (plan yazarı)

- **Spec kapsamı:** rota+nav+redirect (Task 4,5) ✓ · sol kuyruk (Task 3 Step 3) ✓ · dosya 5 bölüm profil_detay+KYC+ai_sonuc+iz+karar (Task 1,2,3) ✓ · service-role sunucu-içi (Task 2 getDosya, Task 6 Step 3) ✓ · TCKN maskeli (Task 1 maskeTckn) ✓ · kabul kriterleri (Task 6) ✓.
- **Placeholder taraması:** Task 3 büyük bileşen adım adım bölümlenmiş; sınıf sözlüğü kaynak dosyalara (onay/dogrulama) işaret ediyor, "uygun stil ekle" gibi boş ifade yok. `getDosya`, tipler, redirect'ler tam kodlu.
- **Tip tutarlılığı:** `DosyaVeri`/`KuyrukSatir` Task 2/3'te tanımlı; `getDosya` dönüşü `{ok, veri|hata}` her yerde aynı; `kullaniciOnayla` alanları (`kullanici_id`,`rol`,`ofis_id`), `belgeKarar` (`profile_id`,`karar`) mevcut action imzalarıyla eşleşiyor.
- **Bilinen risk:** `.or("durum.eq.onay_bekliyor,belge_durumu.eq.beklemede")` PostgREST OR sözdizimi RLS admin policy ile çalışmalı; Task 6 Step 2'de doğrulanır. `profiles.rol` kolon adı `getDosya` select'inde varsayıldı (kullanicilar sayfası `rol` seçiyor → mevcut).
