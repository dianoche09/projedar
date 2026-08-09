import { createClient } from "@/lib/supabase/server";
import { GeriLink, SayfaBaslik } from "../_ortak";
import { talebiIsle } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

type Talep = {
  id: string;
  profile_id: string;
  eposta: string | null;
  sebep: string | null;
  durum: "beklemede" | "islendi" | "reddedildi";
  created_at: string;
  islenme_tarihi: string | null;
};

const DURUM_STIL: Record<Talep["durum"], { et: string; cls: string }> = {
  beklemede: { et: "Beklemede", cls: "bg-amber-soft text-amber" },
  islendi: { et: "İşlendi", cls: "bg-green-soft text-green" },
  reddedildi: { et: "Reddedildi", cls: "bg-soft text-gray" },
};

export default async function HesapSilmeTalepleri() {
  const supabase = await createClient();
  // is_admin() RLS ile tüm talepler görünür. Beklemedekiler önce.
  const { data } = await supabase
    .from("hesap_silme_talebi")
    .select("id, profile_id, eposta, sebep, durum, created_at, islenme_tarihi")
    .order("created_at", { ascending: false });

  const liste = (data ?? []) as Talep[];
  const bekleyen = liste.filter((t) => t.durum === "beklemede").length;

  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-4 py-6 sm:px-6">
      <GeriLink href="/admin" etiket="Genel Bakış" />

      <SayfaBaslik
        baslik="KVKK Silme Talepleri"
        noktaRenk={bekleyen > 0 ? "var(--color-amber)" : "var(--color-teal)"}
        altEtiket={
          <>
            <span className="font-medium">
              {liste.length} talep · {bekleyen} bekliyor
            </span>
            <span className="text-hair">·</span>
            <span className="mono text-xs text-gray">
              hesap/veri silme — KVKK md. 7/11
            </span>
          </>
        }
        sag={
          bekleyen > 0 ? (
            <span className="rozet mono bg-amber-soft text-amber">{bekleyen} bekliyor</span>
          ) : null
        }
      />

      <p className="text-sm text-ink-soft">
        Kullanıcı hesap/veri silme talepleri. &quot;İşlendi&quot; işaretlemek talebi kapatır ama
        hesabı otomatik silmez — gerçek silmeyi Kullanıcılar ekranından yap, sonra burada işaretle.
      </p>

      <div className="belir belir-1 space-y-3">
        {liste.length === 0 ? (
          <div className="kart p-8 text-center text-sm text-ink-soft">
            Henüz silme talebi yok.
          </div>
        ) : (
          liste.map((t) => {
            const st = DURUM_STIL[t.durum];
            return (
              <div key={t.id} className="kart flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[14.5px] font-bold text-ink">
                      {t.eposta ?? "—"}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-[3px] text-[11px] font-semibold ${st.cls}`}>
                      {st.et}
                    </span>
                  </div>
                  <p className="mt-1 mono text-[11px] text-gray">{t.profile_id}</p>
                  {t.sebep ? (
                    <p className="mt-1.5 text-[13px] text-ink-soft">“{t.sebep}”</p>
                  ) : null}
                  <p className="mt-1.5 text-[11.5px] text-gray">
                    Talep: {new Date(t.created_at).toLocaleString("tr-TR")}
                    {t.islenme_tarihi
                      ? ` · İşlem: ${new Date(t.islenme_tarihi).toLocaleString("tr-TR")}`
                      : ""}
                  </p>
                </div>

                {t.durum === "beklemede" ? (
                  <div className="flex shrink-0 gap-2">
                    <form action={talebiIsle.bind(null, t.id, "islendi")}>
                      <SubmitButton varyant="green" className="min-h-9 px-3 text-[12.5px]" bekleyenMetin="…">
                        İşlendi
                      </SubmitButton>
                    </form>
                    <form action={talebiIsle.bind(null, t.id, "reddedildi")}>
                      <SubmitButton varyant="outline" className="min-h-9 px-3 text-[12.5px]" bekleyenMetin="…">
                        Reddet
                      </SubmitButton>
                    </form>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
