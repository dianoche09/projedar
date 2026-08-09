import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sertifikaToken, maskeTel, maskeAd } from "@/lib/sertifika";
import { YazdirButonu } from "@/components/YazdirButonu";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://projedar.com";
const PARA_SIMGE: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£", AED: "AED" };
const fmt = (n: number) => n.toLocaleString("tr-TR");

export const metadata = { title: "Müşteri Talep Kaydı Sertifikası", robots: { index: false, follow: false } };

type Ops = {
  id: string;
  created_at: string;
  kilit_bitis: string | null;
  durum: string;
  musteri_ad: string | null;
  musteri_tel: string | null;
  satici_id: string;
  birim: {
    daire_no: string | null;
    kat: number | null;
    liste_fiyati: number | null;
    para_birimi: string | null;
    proje: { ad: string; il: string | null; ilce: string | null } | null;
    tip: { ad: string | null; oda: string | null } | null;
  } | null;
};

/**
 * Müşteri-talep sertifikası — çift-satış ispatı.
 * Bir opsiyon kaydının zaman-damgalı, forge edilemez teyidi. Print-optimize (HTML→PDF).
 * RLS opsiyon_select (satici_id=auth.uid()) → yalnız kendi opsiyonunun sertifikası.
 * Müşteri PII maskeli (DEĞİŞMEZ #2). Doğrulama linki/QR = imzalı token (sertifika.ts).
 */
export default async function SertifikaSayfasi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data } = await supabase
    .from("opsiyon")
    .select(
      "id, created_at, kilit_bitis, durum, musteri_ad, musteri_tel, satici_id, birim:birim_id(daire_no, kat, liste_fiyati, para_birimi, proje:proje_id(ad, il, ilce), tip:tip_id(ad, oda))",
    )
    .eq("id", id)
    .eq("satici_id", user.id)
    .maybeSingle();
  const ops = data as unknown as Ops | null;
  if (!ops) notFound();
  const b = ops.birim;

  // Danışman adı — kendi profili (admin client, salt-okuma)
  let danAd = "Danışman";
  try {
    const admin = createAdminClient();
    const { data: prof } = await admin.from("profiles").select("ad").eq("id", ops.satici_id).maybeSingle();
    if (prof?.ad) danAd = prof.ad as string;
  } catch (e) {
    console.error("Sertifika danışman adı çözümü hatası:", e);
  }

  const token = sertifikaToken(ops.id);
  const dogrulaUrl = `${SITE}/dogrula/${ops.id}?k=${token}`;
  const qrSvg = await QRCode.toString(dogrulaUrl, { type: "svg", margin: 1, width: 132 });

  const kayitNo = ops.id.slice(0, 8).toUpperCase();
  const ps = PARA_SIMGE[b?.para_birimi ?? "TRY"] ?? "₺";
  const tarih = new Date(ops.created_at).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" });
  const bitis = ops.kilit_bitis
    ? new Date(ops.kilit_bitis).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })
    : "süresiz";

  return (
    <div className="mx-auto max-w-[820px] px-4 py-6 text-ink">
      {/* Baskıda gizli aksiyon çubuğu */}
      <div className="print:hidden mb-5 flex items-center justify-between gap-3">
        <Link href="/havuz/opsiyonlarim" className="text-[13px] font-semibold text-teal hover:underline">
          ← Opsiyonlarım
        </Link>
        <YazdirButonu etiket="PDF / Yazdır" />
      </div>

      <article className="rounded-2xl border border-hair bg-card p-8 print:border-0 print:p-0 print:shadow-none">
        {/* Başlık */}
        <header className="flex items-start justify-between gap-4 border-b border-hair pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                Proje<span className="text-teal">dar</span>
              </span>
            </div>
            <h1 className="mt-2 font-display text-[22px] font-bold leading-tight text-ink">
              Müşteri Talep Kaydı Sertifikası
            </h1>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              Zaman-damgalı, doğrulanabilir ön-talep kaydı teyidi
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft">Kayıt No</span>
            <span className="mono text-[18px] font-bold text-navy">{kayitNo}</span>
          </div>
        </header>

        {/* Zaman damgası — belgenin kalbi */}
        <div className="mt-5 rounded-xl bg-teal-soft px-5 py-4">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-teal-d">Kayıt Zamanı (zaman damgası)</span>
          <span className="mono mt-1 block text-[17px] font-bold text-ink">{tarih}</span>
          <span className="mt-1 block text-[12px] text-ink-soft">Opsiyon kilidi bitişi: {bitis}</span>
        </div>

        {/* Detay ızgarası */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
          <Alan etiket="Proje" deger={b?.proje?.ad ?? "—"} />
          <Alan etiket="Konum" deger={[b?.proje?.il, b?.proje?.ilce].filter(Boolean).join(" · ") || "—"} />
          <Alan etiket="Daire" deger={`${b?.daire_no ?? "—"}${b?.kat != null ? ` · ${b.kat}. kat` : ""}`} />
          <Alan etiket="Tip" deger={b?.tip?.oda ?? b?.tip?.ad ?? "—"} />
          <Alan etiket="Liste Fiyatı" deger={b?.liste_fiyati != null ? `${fmt(Number(b.liste_fiyati))} ${ps}` : "—"} />
          <Alan etiket="Kaydı Alan Danışman" deger={danAd} />
          <Alan etiket="Müşteri (maskeli)" deger={maskeAd(ops.musteri_ad)} />
          <Alan etiket="Telefon (maskeli)" deger={maskeTel(ops.musteri_tel)} />
        </div>

        {/* Doğrulama + QR */}
        <div className="mt-7 flex items-center gap-5 border-t border-hair pt-5">
          <div className="shrink-0" dangerouslySetInnerHTML={{ __html: qrSvg }} aria-label="Doğrulama QR kodu" />
          <div className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Doğrulama</span>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
              Bu belgenin gerçekliğini QR kodu okutarak ya da aşağıdaki adresten doğrulayın. Doğrulama, kaydın Projedar
              sisteminde bu zaman damgasıyla var olduğunu teyit eder.
            </p>
            <p className="mono mt-2 break-all text-[11.5px] text-teal-d">{dogrulaUrl}</p>
          </div>
        </div>

        {/* Yasal not */}
        <p className="mt-6 rounded-lg bg-paper px-4 py-3 text-[11px] leading-relaxed text-ink-soft print:bg-transparent print:px-0">
          Bu belge, Projedar üzerinde oluşturulmuş zaman-damgalı bir <strong>müşteri talep / ön-rezervasyon kaydının</strong>{" "}
          teyididir; resmi satış vaadi ya da aracılık sözleşmesi değildir. Çift-satış durumunda önceki tarihli kayıt, kayıt
          zamanı esas alınarak değerlendirilir. Müşteri kişisel verileri KVKK gereği maskelenmiştir.
        </p>
      </article>
    </div>
  );
}

function Alan({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div>
      <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft">{etiket}</span>
      <span className="mt-0.5 block text-[14px] font-semibold text-ink">{deger}</span>
    </div>
  );
}
