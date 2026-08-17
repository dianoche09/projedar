import { createAdminClient } from "@/lib/supabase/admin";

/* =========================================================
   HUNİ / ANALİTİK (admin) — birinci-parti, dış bağımlılık yok.
   Kaynak: events tablosu (kendi verimiz). İki huni:
   1) Kayıt hunisi: kayit_goruntuleme → kayit_tamam (+ hata, terk %).
   2) Ürün olay hunisi: goruntuleme → paylasim → opsiyon → satis.
   ========================================================= */

export const dynamic = "force-dynamic";

type OlayMini = { tip: string; created_at: string };
type HataMini = { payload: Record<string, unknown> | null; created_at: string };

function Asama({ etiket, deger, taban, renk }: { etiket: string; deger: number; taban: number; renk: string }) {
  const pct = taban > 0 ? Math.round((deger / taban) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold text-ink">{etiket}</span>
        <span className="mono text-[13px] text-ink-soft">
          {deger}
          {taban > 0 && deger !== taban ? <span className="ml-1.5 text-[11px] text-[var(--ink-faint)]">%{pct}</span> : null}
        </span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--cizgi)]">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, deger > 0 ? 4 : 0)}%`, background: renk }} />
      </div>
    </div>
  );
}

function Kpi({ etiket, deger, alt }: { etiket: string; deger: string | number; alt?: string }) {
  return (
    <div className="kart p-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">{etiket}</p>
      <p className="mt-2 font-display text-[28px] font-bold leading-none text-ink">{deger}</p>
      {alt ? <p className="mt-1.5 text-[12.5px] text-ink-soft">{alt}</p> : null}
    </div>
  );
}

export default async function AdminHuni() {
  // Servis anahtarı yoksa panel çökmez (DEĞİŞMEZ #6 graceful; admin/page.tsx ile aynı desen).
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <div className="kart p-8 text-center text-[13.5px] text-ink-soft">
        Huni/analitik için servis anahtarı (SUPABASE_SERVICE_ROLE_KEY) tanımlı değil.
      </div>
    );
  }

  const { data: olayRaw } = await admin.from("events").select("tip, created_at");
  const olaylar = (olayRaw ?? []) as OlayMini[];
  const say = (t: string) => olaylar.filter((o) => o.tip === t).length;

  // Kayıt hunisi
  const kGor = say("kayit_goruntuleme");
  const kTamam = say("kayit_tamam");
  const kHata = say("kayit_hata");
  const kTerk = Math.max(0, kGor - kTamam);
  const terkPct = kGor > 0 ? Math.round((kTerk / kGor) * 100) : 0;
  const kayitBasladi = olaylar
    .filter((o) => o.tip.startsWith("kayit_"))
    .map((o) => o.created_at)
    .sort()[0];

  // Ürün olay hunisi (tarihsel veri)
  const pGor = say("goruntuleme");
  const pPay = say("paylasim");
  const pOps = say("opsiyon");
  const pSat = say("satis");

  // Kayıt hata sebepleri
  const { data: hataRaw } = await admin
    .from("events")
    .select("payload, created_at")
    .eq("tip", "kayit_hata")
    .order("created_at", { ascending: false })
    .limit(50);
  const sebepMap = new Map<string, number>();
  for (const h of (hataRaw ?? []) as HataMini[]) {
    const mesaj = typeof h.payload?.mesaj === "string" ? h.payload.mesaj : "bilinmiyor";
    sebepMap.set(mesaj, (sebepMap.get(mesaj) ?? 0) + 1);
  }
  const sebepler = [...sebepMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Kullanıcılar (başarılı kayıt = profil)
  const { count: kullaniciSay } = await admin.from("profiles").select("*", { count: "exact", head: true });

  const tarih = (s?: string) => (s ? new Date(s).toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) : null);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
      <header className="mb-6">
        <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Huni & Analitik</h1>
        <p className="mt-1 text-[13px] text-ink-soft">Birinci-parti veri (kendi <span className="mono">events</span> tablomuz). Dış servis yok, cookie yok.</p>
      </header>

      {/* KPI satırı */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi etiket="Kayıtlı kullanıcı" deger={kullaniciSay ?? 0} />
        <Kpi etiket="Kayıt görüntüleme" deger={kGor} alt={kayitBasladi ? `${tarih(kayitBasladi)}'ten beri` : "ölçüm yeni başladı"} />
        <Kpi etiket="Tamamlanan kayıt" deger={kTamam} />
        <Kpi etiket="Terk oranı" deger={kGor > 0 ? `%${terkPct}` : "—"} alt={kGor > 0 ? `${kTerk} kişi terk etti` : "veri bekleniyor"} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Kayıt hunisi */}
        <div className="kart p-6">
          <h2 className="font-display text-[16px] font-bold text-ink">Kayıt hunisi</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">Sayfayı gören → tamamlayan. Terk = gören − tamamlayan.</p>
          <div className="mt-5 flex flex-col gap-4">
            <Asama etiket="Sayfayı gördü" deger={kGor} taban={kGor} renk="var(--color-teal)" />
            <Asama etiket="Kaydı tamamladı" deger={kTamam} taban={kGor} renk="var(--color-green)" />
            <Asama etiket="Hata aldı (deneme)" deger={kHata} taban={kGor} renk="var(--color-amber)" />
            <Asama etiket="Terk etti" deger={kTerk} taban={kGor} renk="var(--color-red)" />
          </div>
          {kGor === 0 ? (
            <p className="mt-5 rounded-xl border border-[var(--cizgi)] bg-[var(--color-soft)] px-4 py-3 text-[12.5px] text-ink-soft">
              Ölçüm yeni eklendi; kayıt sayfası ziyaret edildikçe bu huni dolar. Geçmiş geri getirilemez.
            </p>
          ) : null}
        </div>

        {/* Ürün olay hunisi */}
        <div className="kart p-6">
          <h2 className="font-display text-[16px] font-bold text-ink">Ürün olay hunisi</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">Birim/proje üzerinde biriken davranış (tarihsel).</p>
          <div className="mt-5 flex flex-col gap-4">
            <Asama etiket="Görüntüleme" deger={pGor} taban={pGor} renk="var(--color-teal)" />
            <Asama etiket="Paylaşım" deger={pPay} taban={pGor} renk="var(--color-navy)" />
            <Asama etiket="Opsiyon" deger={pOps} taban={pGor} renk="var(--color-amber)" />
            <Asama etiket="Satış" deger={pSat} taban={pGor} renk="var(--color-green)" />
          </div>
        </div>
      </div>

      {/* Kayıt hata sebepleri */}
      <div className="kart mt-5 p-6">
        <h2 className="font-display text-[16px] font-bold text-ink">Kayıt hata sebepleri</h2>
        <p className="mt-1 text-[12.5px] text-ink-soft">Kaydı bloklayan hatalar (form doğrulama + auth). Neyi düzeltmek dönüşümü artırır.</p>
        {sebepler.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-soft">Henüz kayıtlı hata yok.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--cizgi)]">
            {sebepler.map(([mesaj, adet]) => (
              <li key={mesaj} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[13.5px] text-ink">{mesaj}</span>
                <span className="mono text-[13px] font-semibold text-[var(--color-red)]">{adet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
