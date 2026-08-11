import { createAdminClient } from "@/lib/supabase/admin";
import { SayfaBaslik, Uyari } from "../_ortak";
import { META_AYARLAR } from "@/lib/seo/site-ayar";
import { metaAyarKaydet } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Admin · Site & Meta. Arama motoru doğrulama token'ları (Google/Bing/Yandex) buradan
 * düzenlenir; kayıt `site_ayar` tablosuna yazılır ve kök layout meta etiketlerine basılır.
 * Token'lar yapıştırma prefiksinden otomatik temizlenir (actions.tokenTemizle).
 */
export default async function AdminAyarlarSayfa({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; hata?: string }>;
}) {
  const sp = await searchParams;

  let mevcut = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("site_ayar").select("anahtar, deger");
    mevcut = new Map((data ?? []).map((r: { anahtar: string; deger: string }) => [r.anahtar, r.deger]));
  } catch {
    mevcut = new Map();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SayfaBaslik
        baslik="Site & Meta"
        altEtiket={<span>Arama motoru doğrulama etiketleri · site geneli head bölümüne basılır</span>}
      />

      <div className="mt-5 space-y-3">
        <Uyari mesaj={sp.ok ? "Kaydedildi. Meta etiketleri güncellendi." : undefined} hata={sp.hata} />
      </div>

      <form action={metaAyarKaydet} className="belir mt-5 space-y-5 rounded-2xl border border-hair bg-card p-5 sm:p-6">
        {META_AYARLAR.map((a) => (
          <div key={a.anahtar}>
            <label htmlFor={a.anahtar} className="block text-sm font-semibold text-ink">
              {a.etiket}
            </label>
            <p className="mb-1.5 text-xs text-ink-soft">{a.aciklama}</p>
            <input
              id={a.anahtar}
              name={a.anahtar}
              type="text"
              autoComplete="off"
              spellCheck={false}
              defaultValue={mevcut.get(a.anahtar) ?? ""}
              placeholder={a.ornek || "Boş bırakılırsa etiket basılmaz"}
              className="w-full rounded-xl border border-hair bg-paper px-3.5 py-2.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-teal/60"
            />
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 border-t border-hair pt-4">
          <p className="text-xs text-ink-soft">
            Yalnız token yapıştırın; &quot;google-site-verification=&quot; gibi ön ekler otomatik temizlenir.
          </p>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
          >
            Kaydet
          </button>
        </div>
      </form>

      <section className="belir mt-6 rounded-2xl border border-hair bg-soft p-5">
        <h2 className="font-display text-sm font-bold text-ink">Doğrulama nasıl tamamlanır?</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] text-ink-soft">
          <li>İlgili arama motorunun webmaster panelinde mülkü ekleyin (Google Search Console, Bing, Yandex).</li>
          <li>Verilen doğrulama token&apos;ını (meta content değeri) yukarıya yapıştırıp kaydedin.</li>
          <li>Yayınlandıktan sonra panelde &quot;Doğrula&quot;ya basın; ardından sitemap&apos;i (/sitemap.xml) gönderin.</li>
        </ol>
      </section>
    </div>
  );
}
