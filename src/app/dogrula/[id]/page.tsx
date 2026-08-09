import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { sertifikaDogrula } from "@/lib/sertifika";

export const metadata = { title: "Sertifika Doğrulama · Projedar", robots: { index: false, follow: false } };

const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

type Ops = {
  id: string;
  created_at: string;
  durum: string;
  birim: {
    daire_no: string | null;
    liste_fiyati: number | null;
    para_birimi: string | null;
    proje: { ad: string; il: string | null; ilce: string | null } | null;
  } | null;
};

/**
 * Public sertifika doğrulama.
 * İmzalı token (sertifika.ts) ile bir talep kaydının gerçekliğini teyit eder.
 * PII YOK: müşteri adı/telefonu gösterilmez; yalnız kaydın var olduğu + zaman damgası +
 * birim/proje. Kapalı-devre modeli bozmaz. admin client (RLS bypass, server-only) —
 * doğrulama için okuma, token geçerli değilse hiçbir veri dönmez.
 */
export default async function DogrulaSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { id } = await params;
  const { k } = await searchParams;

  const gecerliToken = !!k && sertifikaDogrula(id, k);
  let ops: Ops | null = null;
  if (gecerliToken) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("opsiyon")
        .select("id, created_at, durum, birim:birim_id(daire_no, liste_fiyati, para_birimi, proje:proje_id(ad, il, ilce))")
        .eq("id", id)
        .maybeSingle();
      ops = data as unknown as Ops | null;
    } catch (e) {
      console.error("Sertifika doğrulama okuma hatası:", e);
    }
  }

  const gecerli = gecerliToken && !!ops;
  const b = ops?.birim;
  const ps = PARA_SIMGE[b?.para_birimi ?? "TRY"] ?? "₺";
  const tarih = ops
    ? new Date(ops.created_at).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })
    : null;

  return (
    <div className="grid min-h-screen place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-[520px]">
        <div className="mb-6 text-center">
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Proje<span className="text-teal">dar</span>
          </span>
        </div>

        {gecerli ? (
          <article className="rounded-2xl border border-hair bg-card p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-soft">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <div>
                <h1 className="font-display text-[19px] font-bold leading-tight text-ink">Sertifika Geçerli</h1>
                <p className="text-[12.5px] text-ink-soft">Bu talep kaydı Projedar sisteminde doğrulandı.</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3.5 border-t border-hair pt-5">
              <Satir etiket="Kayıt Zamanı" deger={tarih ?? "—"} vurgu />
              <Satir etiket="Proje" deger={b?.proje?.ad ?? "—"} />
              <Satir etiket="Konum" deger={[b?.proje?.il, b?.proje?.ilce].filter(Boolean).join(" · ") || "—"} />
              <Satir etiket="Daire" deger={b?.daire_no ?? "—"} />
              {b?.liste_fiyati != null ? <Satir etiket="Liste Fiyatı" deger={`${fmt(Number(b.liste_fiyati))} ${ps}`} /> : null}
            </dl>

            <p className="mt-6 text-[11px] leading-relaxed text-ink-soft">
              Doğrulama yalnız kaydın varlığını ve zaman damgasını teyit eder. Müşteri kişisel verileri KVKK gereği
              gösterilmez. Bu belge resmi satış vaadi ya da aracılık sözleşmesi değildir.
            </p>
          </article>
        ) : (
          <article className="rounded-2xl border border-hair bg-card p-7 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full" style={{ background: "var(--color-red-soft, rgba(200,50,50,.1))" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </span>
            <h1 className="mt-3 font-display text-[19px] font-bold text-ink">Doğrulanamadı</h1>
            <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] leading-relaxed text-ink-soft">
              Bu doğrulama bağlantısı geçersiz ya da eksik. Sertifikadaki QR kodu veya tam adresi kullandığından emin ol.
            </p>
            <Link href="/" className="mt-5 inline-block text-[13px] font-semibold text-teal hover:underline">
              Projedar ana sayfa →
            </Link>
          </article>
        )}
      </div>
    </div>
  );
}

function Satir({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">{etiket}</dt>
      <dd className={`text-right text-[14px] font-semibold ${vurgu ? "mono text-navy" : "text-ink"}`}>{deger}</dd>
    </div>
  );
}
